import { cn } from '@heroui/react'
import { Pin, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GridDateItem } from '../../hooks/useAdminGridData'
import { OvertimeRequest } from '../../types'
import { EmployeeRowProps } from './types'

/** Status color map for overtime cards */
const STATUS_COLORS = {
  Cho_duyet: { bg: 'bg-[#e8f0fe]', darkBg: 'dark:bg-[#8ab4f8]/15', text: 'text-[#1967d2]', darkText: 'dark:text-[#8ab4f8]', barColor: 'bg-[#1967d2]', label: 'Chờ duyệt' },
  Da_duyet: { bg: 'bg-[#e6f4ea]', darkBg: 'dark:bg-[#81c995]/15', text: 'text-[#137333]', darkText: 'dark:text-[#81c995]', barColor: 'bg-[#137333]', label: 'Đã duyệt' },
  Tu_choi: { bg: 'bg-[#fce8e6]', darkBg: 'dark:bg-[#f28b82]/15', text: 'text-[#c5221f]', darkText: 'dark:text-[#f28b82]', barColor: 'bg-[#c5221f]', label: 'Từ chối' },
  Huy: { bg: 'bg-gray-100', darkBg: 'dark:bg-gray-700/15', text: 'text-gray-600', darkText: 'dark:text-gray-400', barColor: 'bg-gray-500', label: 'Đã hủy' }
} as const

/** Full-size overtime card for grid cells */
const OvertimeCard = React.memo(function OvertimeCard({
  req,
  empName,
  isSelected,
  isPending,
  onRowClick,
  onSelectRequest
}: {
  req: OvertimeRequest
  empName: string
  isSelected: boolean
  isPending: boolean
  onRowClick?: (req: OvertimeRequest) => void
  onSelectRequest?: (id: number, selected: boolean) => void
}) {
  const colors = STATUS_COLORS[req.trang_thai_tong as keyof typeof STATUS_COLORS] || STATUS_COLORS.Cho_duyet

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onRowClick?.(req)
      }}
      title={`${empName}${String(req.is_dotxuat) === '1' ? ' (Đăng ký đột xuất)' : ''}\nThời gian: ${req.gio_bat_dau?.slice(0, 5)} - ${req.gio_ket_thuc?.slice(0, 5)} (${req.so_gio} giờ)\nTrạng thái: ${colors.label}\nNội dung: ${req.noi_dung || 'Không có'}`}
      className={cn(
        'relative group w-[calc(100%-4px)] overflow-hidden p-1 pl-2.5 flex flex-col gap-1 cursor-pointer transition-all duration-200 min-h-[44px]',
        'rounded-none',
        colors.bg, colors.darkBg,
        isSelected && isPending
          ? 'scale-[0.98] shadow-sm mix-blend-multiply dark:mix-blend-lighten'
          : 'hover:shadow-sm hover:-translate-y-[1px]'
      )}
    >
      {/* Internal vertical bar */}
      <div className={cn("absolute top-[2px] bottom-[2px] left-[2px] w-[2.5px]", colors.barColor)} />

      {/* Time range */}
      <div className="flex items-center gap-1 w-full truncate pr-1">
        {String(req.is_dotxuat) === '1' && (
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Đăng ký đột xuất" />
        )}
        <span className='font-bold text-[11px] leading-none tracking-tight text-slate-800 dark:text-gray-100 truncate'>
          {req.gio_bat_dau?.slice(0, 5)}-{req.gio_ket_thuc?.slice(0, 5)}
        </span>
      </div>
      {/* Duration text */}
      <span className='font-medium text-[10px] leading-none text-slate-600 dark:text-gray-300'>
        {req.so_gio}h
      </span>

      {/* Selection circle for pending items */}
      {isPending && (
        <div
          className='absolute bottom-1.5 right-1.5 z-10'
          onClick={(e) => e.stopPropagation()}
        >
          <div
            role='checkbox'
            aria-checked={isSelected}
            tabIndex={0}
            onClick={() => onSelectRequest?.(req.id_ngoai_gio, !isSelected)}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onSelectRequest?.(req.id_ngoai_gio, !isSelected) } }}
            className={cn(
              'w-[16px] h-[16px] rounded-full border-[1.5px] flex items-center justify-center cursor-pointer transition-all duration-200',
              colors.text, colors.darkText,
              isSelected
                ? 'bg-current border-current scale-100 shadow-sm'
                : 'bg-white/50 dark:bg-black/20 border-current opacity-40 hover:opacity-100 scale-95 hover:scale-100'
            )}
            title={isSelected ? 'Bỏ chọn' : 'Chọn để duyệt/từ chối'}
          >
            {isSelected && (
              <svg width='8' height='6' viewBox='0 0 10 8' fill='none' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                <polyline points='1.5 4.5 3.5 6.5 8.5 1.5' />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  )
})


