<script>
  import { level } from "./stores";

  function levelChanged(evt) {
    level.set(Number(evt.data));
  }
</script>

<div class="app">
  <h2>
    Level: <input on:input={levelChanged} type="number" min="1" max="60" />
  </h2>

  Level is {$level}
</div>

<style></style>
