import { useState, useCallback, useEffect, useRef } from 'react'
import React from 'react'

interface ResizableColumn {
  uid: string
  width?: number | string
  minWidth?: number
  [key: string]: any
}

export const useTableResizing = (
  columns: ResizableColumn[],
  defaultWidths: Record<string, number> = {},
  onWidthChange?: (uid: string, width: number) => void,
  containerRef?: React.RefObject<HTMLElement | null>
) => {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(defaultWidths)
  // Use ref instead of state for resizingUid — avoids full table re-render on resize start/end
  const resizingUidRef = useRef<string | null>(null)

  const resizingRef = useRef<{
    uid: string
    startX: number
    startWidth: number
    currentDiff: number
    baseLeft: number
  } | null>(null)

  const guideLineRef = useRef<HTMLDivElement | null>(null)

  // Sync external widths — shallow compare
  useEffect(() => {
    setColumnWidths((prev) => {
      const initialWidths: Record<string, number> = {}
      columns.forEach((col) => {
        if (col.width) {
          const w =
            typeof col.width === 'number' ? col.width : parseInt(String(col.width), 10) || 150
          initialWidths[col.uid] = w
        }
      })
      const merged = { ...initialWidths, ...defaultWidths }
      const allKeys = new Set([...Object.keys(prev), ...Object.keys(merged)])
      for (const k of allKeys) {
        if (prev[k] !== merged[k]) {
          return { ...prev, ...merged }
        }
      }
      return prev
    })
  }, [defaultWidths, columns])

  const onMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!resizingRef.current) return

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const { startX, startWidth, uid, baseLeft } = resizingRef.current

      const zoom = parseFloat(getComputedStyle(guideLineRef.current?.parentElement || document.body).zoom) || 1
      const diff = (clientX - startX) / zoom
      const col = columns.find((c) => c.uid === uid)
      const minWidth = col?.minWidth || 20
      const effectiveDiff = Math.max(diff, minWidth - startWidth)
      resizingRef.current.currentDiff = effectiveDiff

      if (guideLineRef.current) {
        guideLineRef.current.style.left = `${baseLeft + effectiveDiff}px`
      }
    },
    [columns]
  )

  const onMouseUp = useCallback(() => {
    if (resizingRef.current) {
      const { uid, startWidth, currentDiff } = resizingRef.current
      const finalWidth = startWidth + currentDiff

      // Single state update — the ONLY re-render during entire resize operation
      setColumnWidths((prev) => ({ ...prev, [uid]: finalWidth }))

      if (onWidthChange) {
        onWidthChange(uid, finalWidth)
      }
    }

    if (guideLineRef.current) {
      guideLineRef.current.classList.add('hidden', 'opacity-0')
      guideLineRef.current.classList.remove('opacity-100')
    }

    resizingRef.current = null
    resizingUidRef.current = null

    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchmove', onMouseMove)
    document.removeEventListener('touchend', onMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.body.classList.remove('table-resizing')
  }, [onMouseMove, onWidthChange])

  const onResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, uid: string, currentWidth: number) => {
      e.stopPropagation()

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX

      let baseLeft = 0;
      if (containerRef?.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const thEl = containerRef.current.querySelector(
          `th[data-col-uid="${uid}"]`
        ) as HTMLElement

        const zoom = parseFloat(getComputedStyle(containerRef.current).zoom) || 1

        if (thEl) {
          const colRect = thEl.getBoundingClientRect()
          baseLeft = (colRect.right - containerRect.left) / zoom + containerRef.current.scrollLeft
        } else {
          baseLeft = (clientX - containerRect.left) / zoom + containerRef.current.scrollLeft
        }
      }

      resizingRef.current = { uid, startX: clientX, startWidth: currentWidth, currentDiff: 0, baseLeft }
      resizingUidRef.current = uid

      if (guideLineRef.current) {
        guideLineRef.current.style.left = `${baseLeft}px`
        if (containerRef?.current) {
          guideLineRef.current.style.height = `${containerRef.current.scrollHeight}px`
        }
        guideLineRef.current.classList.remove('hidden', 'opacity-0')
        guideLineRef.current.classList.add('opacity-100')
      }

      if ('touches' in e) {
        document.addEventListener('touchmove', onMouseMove, { passive: false })
        document.addEventListener('touchend', onMouseUp)
      } else {
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.body.classList.add('table-resizing')
    },
    [containerRef, onMouseMove, onMouseUp]
  )

  return {
    columnWidths,
    onResizeStart,
    resizingUid: resizingUidRef.current, // Read from ref, no state re-render
    dragDiff: 0,
    guideLineRef
  }
}
