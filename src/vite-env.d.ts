// 环境变量类型声明
interface ImportMetaEnv {
  /** 接口请求地址 */
  readonly VITE_API_BASE_URL: string
  /** 网页标题 */
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_MOCK: string
  /** 图片域名 */
  readonly VITE_STATIC_BASE_URL: string
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