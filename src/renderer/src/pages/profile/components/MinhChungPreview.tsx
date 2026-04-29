import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  RotateCw, ZoomIn, ZoomOut, FlipHorizontal, FlipVertical, RotateCcw,
  RefreshCw, Trash2, Loader2, Download, FileText, ChevronUp, ChevronDown, X
} from 'lucide-react'

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg']
const PDF_EXTS = ['pdf']
const TOOLBAR_ICON_SIZE = 16

/**
 * Resolve the actual displayable extension from a raw extension and/or file name.
 * Strips '.enc' suffix (encrypted files) and falls back to the name-based detection.
 */
export function resolveFileExt(rawExt: string | undefined | null, fileName?: string): string {
  let ext = (rawExt || '').toLowerCase().replace(/^\./, '')

  // Strip .enc → e.g. "pdf.enc" → "pdf", "enc" alone → check name
  if (ext === 'enc' || ext.endsWith('.enc')) {
    ext = ext.replace(/\.?enc$/, '')
  }

  // If still empty or was just 'enc', try from file name
  if (!ext && fileName) {
    const parts = fileName.replace(/\.enc$/i, '').split('.')
    ext = parts.length > 1 ? parts.pop()!.toLowerCase() : ''
  }

  return ext || '' // empty = unknown type, let the component try auto-detect
}

export interface PreviewFile {
  id: string | number
  file_name: string
  url: string
  file_extension: string
  categoryName: string
  categoryId: number | string
}

interface MinhChungPreviewProps {
  files: PreviewFile[]
  initialIndex: number | null
  onClose: () => void
  onDelete?: (id: string | number) => void
  onDownload?: (url: string, fileName: string) => void
  deletingId?: number | string | null
  readOnly?: boolean
}

