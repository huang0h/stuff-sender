import type { ItemType } from '../../types/types';

export const LOCAL_USER_KEY = 'userId';

interface ProcessedItemFields<T extends ItemType, V> {
  name: string;
  type: T;
  data: V;
}

export type ProcessedFile = { filename: string; downloadLink: string; rawData: Base64URLString };
type ProcessedTextItem = ProcessedItemFields<ItemType.TEXT, string>;
type ProcessedFileItem = ProcessedItemFields<ItemType.FILE, ProcessedFile[]>;

export type ProcessedItem = ProcessedTextItem | ProcessedFileItem;

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

// export interface CachedItem {
// 	name: string;
// 	type: ItemType;
// 	data: string;
// }

// export const cachedItems = $state<CachedItem[]>([]);
