import { useRef } from 'react'
import { Image, Tag, Button, Space, message } from 'antd'
import ProTable, { ProTableRef, SearchField } from '@/core/components/ProTable'
import { getWxUserListApi, WxUser } from '@/api/user'

export default function WxUsers() {
  // 搜索配置
  const searchFields: SearchField[] = [
    {
      name: 'nickname',
      label: '微信昵称',
      type: 'input',
      placeholder: '请输入昵称',
    },
    {
      name: 'phone',
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

  // 表格列
  const columns = [
    {
      title: '头像',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
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
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone?: string) => phone || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
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
      width: 120,
      render: (_: unknown, record: WxUser) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => message.info('查看：' + record.nickname)}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ]

  const tableRef = useRef<ProTableRef>(null)

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