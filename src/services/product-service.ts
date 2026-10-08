import type { AuthSession, Product } from '../types/auth'
import { getHttpResponseMessage, getHttpResponseStatus } from './api-response'
import { AuthServiceError } from './auth-service'

const PRODUCTS_ENDPOINT = '/productController/getProducts?productId=all'
const REQUEST_TIMEOUT_MS = 30_000

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseProducts(value: unknown): Product[] {
  if (!record(value) || !record(value.body) || !Array.isArray(value.body.info)) {
    throw new AuthServiceError('protocol', 'Invalid products response.')
  }
  return value.body.info.map((item: unknown) => {
    if (!record(item) || typeof item.id !== 'string' || typeof item.name !== 'string' ||
      typeof item.label_names !== 'string' || typeof item.cost !== 'number' ||
      !Number.isFinite(item.cost) || typeof item.price !== 'number' || !Number.isFinite(item.price)) {
      throw new AuthServiceError('protocol', 'Invalid product record.')
    }
    return { id: item.id, name: item.name, label_names: item.label_names, cost: item.cost, price: item.price }
  })
}

export async function getProducts(session: AuthSession, signal: AbortSignal): Promise<Product[]> {
  const controller = new AbortController()
  let timedOut = false
  const abort = () => controller.abort()
  signal.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(() => { timedOut = true; controller.abort() }, REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(PRODUCTS_ENDPOINT, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Uid: session.uid, Authorization: session.authorization },
      signal: controller.signal,
    })
    if (response.status === 401) throw new AuthServiceError('unauthorized', '登入已逾期，請重新登入')
    if (!response.ok) throw new AuthServiceError('http', getHttpResponseMessage(response.headers) ?? '產品載入失敗')
    const status = getHttpResponseStatus(response.headers)
    if (!status) throw new AuthServiceError('protocol', '產品回應缺少 HTTP Status')
    if (status !== 'success') {
      throw new AuthServiceError('http', getHttpResponseMessage(response.headers) ?? '產品載入失敗')
    }
    let body: unknown
    try { body = await response.json() }
    catch { throw new AuthServiceError('protocol', '產品回應不是有效 JSON') }
    if (signal.aborted) throw new DOMException('Request aborted.', 'AbortError')
    return parseProducts(body)
  } catch (error: unknown) {
    if (error instanceof AuthServiceError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (signal.aborted) throw error
      if (timedOut) throw new AuthServiceError('timeout', '產品載入逾時')
    }
    if (timedOut) throw new AuthServiceError('timeout', '產品載入逾時')
    if (signal.aborted) throw new DOMException('Request aborted.', 'AbortError')
    throw new AuthServiceError('network', '產品載入失敗，請稍後再試')
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', abort)
  }
}
