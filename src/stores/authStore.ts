import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ✅ 定义用户信息类型
interface UserInfo {
  id: number
  username: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  token: string | null
  userInfo: UserInfo | null
  permissions: string[]
  roles: string[]

  setToken: (token: string) => void
  setUserInfo: (info: UserInfo) => void
  logout: () => void
  hasPermission: (perm: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userInfo: null,
      permissions: [],
      roles: [],

      setToken: (token: string) => set({ token }),
      setUserInfo: (info: UserInfo) => set({
        userInfo: info,
        permissions: info.permissions || [],
        roles: info.roles || []
      }),
      
      logout: () => set({
        token: null,
        userInfo: null,
        permissions: [],
        roles: []
      }),

      hasPermission: (perm: string) => {
        return get().permissions.includes(perm)
      }
    }),
    { name: 'auth-storage' }
  )
)