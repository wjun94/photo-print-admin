# React 商城后台管理系统

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.2.11-green" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-5.4.5-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Ant%20Design-6.0.0-blueviolet" alt="Ant Design">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</div>

开箱即用的现代化商城后台管理系统模板，采用最新前端技术栈构建，包含完整的RBAC权限管理系统、通用组件封装和工程化配置，可直接用于生产环境开发。

## ✨ 核心特性

- ✅ **完整权限系统**：路由级守卫 + 按钮级细粒度权限控制
- ✅ **登录认证**：JWT Token 持久化 + 自动过期处理
- ✅ **高级表格**：封装 ProTable 组件，支持分页、搜索、加载状态
- ✅ **统一请求层**：Axios 拦截器 + 全局错误处理
- ✅ **状态管理**：轻量级 Zustand + 本地持久化
- ✅ **工程化配置**：TypeScript 全类型支持 + ESLint + Prettier
- ✅ **响应式布局**：基于 Ant Design 6 的企业级 UI 设计
- ✅ **路由管理**：React Router v7 声明式路由 + 懒加载支持

## 🛠️ 技术栈

| 类别        | 技术           | 版本    | 说明                              |
| ----------- | -------------- | ------- | --------------------------------- |
| 核心框架    | React          | ^18.3.1 | 前端主流声明式框架                |
| 构建工具    | Vite           | ^5.2.11 | 极速开发体验，热更新秒级响应      |
| 语言        | TypeScript     | ^5.4.5  | 强类型保障，减少运行时错误        |
| UI 组件库   | Ant Design     | ^6.0.0  | 企业级后台组件库                  |
| 状态管理    | Zustand        | ^5.0.0  | 轻量级，API 简洁，无样板代码      |
| 服务端状态  | TanStack Query | ^5.0.0  | 统一管理 API 请求，自动缓存与刷新 |
| 路由        | React Router   | ^7.0.0  | 声明式路由，支持嵌套路由          |
| 工具库      | ahooks         | ^3.8.1  | 高质量 React Hooks 集合           |
| HTTP 客户端 | Axios          | ^1.7.0  | 统一请求封装，拦截器支持          |
| 包管理器    | pnpm           | ^9.0.0  | 快速、高效、磁盘空间友好          |

## 🚀 快速开始

### 环境要求

- Node.js ≥ 20.0.0
- pnpm ≥ 9.0.0

### 1. 克隆项目

```bash
git clone https://github.com/your-username/mall-admin.git
cd mall-admin
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制环境变量模板并修改为你的配置：

```bash
cp .env.example .env.development
```

```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=商城后台管理系统
VITE_ENABLE_MOCK=false
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173 即可进入登录页面。

### 5. 构建生产版本

```bash
pnpm build
```

构建产物将生成在 `dist` 目录，可直接部署到静态服务器。

### 6. 预览生产构建

```bash
pnpm preview
```

## 📁 目录结构

```
mall-admin/
├── public/                 # 静态资源（直接复制到 dist）
├── src/
│   ├── app/                # 应用层（页面组件）
│   │   ├── layout.tsx      # 全局布局（侧边栏 + 顶部导航）
│   │   ├── login/          # 登录模块
│   │   ├── dashboard/      # 仪表盘/首页
│   │   ├── products/       # 商品管理
│   │   ├── orders/         # 订单管理
│   │   ├── users/          # 用户管理
│   │   └── settings/       # 系统设置
│   ├── core/               # 核心层（通用能力）
│   │   ├── components/     # 通用业务组件
│   │   │   ├── ProTable/   # 高级表格组件
│   │   │   └── PermissionGuard/ # 权限守卫组件
│   │   ├── lib/            # 第三方库封装
│   │   │   ├── axios.ts    # HTTP 请求封装
│   │   │   └── query.ts    # React Query 全局配置
│   │   └── utils/          # 通用工具函数
│   ├── stores/             # 全局状态管理
│   │   └── authStore.ts    # 认证状态（用户信息、权限、Token）
│   ├── router/             # 路由配置
│   │   ├── index.tsx       # 路由入口
│   │   └── AuthGuard.tsx   # 路由权限守卫
│   ├── styles/             # 全局样式
│   ├── assets/             # 静态资源（图片、字体等，会被构建处理）
│   ├── main.tsx            # 应用入口
│   └── vite-env.d.ts       # Vite 环境变量类型声明
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── .eslintrc.cjs           # ESLint 代码检查配置
├── .prettierrc             # Prettier 代码格式化配置
├── tsconfig.json           # TypeScript 主配置
├── tsconfig.node.json      # Node.js 环境 TypeScript 配置
├── vite.config.ts          # Vite 构建配置
└── package.json            # 项目依赖与脚本
```

