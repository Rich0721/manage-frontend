import { describe, expect, it } from 'vitest'
import { validateProduct, type ProductFormValues } from './product-validation'

const validValues: ProductFormValues = { name: 'Item', labelNames: ['A'], cost: '1', price: '10', stock: '0' }

describe('validateProduct', () => {
  it('accepts minimum prices and zero stock', () => {
    expect(validateProduct({ ...validValues, cost: '1', price: '1', stock: '0' })).toEqual({})
  })

  it('rejects blank required values and preserves field-specific errors', () => {
    const errors = validateProduct({ ...validValues, name: ' ', labelNames: [], cost: '', price: '0', stock: '-1' })
    expect(errors).toMatchObject({
      name: '請填寫完整的產品資料', labelNames: '請填寫完整的產品資料',
      cost: '成本最小值為 1', price: '售價最小值為 1', stock: '庫存最小值為 0',
      summary: '請填寫完整的產品資料',
    })
  })
})
