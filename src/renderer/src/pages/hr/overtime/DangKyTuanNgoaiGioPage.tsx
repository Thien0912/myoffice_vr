import { Button as ButtonV3, Modal as ModalV3, toast } from '@heroui-v3/react'
import { Button, Chip, cn, Input, Tooltip } from '@heroui/react'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TableColumnConfig from '@renderer/components/table/TableColumnConfig'
import TablePagination from '@renderer/components/table/TablePagination'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { AdvancedFilterPopover } from '@renderer/components/advanced-filter'
import { StatsOverview, SummaryCard } from '@renderer/components/overview-cards'
import { HrPrimaryButton } from '@renderer/components/hero-custom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BarChart2, Calendar, Check, CircleHelp, Edit2, Lock, Plus, Trash2, Unlock, X, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import BangChamCongDetailModal from './components/BangChamCongDetailModal'

const MONTH_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

function MonthPickerDropdown({
    value,
    onChange,
    onClear
}: {
    value: string              // "MM/YYYY" hoặc ""
    onChange: (val: string) => void
    onClear: () => void
}) {
    // value prop: "YYYY-MM" hoặc ""
    const [isOpen, setIsOpen] = useState(false)
    const [pickerYear, setPickerYear] = useState(() => {
        if (value) return parseInt(value.split('-')[0]) || new Date().getFullYear()
        return new Date().getFullYear()
    })
    const containerRef = useRef<HTMLDivElement>(null)

    // Đóng khi click ngoài
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [isOpen])

    // Sync năm hiển thị khi value thay đổi từ bên ngoài
    useEffect(() => {
        if (value) setPickerYear(parseInt(value.split('-')[0]) || new Date().getFullYear())
    }, [value])

    // Parse: value = "YYYY-MM"
    const [selectedYYYY, selectedMM] = value ? value.split('-') : ['', '']

    // Hiển thị trong Input: MM/YYYY
    const displayValue = selectedYYYY && selectedMM ? `${selectedMM}/${selectedYYYY}` : ''

    const handleSelect = (monthIndex: number) => {
        const mm = String(monthIndex + 1).padStart(2, '0')
        onChange(`${pickerYear}-${mm}`)   // emit YYYY-MM
        setIsOpen(false)
    }

    const handleThisMonth = () => {
        const now = new Date()
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        onChange(`${now.getFullYear()}-${mm}`)   // emit YYYY-MM
        setIsOpen(false)
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Visible input */}
            <Input
                placeholder="mm/yyyy"
                value={displayValue}
                readOnly
                onClick={() => setIsOpen(o => !o)}
                endContent={
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(o => !o) }}
                        className="text-default-400 hover:text-primary transition-colors"
                    >
                        <Calendar size={14} />
                    </button>
                }
                classNames={{ base: 'cursor-pointer' }}
            />

            {/* Custom dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-zinc-900 border border-default-200 rounded-xl shadow-xl p-3 flex flex-col">
                    {/* Year nav */}
                    <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-1">
                        <button
                            type="button"
                            onClick={() => setPickerYear(y => y - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-gray-600 dark:text-gray-300 shadow-sm transition-all text-lg leading-none"
                        >
                            ‹
                        </button>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{pickerYear}</span>
                        <button
                            type="button"
                            onClick={() => setPickerYear(y => y + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-gray-600 dark:text-gray-300 shadow-sm transition-all text-lg leading-none"
                        >
                            ›
                        </button>
                    </div>

                    {/* Month grid */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {MONTH_LABELS.map((label, i) => {
                            const mm = String(i + 1).padStart(2, '0')
                            const isSelected = mm === selectedMM && String(pickerYear) === selectedYYYY
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelect(i)}
                                    className={cn(
                                        'h-9 rounded-xl text-[12px] font-medium transition-all border border-transparent',
                                        isSelected
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                            : 'bg-white dark:bg-zinc-800 hover:border-gray-200 dark:hover:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                    )}
                                >
                                    T{label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-1 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => { onClear(); setIsOpen(false) }}
                            className="text-xs font-semibold text-danger hover:bg-danger-50 dark:hover:bg-danger-500/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Xóa
                        </button>
                        <button
                            type="button"
                            onClick={handleThisMonth}
                            className="text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Chọn tháng này
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

interface BangChamCongThang {
    id: number
    thang: string
    ngay_bat_dau: string
    ngay_ket_thuc: string
    ten_bang: string
    trang_thai: 'DANG_CHO_DUYET' | 'DA_DUYET' | 'BI_TU_CHOI' | 'KHOA' | 'MO'
    nguoi_duyet?: number
    ngay_duyet?: string
    nguoi_duyet_ho_ten?: string
    nguoi_tao_ho_ten?: string
    ly_do_tu_choi?: string
    ghi_chu?: string
    created_at: string
}

interface FormData {
    id?: number
    thang: string
    ngay_bat_dau: string
    ngay_ket_thuc: string
    ten_bang: string
    ghi_chu: string
}

const TRANG_THAI_CONFIG = {
    MO: { label: 'Đang mở', color: 'success', icon: Unlock },
    KHOA: { label: 'Đã khóa', color: 'warning', icon: Lock },
    DA_DUYET: { label: 'Đã duyệt', color: 'primary', icon: Check },
    BI_TU_CHOI: { label: 'Bị từ chối', color: 'danger', icon: X },
    DANG_CHO_DUYET: { label: 'Chờ duyệt', color: 'default', icon: Calendar }
}

function MonthFilterContent({ filterThang, setFilterThang, setIsFilterPopoverOpen, setPage }: { filterThang: string, setFilterThang: (v: string) => void, setIsFilterPopoverOpen: (v: boolean) => void, setPage: (v: number) => void }) {
    const [selYYYY, selMM] = filterThang ? filterThang.split('-') : ['', '']
    const [pickerYear, setPickerYear] = useState(() => selYYYY ? parseInt(selYYYY) : new Date().getFullYear())

    useEffect(() => {
        if (selYYYY) {
            setPickerYear(parseInt(selYYYY))
        }
    }, [selYYYY])

    return (
        <div className="flex flex-col p-2 w-[280px]">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">Lọc theo tháng</span>

            <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-1">
                <button
                    type="button"
                    onClick={() => setPickerYear(y => y - 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-gray-600 dark:text-gray-300 shadow-sm transition-all text-lg leading-none"
                >‹</button>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{pickerYear}</span>
                <button
                    type="button"
                    onClick={() => setPickerYear(y => y + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-gray-600 dark:text-gray-300 shadow-sm transition-all text-lg leading-none"
                >›</button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
                {MONTH_LABELS.map((label, i) => {
                    const mm = String(i + 1).padStart(2, '0')
                    const isSelected = mm === selMM && String(pickerYear) === selYYYY
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                                setFilterThang(`${pickerYear}-${mm}`)
                                setPage(1)
                                setIsFilterPopoverOpen(false)
                            }}
                            className={cn(
                                'h-9 rounded-xl text-[12px] font-medium transition-all border border-transparent',
                                isSelected
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-white dark:bg-zinc-800 hover:border-gray-200 dark:hover:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                            )}
                        >
                            T{label}
                        </button>
                    )
                })}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                <button
                    type="button"
                    onClick={() => {
                        const now = new Date()
                        const mm = String(now.getMonth() + 1).padStart(2, '0')
                        setFilterThang(`${now.getFullYear()}-${mm}`)
                        setPage(1)
                        setIsFilterPopoverOpen(false)
                    }}
                    className="w-full h-9 rounded-xl text-[13px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
                >
                    Chọn tháng này
                </button>
            </div>
        </div>
    )
}

export default function DangKyTuanNgoaiGioPage() {
    const queryClient = useQueryClient()
    const [filterStatus, setFilterStatus] = useState<string>('')
    const [filterThang, setFilterThang] = useState('')   // YYYY-MM
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<BangChamCongThang | null>(null)
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        type: 'delete' | 'delete_bulk' | 'khoa' | 'mo' | 'duyet' | 'tu_choi'
        item: BangChamCongThang | null
    }>({ isOpen: false, type: 'delete', item: null })
    const [detailModalItem, setDetailModalItem] = useState<BangChamCongThang | null>(null)
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

    const hiddenMonthRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState<FormData>({
        thang: '',
        ngay_bat_dau: '',
        ngay_ket_thuc: '',
        ten_bang: '',
        ghi_chu: ''
    })

    // Column Config States
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
        new Set(['stt', 'thang', 'ten_bang', 'ngay_bat_dau', 'trang_thai', 'nguoi_tao_ho_ten', 'actions'])
    )
    const [columnOrder, setColumnOrder] = useState<string[]>([
        'stt', 'thang', 'ten_bang', 'ngay_bat_dau', 'trang_thai', 'nguoi_tao_ho_ten', 'actions'
    ])

    // Filter popover state
    const activeFilterCount = [filterThang].filter(Boolean).length
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false)
    const [activeFilterTab, setActiveFilterTab] = useState('month')
    const [isStatsExpanded, setIsStatsExpanded] = useState(window.innerWidth >= 640)

    // Query danh sách
    const { data, isLoading } = useQuery({
        queryKey: ['bangChamCongThang', filterStatus, filterThang, page, limit],
        queryFn: async () => {
            const res = await ngoaiGioAxios.getBangChamCongThang({
                trang_thai: filterStatus as any,
                thang: filterThang || undefined,
                start: (page - 1) * limit,
                length: limit
            })
            return res.data
        }
    })

    const bangChamCongs: BangChamCongThang[] = data?.data || []
    const total = data?.recordsTotal || 0
    const filtered = data?.recordsFiltered || 0

    // Stats
    const stats = {
        total: bangChamCongs.length,
        mo: bangChamCongs.filter(b => b.trang_thai === 'MO').length,
        khoa: bangChamCongs.filter(b => b.trang_thai === 'KHOA').length,
        duyet: bangChamCongs.filter(b => b.trang_thai === 'DA_DUYET').length
    }

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: any) => ngoaiGioAxios.createBangChamCong(data),
        onSuccess: () => {
            toast('Tạo bảng chấm công thành công', { variant: 'success' })
            queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
            handleCloseModal()
        },
        onError: (error: any) => {
            toast(error?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'danger' })
        }
    })

    const updateMutation = useMutation({
        mutationFn: (data: any) => ngoaiGioAxios.updateBangChamCong(data),
        onSuccess: () => {
            toast('Cập nhật bảng chấm công thành công', { variant: 'success' })
            queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
            handleCloseModal()
        },
        onError: (error: any) => {
            toast(error?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'danger' })
        }
    })

    const toggleKhoaMutation = useMutation({
        mutationFn: ({ id, trang_thai }: { id: number; trang_thai: 'KHOA' | 'MO' }) =>
            ngoaiGioAxios.khoaBangChamCong({ id, trang_thai }),
        onSuccess: (_, variables) => {
            const action = variables.trang_thai === 'KHOA' ? 'Khóa' : 'Mở khóa'
            toast(`${action} bảng chấm công thành công`, { variant: 'success' })
            queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
            setConfirmModal({ isOpen: false, type: 'delete', item: null })
        },
        onError: (error: any) => {
            toast(error?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'danger' })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => ngoaiGioAxios.deleteBangChamCong(id),
        onSuccess: () => {
            toast('Xóa bảng chấm công thành công', { variant: 'success' })
            queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
            setConfirmModal({ isOpen: false, type: 'delete', item: null })
        },
        onError: (error: any) => {
            toast(error?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'danger' })
        }
    })

    const deleteBulkMutation = useMutation({
        mutationFn: async (ids: number[]) => {
            await Promise.all(ids.map(id => ngoaiGioAxios.deleteBangChamCong(id)))
        },
        onSuccess: () => {
            toast('Xóa các bảng chấm công thành công', { variant: 'success' })
            queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
            setConfirmModal({ isOpen: false, type: 'delete', item: null })
            setSelectedKeys(new Set())
        },
        onError: (error: any) => {
            toast(error?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'danger' })
        }
    })

    const handleOpenModal = (item?: BangChamCongThang) => {
        if (item) {
            // Normalize thang: server có thể trả "MM/YYYY" hoặc "YYYY-MM"
            const rawThang = item.thang || ''
            let normalizedThang = rawThang
            if (rawThang && rawThang.includes('/')) {
                // Format "MM/YYYY" → convert to "YYYY-MM"
                const [mm, yyyy] = rawThang.split('/')
                normalizedThang = `${yyyy}-${mm.padStart(2, '0')}`
            }
            setEditingItem(item)
            setFormData({
                id: item.id,
                thang: normalizedThang,
                ngay_bat_dau: item.ngay_bat_dau,
                ngay_ket_thuc: item.ngay_ket_thuc,
                ten_bang: item.ten_bang,
                ghi_chu: item.ghi_chu || ''
            })
        } else {
            setEditingItem(null)
            setFormData({
                thang: '',
                ngay_bat_dau: '',
                ngay_ket_thuc: '',
                ten_bang: '',
                ghi_chu: ''
            })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingItem(null)
        setFormData({
            thang: '',
            ngay_bat_dau: '',
            ngay_ket_thuc: '',
            ten_bang: '',
            ghi_chu: ''
        })
    }

    // Khi chọn tháng: auto-fill ngày bắt đầu = 23 tháng đó, ngày kết thúc = 22 tháng sau
    const handleThangChange = (monthValue: string) => {
        if (!monthValue) {
            setFormData({ ...formData, thang: '', ngay_bat_dau: '', ngay_ket_thuc: '' })
            return
        }

        // monthValue format: "YYYY-MM" (từ input type="month")
        const [year, month] = monthValue.split('-').map(Number)

        // Ngày bắt đầu: 23 tháng hiện tại (format thủ công tránh UTC offset)
        const pad = (n: number) => String(n).padStart(2, '0')
        const startStr = `${year}-${pad(month)}-23`

        // Ngày kết thúc: 22 tháng sau
        const nextMonth = month === 12 ? 1 : month + 1
        const nextYear = month === 12 ? year + 1 : year
        const endStr = `${nextYear}-${pad(nextMonth)}-22`

        // Format tháng để lưu: YYYY-MM
        const thangFormatted = `${year}-${String(month).padStart(2, '0')}`

        // Auto-fill tên bảng nếu chưa nhập hoặc tên bảng đang theo format cũ
        const defaultTenBang = `Bảng chấm công tháng ${month}/${year}`
        const shouldUpdateTenBang = !formData.ten_bang || formData.ten_bang.startsWith('Bảng chấm công tháng ')

        setFormData({
            ...formData,
            thang: thangFormatted,
            ngay_bat_dau: startStr,
            ngay_ket_thuc: endStr,
            ten_bang: shouldUpdateTenBang ? defaultTenBang : formData.ten_bang
        })
    }

    const handleSubmit = () => {
        if (!formData.thang || !formData.ngay_bat_dau || !formData.ngay_ket_thuc) {
            toast('Vui lòng nhập đầy đủ thông tin', { variant: 'warning' })
            return
        }

        if (editingItem) {
            updateMutation.mutate(formData)
        } else {
            createMutation.mutate(formData)
        }
    }

    const handleConfirmAction = () => {
        const { type, item } = confirmModal

        switch (type) {
            case 'delete':
                if (item) deleteMutation.mutate(item.id)
                break
            case 'delete_bulk':
                deleteBulkMutation.mutate(Array.from(selectedKeys).map(Number))
                break
            case 'khoa':
                if (item) toggleKhoaMutation.mutate({ id: item.id, trang_thai: 'KHOA' })
                break
            case 'mo':
                if (item) toggleKhoaMutation.mutate({ id: item.id, trang_thai: 'MO' })
                break
        }
    }

    // Table columns
    const columns: TableColumnType<BangChamCongThang>[] = [
        {
            name: 'STT',
            uid: 'stt',
            width: 60,
            render: (_: any, row?: BangChamCongThang, index?: number) => {
                if (!row || index === undefined) return null
                return <span className="text-gray-600 dark:text-gray-400">{(page - 1) * limit + index + 1}</span>
            }
        },
        {
            name: 'Tháng',
            uid: 'thang',
            width: 100,
            sortable: true,
            render: (value: any) => (
                <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
            )
        },
        {
            name: 'Tên bảng',
            uid: 'ten_bang',
            width: 250,
            sortable: true
        },
        {
            name: 'Thời gian',
            uid: 'ngay_bat_dau',
            width: 230,
            render: (_: any, row?: BangChamCongThang) => {
                if (!row) return null
                const isActive = row.trang_thai === 'MO'
                const startFormatted = new Date(row.ngay_bat_dau).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                const endFormatted = new Date(row.ngay_ket_thuc).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                return (
                    <div className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                        isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    )}>
                        <Calendar size={12} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                        <span>{startFormatted} → {endFormatted}</span>
                        {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        )}
                    </div>
                )
            }
        },
        {
            name: 'Trạng thái',
            uid: 'trang_thai',
            width: 130,
            render: (value: any) => {
                const config = TRANG_THAI_CONFIG[value as keyof typeof TRANG_THAI_CONFIG]
                const Icon = config.icon
                return (
                    <Chip
                        size="sm"
                        variant="flat"
                        color={config.color as any}
                    >
                        <div className="flex items-center gap-1">
                            <Icon size={14} />
                            <span>{config.label}</span>
                        </div>
                    </Chip>
                )
            }
        },
        {
            name: 'Người tạo',
            uid: 'nguoi_tao_ho_ten',
            width: 180
        },
        {
            name: 'Thao tác',
            uid: 'actions',
            width: 150,
            render: (_: any, row?: BangChamCongThang) => {
                if (!row) return null
                return (
                    <div className="flex items-center gap-1.5">
                        <Button
                            size="sm"
                            variant="flat"
                            isIconOnly
                            onPress={() => setDetailModalItem(row)}
                            className="text-blue-600"
                        >
                            <Calendar size={16} />
                        </Button>
                        {row.trang_thai !== 'DA_DUYET' && (
                            <Button
                                size="sm"
                                variant="flat"
                                isIconOnly
                                onPress={() => handleOpenModal(row)}
                            >
                                <Edit2 size={16} />
                            </Button>
                        )}
                        {row.trang_thai === 'MO' && (
                            <Button
                                size="sm"
                                variant="flat"
                                isIconOnly
                                onPress={() => setConfirmModal({ isOpen: true, type: 'khoa', item: row })}
                                className="text-orange-600"
                            >
                                <Lock size={16} />
                            </Button>
                        )}
                        {row.trang_thai === 'KHOA' && (
                            <Button
                                size="sm"
                                variant="flat"
                                isIconOnly
                                onPress={() => setConfirmModal({ isOpen: true, type: 'mo', item: row })}
                                className="text-green-600"
                            >
                                <Unlock size={16} />
                            </Button>
                        )}
                    </div>
                )
            }
        }
    ]

    return (
        <div className="flex flex-col w-full h-[calc(100dvh-57px)] overflow-hidden relative bg-white dark:bg-gray-900">
            <div className="flex flex-col h-full flex-1 min-h-0">
                {/* ── HEADER ZONE: Stats + Right Actions ── */}
                <div className="z-30 bg-white dark:bg-gray-900/95 flex-none border-b border-gray-200 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">

                    {/* Stats Cards Section (collapsible) */}
                    <StatsOverview
                        title={`TỔNG QUAN ${total > 0 ? `(${total} BẢNG)` : ''}`}
                        icon={<BarChart2 size={16} />}
                        isExpanded={isStatsExpanded}
                        onToggleExpand={setIsStatsExpanded}
                        rightActions={
                            <>
                                {/* ── TOOLBAR ROW: Search + Filter (inline) + chips ── */}
                                <div className="flex items-center gap-2 pr-2">
                                    {/* AdvancedFilterPopover */}
                                    <AdvancedFilterPopover
                                        className="sm:w-[524px]"
                                        isOpen={isFilterPopoverOpen}
                                        onOpenChange={setIsFilterPopoverOpen}
                                        isMobile={false}
                                        activeFilterCount={activeFilterCount}
                                        onClearAll={() => { setFilterThang(''); setPage(1) }}
                                        tabs={[
                                            {
                                                id: 'month',
                                                label: 'Tháng',
                                                icon: Calendar,
                                                subtitle: filterThang
                                                    ? (() => { const [y, m] = filterThang.split('-'); return `${m}/${y}` })()
                                                    : 'Tất cả tháng',
                                                hasFilter: !!filterThang
                                            }
                                        ]}
                                        activeTabId={activeFilterTab}
                                        onTabChange={setActiveFilterTab}
                                    >
                                        {activeFilterTab === 'month' && (
                                            <div className="p-3">
                                                <MonthFilterContent
                                                    filterThang={filterThang}
                                                    setFilterThang={setFilterThang}
                                                    setIsFilterPopoverOpen={setIsFilterPopoverOpen}
                                                    setPage={setPage}
                                                />
                                            </div>
                                        )}
                                    </AdvancedFilterPopover>

                                    {/* Active filter chip — tháng */}
                                    {filterThang && (() => {
                                        const [yyyy, mm] = filterThang.split('-')
                                        return (
                                            <div className="flex items-center gap-1 h-8 pl-2 pr-1 rounded-full border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 text-[11px] font-medium text-orange-700 dark:text-orange-300">
                                                <Calendar size={10} className="text-orange-400 shrink-0" />
                                                <span>{`${mm}/${yyyy}`}</span>
                                                <button
                                                    onClick={() => { setFilterThang(''); setPage(1) }}
                                                    className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <XCircle size={12} />
                                                </button>
                                            </div>
                                        )
                                    })()}
                                </div>

                                {/* Right Actions inside stats header */}
                                <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-3">
                                    {selectedKeys.size > 0 && (
                                        <ButtonV3
                                            onPress={() => setConfirmModal({ isOpen: true, type: 'delete_bulk', item: null })}
                                            className="bg-danger/10 text-danger font-bold h-8 px-3 rounded-lg shadow-sm hover:bg-danger-soft-hover transition-colors text-xs flex items-center gap-1.5"
                                        >
                                            <Trash2 size={14} />
                                            Xóa ({selectedKeys.size})
                                        </ButtonV3>
                                    )}
                                    <TableColumnConfig
                                        columns={columns as any}
                                        visibleColumns={visibleColumns}
                                        setVisibleColumns={setVisibleColumns}
                                        columnOrder={columnOrder}
                                        setColumnOrder={setColumnOrder}
                                    />
                                    <HrPrimaryButton
                                        onPress={() => handleOpenModal()}
                                    >
                                        Thêm bảng
                                    </HrPrimaryButton>
                                </div>
                            </>
                        }
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <SummaryCard
                                title="Tổng số bảng"
                                value={stats.total}
                                subtitle="Kỳ chấm công"
                                icon={Calendar}
                                colorScheme="blue"
                            />
                            <SummaryCard
                                title="Đang mở"
                                value={stats.mo}
                                subtitle="Đang nhận đăng ký"
                                icon={Unlock}
                                colorScheme="emerald"
                            />
                            <SummaryCard
                                title="Đã khóa"
                                value={stats.khoa}
                                subtitle="Đã đóng nhận đăng ký"
                                icon={Lock}
                                colorScheme="yellow"
                            />
                            <SummaryCard
                                title="Đã duyệt"
                                value={stats.duyet}
                                subtitle="Hoàn tất phê duyệt"
                                icon={Check}
                                colorScheme="blue"
                            />
                        </div>
                    </StatsOverview>


                </div>

                {/* ── CONTENT AREA: Table + Pagination ── */}
                <div className="relative flex-1 min-h-0">
                    <div className="absolute inset-0 flex flex-col overflow-hidden ">
                        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
                            <TableHr
                                data={bangChamCongs as any}
                                columns={
                                    (columns as any)
                                        .filter((c: any) => visibleColumns.has(c.uid))
                                        .sort((a: any, b: any) => {
                                            const indexA = columnOrder.indexOf(a.uid);
                                            const indexB = columnOrder.indexOf(b.uid);
                                            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                                            if (indexA !== -1) return -1;
                                            if (indexB !== -1) return 1;
                                            return 0;
                                        })
                                }
                                columnOrder={columnOrder}
                                onColumnOrderChange={setColumnOrder}
                                isLoading={isLoading}
                                enableStickyScrollbar={false}
                                borderColor="border-gray-200 dark:border-gray-700"
                                selectedKeys={selectedKeys}
                                onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
                            />
                        </div>
                        <TablePagination
                            page={page}
                            limit={limit}
                            total={filtered}
                            filtered={filtered}
                            onChangePage={setPage}
                            onChangeLimit={setLimit}
                            enableStickyPagination={true}
                            className="p-2"
                        />
                    </div>
                </div>
            </div>

            {/* Modal Create/Edit */}
            <ModalV3.Backdrop isDismissable={false} variant="opaque" isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
                <ModalV3.Container size="md" placement="center" scroll="inside" className="w-full max-w-2xl mx-4">
                    <ModalV3.Dialog className="p-0 overflow-hidden rounded-3xl bg-white dark:bg-gray-900 w-full">
                        <ModalV3.Header className="px-6 py-5 bg-[#f8fafd] dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 shrink-0">
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ModalV3.Heading className="text-base font-medium text-[#202124] dark:text-gray-100">
                                            {editingItem ? 'Cập nhật bảng chấm công' : 'Tạo bảng chấm công mới'}
                                        </ModalV3.Heading>
                                        <Tooltip content="Quản lý thông tin kỳ chấm công" placement="right">
                                            <CircleHelp className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                        </Tooltip>
                                    </div>
                                </div>
                                <ButtonV3
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    className="text-[#5f6368] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full shrink-0"
                                    onPress={handleCloseModal}
                                >
                                    <X size={20} />
                                </ButtonV3>
                            </div>
                        </ModalV3.Header>
                        <ModalV3.Body className="p-6">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Tháng</label>
                                    <MonthPickerDropdown
                                        value={formData.thang}
                                        onChange={(val) => handleThangChange(val)}
                                        onClear={() => setFormData({ ...formData, thang: '', ngay_bat_dau: '', ngay_ket_thuc: '' })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Tên bảng chấm công</label>
                                    <Input
                                        placeholder="VD: Bảng chấm công tháng 4/2026"
                                        value={formData.ten_bang}
                                        onChange={(e) => setFormData({ ...formData, ten_bang: e.target.value })}
                                        className="w-full bg-default-100 rounded-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Ngày bắt đầu</label>
                                        <Input
                                            type="date"
                                            value={formData.ngay_bat_dau}
                                            onChange={(e) => setFormData({ ...formData, ngay_bat_dau: e.target.value })}
                                            className="w-full bg-default-100 rounded-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Ngày kết thúc</label>
                                        <Input
                                            type="date"
                                            value={formData.ngay_ket_thuc}
                                            onChange={(e) => setFormData({ ...formData, ngay_ket_thuc: e.target.value })}
                                            className="w-full bg-default-100 rounded-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Ghi chú</label>
                                    <Input
                                        placeholder="Ghi chú về kỳ chấm công..."
                                        value={formData.ghi_chu}
                                        onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
                                        className="w-full bg-default-100 rounded-medium"
                                    />
                                </div>
                            </div>
                        </ModalV3.Body>
                        <ModalV3.Footer className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
                            <div className="flex justify-end gap-3 w-full">
                                <ButtonV3 variant="outline" onPress={handleCloseModal} size="sm" className="font-semibold px-4 rounded-lg">
                                    Hủy
                                </ButtonV3>
                                <ButtonV3
                                    variant="primary"
                                    size="sm"
                                    className="font-semibold px-4 rounded-lg"
                                    onPress={handleSubmit}
                                    isPending={createMutation.isPending || updateMutation.isPending}
                                >
                                    {editingItem ? 'Cập nhật' : 'Tạo mới'}
                                </ButtonV3>
                            </div>
                        </ModalV3.Footer>
                    </ModalV3.Dialog>
                </ModalV3.Container>
            </ModalV3.Backdrop>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: 'delete', item: null })}
                onConfirm={handleConfirmAction}
                title={
                    confirmModal.type === 'delete' || confirmModal.type === 'delete_bulk'
                        ? 'Xác nhận xóa'
                        : confirmModal.type === 'khoa'
                            ? 'Xác nhận khóa'
                            : 'Xác nhận mở khóa'
                }
                content={
                    confirmModal.type === 'delete'
                        ? `Bạn có chắc chắn muốn xóa bảng chấm công "${confirmModal.item?.ten_bang}"?`
                        : confirmModal.type === 'delete_bulk'
                            ? `Bạn có chắc chắn muốn xóa ${selectedKeys.size} bảng chấm công đã chọn?`
                            : confirmModal.type === 'khoa'
                                ? `Khóa bảng chấm công "${confirmModal.item?.ten_bang}"? Nhân viên sẽ không thể đăng ký ngoài giờ trong kỳ này.`
                                : `Mở khóa bảng chấm công "${confirmModal.item?.ten_bang}"? Nhân viên sẽ được phép đăng ký ngoài giờ.`
                }
                confirmText={
                    confirmModal.type === 'delete' || confirmModal.type === 'delete_bulk' ? 'Xóa' : confirmModal.type === 'khoa' ? 'Khóa' : 'Mở khóa'
                }
                isDanger={confirmModal.type === 'delete' || confirmModal.type === 'delete_bulk'}
                isLoading={deleteMutation.isPending || toggleKhoaMutation.isPending || deleteBulkMutation.isPending}
            />

            {/* Detail Modal with Calendar */}
            <BangChamCongDetailModal
                isOpen={!!detailModalItem}
                onClose={() => setDetailModalItem(null)}
                bangChamCong={detailModalItem}
            />
        </div>
    )
}
