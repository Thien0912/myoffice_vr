import React, { useState, useMemo, useRef, useEffect } from 'react'
import { DrawerCustom, DrawerHeaderCustom, DrawerContentCustom } from '@renderer/components/DrawerCustom'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import { useQuery } from '@tanstack/react-query'
import { Eye, EyeOff, History, Plus, Search, Trash2 } from 'lucide-react'
import { Input, Spinner } from '@heroui/react'

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterAction = 'all' | 'create' | 'update' | 'delete'

type LichSuItem = {
    id: number | string
    hanh_dong?: string
    noi_dung?: string
    bang_du_lieu?: string
    module?: string
    ten_nguoi_thuc_hien?: string
    email_nguoi_thuc_hien?: string
    thoi_gian: string
    chi_tiet?: Record<string, { cu: any; moi: any }>
}

type Props = {
    open: boolean
    onClose: () => void
}

// ─── Constants ───────────────────────────────────────────────────────────────

// Các trường lương nhạy cảm — dùng label tiếng Việt vì BE đã map
const SALARY_FIELDS = new Set([
    'Mức lương', 'Lương cơ bản', 'Mức lương bảo hiểm',
    'Số tiền', 'Tỉ lệ hưởng lương (%)',
])

// Color map theo module
const MODULE_COLORS: Record<string, string> = {
    'Hồ sơ nhân viên': 'bg-blue-100 text-blue-700',
    'Hợp đồng': 'bg-amber-100 text-amber-700',
    'Chứng chỉ': 'bg-teal-100 text-teal-700',
    'Đào tạo': 'bg-purple-100 text-purple-700',
    'Bằng cấp': 'bg-indigo-100 text-indigo-700',
    'Bảo hiểm': 'bg-cyan-100 text-cyan-700',
    'Khen thưởng': 'bg-yellow-100 text-yellow-700',
    'Thưởng': 'bg-orange-100 text-orange-700',
    'Quá trình công tác': 'bg-green-100 text-green-700',
    'Kinh nghiệm': 'bg-rose-100 text-rose-700',
    'Thôi việc': 'bg-red-100 text-red-700',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalize(str?: string | null): string {
    if (!str) return ''
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
}

function groupByDate(items: LichSuItem[]) {
    const groups: Record<string, LichSuItem[]> = {}
    items.forEach((item) => {
        const date = new Date(item.thoi_gian)
        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)

        let label = date.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        })
        if (date.toDateString() === today.toDateString()) label = 'HÔM NAY'
        else if (date.toDateString() === yesterday.toDateString()) label = 'HÔM QUA'

        if (!groups[label]) groups[label] = []
        groups[label].push(item)
    })
    return groups
}

function getActionIcon(hanh_dong?: string) {
    const n = normalize(hanh_dong)
    if (n === 'xoa' || n === 'delete')
        return <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-500"><Trash2 size={14} /></span>
    if (n === 'tao moi' || n === 'create')
        return <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-600"><Plus size={14} /></span>
    return <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600"><History size={14} /></span>
}

function formatTime(thoi_gian: string) {
    const date = new Date(thoi_gian)
    return (
        date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
        ' ' +
        date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    )
}

// ─── FilterBar ───────────────────────────────────────────────────────────────

