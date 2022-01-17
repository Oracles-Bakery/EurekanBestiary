<script type="text/javascript">
  import { weather } from "../stores";
  import { getWeatherName } from "../ew";
  import { capitalize } from "../util";
  import clsx from "clsx";
  import Icon from "./Icon.svelte";

  export let zone = "anemos";

  const classes = clsx(
    [
      "lg:bg-gradient-to-r",
      "lg:px-6",
      "lg:py-2",
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
      "lg:text-black": zone === "pagos",
      "from-pink-600": zone === "pyros",
      "to-rose-600": zone === "pyros",
      "from-sky-600": zone === "hydatos",
      "to-blue-600": zone === "hydatos",
    },
  );
  $: currWeather = $weather[zone][0].currWeather;
</script>

<div class={classes}>
  <div class="lg:flex justify-center hidden">
    <Icon name={getWeatherName(currWeather).toLowerCase()}/>
  </div>
  <div class="text-center text-xs">
    <div class="block lg:hidden">{capitalize(zone)}:</div>
    {getWeatherName(currWeather)}
  </div>
</div>
