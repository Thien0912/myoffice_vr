import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Selection
} from '@heroui/react'
import { ExcelIcon } from '@renderer/components/OfficeIcon'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import SearchInput from '@renderer/components/SearchInput'
import { AnimatePresence, motion } from 'framer-motion'
import {
    CheckCircle,
    LayoutDashboard,
    MoreHorizontal,
    XCircle
} from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'

interface NhanVienTuCapNhatToolbarProps {
    showStatsCards: boolean
    setShowStatsCards: (show: boolean) => void
    onSearch?: (val: string) => void
    searchTerm?: string
    selectedKeys: Selection
    onOpenExport?: () => void
    isExporting?: boolean
    canExport?: boolean
    allColumns?: any[]
    visibleColumns?: string[]
    setVisibleColumns?: (columns: string[]) => void
    onBulkApprove?: () => void
    onBulkReject?: () => void
    isProcessing?: boolean
}

export default function NhanVienTuCapNhatToolbar({
    showStatsCards,
    setShowStatsCards,
    onSearch = () => { },
    searchTerm = '',
    selectedKeys,
    onOpenExport,
    isExporting = false,
    canExport = true,
    allColumns = [],
    visibleColumns = [],
    setVisibleColumns,
    onBulkApprove,
    onBulkReject,
    isProcessing = false
}: NhanVienTuCapNhatToolbarProps) {
    const hasSelection =
        selectedKeys === 'all' || (selectedKeys instanceof Set ? selectedKeys.size > 0 : false)
    const selectedCount =
        selectedKeys === 'all' ? 'tất cả' : selectedKeys instanceof Set ? selectedKeys.size : 0

    const [searchValue, setSearchValue] = useState(searchTerm)
    const initialRender = useRef(true)

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false
            return
        }
        const timer = setTimeout(() => {
            onSearch(searchValue)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchValue, onSearch])

    return (
        <div className="flex flex-col gap-4 rounded-sm px-6">
            {/* Row 1: Search & Actions */}
            <AnimatePresence mode="wait">
                {hasSelection ? (
                    <motion.div
                        key="bulk-actions"
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="flex items-center h-10 gap-3 px-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg w-full"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                                Đã chọn:{' '}
                                <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-md text-[11px] ml-1 inline-flex items-center justify-center min-w-5">
                                    {selectedCount}
                                </span>
                            </span>
                            <div className="w-px h-6 bg-blue-200 dark:bg-blue-800" />

                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    color="success"
                                    variant="flat"
                                    startContent={<CheckCircle size={16} />}
                                    onPress={onBulkApprove}
                                    isDisabled={isProcessing}
                                    isLoading={isProcessing}
                                    className="font-semibold h-8"
                                >
                                    DUYỆT
                                </Button>
                                <Button
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                    startContent={<XCircle size={16} />}
                                    onPress={onBulkReject}
                                    isDisabled={isProcessing}
                                    isLoading={isProcessing}
                                    className="font-semibold h-8"
                                >
                                    TỪ CHỐI
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="w-full flex flex-row items-center justify-between gap-3">
                        <div className="flex-1 md:max-w-[320px] lg:max-w-[400px] flex items-center gap-2 min-w-0">
                            <SearchInput
                                value={searchValue}
                                onChange={setSearchValue}
                                className="flex-1 w-full"
                                placeholder="Tìm kiếm mã NV, họ tên, email..."
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center gap-1.5 ml-1">
                                <div className="hidden md:block">
                                    <TableColumnVisibility
                                        columns={allColumns}
                                        visibleColumns={new Set(visibleColumns)}
                                        setVisibleColumns={(keys) => setVisibleColumns?.(Array.from(keys))}
                                        label="Cột"
                                    />
                                </div>
                            </div>

                            <Dropdown
                                classNames={{
                                    content:
                                        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 min-w-[180px] shadow-xl'
                                }}
                            >
                                <DropdownTrigger>
                                    <Button
                                        variant="flat"
                                        isIconOnly
                                        size="sm"
                                        radius="sm"
                                        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    >
                                        <MoreHorizontal size={18} className="text-gray-600 dark:text-gray-300" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="More Actions" variant="flat">
                                    <DropdownItem
                                        key="toggle-stats"
                                        startContent={<LayoutDashboard size={18} />}
                                        onPress={() => setShowStatsCards(!showStatsCards)}
                                        className={showStatsCards ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''}
                                    >
                                        {showStatsCards ? 'Ẩn thống kê' : 'Hiện thống kê'}
                                    </DropdownItem>
                                    <DropdownItem
                                        key="export-excel"
                                        startContent={<ExcelIcon size={18} />}
                                        onPress={onOpenExport}
                                        isDisabled={!canExport || isExporting}
                                        showDivider
                                        className="text-gray-700 dark:text-gray-300"
                                    >
                                        Xuất Excel
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
