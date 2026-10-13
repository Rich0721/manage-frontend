import type { AuthSession, Product } from '../types/auth'
import { getHttpResponseMessage, getHttpResponseStatus } from './api-response'
import { AuthServiceError } from './auth-service'

const PRODUCTS_ENDPOINT = '/productController/getProducts?productId=all'
const REQUEST_TIMEOUT_MS = 30_000

export interface ProductWriteInput {
  id?: string
  name: string
  label_names: string
  cost: number
  price: number
}

export type ProductServiceErrorKind = 'unauthorized' | 'not-found' | 'conflict' | 'http' | 'protocol' | 'network' | 'timeout'

export class ProductServiceError extends Error {
  readonly kind: ProductServiceErrorKind

  constructor(kind: ProductServiceErrorKind, message: string) {
    super(message)
    this.name = 'ProductServiceError'
    this.kind = kind
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function abortError(): DOMException {
  return new DOMException('Request aborted.', 'AbortError')
}

function parseProduct(value: unknown): Product {
  if (!record(value) || typeof value.id !== 'string' || typeof value.name !== 'string' ||
    typeof value.label_names !== 'string' || typeof value.cost !== 'number' || !Number.isFinite(value.cost) || value.cost < 1 ||
    typeof value.price !== 'number' || !Number.isFinite(value.price) || value.price < 1) {
    throw new ProductServiceError('protocol', '產品回應欄位格式錯誤')
  }
  const stock = value.stock === undefined ? 0 : value.stock
  if (typeof stock !== 'number' || !Number.isFinite(stock) || stock < 0) {
    throw new ProductServiceError('protocol', '產品回應欄位格式錯誤')
  }
  return {
    id: value.id,
    name: value.name,
    label_names: value.label_names,
    cost: value.cost,
    price: value.price,
    stock,
  }
}

async function request(
  endpoint: string,
  session: AuthSession,
  signal: AbortSignal,
  method: string,
  payload?: { info: ProductWriteInput | { id: string } },
): Promise<{ response: Response; body: unknown }> {
  if (signal.aborted) throw abortError()
  const controller = new AbortController()
  let timedOut = false
  const onAbort = () => controller.abort()
  signal.addEventListener('abort', onAbort, { once: true })
  const timeout = setTimeout(() => { timedOut = true; controller.abort() }, REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json', Uid: session.uid, Authorization: session.authorization },
      ...(payload ? { body: JSON.stringify({ body: { info: payload.info } }) } : {}),
      signal: controller.signal,
    })
    if (signal.aborted) throw abortError()
    if (response.status === 401) throw new ProductServiceError('unauthorized', '使用者未授權')
    if (response.status === 404) throw new ProductServiceError('not-found', getHttpResponseMessage(response.headers) ?? '找不到商品')
    if (response.status === 409) throw new ProductServiceError('conflict', getHttpResponseMessage(response.headers) ?? '商品產生ID衝突，請重新送出')
    if (!response.ok) throw new ProductServiceError('http', getHttpResponseMessage(response.headers) ?? '產品操作失敗')
    const status = getHttpResponseStatus(response.headers)
    if (!status) throw new ProductServiceError('protocol', '產品回應缺少 HTTP Status')
    if (status !== 'success') throw new ProductServiceError('http', getHttpResponseMessage(response.headers) ?? '產品操作失敗')
    let body: unknown
    try { body = await response.json() }
    catch {
      if (signal.aborted) throw abortError()
      if (timedOut) throw new ProductServiceError('timeout', '產品操作逾時，請重新查詢結果')
      throw new ProductServiceError('protocol', '產品回應不是有效 JSON')
    }
    if (signal.aborted) throw abortError()
    return { response, body }
  } catch (error: unknown) {
    if (error instanceof ProductServiceError) throw error
    if (error instanceof AuthServiceError) throw error
    if (error instanceof DOMException && error.name === 'AbortError' && signal.aborted) throw error
    if (timedOut) throw new ProductServiceError('timeout', '產品操作逾時，請重新查詢結果')
    if (signal.aborted) throw abortError()
    throw new ProductServiceError('network', '產品操作失敗，請稍後再試')
  } finally {
    clearTimeout(timeout)
    signal.removeEventListener('abort', onAbort)
  }
}

function parseCollection(body: unknown): Product[] {
  if (!record(body) || !record(body.body) || !Array.isArray(body.body.info)) {
    throw new ProductServiceError('protocol', '產品清單回應格式錯誤')
  }
  return body.body.info.map(parseProduct)
}

function parseSingle(body: unknown): Product {
  if (!record(body) || !record(body.body) || !record(body.body.info)) {
    throw new ProductServiceError('protocol', '商品回應格式錯誤')
  }
  return parseProduct(body.body.info)
}

export async function getProducts(session: AuthSession, signal: AbortSignal): Promise<Product[]> {
  const { body } = await request(PRODUCTS_ENDPOINT, session, signal, 'GET')
  return parseCollection(body)
}

export async function getProduct(session: AuthSession, productId: string, signal: AbortSignal): Promise<Product> {
  const endpoint = `/productController/getProduct?productId=${encodeURIComponent(productId)}`
  const { body } = await request(endpoint, session, signal, 'GET')
  return parseSingle(body)
}

export async function addProduct(session: AuthSession, input: ProductWriteInput, signal: AbortSignal): Promise<Product> {
  const info = { name: input.name, label_names: input.label_names, cost: input.cost, price: input.price }
  const { body } = await request('/productController/addProduct', session, signal, 'POST', { info })
  return parseSingle(body)
}

export async function updateProduct(session: AuthSession, input: ProductWriteInput & { id: string }, signal: AbortSignal): Promise<Product> {
  const info = { id: input.id, name: input.name, label_names: input.label_names, cost: input.cost, price: input.price }
  const { body } = await request('/productController/updateProduct', session, signal, 'PUT', { info })
  return parseSingle(body)
}

export async function deleteProduct(session: AuthSession, productId: string, signal: AbortSignal): Promise<void> {
  const { body } = await request('/productController/deleteProduct', session, signal, 'DELETE', { info: { id: productId } })
  if (!record(body) || !record(body.body) || !record(body.body.info) || body.body.info.id !== productId) {
    throw new ProductServiceError('protocol', '刪除商品回應格式錯誤')
  }
}
