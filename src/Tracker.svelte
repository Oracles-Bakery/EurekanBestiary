<script>
  import day from "dayjs";
  import { data, weather, time, filters, sort } from "./stores";
  import isBetween from "dayjs/plugin/isBetween";
  import { matchSpriteName } from "./ew";
  import relativeTime from "dayjs/plugin/relativeTime";
  import Icon from "./components/Icon.svelte";
  import utc from "dayjs/plugin/utc";
  import { capitalize, formatLevel } from "./util";

  day.extend(isBetween);
  day.extend(relativeTime);
  day.extend(utc);

  let matches = [];
  data.subscribe(d => {
    // This only fires once.
    matches = newMatches(d);
  });
  time.subscribe(() => {
    matches = newMatches($data);
  });

  function newMatches(data) {
    return data.filter(entry => {
      if (!$filters.zones.includes(entry.area)) {
        return false;
      }
      if ($filters.level) {
        return entry.level[0] - 2 <= $filters.level && entry.level[1] >= $filters.level;
      }
      return true;
    }).sort((a, b) => {
      if ($sort.maTop && a.change && !b.change) {
        return -1;
      } else if ($sort.maTop && !a.change && b.change) {
        return 1;
      } else if ($sort.level === "asc" && a.level[0] < b.level[0]) {
        return -1;
      } else if ($sort.level === "desc" && a.level[0] > b.level[0]) {
        return -1;
      } else if ($sort.name === "asc" && a.name < b.name) {
        return -1;
      } else if (sort.name === "desc" && a.name > b.name) {
        return -1;
      }
      return 1;
    }).map(entry => {
      return {
        spawns: $weather[entry.area].map(w => isUp(entry, w)),
        ...entry,
      };
    });
  }

  function isUp(entry, weather) {
    if (entry.sprite) {
      return matchSpriteName(entry.name).some(w => weather.currWeather === w);
    }
    if (entry.undead) {
      const t = day(weather.date * (1440 / 70));
      return !t.isBetween(t.hour(6), t.hour(18));
    }
    return true;
  }

  function isChanging(entry) {
    const isDay = day($time).isBetween(day($time).hour(6), day($time).hour(18));
    if (isDay) {
      return entry.change.day.includes(String($weather[entry.area][0].currWeather));
    } else {
      return entry.change.night.includes(String($weather[entry.area][0].currWeather));
    }
  }

  // Returns, given an entry, the next timestamp when that entry will mutate/augment.
  function getNextChangeTime(entry, spawning) {
    if (!entry.change) {
      return false;
    }

    let match;
    $weather[entry.area].find(w => {
      const date = day.utc(w.date * (1440 / 70));

      // 8:00 is a "safe" weather cycle, since it's only during the daytime.
      if (date.hour() === 8 && entry.change.day.includes(String(w.currWeather))) {
        match = date.toDate();
        return spawning;
      }

      // 16:00 has two hours of day, and 6 hours of nighttime.
      if (date.hour() === 16) {
        if (entry.change.day.includes(String(w.currWeather))) {
          match = date.toDate();
          return spawning;
        } else if (entry.change.night.includes(String(w.currWeather))) {
          match = date.add(2, "hour").toDate();
          return spawning;
        }
      }

      // 0:00 has 6 hours of night, and 2 hours of daytime.
      if (date.hour() === 0) {
        if (entry.change.night.includes(String(w.currWeather))) {
          match = date.toDate();
          return spawning;
        } else if (entry.change.day.includes(String(w.currWeather))) {
          match = date.add(6, "hour").toDate();
          return spawning;
        }
      }

      if (!spawning) {
        match = date.toDate();
        return true;
      }
      return false;
    });

    if (match) {
      return match;
    }
    return "in a long time";
  }

  function formatNextUpOrDowntime(match) {
    const t = day($time);
    if (!match.undead && !match.sprite) {
      return "Always spawning";
    }
    if (match.undead) {
      if (t.isBetween(t.hour(6), t.hour(18))) {
        return `Spawns ${day().to(t.hour(18).valueOf() / (1440 / 70))}`;
      } else {
        return `Despawns ${day().to(t.hour(30).valueOf() / (1440 / 70))}`;
      }
    }

    const nextTrue = match.spawns.find(s => s);
    if (!nextTrue) {
      return "Not spawning anytime soon";
    }
    if (match.spawns[0]) {
      return `Despawns ${day($weather[match.area][match.spawns.indexOf(false)].date).fromNow()}`;
    }
    return `Spawns ${day($weather[match.area][match.spawns.indexOf(true)].date).fromNow()}`;
  }

  const toggleZoneFilter = (zone) => () => {
    const exists = $filters.zones.includes(zone);
    const newFilters = $filters;

    if (exists) {
      newFilters["zones"] = newFilters.zones.filter(z => z !== zone);
    } else {
      newFilters["zones"] = [...newFilters.zones, zone];
    }
    filters.set(newFilters);
    matches = newMatches($data);
  };

  const setSort = (type, direction) => () => {
    const newSort = $sort;
    newSort.level = null;
    newSort.name = null;
    newSort[type] = direction;
    sort.set(newSort);
  };
</script>

