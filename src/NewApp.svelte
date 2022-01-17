<script>
  import { Route } from "tinro";
  import Entry from "./Entry.svelte";
  import { time, weather } from "./stores.js";
  import Tracker from "./Tracker.svelte";
  import ZoneWeather from "./components/ZoneWeather.svelte";
  import day from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import ZoneForecast from "./components/ZoneForecast.svelte";
  import { formatUtc } from "./util";

  day.extend(relativeTime);

  const VERSION = "2.0.0";
  $: ezTime = formatUtc($time);
</script>

<div class="bg-white">
  <header class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 bg-gray-800 lg:drop-shadow-md">
    <div class="relative flex items-center justify-between h-16">
      <div class="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
        <div class="flex-shrink-0 flex items-center">
          <img src="/logoicon.png" alt="logo icon" class="h-12 w-auto"/>
        </div>
        <a href="/" class="text-white px-3 py-2 text-sm font-bold text-xl">Eurekan Bestiary</a>
      </div>
      <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
        <ZoneWeather zone="anemos"/>
        <ZoneWeather zone="pagos"/>
        <ZoneWeather zone="pyros"/>
        <ZoneWeather zone="hydatos"/>
        <div class="font-bold text-white ml-4 text-center">
          {ezTime}
          <div class="text-sm font-normal">
            change in {day($weather["anemos"][1].date).fromNow()}
          </div>
        </div>
      </div>
    </div>
  </header>
  <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
    <Route path="/">
      <Tracker/>
    </Route>
    <Route path="/:zone/:slug" let:meta>
      <Entry meta={meta}/>
    </Route>
  </div>
  <footer>
    <hr class="border-gray-300"/>
    <div class="px-2 py-2 sm:px-6 lg:px-16 text-gray-500">
      <ZoneForecast zone="anemos"/>
      <ZoneForecast zone="pagos"/>
      <ZoneForecast zone="pyros"/>
      <ZoneForecast zone="hydatos"/>
      <div class="mt-2">
        Created by Raiah Belse (Zodiark).<br/>
        <a href="https://codeberg.org/mokou/eurekan-bestiary" class="underline text-blue-600">Website Source</a>
        &bull; Version {VERSION}
      </div>
    </div>
  </footer>
</div>
