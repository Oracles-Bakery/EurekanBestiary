<script>
  import day from "dayjs";
  import { data, weather, time } from "./stores";
  import isBetween from "dayjs/plugin/isBetween";
  import { matchSpriteName } from "./ew";
  import relativeTime from "dayjs/plugin/relativeTime";

  day.extend(isBetween);
  day.extend(relativeTime);

  let filters = {
    zones: ["pagos"],
    level: null
  };

  let matches = [];
  data.subscribe(d => {
    matches = newMatches(d);
  });

  function newMatches(data) {
    return data.filter(entry => {
      if (!filters.zones.includes(entry.area)) {
        return false;
      }
      if (filters.level) {
        return entry.level[0] - 2 <= filters.level && entry.level[1] >= filters.level;
      }
      return true;
    }).sort((a, b) => a.level[0] < b.level[0]).map(entry => {
      return {
        spawns: $weather[entry.area].map(w => isUp(entry, w)),
        ...entry
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
    return `Spawns ${day($weather[match.area][match.spawns.indexOf(true)].date).fromNow()}`;

  }
</script>

<div class="grid grid-cols-3 gap-1">
  <div class="col-span-2">
    <ul class="list-none">
      {#each matches as match, i}
        <li class="border-x border-t px-3 py-2 border-gray-300"
            class:rounded-t={i === 0}
            class:rounded-b={i === matches.length - 1}
            class:border-b={i === matches.length - 1}
            class:bg-gray-200={!match.spawns[0]}>
          <div>
            <h1 class="block font-bold text-xl">{match.name}</h1>
            <div class="flex">
              <div class="rounded-2xl text-xs px-2 py-1 bg-red-100 font-bold text-red-600"
                   class:bg-gray-300={!match.spawns[0]}
                   class:text-gray-800={!match.spawns[0]}>
                {match.spawns[0] ? "Spawns" : "Does not spawn"}
              </div>
              <div class="rounded-2xl ml-1 text-xs px-2 py-1 bg-gray-100 font-bold text-gray-600">
                {formatNextUpOrDowntime(match)}
              </div>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>
  <div>hi</div>
</div>
