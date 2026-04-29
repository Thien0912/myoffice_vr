import { Skeleton, Spinner } from '@heroui-v3/react'
import { Button, Chip, Input, Tooltip } from '@heroui/react'
import { nghiphepAxios } from '@renderer/api/hr/nghiphepAxios'
import { AdvancedFilterPopover } from '@renderer/components/advanced-filter'
import { HrDrawer, HrDrawerBody, HrDrawerHeader } from '@renderer/components/hero-custom/HrDrawer'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import TablePagination from '@renderer/components/table/TablePagination'
import { UserAvatar } from '@renderer/components/UserAvatar'
import { useNghiPhepStore } from '@renderer/store/useNghiPhepStore'
import { getTenLoaiDonVi } from '@renderer/utils/donViUtils'
import { removeVietnameseTones } from '@renderer/utils/string'
import { useQuery } from '@tanstack/react-query'
import { Reorder, useDragControls } from 'framer-motion'
import { ArrowDownUp, ArrowRight, Building2, CalendarClock, CheckCircle2, ChevronDown, Clock, FileText, Filter, GripHorizontal, GripVertical, Landmark, LayoutGrid, MapPin, RotateCcw, Search, Users, X, XCircle } from 'lucide-react'
import React, { useCallback, useMemo, useRef, useState } from 'react'

interface NhanVienThongKe {
    id_nhan_vien: string
    ho_va_ten: string
    ma_nhan_vien: string
    avatar: string | null
    gioi_tinh: number
    so_ngay_nghi: number
    so_don: number
    so_don_da_duyet: number
    so_don_tu_choi?: number
}

interface DonViThongKe {
    id_don_vi: string
    ten_don_vi: string
    ma_don_vi: string
    ten_viet_tat: string
    loai: string
    nhan_vien: NhanVienThongKe[]
    tong_nhan_vien: number
    tong_ngay_nghi: number
    tong_so_don: number
    tong_so_don_da_duyet: number
    tong_so_don_tu_choi?: number
}

interface ThongKeResponse {
    data: Record<string, DonViThongKe[]>
    summary_total: {
        tong_don_vi: number
        tong_nhan_vien: number
        tong_ngay_nghi: number
        tong_so_don: number
        tong_so_don_da_duyet: number
    }
    summary_by_loai: Record<string, any>
}

interface DonNghiPhep {
    uuid_nghi_phep: string
    ten_loai_phep: string
    mau_sac: string | null
    tong_ngay_nghi: number
    thoi_gian: string
    ngay_tao: string
    trang_thai: string
    trang_thai_color: 'success' | 'danger' | 'warning' | 'default'
    ly_do_nghi: string
}

// ─── Icon/Color config per group type (matches donViUtils.ts) ────────────────
const LOAI_ICON_CONFIG: Record<string, { bg: string; color: string; Icon: React.ElementType }> = {
    KHOA_BOMON: { bg: '#EBF5FF', color: '#3B82F6', Icon: Building2 },
    PHONG: { bg: '#FFF7ED', color: '#F97316', Icon: Building2 },
    TRUNG_TAM: { bg: '#F0FDF4', color: '#22C55E', Icon: Building2 },
    BAN: { bg: '#FDF2F8', color: '#EC4899', Icon: Building2 },
    VIEN: { bg: '#F5F3FF', color: '#8B5CF6', Icon: Landmark },
    TRUONG_CN_KT: { bg: '#FEF9C3', color: '#CA8A04', Icon: Landmark },
    TRUONG_SUC_KHOE: { bg: '#ECFDF5', color: '#059669', Icon: Landmark },
    TRUONG_CNS_TTNT: { bg: '#EFF6FF', color: '#2563EB', Icon: Landmark },
    TRUONG_LUAT_KT: { bg: '#FEF2F2', color: '#DC2626', Icon: Landmark },
    LANH_DAO: { bg: '#FFFBEB', color: '#D97706', Icon: Users },
    DOAN_THE: { bg: '#FFF1F2', color: '#E11D48', Icon: Users },
    DON_VI_KHAC: { bg: '#F1F5F9', color: '#64748B', Icon: Building2 },
    KHAC: { bg: '#F1F5F9', color: '#64748B', Icon: Building2 },
    DOANH_NGHIEP: { bg: '#F0F9FF', color: '#0369A1', Icon: Landmark },
}
const getLoaiConfig = (loai: string) => LOAI_ICON_CONFIG[loai] || { bg: '#F1F5F9', color: '#64748B', Icon: Building2 }

// ─── Unit Card icon colors (cycle through for variety) ───────────────────────
const UNIT_COLORS = [
    { bg: '#EBF5FF', color: '#3B82F6' },
    { bg: '#F0FDF4', color: '#22C55E' },
    { bg: '#FFF7ED', color: '#F97316' },
    { bg: '#FEF2F2', color: '#EF4444' },
    { bg: '#F5F3FF', color: '#8B5CF6' },
    { bg: '#FDF2F8', color: '#EC4899' },
    { bg: '#ECFDF5', color: '#059669' },
    { bg: '#FEF9C3', color: '#CA8A04' },
]

// ─── StatusBadge (matching reference design) ─────────────────────────────────
const StatusBadge = ({ type, count }: { type: 'pending' | 'approved' | 'rejected', count: number }) => {
    const configs = {
        pending: { color: '#F9AB00', bg: '#FFF9E6', label: 'Chờ' },
        approved: { color: '#1E8E3E', bg: '#E6F4EA', label: 'Duyệt' },
        rejected: { color: '#D93025', bg: '#FCE8E6', label: 'Từ chối' }
    }
    const config = configs[type]
    if (count === 0) return null

    return (
        <div className="px-2 py-0.5 rounded flex items-center gap-1.5 text-[11px] font-medium"
            style={{ backgroundColor: config.bg, color: config.color }}>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: config.color }}></span>
            {count} {config.label}
        </div>
    )
}

