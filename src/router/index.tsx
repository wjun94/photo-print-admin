// src/router/index.tsx 完整正确配置
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthGuard } from './AuthGuard'
import AppLayout from '@/app/layout'
import Login from '@/app/login/page'
import Dashboard from '@/app/dashboard/page'
import Products from '@/app/products/page'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <AuthGuard><AppLayout /></AuthGuard>,
    // ✅ 添加根路径重定向（非常重要！）
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/products', element: <Products /> },
    ]
  },
  // ✅ 添加404页面（捕获所有未匹配的路由）
  {
    path: '*',
    element: <div style={{ textAlign: 'center', padding: 100 }}>
      <h1>404 - 页面不存在</h1>
      <button onClick={() => window.location.href = '/dashboard'}>返回首页</button>
    </div>
  }
])

export default function Router() {
  return <RouterProvider router={router} />
}