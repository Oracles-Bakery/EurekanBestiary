<script>
  export let matches;
  export let type;
  import { level, paWeather, pyWeather, hWeather, aWeather } from "./stores";
  import day from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  day.extend(relativeTime);

  export const TYPES = {
    UP: 0,
    DOWN: 1,
    NO_UPTIME: 2,
  };

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
    <li>
      <span class={!m.spawning && "strikethrough"}>
        <em>(Lv{formatLevel(m)})</em> <strong>{m.name}</strong>
        {#if type !== 2}({#if m.mutating}mutates{/if}{#if m.augmenting}augments{/if}
          {#if type === TYPES.UP}
            {formatUptimeUntil(m.uptime.futureUptime)})
          {:else if type === TYPES.DOWN}
            {formatNextUptime(m.uptime.futureUptime)})
          {/if}{/if}
      </span>
      {#if !m.spawning}
        &nbsp;(next spawns {m.nextSpawn
          ? day(m.nextSpawn.date).fromNow()
          : "in a long time"})
      {/if}
      {#if m.logogram}
        <span class="highlight">✶ {m.logogram} logogram</span>
      {/if}
    </li>
  {/each}
</ul>
