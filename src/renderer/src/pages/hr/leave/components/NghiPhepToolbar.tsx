import {
    Badge,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Selection,
    Tab,
    Tabs,
    cn,
    useDisclosure
} from '@heroui/react'
import SearchInput from '@renderer/components/SearchInput'
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import { LoaiNghiPhepAxios } from '@renderer/api/danhmuc/loaiNghiPhepAxios'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import EmployeeListModal from '@renderer/components/EmployeeListModal'
import { ExcelIcon, WordIcon } from '@renderer/components/OfficeIcon'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { HrPrimaryButton } from '@renderer/components/hero-custom'
import {

    Building2,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    Contact,
    Eye,
    FileText,
    Filter,
    LayoutDashboard,
    LayoutGrid,
    MapPin,
    MoreHorizontal,
    Plus,
    RotateCcw,
    Search,
    Tag,
    Upload,
    UserRound,
    XCircle
} from 'lucide-react'
import React, { useEffect, useState } from 'react'


interface NghiPhepToolbarProps {
    showStatsCards: boolean
    setShowStatsCards: (show: boolean) => void
    showQuotaSidebar: boolean
    setShowQuotaSidebar: (show: boolean) => void
    isQuotaCollapsed?: boolean
    onToggleQuotaCollapse?: () => void
    onSearch?: (val: string) => void
    searchValue?: string
    onCreate?: () => void
    selectedKeys: Selection
    onBulkAction: (type: 'approve' | 'reject') => void
    canShowQuota?: boolean
    filter: Record<string, any>
    onFilterChange: (filter: Record<string, any>) => void
    allColumns?: any[]
    visibleColumns?: string[]
    setVisibleColumns?: (columns: string[]) => void
    onOpenExport?: () => void
    onExportByEmployee?: () => void
    onExportByDepartment?: () => void
    onOpenImport?: () => void
    isExporting?: boolean
    canExport?: boolean
    canExportDoc?: boolean
    canImport?: boolean
    canApprove?: boolean
    canApproveOnBehalf?: boolean
    onBulkApproveOnBehalf?: (type: 'approve' | 'reject') => void
    canViewDonViFilter?: boolean
    onClearSelection?: () => void
    isTab2?: boolean
    selectedRows?: any[]
    currentUserId?: string | number
    onEdit?: (row: any) => void
    onView?: (row: any) => void
    onRecall?: (row: any) => void
    onMinhChung?: (row: any) => void
    onPhucKhao?: (row: any) => void
}

