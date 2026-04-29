import UserAvatar from '@renderer/components/UserAvatar'
import { memo } from 'react'
import { Check, ChevronRight, Clock, Eye, Info, Pencil, X } from 'lucide-react'
import { OvertimePermissions } from '../columns'
import { OVERTIME_STATUS_CONFIG, OvertimeRequest } from '../types'

// ─── helpers ───────────────────────────────────────────────────────────────

const formatHHmm = (t: string | null | undefined) => (t ? String(t).substring(0, 5) : '---')

const formatSoGio = (h: number | null | undefined) => {
  if (h == null || h === 0) return '0h'
  const r = Math.round(h * 10) / 10
  return `${r % 1 === 0 ? r.toFixed(0) : r}h`
}

const formatDDMMYYYY = (v: string | null | undefined) => {
  if (!v) return '---'
  const d = new Date(v)
  return isNaN(d.getTime()) ? '---' : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ─── interfaces ────────────────────────────────────────────────────────────

export interface OvertimeMobileCardProps {
  row: OvertimeRequest
  index?: number
  /** manager view — show checkbox + nhân viên field */
  isManager?: boolean
  isSelected?: boolean
  onSelect?: (id: number, selected: boolean) => void
  onViewDetail?: (row: OvertimeRequest) => void
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onDelete?: (row: OvertimeRequest) => void
  onEdit?: (row: OvertimeRequest) => void
  currentUserId?: number | string
  permissions?: OvertimePermissions
}

// ─── StatusBadge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: keyof typeof OVERTIME_STATUS_CONFIG }) {
  const cfg = OVERTIME_STATUS_CONFIG[status]
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
        ${cfg.text} ${cfg.bg} border ${cfg.border}
      `}
    >
      {status === 'Cho_duyet' && (
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      )}
      {status === 'Da_duyet' && <Check size={9} strokeWidth={3} />}
      {status === 'Tu_choi' && <X size={9} strokeWidth={3} />}
      {status === 'Huy' && <X size={9} strokeWidth={3} />}
      {cfg.label}
    </span>
  )
}

// ─── FieldRow ──────────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 min-h-[24px]">
      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium w-[88px] shrink-0 pt-0.5">
        {label}
      </span>
      <div className="flex-1 min-w-0 text-[12px] text-gray-700 dark:text-gray-200 font-medium truncate">
        {children}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

const OvertimeMobileCard = memo(function OvertimeMobileCard({
  row,
  index,
  isManager = false,
  isSelected = false,
  onSelect,
  onViewDetail,
  onApprove,
  onReject,
  onDelete,
  onEdit,
  currentUserId,
  permissions,
}: OvertimeMobileCardProps) {
  const status = (row.trang_thai_tong || 'Cho_duyet') as keyof typeof OVERTIME_STATUS_CONFIG
  const isPending = status === 'Cho_duyet'
  const isOwner = currentUserId !== null && String(row.id_nhan_vien) === String(currentUserId)

  console.log(`currentUserId:::`, { row, currentUserId })

  // Approver info
  const approverName = (() => {
    const ds = row.danh_sach_nguoi_duyet
    if (ds && ds.length > 0) return ds[0].ql_nguoi_dung_ho_ten
    if (row.nguoi_duyet?.length) {
      const current = row.nguoi_duyet.find(nd => nd.cap_duyet === row.cap_duyet_hien_tai)
      const last = row.nguoi_duyet.filter(nd => nd.trang_thai !== 'Cho_duyet').sort((a, b) =>
        (b.id_ngoai_gio_nguoi_duyet || 0) - (a.id_ngoai_gio_nguoi_duyet || 0)
      )[0]
      return (isPending ? current : last)?.ho_ten_nguoi_duyet || null
    }
    return null
  })()

  const timeStr = `${formatHHmm(row.gio_bat_dau)} — ${formatHHmm(row.gio_ket_thuc)}`
  const durationStr = row.so_gio != null ? `(${formatSoGio(row.so_gio)})` : ''

  return (
    <div
      className={`
        relative flex flex-col rounded-xl border bg-white dark:bg-gray-800 shadow-sm
        transition-all duration-200 overflow-hidden
        ${isSelected
          ? 'border-blue-400 dark:border-blue-500 shadow-blue-100 dark:shadow-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-3 pt-3 pb-2 gap-2">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {/* Checkbox (manager only) */}
          {isManager && isPending && onSelect && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(row.id_ngoai_gio, !isSelected) }}
              className={`
                mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all
                ${isSelected
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }
              `}
              aria-label={isSelected ? 'Bỏ chọn' : 'Chọn'}
            >
              {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
            </button>
          )}

          {/* Index */}
          {index != null && (
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 shrink-0 w-4 text-center">
              {index}
            </span>
          )}

          {/* Time + date */}
          <div
            className={`
              flex flex-col min-w-0 transition-all
              ${(isPending && (isOwner || permissions?.canEdit)) ? 'cursor-pointer hover:opacity-70 active:scale-[0.98]' : ''}
            `}
            onClick={(e) => {
              if (isPending && (isOwner || permissions?.canEdit) && onEdit) {
                e.stopPropagation()
                onEdit(row)
              }
            }}
          >
            <div className="flex items-center gap-1.5">
              <Clock size={12} className={`${(isPending && (isOwner || permissions?.canEdit)) ? 'text-blue-500' : 'text-gray-400'} shrink-0`} />
              <span className={`text-[13px] font-bold ${isPending && (isOwner || permissions?.canEdit) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'}`}>
                {timeStr}
              </span>
              {durationStr && (
                <span className="text-[11px] text-gray-400 dark:text-gray-400 font-medium">
                  {durationStr}
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 ml-[18px]">
              {formatDDMMYYYY(row.ngay_dang_ky)}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <StatusBadge status={status} />
      </div>

      {/* ── Divider ────────────────────────────────────────────────── */}
      <div className="mx-3 border-t border-gray-100 dark:border-gray-700/70" />

      {/* ── Body fields ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 px-3 py-2.5">
        {/* Employee info — manager only */}
        {isManager && (
          <FieldRow label="Nhân viên">
            <div className="flex items-center gap-1.5">
              <UserAvatar
                name={row.ho_va_ten || `User ${row.id_nhan_vien}`}
                src={row.avatar || undefined}
                size="sm"
                className="w-5 h-5 text-[9px]"
              />
              <span className="truncate">{row.ho_va_ten || '---'}</span>
              {row.ma_nhan_vien && (
                <span className="text-[10px] text-gray-400 shrink-0">({row.ma_nhan_vien})</span>
              )}
            </div>
          </FieldRow>
        )}

        {/* Department */}
        {row.ten_don_vi && (
          <FieldRow label="Đơn vị">
            <span className="text-gray-600 dark:text-gray-300">{row.ten_don_vi}</span>
          </FieldRow>
        )}

        {/* Approver */}
        {approverName && (
          <FieldRow label={isPending ? 'Người duyệt' : 'Đã xử lý'}>
            <span>{approverName}</span>
          </FieldRow>
        )}

        {/* Title / content */}
        {row.noi_dung && (
          <FieldRow label="Tiêu đề">
            <span className="line-clamp-1">{row.noi_dung}</span>
          </FieldRow>
        )}
      </div>

      {/* ── Footer actions ──────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 px-3 pb-3 pt-1">
        {/* Action icons group */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* View detail icon button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetail?.(row)
            }}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title="Chi tiết"
          >
            <Eye size={16} />
          </button>

          {/* Edit button — owner + pending or has canEdit permission */}
          {isPending && (isOwner || permissions?.canEdit) && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(row)
              }}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
              title="Sửa"
            >
              <Pencil size={15} />
            </button>
          )}

          {/* Quick approve/reject — manager + pending */}
          {isManager && isPending && permissions?.canApprove && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onApprove?.(row.id_ngoai_gio)
                }}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm"
                title="Duyệt"
              >
                <Check size={16} strokeWidth={3} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onReject?.(row.id_ngoai_gio)
                }}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-colors"
                title="Từ chối"
              >
                <X size={15} strokeWidth={3} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
})

export default OvertimeMobileCard
