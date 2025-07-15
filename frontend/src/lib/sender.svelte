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
	Send content:
	<br /><br />
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
				<input id="item-file-value" type="file" multiple bind:files={itemFileValue} />
				{#if itemFileValue !== null && itemFileValue.length > 1}
					<br />
					<ul class="file-list">
						{#each itemFileValue as file, i (i)}
							<li>{file.name}</li>
						{/each}
					</ul>
				{/if}
			{/if}
		</div>
		<button onclick={sendItem}>Send</button>
	</div>
</div>

<style>
	#send-form {
		padding: 15px;
		width: 250px;
		height: 320px;

		border: 2px solid #2ed80c;
		border-radius: 5px;
		box-shadow: 0 0 10px #2ed80c;
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

	ul.file-list {
		font-size: 0.8rem;
		margin: 10px 0;
		padding-left: 15px;
	}
</style>
