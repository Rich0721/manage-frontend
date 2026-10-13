import type { Product } from '../../types/auth'
import { Button } from '../Button/Button'
import './ProductTable.css'

interface ProductTableProps {
  products: Product[]
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

function displayLabels(labelNames: string): string[] {
  return labelNames.split(',').map((label) => label.trim()).filter(Boolean)
}

export function ProductTable({ products, currentPage, pageCount, onPageChange, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="product-table-scroll">
      <table className="product-table">
        <thead><tr>
          <th>商品編號</th><th>商品名稱</th><th>商品分類</th><th>成本</th><th>價格</th><th>庫存</th><th>編輯</th>
        </tr></thead>
        <tbody>{products.map((product) => (
          <tr key={product.id}>
            <td>{product.id}</td><td>{product.name}</td>
            <td><div className="product-table__labels">{displayLabels(product.label_names).map((label) => <span className="product-table__label" key={label}>{label}</span>)}</div></td>
            <td>{product.cost}</td><td>{product.price}</td><td>{product.stock}</td>
            <td><div className="product-table__actions">
              <Button variant="text" aria-label={`編輯商品 ${product.name}`} onClick={() => onEdit(product)}><img src="/icon/pencil.png" alt="" /></Button>
              <Button variant="text" aria-label={`刪除商品 ${product.name}`} onClick={() => onDelete(product)}><img src="/icon/delete.png" alt="" /></Button>
            </div></td>
          </tr>
        ))}</tbody>
      </table>
      <div className="product-table__pagination" aria-label="產品分頁">
        <span aria-live="polite">Pages&nbsp; {currentPage}/{pageCount}</span>
        <Button variant="text" aria-label="上一頁" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}><img src="/icon/left-arrow.png" alt="" /></Button>
        <Button variant="text" aria-label="下一頁" disabled={currentPage >= pageCount} onClick={() => onPageChange(currentPage + 1)}><img src="/icon/right-arrow.png" alt="" /></Button>
      </div>
    </div>
  )
}
