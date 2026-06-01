import request from '@/lib/axios'

// 获取订单列表接口（完全匹配你的后端接口）
export function couriers() {
  return request.get<{ name: string, code: string }[]>('/couriers')
}
