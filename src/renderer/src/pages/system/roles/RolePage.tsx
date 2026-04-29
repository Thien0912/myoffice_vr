import { Tabs } from '@heroui-v3/react'
import { cn, Skeleton } from '@heroui/react'
import { Info, Lock, Shield, Users } from 'lucide-react'

// Components
import ConfirmModal from '@renderer/components/ConfirmModal'
import { RoleModal } from '../modals/RoleModal'
import { RoleDetailInfo } from './components/RoleDetailInfo'
import { RoleDetailMembers } from './components/RoleDetailMembers'
import { RoleDetailPermissions } from './components/RoleDetailPermissions'
import { RoleDetailPlaceholder } from './components/RoleDetailPlaceholder'
import { SideLeftRole } from './components/SideLeftRole'

// Hooks
import { useRoleLogic } from './hooks/useRoleLogic'

export default function RolePage() {
    const {
        // State
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

        // Handlers
        handleCreateRole,
        handleRoleSelect,
        queryClient
    } = useRoleLogic()

    return (
        <div className="flex items-start gap-0 md:gap-4 bg-gray-50/50 dark:bg-gray-900 min-h-[calc(100vh-64px)] p-0">
            {/* Sidebar Section */}
            <div
                className={cn(
                    'sticky top-0 transition-all duration-300 z-20 bg-white dark:bg-gray-800 hidden lg:block h-fit min-h-[calc(100vh-64px)]',
                    isCollapsed ? 'w-16' : 'w-64'
                )}
            >
                <SideLeftRole
                    isCollapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                    onOpenCreate={handleCreateRole}
                    onRoleSelect={handleRoleSelect}
                    activeRoleId={activeRoleId}
                />
            </div>

            {/* Main Content Section */}
            <div className="flex-1 flex flex-col gap-2 min-w-0 min-h-[calc(100vh-64px)]">
                {activeRoleId ? (
                    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 border-l border-gray-100 dark:border-gray-700">
                        {/* Detail Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/10 h-[73px]">
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                    <Shield size={20} />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <Skeleton isLoaded={!isLoading} className="rounded-lg">
                                        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                                            {activeRole?.ql_vai_tro_ten || 'Chi tiết vai trò'}
                                        </h2>
                                    </Skeleton>
                                    <Skeleton isLoaded={!isLoading} className="rounded-lg">
                                        <p className="text-[11px] text-gray-400 font-medium">Quản lý thông tin và phân quyền hệ thống</p>
                                    </Skeleton>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Additional detail actions could go here */}
                            </div>
                        </div>

                        {/* Tabs Section */}
                        <div className="flex-1 flex flex-col px-6 pb-6 mt-2">
                            <Tabs
                                selectedKey={activeTab}
                                onSelectionChange={(key) => setActiveTab(String(key))}
                                className="w-full flex-1 flex flex-col"
                            >
                                <Tabs.ListContainer>
                                    <Tabs.List aria-label="Role management tabs" className="w-fit">
                                        <Tabs.Tab id="info">
                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                <Info size={16} />
                                                <span>Thông tin</span>
                                            </div>
                                            <Tabs.Indicator />
                                        </Tabs.Tab>
                                        <Tabs.Tab id="permissions">
                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                <Lock size={16} />
                                                <span>Quyền hạn</span>
                                            </div>
                                            <Tabs.Indicator />
                                        </Tabs.Tab>
                                        <Tabs.Tab id="members">
                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                <Users size={16} />
                                                <span>Thành viên {activeRole?.total_members !== undefined ? `(${activeRole.total_members})` : ''}</span>
                                            </div>
                                            <Tabs.Indicator />
                                        </Tabs.Tab>
                                    </Tabs.List>
                                </Tabs.ListContainer>

                                <Tabs.Panel id="info">
                                    <RoleDetailInfo activeRole={activeRole} isLoading={isLoading} />
                                </Tabs.Panel>

                                <Tabs.Panel id="permissions">
                                    <RoleDetailPermissions activeRole={activeRole} />
                                </Tabs.Panel>

                                <Tabs.Panel id="members">
                                    <RoleDetailMembers activeRole={activeRole} />
                                </Tabs.Panel>
                            </Tabs>
                        </div>
                    </div>
                ) : (
                    <RoleDetailPlaceholder />
                )}
            </div>

            <RoleModal
                isOpen={roleModal.isOpen}
                onClose={() => setRoleModal({ ...roleModal, isOpen: false })}
                role={roleModal.role}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
                    queryClient.invalidateQueries({ queryKey: ['roleOptionsSidebar'] })
                }}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                content={confirmModal.content}
                isDanger={confirmModal.isDanger}
                isLoading={confirmModal.isLoading}
            />
        </div>
    )
}
