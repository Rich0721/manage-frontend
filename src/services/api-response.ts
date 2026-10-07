function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getApiResponseMessage(value: unknown): string | undefined {
  if (!isRecord(value) || !isRecord(value.header)) return undefined

  const { Message } = value.header
  return typeof Message === 'string' && Message.trim() ? Message : undefined
}
