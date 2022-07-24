<script>
  import Element from "./components/Element.svelte";
  import Icon from "./components/Icon.svelte";
  import Map from "./components/Map.svelte";
  import { revert } from "url-slug";
  import clsx from "clsx";
  import { getWeatherName, getZoneWeatherTypes, matchSpriteName } from "./ew";
  import { data } from "./stores";
  import { capitalize, findOffensiveElement, formatLevel } from "./util";

  export let meta;
  $: entry = $data.find((d) => {
    const { zone, slug } = meta.params;
    return (
      d.area === zone && revert(slug).toLowerCase() === d.name.toLowerCase()
    );
  });

  function doesChangeDuring(weather, dn) {
    return entry.change[dn].includes(String(weather));
  }
</script>

<div class="mt-15" />

{#if entry !== undefined}
  {#if entry.accuracy === "1"}
    <div class="alert mb-10" role="alert">
      <h4 class="alert-heading">Note</h4>
      Some details about this enemy have been confirmed, but there may be
      discrepancies
      between the catalogued state and how it behaves in the game. Corrections
      and
      further review may be required.
    </div>
  {/if}
  {#if entry.accuracy === "0"}
    <div class="alert alert-danger mb-10" role="alert">
      <h4 class="alert-heading">Caveat empor!</h4>
      Large parts of the information about this monster are missing. Any help in
      researching this monster's attributes is appreciated.
    </div>
  {/if}

  <div class="row">
    <div class="col-12 col-md-2">
      <Map {entry} />
    </div>
    <div class="col-12 col-md-8 px-15">
      <h1 class="font-size-34 font-weight-bolder">{entry.name}</h1>
      <div class="badge">
        Lv.{formatLevel(entry.level)}
      </div>
      <div class="badge">
        {capitalize(entry.area)}
      </div>
      {#if entry.undead}
        <div class="badge border-color-secondary">Undead</div>
      {/if}
      {#if entry.sprite}
        <div class="badge border-color-secondary">Sprite</div>
      {/if}
      {#if entry.change}
        <div class="badge badge-success">
          {capitalize(entry.change.type)}
        </div>
      {/if}

      <h4 class="font-size-20 font-weight-bold my-3">Spawning Conditions</h4>
      <div class="card flex justify-content-center py-10 px-0 m-0">
        <div class="flex align-items-center">
          {#if entry.undead}
            <Icon name="moon" extraClasses="mr-5" />
            Only spawns at night
          {/if}
          {#if entry.sprite}
            <div class="flex align-items-center flex-col">
              {#each matchSpriteName(entry.name) as weather}
                <div class="flex align-items-center">
                  <Icon
                    name={getWeatherName(weather).toLowerCase()}
                    extraClasses="mr-5"
                  />
                  Spawns during {getWeatherName(weather)}
                </div>
              {/each}
            </div>
          {/if}
          {#if !entry.sprite && !entry.undead}
            <Icon name="check" extraClasses="mr-5" />
            Spawns at all times
          {/if}
        </div>
      </div>

      <h4 class="font-size-20 font-weight-bold mt-10 mb-5">
        Mutation/Adaption Conditions
      </h4>
      {#if entry.change}
        {#if !entry.undead}
          <h5 class="font-size-18">Day</h5>
          <div class="card p-0 flex m-0">
            {#each getZoneWeatherTypes(entry.area) as weather}
              <div
                class={clsx("py-5 flex-grow-1 text-center", {
                  "bg-success text-dark": doesChangeDuring(weather, "day"),
                })}
              >
                <div class="flex justify-content-center">
                  <Icon name={getWeatherName(weather).toLowerCase()} />
                </div>
                {getWeatherName(weather)}
              </div>
            {/each}
          </div>
        {/if}
        <h5 class="font-size-18 mt-10">Night</h5>
        <div class="card p-0 flex m-0">
          {#each getZoneWeatherTypes(entry.area) as weather}
            <div
              class={clsx("py-5 flex-grow-1 text-center", {
                "bg-success text-dark": doesChangeDuring(weather, "night"),
              })}
            >
              <div class="flex justify-content-center">
                <Icon name={getWeatherName(weather).toLowerCase()} />
              </div>
              {getWeatherName(weather)}
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-muted">This monster does not change.</div>
      {/if}

      <h4 class="font-weight-bold font-size-20 mt-10">Permalink</h4>
      <code class="bg-gray monospace">{window.location}</code>
    </div>
    <div class="col-12 col-md-2">
      <h4 class="font-weight-bold flex align-items-center">
        <div class="mr-5">Element:</div>
        <Element name={entry.element} />
      </h4>
      <div class="flex align-items-center mt-5">
        <div class="mr-5">Offensive magia:</div>
        <Element name={findOffensiveElement(entry.element)} />
      </div>
      <div class="mt-5 flex align-items-center">
        <div class="mr-5">Defensive magia:</div>
        <Element name={entry.element} />
      </div>
    </div>
  </div>
{/if}
