// src/core/lib/axios.ts
import axios from 'axios'
import { message } from 'antd'
import { useAuthStore } from '@/stores/authStore'

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

// 响应拦截器 → 这里必须返回 res.data
request.interceptors.response.use(
  (res) => {
    // ✅ 直接返回 data，接口才能拿到正确类型
    return res.data
  },
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      message.error('登录已过期')
    } else {
      message.error(err.message || '请求失败')
    }
    return Promise.reject(err)
  }
)

export default request