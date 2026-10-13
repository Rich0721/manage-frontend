import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductForm } from './ProductForm'
import type { Product } from '../../types/auth'

const product: Product = { id: 'p1', name: 'Item', label_names: 'A,B', cost: 10, price: 20, stock: 0 }

describe('ProductForm', () => {
  it('displays field-specific minimum errors instead of being blocked by native validation', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<ProductForm mode="edit" initialProduct={product} labelOptions={['A', 'B']} busy={false} error="" onCancel={() => undefined} onSubmit={onSubmit} />)
    const cost = screen.getByRole('spinbutton', { name: '成本' })
    await user.clear(cost)
    await user.type(cost, '0')
    await user.click(screen.getByRole('button', { name: '確認' }))
    expect(screen.getByRole('alert')).toHaveTextContent('請填寫完整的產品資料')
    expect(cost).toHaveAttribute('aria-invalid', 'true')
    expect(cost).toHaveAccessibleDescription('成本最小值為 1')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows an accessible stock minimum error for negative values', async () => {
    const user = userEvent.setup()
    render(<ProductForm mode="edit" initialProduct={product} labelOptions={['A', 'B']} busy={false} error="" onCancel={() => undefined} onSubmit={() => undefined} />)
    const stock = screen.getByRole('spinbutton', { name: '庫存' })
    fireEvent.change(stock, { target: { value: '-1' } })
    await user.click(screen.getByRole('button', { name: '確認' }))
    expect(stock).toHaveAttribute('aria-invalid', 'true')
    expect(stock).toHaveAccessibleDescription('庫存最小值為 0')
  })
})
