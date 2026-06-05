import { useState, useEffect } from 'react'
import {
  Card, Button, message, Typography,
  Upload, Alert
} from 'antd'
import {
  UploadOutlined, SaveOutlined,
  QrcodeOutlined, InfoCircleOutlined
} from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Image } from '@/components'
import { getQrcodeConfigApi, uploadQRCodesApi } from '@/api/config'

const { Text, Title } = Typography

export default function QrcodeSettings() {
  // 当前已上传的二维码URL
  const [businessQrcode, setBusinessQrcode] = useState<string>('')
  const [groupQrcode, setGroupQrcode] = useState<string>('')

  // 选中的待上传文件（支持单独上传）
  const [selectedBusinessFile, setSelectedBusinessFile] = useState<File | null>(null)
  const [selectedGroupFile, setSelectedGroupFile] = useState<File | null>(null)

  // 本地预览URL
  const [businessPreview, setBusinessPreview] = useState<string>('')
  const [groupPreview, setGroupPreview] = useState<string>('')

  // 获取当前二维码配置
  const { loading: getLoading } = useRequest(
    () => getQrcodeConfigApi(),
    {
      onSuccess: (res) => {
        const data = res.data || {}
        setBusinessQrcode(data.businessQrcode || '')
        setGroupQrcode(data.groupQrcode || '')
      },
      onError: () => {
        message.error('加载二维码配置失败，请刷新页面重试')
      }
    }
  )

  // 上传二维码接口
  const { run: submitUpload, loading: submitLoading } = useRequest(
    (formData: FormData) => uploadQRCodesApi(formData),
    {
      manual: true,
      onSuccess: (res) => {
        // 更新页面显示
        setBusinessQrcode(res.data.businessQrcode)
        setGroupQrcode(res.data.groupQrcode)

        // 清空选中状态和预览
        setSelectedBusinessFile(null)
        setSelectedGroupFile(null)
        setBusinessPreview('')
        setGroupPreview('')

        // 智能提示：根据上传的内容显示不同的成功信息
        const updated = []
        if (selectedBusinessFile) updated.push('商务合作二维码')
        if (selectedGroupFile) updated.push('交流群二维码')
        message.success(`${updated.join('和')}更新成功，小程序端已同步`)
      },
      onError: (err: any) => {
        message.error(err.message || '上传失败，请稍后重试')
      }
    }
  )

  // 组件卸载时释放预览URL，防止内存泄漏
  useEffect(() => {
    return () => {
      if (businessPreview) URL.revokeObjectURL(businessPreview)
      if (groupPreview) URL.revokeObjectURL(groupPreview)
    }
  }, [businessPreview, groupPreview])

  // 安全创建预览URL
  const createSafePreview = (file: File | null): string => {
    if (!file || !(file instanceof Blob)) {
      return ''
    }

    try {
      return URL.createObjectURL(file)
    } catch (err) {
      console.error('创建预览失败:', err)
      return ''
    }
  }

  // 安全释放预览URL
  const revokeSafePreview = (url: string) => {
    if (url) {
      try {
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('释放预览失败:', err)
      }
    }
  }

  // 处理商务二维码选择
  const handleBusinessChange = (info: any) => {
    // 只处理选择文件的情况，跳过上传状态
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      return
    }

    // 检查文件是否有效
    const file = info.file
    if (!file || !(file instanceof File)) {
      // 用户取消选择或文件无效，清空状态
      setSelectedBusinessFile(null)
      revokeSafePreview(businessPreview)
      setBusinessPreview('')
      return
    }

    setSelectedBusinessFile(file)

    // 释放之前的预览URL
    revokeSafePreview(businessPreview)

    // 创建新的预览URL
    const previewUrl = createSafePreview(file)
    setBusinessPreview(previewUrl)
  }

  // 处理交流群二维码选择
  const handleGroupChange = (info: any) => {
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      return
    }

    const file = info.file
    if (!file || !(file instanceof File)) {
      setSelectedGroupFile(null)
      revokeSafePreview(groupPreview)
      setGroupPreview('')
      return
    }

    setSelectedGroupFile(file)
    revokeSafePreview(groupPreview)
    const previewUrl = createSafePreview(file)
    setGroupPreview(previewUrl)
  }

  // ✅ 提交上传（支持部分更新）
  const handleSubmit = () => {
    if (!selectedBusinessFile && !selectedGroupFile) {
      message.warning('请至少选择一个二维码图片进行更新')
      return
    }

    const formData = new FormData()

    // 只添加选中的文件到FormData
    if (selectedBusinessFile) {
      formData.append('business', selectedBusinessFile)
    }
    if (selectedGroupFile) {
      formData.append('group', selectedGroupFile)
    }

    submitUpload(formData)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <QrcodeOutlined className="text-xl text-blue-600" />
            <Title level={3} style={{ margin: 0 }}>二维码管理</Title>
          </div>
          <Text type="secondary" className="mt-1 block">
            配置小程序端展示的商务合作和交流群二维码
          </Text>
        </div>

        {/* ✅ 更新提示信息（支持单独上传） */}
        <Alert
          title="操作提示"
          description="可以单独更新商务合作二维码或交流群二维码，未选择的二维码将保持原有值不变"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />

        {/* 二维码上传区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
          {/* 商务合作二维码 */}
          <Card
            title="商务合作二维码"
            className="shadow-sm"
          >
            <div className="flex flex-col items-center">
              {/* 优先显示本地预览，没有则显示已上传的二维码 */}
              {businessPreview || businessQrcode ? (
                <div className="mb-4">
                  <Image
                    src={businessPreview || businessQrcode}
                    width={200}
                    height={200}
                    className="rounded-lg border border-gray-200"
                    fallback="https://picsum.photos/200/200?text=暂无二维码"
                    preview={true}
                  />
                </div>
              ) : (
                <div className="w-[200px] h-[200px] mb-4 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Text type="secondary">暂无商务二维码</Text>
                </div>
              )}

              {/* 上传按钮 */}
              <Upload
                accept="image/png,image/jpeg,image/jpg"
                maxCount={1}
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleBusinessChange}
                disabled={submitLoading}
              >
                <Button
                  icon={<UploadOutlined />}
                  size="large"
                  className="rounded-lg"
                >
                  {selectedBusinessFile ? '重新选择' : '选择商务二维码'}
                </Button>
              </Upload>

              {selectedBusinessFile && (
                <Text type="success" className="mt-2 text-xs">
                  ✓ 已选择：{selectedBusinessFile.name}
                </Text>
              )}
            </div>
          </Card>

          {/* 交流群二维码 */}
          <Card
            title="交流群二维码"
            className="shadow-sm"
          >
            <div className="flex flex-col items-center">
              {/* 优先显示本地预览，没有则显示已上传的二维码 */}
              {groupPreview || groupQrcode ? (
                <div className="mb-4">
                  <Image
                    src={groupPreview || groupQrcode}
                    width={200}
                    height={200}
                    className="rounded-lg border border-gray-200"
                    fallback="https://picsum.photos/200/200?text=暂无二维码"
                    preview={true}
                  />
                </div>
              ) : (
                <div className="w-[200px] h-[200px] mb-4 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Text type="secondary">暂无交流群二维码</Text>
                </div>
              )}

              {/* 上传按钮 */}
              <Upload
                accept="image/png,image/jpeg,image/jpg"
                maxCount={1}
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleGroupChange}
                disabled={submitLoading}
              >
                <Button
                  icon={<UploadOutlined />}
                  size="large"
                  className="rounded-lg"
                >
                  {selectedGroupFile ? '重新选择' : '选择交流群二维码'}
                </Button>
              </Upload>

              {selectedGroupFile && (
                <Text type="success" className="mt-2 text-xs">
                  ✓ 已选择：{selectedGroupFile.name}
                </Text>
              )}
            </div>
          </Card>
        </div>

        {/* ✅ 保存按钮（只要选了至少一个就启用） */}
        <div className="flex justify-center">
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={submitLoading || getLoading}
            className="h-12 px-12 text-base font-medium rounded-lg"
            disabled={!selectedBusinessFile && !selectedGroupFile}
          >
            保存并更新
          </Button>
        </div>

        {/* 底部说明 */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>仅支持 PNG、JPG、JPEG 格式，建议尺寸 300×300px，大小不超过 2MB</p>
          <p className="mt-1">更新成功后，所有用户打开小程序都将看到新的二维码</p>
        </div>
      </div>
    </div>
  )
}