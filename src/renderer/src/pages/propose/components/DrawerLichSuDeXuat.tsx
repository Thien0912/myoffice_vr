import { Button, Input, Spinner } from '@heroui/react'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import { DrawerContentCustom, DrawerCustom, DrawerHeaderCustom } from '@renderer/components/DrawerCustom'
import { useQuery } from '@tanstack/react-query'
import { ChevronsRight, History, Plus, Search, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'

type FilterType = 'all' | 'create' | 'update' | 'delete'

type LichSuItem = {
    id: number | string
    hanh_dong?: string
    noi_dung?: string
    bang_du_lieu?: string
    ten_nguoi_thuc_hien?: string
    email_nguoi_thuc_hien?: string
    thoi_gian: string
    chi_tiet?: Record<string, { cu: any; moi: any }>
}

type Props = {
    open: boolean
    onClose: () => void
    onOpenDetail?: (id: string) => void
}

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
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
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
    if (n.includes('xoa') || n.includes('delete')) {
        return (
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-500">
                <Trash2 size={14} />
            </span>
        )
    }
    if (n.includes('tao') || n.includes('create')) {
        return (
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-600">
                <Plus size={14} />
            </span>
        )
    }
    return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600">
            <History size={14} />
        </span>
    )
}

function formatTime(thoi_gian: string) {
    const date = new Date(thoi_gian)
    return (
        date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
        ' ' +
        date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    )
}

