import day from "dayjs";
import utc from "dayjs/plugin/utc";

day.extend(utc);

export function capitalize(word) {
  return word.replace(/^\w/, (c) => c.toUpperCase());
}

export function formatUtc(date) {
  return day.utc(date).format("HH:mm");
}

export function formatLevel(level) {
  if (level[0] !== level[1]) {
    return `${level[0]}-${level[1]}`;
  }
  return level[0];
}

export function findOffensiveElement(element) {
  switch (element) {
    case "fire":
      return "wind";
    case "wind":
      return "ice";
    case "ice":
      return "fire";
    case "water":
      return "lightning";
    case "lightning":
      return "earth";
    case "earth":
      return "water";
  }
}
