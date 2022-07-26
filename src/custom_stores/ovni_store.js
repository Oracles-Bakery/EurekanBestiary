import.meta.hot;
import day from "dayjs";
import chunk from "lodash.chunk";
import { writable } from "svelte/store";

const wsUrl = __SNOWPACK_ENV__.SNOWPACK_PUBLIC_WS_URL || "ws://localhost:8344";
window.e = __SNOWPACK_ENV__;

export function makeOvniStore(id, pwd = null) {
  const { subscribe, update } = writable({ conn: false, pwd, log: [] });
  const ws = new WebSocket(wsUrl);
  ws.addEventListener("open", () => {
    console.log("DEBUG: Connection opened!");
    const msg = {
      message_type: "OvniJoin",
      id,
    };
    ws.send(JSON.stringify(msg));
    if (pwd) {
      const msg = {
        message_type: "OvniAuth",
        password: pwd,
        id,
      };
      ws.send(JSON.stringify(msg));
    }
  });
  ws.addEventListener("message", (evt) => {
    const msg = JSON.parse(evt.data);
    if (!msg.ok) return;
    update(({ pwd, log }) => ({ conn: true, pwd, log }));
    console.log("DEBUG: New message: ", msg);
    if (msg.data) {
      let chunked = chunk(msg.data, 2);
      update(({ pwd, conn }) => ({
        log: chunked.map((c) => [c[0], day(Number(c[1]))]),
        pwd,
        conn,
      }));
    }
    if (msg.new_password) {
      update(({ log, conn }) => ({ pwd: msg.new_password, log, conn }));
    }
  });
  return {
    subscribe,
    unshift([state, timestamp], password) {
      const msg = {
        message_type: "OvniUpdate",
        password,
        id,
        update_state: state,
        timestamp: timestamp.valueOf(),
      };
      ws.send(JSON.stringify(msg));
      update(({ log, pwd, conn }) => ({
        log: [[state, timestamp], ...log],
        pwd,
        conn,
      }));
    },
    auth(pwd) {
      const msg = {
        message_type: "OvniAuth",
        password: pwd,
        id,
      };
      ws.send(JSON.stringify(msg));
    },
  };
}
