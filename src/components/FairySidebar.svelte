<script>
  export let store;
  export let del;

  import day from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import Icon from "./Icon.svelte";

  day.extend(relativeTime);
  import MarkerButton from "./MarkerButton.svelte";

  function getMarkerName(marker) {
    switch (marker) {
      case "one":
        return "1";
      case "two":
        return "2";
      case "three":
        return "3";
      case "four":
        return "4";
      case "lettera":
        return "A";
      case "letterb":
        return "B";
      case "letterc":
        return "C";
      case "letterd":
        return "D";
    }
  }
</script>

<div class="card my-0 mb-10">
  <div class="d-flex justify-content-between gap-3">
    <MarkerButton marker="one" />
    <MarkerButton marker="two" />
    <MarkerButton marker="three" />
    <MarkerButton marker="four" />
  </div>
  <div class="d-flex justify-content-between gap-3 mt-10">
    <MarkerButton marker="lettera" />
    <MarkerButton marker="letterb" />
    <MarkerButton marker="letterc" />
    <MarkerButton marker="letterd" />
  </div>
</div>

{#each Object.values(store.fairies) as fairy}
  <div class="content my-0 d-flex p-10 rounded justify-content-between">
    <div>
      <h4 class="d-flex gap-2 font-size-20 font-weight-bold">
        <img src="/fairy.png"
             width={23}
             alt="A Eurekan elemental" />
        Fairy {getMarkerName(fairy.marker)}
      </h4>
      x{fairy.x}, y{fairy.y}
      <br />
      <div class="text-muted">
        Discovered {day(Number(fairy.timestamp)).fromNow()}
      </div>
    </div>
    <div>
      {#if store.password}
        <button class="btn"
                on:click={() => del(fairy.marker, store.password)}>
          <Icon name="trash" />
        </button>
      {/if}
    </div>
  </div>
{/each}

<style>
  .content {
    transition: background-color .3s;
  }

  .content:hover {
    background-color: #191c20;
  }
</style>
