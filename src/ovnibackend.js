const { WebSocketServer, WebSocket } = require("ws");
const { createClient } = require("redis");
const { customAlphabet } = require("nanoid");
const args = require("minimist")(process.argv.slice(2));
const fs = require("fs");
const https = require("https");

let wss, server;
if (args.https) {
  if (!(args.keyFile && args.certFile)) {
    console.log("no key and cert file found!");
    process.exit(1);
  }
  server = https.createServer({
    cert: fs.readFileSync(args.certFile),
    key: fs.readFileSync(args.keyFile),
  });
  wss = new WebSocketServer({ server, clientTracking: true });
} else {
  wss = new WebSocketServer({ port: "8344", clientTracking: true });
}
const client = createClient();
const clientMap = {};
client.connect();

wss.on("connection", (ws, req) => {
  ws.on("message", (data, isBinary) => {
    if (isBinary) return;
    const json = JSON.parse(data);
    switch (json.message_type) {
      case "Join":
        handle_join(json, ws, req);
        break;
      case "Auth":
        handle_auth(json, ws, req);
        break;
      case "Update":
        handle_update(json, ws, req, wss);
        break;
    }
  });

  ws.on("close", () => {
    delete clientMap[req.socket.remoteAddress];
  });
});

async function handle_join(msg, ws, req) {
  if (clientMap[req.socket.remoteAddress]) return;
  clientMap[req.socket.remoteAddress] = msg.id;
  const potentialPwd = await client.get(`ovni:${msg.id}:pwd`);
  if (potentialPwd) {
    const log = await client.lRange(`ovni:${msg.id}:log`, 0, -1);
    ws.send(
      JSON.stringify({
        ok: true,
        data: log,
      })
    );
  } else {
    const new_password = customAlphabet("0123456789ABCDEF", 4)();
    console.log(new_password);
    await client.set(`ovni:${msg.id}:pwd`, new_password);
    await client.expire(`ovni:${msg.id}:pwd`, 60 * 120); // 2 hours
    await client.del(`ovni:${msg.id}:log`);
    ws.send(
      JSON.stringify({
        ok: true,
        new_password,
      })
    );
  }
}

async function handle_auth(msg, ws, req) {
  const potentialPwd = await client.get(`ovni:${msg.id}:pwd`);
  if (
    potentialPwd &&
    msg.password.toLowerCase() === potentialPwd.toLowerCase()
  ) {
    ws.send(
      JSON.stringify({
        ok: true,
        new_password: potentialPwd,
      })
    );
  }
}

async function handle_update(msg, ws, req, wss) {
  const potentialPwd = await client.get(`ovni:${msg.id}:pwd`);
  if (
    potentialPwd &&
    msg.password.toLowerCase() === potentialPwd.toLowerCase()
  ) {
    await client.lPush(`ovni:${msg.id}:log`, [
      String(msg.timestamp),
      msg.update_state,
    ]);
    await client.expire(`ovni:${msg.id}:pwd`, 60 * 120);
    await client.expire(`ovni:${msg.id}:log`, 60 * 120);
    const newData = await client.lRange(`ovni:${msg.id}:log`, 0, -1);
    ws.send(
      JSON.stringify({
        ok: true,
        data: newData,
      })
    );

    wss.clients.forEach((client) => {
      if (
        client !== ws &&
        client.readyState === WebSocket.OPEN &&
        clientMap[req.socket.remoteAddress] === msg.id
      ) {
        client.send(
          JSON.stringify({
            ok: true,
            data: newData,
          })
        );
      }
    });
  }
}

if (args.https) {
  server.listen(8344);
}
