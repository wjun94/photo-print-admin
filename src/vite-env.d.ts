// 环境变量类型声明
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// ✅ 添加这部分：CSS 文件类型声明
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

// ✅ 可选：其他样式文件类型声明
declare module '*.scss'
declare module '*.less'
declare module '*.sass'