import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spinner, cn } from '@heroui/react'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import SearchInput from '@renderer/components/SearchInput'
import { History, Plus, RotateCcw, ServerCog } from 'lucide-react'
import React from 'react'
import { UserFilterPopover } from './UserFilterPopover'

interface UserToolbarProps {
    search: string
    onSearchChange: (value: string) => void
    isLoading?: boolean
    onAddUser?: () => void
    onHistoryOpen?: () => void
    onReset?: () => void
    filter: any
    setFilter: (filter: any) => void
    onPageChange: (page: number) => void
    columns: any[]
    visibleColumns: Set<string>
    setVisibleColumns: (keys: any) => void
    donviOptions: any[]
    roleOptions: any[]
}

export const UserToolbar: React.FC<UserToolbarProps> = ({
    search,
    onSearchChange,
    isLoading,
    onAddUser,
    onHistoryOpen,
    onReset,
    filter,
    setFilter,
    onPageChange,
    columns,
    visibleColumns,
    setVisibleColumns,
    donviOptions,
    roleOptions
}) => {
    return (
        <div className="flex flex-col gap-3 px-6 mb-1">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 w-full lg:flex-1">
                    <div className="flex-1 md:max-w-[320px] lg:max-w-[400px] flex items-center gap-2 min-w-0">
                        <SearchInput
                            placeholder="Tìm kiếm người dùng..."
                            value={search}
                            onChange={onSearchChange}
                            className="flex-1 w-full"
                        />
                        <div className="flex items-center gap-1 shrink-0 px-1">
                            {isLoading && <Spinner size="sm" />}
                            <UserFilterPopover
                                filter={filter}
                                setFilter={setFilter}
                                onPageChange={onPageChange}
                                donviOptions={donviOptions}
                                roleOptions={roleOptions}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 lg:ml-auto w-full lg:w-auto justify-end">
                    <TableColumnVisibility
                        columns={columns}
                        visibleColumns={visibleColumns}
                        setVisibleColumns={setVisibleColumns}
                        label="Ẩn/Hiện Cột"
                    />

                    <Button
                        className="font-bold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
                        radius="sm"
                        size="sm"
                        variant="flat"
                        startContent={<History size={18} className="text-gray-500" />}
                        onPress={onHistoryOpen}
                    >
                        Lịch sử đăng nhập
                    </Button>

                    <Button
                        color="primary"
                        variant="solid"
                        className="font-bold px-4"
                        radius="sm"
                        size="sm"
                        startContent={<Plus size={18} strokeWidth={3} />}
                        onPress={onAddUser}
                    >
                        Tạo mới
                    </Button>

                    <Dropdown
                        classNames={{
                            content: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 min-w-[180px]'
                        }}
                    >
                        <DropdownTrigger>
                            <Button
                                variant="flat"
                                radius="sm"
                                isIconOnly
                                size="sm"
                                className="bg-gray-100 dark:bg-gray-700 h-8 w-8 min-w-8"
                            >
                                <ServerCog
                                    size={18}
                                    strokeWidth={2}
                                    className="text-gray-600 dark:text-gray-400"
                                />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="More Actions" variant="flat">
                            <DropdownItem
                                key="reset"
                                startContent={<RotateCcw size={16} />}
                                onPress={onReset}
                                className="text-danger font-medium"
                                color="danger"
                            >
                                Khôi phục mặc định
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}
