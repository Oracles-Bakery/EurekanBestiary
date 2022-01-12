import day from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

day.extend(isBetween);

export function getMatches(data, forecast, level) {
  let res = [];
  data[forecast[0].zone].forEach((b) => {
    if (
      (b.level >= level && b.level - 2 <= level) ||
      (b.levelRange && b.levelRange[0] - 2 <= level && b.levelRange[1] >= level)
    ) {
      res.push({
        name: b.name.trim(),
        level: b.level,
        levelRange: b.levelRange,
        elem: b.elem,
        special: b.type > 0,
        mutating: b.type === 1,
        augmenting: b.type === 2,
        logogram: typeof b.logogram === "number" && getLogogramName(b.logogram),
        spawning:
          !b.spawnConditions ||
          b.spawnConditions.includes(forecast[0].currWeather),
        nextSpawn:
          !b.spawnConditions || findNextSpawn(forecast, b.spawnConditions),
        uptime: findForecastMatch(forecast, b.conditions),
        nocturnal: !!b.nocturnal,
      });
    }
  });
  return res;
}

function getEzTime() {
  return day(new Date().getTime() * (1440 / 70));
}

function findForecastMatch(forecast, conditions) {
  const time = getEzTime();
  const dn = time.isBetween(time.hour(8), time.hour(18)) ? "day" : "night";
  return {
    isUp: forecastMatches(forecast, conditions[dn], 0),
    weathers: conditions[dn],
    futureUptime: [1, 2, 3, 4].map((i) => {
      return futureForecastMatches(forecast, conditions, i);
    }),
  };
}

function findNextSpawn(forecast, spawnConditions) {
  return forecast.find((f) => {
    return spawnConditions.includes(f.currWeather);
  });
}

function forecastMatches(forecast, condition, index) {
  const currWeather = forecast[index].currWeather;
  return condition.some((c) => c === currWeather);
}

function futureForecastMatches(forecast, conditions, index) {
  const fc = forecast[index];
  const fcTime = day((fc.date.getTime() * 1440) / 70);
  const dn = day(fcTime).isBetween(fcTime.hour(8), fcTime.hour(18))
    ? "day"
    : "night";
  return conditions[dn].some((c) => c === fc.currWeather);
}
