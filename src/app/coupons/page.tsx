import { useState } from 'react'
import {
  Card, Table, Button, Space, Tag, message,
  Input, Select, DatePicker, Typography, Popconfirm
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  getCouponListApi, deleteCouponApi, updateCouponApi,
  Coupon, CouponType, PublishStatus,
  couponTypeMap, publishStatusMap
} from '@/api/coupon'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export default function CouponList() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchParams, setSearchParams] = useState({
    name: '',
    type: undefined as CouponType | undefined,
    publishStatus: undefined as PublishStatus | undefined
  })

  // 获取优惠券列表
  const { data, loading, refresh } = useRequest(
    () => getCouponListApi({
      page: currentPage,
      pageSize,
      ...searchParams
    }),
    {
      refreshDeps: [currentPage, searchParams],
      onError: () => {
        message.error('加载优惠券列表失败')
      }
    }
  )

  // 删除优惠券
  const { run: deleteCoupon, loading: deleteLoading } = useRequest(
    (id: string) => deleteCouponApi(id),
    {
      manual: true,
      onSuccess: () => {
        message.success('删除成功')
        refresh()
      },
      onError: () => {
        message.error('删除失败')
      }
    }
  )

  // 上下架操作
  const { run: updateStatus, loading: statusLoading } = useRequest(
    ({ id, status }: { id: string; status: PublishStatus }) =>
      updateCouponApi(id, { publishStatus: status }),
    {
      manual: true,
      onSuccess: () => {
        message.success('状态更新成功')
        refresh()
      },
      onError: () => {
        message.error('状态更新失败')
      }
    }
  )

  // 表格列配置
  const columns = [
    {
      title: '优惠券名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: CouponType) => (
        <Tag color={couponTypeMap[type].color}>
          {couponTypeMap[type].text}
        </Tag>
      )
    },
    {
      title: '面值',
      key: 'value',
      width: 150,
      render: (_: any, record: Coupon) => {
        if (record.type === CouponType.FULL_REDUCE) {
          return `满${record.fullAmount}减${record.reduceAmount}`
        } else if (record.type === CouponType.NO_THRESHOLD) {
          return `减${record.reduceAmount}元`
        } else {
          return `${(record.discountRate * 10).toFixed(1)}折 最高减${record.maxReduce}元`
        }
      }
    },
    {
      title: '库存/已领',
      key: 'stock',
      width: 120,
      render: (_: any, record: Coupon) => (
        <Text>{record.totalStock} / {record.receivedNum}</Text>
      )
    },
    {
      title: '领券时间',
      key: 'receiveTime',
      width: 250,
      render: (_: any, record: Coupon) => (
        <Text type="secondary" className="text-xs">
          {dayjs(record.receiveStart).format('YYYY-MM-DD HH:mm')}
          <br />
          至 {dayjs(record.receiveEnd).format('YYYY-MM-DD HH:mm')}
        </Text>
      )
    },
    {
      title: '状态',
      dataIndex: 'publishStatus',
      key: 'publishStatus',
      width: 100,
      render: (status: PublishStatus) => (
        <Tag color={publishStatusMap[status].color}>
          {publishStatusMap[status].text}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: Coupon) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/coupons/edit/${record.id}`)}
          >
            编辑
          </Button>

          {record.publishStatus === PublishStatus.UNPUBLISHED && (
            <Button
              type="text"
              className="text-green-600"
              size="small"
              loading={statusLoading}
              onClick={() => updateStatus({ id: record.id, status: PublishStatus.PUBLISHED })}
            >
              发布
            </Button>
          )}

          {record.publishStatus === PublishStatus.PUBLISHED && (
            <Button
              type="text"
              className="text-orange-600"
              size="small"
              loading={statusLoading}
              onClick={() => updateStatus({ id: record.id, status: PublishStatus.OFFLINE })}
            >
              下架
            </Button>
          )}

          <Popconfirm
            title="确认删除"
            description="删除后将无法恢复，确定要删除这个优惠券吗？"
            onConfirm={() => deleteCoupon(record.id)}
            okText="确认"
            cancelText="取消"
            okButtonProps={{ danger: true, loading: deleteLoading }}
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 搜索重置
  const handleReset = () => {
    setSearchParams({
      name: '',
      type: undefined,
      publishStatus: undefined
    })
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <Title level={3} style={{ margin: 0 }}>优惠券管理</Title>
        <Text type="secondary" className="mt-1 block">
          管理平台所有优惠券，支持创建、编辑、发布和下架
        </Text>
      </div>

      {/* 搜索筛选区域 */}
      <Card className="mb-6 shadow-sm" bordered={false}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="优惠券名称"
              value={searchParams.name}
              onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
              onPressEnter={() => setCurrentPage(1)}
            />
          </div>
          <div>
            <Select
              placeholder="优惠券类型"
              value={searchParams.type}
              onChange={(value) => setSearchParams({ ...searchParams, type: value })}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: CouponType.FULL_REDUCE, label: '满减券' },
                { value: CouponType.NO_THRESHOLD, label: '无门槛券' },
                { value: CouponType.DISCOUNT, label: '折扣券' }
              ]}
            />
          </div>
          <div>
            <Select
              placeholder="发布状态"
              value={searchParams.publishStatus}
              onChange={(value) => setSearchParams({ ...searchParams, publishStatus: value })}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: PublishStatus.UNPUBLISHED, label: '未发布' },
                { value: PublishStatus.PUBLISHED, label: '已发布' },
                { value: PublishStatus.OFFLINE, label: '已下架' }
              ]}
            />
          </div>
          <div className="flex gap-2">
            <Button type="primary" onClick={() => setCurrentPage(1)}>
              搜索
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </div>
        </div>
      </Card>

      {/* 列表区域 */}
      <Card className="shadow-sm" bordered={false}>
        <div className="flex justify-between items-center mb-4">
          <Text type="secondary">
            共 {data?.data?.total || 0} 条记录
          </Text>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/coupons/create')}
          >
            新建优惠券
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data?.data?.list || []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.data?.total || 0,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            showQuickJumper: true
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  )
}