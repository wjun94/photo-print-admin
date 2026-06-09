import { useState, useEffect } from 'react'
import {
  Form, Input, Select, Button, InputNumber,
  Card, Table, message, Space, Popconfirm, Tag
} from 'antd'
import { PlusOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useRequest } from 'ahooks'
import { UploadImage, RichTextEditor } from '@/components'
import {
  createProductApi, getProductDetailApi,
  updateProductApi, Product
} from '@/api/product'

interface SpecAttribute {
  name: string;
  values: string[];
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const isEdit = !!id

  // 1. 规格大类
  const [specAttributes, setSpecAttributes] = useState<SpecAttribute[]>([
    { name: '颜色', values: ['标准'] }
  ])

  // 2. 最终生成的 SKU 列表
  const [skuList, setSkuList] = useState<any[]>([])

  // 3. 批量设置状态
  const [batchConfig, setBatchConfig] = useState({ price: null, stock: null, skuCode: '' })

  // 监听规格属性变化，传入当前的 skuList 以便保留输入
  useEffect(() => {
    generateSkus(specAttributes, skuList)
  }, [specAttributes])

  /**
   * 核心改动：笛卡尔积算法，支持传入自定义的“对比参考源” (sourceList)
   */
  const generateSkus = (attributes: SpecAttribute[], sourceList: any[]) => {
    const validAttributes = attributes.filter(attr => attr.name && attr.values.length > 0)
    if (validAttributes.length === 0) {
      setSkuList([])
      return
    }

    // 笛卡尔积组合
    const keepValues = validAttributes.reduce((acc, current) => {
      const res: any[] = []
      acc.forEach((base: any) => {
        current.values.forEach(val => {
          res.push([...base, { specName: current.name, specValue: val }])
        })
      })
      return res
    }, [[]])

    // 生成或匹配 SKU
    const newSkuList = keepValues.map((combination: any[]) => {
      const skuKey = combination.map(c => `${c.specName}:${c.specValue}`).join('_')

      // ✅ 优先从传入的 sourceList (可能是刚加载回来的接口数据) 里找匹配项
      const existingSku = sourceList.find(s => s.skuKey === skuKey)

      const skuItem: any = {
        id: existingSku?.id ?? undefined, // 保留后端返回的 sku id，编辑提交非常重要！
        skuKey,
        price: existingSku?.price ?? 0,
        stock: existingSku?.stock ?? 0,
        skuCode: existingSku?.skuCode ?? '',
        image: existingSku?.image ?? '',
      }

      // 动态注入属性名作为 key，供 Table 列头读取
      combination.forEach(c => {
        skuItem[c.specName] = c.specValue
      })

      return skuItem
    })

    setSkuList(newSkuList)
  }

  // 加载商品详情
  const { loading: detailLoading } = useRequest(
    () => getProductDetailApi(id!),
    {
      ready: isEdit,
      refreshDeps: [id],
      onSuccess: (res) => {
        const data: any = res.data
        form.setFieldsValue(data)

        // ✅ 修复核心：先同步计算，再统一更新状态，防止渲染时数据被旧状态冲掉
        const backendAttributes = data.specAttributes || []
        const backendSpecs = data.specs || []

        if (backendAttributes.length > 0) {
          setSpecAttributes(backendAttributes)
          // 核心：强制传 backendSpecs 去进行首次的高精度组合匹配
          generateSkus(backendAttributes, backendSpecs)
        } else {
          setSkuList(backendSpecs)
        }
      },
      onError: () => {
        message.error('加载商品详情失败')
      }
    }
  )

