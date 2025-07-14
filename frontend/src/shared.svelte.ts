import type { ItemType } from '../../types/types';

export const LOCAL_USER_KEY = 'userId';

export interface CachedItem {
	name: string;
	type: ItemType;
	data: string;
}

export const cachedItems = $state<CachedItem[]>([]);
