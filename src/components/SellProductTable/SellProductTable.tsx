import { useState } from 'react'
import type { SellLineItem } from '../../types/sell'
import { parsePositiveInteger, parseQuantity } from '../../pages/sell-validation'
import { Button } from '../Button/Button'
import './SellProductTable.css'

interface SellProductTableProps {
  items: SellLineItem[]
  onChange: (items: SellLineItem[]) => void
  disabled?: boolean
}

interface SellProductRowProps {
  item: SellLineItem
  disabled: boolean
  onPriceChange: (price: number) => void
  onQuantityChange: (quantity: number) => void
  onDelete: () => void
}

function SellProductRow({ item, disabled, onPriceChange, onQuantityChange, onDelete }: SellProductRowProps) {
  const [priceDraft, setPriceDraft] = useState({ value: String(item.adjustedPrice), source: item.adjustedPrice })
  const [quantityDraft, setQuantityDraft] = useState({ value: String(item.quantity), source: item.quantity })
  const priceValue = priceDraft.source === item.adjustedPrice ? priceDraft.value : String(item.adjustedPrice)
  const quantityValue = quantityDraft.source === item.quantity ? quantityDraft.value : String(item.quantity)

  const commitPrice = () => {
    const value = parsePositiveInteger(priceValue)
    if (value === null) setPriceDraft({ value: String(item.adjustedPrice), source: item.adjustedPrice })
    else onPriceChange(value)
  }

  const commitQuantity = () => {
    const value = parseQuantity(quantityValue)
    if (value === null) setQuantityDraft({ value: String(item.quantity), source: item.quantity })
    else onQuantityChange(value)
  }

  return (
    <tr>
      <td>{item.product.id}</td>
      <td>{item.product.name}</td>
      <td>{item.product.price}</td>
      <td><input disabled={disabled} aria-label={`調整價格 ${item.product.id}`} inputMode="numeric" value={priceValue} onChange={(event) => setPriceDraft({ value: event.target.value, source: item.adjustedPrice })} onBlur={commitPrice} onKeyDown={(event) => { if (event.key === 'Enter') { event.currentTarget.blur() } }} /></td>
      <td><input disabled={disabled} aria-label={`數量 ${item.product.id}`} inputMode="numeric" value={quantityValue} onChange={(event) => setQuantityDraft({ value: event.target.value, source: item.quantity })} onBlur={commitQuantity} onKeyDown={(event) => { if (event.key === 'Enter') { event.currentTarget.blur() } }} /></td>
      <td>{item.adjustedPrice * item.quantity}</td>
      <td><Button disabled={disabled} variant="text" className="sell-product-table__delete" aria-label={`刪除商品 ${item.product.id}`} onClick={onDelete}>Delete</Button></td>
    </tr>
  )
}

export function SellProductTable({ items, onChange, disabled = false }: SellProductTableProps) {
  const updateItem = (productId: string, update: Partial<Pick<SellLineItem, 'adjustedPrice' | 'quantity'>>) => {
    const next = items.map((item) => item.product.id === productId ? { ...item, ...update } : item)
      .filter((item) => item.quantity !== 0)
    onChange(next)
  }

  const deleteItem = (productId: string) => onChange(items.filter((item) => item.product.id !== productId))

  return (
    <section className="sell-product-table" aria-label="商品資訊">
      <div className="sell-product-table__scroll">
        <table>
          <thead><tr><th>商品ID</th><th>商品名稱</th><th>價格</th><th>調整價格</th><th>數量</th><th>總價格</th><th>操作</th></tr></thead>
          <tbody>
            {items.map((item) => <SellProductRow key={item.product.id} item={item} disabled={disabled}
              onPriceChange={(adjustedPrice) => updateItem(item.product.id, { adjustedPrice })}
              onQuantityChange={(quantity) => updateItem(item.product.id, { quantity })}
              onDelete={() => deleteItem(item.product.id)} />)}
          </tbody>
        </table>
      </div>
      {items.length === 0 ? <p className="sell-product-table__empty">請輸入商品 ID 加入商品</p> : null}
    </section>
  )
}
