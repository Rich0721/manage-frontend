function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getResponseHeader(value: unknown): Record<string, unknown> | undefined {
  if (!isRecord(value)) return undefined

  const headerKey = 'headers' in value ? 'headers' : 'header'
  const header = value[headerKey]
  return isRecord(header) ? header : undefined
}

function getHeaderValue(
  header: Record<string, unknown> | undefined,
  lowerCaseKey: string,
  upperCaseKey: string,
): unknown {
  if (!header) return undefined

  const key = lowerCaseKey in header ? lowerCaseKey : upperCaseKey
  return header[key]
}

export function getHttpResponseMessage(headers: Headers): string | undefined {
  const message = headers.get('Message')
  return message?.trim() ? message : undefined
}

export function getHttpResponseStatus(headers: Headers): string | undefined {
  const status = headers.get('Status')
  return status?.trim() ? status.toLowerCase() : undefined
}

export function getApiResponseMessage(value: unknown): string | undefined {
  const message = getHeaderValue(getResponseHeader(value), 'message', 'Message')
  return typeof message === 'string' && message.trim() ? message : undefined
}

export function getApiResponseStatus(value: unknown): string | undefined {
  const status = getHeaderValue(getResponseHeader(value), 'status', 'Status')
  return typeof status === 'string' && status.trim() ? status.toLowerCase() : undefined
}
