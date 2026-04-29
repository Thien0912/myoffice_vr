import { Button, Tooltip, cn, ScrollShadow, Skeleton } from '@heroui/react'
import { Shield, Plus } from 'lucide-react'
import { SideLeftToggle } from '../../../document/components/sideLeft/SideLeftToggle'
import { useQuery } from '@tanstack/react-query'
import { rolesAxios } from '@renderer/api/admin/rolesAxios'

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
        const res: any = await rolesAxios.getOptions()
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
    <div
      className={cn(
        'h-full w-full shrink-0 bg-white dark:bg-gray-800 flex flex-col py-2 border-r border-gray-100 dark:border-gray-800 transition-all duration-300',
        className
      )}
    >
      {/* 1. Toggle Button */}
      <SideLeftToggle isCollapsed={isCollapsed} onToggle={onToggle} />

      {/* 2. Role List Title & Add Button */}
      {!isCollapsed ? (
        <div className="px-6 mb-4 flex items-center justify-between group/title">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Danh sách vai trò
          </span>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            radius="full"
            onPress={onOpenCreate}
            className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 h-8 w-8 min-w-8 transition-all hover:scale-110 active:scale-95"
            title="Thêm vai trò mới"
          >
            <Plus size={18} strokeWidth={3} />
          </Button>
        </div>
      ) : (
        <div className="flex justify-center mb-4">
           <Button
            isIconOnly
            size="sm"
            variant="flat"
            radius="lg"
            color="primary"
            onPress={onOpenCreate}
            className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 h-10 w-10 min-w-10"
            title="Thêm vai trò mới"
          >
            <Plus size={20} strokeWidth={2.5} />
          </Button>
        </div>
      )}

      {/* 4. Role List */}
      <ScrollShadow className="flex-1 px-2 space-y-0.5 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-2 px-2">
             {[1, 2, 3, 4, 5].map(i => (
               <Skeleton key={i} className="h-8 w-full rounded-lg" />
             ))}
          </div>
        ) : (
          roleOptions.map((role: any) => {
            const roleId = role.ql_vai_tro_id || role.value
            const roleName = role.ql_vai_tro_ten || role.label
            const isActive = String(activeRoleId) === String(roleId)

            const content = (
              <Button
                key={roleId}
                variant="light"
                onPress={() => onRoleSelect?.(role)}
                className={cn(
                  'relative overflow-hidden transition-all duration-200 group',
                  isCollapsed
                    ? 'w-10 h-10 min-w-10 p-0 justify-center rounded-full mx-auto'
                    : 'w-full h-9 justify-start pl-4 rounded-l-none rounded-r-full',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                radius="none"
              >
                <div className={cn(
                  'shrink-0 flex items-center justify-center transition-transform',
                  isActive ? 'scale-110 text-blue-600' : 'scale-100 text-gray-400'
                )}>
                  <Shield size={isCollapsed ? 20 : 16} />
                </div>
                {!isCollapsed && (
                  <span className="ml-3 text-[13px] truncate flex-1 text-left">
                    {roleName}
                  </span>
                )}
                {isActive && !isCollapsed && (
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
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
      </ScrollShadow>
    </div>
  )
}

export default SideLeftRole
