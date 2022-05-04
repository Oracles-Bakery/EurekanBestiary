use std::{collections::BTreeMap, env, fmt, io, net::SocketAddr, sync::Arc};

use async_std::{
    net::{TcpListener, TcpStream},
    task,
};
use async_tungstenite::{tungstenite::Message, WebSocketStream};
use futures::{
    channel::mpsc::{unbounded, UnboundedSender},
    lock::Mutex,
    pin_mut,
    prelude::*,
    stream::SplitSink,
};
use miniserde::{json, Deserialize, Serialize};
use nanoid::nanoid;
use redis::{Commands, RedisError};

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<Mutex<BTreeMap<String, Tx>>>;

#[derive(Debug, Serialize, Deserialize, PartialEq)]
enum MessageType {
    Join,
    Auth,
    Update,
}

#[derive(Serialize, Deserialize, Debug)]
enum OvniState {
    Spawned,
    Killed,
    BluePortals,
    RedPortals,
    Cooldown,
}

impl fmt::Display for OvniState {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct Data {
    message_type: MessageType,
    id: String,
    password: Option<String>,
    update_state: Option<OvniState>,
    timestamp: Option<i64>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Response {
    ok: bool,
    new_password: Option<String>,
    data: Option<Vec<String>>,
}

async fn handle_message(
    data: Data,
    write: Arc<Mutex<SplitSink<WebSocketStream<TcpStream>, Message>>>,
    state: PeerMap,
) {
    let client = redis::Client::open("redis://127.0.0.1").unwrap();
    let mut write = write.lock().await;
    let mut conn = client.get_connection().unwrap();
    match data.message_type {
        MessageType::Join => {
            let potential_get: Result<Option<String>, RedisError> =
                conn.get(format!("ovni:{}:pwd", data.id));
            match potential_get {
                Ok(Some(_)) => {
                    let log: Vec<String> =
                        conn.lrange(format!("ovni:{}:log", data.id), 0, -1).unwrap();
                    write
                        .send(Message::Text(json::to_string(&Response {
                            ok: true,
                            new_password: None,
                            data: Some(log),
                        })))
                        .await
                        .unwrap();
                }
                Ok(None) => {
                    let pwd_alphabet = [
                        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e',
                        'f',
                    ];
                    let new_password = nanoid!(4, &pwd_alphabet).to_uppercase();
                    let _: String = conn
                        .set(format!("ovni:{}:pwd", data.id), &new_password)
                        .unwrap();
                    let _: i32 = conn
                        .expire(format!("ovni:{}:pwd", data.id), 60 * 120)
                        .unwrap();
                    let _: i32 = conn.del(format!("ovni:{}:log", data.id)).unwrap();
                    write
                        .send(Message::Text(json::to_string(&Response {
                            ok: true,
                            new_password: Some(new_password),
                            data: None,
                        })))
                        .await
                        .unwrap();
                }
                _ => {}
            }
        }
        MessageType::Auth => {
            let try_password: Result<Option<String>, RedisError> =
                conn.get(format!("ovni:{}:pwd", data.id));
            let password = try_password.unwrap().unwrap();
            let user_pwd = data.password.unwrap();
            if password.to_lowercase() == user_pwd.to_lowercase() {
                write
                    .send(Message::Text(json::to_string(&Response {
                        ok: true,
                        new_password: Some(password),
                        data: None,
                    })))
                    .await
                    .unwrap();
            }
        }
        MessageType::Update => {
            let try_password: Result<Option<String>, RedisError> =
                conn.get(format!("ovni:{}:pwd", data.id));
            // We drop the thread if the password isn't found.
            let password = try_password.unwrap().unwrap();
            let user_pwd = data.password.unwrap();
            if user_pwd.to_lowercase() == password.to_lowercase() {
                let new_state = data.update_state.unwrap();
                let timestamp = data.timestamp.unwrap();
                let _: i32 = conn
                    .lpush(
                        format!("ovni:{}:log", data.id),
                        vec![timestamp.to_string(), new_state.to_string()],
                    )
                    .unwrap();
                let _: i32 = conn
                    .expire(format!("ovni:{}:pwd", data.id), 60 * 120)
                    .unwrap();
                let _: i32 = conn
                    .expire(format!("ovni:{}:log", data.id), 60 * 120)
                    .unwrap();
                let new_data: Vec<String> =
                    conn.lrange(format!("ovni:{}:log", data.id), 0, -1).unwrap();
                let msg = Message::Text(json::to_string(&Response {
                    ok: true,
                    new_password: None,
                    data: Some(new_data),
                }));
                state
                    .lock()
                    .await
                    .iter()
                    .filter_map(|(k, v)| {
                        if k.starts_with(&data.id) {
                            Some(v)
                        } else {
                            None
                        }
                    })
                    .for_each(|recp| recp.unbounded_send(msg.clone()).unwrap());
            }
        }
    }
}

async fn handle_new_connection(raw_stream: TcpStream, addr: SocketAddr, state: PeerMap) {
    println!("Incoming connection from {}", addr);
    let ws_stream = async_tungstenite::accept_async(raw_stream)
        .await
        .expect("Handshake failed!");
    let id = nanoid!(10);
    let mut tracker_id = "".into();
    let (tx, rx) = unbounded::<Message>();
    println!("Connection established with {}", addr);
    let (write, mut read) = ws_stream.split();
    let arced_write = Arc::new(Mutex::new(write));
    if let Some(Ok(Message::Text(msg))) = futures::StreamExt::next(&mut read).await {
        // The first message should be a join.
        let data: Data = json::from_str(&msg).unwrap();
        if data.message_type != MessageType::Join {
            panic!("No join message sent!!!");
        }
        tracker_id = data.id.clone();
        state.lock().await.insert(format!("{}:{}", data.id, id), tx);
        handle_message(data, arced_write.clone(), state.clone()).await;
    }
    let handle_incoming = read
        .try_filter(|msg| future::ready(!msg.is_close()))
        .try_for_each(|msg| {
            if let Message::Text(inner) = msg {
                let data: Data = json::from_str(&inner).unwrap();

                println!("Incoming msg: {}", inner);
                task::block_on(handle_message(data, arced_write.clone(), state.clone()));
            }
            future::ok(())
        });
    let receive_from_others = futures::StreamExt::for_each(rx, |msg| {
        let arced = arced_write.clone();
        let mut lock = task::block_on(arced.lock());
        task::block_on(lock.send(msg)).unwrap();
        future::ready(())
    });
    pin_mut!(handle_incoming, receive_from_others);
    future::select(handle_incoming, receive_from_others).await;

    println!("Client {} disconnected!", addr);
    state.lock().await.remove(&format!("{}:{}", tracker_id, id));
}

fn check_redis() {
    let redis_client =
        redis::Client::open("redis://127.0.0.1").expect("Unable to connect to Redis!");
    redis_client
        .get_connection()
        .expect("Unable to establish a Redis connection!");
}

async fn run() -> Result<(), io::Error> {
    // Check if we can connect to Redis.
    check_redis();
    let addr = env::args()
        .nth(1)
        .unwrap_or_else(|| "127.0.0.1:8344".to_string());
    let state = PeerMap::new(Mutex::new(BTreeMap::new()));

    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("Failed to bind to socket!");
    println!("Listening on {}", addr);

    while let Ok((stream, addr)) = listener.accept().await {
        task::spawn(handle_new_connection(stream, addr, state.clone()));
    }

    Ok(())
}

fn main() -> Result<(), io::Error> {
    task::block_on(run())
}
