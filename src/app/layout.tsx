import { Layout, Menu, Avatar, Dropdown } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
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

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '首页' },
    { key: '/products', icon: <ShoppingOutlined />, label: '商品管理' },
    { key: '/orders', icon: <OrderedListOutlined />, label: '订单管理' },
    { key: '/wx-users', icon: <UserOutlined />, label: '用户管理' },
    // ✅ 系统设置下拉菜单
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: '/settings/commission',
          icon: <MoneyCollectOutlined />,
          label: '佣金管理'
        },
        {
          key: '/settings/qrcode',
          icon: <QrcodeOutlined />,
          label: '二维码管理'
        }
      ]
    }
  ]

  const userMenu = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: logout }
  ]

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
          items={menuItems}
          onClick={({ key }) => navigate(key)}
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