// ─── Component Thẻ Tóm tắt ─────────────────────────────────────────────────
const SummaryCards = ({ data, isLoading }: { data?: ThongKeResponse['summary_total'], isLoading: boolean }) => {
    if (isLoading) {
        return (
            <div className="flex flex-wrap gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[48px] w-[180px] rounded-full" />
                ))}
            </div>
        )
    }

    const stats = [
        { title: 'Tổng Đơn Vị', value: data?.tong_don_vi || 0, icon: <Building2 className="text-blue-500" size={24} />, color: 'bg-blue-50' },
        { title: 'Nhân Sự Có Đơn', value: data?.tong_nhan_vien || 0, icon: <Users className="text-green-500" size={24} />, color: 'bg-green-50' },
        { title: 'Tổng Số Đơn', value: data?.tong_so_don || 0, icon: <FileText className="text-orange-500" size={24} />, color: 'bg-orange-50' },
        { title: 'Tổng Ngày Nghỉ', value: data?.tong_ngay_nghi || 0, icon: <CalendarClock className="text-gray-500" size={24} />, color: 'bg-gray-100' },
    ]

    return (
        <div className="flex flex-wrap items-center gap-4 mb-3">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 shadow-sm"
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stat.color}`}>
                        {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 16 })}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.title}</span>
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{stat.value}</h4>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Danh sách đơn nghỉ phép của một nhân viên (sub-modal content) ──────────
const NhanVienDonList = ({
    nhanVien,
    filter
}: {
    nhanVien: NhanVienThongKe,
    filter: { start_date?: string, end_date?: string }
}) => {
    const { data, isLoading } = useQuery({
        queryKey: ['don_by_nhan_vien', nhanVien.id_nhan_vien, filter.start_date, filter.end_date],
        queryFn: async () => {
            const res = await nghiphepAxios.donByNhanVien(nhanVien.id_nhan_vien, {
                start_date: filter.start_date,
                end_date: filter.end_date
            })
            if (res?.success) return res.data?.data as DonNghiPhep[]
            return []
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })

    const colorMap: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
        success: 'success',
        danger: 'danger',
        warning: 'warning',
        default: 'default',
    }

    return (
        <div className="flex flex-col h-full pt-1">
            {/* Danh sách đơn */}
            {isLoading ? (
                <div className="flex items-center justify-center py-10">
                    <Spinner size="sm" color="accent" />
                    <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
                </div>
            ) : !data || data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <FileText size={22} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400 italic">Không có đơn nghỉ phép nào</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
                    {data.map((don, idx) => (
                        <div
                            key={don.uuid_nghi_phep}
                            className="flex gap-3 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/20 transition-colors overflow-hidden"
                        >
                            {/* STT dọc bên trái */}
                            <div className="flex items-center justify-center w-7 shrink-0 bg-gray-50 border-r border-gray-100">
                                <span className="text-[11px] text-gray-400 font-medium">{idx + 1}</span>
                            </div>

                            {/* Nội dung */}
                            <div className="flex-1 min-w-0 py-2.5 pr-3">
                                {/* Row 1: Tên loại phép + Trạng thái */}
                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                    <span className="text-sm font-bold text-gray-800 leading-snug">{don.ten_loai_phep}</span>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color={colorMap[don.trang_thai_color] ?? 'default'}
                                        className="shrink-0 text-[11px] h-5"
                                    >
                                        {don.trang_thai}
                                    </Chip>
                                </div>

                                {/* Row 2: Lý do */}
                                {don.ly_do_nghi && (
                                    <p className="text-xs text-gray-400 mb-2 truncate">Lý do: {don.ly_do_nghi}</p>
                                )}

                                {/* Divider đã bỏ */}

                                {/* Row 3: Ngày nghỉ + Số ngày */}
                                <div className="flex items-end justify-between gap-2">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-xs text-gray-600">
                                            Ngày nghỉ: <span className="font-medium">{don.thoi_gian}</span>
                                        </p>
                                        <p className="text-xs text-gray-400">Ngày tạo đơn: {don.ngay_tao}</p>
                                    </div>

                                    {/* Số ngày badge */}
                                    <div className="flex items-center gap-1 shrink-0 border border-gray-200 rounded-lg px-2 py-1">
                                        <CalendarClock size={13} className="text-gray-400" />
                                        <span className="text-sm font-bold text-gray-700">{don.tong_ngay_nghi}</span>
                                        <span className="text-xs text-gray-400">ngày</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Danh sách nhân viên trong modal đơn vị (dạng list đơn giản) ─────────────────────
const NhanVienList = ({
    dsNhanVien,
    onSelectNhanVien,
    units,
    selectedUnit,
    onSelectUnit,
    selectedNhanVienId
}: {
    dsNhanVien: NhanVienThongKe[]
    onSelectNhanVien: (nv: NhanVienThongKe) => void
    selectedNhanVienId?: number | string
    units?: { id: string; name: string; count: number }[]
    selectedUnit?: string
    onSelectUnit?: (id: string) => void
}) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'name' | 'so_don' | 'so_ngay'>('so_don')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(9)

    // Ref container to trap Dropdown portals inside the Drawer's FocusScope
    // This prevents the React Aria infinite focus ping-pong crash (Maximum call stack size exceeded)
    const dropdownContainerRef = useRef<HTMLDivElement>(null)

    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false)
    const [activeFilterTab, setActiveFilterTab] = useState('unit')
    const [isMobile, setIsMobile] = useState(false)

    React.useEffect(() => {
        const checkMobile = (): void => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', checkMobile)
        checkMobile()
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const activeFilterCount = ((selectedUnit && selectedUnit !== 'all') ? 1 : 0) + ((selectedStatus && selectedStatus !== 'all') ? 1 : 0)

    const FILTER_TABS = [
        ...(units && units.length > 0 && onSelectUnit ? [{
            id: 'unit',
            label: 'Đơn vị',
            icon: MapPin,
            subtitle: selectedUnit && selectedUnit !== 'all'
                ? (units.find(u => String(u.id) === String(selectedUnit))?.name || 'Đã chọn đơn vị')
                : 'Tất cả đơn vị',
            hasFilter: !!(selectedUnit && selectedUnit !== 'all')
        }] : []),
        {
            id: 'status',
            label: 'Trạng thái',
            icon: LayoutGrid,
            subtitle: selectedStatus !== 'all'
                ? (selectedStatus === 'cho_duyet' ? 'Chờ duyệt' : selectedStatus === 'da_duyet' ? 'Đã duyệt' : 'Từ chối')
                : 'Tất cả trạng thái',
            hasFilter: selectedStatus !== 'all'
        }
    ]

    const effectiveActiveTab = FILTER_TABS.some(t => t.id === activeFilterTab) ? activeFilterTab : (FILTER_TABS[0]?.id || 'status')

    const filteredList = useMemo(() => {
        if (!dsNhanVien || dsNhanVien.length === 0) return []

        let list = [...dsNhanVien]

        // Filter by search
        if (searchQuery) {
            const sq = removeVietnameseTones(searchQuery)
            list = list.filter(nv =>
                removeVietnameseTones(nv.ho_va_ten || '').includes(sq) ||
                removeVietnameseTones(nv.ma_nhan_vien || '').includes(sq)
            )
        }

        // Filter by status
        if (selectedStatus && selectedStatus !== 'all') {
            list = list.filter(nv => {
                const tuChoi = nv.so_don_tu_choi || 0
                const pending = Math.max(0, nv.so_don - nv.so_don_da_duyet - tuChoi)
                if (selectedStatus === 'cho_duyet') return pending > 0
                if (selectedStatus === 'da_duyet') return nv.so_don_da_duyet > 0
                if (selectedStatus === 'tu_choi') return tuChoi > 0
                return true
            })
        }

        // Sort
        if (sortBy === 'name') {
            list.sort((a, b) => removeVietnameseTones(a.ho_va_ten || '').localeCompare(removeVietnameseTones(b.ho_va_ten || '')))
        } else if (sortBy === 'so_ngay') {
            list.sort((a, b) => b.so_ngay_nghi - a.so_ngay_nghi)
        } else {
            list.sort((a, b) => b.so_don - a.so_don)
        }

        return list
    }, [dsNhanVien, searchQuery, sortBy, selectedStatus])

    const paginatedList = useMemo(() => {
        const start = (page - 1) * limit
        return filteredList.slice(start, start + limit)
    }, [filteredList, page, limit])

    // Reset pagination when data or search changes
    React.useEffect(() => {
        setPage(1)
    }, [searchQuery, sortBy, filteredList.length])

    if (!dsNhanVien || dsNhanVien.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-gray-500 bg-gray-50/50 italic">
                Không có dữ liệu nhân viên nghỉ phép trong đơn vị này.
            </div>
        )
    }


    return (
        <div ref={dropdownContainerRef} className="flex flex-col h-full bg-gray-50/50 relative">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 px-6 py-4 bg-white border-b border-gray-100 z-10 sticky top-0">
                {/* Row 1: Search, Filter, and Sort */}
                <div className="flex items-center justify-between gap-3 w-full">
                    {/* Search and Filters */}
                    <div className="w-[300px] shrink-0">
                        <Input
                            placeholder="Tìm kiếm theo mã, họ tên"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            startContent={<Search size={18} strokeWidth={1.5} className="text-gray-500 ml-1 mr-2" />}
                            endContent={
                                <div className="flex items-center gap-1">
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-100 rounded cursor-pointer mr-1 text-gray-400">
                                            <X size={14} />
                                        </button>
                                    )}
                                    <AdvancedFilterPopover
                                        isOpen={isFilterPopoverOpen}
                                        onOpenChange={setIsFilterPopoverOpen}
                                        isMobile={isMobile}
                                        activeFilterCount={activeFilterCount}
                                        onClearAll={() => {
                                            if (onSelectUnit) onSelectUnit('all')
                                            setSelectedStatus('all')
                                        }}
                                        tabs={FILTER_TABS}
                                        activeTabId={effectiveActiveTab}
                                        onTabChange={(tabId) => setActiveFilterTab(tabId)}
                                        customTrigger={
                                            <button className={`p-1.5 hover:bg-gray-100 rounded-md cursor-pointer transition-colors ${activeFilterCount > 0 ? 'text-blue-500' : 'text-gray-500'}`}>
                                                <Filter size={18} strokeWidth={1.5} />
                                            </button>
                                        }
                                    >
                                        {effectiveActiveTab === 'unit' && (
                                            <div className="flex flex-col gap-5 p-6">
                                                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                                                    Chọn đơn vị
                                                </span>
                                                <SelectDropdown
                                                    label="Đơn vị"
                                                    placeholder="Tất cả đơn vị"
                                                    value={selectedUnit && selectedUnit !== 'all' ? selectedUnit : undefined}
                                                    onChange={(val) => {
                                                        if (onSelectUnit) onSelectUnit(val as string)
                                                    }}
                                                    options={units ? units.map(u => ({ value: u.id, label: u.name, description: String(u.count) + ' nhân viên' })) : []}
                                                    disablePortal
                                                />
                                            </div>
                                        )}
                                        {effectiveActiveTab === 'status' && (
                                            <div className="flex flex-col gap-5 p-6">
                                                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                                                    Chọn trạng thái
                                                </span>
                                                <SelectDropdown
                                                    label="Trạng thái"
                                                    placeholder="Tất cả trạng thái"
                                                    value={selectedStatus && selectedStatus !== 'all' ? selectedStatus : undefined}
                                                    onChange={(val) => setSelectedStatus(val as string)}
                                                    options={[
                                                        { value: 'cho_duyet', label: 'Chờ duyệt' },
                                                        { value: 'da_duyet', label: 'Đã duyệt' },
                                                        { value: 'tu_choi', label: 'Từ chối' }
                                                    ]}
                                                    disablePortal
                                                />
                                            </div>
                                        )}
                                    </AdvancedFilterPopover>
                                </div>
                            }
                            classNames={{
                                base: "w-full",
                                input: 'text-sm text-gray-700 placeholder:text-gray-400',
                                inputWrapper: '!bg-white border border-gray-200 hover:border-gray-300 focus-within:!border-blue-500 focus-within:!ring-1 focus-within:!ring-blue-500 transition-colors h-[40px] px-3 rounded-xl shadow-sm data-[hover=true]:!bg-white group-data-[focus=true]:!bg-white',
                                innerWrapper: '!bg-transparent data-[hover=true]:!bg-transparent group-data-[focus=true]:!bg-transparent'
                            }}
                        />
                    </div>

                    {/* Sắp xếp */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-medium text-gray-500">Sắp xếp:</span>
                        <div className="relative inline-flex items-center">
                            <div className="absolute left-2.5 pointer-events-none">
                                <ArrowDownUp size={14} className="text-gray-500" />
                            </div>
                            <select
                                className="h-[40px] pl-8 pr-7 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-gray-700 outline-none hover:border-gray-300 focus:border-blue-500 transition-colors appearance-none cursor-pointer shadow-sm"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                            >
                                <option value="name">Tên nhân viên</option>
                                <option value="so_don">Số đơn (nhiều nhất)</option>
                                <option value="so_ngay">Số ngày (nhiều nhất)</option>
                            </select>
                            <div className="absolute right-2.5 pointer-events-none">
                                <ChevronDown size={14} className="text-gray-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Filter chips (1 line, scrollable if needed) */}
                {((selectedUnit && selectedUnit !== 'all') || (selectedStatus && selectedStatus !== 'all')) && (
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                        {selectedUnit && selectedUnit !== 'all' && (
                            <div className="flex items-center gap-1.5 h-7 px-3 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-[12px] font-medium text-blue-700 dark:text-blue-300 shrink-0">
                                <span className="text-gray-500 dark:text-gray-400 font-normal">
                                    Đơn vị:
                                </span>
                                <span className="max-w-[250px] truncate">
                                    {units?.find(u => String(u.id) === String(selectedUnit))?.name || selectedUnit}
                                </span>
                                <button
                                    onClick={() => {
                                        if (onSelectUnit) onSelectUnit('all')
                                    }}
                                    className="ml-0.5 cursor-pointer w-4 h-4 rounded-full flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    <XCircle size={14} />
                                </button>
                            </div>
                        )}

                        {selectedStatus && selectedStatus !== 'all' && (
                            <div className="flex items-center gap-1.5 h-7 px-3 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-[12px] font-medium text-blue-700 dark:text-blue-300 shrink-0">
                                <span className="text-gray-500 dark:text-gray-400 font-normal">
                                    Trạng thái:
                                </span>
                                <span className="max-w-[250px] truncate">
                                    {selectedStatus === 'cho_duyet' ? 'Chờ duyệt' : selectedStatus === 'da_duyet' ? 'Đã duyệt' : 'Từ chối'}
                                </span>
                                <button
                                    onClick={() => setSelectedStatus('all')}
                                    className="ml-0.5 cursor-pointer w-4 h-4 rounded-full flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    <XCircle size={14} />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                if (onSelectUnit) onSelectUnit('all')
                                setSelectedStatus('all')
                            }}
                            className="cursor-pointer flex items-center gap-1 h-7 px-2.5 rounded-full text-[12px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                        >
                            <RotateCcw size={12} />
                            <span>Xóa</span>
                        </button>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 transition-shadow" style={{ containerType: 'inline-size' }}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .employee-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                    @container (max-width: 480px) {
                        .employee-grid { grid-template-columns: 1fr !important; }
                    }
                    @container (min-width: 481px) and (max-width: 767px) {
                        .employee-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                    }
                    `
                }} />
                <div className="grid gap-5 employee-grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
                    {paginatedList.map((nv, index) => (
                        <div
                            key={nv.id_nhan_vien}
                            onClick={() => onSelectNhanVien(nv)}
                            role="button"
                            tabIndex={0}
                            className={`rounded-xl shadow-sm p-4 flex flex-col gap-4 transition-all duration-200 cursor-pointer ${String(selectedNhanVienId) === String(nv.id_nhan_vien)
                                ? "bg-blue-50/50 border border-blue-500 ring-1 ring-blue-500/20"
                                : "bg-white border border-transparent hover:border-blue-500 hover:shadow-md"
                                }`}
                        >
                            {/* Header: Avatar, Name, ID */}
                            <div className="flex gap-3 items-center">
                                <UserAvatar
                                    name={nv.ho_va_ten}
                                    src={nv.avatar ?? undefined}
                                    size="md"
                                    className="shrink-0 w-10 h-10 rounded-full"
                                />
                                <div className="flex-1 flex flex-col min-w-0">
                                    <h3
                                        className="text-[14px] font-bold text-gray-900 truncate leading-tight mb-1"
                                        title={nv.ho_va_ten}
                                    >
                                        {nv.ho_va_ten}
                                    </h3>
                                    <p className="text-[12px] text-gray-500 font-medium truncate">{nv.ma_nhan_vien}</p>
                                </div>
                            </div>
                            {/* Status Progress Bar */}
                            {(() => {
                                const totalDon = nv.so_don
                                const approved = nv.so_don_da_duyet
                                const rejected = nv.so_don_tu_choi || 0
                                const pending = Math.max(0, totalDon - approved - rejected)
                                const pendingPct = totalDon > 0 ? (pending / totalDon) * 100 : 0
                                const approvedPct = totalDon > 0 ? (approved / totalDon) * 100 : 0
                                const rejectedPct = totalDon > 0 ? (rejected / totalDon) * 100 : 0

                                return (
                                    <div className="mt-1">
                                        {/* Mini stat row */}
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-1">
                                                <Clock size={11} className="text-amber-500" />
                                                <span className="text-[11px] font-semibold text-gray-600">{pending}</span>
                                                <span className="text-[10px] text-gray-400">chờ</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 size={11} className="text-emerald-500" />
                                                <span className="text-[11px] font-semibold text-gray-600">{approved}</span>
                                                <span className="text-[10px] text-gray-400">duyệt</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <XCircle size={11} className="text-rose-500" />
                                                <span className="text-[11px] font-semibold text-gray-600">{rejected}</span>
                                                <span className="text-[10px] text-gray-400">từ chối</span>
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="flex h-[5px] rounded-full overflow-hidden bg-gray-100">
                                            {pending > 0 && (
                                                <Tooltip content={`${pending} đơn chờ duyệt (${pendingPct.toFixed(0)}%)`} delay={200} closeDelay={0}>
                                                    <div className="bg-amber-400 transition-all duration-300 h-full" style={{ width: `${pendingPct}%` }} />
                                                </Tooltip>
                                            )}
                                            {approved > 0 && (
                                                <Tooltip content={`${approved} đơn đã duyệt (${approvedPct.toFixed(0)}%)`} delay={200} closeDelay={0}>
                                                    <div className="bg-emerald-400 transition-all duration-300 h-full" style={{ width: `${approvedPct}%` }} />
                                                </Tooltip>
                                            )}
                                            {rejected > 0 && (
                                                <Tooltip content={`${rejected} đơn từ chối (${rejectedPct.toFixed(0)}%)`} delay={200} closeDelay={0}>
                                                    <div className="bg-rose-400 transition-all duration-300 h-full" style={{ width: `${rejectedPct}%` }} />
                                                </Tooltip>
                                            )}
                                        </div>
                                        {totalDon === 0 && (
                                            <span className="text-[10px] text-gray-300 mt-0.5 block">Chưa có đơn</span>
                                        )}
                                    </div>
                                )
                            })()}

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50/50 rounded-xl py-3 px-2 flex flex-col items-center justify-center border border-blue-50">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <FileText size={13} className="text-blue-500" />
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Số đơn</span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-600 leading-none">{nv.so_don}</span>
                                </div>
                                <div className="bg-emerald-50/50 rounded-xl py-3 px-2 flex flex-col items-center justify-center border border-emerald-50">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <CalendarClock size={13} className="text-emerald-500" />
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Số ngày</span>
                                    </div>
                                    <span className="text-xl font-bold text-emerald-600 leading-none">{nv.so_ngay_nghi}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredList.length === 0 && (
                    <div className="p-8 text-center text-sm text-gray-400 italic">
                        Không tìm thấy nhân viên
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {
                filteredList.length > 0 && (
                    <div className="border-t border-gray-200 bg-white sticky bottom-0 z-10 shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.03)]">
                        <TablePagination
                            page={page}
                            total={filteredList.length}
                            filtered={filteredList.length}
                            limit={limit}
                            onChangePage={setPage}
                            onChangeLimit={(val) => {
                                setLimit(val)
                                setPage(1)
                            }}
                            className="px-6 py-3"
                        />
                    </div>
                )
            }
        </div >
    )
}

// ─── Component Card đơn vị (matching reference image) ──────────────────────
const UnitCard = React.memo(({
    dv,
    index,
    onPress
}: {
    dv: DonViThongKe,
    index: number,
    onPress: () => void
}) => {
    const rejectedCount = dv.tong_so_don_tu_choi || dv.nhan_vien?.reduce((s, nv) => s + (nv.so_don_tu_choi || 0), 0) || 0
    const pendingCount = Math.max(0, dv.tong_so_don - dv.tong_so_don_da_duyet - rejectedCount)
    const approvedCount = dv.tong_so_don_da_duyet
    const totalDon = dv.tong_so_don
    const unitColor = UNIT_COLORS[index % UNIT_COLORS.length]

    const pendingPct = totalDon > 0 ? ((pendingCount / totalDon) * 100) : 0
    const approvedPct = totalDon > 0 ? ((approvedCount / totalDon) * 100) : 0
    const rejectedPct = totalDon > 0 ? ((rejectedCount / totalDon) * 100) : 0

    return (
        <div
            className="group/card p-4 rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-blue-200 hover:shadow-lg cursor-pointer flex flex-col h-full"
            onClick={onPress}
        >
            {/* Row 1: Icon + Name/subtitle + employee count badge */}
            <div className="flex items-start gap-3 mb-3 h-[52px]">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: unitColor.bg }}>
                    <Building2 size={18} style={{ color: unitColor.color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <Tooltip content={dv.ten_don_vi} delay={300} closeDelay={0}>
                        <h3 className="text-[13px] font-bold leading-tight text-[#202124] line-clamp-2">{dv.ten_don_vi}</h3>
                    </Tooltip>
                    <p className="text-[11px] text-gray-400 mt-0.5">{totalDon} đơn • {dv.tong_ngay_nghi} ngày nghỉ</p>
                </div>
                <Tooltip content={`${dv.nhan_vien?.length || 0} nhân viên`} delay={300} closeDelay={0}>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-100 shrink-0">
                        <Users size={12} className="text-gray-400" />
                        <span className="text-[11px] font-semibold text-gray-500">{dv.nhan_vien?.length || 0}</span>
                    </div>
                </Tooltip>
            </div>

            {/* Row 2: Three stat numbers — always show all for alignment */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-500" />
                    <span className="text-[15px] font-bold text-gray-800">{pendingCount}</span>
                    <span className="text-[11px] text-gray-400">Chờ duyệt</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[15px] font-bold text-gray-800">{approvedCount}</span>
                    <span className="text-[11px] text-gray-400">Đã duyệt</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <XCircle size={14} className="text-rose-500" />
                    <span className="text-[15px] font-bold text-gray-800">{rejectedCount}</span>
                    <span className="text-[11px] text-gray-400">Từ chối</span>
                </div>
            </div>

            {/* Row 3: Progress bar — pinned to bottom via mt-auto */}
            <div className="mt-auto">
                <div className="flex h-[6px] rounded-full overflow-hidden bg-gray-100">
                    {pendingCount > 0 && (
                        <div className="bg-amber-400 transition-all duration-300" style={{ width: `${pendingPct}%` }} />
                    )}
                    {approvedCount > 0 && (
                        <div className="bg-emerald-400 transition-all duration-300" style={{ width: `${approvedPct}%` }} />
                    )}
                    {rejectedCount > 0 && (
                        <div className="bg-rose-400 transition-all duration-300" style={{ width: `${rejectedPct}%` }} />
                    )}
                </div>
                <div className="flex items-center justify-between mt-1">
                    {totalDon > 0 ? (
                        <>
                            {pendingCount > 0 && (
                                <span className="text-[10px] font-medium text-amber-500 whitespace-nowrap">{pendingPct.toFixed(1)}%</span>
                            )}
                            {approvedCount > 0 && (
                                <span className="text-[10px] font-medium text-emerald-500 whitespace-nowrap">{approvedPct.toFixed(1)}%</span>
                            )}
                            {rejectedCount > 0 && (
                                <span className="text-[10px] font-medium text-rose-500 whitespace-nowrap">{rejectedPct.toFixed(1)}%</span>
                            )}
                        </>
                    ) : (
                        <span className="text-[10px] text-gray-300">Chưa có đơn</span>
                    )}
                </div>
            </div>
        </div>
    )
})

// ─── Column Content ─────────────────────────────────────────────────────────
const ColumnContent = React.memo(({
    loai,
    danhSachDonVi,
    searchQuery,
    onSearchChange,
    onSelectDonVi
}: {
    loai: string,
    danhSachDonVi: DonViThongKe[],
    searchQuery: string,
    onSearchChange: (loai: string, value: string) => void,
    onSelectDonVi: (dv: DonViThongKe) => void
}) => {
    const sq = removeVietnameseTones(searchQuery)
    const filteredData = sq
        ? danhSachDonVi.filter(dv =>
            removeVietnameseTones(dv.ten_don_vi || '').includes(sq) ||
            removeVietnameseTones(dv.ma_don_vi || '').includes(sq)
        )
        : danhSachDonVi

    const [isSearchVisible, setIsSearchVisible] = useState(false)

    return (
        <>
            {/* Column Header */}
            <div className="py-2 px-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sticky top-0 bg-gray-100 dark:bg-slate-800 rounded-t-xl z-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-1.5">
                            <GripHorizontal size={18} className="text-gray-400 hover:text-blue-500 transition-colors cursor-grab active:cursor-grabbing" />
                            {getTenLoaiDonVi(loai)}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
                            onPress={() => {
                                setIsSearchVisible(!isSearchVisible)
                                if (isSearchVisible) {
                                    onSearchChange(loai, '')
                                }
                            }}
                        >
                            {isSearchVisible ? <X size={16} /> : <Search size={16} />}
                        </Button>
                        <Chip size="sm" variant="flat" color="default" className="font-bold text-xs h-6">{filteredData.length}</Chip>
                    </div>
                </div>

                <div
                    className={`transition-all duration-300 ease-in-out origin-top overflow-hidden w-full
                        ${isSearchVisible ? 'max-h-16 opacity-100 mt-2 translate-y-0' : 'max-h-0 opacity-0 mt-0 -translate-y-2 pointer-events-none'}`}
                >
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-md px-2 h-10 w-full focus-within:border-blue-500 transition-colors">
                        <Search size={18} className="text-gray-400 shrink-0" />
                        <Input
                            className="bg-transparent border-none shadow-none outline-none p-0 flex-1 min-w-0"
                            placeholder="Nhập tên đơn vị..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(loai, e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Column Body */}
            <div className="p-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 relative z-10" style={{ overscrollBehavior: 'contain' }}>
                <div className="flex flex-col gap-3">
                    {filteredData.map((dv, idx) => (
                        <UnitCard
                            key={dv.id_don_vi}
                            dv={dv}
                            index={idx}
                            onPress={() => onSelectDonVi(dv)}
                        />
                    ))}
                </div>
            </div>
        </>
    )
})


// ─── AccordionGroup (matching reference image) ──────────────────────────────
const AccordionGroup = React.memo(({
    loai,
    isExpanded,
    stats,
    danhSachDonVi,
    onToggle,
    onOpenGroup,
    onSelectDonVi,
    dragControls
}: {
    loai: string
    isExpanded: boolean
    stats: { pending: number; approved: number; rejected: number; totalNhanVien: number; totalDon: number; totalNgayNghi: number }
    danhSachDonVi: DonViThongKe[]
    onToggle: () => void
    onOpenGroup: () => void
    onSelectDonVi: (dv: DonViThongKe) => void
    dragControls?: any
}) => {
    const contentRef = useRef<HTMLDivElement>(null)
    const [contentHeight, setContentHeight] = useState(0)

    React.useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight)
        }
    }, [isExpanded, danhSachDonVi])

    const totalDon = stats.totalDon
    const pendingPct = totalDon > 0 ? (stats.pending / totalDon) * 100 : 0
    const approvedPct = totalDon > 0 ? (stats.approved / totalDon) * 100 : 0
    const rejectedPct = totalDon > 0 ? (stats.rejected / totalDon) * 100 : 0
    const loaiConfig = getLoaiConfig(loai)
    const GroupIcon = loaiConfig.Icon

    return (
        <div className={`rounded-xl border transition-all duration-200 ${isExpanded ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}>
            {/* Header */}
            <div
                className="flex items-center cursor-pointer select-none px-5 py-4 group"
                onClick={onToggle}
            >
                {/* Drag handle */}
                <div
                    className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 mr-3"
                    onPointerDown={(e) => {
                        e.stopPropagation()
                        dragControls?.start(e)
                    }}
                >
                    <GripVertical size={16} />
                </div>

                {/* Group icon */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mr-3"
                    style={{ backgroundColor: loaiConfig.bg }}>
                    <GroupIcon size={20} style={{ color: loaiConfig.color }} />
                </div>

                {/* Group name + unit count — fixed width for cross-row alignment */}
                <div className="flex flex-col gap-0.5 w-[260px] shrink-0 mr-6">
                    <Tooltip content={getTenLoaiDonVi(loai)} delay={300} closeDelay={0}>
                        <h3 className="text-[15px] font-bold text-[#202124] leading-tight line-clamp-2">{getTenLoaiDonVi(loai)}</h3>
                    </Tooltip>
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                        <span>{danhSachDonVi.length} đơn vị</span>
                        <Users size={13} className="text-gray-300" />
                    </div>
                </div>

                {/* Three stat columns — contained icons for visual weight */}
                <div className="flex items-center shrink-0 mx-auto gap-2">
                    <Tooltip content={`${stats.pending} đơn đang chờ duyệt`} delay={300} closeDelay={0}>
                        <div className="flex items-center gap-2.5 w-[130px]">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-amber-50 border border-amber-100">
                                <Clock size={16} className="text-amber-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[20px] font-bold text-gray-800 leading-none">{stats.pending}</span>
                                <span className="text-[11px] text-gray-400 mt-0.5">Chờ duyệt</span>
                            </div>
                        </div>
                    </Tooltip>
                    <Tooltip content={`${stats.approved} đơn đã được duyệt`} delay={300} closeDelay={0}>
                        <div className="flex items-center gap-2.5 w-[130px]">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 border border-emerald-100">
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[20px] font-bold text-gray-800 leading-none">{stats.approved}</span>
                                <span className="text-[11px] text-gray-400 mt-0.5">Đã duyệt</span>
                            </div>
                        </div>
                    </Tooltip>
                    <Tooltip content={`${stats.rejected} đơn bị từ chối`} delay={300} closeDelay={0}>
                        <div className="flex items-center gap-2.5 w-[130px]">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-rose-50 border border-rose-100">
                                <XCircle size={16} className="text-rose-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[20px] font-bold text-gray-800 leading-none">{stats.rejected}</span>
                                <span className="text-[11px] text-gray-400 mt-0.5">Từ chối</span>
                            </div>
                        </div>
                    </Tooltip>
                </div>

                {/* Right: Total summary + progress bar */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end gap-1 w-[200px]">
                        <span className="text-[12px] text-gray-500">
                            Tổng <span className="font-bold text-gray-700">{totalDon} đơn</span> • <span className="font-bold text-gray-700">{stats.totalNgayNghi} ngày nghỉ</span>
                        </span>
                        {totalDon > 0 && (
                            <>
                                <div className="flex h-[6px] rounded-full overflow-hidden bg-gray-100 w-full">
                                    {stats.pending > 0 && (
                                        <div className="bg-amber-400" style={{ width: `${pendingPct}%` }} />
                                    )}
                                    {stats.approved > 0 && (
                                        <div className="bg-emerald-400" style={{ width: `${approvedPct}%` }} />
                                    )}
                                    {stats.rejected > 0 && (
                                        <div className="bg-rose-400" style={{ width: `${rejectedPct}%` }} />
                                    )}
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    {stats.pending > 0 && (
                                        <span className="text-[10px] font-medium text-amber-500 whitespace-nowrap">{pendingPct.toFixed(1)}%</span>
                                    )}
                                    {stats.approved > 0 && (
                                        <span className="text-[10px] font-medium text-emerald-500 whitespace-nowrap">{approvedPct.toFixed(1)}%</span>
                                    )}
                                    {stats.rejected > 0 && (
                                        <span className="text-[10px] font-medium text-rose-500 whitespace-nowrap">{rejectedPct.toFixed(1)}%</span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Chevron */}
                    <ChevronDown
                        size={20}
                        className={`shrink-0 transition-transform duration-300 text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {/* Collapsible content */}
            <div
                style={{ height: isExpanded ? contentHeight : 0 }}
                className="overflow-hidden transition-[height] duration-300 ease-in-out"
            >
                <div ref={contentRef} className="px-5 pb-5 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        {danhSachDonVi.map((dv, idx) => (
                            <UnitCard
                                key={dv.id_don_vi}
                                dv={dv}
                                index={idx}
                                onPress={() => onSelectDonVi(dv)}
                            />
                        ))}
                        {/* "Xem tất cả" card */}
                        <div
                            className="p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all min-h-[120px]"
                            onClick={(e) => { e.stopPropagation(); onOpenGroup() }}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Building2 size={20} className="text-gray-400" />
                            </div>
                            <span className="text-[13px] font-semibold text-gray-500">
                                Xem tất cả {danhSachDonVi.length} đơn vị
                            </span>
                            <ArrowRight size={16} className="text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

