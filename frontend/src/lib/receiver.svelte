<!--
 This component is reponsible for managing the list of cached items
 as well as any IndexedDB operations

 consider: https://stackoverflow.com/questions/79296004/bind-to-imported-state-in-svelte5-error-constant-binding
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ItemType,
		MessageTypes,
		type ItemMessage,
		type ItemMessagePayload
	} from '../../../types/types';
	import { dev } from '$app/environment';
	import { LOCAL_USER_KEY } from '../shared.svelte';

	interface ReceiverProps {
		socket: WebSocket;
	}

	const { socket }: ReceiverProps = $props();
	let userId: string | null = $state(null);
	let receivedItems: ItemMessagePayload[] = $state([]);

	onMount(() => {
		// Also check user IDs on received messages as an extra layer of precaution
		userId = localStorage.getItem(LOCAL_USER_KEY);
		if (userId === null) {
			alert('No user ID set: unable to receive items');
			return;
		}

		socket.addEventListener('message', (event) => {
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

			const item: ItemMessagePayload = messageData.payload;
			if (
				item === undefined ||
				item.name === undefined ||
				!Object.values(ItemType).includes(item.type) ||
				item.data === undefined
			) {
				console.warn('Received invalid item payload');
				return;
			}

			receivedItems.push(item);
		});
	});
</script>

{#each receivedItems as item}
	<h4>item {item.name}</h4>
	{#if item.type === ItemType.TEXT}
		{item.data}
	{:else}
		{item.data.length} files
	{/if}
	<hr />
{/each}
