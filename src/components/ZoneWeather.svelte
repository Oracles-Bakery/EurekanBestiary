<script type="text/javascript">
  import { weather } from "../stores";
  import { getWeatherName } from "../ew";
  import { capitalize } from "../util";
  import clsx from "clsx";
  import Icon from "./Icon.svelte";

  export let zone;

  const classes = clsx(
    [
      "bg-gradient-to-r",
      "px-6",
      "py-2",
      "border-white",
      "text-white",
      "rounded",
      "font-bold",
      "ml-2",
    ],
    {
      "from-green-600": zone === "anemos",
      "to-lime-600": zone === "anemos",
      "from-teal-300": zone === "pagos",
      "to-cyan-300": zone === "pagos",
      "text-black": zone === "pagos",
      "from-pink-600": zone === "pyros",
      "to-rose-600": zone === "pyros",
      "from-sky-600": zone === "hydatos",
      "to-blue-600": zone === "hydatos",
    }
  );
  $: currWeather = $weather[zone][0].currWeather;
</script>

<div class={classes}>
  <div class="flex justify-center">
    <Icon name={getWeatherName(currWeather).toLowerCase()}/>
  </div>
  <div class="text-center text-xs">
    {getWeatherName(currWeather)}
  </div>
</div>
