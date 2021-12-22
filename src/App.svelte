<script>
  import { level, paWeather, aWeather, hWeather, pyWeather } from "./stores";
  import ew from "./ew";
  import { formatUtc } from "./times";
  import { getMatches } from "./bestiary";
  import EnemyList from "./EnemyList.svelte";
  import day from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { onMount } from "svelte";
  day.extend(relativeTime);

  const VERSION = "1.2.3";
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
  }, 500); // half a second
  setInterval(() => {
    newForecasts();
    newMatches();
  }, 1000); // one second
  $: currentEzTime = formatUtc(date);
  onMount(() => {
    document.getElementById("level").value = $level || 0; // this is fucked up but it works
  });

  function newForecasts() {
    anemosForecast = ew.forecast(ew.ANEMOS_WEATHER, "anemos");
    pagosForecast = ew.forecast(ew.PAGOS_WEATHER, "pagos");
    pyrosForecast = ew.forecast(ew.PYROS_WEATHER, "pyros");
    hydatosForecast = ew.forecast(ew.HYDATOS_WEATHER, "hydatos");
    paWeather.set(pagosForecast);
    pyWeather.set(pyrosForecast);
    hWeather.set(hydatosForecast);
    aWeather.set(anemosForecast);
  }

  function newMatches() {
    let forecast = getZoneForecast();
    matches = getMatches(forecast, $level).sort((a, b) => a.level < b.level);

    upMatches = matches.filter((m) => m.uptime.isUp);
    normalMatches = matches.filter((m) => !m.special);
    otherMatches = matches.filter((m) => m.special && !m.uptime.isUp);
  }

  export function getZoneForecast() {
    if ($level >= 20 && $level < 35) {
      return pagosForecast;
    } else if ($level >= 35 && $level < 50) {
      return pyrosForecast;
    } else if ($level >= 50) {
      return hydatosForecast;
    } else {
      return anemosForecast;
    }
  }

  function getWeatherChangeTime() {
    // Doesn't matter which forecast
    return day(anemosForecast[1].date).fromNow();
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
    <li>Next weather change {getWeatherChangeTime()}</li>
  </ul>
</header>
<main class="container">
  <div class="pure-g">
    <div class="pure-u-1 pure-u-md-3-4">
      <h2>
        Level: <input
          id="level"
          :value={$level}
          on:change={levelChanged}
          type="number"
          min="1"
          max="60"
        />
      </h2>

      <h5>mutates/augments</h5>
      <EnemyList matches={upMatches} type={0} />

      <h5>regular enemies</h5>
      <EnemyList matches={normalMatches} type={2} />

      <h5>special enemies that do not mutate/augment right now</h5>
      <EnemyList matches={otherMatches} type={1} />
    </div>
    <div class="pure-u-1 pure-u-md-1-4">
      <div class="pure-menu">
        <ul class="pure-menu-list">
          <li class="pure-menu-item">
            {#if $level < 20}<strong>Anemos</strong>{:else}Anemos{/if}: {anemosForecast[0]
              .weatherName}
          </li>
          {#if $level < 20}<ul>
              {#each [1, 2, 3, 4] as i}<li>
                  {ew.getWeatherName(getZoneForecast()[i].currWeather)}
                </li>{/each}
            </ul>{/if}
          <li class="pure-menu-item">
            {#if $level >= 20 && $level < 35}<strong>Pagos</strong
              >{:else}Pagos{/if}: {pagosForecast[0].weatherName}
          </li>
          {#if $level >= 20 && $level < 35}<ul>
              {#each [1, 2, 3, 4] as i}<li>
                  {ew.getWeatherName(getZoneForecast()[i].currWeather)}
                </li>{/each}
            </ul>{/if}
          <li class="pure-menu-item">
            {#if $level >= 35 && $level < 50}<strong>Pyros</strong
              >{:else}Pyros{/if}: {pyrosForecast[0].weatherName}
          </li>
          {#if $level >= 35 && $level < 50}<ul>
              {#each [1, 2, 3, 4] as i}<li>
                  {ew.getWeatherName(getZoneForecast()[i].currWeather)}
                </li>{/each}
            </ul>{/if}
          <li class="pure-menu-item">
            {#if $level >= 50}<strong>Hydatos</strong>{:else}Hydatos{/if}: {hydatosForecast[0]
              .weatherName}
          </li>
          {#if $level >= 50}<ul>
              {#each [1, 2, 3, 4] as i}<li>
                  {ew.getWeatherName(getZoneForecast()[i].currWeather)}
                </li>{/each}
            </ul>{/if}
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
        Created by Raiah Belse (Zodiark)<br /><br />
        Message anastasie#2293 on Discord if you find any bugs or wrong/missing data!<br
        />
        <a href="https://codeberg.org/mokou/eureka-marks">Source</a>
      </p>
      <p>
        <small class="version"
          >v{VERSION} &bull;
          <a
            class="dim-link"
            href="https://codeberg.org/mokou/eureka-marks/src/branch/main/CHANGELOG.md"
            >changelog</a
          ></small
        >
      </p>
    </div>
  </div>
</main>

<style></style>
