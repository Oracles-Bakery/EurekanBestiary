<script>
  import { level, paWeather } from "./stores";
  import ew from "./ew";
  import { onMount } from "svelte";
  import { formatUtc } from "./times";
  import { getMatches } from "./bestiary";

  onMount(async () => {
    updateWeatherStores();
  });

  let date = new Date().getTime() * (1440 / 70);

  setInterval(() => {
    date = new Date().getTime() * (1440 / 70);
  }, 1000);
  $: currentEzTime = formatUtc(date);

  function updateWeatherStores() {
    paWeather.set(ew.forecast(ew.PAGOS_WEATHER));
  }

  const pagosForecast = ew.forecast(ew.PAGOS_WEATHER);
  getMatches(pagosForecast, $level);

  function levelChanged(evt) {
    level.set(Number(evt.target.value));
  }
</script>

<div class="app">
  <h2>
    Level: <input on:change={levelChanged} type="number" min="1" max="60" />
  </h2>

  Level is {$level}<br />

  Time is {currentEzTime}<br />

  Anemos Weather is {pagosForecast[0].weatherName}
</div>

<style></style>
