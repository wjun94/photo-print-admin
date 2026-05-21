// src/core/components/ProTable/index.tsx
import { Table, Card, Spin, Space } from 'antd'
import { useRequest } from 'ahooks'
import type { TableProps } from 'antd/es/table'

// ✅ 定义通用分页参数类型
export interface PageParams {
  page: number
  pageSize: number
  [key: string]: any // 允许额外的搜索参数
}

// ✅ 定义通用分页响应类型
export interface PageResponse<T> {
  list: T[]
  total: number
}

interface ProTableProps<T> extends Omit<TableProps<T>, 'dataSource' | 'pagination'> {
  // ✅ 明确 request 函数的参数和返回值类型
  request: (params: PageParams) => Promise<PageResponse<T>>
  toolBar?: React.ReactNode
}

export function ProTable<T>({ request, toolBar, ...props }: ProTableProps<T>) {
  const { data, loading, run } = useRequest(
    // ✅ 明确 params 类型
    (params: PageParams = { page: 1, pageSize: 10 }) => request(params),
    {
      refreshDeps: [],
      defaultParams: [{ page: 1, pageSize: 10 }]
    }
  )

  return (
    <Card>
      {toolBar && <Space style={{ marginBottom: 16 }}>{toolBar}</Space>}
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          dataSource={data?.list || []}
          pagination={{
            total: data?.total || 0,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          {...props}
        />
      </Spin>
    </Card>
  )
}