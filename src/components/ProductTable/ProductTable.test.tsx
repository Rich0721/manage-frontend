import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ProductTable } from './ProductTable'
import type { Product } from '../../types/auth'

const products: Product[] = [{ id: 'p1', name: 'Item', label_names: 'A,B', cost: 1, price: 2, stock: 0 }]

describe('ProductTable', () => {
  it('uses the local Figma pagination assets and disables the first-page action', () => {
    const onPageChange = vi.fn()
    render(<ProductTable products={products} currentPage={1} pageCount={2} onPageChange={onPageChange} onEdit={() => undefined} onDelete={() => undefined} />)
    expect(screen.getByRole('button', { name: '上一頁' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一頁' }).querySelector('img')).toHaveAttribute('src', '/icon/right-arrow.png')
    expect(screen.getByRole('button', { name: '上一頁' }).querySelector('img')).toHaveAttribute('src', '/icon/left-arrow.png')
    fireEvent.click(screen.getByRole('button', { name: '下一頁' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('shows 1/1 and disables both page actions for an empty result', () => {
    render(<ProductTable products={[]} currentPage={1} pageCount={1} onPageChange={() => undefined} onEdit={() => undefined} onDelete={() => undefined} />)
    expect(screen.getByText(/Pages\s+1\/1/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上一頁' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一頁' })).toBeDisabled()
    expect(screen.getAllByRole('row')).toHaveLength(1)
  })
})
