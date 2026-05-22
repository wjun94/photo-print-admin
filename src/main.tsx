// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN.js' // ✅ Vite 项目必须用这个路径
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // ✅ 日期组件中文
import { QueryClientProvider } from '@tanstack/react-query'
import Router from './router'
import { queryClient } from './core/lib/query'
import './index.css'

// 设置 dayjs 中文
dayjs.locale('zh-cn')

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('找不到 id 为 root 的 DOM 元素')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* ✅ 全局配置中文 */}
      <ConfigProvider 
        locale={zhCN}
        theme={{ token: { colorPrimary: '#1677ff' } }}
      >
        <Router />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)