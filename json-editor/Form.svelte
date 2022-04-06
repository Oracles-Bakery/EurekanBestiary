<script>
  import { nanoid } from "nanoid";

  export let data;
  export let saveFn;
  export let isUpdate = false;

  let {
    level,
    name,
    id,
    element,
    change,
    area,
    accuracy,
    undead,
    sprite,
    drops,
    pos = [],
  } = data;
  let newPos = [];

  if (!id) {
    id = nanoid();
  }

  if (!level) {
    level = [0, 0];
  }

  function prepareChangeFields(evt) {
    if (evt.target.checked) {
      // prepare the necessary data structure for the checked key
      change = { type: "mutates", day: [], night: [] };
    } else {
      change = false;
    }
  }

  function addPos(evt) {
    evt.preventDefault();
    pos.push(newPos);
    pos = pos;
    newPos = [];
  }

  function save(evt) {
    evt.preventDefault();

    saveFn({
      name,
      level,
      id,
      element,
      change,
      area,
      undead,
      sprite,
      accuracy,
      pos,
    });

    if (!isUpdate) {
      level = [0, 0];
      name = undefined;
      id = nanoid();
      element = undefined;
      change = undefined;
      area = undefined;
      accuracy = undefined;
      undead = undefined;
      sprite = undefined;
      pos = [];
    }
  }
</script>

<form>
  <fieldset>
    <label for="name">Name</label>
    <input id="name" type="text" bind:value={name} />
  </fieldset>
  <fieldset>
    <label for="level">Level (from - to)</label>
    <input id="level" type="number" max="60" bind:value={level[0]} />
    <input id="levelTo" type="number" max="60" bind:value={level[1]} />
  </fieldset>
  <fieldset>
    <label for="element">Element</label>
    <select id="element" bind:value={element}>
      <option value="fire">Fire</option>
      <option value="water">Water</option>
      <option value="earth">Earth</option>
      <option value="lightning">Lightning</option>
      <option value="ice">Ice</option>
      <option value="wind">Wind</option>
    </select>
  </fieldset>
  <fieldset>
    <label for="area">Area</label>
    <select id="area" bind:value={area}>
      <option value="anemos">Anemos</option>
      <option value="pagos">Pagos</option>
      <option value="pyros">Pyros</option>
      <option value="hydatos">Hydatos</option>
    </select>
  </fieldset>
  <fieldset>
    <input
      id="change"
      type="checkbox"
      checked={!!change}
      on:click={prepareChangeFields}
    />
    <label for="change">Changes? (mutates/adapts)</label>
  </fieldset>
  {#if change}
    <fieldset>
      <label for="changeType">Change type</label>
      <select id="changeType" bind:value={change.type}>
        <option value="mutates">Mutates</option>
        <option value="adapts">Adapts</option>
      </select>
    </fieldset>
    <fieldset>
      <label for="changeElement">Element after change</label>
      <select id="changeElement" bind:value={change.element}>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="earth">Earth</option>
        <option value="lightning">Lightning</option>
        <option value="ice">Ice</option>
        <option value="wind">Wind</option>
      </select>
    </fieldset>
    <fieldset>
      <label for="changeDay">Change weathers DAY</label>
      <select multiple id="changeDay" bind:value={change.day}>
        <option value="0">Fair</option>
        <option value="1">Showers</option>
        <option value="2">Gales</option>
        <option value="3">Blizzards</option>
        <option value="4">Heat</option>
        <option value="5">Thunder</option>
        <option value="6">Gloom</option>
        <option value="7">Snow</option>
        <option value="8">Fog</option>
        <option value="9">Umbral Wind</option>
      </select>
    </fieldset>
    <fieldset>
      <label for="changeNight">Change weathers NIGHT</label>
      <select multiple id="changeNight" bind:value={change.night}>
        <option value="0">Fair</option>
        <option value="1">Showers</option>
        <option value="2">Gales</option>
        <option value="3">Blizzards</option>
        <option value="4">Heat</option>
        <option value="5">Thunder</option>
        <option value="6">Gloom</option>
        <option value="7">Snow</option>
        <option value="8">Fog</option>
        <option value="9">Umbral Wind</option>
      </select>
    </fieldset>
  {/if}
  <fieldset>
    <input id="undead" type="checkbox" bind:checked={undead} />
    <label for="undead">Is undead?</label>
  </fieldset>
  <fieldset>
    <input id="sprite" type="checkbox" bind:checked={sprite} />
    <label for="sprite">Is sprite?</label>
  </fieldset>
  <fieldset>
    <label for="drops">Drops something?</label>
    <input type="text" id="drops" bind:value={drops} />
  </fieldset>
  <fieldset>
    <label for="pos">Positions</label>
    <ul>
      {#each pos as p}
        <li>x{p[0]},y{p[1]}</li>
      {/each}
    </ul>
    <p>Add new:</p>
    <div style="display: flex;">
      <div>X</div>
      <input type="text" bind:value={newPos[0]} />
      <div>Y</div>
      <input type="text" bind:value={newPos[1]} />
    </div>
    <button on:click={addPos}>Add</button>
  </fieldset>
  <fieldset>
    <label for="accuracy">How sure are we?</label>
    <select id="accuracy" bind:value={accuracy}>
      <option value="0">Not sure at all</option>
      <option value="1">Reasonably sure</option>
      <option value="2">Very sure</option>
    </select>
  </fieldset>
  <button on:click={save}>Finish</button>
</form>
