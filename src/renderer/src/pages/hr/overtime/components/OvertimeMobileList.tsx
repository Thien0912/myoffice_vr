import TablePagination from '@renderer/components/table/TablePagination'
import { memo } from 'react'
import { OvertimePermissions } from '../columns'
import { OvertimeRequest } from '../types'
import OvertimeMobileCard from './OvertimeMobileCard'

// ─── Skeleton ──────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="p-3 flex items-start justify-between">
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-4 w-40 rounded-md bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="h-3 w-24 rounded-md bg-gray-100 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
      </div>
      <div className="mx-3 border-t border-gray-100 dark:border-gray-700" />
      <div className="flex flex-col gap-2 px-3 py-2.5">
        {[80, 60, 90].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
            <div className={`h-3 rounded bg-gray-100 dark:bg-gray-700 animate-pulse`} style={{ width: `${w}px` }} />
          </div>
        ))}
      </div>
      <div className="px-3 pb-3 pt-1">
        <div className="h-8 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
      </div>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg className="w-7 h-7 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">Không có dữ liệu</span>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">Chưa có đơn đăng ký nào trong khoảng thời gian này</span>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export interface OvertimeMobileListProps {
  data: OvertimeRequest[]
  isLoading: boolean
  page: number
  total: number
  filtered: number
  limit: number
  isManager?: boolean
  selectedKeys?: Set<string | number>
  onSelectionChange?: (keys: any) => void
  onViewDetail?: (row: OvertimeRequest) => void
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onDelete?: (row: OvertimeRequest) => void
  onEdit?: (row: OvertimeRequest) => void
  currentUserId?: number | string
  onChangePage: (page: number) => void
  onChangeLimit: (limit: number) => void
  permissions?: OvertimePermissions
}

const OvertimeMobileList = memo(function OvertimeMobileList({
  data,
  isLoading,
  page,
  total,
  filtered,
  limit,
  isManager = false,
  selectedKeys,
  onSelectionChange,
  onViewDetail,
  onApprove,
  onReject,
  onDelete,
  onEdit,
  currentUserId,
  onChangePage,
  onChangeLimit,
  permissions,
}: OvertimeMobileListProps) {

  const handleSelect = (id: number, selected: boolean) => {
    if (!onSelectionChange) return
    const current = new Set(selectedKeys ?? [])
    if (selected) current.add(String(id))
    else current.delete(String(id))
    onSelectionChange(current)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Card list ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-3 p-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : data.length === 0 ? (
            <EmptyState />
          ) : (
            data.map((row, idx) => (
              <OvertimeMobileCard
                key={row.id_ngoai_gio}
                row={row}
                index={(page - 1) * limit + idx + 1}
                isManager={isManager}
                isSelected={selectedKeys?.has(String(row.id_ngoai_gio))}
                onSelect={handleSelect}
                onViewDetail={onViewDetail}
                onApprove={onApprove}
                onReject={onReject}
                onDelete={onDelete}
                onEdit={onEdit}
                currentUserId={currentUserId}
                permissions={permissions}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Pagination ────────────────────────────────────────── */}
      <TablePagination
        page={page}
        total={total}
        filtered={filtered}
        limit={limit}
        onChangePage={onChangePage}
        onChangeLimit={onChangeLimit}
        enableStickyPagination={false}
        className="p-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0"
      />
    </div>
  )
})

export default OvertimeMobileList
