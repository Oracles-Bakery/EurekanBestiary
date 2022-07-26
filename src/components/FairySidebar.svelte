<script>
  export let store;
  export let acceptSuggestion;
  export let delSuggestion;
  export let del;

  import day from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import toPairs from "lodash.topairs";
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
  {#if !store.password}
    <div class="badge badge-secondary">Suggesting</div>
    <div class="font-size-12 text-muted mb-10">
      Because you don't have edit rights to
      this tracker, you can only make suggestions. You can only make one
      suggestion at a time.
    </div>
  {/if}
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

{#if Object.keys(store.suggestions).length > 0}
  <h4 class="font-size-22 font-weight-bold">Suggestions</h4>
  {#each toPairs(store.suggestions) as [name, suggestion]}
    <div class="content my-0 d-flex p-10 rounded justify-content-between">
      <div>
        <h4 class="d-flex gap-2 font-size-20 font-weight-bold">
          Fairy {getMarkerName(suggestion.marker)}
        </h4>
        x{suggestion.x}, y{suggestion.y}
        <br />
        <div class="text-muted">
          Suggested {day(Number(suggestion.timestamp)).fromNow()}
        </div>
      </div>
      <div>
        {#if store.password}
          <div class="btn-group">
            <button class="btn btn-success"
                    on:click={() => acceptSuggestion(name, store.password)}>
              <Icon name="check" extraClasses="d-inline-block" />
            </button>
            <button class="btn btn-danger"
                    on:click={() => delSuggestion(name, store.password)}>
              <Icon name="trash" extraClasses="d-inline-block" />
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/each}
{/if}

<style>
  .content {
    transition: background-color .3s;
  }

  .content:hover {
    background-color: #191c20;
  }
</style>
