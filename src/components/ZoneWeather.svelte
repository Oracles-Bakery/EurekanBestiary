<script type="text/javascript">
  import { weather } from "../stores";
  import { getWeatherName } from "../ew";
  import { capitalize } from "../util";
  import clsx from "clsx";
  import Icon from "./Icon.svelte";

  export let zone = "anemos";
  export let extraClasses = "";

  const classes = clsx("badge", {
    "badge-success": zone === "anemos",
    "badge-secondary": zone === "pagos",
    "badge-danger": zone === "pyros",
    "badge-primary": zone === "hydatos",
  });
  $: currWeather = $weather[zone][0].currWeather;
</script>

<div
  class={`badge-group ${extraClasses}`}
  role="group"
  aria-label={`Current weather in ${zone}`}
>
  <span class="badge">{capitalize(zone)}</span>
  <span class={classes}>
    <span class="inline-block align-middle">
      <Icon name={getWeatherName(currWeather).toLowerCase()} />
    </span>
    <span class="align-middle">{getWeatherName(currWeather)}</span>
  </span>
</div>
