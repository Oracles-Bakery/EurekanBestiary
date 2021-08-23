<script>
  export let matches;
  export let type;
  import { level, paWeather, pyWeather, hWeather, aWeather } from "./stores";
  import { isNight, getNextNight } from "./times";
  import day from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  day.extend(relativeTime);

  export const TYPES = {
    UP: 0,
    DOWN: 1,
    NO_UPTIME: 2,
  };

  function isSpawning(enemy) {
    if (enemy.nocturnal && !isNight()) return false;
    return enemy.spawning;
  }

  function getNextSpawn(enemy) {
    if (enemy.nocturnal) {
      return getNextNight().fromNow();
    } else {
      return enemy.nextSpawn
        ? day(enemy.nextSpawn.date).fromNow()
        : "in a long time";
    }
  }

  function formatLevel(m) {
    if (m.level) {
      return m.level;
    } else if (m.levelRange) {
      return `${m.levelRange[0]}-${m.levelRange[1]}`;
    }
    return "??";
  }

  export function getZoneForecast() {
    if ($level >= 20 && $level < 35) {
      return $paWeather;
    } else if ($level >= 35 && $level < 50) {
      return $pyWeather;
    } else if ($level >= 50) {
      return $hWeather;
    } else {
      return $aWeather;
    }
  }

  function formatNextUptime(futures) {
    let i;
    futures.find((f, idx) => {
      if (f) i = idx;
      return f;
    });

    if (typeof i === "number") {
      return `in ${day(getZoneForecast()[i + 1].date).fromNow(true)}`;
    }
    return "in the far future";
  }

  function formatUptimeUntil(futures) {
    let i;
    futures.find((f, idx) => {
      if (!f) i = idx;
      return !f;
    });

    if (typeof i === "number") {
      return `for ${day(getZoneForecast()[i + 1].date).fromNow(true)}`;
    }

    return "for a long time";
  }
</script>

<ul>
  {#each matches as m (m.name + m.level)}
    <li class="list-item">
      <span class={!isSpawning(m) && "strikethrough"}>
        <span class="label label-normal-size">Lv{formatLevel(m)}</span>
        <strong>{m.name}</strong>
        {#if type !== TYPES.NO_UPTIME}
          <span class="label label-{type === TYPES.UP ? 'red' : 'gray'}"
            >{#if m.mutating}mutates{/if}{#if m.augmenting}augments{/if}
            {#if type === TYPES.UP}
              {formatUptimeUntil(m.uptime.futureUptime)}
            {:else if type === TYPES.DOWN}
              {formatNextUptime(m.uptime.futureUptime)}
            {/if}</span
          >{/if}
      </span>
      {#if !isSpawning(m)}
        <span class="label label-green">next spawns {getNextSpawn(m)}</span>
      {/if}
      {#if m.logogram}
        <span class="label label-black">drops ✶ {m.logogram} logogram</span>
      {/if}
    </li>
  {/each}
</ul>
