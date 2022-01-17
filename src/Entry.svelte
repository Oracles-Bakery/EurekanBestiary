<script>
  import Element from "./components/Element.svelte";
  import Icon from "./components/Icon.svelte";
  import { revert } from "url-slug";
  import { getWeatherName, getZoneWeatherTypes, matchSpriteName } from "./ew";
  import { data } from "./stores";
  import { capitalize, findOffensiveElement, formatLevel } from "./util";

  export let meta;
  $: entry = $data.find(d => {
    const {zone, slug} = meta.params;
    return d.area === zone && revert(slug).toLowerCase() === d.name.toLowerCase();
  });

  function doesChangeDuring(weather, dn) {
    return entry.change[dn].includes(String(weather));
  }
</script>

{#if entry !== undefined}
  <div class="grid grid-cols-1 lg:grid-cols-5">
    <div class="col-span-1">
      <i>Placeholder for an image.</i>
    </div>
    <div class="col-span-3 lg:px-7">
      <h1 class="font-extrabold text-5xl my-2">{entry.name}</h1>
      <div class="rounded-2xl font-medium text-sm inline-block px-2 py-1 border border-gray-300">
        Lv.{formatLevel(entry.level)}</div>
      <div class="rounded-2xl font-medium text-sm inline-block px-2 py-1 border border-gray-300">{capitalize(entry.area)}</div>
      {#if entry.undead}
        <div class="rounded-2xl font-medium text-sm inline-block px-2 py-1 bg-red-200 text-red-700">Undead
        </div>
      {/if}
      {#if entry.sprite}
        <div class="rounded-2xl font-medium text-sm inline-block px-2 py-1 bg-blue-200 font-bold text-blue-700">Sprite
        </div>
      {/if}
      {#if entry.change}
        <div class="rounded-2xl font-medium text-sm inline-block px-2 py-1 bg-green-200 font-bold text-green-700">
          {capitalize(entry.change.type)}
        </div>
      {/if}

      <h4 class="font-bold mt-3">Spawning Conditions</h4>
      <div class="flex items-center p-2 gap-1 mt-2 border border-green-500 shadow-lg justify-center">
        {#if entry.undead}
          <Icon name="moon"/>
          Only spawns at night
        {/if}
        {#if entry.sprite}
          <div class="flex items-center flex-col">
            {#each matchSpriteName(entry.name) as weather}
              <div class="flex items-center gap-2">
                <Icon name={getWeatherName(weather).toLowerCase()}/>
                Spawns during {getWeatherName(weather)}
              </div>
            {/each}
          </div>
        {/if}
        {#if !entry.sprite && !entry.undead}
          <Icon name="check"/>
          Spawns at all times
        {/if}
      </div>

      <h4 class="font-bold mt-4">Mutation/Augmentation Conditions</h4>
      {#if entry.change}
        {#if !entry.undead}
          <div class="flex mt-2 border border-amber-500 justify-between items-center">
            {#each getZoneWeatherTypes(entry.area) as weather}
              <div class="py-2 grow text-center px-1 lg:px-3 h-full"
                   class:bg-green-300={doesChangeDuring(weather, "day")}>
                <div class="flex justify-center">
                  <Icon name={getWeatherName(weather).toLowerCase()}/>
                </div>
                {getWeatherName(weather)}
              </div>
            {/each}
          </div>
        {/if}
        <div class="flex mt-2 border border-blue-500 justify-between items-center">
          {#each getZoneWeatherTypes(entry.area) as weather}
            <div class="py-2 grow text-center px-1 lg:px-3 h-full"
                 class:bg-green-300={doesChangeDuring(weather, "night")}>
              <div class="flex justify-center">
                <Icon name={getWeatherName(weather).toLowerCase()}/>
              </div>
              {getWeatherName(weather)}
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-gray-700 italic">This monster does not change.</div>
      {/if}

      <h4 class="font-bold mt-4">Permalink</h4>
      <code class="bg-gray-200 px-2 py-1">{window.location}</code>
    </div>
    <div>
      <h4 class="font-bold mt-3 lg:mt-0">Element:
        <Element name={entry.element}/>
      </h4>
      <p class="mt-2">
        Offensive magia:
        <Element name={findOffensiveElement(entry.element)}/>
      </p>
      <p class="mt-2">
        Defensive magia:
        <Element name={entry.element}/>
      </p>

      <h4 class="font-bold mt-4">Accuracy</h4>
      <div class="rounded-2xl px-3 py-1 mt-1 font-bold text-center bg-black text-white">
        {#if entry.accuracy === "2"}Very Sure{/if}
        {#if entry.accuracy === "1"}Mostly Sure{/if}
        {#if entry.accuracy === "0"}Unsure{/if}
      </div>

      <p class="text-sm mt-2">
        {#if entry.accuracy === "2"}
          This monster's details have been thoroughly reviewed and confirmed.
        {/if}
        {#if entry.accuracy === "1"}
          Some details have been confirmed, but there may be discrepancies between the catalogued state and how it
          behaves in the game. Corrections and further review may be required.
        {/if}
        {#if entry.accuracy === "0"}
          Large parts of the information about this monster are missing. Any help is appreciated.
        {/if}
      </p>
    </div>
  </div>
{/if}
