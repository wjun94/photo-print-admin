// src/router/AuthGuard.tsx 完整正确配置
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(state => state.token)
  
  // 未登录跳转到登录页
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}