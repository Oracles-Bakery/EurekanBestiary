import pagosB from "./pagos.bestiary";
import anemosB from "./anemos.bestiary";
import pyrosB from "./pyros.bestiary";
import hydatosB from "./hydatos.bestiary";
import day from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
day.extend(isBetween);

const bestiaries = {
  pagos: pagosB,
  anemos: anemosB,
  pyros: pyrosB,
  hydatos: hydatosB,
};

export const logograms = {
  CONCEPTUAL: 0,
  FUNDAMENTAL: 1,
  OFFENSIVE: 2,
  PROTECTIVE: 3,
  CURATIVE: 4,
  TACTICAL: 5,
  INMICAL: 6,
  MITIGATIVE: 7,
  OBSCURE: 8,
};

export function getLogogramName(logogram) {
  switch (logogram) {
    case 0:
      return "Conceptual";
    case 1:
      return "Fundamental";
    case 2:
      return "Offensive";
    case 3:
      return "Protective";
    case 4:
      return "Curative";
    case 5:
      return "Tactical";
    case 6:
      return "Inmical";
    case 7:
      return "Mitigative";
    case 8:
      return "Obscure";
  }
}

export function getMatches(forecast, level) {
  let res = [];
  bestiaries[forecast[0].zone].forEach((b) => {
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
    return spawnConditions.includes(forecast.currWeather);
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
