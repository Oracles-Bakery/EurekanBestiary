<script type="text/javascript">
  import Form from "./Form.svelte";
  let inputShown = true;
  let outputShown = false;
  let inJson = "";
  let json = [];
  let newFormShown = false;
  let editing = [];
  $: formattedJson = JSON.stringify(json);

  function submitInput() {
    inputShown = false;
    json = JSON.parse(inJson);
  }

  function toggleOutput() {
    outputShown = !outputShown;
  }

  function toggleNewForm() {
    newFormShown = !newFormShown;
  }

  function addToList(data) {
    json = [...json, data];
  }

  const updateListElement = (index) => (data) => {
    json[index] = data;
    json = json;
    toggleEdit(index)();
  };

  const del = (index) => () => {
    json.splice(index, 1);
    json = json;
  };

  const toggleEdit = (index) => () => {
    if (editing.includes(index)) {
      editing.splice(editing.indexOf(index), 1);
      editing = editing;
    } else {
      editing = [...editing, index];
    }
  };
</script>

{#if inputShown}
  <h3>Paste existing JSON here</h3>

  <fieldset>
    <textarea bind:value={inJson} rows="20" cols="40" />
  </fieldset>

  <button on:click={submitInput}>Submit</button>
{:else}
  <button on:click={toggleOutput}>show/hide json export</button>
  {#if outputShown}
    <textarea disabled rows="20" cols="40">{formattedJson}</textarea>
  {/if}
  <ul>
    {#each json as entry, i (entry.id)}
      <li>
        <h4>{entry.name}</h4>
        <p>
          Lv. {entry.level[0]}-{entry.level[1]}, {entry.area}
        </p>
        <button on:click={toggleEdit(i)}>edit</button>
        <button on:click={del(i)}>delete</button>
        {#if editing.includes(i)}
          <Form data={entry} saveFn={updateListElement(i)} isUpdate={true} />
        {/if}
      </li>
    {/each}
  </ul>

  <button on:click={toggleNewForm}>add new</button>
  {#if newFormShown}
    <Form data={{}} saveFn={addToList} />
  {/if}
{/if}
