import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { Checkbox, Skeleton, cn } from '@heroui/react'
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Check,
  Copy,
  EllipsisVertical,
  GripVertical,
  Inbox,
  Pencil
} from 'lucide-react'
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DateInputFloatingLabel from '../DateInputFloatingLabel'
import { SelectDropdown } from '../SelectDropdown'
import { SortableTH } from './SortableTH'
import { TablePinningMenu, TablePinningMenuItem, useTablePinning } from './TablePinning'
import { useTableResizing } from './TableResizing'
import { useTableSorting } from './TableSorting'
import TableStickyScrollbar from './TableStickyScrollbar'
import { TableColumnType } from './TableTypes'

interface TableHrProps<T = any> {
  columns: TableColumnType<T>[]
  data: T[]
  isLoading?: boolean
  primaryKey?: string
  onRowChange?: (id: string | number, columnUid: string, value: any) => void
  selectedKeys?: any
  disabledKeys?: any
  onSelectionChange?: (keys: any) => void
  columnWidths?: Record<string, number>
  onColumnResize?: (uid: string, width: number) => void
  onRowContextMenu?: (e: React.MouseEvent, row: T) => void
  onRowClick?: (row: T) => void
  contextMenuRowId?: string | number | null
  onPinColumn?: ((uid: string, pin: 'left' | 'right' | undefined) => void) | boolean
  headerMenuItems?: TablePinningMenuItem[] | ((uid: string) => TablePinningMenuItem[])
  enableStickyScrollbar?: boolean
  borderColor?: string
  editable?: boolean
  sortDescriptor?: { column: string; direction: 'ascending' | 'descending' }
  sortDescriptors?: { column: string; direction: 'ascending' | 'descending' }[]
  onSortChange?: (descriptors: { column: string; direction: 'ascending' | 'descending' }[]) => void
  onRowDoubleClick?: (row: T) => void
  selectedColor?: string
  enableSorting?: boolean
  enablePinning?: boolean
  enableResizing?: boolean
  pinnedColumns?: Record<string, 'left' | 'right' | undefined>
  activeRowId?: string | number | null
  showVerticalBorders?: boolean
  enableCopy?: boolean
  className?: string
  /** Enable drag-to-reorder columns */
  enableColumnReorder?: boolean
  columnOrder?: string[]
  onColumnOrderChange?: (columnOrder: string[]) => void
  renderRowFloatingAction?: (row: T) => React.ReactNode
  selectionMode?: 'none' | 'single' | 'multiple'
}

const flattenOptions = (options: any[]) => {
  const result: any[] = []
  options.forEach((opt) => {
    if (opt.options && Array.isArray(opt.options)) result.push(...opt.options)
    else result.push(opt)
  })
  return result
}

