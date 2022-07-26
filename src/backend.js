const { WebSocketServer, WebSocket } = require("ws");
const { createClient } = require("redis");
const { customAlphabet } = require("nanoid");
const mapValues = require("lodash.mapvalues");
const args = require("minimist")(process.argv.slice(2));
const fs = require("fs");
const https = require("https");
const crypto = require("crypto");

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
const ovniMap = {};
const fairyMap = {};
client.connect();

wss.on("connection", (ws, req) => {
  const name = hash(req.socket.remoteAddress);
  ws.on("message", (data, isBinary) => {
    if (isBinary) return;
    const json = JSON.parse(data);
    if (!json.id || json.id.length !== 6 || !/^[a-zA-Z]+$/.test(json.id))
      return;
    console.log("DEBUG: ", json);
    switch (json.message_type) {
      case "OvniJoin":
        handle_ovni_join(json, ws, name);
        break;
      case "OvniAuth":
        handle_ovni_auth(json, ws);
        break;
      case "OvniUpdate":
        handle_ovni_update(json, ws, name, wss);
        break;
      case "FairyJoin":
        handle_fairy_join(json, ws, name);
        break;
      case "FairyAuth":
        handle_fairy_auth(json, ws);
        break;
      case "FairySet":
        handle_fairy_set(json, ws, name, wss);
        break;
      case "FairySuggest":
        handle_fairy_suggest(json, ws, name, wss);
        break;
      case "FairyDel":
        handle_fairy_del(json, ws, name, wss);
        break;
      case "FairyAcceptSuggestion":
        handle_fairy_accept_suggestion(json, ws, name, wss);
        break;
      case "FairyDelSuggestion":
        handle_fairy_del_suggestion(json, ws, name, wss);
        break;
      case "FairySetZone":
        handle_fairy_set_zone(json, ws, name, wss);
        break;
    }
  });

  ws.on("close", () => {
    delete ovniMap[name];
    delete fairyMap[name];
  });
});

async function handle_ovni_join(msg, ws, name) {
  if (!ovniMap[name]) {
    ovniMap[name] = msg.id;
  }
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

async function handle_fairy_join(msg, ws, name) {
  if (!fairyMap[name]) {
    fairyMap[name] = msg.id;
  }
  const potentialPwd = await client.get(`fairy:${msg.id}:pwd`);
  if (potentialPwd) {
    const fairies = await get_fairies(msg.id);
    const suggestions = await get_suggestions(msg.id);
    const zone = await client.get(`fairy:${msg.id}:zone`);
    ws.send(
      JSON.stringify({
        ok: true,
        fairies,
        suggestions,
        zone,
      })
    );
  } else {
    const new_password = customAlphabet("0123456789ABCDEF", 4)();
    await client.set(`fairy:${msg.id}:pwd`, new_password);
    await client.set(`fairy:${msg.id}:zone`, "anemos");
    await client.del(`fairy:${msg.id}:fairies`);
    await client.del(`fairy:${msg.id}:suggestions`);
    await client.del(`fairy:${msg.id}:zone`);
    await reset_fairy_exp(msg.id);
    ws.send(
      JSON.stringify({
        ok: true,
        new_password,
      })
    );
  }
}

async function handle_ovni_auth(msg, ws) {
  const potentialPwd = await client.get(`ovni:${msg.id}:pwd`);
  if (
    potentialPwd &&
    msg.password?.toLowerCase() === potentialPwd.toLowerCase()
  ) {
    ws.send(
      JSON.stringify({
        ok: true,
        new_password: potentialPwd,
      })
    );
  }
}

async function handle_fairy_auth(msg, ws) {
  const potentialPwd = await client.get(`fairy:${msg.id}:pwd`);
  if (
    potentialPwd &&
    msg.password?.toLowerCase() === potentialPwd.toLowerCase()
  ) {
    ws.send(
      JSON.stringify({
        ok: true,
        new_password: potentialPwd,
      })
    );
  } else {
    ws.send(
      JSON.stringify({
        ok: true,
        new_password: null,
      })
    );
  }
}

async function handle_ovni_update(msg, ws, name, wss) {
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

    broadcast(msg.id, ws, name, wss, ovniMap, (client) => {
      client.send(
        JSON.stringify({
          ok: true,
          data: newData,
        })
      );
    });
  }
}

async function handle_fairy_set(msg, ws, name, wss) {
  const pwd = await client.get(`fairy:${msg.id}:pwd`);
  if (pwd && msg.password?.toLowerCase() === pwd.toLowerCase()) {
    await client.hSet(
      `fairy:${msg.id}:fairies`,
      msg.marker,
      `${msg.x},${msg.y},${Date.now()},${msg.marker}`
    );
    await reset_fairy_exp(msg.id);
    let new_fairies = await get_fairies(msg.id);
    ws.send(
      JSON.stringify({
        ok: true,
        fairies: new_fairies,
      })
    );

    broadcast(msg.id, ws, name, wss, fairyMap, (client) => {
      client.send(
        JSON.stringify({
          ok: true,
          fairies: new_fairies,
        })
      );
    });
  }
}

