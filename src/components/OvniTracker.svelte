<script>
  export let store;
  export let curTime;
  import day from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import updateLocale from "dayjs/plugin/updateLocale";
  import utc from "dayjs/plugin/utc";
  day.extend(updateLocale);
  day.extend(utc);
  day.extend(relativeTime);

  const states = {
    ASLEEP: "Asleep",
    SPAWNED: "Spawned",
    KILLED: "Killed",
    BLUE_SPAWNED: "BluePortals",
    RED_SPAWNED: "RedPortals",
    COOLDOWN: "Cooldown",
  };
  let isIndeterminate = false;
  let timeout = null;
  $: isTimeInTitle =
    $store.log[0] &&
    ($store.log[0][0] === states.BLUE_SPAWNED ||
      $store.log[0][0] === states.RED_SPAWNED ||
      $store.log[0][0] === states.COOLDOWN ||
      $store.log[0][0] === states.KILLED);
  $: {
    if ($store.log[0]) {
      document.title = `${getTitleText($store.log[0][0])} ${
        isTimeInTitle ? minDiff(curTime) : ""
      }`;
    }
  }

  function logState(newState) {
    const time = day();
    store.unshift([newState, time], $store.pwd);
    isIndeterminate = false;
    clearTimeout(timeout);
    switchIfNeeded(newState);
  }

  function logIndeterminate(newState) {
    const time = day();
    store.unshift([newState, time], $store.pwd);
    isIndeterminate = true;
    switchIfNeeded(newState);
  }

  function minDiff(time) {
    let plusMins;
    switch ($store.log[0][0]) {
      case states.KILLED:
      case states.BLUE_SPAWNED:
        plusMins = 3;
        break;
      case states.RED_SPAWNED:
        plusMins = 4;
        break;
      case states.COOLDOWN:
        plusMins = 20;
        break;
    }

    const plusTime = $store.log[0][1].add(plusMins, "minutes");
    const secs = plusTime.diff(day(time), "s");
    const mins = Math.floor(secs / 60);
    return `${String(mins).padStart(2, "0")}:${String(
      secs - mins * 60
    ).padStart(2, "0")}`;
  }

  function switchIfNeeded(newState) {
    switch (newState) {
      case states.BLUE_SPAWNED:
        isTimeInTitle = true;
        switchIn(states.RED_SPAWNED, 3);
        break;
      case states.RED_SPAWNED:
        isTimeInTitle = true;
        switchIn(states.COOLDOWN, 4);
        break;
      case states.KILLED:
        isTimeInTitle = true;
        switchIn(states.BLUE_SPAWNED, 3);
        break;
      case states.COOLDOWN:
        isTimeInTitle = true;
        switchIn(states.SPAWNED, 20);
        break;
      default:
        isTimeInTitle = false;
        break;
    }
  }

  function getStateText(state) {
    switch (state) {
      case states.BLUE_SPAWNED:
        return "Blue portals spawned!";
      case states.RED_SPAWNED:
        return "Red portals spawned!";
      case states.COOLDOWN:
        return "The weather returned to normal.";
      case states.KILLED:
        return "Ovni has been defeated!";
      case states.SPAWNED:
        return "Ovni has spawned!";
      default:
        return "Ovni Timer - Eurekan Bestiary";
    }
  }

  function getTitleText(state) {
    switch (state) {
      case states.BLUE_SPAWNED:
        return "Red portals spawn in";
      case states.RED_SPAWNED:
        return "Ovni weather ends in";
      case states.COOLDOWN:
        return "Ovni spawns in";
      case states.KILLED:
        return "Blue portals spawn in";
      case states.SPAWNED:
        return "Ovni is up!";
    }
  }

  function switchIn(newState, time) {
    timeout = setTimeout(() => {
      console.log("timeout pop");
      logState(newState);
    }, time * 60 * 1000);
  }
</script>

