export const getSmartNotificationLink = (url: string | null | undefined): string => {
  if (!url) return '#'

  // Remove domain part if exists
  let path = url
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url)
      path = urlObj.pathname + urlObj.search

      const baseUrl = import.meta.env.VITE_BASE_URL || ''
      if (baseUrl && path.startsWith(baseUrl)) {
        path = path.substring(baseUrl.length)
      }
    } catch (e) {
      console.error('Invalid URL:', url)
    }
  }

  const segments = path.split('/').filter(Boolean)
  const id = segments[segments.length - 1]

  // Rule 1: vanbandendonvi
  // Old link often contains 'vanbandendonvi'
  if (path.includes('vanbandendonvi') && id) {
    return `/vanbandendonvi/${id}`
  }

  // Fallback: return the path (relative) so it works on current domain
  return path.startsWith('/') ? path : `/${path}`
}

export const getAvatarUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path

  const apiUrl = import.meta.env.VITE_API_URL
  const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`
  const url = `${baseUrl}fileaccess/view_avatar?link=${encodeURIComponent(path)}`
  return url
}
export const getFileUrl = (path: string | null | undefined, fileName?: string): string | undefined => {
  if (!path) return undefined
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path

  const apiUrl = import.meta.env.VITE_API_URL
  const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`
  let url = `${baseUrl}fileaccess/view_file?link=${encodeURIComponent(path)}`
  if (fileName) {
    url += `&file_name=${encodeURIComponent(fileName)}`
  }
  return url
}
