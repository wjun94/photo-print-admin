import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import request from '@/core/lib/axios'

const { Title } = Typography
const APP_TITLE = import.meta.env.VITE_APP_TITLE

// ✅ 定义登录表单类型
interface LoginFormValues {
  username: string
  password: string
}

// ✅ 定义登录响应类型
interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
    roles: string[]
    permissions: string[]
  }
}

export default function Login() {
  const [form] = Form.useForm<LoginFormValues>()
  const navigate = useNavigate()
  const { setToken, setUserInfo } = useAuthStore()

  const { loading, run: login } = useRequest(
    // ✅ 明确 values 类型
    async (values: LoginFormValues): Promise<LoginResponse> => {
      return request.post('/auth/login', values)
    },
    {
      manual: true,
      onSuccess: (res: LoginResponse) => {
        setToken(res.token)
        setUserInfo(res.user)
        message.success('登录成功')
        navigate('/dashboard')
      }
    }
  )

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>{APP_TITLE}</Title>
        <Form form={form} onFinish={login} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="admin" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="123456" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>登录</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}