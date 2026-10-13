import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { AuthSession, Product } from '../types/auth'
import { AuthServiceError } from '../services/auth-service'
import { addProduct, deleteProduct, getProduct, getProducts, ProductServiceError, updateProduct, type ProductWriteInput } from '../services/product-service'
import { SiteHeader } from '../components/SiteHeader/SiteHeader'
import { Button } from '../components/Button/Button'
import { Modal } from '../components/Modal/Modal'
import { ProductForm } from '../components/ProductForm/ProductForm'
import { ProductTable } from '../components/ProductTable/ProductTable'
import type { ProductFormValues } from './product-validation'
import './ProductPage.css'

interface ProductPageProps {
  session: AuthSession
  onLogout: () => void
  onSessionExpired: (message?: string) => void
}

type ProductPageResult =
  | { session: AuthSession; status: 'success'; products: Product[] }
  | { session: AuthSession; status: 'error'; error: string }

type ProductDialog =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; product: Product }
  | { mode: 'delete'; product: Product }

const PAGE_SIZE = 15
const EMPTY_PRODUCTS: Product[] = []

function labelsOf(product: Product): string[] {
  return product.label_names.split(',').map((label) => label.trim()).filter(Boolean)
}

function toWriteInput(values: ProductFormValues): ProductWriteInput {
  return {
    name: values.name.trim(),
    label_names: values.labelNames.join(','),
    cost: Number(values.cost),
    price: Number(values.price),
    stock: Number(values.stock),
  }
}

