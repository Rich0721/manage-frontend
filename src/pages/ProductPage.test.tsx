import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductPage } from './ProductPage'
import { addProduct, deleteProduct, getProduct, getProducts, ProductServiceError, updateProduct } from '../services/product-service'
import { AuthServiceError } from '../services/auth-service'
import type { AuthSession, Product } from '../types/auth'

vi.mock('../services/product-service', () => ({
  getProducts: vi.fn(), getProduct: vi.fn(), addProduct: vi.fn(), updateProduct: vi.fn(), deleteProduct: vi.fn(),
  ProductServiceError: class ProductServiceError extends Error { kind: string; constructor(kind: string, message: string) { super(message); this.kind = kind } },
}))
const getProductsMock = vi.mocked(getProducts)
const getProductMock = vi.mocked(getProduct)
const addProductMock = vi.mocked(addProduct)
const updateProductMock = vi.mocked(updateProduct)
const deleteProductMock = vi.mocked(deleteProduct)
const session: AuthSession = { uid: 'u1', authorization: 'token', userName: 'Tester' }
const product = (id: string, name: string, label_names = 'Group', stock = 4): Product => ({ id, name, label_names, cost: 10, price: 20, stock })
afterEach(() => {
  getProductsMock.mockReset(); getProductMock.mockReset(); addProductMock.mockReset(); updateProductMock.mockReset(); deleteProductMock.mockReset()
})

