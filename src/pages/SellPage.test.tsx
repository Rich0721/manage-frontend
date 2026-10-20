import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SellPage } from './SellPage'
import { getProduct } from '../services/product-service'
import { createOrder } from '../services/sell-service'
import type { Product } from '../types/auth'

vi.mock('../services/product-service', () => ({
  ProductServiceError: class ProductServiceError extends Error { kind: string; constructor(kind: string, message: string) { super(message); this.kind = kind } },
  getProduct: vi.fn(),
}))
vi.mock('../services/sell-service', () => ({
  SellServiceError: class SellServiceError extends Error { kind: string; constructor(kind: string, message: string) { super(message); this.kind = kind } },
  createOrder: vi.fn(),
}))

const session = { uid: 'u1', authorization: 'token', userName: 'Tester' }
const product: Product = { id: '1000000000001', name: '測試商品', label_names: '', cost: 50, price: 100, stock: 4 }
const getProductMock = vi.mocked(getProduct)
const createOrderMock = vi.mocked(createOrder)

afterEach(() => {
  getProductMock.mockReset()
  createOrderMock.mockReset()
})

function renderSellPage() {
  return render(<SellPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} onNavigateProducts={() => undefined} />)
}

async function scanProduct(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: '商品ID' }), product.id)
  await screen.findByRole('row', { name: new RegExp(product.id) })
}

describe('SellPage', () => {
  it('looks up a 13-character product ID, merges repeats, and preserves the adjusted unit price', async () => {
    const user = userEvent.setup()
    getProductMock.mockResolvedValue(product)
    renderSellPage()
    await scanProduct(user)

    const priceInput = screen.getByRole('textbox', { name: `調整價格 ${product.id}` })
    await user.clear(priceInput)
    await user.type(priceInput, '150')
    fireEvent.blur(priceInput)
    await user.type(screen.getByRole('textbox', { name: '商品ID' }), product.id)

    const row = await screen.findByRole('row', { name: new RegExp(product.id) })
    expect(within(row).getByRole('textbox', { name: `調整價格 ${product.id}` })).toHaveValue('150')
    expect(within(row).getByRole('textbox', { name: `數量 ${product.id}` })).toHaveValue('2')
    expect(row).toHaveTextContent('300')
    expect(getProductMock).toHaveBeenCalledTimes(2)
  })

  it('removes a row when quantity becomes zero and recalculates the totals', async () => {
    const user = userEvent.setup()
    getProductMock.mockResolvedValue(product)
    renderSellPage()
    await scanProduct(user)
    const quantityInput = screen.getByRole('textbox', { name: `數量 ${product.id}` })
    await user.clear(quantityInput)
    await user.type(quantityInput, '0')
    fireEvent.blur(quantityInput)

    await waitFor(() => expect(screen.queryByRole('row', { name: new RegExp(product.id) })).not.toBeInTheDocument())
    expect(screen.getByRole('textbox', { name: '總價格' })).toHaveValue('0')
    expect(screen.getByRole('textbox', { name: '整單調整價格' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '結帳' })).toBeDisabled()
  })

  it('does not send a cancelled order and clears the cart only after successful confirmation', async () => {
    const user = userEvent.setup()
    getProductMock.mockResolvedValue(product)
    createOrderMock.mockResolvedValue({ orderId: 'o1', totalAmount: 100, totalDiscount: 100, orderItems: [] })
    renderSellPage()
    await scanProduct(user)
    await user.click(screen.getByRole('button', { name: '結帳' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('訂單金額為100，請確認是否要結帳')
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(createOrderMock).not.toHaveBeenCalled()
    expect(screen.getByRole('row', { name: new RegExp(product.id) })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '結帳' }))
    await user.click(screen.getByRole('button', { name: '確認' }))
    await waitFor(() => expect(createOrderMock).toHaveBeenCalledOnce())
    expect(createOrderMock.mock.calls[0]?.[1]).toEqual({
      totalAmount: 100,
      totalDiscount: 100,
      orderItems: [{ productId: product.id, quantity: 1, price: 100, discount: 100 }],
    })
    await waitFor(() => expect(screen.queryByRole('row', { name: new RegExp(product.id) })).not.toBeInTheDocument())
    expect(screen.getByRole('textbox', { name: '整單調整價格' })).toHaveValue('0')
  })

  it('sends adjusted unit prices while totalAmount uses quantity and totalDiscount uses the order amount', async () => {
    const user = userEvent.setup()
    getProductMock.mockResolvedValue(product)
    createOrderMock.mockResolvedValue({ orderId: 'o1', totalAmount: 300, totalDiscount: 400, orderItems: [] })
    renderSellPage()
    await scanProduct(user)

    const priceInput = screen.getByRole('textbox', { name: `調整價格 ${product.id}` })
    await user.clear(priceInput)
    await user.type(priceInput, '150')
    fireEvent.blur(priceInput)
    const quantityInput = screen.getByRole('textbox', { name: `數量 ${product.id}` })
    await user.clear(quantityInput)
    await user.type(quantityInput, '2')
    fireEvent.blur(quantityInput)
    const adjustedTotalInput = screen.getByRole('textbox', { name: '整單調整價格' })
    await user.clear(adjustedTotalInput)
    await user.type(adjustedTotalInput, '400')
    fireEvent.blur(adjustedTotalInput)

    await user.click(screen.getByRole('button', { name: '結帳' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('訂單金額為400')
    await user.click(screen.getByRole('button', { name: '確認' }))
    await waitFor(() => expect(createOrderMock).toHaveBeenCalledOnce())
    expect(createOrderMock.mock.calls[0]?.[1]).toEqual({
      totalAmount: 300,
      totalDiscount: 400,
      orderItems: [{ productId: product.id, quantity: 2, price: 100, discount: 150 }],
    })
  })

  it('retains products and amounts when order creation fails', async () => {
    const user = userEvent.setup()
    getProductMock.mockResolvedValue(product)
    createOrderMock.mockRejectedValue(new Error('訂單建立失敗'))
    renderSellPage()
    await scanProduct(user)
    await user.click(screen.getByRole('button', { name: '結帳' }))
    await user.click(screen.getByRole('button', { name: '確認' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('訂單建立失敗')
    expect(screen.getByRole('row', { name: new RegExp(product.id) })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: '總價格' })).toHaveValue('100')
  })
})
