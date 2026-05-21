import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

// 引入接口
import { loginApi, LoginParams } from '@/api'

export default function Login() {
  const [form] = Form.useForm<LoginParams>()
  const navigate = useNavigate()
  const { setToken, setUserInfo } = useAuthStore()
  console.log(import.meta.env.VITE_API_BASE_URL)
  // 使用接口
  const { loading, run: handleLogin } = useRequest(
    (params: LoginParams) => loginApi(params),
    {
      manual: true,
      onSuccess: (res) => {
        console.log(res)
        setToken(res.data.token)
        // setUserInfo(res.user)
        message.success('登录成功')
        navigate('/dashboard')
      },
      onError: () => {
        message.error('账号或密码错误')
      }
    }
  )

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5'
    }}>
      <div style={{ width: 400, padding: 32, background: '#fff', borderRadius: 8 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>商城后台管理系统</h2>

        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item<LoginParams>
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item<LoginParams>
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}