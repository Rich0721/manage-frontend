import type { Product } from './auth'

export interface SellLineItem {
  product: Product
  adjustedPrice: number
  quantity: number
}

export interface OrderItemInput {
  productId: string
  quantity: number
  price: number
  discount: number
}

export interface CreateOrderInput {
  totalAmount: number
  totalDiscount: number
  orderItems: OrderItemInput[]
}

export interface CreatedOrder {
  orderId: string
  totalAmount: number
  totalDiscount: number
  orderItems: OrderItemInput[]
}
