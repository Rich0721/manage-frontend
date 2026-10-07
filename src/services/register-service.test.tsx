import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerUser } from './register-service'
import type { RegisterFormValues } from '../types/register'
import * as sha256Module from '../utils/sha256'

const values: RegisterFormValues = {
  name: 'user123',
  email: 'user@example.com',
  password: 'ValidPass123',
  confirmPassword: 'ValidPass123',
}

const successResponse = {
  header: {
    'Content-Type': 'application/json',
    Status: 'Success',
    Message: 'User registered successfully',
  },
  body: {
    info: { uid: 'user-id', email: 'user@example.com', username: 'user123' },
  },
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('registerUser', () => {
  it('posts a JSON envelope with hashes and maps name to username', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(successResponse), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(registerUser(values, new AbortController().signal)).resolves.toEqual({
      status: 'success',
      message: 'User registered successfully',
    })

    const [uri, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    const payload = JSON.parse(request.body as string) as {
      header: { 'Content-Type': string }
      body: { info: Record<string, string> }
    }
    expect(uri).toBe('/userController/register')
    expect(request.method).toBe('POST')
    expect(request.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(payload.header['Content-Type']).toBe('application/json')
    expect(payload.body.info.email).toBe(values.email)
    expect(payload.body.info.username).toBe(values.name)
    expect(payload.body.info.password).toMatch(/^[0-9a-f]{64}$/)
    expect(payload.body.info.confirmPassword).toBe(payload.body.info.password)
    expect(JSON.stringify(payload)).not.toContain(values.password)
  })

  it('returns API messages for failed and non-2xx responses and rejects malformed responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({
        header: { Status: 'Failed', Message: '此帳號已存在' },
        body: { info: {} },
      }), { status: 200 }),
    ))
    await expect(registerUser(values, new AbortController().signal)).resolves.toEqual({
      status: 'failed',
      message: '此帳號已存在',
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          header: { Status: 'Failed', Message: '帳號已存在' },
          body: { info: {} },
        }),
        { status: 409 },
      ),
    ))
    await expect(registerUser(values, new AbortController().signal)).rejects.toMatchObject({
      kind: 'http',
      message: '帳號已存在',
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('upstream error', { status: 502 }),
    ))
    await expect(registerUser(values, new AbortController().signal)).rejects.toMatchObject({
      kind: 'protocol',
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        header: { Status: 'unknown', Message: 'unexpected' },
      }), { status: 200 }),
    ))
    await expect(registerUser(values, new AbortController().signal)).rejects.toMatchObject({
      kind: 'protocol',
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{', { status: 200 })))
    await expect(registerUser(values, new AbortController().signal)).rejects.toMatchObject({
      kind: 'protocol',
    })
  })

  it('accepts a retry success with different header casing and an empty info object', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        header: { Status: 'Failed', Message: '帳號已存在' },
        body: { info: {} },
      }), { status: 409 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        header: { status: 'success', message: '註冊成功' },
        body: { info: {} },
      }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(registerUser(values, new AbortController().signal)).rejects.toMatchObject({
      kind: 'http',
      message: '帳號已存在',
    })
    await expect(registerUser({ ...values, email: 'new@example.com' }, new AbortController().signal))
      .resolves.toEqual({ status: 'success', message: '註冊成功' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not send a request after caller cancellation', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()
    controller.abort()

    await expect(registerUser(values, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not send a request when Web Crypto fails or returns an invalid digest', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(sha256Module, 'sha256').mockRejectedValueOnce(new Error('digest failed'))
    await expect(registerUser(values, new AbortController().signal)).rejects.toMatchObject({
      kind: 'crypto',
    })
    expect(fetchMock).not.toHaveBeenCalled()

    vi.spyOn(sha256Module, 'sha256').mockResolvedValue('not-a-64-character-hash')
    await expect(registerUser(values, new AbortController().signal)).rejects.toMatchObject({
      kind: 'crypto',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('aborts a request that exceeds the timeout', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn((_uri: string, request: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        request.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const request = registerUser(values, new AbortController().signal)
    const rejection = expect(request).rejects.toMatchObject({ kind: 'timeout' })
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    await vi.advanceTimersByTimeAsync(30_000)
    await rejection
  })
})
