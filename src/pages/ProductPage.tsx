import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { AuthSession, Product } from '../types/auth'
import { AuthServiceError } from '../services/auth-service'
import { addProduct, deleteProduct, downloadProductData, downloadProductTemplate, getProduct, getProducts, ProductServiceError, updateProduct, uploadProducts, type ProductDownload, type ProductWriteInput } from '../services/product-service'
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
  onNavigateSell?: () => void
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

export function ProductPage(props: ProductPageProps) {
  const sessionKey = props.session.uid
  return <ProductPageContent key={sessionKey} {...props} />
}

function ProductPageContent({ session, onLogout, onSessionExpired, onNavigateSell }: ProductPageProps) {
  const [result, setResult] = useState<ProductPageResult | null>(null)
  const [nameSearch, setNameSearch] = useState('')
  const [labelSearch, setLabelSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [dialog, setDialog] = useState<ProductDialog>({ mode: 'closed' })
  const [busy, setBusy] = useState(false)
  const [dialogError, setDialogError] = useState('')
  const [operationMessage, setOperationMessage] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const [fileBusy, setFileBusy] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const fileControllerRef = useRef<AbortController | null>(null)
  const operationControllerRef = useRef<AbortController | null>(null)
  const detailControllerRef = useRef<AbortController | null>(null)
  const detailRequestIdRef = useRef(0)
  const sessionRef = useRef<AuthSession | null>(session)
  const currentResult = result?.session === session ? result : null
  const loading = currentResult === null
  const products = currentResult?.status === 'success' ? currentResult.products : EMPTY_PRODUCTS
  const error = currentResult?.status === 'error' ? currentResult.error : ''

  const loadProducts = useCallback(async (signal: AbortSignal): Promise<Product[]> => {
    return getProducts(session, signal)
  }, [session])

  const refreshProducts = useCallback(async () => {
    const controller = new AbortController()
    operationControllerRef.current = controller
    try {
      const nextProducts = await loadProducts(controller.signal)
      if (sessionRef.current !== session) return
      setResult({ session, status: 'success', products: nextProducts })
      const nameQuery = nameSearch.toLocaleLowerCase()
      const labelQuery = labelSearch.toLocaleLowerCase()
      const filteredCount = nextProducts.filter((product) =>
        (!nameQuery || product.name.toLocaleLowerCase().includes(nameQuery)) &&
        (!labelQuery || labelsOf(product).join(', ').toLocaleLowerCase().includes(labelQuery)),
      ).length
      setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil(filteredCount / PAGE_SIZE))))
      setOperationMessage('')
    } catch (reason: unknown) {
      if (sessionRef.current !== session) return
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
  }, [labelSearch, loadProducts, nameSearch, onSessionExpired, session])

  useEffect(() => {
    sessionRef.current = session
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
    return () => {
      active = false
      if (sessionRef.current === session) sessionRef.current = null
      controller.abort()
      detailControllerRef.current?.abort()
      operationControllerRef.current?.abort()
      fileControllerRef.current?.abort()
    }
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
  const effectivePage = Math.min(currentPage, pageCount)
  const visibleProducts = filteredProducts.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE)
  const labelOptions = useMemo(() => Array.from(new Set(products.flatMap(labelsOf))), [products])

  useEffect(() => {
    if (currentPage !== effectivePage) setCurrentPage(effectivePage)
  }, [currentPage, effectivePage])

  const handleSearchChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value)
    setCurrentPage(1)
  }

  const handleEdit = async (product: Product) => {
    detailControllerRef.current?.abort()
    const requestId = ++detailRequestIdRef.current
    const controller = new AbortController()
    detailControllerRef.current = controller
    setDetailLoading(true)
    setOperationMessage('')
    try {
      const detail = await getProduct(session, product.id, controller.signal)
      if (requestId !== detailRequestIdRef.current || sessionRef.current !== session) return
      setDialog({ mode: 'edit', product: detail })
      setDialogError('')
    } catch (reason: unknown) {
      if (requestId !== detailRequestIdRef.current || sessionRef.current !== session) return
      if (reason instanceof DOMException && reason.name === 'AbortError') return
      if ((reason instanceof ProductServiceError || reason instanceof AuthServiceError) && reason.kind === 'unauthorized') {
        onSessionExpired('使用者未授權')
        return
      }
      setOperationMessage(reason instanceof Error ? reason.message : '無法載入商品詳細資料')
    } finally {
      if (detailRequestIdRef.current === requestId) {
        detailControllerRef.current = null
        setDetailLoading(false)
      }
    }
  }

  const cancelDetailRequest = () => {
    detailRequestIdRef.current += 1
    detailControllerRef.current?.abort()
    detailControllerRef.current = null
    setDetailLoading(false)
  }

  const openCreateDialog = () => {
    cancelDetailRequest()
    setDialogError('')
    setDialog({ mode: 'create' })
  }

  const openDeleteDialog = (product: Product) => {
    cancelDetailRequest()
    setDialogError('')
    setDialog({ mode: 'delete', product })
  }

  const closeDialog = () => {
    cancelDetailRequest()
    setDialog({ mode: 'closed' })
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
      if (sessionRef.current !== session) return
      setDialog({ mode: 'closed' })
      await refreshProducts()
    } catch (reason: unknown) {
      if (sessionRef.current !== session) return
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
      if (sessionRef.current !== session) return
      setDialog({ mode: 'closed' })
      setCurrentPage(deletedPage)
      await refreshProducts()
    } catch (reason: unknown) {
      if (sessionRef.current !== session) return
      if (!(reason instanceof DOMException && reason.name === 'AbortError')) handleMutationError(reason, '產品刪除失敗')
    } finally {
      if (operationControllerRef.current === controller) operationControllerRef.current = null
      setBusy(false)
    }
  }

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || fileControllerRef.current) return
    const controller = new AbortController()
    fileControllerRef.current = controller
    setFileBusy(true)
    setOperationMessage('')
    void (async () => {
      try {
        await uploadProducts(session, file, controller.signal)
        if (sessionRef.current !== session) return
        await refreshProducts()
      } catch (reason: unknown) {
        if (sessionRef.current !== session || (reason instanceof DOMException && reason.name === 'AbortError')) return
        if (reason instanceof ProductServiceError && reason.kind === 'unauthorized') onSessionExpired('使用者未授權')
        else setOperationMessage(reason instanceof Error ? reason.message : '商品檔案上傳失敗')
      } finally {
        if (fileControllerRef.current === controller) fileControllerRef.current = null
        if (sessionRef.current === session) setFileBusy(false)
      }
    })()
  }

  const saveDownload = ({ blob, filename }: ProductDownload) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    let clicked = false
    try {
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      clicked = true
    } finally {
      link.remove()
      if (clicked) window.setTimeout(() => URL.revokeObjectURL(url), 0)
      else URL.revokeObjectURL(url)
    }
  }

  const handleDownload = (kind: 'template' | 'report') => {
    if (fileControllerRef.current || (kind === 'report' && filteredProducts.length === 0)) return
    const controller = new AbortController()
    fileControllerRef.current = controller
    setFileBusy(true)
    setOperationMessage('')
    void (async () => {
      try {
        const download = kind === 'template'
          ? await downloadProductTemplate(session, controller.signal)
          : await downloadProductData(session, filteredProducts.map((product) => product.id), controller.signal)
        if (sessionRef.current !== session) return
        saveDownload(download)
      } catch (reason: unknown) {
        if (sessionRef.current !== session || (reason instanceof DOMException && reason.name === 'AbortError')) return
        if (reason instanceof ProductServiceError && reason.kind === 'unauthorized') onSessionExpired('使用者未授權')
        else setOperationMessage(reason instanceof Error ? reason.message : '商品檔案下載失敗')
      } finally {
        if (fileControllerRef.current === controller) fileControllerRef.current = null
        if (sessionRef.current === session) setFileBusy(false)
      }
    })()
  }

  return (
    <main className="product-page">
      <SiteHeader authenticated activePage="products" onLogout={onLogout} onPermissions={() => window.alert('權限管理尚未開放')} onNavigateSell={onNavigateSell} />
      <section className="product-page__content" aria-label="商品管理">
        <div className="product-page__toolbar">
          <Button variant="secondary" className="product-page__batch" disabled={fileBusy} onClick={() => uploadInputRef.current?.click()}>批次管理</Button>
          <input ref={uploadInputRef} className="product-page__file-input" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" aria-label="選擇 Excel 檔案" onChange={handleFileSelected} />
          <Button className="product-page__add" onClick={openCreateDialog}>加入商品</Button>
        </div>
        <div className="product-page__downloads" aria-label="商品檔案功能">
          <Button variant="text" disabled={fileBusy} onClick={() => handleDownload('template')}>下載批次新增商品模板</Button>
          <Button variant="text" disabled={fileBusy || filteredProducts.length === 0} onClick={() => handleDownload('report')}>下載商品報表</Button>
        </div>
        {fileBusy ? <p role="status">商品檔案處理中…</p> : null}
        {detailLoading ? <p role="status">載入商品詳細資料…</p> : null}
        {operationMessage ? <p className="product-page__notice" role="status">{operationMessage}</p> : null}
        {loading ? <p role="status">載入中…</p> : null}
        {error ? <div role="alert"><p>{error}</p><Button variant="text" onClick={() => { setOperationMessage(''); void refreshProducts() }}>重新載入</Button></div> : null}
        {!loading && !error ? (
          <>
            <div className="product-page__filters">
              <label>篩選商品名稱<input type="search" value={nameSearch} onChange={handleSearchChange(setNameSearch)} /></label>
              <label>篩選商品分類<input type="search" value={labelSearch} onChange={handleSearchChange(setLabelSearch)} /></label>
            </div>
            <ProductTable products={visibleProducts} currentPage={effectivePage} pageCount={pageCount} onPageChange={setCurrentPage} onEdit={(product) => { void handleEdit(product) }} onDelete={openDeleteDialog} />
            {filteredProducts.length === 0 ? <p className="product-page__empty" role="status">{products.length === 0 ? '目前無產品' : '沒有符合條件的商品'}</p> : null}
          </>
        ) : null}
      </section>
      {dialog.mode === 'create' || dialog.mode === 'edit' ? (
        <Modal title={dialog.mode === 'create' ? '新增商品' : '編輯商品'} onClose={closeDialog} busy={busy}>
          <ProductForm mode={dialog.mode} initialProduct={dialog.mode === 'edit' ? dialog.product : undefined} labelOptions={labelOptions} busy={busy} error={dialogError} onCancel={closeDialog} onSubmit={(values) => { void submitProduct(values) }} />
        </Modal>
      ) : null}
      {dialog.mode === 'delete' ? (
        <Modal title="刪除商品" onClose={closeDialog} busy={busy}>
          <div className="product-page__delete-confirm">
            <p>確定要刪除商品「{dialog.product.name}」（編號：{dialog.product.id}）嗎？</p>
            {dialogError ? <p role="alert">{dialogError}</p> : null}
            <div className="product-form__actions">
              <Button onClick={() => { void confirmDelete() }} disabled={busy}>確認</Button>
              <Button variant="secondary" className="product-form__cancel" onClick={closeDialog} disabled={busy}>取消</Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  )
}
