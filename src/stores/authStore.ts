import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUserInfoApi, UserInfo } from '@/api/auth'

interface AuthState {
  token: string | null
  userInfo: UserInfo | null
  permissions: string[]
  roles: string[]

  setToken: (token: string) => void
  setUserInfo: (user: UserInfo) => void
  logout: () => void
  hasPermission: (perm: string) => boolean
  fetchUserInfo: () => Promise<UserInfo | null>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userInfo: null,
      permissions: [],
      roles: [],

      // 设置token
      setToken: (token: string) => set({ token }),

      // 设置用户信息 & 权限
      setUserInfo: (user: UserInfo) => set({
        userInfo: user,
        roles: user.roles || [],
        permissions: user.permissions || [],
      }),

      // 退出登录
      logout: () => set({
        token: null,
        userInfo: null,
        roles: [],
        permissions: [],
      }),

      // 判断是否有权限
      hasPermission: (perm: string) => {
        return get().permissions.includes(perm)
      },

      // 获取用户信息 + 权限
      fetchUserInfo: async () => {
        try {
          const userInfo = await getUserInfoApi()
          get().setUserInfo(userInfo.data)
          return userInfo.data
        } catch (err) {
          get().logout()
          return null
        }
      },
    }),
    {
      name: 'auth-storage',
      // ✅ 关键：只持久化 token，其他都不存！
      partialize: (state) => ({
        token: state.token
      })
    }
  )
)