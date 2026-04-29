import { autoUpdate, flip, offset, shift, useFloating, FloatingPortal } from '@floating-ui/react'
import { toast } from "@heroui-v3/react"
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { useQueryClient } from '@tanstack/react-query'
import moment from 'moment'
import 'moment/locale/vi'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { calcHours, OvertimeFormValues, OvertimeRow } from '../hooks/useCreateOvertimeRequest'
import { useNgoaiGioPermissions } from '../hooks/useNgoaiGioPermissions'
import { OVERTIME_STATUS_CONFIG } from '../types'
import { CalendarEvent, CalendarViewType, CustomCalendar, CustomCalendarRef } from './calendar'
import { OvertimeQuickAddPopup } from './OvertimeQuickAddPopup'
import { BangChamCong } from './TimesheetSelector'
moment.locale('vi')

/* ═══════════════════════════════
   Repeat helpers
═══════════════════════════════ */
type RepeatMode = 'none' | 'daily' | 'weekly' | 'monthly' | 'weekdays'

const VN_WEEKDAYS = ['Chủ Nhật', 'thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy']

const getRepeatOptions = (dateStr: string) => {
  const m = moment(dateStr)
  const weekday = VN_WEEKDAYS[m.day()]
  const dayOfMonth = m.date()
  return [
    { value: 'none' as RepeatMode, label: 'Không lặp lại' },
    { value: 'daily' as RepeatMode, label: 'Hàng ngày' },
    { value: 'weekly' as RepeatMode, label: `Hàng tuần vào ${weekday}` },
    { value: 'monthly' as RepeatMode, label: `Hàng tháng vào ngày ${dayOfMonth}` },
    { value: 'weekdays' as RepeatMode, label: 'Mọi ngày trong tuần (thứ Hai tới thứ Sáu)' }
  ]
}

const generateRepeatDates = (startDate: string, mode: RepeatMode): string[] => {
  if (mode === 'none') return [startDate]
  const start = moment(startDate)
  const endOfMonth = start.clone().endOf('month')
  const dates: string[] = [startDate]

  switch (mode) {
    case 'daily': {
      const cur = start.clone().add(1, 'day')
      while (cur.isSameOrBefore(endOfMonth)) {
        dates.push(cur.format('YYYY-MM-DD'))
        cur.add(1, 'day')
      }
      break
    }
    case 'weekly': {
      const cur = start.clone().add(1, 'week')
      while (cur.isSameOrBefore(endOfMonth)) {
        dates.push(cur.format('YYYY-MM-DD'))
        cur.add(1, 'week')
      }
      break
    }
    case 'monthly': {
      for (let i = 1; i <= 2; i++) {
        const next = start.clone().add(i, 'month')
        dates.push(next.format('YYYY-MM-DD'))
      }
      break
    }
    case 'weekdays': {
      const cur = start.clone().add(1, 'day')
      while (cur.isSameOrBefore(endOfMonth)) {
        if (cur.day() >= 1 && cur.day() <= 5) dates.push(cur.format('YYYY-MM-DD'))
        cur.add(1, 'day')
      }
      break
    }
  }
  return dates
}

/* ═══════════════════════════════
   Time helpers
═══════════════════════════════ */
const TIME_OPTIONS = (() => {
  const opts: { value: string; label: string }[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      opts.push({ value: val, label: val })
    }
  }
  // Thêm option 24:00
  opts.push({ value: '24:00', label: '24:00' })
  return opts
})()

