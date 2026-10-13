export interface ProductFormValues {
  name: string
  labelNames: string[]
  cost: string
  price: string
}

export interface ProductFormErrors {
  name?: string
  labelNames?: string
  cost?: string
  price?: string
  summary?: string
}

export function validateProduct(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {}
  if (!values.name.trim()) errors.name = '請填寫完整的產品資料'
  if (values.labelNames.length === 0) errors.labelNames = '請填寫完整的產品資料'
  const cost = Number(values.cost)
  if (!values.cost.trim() || !Number.isFinite(cost) || cost < 1) errors.cost = '成本最小值為 1'
  const price = Number(values.price)
  if (!values.price.trim() || !Number.isFinite(price) || price < 1) errors.price = '售價最小值為 1'
  if (Object.keys(errors).length > 0) errors.summary = '請填寫完整的產品資料'
  return errors
}