  // 提交商品保持不变...
  const { run: submitProduct, loading: submitLoading } = useRequest(
    async (values: any) => {
      const data: Product = {
        ...values,
        specAttributes,
        specs: skuList,
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

  // 快捷批量填充 SKU 属性
  const handleBatchApply = () => {
    if (skuList.length === 0) return
    const updated = skuList.map(sku => ({
      ...sku,
      price: batchConfig.price !== null ? batchConfig.price : sku.price,
      stock: batchConfig.stock !== null ? batchConfig.stock : sku.stock,
      skuCode: batchConfig.skuCode ? `${batchConfig.skuCode}-${Math.random().toString(36).substr(2, 4).toUpperCase()}` : sku.skuCode
    }))
    setSkuList(updated)
    message.success('批量填充成功')
  }

  const onSubmit = (values: any) => {
    if (skuList.length === 0) {
      message.error("请至少配置一个有效的规格组合")
      return
    }
    const isInvalid = skuList.some(sku => sku.price === undefined || sku.stock === undefined)
    if (isInvalid) {
      message.error("请完善所有规格的价格与库存信息")
      return
    }
    submitProduct(values)
  }

  // 动态构建 SKU 表格列头
  const getTableColumns = () => {
    const validAttributes = specAttributes.filter(attr => attr.name && attr.values.length > 0)

    const dynamicColumns = validAttributes.map(attr => ({
      title: attr.name,
      dataIndex: attr.name,
      key: attr.name,
      render: (text: string) => <Tag color="blue">{text}</Tag>
    }))

    const fixedColumns = [
      {
        title: '规格图片',
        dataIndex: 'image',
        key: 'image',
        width: 100,
        render: (text: string, record: any, index: number) => (
          <UploadImage
            type="single"
            maxCount={1}
            value={text}
            onChange={(url) => {
              const updated = [...skuList]
              updated[index].image = url
              setSkuList(updated)
            }}
          />
        )
      },
      {
        title: '价格(元)',
        dataIndex: 'price',
        key: 'price',
        width: 140,
        render: (text: number, record: any, index: number) => (
          <InputNumber
            min={0}
            step={0.01}
            value={text} // 使用 value 绑定，使回显和修改生效
            placeholder="0.00"
            onChange={(val) => {
              const updated = [...skuList]
              updated[index].price = val || 0
              setSkuList(updated)
            }}
          />
        )
      },
      {
        title: '库存',
        dataIndex: 'stock',
        key: 'stock',
        width: 130,
        render: (text: number, record: any, index: number) => (
          <InputNumber
            min={0}
            precision={0}
            value={text} // 使用 value 绑定
            placeholder="0"
            onChange={(val) => {
              const updated = [...skuList]
              updated[index].stock = val || 0
              setSkuList(updated)
            }}
          />
        )
      },
      {
        title: 'SKU编码',
        dataIndex: 'skuCode',
        key: 'skuCode',
        render: (text: string, record: any, index: number) => (
          <Input
            value={text} // 使用 value 绑定
            placeholder="条码/唯一编码"
            onChange={(e) => {
              const updated = [...skuList]
              updated[index].skuCode = e.target.value
              setSkuList(updated)
            }}
          />
        )
      }
    ]

    return [...dynamicColumns, ...fixedColumns]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4">
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
            {/* 商品名称、富文本等基础表单... */}
            <Form.Item label="商品名称" name="name" rules={[{ required: true, message: '请输入商品名称' }]}>
              <Input placeholder="请输入商品名称" maxLength={50} showCount />
            </Form.Item>
            <Form.Item label="商品封面" name="coverImage">
              <UploadImage type="single" maxCount={1} />
            </Form.Item>
            <Form.Item label="商品轮播图" name="bannerImages">
              <UploadImage type="batch" maxCount={9} />
            </Form.Item>
            <Form.Item label="商品描述" name="description">
              <Input.TextArea rows={3} maxLength={200} showCount className="resize-none" />
            </Form.Item>
            <Form.Item label="商品详情" name="detail">
              <RichTextEditor placeholder="请输入商品详细介绍" height={450} />
            </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item label="商品状态" name="status">
                <Select options={[
                  { value: 'draft', label: '草稿' },
                  { value: 'on_sale', label: '上架' },
                  { value: 'off_sale', label: '下架' },
                ]} />
              </Form.Item>
              <Form.Item label="排序号" name="sortOrder">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </div>

            {/* 1. 规格模板配置 */}
            <Card title="规格模版配置" className="border-gray-200">
              <div className="space-y-4">
                {specAttributes.map((attr, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-1/4">
                      <div className="text-xs text-gray-500 mb-1">规格名</div>
                      <Input
                        value={attr.name}
                        placeholder="规格名称"
                        onChange={(e) => {
                          const updated = [...specAttributes]
                          updated[index].name = e.target.value
                          setSpecAttributes(updated)
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">规格值</div>
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="请输入规格值并回车"
                        value={attr.values}
                        onChange={(vals) => {
                          const updated = [...specAttributes]
                          updated[index].values = vals
                          setSpecAttributes(updated)
                        }}
                        tokenSeparators={[',', '，']}
                      />
                    </div>
                    {specAttributes.length > 1 && (
                      <Popconfirm title="确定删除吗？" onConfirm={() => {
                        setSpecAttributes(specAttributes.filter((_, i) => i !== index))
                      }}>
                        <Button type="text" danger icon={<DeleteOutlined />} className="mt-6" />
                      </Popconfirm>
                    )}
                  </div>
                ))}
                {specAttributes.length < 3 && (
                  <Button
                    type="dashed"
                    onClick={() => setSpecAttributes([...specAttributes, { name: '', values: [] }])}
                    icon={<PlusOutlined />}
                    block
                  >
                    添加规格大类
                  </Button>
                )}
              </div>
            </Card>

            {/* 2. SKU 动态明细表格 */}
            {skuList.length > 0 && (
              <Card title="规格商品明细清单" className="border-gray-200">
                <div className="mb-4 p-3 bg-blue-50/50 rounded-md border border-blue-100 flex items-center justify-between flex-wrap gap-3">
                  <Space className="text-sm font-medium text-blue-800">批量设置：</Space>
                  <Space size="middle">
                    <InputNumber min={0} placeholder="统一价格" onChange={val => setBatchConfig({ ...batchConfig, price: val as any })} />
                    <InputNumber min={0} precision={0} placeholder="统一库存" onChange={val => setBatchConfig({ ...batchConfig, stock: val as any })} />
                    <Input placeholder="编码前缀" onChange={e => setBatchConfig({ ...batchConfig, skuCode: e.target.value })} />
                    <Button type="primary" size="small" onClick={handleBatchApply}>应用到所有规格</Button>
                  </Space>
                </div>

                <Table
                  dataSource={skuList}
                  columns={getTableColumns()}
                  rowKey="skuKey"
                  pagination={false}
                  bordered
                  size="middle"
                  scroll={{ x: 'max-content' }}
                />
              </Card>
            )}

            {/* 底部按钮 */}
            <div className="flex justify-center gap-6 pt-6">
              <Button size="large" onClick={() => navigate('/products')} className="!px-16" disabled={detailLoading || submitLoading}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={submitLoading} size="large" className="!px-16" disabled={detailLoading}>
                保存商品
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}