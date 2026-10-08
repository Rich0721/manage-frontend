import { afterEach, describe, expect, it, vi } from 'vitest'
import { getProducts } from './product-service'
import type { AuthSession } from '../types/auth'

const session: AuthSession = { uid: 'u1', authorization: 'token', userName: 'Tester' }
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('product service', () => {
  it('requests all products with session headers and validates declared field types', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ body: { info: [
      { id: 'p1', name: 'Item', label_names: 'Group', cost: 0, price: 25 },
    ] } }), { status: 200, headers: { Status: 'Success', Message: 'OK' } }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(getProducts(session, new AbortController().signal)).resolves.toEqual([
      { id: 'p1', name: 'Item', label_names: 'Group', cost: 0, price: 25 },
    ])
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/productController/getProducts?productId=all')
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual({
      'Content-Type': 'application/json', Uid: 'u1', Authorization: 'token',
    })
  })

  it('rejects type mismatches rather than coercing strings or treating them as empty data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ body: { info: [
      { id: 'p1', name: 'Item', label_names: 'Group', cost: '0', price: 25 },
    ] } }), { status: 200, headers: { Status: 'Success' } })))
    await expect(getProducts(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'protocol' })
  })

  it('uses HTTP 401 to distinguish an expired session', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })))
    await expect(getProducts(session, new AbortController().signal)).rejects.toThrow('登入已逾期')
  })

  it.each([
    ['missing info', { body: {} }],
    ['non-array info', { body: { info: {} } }],
    ['null record', { body: { info: [null] } }],
    ['missing field', { body: { info: [{ id: 'p1', name: 'Item', label_names: 'Group', cost: 1 }] } }],
    ['numeric string', { body: { info: [{ id: 'p1', name: 'Item', label_names: 'Group', cost: '1', price: 2 }] } }],
  ])('rejects invalid successful payload: %s', async (_label, body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), {
      status: 200, headers: { Status: 'Success' },
    })))
    await expect(getProducts(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'protocol' })
  })

  it('returns a successful empty collection', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"body":{"info":[]}}', {
      status: 200, headers: { Status: 'Success' },
    })))
    await expect(getProducts(session, new AbortController().signal)).resolves.toEqual([])
  })

  it('uses only the HTTP Status header and rejects JSON header fallback', async () => {
    const jsonOnlyStatus = new Response(JSON.stringify({
      headers: { Status: 'Success' }, body: { info: [] },
    }), { status: 200 })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonOnlyStatus))
    await expect(getProducts(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'protocol' })
  })

  it('uses the HTTP Status header when the JSON header conflicts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      headers: { Status: 'Failed' }, body: { info: [] },
    }), { status: 200, headers: { Status: 'Success' } })))
    await expect(getProducts(session, new AbortController().signal)).resolves.toEqual([])
  })

  it('keeps non-401 HTTP failures separate from session expiry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', {
      status: 403, headers: { Status: 'Failed', Message: 'Forbidden' },
    })))
    await expect(getProducts(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'http' })
  })

  it('classifies network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    await expect(getProducts(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'network' })
  })

  it('propagates cancellation without converting it to an error', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Request aborted.', 'AbortError')), { once: true })
    }))
    vi.stubGlobal('fetch', fetchMock)
    const pendingProducts = getProducts(session, controller.signal)
    await Promise.resolve()
    controller.abort()
    await expect(pendingProducts).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('classifies internal request timeouts', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Request timed out.', 'AbortError')), { once: true })
    }))
    vi.stubGlobal('fetch', fetchMock)
    const pendingProducts = getProducts(session, new AbortController().signal)
    const productResult = pendingProducts.then(() => undefined, (error: unknown) => error)
    await vi.advanceTimersByTimeAsync(30_000)
    expect(await productResult).toMatchObject({ kind: 'timeout' })
  })
})
