// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { QueryClientProvider } from '@tanstack/react-query'
import Router from './router'
import { queryClient } from './core/lib/query'
import './index.css'

// ✅ 正确写法：获取 id 为 root 的元素
const rootElement = document.getElementById('root')

// ✅ 增加空值检查，避免运行时错误
if (!rootElement) {
  throw new Error('找不到 id 为 root 的 DOM 元素，请检查 index.html')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
        <Router />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)