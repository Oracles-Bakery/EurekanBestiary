<script>
  import { level, paWeather } from "./stores";
  import ew from "./ew";
  import { onMount } from "svelte";
  import { formatUtc } from "./times";
  import { getMatches } from "./bestiary";
  import day from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  day.extend(relativeTime);

  onMount(async () => {
    updateWeatherStores();
  });

  let date = new Date().getTime() * (1440 / 70);
  let matches, upMatches, otherMatches, normalMatches, pagosForecast;

  newMatches();
  setInterval(() => {
    date = new Date().getTime() * (1440 / 70);
  }, 1000);
  $: currentEzTime = formatUtc(date);

  function updateWeatherStores() {
    paWeather.set(ew.forecast(ew.PAGOS_WEATHER));
  }

  function formatWeathers(weathers) {
    if (weathers.length === 1) {
      return ew.getWeatherName(weathers[0]);
    }
    return weathers
      .map((w, i) => {
        if (i + 1 === weathers.length) {
          return `and ${ew.getWeatherName(w)}`;
        }
        return `${ew.getWeatherName(w)}, `;
      })
      .join("");
  }

  function newMatches() {
    pagosForecast = ew.forecast(ew.PAGOS_WEATHER);
    matches = getMatches(pagosForecast, $level).sort(
      (a, b) => a.level < b.level
    );

    upMatches = matches.filter((m) => m.uptime.isUp);
    normalMatches = matches.filter((m) => !m.special);
    otherMatches = matches.filter((m) => m.special && !m.uptime.isUp);
  }

  function formatNextUptime(futures) {
    let i;
    futures.find((f, idx) => {
      if (f) i = idx;
      return f;
    });

    if (i) {
      return `in ${day(pagosForecast[i + 1].date).fromNow()}`;
    }
    return "in the far future";
  }

  function levelChanged(evt) {
    level.set(Number(evt.target.value));
    newMatches();
  }
</script>

<div class="app">
  <h2>
    Level: <input on:change={levelChanged} type="number" min="1" max="60" />
  </h2>

  Level is {$level}<br />

  Time is {currentEzTime}<br />

  <h5>matches</h5>
  <ul>
    {#each upMatches as m (m.name)}
      <li>
        <em>(Lv{m.level})</em> <strong>{m.name}</strong>
        ({#if m.mutating}mutates{/if}{#if m.augmenting}augments{/if} in {formatWeathers(
          m.uptime.weathers
        )})
      </li>
    {/each}
  </ul>

  <h5>regular enemies</h5>
  <ul>
    {#each normalMatches as m (m.name)}
      <li><em>(Lv{m.level})</em> <strong>{m.name}</strong></li>
    {/each}
  </ul>

  <h5>special enemies that do not mutate/augment right now</h5>
  <ul>
    {#each otherMatches as m (m.name)}
      <li>
        <em>(Lv{m.level})</em> <strong>{m.name}</strong>
        ({#if m.mutating}mutates{/if}{#if m.augmenting}augments{/if}
        {formatNextUptime(m.uptime.futureUptime)})
      </li>
    {/each}
  </ul>

  Pagos Weather is {pagosForecast[0].weatherName}
</div>

<style></style>
