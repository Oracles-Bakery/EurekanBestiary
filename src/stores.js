import { readable, writable } from "svelte/store";
import {
  forecast,
  ANEMOS_WEATHER,
  PYROS_WEATHER,
  PAGOS_WEATHER,
  HYDATOS_WEATHER,
} from "./ew";

const localStorage = window.localStorage;

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
export const currentMarker = writable(null);
export const usedMarkers = writable([]);

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

export * from "./custom_stores/ovni_store";
export * from "./custom_stores/fairy_store";
