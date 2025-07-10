<script lang="ts">
	import { cachedItems, type CachedItem } from "../shared.svelte";

	interface SenderProps {
		socket: WebSocket;
		userId: string;
	}

	let { socket, userId }: SenderProps = $props();

  function cacheItem(item: CachedItem) {
    cachedItems.push(item);
  }
</script>
