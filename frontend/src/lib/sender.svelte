<script lang="ts">
  import { ItemType, MAX_FILE_SIZE_BYTES, MessageTypes } from '../../../types/types';
  import MinimizeButton from './minimizeButton.svelte';
  import { bytesToMB } from './filefunctions';
  import type { ChangeEventHandler, DragEventHandler } from 'svelte/elements';

  interface Props {
    socket: WebSocket;
    userId: string;
  }

  let { socket, userId }: Props = $props();

  let itemName = $state('');
  let itemType = $state(ItemType.TEXT);
  let isOpen = $state(true);

  let itemTextValue = $state('');
  let itemFileValue: File[] = $state([]);

  const onFileUpload: ChangeEventHandler<HTMLInputElement> = (event) => {
    const uploadedFiles = (event.target as HTMLInputElement).files;
    if (uploadedFiles === null) return;

    itemFileValue = Array.from(uploadedFiles);
  };

  function itemFileToB64(file: File) {
    return new Promise<[string, string]>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve([file.name, reader.result as string]);
      reader.onerror = reject;
    });
  }

  async function sendItem() {
    let data;
    if (itemType === ItemType.TEXT) {
      data = itemTextValue;
    } else if (itemType === ItemType.FILE && itemFileValue.length > 0) {
      let totalFileBytes = 0;
      for (let file of itemFileValue) {
        totalFileBytes += file.size;
      }

      if (totalFileBytes > MAX_FILE_SIZE_BYTES) {
        alert(
          `Given files exceed max size of ${bytesToMB(MAX_FILE_SIZE_BYTES)} (actual size: ${bytesToMB(totalFileBytes)})`
        );
        return;
      }

      const b64Files = await Promise.all(itemFileValue.map((f) => itemFileToB64(f)));
      data = b64Files.map(([filename, b64data]) => ({ filename, b64data }));
    } else {
      data = '';
    }

    // This is kind of cursed since strings and arrays share the `length` property
    if (data.length === 0) {
      alert('Cannot send an empty item');
      return;
    }

    const itemMessage = {
      userId,
      type: MessageTypes.ITEM,
      payload: {
        name: itemName,
        type: itemType,
        data,
      },
    };

    socket.send(JSON.stringify(itemMessage));

    // Reset fields
    itemName = '';
    itemTextValue = '';
    itemFileValue = [];
  }

  async function pasteFiles() {
    try {
      const clipboardItems = await navigator.clipboard.read();
      if (clipboardItems.length === 0) return;

      // Check if clipboard just has plain text: if so, switch to text input and paste there
      if (clipboardItems[0].types.includes('text/plain')) {
        itemType = ItemType.TEXT;
        itemTextValue = await navigator.clipboard.readText();
        return;
      }

      const timestamp = Date.now();
      const blobs = await Promise.all(clipboardItems.map((item) => item.getType(item.types[0])));
      itemFileValue = blobs.map((b, i) => {
        let extension = (b.type.split('/').at(-1) as string).toLowerCase();

        if (extension === 'svg+xml') {
          // special case since svg is weird
          extension = '.svg';
        } else if (!/^[a-z]+$/.test(extension)) {
          // ensure "extension" is alphabetic
          extension = '';
        } else {
          extension = '.' + extension;
        }

        return new File([b], `${timestamp}-${i}${extension}`, { type: b.type });
      });
      console.log(itemFileValue);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        alert('Reading from clipboard was not allowed - try changing your browser settings?');
        return;
      }
    }
  }

  const onDrop: DragEventHandler<HTMLSpanElement> = (event) => {
    event.preventDefault();
    const files = event.dataTransfer?.files;

    if (files === undefined) {
      return;
    } else {
      itemFileValue = Array.from(files);
    }
  };
</script>

<div id="send-form" class={isOpen ? 'open' : 'closed'}>
  <header>
    <MinimizeButton bind:open={isOpen} />
    <p>Send content:</p>
  </header>

  {#if isOpen}
    <div id="type-radio-group">
      <input
        id="item-type-text"
        type="radio"
        name="type"
        value={ItemType.TEXT}
        bind:group={itemType}
      />
      <label for="item-type-text">Text</label>
      <input
        id="item-type-file"
        type="radio"
        name="type"
        value={ItemType.FILE}
        bind:group={itemType}
      />
      <label for="item-type-file">File</label>
    </div>
    <br />
    <div id="send-content">
      <div class="content-input">
        <label for="item-name">Item Name: </label>
        <br />
        <input id="text-item-name" type="text" bind:value={itemName} />
      </div>
      <br />
      <div class="content-input">
        {#if itemType === ItemType.TEXT}
          <label for="iteItemTypealue">Text:</label>
          <br />
          <textarea id="item-text-value" bind:value={itemTextValue}></textarea>
        {:else if itemType === ItemType.FILE}
          <label for="item-fileItemType">File:</label>
          <br />
          <span
            class="file-dropzone"
            role="region"
            ondragover={(event) => event.preventDefault()}
            ondrop={onDrop}
            ><input id="item-file-value" type="file" multiple onchange={onFileUpload} /> or
            <button onclick={pasteFiles}>Paste</button></span
          >
          {#if itemFileValue.length > 0}
            <br />
            <ul class="file-list">
              {#each itemFileValue as file, i (i)}
                <li>
                  {file.name.length > 30
                    ? `${file.name.slice(0, 15)}...${file.name.slice(-10)}`
                    : file.name}
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
      </div>
      <button onclick={sendItem}>Send</button>
    </div>
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

  #send-form {
    padding: 15px;
    width: 250px;
    border: 2px solid #2ed80c;
    border-radius: 5px;
    box-shadow: 0 0 10px #2ed80c;

    grid-column: 1;
    grid-row: 2;
  }

  #send-form.open {
    height: 320px;
  }

  #send-form.closed {
    height: 50px;
  }

  #send-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    text-align: left;
  }

  .content-input {
    margin-bottom: 15px;
  }

  #item-text-value {
    width: 200px;
    height: 100px;
    resize: none;
  }

  @media (max-width: 400px) {
    #item-text-value {
      height: 80px;
    }
  }

  #item-file-value {
    font-size: 0;
  }

  #item-file-value::file-selector-button {
    font-size: 0.8rem;
    margin-right: 0px;
  }

  ul.file-list {
    font-size: 0.8rem;

    margin-top: 10px;
    padding-left: 15px;
  }

  ul.file-list > li {
    word-wrap: break-word;
  }
</style>
