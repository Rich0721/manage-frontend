function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getApiResponseMessage(value: unknown): string | undefined {
  if (!isRecord(value) || !isRecord(value.header)) return undefined

  const message = value.header.Message ?? value.header.message
  return typeof message === 'string' && message.trim() ? message : undefined
}

export function getApiResponseStatus(value: unknown): string | undefined {
  if (!isRecord(value) || !isRecord(value.header)) return undefined

  const status = value.header.Status ?? value.header.status
  return typeof status === 'string' ? status.toLowerCase() : undefined
}
