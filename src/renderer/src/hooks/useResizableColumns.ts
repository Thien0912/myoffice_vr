import { useState, useCallback, useEffect, useRef } from 'react'

interface ColumnWidth {
  [key: string]: number
}

interface UseResizableColumnsProps {
  columns: Array<{ uid: string; name: string }>
  defaultWidth?: number
  minWidth?: number
  storageKey?: string
  initialWidths?: ColumnWidth // Custom initial widths per column
}

export function useResizableColumns({
  columns,
  defaultWidth = 150,
  minWidth = 80,
  storageKey,
  initialWidths = {}
}: UseResizableColumnsProps) {
  // Initialize column widths from localStorage or default
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved column widths', e)
        }
      }
    }

    // Initialize with default widths or custom initial widths
    const initial: ColumnWidth = {}
    columns.forEach((col) => {
      initial[col.uid] = initialWidths[col.uid] || defaultWidth
    })
    return initial
  })

  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)

  // Save to localStorage when widths change
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(columnWidths))
    }
  }, [columnWidths, storageKey])

  const handleMouseDown = useCallback(
    (columnUid: string, e: React.MouseEvent) => {
      e.preventDefault()
      setResizingColumn(columnUid)
      startXRef.current = e.clientX
      startWidthRef.current = columnWidths[columnUid] || defaultWidth
    },
    [columnWidths, defaultWidth]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingColumn) return

      const diff = e.clientX - startXRef.current
      const newWidth = Math.max(minWidth, startWidthRef.current + diff)

      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth
      }))
    },
    [resizingColumn, minWidth]
  )

  const handleMouseUp = useCallback(() => {
    setResizingColumn(null)
  }, [])

  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
    return undefined
  }, [resizingColumn, handleMouseMove, handleMouseUp])

  const resetWidths = useCallback(() => {
    const initial: ColumnWidth = {}
    columns.forEach((col) => {
      initial[col.uid] = initialWidths[col.uid] || defaultWidth
    })
    setColumnWidths(initial)
  }, [columns, defaultWidth, initialWidths])

  return {
    columnWidths,
    resizingColumn,
    handleMouseDown,
    resetWidths
  }
}
