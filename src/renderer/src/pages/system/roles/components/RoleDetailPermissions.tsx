import { Accordion } from '@heroui-v3/react'
import {
    Button,
    Checkbox,
    Skeleton,
    cn
} from '@heroui/react'
import SearchInput from '@renderer/components/SearchInput'
import { Role } from '@renderer/api/admin/rolesAxios'
import { ChevronDown, Save, Search } from 'lucide-react'
import { useRolePermissionLogic } from '../hooks/useRolePermissionLogic'

interface RoleDetailPermissionsProps {
    activeRole: Role | undefined
}

export const RoleDetailPermissions = ({ activeRole }: RoleDetailPermissionsProps) => {
    const {
        groupedPermissions,
        selectedPermissionIds,
        isLoading,
        search,
        setSearch,
        togglePermission,
        toggleGroup,
        handleSave,
        isSaving,
        hasChanges
    } = useRolePermissionLogic({ activeRole })

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3 py-3">
                <Skeleton className="h-14 rounded-xl w-full" />
                <div className="flex flex-col gap-3 mt-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-10 rounded-lg w-full" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Search & Actions Bar */}
            <div className="flex items-center justify-between gap-3 shrink-0 pb-3 px-2">
                <div className="relative max-w-md mt-3 w-52 ml-3">
                    <SearchInput
                        placeholder="Tìm kiếm quyền hạn..."
                        value={search}
                        onChange={setSearch}
                        className="w-full bg-white dark:bg-gray-900"
                    />
                </div>

                <div className="flex items-center gap-2 mr-3">
                    <Button
                        onPress={() => handleSave()}
                        isLoading={isSaving}
                        isDisabled={!hasChanges}
                        className="h-9 px-4 bg-[#C2E7FF] hover:bg-[#b5dffa] active:bg-[#99c8e8] text-[#001D35] font-semibold rounded-xl transition-all duration-250 shadow-sm hover:shadow-md border-none flex items-center gap-1.5"
                    >
                        <Save size={16} />
                        Lưu thay đổi
                    </Button>
                </div>
            </div>

            {/* Permissions Table-like List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                <div className="flex flex-col gap-2.5">
                    <Accordion className="px-0 gap-3">
                        {groupedPermissions.length > 0 ? (
                            groupedPermissions.map((group) => {
                                const subModules = group.subModules || []
                                const allChildrenIds: (string | number)[] = []
                                subModules.forEach((sm: any) => {
                                    allChildrenIds.push(...sm.children.map((c: any) => c.ql_quyen_id))
                                })

                                const isAllSelected = allChildrenIds.length > 0 && allChildrenIds.every((id) => selectedPermissionIds.includes(id))
                                const isSomeSelected = allChildrenIds.some((id) => selectedPermissionIds.includes(id)) && !isAllSelected

                                const standardActions = [
                                    { key: 'xem', label: 'Xem', type: 1 },
                                    { key: 'them', label: 'Thêm', type: 2 },
                                    { key: 'sua', label: 'Sửa', type: 3 },
                                    { key: 'xoa', label: 'Xóa', type: 4 }
                                ]

                                return (
                                    <Accordion.Item key={group.ql_quyen_id} className="border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-none px-0">
                                        <Accordion.Heading>
                                            <Accordion.Trigger
                                                className="flex w-full items-center justify-between px-3.5 py-2.5 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Checkbox
                                                        isSelected={isAllSelected}
                                                        isIndeterminate={isSomeSelected}
                                                        onValueChange={() => toggleGroup(group.ql_quyen_id, allChildrenIds)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        color="primary"
                                                    />
                                                    <div className="flex flex-col min-w-0 text-left">
                                                        <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                                                            {group.ql_quyen_ten}
                                                        </span>
                                                        {group.ql_quyen_mo_ta && (
                                                            <span className="text-[10px] text-gray-400 truncate max-w-xs md:max-w-md">
                                                                {group.ql_quyen_mo_ta}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Accordion.Indicator>
                                                    <ChevronDown size={16} className="text-gray-400" />
                                                </Accordion.Indicator>
                                            </Accordion.Trigger>
                                        </Accordion.Heading>
                                        <Accordion.Panel>
                                            <Accordion.Body className="p-0 border-t border-gray-50 dark:border-gray-800">
                                                <div className="bg-gray-50/30 dark:bg-gray-900/20">
                                                    {/* Table Header for Columns */}
                                                    <div className="grid grid-cols-12 px-5 py-2.5 border-b border-gray-50 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50">
                                                        <div className="col-span-3">Chức năng</div>
                                                        <div className="col-span-1 text-center">Xem</div>
                                                        <div className="col-span-1 text-center">Thêm</div>
                                                        <div className="col-span-1 text-center">Sửa</div>
                                                        <div className="col-span-1 text-center">Xóa</div>
                                                        <div className="col-span-5 pl-8">Tùy chọn khác</div>
                                                    </div>

                                                    {/* Table Body - Iterating rows/subModules */}
                                                    {subModules.map((sm: any, smIdx: number) => {
                                                        const mappedStandards: Record<string, any> = {}
                                                        const options: any[] = []

                                                        sm.children.forEach((child: any) => {
                                                            const actionType = Number(child.ql_quyen_action_type)
                                                            let found = false
                                                            for (const action of standardActions) {
                                                                if (actionType === action.type) {
                                                                    mappedStandards[action.key] = child
                                                                    found = true
                                                                    break
                                                                }
                                                            }
                                                            if (!found) options.push(child)
                                                        })

                                                        return (
                                                            <div key={sm.ql_quyen_id} className={cn(
                                                                "grid grid-cols-12 px-5 py-3 items-start",
                                                                smIdx !== subModules.length - 1 && "border-b border-gray-50 dark:border-gray-800"
                                                            )}>
                                                                {/* Row Label */}
                                                                <div className="col-span-3 flex items-center pr-3">
                                                                    <span className={cn(
                                                                        "text-xs font-medium",
                                                                        group.isMerged ? "text-gray-700 dark:text-gray-300" : "text-transparent pointer-events-none"
                                                                    )}>
                                                                        {sm.ql_quyen_ten}
                                                                    </span>
                                                                </div>

                                                                {/* Standard Column Actions */}
                                                                {standardActions.map((action) => {
                                                                    const permission = mappedStandards[action.key]
                                                                    return (
                                                                        <div key={action.key} className="col-span-1 flex justify-center">
                                                                            {permission ? (
                                                                                <div className="flex flex-col items-center gap-1">
                                                                                    <Checkbox
                                                                                        isSelected={selectedPermissionIds.includes(permission.ql_quyen_id)}
                                                                                        onValueChange={() => togglePermission(permission.ql_quyen_id)}
                                                                                        size="sm"
                                                                                    />
                                                                                    <span className="text-[10px] md:hidden text-gray-400 uppercase">{action.label}</span>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="w-4 h-4 rounded-full border border-gray-100 dark:border-gray-800 opacity-20" />
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })}

                                                                {/* Options Column */}
                                                                <div className="col-span-5 pl-8 border-l border-gray-100 dark:border-gray-800">
                                                                    {options.length > 0 ? (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
                                                                            {options.map((opt) => (
                                                                                <div key={opt.ql_quyen_id} className="flex items-center group/opt">
                                                                                    <Checkbox
                                                                                        isSelected={selectedPermissionIds.includes(opt.ql_quyen_id)}
                                                                                        onValueChange={() => togglePermission(opt.ql_quyen_id)}
                                                                                        size="sm"
                                                                                        classNames={{
                                                                                            label: cn(
                                                                                                'text-xs font-medium transition-colors select-none',
                                                                                                selectedPermissionIds.includes(opt.ql_quyen_id)
                                                                                                    ? 'text-blue-600 dark:text-blue-400'
                                                                                                    : 'text-gray-600 dark:text-gray-400 group-hover/opt:text-gray-800 dark:group-hover/opt:text-gray-200'
                                                                                            )
                                                                                        }}
                                                                                    >
                                                                                        {opt.ql_quyen_ten}
                                                                                    </Checkbox>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-full flex items-center">
                                                                            <span className="text-[11px] text-gray-300 italic">Không có tùy chọn bổ sung</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                )
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="p-4 bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
                                    <Search size={32} className="text-gray-300" />
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-700 dark:text-gray-200 font-bold text-sm">Không tìm thấy quyền hạn</p>
                                    <p className="text-gray-500 text-[11px] italic">Thử thay đổi từ khóa tìm kiếm của bạn</p>
                                </div>
                            </div>
                        )}
                    </Accordion>
                </div>
            </div>
        </div>
    )
}