const parseTimeInput = (input: string): string | null => {
  const cleaned = input.trim().toUpperCase()
  const match = cleaned.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)?$/)
  if (!match) return null
  let h = parseInt(match[1], 10)
  const m = match[2] ? parseInt(match[2], 10) : 0
  const period = match[3]
  if (period === 'PM' && h < 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  if (h < 0 || h > 23 || m < 0 || m > 59) return null
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/* Google Calendar-style time picker */
export const GoogleTimePicker = ({
  value,
  onChange,
  minTime
}: {
  value: string
  onChange: (val: string) => void
  minTime?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputVal, setInputVal] = useState(value)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift({ padding: 8 })]
  })

  useEffect(() => { setInputVal(value) }, [value])

  useEffect(() => {
    if (isOpen) {
      // Use setTimeout to ensure the DOM is fully rendered and the portal is attached
      const timer = setTimeout(() => {
        const container = refs.floating.current as HTMLElement;
        const active = container?.querySelector('[data-active="true"]') as HTMLElement;
        if (active && container) {
          active.scrollIntoView({ block: 'center' });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  return (
    <div className="relative" ref={refs.setReference}>
      <input
        type="text"
        value={inputVal}
        onChange={(e) => {
          setInputVal(e.target.value)
          const parsed = parseTimeInput(e.target.value)
          if (parsed) {
            if (!minTime || parsed > minTime) {
              onChange(parsed)
            }
          }
        }}
        onFocus={() => {
          clearTimeout(blurTimeout.current as ReturnType<typeof setTimeout>)
          setIsOpen(true)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setIsOpen(false), 200)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Esc' || e.key === 'Escape') setIsOpen(false)
          if (e.key === 'Enter') {
            const parsed = parseTimeInput(inputVal)
            if (parsed) {
              if (!minTime || parsed > minTime) {
                onChange(parsed)
              } else {
                setInputVal(value) // revert
              }
            }
            setIsOpen(false)
          }
        }}
        className="h-8 w-[80px] px-2 bg-[#e8eaed] dark:bg-gray-700 rounded text-[13px] font-medium text-[#3c4043] dark:text-gray-200 hover:bg-[#dadce0] transition-colors cursor-text text-center outline-none border border-transparent focus:border-[#1a73e8] focus:bg-white"
      />
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            data-react-aria-top-layer="true"
            style={{ ...floatingStyles, zIndex: 999999 }}
            className="custom-floating-portal bg-white dark:bg-gray-800 rounded-lg shadow-[0_6px_20px_rgba(0,0,0,.2)] max-h-[240px] w-[160px] overflow-y-auto py-1 outline-none pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()} // Prevent external clickaways from incorrectly trapping
          >
            {TIME_OPTIONS.filter(opt => !minTime || opt.value > minTime).map((opt) => {
              return (
                <button
                  key={opt.value}
                  type="button"
                  data-active={opt.value === value}
                  className={`w-full px-4 py-2 text-sm text-left transition-all ${opt.value === value
                    ? 'bg-[#e8eaed] text-[#3c4043] font-medium'
                    : 'text-[#3c4043] hover:bg-[#f1f3f4] dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  onMouseDown={(e) => {
                    e.preventDefault() // prevent input blur
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </FloatingPortal>
      )}
    </div>
  )
}

/* Google Calendar-style repeat dropdown */
const RepeatDropdown = ({
  value,
  onChange,
  dateStr
}: {
  value: RepeatMode
  onChange: (val: RepeatMode) => void
  dateStr: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const options = getRepeatOptions(dateStr)
  const selectedLabel = options.find(o => o.value === value)?.label || 'Không lặp lại'

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift({ padding: 8 })]
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const refEl = refs.reference.current as Node | null
      const floEl = refs.floating.current as Node | null
      if ((refEl && refEl.contains(target)) || (floEl && floEl.contains(target))) {
        return
      }
      setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [refs])

  return (
    <div ref={refs.setReference} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 h-8 px-3 rounded text-[13px] font-medium transition-colors ${value !== 'none'
          ? 'bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc]'
          : 'bg-[#e8eaed] text-[#3c4043] hover:bg-[#dadce0]'
          }`}
      >
        {selectedLabel}
        <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 999999, width: 'max-content' }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-[0_6px_20px_rgba(0,0,0,.2)] min-w-[220px] max-w-[360px] overflow-hidden py-1 pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()} // Prevent popover clickaway
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`w-full px-4 py-2.5 text-sm text-left transition-all ${opt.value === value
                  ? 'bg-[#e8f0fe] text-[#1a73e8] font-medium'
                  : 'text-[#3c4043] dark:text-gray-200 hover:bg-[#f1f3f4] dark:hover:bg-gray-700'
                  }`}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FloatingPortal>
      )}
    </div>
  )
}

/* ═══════════════════════════════
   CustomCalendarView (Overtime wrapper)
═══════════════════════════════ */
interface CustomCalendarViewProps {
  form: UseFormReturn<OvertimeFormValues>
  currentView: CalendarViewType
  calendarRef: React.MutableRefObject<CustomCalendarRef | null>
  onTitleChange: (title: string) => void
  onDateRangeChange?: (range: { start: string; end: string }) => void
  onBaseDateChange?: (date: moment.Moment) => void
  existingOvertime?: any[]
  activeBangChamCong?: BangChamCong | null
  openTimesheets?: BangChamCong[]  // ALL open timesheets for blank form validation
  remove: (index: number) => void
  submitImmediately: (entries: OvertimeRow[], overrideEmployeeIds?: string[]) => Promise<boolean>
  onRegisterOpenBlankForm?: (openFn: () => void) => void  // expose openBlankForm to parent
  employeeOptions?: any[]  // for popup employee select (canCreateFor)
  isMultipleSelect?: boolean  // show multi-employee picker in popup
  initialAutoOpenForm?: boolean // trigger openBlankForm on mount
}

const CustomCalendarViewInner = ({
  form,
  currentView,
  calendarRef,
  onTitleChange,
  onDateRangeChange,
  onBaseDateChange,
  existingOvertime = [],
  activeBangChamCong,
  openTimesheets = [],
  remove,
  submitImmediately,
  onRegisterOpenBlankForm,
  employeeOptions = [],
  isMultipleSelect = false,
  initialAutoOpenForm = false
}: CustomCalendarViewProps) => {
  const { watch, setValue } = form
  const watchedEntries = watch('entries')
  const queryClient = useQueryClient()
  const { canByLeader, canCreateFor } = useNgoaiGioPermissions()

  /* ─── Compute locked dates from ALL open timesheets (union) ─── */
  const lockedDates = useMemo(() => {
    const locked = new Set<string>()

    // No open timesheets: lock ALL dates in visible range
    if (!openTimesheets?.length) {
      const lockStart = moment().subtract(6, 'months').startOf('month')
      const lockEnd = moment().add(6, 'months').endOf('month')
      const cur = lockStart.clone()
      while (cur.isSameOrBefore(lockEnd, 'day')) {
        locked.add(cur.format('YYYY-MM-DD'))
        cur.add(1, 'day')
      }
      return locked
    }

    // Build set of ALL allowed dates across all open timesheets
    const allowedDates = new Set<string>()
    for (const ts of openTimesheets) {
      const tsStart = ts.ngay_bat_dau?.split(' ')[0]
      const tsEnd = ts.ngay_ket_thuc?.split(' ')[0]
      if (!tsStart || !tsEnd) continue
      const cur = moment(tsStart)
      while (cur.isSameOrBefore(moment(tsEnd), 'day')) {
        allowedDates.add(cur.format('YYYY-MM-DD'))
        cur.add(1, 'day')
      }
    }

    // Lock all dates in scan window NOT in allowed set
    const allStarts = openTimesheets.map(t => t.ngay_bat_dau?.split(' ')[0] ?? '').filter(Boolean)
    const allEnds = openTimesheets.map(t => t.ngay_ket_thuc?.split(' ')[0] ?? '').filter(Boolean)
    const minStart = allStarts.reduce((a, b) => a < b ? a : b)
    const maxEnd = allEnds.reduce((a, b) => a > b ? a : b)
    const scanStart = moment(minStart).subtract(2, 'months').startOf('month')
    const scanEnd = moment(maxEnd).add(2, 'months').endOf('month')
    const cur = scanStart.clone()
    while (cur.isSameOrBefore(scanEnd, 'day')) {
      const dateStr = cur.format('YYYY-MM-DD')
      if (!allowedDates.has(dateStr)) locked.add(dateStr)
      cur.add(1, 'day')
    }

    // Also apply locked_dates ranges from each open timesheet
    for (const ts of openTimesheets) {
      const rawLocked = ts.locked_dates
      const parsedLocked: { start: string; end: string }[] = Array.isArray(rawLocked)
        ? rawLocked
        : typeof rawLocked === 'string' && rawLocked
          ? (() => { try { return JSON.parse(rawLocked) } catch { return [] } })()
          : []
      parsedLocked.forEach((range) => {
        if (!range.start || !range.end) return
        const lCur = moment(range.start)
        while (lCur.isSameOrBefore(moment(range.end), 'day')) {
          locked.add(lCur.format('YYYY-MM-DD'))
          lCur.add(1, 'day')
        }
      })
    }

    return locked
  }, [openTimesheets])

  const [popupDate, setPopupDate] = useState<string | null>(null)
  const [viewingEvent, setViewingEvent] = useState<any | null>(null)
  const [eventAnchorEl, setEventAnchorEl] = useState<HTMLElement | null>(null)
  const [isDeletingEvent, setIsDeletingEvent] = useState(false)
  const [editingEventId, setEditingEventId] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const detailPopupRef = useRef<HTMLDivElement>(null)

  // Day Detail Modal state
  const [dayDetailDate, setDayDetailDate] = useState<string | null>(null)
  const [dayDetailShifts, setDayDetailShifts] = useState<any[]>([])

  // Floating UI for event detail popup (Google Calendar-style smart positioning)
  const { refs: floatingRefs, floatingStyles, context: floatingContext } = useFloating({
    open: !!viewingEvent,
    onOpenChange: (open) => {
      if (!open) {
        setViewingEvent(null)
        setEventAnchorEl(null)
        setIsDeletingEvent(false)
      }
    },
    strategy: 'fixed',
    placement: 'right-start',
    middleware: [
      offset(12),
      flip({ fallbackPlacements: ['left-start', 'right', 'left', 'bottom', 'top'] }),
      shift({ padding: 16 })
    ],
    whileElementsMounted: autoUpdate,
    elements: {
      reference: eventAnchorEl
    }
  })

  // Close detail popup on click outside
  useEffect(() => {
    if (!viewingEvent) return
    const handler = (e: MouseEvent) => {
      if (detailPopupRef.current && !detailPopupRef.current.contains(e.target as Node)) {
        setViewingEvent(null)
        setEventAnchorEl(null)
        setIsDeletingEvent(false)
      }
    }
    const timerId = setTimeout(() => {
      document.addEventListener('mousedown', handler)
    }, 10)
    return () => {
      clearTimeout(timerId)
      document.removeEventListener('mousedown', handler)
    }
  }, [viewingEvent])

  /* ─── Build existing dates set ─── */
  const existingDates = useMemo(() => {
    const set = new Set<string>()
    existingOvertime.forEach((item: any) => {
      const dateStr = item.ngay_dang_ky?.substring(0, 10)
      if (dateStr) set.add(dateStr)
    })
    return set
  }, [existingOvertime])

  /* ─── Map form entries → CalendarEvent[] ─── */
  const formEvents: CalendarEvent[] = useMemo(
    () =>
      watchedEntries
        .filter((e) => e.date)
        .flatMap((e, i) => {
          return (e.slots || []).map((slot, slotIdx) => {
            const hours = calcHours(slot.startTime, slot.endTime)
            return {
              id: `${i}-${slotIdx}`,
              title: e.reason || `${hours}h`,
              date: e.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              color: '#039be5', // Peacock
              borderColor: '#039be5',
              textColor: '#039be5',
              tooltip: `${slot.startTime} – ${slot.endTime} (${hours}h)${e.reason ? `\n${e.reason}` : ''}`,
              meta: { index: i, slotIndex: slotIdx, isExisting: false }
            }
          })
        }),
    [watchedEntries]
  )

  /* ─── Map existing overtime → CalendarEvent[] ─── */
  const existingEvents: CalendarEvent[] = useMemo(
    () =>
      existingOvertime.map((item: any, i: number) => {
        const dateStr = item.ngay_dang_ky?.substring(0, 10)
        const status = item.trang_thai_tong || 'Cho_duyet'
        const statusConfig = OVERTIME_STATUS_CONFIG[status as keyof typeof OVERTIME_STATUS_CONFIG] || OVERTIME_STATUS_CONFIG['Cho_duyet']
        const hours = item.so_gio || 0
        const startTime = item.gio_bat_dau?.substring(0, 5) || ''
        const endTime = item.gio_ket_thuc?.substring(0, 5) || ''

        const colorMap: Record<string, { bg: string; border: string }> = {
          Da_duyet: { bg: '#33b679', border: '#33b679' }, // Sage
          Tu_choi: { bg: '#d50000', border: '#d50000' },  // Tomato
          Cho_duyet: { bg: '#fbbc04', border: '#fbbc04' }, // Yellow
          Huy: { bg: '#9e9e9e', border: '#9e9e9e' }        // Gray
        }
        const colors = colorMap[status] || colorMap['Cho_duyet']

        const isDotXuat = item.is_dot_xuat === "1" || item.is_dot_xuat === 1 || item.is_dotxuat === "1" || item.is_dotxuat === 1;

        return {
          id: `existing-${i}`,
          title: statusConfig.label,
          date: dateStr,
          startTime,
          endTime,
          color: colors.bg,
          borderColor: colors.border,
          textColor: colors.border,
          tooltip: `${statusConfig.label}\n${startTime} – ${endTime} (${hours}h)${item.noi_dung ? `\n${item.noi_dung}` : ''}${isDotXuat ? '\n(Đăng ký đột xuất)' : ''}`,
          meta: { isExisting: true, status, hours, reason: item.noi_dung, isDotXuat }
        }
      }),
    [existingOvertime]
  )

  // Memoize combined events — prevents new array reference breaking React.memo on children
  const allEvents = useMemo(() => [...formEvents, ...existingEvents], [formEvents, existingEvents])

  /* ─── Find entry by date ─── */
  const findEntryByDate = (dateStr: string) =>
    watchedEntries.findIndex((e) => e.date === dateStr)

  /* ─── Draft state ─── */
  const [draft, setDraft] = useState<{
    date: string
    startTime: string
    endTime: string
    reason: string
  } | null>(null)

  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none')
  const [reasonError, setReasonError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeError, setTimeError] = useState(false)
  const [dateError, setDateError] = useState(false)
  // Employee override for popup — only used when isMultipleSelect (canCreateFor)
  const [popupSelectedEmployees, setPopupSelectedEmployees] = useState<string[]>([])

  // Automatically sync the popup's employee selection with the outside filter
  // whenever the popup is opened.
  useEffect(() => {
    if (popupDate) {
      const outsideEmp = form.getValues('selectedEmployeeId')
      if (outsideEmp) {
        setPopupSelectedEmployees(Array.isArray(outsideEmp) ? outsideEmp.map(String) : [String(outsideEmp)])
      } else {
        setPopupSelectedEmployees([])
      }
    }
  }, [popupDate, form])

  /* ─── Open blank form (triggered from "Tạo" button in sidebar) ─── */
  const openBlankForm = () => {
    setViewingEvent(null)
    setEventAnchorEl(null)
    setEditingEventId(null)
    setRepeatMode('none')
    setReasonError(false)
    setDateError(false)
    setTimeError(false)
    setDraft({ date: '', startTime: '', endTime: '', reason: '' })
    setPopupDate('__blank__')  // sentinel: popup open, no date selected
  }

  // Expose openBlankForm to parent (EmployeeOvertimeCalendar)
  useEffect(() => {
    onRegisterOpenBlankForm?.(openBlankForm)
  }, [onRegisterOpenBlankForm]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto open form if specified
  useEffect(() => {
    if (initialAutoOpenForm) {
      openBlankForm()
    }
  }, [initialAutoOpenForm])

  const activeIndex = popupDate && popupDate !== '__blank__' ? findEntryByDate(popupDate) : -1
  const isNewEntry = draft !== null && activeIndex === -1

  /* ─── Click handlers ─── */
  const handleDateClick = (dateStr: string) => {
    if (!dateStr) return

    const today = moment().format('YYYY-MM-DD')
    const isPast = dateStr < today

    if (isPast) {
      // Cho phép chọn ngày quá khứ nếu nằm trong khoảng bất kỳ bảng chấm công nào đang mở
      const isInAnyTimesheet = openTimesheets?.some(ts => {
        const bangStart = ts.ngay_bat_dau?.split(' ')[0]
        const bangEnd = ts.ngay_ket_thuc?.split(' ')[0]
        return bangStart && bangEnd && dateStr >= bangStart && dateStr <= bangEnd
      })
      if (!isInAnyTimesheet && !canByLeader) return
    }

    // Open OvertimeQuickAddPopup — popup will load existingShifts via prop filter
    setPopupDate(dateStr)
  }

  const handleEventClick = (event: CalendarEvent, position?: { x: number; y: number }, element?: HTMLElement) => {
    if (event.meta?.isExisting) {
      // Open DayDetailModal with all shifts for that date
      const clickedDate = event.date
      if (clickedDate) {
        setPopupDate(clickedDate)  // Open unified popup with existing shifts loaded
      }
      return
    }
    const idx = event.meta?.index ?? parseInt(String(event.id).split('-')[0], 10)
    const entry = watchedEntries[idx]
    if (!entry) return
    setPopupDate(entry.date)
    setDraft(null)
    setReasonError(false)
  }

  const closePopup = () => {
    setPopupDate(null)
    setViewingEvent(null)
    setEventAnchorEl(null)
  }

  const handleUpdateShift = async (shiftId: number, start: string, end: string, reason: string): Promise<boolean> => {
    if (!popupDate) return false;
    setIsSubmitting(true)
    try {
      const res = await ngoaiGioAxios.update({
        id_ngoai_gio: shiftId,
        ngay_dang_ky: popupDate,
        gio_bat_dau: start,
        gio_ket_thuc: end,
        noi_dung: reason,
        so_gio: calcHours(start, end)
      })
      if (res.success) {
        toast('Đã cập nhật đơn ngoài giờ', { variant: 'success' })
        const empId = form.getValues('selectedEmployeeId')
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioExisting', empId] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioStats'] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioDisplay'] })
        queryClient.invalidateQueries({ queryKey: ['ngoaigio-statistics'] })
        return true
      } else {
        toast((res as any)?.message || 'Không thể cập nhật', { variant: 'danger' })
        return false
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || err?.message || 'Không thể cập nhật', { variant: 'danger' })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteShift = async (shiftId: number, reason: string) => {
    setIsSubmitting(true)
    try {
      const res = await ngoaiGioAxios.changeStatus({ id: shiftId, trang_thai_moi: 'Huy', ly_do_huy: reason })
      if (res.success) {
        toast('Đã hủy đơn ngoài giờ', { variant: 'success' })
        const empId = form.getValues('selectedEmployeeId')
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioExisting', empId] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioStats'] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioDisplay'] })
        queryClient.invalidateQueries({ queryKey: ['ngoaigio-statistics'] })
        return true
      } else {
        toast((res as any)?.message || 'Không thể hủy', { variant: 'danger' })
        return false
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || err?.message || 'Không thể hủy', { variant: 'danger' })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReopenShift = async (shiftId: number, start: string, end: string, reason: string, chiTiet?: string) => {
    if (!popupDate) return false;
    setIsSubmitting(true)
    try {
      const res = await ngoaiGioAxios.changeStatus({
        id: shiftId,
        trang_thai_moi: 'Cho_duyet',
        data: {
          ngay_dang_ky: popupDate,
          gio_bat_dau: start,
          gio_ket_thuc: end,
          noi_dung: reason,
          chi_tiet: chiTiet,
          so_gio: calcHours(start, end)
        }
      })
      if (res.success) {
        toast('Đã đăng ký lại đơn ngoài giờ', { variant: 'success' })
        const empId = form.getValues('selectedEmployeeId')
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioExisting', empId] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioStats'] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioDisplay'] })
        queryClient.invalidateQueries({ queryKey: ['ngoaigio-statistics'] })
        return true
      } else {
        toast((res as any)?.message || 'Không thể đăng ký lại', { variant: 'danger' })
        return false
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || err?.message || 'Không thể đăng ký lại', { variant: 'danger' })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitNewSlots = async (reason: string, date: string, slots: { start: string, end: string }[], repeatMode: RepeatMode, chi_tiet?: string, is_dot_xuat: number = 0) => {
    const dates = generateRepeatDates(date, repeatMode)
    const bypassLocked = canByLeader
    const payload: OvertimeRow[] = []

    for (const dateStr of dates) {
      if (!bypassLocked && lockedDates.has(dateStr)) continue  // skip if locked
      for (const slot of slots) {
        payload.push({
          id: Date.now() + Math.random(),
          date: dateStr,
          reason: reason,
          chi_tiet: chi_tiet || '',
          is_dot_xuat: is_dot_xuat,
          slots: [{
            id: Date.now() + Math.random(),
            startTime: slot.start,
            endTime: slot.end
          }]
        })
      }
    }

    if (payload.length > 0) {
      setIsSubmitting(true)
      const empOverride = isMultipleSelect && popupSelectedEmployees.length > 0 ? popupSelectedEmployees : undefined
      const success = await submitImmediately(payload, empOverride)
      setIsSubmitting(false)
      if (success) {
        setPopupDate(null)
      }
    } else {
      setPopupDate(null)
    }
  }

  const handleRemovePopupEntry = () => {
    if (activeIndex >= 0) remove(activeIndex)
    setPopupDate(null)
    setDraft(null)
  }

  /* ─── Active hours ─── */
  const activeHours = isNewEntry && draft
    ? calcHours(draft.startTime, draft.endTime)
    : activeIndex >= 0
      ? (watchedEntries[activeIndex]?.slots || []).reduce(
        (sum, slot) => sum + calcHours(slot.startTime || '', slot.endTime || ''),
        0
      )
      : 0

  // Refresh dayDetailShifts when existingOvertime changes (after add/delete/edit)
  useEffect(() => {
    if (!dayDetailDate) return
    const refreshed = existingOvertime.filter(
      (item: any) => item.ngay_dang_ky?.substring(0, 10) === dayDetailDate
    )
    setDayDetailShifts(refreshed)
  }, [existingOvertime, dayDetailDate])

  // Stable navigator handler — prevents CustomCalendar from seeing new fn ref each render
  const handleDateRangeChange = useCallback((range: { start: string; end: string }) => {
    setPopupDate(null)
    setDraft(null)
    setViewingEvent(null)
    setEventAnchorEl(null)
    setEditingEventId(null)
    onDateRangeChange?.(range)
  }, [onDateRangeChange])

  return (
    <div ref={containerRef} className="flex flex-col h-full relative">
      {/* ═══ Calendar ═══ */}
      <div className="flex-1 min-h-0 overflow-hidden bg-white">
        <CustomCalendar
          ref={calendarRef}
          view={currentView}
          events={allEvents}
          lockedDates={lockedDates}
          timesheetRange={
            activeBangChamCong
              ? {
                start: activeBangChamCong.ngay_bat_dau?.split(' ')[0] ?? '',
                end: activeBangChamCong.ngay_ket_thuc?.split(' ')[0] ?? ''
              }
              : null
          }
          existingDates={existingDates}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onNavigate={onTitleChange}
          onDateRangeChange={handleDateRangeChange}
          onBaseDateChange={onBaseDateChange}
          firstDay={1}
          canBypassLock={canByLeader}
        />
      </div>

      {/* ═══ Popup form (Unified Day Panel) ═══ */}
      {popupDate && (
        <OvertimeQuickAddPopup
          popupDate={popupDate}
          existingShifts={popupDate === '__blank__' ? [] : existingOvertime.filter((item: any) => item.ngay_dang_ky?.substring(0, 10) === popupDate).map((item: any) => ({
            id: item.id_ngoai_gio,
            start: item.gio_bat_dau?.substring(0, 5) || '',
            end: item.gio_ket_thuc?.substring(0, 5) || '',
            status: item.trang_thai_tong || 'Cho_duyet',
            reason: item.noi_dung || '',
            chi_tiet: item.chi_tiet || '',
            soLanHuy: Number(item.so_lan_huy) || 0,
            isDotXuat: item.is_dot_xuat === "1" || item.is_dot_xuat === 1 || item.is_dotxuat === "1" || item.is_dotxuat === 1
          }))}
          isSubmitting={isSubmitting}
          onClose={closePopup}
          onSubmitNewSlots={handleSubmitNewSlots}
          onUpdateShift={handleUpdateShift}
          onReopenShift={handleReopenShift}
          onDeleteShift={handleDeleteShift}
          employeeOptions={employeeOptions}
          selectedEmployees={popupSelectedEmployees}
          onSelectedEmployeesChange={setPopupSelectedEmployees}
          isMultipleSelect={isMultipleSelect}
          allowedDateRange={
            activeBangChamCong
              ? {
                start: activeBangChamCong.ngay_bat_dau?.split(' ')[0] ?? '',
                end: activeBangChamCong.ngay_ket_thuc?.split(' ')[0] ?? ''
              }
              : null
          }
          lockedDates={lockedDates}
          isLocked={popupDate !== '__blank__' ? lockedDates.has(popupDate) : false}
          canByLeader={canByLeader}
          canCreateFor={canCreateFor}
          renderRepeatDropdown={(props) => (
            <RepeatDropdown value={props.value} onChange={props.onChange} dateStr={props.dateStr} />
          )}
        />
      )}
    </div>
  )
}

// Wrap with memo: prevents re-render when parent state (isSidebarOpen, isRightSidebarOpen, etc.) changes
// Only re-renders when actual data props change (currentView, existingOvertime, activeBangChamCong, etc.)
export const CustomCalendarView = memo(CustomCalendarViewInner)
