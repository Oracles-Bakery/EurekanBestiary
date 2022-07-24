<script>
  import day from "dayjs";
  import {
    data,
    weather,
    time,
    filters,
    sort,
    hasSeenIntro,
    search
  } from "./stores";
  import isBetween from "dayjs/plugin/isBetween";
  import { convert } from "url-slug";
  import { matchSpriteName } from "./ew";
  import relativeTime from "dayjs/plugin/relativeTime";
  import Icon from "./components/Icon.svelte";
  import Element from "./components/Element.svelte";
  import Map from "./components/Map.svelte";
  import utc from "dayjs/plugin/utc";
  import clsx from "clsx";
  import Fuse from "fuse.js";
  import { capitalize, formatLevel } from "./util";

  day.extend(isBetween);
  day.extend(relativeTime);
  day.extend(utc);

  let matches = [];
  data.subscribe((d) => {
    // This only fires once.
    matches = newMatches(d);
  });
  time.subscribe(() => {
    matches = newMatches($data);
  });

  function newMatches(data) {
    const filtered = data
      .filter((entry) => {
        if (!$filters.zones.includes(entry.area)) {
          return false;
        }
        if ($filters.level) {
          return (
            entry.level[0] - 2 <= $filters.level &&
            entry.level[1] >= $filters.level
          );
        }
        return true;
      })
      .sort((a, b) => {
        const changeA = a.change && isChanging(a);
        const changeB = b.change && isChanging(b);
        if ($sort.maTop && changeA && !changeB) {
          return -1;
        } else if ($sort.maTop && !changeA && changeB) {
          return 1;
        } else if ($sort.maTop && a.change && !b.change) {
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
      })
      .map((entry) => {
        return {
          spawns: $weather[entry.area].map((w) => isUp(entry, w)),
          ...entry
        };
      });
    if (!$search || $search.length === 0) {
      return filtered;
    }
    const fuse = new Fuse(filtered, {
      keys: ["name"]
    });
    return fuse.search($search).map((r) => r.item);
  }

  function isUp(entry, weather) {
    if (entry.sprite) {
      return matchSpriteName(entry.name).some((w) => weather.currWeather === w);
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
      return entry.change.day.includes(
        String($weather[entry.area][0].currWeather)
      );
    } else {
      return entry.change.night.includes(
        String($weather[entry.area][0].currWeather)
      );
    }
  }

  // Returns, given an entry, the next timestamp when that entry will mutate/adapt.
  function getNextChangeTime(entry, spawning) {
    if (!entry.change) {
      return false;
    }

    let match;
    $weather[entry.area].find((w) => {
      const date = day.utc(w.date * (1440 / 70));

      // 8:00 is a "safe" weather cycle, since it's only during the daytime.
      if (
        date.hour() === 8 &&
        entry.change.day.includes(String(w.currWeather))
      ) {
        match = date.toDate();
        return spawning;
      }

      // 16:00 has two hours of day, and 6 hours of nighttime.
      if (date.hour() === 16) {
        if (
          entry.change.day.includes(String(w.currWeather)) &&
          day($time).isBefore(date.set("hour", 18))
        ) {
          match = date.toDate();
          return spawning;
        } else if (entry.change.night.includes(String(w.currWeather))) {
          match = date.add(2, "hour").toDate();
          return spawning;
        }
      }

      // 0:00 has 6 hours of night, and 2 hours of daytime.
      if (date.hour() === 0) {
        if (
          entry.change.night.includes(String(w.currWeather)) &&
          day($time).isBefore(date.add(6, "hour"))
        ) {
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

    const nextTrue = match.spawns.find((s) => s);
    if (!nextTrue) {
      return "Not spawning anytime soon";
    }
    if (match.spawns[0]) {
      return `Despawns ${day(
        $weather[match.area][match.spawns.indexOf(false)].date
      ).fromNow()}`;
    }
    return `Spawns ${day(
      $weather[match.area][match.spawns.indexOf(true)].date
    ).fromNow()}`;
  }

  const toggleZoneFilter = (zone) => () => {
    const exists = $filters.zones.includes(zone);
    const newFilters = $filters;

    if (exists) {
      newFilters["zones"] = newFilters.zones.filter((z) => z !== zone);
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

<div class="container-fluid row mt-10">
  <div class="col-9 px-15">
    {#if !$hasSeenIntro}
      <div class="alert alert-primary mb-5">
        <h5 class="alert-heading">Welcome to the Eurekan Bestiary!</h5>
        This is a website designed to help you do the following:
        <ul style="list-style: disc; margin-left: 15px;">
          <li class="m-0">
            Track adaption/mutation times for certain monsters in Eureka.
            Defeating mutating or adapting monsters nets you a substantial XP
            bonus.
          </li>
          <li class="m-0">
            Help you keep track of the current weather in Eureka zones.
          </li>
          <li class="m-0">
            In general, we're trying to catalogue each and every enemy you can
            meet in Eureka.
          </li>
        </ul>
        You can use the controls on the right to help filter enemies. Have fun!

        <button
          class="btn block mt-5 btn-sm"
          on:click={() => hasSeenIntro.set(true)}
        >
          Dismiss
        </button>
      </div>
    {/if}
    <ul>
      {#each matches as match, i (match.id)}
        <li
          class={clsx("card p-10 m-0", {
            "mt-5": i !== 0,
            "text-muted": !match.spawns[0],
          })}
        >
          <a
            href="/{match.area}/{convert(match.name)}"
            class="d-flex text-white-dm text-black-lm text-decoration-none justify-content-between"
          >
            <div>
              <h1 class="d-flex align-items-center font-size-20">
                <div class="badge font-mono px-5 mr-5">
                  Lv.{formatLevel(match.level)}
                </div>
                <div class="mr-5">
                  <Element name={match.element} iconOnly={true} />
                </div>
                <div class="flex items-center">
                  <div class="mr-2">{match.name}</div>
                  {#if match.pos && match.pos.length > 0}
                    <div class="dropdown dropright toggle-on-hover">
                      <div
                        data-toggle="dropdown"
                        id={`${match.id}-map`}
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <Icon name="map" extraClasses="h-5" />
                      </div>
                      <div class="dropdown-menu" style="width: 200px;">
                        <Map entry={match} />
                      </div>
                    </div>
                  {/if}
                </div>
              </h1>
              <div class="d-flex">
                {#if match.undead}
                  <div class="badge border-secondary mr-5">Undead</div>
                {/if}
                {#if match.sprite}
                  <div class="badge border-secondary mr-5">Sprite</div>
                {/if}
                <div class="badge mr-5">
                  {formatNextUpOrDowntime(match)}
                </div>
                {#if match.change}
                  {#if isChanging(match)}
                    <div class="badge badge-success">
                      Stops changing {day(
                      getNextChangeTime(match, false) / (1440 / 70)
                    ).fromNow()}
                    </div>
                  {:else}
                    <div class="badge border-success">
                      {capitalize(match.change.type)}
                      {#if getNextChangeTime(match, true) instanceof Date}
                        {day(
                          getNextChangeTime(match, true) / (1440 / 70)
                        ).fromNow()}
                      {:else}
                        in the far future...
                      {/if}
                    </div>
                  {/if}
                {:else}
                  <div class="badge">Does not change</div>
                {/if}
              </div>
            </div>
            <div class="self-center text-gray-400">
              <Icon name="chevron" />
            </div>
          </a>
        </li>
      {/each}
    </ul>
  </div>
  <div class="col-3">
    <div style="position: fixed; margin-right: 30px;">
      <h2 class="font-size-18 font-weight-bold mb-5">Search</h2>
      <input
        class="form-control"
        type="text"
        placeholder="Search by name..."
        bind:value={$search}
      />
      <h2 class="font-size-18 font-weight-bold my-5">Sort</h2>
      <div class="input-group mb-5">
        <div class="input-group-prepend">
          <span class="input-group-text">Level</span>
        </div>
        <div class="input-group-append flex-grow-1">
          <button
            class="btn btn-block"
            class:btn-primary={$sort.level === "asc"}
            on:click={setSort("level", "asc")}
          >
            Asc
          </button>
        </div>
        <div class="input-group-append flex-grow-1">
          <button
            class="btn btn-block"
            class:btn-primary={$sort.level === "desc"}
            on:click={setSort("level", "desc")}
          >
            Desc
          </button>
        </div>
      </div>
      <div class="input-group">
        <div class="input-group-prepend">
          <span class="input-group-text">Name</span>
        </div>
        <div class="input-group-append flex-grow-1">
          <button
            class="btn btn-block"
            class:btn-primary={$sort.name === "asc"}
            on:click={setSort("name", "asc")}
          >
            Asc
          </button>
        </div>
        <div class="input-group-append flex-grow-1">
          <button
            class="btn btn-block"
            class:btn-primary={$sort.name === "desc"}
            on:click={setSort("name", "desc")}
          >
            Desc
          </button>
        </div>
      </div>
      <div class="my-2">
        <input id="maFirst" bind:checked={$sort.maTop} type="checkbox" />
        <label for="maFirst">Sort changing monsters first?</label>
      </div>
      <h2 class="font-size-18 font-weight-bold mb-5">Zone Filters</h2>
      <button
        class="btn btn-lg btn-block btn-no-click mb-5"
        class:btn-success={$filters.zones.includes("anemos")}
        on:click={toggleZoneFilter("anemos")}
      >
        Anemos
      </button>
      <button
        class="btn btn-lg btn-block btn-no-click mb-5"
        class:btn-secondary={$filters.zones.includes("pagos")}
        on:click={toggleZoneFilter("pagos")}
      >
        Pagos
      </button>
      <button
        class="btn btn-lg btn-block btn-no-click mb-5"
        class:btn-danger={$filters.zones.includes("pyros")}
        on:click={toggleZoneFilter("pyros")}
      >
        Pyros
      </button>
      <button
        class="btn btn-lg btn-block btn-no-click"
        class:btn-primary={$filters.zones.includes("hydatos")}
        on:click={toggleZoneFilter("hydatos")}
      >
        Hydatos
      </button>

      <div class="mt-2">
        <label for="level" class="font-size-18 font-weight-bold">
          Your Level
        </label>
        <input
          type="number"
          min="1"
          max="60"
          id="level"
          bind:value={$filters.level}
          class="form-control"
          placeholder="Between 1 and 60"
        />
        <p class="text-muted font-size-12 mt-5">
          This will only select the enemies that are up to 2 levels above your
          level. It's recommended to focus enemies 2 levels above you for
          maximum EXP gain.
        </p>
      </div>
    </div>
  </div>
</div>
