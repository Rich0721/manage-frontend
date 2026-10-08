import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductPage } from './ProductPage'
import { getProducts } from '../services/product-service'
import { AuthServiceError } from '../services/auth-service'
import type { AuthSession } from '../types/auth'

vi.mock('../services/product-service', () => ({ getProducts: vi.fn() }))
const getProductsMock = vi.mocked(getProducts)
const session: AuthSession = { uid: 'u1', authorization: 'token', userName: 'Tester' }
afterEach(() => getProductsMock.mockReset())

describe('ProductPage', () => {
  it('loads and renders requested product fields with placeholder action icons', async () => {
    getProductsMock.mockResolvedValue([{ id: 'p1', name: 'Item', label_names: 'Group', cost: 0, price: 25 }])
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    expect(await screen.findByText('Item')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '商品編號' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '編輯' })).toHaveAttribute('src', '/icon/pencil.png')
    expect(screen.getByRole('img', { name: '刪除' })).toHaveAttribute('src', '/icon/delete.png')
  })

  it('shows the empty state only for a successful empty response', async () => {
    getProductsMock.mockResolvedValue([])
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    expect(await screen.findByText('目前無產品')).toBeInTheDocument()
  })

  it('sends unauthorized responses to the session owner', async () => {
    getProductsMock.mockRejectedValue(new AuthServiceError('unauthorized', 'expired'))
    const onSessionExpired = vi.fn()
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={onSessionExpired} />)
    await vi.waitFor(() => expect(onSessionExpired).toHaveBeenCalledOnce())
  })
})
