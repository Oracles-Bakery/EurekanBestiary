<script>
  export let meta;
  import { customAlphabet } from "nanoid";
  import OvniTracker from "./components/OvniTracker.svelte";
  import { makeOvniStore, time } from "./stores";

  const idgen = customAlphabet("qwertyuiopasdfghjklzxcvbnm", 6);

  let id = meta.params.id;
  if (!id) {
    id = idgen();
    history.pushState(null, "", `/ovnitimer/${id}`);
  }

  const store = makeOvniStore(id, meta.query.pwd);

  let pwd_field = "";
  $: curTime = $time / (1440 / 70);

  function sendPassword() {
    store.auth(pwd_field);
  }
</script>

<div class="row mt-10">
  <div class="col-3 m-0 mr-20 card">
    {#if $store.conn}
      <div class="badge badge-pill badge-success">Connected!</div>

      <p class="mt-10">
        Your state is synchronized with anyone else who has this URL.
      </p>

      <p class="mt-10">
        <strong>Share:</strong>
        <input
          type="text"
          class="form-control"
          readonly
          value={`https://ovni.cool/${id}`}
        />
      </p>

      {#if !$store.pwd}
        <p class="mt-10">Enter the tracker password to make changes:</p>
        <div class="input-group">
          <input type="text" class="form-control" bind:value={pwd_field} />
          <div class="input-group-append">
            <button class="btn btn-secondary" on:click={() => sendPassword()}>
              Send
            </button>
          </div>
        </div>
      {:else}
        <div class="mt-10">
          <strong>Password: </strong>
          <div class="badge">{$store.pwd}</div>
        </div>
        <div class="font-size-12 text-muted">
          Share this password to let other people control the tracker.
        </div>
      {/if}
    {:else}
      <div class="badge badge-pill badge-danger">Not connected!</div>
    {/if}
  </div>
  <OvniTracker {store} {curTime} />
</div>
