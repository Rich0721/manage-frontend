import type { AuthSession, LoginFormValues, LoginRequestBody } from '../types/auth'
import { getHttpResponseMessage, getHttpResponseStatus } from './api-response'
import { sha256 } from '../utils/sha256'

const LOGIN_ENDPOINT = '/userController/login'
const LOGOUT_ENDPOINT = '/userController/logout'
const REQUEST_TIMEOUT_MS = 30_000
const DIGEST_PATTERN = /^[0-9a-f]{64}$/

export type AuthServiceErrorKind = 'network' | 'timeout' | 'http' | 'unauthorized' | 'protocol' | 'crypto'

export class AuthServiceError extends Error {
  readonly kind: AuthServiceErrorKind

  constructor(kind: AuthServiceErrorKind, message: string) {
    super(message)
    this.name = 'AuthServiceError'
    this.kind = kind
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function abortError(): DOMException {
  return new DOMException('Request aborted.', 'AbortError')
}

async function request(
  endpoint: string,
  init: RequestInit,
  signal: AbortSignal,
): Promise<Response> {
  if (signal.aborted) throw abortError()
  const controller = new AbortController()
  let timedOut = false
  const onAbort = () => controller.abort()
  signal.addEventListener('abort', onAbort, { once: true })
  const timeout = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(endpoint, { ...init, signal: controller.signal })
    if (signal.aborted) throw abortError()
    return response
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError' && signal.aborted) throw error
    if (timedOut) throw new AuthServiceError('timeout', 'Request timed out.')
    throw new AuthServiceError('network', 'Request failed.')
  } finally {
    clearTimeout(timeout)
    signal.removeEventListener('abort', onAbort)
  }
}

async function readJson(response: Response, signal: AbortSignal): Promise<unknown> {
  try {
    const value: unknown = await response.json()
    if (signal.aborted) throw abortError()
    return value
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new AuthServiceError('protocol', 'Invalid JSON response.')
  }
}

function responseMessage(response: Response): string {
  return getHttpResponseMessage(response.headers) ?? '伺服器處理失敗，請稍後再試'
}

export async function loginUser(
  values: LoginFormValues,
  signal: AbortSignal,
): Promise<AuthSession> {
  let passwordHash: string
  try {
    passwordHash = await sha256(values.password)
  } catch {
    throw new AuthServiceError('crypto', 'Unable to hash password.')
  }
  if (!DIGEST_PATTERN.test(passwordHash)) throw new AuthServiceError('crypto', 'Invalid password digest.')

  for (const isForceLogin of [false, true]) {
    const payload: LoginRequestBody = { body: { info: { email: values.email, password: passwordHash, isForceLogin } } }
    const response = await request(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, signal)
    const status = getHttpResponseStatus(response.headers)
    const message = responseMessage(response)
    if (response.status === 409 && !isForceLogin) continue
    if (!response.ok || status !== 'success') {
      throw new AuthServiceError('http', message)
    }
    const body = await readJson(response, signal)
    const uid = response.headers.get('Uid')
    const authorization = response.headers.get('Authorization')
    const userName = record(body) && record(body.body) && record(body.body.info)
      ? body.body.info.userName
      : undefined
    if (!uid?.trim() || !authorization?.trim() || typeof userName !== 'string') {
      throw new AuthServiceError('protocol', 'Login response is missing required session data.')
    }
    return { uid, authorization, userName }
  }
  throw new AuthServiceError('http', '登入失敗，請稍後再試')
}

export async function logoutUser(
  session: AuthSession,
  signal: AbortSignal,
): Promise<void> {
  const payload = { body: { info: { userName: session.userName } } }
  const response = await request(LOGOUT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Uid: session.uid,
      Authorization: session.authorization,
    },
    body: JSON.stringify(payload),
  }, signal)
  const body = await readJson(response, signal)
  if (!response.ok || getHttpResponseStatus(response.headers) !== 'success') {
    throw new AuthServiceError('http', responseMessage(response))
  }
  if (!record(body)) throw new AuthServiceError('protocol', 'Invalid logout response.')
}
