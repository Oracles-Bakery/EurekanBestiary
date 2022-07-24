import App from "./App.svelte";
import halfmoon from "halfmoon";

new App({
  target: document.body,
});

document.addEventListener("DOMContentLoaded", () => {
  halfmoon.onDOMContentLoaded();
});

export default App;
