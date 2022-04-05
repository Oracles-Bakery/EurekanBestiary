<script>
  import { weather, time } from "../stores";
  import { getWeatherName, zoneWeathers } from "../ew";
  import { capitalize } from "../util";
  import Icon from "./Icon.svelte";
  import clsx from "clsx";
  import day from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  day.extend(relativeTime);

  export let zone = "";
  let percentUntil = 0;
  time.subscribe((newTime) => {
    percentUntil = recalcPercent($weather, newTime);
  });

  const mainClass = clsx("card-title p-10 mb-5", {
    "bg-success text-dark-dm": zone === "anemos",
    "bg-secondary text-dark-dm": zone === "pagos",
    "bg-danger text-white": zone === "pyros",
    "bg-primary text-white": zone === "hydatos",
  });

  function recalcPercent(weather, time) {
    const curDate = weather[zone][0].date;
    const nextDate = weather[zone][1].date;
    const realTime = time / (1440 / 70);
    return (
      ((realTime - curDate.getTime()) /
        (nextDate.getTime() - curDate.getTime())) *
      100
    );
  }
</script>

<div class="card p-0 mx-0">
  <div class={mainClass}>{capitalize(zone)}</div>
  <div class="px-5">
    <div class="progress h-25 mt-10">
      <div class="progress-bar py-10" style={`width: ${percentUntil}%;`}>
        {#if percentUntil > 30}
          {getWeatherName($weather[zone][0].currWeather)}
          for {day($weather[zone][1].date).fromNow(true)}
        {/if}
      </div>
    </div>

    <hr class="border-top mt-10" />
    <div class="row">
      {#each zoneWeathers[zone] as [zoneWeather, _]}
        <div
          class={clsx("col col-md-12 text-center py-5", {
            "bg-primary text-white":
              $weather[zone][0].currWeather === zoneWeather,
          })}
        >
          <div class="font-size-20">
            <span class="inline-block"
              ><Icon name={getWeatherName(zoneWeather).toLowerCase()} /></span
            >
            {getWeatherName(zoneWeather)}
          </div>
          {#if $weather[zone][0].currWeather === zoneWeather}
            Happening now!
          {:else if $weather[zone].find((f) => f.currWeather === zoneWeather)}
            Next in {day(
              $weather[zone].find((f) => f.currWeather === zoneWeather).date
            ).fromNow(true)}
            <span class="block text-muted font-size-14">
              {day(
                $weather[zone].find((f) => f.currWeather === zoneWeather).date
              ).format("HH:mm")}
            </span>
          {:else}
            In the far future...
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
