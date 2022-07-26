import { writable } from "svelte/store";
import { usedMarkers } from "../stores";

import.meta.hot;

const wsUrl = __SNOWPACK_ENV__.SNOWPACK_PUBLIC_WS_URL || "ws://localhost:8344";
window.e = __SNOWPACK_ENV__;

export function makeFairyStore(id, password = null) {
  const { subscribe, update } = writable({
    conn: false,
    password,
    fairies: {},
    suggestions: {},
  });
  const ws = new WebSocket(wsUrl);
  ws.addEventListener("open", () => {
    console.log("DEBUG: Connection opened!");
    const msg = {
      message_type: "FairyJoin",
      id,
    };
    ws.send(JSON.stringify(msg));
    if (!password) {
      const msg = {
        message_type: "FairyAuth",
        password,
        id,
      };
      ws.send(JSON.stringify(msg));
    }
  });

  ws.addEventListener("message", (evt) => {
    const msg = JSON.parse(evt.data);
    if (!msg.ok) return;
    update(({ password, fairies, suggestions }) => {
      usedMarkers.set(Object.keys(msg.fairies || fairies));
      return {
        conn: true,
        password: msg.new_password || password,
        fairies: msg.fairies || fairies,
        suggestions: msg.suggestions || suggestions,
      };
    });
    console.log("DEBUG: New message: ", msg);
  });

  return {
    subscribe,
    set(x, y, marker, password) {
      const msg = {
        message_type: "FairySet",
        id,
        x,
        y,
        marker,
        password,
      };
      ws.send(JSON.stringify(msg));
    },
    del(marker, password) {
      const msg = {
        message_type: "FairyDel",
        id,
        marker,
        password,
      };
      ws.send(JSON.stringify(msg));
    },
    auth(pwd) {
      const msg = {
        message_type: "FairyAuth",
        password: pwd,
        id,
      };
      ws.send(JSON.stringify(msg));
    },
    suggest(x, y, marker) {
      const msg = {
        message_type: "FairySuggest",
        id,
        x,
        y,
        marker,
      };
      ws.send(JSON.stringify(msg));
    },
    acceptSuggestion(name, password) {
      const msg = {
        message_type: "FairyAcceptSuggestion",
        id,
        name,
        password,
      };
      ws.send(JSON.stringify(msg));
    },
    delSuggestion(name, password) {
      const msg = {
        message_type: "FairyDelSuggestion",
        id,
        name,
        password,
      };
      ws.send(JSON.stringify(msg));
    },
  };
}