## 🎯 核心功能说明

### 1. 权限系统

采用 RBAC 基于角色的访问控制模型，支持两级权限控制：

#### 路由级权限

未登录用户自动跳转登录页，登录后根据角色权限过滤可访问路由：

```typescript
// src/router/AuthGuard.tsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(state => state.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}
```

#### 按钮级权限

通过 `PermissionGuard` 组件控制操作按钮的显示与隐藏：

```typescript
import { PermissionGuard } from '@/core/components/PermissionGuard'

// 只有拥有 product:add 权限的用户才能看到新增按钮
<PermissionGuard permission="product:add">
  <Button type="primary">新增商品</Button>
</PermissionGuard>
```

### 2. ProTable 高级表格

封装 Ant Design Table 和 ahooks useRequest，一行代码实现带分页、加载状态的表格：

```typescript
import { ProTable, PageParams, PageResponse } from '@/core/components/ProTable'
import request from '@/core/lib/axios'

interface Product {
  id: number
  name: string
  price: number
  status: number
}

export default function Products() {
  const columns = [
    { title: '商品ID', dataIndex: 'id' },
    { title: '商品名称', dataIndex: 'name' },
    { title: '价格(元)', dataIndex: 'price' },
    { title: '状态', dataIndex: 'status', render: (v) => v ? '上架' : '下架' }
  ]

  // 自动处理分页、加载状态和错误
  const getProducts = async (params: PageParams): Promise<PageResponse<Product>> => {
    return request.get('/products', { params })
  }

  return (
    <ProTable<Product>
      columns={columns}
      request={getProducts}
      toolBar={<Button type="primary">新增商品</Button>}
    />
  )
}
```

### 3. 统一 API 请求层

自动添加 Token、统一错误处理、响应数据格式化：

```typescript
// src/core/lib/axios.ts
import axios from 'axios'
import { message } from 'antd'
import { useAuthStore } from '@/stores/authStore'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器：自动添加 Authorization 头
request.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      message.error('登录已过期，请重新登录')
    } else {
      message.error(err.response?.data?.message || '请求失败')
    }
    return Promise.reject(err)
  },
)

export default request
```

## 📝 开发规范

### 代码规范

- 使用 ESLint + Prettier 统一代码风格
- 所有组件和函数必须添加 TypeScript 类型声明
- 避免使用 `any` 类型，必要时使用 `unknown` 替代
- 组件文件使用 PascalCase 命名（如 `ProductList.tsx`）
- 工具函数使用 camelCase 命名（如 `formatDate.ts`）

### Git 提交规范

```
<type>(<scope>): <subject>

# 示例
feat(products): 添加商品编辑和删除功能
fix(auth): 修复登录状态持久化问题
docs: 更新项目文档和使用说明
refactor: 重构 ProTable 组件逻辑
```

## 🚢 部署指南

### Nginx 部署

1. 构建生产版本：`pnpm build`
2. 将 `dist` 目录上传到服务器
3. 配置 Nginx：

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/mall-admin/dist;
  index index.html;

  # 支持 SPA 路由
  location / {
    try_files $uri $uri/ /index.html;
  }

  # API 代理
  location /api {
    proxy_pass http://your-backend-server:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # 静态资源缓存
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Docker 部署

项目根目录提供了 `Dockerfile` 和 `docker-compose.yml`，一键部署：

```bash
# 构建镜像并启动容器
docker-compose up -d --build
```

## ❓ 常见问题

### 1. 找不到模块 "@/xxx"

- 确保 `tsconfig.json` 中配置了正确的路径别名
- 重启 TypeScript 语言服务：`Ctrl+Shift+P` → `TypeScript: 重启 TS 服务器`

### 2. 类型"ImportMeta"上不存在属性"env"

- 创建 `src/vite-env.d.ts` 文件并添加 Vite 类型声明

### 3. API 请求返回 404

- 检查 `vite.config.ts` 中的代理配置
- 确保后端服务正在运行且端口正确

### 4. Target container is not a DOM element

- 确保 `index.html` 中有 `<div id="root"></div>`
- 确保 script 标签在 div 元素之后

### 5. tsconfig.json JSON 解析错误

- 检查 JSON 语法，确保没有多余的逗号和不匹配的引号
- 使用在线 JSON 校验工具检查格式

## 📈 后续扩展

- [ ] 国际化支持（i18next）
- [ ] 明暗主题切换
- [ ] 数据可视化（ECharts）
- [ ] 实时通知（Socket.IO）
- [ ] 单元测试（Vitest）
- [ ] 微前端架构（Module Federation）

## 📄 许可证

MIT License © 2026 商城后台管理系统

---

<div align="center">
  如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！
</div>
