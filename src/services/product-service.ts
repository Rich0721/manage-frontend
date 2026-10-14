import type { AuthSession, Product } from '../types/auth'
import { getHttpResponseMessage, getHttpResponseStatus } from './api-response'
import { AuthServiceError } from './auth-service'

const PRODUCTS_ENDPOINT = '/productController/getProducts'
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

function productsEndpoint(productId: string): string {
  return `${PRODUCTS_ENDPOINT}?productId=${encodeURIComponent(productId)}`
}

async function requestResponse<T>(
  endpoint: string,
  session: AuthSession,
  signal: AbortSignal,
  method: string,
  read: (response: Response) => Promise<T>,
  body?: BodyInit,
  contentType?: string,
  readErrorMessage = '產品回應不是有效 JSON',
): Promise<{ response: Response; body: T }> {
  if (signal.aborted) throw abortError()
  const controller = new AbortController()
  let timedOut = false
  const onAbort = () => controller.abort()
  signal.addEventListener('abort', onAbort, { once: true })
  const timeout = setTimeout(() => { timedOut = true; controller.abort() }, REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(endpoint, {
      method,
      headers: { ...(contentType ? { 'Content-Type': contentType } : {}), Uid: session.uid, Authorization: session.authorization },
      ...(body ? { body } : {}),
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
    let result: T
    try { result = await read(response) }
    catch {
      if (signal.aborted) throw abortError()
      if (timedOut) throw new ProductServiceError('timeout', '產品操作逾時，請重新查詢結果')
      throw new ProductServiceError('protocol', readErrorMessage)
    }
    if (signal.aborted) throw abortError()
    return { response, body: result }
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

function request(
  endpoint: string,
  session: AuthSession,
  signal: AbortSignal,
  method: string,
  payload?: { info: ProductWriteInput | { id: string } },
): Promise<{ response: Response; body: unknown }> {
  return requestResponse(endpoint, session, signal, method, (response) => response.json() as Promise<unknown>,
    payload ? JSON.stringify({ body: { info: payload.info } }) : undefined, 'application/json')
}

function requestDownload(endpoint: string, session: AuthSession, signal: AbortSignal, payload?: { ids: string }): Promise<{ response: Response; body: Blob }> {
  return requestResponse(endpoint, session, signal, payload ? 'POST' : 'GET', (response) => response.blob(),
    payload ? JSON.stringify({ body: { info: payload } }) : undefined, 'application/json', '下載檔案回應格式錯誤')
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

function parseDetail(body: unknown, productId: string): Product {
  const products = parseCollection(body)
  if (products.length !== 1 || products[0].id !== productId) {
    throw new ProductServiceError('protocol', '商品詳情回應格式錯誤')
  }
  return products[0]
}

export async function getProducts(session: AuthSession, signal: AbortSignal): Promise<Product[]> {
  const { body } = await request(productsEndpoint('all'), session, signal, 'GET')
  return parseCollection(body)
}

export async function getProduct(session: AuthSession, productId: string, signal: AbortSignal): Promise<Product> {
  const { body } = await request(productsEndpoint(productId), session, signal, 'GET')
  return parseDetail(body, productId)
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

export async function uploadProducts(session: AuthSession, file: File, signal: AbortSignal): Promise<Product[]> {
  const form = new FormData()
  form.append('file', file)
  const { body } = await requestResponse('/productController/batchProducts', session, signal, 'POST',
    (response) => response.json() as Promise<unknown>, form)
  return parseCollection(body)
}

export interface ProductDownload {
  blob: Blob
  filename: string
}

function downloadFilename(response: Response, fallback: string): string {
  const disposition = response.headers.get('Content-Disposition')
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const plain = disposition?.match(/filename="?([^";]+)"?/i)?.[1]
  let name = fallback
  try { name = encoded ? decodeURIComponent(encoded) : plain ?? fallback } catch { return fallback }
  return name.trim() && !/[\\/\r\n]/.test(name) ? name : fallback
}

function parseDownload(response: Response, blob: Blob, fallback: string): ProductDownload {
  const type = response.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase()
  const isExcelType = !type || [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream',
    'application/zip',
  ].includes(type)
  if (!blob.size || !isExcelType) {
    throw new ProductServiceError('protocol', '下載檔案回應格式錯誤')
  }
  return { blob, filename: downloadFilename(response, fallback) }
}

export async function downloadProductTemplate(session: AuthSession, signal: AbortSignal): Promise<ProductDownload> {
  const { response, body } = await requestDownload('/productController/downloadTemplate', session, signal)
  return parseDownload(response, body, 'product-template.xlsx')
}

export async function downloadProductData(session: AuthSession, ids: string[], signal: AbortSignal): Promise<ProductDownload> {
  const { response, body } = await requestDownload('/productController/downloadProductData', session, signal, { ids: ids.join(',') })
  return parseDownload(response, body, 'product-report.xlsx')
}
