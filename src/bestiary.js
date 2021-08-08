import pagosB from "./pagos.bestiary.json";
import day from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
day.extend(isBetween);

export function getMatches(forecast, level) {
  console.log(level);
  let res = [];
  pagosB.forEach((b) => {
    if (b.level >= level && b.level - 2 < level) {
      res.push({
        name: b.name,
        elem: b.elem,
        special: b.type > 0,
        mutating: b.type === 1,
        augmenting: b.type === 2,
        uptime: findForecastMatch(forecast, b.conditions),
      });
    }
  });
  console.log(res);
}

function getEzTime() {
  return day(new Date().getTime() * (1440 / 70));
}

function findForecastMatch(forecast, conditions) {
  const time = getEzTime();
  const dn = time.isBetween(time.hour(8), time.hour(18)) ? "day" : "night";
  return {
    isUp: forecastMatches(forecast, conditions[dn], 0).length > 0,
    weathers: forecastMatches(forecast, conditions[dn], 0),
    futureUptime: [1, 2, 3, 4].map((i) => {
      const match = forecastMatches(forecast, conditions[dn], i);
      return {
        isUp: match.length > 0,
        weathers: match,
      };
    }),
  };
}

function forecastMatches(forecast, condition, index) {
  const currWeather = forecast[index].currWeather;
  return condition.filter((c) => c === currWeather);
}
