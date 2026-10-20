import { afterEach, describe, expect, it, vi } from 'vitest'
import { createOrder } from './sell-service'
import type { AuthSession } from '../types/auth'
import type { CreateOrderInput } from '../types/sell'

const session: AuthSession = { uid: 'u1', authorization: 'token', userName: 'Tester' }
const orderInput: CreateOrderInput = {
  totalAmount: 300,
  totalDiscount: 400,
  orderItems: [{ productId: '1000000000001', quantity: 2, price: 200, discount: 150 }],
}
const orderResponse = { body: { info: { orderId: 'o1', totalAmount: 300, totalDiscount: 400, orderItems: orderInput.orderItems } } }

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('createOrder', () => {
  it('posts the confirmed order with session HTTP headers and returns the validated result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(orderResponse), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createOrder(session, orderInput, new AbortController().signal)).resolves.toEqual(orderResponse.body.info)
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/sellController/sellProduct')
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe('POST')
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual({
      'Content-Type': 'application/json', Uid: 'u1', Authorization: 'token',
    })
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({ body: { info: orderInput } })
  })

  it('uses HTTP status to report an expired session', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })))
    await expect(createOrder(session, orderInput, new AbortController().signal)).rejects.toMatchObject({ kind: 'unauthorized' })
  })

  it('reports other HTTP errors without clearing a successful-looking response body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(orderResponse), { status: 400, headers: { Message: 'Bad request' } })))
    await expect(createOrder(session, orderInput, new AbortController().signal)).rejects.toMatchObject({ kind: 'http', message: 'Bad request' })
  })

  it('classifies unexpected HTTP status as an HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })))
    await expect(createOrder(session, orderInput, new AbortController().signal)).rejects.toMatchObject({ kind: 'http' })
  })

  it('rejects invalid order response data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{bad json', { status: 200 })))
    await expect(createOrder(session, orderInput, new AbortController().signal)).rejects.toMatchObject({ kind: 'protocol' })
  })

  it.each([
    ['missing totalDiscount', { orderId: 'o1', totalAmount: 300, orderItems: orderInput.orderItems }],
    ['invalid order item', { orderId: 'o1', totalAmount: 300, totalDiscount: 400, orderItems: [{ productId: 'p1', quantity: 0, price: 200, discount: 150 }] }],
  ])('rejects valid JSON with %s', async (_label, info) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ body: { info } }), { status: 200 })))
    await expect(createOrder(session, orderInput, new AbortController().signal)).rejects.toMatchObject({ kind: 'protocol' })
  })

  it('classifies network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    await expect(createOrder(session, orderInput, new AbortController().signal)).rejects.toMatchObject({ kind: 'network' })
  })

  it('propagates caller cancellation', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true })
    }))
    vi.stubGlobal('fetch', fetchMock)
    const pending = createOrder(session, orderInput, controller.signal)
    await Promise.resolve()
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('reports the service timeout separately from caller cancellation', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true })
    }))
    vi.stubGlobal('fetch', fetchMock)
    const pending = createOrder(session, orderInput, new AbortController().signal)
    const timedOut = expect(pending).rejects.toMatchObject({ kind: 'timeout' })

    await vi.advanceTimersByTimeAsync(30_000)
    await timedOut
  })
})