<div class="grid grid-cols-3 gap-1">
  <div class="col-span-2">
    <ul class="list-none divide-y shadow-lg">
      {#each matches as match, i (match.id)}
        <li class="border-x px-3 py-2 border-gray-300"
            class:rounded-t={i === 0}
            class:rounded-b={i === matches.length - 1}
            class:border-b={i === matches.length - 1}
            class:border-t={i === 0}
            class:bg-gray-200={!match.spawns[0]}>
          <a href="/entry/{match.id}" class="flex justify-between">
            <div>
              <h1 class="block font-bold text-xl mb-1 flex items-center">
                <div class="border rounded-sm px-1 inline-block text-sm font-mono align-middle mr-1">
                  Lv.{formatLevel(match.level)}</div>
                <div class="flex items-center">
                  <div class="mr-2">{match.name}</div>
                  {#if match.change && match.change.type === "mutates"}
                    <Icon name="mutates"/>
                  {/if}
                  {#if match.change && match.change.type === "augments"}
                    <Icon name="augments"/>
                  {/if}
                  <div class="text-xs font-normal ml-1">{match.change ? match.change.type : ""}</div>
                </div>
              </h1>
              <div class="flex">
                {#if match.undead}
                  <div class="rounded-2xl text-xs px-2 py-1 bg-red-200 font-bold text-red-700">Undead</div>
                {/if}
                {#if match.sprite}
                  <div class="rounded-2xl text-xs px-2 py-1 bg-blue-200 font-bold text-blue-700">Sprite</div>
                {/if}
                <div class="rounded-2xl ml-1 text-xs px-2 py-1 bg-gray-100 font-bold text-gray-600">
                  {formatNextUpOrDowntime(match)}
                </div>
                {#if match.change}
                  {#if isChanging(match)}
                    <div class="rounded-2xl ml-1 text-xs px-2 py-1 bg-amber-100 font-bold text-amber-600">
                      Stops changing {day(getNextChangeTime(match, false) / (1440 / 70)).fromNow()}
                    </div>
                  {:else}
                    <div class="rounded-2xl ml-1 text-xs px-2 py-1 bg-fuchsia-100 font-bold text-fuchsia-600">
                      {capitalize(match.change.type)} {day(getNextChangeTime(match, true) / (1440 / 70)).fromNow()}
                    </div>
                  {/if}
                {:else}
                  <div class="rounded-2xl ml-1 text-xs px-2 py-1 bg-gray-100 font-bold text-gray-600">
                    Does not change
                  </div>
                {/if}
              </div>
            </div>
            <div class="self-center text-gray-400">
              <Icon name="chevron"/>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  </div>
  <div class="ml-4">
    <h2 class="text-xl font-bold mb-3">Sort</h2>
    <div class="flex font-bold justify-between">
      <div class="border border-gray-300 rounded-l py-1 px-3">Level</div>
      <button class="block w-full border-y border-gray-300 py-1 px-2"
              class:bg-black={$sort.level === "asc"}
              class:text-white={$sort.level === "asc"}
              on:click={setSort("level", "asc")}>Asc
      </button>
      <button class="block w-full border border-gray-300 rounded-r py-1 px-2"
              class:bg-black={$sort.level === "desc"}
              class:text-white={$sort.level === "desc"}
              on:click={setSort("level", "desc")}>Desc
      </button>
    </div>
    <div class="flex font-bold justify-between mt-1">
      <div class="border border-gray-300 rounded-l py-1 px-3">Name</div>
      <button class="block w-full border-y border-gray-300 py-1 px-2"
              class:bg-black={$sort.name === "asc"}
              class:text-white={$sort.name === "asc"}
              on:click={setSort("name", "asc")}>Asc
      </button>
      <button class="block w-full border border-gray-300 rounded-r py-1 px-2"
              class:bg-black={$sort.name === "desc"}
              class:text-white={$sort.name === "desc"}
              on:click={setSort("name", "desc")}>Desc
      </button>
    </div>
    <div class="my-2">
      <input id="maFirst" bind:checked={$sort.maTop} type="checkbox"/>
      <label for="maFirst">Sort changing monsters first?</label>
    </div>
    <h2 class="text-xl font-bold mb-3">Filters</h2>
    <button class="block mb-2 rounded-3xl bg-gradient-to-r text-white px-6 py-2 from-green-600 to-lime-600"
            class:ring-2={$filters.zones.includes("anemos")}
            class:ring-black={$filters.zones.includes("anemos")}
            on:click={toggleZoneFilter("anemos")}>
      Anemos
    </button>
    <button class="block mb-2 rounded-3xl bg-gradient-to-r text-black px-6 py-2 from-teal-300 to-cyan-300"
            class:ring-2={$filters.zones.includes("pagos")}
            class:ring-black={$filters.zones.includes("pagos")}
            on:click={toggleZoneFilter("pagos")}>
      Pagos
    </button>
    <button class="block mb-2 rounded-3xl bg-gradient-to-r text-white px-6 py-2 from-pink-600 to-rose-600"
            class:ring-2={$filters.zones.includes("pyros")}
            class:ring-black={$filters.zones.includes("pyros")}
            on:click={toggleZoneFilter("pyros")}>
      Pyros
    </button>
    <button class="block mb-2 rounded-3xl bg-gradient-to-r text-white px-6 py-2 from-sky-600 to-blue-600"
            class:ring-2={$filters.zones.includes("hydatos")}
            class:ring-black={$filters.zones.includes("hydatos")}
            on:click={toggleZoneFilter("hydatos")}>
      Hydatos
    </button>

    <div class="mt-2">
      <label for="level" class="font-bold">Your Level</label>
      <div class="mt-1 relative rounded-md shadow-sm">
        <input type="number"
               min="1"
               max="60"
               id="level"
               bind:value={$filters.level}
               class="focus:ring-indigo-500 focus:border-indigo-500 block w-full border p-2 border-gray-300 rounded-md"
               placeholder="Between 1 and 60"/>
      </div>
      <p class="text-gray-700 text-sm mt-1">
        This will only select the enemies that are up to 2 levels above your level.
        It's recommended to focus enemies 2 levels above you for maximum EXP gain.
      </p>
    </div>
  </div>
</div>
