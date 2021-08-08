import { writable } from "svelte/store";

const localStorage = window.localStorage;

export const level = localStorageStore(0);

function localStorageStore(key) {
  const item = localStorage.getItem(key);
  const { subscribe, set } = writable(JSON.parse(item) || null);

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
