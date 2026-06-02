import { useRef } from 'react'
import { Tag, Button, Space, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ProTable, ProTableRef, SearchField, Image } from '@/components'
import { getProductListApi, deleteProductApi, Product } from '@/api/product'

export default function Products() {
  const navigate = useNavigate()
  const tableRef = useRef<ProTableRef>(null)

  // 复制商品编号
  const copyProductId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id.toString())
      message.success('商品编号已复制')
    } catch {
      message.error('复制失败，请手动复制')
    }
  }

  // 搜索
  const searchFields: SearchField[] = [
    { name: 'name', label: '商品名称', type: 'input' },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      options: [
        { value: 'draft', label: '草稿' },
        { value: 'on_sale', label: '上架' },
        { value: 'off_sale', label: '下架' },
      ],
    },
  ]

  // 状态样式
  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    on_sale: { color: 'success', text: '上架' },
    off_sale: { color: 'warning', text: '下架' },
  }

  // 删除
  const handleDelete = async (record: Product) => {
    try {
      await deleteProductApi(record.id!)
      message.success('商品删除成功')
      tableRef.current?.handleRefresh()
    } catch {
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '商品信息',
      dataIndex: 'name',
      width: 320,
      render: (name: string, record: Product) => (
        <div className="flex items-center gap-3">
          {/* 自定义 Image 组件（自动拼接静态域名） */}
          <Image
            width={64}
            height={64}
            src={record.coverImage}
            className="rounded-lg object-cover border border-gray-200 flex-shrink-0"
            preview
          />

          {/* 商品名称+编号 */}
          <div className="flex flex-col gap-1 overflow-hidden">
            <div className="font-medium text-gray-800 truncate" title={name}>
              {name}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>编号：{record.id}</span>
              <CopyOutlined
                className="cursor-pointer hover:text-blue-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  copyProductId(record.id!)
                }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => (
        <Tag
          color={statusMap[status].color}
          className="rounded-full px-3 py-1 text-xs font-medium"
        >
          {statusMap[status].text}
        </Tag>
      ),
    },
    {
      title: '规格数',
      key: 'specs',
      width: 80,
      align: 'center',
      render: (_: unknown, r: Product) => (
        <span className="font-medium">{r.specs?.length || 0}</span>
      )
    },
    {
      title: '排序号',
      dataIndex: 'sort_order',
      width: 80,
      align: 'center'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      className: 'text-gray-500'
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      align: 'center',
      render: (_: unknown, record: Product) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/products/edit/${record.id}`)}
            className="text-green-500 hover:text-green-600"
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除商品"
            description={`确定要删除【${record.name}】吗？删除后无法恢复`}
            okText="确认删除"
            cancelText="取消"
            okType="danger"
            onConfirm={() => handleDelete(record)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="h-full">
      <ProTable<Product>
        ref={tableRef}
        title="商品管理"
        columns={columns}
        request={getProductListApi}
        rowKey="id"
        searchFields={searchFields}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/products/create')}
            size="middle"
          >
            新增商品
          </Button>
        }
      />
    </div>
  )
}