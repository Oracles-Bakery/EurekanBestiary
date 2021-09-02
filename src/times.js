import day from "dayjs";
import utc from "dayjs/plugin/utc";
day.extend(utc);

export function formatUtc(date) {
  return day.utc(date).format("HH:mm");
}

export function isNight() {
  const date = new Date().getTime() * (1440 / 70);
  const hour = day.utc(date).hour();
  return hour >= 18 || hour < 8;
}

export function getNextNight() {
  const date = new Date().getTime() * (1440 / 70);
  const setDate = day.utc(date).set("hour", 18);
  return day(setDate.toDate().getTime() / (1440 / 70));
}