export default function MinhChungPreview({
  files,
  initialIndex,
  onClose,
  onDelete,
  onDownload,
  deletingId,
  readOnly
}: MinhChungPreviewProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(initialIndex)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [flipX, setFlipX] = useState(false)
  const [flipY, setFlipY] = useState(false)
  const selectedThumbRef = useRef<HTMLButtonElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  // Track files where <img> failed to load → fallback to iframe
  const [imgFailedSet, setImgFailedSet] = useState<Set<string | number>>(new Set())

  // Sync initialIndex from parent
  useEffect(() => {
    setPreviewIndex(initialIndex)
    if (initialIndex !== null) {
      resetTransform()
      setImgFailedSet(new Set()) // reset fallback state
    }
  }, [initialIndex])

  // Auto-scroll selected thumbnail into view
  useEffect(() => {
    selectedThumbRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [previewIndex])

  const resetTransform = useCallback(() => {
    setRotation(0)
    setZoom(1)
    setFlipX(false)
    setFlipY(false)
    setPanX(0)
    setPanY(0)
  }, [])

  const closePreview = useCallback(() => {
    setPreviewIndex(null)
    resetTransform()
    onClose()
  }, [resetTransform, onClose])

  // Keyboard navigation
  useEffect(() => {
    if (previewIndex === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setPreviewIndex((p) => (p !== null && p > 0 ? p - 1 : p))
        resetTransform()
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setPreviewIndex((p) => (p !== null && p < files.length - 1 ? p + 1 : p))
        resetTransform()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewIndex, files.length, closePreview, resetTransform])

  if (previewIndex === null || files.length === 0) return null

  const safeIndex = Math.min(previewIndex, files.length - 1)
  const current = files[safeIndex]
  if (!current) return null

  const currentExt = resolveFileExt(current.file_extension, current.file_name)
  const isCurrentImage = IMAGE_EXTS.includes(currentExt)
  const isCurrentPdf = PDF_EXTS.includes(currentExt)
  const isUnknownType = !isCurrentImage && !isCurrentPdf
  const didImgFail = imgFailedSet.has(current.id)
  // For unknown types: try image first, unless it already failed
  const shouldRenderAsImage = isCurrentImage || (isUnknownType && !didImgFail)
  const shouldRenderAsPdf = isCurrentPdf || (isUnknownType && didImgFail)

  // Build grouped thumbnails
  const thumbGroups: { categoryName: string; categoryId: string | number; items: (PreviewFile & { globalIndex: number })[] }[] = []
  let lastCatId: string | number = ''
  files.forEach((ff, idx) => {
    if (ff.categoryId !== lastCatId) {
      thumbGroups.push({ categoryName: ff.categoryName, categoryId: ff.categoryId, items: [] })
      lastCatId = ff.categoryId
    }
    thumbGroups[thumbGroups.length - 1].items.push({ ...ff, globalIndex: idx })
  })

  const imageTransformStyle = {
    transform: `translate(${panX}px, ${panY}px) rotate(${rotation}deg) scale(${zoom * (flipX ? -1 : 1)}, ${zoom * (flipY ? -1 : 1)})`,
    transition: isDragging.current ? 'none' : 'transform 0.2s ease',
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((z) => Math.min(8, Math.max(0.1, z + delta)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY, panX, panY }
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    setPanX(dragStart.current.panX + (e.clientX - dragStart.current.x))
    setPanY(dragStart.current.panY + (e.clientY - dragStart.current.y))
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const navigateFile = (dir: 'prev' | 'next') => {
    const next = dir === 'next' ? safeIndex + 1 : safeIndex - 1
    if (next < 0 || next >= files.length) return
    setPreviewIndex(next)
    resetTransform()
  }

  const handleDefaultDownload = async (url: string, fileName: string) => {
    try {
      if (!url) return
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = fileName
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      // silent fail
    }
  }

  const downloadHandler = onDownload || handleDefaultDownload

  return createPortal(
    <div className="fixed inset-0 z-9999 flex flex-col bg-black/95" onClick={closePreview}>
      {/* Top header bar — FULL WIDTH */}
      <div className="shrink-0 flex items-center px-3 py-2 border-b border-white/10" style={{ backgroundColor: '#3a3a3a' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex-1" />
        <div className="flex items-center gap-2 max-w-[70%]">
          <span className="text-[10px] text-white/60 bg-white/10 px-2 py-0.5 rounded-full font-medium shrink-0">
            {current.categoryName}
          </span>
          <span className="text-sm text-white/80 truncate">{current.file_name}</span>
        </div>
        <div className="flex-1 flex justify-end">
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 text-white/60 hover:text-white transition-colors"
            title="Đóng"
            onClick={closePreview}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Middle row: preview + sidebar */}
      <div className="flex-1 flex min-h-0" onClick={(e) => e.stopPropagation()}>
        {/* Preview content */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden relative p-2"
          onWheel={shouldRenderAsImage ? handleWheel : undefined}
          onMouseDown={shouldRenderAsImage ? handleMouseDown : undefined}
          onMouseMove={shouldRenderAsImage ? handleMouseMove : undefined}
          onMouseUp={shouldRenderAsImage ? handleMouseUp : undefined}
          onMouseLeave={shouldRenderAsImage ? handleMouseUp : undefined}
          style={{ cursor: shouldRenderAsImage ? (isDragging.current ? 'grabbing' : 'grab') : undefined }}
        >
          {shouldRenderAsImage && current.url ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={current.url}
                alt={current.file_name}
                className="max-w-full max-h-full object-contain rounded-lg select-none"
                style={{ ...imageTransformStyle, imageRendering: '-webkit-optimize-contrast' as any }}
                draggable={false}
                onError={() => {
                  // Image failed to load → mark and fallback to iframe
                  setImgFailedSet(prev => new Set(prev).add(current.id))
                }}
              />
            </div>
          ) : shouldRenderAsPdf && current.url ? (
            <iframe
              src={current.url}
              className="w-full h-full rounded-lg border-0"
              title={current.file_name}
            />
          ) : current.url ? (
            <iframe
              src={current.url}
              className="w-full h-full rounded-lg border-0"
              title={current.file_name}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-default-400">
              <FileText size={48} />
              <span className="text-sm font-medium">{currentExt.toUpperCase() || 'FILE'}</span>
              <span className="text-xs">{current.file_name}</span>
            </div>
          )}
        </div>

        {/* Thumbnail Strip (right) + floating nav */}
        <div className="relative w-[90px] shrink-0 flex flex-col border-l border-white/10" style={{ backgroundColor: '#1e1e1e' }}>
          {/* Floating prev/next buttons */}
          <button
            type="button"
            className="absolute -left-5 top-[calc(50%-47px)] z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center transition-colors disabled:opacity-30 shadow-lg"
            onClick={() => navigateFile('prev')}
            disabled={safeIndex === 0}
          >
            <ChevronUp size={22} />
          </button>
          <button
            type="button"
            className="absolute -left-5 top-[calc(50%+7px)] z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center transition-colors disabled:opacity-30 shadow-lg"
            onClick={() => navigateFile('next')}
            disabled={safeIndex === files.length - 1}
          >
            <ChevronDown size={22} />
          </button>

          {/* Scrollable thumbnails */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-1.5 scrollbar-thin">
            {thumbGroups.map((group) => (
              <div key={String(group.categoryId)} className="mb-2">
                <div className="text-[9px] font-semibold text-white/40 uppercase text-center py-1 truncate" title={group.categoryName}>
                  {group.categoryName}
                </div>
                <div className="flex flex-col gap-1">
                  {group.items.map((ff) => {
                    const ext = resolveFileExt(ff.file_extension, ff.file_name)
                    const isImage = IMAGE_EXTS.includes(ext)
                    const isUnknown = !isImage && !PDF_EXTS.includes(ext)
                    const isSelected = ff.globalIndex === safeIndex

                    return (
                      <button
                        key={String(ff.id)}
                        ref={isSelected ? selectedThumbRef : undefined}
                        type="button"
                        onClick={() => { setPreviewIndex(ff.globalIndex); resetTransform() }}
                        className={`
                          relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-150
                          ${isSelected
                            ? 'border-blue-500 ring-1 ring-blue-500/30 shadow-md'
                            : 'border-transparent hover:border-default-300'
                          }
                        `}
                      >
                        {(isImage || isUnknown) && ff.url ? (
                          <>
                            <img
                              src={ff.url}
                              alt={ff.file_name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                // Hide broken image, show file icon instead
                                const target = e.currentTarget
                                target.style.display = 'none'
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                            {/* Hidden fallback shown on img error */}
                            <div className="w-full h-full bg-white/10 flex-col items-center justify-center gap-0.5" style={{ display: 'none' }}>
                              <FileText size={16} className="text-red-400" />
                              <span className="text-[8px] text-white/50 uppercase font-bold">{ext || 'file'}</span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-white/10 flex flex-col items-center justify-center gap-0.5">
                            <FileText size={16} className="text-red-400" />
                            <span className="text-[8px] text-white/50 uppercase font-bold">{ext || 'file'}</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom toolbar — FULL WIDTH */}
      <div className="shrink-0 flex items-center justify-center px-3 py-2 border-t border-white/10" style={{ backgroundColor: '#3a3a3a' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-0.5">
          {(shouldRenderAsImage) && (
            <>
              <ToolbarBtn title="Xoay trái" onClick={() => setRotation(r => r - 90)}>
                <RotateCcw size={TOOLBAR_ICON_SIZE} />
              </ToolbarBtn>
              <ToolbarBtn title="Xoay phải" onClick={() => setRotation(r => r + 90)}>
                <RotateCw size={TOOLBAR_ICON_SIZE} />
              </ToolbarBtn>
              <div className="w-px h-4 bg-white/20 mx-0.5" />
              <ToolbarBtn title="Lật ngang" onClick={() => setFlipX(f => !f)} active={flipX}>
                <FlipHorizontal size={TOOLBAR_ICON_SIZE} />
              </ToolbarBtn>
              <ToolbarBtn title="Lật dọc" onClick={() => setFlipY(f => !f)} active={flipY}>
                <FlipVertical size={TOOLBAR_ICON_SIZE} />
              </ToolbarBtn>
              <div className="w-px h-4 bg-white/20 mx-0.5" />
              <ToolbarBtn title="Thu nhỏ" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}>
                <ZoomOut size={TOOLBAR_ICON_SIZE} />
              </ToolbarBtn>
              <ToolbarBtn title="Phóng to" onClick={() => setZoom(z => Math.min(4, z + 0.25))}>
                <ZoomIn size={TOOLBAR_ICON_SIZE} />
              </ToolbarBtn>
              <div className="w-px h-4 bg-white/20 mx-0.5" />
              <ToolbarBtn title="Đặt lại" onClick={resetTransform}>
                <RefreshCw size={TOOLBAR_ICON_SIZE} />
              </ToolbarBtn>
            </>
          )}
          <div className="w-px h-4 bg-white/20 mx-0.5" />
          <ToolbarBtn title="Tải xuống" onClick={() => downloadHandler(current.url, current.file_name)}>
            <Download size={TOOLBAR_ICON_SIZE} />
          </ToolbarBtn>
          {onDelete && !readOnly && (
            <ToolbarBtn
              title="Xóa"
              onClick={() => onDelete(current.id)}
              variant="danger"
            >
              {deletingId === current.id ? (
                <Loader2 size={TOOLBAR_ICON_SIZE} className="animate-spin" />
              ) : (
                <Trash2 size={TOOLBAR_ICON_SIZE} />
              )}
            </ToolbarBtn>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

function ToolbarBtn({
  children,
  title,
  onClick,
  active,
  variant = 'default'
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  active?: boolean
  variant?: 'default' | 'danger'
}) {
  const base = 'w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer'
  const variants = {
    default: `hover:bg-white/20 text-white/60 hover:text-white ${active ? 'bg-white/20 text-white' : ''}`,
    danger: 'hover:bg-red-500/30 text-red-400 hover:text-red-300',
  }
  return (
    <button type="button" className={`${base} ${variants[variant]}`} title={title} onClick={onClick}>
      {children}
    </button>
  )
}
