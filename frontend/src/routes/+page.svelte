<script lang="ts">
  import { onMount } from 'svelte';
  import { ConnectionStatus, LOCAL_USER_KEY } from '../shared.svelte';
  import { MessageTypes } from '../../../types/types';
  import { dev } from '$app/environment';
  import Sender from '$lib/sender.svelte';
  import Receiver from '$lib/receiver.svelte';
  import Cache from '$lib/cache.svelte';

  function createSocket(): WebSocket {
    const sock = new WebSocket(import.meta.env.VITE_SOCKET_SERVER || 'ws://localhost:4000');
    connectionStatus = ConnectionStatus.CONNECTING;

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

        if (data.type === MessageTypes.PING && userId !== null) {
          connectToServer();
          return;
        }

        if (data.type == MessageTypes.COUNT) {
          connectionCount = data.count;
          connectionStatus = ConnectionStatus.CONNECTED;
        }
      });
    });

    return sock;
  }

  let socket: WebSocket | null = $state(null);
  let connectionStatus: ConnectionStatus = $state(ConnectionStatus.DISCONNECTED);

  let userId = $state<string | null>(null);
  let connectionCount = $state(0);
  let idInput = $state('');

  onMount(() => {
    userId = localStorage.getItem(LOCAL_USER_KEY);

    if (userId !== null) {
      socket = createSocket();
    }
  });

  function connectToServer() {
    if (userId === null) {
      console.error('Attempted to connect to server without a user ID');
      return;
    }

    if (socket === null) {
      console.error('Attempted to connect to server, but socket is not initialized');
      return;
    }

    socket.send(JSON.stringify({ type: MessageTypes.PONG, userId }));
  }

  function updateUserId() {
    if (idInput.length < 3) {
      alert('Given ID is too short (must be at least 3 characters long');
      return;
    }

    userId = idInput;
    localStorage.setItem(LOCAL_USER_KEY, idInput);

    socket = createSocket();
    connectToServer();
  }

  function clearUser() {
    console.info('clearing session...');
    userId = null;
    localStorage.removeItem(LOCAL_USER_KEY);
    connectionStatus = ConnectionStatus.DISCONNECTED;

    if (socket !== null) {
      socket.close(1000, 'User manually disconnected');
    }

    socket = createSocket();
  }
</script>

<svelte:head>
  <title>patented stuff sender</title>
</svelte:head>

<main>
  {#if connectionStatus === ConnectionStatus.DISCONNECTED || userId === null || socket === null}
    <div class="id-form">
      Connect with a unique user ID:
      <br /><br />
      <input bind:value={idInput} />
      <button onclick={updateUserId}>Submit</button>
    </div>
  {:else if connectionStatus === ConnectionStatus.CONNECTING}
    connecting...
  {:else if connectionStatus === ConnectionStatus.CONNECTED}
    <section>
      <div class="status">
        <p>
          Connected to {connectionCount} other device{connectionCount === 1 ? '' : 's'}
        </p>
        <br />
        <button onclick={clearUser}>Disconnect</button>
      </div>
      {#if connectionCount <= 1}
        <div class="warning">
          No other connections detected :(
          <br />
          Connect with the same user ID on another device to send content!
          <br />
        </div>
      {:else}
        <Sender {socket} {userId} />
        <Receiver {socket} />
        <Cache />
      {/if}
    </section>
  {:else}
    <div class="warning">
      Looks like something went wrong with setting up a connection - try refreshing the page?
    </div>
  {/if}
</main>

<style>
  :global(*) {
    margin: 0;
    /* padding: 0; */
    box-sizing: border-box;
  }

  :global(body) {
    background-color: #202020;

    font-family: Arial, Helvetica, sans-serif;
    color: white;
    text-align: center;

    overflow: scroll;
  }

  @media (orientation: portrait) {
    :global(body) {
      margin-top: 20px;
      margin-bottom: 50px;
    }
  }

  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    padding-top: 20px;
  }

  .warning {
    display: flex;
    align-items: center;

    padding: 15px;
    height: 55px;

    background-color: #ee222299;
    border-radius: 5px;
  }

  section {
    display: grid;
    grid-template-columns: auto auto;
    justify-items: center;
    gap: 40px;
  }

  @media (orientation: portrait) {
    section {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }

  .status {
    padding: 20px 40px;
    width: 200px;
    height: 120px;

    border: 2px solid blue;
    border-radius: 5px;
    box-shadow: 0 0 15px blue;
  }
</style>