async function handle_fairy_suggest(msg, ws, name, wss) {
  await client.hSet(
    `fairy:${msg.id}:suggestions`,
    name,
    `${msg.x},${msg.y},${Date.now()},${msg.marker}`
  );
  await reset_fairy_exp(msg.id);
  let new_suggestions = await get_suggestions(msg.id);
  ws.send(
    JSON.stringify({
      ok: true,
      suggestions: new_suggestions,
    })
  );

  broadcast(msg.id, ws, name, wss, fairyMap, (client) => {
    client.send(
      JSON.stringify({
        ok: true,
        suggestions: new_suggestions,
      })
    );
  });
}

async function handle_fairy_del(msg, ws, name, wss) {
  const pwd = await client.get(`fairy:${msg.id}:pwd`);
  if (pwd && msg.password?.toLowerCase() === pwd.toLowerCase()) {
    await client.hDel(`fairy:${msg.id}:fairies`, msg.marker);
    await reset_fairy_exp(msg.id);
    let new_fairies = await get_fairies(msg.id);
    ws.send(JSON.stringify({ ok: true, fairies: new_fairies }));

    broadcast(msg.id, ws, name, wss, fairyMap, (client) => {
      client.send(JSON.stringify({ ok: true, fairies: new_fairies }));
    });
  }
}

async function handle_fairy_accept_suggestion(msg, ws, name, wss) {
  const pwd = await client.get(`fairy:${msg.id}:pwd`);
  if (pwd && msg.password?.toLowerCase() === pwd.toLowerCase()) {
    const suggestion = await client.hGet(
      `fairy:${msg.id}:suggestions`,
      msg.name
    );
    await client.hSet(
      `fairy:${msg.id}:fairies`,
      suggestion.split(",")[3],
      suggestion
    );
    await client.hDel(`fairy:${msg.id}:suggestions`, msg.name);
    await reset_fairy_exp(msg.id);
    let new_fairies = await get_fairies(msg.id);
    let new_suggestions = await get_suggestions(msg.id);
    ws.send(
      JSON.stringify({
        ok: true,
        fairies: new_fairies,
        suggestions: new_suggestions,
      })
    );

    broadcast(msg.id, ws, name, wss, fairyMap, (client) => {
      client.send(
        JSON.stringify({
          ok: true,
          fairies: new_fairies,
          suggestions: new_suggestions,
        })
      );
    });
  }
}

async function handle_fairy_del_suggestion(msg, ws, name, wss) {
  const pwd = await client.get(`fairy:${msg.id}:pwd`);
  if (pwd && msg.password?.toLowerCase() === pwd.toLowerCase()) {
    await client.hDel(`fairy:${msg.id}:suggestions`, msg.name);
    await reset_fairy_exp(msg.id);
    let new_suggestions = await get_suggestions(msg.id);
    ws.send(
      JSON.stringify({
        ok: true,
        suggestions: new_suggestions,
      })
    );

    broadcast(msg.id, ws, name, wss, fairyMap, (client) => {
      client.send(
        JSON.stringify({
          ok: true,
          suggestions: new_suggestions,
        })
      );
    });
  }
}

async function handle_fairy_set_zone(msg, ws, name, wss) {
  const pwd = await client.get(`fairy:${msg.id}:pwd`);
  if (pwd && msg.password?.toLowerCase() === pwd.toLowerCase()) {
    await client.set(`fairy:${msg.id}:zone`, msg.zone);
    await reset_fairy_exp(msg.id);
    ws.send(
      JSON.stringify({
        ok: true,
        zone: msg.zone,
      })
    );

    broadcast(msg.id, ws, name, wss, fairyMap, (client) => {
      client.send(
        JSON.stringify({
          ok: true,
          zone: msg.zone,
        })
      );
    });
  }
}

function broadcast(comparator, ws, addr, wss, map, cb) {
  wss.clients.forEach((client) => {
    if (
      client !== ws &&
      client.readyState === WebSocket.OPEN &&
      map[addr] === comparator
    ) {
      cb(client);
    }
  });
}

function hash(str) {
  const hash = crypto.createHash("sha256");
  hash.update(str);
  return hash.digest("hex");
}

async function reset_fairy_exp(id) {
  await client.expire(`fairy:${id}:pwd`, 60 * 120);
  await client.expire(`fairy:${id}:fairies`, 60 * 120);
  await client.expire(`fairy:${id}:suggestions`, 60 * 120);
  await client.expire(`fairy:${id}:zone`, 60 * 120);
}

async function get_fairies(id) {
  let map = await client.hGetAll(`fairy:${id}:fairies`);
  return mapValues(map, (v) => {
    let [x, y, ts, marker] = v.split(",");
    return { x, y, timestamp: ts, marker };
  });
}

async function get_suggestions(id) {
  let map = await client.hGetAll(`fairy:${id}:suggestions`);
  return mapValues(map, (v) => {
    let [x, y, ts, marker] = v.split(",");
    return { x, y, timestamp: ts, marker };
  });
}

if (args.https) {
  server.listen(8344);
}
