<script>
  export let store;

  let customCmd;

  import { getMarkerName } from "../util";

  const copyText = (cmd) => async () => {
    const fairies = Object.values(store.fairies)
      .map(fairy => (`Fairy ${getMarkerName(fairy.marker)} x${fairy.x}, y${fairy.y}`));

    await navigator.clipboard.writeText(`/${cmd} ELEMENTALS: ${fairies.join(" | ")}`);
    customCmd = null;
  };
</script>

<div class="card p-20">
  <h4 class="font-size-20 font-weight-bold mb-10">Copy macro</h4>

  <div class="form-row row-eq-spacing">
    <div class="col-6">
      <button class="btn btn-sm btn-block" on:click={copyText("sh")}>Copy
        shout
      </button>
    </div>
    <div class="col-6">
      <button class="btn btn-sm btn-block" on:click={copyText("p")}>Copy party
      </button>
    </div>
  </div>

  <div class="form-inline">
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text">Custom</span>
      </div>
      <input class="form-control "
             type="text"
             id="custom"
             placeholder="cwls1, ls4, y, etc..."
             bind:value={customCmd} />
    </div>
    <button class="btn btn-sm" on:click={copyText(customCmd)}>Copy</button>
  </div>
</div>
