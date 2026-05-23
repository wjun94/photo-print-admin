import request from '@/lib/axios'
import { PageParams, ApiResponse } from '@/components'

// 商品规格
export interface ProductSpec {
  id?: number
  image: string
  name: string
  price: number
  sku_code: string
  sort_order: number
  stock: number
}

// 商品
export interface Product {
  id?: number
  name: string
  coverImage: string         // 单张
  bannerImages: string[]    // 轮播多张
  description?: string
  detail?: string
  status: 'draft' | 'on_sale' | 'off_sale'
  sort_order: number
  specs: ProductSpec[]
  createdAt?: string
  updatedAt?: string
}

// 列表参数
export interface ProductListParams extends PageParams {
  name?: string
  status?: string
}

// 列表
export function getProductListApi(params: ProductListParams) {
  return request.get<ApiResponse<{ list: Product[] }>>('/admin/products', { params })
}

// 详情
export function getProductDetailApi(id: number) {
  return request.get<ApiResponse<Product>>(`/admin/products/${id}`)
}

// 新增
export function createProductApi(data: Product) {
  return request.post('/admin/products', data)
}

// 编辑
export function updateProductApi(id: number, data: Product) {
  return request.put(`/admin/products/${id}`, data)
}

// 删除
export function deleteProductApi(id: number) {
  return request.delete(`/admin/products/${id}`)
}