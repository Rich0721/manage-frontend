import type { RegisterFormValues, RegisterResult } from '../types/register'
import { getApiResponseMessage } from './api-response'
import { sha256 } from '../utils/sha256'

const REGISTER_ENDPOINT = '/userController/register'
const REQUEST_TIMEOUT_MS = 30_000
const SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/

export type RegisterServiceErrorKind = 'network' | 'timeout' | 'http' | 'protocol' | 'crypto'

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

  const { Status } = value.header
  const message = getApiResponseMessage(value)
  if (!message) {
    throw new RegisterServiceError('protocol', 'Registration response has no message.')
  }

  if (Status === 'Failed') return { status: 'failed', message }

  if (Status !== 'Success' || !isRecord(value.body) || !isRecord(value.body.info)) {
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

  return { status: 'success', message }
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
          body: {
            info: {
              email: values.email,
              userName: values.name,
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

    if (!response.ok) {
      const message = getApiResponseMessage(body)
      if (message) throw new RegisterServiceError('http', message)

      throw new RegisterServiceError(
        'protocol',
        `Registration server returned HTTP ${response.status}.`,
      )
    }

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