describe('ProductPage', () => {
  it('renders the requested columns, product labels, and accessible actions', async () => {
    getProductsMock.mockResolvedValue([product('p1', 'Item', 'A,B', 7)])
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    expect(await screen.findByText('Item')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(7)
    expect(screen.getByRole('columnheader', { name: '庫存' })).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument(); expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '編輯商品 Item' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '刪除商品 Item' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '加入商品' })).toBeEnabled()
  })

  it('shows headers and 1/1 pagination without an empty product row', async () => {
    getProductsMock.mockResolvedValue([])
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    expect(await screen.findByText('目前無產品')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(7)
    expect(screen.getByText(/Pages\s+1\/1/)).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(1)
    expect(screen.getByRole('button', { name: '上一頁' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一頁' })).toBeDisabled()
  })

  it('pages 18 products by 15 and 3 with disabled boundary arrows', async () => {
    getProductsMock.mockResolvedValue(Array.from({ length: 18 }, (_, index) => product(`p${index}`, `Item ${index}`)))
    const user = userEvent.setup()
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    expect(await screen.findByText('Item 0')).toBeInTheDocument()
    expect(screen.getByText(/Pages\s+1\/2/)).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(16)
    expect(screen.getByRole('button', { name: '上一頁' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '下一頁' }))
    expect(screen.getByText(/Pages\s+2\/2/)).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(4)
    expect(screen.getByRole('button', { name: '下一頁' })).toBeDisabled()
  })

  it('filters case-insensitively using AND and resets to the first page', async () => {
    getProductsMock.mockResolvedValue([
      ...Array.from({ length: 16 }, (_, index) => product(`p${index}`, `Other ${index}`, 'Blue')),
      product('p16', 'Special Item', 'Red'),
      product('p17', 'Special Item Blue', 'Blue'),
    ])
    const user = userEvent.setup()
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    await screen.findByText('Other 0')
    await user.click(screen.getByRole('button', { name: '下一頁' }))
    await user.type(screen.getByRole('searchbox', { name: '篩選商品名稱' }), 'SPECIAL')
    await user.type(screen.getByRole('searchbox', { name: '篩選商品分類' }), 'blue')
    expect(screen.getByText('Special Item Blue')).toBeInTheDocument()
    expect(screen.queryByText('Special Item', { exact: true })).not.toBeInTheDocument()
    expect(screen.getByText(/Pages\s+1\/1/)).toBeInTheDocument()
  })

  it('keeps loading and errors distinct from an empty product result', async () => {
    getProductsMock.mockReturnValue(new Promise(() => undefined))
    const { rerender } = render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    expect(screen.getByRole('status')).toHaveTextContent('載入中')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    rerender(<ProductPage session={{ ...session, uid: 'u2' }} onLogout={() => undefined} onSessionExpired={() => undefined} />)
  })

  it('creates a product with comma-joined labels and numeric fields then refreshes the list', async () => {
    getProductsMock.mockResolvedValueOnce([]).mockResolvedValueOnce([product('p1', 'New product', 'A,B', 0)])
    addProductMock.mockResolvedValue(product('p1', 'New product', 'A,B', 0))
    const user = userEvent.setup()
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    await screen.findByText('目前無產品')
    await user.click(screen.getByRole('button', { name: '加入商品' }))
    await user.type(screen.getByRole('textbox', { name: '商品名稱' }), 'New product')
    await user.type(screen.getByRole('textbox', { name: '商品分類' }), 'A')
    await user.keyboard('{Enter}')
    await user.type(screen.getByRole('textbox', { name: '商品分類' }), 'B')
    await user.keyboard('{Enter}')
    await user.type(screen.getByRole('spinbutton', { name: '成本' }), '12')
    await user.type(screen.getByRole('spinbutton', { name: '售價' }), '18')
    await user.clear(screen.getByRole('spinbutton', { name: '庫存' }))
    await user.type(screen.getByRole('spinbutton', { name: '庫存' }), '0')
    await user.click(screen.getByRole('button', { name: '確認' }))
    expect(addProductMock).toHaveBeenCalledWith(session, { name: 'New product', label_names: 'A,B', cost: 12, price: 18, stock: 0 }, expect.any(AbortSignal))
    expect(await screen.findByText('New product')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('retains entered values and makes no request when required fields are missing', async () => {
    getProductsMock.mockResolvedValue([])
    const user = userEvent.setup()
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    await screen.findByText('目前無產品')
    await user.click(screen.getByRole('button', { name: '加入商品' }))
    await user.type(screen.getByRole('textbox', { name: '商品名稱' }), 'Keep me')
    await user.click(screen.getByRole('button', { name: '確認' }))
    expect(screen.getByRole('alert')).toHaveTextContent('請填寫完整的產品資料')
    expect(screen.getByRole('textbox', { name: '商品名稱' })).toHaveValue('Keep me')
    expect(addProductMock).not.toHaveBeenCalled()
  })

  it('loads detail before showing the edit form and sends a single complete update', async () => {
    getProductsMock.mockResolvedValue([product('p1', 'Original', 'Old')]).mockResolvedValueOnce([product('p1', 'Original', 'Old')]).mockResolvedValueOnce([product('p1', 'Changed', 'New')])
    getProductMock.mockResolvedValue(product('p1', 'Original', 'Old'))
    updateProductMock.mockResolvedValue(product('p1', 'Changed', 'New'))
    const user = userEvent.setup()
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    await screen.findByText('Original')
    await user.click(screen.getByRole('button', { name: '編輯商品 Original' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('編輯商品')
    expect(getProductMock).toHaveBeenCalledWith(session, 'p1', expect.any(AbortSignal))
    await user.clear(screen.getByRole('textbox', { name: '商品名稱' }))
    await user.type(screen.getByRole('textbox', { name: '商品名稱' }), 'Changed')
    await user.click(screen.getByRole('button', { name: '確認' }))
    expect(updateProductMock).toHaveBeenCalledOnce()
    expect(updateProductMock.mock.calls[0]?.[1]).toEqual({ id: 'p1', name: 'Changed', label_names: 'Old', cost: 10, price: 20, stock: 4 })
    expect(await screen.findByText('Changed')).toBeInTheDocument()
  })

  it('cancels add and delete without mutation requests', async () => {
    getProductsMock.mockResolvedValue([product('p1', 'Item')])
    const user = userEvent.setup()
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    await screen.findByText('Item')
    await user.click(screen.getByRole('button', { name: '加入商品' }))
    await user.click(screen.getByRole('button', { name: '取消' }))
    await user.click(screen.getByRole('button', { name: '刪除商品 Item' }))
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(addProductMock).not.toHaveBeenCalled()
    expect(deleteProductMock).not.toHaveBeenCalled()
    expect(updateProductMock).not.toHaveBeenCalled()
  })

  it('keeps the create form after a 409 and shows the required message', async () => {
    getProductsMock.mockResolvedValue([])
    addProductMock.mockRejectedValue(new ProductServiceError('conflict', 'conflict'))
    const user = userEvent.setup()
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    await screen.findByText('目前無產品')
    await user.click(screen.getByRole('button', { name: '加入商品' }))
    await user.type(screen.getByRole('textbox', { name: '商品名稱' }), 'Item')
    await user.type(screen.getByRole('textbox', { name: '商品分類' }), 'A')
    await user.keyboard('{Enter}')
    await user.type(screen.getByRole('spinbutton', { name: '成本' }), '1')
    await user.type(screen.getByRole('spinbutton', { name: '售價' }), '1')
    await user.click(screen.getByRole('button', { name: '確認' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('商品產生ID衝突，請重新送出')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: '商品名稱' })).toHaveValue('Item')
  })

  it('returns mutation 401 to the session owner with the required message', async () => {
    getProductsMock.mockResolvedValue([])
    addProductMock.mockRejectedValue(new ProductServiceError('unauthorized', 'unauthorized'))
    const onSessionExpired = vi.fn()
    const user = userEvent.setup()
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={onSessionExpired} />)
    await screen.findByText('目前無產品')
    await user.click(screen.getByRole('button', { name: '加入商品' }))
    await user.type(screen.getByRole('textbox', { name: '商品名稱' }), 'Item')
    await user.type(screen.getByRole('textbox', { name: '商品分類' }), 'A')
    await user.keyboard('{Enter}')
    await user.type(screen.getByRole('spinbutton', { name: '成本' }), '1')
    await user.type(screen.getByRole('spinbutton', { name: '售價' }), '1')
    await user.click(screen.getByRole('button', { name: '確認' }))
    expect(onSessionExpired).toHaveBeenCalledWith('使用者未授權')
  })

  it('handles Excel selection without uploading or calling APIs', async () => {
    getProductsMock.mockResolvedValue([])
    render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={() => undefined} />)
    await screen.findByText('目前無產品')
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')
    expect(input).not.toBeNull()
    fireEvent.change(input as HTMLInputElement, { target: { files: [new File(['x'], 'products.xlsx')] } })
    expect(await screen.findByText('批次上傳功能尚未開放，檔案未上傳。')).toBeInTheDocument()
    expect(addProductMock).not.toHaveBeenCalled()
  })

  it('delegates list 401 to the session owner and preserves ordinary errors', async () => {
    getProductsMock.mockRejectedValueOnce(new AuthServiceError('unauthorized', 'expired'))
    const onSessionExpired = vi.fn()
    const { rerender } = render(<ProductPage session={session} onLogout={() => undefined} onSessionExpired={onSessionExpired} />)
    await vi.waitFor(() => expect(onSessionExpired).toHaveBeenCalledOnce())
    getProductsMock.mockRejectedValueOnce(new AuthServiceError('http', 'Forbidden'))
    rerender(<ProductPage session={{ ...session, uid: 'u2' }} onLogout={() => undefined} onSessionExpired={onSessionExpired} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Forbidden')
    expect(onSessionExpired).toHaveBeenCalledOnce()
  })
})
