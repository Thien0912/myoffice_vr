import { Button, Dropdown, Spinner, Label } from '@heroui-v3/react'
import { HrPrimaryButton } from '@renderer/components/hero-custom'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { FileText, LayoutDashboard, MoreHorizontal, Plus, RotateCcw } from 'lucide-react'
import React, { useCallback, useRef, useState } from 'react'
import ThoiviecFilterPopover from './ThoiviecFilterPopover'

import SearchInput from '@renderer/components/SearchInput'

interface ThoiviecToolbarProps {
    showStats: boolean
    setShowStats: (show: boolean) => void
    onSearch: (val: string) => void
    isLoading?: boolean
    filter: any
    setFilter: (val: any) => void
    onClearFilter: () => void
    donviOptions: any[]
    vitriOptions: any[]
    allColumns: any[]
    visibleColumns: Set<string>
    setVisibleColumns: (columns: Set<string>) => void
    onOpenManageProcedures: () => void
    onOpenAdd: () => void
    onResetTable: () => void
}

export default function ThoiviecToolbar({
    showStats,
    setShowStats,
    onSearch,
    isLoading,
    filter,
    setFilter,
    onClearFilter,
    donviOptions,
    vitriOptions,
    allColumns,
    visibleColumns,
    setVisibleColumns,
    onOpenManageProcedures,
    onOpenAdd,
    onResetTable
}: ThoiviecToolbarProps) {
    const [searchValue, setSearchValue] = React.useState('')

    React.useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchValue)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchValue, onSearch])

    return (
        <div className="flex flex-col gap-4 rounded-sm px-6">
            <div className="w-full flex flex-row items-center justify-between gap-3">
                <div className="flex-1 md:max-w-[320px] lg:max-w-[400px] flex items-center gap-2 min-w-0">
                    <SearchInput
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Tìm kiếm..."
                        className="flex-1 w-full"
                    />
                    {isLoading && <Spinner size="sm" />}
                    <ThoiviecFilterPopover
                        filter={filter}
                        onFilterChange={setFilter}
                        onClear={onClearFilter}
                        donviOptions={donviOptions}
                        vitriOptions={vitriOptions}
                        trangThaiOptions={[
                            { label: 'Đang làm thủ tục', value: 'DANG_LAM_THU_TUC_THOI_VIEC' },
                            { label: 'Nghỉ việc', value: 'NGHI_VIEC' },
                            { label: 'Thôi việc', value: 'THOI_VIEC' }
                        ]}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-1.5 ml-1">
                        <div className="hidden md:block">
                            <TableColumnVisibility
                                columns={allColumns}
                                visibleColumns={visibleColumns}
                                setVisibleColumns={setVisibleColumns}
                                label="Cột"
                            />
                        </div>
                    </div>

                    <HrPrimaryButton
                        onPress={onOpenAdd}
                        className="hidden md:flex"
                    >
                        Thêm thôi việc
                    </HrPrimaryButton>

                    {/* Desktop Dropdown - 3 chức năng */}
                    <Dropdown>
                        <Dropdown.Trigger>
                            <Button
                                variant="ghost"
                                isIconOnly
                                className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 h-10 w-10 hidden md:flex rounded-sm"
                            >
                                <MoreHorizontal
                                    size={20}
                                    strokeWidth={1.5}
                                    className="text-gray-600 dark:text-gray-300"
                                />
                            </Button>
                        </Dropdown.Trigger>
                        <Dropdown.Popover placement="bottom end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 min-w-[200px] shadow-xl">
                            <Dropdown.Menu
                                aria-label="Table Settings"
                                onAction={(key) => {
                                    if (key === 'toggleStats') setShowStats(!showStats)
                                    if (key === 'manage-proc') onOpenManageProcedures()
                                    if (key === 'reset') onResetTable()
                                }}
                            >
                                <Dropdown.Item key="toggleStats" textValue={showStats ? 'Ẩn thống kê' : 'Hiện thống kê'}>
                                    <LayoutDashboard size={16} className={showStats ? 'text-blue-600' : ''} />
                                    <Label>{showStats ? 'Ẩn thống kê' : 'Hiện thống kê'}</Label>
                                </Dropdown.Item>
                                <Dropdown.Item key="manage-proc" textValue="Quản lý thủ tục">
                                    <FileText size={16} />
                                    <Label>Quản lý thủ tục</Label>
                                </Dropdown.Item>
                                <Dropdown.Item key="reset" textValue="Khôi phục giao diện bảng" variant="danger">
                                    <RotateCcw size={16} className="text-danger" />
                                    <Label>Khôi phục giao diện bảng</Label>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>

                    {/* Mobile Dropdown - tất cả chức năng */}
                    <Dropdown>
                        <Dropdown.Trigger>
                            <Button
                                variant="ghost"
                                isIconOnly
                                className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 h-10 w-10 md:hidden flex rounded-sm"
                            >
                                <MoreHorizontal
                                    size={20}
                                    strokeWidth={1.5}
                                    className="text-gray-600 dark:text-gray-300"
                                />
                            </Button>
                        </Dropdown.Trigger>
                        <Dropdown.Popover placement="bottom end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 min-w-[180px] shadow-xl">
                            <Dropdown.Menu
                                aria-label="Table Settings"
                                onAction={(key) => {
                                    if (key === 'toggleStats') setShowStats(!showStats)
                                    if (key === 'manage-proc') onOpenManageProcedures()
                                    if (key === 'add') onOpenAdd()
                                    if (key === 'reset') onResetTable()
                                }}
                            >
                                <Dropdown.Item key="toggleStats" textValue={showStats ? 'Ẩn thống kê' : 'Hiện thống kê'}>
                                    <LayoutDashboard size={16} />
                                    <Label>{showStats ? 'Ẩn thống kê' : 'Hiện thống kê'}</Label>
                                </Dropdown.Item>
                                <Dropdown.Item key="manage-proc" textValue="Quản lý thủ tục">
                                    <FileText size={16} />
                                    <Label>Quản lý thủ tục</Label>
                                </Dropdown.Item>
                                <Dropdown.Item key="add" textValue="Thêm thôi việc" className="text-primary">
                                    <Plus size={16} className="text-primary" />
                                    <Label>Thêm thôi việc</Label>
                                </Dropdown.Item>
                                <Dropdown.Item key="reset" textValue="Khôi phục mặc định" variant="danger">
                                    <RotateCcw size={16} className="text-danger" />
                                    <Label>Khôi phục mặc định</Label>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}
