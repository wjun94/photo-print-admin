import request from '@/core/lib/axios'
import { PageParams, ApiResponse } from '@/core/components/ProTable'

// 微信用户类型
export interface WxUser {
  id: number
  nickname: string
  avatar: string
  openid: string
  phone?: string
  status: 0 | 1 // 0=禁用 1=正常
  createdAt: string
  updatedAt: string
}

// 用户列表请求参数
export interface WxUserListParams extends PageParams {
  nickname?: string
  phone?: string
  status?: number
}

// 获取微信用户列表
export function getWxUserListApi(params: WxUserListParams) {
  return request.get<ApiResponse<WxUser[]>>('/admin/wx-users', { params })
}