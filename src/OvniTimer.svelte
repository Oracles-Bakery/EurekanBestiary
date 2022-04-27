<script>
  import day from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import updateLocale from "dayjs/plugin/updateLocale";
  import utc from "dayjs/plugin/utc";
  day.extend(updateLocale);
  day.extend(utc);
  day.extend(relativeTime, {
    thresholds: [
      { l: "s", r: 1, d: "second" },
      { l: "m", r: 1 },
      { l: "mm", r: 59, d: "minute" },
      { l: "h", r: 1 },
      { l: "hh", r: 23, d: "hour" },
      { l: "d", r: 1 },
      { l: "dd", r: 29, d: "day" },
      { l: "M", r: 1 },
      { l: "MM", r: 11, d: "month" },
      { l: "y" },
      { l: "yy", d: "year" },
      { l: "ss", r: 59, d: "seconds" },
    ],
  });
  day.updateLocale("en", {
    relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "%d seconds",
      m: "a minute",
      mm: "%d minutes",
      h: "an hour",
      hh: "%d hours",
      d: "a day",
      dd: "%d days",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years",
    },
  });
  import { time } from "./stores";

  const states = {
    ASLEEP: 0,
    SPAWNED: 1,
    KILLED: 2,
    BLUE_SPAWNED: 3,
    RED_SPAWNED: 4,
    COOLDOWN: 5,
  };
  let cur = states.ASLEEP;
  let log = [];
  let isIndeterminate = false;
  $: curTime = $time / (1440 / 70);

  function logState(newState, logText) {
    const time = day();
    log.unshift([logText, time]);
    log = log;
    cur = newState;
    isIndeterminate = false;
    switchIfNeeded(newState);
  }

  function logIndeterminate(newState, logText) {
    const time = day();
    log.unshift([`(?) ${logText}`, time]);
    log = log;
    cur = newState;
    isIndeterminate = true;
    switchIfNeeded(newState);
  }

  function minDiff(minutes, time) {
    const plusTime = log[0][1].add(minutes, "minutes");
    const secs = plusTime.diff(day(time), "s");
    const mins = Math.floor(secs / 60);
    return `${String(mins).padStart(2, "0")}:${String(
      secs - mins * 60
    ).padStart(2, "0")}`;
  }

  function switchIfNeeded(newState) {
    switch (newState) {
      case states.BLUE_SPAWNED:
        switchIn(states.RED_SPAWNED, "Red portals have spawned!", 3);
        break;
      case states.RED_SPAWNED:
        switchIn(states.COOLDOWN, "The weather has returned to normal.", 4);
        break;
      case states.KILLED:
        switchIn(states.BLUE_SPAWNED, "Blue portals have spawned!", 3);
        break;
      case states.COOLDOWN:
        switchIn(states.SPAWNED, "Ovni has spawned!", 20);
        break;
    }
  }

  function switchIn(newState, logText, time) {
    setTimeout(() => {
      logState(newState, logText);
    }, time * 60 * 1000);
  }
</script>

<div class="row mt-10">
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
    {#if cur === states.ASLEEP}
      <div class="font-size-34">Ovni is currently <strong>asleep</strong>!</div>
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
    {/if}
    {#if cur === states.SPAWNED}
      <div class="font-size-34">Ovni is currently <strong>up</strong>!</div>
      <p>The next Ovni will spawn in at least 20 minutes.</p>
    {/if}
    {#if cur === states.COOLDOWN}
      <div class="font-size-34">
        The next Ovni will spawn in
        <strong>{minDiff(20, curTime)}</strong>.
      </div>
    {/if}
    {#if cur === states.KILLED}
      <div class="font-size-34">
        Blue portals will spawn in <strong>{minDiff(3, curTime)}</strong>.
      </div>

      <p>
        These portals can only be accessed if you have the <em
          >Ovni FATE buff</em
        >
        and an <em>Aetheric Stabilizer</em>.
      </p>
      <p>
        Ovni will respawn in approximately {log[0][1]
          .add(30, "minutes")
          .from(day(curTime), true)}.
      </p>
    {/if}
    {#if cur === states.BLUE_SPAWNED}
      <div class="font-size-34">
        Red portals will spawn in <strong>{minDiff(3, curTime)}</strong>.
      </div>

      <p>
        These portals can only be accessed if you have the
        <em>Ovni FATE buff</em>. You do not need a stabilizer.
      </p>
      <p>
        Ovni will respawn in approximately {log[0][1]
          .add(27, "minutes")
          .from(day(curTime), true)}.
      </p>
    {/if}
    {#if cur === states.RED_SPAWNED}
      <div class="font-size-34">
        Red portals will be up for <strong>{minDiff(4, curTime)}</strong>.
      </div>

      <p>After this time, the Ovni FATE buff will expire.</p>
      <p>
        Ovni will respawn in approximately {log[0][1]
          .add(24, "minutes")
          .from(day(curTime), true)}.
      </p>
    {/if}

    {#if log.length > 0}
      <h2 class="font-size-20 mt-15">Log</h2>
      <ul style="list-style: inside;">
        {#each log as entry}
          <li class="m-0">
            {entry[0]}
            <span class="text-muted"
              >{day(entry[1]).utc().format("HH:mm ST")}</span
            >
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  <div class="col mt-5">
    {#if cur === states.ASLEEP}
      <button
        class="btn btn-success btn-block btn-lg"
        on:click={() => logState(states.SPAWNED, "Ovni has spawned!")}
      >
        Ovni has spawned!
      </button>
    {/if}
    {#if cur === states.SPAWNED}
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
    {#if cur === states.COOLDOWN}
      <button
        disabled={day(curTime).isBefore(log[0][1].add(18, "minutes"))}
        class="btn btn-success btn-block btn-lg"
        on:click={() => logState(states.SPAWNED, "Ovni has spawned!")}
      >
        Ovni has spawned!
      </button>
    {/if}
    {#if cur === states.KILLED}
      <button
        disabled={day(curTime).isBefore(log[0][1].add(1, "minutes"))}
        class="btn btn-primary btn-block btn-lg"
        on:click={() =>
          logState(states.BLUE_SPAWNED, "Blue portals have spawned!")}
      >
        Blue portals have spawned!
      </button>
    {/if}
    {#if cur === states.BLUE_SPAWNED}
      <button
        disabled={!isIndeterminate &&
          day(curTime).isBefore(log[0][1].add(1, "minutes"))}
        class="btn btn-danger btn-block btn-lg"
        on:click={() =>
          logState(states.RED_SPAWNED, "Red portals have spawned!")}
      >
        Red portals have spawned!
      </button>
    {/if}
    {#if cur === states.RED_SPAWNED}
      <button
        disabled={!isIndeterminate &&
          day(curTime).isBefore(log[0][1].add(2, "minutes"))}
        class="btn btn-success btn-block btn-lg"
        on:click={() =>
          logState(states.COOLDOWN, "The weather has returned to normal.")}
      >
        The weather has returned to normal.
      </button>
    {/if}
  </div>
</div>
