import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('defaults create stock to zero and submits it as an editable field', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<ProductForm mode="create" labelOptions={['A', 'B']} busy={false} error="" onCancel={() => undefined} onSubmit={onSubmit} />)
    const stock = screen.getByRole('spinbutton', { name: '庫存' })
    expect(stock).toHaveValue(0)
    expect(stock).toBeEnabled()
    expect(stock).toHaveAttribute('min', '0')
    expect(stock).toHaveAttribute('step', 'any')
    await user.type(screen.getByRole('textbox', { name: '商品名稱' }), 'Item')
    await user.type(screen.getByRole('textbox', { name: '商品分類' }), 'A')
    await user.keyboard('{Enter}')
    await user.type(screen.getByRole('spinbutton', { name: '成本' }), '1')
    await user.type(screen.getByRole('spinbutton', { name: '售價' }), '2')
    await user.clear(stock)
    await user.type(stock, '12')
    await user.click(screen.getByRole('button', { name: '確認' }))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Item', labelNames: ['A'], cost: '1', price: '2', stock: '12' })
  })

  it('prefills edit stock from product details and allows changing it', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<ProductForm mode="edit" initialProduct={{ ...product, stock: 17 }} labelOptions={['A', 'B']} busy={false} error="" onCancel={() => undefined} onSubmit={onSubmit} />)
    const stock = screen.getByRole('spinbutton', { name: '庫存' })
    expect(stock).toHaveValue(17)
    expect(stock).toBeEnabled()
    await user.clear(stock)
    await user.type(stock, '3')
    await user.click(screen.getByRole('button', { name: '確認' }))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Item', labelNames: ['A', 'B'], cost: '10', price: '20', stock: '3' })
  })
})
