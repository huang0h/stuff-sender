<!--
 This component is reponsible for managing the list of cached items
 as well as any IndexedDB operations

 consider: https://stackoverflow.com/questions/79296004/bind-to-imported-state-in-svelte5-error-constant-binding
-->
<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { ItemType, MessageTypes, type ItemMessagePayload } from '../../../types/types';
  import { dev } from '$app/environment';
  import { LOCAL_USER_KEY, type ProcessedItem } from '../shared.svelte';
  import ReceivedItem from './receivedItem.svelte';
  import MinimizeButton from './minimizeButton.svelte';

  interface Props {
    socket: WebSocket;
  }

  // function b64FileLink(b64string: Base64URLString) {
  //   // split data into [data:mimetype;, b64data]
  //   const [header, fileData] = b64string.split('base64,');
  //   const mimeType = header.slice(5, -1);
  //   const fileBytes = atob(fileData);
  //   const byteArray = new Uint8Array(fileBytes.length);

  //   for (let i = 0; i < fileBytes.length; i++) {
  //     byteArray[i] = fileBytes.charCodeAt(i);
  //   }

  //   const fileBlob = new Blob([byteArray], { type: mimeType });

  //   return URL.createObjectURL(fileBlob);
  // }

  const { socket }: Props = $props();
  let userId: string | null = $state(null);
  let receivedItems: ProcessedItem[] = $state([]);
  let isOpen = $state(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function receiveItem(event: MessageEvent<any>) {
    const messageData = JSON.parse(event.data);

    if (dev) {
      console.info('Received message:', messageData);
    }

    // Only listen for item messages
    if (messageData.type !== MessageTypes.ITEM) {
      return;
    }

    // Reject any items meant for someone else
    // (this probably shouldn't happen, but better to be safe)
    if (messageData.userId !== userId) {
      console.warn('Received invalid message');
      return;
    }

    const itemPayload: ItemMessagePayload = messageData.payload;
    if (
      itemPayload === undefined ||
      itemPayload.name === undefined ||
      !Object.values(ItemType).includes(itemPayload.type) ||
      itemPayload.data === undefined
    ) {
      console.warn('Received invalid item payload');
      return;
    }

    let processedItem: ProcessedItem;

    if (itemPayload.type === ItemType.TEXT) {
      processedItem = { ...itemPayload };
    } else {
      // Process files by converting them into download links on reception so we only do this once
      const processedFiles = itemPayload.data.map(({ filename, b64data }) => ({
        filename,
        // downloadLink: b64FileLink(b64data),
        downloadLink: b64data,
      }));
      processedItem = { ...itemPayload, data: processedFiles };
    }

    if (processedItem.name === '') {
      processedItem.name = '<unnamed item>';
    }

    receivedItems.push(processedItem);
  }

  onMount(() => {
    // Also check user IDs on received messages as an extra layer of precaution
    userId = localStorage.getItem(LOCAL_USER_KEY);
    if (userId === null) {
      alert('No user ID set: unable to receive items');
      return;
    }

    socket.addEventListener('message', receiveItem);
  });

  onDestroy(() => {
    socket.removeEventListener('message', receiveItem);
  });
</script>

<div id="received-content" class={isOpen ? 'open' : 'closed'}>
  <header>
    <MinimizeButton bind:open={isOpen} />
    <p>Received content:</p>
  </header>

  {#if isOpen}
    <hr />
    {#if receivedItems.length > 0}
      {#each receivedItems as item, i (i)}
        <ReceivedItem {item} />
        <hr />
      {/each}
    {:else}
      <p>nothing received yet ¯\_(ツ)_/¯</p>
    {/if}
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

  #received-content {
    padding: 15px;
    width: 400px;

    border: 2px solid white;
    border-radius: 5px;
    box-shadow: 0 0 10px white;

    grid-column: 2;
    grid-row: 1;
  }

  #received-content.open {
    min-height: 200px;
  }

  #received-content.closed {
    height: 60px;
  }

  @media (max-width: 400px) {
    #received-content {
      padding: 15px 10px;
      width: 280px;
    }
  }

  hr {
    margin: 10px 0;
  }
</style>
