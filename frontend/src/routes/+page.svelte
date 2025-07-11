<script lang="ts">
	import { onMount } from 'svelte';
	import { LOCAL_USER_KEY } from '../shared.svelte';
	import { MESSAGE_TYPES } from '../../../types/types';
	import { dev } from '$app/environment';
	import Sender from '$lib/sender.svelte';
	import Receiver from '$lib/receiver.svelte';

	function createSocket(): WebSocket {
		const sock = new WebSocket('ws://localhost:3000');

		sock.addEventListener('open', () => {
			if (dev) {
				// Override socket's send method for logging when in dev
				const originalSend = sock.send;
				sock.send = (data) => {
					console.info('Sending message:', data);
					originalSend.call(sock, data);
				};
			}

			sock.addEventListener('message', (event) => {
				const data = JSON.parse(event.data);
				console.info('Received message:', data);
				console.log(`userId: ${userId}`);

				if (data.type === MESSAGE_TYPES.PING && userId !== null) {
					connectToServer();
					return;
				}

				if (data.type == MESSAGE_TYPES.COUNT) {
					connectionCount = data.count;
				}
			});
		});

		return sock;
	}

	let ws: WebSocket | null = $state(null);

	let userId = $state<string | null>(null);
	let connectionCount = $state(0);
	let idInput = $state('');

	onMount(() => {
		console.log('mounting');
		userId = localStorage.getItem(LOCAL_USER_KEY);

		if (userId !== null) {
			ws = createSocket();
		}
	});

	function connectToServer() {
		if (userId === null) {
			console.error('Attempted to connect to server without a user ID');
			return;
		}

		if (ws === null) {
			console.error('Attempted to connect to server, but socket is not initialized');
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

		ws = createSocket();
		connectToServer();
	}

	function clearUser() {
		console.info('clearing session...');
		userId = null;
		localStorage.removeItem(LOCAL_USER_KEY);

		if (ws !== null) {
			ws.close(1000, 'User manually cleared session');
		}

		ws = createSocket();
	}
</script>

<section>
	{#if userId === null || ws === null}
		<div class="id-form">
			gimme a pound
			<input bind:value={idInput} />
			<button onclick={updateUserId}>Submit</button>
		</div>
	{:else}
		<p>
			connection count: {connectionCount}
		</p>
		<button onclick={clearUser}>clear user session</button>
    <hr />
		<Sender socket={ws} {userId} />
    <Receiver socket={ws} />
	{/if}
</section>
