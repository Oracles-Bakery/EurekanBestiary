import.meta.hot;
import chunk from "lodash.chunk";
import { readable, writable } from "svelte/store";
import day from "dayjs";
import {
  forecast,
  ANEMOS_WEATHER,
  PYROS_WEATHER,
  PAGOS_WEATHER,
  HYDATOS_WEATHER,
} from "./ew";

const localStorage = window.localStorage;
const wsUrl = __SNOWPACK_ENV__.SNOWPACK_PUBLIC_WS_URL || "ws://localhost:8344";
window.e = __SNOWPACK_ENV__;

export const filters = localStorageStore("eb-filters", {
  zones: ["anemos", "pagos", "pyros", "hydatos"],
  level: null,
});
export const sort = localStorageStore("eb-sort", {
  level: "asc",
  name: null,
  maTop: true,
});
export const search = localStorageStore("eb-search", "");
export const hasSeenIntro = localStorageStore("eb-intro-complete", false);
export const time = writable(new Date().getTime() * (1440 / 70), (set) => {
  const interval = setInterval(() => {
    set(new Date().getTime() * (1440 / 70));
  }, 1000);

  return function destroy() {
    clearInterval(interval);
  };
});
export const weather = writable({}, (set) => {
  set({
    anemos: forecast(ANEMOS_WEATHER, "anemos"),
    pagos: forecast(PAGOS_WEATHER, "pagos"),
    pyros: forecast(PYROS_WEATHER, "pyros"),
    hydatos: forecast(HYDATOS_WEATHER, "hydatos"),
  });

  const interval = setInterval(() => {
    set({
      anemos: forecast(ANEMOS_WEATHER, "anemos"),
      pagos: forecast(PAGOS_WEATHER, "pagos"),
      pyros: forecast(PYROS_WEATHER, "pyros"),
      hydatos: forecast(HYDATOS_WEATHER, "hydatos"),
    });
  }, 1000);

  return function destroy() {
    clearInterval(interval);
  };
});
export const data = readable([], (set) => {
  fetch("/dist/bestiary.json")
    .then((data) => data.json())
    .then((data) => {
      set(data);
    });

  return function stop() {};
});

export function makeOvniStore(id, pwd = null) {
  const { subscribe, update } = writable({ conn: false, pwd, log: [] });
  const ws = new WebSocket(wsUrl);
  ws.addEventListener("open", (evt) => {
    console.log("DEBUG: Connection opened!");
    const msg = {
      message_type: "Join",
      id,
    };
    ws.send(JSON.stringify(msg));
    if (pwd) {
      const msg = {
        message_type: "Auth",
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
        message_type: "Update",
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
        message_type: "Auth",
        password: pwd,
        id,
      };
      ws.send(JSON.stringify(msg));
    },
  };
}

function localStorageStore(key, initial) {
  const item = localStorage.getItem(key);
  const { subscribe, set } = writable(JSON.parse(item) || initial || null);
  if (!item && initial) {
    localStorage.setItem(key, JSON.stringify(initial));
  }

  return {
    subscribe,
    set: (value) => {
      localStorage.setItem(key, JSON.stringify(value));
      set(value);
    },
    clear: () => {
      localStorage.removeItem(key);
      set(null);
    },
  };
}
