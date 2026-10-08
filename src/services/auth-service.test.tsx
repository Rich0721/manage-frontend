import { afterEach, describe, expect, it, vi } from 'vitest'
import { loginUser, logoutUser } from './auth-service'
import { sha256 } from '../utils/sha256'
import type { AuthSession } from '../types/auth'

vi.mock('../utils/sha256', () => ({ sha256: vi.fn().mockResolvedValue('a'.repeat(64)) }))
const session: AuthSession = { uid: 'u1', authorization: 'token', userName: 'Tester' }
const successfulLogin = () => new Response(JSON.stringify({ body: { info: { userName: 'Tester' } } }), {
  status: 200, headers: { Status: 'Success', Message: 'Login successful', Uid: 'u1', Authorization: 'token' },
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.mocked(sha256).mockReset().mockResolvedValue('a'.repeat(64))
})

describe('auth service HTTP header contract', () => {
  it('sends a SHA-256 login body and reads session values only from response headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(successfulLogin())
    vi.stubGlobal('fetch', fetchMock)
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal))
      .resolves.toEqual(session)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/userController/login')
    expect(JSON.parse(String(init.body))).toEqual({ body: { info: {
      email: 'user@example.com', password: 'a'.repeat(64), isForceLogin: false,
    } } })
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(sha256).toHaveBeenCalledOnce()
    expect(sha256).toHaveBeenCalledWith('Password123')
  })

  it('retries once with force only after HTTP 409', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response('', { status: 409 }))
      .mockResolvedValueOnce(successfulLogin())
    vi.stubGlobal('fetch', fetchMock)
    await loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)).body.info).toEqual({
      email: 'user@example.com', password: 'a'.repeat(64), isForceLogin: true,
    })
  })

  it('does not retry unauthorized or non-conflict failures', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', {
      status: 401, headers: { Status: 'Failed', Message: 'User login failed' },
    }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal))
      .rejects.toMatchObject({ kind: 'http' })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('stops after a second conflict response', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 409, headers: { Status: 'Failed' } }))
      .mockResolvedValueOnce(new Response('{}', { status: 409, headers: { Status: 'Failed' } }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal))
      .rejects.toMatchObject({ kind: 'http' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('classifies a successful HTTP response without Status as a protocol error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })))
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal))
      .rejects.toMatchObject({ kind: 'protocol' })
  })

  it('classifies a request timeout', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Request timed out.', 'AbortError')), { once: true })
    })))
    const pendingLogin = loginUser(
      { email: 'user@example.com', password: 'Password123' },
      new AbortController().signal,
    )
    const loginResult = pendingLogin.then(() => undefined, (error: unknown) => error)
    await vi.advanceTimersByTimeAsync(30_000)
    expect(await loginResult).toMatchObject({ kind: 'timeout' })
  })

  it('does not send a request when hashing fails', async () => {
    vi.mocked(sha256).mockRejectedValueOnce(new Error('crypto unavailable'))
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal))
      .rejects.toMatchObject({ kind: 'crypto' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not issue the force retry when cancelled after the first conflict', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn().mockImplementationOnce(() => {
      controller.abort()
      return Promise.resolve(new Response('', { status: 409 }))
    })
    vi.stubGlobal('fetch', fetchMock)
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, controller.signal))
      .rejects.toMatchObject({ name: 'AbortError' })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('classifies an invalid successful response body as a protocol error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json', {
      status: 200, headers: { Status: 'Success', Uid: 'u1', Authorization: 'token' },
    })))
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal))
      .rejects.toMatchObject({ kind: 'protocol' })
  })

  it('does not accept JSON credentials when HTTP response headers omit them', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      headers: { Uid: 'u1', Authorization: 'token' }, body: { info: { userName: 'Tester' } },
    }), { status: 200, headers: { Status: 'Success' } })))
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal))
      .rejects.toMatchObject({ kind: 'protocol' })
  })

  it.each([
    ['Uid', { Status: 'Success', Authorization: 'token' }],
    ['Authorization', { Status: 'Success', Uid: 'u1' }],
  ])('requires the HTTP %s response header', async (_headerName, headers) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ body: { info: { userName: 'Tester' } } }),
      { status: 200, headers },
    )))
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal))
      .rejects.toMatchObject({ kind: 'protocol' })
  })

  it('uses HTTP response headers when JSON contains conflicting header values', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      headers: { Uid: 'json-user', Authorization: 'json-token' },
      body: { info: { userName: 'Tester' } },
    }), {
      status: 200,
      headers: { Status: 'Success', Uid: 'http-user', Authorization: 'http-token' },
    })))
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal))
      .resolves.toEqual({ uid: 'http-user', authorization: 'http-token', userName: 'Tester' })
  })

  it('sends logout credentials as HTTP headers and username in JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200, headers: { Status: 'Success' } }))
    vi.stubGlobal('fetch', fetchMock)
    await logoutUser(session, new AbortController().signal)
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(init.headers).toEqual({ 'Content-Type': 'application/json', Uid: 'u1', Authorization: 'token' })
    expect(JSON.parse(String(init.body))).toEqual({ body: { info: { userName: 'Tester' } } })
  })

  it('reports logout HTTP failures while allowing the caller to finish cleanup', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', {
      status: 500, headers: { Status: 'Failed', Message: 'Unavailable' },
    })))
    await expect(logoutUser(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'http' })
  })

  it('reports logout business failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', {
      status: 200, headers: { Status: 'Failed', Message: 'Logout rejected' },
    })))
    await expect(logoutUser(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'http' })
  })

  it('classifies a successful logout response without Status as a protocol error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })))
    await expect(logoutUser(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'protocol' })
  })

  it('classifies logout network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network error')))
    await expect(logoutUser(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'network' })
  })
})
