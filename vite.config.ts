// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ✅ defineConfig 支持函数形式，参数为当前环境 mode
export default defineConfig(({ mode }) => {
  // 加载当前环境的 .env 文件
  // 第三个参数 '' 表示加载所有以 VITE_ 开头的变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          // ✅ 从环境变量读取 target 地址
          target: env.VITE_API_PROXY_TARGET,
          changeOrigin: true,
          // 如果后端接口没有 /api 前缀，需要添加这行重写
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})