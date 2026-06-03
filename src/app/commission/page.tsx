import {
  Card, Form, InputNumber, Button, message,
  Typography, Space, Alert
} from 'antd'
import { SaveOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { setCommissionRatio, getCommissionRatio } from '@/api'

const { Text, Title } = Typography

export default function CommissionSettings() {
  // Antd 6.x 推荐在 useForm 中初始化表单
  const [form] = Form.useForm<{ ratio: number }>()

  // 获取当前佣金比例
  const { loading: getLoading } = useRequest(
    () => getCommissionRatio(),
    {
      onSuccess: (res) => {
        // 安全获取数据并填充表单
        const currentRatio = res?.data?.ratio ?? 0
        form.setFieldValue('ratio', currentRatio)
      },
      onError: () => {
        message.error('加载佣金比例失败，请刷新页面重试')
      }
    }
  )

  // 设置佣金比例
  const { run: submitSetRatio, loading: submitLoading } = useRequest(
    (ratio: number) => setCommissionRatio({ ratio }),
    {
      manual: true,
      onSuccess: () => {
        message.success('佣金比例设置成功')
      },
      onError: () => {
        message.error('设置失败，请稍后重试')
      }
    }
  )

  // 提交表单
  const handleSubmit = (values: { ratio: number }) => {
    submitSetRatio(values.ratio)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <Title level={3} style={{ margin: 0 }}>系统设置</Title>
          <Text type="secondary" className="mt-1 block">
            配置平台全局佣金比例
          </Text>
        </div>

        {/* 佣金设置卡片 */}
        <Card variant="borderless" className="shadow-sm">
          <div className="mb-6">
            <Title level={5} style={{ marginBottom: 4 }}>佣金比例设置</Title>
            <Alert
              title="佣金比例为订单实付金额的百分比，设置后仅对新创建的订单生效"
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ ratio: 0 }}
            disabled={getLoading || submitLoading}
          >
            <Form.Item
              label={
                <span className="text-sm font-medium text-gray-700">
                  佣金比例
                </span>
              }
              name="ratio"
              rules={[
                { required: true, message: '请输入佣金比例' },
                {
                  type: 'number',
                  min: 0,
                  max: 100,
                  message: '比例必须在 0-100 之间'
                }
              ]}
              extra="例如：输入 5 表示收取订单实付金额的 5% 作为佣金"
            >
              {/* ✅ Antd 6.4.3 正确写法：使用 suffix 替代废弃的 addonAfter */}
              <InputNumber
                min={0}
                max={100}
                step={0.01}
                precision={2}
                placeholder="请输入佣金比例"
                style={{ width: '100%' }}
                suffix="%"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="flex justify-end pt-4">
              <Space size="middle">
                <Button
                  size="large"
                  onClick={() => form.resetFields()}
                  disabled={submitLoading}
                >
                  重置
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={submitLoading}
                  className="h-12 px-8 text-base font-medium rounded-lg"
                >
                  保存设置
                </Button>
              </Space>
            </div>
          </Form>
        </Card>

        {/* 底部说明 */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>修改后立即生效，历史订单不受影响</p>
          <p className="mt-1">如有疑问，请联系技术支持</p>
        </div>
      </div>
    </div>
  )
}