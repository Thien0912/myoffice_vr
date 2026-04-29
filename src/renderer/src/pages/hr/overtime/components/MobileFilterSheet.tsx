import { RangeCalendar } from '@heroui-v3/react'
import { parseDate } from '@internationalized/date'
import { Building2, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '@renderer/hooks/useBreakpoint'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface MobileFilterState {
  dateRange?: { from: string; to: string }
  trang_thai?: string
}

export interface MobileFilterSheetProps {
  /** Current date range */
  dateRange?: { from: string; to: string }
  /** Current status filter */
  trangThai?: string
  /** Show status filter (manager mode) */
  showStatusFilter?: boolean
  /** Show don vi filter — admin/manager with canViewAll only */
  showDonViFilter?: boolean
  /** Current selected don vi id */
  donViValue?: string
  /** Array format (multi select) */
  donViValues?: string[]
  /** Grouped department options [{label, options: [{value, label}]}] */
  donViOptions?: { label: string; options: { value: string; label: string }[] }[]
  /** Extra action nodes shown at LEFT of the strip (Create, View Toggle, etc.) */
  topActions?: React.ReactNode
  /** Callbacks */
  onDateRangeChange: (range: { from: string; to: string }) => void
  onTrangThaiChange?: (val: string | undefined) => void
  onDonViChange?: (val: string | undefined) => void
  onDonViValuesChange?: (vals: string[]) => void
  /** Single atomic reset — preferred over chaining individual callbacks */
  onResetAll?: () => void
  /** Navigate week/period (employee mode) */
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
  /** Notifies parent when sheet opens or closes */
  onOpenChange?: (open: boolean) => void

  /** Bulk selection support (manager only) */
  onSelectAllPending?: () => void
  isAllPendingSelected?: boolean
  canSelectAllPending?: boolean
  selectedCount?: number
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatShortDate = (d: string) => {
  if (!d) return ''
  const p = d.split('T')[0].split(' ')[0].split('-')
  return p.length === 3 ? `${p[2]}/${p[1]}` : d
}

const fmt = (date: Date): string => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().split('T')[0]
}

const today = new Date()
const TIME_PRESETS = [
  { label: 'Hôm nay', value: { from: fmt(today), to: fmt(today) } },
  {
    label: '7 ngày qua',
    value: { from: fmt(new Date(today.getTime() - 7 * 86400000)), to: fmt(today) }
  },
  {
    label: '30 ngày qua',
    value: { from: fmt(new Date(today.getTime() - 30 * 86400000)), to: fmt(today) }
  },
  {
    label: `Tháng ${today.getMonth() + 1}`,
    value: {
      from: fmt(new Date(today.getFullYear(), today.getMonth(), 1)),
      to: fmt(new Date(today.getFullYear(), today.getMonth() + 1, 0))
    }
  },
  {
    label: `Năm ${today.getFullYear()}`,
    value: {
      from: fmt(new Date(today.getFullYear(), 0, 1)),
      to: fmt(today)
    }
  },
]

const STATUS_GROUPS = [
  {
    id: 'pending',
    label: 'TRONG QUÁ TRÌNH',
    options: [
      { value: 'Cho_duyet', label: 'Chờ duyệt', dot: 'bg-yellow-400' },
    ]
  },
  {
    id: 'done',
    label: 'HOÀN THÀNH',
    options: [
      { value: 'Da_duyet', label: 'Đã duyệt', dot: 'bg-green-500' },
      { value: 'Tu_choi', label: 'Từ chối', dot: 'bg-red-500' },
      { value: 'Huy', label: 'Đã huỷ', dot: 'bg-gray-400' },
    ]
  },
]

// ─── Bottom Sheet ───────────────────────────────────────────────────────────

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  onResetAll?: () => void
  children: React.ReactNode
}

// Two snap positions — sheet height is always FULL, offset shifts which portion is visible
const FULL_HEIGHT_VH = 90    // sheet element height (vh)
const COLLAPSED_HEIGHT_VH = 62 // how much is visible at default snap
// offsetCollapsed = FULL - COLLAPSED in vh → translateY at default snap
const OFFSET_COLLAPSED_VH = FULL_HEIGHT_VH - COLLAPSED_HEIGHT_VH // 28 vh

