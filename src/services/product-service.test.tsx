import { afterEach, describe, expect, it, vi } from 'vitest'
import { addProduct, deleteProduct, downloadProductData, downloadProductTemplate, getProduct, getProducts, ProductServiceError, updateProduct, uploadProducts } from './product-service'
import type { ProductWriteInput } from './product-service'
import type { AuthSession } from '../types/auth'

const session: AuthSession = { uid: 'u1', authorization: 'token', userName: 'Tester' }
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('product service', () => {
  it('requests all products with session headers and validates declared field types', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ body: { info: [
      { id: 'p1', name: 'Item', label_names: 'Group', cost: 1, price: 25, stock: 7 },
    ] } }), { status: 200, headers: { Status: 'Success', Message: 'OK' } }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(getProducts(session, new AbortController().signal)).resolves.toEqual([
      { id: 'p1', name: 'Item', label_names: 'Group', cost: 1, price: 25, stock: 7 },
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

  it('rejects invalid JSON in a successful response as a protocol error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{bad json', {
      status: 200, headers: { Status: 'Success' },
    })))
    await expect(getProducts(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'protocol' })
  })

  it('uses HTTP 401 to distinguish an expired session', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })))
    await expect(getProducts(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'unauthorized' })
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

  it('defaults omitted stock to zero and preserves a valid stock Number', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ body: { info: [
      { id: 'p1', name: 'Item', label_names: 'A,B', cost: 1, price: 2 },
      { id: 'p2', name: 'Item 2', label_names: 'A', cost: 1, price: 2, stock: 3 },
    ] } }), { status: 200, headers: { Status: 'Success' } })))
    await expect(getProducts(session, new AbortController().signal)).resolves.toMatchObject([{ stock: 0, label_names: 'A,B' }, { stock: 3 }])
  })

  it.each([
    ['cost below the form minimum', { cost: 0, price: 2, stock: 0 }],
    ['price below the form minimum', { cost: 1, price: -1, stock: 0 }],
    ['negative stock', { cost: 1, price: 2, stock: -1 }],
    ['null stock', { cost: 1, price: 2, stock: null }],
    ['string stock', { cost: 1, price: 2, stock: '3' }],
  ])('rejects successful product responses with %s', async (_label, numbers) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ body: { info: [
      { id: 'p1', name: 'Item', label_names: 'A', ...numbers },
    ] } }), { status: 200, headers: { Status: 'Success' } })))
    await expect(getProducts(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'protocol' })
  })

  it('sends one complete numeric update with identity in HTTP headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ body: { info: {
      id: 'p1', name: 'Item', label_names: 'A,B', cost: 10, price: 20,
    } } }), { status: 200, headers: { Status: 'Success' } }))
    vi.stubGlobal('fetch', fetchMock)
    const input = { id: 'p1', name: 'Item', label_names: 'A,B', cost: 10, price: 20 }
    await expect(updateProduct(session, input, new AbortController().signal)).resolves.toMatchObject({ stock: 0 })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/productController/updateProduct')
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe('PUT')
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({ Uid: 'u1', Authorization: 'token' })
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({ body: { info: input } })
  })

  it('maps create and update payloads to only the fields allowed by the API contract', async () => {
    const fetchMock = vi.fn().mockImplementation(() => new Response(JSON.stringify({ body: { info: {
      id: 'p1', name: 'Item', label_names: 'A', cost: 1, price: 2,
    } } }), { status: 200, headers: { Status: 'Success' } }))
    vi.stubGlobal('fetch', fetchMock)
    const input = { id: 'must-not-be-created-with-this-id', name: 'Item', label_names: 'A', cost: 1, price: 2, stock: 0, updated_user: 'forbidden' } as unknown as ProductWriteInput
    await expect(addProduct(session, input, new AbortController().signal)).resolves.toMatchObject({ stock: 0 })
    await updateProduct(session, { ...input, id: 'p1' }, new AbortController().signal)
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({ body: { info: {
      name: 'Item', label_names: 'A', cost: 1, price: 2,
    } } })
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({ body: { info: {
      id: 'p1', name: 'Item', label_names: 'A', cost: 1, price: 2,
    } } })
  })

  it('propagates external cancellation while reading the response body', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      const response = new Response('{}', { status: 200, headers: { Status: 'Success' } })
      vi.spyOn(response, 'json').mockImplementation(() => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
      }))
      return Promise.resolve(response)
    })
    vi.stubGlobal('fetch', fetchMock)
    const pending = getProducts(session, controller.signal)
    await Promise.resolve()
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('classifies a timeout while reading the response body as timeout', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      const response = new Response('{}', { status: 200, headers: { Status: 'Success' } })
      vi.spyOn(response, 'json').mockImplementation(() => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')), { once: true })
      }))
      return Promise.resolve(response)
    })
    vi.stubGlobal('fetch', fetchMock)
    const pending = getProducts(session, new AbortController().signal).then(() => undefined, (error: unknown) => error)
    await vi.advanceTimersByTimeAsync(30_000)
    expect(await pending).toMatchObject({ kind: 'timeout' })
  })

  it('encodes detail identifiers and sends add and delete payloads in one request each', async () => {
    const detail = {
      id: 'p /1', name: 'Item', label_names: 'A', cost: 1, price: 2, stock: 0,
    }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ body: { info: [detail] } }), { status: 200, headers: { Status: 'Success' } }))
      .mockImplementation(() => new Response(JSON.stringify({ body: { info: detail } }), { status: 200, headers: { Status: 'Success' } }))
    vi.stubGlobal('fetch', fetchMock)
    await getProduct(session, 'p /1', new AbortController().signal)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/productController/getProducts?productId=p%20%2F1')
    await addProduct(session, { name: 'Item', label_names: 'A', cost: 1, price: 2 }, new AbortController().signal)
    await deleteProduct(session, 'p /1', new AbortController().signal)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe('POST')
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toEqual({ body: { info: { id: 'p /1' } } })
  })

  it('defaults stock to zero for a detail response without the field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ body: { info: [{
      id: 'p1', name: 'Item', label_names: 'A', cost: 1, price: 2,
    }] } }), { status: 200, headers: { Status: 'Success' } })))
    await expect(getProduct(session, 'p1', new AbortController().signal)).resolves.toMatchObject({ stock: 0 })
  })

  it('classifies create conflicts with the required retry message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 409 })))
    await expect(addProduct(session, { name: 'Item', label_names: 'A', cost: 1, price: 2 }, new AbortController().signal))
      .rejects.toMatchObject(new ProductServiceError('conflict', '商品產生ID衝突，請重新送出'))
  })

  it('rejects a malformed successful mutation response instead of reporting success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ body: { info: [] } }), {
      status: 200, headers: { Status: 'Success' },
    })))
    await expect(addProduct(session, { name: 'Item', label_names: 'A', cost: 1, price: 2 }, new AbortController().signal))
      .rejects.toMatchObject({ kind: 'protocol' })
  })

  it.each([
    { label: 'empty', info: [] },
    { label: 'multiple', info: [{ id: 'p1', name: 'Item', label_names: 'A', cost: 1, price: 2 }, { id: 'p2', name: 'Other', label_names: 'A', cost: 1, price: 2 }] },
    { label: 'different ID', info: [{ id: 'wrong', name: 'Item', label_names: 'A', cost: 1, price: 2 }] },
  ])('rejects a $label detail array without exactly the requested product', async ({ info }) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ body: { info } }), { status: 200, headers: { Status: 'Success' } })))
    await expect(getProduct(session, 'p1', new AbortController().signal)).rejects.toMatchObject({ kind: 'protocol' })
  })

  it('uploads the selected File in multipart form data without setting Content-Type and validates products', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ body: { info: [
      { id: 'p1', name: 'Item', label_names: 'A', cost: 1, price: 2 },
    ] } }), { status: 200, headers: { Status: 'Success' } }))
    vi.stubGlobal('fetch', fetchMock)
    const file = new File(['excel'], 'products.xlsx')
    await expect(uploadProducts(session, file, new AbortController().signal)).resolves.toMatchObject([{ id: 'p1', stock: 0 }])
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/productController/batchProducts')
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ Uid: 'u1', Authorization: 'token' })
    expect(init.body).toBeInstanceOf(FormData)
    expect((init.body as FormData).get('file')).toBe(file)
  })

  it('keeps upload 400 and 401 failures separate', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 400, headers: { Message: 'Invalid file' } }))
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)
    const file = new File(['x'], 'products.xlsx')
    await expect(uploadProducts(session, file, new AbortController().signal)).rejects.toMatchObject({ kind: 'http', message: 'Invalid file' })
    await expect(uploadProducts(session, file, new AbortController().signal)).rejects.toMatchObject({ kind: 'unauthorized' })
  })

  it('downloads Excel bytes and uses response or fallback filenames', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('template bytes', { status: 200, headers: { Status: 'Success', 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } }))
      .mockResolvedValueOnce(new Response('report bytes', { status: 200, headers: { Status: 'Success', 'Content-Disposition': 'attachment; filename="report.xlsx"' } }))
    vi.stubGlobal('fetch', fetchMock)
    const template = await downloadProductTemplate(session, new AbortController().signal)
    expect(template.filename).toBe('product-template.xlsx')
    expect(await template.blob.text()).toBe('template bytes')
    const report = await downloadProductData(session, ['p1', 'p2'], new AbortController().signal)
    expect(report.filename).toBe('report.xlsx')
    expect(await report.blob.text()).toBe('report bytes')
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/productController/downloadTemplate')
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/productController/downloadProductData')
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toEqual({ 'Content-Type': 'application/json', Uid: 'u1', Authorization: 'token' })
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({ body: { info: { ids: 'p1,p2' } } })
  })

  it('does not download an empty or JSON success body as Excel', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200, headers: { Status: 'Success', 'Content-Type': 'application/json' } })))
    await expect(downloadProductTemplate(session, new AbortController().signal)).rejects.toMatchObject({ kind: 'protocol' })
  })
})
