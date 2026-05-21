// src/core/lib/axios.ts
import axios, { AxiosResponse, AxiosError } from 'axios'
import { message } from 'antd'
import { useAuthStore } from '@/stores/authStore'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
request.interceptors.response.use(
  (res: AxiosResponse) => res.data,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      message.error('登录已过期')
    } else {
      message.error((err.response?.data as any)?.message || '请求失败')
    }
    return Promise.reject(err)
  }
)

export default request