const selectClass = 'w-full h-9 pl-2.5 pr-7 text-[12px] font-medium rounded-md border border-gray-200 bg-white text-gray-600 appearance-none cursor-pointer outline-none hover:border-gray-400 transition-colors'
const chevronBg = { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' } as React.CSSProperties

function FilterBar({
    search, onSearchChange,
    filterAction, onActionChange,
    filterModule, onModuleChange,
    availableModules
}: {
    search: string
    onSearchChange: (v: string) => void
    filterAction: FilterAction
    onActionChange: (v: FilterAction) => void
    filterModule: string
    onModuleChange: (v: string) => void
    availableModules: string[]
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const hasFilter = filterAction !== 'all' || filterModule !== 'all'

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    return (
        <div className="px-5 pt-3 pb-3 flex items-center gap-2">
            <Input
                placeholder="Tìm theo tên người, hành động..."
                value={search}
                onValueChange={onSearchChange}
                radius="sm"
                size="sm"
                startContent={<Search size={14} className="text-gray-400" />}
                classNames={{ inputWrapper: 'bg-gray-50 border border-gray-200 shadow-none hover:bg-gray-100 h-9 transition-all group-data-[focus=true]:border-blue-500' }}
            />

            {/* Filter trigger button */}
            <div className="relative shrink-0" ref={ref}>
                <button
                    onClick={() => setOpen((p) => !p)}
                    className={`h-9 px-2.5 flex items-center gap-1.5 rounded-lg border text-[12px] font-medium transition-colors ${hasFilter
                            ? 'bg-blue-50 border-blue-300 text-blue-600'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                    {hasFilter && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>

                    {open && (
                    <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 flex flex-col min-w-[200px]">
                        <div className="flex flex-col gap-1 mb-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hành động</label>
                            <select
                                value={filterAction}
                                onChange={(e) => onActionChange(e.target.value as FilterAction)}
                                className={selectClass}
                                style={chevronBg}
                            >
                                <option value="all">Tất cả</option>
                                <option value="create">Tạo mới</option>
                                <option value="update">Cập nhật</option>
                                <option value="delete">Xóa</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Module</label>
                            <select
                                value={filterModule}
                                onChange={(e) => onModuleChange(e.target.value)}
                                className={selectClass}
                                style={chevronBg}
                            >
                                <option value="all">Tất cả module</option>
                                {availableModules.map((mod) => (
                                    <option key={mod} value={mod}>{mod}</option>
                                ))}
                            </select>
                        </div>

                        {hasFilter && (
                            <button
                                onClick={() => { onActionChange('all'); onModuleChange('all') }}
                                className="mt-1 text-[11px] text-red-400 hover:text-red-600 text-left"
                            >
                                ↺ Đặt lại bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
// ─── LichSuCard ──────────────────────────────────────────────────────────────

function LichSuCard({ item }: { item: LichSuItem }) {
    const hasDetails = item.chi_tiet && Object.keys(item.chi_tiet).length > 0
    const n = normalize(item.hanh_dong)
    const isCreate = n === 'tao moi' || n === 'create'
    const isDelete = n === 'xoa' || n === 'delete'
    const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set())

    const toggleReveal = (key: string) => {
        setRevealedFields((prev) => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    const badgeClass = isDelete
        ? 'bg-red-50 text-red-500'
        : isCreate
            ? 'bg-green-50 text-green-600'
            : 'bg-blue-50 text-blue-600'

    const cardBorderClass = isDelete ? 'border-red-100' : 'border-gray-100'

    // Format giá trị để hiển thị gọn
    const formatDisplayValue = (raw: any): string => {
        if (raw === null || raw === undefined || raw === '') return 'Trống'

        // Array of file objects → extract file_name
        if (Array.isArray(raw)) {
            if (raw.length === 0) return 'Trống'
            // Array of file objects → hiện tên file
            if (typeof raw[0] === 'object' && raw[0] !== null) {
                const names = raw
                    .map((f: any) => f.file_name || f.name || f.file_path?.split('/').pop() || '?')
                    .filter(Boolean)
                return names.join(', ')
            }
            // Array of primitives
            return raw.join(', ')
        }

        // Object thuần → không hiện raw JSON, hiện dạng tóm tắt
        if (typeof raw === 'object') {
            const keys = Object.keys(raw)
            if (keys.length === 0) return 'Trống'
            return `{${keys.length} trường}`
        }

        // Try parse JSON string
        if (typeof raw === 'string') {
            const trimmed = raw.trim()
            if ((trimmed.startsWith('[') || trimmed.startsWith('{'))) {
                try {
                    const parsed = JSON.parse(trimmed)
                    return formatDisplayValue(parsed)
                } catch {
                    // không phải JSON hợp lệ, hiện nguyên
                }
            }
        }

        return String(raw)
    }

    // Kiểm tra 2 giá trị có thực sự khác nhau không (sau khi format)
    const isMeaningfulChange = (cu: any, moi: any): boolean => {
        const fCu = formatDisplayValue(cu)
        const fMoi = formatDisplayValue(moi)
        return fCu !== fMoi
    }

    const renderValue = (raw: any, isSensitive: boolean, isRevealed: boolean, strikethrough = false) => {
        if (isSensitive && !isRevealed) {
            return (
                <span className={`font-mono tracking-widest text-gray-400 select-none ${strikethrough ? 'line-through' : ''}`}>
                    *****
                </span>
            )
        }
        const display = formatDisplayValue(raw)
        return (
            <span className={strikethrough ? 'line-through text-red-400' : 'text-green-600 font-medium'}>
                {display}
            </span>
        )
    }

    return (
        <div className={`bg-white border ${cardBorderClass} rounded-xl shadow-sm p-3 mb-2 hover:shadow-md transition-shadow`}>
            <div className="flex items-start gap-2.5">
                {getActionIcon(item.hanh_dong ?? item.noi_dung)}
                <div className="flex-1 min-w-0">
                    {/* Row 1: noi_dung + email */}
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-gray-800 leading-tight">
                            {item.noi_dung || item.hanh_dong}
                        </span>
                        {item.email_nguoi_thuc_hien && (
                            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 whitespace-nowrap max-w-[140px] truncate">
                                {item.email_nguoi_thuc_hien}
                            </span>
                        )}
                    </div>

                    {/* Hành động + Module badges */}
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {item.noi_dung && item.hanh_dong && (
                            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium ${badgeClass}`}>
                                {item.hanh_dong}
                            </span>
                        )}
                        {item.module && (
                            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium ${MODULE_COLORS[item.module] ?? 'bg-gray-100 text-gray-600'}`}>
                                {item.module}
                            </span>
                        )}
                    </div>

                    {/* Người thực hiện */}
                    {item.ten_nguoi_thuc_hien && (
                        <div className="mt-2 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-xs text-gray-600 font-medium">{item.ten_nguoi_thuc_hien}</span>
                        </div>
                    )}

                    {/* Chi tiết thay đổi */}
                    {hasDetails && (
                        <div className="mt-2 space-y-1.5 pt-2 border-t border-gray-100">
                            {Object.entries(item.chi_tiet!)
                                .filter(([, val]) => isMeaningfulChange(val.cu, val.moi))
                                .map(([key, val]) => {
                                    const isSensitive = SALARY_FIELDS.has(key)
                                    const isRevealed = revealedFields.has(key)
                                    return (
                                        <div key={key} className="text-xs">
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-400 font-medium">{key}:</span>
                                                {isSensitive && (
                                                    <button
                                                        onClick={() => toggleReveal(key)}
                                                        className="text-gray-400 hover:text-blue-500 transition-colors"
                                                        title={isRevealed ? 'Ẩn' : 'Nhấn để xem'}
                                                    >
                                                        {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                                {renderValue(val.cu, isSensitive, isRevealed, true)}
                                                <span className="text-gray-300">→</span>
                                                {renderValue(val.moi, isSensitive, isRevealed, false)}
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    )}


                    <div className="text-[10px] text-gray-400 mt-1.5">{formatTime(item.thoi_gian)}</div>
                </div>
            </div>
        </div>
    )
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────

export default function LichSuNhansuDrawer({ open, onClose }: Props) {
    const [search, setSearch] = useState('')
    const [filterAction, setFilterAction] = useState<FilterAction>('all')
    const [filterModule, setFilterModule] = useState<string>('all')


    const { data, isLoading } = useQuery({
        queryKey: ['nhansu-lichsu'],
        queryFn: () => NhansuAxios.lichsu(),
        enabled: open,
        staleTime: 30_000,
    })

    const lichSuList: LichSuItem[] = data?.data ?? []
    const total: number = data?.total ?? lichSuList.length

    // Tập hợp modules có trong data
    const availableModules = useMemo(() => {
        const mods = new Set(lichSuList.map((i) => i.module).filter(Boolean) as string[])
        return Array.from(mods).sort()
    }, [lichSuList])

    const filtered = useMemo(() => {
        let list = lichSuList

        // Filter hành động
        if (filterAction !== 'all') {
            list = list.filter((item) => {
                const n = normalize(item.hanh_dong)
                if (filterAction === 'create') return n === 'tao moi' || n === 'create'
                if (filterAction === 'delete') return n === 'xoa' || n === 'delete'
                if (filterAction === 'update') return n !== 'tao moi' && n !== 'create' && n !== 'xoa' && n !== 'delete'
                return true
            })
        }

        // Filter module
        if (filterModule !== 'all') {
            list = list.filter((item) => item.module === filterModule)
        }

        // Filter search
        if (search.trim()) {
            const kw = normalize(search)
            list = list.filter(
                (item) =>
                    normalize(item.hanh_dong).includes(kw) ||
                    normalize(item.noi_dung).includes(kw) ||
                    normalize(item.ten_nguoi_thuc_hien).includes(kw) ||
                    normalize(item.email_nguoi_thuc_hien).includes(kw) ||
                    normalize(item.module).includes(kw)
            )
        }

        return list
    }, [lichSuList, search, filterAction, filterModule])

    const grouped = useMemo(() => groupByDate(filtered), [filtered])

    return (
        <DrawerCustom open={open} onClose={onClose} position="right" zIndex={9999} usePortal>
            <DrawerHeaderCustom
                onClose={onClose}
                title={
                    <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 shrink-0">
                            <History size={16} />
                        </span>
                        <div>
                            <p className="font-semibold text-gray-800 text-sm leading-tight">Lịch sử hồ sơ nhân sự</p>
                            {!isLoading && (
                                <p className="text-[11px] text-gray-400">{total} thao tác</p>
                            )}
                        </div>
                    </div>
                }
            />

            {/* Search + Filter trigger */}
            <FilterBar
                search={search}
                onSearchChange={setSearch}
                filterAction={filterAction}
                onActionChange={setFilterAction}
                filterModule={filterModule}
                onModuleChange={setFilterModule}
                availableModules={availableModules}
            />

            <DrawerContentCustom>
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Spinner size="md" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <History size={36} className="text-gray-300" />
                        <p className="text-sm text-gray-400">Chưa có lịch sử nào</p>
                    </div>
                ) : (
                    <div className="px-5 pb-6 space-y-5">
                        {Object.entries(grouped).map(([label, items]) => (
                            <div key={label}>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    {label}
                                </p>
                                {items.map((item, idx) => (
                                    <LichSuCard key={item.id ?? idx} item={item} />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </DrawerContentCustom>
        </DrawerCustom>
    )
}
