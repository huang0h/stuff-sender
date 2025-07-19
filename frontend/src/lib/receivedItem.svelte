<script lang="ts">
  import { ItemType } from '../../../types/types';
  import type { ProcessedItem } from '../shared.svelte';
  import Copy from '$lib/assets/copy.png';
  import Download from '$lib/assets/download.png';

  interface Props {
    item: ProcessedItem;
  }

  let { item }: Props = $props();
  let open = $state(false);
</script>

<div class="item">
  <h4>{item.name}</h4>
  <br />
  {#if item.type === ItemType.TEXT}
    <div class="text-content">
      <span
        ><button class="action" onclick={() => navigator.clipboard.writeText(item.data)}
          ><img src={Copy} alt="Copy Text" width="15" /></button
        ></span
      >
      {#if item.data.length > 50}
        <span
          ><button
            class="action"
            onclick={() => {
              open = !open;
            }}>{open ? '-' : '+'}</button
          ></span
        >
        <p>
          {open ? item.data : `${item.data.slice(0, 47)}...`}
        </p>
      {:else}
        <p>{item.data}</p>
      {/if}
    </div>
  {:else}
    <div class="file-content">
      <ul>
        {#each item.data as file, i (i)}
          <li>
            <a href={file.downloadLink} download={file.filename}
              ><button class="action download"
                ><img src={Download} alt="Download file" width="15" /></button
              ></a
            >
            {file.filename}
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .item {
    text-align: left;
    margin-bottom: 20px;
  }

  .item > h4 {
    margin-bottom: 0px;
    word-wrap: break-word;
  }

  button.action {
    padding: 2px;
    display: flex;
    justify-content: center;
    min-width: 15px;
  }

  .text-content {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  .text-content > p {
    margin: 0;
    align-self: center;
  }

  .file-content > ul {
    padding-left: 15px;
  }

  .file-content > ul > li {
    margin-bottom: 10px;

    word-wrap: break-word;
  }

  button.download {
    display: inline;
    margin-right: 5px;
  }
</style>
