import pagosB from "./pagos.bestiary.json";
import anemosB from "./anemos.bestiary.json";
import pyrosB from "./pyros.bestiary.json";
import hydatosB from "./hydatos.bestiary.json";
import day from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
day.extend(isBetween);

const bestiaries = {
  pagos: pagosB,
  anemos: anemosB,
  pyros: pyrosB,
  hydatos: hydatosB,
};

export function getMatches(forecast, level) {
  let res = [];
  bestiaries[forecast[0].zone].forEach((b) => {
    if (
      (b.level >= level && b.level - 2 <= level) ||
      (b.levelRange && b.levelRange[0] - 2 <= level && b.levelRange[1] >= level)
    ) {
      res.push({
        name: b.name,
        level: b.level,
        levelRange: b.levelRange,
        elem: b.elem,
        special: b.type > 0,
        mutating: b.type === 1,
        augmenting: b.type === 2,
        uptime: findForecastMatch(forecast, b.conditions),
      });
    }
  });
  console.log(res);
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
      return forecastMatches(forecast, conditions[dn], i);
    }),
  };
}

function forecastMatches(forecast, condition, index) {
  const currWeather = forecast[index].currWeather;
  return condition.some((c) => c === currWeather);
}
