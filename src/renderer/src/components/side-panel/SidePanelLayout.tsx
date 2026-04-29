import { Button } from '@heroui/react'
import { GripVertical, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useSidePanel } from './SidePanelContext'
import { toast } from "@heroui-v3/react";
import { HrPrimaryButton, HrCancelButton } from '@renderer/components/hero-custom'

const PANEL_MIN_WIDTH = 380
const PANEL_MAX_RATIO = 0.55
const MAIN_MIN_WIDTH = 400
// Threshold: below this, panel switches to overlay mode
const OVERLAY_THRESHOLD = MAIN_MIN_WIDTH + PANEL_MIN_WIDTH // 780px

interface SidePanelLayoutProps {
  children: ReactNode
}

export function SidePanelLayout({ children }: SidePanelLayoutProps) {
  const { isOpen, config, closePanel, panelWidth, setPanelWidth, setIsOverlay, bridgedToDrawer, formDataRef, fileGroupsRef } = useSidePanel()
  const resizing = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef(panelWidth)
  const [containerWidth, setContainerWidth] = useState(9999)

  const isOverlayMode = containerWidth < OVERLAY_THRESHOLD

  // Sync overlay state to context so SidePanelBridge can read it
  useEffect(() => {
    setIsOverlay(isOverlayMode && isOpen)
  }, [isOverlayMode, isOpen, setIsOverlay])

  // Keep ref in sync with state
  useEffect(() => {
    widthRef.current = panelWidth
  }, [panelWidth])

  const startResize = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isOverlayMode) return // No resize in overlay mode
    e.preventDefault()
    resizing.current = true
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }, [isOverlayMode])

  const stopResize = useCallback(() => {
    if (resizing.current) {
      resizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      // Commit final width to React state
      setPanelWidth(widthRef.current)
    }
  }, [setPanelWidth])

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!resizing.current || !containerRef.current || !panelRef.current) return
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const containerRect = containerRef.current.getBoundingClientRect()
      const cWidth = containerRect.width
      const newPanelWidth = containerRect.right - clientX

      if (
        newPanelWidth >= PANEL_MIN_WIDTH &&
        newPanelWidth <= cWidth * PANEL_MAX_RATIO &&
        cWidth - newPanelWidth >= MAIN_MIN_WIDTH
      ) {
        widthRef.current = newPanelWidth
        // Direct DOM update — no React re-render
        panelRef.current.style.width = `${newPanelWidth}px`
      }
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', stopResize)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('touchend', stopResize)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', stopResize)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', stopResize)
    }
  }, [stopResize])

  // Track container width + auto-adjust panel width in side-by-side mode
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cWidth = entry.contentRect.width
        if (cWidth <= 0) return

        setContainerWidth(cWidth)

        // Only clamp panel width in side-by-side mode
        if (isOpen && cWidth >= OVERLAY_THRESHOLD) {
          setPanelWidth((prev) => {
            const maxAllowed = cWidth * PANEL_MAX_RATIO
            const maxByMain = cWidth - MAIN_MIN_WIDTH
            const clampedMax = Math.min(maxAllowed, maxByMain)
            if (clampedMax < PANEL_MIN_WIDTH) return prev // Don't clamp below minimum
            return Math.min(prev, clampedMax)
          })
        }
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [isOpen, setPanelWidth])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!config?.onSubmit) return

    const form = e.currentTarget
    const fd = new FormData(form)

    Object.entries(formDataRef.current).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Use duck-typing instead of instanceof File — cross-context (Electron) may fail instanceof
        const isFileOrBlob = (typeof Blob !== 'undefined' && value instanceof Blob) ||
          (value && typeof value === 'object' && typeof value.name === 'string' && typeof value.arrayBuffer === 'function')
        if (isFileOrBlob) {
          // Append File/Blob as binary — JSON.stringify(File) === '{}' which loses the data
          fd.append(key, value)
        } else if (Array.isArray(value) || typeof value === 'object') {
          fd.append(key, JSON.stringify(value))
        } else {
          fd.append(key, String(value))
        }
      }
    })

    Object.entries(fileGroupsRef.current).forEach(([fieldName, files]) => {
      files.forEach((f) => fd.append(fieldName, f))
    })

    try {
      const response = await config.onSubmit(config.idSubmitApi, fd)
      if (response.success) {
        closePanel()
        config.onSubmitSuccess?.(response)
      } else {
        const errorMessage = Object.values(response.error).flat().join(',')
        toast('Lỗi', { description: errorMessage || 'Gửi dữ liệu thất bại.', variant: 'danger', timeout: 5000 })
      }
    } catch {
      toast('Lỗi', { description: 'Gửi dữ liệu thất bại. Lỗi ngoại lệ.', variant: 'danger' })
    }
  }

  const handleDoubleClick = useCallback(() => {
    closePanel()
  }, [closePanel])

  // Resolved panel width for overlay: fill container, capped at PANEL_MIN_WIDTH
  const overlayPanelWidth = Math.min(panelWidth, containerWidth, 480)

  return (
    <div
      ref={containerRef}
      className="relative flex h-full overflow-hidden"
    >
      {/* Main Content — always full width */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {children}
      </div>

      {/* Side Panel — skip when bridged to HrDrawer secondary */}
      {isOpen && config && !bridgedToDrawer && (
        <>
          {/* Overlay backdrop — visual only, doesn't block clicks on main content */}
          {/* {isOverlayMode && (
            <div
              className="absolute inset-0 bg-black/20 z-30 pointer-events-none transition-opacity duration-200"
            />
          )} */}

          <div
            ref={panelRef}
            className={
              isOverlayMode
                ? 'absolute right-0 top-0 bottom-0 z-40 shadow-2xl'
                : 'relative shrink-0 h-full'
            }
            style={{ width: isOverlayMode ? overlayPanelWidth : panelWidth }}
          >
            {/* Resize Handle — only in side-by-side mode */}
            {!isOverlayMode && (
              <div
                onMouseDown={startResize}
                onTouchStart={startResize}
                onDoubleClick={handleDoubleClick}
                className="absolute -left-3 top-0 bottom-0 w-6 flex items-center justify-center cursor-ew-resize z-20"
                title="Kéo để resize • Nhấn đúp để đóng"
              >
                {/* Full-height gray bar */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[4px] bg-gray-200 rounded-full" />
                {/* Blue circle with icon */}
                <div className="relative w-7 h-7 rounded-full bg-blue-500 shadow-md flex items-center justify-center text-white hover:bg-blue-600 active:bg-blue-700 transition-colors duration-150">
                  <GripVertical size={14} />
                </div>
              </div>
            )}

            {/* Panel Content */}
            <div className="bg-white flex flex-col shadow-lg h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
                <span className="font-semibold text-base text-gray-800 truncate">{config.title}</span>
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  size="sm"
                  className="hover:bg-gray-100 text-gray-500"
                  onPress={closePanel}
                >
                  <X size={18} />
                </Button>
              </div>

              {/* Content + Footer wrapped in a single form so FormData captures inputs */}
              {config.onSubmit ? (
                <form onSubmit={handleSubmit} encType="multipart/form-data" autoComplete="off" className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto px-4 py-3">
                    {config.content}
                  </div>
                  <div className="p-3 flex items-center justify-end gap-2 border-t border-gray-100 shrink-0">
                    <HrCancelButton onPress={closePanel}>Hủy</HrCancelButton>
                    <HrPrimaryButton type="submit">Lưu</HrPrimaryButton>
                  </div>
                </form>
              ) : (
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  {config.content}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
