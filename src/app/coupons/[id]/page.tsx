import { useState, useEffect } from 'react'
import {
  Card, Form, Input, InputNumber, DatePicker,
  Button, message, Typography, Radio, Space, Select
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  getCouponDetailApi, createCouponApi, updateCouponApi,
  CouponType, UseScope, TimeType, UserLimitType
} from '@/api/coupon'
import { getProductListApi } from '@/api/product'

const { Title, Text } = Typography
const { TextArea } = Input
const { RangePicker } = DatePicker

export default function CouponEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const isEdit = !!id

  // 监听表单字段变化
  const couponType = Form.useWatch('type', form)
  const timeType = Form.useWatch('timeType', form)
  const useScope = Form.useWatch('useScope', form)
  const userLimitType = Form.useWatch('userLimitType', form)

  // ==================== 商品选择器相关状态 ====================
  const [productOptions, setProductOptions] = useState<{ value: string; label: string }[]>([])
  const [productPage, setProductPage] = useState(1)
  const [productTotal, setProductTotal] = useState(0)
  const [productLoading, setProductLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  // 分页获取商品列表
  const fetchProducts = async (page: number, keyword: string = '') => {
    setProductLoading(true)
    try {
      const res = await getProductListApi({
        page,
        size: 10,
        name: keyword
      })

      const products = res.data?.list || []
      const newOptions = products.map((product: any) => ({
        value: String(product.id),
        label: `${product.name} (ID: ${product.id})`
      }))

      if (page === 1) {
        setProductOptions(newOptions)
      } else {
        setProductOptions(prev => [...prev, ...newOptions])
      }

      setProductTotal(res.data?.total || 0)
    } catch (err) {
      message.error('加载商品列表失败')
    } finally {
      setProductLoading(false)
    }
  }

  // 组件初始化加载第一页商品
  useEffect(() => {
    fetchProducts(1)
  }, [])

  // 切换到全平台通用时，清空已选商品
  useEffect(() => {
    if (useScope === UseScope.ALL) {
      form.setFieldValue('productIds', undefined)
    }
  }, [useScope, form])

  // 商品搜索
  const handleProductSearch = (value: string) => {
    setSearchKeyword(value)
    setProductPage(1)
    fetchProducts(1, value)
  }

  // 滚动到底加载下一页
  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const isBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 10

    if (isBottom && !productLoading && productOptions.length < productTotal) {
      const nextPage = productPage + 1
      setProductPage(nextPage)
      fetchProducts(nextPage, searchKeyword)
    }
  }

  // 商品选择变化，自动转为逗号分隔字符串
  const handleProductChange = (values: string[]) => {
    form.setFieldValue('productIds', values.join(','))
  }
  // ============================================================

  // 获取优惠券详情（编辑模式）
  const { loading: detailLoading } = useRequest(
    () => {
      if (!isEdit || !id) return Promise.resolve(null)
      return getCouponDetailApi(id)
    },
    {
      ready: isEdit,
      refreshDeps: isEdit ? [id] : [],
      onSuccess: (res) => {
        if (!res) return

        const data = res.data
        const formData = {
          ...data,
          receiveTime: [dayjs(data.receiveStart), dayjs(data.receiveEnd)],
          validTime: data.timeType === TimeType.FIXED
            ? [dayjs(data.validStart), dayjs(data.validEnd)]
            : undefined
        }
        form.setFieldsValue(formData)

        // 编辑模式回显已选商品
        if (data.productIds && data.useScope === UseScope.SPEC) {
          const selectedIds = data.productIds.split(',')
          // 补充不在当前列表中的商品（显示ID作为兜底）
          const existingIds = productOptions.map(opt => opt.value)
          const missingOptions = selectedIds
            .filter(id => !existingIds.includes(id))
            .map(id => ({ value: id, label: `商品ID: ${id}` }))

          if (missingOptions.length > 0) {
            setProductOptions(prev => [...prev, ...missingOptions])
          }
        }
      },
      onError: () => {
        message.error('加载优惠券详情失败')
      }
    }
  )

  // 创建优惠券
  const { run: createCoupon, loading: createLoading } = useRequest(
    (data: any) => createCouponApi(data),
    {
      manual: true,
      onSuccess: () => {
        message.success('创建成功')
        navigate('/coupons')
      },
      onError: () => {
        message.error('创建失败')
      }
    }
  )

  // 更新优惠券
  const { run: updateCoupon, loading: updateLoading } = useRequest(
    (data: any) => updateCouponApi(id!, data),
    {
      manual: true,
      onSuccess: () => {
        message.success('更新成功')
        navigate('/coupons')
      },
      onError: () => {
        message.error('更新失败')
      }
    }
  )

  // 提交表单
  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      receiveStart: values.receiveTime[0].toISOString(),
      receiveEnd: values.receiveTime[1].toISOString(),
      validStart: values.timeType === TimeType.FIXED
        ? values.validTime[0].toISOString()
        : undefined,
      validEnd: values.timeType === TimeType.FIXED
        ? values.validTime[1].toISOString()
        : undefined
    }

    delete data.receiveTime
    delete data.validTime

    if (isEdit) {
      updateCoupon(data)
    } else {
      createCoupon(data)
    }
  }

  const loading = detailLoading || createLoading || updateLoading

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* 顶部返回栏 */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/coupons')}
            className="mb-3"
          >
            返回优惠券列表
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? '编辑优惠券' : '新建优惠券'}
          </Title>
        </div>

        <Card className="shadow-sm" bordered={false}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              type: CouponType.FULL_REDUCE,
              useScope: UseScope.ALL,
              timeType: TimeType.FIXED,
              userLimitType: UserLimitType.LIMIT_ONE,
              userLimitNum: 1,
              targetUserType: 0,
              discountRate: 1,
              maxReduce: 0
            }}
            disabled={loading}
          >
            {/* 基础信息 */}
            <div className="mb-6">
              <Title level={5} className="mb-4">基础信息</Title>

              <Form.Item
                label="优惠券名称"
                name="name"
                rules={[{ required: true, message: '请输入优惠券名称' }]}
              >
                <Input placeholder="例如：新人专享10元无门槛券" maxLength={50} />
              </Form.Item>

              <Form.Item
                label="优惠券类型"
                name="type"
                rules={[{ required: true, message: '请选择优惠券类型' }]}
              >
                <Radio.Group>
                  <Radio value={CouponType.FULL_REDUCE}>满减券</Radio>
                  <Radio value={CouponType.NO_THRESHOLD}>无门槛券</Radio>
                  <Radio value={CouponType.DISCOUNT}>折扣券</Radio>
                </Radio.Group>
              </Form.Item>
            </div>

            {/* 面值配置（动态显示） */}
            <div className="mb-6">
              <Title level={5} className="mb-4">面值配置</Title>

              {couponType === CouponType.FULL_REDUCE && (
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label="满减门槛"
                    name="fullAmount"
                    rules={[{ required: true, message: '请输入满减门槛' }]}
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      precision={2}
                      placeholder="例如：99"
                      style={{ width: '100%' }}
                      suffix="元"
                    />
                  </Form.Item>
                  <Form.Item
                    label="抵扣金额"
                    name="reduceAmount"
                    rules={[{ required: true, message: '请输入抵扣金额' }]}
                  >
                    <InputNumber
                      min={0.01}
                      step={0.01}
                      precision={2}
                      placeholder="例如：10"
                      style={{ width: '100%' }}
                      suffix="元"
                    />
                  </Form.Item>
                </div>
              )}

              {couponType === CouponType.NO_THRESHOLD && (
                <Form.Item
                  label="抵扣金额"
                  name="reduceAmount"
                  rules={[{ required: true, message: '请输入抵扣金额' }]}
                >
                  <InputNumber
                    min={0.01}
                    step={0.01}
                    precision={2}
                    placeholder="例如：10"
                    style={{ width: '100%' }}
                    suffix="元"
                  />
                </Form.Item>
              )}

              {couponType === CouponType.DISCOUNT && (
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label="折扣比例"
                    name="discountRate"
                    rules={[{ required: true, message: '请输入折扣比例' }]}
                  >
                    <InputNumber
                      min={0.1}
                      max={1}
                      step={0.01}
                      precision={2}
                      placeholder="例如：0.8 表示8折"
                      style={{ width: '100%' }}
                      suffix="折"
                      formatter={(value) => value ? `${(value * 10).toFixed(1)}` : ''}
                      parser={(value) => (value ? parseFloat(value) / 10 : 0) as any}
                    />
                  </Form.Item>
                  <Form.Item
                    label="最高减免"
                    name="maxReduce"
                    rules={[{ required: true, message: '请输入最高减免金额' }]}
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      precision={2}
                      placeholder="0表示无上限"
                      style={{ width: '100%' }}
                      suffix="元"
                    />
                  </Form.Item>
                </div>
              )}
            </div>

            {/* 使用范围 */}
            <div className="mb-6">
              <Title level={5} className="mb-4">使用范围</Title>

              <Form.Item
                label="适用商品"
                name="useScope"
                rules={[{ required: true, message: '请选择适用商品范围' }]}
              >
                <Radio.Group>
                  <Radio value={UseScope.ALL}>全平台通用</Radio>
                  <Radio value={UseScope.SPEC}>指定商品</Radio>
                </Radio.Group>
              </Form.Item>

              {/* ✅ Antd 6.x 正确写法：使用 options 属性，移除 Option 组件 */}
              {useScope === UseScope.SPEC && (
                <Form.Item
                  label="指定商品"
                  name="productIds"
                  rules={[{ required: true, message: '请至少选择一个适用商品' }]}
                  extra="支持输入商品名称搜索，可多选，最多显示3个已选标签"
                  getValueProps={(value: string) => ({
                    value: value ? value.split(',') : []
                  })}
                >
                  <Select
                    mode="multiple"
                    placeholder="请搜索并选择商品"
                    style={{ width: '100%' }}
                    showSearch
                    filterOption={false}
                    onSearch={handleProductSearch}
                    onPopupScroll={handlePopupScroll}
                    onChange={handleProductChange}
                    loading={productLoading}
                    maxTagCount={3}
                    allowClear
                    options={productOptions} // ✅ 直接传递 options 数组
                  />
                </Form.Item>
              )}
            </div>

            {/* 有效期配置 */}
            <div className="mb-6">
              <Title level={5} className="mb-4">有效期配置</Title>

              <Form.Item
                label="有效期类型"
                name="timeType"
                rules={[{ required: true, message: '请选择有效期类型' }]}
              >
                <Radio.Group>
                  <Radio value={TimeType.FIXED}>固定时间段</Radio>
                  <Radio value={TimeType.AFTER}>领取后N天有效</Radio>
                </Radio.Group>
              </Form.Item>

              {timeType === TimeType.FIXED && (
                <Form.Item
                  label="有效时间"
                  name="validTime"
                  rules={[{ required: true, message: '请选择有效时间' }]}
                >
                  <RangePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              )}

              {timeType === TimeType.AFTER && (
                <Form.Item
                  label="有效天数"
                  name="validDays"
                  rules={[{ required: true, message: '请输入有效天数' }]}
                >
                  <InputNumber
                    min={1}
                    placeholder="例如：7"
                    style={{ width: '100%' }}
                    suffix="天"
                  />
                </Form.Item>
              )}
            </div>

            {/* 发放规则 */}
            <div className="mb-6">
              <Title level={5} className="mb-4">发放规则</Title>

              <Form.Item
                label="领券时间"
                name="receiveTime"
                rules={[{ required: true, message: '请选择领券时间' }]}
              >
                <RangePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="总发放库存"
                name="totalStock"
                rules={[{ required: true, message: '请输入总发放库存' }]}
              >
                <InputNumber
                  min={1}
                  placeholder="例如：1000"
                  style={{ width: '100%' }}
                  suffix="张"
                />
              </Form.Item>

              <Form.Item
                label="用户领券限制"
                name="userLimitType"
                rules={[{ required: true, message: '请选择用户领券限制' }]}
              >
                <Radio.Group>
                  <Radio value={UserLimitType.UNLIMITED}>不限领取</Radio>
                  <Radio value={UserLimitType.LIMIT_ONE}>单人限领1张</Radio>
                  <Radio value={UserLimitType.LIMIT_N}>单人限领N张</Radio>
                </Radio.Group>
              </Form.Item>

              {userLimitType === UserLimitType.LIMIT_N && (
                <Form.Item
                  label="每人最多领取"
                  name="userLimitNum"
                  rules={[{ required: true, message: '请输入每人最多领取数量' }]}
                >
                  <InputNumber
                    min={1}
                    placeholder="例如：3"
                    style={{ width: '100%' }}
                    suffix="张"
                  />
                </Form.Item>
              )}
            </div>

            {/* 使用说明 */}
            <div className="mb-6">
              <Title level={5} className="mb-4">其他信息</Title>

              <Form.Item
                label="使用说明"
                name="desc"
              >
                <TextArea rows={4} placeholder="请输入优惠券使用说明和活动描述" maxLength={500} showCount />
              </Form.Item>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-center pt-4">
              <Space size="middle">
                <Button
                  size="large"
                  onClick={() => navigate('/coupons')}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={loading}
                  className="h-12 px-8 text-base font-medium rounded-lg"
                >
                  {isEdit ? '保存修改' : '创建优惠券'}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}