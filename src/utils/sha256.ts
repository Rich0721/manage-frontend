const HEX_RADIX = 16
const HEX_PADDING = 2

export async function sha256(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto SHA-256 is unavailable.')
  }

  const bytes = new TextEncoder().encode(value)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(HEX_RADIX).padStart(HEX_PADDING, '0'),
  ).join('')
}