/** Compact card for the overflow popover — status label doubles as selection toggle for pending items */
const PopoverCard = React.memo(function PopoverCard({
  req,
  isSelected,
  onRowClick,
  onSelectRequest
}: {
  req: OvertimeRequest
  isSelected: boolean
  onRowClick?: (req: OvertimeRequest) => void
  onSelectRequest?: (id: number, selected: boolean) => void
}) {
  const colors = STATUS_COLORS[req.trang_thai_tong as keyof typeof STATUS_COLORS] || STATUS_COLORS.Cho_duyet
  const isPending = req.trang_thai_tong === 'Cho_duyet'

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onRowClick?.(req)
      }}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 overflow-hidden shrink-0",
        isSelected && isPending
          ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800"
          : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
      )}
    >
      {/* Status indicator bar */}
      <div className={cn("w-[3px] self-stretch rounded-full shrink-0", colors.barColor)} />
      {/* Content */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[11px] text-gray-800 dark:text-gray-200 shrink-0">
            {req.so_gio}h
          </span>
          {String(req.is_dotxuat) === '1' && (
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Đăng ký đột xuất" />
          )}
          <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">
            {req.gio_bat_dau?.slice(0, 5)}-{req.gio_ket_thuc?.slice(0, 5)}
          </span>
        </div>
        <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
          {req.noi_dung || 'OT'}
        </div>
      </div>
      {/* Status label — acts as selection toggle for pending items */}
      {isPending ? (
        <button
          type="button"
          role="checkbox"
          aria-checked={isSelected}
          onClick={(e) => {
            e.stopPropagation()
            onSelectRequest?.(req.id_ngoai_gio, !isSelected)
          }}
          className={cn(
            "shrink-0 text-[9px] font-semibold px-2 py-1 rounded-full transition-all duration-150 flex items-center gap-1",
            isSelected
              ? "bg-blue-500 text-white shadow-sm hover:bg-blue-600"
              : "bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
          )}
        >
          {isSelected && (
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1.5 4.5 3.5 6.5 8.5 1.5" />
            </svg>
          )}
          {isSelected ? 'Đã chọn' : colors.label}
        </button>
      ) : (
        <span className={cn("text-[9px] font-semibold shrink-0 px-2 py-1 rounded-full bg-white dark:bg-gray-900", colors.text)}>
          {colors.label}
        </span>
      )}
    </div>
  )
})

