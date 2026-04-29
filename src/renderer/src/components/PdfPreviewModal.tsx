import { X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

interface PdfPreviewModalProps {
  url: string
  name: string
  onClose: () => void
}

const MIN_WIDTH = 400
const MIN_HEIGHT = 300

/**
 * Inline PDF preview modal with iframe + resizable from edges/corners.
 */
export function PdfPreviewModal({ url, name, onClose }: PdfPreviewModalProps) {
  const [size, setSize] = useState({ width: Math.min(window.innerWidth * 0.6, 900), height: window.innerHeight * 0.95 })
  const resizing = useRef<{ startX: number; startY: number; startW: number; startH: number; edge: string } | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const onMouseDown = useCallback((edge: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizing.current = { startX: e.clientX, startY: e.clientY, startW: size.width, startH: size.height, edge }

    // Disable iframe pointer events during resize
    if (iframeRef.current) iframeRef.current.style.pointerEvents = 'none'

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizing.current) return
      const { startX, startY, startW, startH, edge: e } = resizing.current
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY

      let newW = startW
      let newH = startH

      if (e.includes('e')) newW = Math.max(MIN_WIDTH, startW + dx * 2)
      if (e.includes('w')) newW = Math.max(MIN_WIDTH, startW - dx * 2)
      if (e.includes('s')) newH = Math.max(MIN_HEIGHT, startH + dy * 2)
      if (e.includes('n')) newH = Math.max(MIN_HEIGHT, startH - dy * 2)

      // Clamp to viewport
      newW = Math.min(newW, window.innerWidth - 32)
      newH = Math.min(newH, window.innerHeight - 32)

      setSize({ width: newW, height: newH })
    }

    const onMouseUp = () => {
      resizing.current = null
      if (iframeRef.current) iframeRef.current.style.pointerEvents = ''
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [size])

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="relative bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: size.width, height: size.height }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-default-100 border-b shrink-0">
          <span className="text-sm font-medium text-default-700 truncate">{name}</span>
          <button className="p-1 rounded-full hover:bg-default-200 transition-colors" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* PDF iframe */}
        <iframe ref={iframeRef} src={url} className="w-full flex-1" title={name} />

        {/* Resize handles */}
        {/* Right */}
        <div className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize hover:bg-blue-400/30 transition-colors" onMouseDown={onMouseDown('e')} />
        {/* Left */}
        <div className="absolute top-0 left-0 w-1.5 h-full cursor-ew-resize hover:bg-blue-400/30 transition-colors" onMouseDown={onMouseDown('w')} />
        {/* Bottom */}
        <div className="absolute bottom-0 left-0 h-1.5 w-full cursor-ns-resize hover:bg-blue-400/30 transition-colors" onMouseDown={onMouseDown('s')} />
        {/* Top */}
        <div className="absolute top-0 left-0 h-1.5 w-full cursor-ns-resize hover:bg-blue-400/30 transition-colors" onMouseDown={onMouseDown('n')} />
        {/* Corners */}
        <div className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize" onMouseDown={onMouseDown('se')} />
        <div className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize" onMouseDown={onMouseDown('sw')} />
        <div className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize" onMouseDown={onMouseDown('ne')} />
        <div className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize" onMouseDown={onMouseDown('nw')} />
      </div>
    </div>
  )
}

/**
 * Hook to manage PDF preview state.
 */
export function usePdfPreview() {
  const [pdfPreview, setPdfPreview] = useState<{ url: string; name: string; isBlob: boolean } | null>(null)

  const openPdfPreview = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    setPdfPreview({ url, name: file.name, isBlob: true })
  }, [])

  const openPdfPreviewUrl = useCallback((url: string, name: string) => {
    setPdfPreview({ url, name, isBlob: false })
  }, [])

  const closePdfPreview = useCallback(() => {
    if (pdfPreview?.isBlob) URL.revokeObjectURL(pdfPreview.url)
    setPdfPreview(null)
  }, [pdfPreview])

  const PdfModal = pdfPreview
    ? () => <PdfPreviewModal url={pdfPreview.url} name={pdfPreview.name} onClose={closePdfPreview} />
    : () => null

  return { pdfPreview, openPdfPreview, openPdfPreviewUrl, closePdfPreview, PdfModal } as const
}
