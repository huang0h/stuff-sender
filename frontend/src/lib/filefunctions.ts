// Converts a base64 string into a byte array, to be used in various places
export function b64ToByteArray(b64string: Base64URLString): [Uint8Array<ArrayBuffer>, string] {
  // split data into [data:mimetype;, b64data]
  const [header, fileData] = b64string.split('base64,');
  const mimeType = header.slice(5, -1);
  const fileBytes = atob(fileData);
  const byteArray = new Uint8Array(fileBytes.length);

  for (let i = 0; i < fileBytes.length; i++) {
    byteArray[i] = fileBytes.charCodeAt(i);
  }

  return [byteArray, mimeType];
}

// Converts a base64 string into a blob URL for downloads
export function b64FileLink(b64string: Base64URLString) {
  const [byteArray, mimeType] = b64ToByteArray(b64string);
  const fileBlob = new Blob([byteArray], { type: mimeType });

  return URL.createObjectURL(fileBlob);
}

export function bytesToMB(bytes: number, places: number = 2) {
  return (bytes / 1024 / 1024).toFixed(places);
}
