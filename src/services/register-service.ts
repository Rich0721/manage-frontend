import type { RegisterFormValues, RegisterResult } from '../types/register'
import { sha256 } from '../utils/sha256'

const REGISTER_ENDPOINT = '/userController/register'
const REQUEST_TIMEOUT_MS = 30_000
const SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/

export type RegisterServiceErrorKind = 'network' | 'timeout' | 'protocol' | 'crypto'

export class RegisterServiceError extends Error {
  readonly kind: RegisterServiceErrorKind

  constructor(
    kind: RegisterServiceErrorKind,
    message: string,
  ) {
    super(message)
    this.name = 'RegisterServiceError'
    this.kind = kind
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getApiResult(value: unknown): RegisterResult {
  if (!isRecord(value) || !isRecord(value.header)) {
    throw new RegisterServiceError('protocol', 'Malformed registration response.')
  }

  const { status, message } = value.header
  if (typeof message !== 'string' || !message.trim()) {
    throw new RegisterServiceError('protocol', 'Registration response has no message.')
  }

  if (status === 'failed') return { status, message }

  if (status !== 'success' || !isRecord(value.body) || !isRecord(value.body.info)) {
    throw new RegisterServiceError('protocol', 'Malformed registration response.')
  }

  const { uid, email, username } = value.body.info
  if (
    typeof uid !== 'string' ||
    typeof email !== 'string' ||
    typeof username !== 'string'
  ) {
    throw new RegisterServiceError('protocol', 'Malformed registration response.')
  }

  return { status, message }
}

function createAbortError(): DOMException {
  return new DOMException('The registration request was aborted.', 'AbortError')
}

export async function registerUser(
  values: RegisterFormValues,
  signal: AbortSignal,
): Promise<RegisterResult> {
  if (signal.aborted) throw createAbortError()

  let passwordHash: string
  let confirmPasswordHash: string
  try {
    ;[passwordHash, confirmPasswordHash] = await Promise.all([
      sha256(values.password),
      sha256(values.confirmPassword),
    ])
  } catch {
    throw new RegisterServiceError('crypto', 'Unable to hash registration password.')
  }

  if (signal.aborted) throw createAbortError()
  if (!SHA256_HEX_PATTERN.test(passwordHash) || !SHA256_HEX_PATTERN.test(confirmPasswordHash)) {
    throw new RegisterServiceError('crypto', 'Invalid SHA-256 digest.')
  }

  const controller = new AbortController()
  let timedOut = false
  const abortFromCaller = () => controller.abort()
  signal.addEventListener('abort', abortFromCaller, { once: true })
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    let response: Response
    try {
      response = await fetch(REGISTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          header: { 'Content-Type': 'application/json' },
          body: {
            info: {
              email: values.email,
              username: values.name,
              password: passwordHash,
              confirmPassword: confirmPasswordHash,
            },
          },
        }),
        signal: controller.signal,
      })
    } catch {
      if (timedOut) {
        throw new RegisterServiceError('timeout', 'Registration request timed out.')
      }
      if (signal.aborted) throw createAbortError()
      throw new RegisterServiceError('network', 'Registration request failed.')
    }

    if (timedOut) {
      throw new RegisterServiceError('timeout', 'Registration request timed out.')
    }
    if (!response.ok) {
      throw new RegisterServiceError('protocol', 'Registration server returned an HTTP error.')
    }

    let body: unknown
    try {
      body = await response.json()
    } catch {
      if (timedOut) {
        throw new RegisterServiceError('timeout', 'Registration request timed out.')
      }
      if (signal.aborted) throw createAbortError()
      throw new RegisterServiceError('protocol', 'Registration response is not valid JSON.')
    }

    if (timedOut) {
      throw new RegisterServiceError('timeout', 'Registration request timed out.')
    }
    if (signal.aborted) throw createAbortError()
    return getApiResult(body)
  } catch (error) {
    if (error instanceof RegisterServiceError || error instanceof DOMException) throw error
    if (timedOut) {
      throw new RegisterServiceError('timeout', 'Registration request timed out.')
    }
    if (signal.aborted) throw createAbortError()
    throw new RegisterServiceError('network', 'Registration request failed.')
  } finally {
    clearTimeout(timeoutId)
    signal.removeEventListener('abort', abortFromCaller)
  }
}
