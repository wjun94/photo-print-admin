import { useRef, useState } from 'react'
import { Image, Tag, Switch, Space, message, Modal } from 'antd'
import { ProTable, ProTableRef, SearchField } from '@/components'
import { getWxUserListApi, WxUser, updateWxUserStatusApi } from '@/api/user'

export default function WxUsers() {
  const tableRef = useRef<ProTableRef>(null)
  const [loading, setLoading] = useState<number | null>(null)

  // 搜索配置
  const searchFields: SearchField[] = [
    {
      name: 'nickname',
      label: '微信昵称',
      type: 'input',
      placeholder: '请输入昵称',
    },
    {
      name: 'mobile',
      label: '手机号',
      type: 'input',
      placeholder: '请输入手机号',
    },
    {
      name: 'status',
      label: '用户状态',
      type: 'select',
      options: [
        { value: 1, label: '正常' },
        { value: 0, label: '禁用' },
      ],
    },
    {
      name: 'createdAt',
      label: '创建时间',
      type: 'dateRange',
    },
  ]

  // ✅ 修改用户状态
  const handleChangeStatus = async (id: number, checked: boolean) => {
    const status = checked ? 1 : 0
    const text = status === 1 ? '确定启用该用户？' : '确定禁用该用户？'

    Modal.confirm({
      title: '确认操作',
      content: text,
      onOk: async () => {
        try {
          setLoading(id)
          await updateWxUserStatusApi(id, status)
          message.success(status === 1 ? '启用成功' : '禁用成功')
          tableRef.current?.handleRefresh()
        } catch (err) {
          message.error('操作失败')
        } finally {
          setLoading(null)
        }
      },
    })
  }

  // 表格列
  const columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 70,
      render: (avatar: string) => (
        <Image
          width={40}
          height={40}
          src={avatar}
          fallback="https://picsum.photos/200/200"
          preview={false}
          className="rounded-full object-cover"
        />
      ),
    },
    {
      title: '微信昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 160,
    },
    {
      title: 'OpenID',
      dataIndex: 'openid',
      key: 'openid',
      width: 280,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 130,
      render: (mobile?: string) => mobile || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) =>
        status === 1 ? (
          <Tag color="green">正常</Tag>
        ) : (
          <Tag color="red">禁用</Tag>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: WxUser) => (
        <Space size="small">
          {/* ✅ 启用/禁用开关 */}
          <Switch
            checked={record.status === 1}
            loading={loading === record.id}
            onChange={(checked) => handleChangeStatus(record.id, checked)}
            checkedChildren="正常"
            unCheckedChildren="禁用"
          />
        </Space>
      ),
    },
  ]

  return (
    <ProTable<WxUser>
      ref={tableRef}
      title="微信用户列表"
      columns={columns}
      request={getWxUserListApi}
      rowKey="id"
      searchFields={searchFields}
      scroll={{ x: 1200 }}
    />
  )
}