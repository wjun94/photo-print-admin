import { Upload, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadProps, UploadFile } from 'antd'
import { useAuthStore } from '@/stores/authStore'
import { useRef, useState, useEffect, memo } from 'react'

interface Props {
  value?: string[] | string
  onChange?: (urls: string[] | string) => void
  maxCount?: number
  type: 'single' | 'batch'
  disabled?: boolean
}

// ✅ 使用 memo 优化，只有 props 变化时才重新渲染
const UploadImage = memo(({
  value,
  onChange,
  maxCount = 9,
  type = 'single',
  disabled,
}: Props) => {
  const token = useAuthStore((state) => state.token)
  const STATIC_DOMAIN = import.meta.env.VITE_STATIC_BASE_URL
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  
  // 批量上传文件收集器
  const batchFilesRef = useRef<File[]>([])
  // 批量上传定时器
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null)
  // 删除加载状态
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  // 保存最新的value引用（解决闭包问题）
  const valueRef = useRef(value)

  // 同步最新value到ref
  useEffect(() => {
    valueRef.current = value
  }, [value])

  // 拼接完整图片地址
  const getFullUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${STATIC_DOMAIN}/${url}`
  }

  // 上传前校验
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error('只能上传图片')
      return Upload.LIST_IGNORE
    }

    if (type === 'single') {
      handleSingleUpload(file)
    } else {
      batchFilesRef.current.push(file)
      
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current)
      }
      
      batchTimerRef.current = setTimeout(() => {
        handleBatchUpload(batchFilesRef.current)
        batchFilesRef.current = []
      }, 300)
    }

    return Upload.LIST_IGNORE
  }

  // 单张上传
  const handleSingleUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch(`${API_BASE}/admin/upload/single`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token || ''}` },
      })
      
      const data = await res.json()
      const url = data.data?.url || ''
      onChange?.(url)
      message.success('上传成功')
    } catch (err) {
      message.error('上传失败')
      console.error('上传错误：', err)
    }
  }

  // 批量上传
  const handleBatchUpload = async (files: File[]) => {
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      
      const res = await fetch(`${API_BASE}/admin/upload/batch`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token || ''}` },
      })
      
      const data = await res.json()
      const newUrls: string[] = data.data || []
      
      const oldUrls = Array.isArray(valueRef.current) ? valueRef.current : []
      const finalUrls = [...oldUrls, ...newUrls].slice(0, maxCount)
      
      onChange?.(finalUrls)
      message.success(`成功上传 ${newUrls.length} 张图片`)
    } catch (err) {
      message.error('批量上传失败')
      console.error('批量上传错误：', err)
    }
  }

  // 调用后端删除接口
  const handleDeleteImage = async (rawUrl: string) => {
    if (!rawUrl) return false
    
    try {
      setDeletingUrl(rawUrl)
      await fetch(`${API_BASE}/image/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ url: rawUrl })
      })
      return true
    } catch (err) {
      message.error('删除图片失败')
      console.error('删除图片错误：', err)
      return false
    } finally {
      setDeletingUrl(null)
    }
  }

  // 删除图片
  const handleRemove = async (file: UploadFile) => {
    const rawUrl = file.url?.replace(`${STATIC_DOMAIN}/`, '') || ''
    
    const deleteSuccess = await handleDeleteImage(rawUrl)
    if (!deleteSuccess) return
    
    if (type === 'single') {
      onChange?.('')
    } else {
      // 使用最新的value引用过滤
      const currentUrls = Array.isArray(valueRef.current) ? valueRef.current : []
      const newUrls = currentUrls.filter(item => item !== rawUrl)
      // 明确传递空数组，强制状态同步
      onChange?.(newUrls)
    }
    
    message.success('删除成功')
  }

  // ✅ 修复：使用稳定的 uid，避免每次渲染都变化
  const getStableUid = (url: string, index: number) => {
    // 使用 url 本身作为 uid（因为 url 是唯一的）
    // 如果 url 为空，使用 index + 固定前缀
    return url || `img-${index}-stable`
  }

  // 渲染预览列表
  const fileList = Array.isArray(value)
    ? value.map((url, index) => ({
        uid: getStableUid(url, index), // ✅ 稳定的 uid
        url: getFullUrl(url),
        status: 'done' as const,
        closeIcon: deletingUrl === url ? <DeleteOutlined spin /> : <DeleteOutlined />
      }))
    : value
    ? [{
        uid: getStableUid(value, 0), // ✅ 稳定的 uid
        url: getFullUrl(value),
        status: 'done' as const,
        closeIcon: deletingUrl === value ? <DeleteOutlined spin /> : <DeleteOutlined />
      }]
    : []

  return (
    <Upload
      // ✅ 移除会导致整个组件重新渲染的 key
      fileList={fileList as any}
      beforeUpload={beforeUpload}
      onRemove={handleRemove}
      listType="picture-card"
      maxCount={maxCount}
      disabled={disabled || deletingUrl !== null}
      multiple={type === 'batch'}
      showUploadList={{
        showRemoveIcon: true,
        showPreviewIcon: true,
        showDownloadIcon: false
      }}
    >
      {fileList.length < maxCount && (
        <div>
          <PlusOutlined />
          <div className="mt-2">上传</div>
        </div>
      )}
    </Upload>
  )
})

// 添加显示名称，方便调试
UploadImage.displayName = 'UploadImage'

export default UploadImage