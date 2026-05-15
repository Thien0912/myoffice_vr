import { useEffect, useMemo, useState } from 'react'
import { Button, Input, Spinner, cn } from '@heroui-v3/react'
import {
  Clock,
  History,
  Plus,
  Search,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { getHistory, ENTITY_LABELS, getHistoryEntityOptions, type HistoryEntry } from '../mockApi'

interface HistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  entityType?: string
}

/* ── action chip component ─────────────────────────────────────────── */

const ACTION_CONFIG: Record<string, { icon: typeof Plus; bg: string; text: string }> = {
  'Tạo mới': { icon: Plus, bg: 'bg-green-100', text: 'text-green-700' },
  'Cập nhật': { icon: Clock, bg: 'bg-blue-100', text: 'text-blue-700' },
  'Xóa': { icon: Trash2, bg: 'bg-red-100', text: 'text-red-700' }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (target.getTime() === today.getTime()) return 'HÔM NAY'
  if (target.getTime() === yesterday.getTime()) return 'HÔM QUA'
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

/* ── field label mapper ────────────────────────────────────────────── */

const FIELD_LABELS: Record<string, string> = {
  ten_bao_mat: 'Tên bảo mật',
  class_color: 'Màu sắc',
  ca_lam_viec: 'Tên ca',
  check_in: 'Giờ vào',
  check_out: 'Giờ ra',
  no_leave_day: 'Ngày nghỉ',
  ten_co_quan: 'Tên cơ quan',
  ten_khoa_hoc: 'Tên khóa học',
  noi_dung: 'Nội dung',
  ngay_bat_dau: 'Ngày bắt đầu',
  ngay_ket_thuc: 'Ngày kết thúc',
  trang_thai: 'Trạng thái',
  ten_don_vi: 'Tên đơn vị',
  ten_viet_tat: 'Tên viết tắt',
  loai: 'Loại',
  email: 'Email',
  nguoi_co_quyen_van_thu: 'Văn thư/Lãnh đạo',
  ten_phong_ban: 'Tên phòng ban',
  ten_tieng_anh: 'Tên tiếng Anh',
  ma_don_vi: 'Mã đơn vị',
  ten_trung_tam: 'Tên trung tâm',
  ma_truong: 'Mã trường',
  ten_truong: 'Tên trường',
  ten_khoa: 'Tên khoa',
  id_truong: 'Thuộc trường',
  ten_hinh_thuc: 'Tên hình thức',
  ten_loai_phep: 'Tên loại phép',
  ten_loai: 'Tên loại',
  tien_to: 'Tiền tố',
  hau_to: 'Hậu tố',
  id_don_vi: 'Đơn vị',
  thuoc_nhom: 'Nhóm',
  ten_tinh_chat: 'Tên tính chất',
  ten_cong_viec: 'Tên vị trí',
  ten_cong_viec_en: 'Tên tiếng Anh',
  ten_ngay_le: 'Tên ngày lễ',
  batdau: 'Ngày bắt đầu',
  ketthuc: 'Ngày kết thúc',
  mota: 'Mô tả',
  ngay_am: 'Ngày âm',
  la_ngay_le_am: 'Là ngày lễ âm',
  duoc_nghi: 'Được nghỉ',
  la_nghi_buoi: 'Nghỉ buổi'
}

function fieldLabel(key: string): string {
  return FIELD_LABELS[key] || key
}

function formatDiffValue(val: any): string {
  if (val === null || val === undefined) return '(trống)'
  if (typeof val === 'boolean') return val ? 'Có' : 'Không'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

/* ── main component ────────────────────────────────────────────────── */

export default function HistoryDrawer({ isOpen, onClose, entityType }: HistoryDrawerProps) {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [entityFilter, setEntityFilter] = useState<string>(entityType || '')
  const [page, setPage] = useState(1)

  const entityOptions = useMemo(() => getHistoryEntityOptions(), [isOpen])

  // Reset khi open/close
  useEffect(() => {
    if (!isOpen) return
    setSearch('')
    setActionFilter('')
    setEntityFilter(entityType || '')
    setPage(1)
  }, [isOpen, entityType])

  const historyData = useMemo(() => {
    return getHistory({
      bang_du_lieu: entityFilter || undefined,
      search: search || undefined,
      hanh_dong: actionFilter || undefined,
      page,
      length: 15
    })
  }, [entityFilter, search, actionFilter, page, isOpen])

  const totalPages = Math.ceil(historyData.recordsTotal / 15)

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, HistoryEntry[]> = {}
    for (const item of historyData.data) {
      const key = formatDate(item.thoi_gian)
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    }
    return groups
  }, [historyData])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-2xl flex flex-col animate-[slideInRight_0.25s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <History size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Lịch sử chỉnh sửa</h2>
              <p className="text-xs text-gray-400">
                {historyData.recordsTotal} thao tác
                {entityFilter && ` - ${ENTITY_LABELS[entityFilter] || entityFilter}`}
              </p>
            </div>
          </div>
          <Button isIconOnly variant="ghost" size="sm" onPress={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="px-5 py-3 border-b border-gray-50 shrink-0 space-y-3">
          <Input
            type="search"
            placeholder="Tìm kiếm trong lịch sử..."
            startContent={<Search size={16} className="text-gray-400" />}
            value={search}
            onValueChange={setSearch}
            size="sm"
            classNames={{ inputWrapper: 'h-9 bg-gray-50 border-gray-200' }}
          />

          {/* Action filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['', 'Tạo mới', 'Cập nhật', 'Xóa'].map((action) => {
              const isActive = actionFilter === action
              const config = action ? ACTION_CONFIG[action] : null
              return (
                <button
                  key={action || 'all'}
                  onClick={() => { setActionFilter(action); setPage(1) }}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-full font-medium transition-all',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {action || 'Tất cả'}
                </button>
              )
            })}
          </div>

          {/* Entity filter */}
          {entityOptions.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => { setEntityFilter(''); setPage(1) }}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-full font-medium transition-all',
                  !entityFilter ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                Tất cả danh mục
              </button>
              {entityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setEntityFilter(opt.value); setPage(1) }}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-full font-medium transition-all',
                    entityFilter === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {historyData.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <History size={48} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">Chưa có lịch sử chỉnh sửa</p>
              <p className="text-xs mt-1">Các thao tác tạo, sửa, xóa sẽ được ghi lại tại đây</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([dateLabel, items]) => (
                <div key={dateLabel}>
                  {/* Date header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gray-100" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {dateLabel}
                    </span>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>

                  {/* History cards */}
                  <div className="space-y-3">
                    {items.map((item) => {
                      const config = ACTION_CONFIG[item.hanh_dong]
                      const Icon = config?.icon || Clock
                      const hasDiffs = item.chi_tiet && Object.keys(item.chi_tiet).length > 0

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'rounded-xl border p-4 transition-all',
                            item.hanh_dong === 'Xóa' ? 'border-red-100 bg-red-50/50' : 'border-gray-100 bg-white hover:shadow-sm'
                          )}
                        >
                          {/* Header row */}
                          <div className="flex items-start gap-3">
                            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', config?.bg)}>
                              <Icon size={14} className={config?.text} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {item.noi_dung || item.hanh_dong}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                  'px-1.5 py-0.5 text-[11px] font-medium rounded',
                                  item.hanh_dong === 'Tạo mới' ? 'bg-green-100 text-green-700' :
                                  item.hanh_dong === 'Xóa' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                )}>
                                  {item.hanh_dong}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(item.thoi_gian)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Field diffs */}
                          {hasDiffs && (
                            <div className="mt-3 ml-11 space-y-1.5">
                              {Object.entries(item.chi_tiet!).map(([key, diff]) => (
                                <div key={key} className="flex items-start gap-2 text-xs">
                                  <span className="text-gray-400 shrink-0 min-w-[80px] font-medium">
                                    {fieldLabel(key)}:
                                  </span>
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    {diff.cu !== null && diff.cu !== undefined && (
                                      <span className="text-red-500 line-through bg-red-50 px-1.5 py-0.5 rounded truncate">
                                        {formatDiffValue(diff.cu)}
                                      </span>
                                    )}
                                    {diff.cu !== null && diff.cu !== undefined && diff.moi !== null && diff.moi !== undefined && (
                                      <span className="text-gray-300 shrink-0">→</span>
                                    )}
                                    {diff.moi !== null && diff.moi !== undefined && (
                                      <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded truncate">
                                        {formatDiffValue(diff.moi)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* User */}
                          <div className="mt-2 ml-11">
                            <span className="text-[11px] text-gray-400">
                              {item.ten_nguoi_thuc_hien}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 shrink-0">
            <span className="text-xs text-gray-400">
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                isDisabled={page <= 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                isDisabled={page >= totalPages}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
