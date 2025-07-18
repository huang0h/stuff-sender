<script lang="ts">
  interface Props {
    open: boolean;
  }

  let { open: open = $bindable(true) }: Props = $props();
</script>

<button
  onclick={() => {
    open = !open;
  }}
>
  {#if open}
    -
  {:else}
    +
  {/if}
</button>

<style>
  button {
    margin-right: auto;
    text-align: center;

    min-width: 22px;
    min-height: 22px;
  }
</style>
