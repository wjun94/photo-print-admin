import { useState } from 'react'
import {
  Form, Input, Select, Button, InputNumber,
  Card, List, message, Modal, Empty, Popconfirm
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useRequest } from 'ahooks'
import { UploadImage, Image, RichTextEditor } from '@/components'
import {
  createProductApi, getProductDetailApi,
  updateProductApi, Product, ProductSpec
} from '@/api/product'

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [specForm] = Form.useForm()
  const [specs, setSpecs] = useState<ProductSpec[]>([])

  const [specVisible, setSpecVisible] = useState(false)
  const [editSpecIndex, setEditSpecIndex] = useState<number | null>(null)

  const isEdit = !!id

  // 加载商品详情
  const { loading: detailLoading } = useRequest(
    () => getProductDetailApi(id!),
    {
      ready: isEdit,
      refreshDeps: [id],
      onSuccess: (res) => {
        const data: any = res.data
        form.setFieldsValue(data)
        setSpecs(data.specs || [])
      },
      onError: () => {
        message.error('加载商品详情失败')
      }
    }
  )

  // 提交商品
  const { run: submitProduct, loading: submitLoading } = useRequest(
    async (values: any) => {
      const data: Product = {
        ...values,
        specs,
      }

      if (isEdit) {
        await updateProductApi(id!, data)
      } else {
        await createProductApi(data)
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('商品保存成功')
        navigate('/products')
      },
      onError: () => {
        message.error('保存失败，请检查输入')
      }
    }
  )

  // 打开新增规格
  const openAddSpec = () => {
    specForm.resetFields()
    setEditSpecIndex(null)
    setSpecVisible(true)
  }

  // 打开编辑规格
  const openEditSpec = (index: number) => {
    const item = specs[index]
    specForm.setFieldsValue(item)
    setEditSpecIndex(index)
    setSpecVisible(true)
  }

  // 保存规格
  const handleSaveSpec = () => {
    specForm.validateFields().then(values => {
      if (editSpecIndex !== null) {
        const newSpecs = [...specs]
        newSpecs[editSpecIndex] = values
        setSpecs(newSpecs)
      } else {
        setSpecs([...specs, values])
      }
      setSpecVisible(false)
      message.success('规格保存成功')
    })
  }

  // 删除规格
  const handleDeleteSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index))
    message.success('规格删除成功')
  }

  // 提交表单
  const onSubmit = (values: any) => {
    if (specs.length === 0) {
      message.error("请至少添加一个商品规格")
      return
    }
    submitProduct(values)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">
            {isEdit ? '编辑商品' : '新增商品'}
          </h2>

          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={{ status: 'draft', sortOrder: 0 }}
            className="space-y-6"
            disabled={detailLoading}
          >
            {/* 商品名称 */}
            <Form.Item
              label="商品名称"
              name="name"
              rules={[{ required: true, message: '请输入商品名称' }]}
              labelCol={{ className: 'font-medium text-gray-700' }}
            >
              <Input
                placeholder="请输入商品名称，最多50个字符"
                maxLength={50}
                showCount
                className="rounded-md"
              />
            </Form.Item>

            {/* 封面图 */}
            <Form.Item
              label="商品封面"
              name="coverImage"
              labelCol={{ className: 'font-medium text-gray-700' }}
              extra="建议尺寸：800×800px，支持JPG、PNG格式"
            >
              <UploadImage type="single" maxCount={1} />
            </Form.Item>

            {/* 轮播图 */}
            <Form.Item
              label="商品轮播图"
              name="bannerImages"
              labelCol={{ className: 'font-medium text-gray-700' }}
              extra="最多上传9张，建议尺寸：750×400px"
            >
              <UploadImage type="batch" maxCount={9} />
            </Form.Item>

            {/* 商品描述 */}
            <Form.Item
              label="商品描述"
              name="description"
              labelCol={{ className: 'font-medium text-gray-700' }}
            >
              <Input.TextArea
                rows={3}
                placeholder="请输入商品简短描述，用于列表页展示"
                maxLength={200}
                showCount
                className="rounded-md resize-none"
              />
            </Form.Item>

            {/* ✅ 商品详情（富文本编辑器） */}
            <Form.Item
              label="商品详情"
              name="detail"
              labelCol={{ className: 'font-medium text-gray-700' }}
            >
              <RichTextEditor
                placeholder="请输入商品详细介绍，支持图文混排"
                height={450}
              />
            </Form.Item>

            {/* 状态和排序 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label="商品状态"
                name="status"
                labelCol={{ className: 'font-medium text-gray-700' }}
              >
                <Select
                  placeholder="请选择商品状态"
                  options={[
                    { value: 'draft', label: '草稿' },
                    { value: 'on_sale', label: '上架' },
                    { value: 'off_sale', label: '下架' },
                  ]}
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                label="排序号"
                name="sortOrder"
                labelCol={{ className: 'font-medium text-gray-700' }}
                extra="数字越小，排序越靠前"
              >
                <InputNumber
                  min={0}
                  placeholder="请输入排序号"
                  style={{ width: '100%' }}
                  className="rounded-md"
                />
              </Form.Item>
            </div>

            {/* 规格列表 */}
            <Card
              className="mb-6 border-gray-200 overflow-hidden"
              title="商品规格"
              extra={
                <Button
                  icon={<PlusOutlined />}
                  onClick={openAddSpec}
                  size="middle"
                >
                  新增规格
                </Button>
              }
            >
              {specs.length > 0 ? (
                <List
                  dataSource={specs}
                  renderItem={(item, index) => (
                    <List.Item
                      className="border-b border-gray-100 last:border-0 py-3"
                      actions={[
                        <Button
                          key="edit"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => openEditSpec(index)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          编辑
                        </Button>,
                        <Popconfirm
                          key="delete"
                          title="确认删除该规格？"
                          description="删除后无法恢复"
                          okText="确认删除"
                          cancelText="取消"
                          okType="danger"
                          onConfirm={() => handleDeleteSpec(index)}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      ]}
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="!w-16 !h-16 rounded-lg object-cover border border-gray-200"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="mr-4">价格：¥{item.price}</span>
                            <span className="mr-4">库存：{item.stock}</span>
                            <span>SKU：{item.skuCode || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description="暂无规格，点击右上角按钮添加"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="py-12"
                />
              )}
            </Card>

            {/* 底部按钮 */}
            <div className="flex justify-center gap-6 pt-6">
              <Button
                size="large"
                onClick={() => navigate('/products')}
                className="!px-16"
                disabled={detailLoading || submitLoading}
              >
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                size="large"
                className="!px-16"
                disabled={detailLoading}
              >
                保存
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* 规格弹窗 */}
      <Modal
        title={editSpecIndex !== null ? "编辑规格" : "新增规格"}
        open={specVisible}
        onCancel={() => setSpecVisible(false)}
        onOk={handleSaveSpec}
        width={520}
        destroyOnHidden
        mask={{ closable: false }}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={specForm}
          layout="vertical"
          className="mt-4 space-y-4"
        >
          <Form.Item
            label="规格图片"
            name="image"
            labelCol={{ className: 'font-medium text-gray-700' }}
          >
            <UploadImage type="single" maxCount={1} />
          </Form.Item>

          <Form.Item
            label="规格名称"
            name="name"
            rules={[{ required: true, message: '请输入规格名称' }]}
            labelCol={{ className: 'font-medium text-gray-700' }}
          >
            <Input placeholder="例如：500ml、原味、XL码" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="价格(元)"
              name="price"
              rules={[{ required: true, message: '请输入价格' }]}
              labelCol={{ className: 'font-medium text-gray-700' }}
            >
              <InputNumber
                min={0}
                step={0.01}
                placeholder="0.00"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="库存数量"
              name="stock"
              rules={[{ required: true, message: '请输入库存' }]}
              labelCol={{ className: 'font-medium text-gray-700' }}
            >
              <InputNumber
                min={0}
                placeholder="0"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="SKU编码"
            name="skuCode"
            labelCol={{ className: 'font-medium text-gray-700' }}
          >
            <Input placeholder="商品唯一编码，用于库存管理" />
          </Form.Item>

          <Form.Item
            label="排序号"
            name="sortOrder"
            labelCol={{ className: 'font-medium text-gray-700' }}
            extra="数字越小，排序越靠前"
          >
            <InputNumber
              min={0}
              placeholder="0"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}