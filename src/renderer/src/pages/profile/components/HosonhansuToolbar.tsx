import SearchInput from '@renderer/components/SearchInput'
import { toast } from '@heroui-v3/react'
import { Button, Checkbox, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Selection, Spinner, Tooltip } from '@heroui/react'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
    FileInput,
    FileOutput,
    HardDrive,
    History,
    Landmark,
    LayoutDashboard,
    MoreHorizontal,
    Printer,
    RefreshCw,
    Trash2,
    Users,
    X
} from 'lucide-react'
import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AddNhansuButton } from './AddNhansuButton'
import { ExportOptions, HosonhansuExportModal } from './HosonhansuExportModal'
import HosonhansuFilterPopover from './HosonhansuFilterPopover'


const excelSVG = (
    <svg width="18px" height="18px" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="2" width="24" height="28" rx="2" fill="#2FB776"></rect>
        <path d="M8 23H32V28C32 29.1046 31.1046 30 30 30H10C8.89543 30 8 29.1046 8 28V23Z" fill="url(#paint0_linear_87_7712)"></path>
        <rect x="20" y="16" width="12" height="7" fill="#229C5B"></rect>
        <rect x="20" y="9" width="12" height="7" fill="#27AE68"></rect>
        <path d="M8 4C8 2.89543 8.89543 2 10 2H20V9H8V4Z" fill="#1D854F"></path>
        <rect x="8" y="9" width="12" height="7" fill="#197B43"></rect>
        <rect x="8" y="16" width="12" height="7" fill="#1B5B38"></rect>
        <path d="M8 12C8 10.3431 9.34315 9 11 9H17C18.6569 9 20 10.3431 20 12V24C20 25.6569 18.6569 27 17 27H8V12Z" fill="#000000" fillOpacity="0.3"></path>
        <rect y="7" width="18" height="18" rx="2" fill="url(#paint1_linear_87_7712)"></rect>
        <path d="M13 21L10.1821 15.9L12.8763 11H10.677L9.01375 14.1286L7.37801 11H5.10997L7.81787 15.9L5 21H7.19931L8.97251 17.6857L10.732 21H13Z" fill="white"></path>
        <defs>
            <linearGradient id="paint0_linear_87_7712" x1="8" y1="26.5" x2="32" y2="26.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#163C27"></stop><stop offset="1" stopColor="#2A6043"></stop>
            </linearGradient>
            <linearGradient id="paint1_linear_87_7712" x1="0" y1="16" x2="18" y2="16" gradientUnits="userSpaceOnUse">
                <stop stopColor="#185A30"></stop><stop offset="1" stopColor="#176F3D"></stop>
            </linearGradient>
        </defs>
    </svg>
)


interface HosonhansuToolbarProps {
    onSearch: (val: string) => void
    isLoading: boolean
    allColumns: TableColumnType[]
    visibleColumns: Set<string>
    setVisibleColumns: (keys: Set<string>) => void
    showStatsCards: boolean
    setShowStatsCards: (show: boolean) => void
    hasActiveFilters: boolean
    hasSelection: boolean
    selectedKeys: Selection
    selectedCount: number
    handleXoaNhanVienSelected: () => void
    setSelectedKeys: (keys: Selection) => void
    isPrinting?: boolean
    activeFilterCount: number
    filters: Record<string, any>
    setFilters: (filter: Record<string, any>) => void
    handleClearFilters: () => void
    onPrint: (options: any) => void
    handleExportExcel: () => void
    handleExportExcelAdvanced: (options: ExportOptions) => void
    isExportingExcel: boolean
    donviOptions: any[]
    vitriOptions: any[]
    trangThaiOptions: any[]
    onOpenLichSu?: () => void
}

