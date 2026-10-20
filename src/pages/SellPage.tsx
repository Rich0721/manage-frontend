import { useEffect, useRef, useState } from 'react'
import type { AuthSession } from '../types/auth'
import type { CreateOrderInput, SellLineItem } from '../types/sell'
import { getProduct, ProductServiceError } from '../services/product-service'
import { createOrder, SellServiceError } from '../services/sell-service'
import { SiteHeader } from '../components/SiteHeader/SiteHeader'
import { Modal } from '../components/Modal/Modal'
import { Button } from '../components/Button/Button'
import { SellProductTable } from '../components/SellProductTable/SellProductTable'
import { SellAmountPanel } from '../components/SellAmountPanel/SellAmountPanel'
import { parsePositiveInteger } from './sell-validation'
import './SellPage.css'

interface SellPageProps {
  session: AuthSession
  onLogout: () => void
  onSessionExpired: (message?: string) => void
  onNavigateProducts: () => void
}

function lineTotal(items: SellLineItem[]): number {
  return items.reduce((total, item) => total + item.adjustedPrice * item.quantity, 0)
}

function serviceMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function SellPage({ session, onLogout, onSessionExpired, onNavigateProducts }: SellPageProps) {
  const [items, setItems] = useState<SellLineItem[]>([])
  const itemsRef = useRef<SellLineItem[]>([])
  const [adjustedTotal, setAdjustedTotal] = useState('0')
  const [lookupBusy, setLookupBusy] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [operationMessage, setOperationMessage] = useState('')
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const lookupControllersRef = useRef(new Set<AbortController>())
  const lookupGenerationRef = useRef(0)
  const checkoutControllerRef = useRef<AbortController | null>(null)
  const checkoutInProgressRef = useRef(false)
  const activeRef = useRef(true)
  const hasItems = items.length > 0
  const totalAmount = lineTotal(items)

  useEffect(() => {
    activeRef.current = true
    const lookupControllers = lookupControllersRef.current
    return () => {
      activeRef.current = false
      lookupGenerationRef.current += 1
      lookupControllers.forEach((controller) => controller.abort())
      lookupControllers.clear()
      checkoutControllerRef.current?.abort()
    }
  }, [])

  const replaceItems = (next: SellLineItem[]) => {
    if (next.length === itemsRef.current.length && next.every((item, index) => {
      const previous = itemsRef.current[index]
      return previous.product.id === item.product.id && previous.adjustedPrice === item.adjustedPrice && previous.quantity === item.quantity
    })) return
    itemsRef.current = next
    setItems(next)
    setAdjustedTotal(String(lineTotal(next)))
  }

  const lookupProduct = async (productId: string) => {
    if (productId.length !== 13) return
    const controller = new AbortController()
    const generation = lookupGenerationRef.current
    lookupControllersRef.current.add(controller)
    setLookupBusy(true)
    setOperationMessage('')
    try {
      const product = await getProduct(session, productId, controller.signal)
      if (!activeRef.current || generation !== lookupGenerationRef.current) return
      const current = itemsRef.current
      const existing = current.find((item) => item.product.id === product.id)
      const next = existing
        ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { product, adjustedPrice: product.price, quantity: 1 }]
      replaceItems(next)
      setOperationMessage('')
    } catch (error: unknown) {
      if (!activeRef.current || generation !== lookupGenerationRef.current || (error instanceof DOMException && error.name === 'AbortError')) return
      if (error instanceof ProductServiceError && error.kind === 'unauthorized') {
        onSessionExpired('使用者未授權')
        return
      }
      setOperationMessage(error instanceof ProductServiceError && error.kind === 'not-found'
        ? '商品不存在'
        : serviceMessage(error, '商品查詢失敗'))
    } finally {
      lookupControllersRef.current.delete(controller)
      if (activeRef.current && generation === lookupGenerationRef.current) {
        setLookupBusy(lookupControllersRef.current.size > 0)
      }
    }
  }

  const handleCheckout = async () => {
    if (!itemsRef.current.length || lookupControllersRef.current.size > 0 || checkoutInProgressRef.current) return
    checkoutInProgressRef.current = true
    setCheckoutBusy(true)
    setConfirmationOpen(false)
    setOperationMessage('')
    const controller = new AbortController()
    checkoutControllerRef.current = controller
    const orderInput: CreateOrderInput = {
      totalAmount: lineTotal(itemsRef.current),
      totalDiscount: Number(adjustedTotal),
      orderItems: itemsRef.current.map(({ product, adjustedPrice, quantity }) => ({
        productId: product.id,
        quantity,
        price: product.price,
        discount: adjustedPrice,
      })),
    }
    try {
      await createOrder(session, orderInput, controller.signal)
      if (!activeRef.current) return
      replaceItems([])
      setOperationMessage('')
    } catch (error: unknown) {
      if (!activeRef.current || (error instanceof DOMException && error.name === 'AbortError')) return
      if (error instanceof SellServiceError && error.kind === 'unauthorized') {
        onSessionExpired('使用者未授權')
        return
      }
      setOperationMessage(serviceMessage(error, '訂單建立失敗'))
    } finally {
      checkoutInProgressRef.current = false
      checkoutControllerRef.current = null
      if (activeRef.current) setCheckoutBusy(false)
    }
  }

  return (
    <main className="sell-page">
      <SiteHeader authenticated activePage="sell" onNavigateProducts={onNavigateProducts}
        onNavigateSell={() => undefined} onLogout={onLogout}
        onPermissions={() => window.alert('權限管理尚未開放')} />
      <div className="sell-page__content">
        <SellProductTable items={items} onChange={replaceItems} disabled={checkoutBusy || confirmationOpen} />
        <SellAmountPanel totalAmount={totalAmount} adjustedTotal={adjustedTotal}
          disabled={!hasItems} busy={checkoutBusy || confirmationOpen} lookupBusy={lookupBusy} message={operationMessage}
          onProductId={(productId) => { void lookupProduct(productId) }}
          onAdjustedTotalChange={(value) => { if (parsePositiveInteger(value) !== null) setAdjustedTotal(value) }}
          onCheckout={() => setConfirmationOpen(true)} onClear={() => {
            lookupGenerationRef.current += 1
            lookupControllersRef.current.forEach((controller) => controller.abort())
            lookupControllersRef.current.clear()
            setLookupBusy(false)
            replaceItems([])
            setOperationMessage('')
          }} />
      </div>
      {lookupBusy ? <p className="sell-page__status" role="status">商品查詢中…</p> : null}
      {confirmationOpen ? <Modal title="確認結帳" onClose={() => setConfirmationOpen(false)}>
        <p className="sell-page__confirmation">訂單金額為{adjustedTotal}，請確認是否要結帳</p>
        <div className="sell-page__confirmation-actions">
          <Button onClick={() => { void handleCheckout() }}>確認</Button>
          <Button variant="secondary" onClick={() => setConfirmationOpen(false)}>取消</Button>
        </div>
      </Modal> : null}
    </main>
  )
}
