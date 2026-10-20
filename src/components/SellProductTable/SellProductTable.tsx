import { useState } from 'react'
import type { SellLineItem } from '../../types/sell'
import { parsePositiveInteger, parseQuantity } from '../../pages/sell-validation'
import { Button } from '../Button/Button'
import './SellProductTable.css'

interface SellProductTableProps {
  items: SellLineItem[]
  onChange: (items: SellLineItem[]) => void
}

interface SellProductRowProps {
  item: SellLineItem
  onPriceChange: (price: number) => void
  onQuantityChange: (quantity: number) => void
  onDelete: () => void
}

function SellProductRow({ item, onPriceChange, onQuantityChange, onDelete }: SellProductRowProps) {
  const [priceDraft, setPriceDraft] = useState(String(item.adjustedPrice))
  const [quantityDraft, setQuantityDraft] = useState(String(item.quantity))

  const commitPrice = () => {
    const value = parsePositiveInteger(priceDraft)
    if (value === null) setPriceDraft(String(item.adjustedPrice))
    else onPriceChange(value)
  }

  const commitQuantity = () => {
    const value = parseQuantity(quantityDraft)
    if (value === null) setQuantityDraft(String(item.quantity))
    else onQuantityChange(value)
  }

  return (
    <tr>
      <td>{item.product.id}</td>
      <td>{item.product.name}</td>
      <td>{item.product.price}</td>
      <td><input aria-label={`調整價格 ${item.product.id}`} inputMode="numeric" value={priceDraft} onChange={(event) => setPriceDraft(event.target.value)} onBlur={commitPrice} onKeyDown={(event) => { if (event.key === 'Enter') { event.currentTarget.blur() } }} /></td>
      <td><input aria-label={`數量 ${item.product.id}`} inputMode="numeric" value={quantityDraft} onChange={(event) => setQuantityDraft(event.target.value)} onBlur={commitQuantity} onKeyDown={(event) => { if (event.key === 'Enter') { event.currentTarget.blur() } }} /></td>
      <td>{item.adjustedPrice * item.quantity}</td>
      <td><Button variant="text" className="sell-product-table__delete" aria-label={`刪除商品 ${item.product.id}`} onClick={onDelete}>Delete</Button></td>
    </tr>
  )
}

export function SellProductTable({ items, onChange }: SellProductTableProps) {
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
            {items.map((item) => <SellProductRow key={`${item.product.id}:${item.adjustedPrice}:${item.quantity}`} item={item}
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
