<script lang="ts">
	import { ItemType, MessageTypes } from '../../../types/types';

	interface SenderProps {
		socket: WebSocket;
		userId: string;
	}

	let { socket, userId }: SenderProps = $props();

	let itemName = $state('');
	let itemType = $state(ItemType.TEXT);

	let itemTextValue = $state('');
	let itemFileValue: FileList | null = $state(null);

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
		} else if (itemType === ItemType.FILE && itemFileValue !== null) {
			const b64Files = await Promise.all(Array.from(itemFileValue).map((f) => itemFileToB64(f)));
      data = b64Files.map(([filename, b64data]) => ({ filename, b64data }))
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
				data
			}
		};

		socket.send(JSON.stringify(itemMessage));
    
    // Reset fields
    itemName = '';
    itemTextValue = '';
    itemFileValue = null;
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
		<input id="item-file-value" type="file" multiple bind:files={itemFileValue} />
	{/if}
	<button onclick={sendItem}>Send</button>
</div>
