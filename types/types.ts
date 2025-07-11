export enum MESSAGE_TYPES {
  PING = "ping",
  PONG = "pong",
  COUNT = "count",
  ITEM = "item",
}

export enum ItemType {
  TEXT = 'text',
  FILE = 'file',
}

interface DataMessageFields<D extends ItemType, V> {
  name: string;
  type: D;
  data: V;
}

export type TextMessage = DataMessageFields<ItemType.TEXT, string>;
export type FileMessage = DataMessageFields<ItemType.FILE, Base64URLString>;
export type DataMessage = TextMessage | FileMessage;