const GroupReorderItem = React.memo(({
    loai,
    isExpanded,
    stats,
    danhSachDonVi,
    onToggle,
    onOpenGroup,
    onSelectDonVi
}: {
    loai: string
    isExpanded: boolean
    stats: { pending: number; approved: number; rejected: number; totalNhanVien: number; totalDon: number; totalNgayNghi: number }
    danhSachDonVi: DonViThongKe[]
    onToggle: (loai: string) => void
    onOpenGroup: (loai: string) => void
    onSelectDonVi: (dv: DonViThongKe) => void
}) => {
    const controls = useDragControls()

    return (
        <Reorder.Item
            value={loai}
            className="select-none list-none cursor-default"
            dragListener={false}
            dragControls={controls}
        >
            <AccordionGroup
                loai={loai}
                isExpanded={isExpanded}
                stats={stats}
                danhSachDonVi={danhSachDonVi}
                onToggle={() => onToggle(loai)}
                onOpenGroup={() => onOpenGroup(loai)}
                onSelectDonVi={onSelectDonVi}
                dragControls={controls}
            />
        </Reorder.Item>
    )
})

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ThongKeDonViTab({ filter, active }: { filter: any, active?: boolean }) {
    const { data: qData, isLoading } = useQuery({
        queryKey: ['thong_ke_don_vi', filter.dateRange?.from, filter.dateRange?.to],
        queryFn: async () => {
            const res = await nghiphepAxios.thongKeDonVi({
                start_date: filter.dateRange?.from,
                end_date: filter.dateRange?.to
            })
            if (res?.success) return res.data as ThongKeResponse
            return null
        },
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        enabled: active ?? true
    })

    const [orderedData, setOrderedData] = useState<Record<string, DonViThongKe[]>>({})
    const [orderedLoaiKeys, setOrderedLoaiKeys] = useState<string[]>([])

    React.useEffect(() => {
        if (qData?.data) {
            const rawData = qData.data
            let loaiKeys = Object.keys(rawData)

            const currentLoaiOrder = useNghiPhepStore.getState().loaiOrder
            const currentUnitOrder = useNghiPhepStore.getState().unitOrder

            if (currentLoaiOrder && currentLoaiOrder.length > 0) {
                loaiKeys.sort((a, b) => {
                    const indexA = currentLoaiOrder.indexOf(a)
                    const indexB = currentLoaiOrder.indexOf(b)
                    if (indexA === -1) return 1
                    if (indexB === -1) return -1
                    return indexA - indexB
                })
            }

            const processedData: Record<string, DonViThongKe[]> = {}
            loaiKeys.forEach(loai => {
                const units = [...(rawData[loai] || [])]
                const savedIds = currentUnitOrder[loai]
                if (savedIds && savedIds.length > 0) {
                    units.sort((a, b) => {
                        const indexA = savedIds.indexOf(a.id_don_vi)
                        const indexB = savedIds.indexOf(b.id_don_vi)
                        if (indexA === -1) return 1
                        if (indexB === -1) return -1
                        return indexA - indexB
                    })
                }
                processedData[loai] = units
            })

            setOrderedData(processedData)
            setOrderedLoaiKeys(loaiKeys)
        }
    }, [qData?.data])

    // Filter out LANH_DAO from display
    const filteredLoaiKeys = orderedLoaiKeys.filter(loai => loai !== 'LANH_DAO')

    // Toggle expanded state per group (default = collapsed)
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

    const toggleGroupCollapse = useCallback((loai: string) => {
        setExpandedGroups(prev => ({ ...prev, [loai]: !prev[loai] }))
    }, [])

    const isGroupExpanded = useCallback((loai: string) => {
        return !!expandedGroups[loai]
    }, [expandedGroups])

    const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})

    // Compute stats for each group - memoized to prevent re-renders
    const groupStatsMap = useMemo(() => {
        const map: Record<string, { pending: number; approved: number; rejected: number; totalNhanVien: number; totalDon: number; totalNgayNghi: number }> = {}
        filteredLoaiKeys.forEach(loai => {
            const danhSachDonVi = orderedData[loai]
            if (danhSachDonVi && Array.isArray(danhSachDonVi)) {
                let pending = 0
                let approved = 0
                let rejected = 0
                let totalNhanVien = 0
                let totalDon = 0
                let totalNgayNghi = 0
                danhSachDonVi.forEach(dv => {
                    totalNhanVien += dv.tong_nhan_vien
                    approved += dv.tong_so_don_da_duyet
                    totalDon += dv.tong_so_don
                    totalNgayNghi += dv.tong_ngay_nghi
                    const dvRejected = dv.tong_so_don_tu_choi ?? dv.nhan_vien?.reduce((s, nv) => s + (nv.so_don_tu_choi || 0), 0) ?? 0
                    rejected += dvRejected
                    pending += Math.max(0, dv.tong_so_don - dv.tong_so_don_da_duyet - dvRejected)
                })
                map[loai] = { pending, approved, rejected, totalNhanVien, totalDon, totalNgayNghi }
            }
        })
        return map
    }, [filteredLoaiKeys, orderedData])

    const handleSearchChange = useCallback((loai: string, value: string) => {
        setSearchQueries(prev => ({ ...prev, [loai]: value }))
    }, [])

    const [selectedDonVi, setSelectedDonVi] = useState<DonViThongKe | null>(null)
    // State cho nhân viên được chọn trong sub-view
    const [selectedNhanVien, setSelectedNhanVien] = useState<NhanVienThongKe | null>(null)

    // State for group-level drawer ("Xem tất cả")
    const [selectedGroupLoai, setSelectedGroupLoai] = useState<string | null>(null)
    const [groupFilterUnit, setGroupFilterUnit] = useState<string>('all')
    const [selectedGroupNhanVien, setSelectedGroupNhanVien] = useState<NhanVienThongKe | null>(null)

    // Sync loai order to zustand state with debounce
    // This prevents extremely expensive global re-renders while dragging
    React.useEffect(() => {
        if (orderedLoaiKeys.length > 0) {
            const timeoutId = setTimeout(() => {
                useNghiPhepStore.getState().setLoaiOrder(orderedLoaiKeys)
            }, 300)
            return () => clearTimeout(timeoutId)
        }
    }, [orderedLoaiKeys])

    // Khi đóng modal đơn vị -> reset cả 2 state
    const handleCloseDonViModal = useCallback(() => {
        setSelectedDonVi(null)
        setSelectedNhanVien(null)
    }, [])

    const handleCloseGroupDrawer = useCallback(() => {
        setSelectedGroupLoai(null)
        setGroupFilterUnit('all')
        setSelectedGroupNhanVien(null)
    }, [])

    const handleOpenGroupDrawer = useCallback((loai: string) => {
        setSelectedGroupLoai(loai)
        setGroupFilterUnit('all')
        setSelectedGroupNhanVien(null)
    }, [])

    // Khi chọn đơn vị khác -> reset nhân viên đang chọn
    const handleSelectDonVi = useCallback((dv: DonViThongKe) => {
        setSelectedNhanVien(null)
        setSelectedDonVi(dv)
    }, [])

    // All employees of selected group, filterable by unit
    const groupAllNhanVien = useMemo(() => {
        if (!selectedGroupLoai) return []
        const units = orderedData[selectedGroupLoai] || []
        if (groupFilterUnit === 'all') {
            return units.flatMap(u => u.nhan_vien || [])
        }
        const unit = units.find(u => u.id_don_vi === groupFilterUnit)
        return unit?.nhan_vien || []
    }, [selectedGroupLoai, orderedData, groupFilterUnit])

    const groupUnits = useMemo(() => {
        if (!selectedGroupLoai) return []
        return orderedData[selectedGroupLoai] || []
    }, [selectedGroupLoai, orderedData])

    // Date filter để truyền xuống sub-component
    const dateFilter = {
        start_date: filter.dateRange?.from,
        end_date: filter.dateRange?.to
    }

    const renderSecondaryTitle = (nv: NhanVienThongKe | null) => {
        if (!nv) return undefined;
        return (
            <div className="flex items-center gap-3 w-full pr-2 overflow-hidden">
                <UserAvatar name={nv.ho_va_ten} src={nv.avatar ?? undefined} size="sm" className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-gray-900 leading-tight truncate">{nv.ho_va_ten}</span>
                        <span className="text-[11px] font-medium text-gray-400">ID: {nv.ma_nhan_vien}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-1 text-[11px] text-orange-600 font-semibold bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded">
                            <FileText size={10} />
                            <span>{nv.so_don} đơn</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-600 font-semibold bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                            <CalendarClock size={10} />
                            <span>{nv.so_ngay_nghi} ngày</span>
                        </div>
                        {Math.max(0, nv.so_don - nv.so_don_da_duyet - (nv.so_don_tu_choi || 0)) > 0 && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100 whitespace-nowrap hidden sm:inline-block">
                                {Math.max(0, nv.so_don - nv.so_don_da_duyet - (nv.so_don_tu_choi || 0))} Chờ
                            </span>
                        )}
                        {nv.so_don_da_duyet > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap hidden sm:inline-block">
                                {nv.so_don_da_duyet} Duyệt
                            </span>
                        )}
                        {(nv.so_don_tu_choi || 0) > 0 && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100 whitespace-nowrap hidden sm:inline-block">
                                {nv.so_don_tu_choi} Từ chối
                            </span>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 w-full bg-white overflow-y-auto pr-4 md:pr-6 py-4 md:py-6 custom-scrollbar">
            <div className="mx-auto">
                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                ) : filteredLoaiKeys.length > 0 ? (
                    <Reorder.Group
                        axis="y"
                        values={filteredLoaiKeys}
                        onReorder={(newOrder) => {
                            // Update local state smoothly. The useEffect will debounce Syncing to Zustand
                            setOrderedLoaiKeys(newOrder)
                        }}
                        className="flex flex-col gap-3"
                    >
                        {filteredLoaiKeys.map((loai) => {
                            const danhSachDonVi = orderedData[loai]
                            if (!danhSachDonVi || !Array.isArray(danhSachDonVi) || danhSachDonVi.length === 0) return null

                            const stats = groupStatsMap[loai] || { pending: 0, approved: 0, rejected: 0, totalNhanVien: 0, totalDon: 0, totalNgayNghi: 0 }
                            const isExpanded = isGroupExpanded(loai)

                            return (
                                <GroupReorderItem
                                    key={loai}
                                    loai={loai}
                                    isExpanded={isExpanded}
                                    stats={stats}
                                    danhSachDonVi={danhSachDonVi}
                                    onToggle={toggleGroupCollapse}
                                    onOpenGroup={handleOpenGroupDrawer}
                                    onSelectDonVi={handleSelectDonVi}
                                />
                            )
                        })}
                    </Reorder.Group>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                            <FileText size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Chưa có dữ liệu thống kê nghỉ phép</p>
                    </div>
                )}
            </div>

            {/* HrDrawer đơn vị → hiện danh sách NV và chi tiết đơn */}
            <HrDrawer
                isOpen={!!selectedDonVi}
                onClose={() => handleCloseDonViModal()}
                onOpenChange={(open) => { if (!open) handleCloseDonViModal() }}
                defaultWidth={900}
                minWidth={900}
                isSecondaryOpen={!!selectedNhanVien}
                onSecondaryClose={() => setSelectedNhanVien(null)}
                secondaryTitle={renderSecondaryTitle(selectedNhanVien)}
                secondaryWidth={420}
                classNames={{ base: 'rounded-tl-2xl! rounded-bl-2xl!', body: 'p-0!' }}
                secondaryContent={
                    selectedNhanVien ? (
                        <NhanVienDonList
                            nhanVien={selectedNhanVien}
                            filter={dateFilter}
                        />
                    ) : undefined
                }
            >
                {/* Primary panel: Employee list */}
                <HrDrawerHeader className="h-[72px] flex items-center justify-between px-4 md:px-6 border-b border-divider shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 pr-4 truncate leading-tight">{selectedDonVi?.ten_don_vi}</h2>
                    <button
                        onClick={() => handleCloseDonViModal()}
                        className="p-2 shrink-0 rounded-xl transition-colors bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 shadow-sm"
                        title="Đóng"
                    >
                        <X size={18} strokeWidth={2} />
                    </button>
                </HrDrawerHeader>
                <HrDrawerBody>
                    {selectedDonVi && (
                        <NhanVienList
                            dsNhanVien={selectedDonVi.nhan_vien}
                            onSelectNhanVien={setSelectedNhanVien}
                            selectedNhanVienId={selectedNhanVien?.id_nhan_vien}
                        />
                    )}
                </HrDrawerBody>
            </HrDrawer>

            {/* HrDrawer group "Xem tất cả" → hiện tất cả NV của group, filter theo đơn vị */}
            <HrDrawer
                isOpen={!!selectedGroupLoai}
                onClose={handleCloseGroupDrawer}
                onOpenChange={(open) => { if (!open) handleCloseGroupDrawer() }}
                defaultWidth={900}
                isSecondaryOpen={!!selectedGroupNhanVien}
                onSecondaryClose={() => setSelectedGroupNhanVien(null)}
                secondaryTitle={renderSecondaryTitle(selectedGroupNhanVien)}
                secondaryWidth={420}
                classNames={{ base: 'rounded-tl-2xl! rounded-bl-2xl!', body: 'p-0!' }}
                secondaryContent={
                    selectedGroupNhanVien ? (
                        <NhanVienDonList
                            nhanVien={selectedGroupNhanVien}
                            filter={dateFilter}
                        />
                    ) : undefined
                }
            >
                <HrDrawerHeader className="h-[72px] flex items-center justify-between px-4 md:px-6 border-b border-divider shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 pr-4 truncate leading-tight">{selectedGroupLoai ? getTenLoaiDonVi(selectedGroupLoai) : ''}</h2>
                    <button
                        onClick={handleCloseGroupDrawer}
                        className="p-2 shrink-0 rounded-xl transition-colors bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 cursor-pointer shadow-sm"
                        title="Đóng"
                    >
                        <X size={18} strokeWidth={2} />
                    </button>
                </HrDrawerHeader>
                <HrDrawerBody>
                    <NhanVienList
                        dsNhanVien={groupAllNhanVien}
                        onSelectNhanVien={setSelectedGroupNhanVien}
                        selectedNhanVienId={selectedGroupNhanVien?.id_nhan_vien}
                        units={
                            groupUnits.length > 1
                                ? [
                                    { id: 'all', name: 'Tất cả khoa/phòng', count: groupUnits.reduce((s, u) => s + (u.nhan_vien?.length || 0), 0) },
                                    ...groupUnits.map(u => ({ id: u.id_don_vi, name: u.ten_don_vi, count: u.nhan_vien?.length || 0 }))
                                ]
                                : undefined
                        }
                        selectedUnit={groupFilterUnit}
                        onSelectUnit={setGroupFilterUnit}
                    />
                </HrDrawerBody>
            </HrDrawer>

        </div>
    )
}
