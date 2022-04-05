<script>
  import clsx from "clsx";
  import Icon from "./Icon.svelte";
  import { capitalize } from "../util";

  export let name;
  export let iconOnly = false;

  const classes = clsx("badge font-size-14 py-5 px-10");
</script>

{#if iconOnly}
  {#if name}
    <img src={`/elements/${name}.png`} alt={`${name} element`} width={20} />
  {:else}
    <Icon name="question" />
  {/if}
{:else}
  <div class={classes}>
    <div class="flex align-items-center">
      {#if name}
        <img
          src={`/elements/${name}.png`}
          alt={`${name} element`}
          width={20}
          class="mr-5"
        />
        {capitalize(name)}
      {:else}
        <Icon name="question" extraClasses="mr-5" />
        ???
      {/if}
    </div>
  </div>
{/if}