// ─────────────────────────────────────────────────────────────
// Cell Component
// ─────────────────────────────────────────────────────────────
const TableHrCell = memo(
  ({
    row,
    col,
    index,
    primaryKey,
    onRowChange,
    toggleRow,
    width,
    onResizeStart,
    editable,
    enableResizing,
    isEditing,
    onEdit,
    isRowSelected,
    isRowDisabled,
    enableCopy,
    hasSelection,
    isLastColumn
  }: {
    row: any
    col: TableColumnType<any>
    index: number
    primaryKey: string
    isRowSelected: boolean
    isRowDisabled: boolean
    onRowChange?: (id: string | number, columnUid: string, value: any) => void
    toggleRow: (id: string) => void
    width: number | string
    onResizeStart: (e: React.MouseEvent | React.TouchEvent, uid: string, width: number) => void
    editable?: boolean
    enableResizing?: boolean
    isEditing: boolean
    onEdit: (rowId: string | number, colUid: string, editing: boolean) => void
    enableCopy?: boolean
    hasSelection?: boolean
    isLastColumn?: boolean
  }) => {
    const val = row[col.uid]
    const rowId = (row[primaryKey] ?? index) as string | number
    const [inputValue, setInputValue] = useState('')
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
      if (isEditing) setInputValue(val ? String(val) : '')
    }, [isEditing, val])

    const onBlur = useCallback(() => {
      onEdit(rowId, col.uid, false)
    }, [onEdit, rowId, col.uid])

    const handleCopy = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(String(val ?? '')).then(() => {
          setIsCopied(true)
          setTimeout(() => setIsCopied(false), 2000)
        })
      },
      [val]
    )

    let content: React.ReactNode

    if (col.uid === 'stt') {
      const isSelectable = hasSelection && !isRowDisabled

      if (isSelectable) {
        content = (
          <div className="relative flex items-center justify-center w-full h-full min-h-8 z-20">
            <Checkbox
              isSelected={isRowSelected}
              onValueChange={() => toggleRow(String(rowId))}
              size="sm"
              className="m-0 p-0"
              classNames={{ wrapper: 'm-0 before:!border-black' }}
              aria-label="Select row"
            />
          </div>
        )
      } else {
        content = (
          <div className="relative flex items-center justify-center w-full h-full min-h-8">
            {col.render ? (
              col.render(val, row, index)
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {index + 1}
              </span>
            )}
          </div>
        )
      }
    } else {
      const isCellEditable = editable && col.editable !== false

      if (isCellEditable && isEditing) {
        if (col.type === 'select' && col.options) {
          const isMultiple = col.multiple
          content = (
            <SelectDropdown
              label=""
              multiple={isMultiple}
              options={col.options.map((opt) => ({ ...opt, value: String(opt.value) }))}
              value={
                isMultiple
                  ? val ? String(val).split(',').filter(Boolean) : []
                  : val ? String(val) : ''
              }
              onChange={(value) => {
                onRowChange?.(rowId, col.uid, Array.isArray(value) ? value.join(',') : value)
                if (!isMultiple) onEdit(rowId, col.uid, false)
              }}
              onBlur={onBlur}
              className="h-full w-full"
              size="md"
              radius="none"
              placeholder=""
            />
          )
        } else if ((col.type as any) === 'date') {
          content = (
            <DateInputFloatingLabel
              aria-label={col.name}
              size="sm"
              radius="none"
              value={String(val || '')}
              onChange={(dateStr) => {
                onRowChange?.(rowId, col.uid, dateStr)
                onEdit(rowId, col.uid, false)
              }}
              onBlur={onBlur}
              className="bg-white dark:bg-gray-900 min-h-10 h-full w-full"
              autoFocus
            />
          )
        } else {
          content = (
            <div className="absolute top-0 left-0 z-[1001] p-0 m-0 bg-white dark:bg-gray-900 shadow-2xl border-2 border-blue-500 rounded-md min-w-full w-fit h-fit overflow-hidden">
              <textarea
                className="w-full min-w-[200px] min-h-[120px] p-3 bg-transparent border-none outline-none text-sm resize overflow-auto leading-relaxed text-gray-700 dark:text-gray-200"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={() => {
                  if (inputValue !== val) onRowChange?.(rowId, col.uid, inputValue)
                  onEdit(rowId, col.uid, false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    if (inputValue !== val) onRowChange?.(rowId, col.uid, inputValue)
                    onEdit(rowId, col.uid, false)
                  } else if (e.key === 'Escape') {
                    onEdit(rowId, col.uid, false)
                  }
                }}
                autoFocus
              />
            </div>
          )
        }
      } else {
        // Display mode
        let displayContent: React.ReactNode = val

        if (col.render) {
          displayContent = col.render(val, row, index)
        } else if (col.renderDisplay) {
          displayContent = col.renderDisplay(val, row, index)
        } else if (col.type === 'select' && col.options) {
          const flatOptions = flattenOptions(col.options)
          if (col.multiple) {
            if (!val) {
              displayContent = ''
            } else {
              const keys = String(val).split(',').filter(Boolean)
              displayContent = keys
                .map((k) => flatOptions.find((o) => String(o.value) === String(k))?.label ?? k)
                .join(', ')
            }
          } else {
            const selectedOption = flatOptions.find((opt) => String(opt.value) === String(val))
            displayContent = selectedOption ? selectedOption.label : val
          }
        } else if ((col.type as any) === 'date' && val) {
          try {
            const date = new Date(String(val))
            if (!isNaN(date.getTime())) {
              displayContent = new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).format(date)
            }
          } catch {
            // keep original
          }
        }

        content = (
          <div
            className={cn('w-full h-full flex items-center px-5 py-1 min-h-10 group/edit relative min-w-0', isCellEditable && 'cursor-pointer', col.className)}
            onClick={
              isCellEditable
                ? (e) => {
                  if (e.detail > 1) return
                  e.stopPropagation()
                  onEdit(rowId, col.uid, true)
                }
                : undefined
            }
          >
            <div
              className={cn(
                'text-sm w-full text-gray-700 dark:text-gray-200',
                typeof displayContent === 'string' || typeof displayContent === 'number'
                  ? 'truncate'
                  : ''
              )}
              title={typeof displayContent === 'string' ? displayContent : undefined}
            >
              {displayContent}
            </div>
            <div className="absolute right-1 flex items-center gap-1 opacity-0 group-hover/edit:opacity-100 transition-opacity">
              {isCellEditable && (
                <div className="pointer-events-none">
                  <Pencil size={12} className="text-blue-500" />
                </div>
              )}
              {enableCopy && col.uid !== 'stt' && col.uid !== 'index' && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                  title="Copy"
                >
                  {isCopied ? (
                    <Check size={12} className="text-green-500" />
                  ) : (
                    <Copy size={12} className="text-gray-400 hover:text-blue-500" />
                  )}
                </button>
              )}
            </div>
          </div>
        )
      }
    }

    return (
      <div className="relative w-full h-full min-h-12 flex items-center group/cell min-w-0">
        {isEditing && (
          <div className="absolute -inset-px pointer-events-none border-2 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)] z-50" />
        )}
        <div
          className={`w-full h-full flex items-center min-w-0 ${isEditing ? 'absolute inset-0 z-[105] bg-white dark:bg-gray-900 px-0! overflow-visible!' : (col.uid === 'stt' ? 'overflow-visible' : 'overflow-hidden')}`}
        >
          {content}
        </div>
        {enableResizing && !isLastColumn && col.uid !== 'stt' && col.uid !== 'selection' && (
          <div
            className="absolute -right-2 top-0 h-full w-4 cursor-col-resize z-20 flex justify-center touch-none"
            onMouseDown={(e) => {
              const currentWidth =
                typeof width === 'number' ? width : e.currentTarget.closest('td')?.offsetWidth || 20
              onResizeStart(e, col.uid, currentWidth)
            }}
            onTouchStart={(e) => {
              const currentWidth =
                typeof width === 'number' ? width : e.currentTarget.closest('td')?.offsetWidth || 20
              onResizeStart(e, col.uid, currentWidth)
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-1 h-full bg-blue-500 opacity-0 group-hover/cell:opacity-100 transition-opacity [.table-resizing_&]:!opacity-0" />
          </div>
        )}
      </div>
    )
  }
)
TableHrCell.displayName = 'TableHrCell'

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function TableHr<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  primaryKey = 'id',
  onRowChange,
  selectedKeys,
  disabledKeys,
  onSelectionChange,
  columnWidths: externalColumnWidths,
  onColumnResize,
  onRowContextMenu,
  onRowClick,
  onRowDoubleClick,
  contextMenuRowId,
  onPinColumn,
  headerMenuItems,
  enableStickyScrollbar = false,
  borderColor = 'border-gray-200 dark:border-gray-700',
  editable = false,
  sortDescriptor,
  sortDescriptors,
  onSortChange: externalOnSortChange,
  selectedColor = '',
  enableSorting = true,
  enablePinning = true,
  enableResizing = true,
  pinnedColumns,
  activeRowId,
  showVerticalBorders = true,
  enableCopy = false,
  className,
  enableColumnReorder = true,
  columnOrder: externalColumnOrder,
  onColumnOrderChange,
  renderRowFloatingAction,
  selectionMode = 'multiple'
}: TableHrProps<T>) {
  // ── Internal state ──
  const [internalWidths, setInternalWidths] = useState<Record<string, number>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [localPinnedColumns, setLocalPinnedColumns] = useState<Record<string, 'left' | 'right' | undefined>>({})
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ rowId: string | number; colUid: string } | null>(null)
  const [hoveredRowKey, setHoveredRowKey] = useState<string | null>(null)
  const [hoveredRowData, setHoveredRowData] = useState<T | null>(null)
  const [floatingActionPos, setFloatingActionPos] = useState<{ top: number; left: number; height: number } | null>(null)

  // ── Drag-to-reorder state ──
  const [internalColumnOrder, setInternalColumnOrder] = useState<string[]>(() => columns.map((c) => c.uid))
  const [activeDragUid, setActiveDragUid] = useState<string | null>(null)

  const columnOrder = externalColumnOrder || internalColumnOrder
  const setColumnOrder = useCallback((orderOrUpdater: React.SetStateAction<string[]>) => {
    if (typeof orderOrUpdater === 'function') {
      const next = (orderOrUpdater as (prev: string[]) => string[])(columnOrder)
      if (!externalColumnOrder) setInternalColumnOrder(next)
      onColumnOrderChange?.(next)
    } else {
      if (!externalColumnOrder) setInternalColumnOrder(orderOrUpdater)
      onColumnOrderChange?.(orderOrUpdater)
    }
  }, [columnOrder, externalColumnOrder, onColumnOrderChange])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStartKit = useCallback((event: any) => {
    setActiveDragUid(event.active.id as string)
  }, [])

  const handleDragEndKit = useCallback((event: any) => {
    setActiveDragUid(null)
    const { active, over } = event
    if (over && active.id !== over.id) {
      const getPinStatus = (uid: string) => {
        let p = columns.find((c) => c.uid === uid)?.pinned
        if (pinnedColumns && uid in pinnedColumns) {
          const v = pinnedColumns[uid]
          p = (v as any) === 'none' ? undefined : (v as any)
        } else if (uid in localPinnedColumns) {
          const v = localPinnedColumns[uid]
          p = (v as any) === 'none' ? undefined : (v as any)
        }
        return p
      }

      if (getPinStatus(active.id as string) === getPinStatus(over.id as string)) {
        setColumnOrder((items) => {
          const oldIndex = items.indexOf(active.id as string)
          const newIndex = items.indexOf(over.id as string)
          return arrayMove(items, oldIndex, newIndex)
        })
      }
    }
  }, [columns, pinnedColumns, localPinnedColumns])

  // Keep internal columnOrder in sync when columns prop changes (new columns added/removed)
  // Only run when NOT controlled externally to avoid overwriting drag results
  useEffect(() => {
    if (externalColumnOrder) return
    setInternalColumnOrder((prev) => {
      const prevSet = new Set(prev)
      const newIds = columns.map((c) => c.uid)
      const removed = prev.filter((id) => newIds.includes(id))
      const added = newIds.filter((id) => !prevSet.has(id))
      return [...removed, ...added]
    })
  }, [columns, externalColumnOrder])

  // ── Column widths ──
  const effectiveColumnWidths = useMemo(
    () => ({ ...internalWidths, ...externalColumnWidths }),
    [internalWidths, externalColumnWidths]
  )

  const handleResize = useCallback(
    (uid: string, width: number) => {
      setInternalWidths((prev) => ({ ...prev, [uid]: width }))
      onColumnResize?.(uid, width)
    },
    [onColumnResize]
  )

  // ── Edit cell ──
  const handleEditCell = useCallback((rowId: string | number, colUid: string, editing: boolean) => {
    if (editing) {
      setEditingCell({ rowId, colUid })
    } else {
      setEditingCell((prev) => (prev?.rowId === rowId && prev?.colUid === colUid ? null : prev))
    }
  }, [])

  // ── Mobile detection ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const canResize = enableResizing && !isMobile

  // ── Active row ──
  useEffect(() => {
    setFocusedRowId(activeRowId ? String(activeRowId) : null)
  }, [activeRowId])

  // ── Pinning ──
  const { menuState, openMenu, closeMenu } = useTablePinning()

  const handleLocalPin = (uid: string, pin: 'left' | 'right' | undefined) => {
    const normalized = (pin as any) === 'none' ? undefined : pin
    setLocalPinnedColumns((prev) => ({ ...prev, [uid]: normalized }))
  }

  const effectiveOnPinColumn =
    typeof onPinColumn === 'function'
      ? onPinColumn
      : (onPinColumn ?? enablePinning)
        ? handleLocalPin
        : undefined

  // ── Process columns with pinning + ordering ──
  const processedColumns = useMemo(() => {
    return columns.map((col) => {
      let pinned = col.pinned
      if (pinnedColumns && col.uid in pinnedColumns) {
        const p = pinnedColumns[col.uid]
        pinned = (p as any) === 'none' ? undefined : p
      } else if (col.uid in localPinnedColumns) {
        const p = localPinnedColumns[col.uid]
        pinned = (p as any) === 'none' ? undefined : p
      }
      return { ...col, pinned: isMobile ? undefined : pinned }
    })
  }, [columns, isMobile, localPinnedColumns, pinnedColumns])

  // Apply column order, then sort by pinning
  const sortedColumns = useMemo(() => {
    const colMap = new Map(processedColumns.map((c) => [c.uid, c]))
    const ordered = (columnOrder || processedColumns.map((c) => c.uid))
      .map((uid) => colMap.get(uid))
      .filter(Boolean) as typeof processedColumns

    const left = ordered.filter((c) => c.pinned === 'left')
    const right = ordered.filter((c) => c.pinned === 'right')
    const center = ordered.filter((c) => c.pinned !== 'left' && c.pinned !== 'right')
    return [...left, ...center, ...right]
  }, [processedColumns, columnOrder])

  // ── Sorting ──
  const {
    sortDescriptors: internalSortDescriptors,
    onSortChange: internalOnSortChange,
    sortedData: internalSortedData
  } = useTableSorting(data, sortedColumns)

  const effectiveSortDescriptors =
    sortDescriptors || (sortDescriptor ? [sortDescriptor] : internalSortDescriptors)
  const effectiveOnSortChange = externalOnSortChange || internalOnSortChange
  const effectiveData = sortDescriptors || sortDescriptor ? data : internalSortedData

  // ── Scroll ref ──
  const scrollRef = useRef<HTMLDivElement>(null)

  // Detect container zoom (e.g. DanhmucPage uses zoom: 0.90)
  const [containerZoom, setContainerZoom] = useState(1)
  useEffect(() => {
    if (scrollRef.current) {
      let el: HTMLElement | null = scrollRef.current
      while (el) {
        const zoom = parseFloat(getComputedStyle(el).zoom)
        if (zoom && zoom !== 1) {
          setContainerZoom(zoom)
          break
        }
        el = el.parentElement
      }
    }
  }, [])

  // ── Resizing ──
  const { columnWidths, onResizeStart, guideLineRef } = useTableResizing(
    sortedColumns,
    effectiveColumnWidths,
    handleResize,
    scrollRef
  )

  // ── Selection helpers ──
  const selectableCount = useMemo(() => {
    if (!data || data.length === 0) return 0
    if (!(disabledKeys instanceof Set) || disabledKeys.size === 0) return data.length
    return data.filter((item) => !disabledKeys.has(String(item[primaryKey]))).length
  }, [data, disabledKeys, primaryKey])

  const isAllSelected = useMemo(() => {
    if (selectableCount === 0) return false
    if (selectedKeys === 'all') return true
    if (selectedKeys instanceof Set) return selectedKeys.size >= selectableCount
    return false
  }, [selectableCount, selectedKeys])

  const isIndeterminate = useMemo(() => {
    if (selectableCount === 0) return false
    if (selectedKeys === 'all') return false
    if (selectedKeys instanceof Set) return selectedKeys.size > 0 && selectedKeys.size < selectableCount
    return false
  }, [selectableCount, selectedKeys])

  const onToggleAll = useCallback(() => {
    if (!onSelectionChange) return
    if (isAllSelected) {
      onSelectionChange(new Set())
    } else {
      const disabledSet = disabledKeys instanceof Set ? disabledKeys : new Set()
      onSelectionChange(
        new Set(data.map((item) => String(item[primaryKey])).filter((id) => !disabledSet.has(id)))
      )
    }
  }, [onSelectionChange, isAllSelected, disabledKeys, data, primaryKey])

  const toggleRow = useCallback(
    (id: string) => {
      if (!onSelectionChange || selectionMode === 'none') return
      if (disabledKeys instanceof Set && disabledKeys.has(id)) return

      if (selectionMode === 'single') {
        const isCurrentlySelected = selectedKeys instanceof Set ? selectedKeys.has(id) : false
        if (isCurrentlySelected) {
          onSelectionChange(new Set())
        } else {
          onSelectionChange(new Set([id]))
        }
        return
      }

      const newSet = new Set(selectedKeys instanceof Set ? selectedKeys : [])
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      onSelectionChange(newSet)
    },
    [onSelectionChange, selectedKeys, disabledKeys, selectionMode]
  )

  // ── Sticky styles for pinned columns ──
  const stickyStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}
    let leftOffset = 0
    let rightOffset = 0

    for (const col of sortedColumns) {
      if (col.pinned === 'left') {
        const w = columnWidths[col.uid] || col.width || 150
        const numW = typeof w === 'number' ? w : parseInt(String(w), 10) || 150
        styles[col.uid] = { left: leftOffset, width: numW, minWidth: col.minWidth || numW, maxWidth: numW }
        leftOffset += numW
      }
    }
    for (let i = sortedColumns.length - 1; i >= 0; i--) {
      const col = sortedColumns[i]
      if (col.pinned === 'right') {
        const w = columnWidths[col.uid] || col.width || 150
        const numW = typeof w === 'number' ? w : parseInt(String(w), 10) || 150
        styles[col.uid] = { right: rightOffset, width: numW, minWidth: col.minWidth || numW, maxWidth: numW }
        rightOffset += numW
      }
    }
    return styles
  }, [sortedColumns, columnWidths])

  const { lastLeftPinned, firstRightPinned } = useMemo(() => {
    let lastLeft: string | null = null
    let firstRight: string | null = null
    for (const col of sortedColumns) {
      if (col.pinned === 'left') lastLeft = col.uid
      if (col.pinned === 'right' && !firstRight) firstRight = col.uid
    }
    return { lastLeftPinned: lastLeft, firstRightPinned: firstRight }
  }, [sortedColumns])

  const totalTableWidth = useMemo(() => {
    return sortedColumns.reduce((acc, col) => {
      const w = columnWidths[col.uid] || col.width || 150
      return acc + (typeof w === 'number' ? w : parseInt(String(w), 10) || 150)
    }, 0)
  }, [sortedColumns, columnWidths])

  // ── Scroll listener for shadows ──
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const updateFloatingActionPosition = () => {
      if (!renderRowFloatingAction || !hoveredRowKey) return
      const rowEl = el.querySelector(`tr[data-row-key="${hoveredRowKey}"]`) as HTMLTableRowElement | null
      if (!rowEl) return

      const top = rowEl.offsetTop
      const height = rowEl.offsetHeight
      const left = el.scrollLeft + el.clientWidth - 84
      setFloatingActionPos((prev) =>
        prev && prev.top === top && prev.left === left && prev.height === height
          ? prev
          : { top, left, height }
      )
    }

    const handleScroll = () => {
      if (el.scrollLeft > 0) {
        el.classList.add('is-scrolled-left')
      } else {
        el.classList.remove('is-scrolled-left')
      }

      if (Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth) {
        el.classList.add('is-scrolled-right')
      } else {
        el.classList.remove('is-scrolled-right')
      }

      updateFloatingActionPosition()
    }

    handleScroll()
    el.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [sortedColumns, totalTableWidth, hoveredRowKey, renderRowFloatingAction])

  // ── Drag-to-reorder Handlers (Replaced by dnd-kit below) ──

  // ── Sort handler for header click ──
  const handleSortClick = useCallback(
    (e: React.MouseEvent, col: TableColumnType<T>) => {
      if (col.sortable === false) return
      e.stopPropagation()
      const current = effectiveSortDescriptors || []
      let next = [...current]

      if (e.shiftKey) {
        const idx = next.findIndex((d) => d.column === col.uid)
        if (idx !== -1) {
          if (next[idx].direction === 'ascending') next[idx] = { ...next[idx], direction: 'descending' }
          else next.splice(idx, 1)
        } else {
          next.push({ column: col.uid, direction: 'ascending' })
        }
      } else {
        const existing = next.find((d) => d.column === col.uid)
        if (next.length === 1 && existing?.direction === 'descending') {
          next = []
        } else {
          next = [{ column: col.uid, direction: existing?.direction === 'ascending' ? 'descending' : 'ascending' }]
        }
      }

      effectiveOnSortChange?.(next.map((d) => ({ ...d, column: String(d.column) })))
    },
    [effectiveSortDescriptors, effectiveOnSortChange]
  )

  // MUI DataGrid style: only border-bottom, no vertical borders
  const vBorder = ''
  const hBorder = 'border-b border-gray-100 dark:border-gray-700'
  const thBorder = 'border-b border-gray-200 dark:border-gray-600'

  return (
    <>
      <div
        ref={scrollRef}
        onMouseLeave={() => {
          setHoveredRowKey(null)
          setHoveredRowData(null)
          setFloatingActionPos(null)
        }}
        className={cn(
          'w-full overflow-auto relative table-hr-container h-full',
          enableStickyScrollbar ? 'table-hr-scrollbar-hide' : 'table-hr-hover-scrollbar',
          className
        )}
      >
        {/* ── Table ── */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStartKit}
          onDragEnd={handleDragEndKit}
        >
          <table
            className={cn(
              'border-separate border-spacing-0 table-fixed'
            )}
            style={{ width: '100%', minWidth: totalTableWidth }}
          >
            {/* ── HEAD ── */}
            <SortableContext
              items={sortedColumns.map(c => c.uid)}
              strategy={horizontalListSortingStrategy}
            >
              <thead>
                <tr>
                  {sortedColumns.map((col) => {
                    const sortDesc = effectiveSortDescriptors.find((d) => d.column === col.uid)
                    const sortIndex = effectiveSortDescriptors.findIndex((d) => d.column === col.uid)
                    const isSorted = sortIndex !== -1
                    const direction = sortDesc?.direction
                    const w = columnWidths[col.uid] || col.width || 150
                    const numW = typeof w === 'number' ? w : parseInt(String(w), 10) || 150
                    const isLastLeft = col.uid === lastLeftPinned
                    const isFirstRight = col.uid === firstRightPinned

                    const thStyle: React.CSSProperties = isMobile
                      ? { width: numW, minWidth: col.minWidth || numW, maxWidth: numW }
                      : {
                        ...(col.pinned ? stickyStyles[col.uid] : {}),
                        position: 'sticky',
                        top: 0,
                        zIndex: col.pinned ? 45 : 40,
                        width: numW,
                        minWidth: col.minWidth || numW,
                        maxWidth: numW,
                      }

                    return (
                      <SortableTH
                        key={col.uid}
                        id={col.uid}
                        disabled={!enableColumnReorder}
                        style={thStyle}
                        className={cn(
                          'py-3 px-5 text-sm font-bold text-left select-none group relative',
                          'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                          hBorder, thBorder, col.uid === 'stt' || col.uid === 'selection' ? '' : vBorder,
                          col.pinned ? 'bg-gray-50 dark:bg-gray-800' : '',
                          isLastLeft && col.uid !== 'stt' && col.uid !== 'selection' ? 'pinned-last-left' : '',
                          isFirstRight ? 'pinned-first-right' : ''
                        )}
                      >
                        {({ attributes, listeners, isDragging }: any) => (
                          <React.Fragment>
                            {col.uid === 'stt' || col.uid === 'selection' ? (
                              /* STT column header */
                              <div className="flex items-center justify-center w-full">
                                {selectionMode === 'multiple' ? (
                                  <Checkbox
                                    isSelected={isAllSelected}
                                    onValueChange={onToggleAll}
                                    size="sm"
                                    className="m-0 p-0"
                                    classNames={{ wrapper: 'm-0 before:!border-black' }}
                                    aria-label="Select all"
                                  />
                                ) : (
                                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                    {col.name || '#'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="relative w-full min-w-0 overflow-hidden group/header">
                                {/* Title row — full width, no truncation until hovered */}
                                <div className="flex items-center h-full w-full pr-1">
                                  <span
                                    className={cn(
                                      'text-sm truncate block',
                                      col.sortable !== false && enableSorting
                                        ? 'cursor-pointer'
                                        : ''
                                    )}
                                    style={{
                                      whiteSpace: 'nowrap',
                                      textOverflow: 'ellipsis',
                                      overflow: 'hidden',
                                      fontWeight: 'var(--unstable_DataGrid-headWeight, 600)',
                                      lineHeight: 'normal'
                                    }}
                                    title={col.name}
                                    onClick={
                                      enableSorting && col.sortable !== false
                                        ? (e) => handleSortClick(e, col)
                                        : undefined
                                    }
                                  >
                                    {col.name}
                                  </span>

                                  {/* Sort icon — chỉ hiện khi đã sort */}
                                  {enableSorting && isSorted && (
                                    <div
                                      className="text-blue-600 dark:text-blue-400 shrink-0 cursor-pointer ml-1 flex items-center justify-center"
                                      onClick={(e) => handleSortClick(e, col)}
                                    >
                                      {direction === 'ascending' ? (
                                        <ArrowUpWideNarrow size={14} className="shrink-0" />
                                      ) : (
                                        <ArrowDownWideNarrow size={14} className="shrink-0" />
                                      )}
                                    </div>
                                  )}

                                  {/* Multi-sort badge */}
                                  {enableSorting && isSorted && effectiveSortDescriptors.length > 1 && (
                                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-1 rounded-full font-medium min-w-4 h-4 flex items-center justify-center shrink-0 ml-1">
                                      {sortIndex + 1}
                                    </span>
                                  )}
                                </div>

                                {/* Hover overlay: actions appear from the right with gradient fade */}
                                <div className="absolute right-0 top-0 bottom-0 hidden group-hover/header:flex items-center gap-0.5 pl-4 pr-0.5"
                                  style={{
                                    background: 'linear-gradient(to right, transparent, var(--th-bg, #f3f4f6) 30%)'
                                  }}
                                >
                                  {/* Context menu trigger */}
                                  {(enablePinning && !col.disablePinning) || (enableSorting && col.sortable !== false) ? (
                                    <button
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer shrink-0 inline-flex items-center justify-center"
                                      onClick={(e) => openMenu(
                                        e,
                                        col.uid,
                                        col.pinned as 'left' | 'right' | undefined,
                                        enableSorting && col.sortable !== false,
                                        effectiveSortDescriptors.find(d => d.column === col.uid)?.direction as 'ascending' | 'descending' | undefined
                                      )}
                                    >
                                      <EllipsisVertical size={14} className="text-gray-600 dark:text-gray-400 shrink-0" />
                                    </button>
                                  ) : null}

                                  {/* Drag handle */}
                                  {enableColumnReorder && (
                                    <div
                                      {...attributes}
                                      {...listeners}
                                      className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors shrink-0 outline-none"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <GripVertical size={12} className="text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Resize handle */}
                            {canResize && col.uid !== sortedColumns[sortedColumns.length - 1].uid && col.uid !== 'stt' && col.uid !== 'selection' && (
                              <div
                                className="absolute -right-2 top-0 h-full w-4 cursor-col-resize z-20 flex justify-center touch-none"
                                onMouseDown={(e) => {
                                  const currentWidth = typeof w === 'number' ? w : e.currentTarget.parentElement?.offsetWidth || 40
                                  onResizeStart(e, col.uid, currentWidth)
                                }}
                                onTouchStart={(e) => {
                                  const currentWidth = typeof w === 'number' ? w : e.currentTarget.parentElement?.offsetWidth || 40
                                  onResizeStart(e, col.uid, currentWidth)
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="w-1 h-full bg-blue-500 transition-opacity opacity-0 group-hover:opacity-100" />
                              </div>
                            )}
                          </React.Fragment>
                        )}
                      </SortableTH>
                    )
                  })}
                </tr>
              </thead>
            </SortableContext>

            {/* ── BODY ── */}
            <tbody className="bg-white dark:bg-gray-900">
              {isLoading ? (
                [...Array(10)].map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`}>
                    {sortedColumns.map((col) => {
                      const w = columnWidths[col.uid] || col.width || 150
                      const numW = typeof w === 'number' ? w : parseInt(String(w), 10) || 150
                      const isLastLeft = col.uid === lastLeftPinned
                      const isFirstRight = col.uid === firstRightPinned

                      return (
                        <td
                          key={col.uid}
                          className={cn(
                            `px-5 py-3 ${hBorder} ${col.uid === 'stt' || col.uid === 'selection' ? '' : vBorder} relative h-full min-h-10 min-w-0`,
                            isLastLeft && col.uid !== 'stt' && col.uid !== 'selection' ? 'pinned-last-left' : '',
                            isFirstRight ? 'pinned-first-right' : '',
                            col.pinned ? 'bg-white dark:bg-gray-900' : ''
                          )}
                          style={
                            isMobile
                              ? { width: numW, minWidth: col.minWidth || numW }
                              : {
                                width: numW,
                                minWidth: col.minWidth || numW,
                                ...(col.pinned ? { position: 'sticky', zIndex: 20, ...stickyStyles[col.uid] } : {})
                              }
                          }
                        >
                          <div className="flex items-center w-full px-2">
                            <Skeleton className="h-3 w-full rounded-lg bg-gray-200 dark:bg-gray-700 opacity-60" />
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))
              ) : effectiveData.length === 0 ? (
                <tr>
                  <td colSpan={sortedColumns.length} className="py-20">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                        <Inbox size={32} className="text-gray-300 dark:text-gray-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Không tìm thấy dữ liệu</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">Dữ liệu bạn tìm kiếm hiện không khả dụng hoặc chưa có.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                effectiveData.map((row, idx) => {
                  const rowKey = String(row[primaryKey] ?? idx)
                  const isSelected = selectedKeys === 'all' || (selectedKeys instanceof Set && selectedKeys.has(rowKey))
                  const isContextMenuActive = String(contextMenuRowId) === rowKey
                  const isFocused = focusedRowId === rowKey
                  const rowHighlight = isSelected || isContextMenuActive || isFocused

                  return (
                    <tr
                      key={rowKey}
                      className={cn(
                        'group select-none transition-all border-l-4',
                        rowHighlight ? 'border-l-gray-400' : 'border-l-transparent',
                        rowHighlight && selectedColor ? selectedColor : 'bg-white dark:bg-gray-900',
                        'hover:bg-gray-50 dark:hover:bg-gray-800',
                        editingCell?.rowId === rowKey ? 'z-50 relative' : ''
                      )}
                      data-row-key={rowKey}
                      onMouseEnter={() => {
                        if (!renderRowFloatingAction) return
                        setHoveredRowKey(rowKey)
                        setHoveredRowData(row)
                      }}
                      data-selected={isSelected}
                      onContextMenu={(e) => {
                        if (onRowContextMenu) {
                          e.preventDefault()
                          onRowContextMenu(e, row)
                        }
                      }}
                      onClick={() => {
                        setFocusedRowId(rowKey)
                        onRowClick?.(row)
                      }}
                      onDoubleClick={() => {
                        handleEditCell(rowKey, '', false)
                        onRowDoubleClick?.(row)
                      }}
                    >
                      {sortedColumns.map((col) => {
                        const w = columnWidths[col.uid] || col.width || 150
                        const numW = typeof w === 'number' ? w : parseInt(String(w), 10) || 150
                        const isEditingCell = editingCell?.rowId === rowKey && editingCell?.colUid === col.uid
                        const isLastLeft = col.uid === lastLeftPinned
                        const isFirstRight = col.uid === firstRightPinned

                        const cellBg = col.pinned
                          ? cn(
                            rowHighlight && selectedColor ? selectedColor : 'bg-white dark:bg-gray-900',
                            'group-hover:bg-gray-50 dark:group-hover:bg-gray-800'
                          )
                          : ''

                        return (
                          <td
                            key={col.uid}
                            className={cn(
                              'p-0 relative h-full min-h-10 min-w-0',
                              hBorder, col.uid === 'stt' || col.uid === 'selection' ? '' : vBorder,
                              cellBg,
                              isLastLeft && col.uid !== 'stt' && col.uid !== 'selection' ? 'pinned-last-left' : '',
                              isFirstRight ? 'pinned-first-right' : '',
                              isEditingCell ? 'z-35!' : 'z-0'
                            )}
                            style={
                              isMobile
                                ? { width: numW, minWidth: col.minWidth || numW }
                                : {
                                  width: numW,
                                  minWidth: col.minWidth || numW,
                                  maxWidth: numW,
                                  ...(col.pinned ? { position: 'sticky' as const, zIndex: isEditingCell ? 35 : 20, ...stickyStyles[col.uid] } : {})
                                }
                            }
                          >
                            <TableHrCell
                              row={row}
                              col={col}
                              index={idx}
                              primaryKey={primaryKey}
                              isRowSelected={isSelected}
                              isRowDisabled={disabledKeys instanceof Set && disabledKeys.has(rowKey)}
                              onRowChange={onRowChange}
                              toggleRow={toggleRow}
                              width={numW}
                              onResizeStart={onResizeStart}
                              editable={editable}
                              enableResizing={canResize}
                              isEditing={isEditingCell}
                              onEdit={handleEditCell}
                              enableCopy={enableCopy}
                              hasSelection={!!onSelectionChange}
                              isLastColumn={col.uid === sortedColumns[sortedColumns.length - 1].uid}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {renderRowFloatingAction && hoveredRowData && floatingActionPos && (
            <div
              className="absolute z-[60] pointer-events-none"
              style={{
                top: floatingActionPos.top,
                left: floatingActionPos.left,
                height: floatingActionPos.height
              }}
            >
              <div
                className="pointer-events-auto h-full w-[84px] flex items-center justify-end pr-2 bg-white/95 dark:bg-gray-900/95"
                style={{
                  background: 'linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.95) 38%)',
                  boxShadow: '-10px 0 14px -12px rgba(15,23,42,0.4)',
                  backdropFilter: 'blur(2px)'
                }}
              >
                {renderRowFloatingAction(hoveredRowData)}
              </div>
            </div>
          )}

          {/* Google Sheets-style resize guideline */}
          <div
            ref={guideLineRef}
            className="hidden opacity-0 absolute top-0 bottom-0 w-[1.5px] bg-blue-500 z-[9999] pointer-events-none shadow-[0_0_4px_rgba(59,130,246,0.5)]"
            style={{ left: 0 }}
          />

          {/* Drag Overlay for placeholder */}
          {enableColumnReorder && (
            <DragOverlay dropAnimation={null}>
              {activeDragUid ? (
                <div style={{ zoom: containerZoom }}>
                  <table className={cn('border-separate border-spacing-0 table-fixed bg-white dark:bg-gray-900 shadow-2xl opacity-95 rounded-md overflow-hidden ring-4 ring-blue-500/20')}>
                  <thead>
                    <tr>
                      <th
                        className={cn(
                          'py-3 px-5 text-sm font-bold text-left select-none',
                          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                          hBorder, thBorder, vBorder
                        )}
                        style={{
                          width: columnWidths[activeDragUid] || columns.find(c => c.uid === activeDragUid)?.width || 150
                        }}
                      >
                        <div className="flex items-center h-full w-full pr-1">
                          <span className="text-sm truncate block font-semibold">{columns.find(c => c.uid === activeDragUid)?.name}</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                </table>
                </div>
              ) : null}
            </DragOverlay>
          )}
        </DndContext>
      </div>

      {enableStickyScrollbar && <TableStickyScrollbar tableRef={scrollRef} />}

      <style>{`
        /* Structural borders for pinned columns */
        .pinned-last-left {
          border-right: 1px solid #e5e7eb !important;
        }
        .pinned-first-right {
          border-left: 1px solid #e5e7eb !important;
        }
        .dark .pinned-last-left {
          border-right-color: #374151 !important;
        }
        .dark .pinned-first-right {
          border-left-color: #374151 !important;
        }

        /* Hide borders when scrolled (shadow appears) to avoid double visual lines */
        .table-hr-container.is-scrolled-left .pinned-last-left {
          border-right-color: transparent !important;
        }
        .table-hr-container.is-scrolled-right .pinned-first-right {
          border-left-color: transparent !important;
        }

        .table-hr-container.is-scrolled-left .pinned-last-left::after {
          content: '';
          position: absolute;
          top: 0;
          right: -1px;
          bottom: 0;
          width: 15px;
          box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, 0.15);
          transform: translateX(100%);
          pointer-events: none;
          z-index: 10;
        }
        .table-hr-container.is-scrolled-right .pinned-first-right::after {
          content: '';
          position: absolute;
          top: 0;
          left: -1px;
          bottom: 0;
          width: 15px;
          box-shadow: inset -10px 0 8px -8px rgba(0, 0, 0, 0.15);
          transform: translateX(-100%);
          pointer-events: none;
          z-index: 10;
        }
        .dark .table-hr-container.is-scrolled-left .pinned-last-left::after {
          box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, 0.4);
        }
        .dark .table-hr-container.is-scrolled-right .pinned-first-right::after {
          box-shadow: inset -10px 0 8px -8px rgba(0, 0, 0, 0.4);
        }

        /* Scrollbar styles */
        .table-hr-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .table-hr-scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

      <TablePinningMenu
        menuState={menuState}
        onClose={closeMenu}
        onPinColumn={effectiveOnPinColumn}
        onSort={(uid, direction) => {
          const current = effectiveSortDescriptors || []
          if (direction === undefined) {
            effectiveOnSortChange?.(current.filter(d => d.column !== uid).map(d => ({ ...d, column: String(d.column) })))
          } else {
            effectiveOnSortChange?.([
              ...current.filter(d => d.column !== uid).map(d => ({ ...d, column: String(d.column) })),
              { column: uid, direction }
            ])
          }
        }}
        extraItems={headerMenuItems}
      />
    </>
  )
}
