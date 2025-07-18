<script lang="ts">
  import MinimizeButton from './minimizeButton.svelte';

  let isOpen = $state(true);
</script>

<div id="item-cache" class={isOpen ? 'open' : 'closed'}>
  <header>
    <MinimizeButton bind:open={isOpen} />
    <p>Cached content:</p>
  </header>

  {#if isOpen}
    <hr />
    <p>nothing cached yet ¯\_(ツ)_/¯</p>
  {/if}
</div>

<style>
  header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    margin-bottom: 10px;
  }

  header > p {
    position: absolute;
  }

  #item-cache {
    padding: 15px;
    width: 400px;

    border: 2px solid red;
    border-radius: 5px;
    box-shadow: 0 0 10px red;

    grid-column: 2;
    grid-row: 2;
  }

  #item-cache.open {
    min-height: 200px;
  }

  #item-cache.closed {
    height: 60px;
  }

  @media (max-width: 400px) {
    #item-cache {
      padding: 15px 10px;
      width: 280px;
    }
  }

  hr {
    margin: 10px 0;
  }
</style>
