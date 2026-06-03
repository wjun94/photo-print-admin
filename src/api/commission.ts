import request from '@/lib/axios'

// 设置返利比例
export function setCommissionRatio(params: { ratio: number }) {
  return request.post<null>('/admin/commission/ratio', params)
}

// 获取当前生效的返利比例
export function getCommissionRatio() {
  return request.get<{ ratio: number }>('/admin/commission/ratio')
}
