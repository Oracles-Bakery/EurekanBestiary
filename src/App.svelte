<script>
  import { level, paWeather, aWeather, hWeather, pyWeather } from "./stores";
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
  let matches,
    upMatches,
    otherMatches,
    normalMatches,
    pagosForecast,
    anemosForecast,
    pyrosForecast,
    hydatosForecast;

  newForecasts();
  newMatches();
  setInterval(() => {
    date = new Date().getTime() * (1440 / 70);
  }, 1000);
  setInterval(() => {
    newForecasts();
    newMatches();
  }, 300000); // 5 minutes
  $: currentEzTime = formatUtc(date);

  function updateWeatherStores() {
    paWeather.set(ew.forecast(ew.PAGOS_WEATHER));
    pyWeather.set(ew.forecast(ew.PYROS_WEATHER));
    hWeather.set(ew.forecast(ew.HYDATOS_WEATHER));
    aWeather.set(ew.forecast(ew.ANEMOS_WEATHER));
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

  function newForecasts() {
    anemosForecast = ew.forecast(ew.ANEMOS_WEATHER);
    pagosForecast = ew.forecast(ew.PAGOS_WEATHER);
    pyrosForecast = ew.forecast(ew.PYROS_WEATHER);
    hydatosForecast = ew.forecast(ew.HYDATOS_WEATHER);
    paWeather.set(pagosForecast);
    pyWeather.set(pyrosForecast);
    hWeather.set(hydatosForecast);
    aWeather.set(anemosForecast);
  }

  function newMatches() {
    let forecast;
    if ($level >= 20 && $level < 35) {
      forecast = pagosForecast;
    } else if ($level >= 35 && $level < 50) {
      forecast = pyrosForecast;
    } else if ($level >= 50) {
      forecast = hydatosForecast;
    } else {
      forecast = anemosForecast;
    }
    matches = getMatches(forecast, $level).sort((a, b) => a.level < b.level);

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

<header>
  <ul>
    <li><strong>Eureka Mark Tracker</strong></li>
    <li>ET: {currentEzTime}</li>
  </ul>
</header>
<main class="container">
  <div class="pure-g">
    <div class="pure-u-3-4">
      <h2>
        Level: <input
          bind:value={$level}
          on:change={levelChanged}
          type="number"
          min="1"
          max="60"
        />
      </h2>

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
    </div>
    <div class="pure-u-1-4">
      <div class="pure-menu">
        <ul class="pure-menu-list">
          <li class="pure-menu-item">
            Anemos: {anemosForecast[0].weatherName}
          </li>
          <li class="pure-menu-item">Pagos: {pagosForecast[0].weatherName}</li>
          <li class="pure-menu-item">Pyros: {pyrosForecast[0].weatherName}</li>
          <li class="pure-menu-item">
            Hydatos: {hydatosForecast[0].weatherName}
          </li>
        </ul>
      </div>
      <h4>What is this?</h4>
      <p>
        This is a website to keep track of which monsters in Eureka are mutating
        or augmenting right now. Mutating/augmenting massively increases the EXP
        yield, and it is therefore preferrable to go after these monsters when
        levelling in Eureka.
        <br /><br />
        Mutation/augmentation requirements are bound by weather, as well as time
        of day. I created this so I didn't need to look through various google sheets
        and cross-reference with weather forecasts.
      </p>
      <hr />
      <p>
        Created by Raiah Belse (Twintania)<br />
        <a href="https://git.tilde.institute/anastasie/eureka-marks/">Source</a>
      </p>
    </div>
  </div>
</main>

<style></style>
