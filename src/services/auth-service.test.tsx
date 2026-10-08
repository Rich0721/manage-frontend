import { afterEach, describe, expect, it, vi } from 'vitest'
import { loginUser, logoutUser } from './auth-service'
import type { AuthSession } from '../types/auth'

vi.mock('../utils/sha256', () => ({ sha256: vi.fn().mockResolvedValue('a'.repeat(64)) }))
const session: AuthSession = { uid: 'u1', authorization: 'token', userName: 'Tester' }
const successfulLogin = () => new Response(JSON.stringify({ body: { info: { userName: 'Tester' } } }), {
  status: 200, headers: { Status: 'Success', Message: 'Login successful', Uid: 'u1', Authorization: 'token' },
})

afterEach(() => vi.unstubAllGlobals())

describe('auth service HTTP header contract', () => {
  it('sends a SHA-256 login body and reads session values only from response headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(successfulLogin())
    vi.stubGlobal('fetch', fetchMock)
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal))
      .resolves.toEqual(session)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/userController/login')
    expect(JSON.parse(String(init.body))).toEqual({ body: {
      email: 'user@example.com', password: 'a'.repeat(64), isForceLogin: false,
    } })
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('retries once with force only after HTTP 409', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response('', { status: 409 }))
      .mockResolvedValueOnce(successfulLogin())
    vi.stubGlobal('fetch', fetchMock)
    await loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)).body.isForceLogin).toBe(true)
  })

  it('does not accept JSON credentials when HTTP response headers omit them', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      headers: { Uid: 'u1', Authorization: 'token' }, body: { info: { userName: 'Tester' } },
    }), { status: 200, headers: { Status: 'Success' } })))
    await expect(loginUser({ email: 'user@example.com', password: 'Password123' }, new AbortController().signal))
      .rejects.toMatchObject({ kind: 'protocol' })
  })

  it('sends logout credentials as HTTP headers and username in JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200, headers: { Status: 'Success' } }))
    vi.stubGlobal('fetch', fetchMock)
    await logoutUser(session, new AbortController().signal)
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(init.headers).toEqual({ 'Content-Type': 'application/json', Uid: 'u1', Authorization: 'token' })
    expect(JSON.parse(String(init.body))).toEqual({ body: { info: { userName: 'Tester' } } })
  })
})
