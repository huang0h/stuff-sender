<!--
 This component is reponsible for managing the list of cached items
 as well as any IndexedDB operations

 consider: https://stackoverflow.com/questions/79296004/bind-to-imported-state-in-svelte5-error-constant-binding
-->
<script lang="ts">
  interface ReceiverProps {
    socket: WebSocket;
  }

  const { socket } = $props();
</script>