import { Upload, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadProps, UploadFile } from 'antd'
import { useAuthStore } from '@/stores/authStore'
import { useRef, useState, useEffect } from 'react'

interface Props {
  value?: string[] | string
  onChange?: (urls: string[] | string) => void
  maxCount?: number
  type: 'single' | 'batch'
  disabled?: boolean
}

export default function UploadImage({
  value,
  onChange,
  maxCount = 9,
  type = 'single',
  disabled,
}: Props) {
  const token = useAuthStore((state) => state.token)
  const STATIC_DOMAIN = import.meta.env.VITE_STATIC_BASE_URL
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  
  // 批量上传文件收集器
  const batchFilesRef = useRef<File[]>([])
  // 批量上传定时器
  const batchTimerRef = useRef<any | null>(null)
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

  // ✅ 修复：删除最后一张图残留问题
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
      // ✅ 关键：即使是空数组也明确传递，强制Antd更新
      onChange?.(newUrls)
    }
    
    message.success('删除成功')
  }

  // 渲染预览列表
  const fileList = Array.isArray(value)
    ? value.map((url, index) => ({
        uid: `img-${index}-${Date.now()}`, // ✅ 修复：使用唯一uid，避免索引冲突
        url: getFullUrl(url),
        status: 'done' as const,
        closeIcon: deletingUrl === url ? <DeleteOutlined spin /> : <DeleteOutlined />
      }))
    : value
    ? [{
        uid: 'img-single',
        url: getFullUrl(value),
        status: 'done' as const,
        closeIcon: deletingUrl === value ? <DeleteOutlined spin /> : <DeleteOutlined />
      }]
    : []

  return (
    <Upload
      // ✅ 关键：使用fileList长度作为key，强制重新渲染
      key={`upload-${fileList.length}`}
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
}