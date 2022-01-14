import { readable, writable } from "svelte/store";
import {
  forecast,
  ANEMOS_WEATHER,
  PYROS_WEATHER,
  PAGOS_WEATHER,
  HYDATOS_WEATHER,
} from "./ew";

const localStorage = window.localStorage;

export const level = localStorageStore(1);
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
  fetch("dist/bestiary.json")
    .then((data) => data.json())
    .then((data) => {
      set(data);
    });

  return function stop() {
  };
});

function localStorageStore(key) {
  const item = localStorage.getItem(key);
  const {subscribe, set} = writable(JSON.parse(item) || null);

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