export const HosonhansuToolbar: React.FC<HosonhansuToolbarProps> = ({
    onSearch,
    isLoading,
    allColumns,
    visibleColumns,
    setVisibleColumns,
    showStatsCards,
    setShowStatsCards,
    hasActiveFilters,
    hasSelection,
    selectedKeys,
    selectedCount,
    handleXoaNhanVienSelected,
    onPrint,
    setSelectedKeys,
    isPrinting,
    activeFilterCount,
    filters: filterValues,
    setFilters,
    handleClearFilters,
    handleExportExcel,
    handleExportExcelAdvanced,
    isExportingExcel,
    donviOptions,
    vitriOptions,
    trangThaiOptions
}) => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [searchParams] = useSearchParams()
    const hasAction = searchParams.has('action')
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
    const [printOptions, setPrintOptions] = useState({
        thongTinChung: true,
        thongTinLienHe: false,
        bangCap: false,
        quaTrinhCongTac: false,
        hopDong: false,
        thuTucThoiViec: false
    })

    const syncMutation = useMutation({
        mutationFn: NhansuAxios.syncGoogleSheet,
        onSuccess: (res) => {
            if (res?.success) {
                toast.success('Đồng bộ thành công', { description: 'Dữ liệu đã được cập nhật lên Google Sheet' })
            } else {
                toast.danger('Đồng bộ thất bại', { description: res?.message || 'Đã có lỗi xảy ra' })
            }
        },
        onError: () => toast.danger('Lỗi kết nối', { description: 'Không thể kết nối với máy chủ' })
    })

    const importMutation = useMutation({
        mutationFn: NhansuAxios.importGoogleSheet,
        onSuccess: (res) => {
            if (res?.success) {
                toast.success('Nhập dữ liệu thành công', { description: res.message })
            } else {
                toast.danger('Nhập dữ liệu thất bại', { description: res?.message || 'Đã có lỗi xảy ra' })
            }
        },
        onError: () => toast.danger('Lỗi kết nối', { description: 'Không thể kết nối với máy chủ' })
    })

    const handleConfirmPrint = () => {
        if (onPrint) onPrint(printOptions)
        setIsPrintModalOpen(false)
    }

    return (
        <>
            <div className="flex items-center justify-between gap-3 px-6">
                {/* Left: Search + Filter */}
                <div className="flex-1 max-w-[480px]">
                    <AnimatePresence mode="wait">
                        {hasSelection ? (
                            <motion.div
                                key="bulk-actions"
                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className="flex items-center h-10 gap-3 px-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                            >
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                                    Đã chọn:{' '}
                                    <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-md text-[11px] ml-1">
                                        {selectedKeys === 'all' ? 'Tất cả' : selectedCount}
                                    </span>
                                </span>
                                <div className="w-px h-5 bg-blue-200 dark:bg-blue-700" />
                                <div className="flex items-center gap-1">
                                    <Tooltip showArrow content="Xóa nhân viên">
                                        <Button isIconOnly size="sm" color="danger" variant="flat" onPress={handleXoaNhanVienSelected} className="h-7 w-7 min-w-7">
                                            <Trash2 size={14} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip showArrow content="In thông tin">
                                        <Button isIconOnly size="sm" color="primary" variant="flat" onPress={() => setIsPrintModalOpen(true)} className="h-7 w-7 min-w-7">
                                            <Printer size={14} />
                                        </Button>
                                    </Tooltip>
                                    <div className="w-px h-5 bg-blue-200 dark:bg-blue-700 mx-0.5" />
                                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => setSelectedKeys(new Set([]))} className="h-7 w-7 min-w-7">
                                        <X size={14} />
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="search"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className="flex items-center gap-2"
                            >
                                <SearchInput
                                    className="w-full"
                                    placeholder="Tìm theo mã, tên, số điện thoại..."
                                    value={filterValues.searchValue || ''}
                                    onChange={onSearch}
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                    {isLoading && <Spinner size="sm" />}
                                    <HosonhansuFilterPopover
                                        filter={filterValues}
                                        onFilterChange={setFilters}
                                        onClear={handleClearFilters}
                                        trangThaiOptions={trangThaiOptions}
                                        activeFilterCount={activeFilterCount}
                                        hasActiveFilters={hasActiveFilters}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Add + Column visibility + More (...) */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Add button */}
                    <AddNhansuButton />

                    {/* Column Visibility */}
                    <TableColumnVisibility
                        columns={allColumns}
                        visibleColumns={visibleColumns}
                        setVisibleColumns={setVisibleColumns}
                        label="Cột"
                    />

                    {/* More actions (...) */}
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                aria-label="Thêm tùy chọn"
                            >
                                <MoreHorizontal size={18} />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="More Actions" className="min-w-[220px]">
                            {/* Xuất Excel */}
                            <DropdownItem
                                key="export_quick"
                                startContent={excelSVG}
                                description="Xuất tất cả nhân sự đang làm và đã nghỉ việc"
                                textValue="Xuất nhanh Excel"
                                onPress={handleExportExcel}
                                isDisabled={isExportingExcel}
                            >
                                Xuất nhanh Excel
                            </DropdownItem>
                            <DropdownItem
                                key="export_adv"
                                startContent={excelSVG}
                                description="Chọn cột và điều kiện xuất"
                                textValue="Xuất Excel nâng cao"
                                onPress={() => setIsExportModalOpen(true)}
                            >
                                Xuất Excel nâng cao
                            </DropdownItem>

                            {/* In */}
                            <DropdownItem
                                key="print"
                                startContent={<Printer size={16} />}
                                textValue="In thông tin"
                                onPress={() => setIsPrintModalOpen(true)}
                            >
                                In thông tin
                            </DropdownItem>

                            {/* Google Sheet */}
                            <DropdownItem
                                key="sync"
                                startContent={<RefreshCw size={16} />}
                                textValue="Đồng bộ lên Google Sheet"
                                description="Xuất dữ liệu lên Google Sheet"
                                onPress={() => syncMutation.mutate()}
                                isDisabled={true}
                            >
                                Đồng bộ lên Sheet
                            </DropdownItem>
                            <DropdownItem
                                key="import"
                                startContent={<FileInput size={16} />}
                                textValue="Nhập từ Google Sheet"
                                description="Nhập dữ liệu từ Google Sheet"
                                onPress={() => importMutation.mutate()}
                                isDisabled={true}
                            >
                                Nhập từ Sheet
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            {/* Print Modal */}
            <Modal isOpen={isPrintModalOpen} onOpenChange={setIsPrintModalOpen} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                        <Printer size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold">In thông tin nhân sự</h3>
                                </div>
                            </ModalHeader>
                            <ModalBody className="py-6">
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 text-blue-500"><FileOutput size={18} /></div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-800">Chọn các mục muốn in</h4>
                                            <p className="text-xs text-blue-600 mt-0.5">
                                                Dữ liệu sẽ được xuất dưới dạng văn bản và tự động ngắt trang cho từng mục.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { key: 'thongTinChung', label: 'Thông tin chung', icon: Users },
                                        { key: 'thongTinLienHe', label: 'Thông tin liên hệ', icon: Landmark },
                                        { key: 'bangCap', label: 'Bằng cấp - Chứng chỉ', icon: HardDrive },
                                        { key: 'quaTrinhCongTac', label: 'Quá trình công tác', icon: LayoutDashboard },
                                        { key: 'hopDong', label: 'Hợp đồng lao động', icon: FileOutput },
                                        { key: 'thuTucThoiViec', label: 'Thủ tục thôi việc', icon: Trash2 }
                                    ].map((item) => (
                                        <div
                                            key={item.key}
                                            onClick={() => setPrintOptions((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${printOptions[item.key as keyof typeof printOptions]
                                                ? 'border-primary-500 bg-primary-50 shadow-sm'
                                                : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${printOptions[item.key as keyof typeof printOptions] ? 'bg-white text-primary-600 shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                                                <item.icon size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-sm font-medium ${printOptions[item.key as keyof typeof printOptions] ? 'text-primary-900' : 'text-gray-700'}`}>
                                                    {item.label}
                                                </div>
                                            </div>
                                            <Checkbox isSelected={printOptions[item.key as keyof typeof printOptions]} size="sm" aria-label={item.label} />
                                        </div>
                                    ))}
                                </div>
                            </ModalBody>
                            <ModalFooter className="border-t pt-4">
                                <Button variant="flat" color="danger" onPress={onClose} size="sm">Đóng</Button>
                                <Button color="primary" onPress={handleConfirmPrint} startContent={<Printer size={18} />} className="font-semibold shadow-lg shadow-primary-200" size="sm" isLoading={isPrinting}>
                                    Bắt đầu in
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Export Modal */}
            <HosonhansuExportModal
                isOpen={isExportModalOpen}
                onOpenChange={setIsExportModalOpen}
                isLoading={isExportingExcel}
                onExport={(options) => {
                    handleExportExcelAdvanced(options)
                    setIsExportModalOpen(false)
                }}
                donviOptions={donviOptions}
                vitriOptions={vitriOptions}
                trangThaiOptions={trangThaiOptions}
                initialFilters={filterValues}
            />
        </>
    )
}