<div class="col">
  {#if isIndeterminate}
    <div
      class="badge badge-secondary"
      data-toggle="tooltip"
      data-placement="bottom"
      data-title="The tracker isn't sure when the last event happened, so you can progress to the next phase at any time."
    >
      Indeterminate mode
    </div>
  {/if}
  {#if !$store.log[0]}
    <div class="font-size-34">Ovni is currently <strong>asleep</strong>!</div>
    {#if $store.pwd}
      <p>
        The tracker doesn't know when Ovni last spawned! You'll need to put it
        in manually.
      </p>

      <div class="mt-10">
        What's currently happening in the instance?
        <div class="flex justify-content-center mt-5">
          <button
            class="btn flex-fill mx-2"
            on:click={() => logState(states.SPAWNED, "Ovni has spawned!")}
          >
            Ovni is up!
          </button>
          <button
            class="btn flex-fill mx-2"
            on:click={() =>
              logIndeterminate(
                states.BLUE_SPAWNED,
                "Blue portals have spawned!"
              )}
          >
            I see blue portals!
          </button>
          <button
            class="btn flex-fill mx-2"
            on:click={() =>
              logIndeterminate(states.RED_SPAWNED, "Red portals have spawned!")}
          >
            I see red portals!
          </button>
        </div>
        <div class="mt-5">
          If none of those things are true, but it's still Umbral Turbulence,
          wait until blue portals have spawned or the weather changes back, in
          which case you can use the following button:
          <button
            class="btn btn-block mt-5"
            on:click={() =>
              logState(states.COOLDOWN, "The weather has returned to normal.")}
          >
            The weather has returned to normal.
          </button>
        </div>
      </div>
    {:else}
      <p>
        The tracker doesn't know when Ovni last spawned. To update this tracker,
        please enter the password.
      </p>
      <p class="text-muted mt-10">
        Do you want to <a href="/ovnitimer">open a new tracker?</a>
      </p>
    {/if}
  {/if}
  {#if $store.log[0] && $store.log[0][0] === states.SPAWNED}
    <div class="font-size-34">Ovni is currently <strong>up</strong>!</div>
    <p>The next Ovni will spawn in at least 20 minutes.</p>
  {/if}
  {#if $store.log[0] && $store.log[0][0] === states.COOLDOWN}
    <div class="font-size-34">
      The next Ovni will spawn in
      <strong>{minDiff(curTime)}</strong>.
    </div>
  {/if}
  {#if $store.log[0] && $store.log[0][0] === states.KILLED}
    <div class="font-size-34">
      Blue portals will spawn in <strong>{minDiff(curTime)}</strong>.
    </div>

    <p>
      These portals can only be accessed if you have the <em>Ovni FATE buff</em>
      and an <em>Aetheric Stabilizer</em>.
    </p>
    <p>
      Ovni will respawn in approximately {$store.log[0][1]
        .add(30, "minutes")
        .from(day(curTime), true)}.
    </p>
  {/if}
  {#if $store.log[0] && $store.log[0][0] === states.BLUE_SPAWNED}
    <div class="font-size-34">
      Red portals will spawn in <strong>{minDiff(curTime)}</strong>.
    </div>

    <p>
      These portals can only be accessed if you have the
      <em>Ovni FATE buff</em>. You do not need a stabilizer.
    </p>
    <p>
      Ovni will respawn in approximately {$store.log[0][1]
        .add(27, "minutes")
        .from(day(curTime), true)}.
    </p>
  {/if}
  {#if $store.log[0] && $store.log[0][0] === states.RED_SPAWNED}
    <div class="font-size-34">
      Red portals will be up for <strong>{minDiff(curTime)}</strong>.
    </div>

    <p>After this time, the Ovni FATE buff will expire.</p>
    <p>
      Ovni will respawn in approximately {$store.log[0][1]
        .add(24, "minutes")
        .from(day(curTime), true)}.
    </p>
  {/if}

  {#if $store.log.length > 0}
    <h2 class="font-size-20 mt-15">Log</h2>
    <ul style="list-style: inside;">
      {#each $store.log as entry}
        <li class="m-0">
          {getStateText(entry[0])}
          <span class="text-muted"
            >{day(entry[1]).utc().format("HH:mm ST")}</span
          >
        </li>
      {/each}
    </ul>
  {/if}
</div>
{#if $store.pwd}
  <div class="col-3 mt-5 ml-10 p-10">
    {#if !$store.log[0]}
      <button
        class="btn btn-success btn-block btn-lg"
        on:click={() => logState(states.SPAWNED, "Ovni has spawned!")}
      >
        Ovni has spawned!
      </button>
    {/if}
    {#if $store.log[0] && $store.log[0][0] === states.SPAWNED}
      <button
        class="btn btn-secondary btn-block btn-lg"
        on:click={() => logState(states.KILLED, "Ovni has been defeated!")}
      >
        Ovni has been defeated!
      </button>
      <button
        class="btn btn-block btn-lg mt-5"
        on:click={() => logState(states.COOLDOWN, "Ovni despawned...")}
      >
        Ovni despawned...
      </button>
    {/if}
    {#if $store.log[0] && $store.log[0][0] === states.COOLDOWN}
      <button
        disabled={day(curTime).isBefore($store.log[0][1].add(18, "minutes"))}
        class="btn btn-success btn-block btn-lg"
        on:click={() => logState(states.SPAWNED, "Ovni has spawned!")}
      >
        Ovni has spawned!
      </button>
    {/if}
    {#if $store.log[0] && $store.log[0][0] === states.KILLED}
      <button
        disabled={day(curTime).isBefore($store.log[0][1].add(1, "minutes"))}
        class="btn btn-primary btn-block btn-lg"
        on:click={() =>
          logState(states.BLUE_SPAWNED, "Blue portals have spawned!")}
      >
        Blue portals have spawned!
      </button>
    {/if}
    {#if $store.log[0] && $store.log[0][0] === states.BLUE_SPAWNED}
      <button
        disabled={!isIndeterminate &&
          day(curTime).isBefore($store.log[0][1].add(1, "minutes"))}
        class="btn btn-danger btn-block btn-lg"
        on:click={() =>
          logState(states.RED_SPAWNED, "Red portals have spawned!")}
      >
        Red portals have spawned!
      </button>
    {/if}
    {#if $store.log[0] && $store.log[0][0] === states.RED_SPAWNED}
      <button
        disabled={!isIndeterminate &&
          day(curTime).isBefore($store.log[0][1].add(2, "minutes"))}
        class="btn btn-success btn-block btn-lg"
        on:click={() =>
          logState(states.COOLDOWN, "The weather has returned to normal.")}
      >
        The weather has returned to normal.
      </button>
    {/if}
  </div>
{/if}