type SnapState = 'collapsed' | 'expanded' | 'dismissed'

function BottomSheet({ isOpen, onClose, title, onResetAll, children }: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const snapRef = useRef<SnapState>('collapsed')
  const dragState = useRef({
    startY: 0, currentY: 0, startTime: 0, isDragging: false, baseOffsetPx: 0,
  })

  // ── Helpers ─────────────────────────────────────────────────
  const getOffsetForSnap = (snap: SnapState): number => {
    const vh = window.innerHeight / 100
    if (snap === 'expanded') return 0
    if (snap === 'collapsed') return OFFSET_COLLAPSED_VH * vh
    return FULL_HEIGHT_VH * vh
  }

  const setSheetTransform = (offsetPx: number, animate: boolean) => {
    const sheet = sheetRef.current
    const overlay = overlayRef.current
    if (!sheet) return
    sheet.style.transition = animate ? 'transform 0.32s cubic-bezier(0.32,0.72,0,1)' : 'none'
    sheet.style.transform = `translateY(${offsetPx}px)`
    if (overlay) {
      const fullPx = FULL_HEIGHT_VH * window.innerHeight / 100
      const visible = fullPx - offsetPx
      const ratio = Math.max(0, Math.min(1, visible / fullPx))
      overlay.style.transition = animate ? 'opacity 0.32s ease' : 'none'
      overlay.style.opacity = String(0.2 + ratio * 0.6)
    }
  }

  const applySnap = (snap: SnapState, animate = true) => {
    snapRef.current = snap
    setSheetTransform(getOffsetForSnap(snap), animate)
    if (snap === 'dismissed') setTimeout(onClose, 300)
  }

  // ── Enter animation (rAF-based, avoids animation fill-mode conflict) ──
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    snapRef.current = 'collapsed'

    const sheet = sheetRef.current
    if (!sheet) return

    // Frame 1: place off-screen instantly (no transition)
    sheet.style.transition = 'none'
    sheet.style.transform = `translateY(${FULL_HEIGHT_VH}vh)`

    // Frame 2: on next paint, slide to collapsed position with transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSheetTransform(getOffsetForSnap('collapsed'), true)
      })
    })

    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ── Touch handlers ───────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    dragState.current = {
      startY: e.touches[0].clientY,
      currentY: e.touches[0].clientY,
      startTime: Date.now(),
      isDragging: true,
      baseOffsetPx: getOffsetForSnap(snapRef.current),
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.current.isDragging) return
    dragState.current.currentY = e.touches[0].clientY
    const dy = dragState.current.currentY - dragState.current.startY
    const rawOffset = dragState.current.baseOffsetPx + dy
    const fullPx = FULL_HEIGHT_VH * window.innerHeight / 100

    let offset: number
    if (rawOffset < 0) {
      offset = -Math.sqrt(-rawOffset) * 5   // rubber-band up
    } else if (rawOffset > fullPx) {
      offset = fullPx + (rawOffset - fullPx) * 0.2  // rubber-band down
    } else {
      offset = rawOffset
    }
    setSheetTransform(offset, false)
  }

  const handleTouchEnd = () => {
    if (!dragState.current.isDragging) return
    dragState.current.isDragging = false

    const dy = dragState.current.currentY - dragState.current.startY
    const dt = Date.now() - dragState.current.startTime
    const vel = dy / Math.max(dt, 1)  // px/ms, positive = downward
    const current = snapRef.current

    if (current === 'expanded') {
      const collapse = dy > 80 || (dy > 40 && vel > 0.4)
      const dismiss = dy > 220 || (dy > 100 && vel > 0.8)
      if (dismiss) applySnap('dismissed')
      else if (collapse) applySnap('collapsed')
      else applySnap('expanded')
    } else {
      const expand = dy < -60 || (dy < -30 && vel < -0.4)
      const dismiss = dy > 130 || (dy > 50 && vel > 0.5)
      if (expand) applySnap('expanded')
      else if (dismiss) applySnap('dismissed')
      else applySnap('collapsed')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100000] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        style={{ opacity: 0.3 }}
        onClick={onClose}
      />

      {/* Sheet — fixed height, starts off-screen, enter via useEffect rAF */}
      <div
        ref={sheetRef}
        className="relative z-10 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ height: `${FULL_HEIGHT_VH}vh`, transform: `translateY(${FULL_HEIGHT_VH}vh)` }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header — also draggable */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 touch-none select-none shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <span className="text-[15px] font-bold text-gray-800 dark:text-gray-100">{title}</span>
          <div className="flex items-center gap-2">
            {onResetAll && (
              <button
                onClick={onResetAll}
                className="h-7 px-2.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-[11px] font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-800"
              >
                Đặt lại
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Date Range Section ─────────────────────────────────────────────────────

interface DateRangeSectionProps {
  dateRange?: { from: string; to: string }
  onDateRangeChange: (r: { from: string; to: string }) => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
  onClose: () => void
}

function DateRangeSection({
  dateRange,
  onDateRangeChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  onClose,
}: DateRangeSectionProps) {
  const [tempRange, setTempRange] = useState(dateRange || { from: '', to: '' })

  useEffect(() => {
    setTempRange(dateRange || { from: '', to: '' })
  }, [dateRange])

  const handleApply = () => {
    if (tempRange.from && tempRange.to) {
      onDateRangeChange(tempRange)
      onClose()
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
      {/* Quick navigation row */}
      {(onNavigatePrev || onNavigateNext || onNavigateToday) && (
        <div className="flex items-center gap-2">
          {onNavigatePrev && (
            <button
              onClick={() => { onNavigatePrev(); onClose() }}
              className="flex items-center gap-1 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft size={14} />
              Trước
            </button>
          )}
          {onNavigateToday && (
            <button
              onClick={() => { onNavigateToday(); onClose() }}
              className="flex-1 h-9 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-[12px] font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
            >
              Hôm nay / Tuần này
            </button>
          )}
          {onNavigateNext && (
            <button
              onClick={() => { onNavigateNext(); onClose() }}
              className="flex items-center gap-1 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Sau
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* Quick presets */}
      <div className="flex flex-wrap gap-1.5">
        {TIME_PRESETS.map((p) => {
          const isActive =
            tempRange.from === p.value.from && tempRange.to === p.value.to
          return (
            <button
              key={p.label}
              onClick={() => {
                onDateRangeChange(p.value)
                onClose()
              }}
              className={`h-7 px-3 rounded-full border text-[11px] font-semibold transition-all ${isActive
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600'
                }`}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Current selection display */}
      {tempRange.from && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Calendar size={13} className="text-gray-400 shrink-0" />
          <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300">
            {formatShortDate(tempRange.from)}
            {tempRange.to ? ` → ${formatShortDate(tempRange.to)}` : ''}
          </span>
          <button
            onClick={() => setTempRange({ from: '', to: '' })}
            className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Calendar */}
      <div className="flex justify-center">
        <RangeCalendar
          aria-label="Khoảng thời gian"
          value={
            tempRange.from && tempRange.to
              ? {
                start: parseDate(tempRange.from.split('T')[0].split(' ')[0]),
                end: parseDate(tempRange.to.split('T')[0].split(' ')[0])
              }
              : null
          }
          onChange={(range) => {
            setTempRange(range
              ? { from: range.start.toString(), to: range.end.toString() }
              : { from: '', to: '' }
            )
          }}
        >
          <RangeCalendar.Header>
            <RangeCalendar.Heading />
            <RangeCalendar.NavButton slot="previous" />
            <RangeCalendar.NavButton slot="next" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid>
            <RangeCalendar.GridHeader>
              {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(date) => <RangeCalendar.Cell date={date} />}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
        </RangeCalendar>
      </div>

      {/* Apply */}
      <button
        onClick={handleApply}
        disabled={!tempRange.from || !tempRange.to}
        className="w-full h-11 rounded-xl bg-blue-600 text-white text-[13px] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm"
      >
        Áp dụng khoảng thời gian
      </button>
    </div>
  )
}

// ─── Status Section ─────────────────────────────────────────────────────────

interface StatusSectionProps {
  value?: string
  onChange: (val: string | undefined) => void
  onClose: () => void
}

function StatusSection({ value, onChange, onClose }: StatusSectionProps) {
  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
      {STATUS_GROUPS.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {group.label}
          </span>
          <div className="flex flex-col gap-1.5">
            {group.options.map((opt) => {
              const isSelected = value === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(isSelected ? undefined : opt.value)
                    onClose()
                  }}
                  className={`flex items-center gap-3 h-11 px-3 rounded-xl border-2 text-[13px] font-semibold transition-all text-left ${isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                  <span className="flex-1">{opt.label}</span>
                  {isSelected && (
                    <span className="shrink-0 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {value && (
        <button
          onClick={() => { onChange(undefined); onClose() }}
          className="text-[12px] text-red-500 font-medium text-center py-1 hover:underline"
        >
          Xóa bộ lọc trạng thái
        </button>
      )}
    </div>
  )
}

// ─── Don Vi (Unit) Section ─────────────────────────────────────────────────

interface DonViSectionProps {
  value?: string
  values?: string[]
  options: { label: string; options: { value: string; label: string }[] }[]
  onChange?: (val: string | undefined) => void
  onValuesChange?: (vals: string[]) => void
  onClose: () => void
}

function DonViSection({ value, values, options, onChange, onValuesChange, onClose }: DonViSectionProps) {
  const [search, setSearch] = useState('')

  const filtered = options.map(group => ({
    ...group,
    options: group.options.filter(o =>
      o.label.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(g => g.options.length > 0)

  return (
    <div className="flex flex-col gap-3 px-4 pt-3 pb-6">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm đơn vị..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-9 pl-3 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Clear all option */}
      <button
        onClick={() => {
          if (onValuesChange) onValuesChange([])
          else onChange?.(undefined)
          if (!onValuesChange) onClose()
        }}
        className={`flex items-center gap-2 h-10 px-3 rounded-lg border-2 text-[12px] font-semibold transition-all ${(!value && (!values || values.length === 0))
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-700 dark:text-blue-300'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
          }`}
      >
        <Building2 size={13} className="shrink-0" />
        Tất cả đơn vị
      </button>

      {/* Grouped list */}
      <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto -mx-1 px-1">
        {filtered.length === 0 ? (
          <p className="text-center text-[12px] text-gray-400 py-4">Không tìm thấy đơn vị</p>
        ) : (
          filtered.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.options.map((opt) => {
                  const isMulti = !!onValuesChange
                  const isSelected = isMulti ? values?.includes(opt.value) : opt.value === value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (isMulti) {
                          if (!values) onValuesChange([opt.value])
                          else if (values.includes(opt.value)) onValuesChange(values.filter(v => v !== opt.value))
                          else onValuesChange([...values, opt.value])
                        } else {
                          onChange?.(isSelected ? undefined : opt.value)
                          onClose()
                        }
                      }}
                      className={`flex items-center gap-2 h-10 px-3 rounded-lg border text-[12px] font-medium text-left transition-all ${isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <span className="flex-1 truncate">{opt.label}</span>
                      {isSelected && (
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MobileFilterSheet({
  dateRange,
  trangThai,
  showStatusFilter = false,
  showDonViFilter = false,
  donViValue,
  donViValues,
  donViOptions = [],
  topActions,
  onDateRangeChange,
  onTrangThaiChange,
  onDonViChange,
  onDonViValuesChange,
  onResetAll: onResetAllProp,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  onOpenChange,
  onSelectAllPending,
  isAllPendingSelected,
  canSelectAllPending,
  selectedCount = 0,
}: MobileFilterSheetProps) {
  const { isMobile } = useBreakpoint()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'date' | 'status' | 'donvi'>('date')

  const setOpen = (val: boolean) => {
    setIsOpen(val)
    onOpenChange?.(val)
  }

  if (!isMobile) return null

  const activeFilters =
    (dateRange?.from ? 1 : 0) +
    (trangThai ? 1 : 0) +
    (donViValue && donViValue !== 'all' ? 1 : 0) +
    (donViValues && donViValues.length > 0 ? 1 : 0)

  return (
    <>
      {/* ── Compact mobile toolbar strip ──────────────────────────── */}
      <div className="flex items-center gap-1.5 w-full overflow-x-auto hide-scrollbar px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        {/* Left: custom action slots (Create btn, View toggle, etc.) */}
        {topActions && (
          <div className="flex items-center gap-1.5 shrink-0">
            {topActions}
          </div>
        )}

        {/* Date prev nav */}
        {onNavigatePrev && (
          <button
            onClick={onNavigatePrev}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Date range pill — tappable to open sheet */}
        <button
          onClick={() => { setActiveTab('date'); setOpen(true) }}
          className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
        >
          <Calendar size={13} className="text-gray-400 shrink-0" />
          <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 truncate">
            {dateRange?.from
              ? `${formatShortDate(dateRange.from)}${dateRange.to ? ` — ${formatShortDate(dateRange.to)}` : ''}`
              : 'Chọn ngày'}
          </span>
        </button>

        {onNavigateNext && (
          <button
            onClick={onNavigateNext}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Check All Pending — only for management if requested */}
        {canSelectAllPending && onSelectAllPending && (
          <div className="flex items-center gap-1 shrink-0 ml-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectAllPending() }}
              className={`
                relative w-8 h-8 rounded-lg border flex items-center justify-center transition-all active:scale-[0.92]
                ${isAllPendingSelected
                  ? 'bg-green-600 border-green-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }
              `}
              title="Chọn tất cả chờ duyệt"
            >
              <CheckCircle2 size={16} strokeWidth={isAllPendingSelected ? 3 : 2} />
              {selectedCount > 0 && !isAllPendingSelected && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                  {selectedCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Filter button */}
        <button
          onClick={() => {
            const firstTab = showStatusFilter ? 'status' : showDonViFilter ? 'donvi' : 'date'
            setActiveTab(firstTab)
            setOpen(true)
          }}
          className={`
            relative w-8 h-8 rounded-lg border flex items-center justify-center transition-colors shrink-0
            ${activeFilters > 0
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
              : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }
          `}
        >
          <Filter size={14} />
          {activeFilters > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* ── Bottom sheet ──────────────────────────────────────────── */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        title="Bộ lọc"
        onResetAll={activeFilters > 0 ? () => {
          if (onResetAllProp) {
            // Atomic reset from parent — avoids stale closure bug
            onResetAllProp()
          } else {
            // Fallback: chain individual callbacks
            onDateRangeChange({
              from: fmt(new Date(today.getFullYear(), today.getMonth(), 1)),
              to: fmt(new Date(today.getFullYear(), today.getMonth() + 1, 0))
            })
            onTrangThaiChange?.(undefined)
            onDonViChange?.(undefined)
            onDonViValuesChange?.([])
          }
          setOpen(false)
        } : undefined}
      >
        {/* Tabs — show when multiple filter types available */}
        {(showStatusFilter || showDonViFilter) && (
          <div className="flex border-b border-gray-100 dark:border-gray-800 px-4">
            {[
              { id: 'date' as const, label: 'Thời gian', dot: !!dateRange?.from },
              ...(showStatusFilter ? [{ id: 'status' as const, label: 'Trạng thái', dot: !!trangThai }] : []),
              ...(showDonViFilter ? [{ id: 'donvi' as const, label: 'Đơn vị', dot: !!((donViValue && donViValue !== 'all') || (donViValues && donViValues.length > 0)) }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 py-3 text-[12px] font-semibold border-b-2 transition-colors relative
                  ${activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
                  }
                `}
              >
                {tab.label}
                {tab.dot && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'date' && (
          <DateRangeSection
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            onNavigatePrev={onNavigatePrev}
            onNavigateNext={onNavigateNext}
            onNavigateToday={onNavigateToday}
            onClose={() => setOpen(false)}
          />
        )}

        {activeTab === 'status' && showStatusFilter && onTrangThaiChange && (
          <StatusSection
            value={trangThai}
            onChange={onTrangThaiChange}
            onClose={() => setOpen(false)}
          />
        )}

        {activeTab === 'donvi' && showDonViFilter && (onDonViChange || onDonViValuesChange) && (
          <DonViSection
            value={donViValue}
            values={donViValues}
            options={donViOptions}
            onChange={onDonViChange}
            onValuesChange={onDonViValuesChange}
            onClose={() => setOpen(false)}
          />
        )}
      </BottomSheet>
    </>
  )
}
