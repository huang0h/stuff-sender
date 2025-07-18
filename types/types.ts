export enum MessageTypes {
  PING = "ping",
  PONG = "pong",
  COUNT = "count",
  ITEM = "item",
}

export enum ItemType {
  TEXT = 'text',
  FILE = 'file',
}

interface ItemMessagePayloadFields<D extends ItemType, V> {
  name: string;
  type: D;
  data: V;
}

export type TextMessagePayload = ItemMessagePayloadFields<ItemType.TEXT, string>;
export type FileMessagePayload = ItemMessagePayloadFields<ItemType.FILE, { filename: string; b64data: Base64URLString }[]>;
export type ItemMessagePayload = TextMessagePayload | FileMessagePayload;

export interface ItemMessage {
  userId: string;
  type: MessageTypes.ITEM;
  payload: ItemMessagePayload;
}

export const MAX_FILE_SIZE_BYTES = 32 * 1024 * 1024 // 32 mb
