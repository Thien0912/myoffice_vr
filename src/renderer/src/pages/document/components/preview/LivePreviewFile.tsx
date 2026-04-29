import React, { useEffect, useState } from 'react'

export default function LivePreviewFile(): React.ReactNode {
  // Chuyển link view thành link preview
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    window.electron.ipcRenderer.on('window-data', (_, result) => {
      console.log('📦 Dữ liệu nhận:', result)
      setPreviewUrl(result.url)
    })
  }, [])

  if (!previewUrl) {
    return <div>Không có file để xem trước</div>
  }

  return (
    <div className="w-full h-full">
      <iframe
        src={previewUrl}
        style={{ border: 'none', width: '100vw', height: '100vh' }}
        allow="autoplay"
        title="Live Preview"
      />
    </div>
  )
}
