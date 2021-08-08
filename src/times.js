import day from "dayjs";
import utc from "dayjs/plugin/utc";
day.extend(utc);

export function formatUtc(date) {
  return day.utc(date).format("HH:mm");
}
