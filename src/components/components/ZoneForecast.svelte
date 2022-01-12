<script>
  import { weather } from "../../stores";
  import { getWeatherName } from "../../ew";
  import day from "dayjs";

  export let zone;
  const capitalizedZone = zone[0].toUpperCase() + zone.slice(1);
</script>

<div class="flex justify-between items-center">
  <div>{capitalizedZone} Forecast:</div>
  {#each $weather[zone] as w, i}
    <div class="{i === 0 && 'font-bold text-green-700'}">
      <div class="text-center">{getWeatherName(w.currWeather)}</div>
      <div class="text-xs text-center">{day(w.date).format("HH:mm")}</div>
    </div>
    {#if $weather[zone].length !== i + 1}
      <div>➔</div>
    {/if}
  {/each}
</div>


