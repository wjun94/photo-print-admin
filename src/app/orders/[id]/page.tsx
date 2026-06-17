import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Card, Tag, Button, Space, App, Modal,
  Form, Input, Select, Divider, Typography,
} from 'antd'
import {
  ArrowLeftOutlined, DeliveredProcedureOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  CameraOutlined
} from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Image } from '@/components'
import {
  getOrderDetail, orderShip, orderComplete, couriers,
  OrderItem, SpecSummary, Logistics
} from '@/api'

const { Text, Title } = Typography

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  // 使用 Antd 的 App 上下文处理全局提示
  const { message } = App.useApp()

  // 发货弹窗控制
  const [deliveryVisible, setDeliveryVisible] = useState(false)

  // 订单状态颜色与文本映射
  const statusMap: Record<string, { text: string; color: string }> = {
    pending: { text: '待付款', color: 'orange' },
    paid: { text: '已付款', color: 'green' },
    shipped: { text: '已发货', color: 'blue' },
    completed: { text: '已完成', color: 'gray' },
    cancelled: { text: '已取消', color: 'red' },
    refunding: { text: '退款中', color: 'purple' },
    refunded: { text: '已退款', color: 'red' }
  }

  // 获取订单详情
  const { data, loading, refresh } = useRequest(
    () => getOrderDetail(id!),
    {
      ready: !!id,
      refreshDeps: [id],
      onError: () => {
        message.error('加载订单详情失败')
      }
    }
  )

  const order = data?.data

  // 动态获取快递公司列表
  const { data: courierData, loading: courierLoading } = useRequest(couriers)
  const courierList = courierData?.data || []

  // 发货接口
  const { run: submitShip, loading: shipLoading } = useRequest(
    (params: {
      orderId: string
      courierCode: string
      trackingNo: string
      courierName: string
      remark?: string
    }) => orderShip(params),
    {
      manual: true,
      onSuccess: () => {
        message.success('发货成功')
        setDeliveryVisible(false)
        form.resetFields()
        refresh() // 局部刷新，不刷新整个页面
      },
      onError: () => {
        message.error('发货失败，请稍后重试')
      }
    }
  )

  // 完成订单接口
  const { run: submitComplete, loading: completeLoading } = useRequest(
    (orderId: string) => orderComplete({ orderId }),
    {
      manual: true,
      onSuccess: () => {
        message.success('订单已完成')
        refresh()
      },
      onError: () => {
        message.error('操作失败，请稍后重试')
      }
    }
  )

  // 提交发货验证
  const handleDelivery = () => {
    form.validateFields().then(values => {
      const selectedCourier = courierList.find(item => item.code === values.courierCode)

      submitShip({
        orderId: id!,
        courierCode: values.courierCode,
        trackingNo: values.trackingNo,
        courierName: selectedCourier?.name || '',
        remark: values.remark
      })
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Text type="secondary">加载中...</Text>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Text type="secondary">订单不存在</Text>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* 使用全局垂直 Space 隔离区块间距 */}
        <Space vertical size="large" className="w-full">

          {/* 顶部导航与标题栏 */}
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/orders')}
              className="mb-3"
            >
              返回订单列表
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <Title level={3} style={{ margin: 0 }}>订单详情</Title>
              <Tag color={statusMap[order.status]?.color || 'default'} className="px-2.5 py-0.5 text-sm font-medium">
                {statusMap[order.status]?.text || '未知状态'}
              </Tag>
            </div>
          </div>

          {/* 订单基本信息 */}
          <Card className="shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-8">
              <div>
                <div className="text-xs text-gray-400 mb-1">订单编号</div>
                <Text copyable={{ text: order.orderNo }} className="font-medium text-gray-800">
                  {order.orderNo}
                </Text>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">用户ID</div>
                <Text className="font-medium text-gray-800">{order.userId}</Text>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">创建时间</div>
                <Text className="text-gray-600">{order.createdAt}</Text>
              </div>
              {order.payAt && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">支付时间</div>
                  <Text className="text-gray-600">{order.payAt}</Text>
                </div>
              )}
              {order.shippedAt && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">发货时间</div>
                  <Text className="text-gray-600">{order.shippedAt}</Text>
                </div>
              )}
              {order.finishAt && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">完成时间</div>
                  <Text className="text-gray-600">{order.finishAt}</Text>
                </div>
              )}
              {order.cancelAt && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">取消时间</div>
                  <Text className="text-gray-600">{order.cancelAt}</Text>
                </div>
              )}
              {order.remark && (
                <div className="sm:col-span-2 md:col-span-3 bg-amber-50/60 p-3 rounded-lg border border-amber-100/70">
                  <div className="text-xs text-amber-700 font-medium mb-1">买家备注</div>
                  <Text className="text-amber-900 break-all">{order.remark}</Text>
                </div>
              )}
            </div>
          </Card>

          {/* 物流信息 */}
          {order.logistics && order.logistics.length > 0 && (
            <Card title={<span className="text-base font-semibold">物流信息</span>} className="shadow-sm">
              <Space vertical size="middle" className="w-full">
                {order.logistics.map((logistic: Logistics) => (
                  <div key={logistic.id} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                      <div className="font-semibold text-gray-800">
                        {logistic.courierName}{' '}
                        <span className="text-xs text-gray-400 font-normal">({logistic.courierCode})</span>
                      </div>
                      <Text copyable={{ text: logistic.trackingNo }} className="text-blue-600 font-medium">
                        {logistic.trackingNo}
                      </Text>
                    </div>
                    {logistic.remark && (
                      <div className="text-xs text-gray-500 mt-1.5 bg-white p-2 rounded border border-gray-100">
                        <span className="font-medium text-gray-400">发货备注：</span>{logistic.remark}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      发货时间：{logistic.createdAt}
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          )}

          {/* 收货地址 */}
          <Card title={<span className="text-base font-semibold">收货地址</span>} className="shadow-sm">
            <div className="text-sm">
              <div className="font-semibold text-gray-800 mb-1.5 text-base">
                {order.address.receiverName} <span className="ml-2 text-gray-600 font-normal">{order.address.mobile}</span>
              </div>
              <div className="text-gray-500 leading-relaxed">
                {order.address.provinceName}{order.address.cityName}
                {order.address.districtName}{order.address.detail}{order.address.doorplate}
              </div>
            </div>
          </Card>

          {/* 用户上传照片（核心功能） */}
          {order.items?.length ? <Card
            title={
              <span className="text-base font-semibold text-gray-900 flex items-center gap-1.5">
                <CameraOutlined className="text-blue-500" />
                用户上传照片（共 {order.items?.length || 0} 张）
              </span>
            }
            className="shadow-sm rounded-xl overflow-hidden border border-gray-100"
          >
            {order.items?.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {order.items.map((item: OrderItem) => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl overflow-hidden border border-gray-100 hover:border-blue-300/50 transition-all duration-200 bg-white"
                  >
                    {/* 优化图片铺满效果 */}
                    <div className="relative aspect-square w-full">
                      <Image
                        src={item.imageUrl}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        preview
                        alt={`商品 ${item.spec}`}
                        loading="lazy"
                      />
                      {/* 新增悬停效果 */}
                      {/* <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" /> */}
                    </div>

                    {/* 优化规格信息 */}
                    <div className="px-2.5 py-2 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-600 font-medium text-center line-clamp-2 min-h-[1.5rem] flex items-center justify-center transition-colors group-hover:bg-blue-50/80">
                      {item.spec} × {item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="flex flex-col items-center gap-2">
                  <InboxOutlined className="text-2xl" />
                  <span>该订单没有上传照片</span>
                </div>
              </div>
            )}
          </Card> : null}

          {/* 商品规格汇总 */}
          <Card title={<span className="text-base font-semibold">商品规格汇总</span>} className="shadow-sm">
            <div className="divide-y divide-gray-100">
              {order.specs?.map((spec: SpecSummary) => (
                <div key={spec.specId} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <Image
                    src={spec.imageUrl}
                    style={{ height: '100px', width: '100px' }}
                    className="rounded-xl object-cover border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm truncate">{spec.productName}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      规格：<span className="text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded font-medium">{spec.specName}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-0 border-dashed border-gray-100">
                    <div className="text-xs text-gray-400">
                      ¥{spec.price.toFixed(2)} × {spec.totalQuantity}
                    </div>
                    <div className="font-bold text-gray-900 mt-0.5 text-base">
                      ¥{spec.totalSubtotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 金额明细 */}
          <Card
            title={<span className="text-base font-semibold text-gray-900">金额明细</span>}
            className="shadow-sm rounded-xl overflow-hidden border border-gray-100"
          >
            <div className="px-4 py-3 space-y-2.5 text-sm">
              {/* 商品总额 */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">商品总额</span>
                <span className="font-medium tabular-nums text-gray-800">¥{order.amount.toFixed(2)}</span>
              </div>

              {/* 优惠金额 */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">优惠金额</span>
                <span className="font-medium tabular-nums text-gray-800">¥{order.discountAmount.toFixed(2)}</span>
              </div>

              {/* 运费 */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">运费</span>
                <span className="font-medium tabular-nums text-gray-800">¥{order.freight.toFixed(2)}</span>
              </div>

              <Divider className="my-2.5 border-gray-200" />

              {/* 实付金额 - 视觉焦点 */}
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-gray-700">实付金额</span>
                <span className="text-xl font-bold tabular-nums text-rose-600">
                  ¥{order.actualAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* 底部操作按钮 */}
          <div className="flex justify-center pt-4 pb-8">
            {order.status === 'paid' && (
              <Button
                type="primary"
                size="large"
                icon={<DeliveredProcedureOutlined />}
                onClick={() => setDeliveryVisible(true)}
                className="h-12 px-8 text-base font-medium rounded-lg"
              >
                去发货
              </Button>
            )}
            {order.status === 'shipped' && (
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={() => submitComplete(order.id)}
                loading={completeLoading}
                className="h-12 px-8 text-base font-medium rounded-lg bg-green-600 hover:bg-green-500 border-none"
              >
                完成订单
              </Button>
            )}
          </div>

        </Space>
      </div>

      {/* 发货弹窗 */}
      <Modal
        title="订单发货"
        open={deliveryVisible}
        onCancel={() => setDeliveryVisible(false)}
        onOk={handleDelivery}
        width={520}
        okText="确认发货"
        cancelText="取消"
        confirmLoading={shipLoading}
        maskClosable={false}
        destroyOnClose
      >
        <div className="text-sm text-gray-500 mb-4">
          订单号：<span className="font-medium text-gray-800">{order.orderNo}</span>
        </div>
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              label={<span className="text-xs font-medium text-gray-600">快递公司</span>}
              name="courierCode"
              rules={[{ required: true, message: '请选择快递公司' }]}
            >
              <Select
                placeholder="请选择快递公司"
                loading={courierLoading}
                options={courierList.map(item => ({
                  value: item.code,
                  label: item.name
                }))}
                showSearch
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-medium text-gray-600">快递单号</span>}
              name="trackingNo"
              rules={[
                { required: true, message: '请输入快递单号' },
                { pattern: /^[a-zA-Z0-9]+$/, message: '快递单号格式不正确' }
              ]}
            >
              <Input placeholder="请输入快递单号" allowClear />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="text-xs font-medium text-gray-600">发货备注</span>}
            name="remark"
          >
            <Input.TextArea rows={3} placeholder="选填，填写发货备注信息" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}