function LichSuCard({
    item,
    onOpenDetail
}: {
    item: LichSuItem
    onOpenDetail?: (id: string) => void
}) {
    const hasDetails = item.chi_tiet && Object.keys(item.chi_tiet).length > 0
    const n = normalize(item.hanh_dong)
    const isCreate = n.includes('tao') || n.includes('create')
    const isDelete = n.includes('xoa') || n.includes('delete')

    const badgeClass = isDelete
        ? 'bg-red-50 text-red-500'
        : isCreate
            ? 'bg-green-50 text-green-600'
            : 'bg-blue-50 text-blue-600'

    const cardBorderClass = isDelete ? 'border-red-100' : 'border-gray-100'

    // Extract id_de_xuat from chi_tiet or noi_dung
    const extractDeXuatId = (): string | null => {
        if (item.chi_tiet) {
            const idField = item.chi_tiet['ID đề xuất']
            if (idField?.moi) return String(idField.moi)
            if (idField?.cu) return String(idField.cu)
        }
        return null
    }

    const deXuatId = extractDeXuatId()

    return (
        <div
            className={`bg-white border ${cardBorderClass} rounded-xl shadow-sm p-3 mb-2 hover:shadow-md transition-shadow ${onOpenDetail && deXuatId ? 'cursor-pointer hover:border-blue-200' : ''}`}
            onClick={() => {
                if (onOpenDetail && deXuatId) {
                    onOpenDetail(deXuatId)
                }
            }}
        >
            <div className="flex items-start gap-2.5">
                {getActionIcon(item.hanh_dong ?? item.noi_dung)}
                <div className="flex-1 min-w-0">
                    {/* Row 1: noi_dung + email badge */}
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

                    {/* hanh_dong badge nhỏ */}
                    {item.noi_dung && item.hanh_dong && (
                        <span
                            className={`inline-block text-[10px] px-1.5 py-0.5 rounded mt-0.5 font-medium ${badgeClass}`}
                        >
                            {item.hanh_dong}
                        </span>
                    )}

                    {/* Box xám chứa tên người thực hiện */}
                    {item.ten_nguoi_thuc_hien && (
                        <div className="mt-2 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-xs text-gray-600 font-medium">
                                {item.ten_nguoi_thuc_hien}
                            </span>
                        </div>
                    )}

                    {hasDetails && (
                        <div className="mt-2 space-y-1.5 pt-2 border-t border-gray-100">
                            {Object.entries(item.chi_tiet!).map(([key, val]) => {
                                const renderValue = (raw: any, strikethrough = false) => {
                                    const display =
                                        raw !== null && raw !== undefined && raw !== ''
                                            ? String(raw)
                                            : 'Trống'
                                    return (
                                        <span
                                            className={
                                                strikethrough
                                                    ? 'line-through text-red-400'
                                                    : 'text-green-600 font-medium'
                                            }
                                        >
                                            {display}
                                        </span>
                                    )
                                }

                                return (
                                    <div key={key} className="text-xs">
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-400 font-medium">{key}:</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                            {renderValue(val.cu, true)}
                                            <span className="text-gray-300">→</span>
                                            {renderValue(val.moi, false)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Hint click to open */}
                    {onOpenDetail && deXuatId && (
                        <div className="mt-1.5 text-[10px] text-blue-400 flex items-center gap-1">
                            <ChevronsRight size={10} />
                            Nhấn để mở đề xuất
                        </div>
                    )}

                    <div className="text-[10px] text-gray-400 mt-1.5">{formatTime(item.thoi_gian)}</div>
                </div>
            </div>
        </div>
    )
}

export default function DrawerLichSuDeXuat({ open, onClose, onOpenDetail }: Props) {
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState<FilterType>('all')

    const { data, isLoading } = useQuery({
        queryKey: ['dexuat-lichsu'],
        queryFn: () => dexuatAxios.lichSu(),
        enabled: open,
        staleTime: 30_000
    })

    const lichSuList: LichSuItem[] = data?.data ?? []
    const total: number = data?.total ?? lichSuList.length

    const filtered = useMemo(() => {
        let list = lichSuList

        // Filter theo loại hành động
        if (filterType !== 'all') {
            list = list.filter((item) => {
                const n = normalize(item.hanh_dong)
                if (filterType === 'create') return n.includes('tao') || n.includes('create')
                if (filterType === 'delete') return n.includes('xoa') || n.includes('delete')
                if (filterType === 'update')
                    return (
                        !n.includes('tao') &&
                        !n.includes('create') &&
                        !n.includes('xoa') &&
                        !n.includes('delete')
                    )
                return true
            })
        }

        // Filter theo search
        if (search.trim()) {
            const kw = normalize(search)
            list = list.filter(
                (item) =>
                    normalize(item.hanh_dong).includes(kw) ||
                    normalize(item.noi_dung).includes(kw) ||
                    normalize(item.ten_nguoi_thuc_hien).includes(kw) ||
                    normalize(item.email_nguoi_thuc_hien).includes(kw)
            )
        }

        return list
    }, [lichSuList, search, filterType])

    const grouped = useMemo(() => groupByDate(filtered), [filtered])

    return (
        <DrawerCustom open={open} onClose={onClose} position="right" zIndex={9999} usePortal>
            <DrawerHeaderCustom>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <History size={18} />
                        </span>
                        <div className="flex flex-col items-start justify-center">
                            <span className="font-semibold text-gray-800 dark:text-gray-100 text-base leading-tight">
                                Lịch sử chỉnh sửa
                            </span>
                            {!isLoading && (
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {total} thao tác
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        isIconOnly
                        startContent={<X size={20} />}
                        size="sm"
                        variant="light"
                        onPress={onClose}
                        className="-mr-2 shrink-0 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    />
                </div>
            </DrawerHeaderCustom>

            {/* Search bar */}
            <div className="px-5 pt-2 pb-2">
                <Input
                    placeholder="Tìm theo tên người hoặc hành động..."
                    value={search}
                    onValueChange={setSearch}
                    radius="sm"
                    size="sm"
                    startContent={<Search size={14} className="text-gray-400" />}
                    classNames={{
                        inputWrapper:
                            'bg-gray-50 border border-gray-200 shadow-none hover:bg-gray-100 h-9 transition-all group-data-[focus=true]:border-blue-500'
                    }}
                />
            </div>

            {/* Filter chips */}
            <div className="px-5 pb-3 flex items-center gap-1.5 flex-wrap">
                {(
                    [
                        { key: 'all', label: 'Tất cả' },
                        { key: 'create', label: 'Tạo mới' },
                        { key: 'update', label: 'Cập nhật' },
                        { key: 'delete', label: 'Xóa' }
                    ] as { key: FilterType; label: string }[]
                ).map(({ key, label }) => {
                    const active = filterType === key
                    const colorMap: Record<FilterType, string> = {
                        all: active
                            ? 'bg-gray-700 text-white border-gray-700'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400',
                        create: active
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-green-600 border-green-200 hover:border-green-400',
                        update: active
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-blue-600 border-blue-200 hover:border-blue-400',
                        delete: active
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-red-500 border-red-200 hover:border-red-400'
                    }
                    return (
                        <button
                            key={key}
                            onClick={() => setFilterType(key)}
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${colorMap[key]}`}
                        >
                            {label}
                        </button>
                    )
                })}
            </div>

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
                                    <LichSuCard
                                        key={item.id ?? idx}
                                        item={item}
                                        onOpenDetail={onOpenDetail}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </DrawerContentCustom>
        </DrawerCustom>
    )
}
