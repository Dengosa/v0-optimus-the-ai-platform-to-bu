function randomHex(bytes: number) {
  let out = "";
  for (let i = 0; i < bytes; i++) {
    out += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  }
  return out;
}

export function createSessionId() {
  // UUID v4-like, without requiring Node crypto types in TS.
  return `${randomHex(4)}-${randomHex(2)}-4${randomHex(1)}-${((8 + Math.random() * 4) | 0).toString(16)}${randomHex(1)}-${randomHex(6)}`;
}

