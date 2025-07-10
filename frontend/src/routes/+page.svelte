<script lang="ts">
	import { onMount } from 'svelte';
	import { LOCAL_USER_KEY } from '../shared.svelte';
	import { MESSAGE_TYPES } from '../../../types/types';
	import { dev } from '$app/environment';
	import Sender from '$lib/sender.svelte';

	function createSocket(): WebSocket {
		const sock = new WebSocket('ws://localhost:3000');
		if (dev) {
      // Override socket's send method for logging when in dev
			const originalSend = sock.send;
			sock.send = (data) => {
				console.info('Sending message:', data);
				originalSend.call(sock, data);
			};
		}

    return sock;
	}

	const ws: WebSocket = $state(createSocket());

	let userId = $state<string | null>(null);
	let connectionCount = $state(0);
	let idInput = $state('');

	onMount(() => {
		userId = localStorage.getItem(LOCAL_USER_KEY);
		ws.addEventListener('message', (event) => {
			const data = JSON.parse(event.data);
			console.info('Received message:', data);

			if (data.type === MESSAGE_TYPES.PING && userId !== null) {
				connectToServer();
				return;
			}

			if (data.type == MESSAGE_TYPES.COUNT) {
				connectionCount = data.count;
			}
		});
	});

	function connectToServer() {
		if (userId === null) {
			console.error('Attempted to connect to server without a user ID');
			return;
		}

		ws.send(JSON.stringify({ type: MESSAGE_TYPES.PONG, userId }));
	}

	function updateUserId() {
		if (idInput.length < 3) {
			alert('Given ID is too short (must be at least 3 characters long');
		}

		userId = idInput;
		localStorage.setItem(LOCAL_USER_KEY, idInput);

		connectToServer();
	}
</script>

<section>
	{#if userId === null}
		<div class="id-form">
			gimme a pound
			<input bind:value={idInput} />
			<button onclick={updateUserId}>Submit</button>
		</div>
	{:else}
		<p>
			connection count: {connectionCount}
		</p>
		<Sender socket={ws} {userId} />
	{/if}
</section>
