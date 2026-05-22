// src/api/order.ts
import request from '@/core/lib/axios'

// 订单项类型
export interface OrderItem {
  id: number
  imageUrl: string
  orderId: number
  photoId: number
  price: number
  quantity: number
  spec: string
}

// 订单类型
export interface Order {
  id: number
  orderNo: string
  userId: number
  address: string
  amount: number
  status: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

// 获取订单列表接口
export function getOrderListApi() {
  return request.get<{ list: Order[] }>('/orders')
}