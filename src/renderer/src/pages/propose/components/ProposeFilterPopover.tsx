import { Button, cn, Popover, PopoverContent, PopoverTrigger, Select, SelectItem, Tab, Tabs } from '@heroui/react'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { Check, ChevronRight, Clock, Filter, MapPin, RotateCcw, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface ProposeFilterPopoverProps {
    filterProposer: string
    filterDepartment: string
    filterDateRange: { from?: string; to?: string }
    setFilterProposer: (val: string) => void
    setFilterDepartment: (val: string) => void
    setFilterDateRange: (val: { from?: string; to?: string }) => void
    onFilterChange?: (key: string, value: any) => void
    userOptions: any[]
    departments: any[]
    activeFilterCount: number
}

const ALL_FILTER_TABS = [
    { id: 'time', label: 'Thời gian', icon: Clock },
    { id: 'unit', label: 'Đơn vị', icon: MapPin, superAdminOnly: true },
    { id: 'proposer', label: 'Người tạo', icon: UserRound }
]

export default function ProposeFilterPopover({
    filterProposer,
    filterDepartment,
    filterDateRange,
    setFilterProposer,
    setFilterDepartment,
    setFilterDateRange,
    onFilterChange,
    userOptions,
    departments,
    activeFilterCount
}: ProposeFilterPopoverProps) {
    const isSuperAdmin = useAuthStore((s) =>
        s.user?.ql_nguoi_dung_is_admin === '1' ||
        s.user?.vai_tro?.some(
            (v: any) => (v.is_active === 1 || v.is_active === '1') && v.ql_ma_vai_tro === 'SUPER_ADMIN'
        )
    )
    const filterTabs = useMemo(
        () => ALL_FILTER_TABS.filter((tab) => !tab.superAdminOnly || isSuperAdmin),
        [isSuperAdmin]
    )

    const [isOpen, setIsOpen] = useState(false)
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
        setCustomDateRange(filterDateRange || {})
    }, [filterDateRange])

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

    const applyDateRange = (val: { from?: string; to?: string }) => {
        setFilterDateRange(val)
        onFilterChange?.('dateRange', val)
    }

    const handleClear = () => {
        setFilterProposer('')
        setFilterDepartment('')
        setFilterDateRange({})
        setShowCustomDate(false)
        onFilterChange?.('created_user_id', '')
        onFilterChange?.('id_don_vi', '')
        onFilterChange?.('dateRange', undefined)
    }

    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-end" offset={10}>
            <PopoverTrigger>
                <Button
                    variant="light"
                    isIconOnly
                    radius="full"
                    aria-label="Filter"
                    className={cn(
                        'h-9 w-9 min-w-9 transition-colors relative overflow-visible shrink-0',
                        activeFilterCount > 0
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-blue-600'
                    )}
                    title="Bộ lọc nâng cao"
                >
                    <Filter size={18} className={activeFilterCount > 0 ? 'fill-blue-100' : ''} />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm border border-white dark:border-gray-800">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl overflow-hidden">
                <div className={cn(
                    'flex flex-col sm:flex-row w-[calc(100vw-40px)] sm:w-auto max-w-[460px] sm:max-w-none max-h-[80vh] sm:max-h-[500px] overflow-hidden',
                    activeFilterTab !== 'time' && 'sm:min-w-[550px] sm:w-[550px]',
                    activeFilterTab === 'time' && 'sm:w-max'
                )}>
                    {/* Left Panel - Tabs */}
                    <div className="w-full sm:w-[180px] shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col p-2 sm:p-3 z-10">
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
                                    tabList: 'flex-row sm:flex-col gap-0.5 p-0 bg-transparent min-w-max sm:min-w-0 sm:w-full',
                                    tab: 'justify-start px-2 sm:px-3 h-10 w-auto sm:w-full shrink-0',
                                    tabContent: 'w-full',
                                    cursor: 'w-full bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-[10px]',
                                    panel: 'hidden'
                                }}
                            >
                                {filterTabs.map((tab) => {
                                    const Icon = tab.icon
                                    const isActive = activeFilterTab === tab.id

                                    let hasFilter = false
                                    if (tab.id === 'time' && filterDateRange?.from) hasFilter = true
                                    if (tab.id === 'unit' && filterDepartment) hasFilter = true
                                    if (tab.id === 'proposer' && filterProposer) hasFilter = true

                                    return (
                                        <Tab
                                            key={tab.id}
                                            title={
                                                <div className="flex items-center justify-between w-full h-full">
                                                    <div className="flex items-center gap-2">
                                                        <Icon
                                                            size={15}
                                                            className={cn(
                                                                isActive ? 'text-blue-600' : 'text-gray-400 opacity-80'
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
                                onPress={handleClear}
                                startContent={<RotateCcw size={15} />}
                            >
                                <span className="hidden sm:inline">Đặt lại bộ lọc</span>
                                <span className="sm:hidden">Reset</span>
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel - Content */}
                    <div className={cn(
                        'bg-white dark:bg-gray-800 overflow-y-auto custom-scrollbar flex flex-col flex-1 min-w-0',
                        activeFilterTab === 'time' ? 'p-0' : 'p-4 sm:p-5 gap-6'
                    )}>
                        {activeFilterTab === 'time' && (
                            <div className="flex flex-col sm:flex-row w-full h-full sm:min-h-[350px]">
                                {/* Mobile View */}
                                {isMobile ? (
                                    !showCustomDate ? (
                                        <div key="presets" className="w-full flex flex-col p-2">
                                            {timePresets.map((preset, idx) => {
                                                const isSelected = filterDateRange?.from === preset.value.from &&
                                                    filterDateRange?.to === preset.value.to && !showCustomDate
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
                                                            applyDateRange(preset.value)
                                                            setIsOpen(false)
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
                                        <div key="custom-date-mobile" className="w-full flex flex-col">
                                            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 dark:border-gray-700">
                                                <Button
                                                    isIconOnly variant="light" size="sm"
                                                    onPress={() => {
                                                        setShowCustomDate(false)
                                                        setCustomDateRange(filterDateRange || {})
                                                    }}
                                                >
                                                    <ChevronRight size={16} className="rotate-180" />
                                                </Button>
                                                <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                                                    Phạm vi ngày tùy chỉnh
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-5 p-4">
                                                <DateInputFloatingLabel
                                                    label="Từ ngày (Sau)"
                                                    value={customDateRange.from || ''}
                                                    onChange={(val) => setCustomDateRange({ ...customDateRange, from: val })}
                                                />
                                                <DateInputFloatingLabel
                                                    label="Đến ngày (Trước)"
                                                    value={customDateRange.to || ''}
                                                    onChange={(val) => setCustomDateRange({ ...customDateRange, to: val })}
                                                />
                                            </div>
                                            <div className="px-4 pb-4 flex justify-between items-center">
                                                <Button
                                                    variant="light" disableRipple
                                                    className={cn(
                                                        'font-medium px-2 min-w-max hover:bg-transparent text-[13px]',
                                                        (customDateRange.from || customDateRange.to) ? 'text-red-500' : 'text-gray-400'
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
                                                        const newVal = (!customDateRange.from && !customDateRange.to) ? {} : customDateRange
                                                        applyDateRange(newVal)
                                                        setShowCustomDate(false)
                                                        setIsOpen(false)
                                                    }}
                                                >
                                                    Áp dụng
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <>
                                        {/* Desktop: Presets */}
                                        <div className="w-[220px] shrink-0 border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col z-20">
                                            <div className="flex flex-col flex-1 p-2">
                                                {timePresets.map((preset, idx) => {
                                                    const isSelected = filterDateRange?.from === preset.value.from &&
                                                        filterDateRange?.to === preset.value.to && !showCustomDate
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
                                                                applyDateRange(preset.value)
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
                                            <div style={{ overflow: 'hidden', width: 340 }}>
                                                <div className="w-[340px] h-full flex flex-col bg-white dark:bg-gray-800">
                                                    <div className="flex-1 p-6 flex flex-col gap-6 mt-2">
                                                        <DateInputFloatingLabel
                                                            label="Từ ngày (Sau)"
                                                            value={customDateRange.from || ''}
                                                            onChange={(val) => setCustomDateRange({ ...customDateRange, from: val })}
                                                        />
                                                        <DateInputFloatingLabel
                                                            label="Đến ngày (Trước)"
                                                            value={customDateRange.to || ''}
                                                            onChange={(val) => setCustomDateRange({ ...customDateRange, to: val })}
                                                        />
                                                    </div>
                                                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                                        <Button
                                                            variant="light" disableRipple
                                                            className={cn(
                                                                'font-medium px-2 min-w-max hover:bg-transparent text-[13px]',
                                                                (customDateRange.from || customDateRange.to) ? 'text-red-500' : 'text-gray-400'
                                                            )}
                                                            onPress={() => setCustomDateRange({})}
                                                            isDisabled={!customDateRange.from && !customDateRange.to}
                                                        >
                                                            Xóa phạm vi
                                                        </Button>
                                                        <Button
                                                            color="primary"
                                                            className="font-semibold px-6 shadow-sm text-[13px]"
                                                            isDisabled={!customDateRange.from && !customDateRange.to}
                                                            onPress={() => {
                                                                const newVal = (!customDateRange.from && !customDateRange.to) ? {} : customDateRange
                                                                applyDateRange(newVal)
                                                                setIsOpen(false)
                                                            }}
                                                        >
                                                            Áp dụng hiển thị
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {activeFilterTab === 'unit' && isSuperAdmin && (
                            <div className="flex flex-col gap-5">
                                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                                    Đơn vị
                                </span>
                                <Select
                                    label="Đơn vị"
                                    variant="bordered"
                                    size="sm"
                                    selectedKeys={filterDepartment ? new Set([filterDepartment]) : new Set()}
                                    onSelectionChange={(keys) => {
                                        const arr = Array.from(keys)
                                        const val = arr.length > 0 ? (arr[0] as string) : ''
                                        setFilterDepartment(val)
                                        onFilterChange?.('id_don_vi', val)
                                    }}
                                >
                                    {[
                                        <SelectItem key="all">Tất cả đơn vị</SelectItem>,
                                        ...departments.map((item: any) => (
                                            <SelectItem key={item.id_don_vi.toString()}>{item.ten_don_vi}</SelectItem>
                                        ))
                                    ]}
                                </Select>
                            </div>
                        )}

                        {activeFilterTab === 'proposer' && (
                            <div className="flex flex-col gap-5">
                                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                                    Người tạo đề xuất
                                </span>
                                <Select
                                    label="Người tạo đề xuất"
                                    variant="bordered"
                                    size="sm"
                                    selectedKeys={filterProposer ? new Set([filterProposer]) : new Set()}
                                    onSelectionChange={(keys) => {
                                        const arr = Array.from(keys)
                                        const val = arr.length > 0 ? (arr[0] as string) : ''
                                        setFilterProposer(val)
                                        onFilterChange?.('created_user_id', val)
                                    }}
                                >
                                    {userOptions.map((item: any) => (
                                        <SelectItem key={item.value}>{item.label}</SelectItem>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
