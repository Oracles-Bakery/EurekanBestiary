import App from "./NewApp.svelte";
import halfmoon from "halfmoon";

let app = new App({
  target: document.body,
});

document.addEventListener("DOMContentLoaded", () => {
  halfmoon.onDOMContentLoaded();
});

export default App;
