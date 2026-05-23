import { useEffect, useState } from 'react'
import {
  Form, Input, Select, Button, Space, InputNumber,
  Card, List, message, Divider, Modal
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { UploadImage } from '@/components'
import {
  createProductApi, getProductDetailApi,
  updateProductApi, Product, ProductSpec
} from '@/api/product'

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [specForm] = Form.useForm() // 规格表单
  const [loading, setLoading] = useState(false)
  const [specs, setSpecs] = useState<ProductSpec[]>([])

  // 规格弹窗
  const [specVisible, setSpecVisible] = useState(false)
  const [editSpecIndex, setEditSpecIndex] = useState<number | null>(null)

  const isEdit = !!id

  // 加载详情
  useEffect(() => {
    if (isEdit) {
      getProductDetailApi(+id).then(res => {
        const data: any = res.data
        form.setFieldsValue(data)
        setSpecs(data.specs || [])
      })
    }
  }, [id, isEdit])

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
        // 编辑
        const newSpecs = [...specs]
        newSpecs[editSpecIndex] = values
        setSpecs(newSpecs)
      } else {
        // 新增
        setSpecs([...specs, values])
      }
      setSpecVisible(false)
    })
  }

  // 提交商品
  const onSubmit = async (values: any) => {
    try {
      setLoading(true)
      const data: Product = {
        ...values,
        specs,
      }

      if (isEdit) {
        await updateProductApi(+id, data)
      } else {
        await createProductApi(data)
      }

      message.success('保存成功')
      navigate('/products')
    } catch (e) {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-6">{isEdit ? '编辑商品' : '新增商品'}</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{ status: 'draft', sort_order: 0 }}
      >
        {/* 商品名称 */}
        <Form.Item label="商品名称" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        {/* 封面图：单张 */}
        <Form.Item label="商品封面" name="coverImage">
          <UploadImage type="single" maxCount={1} />
        </Form.Item>

        {/* 轮播图：多张 */}
        <Form.Item label="轮播图" name="bannerImages">
          <UploadImage type="batch" maxCount={9} />
        </Form.Item>

        {/* 描述 & 详情 */}
        <Form.Item label="商品描述" name="description">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="商品详情" name="detail">
          <Input.TextArea rows={4} />
        </Form.Item>

        {/* 状态 & 排序 */}
        <Form.Item label="状态" name="status">
          <Select options={[
            { value: 'draft', label: '草稿' },
            { value: 'on_sale', label: '上架' },
            { value: 'off_sale', label: '下架' },
          ]} />
        </Form.Item>

        <Form.Item label="排序" name="sort_order">
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Divider>商品规格</Divider>

        {/* 规格列表 + 新增按钮 */}
        <Card
          className="mb-4"
          extra={
            <Button icon={<PlusOutlined />} onClick={openAddSpec}>
              新增规格
            </Button>
          }
        >
          <List
            dataSource={specs}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditSpec(index)}
                  >
                    编辑
                  </Button>,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setSpecs(specs.filter((_, i) => i !== index))}
                  >
                    删除
                  </Button>
                ]}
              >
                <div className="flex items-center gap-3">
                  <img src={item.image} className="w-12 h-12 rounded object-cover" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">
                      ￥{item.price} | 库存：{item.stock} | SKU：{item.sku_code}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* 按钮 */}
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => navigate('/products')}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>保存商品</Button>
        </div>
      </Form>

      {/* 规格弹窗 */}
      <Modal
        title={editSpecIndex !== null ? "编辑规格" : "新增规格"}
        open={specVisible}
        onCancel={() => setSpecVisible(false)}
        onOk={handleSaveSpec}
        width={500}
        destroyOnClose
      >
        <Form
          form={specForm}
          layout="vertical"
        >
          <Form.Item label="规格图片" name="image">
            <UploadImage type="single" />
          </Form.Item>

          <Form.Item label="规格名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="价格" name="price" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item label="SKU编码" name="sku_code">
            <Input />
          </Form.Item>

          <Form.Item label="库存" name="stock" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item label="排序" name="sort_order">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}