export default function NghiPhepToolbar({
    showStatsCards,
    setShowStatsCards,
    showQuotaSidebar,
    setShowQuotaSidebar,
    onSearch = () => { },
    searchValue = '',
    onCreate,
    selectedKeys,
    onBulkAction,
    canShowQuota = false,
    filter,
    onFilterChange,
    allColumns = [],
    visibleColumns = [],
    setVisibleColumns,
    onOpenExport,
    onExportByEmployee,
    onExportByDepartment,
    onOpenImport,
    isExporting = false,
    canExport = false,
    canExportDoc = false,
    canImport = false,
    canApprove = false,
    canApproveOnBehalf = false,
    onBulkApproveOnBehalf,
    canViewDonViFilter = true,
    onClearSelection,
    isTab2 = false,
    selectedRows = [],
    currentUserId,
    onEdit,
    onView,
    onRecall,
    onMinhChung,
    onPhucKhao
}: NghiPhepToolbarProps) {
    const [leaveTypes, setLeaveTypes] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false)
    const [activeFilterTab, setActiveFilterTab] = useState('time')
    const [showCustomDate, setShowCustomDate] = useState(false)
    const [customDateRange, setCustomDateRange] = useState<{ from?: string; to?: string }>({})
    const [isMobile, setIsMobile] = useState(false)


    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        setCustomDateRange(filter.dateRange || {})
    }, [filter.dateRange])

    const today = new Date()
    const last7days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const thisYearStart = new Date(today.getFullYear(), 0, 1)
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1)
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31)

    const formatDate = (date: Date) => {
        const d = new Date(date)
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        return d.toISOString().split('T')[0]
    }

    const timePresets = [
        { label: 'Hôm nay', value: { from: formatDate(today), to: formatDate(today) } },
        { label: '7 ngày qua', value: { from: formatDate(last7days), to: formatDate(today) } },
        { label: '30 ngày qua', value: { from: formatDate(last30days), to: formatDate(today) } },
        {
            label: `Năm nay (${today.getFullYear()})`,
            value: { from: formatDate(thisYearStart), to: formatDate(today) }
        },
        {
            label: `Năm ngoái (${today.getFullYear() - 1})`,
            value: { from: formatDate(lastYearStart), to: formatDate(lastYearEnd) }
        }
    ]

    const FILTER_TABS = [
        { id: 'time', label: 'Thời gian', icon: Clock },
        { id: 'status', label: 'Trạng thái', icon: LayoutGrid },
        ...(canViewDonViFilter ? [{ id: 'unit', label: 'Đơn vị', icon: MapPin }] : []),
        { id: 'type', label: 'Loại phép', icon: Tag },
        { id: 'form', label: 'Hình thức', icon: UserRound }
    ]

    const {
        isOpen: isPersonnelModalOpen,
        onOpen: onOpenPersonnelModal,
        onOpenChange: onPersonnelModalOpenChange
    } = useDisclosure()

    const hasActiveChipFilters = !!(
        (filter.id_don_vi && filter.id_don_vi !== 'all') ||
        (filter.id_loai_phep && filter.id_loai_phep !== 'all')
    )

    useEffect(() => {
        const fetchData = async () => {
            const [leaveTypesRes, depts] = await Promise.all([
                LoaiNghiPhepAxios.fetch(),
                mapDonviGroupedOptions()
            ])
            if (leaveTypesRes.success) setLeaveTypes(leaveTypesRes.data || [])
            setDepartments(depts || [])
        }
        if (isFilterPopoverOpen || hasActiveChipFilters) fetchData()
    }, [isFilterPopoverOpen, hasActiveChipFilters])

    const activeFilterCount = Object.entries(filter).filter(([key, val]) => {
        if (val === '' || val === null || val === undefined || val === 'all') return false
        if (key === 'dateRange' && !val.from) return false
        return true
    }).length
    const hasSelection = selectedKeys === 'all' || (selectedKeys as Set<React.Key>).size > 0
    const selectedCount = selectedKeys === 'all' ? 'tất cả' : (selectedKeys as Set<React.Key>).size

    return (
        <div className="flex flex-col gap-3 bg-white dark:bg-gray-800 py-3 px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 w-full lg:flex-1">
                    {hasSelection ? (
                        <div
                            key="bulk-actions"
                            className="flex items-center flex-1 h-12 px-2 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300"
                        >
                            <div className="flex items-center gap-1">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    radius="full"
                                    size="sm"
                                    onPress={onClearSelection}
                                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-100/50"
                                >
                                    <XCircle size={18} />
                                </Button>
                                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 whitespace-nowrap ml-1">
                                    Đã chọn {selectedCount} mục
                                </span>
                            </div>

                            <div className="w-px h-6 bg-blue-200/60 dark:bg-blue-800 mx-4 hidden sm:block" />

                            <div className="flex items-center gap-1 sm:gap-2 flex-1 overflow-x-auto no-scrollbar py-1">
                                {canApprove && (
                                    <>
                                        <Button
                                            variant="light"
                                            onPress={() => onBulkAction('approve')}
                                            startContent={<Check size={18} className="text-blue-600" />}
                                            className="h-10 px-3 bg-transparent hover:bg-blue-100/40 text-blue-700 dark:text-blue-300 font-medium text-sm rounded-lg min-w-max"
                                        >
                                            Duyệt
                                        </Button>
                                        <Button
                                            variant="light"
                                            onPress={() => onBulkAction('reject')}
                                            startContent={<XCircle size={18} className="text-red-500" />}
                                            className="h-10 px-3 bg-transparent hover:bg-red-50 text-red-600 dark:text-red-400 font-medium text-sm rounded-lg min-w-max"
                                        >
                                            Từ chối
                                        </Button>
                                    </>
                                )}

                                {canApproveOnBehalf && onBulkApproveOnBehalf && (
                                    <>
                                        <Button
                                            variant="light"
                                            onPress={() => onBulkApproveOnBehalf('approve')}
                                            startContent={<CheckCircle2 size={18} className="text-green-600" />}
                                            className="h-10 px-3 bg-transparent hover:bg-green-50 text-green-600 dark:text-green-400 font-medium text-sm rounded-lg min-w-max"
                                        >
                                            Duyệt hộ
                                        </Button>
                                        <Button
                                            variant="light"
                                            onPress={() => onBulkApproveOnBehalf('reject')}
                                            startContent={<XCircle size={18} className="text-orange-500" />}
                                            className="h-10 px-3 bg-transparent hover:bg-orange-50 text-orange-600 dark:text-orange-400 font-medium text-sm rounded-lg min-w-max"
                                        >
                                            Từ chối hộ
                                        </Button>
                                    </>
                                )}

                                {((canApprove && !isTab2 && (selectedKeys === 'all' || (selectedKeys as Set<React.Key>).size > 1)) || (canApproveOnBehalf && onBulkApproveOnBehalf)) && (
                                    <div className="w-px h-6 bg-blue-200/60 dark:bg-blue-800 mx-2 hidden md:block" />
                                )}

                                {selectedRows.length === 1 && (
                                    <>
                                        <Button
                                            variant="light"
                                            onPress={() => onView?.(selectedRows[0])}
                                            startContent={<Eye size={18} className="text-blue-600" />}
                                            className="h-10 px-3 bg-transparent hover:bg-blue-100/40 text-blue-700 dark:text-blue-300 font-medium text-sm rounded-lg min-w-max"
                                        >
                                            Xem chi tiết
                                        </Button>

                                        {(Number(selectedRows[0].created_user_id) === Number(currentUserId) ||
                                            Number(selectedRows[0].ql_nguoi_dung_id) === Number(currentUserId) ||
                                            canApprove) && (
                                                <Button
                                                    variant="light"
                                                    onPress={() => onMinhChung?.(selectedRows[0])}
                                                    startContent={<Upload size={18} className="text-blue-600" />}
                                                    className="h-10 px-3 bg-transparent hover:bg-blue-100/40 text-blue-700 dark:text-blue-300 font-medium text-sm rounded-lg min-w-max"
                                                >
                                                    Minh chứng
                                                </Button>
                                            )}

                                        {(Number(selectedRows[0].created_user_id) === Number(currentUserId) ||
                                            Number(selectedRows[0].ql_nguoi_dung_id) === Number(currentUserId)) &&
                                            selectedRows[0].trang_thai_cap_mot === 'Cho_duyet' && (
                                                <>
                                                    <Button
                                                        variant="light"
                                                        onPress={() => onEdit?.(selectedRows[0])}
                                                        startContent={<FileText size={18} className="text-blue-600" />}
                                                        className="h-10 px-3 bg-transparent hover:bg-blue-100/40 text-blue-700 dark:text-blue-300 font-medium text-sm rounded-lg min-w-max"
                                                    >
                                                        Sửa đơn
                                                    </Button>
                                                    <Button
                                                        variant="light"
                                                        onPress={() => onRecall?.(selectedRows[0])}
                                                        startContent={<RotateCcw size={18} className="text-amber-600" />}
                                                        className="h-10 px-3 bg-transparent hover:bg-amber-50 text-amber-700 dark:text-amber-400 font-medium text-sm rounded-lg min-w-max"
                                                    >
                                                        Thu hồi
                                                    </Button>
                                                </>
                                            )}

                                        {(Number(selectedRows[0].created_user_id) === Number(currentUserId) ||
                                            Number(selectedRows[0].ql_nguoi_dung_id) === Number(currentUserId)) &&
                                            selectedRows[0].trang_thai_cap_mot === 'Da_duyet' && selectedRows[0].trang_thai_cap_hai === 'Da_duyet' && Number(selectedRows[0].so_lan_phuc_khao || 0) < 1 && (
                                                <Button
                                                    variant="light"
                                                    onPress={() => onPhucKhao?.(selectedRows[0])}
                                                    startContent={<RotateCcw size={18} className="text-cyan-600" />}
                                                    className="h-10 px-3 bg-transparent hover:bg-cyan-50 text-cyan-700 dark:text-cyan-400 font-medium text-sm rounded-lg min-w-max"
                                                >
                                                    Phúc khảo
                                                </Button>
                                            )}

                                        {canApprove && (
                                            <div className="w-px h-6 bg-blue-200/60 dark:bg-blue-800 mx-2 hidden md:block" />
                                        )}
                                    </>
                                )}

                                {canApprove && (
                                    <Button
                                        variant="light"
                                        onPress={onOpenExport}
                                        startContent={<Upload size={18} className="text-blue-600" />}
                                        className="h-10 px-3 bg-transparent hover:bg-blue-100/40 text-blue-700 dark:text-blue-300 font-medium text-sm rounded-lg min-w-max"
                                    >
                                        Xuất file
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div
                            key="standard-filters"
                            className="flex flex-wrap items-center gap-2 w-full flex-1"
                        >
                            <div className="flex-1 md:max-w-[320px] lg:max-w-[400px] flex items-center gap-2 min-w-0">
                                <SearchInput
                                    className="flex-1 w-full"
                                    placeholder="Tìm theo loại phép, lý do..."
                                    value={searchValue}
                                    onChange={onSearch}
                                />
                                <Popover
                                    isOpen={isFilterPopoverOpen}
                                    onOpenChange={setIsFilterPopoverOpen}
                                    placement={isMobile ? 'bottom-start' : 'bottom'}
                                    offset={10}
                                    showArrow={!isMobile}
                                    shouldCloseOnInteractOutside={(el) => {
                                        // Don't close when interacting with DatePicker calendar popover
                                        if (!el || !el.closest) return true
                                        if (
                                            el.closest('[data-slot="popover"]') ||
                                            el.closest('[role="dialog"]') ||
                                            el.closest('[role="grid"]') ||
                                            el.closest('[role="gridcell"]') ||
                                            el.closest('[data-slot="calendar"]') ||
                                            el.closest('.react-aria-Popover')
                                        ) return false
                                        return true
                                    }}
                                    classNames={{
                                        content:
                                            'p-0 bg-white dark:bg-gray-800 border-none shadow-2xl rounded-2xl overflow-hidden'
                                    }}
                                >
                                    <Badge
                                        content={activeFilterCount}
                                        color="primary"
                                        isInvisible={activeFilterCount === 0}
                                        shape="circle"
                                        className="font-bold border-1 border-white dark:border-gray-800"
                                    >
                                        <PopoverTrigger>
                                            <Button
                                                variant="light"
                                                isIconOnly
                                                radius="full"
                                                aria-label="Filter"
                                                className={`${activeFilterCount > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-800'} hover:text-blue-600 transition-colors h-9 w-9 min-w-9`}
                                                title="Bộ lọc nâng cao"
                                            >
                                                <Filter size={18} />
                                            </Button>
                                        </PopoverTrigger>
                                    </Badge>
                                    <PopoverContent>
                                        <div
                                            className={cn(
                                                'flex flex-col sm:flex-row w-[calc(100vw-40px)] sm:w-auto max-w-[460px] sm:max-w-none max-h-[80vh] sm:max-h-[500px] overflow-hidden',
                                                activeFilterTab !== 'time' && 'sm:min-w-[550px] sm:w-[550px]',
                                                activeFilterTab === 'time' && 'sm:w-max'
                                            )}
                                        >
                                            {/* Left Panel - Tabs */}
                                            <div className="w-full sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col p-2 sm:p-3 z-10">
                                                <span className="hidden sm:block text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-4 px-2 mt-1">
                                                    BỘ LỌC NÂNG CAO
                                                </span>

                                                <div className="flex-1 overflow-x-auto sm:overflow-x-visible pb-0 custom-scrollbar">
                                                    <Tabs
                                                        aria-label="Filter Tabs"
                                                        selectedKey={activeFilterTab}
                                                        onSelectionChange={(key) => setActiveFilterTab(key as string)}
                                                        variant="light"
                                                        classNames={{
                                                            base: 'w-full',
                                                            tabList:
                                                                'flex-row sm:flex-col gap-0.5 p-0 bg-transparent min-w-max sm:min-w-0 sm:w-full',
                                                            tab: 'px-2 sm:px-3 h-10 w-auto sm:w-full shrink-0',
                                                            tabContent: 'w-full',
                                                            cursor:
                                                                'w-full bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-[10px]',
                                                            panel: 'hidden'
                                                        }}
                                                    >
                                                        {FILTER_TABS.map((tab) => {
                                                            const Icon = tab.icon
                                                            const isActive = activeFilterTab === tab.id

                                                            // Calculate if this tab has an active filter
                                                            let hasFilter = false
                                                            if (tab.id === 'time' && filter.dateRange?.from)
                                                                hasFilter = true
                                                            if (
                                                                tab.id === 'status' &&
                                                                (filter.trang_thai_cap_mot || filter.trang_thai_cap_hai)
                                                            )
                                                                hasFilter = true
                                                            if (
                                                                tab.id === 'unit' &&
                                                                filter.id_don_vi &&
                                                                filter.id_don_vi !== 'all'
                                                            )
                                                                hasFilter = true
                                                            if (
                                                                tab.id === 'type' &&
                                                                filter.id_loai_phep &&
                                                                filter.id_loai_phep !== 'all'
                                                            )
                                                                hasFilter = true
                                                            if (tab.id === 'form' && filter.loai_nghi) hasFilter = true

                                                            return (
                                                                <Tab
                                                                    key={tab.id}
                                                                    title={
                                                                        <div className="flex items-center justify-between w-full h-full">
                                                                            <div className="flex items-center gap-2">
                                                                                <Icon
                                                                                    size={15}
                                                                                    className={cn(
                                                                                        isActive
                                                                                            ? 'text-blue-600'
                                                                                            : 'text-gray-400 opacity-80'
                                                                                    )}
                                                                                />
                                                                                <span
                                                                                    className={cn(
                                                                                        'font-medium transition-colors hidden sm:block',
                                                                                        isActive
                                                                                            ? 'text-blue-700 dark:text-blue-400'
                                                                                            : 'text-gray-600 dark:text-gray-400'
                                                                                    )}
                                                                                >
                                                                                    {tab.label}
                                                                                </span>
                                                                            </div>
                                                                            {hasFilter && (
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.6)] shrink-0" />
                                                                            )}
                                                                        </div>
                                                                    }
                                                                />
                                                            )
                                                        })}
                                                    </Tabs>
                                                </div>

                                                <div className="mt-2 sm:mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <Button
                                                        variant="light"
                                                        color="danger"
                                                        className="w-full justify-start px-2 sm:px-3 h-10 text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onPress={() => onFilterChange({})}
                                                        startContent={<RotateCcw size={15} />}
                                                    >
                                                        <span className="hidden sm:inline">Đặt lại bộ lọc</span>
                                                        <span className="sm:hidden">Reset</span>
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Right Panel - Content */}
                                            <div
                                                className={cn(
                                                    'bg-white dark:bg-gray-800 overflow-y-auto custom-scrollbar flex flex-col flex-1 min-w-0',
                                                    activeFilterTab === 'time'
                                                        ? 'p-0'
                                                        : 'p-4 sm:p-5 gap-6'
                                                )}
                                            >
                                                {activeFilterTab === 'time' && (
                                                    <div className="flex flex-col sm:flex-row w-full h-full sm:min-h-[350px]">

                                                        {/* ===== MOBILE: Replace view pattern ===== */}
                                                        {isMobile ? (
                                                            !showCustomDate ? (
                                                                <div
                                                                    key="presets"
                                                                    className="w-full flex flex-col p-2"
                                                                >
                                                                    {timePresets.map((preset, idx) => {
                                                                        const isSelected =
                                                                            filter.dateRange?.from === preset.value.from &&
                                                                            filter.dateRange?.to === preset.value.to &&
                                                                            !showCustomDate
                                                                        return (
                                                                            <Button
                                                                                key={idx}
                                                                                variant="light"
                                                                                className={cn(
                                                                                    'justify-start h-10 px-3 min-h-10 text-[13px] rounded-md font-medium',
                                                                                    isSelected
                                                                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                                                )}
                                                                                onPress={() => {
                                                                                    setShowCustomDate(false)
                                                                                    onFilterChange({ ...filter, dateRange: preset.value })
                                                                                    setIsFilterPopoverOpen(false)
                                                                                }}
                                                                            >
                                                                                <span className="flex-1 text-left">{preset.label}</span>
                                                                                {isSelected && <Check size={15} className="text-blue-600 dark:text-blue-400" />}
                                                                            </Button>
                                                                        )
                                                                    })}
                                                                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-2 mx-2" />
                                                                    <Button
                                                                        variant="light"
                                                                        className="justify-between h-10 px-3 min-h-10 text-[13px] rounded-md font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                                        onPress={() => setShowCustomDate(true)}
                                                                        endContent={<ChevronRight size={15} className="text-gray-400" />}
                                                                    >
                                                                        Phạm vi ngày tùy chỉnh
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    key="custom-date-mobile"
                                                                    className="w-full flex flex-col"
                                                                >
                                                                    {/* Header back */}
                                                                    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 dark:border-gray-700">
                                                                        <Button
                                                                            isIconOnly variant="light" size="sm"
                                                                            onPress={() => {
                                                                                setShowCustomDate(false)
                                                                                setCustomDateRange(filter.dateRange || {})
                                                                            }}
                                                                        >
                                                                            <ChevronRight size={16} className="rotate-180" />
                                                                        </Button>
                                                                        <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                                                                            Phạm vi ngày tùy chỉnh
                                                                        </span>
                                                                    </div>
                                                                    {/* Date Inputs */}
                                                                    <div className="flex flex-col gap-5 p-4">
                                                                        <DateInputFloatingLabel
                                                                            label="Từ ngày (Sau)"
                                                                            value={customDateRange.from || ''}
                                                                            onChange={(val) => setCustomDateRange((prev) => ({ ...prev, from: val }))}
                                                                        />
                                                                        <DateInputFloatingLabel
                                                                            label="Đến ngày (Trước)"
                                                                            value={customDateRange.to || ''}
                                                                            onChange={(val) => setCustomDateRange((prev) => ({ ...prev, to: val }))}
                                                                        />
                                                                    </div>
                                                                    {/* Actions */}
                                                                    <div className="px-4 pb-4 flex justify-between items-center">
                                                                        <Button
                                                                            variant="light" disableRipple
                                                                            className={cn(
                                                                                'font-medium px-2 min-w-max hover:bg-transparent text-[13px]',
                                                                                customDateRange.from || customDateRange.to
                                                                                    ? 'text-red-500' : 'text-gray-400'
                                                                            )}
                                                                            onPress={() => setCustomDateRange({})}
                                                                            isDisabled={!customDateRange.from && !customDateRange.to}
                                                                        >
                                                                            Xóa
                                                                        </Button>
                                                                        <Button
                                                                            color="primary"
                                                                            className="font-semibold px-5 text-[13px]"
                                                                            isDisabled={!customDateRange.from && !customDateRange.to}
                                                                            onPress={() => {
                                                                                const newFilter = { ...filter }
                                                                                if (!customDateRange.from && !customDateRange.to) {
                                                                                    delete newFilter.dateRange
                                                                                } else {
                                                                                    newFilter.dateRange = customDateRange
                                                                                }
                                                                                onFilterChange(newFilter)
                                                                                setShowCustomDate(false)
                                                                                setIsFilterPopoverOpen(false)
                                                                            }}
                                                                        >
                                                                            Áp dụng
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <>
                                                                {/* ===== DESKTOP: Presets + Side Panel ===== */}
                                                                <div className="w-[220px] shrink-0 border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col z-20">
                                                                    <div className="flex flex-col flex-1 p-2">
                                                                        {timePresets.map((preset, idx) => {
                                                                            const isSelected =
                                                                                filter.dateRange?.from === preset.value.from &&
                                                                                filter.dateRange?.to === preset.value.to &&
                                                                                !showCustomDate
                                                                            return (
                                                                                <Button
                                                                                    key={idx}
                                                                                    variant="light"
                                                                                    className={cn(
                                                                                        'justify-start h-10 px-3 min-h-10 text-[13px] rounded-md font-medium',
                                                                                        isSelected
                                                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                                                    )}
                                                                                    onPress={() => {
                                                                                        setShowCustomDate(false)
                                                                                        onFilterChange({ ...filter, dateRange: preset.value })
                                                                                    }}
                                                                                >
                                                                                    <span className="flex-1 text-left">{preset.label}</span>
                                                                                    {isSelected && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
                                                                                </Button>
                                                                            )
                                                                        })}
                                                                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-2 mx-2" />
                                                                        <Button
                                                                            variant="light"
                                                                            className={cn(
                                                                                'justify-between h-10 px-3 min-h-10 text-[13px] rounded-md font-medium',
                                                                                showCustomDate
                                                                                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                                                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                                            )}
                                                                            onPress={() => setShowCustomDate(true)}
                                                                            endContent={
                                                                                <ChevronRight
                                                                                    size={16}
                                                                                    className={cn('text-gray-400 transition-transform', showCustomDate && 'text-gray-600 dark:text-gray-300')}
                                                                                />
                                                                            }
                                                                        >
                                                                            Phạm vi ngày tùy chỉnh
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {/* Desktop: Custom Date Side Panel */}
                                                                {showCustomDate && (
                                                                    <div
                                                                        style={{ overflow: 'hidden', width: 340 }}
                                                                    >
                                                                        <div className="w-[340px] h-full flex flex-col bg-white dark:bg-gray-800">
                                                                            <div className="flex-1 p-6 flex flex-col gap-6 mt-2">
                                                                                <DateInputFloatingLabel
                                                                                    label="Từ ngày (Sau)"
                                                                                    value={customDateRange.from || ''}
                                                                                    onChange={(val) => setCustomDateRange((prev) => ({ ...prev, from: val }))}
                                                                                />
                                                                                <DateInputFloatingLabel
                                                                                    label="Đến ngày (Trước)"
                                                                                    value={customDateRange.to || ''}
                                                                                    onChange={(val) => setCustomDateRange((prev) => ({ ...prev, to: val }))}
                                                                                />
                                                                            </div>
                                                                            <div className="p-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                                                                                <Button
                                                                                    variant="light" disableRipple
                                                                                    className={cn(
                                                                                        'font-medium px-2 min-w-max hover:bg-transparent tracking-wide text-[13px] transition-colors',
                                                                                        customDateRange.from || customDateRange.to
                                                                                            ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
                                                                                            : 'text-gray-400 dark:text-gray-500'
                                                                                    )}
                                                                                    onPress={() => setCustomDateRange({})}
                                                                                    isDisabled={!customDateRange.from && !customDateRange.to}
                                                                                >
                                                                                    Xóa
                                                                                </Button>
                                                                                <div className="flex gap-2">
                                                                                    <Button
                                                                                        variant="flat"
                                                                                        className="bg-transparent text-blue-600 font-semibold px-4 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-[13px] min-w-0"
                                                                                        onPress={() => {
                                                                                            setShowCustomDate(false)
                                                                                            setCustomDateRange(filter.dateRange || {})
                                                                                        }}
                                                                                    >
                                                                                        Huỷ
                                                                                    </Button>
                                                                                    <Button
                                                                                        color="primary"
                                                                                        className="font-semibold px-4 text-[13px] min-w-0"
                                                                                        isDisabled={!customDateRange.from && !customDateRange.to}
                                                                                        onPress={() => {
                                                                                            const newFilter = { ...filter }
                                                                                            if (!customDateRange.from && !customDateRange.to) {
                                                                                                delete newFilter.dateRange
                                                                                            } else {
                                                                                                newFilter.dateRange = customDateRange
                                                                                            }
                                                                                            onFilterChange(newFilter)
                                                                                        }}
                                                                                    >
                                                                                        Áp dụng
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {activeFilterTab === 'status' && (
                                                    <div className="flex flex-col gap-5">
                                                        <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                                                            Chọn trạng thái phê duyệt
                                                        </span>
                                                        <div className="flex flex-col gap-6">
                                                            <div className="flex flex-col gap-2.5">
                                                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    Trạng thái đơn vị
                                                                </span>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {[
                                                                        {
                                                                            value: 'Cho_duyet',
                                                                            label: 'Chờ duyệt',
                                                                            Icon: Clock,
                                                                            iconColor: 'fill-yellow-500 text-white',
                                                                            activeClass:
                                                                                'border-yellow-400 bg-yellow-50 text-yellow-800 ring-0 ring-yellow-400 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-500'
                                                                        },
                                                                        {
                                                                            value: 'Da_duyet',
                                                                            label: 'Đã duyệt',
                                                                            Icon: CheckCircle2,
                                                                            iconColor: 'fill-green-500 text-white',
                                                                            activeClass:
                                                                                'border-green-400 bg-green-50 text-green-800 ring-0 ring-green-400 dark:bg-green-900/40 dark:text-green-300 dark:border-green-500'
                                                                        },
                                                                        {
                                                                            value: 'Tu_choi',
                                                                            label: 'Từ chối',
                                                                            Icon: XCircle,
                                                                            iconColor: 'fill-red-500 text-white',
                                                                            activeClass:
                                                                                'border-red-400 bg-red-50 text-red-800 ring-0 ring-red-400 dark:bg-red-900/40 dark:text-red-300 dark:border-red-500'
                                                                        }
                                                                    ].map((opt) => {
                                                                        const isActive = filter.trang_thai_cap_mot === opt.value
                                                                        const BaseIcon = opt.Icon
                                                                        return (
                                                                            <button
                                                                                key={`cap1-${opt.value}`}
                                                                                type="button"
                                                                                className={cn(
                                                                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border outline-none',
                                                                                    isActive
                                                                                        ? opt.activeClass
                                                                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                                                )}
                                                                                onClick={() => {
                                                                                    const newFilter = { ...filter }
                                                                                    if (filter.trang_thai_cap_mot === opt.value) {
                                                                                        delete newFilter.trang_thai_cap_mot
                                                                                    } else {
                                                                                        newFilter.trang_thai_cap_mot =
                                                                                            opt.value as string
                                                                                    }
                                                                                    onFilterChange(newFilter)
                                                                                }}
                                                                            >
                                                                                <BaseIcon
                                                                                    size={15}
                                                                                    className={cn('shrink-0', opt.iconColor)}
                                                                                />
                                                                                <span>{opt.label}</span>
                                                                            </button>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col gap-2.5">
                                                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                    Trạng thái Tổ chức - Hành chính
                                                                </span>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {[
                                                                        {
                                                                            value: 'Cho_duyet',
                                                                            label: 'Chờ duyệt',
                                                                            Icon: Clock,
                                                                            iconColor: 'fill-yellow-500 text-white',
                                                                            activeClass:
                                                                                'border-yellow-400 bg-yellow-50 text-yellow-800 ring-0 ring-yellow-400 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-500'
                                                                        },
                                                                        {
                                                                            value: 'Da_duyet',
                                                                            label: 'Đã duyệt',
                                                                            Icon: CheckCircle2,
                                                                            iconColor: 'fill-green-500 text-white',
                                                                            activeClass:
                                                                                'border-green-400 bg-green-50 text-green-800 ring-0 ring-green-400 dark:bg-green-900/40 dark:text-green-300 dark:border-green-500'
                                                                        },
                                                                        {
                                                                            value: 'Tu_choi',
                                                                            label: 'Từ chối',
                                                                            Icon: XCircle,
                                                                            iconColor: 'fill-red-500 text-white',
                                                                            activeClass:
                                                                                'border-red-400 bg-red-50 text-red-800 ring-0 ring-red-400 dark:bg-red-900/40 dark:text-red-300 dark:border-red-500'
                                                                        }
                                                                    ].map((opt) => {
                                                                        const isActive = filter.trang_thai_cap_hai === opt.value
                                                                        const BaseIcon = opt.Icon
                                                                        return (
                                                                            <button
                                                                                key={`cap2-${opt.value}`}
                                                                                type="button"
                                                                                className={cn(
                                                                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border outline-none',
                                                                                    isActive
                                                                                        ? opt.activeClass
                                                                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                                                )}
                                                                                onClick={() => {
                                                                                    const newFilter = { ...filter }
                                                                                    if (filter.trang_thai_cap_hai === opt.value) {
                                                                                        delete newFilter.trang_thai_cap_hai
                                                                                    } else {
                                                                                        newFilter.trang_thai_cap_hai =
                                                                                            opt.value as string
                                                                                    }
                                                                                    onFilterChange(newFilter)
                                                                                }}
                                                                            >
                                                                                <BaseIcon
                                                                                    size={15}
                                                                                    className={cn('shrink-0', opt.iconColor)}
                                                                                />
                                                                                <span>{opt.label}</span>
                                                                            </button>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {activeFilterTab === 'unit' && canViewDonViFilter && (
                                                    <div className="flex flex-col gap-5">
                                                        <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                                                            Đơn vị
                                                        </span>
                                                        <SelectDropdown
                                                            label="Đơn vị"
                                                            placeholder="Tất cả đơn vị"
                                                            radius="sm"
                                                            value={filter.id_don_vi?.toString() || 'all'}
                                                            onChange={(val) => {
                                                                const newFilter = { ...filter }
                                                                newFilter.id_don_vi =
                                                                    !val || val === 'all' ? 'all' : (val as string)
                                                                onFilterChange(newFilter)
                                                            }}
                                                            options={[
                                                                { value: 'all', label: 'Tất cả đơn vị' },
                                                                ...departments
                                                            ]}
                                                            className={cn(
                                                                filter.id_don_vi &&
                                                                filter.id_don_vi !== 'all' &&
                                                                'border-blue-500 bg-blue-50/20 dark:bg-blue-900/20'
                                                            )}
                                                        />
                                                    </div>
                                                )}

                                                {activeFilterTab === 'type' && (
                                                    <div className="flex flex-col gap-5">
                                                        <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                                                            Chọn loại đơn từ
                                                        </span>
                                                        <SelectDropdown
                                                            label="Loại phép"
                                                            placeholder="Tất cả loại phép"
                                                            radius="sm"
                                                            value={filter.id_loai_phep?.toString() || 'all'}
                                                            onChange={(val) => {
                                                                const newFilter = { ...filter }
                                                                newFilter.id_loai_phep =
                                                                    val === 'all' ? 'all' : (val as string)
                                                                onFilterChange(newFilter)
                                                            }}
                                                            options={[
                                                                { value: 'all', label: 'Tất cả loại phép' },
                                                                ...leaveTypes.map((item: any) => ({
                                                                    value: item.id_loai_phep.toString(),
                                                                    label: item.ten_loai_phep
                                                                }))
                                                            ]}
                                                            className={cn(
                                                                filter.id_loai_phep &&
                                                                filter.id_loai_phep !== 'all' &&
                                                                'border-blue-500 bg-blue-50/20 dark:bg-blue-900/20'
                                                            )}
                                                        />
                                                    </div>
                                                )}

                                                {activeFilterTab === 'form' && (
                                                    <div className="flex flex-col gap-5">
                                                        <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                                                            Hình thức xin nghỉ
                                                        </span>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {[
                                                                {
                                                                    value: 'Binh_thuong',
                                                                    label: 'Xin trước',
                                                                    dotColor: 'bg-blue-500',
                                                                    activeClass:
                                                                        'border-blue-400 bg-blue-50 text-blue-800 ring-0 ring-blue-400 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-500'
                                                                },
                                                                {
                                                                    value: 'Dot_xuat',
                                                                    label: 'Đột xuất (Xin trong ngày)',
                                                                    dotColor: 'bg-red-500',
                                                                    activeClass:
                                                                        'border-red-400 bg-red-50 text-red-800 ring-0 ring-red-400 dark:bg-red-900/40 dark:text-red-300 dark:border-red-500'
                                                                }
                                                            ].map((opt) => {
                                                                const isActive = filter.loai_nghi === opt.value
                                                                return (
                                                                    <button
                                                                        key={`form-${opt.value}`}
                                                                        type="button"
                                                                        className={cn(
                                                                            'flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border outline-none',
                                                                            isActive
                                                                                ? opt.activeClass
                                                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                                        )}
                                                                        onClick={() => {
                                                                            const newFilter = { ...filter }
                                                                            if (filter.loai_nghi === opt.value) {
                                                                                delete newFilter.loai_nghi
                                                                            } else {
                                                                                newFilter.loai_nghi = opt.value as string
                                                                            }
                                                                            onFilterChange(newFilter)
                                                                        }}
                                                                    >
                                                                        <div
                                                                            className={cn(
                                                                                'w-2 h-2 rounded-full shrink-0',
                                                                                opt.dotColor
                                                                            )}
                                                                        />
                                                                        <span>{opt.label}</span>
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {/* Mobile More Toggle */}
                            <Dropdown placement="bottom-end" radius="sm" className="sm:hidden">
                                <DropdownTrigger>
                                    <Button
                                        radius="sm"
                                        variant="flat"
                                        isIconOnly
                                        className="w-11 h-11 min-h-11 sm:hidden"
                                    >
                                        <MoreHorizontal size={18} />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Mobile actions" variant="flat">
                                    <DropdownSection showDivider>
                                        <DropdownItem
                                            key="create"
                                            onPress={onCreate}
                                            startContent={<Plus size={18} />}
                                            className="font-medium text-blue-600"
                                        >
                                            Tạo đơn mới
                                        </DropdownItem>
                                    </DropdownSection>

                                    <DropdownSection showDivider>
                                        {canShowQuota ? (
                                            <DropdownItem
                                                key="toggle-quota"
                                                startContent={<Contact size={18} />}
                                                onPress={() => setShowQuotaSidebar(!showQuotaSidebar)}
                                            >
                                                {showQuotaSidebar ? 'Ẩn danh sách tổng hợp' : 'Hiện danh sách tổng hợp'}
                                            </DropdownItem>
                                        ) : null}
                                    </DropdownSection>

                                    <DropdownSection>
                                        <DropdownItem
                                            key="import-excel"
                                            startContent={<Upload size={18} />}
                                            onPress={onOpenImport}
                                            className={cn('text-green-600 dark:text-green-400', !canImport && 'hidden')}
                                        >
                                            Nhập dữ liệu Excel
                                        </DropdownItem>
                                        <DropdownItem
                                            key="search-employee-code"
                                            startContent={<Search size={18} />}
                                            className={cn(!canImport && 'hidden')}
                                            onPress={onOpenPersonnelModal}
                                        >
                                            Tra cứu mã nhân sự
                                        </DropdownItem>

                                        <DropdownItem
                                            key="export-excel"
                                            startContent={<ExcelIcon size={18} />}
                                            onPress={onOpenExport}
                                            isDisabled={isExporting}
                                            className={!canExport ? 'hidden' : ''}
                                        >
                                            Xuất Excel
                                        </DropdownItem>
                                        <DropdownItem
                                            key="export-doc"
                                            startContent={<WordIcon size={18} />}
                                            onPress={onExportByEmployee}
                                            isDisabled={isExporting}
                                            className={!canExportDoc ? 'hidden' : ''}
                                        >
                                            Đơn nghỉ của tôi
                                        </DropdownItem>
                                        <DropdownItem
                                            key="export-by-department"
                                            startContent={<Building2 size={18} />}
                                            onPress={onExportByDepartment}
                                            isDisabled={isExporting}
                                            className={!canExport ? 'hidden' : ''}
                                        >
                                            Xuất đơn theo đơn vị
                                        </DropdownItem>
                                    </DropdownSection>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    )}
                </div>

                <div className="hidden sm:flex items-center gap-2 shrink-0 lg:ml-auto w-full lg:w-auto justify-end">
                    <HrPrimaryButton
                        onPress={onCreate}
                        className="hidden sm:flex"
                    >
                        Tạo đơn nghỉ phép
                    </HrPrimaryButton>

                    {/* Nhóm Icons: Stats, Quota, Column */}
                    <div className="hidden lg:block">
                        <TableColumnVisibility
                            columns={allColumns}
                            visibleColumns={new Set(visibleColumns)}
                            setVisibleColumns={(keys) => setVisibleColumns?.(Array.from(keys))}
                            label="Ẩn/Hiện Cột"
                        />
                    </div>

                    {/* Nhóm Actions: Tạo đơn, Export */}
                    {!hasSelection && (
                        <div
                            className="flex items-center gap-2"
                        >
                            <Dropdown
                                classNames={{
                                    content:
                                        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 min-w-[200px]'
                                }}
                            >
                                <DropdownTrigger>
                                    <Button
                                        variant="flat"
                                        isIconOnly
                                        radius="sm"
                                        className="bg-gray-100 dark:bg-gray-700 h-9 w-9 min-w-9"
                                        isLoading={isExporting}
                                    >
                                        <MoreHorizontal size={18} />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="More Actions" variant="flat">
                                    {canShowQuota ? (
                                        <DropdownItem
                                            key="toggle-quota"
                                            startContent={<Contact size={18} />}
                                            onPress={() => setShowQuotaSidebar(!showQuotaSidebar)}
                                            className={
                                                showQuotaSidebar ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''
                                            }
                                        >
                                            {showQuotaSidebar ? 'Ẩn danh sách tổng hợp' : 'Hiện danh sách tổng hợp'}
                                        </DropdownItem>
                                    ) : null}

                                    <DropdownSection>
                                        <DropdownItem
                                            key="import-excel"
                                            startContent={<Upload size={18} />}
                                            onPress={onOpenImport}
                                            className={cn(
                                                'text-green-600 dark:text-green-400 font-medium',
                                                !canImport && 'hidden'
                                            )}
                                        >
                                            Nhập dữ liệu Excel
                                        </DropdownItem>
                                        <DropdownItem
                                            key="search-employee-code"
                                            startContent={<Search size={18} />}
                                            className={cn('font-medium', !canImport && 'hidden')}
                                            onPress={onOpenPersonnelModal}
                                        >
                                            Tra cứu mã nhân sự
                                        </DropdownItem>


                                        {canExport || canExportDoc ? (
                                            <DropdownItem
                                                key="divider-export"
                                                isReadOnly
                                                className="px-0 py-1 cursor-default text-center"
                                            >
                                                <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
                                            </DropdownItem>
                                        ) : null}

                                        {canExport ? (
                                            <DropdownItem
                                                key="export-excel"
                                                startContent={<ExcelIcon size={18} />}
                                                onPress={onOpenExport}
                                                isDisabled={isExporting}
                                            >
                                                Xuất Excel
                                            </DropdownItem>
                                        ) : null}

                                        {canExportDoc ? (
                                            <DropdownItem
                                                key="export-doc"
                                                startContent={<WordIcon size={18} />}
                                                onPress={onExportByEmployee}
                                                isDisabled={isExporting}
                                            >
                                                Đơn nghỉ của tôi
                                            </DropdownItem>
                                        ) : null}

                                        <DropdownItem
                                            key="export-by-department"
                                            startContent={<Building2 size={18} />}
                                            onPress={onExportByDepartment}
                                            isDisabled={isExporting}
                                            className={!canExport ? 'hidden' : ''}
                                        >
                                            Xuất đơn theo đơn vị
                                        </DropdownItem>
                                    </DropdownSection>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    )}
                </div>
            </div>

            {/* ── INLINE FILTER CHIPS ROW ── mirrors OvertimeToolbar pattern */}
            {!hasSelection &&
                (filter.dateRange?.from ||
                    filter.trang_thai_cap_mot ||
                    filter.trang_thai_cap_hai ||
                    (filter.id_don_vi && filter.id_don_vi !== 'all') ||
                    (filter.id_loai_phep && filter.id_loai_phep !== 'all') ||
                    filter.loai_nghi) && (
                    <div className="hidden md:flex items-center gap-1 flex-wrap px-4 pb-2">
                        {/* Date Range chip */}
                        {filter.dateRange?.from &&
                            (() => {
                                const fmt = (raw: string): string => {
                                    if (!raw) return ''
                                    const datePart = raw.includes('T') ? raw.split('T')[0] : raw.split(' ')[0]
                                    if (!datePart.includes('-')) return raw
                                    const [y, m, d] = datePart.split('-')
                                    return `${d}/${m}/${y}`
                                }
                                // Check if it matches a preset
                                const matchedPreset = timePresets.find(
                                    (p) => p.value.from === filter.dateRange?.from && p.value.to === filter.dateRange?.to
                                )
                                return (
                                    <div className="flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 text-[11px] font-medium text-orange-700 dark:text-orange-300">
                                        <Clock size={10} className="text-orange-400 shrink-0" />
                                        <span>
                                            {matchedPreset
                                                ? matchedPreset.label
                                                : `${fmt(filter.dateRange.from)}${filter.dateRange.to ? ` → ${fmt(filter.dateRange.to)}` : ''}`}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const f = { ...filter }
                                                delete f.dateRange
                                                onFilterChange(f)
                                            }}
                                            className="ml-0.5 cursor-pointer w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <XCircle size={11} />
                                        </button>
                                    </div>
                                )
                            })()}

                        {/* Status cap 1 chip */}
                        {filter.trang_thai_cap_mot &&
                            (() => {
                                const statusMap: Record<string, { label: string; color: string }> = {
                                    Cho_duyet: {
                                        label: 'Chờ duyệt',
                                        color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                                    },
                                    Da_duyet: {
                                        label: 'Đã duyệt',
                                        color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                    },
                                    Tu_choi: {
                                        label: 'Từ chối',
                                        color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                    }
                                }
                                const s = statusMap[filter.trang_thai_cap_mot]
                                return s ? (
                                    <div
                                        className={cn(
                                            'flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border text-[11px] font-medium',
                                            s.color
                                        )}
                                    >
                                        <span className="text-gray-500 dark:text-gray-400 font-normal mr-0.5">
                                            ĐV:
                                        </span>
                                        <span>{s.label}</span>
                                        <button
                                            onClick={() => {
                                                const f = { ...filter }
                                                delete f.trang_thai_cap_mot
                                                onFilterChange(f)
                                            }}
                                            className="ml-0.5 cursor-pointer w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <XCircle size={11} />
                                        </button>
                                    </div>
                                ) : null
                            })()}

                        {/* Status cap 2 chip */}
                        {filter.trang_thai_cap_hai &&
                            (() => {
                                const statusMap: Record<string, { label: string; color: string }> = {
                                    Cho_duyet: {
                                        label: 'Chờ duyệt',
                                        color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                                    },
                                    Da_duyet: {
                                        label: 'Đã duyệt',
                                        color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                    },
                                    Tu_choi: {
                                        label: 'Từ chối',
                                        color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                    }
                                }
                                const s = statusMap[filter.trang_thai_cap_hai]
                                return s ? (
                                    <div
                                        className={cn(
                                            'flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border text-[11px] font-medium',
                                            s.color
                                        )}
                                    >
                                        <span className="text-gray-500 dark:text-gray-400 font-normal mr-0.5">
                                            TC-HC:
                                        </span>
                                        <span>{s.label}</span>
                                        <button
                                            onClick={() => {
                                                const f = { ...filter }
                                                delete f.trang_thai_cap_hai
                                                onFilterChange(f)
                                            }}
                                            className="ml-0.5 cursor-pointer w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <XCircle size={11} />
                                        </button>
                                    </div>
                                ) : null
                            })()}

                        {/* Unit chip */}
                        {filter.id_don_vi &&
                            filter.id_don_vi !== 'all' &&
                            (() => {
                                const deptName =
                                    departments
                                        .flatMap((g: any) => g.items || g.options || [g])
                                        .find((d: any) => String(d.value) === String(filter.id_don_vi))?.label ||
                                    filter.id_don_vi
                                return (
                                    <div className="flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                                        <span className="text-gray-500 dark:text-gray-400 font-normal mr-0.5">
                                            Đơn vị:
                                        </span>
                                        <span className="max-w-[100px] truncate">{deptName}</span>
                                        <button
                                            onClick={() => {
                                                const f = { ...filter }
                                                delete f.id_don_vi
                                                onFilterChange(f)
                                            }}
                                            className="ml-0.5 cursor-pointer w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <XCircle size={11} />
                                        </button>
                                    </div>
                                )
                            })()}

                        {/* Leave type chip */}
                        {filter.id_loai_phep &&
                            filter.id_loai_phep !== 'all' &&
                            (() => {
                                const typeName =
                                    leaveTypes.find(
                                        (t: any) => String(t.id_loai_phep) === String(filter.id_loai_phep)
                                    )?.ten_loai_phep || filter.id_loai_phep
                                return (
                                    <div className="flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-[11px] font-medium text-purple-700 dark:text-purple-300">
                                        <Tag size={10} className="text-purple-400 shrink-0" />
                                        <span className="max-w-[120px] truncate">{typeName}</span>
                                        <button
                                            onClick={() => {
                                                const f = { ...filter }
                                                delete f.id_loai_phep
                                                onFilterChange(f)
                                            }}
                                            className="ml-0.5 cursor-pointer w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <XCircle size={11} />
                                        </button>
                                    </div>
                                )
                            })()}

                        {/* Form/type chip */}
                        {filter.loai_nghi &&
                            (() => {
                                const formMap: Record<string, { label: string; color: string }> = {
                                    Binh_thuong: {
                                        label: 'Xin trước',
                                        color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                    },
                                    Dot_xuat: {
                                        label: 'Đột xuất',
                                        color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                                    }
                                }
                                const f = formMap[filter.loai_nghi]
                                return f ? (
                                    <div
                                        className={cn(
                                            'flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border text-[11px] font-medium',
                                            f.color
                                        )}
                                    >
                                        <span className="text-gray-500 dark:text-gray-400 font-normal mr-0.5">
                                            Hình thức:
                                        </span>
                                        <span>{f.label}</span>
                                        <button
                                            onClick={() => {
                                                const newFilter = { ...filter }
                                                delete newFilter.loai_nghi
                                                onFilterChange(newFilter)
                                            }}
                                            className="ml-0.5 cursor-pointer w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <XCircle size={11} />
                                        </button>
                                    </div>
                                ) : null
                            })()}

                        {/* Clear All button — show when 2+ filters active */}
                        {[
                            filter.dateRange?.from,
                            filter.trang_thai_cap_mot,
                            filter.trang_thai_cap_hai,
                            filter.id_don_vi && filter.id_don_vi !== 'all',
                            filter.id_loai_phep && filter.id_loai_phep !== 'all',
                            filter.loai_nghi
                        ].filter(Boolean).length > 1 && (
                                <button
                                    onClick={() => onFilterChange({})}
                                    className="cursor-pointer flex items-center gap-0.5 h-6 px-2 rounded-full text-[11px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <RotateCcw size={10} />
                                    <span>Xóa</span>
                                </button>
                            )}
                    </div>
                )}

            <EmployeeListModal isOpen={isPersonnelModalOpen} onClose={onPersonnelModalOpenChange} />
        </div>
    )
}
