import { useState, useRef, useEffect, MutableRefObject } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Button, Tooltip } from '@heroui/react'
import { UseFormReturn } from 'react-hook-form'
import { Clock, X, FileText, Repeat } from 'lucide-react'
import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')
import { calcHours, OvertimeFormValues } from '../hooks/useCreateOvertimeRequest'
import { OVERTIME_STATUS_CONFIG } from '../types'

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
  return opts
})()

const formatTimeDisplay = (time24: string): string => {
  if (!time24) return ''
  return time24
}

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

/* Google Calendar-style time picker: editable input + dropdown */
const GoogleTimePicker = ({
  value,
  minTime,
  onChange
}: {
  value: string
  minTime?: string
  onChange: (val: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputVal, setInputVal] = useState(formatTimeDisplay(value))
  const listRef = useRef<HTMLDivElement>(null)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setInputVal(formatTimeDisplay(value))
  }, [value])

  useEffect(() => {
    if (isOpen && listRef.current) {
      const active = listRef.current.querySelector('[data-active="true"]')
      if (active) active.scrollIntoView({ block: 'center' })
    }
  }, [isOpen])

  return (
    <div className="relative">
      <input
        type="text"
        value={inputVal}
        onChange={(e) => {
          setInputVal(e.target.value)
          const parsed = parseTimeInput(e.target.value)
          if (parsed) onChange(parsed)
        }}
        onFocus={() => {
          clearTimeout(blurTimeout.current as ReturnType<typeof setTimeout>)
          setIsOpen(true)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setIsOpen(false), 200)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false)
          if (e.key === 'Enter') {
            const parsed = parseTimeInput(inputVal)
            if (parsed && (!minTime || parsed > minTime)) {
              onChange(parsed)
            } else if (parsed && minTime && parsed <= minTime) {
              setInputVal(formatTimeDisplay(value)) // revert if invalid
            }
            setIsOpen(false)
          }
        }}
        className="h-8 w-[80px] px-2 bg-[#e8eaed] dark:bg-gray-700 rounded text-[13px] font-medium text-[#3c4043] dark:text-gray-200 hover:bg-[#dadce0] transition-colors cursor-text text-center outline-none border border-transparent focus:border-[#1a73e8] focus:bg-white"
      />
      {isOpen && (
        <div
          ref={listRef}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-100 bg-white dark:bg-gray-800 rounded-lg shadow-[0_6px_20px_rgba(0,0,0,.2)] max-h-[240px] w-[160px] overflow-y-auto py-1"
        >
          {TIME_OPTIONS.filter((opt) => !minTime || opt.value > minTime).map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-active={opt.value === value}
              className={`w-full px-4 py-2 text-sm text-left transition-all ${opt.value === value
                ? 'bg-[#e8eaed] text-[#3c4043] font-medium'
                : 'text-[#3c4043] hover:bg-[#f1f3f4]'
                }`}
              onMouseDown={(e) => {
                e.preventDefault() // prevent input blur
                onChange(opt.value)
                setIsOpen(false)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
  const ref = useRef<HTMLDivElement>(null)
  const options = getRepeatOptions(dateStr)
  const selectedLabel = options.find(o => o.value === value)?.label || 'Không lặp lại'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
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
        <div className="absolute top-full left-0 mt-1 z-100 bg-white dark:bg-gray-800 rounded-lg shadow-[0_6px_20px_rgba(0,0,0,.2)] min-w-[300px] overflow-hidden py-1">
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
      )}
    </div>
  )
}

/* ═══════════════════════════════
   OvertimeCalendarView
═══════════════════════════════ */
interface OvertimeCalendarViewProps {
  form: UseFormReturn<OvertimeFormValues>
  currentView: string
  calendarRef: MutableRefObject<any>
  onTitleChange: (title: string) => void
  existingOvertime?: any[]
  append: (value: any) => void
  remove: (index: number) => void
}

export const OvertimeCalendarView = ({
  form,
  currentView,
  calendarRef,
  onTitleChange,
  existingOvertime = [],
  append,
  remove
}: OvertimeCalendarViewProps) => {
  const { watch, setValue } = form
  const watchedEntries = watch('entries')

  const [popupDate, setPopupDate] = useState<string | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Sync title on mount & view change
  useEffect(() => {
    const timer = setTimeout(() => {
      const api = calendarRef.current?.getApi()
      if (api) onTitleChange(api.view.title)
    }, 50)
    return () => clearTimeout(timer)
  }, [currentView])

  /* ─── Events: form entries ─── */
  const events = watchedEntries
    .filter((e) => e.date)
    .flatMap((e, i) => {
      return (e.slots || []).map((slot, sIdx) => {
        const hours = calcHours(slot.startTime, slot.endTime)
        const startDT = `${e.date}T${slot.startTime || '17:30'}:00`
        const endDT = `${e.date}T${slot.endTime || '21:30'}:00`
        return {
          id: `${i}-${sIdx}`,
          title: `${slot.startTime}–${slot.endTime} (${hours}h)`,
          start: currentView === 'dayGridMonth' ? e.date : startDT,
          end: currentView === 'dayGridMonth' ? undefined : endDT,
          backgroundColor: '#4285f4',
          borderColor: '#1a73e8',
          textColor: '#ffffff',
          extendedProps: { index: i, slotIndex: sIdx, reason: e.reason, hours, startTime: slot.startTime, endTime: slot.endTime, isExisting: false }
        }
      })
    })

  /* ─── Events: existing overtime ─── */
  const existingDates = new Set<string>()
  const existingEvents = existingOvertime.map((item: any, i: number) => {
    const dateStr = item.ngay_dang_ky?.substring(0, 10)
    if (dateStr) existingDates.add(dateStr)
    const status = item.trang_thai_tong || 'Cho_duyet'
    const statusConfig = OVERTIME_STATUS_CONFIG[status as keyof typeof OVERTIME_STATUS_CONFIG] || OVERTIME_STATUS_CONFIG['Cho_duyet']
    const hours = item.so_gio || 0
    const startTime = item.gio_bat_dau?.substring(0, 5) || ''
    const endTime = item.gio_ket_thuc?.substring(0, 5) || ''

    const startDT = dateStr && startTime ? `${dateStr}T${startTime}:00` : dateStr
    const endDT = dateStr && endTime ? `${dateStr}T${endTime}:00` : undefined

    return {
      id: `existing-${i}`,
      title: `${statusConfig.label}`,
      start: currentView === 'dayGridMonth' ? dateStr : startDT,
      end: currentView === 'dayGridMonth' ? undefined : endDT,
      backgroundColor: status === 'Da_duyet' ? '#34a853' : status === 'Tu_choi' ? '#ea4335' : '#fbbc04',
      borderColor: status === 'Da_duyet' ? '#1e8e3e' : status === 'Tu_choi' ? '#c5221f' : '#f29900',
      textColor: '#ffffff',
      extendedProps: { isExisting: true, status, statusLabel: statusConfig.label, hours, startTime, endTime, reason: item.noi_dung }
    }
  })

  const allEvents = [...events, ...existingEvents]

  /* ─── Render event content ─── */
  const renderEventContent = (eventInfo: any) => {
    const { hours, startTime, endTime, reason, isExisting, statusLabel } = eventInfo.event.extendedProps
    const viewType = eventInfo.view.type

    if (isExisting) {
      return (
        <Tooltip
          content={
            <div className="text-xs p-1 space-y-1 max-w-[220px]">
              <div className="font-bold">{statusLabel}</div>
              {startTime && <div>{startTime} – {endTime} ({hours}h)</div>}
              {reason && <div className="text-white/80">{reason}</div>}
            </div>
          }
          delay={200}
          placement="top"
          classNames={{ content: 'bg-gray-800 text-white' }}
        >
          <div className="w-full px-1 pointer-events-auto truncate">
            {viewType === 'dayGridMonth' ? (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium truncate">{statusLabel} {startTime && `· ${startTime}–${endTime}`}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold">{statusLabel}</span>
                <span className="text-[10px] opacity-80">{hours}h</span>
              </div>
            )}
          </div>
        </Tooltip>
      )
    }

    return (
      <Tooltip
        content={
          <div className="text-xs p-1 space-y-1 max-w-[220px]">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold">{startTime} – {endTime}</span>
              {hours > 0 && <span className="text-blue-300 font-semibold">{hours}h</span>}
            </div>
            {reason && (
              <>
                <div className="border-t border-white/20 pt-1">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider">Nội dung</span>
                  <p className="text-white/90 mt-0.5 leading-snug">{reason}</p>
                </div>
              </>
            )}
          </div>
        }
        delay={300}
        placement="top"
        classNames={{ content: 'bg-gray-800 text-white' }}
      >
        <div className="w-full cursor-pointer px-1 truncate">
          {viewType === 'dayGridMonth' ? (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
              <span className="text-[11px] font-medium truncate">{startTime} {reason || `${hours}h`}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold">{startTime}–{endTime}</span>
              {reason && <span className="text-[10px] opacity-80 truncate">{reason}</span>}
            </div>
          )}
        </div>
      </Tooltip>
    )
  }

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
  const [conflictDates, setConflictDates] = useState<string[]>([])

  const activeIndex = popupDate ? findEntryByDate(popupDate) : -1
  const isNewEntry = draft !== null && activeIndex === -1

  /* ─── Click handlers ─── */
  const handleDateClick = (info: any) => {
    const dateStr = info.dateStr?.substring(0, 10)
    if (!dateStr) return
    if (dateStr < moment().format('YYYY-MM-DD')) return
    if (existingDates.has(dateStr)) return

    setPopupDate(dateStr)
    setReasonError(false)
    setRepeatMode('none')

    const existingIdx = findEntryByDate(dateStr)
    if (existingIdx === -1) {
      const lastEntry = watchedEntries[watchedEntries.length - 1]
      setDraft({
        date: dateStr,
        startTime: lastEntry?.slots?.[0]?.startTime || '17:30',
        endTime: lastEntry?.slots?.[0]?.endTime || '21:30',
        reason: lastEntry?.reason || ''
      })
    } else {
      setDraft(null)
    }
  }

  const handleEventClick = (info: any) => {
    const { isExisting } = info.event.extendedProps
    if (isExisting) return
    const idx = Number(info.event.id)
    const entry = watchedEntries[idx]
    if (!entry) return
    setPopupDate(entry.date)
    setDraft(null)
    setReasonError(false)
  }

  const closePopup = () => {
    setPopupDate(null)
    setDraft(null)
    setRepeatMode('none')
  }

  const [reasonError, setReasonError] = useState(false)

  const handleConfirmEntry = () => {
    const reason = isNewEntry && draft
      ? draft.reason
      : watchedEntries[activeIndex]?.reason || ''

    if (!reason.trim()) {
      setReasonError(true)
      return
    }

    if (isNewEntry && draft) {
      const dates = generateRepeatDates(draft.date, repeatMode)
      const today = moment().format('YYYY-MM-DD')
      const conflicts: string[] = []

      for (const dateStr of dates) {
        if (dateStr < today) { conflicts.push(dateStr); continue }
        if (existingDates.has(dateStr)) { conflicts.push(dateStr); continue }
        if (watchedEntries.some(e => e.date === dateStr)) { conflicts.push(dateStr); continue }
        append({
          id: Date.now() + Math.random(),
          date: dateStr,
          startTime: draft.startTime,
          endTime: draft.endTime,
          reason: draft.reason
        })
      }

      if (conflicts.length > 0) {
        setConflictDates(conflicts)
        setTimeout(() => setConflictDates([]), 4000)
      }
    }
    setReasonError(false)
    setPopupDate(null)
    setDraft(null)
    setRepeatMode('none')
  }

  const handleRemovePopupEntry = () => {
    if (activeIndex >= 0) remove(activeIndex)
    setPopupDate(null)
    setDraft(null)
  }

  /* ─── Day cell classes ─── */
  const dayCellClassNames = (arg: any) => {
    const dateStr = moment(arg.date).format('YYYY-MM-DD')
    const classes: string[] = []
    if (dateStr < moment().format('YYYY-MM-DD')) classes.push('gcal-day-past')
    else if (existingDates.has(dateStr)) classes.push('gcal-day-existing')
    else classes.push('gcal-day-future')
    if (conflictDates.includes(dateStr)) classes.push('gcal-day-conflict')
    return classes
  }

  /* ─── Active hours ─── */
  const activeHours = isNewEntry && draft
    ? calcHours(draft.startTime, draft.endTime)
    : activeIndex >= 0
      ? calcHours(watchedEntries[activeIndex]?.slots?.[0]?.startTime || '', watchedEntries[activeIndex]?.slots?.[0]?.endTime || '')
      : 0

  return (
    <div className="flex flex-col h-full relative">
      {/* ═══ Google Calendar CSS ═══ */}
      <style>{`
        /* Base — Google Calendar */
        .gcal .fc {
          font-family: 'Google Sans', 'Roboto', 'Arial', sans-serif;
          font-size: 14px;
          --fc-border-color: #dadce0;
          --fc-today-bg-color: transparent;
        }
        .gcal .fc .fc-scrollgrid { border: none; }
        .gcal .fc .fc-scrollgrid-section > td { border: none; }
        .gcal .fc .fc-toolbar { display: none; }
        .gcal .fc .fc-scroller { overflow: hidden !important; }

        /* Sync header & body column widths */
        .gcal .fc .fc-col-header,
        .gcal .fc .fc-scrollgrid-sync-table {
          table-layout: fixed !important;
          width: 100% !important;
        }
        .gcal .fc .fc-scrollgrid-sync-table {
          height: 100% !important;
        }
        /* Hide scrollbar gutter */
        .gcal .fc th.fc-scrollgrid-shrink,
        .gcal .fc td.fc-scrollgrid-shrink { display: none !important; width: 0 !important; min-width: 0 !important; padding: 0 !important; }

        /* ═══ Vertical grid lines — pseudo-element overlay ═══ */
        .gcal {
          position: relative;
        }
        .gcal > .fc {
          position: relative;
          z-index: 1;
        }
        .gcal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 5;
          background-size: calc(100% / 7) 100%;
          background-image: linear-gradient(
            to right,
            transparent calc(100% - 1px),
            #dadce0 1px
          );
        }

        /* Sticky header */
        .gcal .fc .fc-scrollgrid-section-header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #fff;
        }
        .gcal .fc .fc-scrollgrid-section-body > td {
          height: 100%;
        }
        .gcal .fc .fc-daygrid-body {
          height: 100%;
        }

        /* Column headers — clean, no borders */
        .gcal .fc .fc-col-header-cell {
          font-size: 11px;
          font-weight: 500;
          color: #70757a;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 0;
          border: none !important;
          background: transparent;
        }
        .gcal .fc .fc-col-header-cell-cushion {
          text-decoration: none;
          color: #70757a;
        }

        /* Day cells — fill viewport, Google Calendar style */
        .gcal .fc .fc-daygrid-day {
          border-top: 1px solid #dadce0 !important;
          border-bottom: none !important;
          border-left: none !important;
          border-right: none !important;
          transition: background 0.15s;
        }
        .gcal .fc .fc-daygrid-day-frame {
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .gcal .fc .gcal-day-future { cursor: pointer; }
        .gcal .fc .gcal-day-future:hover { background: #f8f9fa; }
        .gcal .fc .gcal-day-past { cursor: default; }
        .gcal .fc .gcal-day-existing { cursor: not-allowed; }
        .gcal .fc .fc-day-today { background: transparent !important; }
        .gcal .fc .fc-day-other { background: transparent !important; }
        .gcal .fc .fc-day-other .fc-daygrid-day-number { color: #3c4043 !important; opacity: 1 !important; }
        .gcal .fc .fc-day-other .fc-daygrid-day-top { opacity: 1 !important; }

        /* Day numbers — Google: top-right */
        .gcal .fc .fc-daygrid-day-top {
          display: flex;
          justify-content: center;
          padding: 0px 8px 2px 0;
        }
        .gcal .fc .fc-daygrid-day-number {
          font-size: 14px;
          font-weight: 500;
          color: #3c4043;
          padding: 0;
          text-decoration: none;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          line-height: 1;
        }
        .gcal .fc .fc-day-today .fc-daygrid-day-number {
          color: #fff;
          font-weight: 500;
          background: #1a73e8;
          border-radius: 50%;
          width: 28px;
          height: 28px;
        }
        .gcal .fc .fc-day-other .fc-daygrid-day-number {
          color: #70757a;
        }

        /* Events — Google Calendar pill style */
        .gcal .fc .fc-event {
          font-size: 12px;
          font-weight: 500;
          padding: 3px 0px;
          border-radius: 4px;
          cursor: pointer;
          margin: 0 8px 0 0;
          border: none;
          transition: opacity 0.15s;
          overflow: hidden;
        }
        .gcal .fc .fc-event:hover { opacity: 0.85; }
        .gcal .fc .fc-daygrid-event-harness { overflow: hidden; }

        /* Month dot events */
        .gcal .fc .fc-daygrid-dot-event {
          display: flex;
          align-items: center;
          padding: 1px 4px;
          background: transparent !important;
        }
        .gcal .fc .fc-daygrid-event-dot { display: none; }

        /* Time grid (Week/Day) — Google style */
        .gcal .fc .fc-timegrid-slot {
          height: 48px;
          border-color: #dadce0;
        }
        .gcal .fc .fc-timegrid-slot-minor {
          border-top-style: dotted;
          border-top-color: #e8eaed;
        }
        .gcal .fc .fc-timegrid-slot-label {
          font-size: 10px;
          color: #70757a;
          font-weight: 400;
          vertical-align: top;
          padding: 2px 8px 0 0;
          text-align: right;
        }
        .gcal .fc .fc-timegrid-axis { width: 56px; }
        .gcal .fc .fc-timegrid-event {
          border-radius: 4px;
          border: none;
          box-shadow: 0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
          font-size: 12px;
        }
        .gcal .fc .fc-timegrid-now-indicator-line {
          border-color: #ea4335;
          border-width: 2px;
        }
        .gcal .fc .fc-timegrid-now-indicator-arrow {
          border-color: #ea4335;
          border-width: 5px;
        }
        .gcal .fc .fc-timegrid .fc-col-header-cell { padding: 8px 0; }

        /* Grid borders — Google exact */
        .gcal .fc .fc-scrollgrid { border: none; }

        /* All-day */
        .gcal .fc .fc-timegrid-divider { display: none; }

        /* More link */
        .gcal .fc .fc-daygrid-more-link {
          color: #1a73e8;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 4px;
        }

        /* Conflict flash */
        .gcal .fc .gcal-day-conflict {
          background: #fce8e6 !important;
          animation: conflict-flash 0.6s ease-in-out 3;
        }
        @keyframes conflict-flash {
          0%, 100% { background: #fce8e6; }
          50% { background: #f8d7da; }
        }
      `}</style>

      {/* ═══ Calendar ═══ */}
      <div className="gcal flex-1 min-h-0 overflow-hidden dark:border-gray-700 bg-white dark:bg-gray-900 rounded-tl-[28px] rounded-bl-[28px] ml-4" style={{ boxShadow: '-1px 0 1px rgba(0,0,0,0.08)' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          locale="vi"
          headerToolbar={false}
          events={allEvents}
          eventContent={renderEventContent}
          eventDidMount={(info) => info.el.removeAttribute('title')}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          dayCellClassNames={dayCellClassNames}
          height="100%"
          firstDay={1}
          fixedWeekCount={true}
          dayMaxEvents={3}
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="23:59:00"
          slotDuration="00:30:00"
          nowIndicator={true}
          expandRows={true}
          stickyHeaderDates={true}
        />
      </div>

      {/* ═══ Popup form (Google Calendar style) ═══ */}
      {popupDate && (activeIndex >= 0 || isNewEntry) && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-40 bg-black/5"
            onClick={closePopup}
          />

          {/* Popup — Google Calendar event form */}
          <div
            ref={popupRef}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="pointer-events-auto w-[448px] animate-in fade-in zoom-in-95 duration-200" style={{ fontFamily: "'Google Sans', 'Roboto', 'Arial', sans-serif" }}>
              <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-[0_24px_38px_3px_rgba(0,0,0,.14),0_9px_46px_8px_rgba(0,0,0,.12),0_11px_15px_-7px_rgba(0,0,0,.2)]">

                {/* Top bar — Google style */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="w-8" />
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    radius="full"
                    onPress={closePopup}
                    className="h-8 w-8 min-w-0 text-[#5f6368] hover:bg-[#f1f3f4]"
                  >
                    <X size={18} />
                  </Button>
                </div>

                {/* Title input — Google: large text, bottom border blue */}
                <div className="px-6 pb-3">
                  <input
                    type="text"
                    placeholder="Nội dung / Lý do làm thêm"
                    value={
                      isNewEntry && draft
                        ? draft.reason
                        : watchedEntries[activeIndex]?.reason || ''
                    }
                    onChange={(e) => {
                      if (isNewEntry && draft) {
                        setDraft({ ...draft, reason: e.target.value })
                      } else if (activeIndex >= 0) {
                        setValue(`entries.${activeIndex}.reason`, e.target.value)
                      }
                      if (reasonError) setReasonError(false)
                    }}
                    className={`w-full text-[22px] font-normal text-[#3c4043] dark:text-gray-100 placeholder-[#70757a] border-0 border-b-2 ${reasonError ? 'border-[#d93025]' : 'border-[#dadce0]'
                      } outline-none bg-transparent pb-2 transition-colors focus:border-[#1a73e8]`}
                    autoFocus
                  />
                  {reasonError && (
                    <p className="text-[#d93025] text-xs mt-1">Vui lòng nhập nội dung</p>
                  )}
                </div>

                {/* Rows */}
                <div className="px-2 pb-2">

                  {/* Date & Time row */}
                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-[#f8f9fa] rounded-lg transition-colors">
                    <Clock size={20} className="text-[#5f6368] shrink-0" />
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Date pill */}
                      <span className="inline-flex items-center h-8 px-3 bg-[#e8eaed] dark:bg-gray-700 rounded text-[13px] font-medium text-[#3c4043] dark:text-gray-200">
                        {moment(popupDate).locale('vi').format('ddd, D [thg] M')}
                      </span>

                      {/* Start time */}
                      <GoogleTimePicker
                        value={isNewEntry && draft ? draft.startTime : (watchedEntries[activeIndex]?.slots?.[0]?.startTime || '17:30')}
                        onChange={(val) => {
                          const [h, m] = val.split(':').map(Number)
                          const endH = Math.min(h + 1, 23)
                          const endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
                          if (isNewEntry && draft) {
                            setDraft({ ...draft, startTime: val, endTime })
                          } else if (activeIndex >= 0) {
                            setValue(`entries.${activeIndex}.slots.0.startTime`, val)
                            setValue(`entries.${activeIndex}.slots.0.endTime`, endTime)
                          }
                        }}
                      />

                      <span className="text-[#5f6368] text-sm">–</span>

                      {/* End time */}
                      <GoogleTimePicker
                        value={isNewEntry && draft ? draft.endTime : (watchedEntries[activeIndex]?.slots?.[0]?.endTime || '21:30')}
                        minTime={isNewEntry && draft ? draft.startTime : (watchedEntries[activeIndex]?.slots?.[0]?.startTime || '17:30')}
                        onChange={(val) => {
                          if (isNewEntry && draft) {
                            setDraft({ ...draft, endTime: val })
                          } else if (activeIndex >= 0) {
                            setValue(`entries.${activeIndex}.slots.0.endTime`, val)
                          }
                        }}
                      />

                      {/* Hours badge */}
                      {activeHours > 0 && (
                        <span className="text-[13px] font-medium text-[#1a73e8] ml-1">
                          ({activeHours}h)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Repeat row — Google Calendar style (only for new entries) */}
                  {isNewEntry && popupDate && (
                    <div className="flex items-center gap-4 px-4 py-3 hover:bg-[#f8f9fa] rounded-lg transition-colors">
                      <Repeat size={20} className="text-[#5f6368] shrink-0" />
                      <RepeatDropdown value={repeatMode} onChange={setRepeatMode} dateStr={popupDate} />
                    </div>
                  )}

                  {/* Description row */}
                  <div className="flex items-start gap-4 px-4 py-3 hover:bg-[#f8f9fa] rounded-lg transition-colors">
                    <FileText size={20} className="text-[#5f6368] shrink-0 mt-0.5" />
                    <textarea
                      placeholder="Thêm mô tả chi tiết"
                      rows={2}
                      value={
                        isNewEntry && draft
                          ? draft.reason
                          : watchedEntries[activeIndex]?.reason || ''
                      }
                      onChange={(e) => {
                        if (isNewEntry && draft) {
                          setDraft({ ...draft, reason: e.target.value })
                        } else if (activeIndex >= 0) {
                          setValue(`entries.${activeIndex}.reason`, e.target.value)
                        }
                        if (reasonError) setReasonError(false)
                      }}
                      className="flex-1 text-sm text-[#3c4043] dark:text-gray-200 placeholder-[#70757a] bg-transparent border-none outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Footer — Google style */}
                <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-[#dadce0]">
                  {!isNewEntry && (
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={handleRemovePopupEntry}
                      className="text-sm font-medium h-9 px-4 mr-auto text-[#d93025] hover:bg-[#fce8e6]"
                    >
                      Xóa
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={closePopup}
                    className="text-sm font-medium text-[#1a73e8] hover:bg-[#f1f3f4] px-4 h-9 rounded transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmEntry}
                    className="text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1765cc] hover:shadow-md px-6 h-9 rounded-full transition-all"
                  >
                    {isNewEntry ? 'Thêm' : 'Lưu'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
