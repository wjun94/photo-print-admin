import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Spin } from 'antd'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { token, fetchUserInfo } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      if (token) {
        // ✅ 进入页面先获取用户信息 + 权限
        await fetchUserInfo()
      }
      setLoading(false)
    }
    init()
  }, [token, fetchUserInfo])

  // 加载中显示 loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  // 没 token 去登录
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // 正常放行
  return <>{children}</>
}