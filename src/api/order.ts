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
  id: string
  orderNo: string
  userId: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  remark: string
  amount: number
  freight: number
  actualAmount: number

  // ✅ 新增各状态时间字段
  payAt?: string
  finishAt?: string
  shippedAt?: string
  cancelAt?: string

  specs: {
    productId: string
    productName: string
    specId: string
    specName: string
    price: number
    totalQuantity: number
    totalSubtotal: number
    imageUrl: string
  }[]

  address: {
    id: string
    orderId: string
    receiverName: string
    mobile: string
    provinceId: string
    provinceName: string
    cityId: string
    cityName: string
    districtId: string
    districtName: string
    detail: string
    doorplate: string
    createdAt: string
    updatedAt: string
  }
}

// 订单列表请求参数
export interface OrderListParams extends PageParams {
  status?: string
}

// 获取订单列表接口（完全匹配你的后端接口）
export function getOrderListApi(params: OrderListParams) {
  return request.get<ApiResponse<PageList<Order[]>>>('/admin/orders', { params })
}

// 去发货
export function orderShip(data: any) {
  return request.post('/admin/order/ship', data)
}


// 完成订单
export function orderComplete(data: any) {
  return request.post('/admin/order/complete', data)
}