import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import { Checkbox, Tooltip } from '@heroui/react'
import { Eye, GripVertical, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface TableColumnConfigProps {
  columns: { uid: string; name: string }[]
  visibleColumns: Set<string>
  setVisibleColumns: (keys: Set<string>) => void
  columnOrder?: string[]
  setColumnOrder?: (order: string[]) => void
  label?: string
  customTrigger?: React.ReactNode
}

export function SortableColumnItem({
  id,
  name,
  isVisible,
  onToggle
}: {
  id: string
  name: string
  isVisible: boolean
  onToggle: (checked: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    position: 'relative'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isDragging ? 'bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-200' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-0.5 text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 active:cursor-grabbing shrink-0"
      >
        <GripVertical size={14} />
      </div>
      <Checkbox
        size="sm"
        isSelected={isVisible}
        onValueChange={onToggle}
        classNames={{ label: 'text-[13px] font-medium select-none' }}
      >
        {name}
      </Checkbox>
    </div>
  )
}

export default function TableColumnConfig({
  columns,
  visibleColumns,
  setVisibleColumns,
  columnOrder,
  setColumnOrder,
  label = 'Hiển thị cột',
  customTrigger
}: TableColumnConfigProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localKeys, setLocalKeys] = useState<Set<string>>(visibleColumns)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [internalOrder, setInternalOrder] = useState<string[]>(columns.map((c) => c.uid))
  const activeOrder = columnOrder || internalOrder

  useEffect(() => {
    setLocalKeys(visibleColumns)
  }, [visibleColumns])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const orderedColumns = useMemo(() => {
    const colMap = new Map(columns.map((c) => [c.uid, c]))
    const result: { uid: string; name: string }[] = []

    for (const uid of activeOrder) {
      if (colMap.has(uid) && uid !== 'stt' && uid !== 'actions') {
        result.push(colMap.get(uid)!)
        colMap.delete(uid)
      }
    }
    for (const [uid, col] of colMap.entries()) {
      if (uid !== 'stt' && uid !== 'actions') {
        result.push(col)
      }
    }
    return result
  }, [columns, activeOrder])

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        const oldIndex = orderedColumns.findIndex(c => c.uid === active.id)
        const newIndex = orderedColumns.findIndex(c => c.uid === over.id)

        if (oldIndex === -1 || newIndex === -1) return

        const newOrdered = arrayMove(orderedColumns, oldIndex, newIndex)

        // Reconstruct the full column order, keeping 'stt' and 'actions' in their original slots
        const newFullOrder: string[] = []
        let orderedIdx = 0

        for (const uid of activeOrder) {
          if (uid === 'stt' || uid === 'actions') {
            newFullOrder.push(uid)
          } else if (orderedIdx < newOrdered.length) {
            newFullOrder.push(newOrdered[orderedIdx].uid)
            orderedIdx++
          }
        }

        // Append any remaining ordered columns just in case
        while (orderedIdx < newOrdered.length) {
          newFullOrder.push(newOrdered[orderedIdx].uid)
          orderedIdx++
        }

        if (setColumnOrder) {
          setColumnOrder(newFullOrder)
        } else {
          setInternalOrder(newFullOrder)
        }
      }
    },
    [activeOrder, orderedColumns, setColumnOrder]
  )

  const handleToggle = (uid: string, checked: boolean) => {
    const nextKeys = new Set(localKeys)
    if (checked) {
      nextKeys.add(uid)
    } else {
      nextKeys.delete(uid)
    }
    setLocalKeys(nextKeys)
    setTimeout(() => {
      setVisibleColumns(nextKeys)
    }, 0)
  }

  const handleReset = () => {
    const allKeys = columns.map((c) => c.uid)
    const newKeysSet = new Set(allKeys)
    setLocalKeys(newKeysSet)

    if (setColumnOrder) {
      setColumnOrder(allKeys)
    } else {
      setInternalOrder(allKeys)
    }

    setTimeout(() => {
      setVisibleColumns(newKeysSet)
    }, 0)
  }

  const hiddenCount = columns.filter(c => c.uid !== 'stt' && c.uid !== 'actions').length -
    Array.from(localKeys).filter(k => k !== 'stt' && k !== 'actions').length

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-end" data-react-aria-top-layer="true">
      <PopoverTrigger>
        {customTrigger ? customTrigger : (
          <button
            ref={triggerRef}
            type="button"
            className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-medium transition-colors border border-transparent ${hiddenCount > 0
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800'
              : 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <Eye size={15} />
            <span>{label}</span>
            {hiddenCount > 0 && (
              <span className="ml-0.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {hiddenCount}
              </span>
            )}
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent className="p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-xl overflow-hidden min-w-[240px] w-[240px]">
        <div className="px-3.5 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20 w-full">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Cấu hình hiển thị cột
          </span>
          <Tooltip content="Đặt lại mặc định" placement="top" closeDelay={0}>
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 outline-none"
            >
              <RotateCcw size={13} strokeWidth={2.5} />
            </button>
          </Tooltip>
        </div>

        <div className="p-1.5 max-h-[360px] overflow-y-auto overflow-x-hidden custom-scrollbar bg-white dark:bg-gray-900 w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedColumns.map((c) => c.uid)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-0.5">
                {orderedColumns.map((col) => (
                  <SortableColumnItem
                    key={col.uid}
                    id={col.uid}
                    name={col.name || col.uid}
                    isVisible={localKeys.has(col.uid)}
                    onToggle={(checked) => handleToggle(col.uid, checked)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </PopoverContent>
    </Popover>
  )
}
