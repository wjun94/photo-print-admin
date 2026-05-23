// src/api/order.ts
import request, { PageList } from '@/lib/axios'
import { PageParams, ApiResponse } from '@/components'

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

// 订单列表请求参数
export interface OrderListParams extends PageParams {
  status?: string
}

// 获取订单列表接口（完全匹配你的后端接口）
export function getOrderListApi(params: OrderListParams) {
  return request.get<ApiResponse<PageList<Order[]>>>('/admin/orders', { params })
}