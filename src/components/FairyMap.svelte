<script>
  export let zone;
  export let store;
  export let set;
  import { currentMarker } from "../stores";

  let mapWidth = 0;
  let scaledPos = [];

  function handleClick(evt) {
    if ($currentMarker) {
      set(unscale(evt.layerX), unscale(evt.layerY), $currentMarker, store.password);
    }
  }

  $: if (store?.fairies) {
    scaledPos = Object.values(store?.fairies).map(({ x, y, ...rest }) => {
      return { x: scale(Number(x)), y: scale(Number(y)), ...rest };
    });
  }
  console.log(scaledPos);

  function scale(point) {
    return (point / 42) * mapWidth;
  }

  function unscale(point) {
    return Math.floor((point * 42) / mapWidth * 10) / 10;
  }
</script>

<div bind:clientWidth={mapWidth} class="mx-20">
  <img on:click={handleClick}
       src={`/maps/${zone}.jpeg`}
       alt={`Map of Eureka ${zone}`} />
  {#each scaledPos as pos, i}
    <div style={`position: absolute; left: ${pos.x - 15}px; top: ${pos.y - 10}px;`}
         data-toggle="tooltip"
         data-title={`x${Object.values(store.fairies)[i].x}, y${Object.values(store.fairies)[i].y}`}
    >
      <img width={25}
           height={25}
           src={`/waymarks/${pos.marker}.png`}
           alt={`${pos.marker} marker`} />
    </div>
  {/each}
</div>

<style>
  div:hover {
    cursor: crosshair;
  }
</style>
