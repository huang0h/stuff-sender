import type { ItemType } from '../../types/types';

export const LOCAL_USER_KEY = 'userId';

interface ProcessedItemFields<T extends ItemType, V> {
  name: string;
  type: T;
  data: V
}

type ProcessedFile = { filename: string; downloadLink: string }
type ProcessedTextItem = ProcessedItemFields<ItemType.TEXT, string>
type ProcessedFileItem = ProcessedItemFields<ItemType.FILE, ProcessedFile[]>

export type ProcessedItem = ProcessedTextItem | ProcessedFileItem;

// export interface CachedItem {
// 	name: string;
// 	type: ItemType;
// 	data: string;
// }

// export const cachedItems = $state<CachedItem[]>([]);
