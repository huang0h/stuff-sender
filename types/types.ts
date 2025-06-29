export interface PongPayload {
  userId: string;
}

// export interface DataMessage<K extends string, V> {
//   type: K;
//   data: V;
// }

// // Alias to disambiguate plain text from b64 strings
// type B64String = string;

// export type LinkMessage = DataMessage<'link', string>;
// export type FileMessage = DataMessage<'file', B64String>;