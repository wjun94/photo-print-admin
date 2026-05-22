import { Layout, Menu, Avatar, Dropdown, Button } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'
import {
  DashboardOutlined, ShoppingOutlined, LogoutOutlined, OrderedListOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, logout } = useAuthStore()

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '首页' },
    { key: '/products', icon: <ShoppingOutlined />, label: '商品管理' },
    {
      key: '/orders', // 新增订单菜单
      icon: <OrderedListOutlined />,
      label: '订单管理'
    }
  ]

  const userMenu = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: logout }
  ]

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider theme="light">
        <div style={{ height: 48, background: '#1677ff', margin: 16, borderRadius: 4, color: 'white' }}>后台管理系统</div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenu }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{userInfo?.username || '管理员'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px', padding: 16, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}