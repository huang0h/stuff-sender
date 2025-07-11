<script lang="ts">
	import { cachedItems, type CachedItem } from '../shared.svelte';
	import { ItemType, MESSAGE_TYPES, type DataMessage } from '../../../types/types';

	interface SenderProps {
		socket: WebSocket;
		userId: string;
	}

	let { socket, userId }: SenderProps = $props();

	let itemName = $state('');
	let itemType = $state(ItemType.TEXT);

	let itemTextValue = $state('');
	let itemFileValue: FileList | null = $state(null);

  $effect(() => {
    console.log(itemFileValue, typeof itemFileValue);
  })

	function itemFileToB64() {
		if (itemFileValue === null || itemFileValue[0] === null) {
			return '';
		}

		const file = itemFileValue[0];

		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
      reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
		});
	}

	async function sendItem() {
		const data = itemType === ItemType.TEXT ? itemTextValue : await itemFileToB64();
		if (data === '') {
			alert('Cannot send an empty item');
			return;
		}

		const itemMessage = {
			userId,
			type: MESSAGE_TYPES.ITEM,
			payload: {
				name: itemName,
				type: itemType,
				data
			}
		};

		socket.send(JSON.stringify(itemMessage));
	}
</script>

<div id="send-form">
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
	<label for="item-name">Item Name: </label>
	<input id="text-item-name" type="text" bind:value={itemName} />
	<br />
	{#if itemType === ItemType.TEXT}
		<label for="iteItemTypealue">Text:</label>
		<input id="item-text-value" type="text" bind:value={itemTextValue} />
	{:else if itemType === ItemType.FILE}
		<label for="item-fileItemType">File:</label>
		<input id="item-file-value" type="file" bind:files={itemFileValue} />
	{/if}
	<button onclick={sendItem}>Send</button>
</div>
