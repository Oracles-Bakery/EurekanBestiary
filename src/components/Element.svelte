<script>
  import clsx from "clsx";
  import { capitalize } from "../util";

  export let name = "";

  const classes = clsx("border rounded-2xl px-3 py-1 inline-block font-bold text-md", {
    "bg-red-600": name === "fire",
    "bg-blue-600": name === "water",
    "bg-yellow-800": name === "earth",
    "bg-purple-600": name === "lightning",
    "bg-sky-400": name === "ice",
    "bg-lime-600": name === "wind",
    "text-gray-100": true,
  });
</script>

<div class={classes}>
  {capitalize(name)}
</div>

