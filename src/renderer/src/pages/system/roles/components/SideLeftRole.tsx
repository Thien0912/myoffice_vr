import { useState, useMemo, useRef, useEffect } from 'react'
import { Button, Tooltip, cn, Skeleton } from '@heroui/react'
import { Plus, GripVertical, Trash2 } from 'lucide-react'
import { SideLeftToggle } from '../../../document/components/sideLeft/SideLeftToggle'
import { useQuery } from '@tanstack/react-query'
import { mockRolesAxios } from '../fakeData'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SideLeftRoleProps {
  isCollapsed: boolean
  onToggle: () => void
  onOpenCreate?: () => void
  onRoleSelect?: (role: any) => void
  activeRoleId?: string | number
  className?: string
  onDeleteRole?: (role: any) => void
}

function SortableRoleItem({
  role,
  isCollapsed,
  isActive,
  onSelect,
  onContextMenu
}: {
  role: any
  isCollapsed: boolean
  isActive: boolean
  onSelect: (role: any) => void
  onContextMenu?: (e: React.MouseEvent, role: any) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(role.ql_vai_tro_id || role.value)
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined
  }

  const roleId = role.ql_vai_tro_id || role.value
  const roleName = role.ql_vai_tro_ten || role.label
  const roleDotColor = role.dotColor || 'bg-gray-400'
  const roleTextColor = role.textColor || 'text-gray-500'
  const roleBg = role.bgColor || 'bg-gray-50 dark:bg-gray-700'
  const roleBorder = role.borderColor || 'bg-gray-400'
  const hasCustomColor = role.customColorHex

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("flex items-center", isCollapsed ? "justify-center" : "w-full")}
      onContextMenu={(e) => onContextMenu?.(e, role)}
    >
      {!isCollapsed && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing px-1 text-gray-300 hover:text-gray-500 transition-colors shrink-0"
        >
          <GripVertical size={14} strokeWidth={1.5} />
        </div>
      )}
      <Tooltip content={roleName} placement="right" delay={500} closeDelay={0}>
        <Button
          variant="light"
          onPress={() => onSelect(role)}
          className={cn(
            'relative overflow-hidden transition-all duration-200 group',
            isCollapsed
              ? 'w-9 h-9 min-w-9 p-0 justify-center rounded-full mx-auto'
              : 'w-full h-8 justify-start pl-3.5 rounded-l-none rounded-r-full',
            isActive && !hasCustomColor
              ? `${roleBg} ${roleTextColor} font-bold dark:text-white`
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
          style={isActive && hasCustomColor ? {
            backgroundColor: role.customColorHex + '20'
          } : undefined}
          radius="none"
        >
          <div
            className={cn(
              'shrink-0 rounded-full transition-transform border border-white/50 dark:border-white/10 shadow-sm',
              isCollapsed ? 'w-4 h-4' : 'w-3 h-3',
              isActive ? 'scale-110' : 'scale-100',
              !hasCustomColor && roleDotColor
            )}
            style={hasCustomColor ? {
              backgroundColor: role.customColorHex
            } : undefined}
          />
          {!isCollapsed && (
            <span className="ml-2.5 text-xs truncate flex-1 text-left text-gray-900 dark:text-gray-100">
              {roleName}
            </span>
          )}
          {isActive && !isCollapsed && (
            <div
              className={cn(!hasCustomColor && roleBorder)}
              style={hasCustomColor ? {
                backgroundColor: role.customColorHex
              } : undefined}
            />
          )}
        </Button>
      </Tooltip>
    </div>
  )
}

