import request from '@/lib/axios'

// 取概览卡片数据
export function overview() {
  return request.get('/admin/dashboard/overview')
}

// 获取订单量/销售额趋势数据
export function trend(params: { type: string }) {
  return request.get('/admin/dashboard/trend', { params })
}