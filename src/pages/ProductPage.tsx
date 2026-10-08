import { useEffect, useState } from 'react'
import type { AuthSession, Product } from '../types/auth'
import { AuthServiceError } from '../services/auth-service'
import { getProducts } from '../services/product-service'
import { SiteHeader } from '../components/SiteHeader/SiteHeader'
import { Button } from '../components/Button/Button'
import './ProductPage.css'

interface ProductPageProps {
  session: AuthSession
  onLogout: () => void
  onSessionExpired: () => void
}

type ProductPageResult =
  | { session: AuthSession; status: 'success'; products: Product[] }
  | { session: AuthSession; status: 'error'; error: string }

export function ProductPage({ session, onLogout, onSessionExpired }: ProductPageProps) {
  const [result, setResult] = useState<ProductPageResult | null>(null)
  const currentResult = result?.session === session ? result : null
  const loading = currentResult === null
  const products = currentResult?.status === 'success' ? currentResult.products : []
  const error = currentResult?.status === 'error' ? currentResult.error : ''

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    getProducts(session, controller.signal).then((result) => {
      if (active) setResult({ session, status: 'success', products: result })
    }).catch((reason: unknown) => {
      if (!active || (reason instanceof DOMException && reason.name === 'AbortError')) return
      if (reason instanceof AuthServiceError && reason.kind === 'unauthorized') {
        onSessionExpired()
        return
      }
      setResult({
        session,
        status: 'error',
        error: reason instanceof AuthServiceError ? reason.message : '產品載入失敗',
      })
    })
    return () => { active = false; controller.abort() }
  }, [session, onSessionExpired])

  return (
    <main className="product-page">
      <SiteHeader authenticated activePage="products" onLogout={onLogout}
        onPermissions={() => window.alert('權限管理尚未開放')} />
      <section className="product-page__content" aria-label="商品管理">
        <div className="product-page__toolbar">
          <Button variant="secondary" className="product-page__add" disabled>加入商品</Button>
        </div>
        {loading ? <p role="status">載入中…</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {!loading && !error ? (
          <div className="product-table-scroll"><table><thead><tr>
            <th>商品編號</th><th>商品名稱</th><th>商品分類</th><th>成本</th><th>價格</th><th>編輯</th>
          </tr></thead><tbody>{products.length === 0 ? <tr><td colSpan={6}>目前無產品</td></tr> : products.map((product) => <tr key={product.id}>
            <td>{product.id}</td><td>{product.name}</td><td>{product.label_names}</td>
            <td>{product.cost}</td><td>{product.price}</td>
            <td><div className="product-page__actions"><img src="/icon/pencil.png" alt="編輯" /><img src="/icon/delete.png" alt="刪除" /></div></td>
          </tr>)}</tbody></table></div>
        ) : null}
      </section>
    </main>
  )
}