/** Portal-based popover that shows overflow items — escapes table overflow-hidden */
const OverflowPopover = React.memo(function OverflowPopover({
  extraReqs,
  empName,
  selectedRequests,
  onRowClick,
  onSelectRequest
}: {
  extraReqs: OvertimeRequest[]
  empName: string
  selectedRequests: Set<number>
  onRowClick?: (req: OvertimeRequest) => void
  onSelectRequest?: (id: number, selected: boolean) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const badgeRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [originY, setOriginY] = useState<'top' | 'bottom'>('top')

  const extraCount = extraReqs.length
  const selectedCount = extraReqs.filter(r => selectedRequests.has(r.id_ngoai_gio)).length
  const POPOVER_WIDTH = 260
  const POPOVER_MAX_CONTENT_H = 300
  const HEADER_H = 36

  const openPopover = useCallback(() => {
    if (!badgeRef.current) return
    const rect = badgeRef.current.getBoundingClientRect()
    const contentH = Math.min(extraReqs.length * 48, POPOVER_MAX_CONTENT_H)
    const popoverH = contentH + HEADER_H + 12

    // Position below the badge, centered horizontally
    let top = rect.bottom + 6
    let left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2
    let flipped = false

    // Clamp horizontal to viewport
    if (left < 8) left = 8
    if (left + POPOVER_WIDTH > window.innerWidth - 8) left = window.innerWidth - POPOVER_WIDTH - 8

    // Flip above if not enough space below
    if (top + popoverH > window.innerHeight - 8) {
      top = rect.top - popoverH - 6
      if (top < 8) top = 8
      flipped = true
    }

    setOriginY(flipped ? 'bottom' : 'top')
    setPosition({ top, left })
    setIsOpen(true)
  }, [extraReqs.length])

  // Click-outside to close
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        badgeRef.current && !badgeRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEsc)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen])

  return (
    <>
      <div
        ref={badgeRef}
        onClick={(e) => {
          e.stopPropagation()
          if (isOpen) {
            setIsOpen(false)
          } else {
            openPopover()
          }
        }}
        className={cn(
          "w-full text-center text-[10px] font-semibold rounded-md py-0.5 cursor-pointer transition-all duration-150 select-none",
          isOpen
            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-700"
            : "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
        )}
        title={`Xem thêm ${extraCount} đơn khác${selectedCount > 0 ? ` (đã chọn ${selectedCount})` : ''}`}
      >
        +{extraCount} đơn
        {selectedCount > 0 && (
          <span className="text-blue-600 dark:text-blue-400 ml-1">(đã chọn {selectedCount})</span>
        )}
      </div>

      {isOpen && createPortal(
        <>
          {/* Popover panel */}
          <div
            ref={popoverRef}
            className="fixed z-9999"
            style={{
              top: position.top,
              left: position.left,
              width: POPOVER_WIDTH,
              transformOrigin: `center ${originY}`,
              animation: 'popoverScaleIn 200ms cubic-bezier(0.32, 0.72, 0, 1)'
            }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-700 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                  +{extraCount} đơn khác
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
              {/* Scrollable list */}
              <div className="p-1.5 flex flex-col gap-1 overflow-y-auto overscroll-contain thin-scrollbar" style={{ maxHeight: POPOVER_MAX_CONTENT_H }}>
                {extraReqs.map((req) => (
                  <PopoverCard
                    key={req.id_ngoai_gio}
                    req={req}
                    isSelected={selectedRequests.has(req.id_ngoai_gio)}
                    onRowClick={onRowClick}
                    onSelectRequest={onSelectRequest}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Inline keyframes */}
          <style>{`
            @keyframes popoverScaleIn {
              from { opacity: 0; transform: scale(0.92) translateY(${originY === 'top' ? '-4px' : '4px'}); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes popoverFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </>,
        document.body
      )}
    </>
  )
})

/** Memoized date cell — only re-renders when THIS cell's requests or selection changes */
const MAX_VISIBLE = 3

const DateCell = React.memo(function DateCell({
  date,
  reqs,
  empName,
  hiddenStatuses,
  selectedRequests,
  onRowClick,
  onSelectRequest
}: {
  date: GridDateItem
  reqs: OvertimeRequest[] | undefined
  empName: string
  hiddenStatuses: Set<string>
  selectedRequests: Set<number>
  onRowClick?: (req: OvertimeRequest) => void
  onSelectRequest?: (id: number, selected: boolean) => void
}) {
  const visibleReqs = useMemo(
    () => reqs?.filter(req => !hiddenStatuses.has(req.trang_thai_tong)),
    [reqs, hiddenStatuses]
  )

  const isWeekend = date.dayOfWeek === 0
  const baseBg = isWeekend ? 'bg-orange-50/80 dark:bg-orange-900/20' : ''

  if (!visibleReqs || visibleReqs.length === 0) {
    return (
      <td className={cn("relative z-0 border-r border-gray-200 dark:border-gray-800 p-0.5 w-[86px] align-top", baseBg)} />
    )
  }

  const displayReqs = visibleReqs.slice(0, MAX_VISIBLE)
  const extraCount = visibleReqs.length - MAX_VISIBLE

  return (
    <td className={cn("relative z-0 border-r border-[#dadce0] dark:border-gray-700 p-0.5 w-[86px] max-w-[86px] align-top overflow-hidden", baseBg)}>
      <div className="flex flex-col gap-1 w-full">
        {displayReqs.map((req) => (
          <OvertimeCard
            key={req.id_ngoai_gio}
            req={req}
            empName={empName}
            isSelected={selectedRequests.has(req.id_ngoai_gio)}
            isPending={req.trang_thai_tong === 'Cho_duyet'}
            onRowClick={onRowClick}
            onSelectRequest={onSelectRequest}
          />
        ))}
        {extraCount > 0 && (
          <OverflowPopover
            extraReqs={visibleReqs.slice(MAX_VISIBLE)}
            empName={empName}
            selectedRequests={selectedRequests}
            onRowClick={onRowClick}
            onSelectRequest={onSelectRequest}
          />
        )}
      </div>
    </td>
  )
}, (prev, next) => {
  // Custom equality: only re-render when this cell's data actually changes
  if (prev.date !== next.date) return false
  if (prev.reqs !== next.reqs) return false
  if (prev.hiddenStatuses !== next.hiddenStatuses) return false
  if (prev.empName !== next.empName) return false
  if (prev.onRowClick !== next.onRowClick) return false
  if (prev.onSelectRequest !== next.onSelectRequest) return false

  // Only check selection state for IDs in THIS cell's requests
  const reqIds = prev.reqs
  if (reqIds) {
    for (const req of reqIds) {
      if (prev.selectedRequests.has(req.id_ngoai_gio) !== next.selectedRequests.has(req.id_ngoai_gio)) {
        return false
      }
    }
  }
  return true
})

export const EmployeeRow = React.memo(function EmployeeRow({
  emp,
  dates,
  showTotalHoursColumn,
  totalHoursViewMode,
  isPinned,
  isScrolledX,
  selectedRequests,
  onRowClick,
  onSelectRequest,
  onSelectAll,
  onTogglePin,
  hiddenStatuses,
  transitionClass
}: EmployeeRowProps) {
  // Compute pending IDs for this employee
  const empPendingIds = React.useMemo(() => {
    const ids: number[] = []
    Object.values(emp.requests).forEach(reqs => {
      reqs.forEach(req => {
        if (req?.trang_thai_tong === 'Cho_duyet' && !hiddenStatuses.has('Cho_duyet')) {
          ids.push(req.id_ngoai_gio)
        }
      })
    })
    return ids
  }, [emp.requests, hiddenStatuses])

  const isAllEmpSelected = empPendingIds.length > 0 &&
    empPendingIds.every(id => selectedRequests.has(id))
  const isSomeEmpSelected = empPendingIds.some(id => selectedRequests.has(id)) && !isAllEmpSelected
  const hasPending = empPendingIds.length > 0


  return (
    <tr
      className={cn(
        "group/row h-px",
        isPinned ? "bg-blue-100 dark:bg-blue-900/40" : "hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 48px' } as React.CSSProperties}
    >
      {/* Employee Info Cell */}
      <td style={{ minWidth: 180, maxWidth: 180, width: 180 }} className={cn(
        "sticky left-0 z-10 border-r border-b border-[#dadce0] dark:border-gray-700 py-1.5 px-3 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-sm group/cell",
        isPinned
          ? "bg-blue-100 dark:bg-blue-900/50 group-hover/row:bg-blue-200 dark:group-hover/row:bg-blue-900/70"
          : "bg-white dark:bg-[#1e1e1e] group-hover/row:bg-gray-100 dark:group-hover/row:bg-gray-800"
      )}>
        <div className="flex flex-col min-w-0 pr-8 w-full gap-1">
          <div>
            <div className="font-semibold text-[13px] text-[#202124] dark:text-gray-200 truncate leading-snug">
              {emp.ho_va_ten}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-500 truncate leading-tight mt-0.5">
              {emp.ten_don_vi}
            </div>
          </div>
        </div>

        {/* Select-all pending — absolute right, bottom aligned */}
        {hasPending && (
          <div
            onClick={(e) => {
              e.stopPropagation()
              onSelectAll?.(empPendingIds, !isAllEmpSelected)
            }}
            className={cn(
              "absolute right-2 bottom-2 shrink-0 w-[16px] h-[16px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out border z-30 shadow-sm",
              isAllEmpSelected
                ? "bg-blue-600 border-blue-600 text-white scale-100"
                : isSomeEmpSelected
                  ? "bg-blue-600 border-blue-600 text-white scale-100"
                  : "bg-gray-100 border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:bg-gray-700 dark:border-gray-500 dark:hover:border-blue-400 scale-100"
            )}
            title={isAllEmpSelected ? "Bỏ chọn tất cả chờ duyệt" : `Chọn ${empPendingIds.length} đơn chờ duyệt`}
          >
            {isSomeEmpSelected ? (
              <div className="w-2 h-[1.5px] bg-white rounded-full transition-all duration-300 scale-100" />
            ) : (
              <svg width="8" height="6" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-all duration-300", isAllEmpSelected ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
                <polyline points="1.5 4.5 3.5 6.5 8.5 1.5"></polyline>
              </svg>
            )}
          </div>
        )}

        {/* Pin button */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            onTogglePin(emp.id_nhan_vien)
          }}
          className={cn(
            "absolute top-0 right-0 w-[22px] h-[22px] flex items-center justify-center rounded-bl-[10px] transition-all shrink-0 cursor-pointer z-20",
            isPinned
              ? "text-blue-600 bg-blue-100 dark:bg-blue-900/60 dark:text-blue-400"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover/row:opacity-100"
          )}
          title={isPinned ? "Bỏ ghim" : "Ghim nhân viên"}
        >
          <Pin size={12} className={cn(isPinned && "fill-current")} />
        </div>
      </td>

      {/* Day cells — each cell is memo'd to avoid re-renders from unrelated selection changes */}
      {dates.map((d) => (
        <DateCell
          key={d.dateStr}
          date={d}
          reqs={emp.requests[d.dateStr]}
          empName={emp.ho_va_ten}
          hiddenStatuses={hiddenStatuses}
          selectedRequests={selectedRequests}
          onRowClick={onRowClick}
          onSelectRequest={onSelectRequest}
        />
      ))}

      {/* Total Columns — sticky right (4 columns based on view mode) */}
      {totalHoursViewMode === 'hours' ? (
        <>
          <td className={cn(
            "sticky right-[180px] z-20 border-l-gray-300 dark:border-l-gray-600 border-[#dadce0] dark:border-gray-700 text-center text-sm font-semibold text-[#3c4043] dark:text-gray-200 transition-[width,opacity] ease-in-out border-r border-b overflow-hidden",
            transitionClass,
            isPinned
              ? "bg-blue-100 dark:bg-blue-900/50 group-hover/row:bg-blue-200 dark:group-hover/row:bg-blue-900/70"
              : "bg-gray-50 dark:bg-gray-800 group-hover/row:bg-gray-100 dark:group-hover/row:bg-gray-800",
            showTotalHoursColumn ? "border-l-2 p-2 w-[60px] min-w-[60px] max-w-[60px] opacity-100 shadow-[-5px_0_10px_-2px_rgba(0,0,0,0.08)]" : "border-l-0 border-r-0 border-b-0 p-0 w-0 min-w-0 max-w-0 opacity-0 text-transparent"
          )}>
            <div className="flex items-center justify-center truncate">
              {emp.totalHoursSum?.toFixed(1) || '0.0'}
            </div>
          </td>
          <td className={cn(
            "sticky right-[120px] z-20 border-[#dadce0] dark:border-gray-700 text-center text-sm font-semibold text-[#3c4043] dark:text-gray-200 transition-[width,opacity] ease-in-out border-r border-b overflow-hidden",
            transitionClass,
            isPinned
              ? "bg-blue-100 dark:bg-blue-900/50 group-hover/row:bg-blue-200 dark:group-hover/row:bg-blue-900/70"
              : "bg-gray-50 dark:bg-gray-800 group-hover/row:bg-gray-100 dark:group-hover/row:bg-gray-800",
            showTotalHoursColumn ? "p-2 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "border-r-0 border-b-0 p-0 w-0 min-w-0 max-w-0 opacity-0 text-transparent"
          )}>
            <div className="flex items-center justify-center truncate">
              {emp.totalHoursNT?.toFixed(1) || '0.0'}
            </div>
          </td>
          <td className={cn(
            "sticky right-[60px] z-20 border-[#dadce0] dark:border-gray-700 text-center text-sm font-semibold text-[#3c4043] dark:text-gray-200 transition-[width,opacity] ease-in-out border-r border-b overflow-hidden",
            transitionClass,
            isPinned
              ? "bg-blue-100 dark:bg-blue-900/50 group-hover/row:bg-blue-200 dark:group-hover/row:bg-blue-900/70"
              : "bg-gray-50 dark:bg-gray-800 group-hover/row:bg-gray-100 dark:group-hover/row:bg-gray-800",
            showTotalHoursColumn ? "p-2 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "border-r-0 border-b-0 p-0 w-0 min-w-0 max-w-0 opacity-0 text-transparent"
          )}>
            <div className="flex items-center justify-center truncate">
              {emp.totalHoursCN?.toFixed(1) || '0.0'}
            </div>
          </td>
          <td className={cn(
            "sticky right-0 z-20 border-[#dadce0] dark:border-gray-700 text-center text-sm font-semibold text-[#3c4043] dark:text-gray-200 transition-[width,opacity] ease-in-out border-b overflow-hidden",
            transitionClass,
            isPinned
              ? "bg-blue-100 dark:bg-blue-900/50 group-hover/row:bg-blue-200 dark:group-hover/row:bg-blue-900/70"
              : "bg-gray-50 dark:bg-gray-800 group-hover/row:bg-gray-100 dark:group-hover/row:bg-gray-800",
            showTotalHoursColumn ? "p-2 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "border-b-0 p-0 w-0 min-w-0 max-w-0 opacity-0 text-transparent"
          )}>
            <div className="flex items-center justify-center truncate">
              {emp.totalHoursLE?.toFixed(1) || '0.0'}
            </div>
          </td>
        </>
      ) : (
        <>
          <td className={cn(
            "sticky right-[180px] z-20 border-l-gray-300 dark:border-l-gray-600 border-[#dadce0] dark:border-gray-700 text-center text-sm font-semibold text-[#3c4043] dark:text-gray-200 transition-[width,opacity] ease-in-out border-r border-b overflow-hidden",
            transitionClass,
            isPinned
              ? "bg-blue-100 dark:bg-blue-900/50 group-hover/row:bg-blue-200 dark:group-hover/row:bg-blue-900/70"
              : "bg-gray-50 dark:bg-gray-800 group-hover/row:bg-gray-100 dark:group-hover/row:bg-gray-800",
            showTotalHoursColumn ? "border-l-2 p-2 w-[60px] min-w-[60px] max-w-[60px] opacity-100 shadow-[-5px_0_10px_-2px_rgba(0,0,0,0.08)]" : "border-l-0 border-r-0 border-b-0 p-0 w-0 min-w-0 max-w-0 opacity-0 text-transparent"
          )}>
            <div className="flex items-center justify-center truncate">
              {emp.totalDaysSum?.toFixed(2) || '0.00'}
            </div>
          </td>
          <td className={cn(
            "sticky right-[120px] z-20 border-[#dadce0] dark:border-gray-700 text-center text-sm font-semibold text-[#3c4043] dark:text-gray-200 transition-[width,opacity] ease-in-out border-r border-b overflow-hidden",
            transitionClass,
            isPinned
              ? "bg-blue-100 dark:bg-blue-900/50 group-hover/row:bg-blue-200 dark:group-hover/row:bg-blue-900/70"
              : "bg-gray-50 dark:bg-gray-800 group-hover/row:bg-gray-100 dark:group-hover/row:bg-gray-800",
            showTotalHoursColumn ? "p-2 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "border-r-0 border-b-0 p-0 w-0 min-w-0 max-w-0 opacity-0 text-transparent"
          )}>
            <div className="flex items-center justify-center truncate">
              {emp.totalDaysCN?.toFixed(2) || '0.00'}
            </div>
          </td>
          <td className={cn(
            "sticky right-[60px] z-20 border-[#dadce0] dark:border-gray-700 text-center text-sm font-semibold text-[#3c4043] dark:text-gray-200 transition-[width,opacity] ease-in-out border-r border-b overflow-hidden",
            transitionClass,
            isPinned
              ? "bg-blue-100 dark:bg-blue-900/50 group-hover/row:bg-blue-200 dark:group-hover/row:bg-blue-900/70"
              : "bg-gray-50 dark:bg-gray-800 group-hover/row:bg-gray-100 dark:group-hover/row:bg-gray-800",
            showTotalHoursColumn ? "p-2 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "border-r-0 border-b-0 p-0 w-0 min-w-0 max-w-0 opacity-0 text-transparent"
          )}>
            <div className="flex items-center justify-center truncate">
              {emp.totalDaysLE?.toFixed(2) || '0.00'}
            </div>
          </td>
          <td className={cn(
            "sticky right-0 z-20 border-[#dadce0] dark:border-gray-700 text-center text-sm font-semibold text-[#3c4043] dark:text-gray-200 transition-[width,opacity] ease-in-out border-b overflow-hidden",
            transitionClass,
            isPinned
              ? "bg-blue-100 dark:bg-blue-900/50 group-hover/row:bg-blue-200 dark:group-hover/row:bg-blue-900/70"
              : "bg-gray-50 dark:bg-gray-800 group-hover/row:bg-gray-100 dark:group-hover/row:bg-gray-800",
            showTotalHoursColumn ? "p-2 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "border-b-0 p-0 w-0 min-w-0 max-w-0 opacity-0 text-transparent"
          )}>
            <div className="flex items-center justify-center truncate">
              {emp.totalDaysNT?.toFixed(2) || '0.00'}
            </div>
          </td>
        </>
      )}
    </tr>
  )
}, (prev, next) => {
  // Fast path: if employee data object is the same, skip deep checks
  if (prev.emp !== next.emp) return false
  if (prev.dates !== next.dates) return false
  if (prev.showTotalHoursColumn !== next.showTotalHoursColumn) return false
  if (prev.totalHoursViewMode !== next.totalHoursViewMode) return false
  if (prev.isPinned !== next.isPinned) return false
  if (prev.isScrolledX !== next.isScrolledX) return false
  if (prev.hiddenStatuses !== next.hiddenStatuses) return false
  if (prev.transitionClass !== next.transitionClass) return false
  if (prev.onRowClick !== next.onRowClick) return false
  if (prev.onSelectRequest !== next.onSelectRequest) return false
  if (prev.onSelectAll !== next.onSelectAll) return false
  if (prev.onTogglePin !== next.onTogglePin) return false

  // Only check selection for THIS employee's request IDs
  const requests = prev.emp.requests
  for (const dateKey in requests) {
    const reqs = requests[dateKey]
    if (reqs) {
      for (const req of reqs) {
        if (prev.selectedRequests.has(req.id_ngoai_gio) !== next.selectedRequests.has(req.id_ngoai_gio)) {
          return false
        }
      }
    }
  }
  return true
})
