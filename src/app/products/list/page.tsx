import { useRef } from 'react'
import { Image, Tag, Button, Space, message, Modal } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ProTable, ProTableRef, SearchField } from '@/components'
import { getProductListApi, deleteProductApi, Product } from '@/api/product'

export default function Products() {
  const navigate = useNavigate()
  const tableRef = useRef<ProTableRef>(null)

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
  const statusMap: any = {
    draft: { color: 'default', text: '草稿' },
    on_sale: { color: 'green', text: '上架' },
    off_sale: { color: 'orange', text: '下架' },
  }

  // 删除
  const handleDelete = (record: Product) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除商品：${record.name}？`,
      onOk: async () => {
        await deleteProductApi(record.id!)
        message.success('删除成功')
        tableRef.current?.handleRefresh()
      },
    })
  }

  const columns = [
    {
      title: '封面',
      dataIndex: 'coverImage',
      width: 80,
      render: (imgs: string[]) => (
        <Image width={50} height={50} src={imgs[0]} className="rounded" />
      ),
    },
    { title: '商品名称', dataIndex: 'name', width: 200 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: string) => <Tag color={statusMap[s].color}>{statusMap[s].text}</Tag>,
    },
    { title: '规格数', key: 'specs', render: (_: unknown, r: Product) => r.specs?.length || 0 },
    { title: '创建时间', dataIndex: 'createdAt', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_: unknown, record: Product) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/products/${record.id}`)}>
            详情
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => navigate(`/products/edit/${record.id}`)}>
            编辑
          </Button>
          <Button danger size="small" onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ]

  return (
    <ProTable<Product>
      ref={tableRef}
      title="商品管理"
      columns={columns}
      request={getProductListApi}
      rowKey="id"
      searchFields={searchFields}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/create')}>
          新增商品
        </Button>
      }
    />
  )
}