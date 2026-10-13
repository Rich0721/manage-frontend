import { useState, type FormEvent } from 'react'
import type { Product } from '../../types/auth'
import { Button } from '../Button/Button'
import { FormField } from '../FormField/FormField'
import { ProductLabelInput } from '../ProductLabelInput/ProductLabelInput'
import { validateProduct, type ProductFormErrors, type ProductFormValues } from '../../pages/product-validation'
import './ProductForm.css'

interface ProductFormProps {
  mode: 'create' | 'edit'
  initialProduct?: Product
  labelOptions: string[]
  busy: boolean
  error: string
  onCancel: () => void
  onSubmit: (values: ProductFormValues) => void
}

export function ProductForm({ initialProduct, labelOptions, busy, error, onCancel, onSubmit }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>({
    name: initialProduct?.name ?? '',
    labelNames: initialProduct?.label_names ? initialProduct.label_names.split(',').map((label) => label.trim()).filter(Boolean) : [],
    cost: initialProduct ? String(initialProduct.cost) : '',
    price: initialProduct ? String(initialProduct.price) : '',
    stock: initialProduct ? String(initialProduct.stock) : '0',
  })
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const update = (field: keyof ProductFormValues, value: string | string[]) => {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined, summary: undefined }))
  }
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateProduct(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(values)
  }

  return (
    <form className="product-form" noValidate onSubmit={handleSubmit}>
      <div className="product-form__fields">
        <div className="product-form__id"><span>商品編號</span><output>{initialProduct?.id ?? ''}</output></div>
        <FormField id="product-name" label="商品名稱" type="text" value={values.name} onChange={(event) => update('name', event.target.value)} onBlur={() => undefined} error={errors.name} aria-required="true" />
        <div className="product-form__field">
          <label>商品分類</label>
          <ProductLabelInput value={values.labelNames} options={labelOptions} onChange={(labels) => update('labelNames', labels)} error={errors.labelNames} />
        </div>
        <FormField id="product-cost" label="成本" type="number" min="1" step="any" value={values.cost} onChange={(event) => update('cost', event.target.value)} onBlur={() => undefined} error={errors.cost} aria-required="true" />
        <FormField id="product-price" label="售價" type="number" min="1" step="any" value={values.price} onChange={(event) => update('price', event.target.value)} onBlur={() => undefined} error={errors.price} aria-required="true" />
        <FormField id="product-stock" label="庫存" type="number" min="0" step="any" value={values.stock} onChange={(event) => update('stock', event.target.value)} onBlur={() => undefined} error={errors.stock} aria-required="true" />
      </div>
      {errors.summary ? <p className="product-form__summary" role="alert">{errors.summary}</p> : null}
      {error ? <p className="product-form__summary" role="alert">{error}</p> : null}
      <div className="product-form__actions">
        <Button type="submit" disabled={busy}>確認</Button>
        <Button variant="secondary" className="product-form__cancel" onClick={onCancel} disabled={busy}>取消</Button>
      </div>
    </form>
  )
}
