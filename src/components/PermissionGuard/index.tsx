import { useAuthStore } from '@/stores/authStore'

interface Props {
  permission?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const PermissionGuard = ({ permission, children, fallback = null }: Props) => {
  // ✅ 直接从 authStore 获取权限判断方法
  const { hasPermission } = useAuthStore()

  // 没有指定权限，直接显示
  if (!permission) return <>{children}</>

  // 有权限显示 children，否则显示 fallback
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
}