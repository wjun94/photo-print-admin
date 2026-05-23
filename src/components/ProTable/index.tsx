// src/components/ProTable.tsx
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Table, Card, Button, Space, Form, Input, Select, DatePicker, message } from 'antd'
import { ReloadOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs' // ✅ 导入 dayjs

// 通用分页请求参数
export interface PageParams {
  page: number
  size: number
  [key: string]: any
}

// 通用 API 响应格式
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 搜索字段类型定义
export interface SearchField {
  name: string
  label: string
  type: 'input' | 'select' | 'date' | 'dateRange'
  placeholder?: string
  options?: Array<{ value: string | number; label: string }>
  width?: number
  initialValue?: any
}

// ProTable 暴露的方法
export interface ProTableRef {
  handleSearch: (params: Record<string, any>) => void
  handleReset: () => void
  handleRefresh: () => void
}

interface ProTableProps<T> {
  columns: ColumnsType<T> | any
  request: (params: PageParams) => Promise<ApiResponse<T[]> | any>
  rowKey: string
  title?: string
  extra?: React.ReactNode
  scroll?: { x?: number; y?: number }
  initialParams?: Record<string, any>
  searchFields?: SearchField[] | any
  showSearch?: boolean
}

function ProTableInner<T extends object>(
  {
    columns,
    request,
    rowKey,
    title,
    extra,
    scroll,
    initialParams = {},
    searchFields = [],
    showSearch = true
  }: ProTableProps<T>,
  ref: React.Ref<ProTableRef>
) {
  const [form] = Form.useForm()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`
  })
  const [searchParams, setSearchParams] = useState(initialParams)

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    handleSearch,
    handleReset,
    handleRefresh
  }))

  // 加载数据
  const fetchData = async (page: number, pageSize: number, params: Record<string, any>) => {
    setLoading(true)
    try {
      const res = await request({
        page,
        size: pageSize,
        ...params
      })

      const tableData = Array.isArray(res.data?.list) ? res.data?.list : []
      setData(tableData)
      setPagination({
        ...pagination,
        current: page,
        pageSize,
        // total: tableData.length
      })
    } catch (err) {
      console.error('获取数据失败:', err)
      message.error('获取数据失败')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // 首次加载
  useEffect(() => {
    fetchData(1, pagination.pageSize, searchParams)
  }, [])

  // 分页变化
  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    const { current, pageSize } = paginationConfig
    fetchData(current || 1, pageSize || 10, searchParams)
  }

  // 刷新
  const handleRefresh = () => {
    fetchData(pagination.current, pagination.pageSize, searchParams)
  }

  // 搜索
  const handleSearch = (params: Record<string, any>) => {
    // 处理日期格式转换（修复 Dayjs 类型错误）
    const processedParams: Record<string, any> = {}
    Object.entries(params).forEach(([key, value]) => {
      // ✅ 使用 dayjs.isDayjs() 静态方法，而不是实例方法
      if (value && dayjs.isDayjs(value)) {
        processedParams[key] = value.format('YYYY-MM-DD')
      } else if (
        Array.isArray(value) &&
        value.length === 2 &&
        dayjs.isDayjs(value[0]) &&
        dayjs.isDayjs(value[1])
      ) {
        processedParams[`${key}Start`] = value[0].format('YYYY-MM-DD')
        processedParams[`${key}End`] = value[1].format('YYYY-MM-DD')
      } else if (value !== '' && value !== undefined && value !== null) {
        processedParams[key] = value
      }
    })

    setSearchParams(processedParams)
    fetchData(1, pagination.pageSize, processedParams)
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    setSearchParams(initialParams)
    fetchData(1, pagination.pageSize, initialParams)
  }

  // 自动生成搜索表单
  const renderSearchForm = () => {
    if (!showSearch || searchFields.length === 0) return null

    return (
      <Card variant="borderless" style={{ marginBottom: '1rem' }}>
        <Form
          form={form}
          layout="inline"
          initialValues={initialParams}
          onFinish={handleSearch}
        >
          {searchFields.map((field: any) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              initialValue={field.initialValue}
            >
              {field.type === 'input' && (
                <Input
                  placeholder={field.placeholder || `请输入${field.label}`}
                  style={{ width: field.width || 150 }}
                  allowClear
                />
              )}

              {field.type === 'select' && (
                <Select
                  placeholder={field.placeholder || `请选择${field.label}`}
                  style={{ width: field.width || 150 }}
                  options={field.options}
                  allowClear
                />
              )}

              {field.type === 'date' && (
                <DatePicker
                  placeholder={field.placeholder || `请选择${field.label}`}
                  style={{ width: field.width || 150 }}
                  format="YYYY-MM-DD"
                />
              )}

              {field.type === 'dateRange' && (
                <DatePicker.RangePicker
                  placeholder={['开始日期', '结束日期']}
                  style={{ width: field.width || 250 }}
                  format="YYYY-MM-DD"
                />
              )}
            </Form.Item>
          ))}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset} icon={<UndoOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    )
  }

  return (
    <div>
      {/* 自动生成的搜索区域 */}
      {renderSearchForm()}

      {/* 表格区域 ✅ 同样修复 bordered 弃用警告 */}
      <Card
        title={title}
        variant="borderless"
        extra={
          <Space>
            {extra}
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          rowKey={rowKey}
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={scroll}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  )
}

// 导出带 ref 的组件
export const ProTable = forwardRef(ProTableInner) as <T extends object>(
  props: ProTableProps<T> & { ref?: React.Ref<ProTableRef> }
) => React.ReactElement

export default ProTable