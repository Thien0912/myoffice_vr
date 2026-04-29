import {
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Selection,
    Select,
    SelectItem
} from '@heroui/react'
import { HrPrimaryButton } from '@renderer/components/hero-custom'
import { DonviAxios } from '@renderer/api/danhmuc/DonviAxios'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import { ExcelIcon } from '@renderer/components/OfficeIcon'
import SearchInput from '@renderer/components/SearchInput'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import ProposeFilterPopover from './ProposeFilterPopover'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Filter,
    LayoutDashboard,
    List,
    MessageCircle,
    MoreHorizontal,
    Plus,
    Search,
    Table,
    Tags,
    Trash2,
    X
} from 'lucide-react'
import React, { useCallback, useMemo, useRef, useState } from 'react'

interface ProposeToolbarProps {
    search?: string
    showStatsCards: boolean
    setShowStatsCards: (show: boolean) => void
    viewType: 'table' | 'list'
    onViewTypeChange: (type: 'table' | 'list') => void
    onSearch?: (val: string) => void
    onCreate?: () => void
    selectedKeys: Selection
    onOpenExport?: () => void
    isExporting?: boolean
    canExport?: boolean
    onFilterChange?: (key: string, value: any) => void
    onToggleSidebar?: () => void
    allColumns?: any[]
    visibleColumns?: string[]
    setVisibleColumns?: (columns: string[]) => void
    onComment?: () => void
    onOpenLoaiDeXuat?: () => void
    onTrash?: () => void
    activeTab?: string
}

export default function ProposeToolbar({
    showStatsCards,
    setShowStatsCards,
    viewType,
    onViewTypeChange,
    search = '',
    onSearch = () => { },
    onCreate,
    selectedKeys,
    onOpenExport,
    isExporting = false,
    canExport = true,
    onFilterChange = () => { },
    allColumns = [],
    visibleColumns = [],
    setVisibleColumns,
    onComment,
    onOpenLoaiDeXuat,
    onTrash,
    activeTab = 'all'
}: ProposeToolbarProps) {
    const hasSelection =
        selectedKeys === 'all' || (selectedKeys instanceof Set ? selectedKeys.size > 0 : false)
    const selectedCount =
        selectedKeys === 'all' ? 'tất cả' : selectedKeys instanceof Set ? selectedKeys.size : 0

    const [filterProposer, setFilterProposer] = useState<string>('')
    const [filterDepartment, setFilterDepartment] = useState<string>('')
    const [filterDateRange, setFilterDateRange] = useState<{ from?: string; to?: string }>({})

    // Fetch users for filter (Only those who have proposals)
    const { data: userOptions = [] } = useQuery({
        queryKey: ['propose-creators-filter'],
        queryFn: async () => {
            try {
                const res = await dexuatAxios.getCreators()
                if (!res?.success && !res?.status) return []

                const items = Array.isArray(res.data) ? res.data : []

                return items.map((item: any) => ({
                    value: String(item.created_user_id),
                    label: item.ho_va_ten || item.ho_ten || 'N/A'
                }))
            } catch (err) {
                console.error('Error fetching propose creators:', err)
                return []
            }
        },
        staleTime: 30 * 60 * 1000
    })

    // Fetch departments for filter
    const { data: departments = [] } = useQuery({
        queryKey: ['departments-filter'],
        queryFn: async () => {
            try {
                const res = await DonviAxios.fetch({ length: 9999 })
                if (!res?.success) return []
                return res.data || []
            } catch (err) {
                console.error('Error fetching departments:', err)
                return []
            }
        },
        staleTime: 30 * 60 * 1000
    })



    const activeFilterCount = [filterProposer, filterDepartment, filterDateRange?.from].filter(Boolean).length

    return (
        <div className="flex flex-col gap-4">
            {/* Row 1: Search & Bulk Actions */}
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
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                                Đã chọn:{' '}
                                <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-md text-[11px] ml-1 inline-flex items-center justify-center min-w-5">
                                    {selectedCount}
                                </span>
                            </span>
                            <div className="w-px h-6 bg-blue-200 dark:bg-blue-800" />
                            {/* Thêm các bulk actions ở đây nếu có */}
                        </div>
                    </motion.div>
                ) : (
                    <div className="w-full flex flex-row items-center justify-between gap-3">
                        <div className="flex-1 md:max-w-[320px] lg:max-w-[400px] flex items-center gap-2 min-w-0">
                            <SearchInput
                                placeholder="Tìm theo tiêu đề, nội dung, người đề xuất..."
                                value={search}
                                onChange={onSearch}
                                className="flex-1 w-full"
                            />

                            <ProposeFilterPopover
                                filterProposer={filterProposer}
                                filterDepartment={filterDepartment}
                                filterDateRange={filterDateRange}
                                setFilterProposer={setFilterProposer}
                                setFilterDepartment={setFilterDepartment}
                                setFilterDateRange={setFilterDateRange}
                                onFilterChange={onFilterChange}
                                userOptions={userOptions}
                                departments={departments}
                                activeFilterCount={activeFilterCount}
                            />

                            {/* Trash badge - bên phải input */}
                            {activeTab === 'trash' && (
                                <Chip
                                    size="sm"
                                    radius="full"
                                    variant="flat"
                                    color="danger"
                                    startContent={<Trash2 size={12} />}
                                    endContent={
                                        <button
                                            onClick={onTrash}
                                            className="ml-0.5 hover:bg-red-200 rounded-full transition-colors"
                                        >
                                            <X size={11} />
                                        </button>
                                    }
                                    className="shrink-0 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-none font-medium"
                                >
                                    Thùng rác
                                </Chip>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <HrPrimaryButton
                                onPress={onCreate}
                                className="hidden md:flex"
                            >
                                Tạo đề xuất
                            </HrPrimaryButton>
                            <Button
                                color="primary"
                                variant="flat"
                                size="sm"
                                radius="sm"
                                startContent={<MessageCircle size={18} />}
                                onPress={onComment}
                                className="hidden md:flex font-bold px-4 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            >
                                Bình luận
                            </Button>
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
                                        key="view-table"
                                        startContent={<Table size={18} />}
                                        onPress={() => onViewTypeChange('table')}
                                        color={viewType === 'table' ? 'primary' : 'default'}
                                        className={
                                            viewType === 'table' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''
                                        }
                                    >
                                        Dạng bảng
                                    </DropdownItem>
                                    <DropdownItem
                                        key="view-list"
                                        startContent={<List size={18} />}
                                        onPress={() => onViewTypeChange('list')}
                                        color={viewType === 'list' ? 'primary' : 'default'}
                                        className={
                                            viewType === 'list' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''
                                        }
                                        showDivider
                                    >
                                        Dạng danh sách
                                    </DropdownItem>
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
                                        className="text-gray-700 dark:text-gray-300"
                                    >
                                        Xuất Excel
                                    </DropdownItem>
                                    <DropdownItem
                                        key="loai-de-xuat"
                                        startContent={<Tags size={18} />}
                                        onPress={onOpenLoaiDeXuat}
                                        showDivider
                                        className="text-gray-700 dark:text-gray-300"
                                    >
                                        Danh mục loại đề xuất
                                    </DropdownItem>
                                    <DropdownItem
                                        key="trash"
                                        startContent={<Trash2 size={18} className={activeTab === 'trash' ? 'text-white' : 'text-red-500'} />}
                                        onPress={onTrash}
                                        className={activeTab === 'trash' ? 'bg-red-500 text-white' : 'text-red-500'}
                                    >
                                        {activeTab === 'trash' ? 'Thoát thùng rác' : 'Thùng rác'}
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
