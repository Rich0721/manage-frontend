import { useEffect, useRef, useState } from 'react'
import { parsePositiveInteger } from '../../pages/sell-validation'
import { Button } from '../Button/Button'
import './SellAmountPanel.css'

interface SellAmountPanelProps {
  totalAmount: number
  adjustedTotal: string
  disabled: boolean
  busy: boolean
  lookupBusy?: boolean
  message: string
  onProductId: (productId: string) => void
  onAdjustedTotalChange: (value: string) => void
  onCheckout: () => void
  onClear: () => void
}

export function SellAmountPanel({ totalAmount, adjustedTotal, disabled, busy, lookupBusy = false, message, onProductId, onAdjustedTotalChange, onCheckout, onClear }: SellAmountPanelProps) {
  const [productId, setProductId] = useState('')
  const [adjustedTotalDraft, setAdjustedTotalDraft] = useState(adjustedTotal)
  const lastTriggered = useRef('')
  useEffect(() => { setAdjustedTotalDraft(adjustedTotal) }, [adjustedTotal])
  const triggerLookup = (value: string) => {
    if (value.length !== 13 || lastTriggered.current === value) return
    lastTriggered.current = value
    setProductId('')
    onProductId(value)
  }

  return (
    <aside className="sell-amount-panel" aria-label="金額資訊">
      <label className="sell-amount-panel__field">商品ID
        <input aria-label="商品ID" disabled={busy} value={productId} onChange={(event) => {
          const value = event.target.value
          setProductId(value)
          if (value.length !== 13) lastTriggered.current = ''
          triggerLookup(value)
        }} onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            triggerLookup(productId)
          }
        }} autoComplete="off" />
      </label>
      <label className="sell-amount-panel__field">總價格
        <input aria-label="總價格" readOnly value={totalAmount} />
      </label>
      <label className="sell-amount-panel__field">調整價格
        <input aria-label="整單調整價格" inputMode="numeric" disabled={disabled || busy} value={adjustedTotalDraft}
          onChange={(event) => setAdjustedTotalDraft(event.target.value)}
          onBlur={() => {
            if (parsePositiveInteger(adjustedTotalDraft) === null) setAdjustedTotalDraft(adjustedTotal)
            else onAdjustedTotalChange(adjustedTotalDraft)
          }}
          onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }} />
      </label>
      {message ? <p role="alert" className="sell-amount-panel__message">{message}</p> : null}
      <div className="sell-amount-panel__actions">
        <Button disabled={disabled || busy || lookupBusy} onClick={onCheckout}>結帳</Button>
        <Button variant="secondary" disabled={busy} onClick={onClear}>清空</Button>
      </div>
    </aside>
  )
}
