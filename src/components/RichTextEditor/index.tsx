import { useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import type { IDomEditor, IEditorConfig } from '@wangeditor/editor'
import { useAuthStore } from '@/stores/authStore'
import { message } from 'antd'
import '@wangeditor/editor/dist/css/style.css'

interface Props {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  height?: number
  disabled?: boolean
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = '请输入内容',
  height = 400,
  disabled = false
}: Props) {
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const token = useAuthStore((state) => state.token)
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const STATIC_DOMAIN = import.meta.env.VITE_STATIC_BASE_URL

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder,
    readOnly: disabled,
    MENU_CONF: {
      // 图片上传配置（和UploadImage组件完全一致）
      uploadImage: {
        server: `${API_BASE}/admin/upload/single`,
        headers: {
          Authorization: `Bearer ${token || ''}`
        },
        fieldName: 'file',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxNumberOfFiles: 1,
        allowedFileTypes: ['image/*'],
        // 自定义上传结果处理
        customInsert(res: any, insertFn: (url: string, alt?: string, href?: string) => void) {
          if (res.code === 0 && res.data?.url) {
            const fullUrl = res.data.url.startsWith('http')
              ? res.data.url
              : `${STATIC_DOMAIN}/${res.data.url}`
            insertFn(fullUrl)
          } else {
            message.error('图片上传失败')
          }
        },
        // 上传失败回调
        onFailed(file: File, res: any) {
          message.error(`图片【${file.name}】上传失败：${res.message || '未知错误'}`)
        },
        // 上传错误回调
        onError(file: File, err: any) {
          message.error(`图片【${file.name}】上传错误：${err.message}`)
        }
      }
    }
  }

  // 编辑器内容变化
  const handleChange = (editor: IDomEditor) => {
    const html = editor.getHtml()
    onChange?.(html === '<p><br></p>' ? '' : html)
  }

  // 外部value变化时同步到编辑器
  useEffect(() => {
    if (editor && value !== editor.getHtml()) {
      editor.setHtml(value || '')
    }
  }, [editor, value])

  // 组件卸载时销毁编辑器
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy()
        setEditor(null)
      }
    }
  }, [editor])

  return (
    <div className="rich-text-editor border border-gray-200 rounded-md overflow-hidden">
      <Toolbar
        editor={editor}
        defaultConfig={{
          // 配置工具栏菜单
          toolbarKeys: [
            'headerSelect',
            '|',
            'bold', 'italic', 'underline', 'through',
            '|',
            'color', 'bgColor',
            '|',
            'fontSize',
            '|',
            'justifyLeft', 'justifyCenter', 'justifyRight',
            '|',
            'bulletedList', 'numberedList',
            '|',
            'insertImage', // 图片上传按钮
            'insertLink',
            '|',
            'undo', 'redo'
          ]
        }}
        mode="default"
      />
      <Editor
        defaultConfig={editorConfig}
        value={value}
        onCreated={setEditor}
        onChange={handleChange}
        mode="default"
        style={{ height: `${height}px`, overflowY: 'auto' }}
      />
    </div>
  )
}