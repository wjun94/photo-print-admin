import request from '@/lib/axios'

// 获取二维码配置（新接口）
export const getQrcodeConfigApi = () => {
  return request('/admin/qrcodes', {
    method: 'GET'
  })
}

// 上传二维码（两个都必填）
export const uploadQRCodesApi = (formData: FormData) => {
  return request('/admin/qrcode/upload', {
    method: 'POST',
    data: formData
  })
}