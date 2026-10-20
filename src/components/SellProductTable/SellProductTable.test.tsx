import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SellProductTable } from './SellProductTable'
import type { SellLineItem } from '../../types/sell'

const items: SellLineItem[] = [{
  product: { id: '1000000000001', name: '測試商品', label_names: '', cost: 10, price: 100, stock: 5 },
  adjustedPrice: 100,
  quantity: 1,
}]

describe('SellProductTable', () => {
  it('shows read-only product details and reports valid price and quantity edits', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SellProductTable items={items} onChange={onChange} />)
    expect(screen.getByText('測試商品')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /1000000000001/ })).toHaveTextContent('100')

    const price = screen.getByRole('textbox', { name: '調整價格 1000000000001' })
    await user.clear(price)
    await user.type(price, '150')
    fireEvent.blur(price)
    expect(onChange).toHaveBeenLastCalledWith([{ ...items[0], adjustedPrice: 150 }])

    const quantity = screen.getByRole('textbox', { name: '數量 1000000000001' })
    await user.clear(quantity)
    await user.type(quantity, '3')
    fireEvent.blur(quantity)
    expect(onChange).toHaveBeenLastCalledWith([{ ...items[0], quantity: 3 }])
  })

  it.each(['0', '-1', '1.5', 'abc'])('restores an invalid adjusted price %s', async (value) => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SellProductTable items={items} onChange={onChange} />)
    const price = screen.getByRole('textbox', { name: '調整價格 1000000000001' })
    await user.clear(price)
    await user.type(price, value)
    fireEvent.blur(price)
    expect(price).toHaveValue('100')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('removes a row when quantity is zero and allows explicit deletion', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SellProductTable items={items} onChange={onChange} />)
    const quantity = screen.getByRole('textbox', { name: '數量 1000000000001' })
    await user.clear(quantity)
    await user.type(quantity, '0')
    fireEvent.blur(quantity)
    expect(onChange).toHaveBeenCalledWith([])

    await user.click(screen.getByRole('button', { name: '刪除商品 1000000000001' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it.each(['-1', '1.5', 'abc'])('restores invalid quantity %s without changing the row', async (value) => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SellProductTable items={items} onChange={onChange} />)
    const quantity = screen.getByRole('textbox', { name: '數量 1000000000001' })
    await user.clear(quantity)
    await user.type(quantity, value)
    fireEvent.blur(quantity)

    expect(quantity).toHaveValue('1')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps row input state mounted when price and quantity change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(<SellProductTable items={items} onChange={onChange} />)
    const price = screen.getByRole('textbox', { name: '調整價格 1000000000001' })
    await user.clear(price)
    await user.type(price, '150')
    const revised = [{ ...items[0], quantity: 2 }]
    rerender(<SellProductTable items={revised} onChange={onChange} />)

    expect(screen.getByRole('textbox', { name: '調整價格 1000000000001' })).toHaveValue('150')
    expect(screen.getByRole('textbox', { name: '調整價格 1000000000001' })).toHaveFocus()
  })
})
