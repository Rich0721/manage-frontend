import { afterEach, describe, expect, it, vi } from 'vitest'
import { getProducts } from './product-service'
import type { AuthSession } from '../types/auth'

const session: AuthSession = { uid: 'u1', authorization: 'token', userName: 'Tester' }
afterEach(() => vi.unstubAllGlobals())

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
})
