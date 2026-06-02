import { useRef, useState } from 'react'
import {
    Typography,
    Tag,
    Button,
    Space,
    message,
    Modal,
    Form,
    Input,
    Row,
    Col,
    Select,
    Divider
} from 'antd'
import {
    EyeOutlined, DeliveredProcedureOutlined, CheckCircleOutlined,
    TruckOutlined
} from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { ProTable, ProTableRef, Image } from '@/components'
import { useNavigate } from 'react-router-dom'
import { getOrderListApi, Order, orderShip, orderComplete, couriers } from '@/api'

const { Text } = Typography

export default function Orders() {
    const [form] = Form.useForm()
    const tableRef = useRef<ProTableRef>(null)
    const navigate = useNavigate()

    // 发货弹窗
    const [deliveryVisible, setDeliveryVisible] = useState(false)
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null)

    // ✅ 物流弹窗
    const [logisticsVisible, setLogisticsVisible] = useState(false)

    // 订单状态映射
    const statusMap: Record<string, { text: string; color: string }> = {
        pending: { text: '待付款', color: 'orange' },
        paid: { text: '已付款', color: 'green' },
        shipped: { text: '已发货', color: 'blue' },
        completed: { text: '已完成', color: 'gray' },
        cancelled: { text: '已取消', color: 'red' }
    }

    // 获取订单所有已产生的时间
    const getStatusTimes = (record: Order) => {
        const times: { label: string; value: string }[] = []

        times.push({ label: '创建', value: record.createdAt })
        if (record.payAt) times.push({ label: '支付', value: record.payAt })
        if (record.shippedAt) times.push({ label: '发货', value: record.shippedAt })
        if (record.finishAt) times.push({ label: '完成', value: record.finishAt })
        if (record.cancelAt) times.push({ label: '取消', value: record.cancelAt })

        return times
    }

    // 动态获取快递公司列表
    const { data, loading: courierLoading } = useRequest(couriers)
    const courierList = data?.data || []

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
                tableRef.current?.handleRefresh()
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
                tableRef.current?.handleRefresh()
            },
            onError: () => {
                message.error('操作失败，请稍后重试')
            }
        }
    )

    // 搜索字段
    const searchFields = [
        { name: 'orderNo', label: '订单号', type: 'input', placeholder: '请输入订单号' },
        {
            name: 'status',
            label: '订单状态',
            type: 'select',
            options: [
                { value: 'pending', label: '待付款' },
                { value: 'paid', label: '已付款' },
                { value: 'shipped', label: '已发货' },
                { value: 'completed', label: '已完成' },
                { value: 'cancelled', label: '已取消' }
            ]
        },
        { name: 'createdAt', label: '创建时间', type: 'dateRange' }
    ]

    // 打开发货弹窗
    const openDelivery = (record: Order) => {
        setCurrentOrder(record)
        form.resetFields()
        setDeliveryVisible(true)
    }

    // ✅ 查看物流信息
    const openLogistics = (record: Order) => {
        setCurrentOrder(record)
        setLogisticsVisible(true)
    }

    // 提交发货
    const handleDelivery = () => {
        form.validateFields().then(values => {
            const selectedCourier = courierList.find(item => item.code === values.courierCode)

            submitShip({
                orderId: currentOrder!.id,
                courierCode: values.courierCode,
                trackingNo: values.trackingNo,
                courierName: selectedCourier?.name || '',
                remark: values.remark
            })
        })
    }

    // 表格列
    const columns = [
        // 订单信息（多时间并行展示）
        {
            title: '订单信息',
            key: 'orderInfo',
            width: 260,
            fixed: 'left',
            render: (_: unknown, record: Order) => {
                const times = getStatusTimes(record)
                return (
                    <div className="space-y-1">
                        <Text
                            copyable={{
                                text: record.orderNo,
                                tooltips: ['复制订单号', '已复制！'],
                            }}
                            className="text-xs font-medium text-gray-800"
                        >
                            {record.orderNo}
                        </Text>
                        <div className="space-y-0.5">
                            {times.map((time, index) => (
                                <div key={index} className="text-xs text-gray-500">
                                    {time.label}：{time.value}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        },

        // 商品信息
        {
            title: '商品信息',
            key: 'goods',
            width: 280,
            render: (_: unknown, record: Order) => {
                const spec = record.specs?.[0]
                if (!spec) return <span>-</span>

                return (
                    <div className="flex items-center gap-2">
                        <Image
                            src={spec.imageUrl}
                            style={{ height: '60px', width: '60px', borderRadius: "6px" }}
                            className="object-cover"
                            fallback="https://picsum.photos/200/200?text=无图"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs truncate">{spec.productName}</div>
                            <div className="text-xs text-gray-500">
                                {spec.specName} × {spec.totalQuantity}
                            </div>
                        </div>
                    </div>
                )
            }
        },

        // 收货地址
        {
            title: '收货地址',
            key: 'address',
            width: 240,
            render: (_: unknown, record: Order) => {
                const addr = record.address
                if (!addr) return '-'
                return (
                    <div className="text-xs text-gray-600 leading-relaxed">
                        <div>{addr.receiverName} {addr.mobile}</div>
                        <div className="truncate">
                            {addr.provinceName}{addr.cityName}{addr.districtName}
                        </div>
                        <div className="truncate">{addr.detail}{addr.doorplate}</div>
                    </div>
                )
            }
        },

        // 金额信息
        {
            title: '金额信息',
            key: 'amount',
            width: 160,
            render: (_: unknown, record: Order) => (
                <div>
                    <div className={`text-xs font-medium ${record.payAt ? 'text-red-600' : 'text-gray-500'}`}>
                        {record.payAt ? '实付' : '待付'} ¥{record.actualAmount?.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                        商品 ¥{record.amount?.toFixed(2)}
                        <br />
                        运费 ¥{record.freight?.toFixed(2)}
                    </div>
                </div>
            )
        },

        // 订单状态
        {
            title: '状态',
            dataIndex: 'status',
            width: 110,
            render: (status: string) => {
                const info = statusMap[status] || { text: status, color: 'default' }
                return <Tag color={info.color}>{info.text}</Tag>
            }
        },

        // 操作
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 180,
            render: (_: unknown, record: Order) => (
                <Space vertical size={2} className="w - full">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        className="text-blue-600 h-auto py-1"
                        onClick={async () => {
                            navigate(`/orders/${record.id}`)
                        }}
                    >
                        查看详情
                    </Button >

                    {/* 已付款 → 显示去发货按钮 */}
                    {
                        record.status === 'paid' && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<DeliveredProcedureOutlined />}
                                onClick={() => openDelivery(record)}
                                className="h-auto py-1"
                            >
                                去发货
                            </Button>
                        )
                    }

                    {/* 已发货/已完成 → 显示查看物流按钮 */}
                    {
                        (record.status === 'shipped' || record.status === 'completed') && (record as any)?.logistics?.length > 0 && (
                            <Button
                                type="text"
                                icon={<TruckOutlined />}
                                className="text-green-600 h-auto py-1"
                                onClick={() => openLogistics(record)}
                            >
                                查看物流
                            </Button>
                        )
                    }

                    {/* 已发货 → 显示完成订单按钮 */}
                    {
                        record.status === 'shipped' && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => submitComplete(record.id)}
                                loading={completeLoading}
                                className="h-auto py-1 bg-green-600 hover:bg-green-700"
                            >
                                完成订单
                            </Button>
                        )
                    }
                </Space >
            )
        }
    ]

    return (
        <div className="h-full">
            <ProTable<Order>
                ref={tableRef}
                title="订单管理"
                columns={columns}
                request={getOrderListApi}
                rowKey="id"
                searchFields={searchFields}
                scroll={{ x: 1300 }}
                className="bg-white rounded-lg shadow-sm"
                rowClassName="hover:bg-gray-50"
            />

            {/* 发货弹窗 */}
            <Modal
                title={`订单发货 - ${currentOrder?.orderNo}`}
                open={deliveryVisible}
                onCancel={() => setDeliveryVisible(false)}
                onOk={handleDelivery}
                width={500}
                okText="确认发货"
                cancelText="取消"
                confirmLoading={shipLoading}
                maskClosable={false}
            >
                <Form form={form} layout="vertical" className="mt-2">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="快递公司"
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
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="快递单号"
                                name="trackingNo"
                                rules={[{ required: true, message: '请输入快递单号' }]}
                            >
                                <Input placeholder="请输入快递单号" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="备注" name="remark">
                        <Input.TextArea rows={3} placeholder="选填，填写发货备注信息" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ✅ 物流信息弹窗 */}
            <Modal
                title={`物流信息 - ${currentOrder?.orderNo}`}
                open={logisticsVisible}
                onCancel={() => setLogisticsVisible(false)}
                footer={null}
                width={500}
            >
                <div className="mt-4">
                    {currentOrder?.logistics?.map((logistic, index) => (
                        <div key={logistic.id}>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-medium text-gray-800">
                                        {logistic.courierName} ({logistic.courierCode})
                                    </div>
                                    <Text
                                        copyable={{
                                            text: logistic.trackingNo,
                                            tooltips: ['复制单号', '已复制！']
                                        }}
                                        className="text-blue-600 cursor-pointer"
                                    >
                                        快递单号：{logistic.trackingNo}
                                    </Text>
                                </div>
                                {logistic.remark && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        备注：{logistic.remark}
                                    </div>
                                )}
                                <div className="text-xs text-gray-400 mt-2">
                                    发货时间：{logistic.createdAt}
                                </div>
                            </div>
                            {index < (currentOrder?.logistics?.length || 0) - 1 && (
                                <Divider className="my-3" />
                            )}
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    )
}