import { Button, Chip, Popover, Separator } from '@heroui-v3/react'
import { DrawerContentCustom, DrawerCustom, DrawerHeaderCustom } from '@renderer/components/DrawerCustom'
import SearchInput from '@renderer/components/SearchInput'
import { History, Plus, SlidersHorizontal, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getHistory, HistoryEntry, ENTITY_LABELS } from '../mockApi'

type FilterType = 'all' | 'create' | 'update' | 'delete'
type TimePreset = 'all' | 'today' | '7days' | '30days' | 'custom'

const SENSITIVE_FIELDS = new Set<string>()

function normalize(str?: string | null): string {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

function groupByDate(items: HistoryEntry[]) {
  const groups: Record<string, HistoryEntry[]> = {}
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
  if (n.includes('tao') || n.includes('create') || n.includes('them')) {
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

function LichSuCard({ item }: { item: HistoryEntry }) {
  const hasDetails = item.chi_tiet && Object.keys(item.chi_tiet).length > 0
  const n = normalize(item.hanh_dong)
  const isCreate = n.includes('tao') || n.includes('create') || n.includes('them')
  const isDelete = n.includes('xoa') || n.includes('delete')
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

  const formatDisplayValue = (raw: any): string => {
    if (raw === null || raw === undefined || raw === '') return 'Trống'
    if (Array.isArray(raw)) {
      if (raw.length === 0) return 'Trống'
      if (typeof raw[0] === 'object' && raw[0] !== null) {
        return raw.map((f: any) => f.file_name || f.name || f.file_path?.split('/').pop() || '?').filter(Boolean).join(', ')
      }
      return raw.join(', ')
    }
    if (typeof raw === 'object') {
      const keys = Object.keys(raw)
      return keys.length === 0 ? 'Trống' : `{${keys.length} trường}`
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try { return formatDisplayValue(JSON.parse(trimmed)) } catch { /* fallthrough */ }
      }
    }
    return String(raw)
  }

  const isMeaningfulChange = (cu: any, moi: any) =>
    formatDisplayValue(cu) !== formatDisplayValue(moi)

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
        {getActionIcon(item.hanh_dong)}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium text-gray-800 leading-tight">
              {item.noi_dung || item.hanh_dong}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {item.noi_dung && item.hanh_dong && (
              <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium ${badgeClass}`}>
                {item.hanh_dong}
              </span>
            )}
          </div>

          {item.ten_nguoi_thuc_hien && (
            <div className="mt-2 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-600 font-medium">{item.ten_nguoi_thuc_hien}</span>
            </div>
          )}

          {hasDetails && (
            <div className="mt-2 space-y-1.5 pt-2 border-t border-gray-100">
              {Object.entries(item.chi_tiet!)
                .filter(([, val]) => isMeaningfulChange(val.cu, val.moi))
                .map(([key, val]) => {
                  const isSensitive = SENSITIVE_FIELDS.has(key)
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

interface CategoryHistoryDrawerProps {
  open: boolean
  onClose: () => void
  entityKey: string
  title?: string
}

export default function CategoryHistoryDrawer({ open, onClose, entityKey, title }: CategoryHistoryDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [timePreset, setTimePreset] = useState<TimePreset>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const entityLabel = ENTITY_LABELS[entityKey] || entityKey

  const historyData = useMemo(() => {
    if (!open) return { data: [], recordsTotal: 0 }
    return getHistory({ bang_du_lieu: entityKey, length: 1000 })
  }, [open, entityKey])

  const rawHistory = historyData.data

  const filteredData = useMemo(() => {
    let result = [...rawHistory]

    if (activeFilter !== 'all') {
      result = result.filter((item) => {
        const action = normalize(item.hanh_dong)
        if (activeFilter === 'create') return action.includes('tao') || action.includes('create') || action.includes('them')
        if (activeFilter === 'delete') return action.includes('xoa') || action.includes('delete')
        if (activeFilter === 'update') return (
          !action.includes('tao') && !action.includes('create') &&
          !action.includes('them') && !action.includes('xoa') && !action.includes('delete')
        )
        return true
      })
    }

    const now = new Date()
    if (timePreset === 'today') {
      result = result.filter((item) => new Date(item.thoi_gian).toDateString() === now.toDateString())
    } else if (timePreset === '7days') {
      const from = new Date(now); from.setDate(now.getDate() - 7)
      result = result.filter((item) => new Date(item.thoi_gian) >= from)
    } else if (timePreset === '30days') {
      const from = new Date(now); from.setDate(now.getDate() - 30)
      result = result.filter((item) => new Date(item.thoi_gian) >= from)
    } else if (timePreset === 'custom') {
      if (dateFrom) {
        const from = new Date(dateFrom); from.setHours(0, 0, 0, 0)
        result = result.filter((item) => new Date(item.thoi_gian) >= from)
      }
      if (dateTo) {
        const to = new Date(dateTo); to.setHours(23, 59, 59, 999)
        result = result.filter((item) => new Date(item.thoi_gian) <= to)
      }
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (item) =>
          item.noi_dung?.toLowerCase().includes(q) ||
          item.ten_nguoi_thuc_hien?.toLowerCase().includes(q) ||
          item.hanh_dong?.toLowerCase().includes(q)
      )
    }

    return result
  }, [rawHistory, searchTerm, activeFilter, timePreset, dateFrom, dateTo])

  const groupedData = useMemo(() => groupByDate(filteredData), [filteredData])
  const total = rawHistory.length

  const filters: { id: FilterType; label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' }[] = [
    { id: 'all', label: 'Tất cả', color: 'default' },
    { id: 'create', label: 'Tạo mới', color: 'success' },
    { id: 'update', label: 'Cập nhật', color: 'primary' },
    { id: 'delete', label: 'Đã xóa', color: 'danger' }
  ]

  const isFiltered = activeFilter !== 'all' || timePreset !== 'all'

  return (
    <DrawerCustom open={open} onClose={onClose} width={500} usePortal={true}>
      <DrawerHeaderCustom>
        <div className="flex items-center justify-between w-full py-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-600">
              <History size={18} />
            </span>
            <div className="flex flex-col items-start justify-center">
              <span className="font-semibold text-gray-800 text-base leading-tight">
                {title || `Lịch sử chỉnh sửa - ${entityLabel}`}
              </span>
              <span className="text-[11px] text-gray-500">
                {total} thao tác
              </span>
            </div>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={onClose}
            className="-mr-2 shrink-0 border-none hover:bg-gray-100 text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </Button>
        </div>
      </DrawerHeaderCustom>

      <DrawerContentCustom className="bg-gray-50/50 flex flex-col p-0">
        <div className="z-10 bg-white">
          <div className="flex items-center gap-2">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Tìm nội dung, người sửa..."
              className="flex-1"
            />
            <Popover>
              <Popover.Trigger>
                <Button
                  isIconOnly
                  variant={isFiltered ? 'primary' : 'outline'}
                  className="shrink-0"
                >
                  <SlidersHorizontal size={16} />
                </Button>
              </Popover.Trigger>
              <Popover.Content placement="bottom end" shouldFlip={false} className="w-96 p-3">
                <Popover.Dialog className="flex flex-col gap-2.5 p-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Hành động</p>
                    <div className="flex flex-wrap gap-1">
                      {filters.map((f) => (
                        <Chip
                          key={f.id}
                          size="sm"
                          variant={activeFilter === f.id ? 'primary' : 'secondary'}
                          color={f.color}
                          onClick={() => setActiveFilter(f.id)}
                          className="cursor-pointer"
                        >
                          {f.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Thời gian</p>
                    <div className="flex flex-wrap gap-1">
                      {([
                        { id: 'all', label: 'Tất cả' },
                        { id: 'today', label: 'Hôm nay' },
                        { id: '7days', label: '7 ngày' },
                        { id: '30days', label: '30 ngày' },
                        { id: 'custom', label: 'Tuỳ chọn' }
                      ] as { id: TimePreset; label: string }[]).map((t) => (
                        <Chip
                          key={t.id}
                          size="sm"
                          variant={timePreset === t.id ? 'primary' : 'secondary'}
                          color={timePreset === t.id ? 'primary' : 'default'}
                          onClick={() => setTimePreset(t.id)}
                          className="cursor-pointer"
                        >
                          {t.label}
                        </Chip>
                      ))}
                    </div>

                    {timePreset === 'custom' && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none"
                          placeholder="Từ ngày"
                        />
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none"
                          placeholder="Đến ngày"
                        />
                      </div>
                    )}
                  </div>

                  {isFiltered && (
                    <>
                      <Separator />
                      <button
                        onClick={() => {
                          setActiveFilter('all')
                          setTimePreset('all')
                          setDateFrom('')
                          setDateTo('')
                        }}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors text-left"
                      >
                        Xoá bộ lọc
                      </button>
                    </>
                  )}
                </Popover.Dialog>
              </Popover.Content>
            </Popover>
          </div>
        </div>

        <div className="flex-1 w-full overflow-y-auto">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <History size={36} className="text-gray-300" />
              <p className="text-sm text-gray-400">Chưa có lịch sử chỉnh sửa nào</p>
            </div>
          ) : (
            <div className="px-2 py-4 space-y-5">
              {Object.entries(groupedData).map(([label, items]) => (
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
        </div>
      </DrawerContentCustom>
    </DrawerCustom>
  )
}