export function ProductPage({ session, onLogout, onSessionExpired }: ProductPageProps) {
  const [result, setResult] = useState<ProductPageResult | null>(null)
  const [nameSearch, setNameSearch] = useState('')
  const [labelSearch, setLabelSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [dialog, setDialog] = useState<ProductDialog>({ mode: 'closed' })
  const [busy, setBusy] = useState(false)
  const [dialogError, setDialogError] = useState('')
  const [operationMessage, setOperationMessage] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const operationControllerRef = useRef<AbortController | null>(null)
  const currentResult = result?.session === session ? result : null
  const loading = currentResult === null
  const products = currentResult?.status === 'success' ? currentResult.products : EMPTY_PRODUCTS
  const error = currentResult?.status === 'error' ? currentResult.error : ''

  const loadProducts = useCallback(async (signal: AbortSignal): Promise<Product[]> => {
    return getProducts(session, signal)
  }, [session])

  const refreshProducts = useCallback(async (preservePage: boolean) => {
    const controller = new AbortController()
    operationControllerRef.current = controller
    try {
      const nextProducts = await loadProducts(controller.signal)
      setResult({ session, status: 'success', products: nextProducts })
      if (!preservePage) setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil(nextProducts.length / PAGE_SIZE))))
      else setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil(nextProducts.length / PAGE_SIZE))))
      setOperationMessage('')
    } catch (reason: unknown) {
      if (reason instanceof DOMException && reason.name === 'AbortError') return
      if ((reason instanceof ProductServiceError || reason instanceof AuthServiceError) && reason.kind === 'unauthorized') {
        onSessionExpired('使用者未授權')
        return
      }
      setOperationMessage('操作已完成，但清單重新載入失敗。請重新整理清單。')
      setResult({ session, status: 'error', error: reason instanceof Error ? reason.message : '產品載入失敗' })
    } finally {
      if (operationControllerRef.current === controller) operationControllerRef.current = null
    }
  }, [loadProducts, onSessionExpired, session])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    loadProducts(controller.signal).then((loaded) => {
      if (active) setResult({ session, status: 'success', products: loaded })
    }).catch((reason: unknown) => {
      if (!active || (reason instanceof DOMException && reason.name === 'AbortError')) return
      if ((reason instanceof AuthServiceError || reason instanceof ProductServiceError) && reason.kind === 'unauthorized') {
        onSessionExpired()
        return
      }
      setResult({ session, status: 'error', error: reason instanceof Error ? reason.message : '產品載入失敗' })
    })
    return () => { active = false; controller.abort(); operationControllerRef.current?.abort() }
  }, [loadProducts, onSessionExpired, session])

  const filteredProducts = useMemo(() => {
    const nameQuery = nameSearch.toLocaleLowerCase()
    const labelQuery = labelSearch.toLocaleLowerCase()
    return products.filter((product) => {
      const nameMatches = !nameQuery || product.name.toLocaleLowerCase().includes(nameQuery)
      const labels = labelsOf(product).join(', ')
      const labelMatches = !labelQuery || labels.toLocaleLowerCase().includes(labelQuery)
      return nameMatches && labelMatches
    })
  }, [labelSearch, nameSearch, products])
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const visibleProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const labelOptions = useMemo(() => Array.from(new Set(products.flatMap(labelsOf))), [products])

  const handleSearchChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value)
    setCurrentPage(1)
  }

  const handleEdit = async (product: Product) => {
    const controller = new AbortController()
    operationControllerRef.current?.abort()
    operationControllerRef.current = controller
    setDetailLoading(true)
    setOperationMessage('')
    try {
      const detail = await getProduct(session, product.id, controller.signal)
      setDialog({ mode: 'edit', product: detail })
      setDialogError('')
    } catch (reason: unknown) {
      if (reason instanceof DOMException && reason.name === 'AbortError') return
      if ((reason instanceof ProductServiceError || reason instanceof AuthServiceError) && reason.kind === 'unauthorized') {
        onSessionExpired('使用者未授權')
        return
      }
      setOperationMessage(reason instanceof Error ? reason.message : '無法載入商品詳細資料')
    } finally {
      if (operationControllerRef.current === controller) operationControllerRef.current = null
      setDetailLoading(false)
    }
  }

  const handleMutationError = (reason: unknown, fallback: string) => {
    if ((reason instanceof ProductServiceError || reason instanceof AuthServiceError) && reason.kind === 'unauthorized') {
      onSessionExpired('使用者未授權')
      return
    }
    setDialogError(reason instanceof ProductServiceError && reason.kind === 'conflict'
      ? '商品產生ID衝突，請重新送出'
      : reason instanceof Error ? reason.message : fallback)
  }

  const submitProduct = async (values: ProductFormValues) => {
    if (busy || (dialog.mode !== 'create' && dialog.mode !== 'edit')) return
    setBusy(true)
    setDialogError('')
    const controller = new AbortController()
    operationControllerRef.current = controller
    const mode = dialog.mode
    try {
      const input = toWriteInput(values)
      if (mode === 'create') await addProduct(session, input, controller.signal)
      else await updateProduct(session, { ...input, id: dialog.product.id }, controller.signal)
      setDialog({ mode: 'closed' })
      await refreshProducts(true)
    } catch (reason: unknown) {
      if (!(reason instanceof DOMException && reason.name === 'AbortError')) handleMutationError(reason, '產品儲存失敗')
    } finally {
      if (operationControllerRef.current === controller) operationControllerRef.current = null
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (busy || dialog.mode !== 'delete') return
    setBusy(true)
    setDialogError('')
    const controller = new AbortController()
    operationControllerRef.current = controller
    const deletedPage = currentPage
    try {
      await deleteProduct(session, dialog.product.id, controller.signal)
      setDialog({ mode: 'closed' })
      setCurrentPage(deletedPage)
      await refreshProducts(false)
    } catch (reason: unknown) {
      if (!(reason instanceof DOMException && reason.name === 'AbortError')) handleMutationError(reason, '產品刪除失敗')
    } finally {
      if (operationControllerRef.current === controller) operationControllerRef.current = null
      setBusy(false)
    }
  }

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) setOperationMessage('批次上傳功能尚未開放，檔案未上傳。')
    event.target.value = ''
  }

  return (
    <main className="product-page">
      <SiteHeader authenticated activePage="products" onLogout={onLogout} onPermissions={() => window.alert('權限管理尚未開放')} />
      <section className="product-page__content" aria-label="商品管理">
        <div className="product-page__toolbar">
          <Button variant="secondary" className="product-page__batch" onClick={() => uploadInputRef.current?.click()}>批次管理</Button>
          <input ref={uploadInputRef} className="product-page__file-input" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" aria-label="選擇 Excel 檔案" onChange={handleFileSelected} />
          <Button className="product-page__add" onClick={() => { setDialog({ mode: 'create' }); setDialogError('') }}>加入商品</Button>
        </div>
        <div className="product-page__downloads" aria-label="商品檔案功能">
          <Button variant="text" disabled aria-label="下載批次新增商品模板（尚未開放）">下載批次新增商品模板</Button>
          <Button variant="text" disabled aria-label="下載商品報表（尚未開放）">下載商品報表</Button>
        </div>
        {detailLoading ? <p role="status">載入商品詳細資料…</p> : null}
        {operationMessage ? <p className="product-page__notice" role="status">{operationMessage}</p> : null}
        {loading ? <p role="status">載入中…</p> : null}
        {error ? <div role="alert"><p>{error}</p><Button variant="text" onClick={() => { setOperationMessage(''); void refreshProducts(true) }}>重新載入</Button></div> : null}
        {!loading && !error ? (
          <>
            <div className="product-page__filters">
              <label>篩選商品名稱<input type="search" value={nameSearch} onChange={handleSearchChange(setNameSearch)} /></label>
              <label>篩選商品分類<input type="search" value={labelSearch} onChange={handleSearchChange(setLabelSearch)} /></label>
            </div>
            <ProductTable products={visibleProducts} currentPage={Math.min(currentPage, pageCount)} pageCount={pageCount} onPageChange={setCurrentPage} onEdit={(product) => { void handleEdit(product) }} onDelete={(product) => { setDialog({ mode: 'delete', product }); setDialogError('') }} />
            {filteredProducts.length === 0 ? <p className="product-page__empty" role="status">{products.length === 0 ? '目前無產品' : '沒有符合條件的商品'}</p> : null}
          </>
        ) : null}
      </section>
      {dialog.mode === 'create' || dialog.mode === 'edit' ? (
        <Modal title={dialog.mode === 'create' ? '新增商品' : '編輯商品'} onClose={() => setDialog({ mode: 'closed' })} busy={busy}>
          <ProductForm mode={dialog.mode} initialProduct={dialog.mode === 'edit' ? dialog.product : undefined} labelOptions={labelOptions} busy={busy} error={dialogError} onCancel={() => setDialog({ mode: 'closed' })} onSubmit={(values) => { void submitProduct(values) }} />
        </Modal>
      ) : null}
      {dialog.mode === 'delete' ? (
        <Modal title="刪除商品" onClose={() => setDialog({ mode: 'closed' })} busy={busy}>
          <div className="product-page__delete-confirm">
            <p>確定要刪除商品「{dialog.product.name}」嗎？</p>
            {dialogError ? <p role="alert">{dialogError}</p> : null}
            <div className="product-form__actions">
              <Button onClick={() => { void confirmDelete() }} disabled={busy}>確認</Button>
              <Button variant="secondary" className="product-form__cancel" onClick={() => setDialog({ mode: 'closed' })} disabled={busy}>取消</Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  )
}
