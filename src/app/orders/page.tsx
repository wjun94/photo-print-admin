// src/app/orders/page.tsx
import { Table, Card, Tag, Button, Space, message } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { getOrderListApi, Order } from '@/api/order'
import type { ColumnsType } from 'antd/es/table'

export default function Orders() {
    console.log(111)
    // 获取订单列表
    const { data, loading, run } = useRequest(getOrderListApi, {
        onError: () => {
            message.error('获取订单列表失败')
        }
    })

    // 订单状态映射
    const statusMap: Record<string, { text: string; color: string }> = {
        pending: { text: '待付款', color: 'orange' },
        paid: { text: '已付款', color: 'green' },
        shipped: { text: '已发货', color: 'blue' },
        completed: { text: '已完成', color: 'gray' },
        cancelled: { text: '已取消', color: 'red' }
    }

    // 表格列定义
    const columns: ColumnsType<Order> = [
        {
            title: '订单号',
            dataIndex: 'orderNo',
            key: 'orderNo',
            width: 180,
            fixed: 'left'
        },
        {
            title: '订单金额',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => `¥${amount.toFixed(2)}`
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const info = statusMap[status] || { text: status, color: 'default' }
                return <Tag color={info.color}>{info.text}</Tag>
            }
        },
        {
            title: '收货地址',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true
        },
        {
            title: '商品数量',
            key: 'items',
            render: (_, record) => record.items.length
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 180
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 100,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                    >
                        详情
                    </Button>
                </Space>
            )
        }
    ]

    // 查看订单详情
    const handleViewDetail = (order: Order) => {
        message.info(`查看订单：${order.orderNo}`)
        // 这里可以打开订单详情弹窗
    }

    return (
        <Card title="订单管理">
            <div style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => run()}
                >
                    刷新
                </Button>
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={data?.data || []}
                loading={loading}
                scroll={{ x: 1200 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条订单`
                }}
            />
        </Card>
    )
}