import { Button, Tooltip, cn, Skeleton } from '@heroui/react'
import { Plus } from 'lucide-react'
import { SideLeftToggle } from '../../../document/components/sideLeft/SideLeftToggle'
import { useQuery } from '@tanstack/react-query'
import { mockRolesAxios } from '../fakeData'

interface SideLeftRoleProps {
  isCollapsed: boolean
  onToggle: () => void
  onOpenCreate?: () => void
  onRoleSelect?: (role: any) => void
  activeRoleId?: string | number
  className?: string
}

export const SideLeftRole = ({
  isCollapsed,
  onToggle,
  onOpenCreate,
  onRoleSelect,
  activeRoleId,
  className
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
    staleTime: 5 * 60 * 1000
  })

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Toggle Button */}
      <SideLeftToggle isCollapsed={isCollapsed} onToggle={onToggle} />

      {/* Role List Title & Add Button */}
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
            radius="lg"
            color="primary"
            onPress={onOpenCreate}
            className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 h-9 w-9 min-w-9"
            title="Thêm vai trò mới"
          >
            <Plus size={18} strokeWidth={2.5} />
          </Button>
        </div>
      )}

      {/* Role List */}
      <div className="flex flex-col px-2 space-y-0.5">
        {isLoading ? (
          <div className="space-y-1.5 px-2">
             {[1, 2, 3, 4, 5].map(i => (
               <Skeleton key={i} className="h-7 w-full rounded-lg" />
             ))}
          </div>
        ) : (
          roleOptions.map((role: any) => {
            const roleId = role.ql_vai_tro_id || role.value
            const roleName = role.ql_vai_tro_ten || role.label
            const isActive = String(activeRoleId) === String(roleId)
            const roleDotColor = role.dotColor || 'bg-gray-400'
            const roleTextColor = role.textColor || 'text-gray-500'
            const roleBg = role.bgColor || 'bg-gray-50 dark:bg-gray-700'
            const roleBorder = role.borderColor || 'bg-gray-400'

            const hasCustomColor = role.customColorHex

            const content = (
              <Button
                key={roleId}
                variant="light"
                onPress={() => onRoleSelect?.(role)}
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
                  backgroundColor: role.customColorHex + '20' // 20 = 12.5% opacity
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
                    className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-r-full", !hasCustomColor && roleBorder)}
                    style={hasCustomColor ? {
                      backgroundColor: role.customColorHex
                    } : undefined}
                   />
                )}
              </Button>
            )

            return (
              <Tooltip 
                key={roleId} 
                content={roleName} 
                placement="right"
                delay={500}
                closeDelay={0}
              >
                <div className={cn("flex", isCollapsed ? "justify-center" : "w-full")}>
                  {content}
                </div>
              </Tooltip>
            )
          })
        )}
      </div>
    </div>
  )
}

export default SideLeftRole
