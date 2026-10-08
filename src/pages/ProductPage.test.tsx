import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
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
    expect(screen.getByRole('columnheader', { name: '價格' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '商品管理' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: '商品管理' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '加入商品' })).toBeDisabled()
    expect(screen.getByRole('img', { name: '編輯' })).toHaveAttribute('src', '/icon/pencil.png')
    expect(screen.getByRole('img', { name: '刪除' })).toHaveAttribute('src', '/icon/delete.png')
  })

  it('shows the empty state only for a successful empty response', async () => {
    getProductsMock.mockResolvedValue([])
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    const emptyMessage = await screen.findByText('目前無產品')
    expect(emptyMessage).toBeInTheDocument()
    expect(emptyMessage.closest('td')).toHaveAttribute('colspan', '6')
    expect(screen.getAllByRole('columnheader')).toHaveLength(6)
  })

  it('renders every row from a multi-product response', async () => {
    getProductsMock.mockResolvedValue([
      { id: 'p1', name: 'First', label_names: 'Group A', cost: 0, price: 15 },
      { id: 'p2', name: 'Second', label_names: 'Group B', cost: 10, price: 25 },
    ])
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    expect(await screen.findByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('shows loading and keeps the table hidden until the request succeeds', () => {
    getProductsMock.mockReturnValue(new Promise(() => undefined))
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    expect(screen.getByRole('status')).toHaveTextContent('載入中')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows ordinary product errors without clearing the session', async () => {
    getProductsMock.mockRejectedValue(new AuthServiceError('http', 'Forbidden'))
    const onSessionExpired = vi.fn()
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={onSessionExpired} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Forbidden')
    expect(screen.queryByText('目前無產品')).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('aborts the product request when the page unmounts', () => {
    getProductsMock.mockReturnValue(new Promise(() => undefined))
    const { unmount } = render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    const signal = getProductsMock.mock.calls[0]?.[1]
    unmount()
    expect(signal?.aborted).toBe(true)
  })

  it('clears the prior session products while loading a new session', async () => {
    let finishSecond!: (products: { id: string; name: string; label_names: string; cost: number; price: number }[]) => void
    getProductsMock
      .mockResolvedValueOnce([{ id: 'old', name: 'Old product', label_names: 'Old', cost: 1, price: 2 }])
      .mockReturnValueOnce(new Promise((resolve) => { finishSecond = resolve }))
    const { rerender } = render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    expect(await screen.findByText('Old product')).toBeInTheDocument()
    rerender(<ProductPage session={{ ...session, uid: 'u2' }} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    expect(screen.getByRole('status')).toHaveTextContent('載入中')
    expect(screen.queryByText('Old product')).not.toBeInTheDocument()
    expect(getProductsMock).toHaveBeenCalledTimes(2)
    finishSecond([])
    expect(await screen.findByText('目前無產品')).toBeInTheDocument()
  })

  it('keeps the add product placeholder disabled without navigation or service calls', async () => {
    getProductsMock.mockResolvedValue([])
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    const addButton = await screen.findByRole('button', { name: '加入商品' })
    fireEvent.click(addButton)
    expect(addButton).toBeDisabled()
    expect(getProductsMock).toHaveBeenCalledOnce()
    expect(within(screen.getByRole('region', { name: '商品管理' })).getByText('目前無產品')).toBeInTheDocument()
  })

  it('sends unauthorized responses to the session owner', async () => {
    getProductsMock.mockRejectedValue(new AuthServiceError('unauthorized', 'expired'))
    const onSessionExpired = vi.fn()
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={onSessionExpired} />)
    await vi.waitFor(() => expect(onSessionExpired).toHaveBeenCalledOnce())
  })
})
