import type { AuthSession } from '../types/auth'
import type { CreateOrderInput, CreatedOrder } from '../types/sell'
import { getHttpResponseMessage } from './api-response'

const CREATE_ORDER_ENDPOINT = '/sellController/sellProduct'
const REQUEST_TIMEOUT_MS = 30_000

export type SellServiceErrorKind = 'unauthorized' | 'http' | 'protocol' | 'network' | 'timeout'

export class SellServiceError extends Error {
  readonly kind: SellServiceErrorKind

  constructor(kind: SellServiceErrorKind, message: string) {
    super(message)
    this.name = 'SellServiceError'
    this.kind = kind
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseCreatedOrder(value: unknown): CreatedOrder {
  if (!isRecord(value) || !isRecord(value.body) || !isRecord(value.body.info)) {
    throw new SellServiceError('protocol', '訂單回應格式錯誤')
  }
  const info = value.body.info
  if (typeof info.orderId !== 'string' || typeof info.totalAmount !== 'number' || !Number.isFinite(info.totalAmount) ||
    typeof info.totalDiscount !== 'number' || !Number.isFinite(info.totalDiscount) || !Array.isArray(info.orderItems)) {
    throw new SellServiceError('protocol', '訂單回應欄位格式錯誤')
  }
  const orderItems = info.orderItems.map((item) => {
    if (!isRecord(item) || typeof item.productId !== 'string' || typeof item.quantity !== 'number' ||
      !Number.isInteger(item.quantity) || item.quantity < 1 || typeof item.price !== 'number' ||
      !Number.isFinite(item.price) || typeof item.discount !== 'number' || !Number.isFinite(item.discount)) {
      throw new SellServiceError('protocol', '訂單明細回應欄位格式錯誤')
    }
    return { productId: item.productId, quantity: item.quantity, price: item.price, discount: item.discount }
  })
  return { orderId: info.orderId, totalAmount: info.totalAmount, totalDiscount: info.totalDiscount, orderItems }
}

export async function createOrder(session: AuthSession, input: CreateOrderInput, signal: AbortSignal): Promise<CreatedOrder> {
  if (signal.aborted) throw new DOMException('Request aborted.', 'AbortError')
  const controller = new AbortController()
  const onAbort = () => controller.abort()
  let timedOut = false
  signal.addEventListener('abort', onAbort, { once: true })
  const timeout = setTimeout(() => { timedOut = true; controller.abort() }, REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(CREATE_ORDER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Uid: session.uid, Authorization: session.authorization },
      body: JSON.stringify({ body: { info: input } }),
      signal: controller.signal,
    })
    if (signal.aborted) throw new DOMException('Request aborted.', 'AbortError')
    if (response.status === 401) throw new SellServiceError('unauthorized', '使用者未授權')
    if (response.status !== 200) {
      throw new SellServiceError('http', getHttpResponseMessage(response.headers) ?? '訂單建立失敗')
    }
    let responseBody: unknown
    try { responseBody = await response.json() as unknown }
    catch {
      if (timedOut) throw new SellServiceError('timeout', '訂單建立逾時，請確認訂單狀態')
      throw new SellServiceError('protocol', '訂單回應不是有效 JSON')
    }
    if (signal.aborted) throw new DOMException('Request aborted.', 'AbortError')
    return parseCreatedOrder(responseBody)
  } catch (error: unknown) {
    if (error instanceof SellServiceError) throw error
    if (error instanceof DOMException && error.name === 'AbortError' && signal.aborted) throw error
    if (timedOut) throw new SellServiceError('timeout', '訂單建立逾時，請確認訂單狀態')
    if (signal.aborted) throw new DOMException('Request aborted.', 'AbortError')
    throw new SellServiceError('network', '訂單建立失敗，請稍後再試')
  } finally {
    clearTimeout(timeout)
    signal.removeEventListener('abort', onAbort)
  }
}
