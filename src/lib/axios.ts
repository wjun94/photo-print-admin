import axios from 'axios'
import { message } from 'antd'
import { useAuthStore } from '@/stores/authStore'

export interface PageList<T> {
  list: T
  page: number,
  size: number,
  total: number
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：只返回 data
request.interceptors.response.use(
  (res) => res.data, // ✅ 必须返回 res.data
  (err) => {

    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      message.error('登录已过期')
      window.location.href = '/login'
    } else {
      message.error(err?.response?.data?.message || err.message || '请求失败')
    }

    return Promise.reject(err)
  }
)

export default request