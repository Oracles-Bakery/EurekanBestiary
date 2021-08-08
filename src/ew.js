import { aWeather, paWeather, pyWeather, hWeather } from "./stores";

const WEATHER = {
  FAIR: 0,
  SHOWERS: 1,
  GALES: 2,
  BLIZZARDS: 3,
  HEAT: 4,
  THUNDER: 5,
  GLOOM: 6,
  SNOW: 7,
  FOG: 8,
  UMBRAL_WIND: 9,
};

// Anemos: 30/Fair, 30/Gales, 30/Showers, 10/Snowy
const ANEMOS_WEATHER = [
  [WEATHER.FAIR, 30],
  [WEATHER.GALES, 30],
  [WEATHER.SHOWERS, 30],
  [WEATHER.SNOW, 10],
];

// Pagos: 10/Fair, 18/Fog, 18/Heat, 18/Snow, 18/Thunder, 18/Blizzards
const PAGOS_WEATHER = [
  [WEATHER.FAIR, 10],
  [WEATHER.FOG, 18],
  [WEATHER.HEAT, 18],
  [WEATHER.SNOW, 18],
  [WEATHER.THUNDER, 18],
  [WEATHER.BLIZZARDS, 18],
];

// Pyros: 10/Fair, 18/Heat, 18/Thunder, 18/Blizzards, 18/Umbral Wind, 18/Snow
const PYROS_WEATHER = [
  [WEATHER.FAIR, 10],
  [WEATHER.HEAT, 18],
  [WEATHER.THUNDER, 18],
  [WEATHER.BLIZZARDS, 18],
  [WEATHER.UMBRAL_WIND, 18],
  [WEATHER.SNOW, 18],
];

// Hydatos: 12/Fair, 22/Showers, 22/Gloom, 22/Thunder, 22/Snow
const HYDATOS_WEATHER = [
  [WEATHER.FAIR, 12],
  [WEATHER.SHOWERS, 22],
  [WEATHER.GLOOM, 22],
  [WEATHER.THUNDER, 22],
  [WEATHER.SNOW, 22],
];

function getWeatherName(weather) {
  switch (weather) {
    case 0:
      return "Fair";
    case 1:
      return "Showers";
    case 2:
      return "Gales";
    case 3:
      return "Blizzards";
    case 4:
      return "Heat";
    case 5:
      return "Thunder";
    case 6:
      return "Gloom";
    case 7:
      return "Snow";
    case 8:
      return "Fog";
    case 9:
      return "Umbral Wind";
    default:
      return "Unknown";
  }
}

function getSeed(date = new Date()) {
  return Math.floor(date.getTime() / 1400000);
}

function hash(seed = getSeed()) {
  const base = Math.floor(seed / 3) * 100 + ((seed + 1) % 3) * 8;
  const step1 = ((base << 11) ^ base) >>> 0;
  const step2 = ((step1 >>> 8) ^ step1) >>> 0;
  return step2 % 100;
}

function hashSeq(seed = getSeed(), count = 5) {
  const hashes = [];
  for (let i = 0; i < count; ++i) {
    hashes.push(hash(seed + i));
  }
  return hashes;
}

function getWeather(rates, hash = hashSeed()) {
  let total = 0;
  for (const [weather, chance] of rates) {
    if ((total += chance) > hash) {
      return weather;
    }
  }
  return WEATHER.FAIR;
}

function forecast(rates, name, seed = getSeed(), count = 10) {
  const res = [];
  let prevHash = hash(seed - 1);
  let prevWeather = getWeather(rates, prevHash);

  for (let i = 0; res.length < count && i < 100000; ++i) {
    const currHash = hash(seed);
    const currWeather = getWeather(rates, currHash);
    res.push({
      zone: name,
      prevWeather,
      currWeather,
      weatherName: getWeatherName(currWeather),
      seed,
      date: new Date(seed * 1400000),
    });
    prevHash = currHash;
    prevWeather = currWeather;
    ++seed;
  }

  return res;
}

export default {
  WEATHER,
  ANEMOS_WEATHER,
  PAGOS_WEATHER,
  PYROS_WEATHER,
  HYDATOS_WEATHER,
  getWeather,
  forecast,
  getWeatherName,
};
