import request from '@/lib/axios'
import { PageParams, ApiResponse } from '@/components'

// 微信用户类型
export interface WxUser {
  id: number
  nickname: string
  avatar: string
  openid: string
  mobile?: string
  status: 0 | 1 // 0=禁用 1=正常
  createdAt: string
  updatedAt: string
}

// 用户列表请求参数
export interface WxUserListParams extends PageParams {
  nickname?: string
  mobile?: string
  status?: number
}

// 获取微信用户列表
export function getWxUserListApi(params: WxUserListParams) {
  return request.get<ApiResponse<WxUser[]>>('/admin/wx-users', { params })
}

// ✅ 新增：修改用户状态（启用/禁用）
export function updateWxUserStatusApi(id: number, status: 0 | 1) {
  return request.put(`/admin/wx-users/${id}/status`, { status })
}