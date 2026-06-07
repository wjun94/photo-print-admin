import { Layout, Menu, Avatar, Dropdown } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { UserOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'
import {
  DashboardOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  OrderedListOutlined,
  MoneyCollectOutlined,
  SettingOutlined,
  QrcodeOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, logout } = useAuthStore()

  // 菜单展开状态
  const [openKeys, setOpenKeys] = useState<string[]>([])

  // ✅ 菜单配置（以后只需要在这里添加新菜单，自动适配所有逻辑）
  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '首页' },
    { key: '/products', icon: <ShoppingOutlined />, label: '商品管理' },
    { key: '/orders', icon: <OrderedListOutlined />, label: '订单管理' },
    { key: '/wx-users', icon: <UserOutlined />, label: '用户管理' },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        { key: '/settings/commission', icon: <MoneyCollectOutlined />, label: '佣金管理' },
        { key: '/settings/qrcode', icon: <QrcodeOutlined />, label: '二维码管理' }
      ]
    }
    // ✅ 以后添加新的父菜单，只需要在这里加，自动支持展开
    // {
    //   key: 'system',
    //   icon: <ToolOutlined />,
    //   label: '系统管理',
    //   children: [
    //     { key: '/system/users', icon: <UserOutlined />, label: '用户管理' },
    //     { key: '/system/roles', icon: <TeamOutlined />, label: '角色管理' }
    //   ]
    // }
  ]

  const userMenu = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: logout }
  ]

  // ✅ 动态生成父菜单路由前缀映射（自动从menuItems读取）
  const parentMenuMap = useMemo(() => {
    const map: Record<string, string> = {} // key: 父菜单key, value: 路由前缀

    menuItems.forEach(item => {
      // 只处理有子菜单的父菜单
      if (item.children && item.children.length > 0) {
        // 从第一个子菜单路径自动提取父级前缀
        // 例如：/settings/commission → 提取前缀 /settings/
        const firstChildPath = item.children[0].key
        const prefix = firstChildPath.substring(0, firstChildPath.lastIndexOf('/') + 1)
        map[item.key] = prefix
      }
    })

    return map
  }, [])

  // ✅ 路由变化时自动展开对应的父菜单（完全动态，无需写死）
  useEffect(() => {
    const path = location.pathname
    const matchedParentKeys: string[] = []

    // 遍历所有父菜单，自动匹配当前路由
    Object.entries(parentMenuMap).forEach(([parentKey, prefix]) => {
      if (path.startsWith(prefix)) {
        matchedParentKeys.push(parentKey)
      }
    })

    setOpenKeys(matchedParentKeys)
  }, [location.pathname, parentMenuMap])

  // 处理菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
  }

  // 处理菜单选择
  const handleMenuSelect = ({ key }: { key: string }) => {
    // 检查是否是父菜单
    const isParentMenu = menuItems.some(item =>
      item.key === key && item.children && item.children.length > 0
    )

    // 父菜单不跳转，只展开/收起
    if (isParentMenu) {
      return
    }

    // 子菜单执行路由跳转
    navigate(key)
  }

  return (
    <Layout className="h-screen">
      {/* 左侧侧边栏 */}
      <Sider theme="light" width={200} className="shadow-md">
        {/* Logo 区域 */}
        <div className="h-12 bg-primary m-4 rounded flex items-center justify-center text-white font-semibold">
          后台管理系统
        </div>

        {/* 菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onSelect={handleMenuSelect}
          items={menuItems}
          className="border-r-0"
        />
      </Sider>

      {/* 右侧主内容区 */}
      <Layout>
        {/* 顶部导航栏 */}
        <Header className="px-4 flex justify-end items-center bg-white shadow-sm">
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer hover:text-primary text-white transition-colors">
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{userInfo?.username || '管理员'}</span>
            </div>
          </Dropdown>
        </Header>

        {/* 页面内容 */}
        <Content className="m-4 p-4 bg-white rounded-lg shadow-sm overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}