export const LOCAL_USER_KEY = 'userId';

export enum ItemType {
  TEXT = 'text',
  FILE = 'file',
}

export interface CachedItem {
  name: string;
  type: ItemType;
  data: string;
}

export const cachedItems = $state<CachedItem[]>([]);
