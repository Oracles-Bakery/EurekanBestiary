<script>
  export let entry;

  const { area, pos } = entry;
  let scaledPos = pos || [];
  let mapWidth = 0;

  $: if (pos && mapWidth != 0) {
    scaledPos = pos.map(([x, y]) => [
      scale(Number(x), mapWidth),
      scale(Number(y), mapWidth),
    ]);
  }

  function scale(point, width) {
    return (point / 42) * width;
  }
</script>

{#if pos}
  <div bind:clientWidth={mapWidth}>
    <img src={`/maps/${area}.jpeg`} alt="Map of the area" />
    {#each scaledPos as p, i}
      <div
        style={`position: absolute; left: ${p[0] - 5}px; top: ${p[1] - 10}px;`}
        data-toggle="tooltip"
        data-title={`x${pos[i][0]} y${pos[i][1]}`}
      >
        <img
          width="10"
          height="10"
          style="padding-top: -5px; padding-left: -5px;"
          src="/pin.png"
          alt={`Location of the enemy at x${pos[i][0]}, y${pos[i][1]}`}
        />
      </div>
    {/each}
  </div>
{:else}
  <img
    src={`/maps/${area}.jpeg`}
    alt="Map of the area"
    style="filter: grayscale(100%);"
  />
  <div class="text-center">No known locations :(</div>
{/if}
