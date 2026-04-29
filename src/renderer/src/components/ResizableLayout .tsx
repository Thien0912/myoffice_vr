import { useRef, useState } from 'react'

export default function ResizableLayout(): React.JSX.Element {
  const [sidebarWidth, setSidebarWidth] = useState(250) // chiều rộng mặc định
  const isResizing = useRef(false)

  const handleMouseDown = () => {
    isResizing.current = true
    document.body.style.cursor = 'col-resize'
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return
    const newWidth = Math.min(Math.max(e.clientX, 150), 2000) // giới hạn từ 150–2000px
    setSidebarWidth(newWidth)
  }

  const handleMouseUp = () => {
    isResizing.current = false
    document.body.style.cursor = 'default'
  }

  // Lắng nghe sự kiện resize toàn trang
  useState(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="bg-gray-100 border-r border-gray-300" style={{ width: sidebarWidth }}>
        <div className="p-4 font-semibold">Sidebar</div>
        {/* Nội dung sidebar */}
      </div>

      {/* Thanh kéo chia cột */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400 active:bg-gray-500"
      ></div>

      {/* Main content */}
      <div className="flex-1 bg-white">
        <div className="p-4">Main Content</div>
      </div>
    </div>
  )
}
