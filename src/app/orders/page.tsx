// src/app/orders/page.tsx
import { useRef } from 'react'
import { Tag, Button, Space, message } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import ProTable, { ProTableRef } from '@/core/components/ProTable'
import { getOrderListApi, Order } from '@/api/order'

export default function Orders() {
    // 订单状态映射
    const statusMap: Record<string, { text: string; color: string }> = {
        pending: { text: '待付款', color: 'orange' },
        paid: { text: '已付款', color: 'green' },
        shipped: { text: '已发货', color: 'blue' },
        completed: { text: '已完成', color: 'gray' },
        cancelled: { text: '已取消', color: 'red' }
    }

    // ✅ 搜索字段配置（只需要写这个，表单自动生成）
    const searchFields = [
        {
            name: 'orderNo',
            label: '订单号',
            type: 'input',
            placeholder: '请输入订单号'
        },
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
        {
            name: 'createdAt',
            label: '创建时间',
            type: 'dateRange'
        }
    ]

    // 表格列定义
    const columns = [
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
            render: (_: unknown, record: Order) => record.items.length
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 100,
            render: (_: unknown, record: Order) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => message.info(`查看订单：${record.orderNo}`)}
                    >
                        详情
                    </Button>
                </Space>
            )
        }
    ]

    const tableRef = useRef<ProTableRef>(null)

    return (
        <ProTable<Order>
            ref={tableRef}
            columns={columns}
            request={getOrderListApi}
            rowKey="id"
            title="订单列表"
            scroll={{ x: 1200 }}
            searchFields={searchFields} // ✅ 传入搜索配置
        />
    )
}