function ContextMenu({
  x,
  y,
  items,
  onClose
}: {
  x: number
  y: number
  items: { label: string; icon: React.ReactNode; onPress: () => void; danger?: boolean }[]
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="fixed z-[9999] min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1"
      style={{ left: x, top: y }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          className={cn(
            'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
            item.danger
              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium'
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
          onClick={() => { item.onPress(); onClose() }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  )
}

export const SideLeftRole = ({
  isCollapsed,
  onToggle,
  onOpenCreate,
  onRoleSelect,
  activeRoleId,
  className,
  onDeleteRole
}: SideLeftRoleProps) => {
  const { data: roleOptions = [], isLoading } = useQuery({
    queryKey: ['roleOptionsSidebar'],
    queryFn: async () => {
      try {
        const res: any = await mockRolesAxios.getOptions()
        if (res.success && Array.isArray(res.data)) {
           return res.data
        }
        return []
      } catch (e) {
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true
  })

  const [order, setOrder] = useState<string[] | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; role: any } | null>(null)

  const orderedRoles = useMemo(() => {
    if (order) {
      const map = new Map(roleOptions.map((r: any) => [String(r.ql_vai_tro_id || r.value), r]))
      return order.map((id) => map.get(id)).filter(Boolean)
    }
    return roleOptions
  }, [roleOptions, order])

  // Sync order with roleOptions: keep existing order, append new roles
  useEffect(() => {
    if (roleOptions.length > 0) {
      const currentIds = roleOptions.map((r: any) => String(r.ql_vai_tro_id || r.value))
      setOrder((prev) => {
        if (!prev) return currentIds
        const newIds = currentIds.filter((id) => !prev.includes(id))
        if (newIds.length === 0) return prev
        return [...prev, ...newIds]
      })
    }
  }, [roleOptions])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleContextMenu = (e: React.MouseEvent, role: any) => {
    e.preventDefault()
    if (Number(role.is_default) === 1) return
    setContextMenu({ x: e.clientX, y: e.clientY, role })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrder((prev) => {
      if (!prev) return prev
      const oldIndex = prev.indexOf(String(active.id))
      const newIndex = prev.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return prev
      const result = [...prev]
      result.splice(newIndex, 0, result.splice(oldIndex, 1)[0])
      return result
    })
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <SideLeftToggle isCollapsed={isCollapsed} onToggle={onToggle} />

      {!isCollapsed ? (
        <div className="px-5 mb-3 flex items-center justify-between group/title">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Danh sách vai trò
          </span>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            radius="full"
            onPress={onOpenCreate}
            className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 h-7 w-7 min-w-7 transition-all hover:scale-110 active:scale-95"
            title="Thêm vai trò mới"
          >
            <Plus size={16} strokeWidth={3} />
          </Button>
        </div>
      ) : (
        <div className="flex justify-center mb-3">
           <Button
            isIconOnly
            size="sm"
            variant="flat"
            radius="full"
            color="primary"
            onPress={onOpenCreate}
            className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 h-7 w-7 min-w-7 transition-all hover:scale-110 active:scale-95"
            title="Thêm vai trò mới"
          >
            <Plus size={18} strokeWidth={2.5} />
          </Button>
        </div>
      )}

      <div className="flex flex-col px-2 space-y-0.5">
        {isLoading ? (
          <div className="space-y-1.5 px-2">
             {[1, 2, 3, 4, 5].map(i => (
               <Skeleton key={i} className="h-7 w-full rounded-lg" />
             ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedRoles.map((r: any) => String(r.ql_vai_tro_id || r.value))}
              strategy={verticalListSortingStrategy}
            >
              {orderedRoles.map((role: any) => {
                const roleId = role.ql_vai_tro_id || role.value
                const isActive = String(activeRoleId) === String(roleId)
                return (
                  <SortableRoleItem
                    key={roleId}
                    role={role}
                    isCollapsed={isCollapsed}
                    isActive={isActive}
                    onSelect={onRoleSelect || (() => {})}
                    onContextMenu={handleContextMenu}
                  />
                )
              })}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            ...(Number(contextMenu.role.is_default) === 0 || contextMenu.role.is_default === undefined
              ? [{
                  label: 'Xóa vai trò',
                  icon: <Trash2 size={16} />,
                  onPress: () => onDeleteRole?.(contextMenu.role),
                  danger: true
                }]
              : [])
          ]}
        />
      )}
    </div>
  )
}

export default SideLeftRole
