<script>
  import { customAlphabet } from "nanoid";
  import FairyMap from "./components/FairyMap.svelte";
  import FairySidebar from "./components/FairySidebar.svelte";
  import { makeFairyStore } from "./stores";

  export let meta;

  const idgen = customAlphabet("qwertyuiopasdfghjklzxcvbnm", 6);

  let id = meta?.params?.id;
  if (!id) {
    id = idgen();
    history.pushState(null, "", `/fairies/${id}`);
  }

  const store = makeFairyStore(id, meta?.query?.pwd);

  let pwd_field = "";

  function sendPassword() {
    store.auth(pwd_field);
  }
</script>

<div class="container-fluid">
  <div class="row">
    <div class="col-md-8">
      <FairyMap
        zone="anemos"
        store={$store}
        set={store.set}
      />
    </div>
    <div class="col-md-4">
      <FairySidebar store={$store} del={store.del} />
      <div class="card">
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

          {#if !$store.password}
            <p class="mt-10">Enter the tracker password to make changes:</p>
            <div class="input-group">
              <input type="text"
                     class="form-control"
                     bind:value={pwd_field} />
              <div class="input-group-append">
                <button class="btn btn-secondary"
                        on:click={() => sendPassword()}>
                  Send
                </button>
              </div>
            </div>
          {:else}
            <div class="mt-10">
              <strong>Password: </strong>
              <div class="badge">{$store.password}</div>
            </div>
            <div class="font-size-12 text-muted">
              Share this password to let other people control the tracker.
            </div>
          {/if}
        {:else}
          <div class="badge badge-pill badge-danger">Not connected!</div>
        {/if}
      </div>
    </div>
  </div>
</div>
