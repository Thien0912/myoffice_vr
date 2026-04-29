import { useAuthStore } from '@renderer/store/useAuthStore'
import { callApi } from '@renderer/api/callApi'

const { user } = useAuthStore.getState()
const API_URL = import.meta.env.VITE_API_URL || ''

// Ghép URL gốc + user info + tên file
export function mapUrlPreviewDocument(url: string, name: string): string {
  const userId = Number(user?.ql_nguoi_dung_id ?? 0)
  const file_name = encodeURIComponent(name || 'document')
  return `${url}?user_id=${userId}&user_seen=${userId}&file_name=${file_name}`
}

// Mã hoá link trước khi gửi lên server
export async function enscrypt(url: string, name: string): Promise<string | null> {
  try {
    const response = await callApi('common/keys/getEnscryptedKey', {
      method: 'POST',
      data: { key: mapUrlPreviewDocument(url, name) }
    })
    return response.encryptedKey ?? null
  } catch (error) {
    console.error('❌ Failed to get encrypted link:', error)
    return null
  }
}

// Xem file trực tiếp
export const preview = (key: string) => {
  return `${API_URL}fileaccess/view/${key}`
}

// Tải file về — chỉ cần truyền key, hàm lo toàn bộ
export const download1 = async (key: string) => {
  return console.log('first: ', API_URL + `fileaccess/forcedownloadfile/${key}`)
  try {
    const res = await callApi(`fileaccess/forcedownloadfile/${key}`)

    if (!res.success) {
      // File không tồn tại hoặc lỗi server
      alert('File không tồn tại hoặc không thể tải về')
      return
    }

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '') // tên mặc định, có thể lấy từ header nếu muốn
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    alert('Có lỗi xảy ra khi tải file')
  }
}

export const download = (key: string, name?: string) => {
  const baseUrl = API_URL.endsWith('/') ? API_URL : `${API_URL}/`
  let fullUrl = `${baseUrl}fileaccess/force_download?link=${encodeURIComponent(key)}`

  if (name) {
    fullUrl += `&file_name=${encodeURIComponent(name)}`
  }

  const link = document.createElement('a')
  link.href = fullUrl
  link.setAttribute('download', name || '')
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
