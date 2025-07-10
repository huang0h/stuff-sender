export interface PongPayload {
  userId: string;
}

export enum MESSAGE_TYPES {
  PING = "ping",
  PONG = "pong",
  COUNT = "count",
  ITEM = "item",
}
