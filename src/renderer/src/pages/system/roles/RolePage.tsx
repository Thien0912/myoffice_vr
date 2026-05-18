import { useEffect, useRef, useState } from 'react'
import { Button, cn, Skeleton, Popover, PopoverTrigger, PopoverContent, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { Info, Lock, Trash2, Users, Check, Plus, MoreHorizontal } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

// Components
import ConfirmModal from '@renderer/components/ConfirmModal'
import { RoleModal } from './components/RoleModal'
import { RoleDetailInfo } from './components/RoleDetailInfo'
import { RoleDetailMembers } from './components/RoleDetailMembers'
import { RoleDetailPermissions } from './components/RoleDetailPermissions'
import { RoleDetailPlaceholder } from './components/RoleDetailPlaceholder'
import { SideLeftRole } from './components/SideLeftRole'
import { ColorPickerModal } from './components/ColorPickerModal'

// Hooks
import { useRoleLogic } from './hooks/useRoleLogic'

// Constants
import { ROLE_COLORS } from './constants/roleColors'
import { mockRolesAxios } from './fakeData'
import { toast } from "@heroui-v3/react"

export default function RolePage() {
    const {
        isCollapsed,
        setIsCollapsed,
        activeRoleId,
        activeRole,
        confirmModal,
        setConfirmModal,
        roleModal,
        setRoleModal,
        isLoading,
        activeTab,
        setActiveTab,
        handleCreateRole,
        handleEditRole,
        handleDeleteRole,
        handleRoleSelect,
        queryClient
    } = useRoleLogic()

    const [sidebarWidth, setSidebarWidth] = useState(256)
    const isResizing = useRef(false)
    const startX = useRef(0)
    const startWidth = useRef(256)

    // Color picker state
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
    const [isCustomColorModalOpen, setIsCustomColorModalOpen] = useState(false)

    // Fetch all roles to check used colors
    const { data: existingRoles = [] } = useQuery({
        queryKey: ['admin-roles-for-colors'],
        queryFn: async () => {
            try {
                const res: any = await mockRolesAxios.getAll({})
                if (res.data && Array.isArray(res.data.data)) {
                    return res.data.data
                }
                return []
            } catch (e) {
                return []
            }
        },
        staleTime: 5 * 60 * 1000
    })

    // Get used color ids (exclude current role's color)
    const usedColorIds = existingRoles
        .filter((r: any) => activeRole ? r.ql_vai_tro_id !== activeRole.ql_vai_tro_id : true)
        .map((r: any) => r.colorId)
        .filter(Boolean) as string[]

    // Handle color change
    const handleColorChange = async (colorId: string) => {
        if (!activeRole) return
        
        try {
            const res: any = await mockRolesAxios.update(activeRole.ql_vai_tro_id, {
                ql_vai_tro_ten: activeRole.ql_vai_tro_ten,
                ql_vai_tro_mo_ta: activeRole.ql_vai_tro_mo_ta || '',
                colorId: colorId
            })

            if (res.success) {
                toast('Thành công', {
                    description: 'Cập nhật màu sắc thành công',
                    variant: 'success'
                })
                queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
                queryClient.invalidateQueries({ queryKey: ['roleOptionsSidebar'] })
                setIsColorPickerOpen(false)
            } else {
                toast('Lỗi', {
                    description: res.message || 'Cập nhật thất bại',
                    variant: 'danger'
                })
            }
        } catch (error: any) {
            toast('Lỗi', {
                description: error.message || 'Có lỗi xảy ra',
                variant: 'danger'
            })
        }
    }

    // Handle custom color selection
    const handleCustomColorSelect = async (colorHex: string) => {
        if (!activeRole) return

        try {
            const res: any = await mockRolesAxios.update(activeRole.ql_vai_tro_id, {
                ql_vai_tro_ten: activeRole.ql_vai_tro_ten,
                ql_vai_tro_mo_ta: activeRole.ql_vai_tro_mo_ta || '',
                colorId: colorHex,
                isCustomColor: true
            })

            if (res.success) {
                toast('Thành công', {
                    description: 'Cập nhật màu sắc thành công',
                    variant: 'success'
                })
                await queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
                await queryClient.invalidateQueries({ queryKey: ['roleOptionsSidebar'] })
                setIsCustomColorModalOpen(false)
                setIsColorPickerOpen(false)
            } else {
                toast('Lỗi', {
                    description: res.message || 'Cập nhật thất bại',
                    variant: 'danger'
                })
            }
        } catch (error: any) {
            toast('Lỗi', {
                description: error.message || 'Có lỗi xảy ra',
                variant: 'danger'
            })
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        isResizing.current = true
        startX.current = e.clientX
        startWidth.current = sidebarWidth
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return
            const delta = e.clientX - startX.current
            const newWidth = Math.max(180, Math.min(500, startWidth.current + delta))
            setSidebarWidth(newWidth)
        }

        const handleMouseUp = () => {
            isResizing.current = false
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [sidebarWidth])

    const renderContent = () => {
        if (!activeRoleId) {
            return (
                <div className="flex flex-col w-full h-full overflow-hidden">
                    <RoleDetailPlaceholder />
                </div>
            )
        }

        return (
            <div className="flex flex-col w-full h-full overflow-hidden">
                {/* Detail Header */}
                <div className="px-3.5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/10 min-h-[40px] shrink-0">
                    <div className="flex items-center gap-2.5 flex-1">
                        {/* Color Picker Popover */}
                        <Popover 
                            isOpen={isColorPickerOpen} 
                            onOpenChange={setIsColorPickerOpen}
                            placement="bottom-start" 
                            offset={10}
                        >
                            <PopoverTrigger>
                                <button
                                    type="button"
                                    className={cn(
                                        'w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md',
                                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                                        !(activeRole as any)?.customColorHex && ((activeRole as any)?.bgColor || 'bg-blue-50 dark:bg-blue-900/30')
                                    )}
                                    style={(activeRole as any)?.customColorHex ? {
                                        backgroundColor: (activeRole as any).customColorHex + '20' // 20 = 12.5% opacity
                                    } : undefined}
                                    title="Click để đổi màu"
                                >
                                    <div 
                                        className={cn('w-4 h-4 rounded-full border border-white/50 dark:border-white/10 shadow-sm', !(activeRole as any)?.customColorHex && ((activeRole as any)?.dotColor || 'bg-blue-500'))}
                                        style={(activeRole as any)?.customColorHex ? {
                                            backgroundColor: (activeRole as any).customColorHex
                                        } : undefined}
                                    />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="p-4 w-[340px]">
                                <div className="space-y-4">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Chọn màu sắc cho vai trò
                                    </div>
                                    
                                    {/* Grid màu */}
                                    <div className="grid grid-cols-8 gap-2">
                                        {ROLE_COLORS.map((color) => {
                                            const isSelected = (activeRole as any)?.colorId === color.id
                                            const isUsed = usedColorIds.includes(color.id)
                                            
                                            return (
                                                <Tooltip
                                                    key={color.id}
                                                    content={isUsed ? `${color.name} (Màu đã được dùng)` : color.name}
                                                    placement="top"
                                                    delay={200}
                                                    closeDelay={0}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleColorChange(color.id)}
                                                        className={cn(
                                                            'relative w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center',
                                                            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800',
                                                            isSelected
                                                                ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110'
                                                                : 'hover:scale-110 hover:shadow-lg',
                                                            'cursor-pointer',
                                                            color.bgClass
                                                        )}
                                                    >
                                                        {isSelected && (
                                                            <Check size={14} className="text-white drop-shadow-md" strokeWidth={3} />
                                                        )}
                                                        {isUsed && !isSelected && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                                                                <span className="text-[6px] text-white font-bold">!</span>
                                                            </div>
                                                        )}
                                                    </button>
                                                </Tooltip>
                                            )
                                        })}
                                        
                                        {/* Custom color button */}
                                        <Tooltip
                                            content="Chọn màu tùy chỉnh"
                                            placement="top"
                                            delay={200}
                                            closeDelay={0}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomColorModalOpen(true)
                                                }}
                                                className={cn(
                                                    'relative w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center',
                                                    'border-2 border-dashed border-gray-400 hover:border-gray-600',
                                                    'hover:bg-gray-50 dark:hover:bg-gray-800',
                                                    'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800',
                                                    'cursor-pointer'
                                                )}
                                            >
                                                <Plus size={16} className="text-gray-500" />
                                            </button>
                                        </Tooltip>
                                    </div>
                                    
                                    {/* Legend */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                                                <span className="text-[6px] text-white font-bold">!</span>
                                            </div>
                                            <span>Màu đã được dùng</span>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        
                        <div className="flex flex-col gap-0.5 flex-1">
                            <Skeleton isLoaded={!isLoading} className="rounded-lg">
                                <h2 className={cn('text-sm font-bold uppercase tracking-tight', (activeRole as any)?.textColor || 'text-gray-800 dark:text-gray-100')}>
                                    {activeRole?.ql_vai_tro_ten || 'Chi tiết vai trò'}
                                </h2>
                            </Skeleton>
                            <Skeleton isLoaded={!isLoading} className="rounded-lg">
                                <p className="text-[10px] text-gray-400 font-medium">Quản lý thông tin và phân quyền hệ thống</p>
                            </Skeleton>
                        </div>
                    </div>
                    
                    {(activeRole as any)?.is_default === 0 || (activeRole as any)?.is_default === undefined ? (
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    variant="flat"
                                    radius="sm"
                                    isIconOnly
                                    size="sm"
                                    className="bg-gray-100 dark:bg-gray-700 h-8 w-8 min-w-8"
                                >
                                    <MoreHorizontal size={18} strokeWidth={2} className="text-gray-600 dark:text-gray-400" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Role actions" variant="flat">
                                <DropdownItem
                                    key="delete"
                                    startContent={<Trash2 size={16} />}
                                    onPress={() => handleDeleteRole(activeRole)}
                                    className="text-danger font-medium"
                                    color="danger"
                                >
                                    Xóa vai trò
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    ) : null}
                </div>

                {/* Tabs Section */}
                <div className="flex-1 flex flex-col px-0 overflow-hidden min-h-0 h-full">
                    <div className="shrink-0">
                        <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 pl-2">
                            {[
                                { id: 'info', label: 'Thông tin', icon: Info },
                                { id: 'permissions', label: 'Quyền hạn', icon: Lock },
                                { id: 'members', label: `Thành viên ${activeRole?.total_members !== undefined ? `(${activeRole.total_members})` : ''}`, icon: Users }
                            ].map((tab) => {
                                const isActive = activeTab === tab.id
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-1 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                                            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        <Icon size={16} />
                                        <span>{tab.label}</span>
                                        {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col h-full">
                        {activeTab === 'info' && <RoleDetailInfo activeRole={activeRole} isLoading={isLoading} />}
                        {activeTab === 'permissions' && <RoleDetailPermissions activeRole={activeRole} />}
                        {activeTab === 'members' && <RoleDetailMembers activeRole={activeRole} />}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full bg-white overflow-hidden">
            {/* Sidebar - Ép buộc full height */}
            <div
                className="flex-none bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden relative"
                style={{ width: isCollapsed ? 64 : sidebarWidth, minHeight: '100%' }}
            >
                <div className="flex-1 overflow-y-auto py-2">
                    <SideLeftRole
                        isCollapsed={isCollapsed}
                        onToggle={() => setIsCollapsed(!isCollapsed)}
                        onOpenCreate={handleCreateRole}
                        onRoleSelect={handleRoleSelect}
                        activeRoleId={activeRoleId}
                        onDeleteRole={handleDeleteRole}
                    />
                </div>

                {!isCollapsed && (
                    <div
                        onMouseDown={handleMouseDown}
                        className="absolute -right-2 top-0 h-full w-4 cursor-col-resize z-50 flex justify-center group"
                        title="Kéo để thay đổi kích thước"
                    >
                        <div className="w-px h-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400 transition-colors" />
                    </div>
                )}
            </div>

            {/* Content - Cấu trúc giống Danh mục: header cố định, content scroll */}
            <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
                {renderContent()}
            </div>

            <RoleModal
                isOpen={roleModal.isOpen}
                onOpenChange={(open) => setRoleModal({ ...roleModal, isOpen: open })}
                role={roleModal.role}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
                    queryClient.invalidateQueries({ queryKey: ['roleOptionsSidebar'] })
                }}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((p) => ({ ...p, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                content={confirmModal.content}
                isDanger={confirmModal.isDanger}
                isLoading={confirmModal.isLoading}
            />

            <ColorPickerModal
                isOpen={isCustomColorModalOpen}
                onClose={() => setIsCustomColorModalOpen(false)}
                onSelectColor={handleCustomColorSelect}
            />
        </div>
    )
}
