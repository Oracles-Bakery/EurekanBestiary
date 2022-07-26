<script>
  export let marker;
  import { currentMarker, usedMarkers } from "../stores";

  console.log($usedMarkers);
</script>

<div class="btn btn-square btn-lg flex-grow-1 h-50"
     class:active={$currentMarker === marker}
     class:disabled={$usedMarkers.includes(marker)}
     on:click={() => currentMarker.set(marker)}>
  <img class="m-auto"
       src={`/waymarks/${marker}.png`}
       alt={`${marker} marker`} />
</div>
