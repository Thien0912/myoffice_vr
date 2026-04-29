import { useState, useCallback, useMemo, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

/* ═══════════════════════════════
   Types
═══════════════════════════════ */
export type CalendarViewType = 'month' | 'week' | 'day'

export interface CalendarEvent {
  id: string
  title: string
  date: string       // YYYY-MM-DD
  startTime?: string // HH:mm
  endTime?: string   // HH:mm
  color: string      // bg color
  borderColor?: string
  textColor?: string
  tooltip?: string
  meta?: Record<string, any>
}

export interface CustomCalendarRef {
  prev: () => void
  next: () => void
  today: () => void
  getTitle: () => string
  getDateRange: () => { start: string; end: string }
}

interface CustomCalendarProps {
  view: CalendarViewType
  events?: CalendarEvent[]
  onDateClick?: (dateStr: string) => void
  onEventClick?: (event: CalendarEvent, position?: { x: number; y: number }) => void
  onNavigate?: (title: string) => void
  onDateRangeChange?: (range: { start: string; end: string }) => void
  firstDay?: number // 0=Sun, 1=Mon
  className?: string
}

/* ═══════════════════════════════
   Constants
═══════════════════════════════ */
const WEEKDAY_LABELS_GOOGLE = ['CN', 'THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7']
const HOURS = Array.from({ length: 24 }, (_, i) => i) // 00:00 – 23:00

const reorderWeekdays = (firstDay: number) => {
  const labels = [...WEEKDAY_LABELS_GOOGLE]
  return [...labels.slice(firstDay), ...labels.slice(0, firstDay)]
}

/* ═══════════════════════════════
   Helpers
═══════════════════════════════ */
const getMonthGrid = (baseDate: moment.Moment, firstDay: number): { days: moment.Moment[]; rowCount: number } => {
  const startOfMonth = baseDate.clone().startOf('month')
  const endOfMonth = baseDate.clone().endOf('month')

  // Find the start of the grid (first visible day)
  let gridStart = startOfMonth.clone().startOf('week')
  if (firstDay === 1) {
    gridStart = startOfMonth.clone().startOf('isoWeek')
  }

  // Calculate minimum rows needed
  // Cap at 5 rows like Google Calendar (7 × 5 = 35 cells)
  const daysFromGridStartToEndOfMonth = endOfMonth.diff(gridStart, 'days') + 1
  const rowCount = Math.min(Math.ceil(daysFromGridStartToEndOfMonth / 7), 5)
  const totalCells = rowCount * 7

  const days: moment.Moment[] = []
  const cursor = gridStart.clone()
  for (let i = 0; i < totalCells; i++) {
    days.push(cursor.clone())
    cursor.add(1, 'day')
  }
  return { days, rowCount }
}

const getWeekDays = (baseDate: moment.Moment, firstDay: number): moment.Moment[] => {
  let weekStart: moment.Moment
  if (firstDay === 1) {
    weekStart = baseDate.clone().startOf('isoWeek')
  } else {
    weekStart = baseDate.clone().startOf('week')
  }
  return Array.from({ length: 7 }, (_, i) => weekStart.clone().add(i, 'day'))
}

const timeToMinutes = (time: string): number => {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const hexToRgba = (hex: string, alpha: number): string => {
  // ensure it's a valid 6-char hex
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/* ═══════════════════════════════
   ClickUp Event Card
═══════════════════════════════ */
const EventCard = ({
  event,
  variant = 'month',
  onClick
}: {
  event: CalendarEvent
  variant?: 'month' | 'week' | 'day'
  onClick?: (e: CalendarEvent, position?: { x: number; y: number }) => void
}) => {
  const isCompact = variant === 'month'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        onClick?.(event, { x: rect.left, y: rect.top })
      }}
      className={`event-card group w-full ${!isCompact ? 'h-full flex flex-col items-start justify-start' : 'block'} text-left rounded-[4px] transition-all duration-150 hover:shadow-md cursor-pointer overflow-hidden`}
      style={{
        backgroundColor: hexToRgba(event.color, 0.2),
        borderLeft: `3px solid ${event.borderColor || event.color}`,
        color: event.textColor || event.borderColor || event.color
      }}
      title={event.tooltip || event.title}
    >
      {isCompact ? (
        <div className="flex items-center gap-1 px-1.5 py-[2px]">
          {event.startTime && (
            <span className="text-[11px] font-bold shrink-0">{event.startTime} - {event.endTime}</span>
          )}
          <span className="text-[11px] font-bold truncate">{event.title}</span>
        </div>
      ) : (
        <div className="flex flex-col px-2 py-1">
          <span className="text-xs font-bold truncate">{event.title}</span>
          {event.startTime && event.endTime && (
            <span className="text-[11px] font-semibold opacity-80">{event.startTime} – {event.endTime}</span>
          )}
        </div>
      )}
    </button>
  )
}

/* ═══════════════════════════════
   Month View
═══════════════════════════════ */
const MonthView = ({
  baseDate,
  firstDay,
  events,
  onDateClick,
  onEventClick
}: {
  baseDate: moment.Moment
  firstDay: number
  events: CalendarEvent[]
  onDateClick?: (dateStr: string) => void
  onEventClick?: (event: CalendarEvent) => void
}) => {
  const today = moment().format('YYYY-MM-DD')
  const currentMonth = baseDate.month()
  const { days, rowCount } = useMemo(() => getMonthGrid(baseDate, firstDay), [baseDate, firstDay])
  const weekdayLabels = useMemo(() => reorderWeekdays(firstDay), [firstDay])

  // Compact header, all date rows equal via CSS 1fr
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    })
    return map
  }, [events])

  const MAX_VISIBLE_EVENTS = 3

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-white overflow-hidden">
      {/* Weekday header — separate compact element */}
      <div ref={headerRef} className="grid grid-cols-7 shrink-0">
        {weekdayLabels.map((label, i) => (
          <div
            key={`hdr-${i}`}
            className={`py-[4px] text-center text-[11px] font-medium text-[#444746] select-none ${i < 6 ? 'border-r border-[#dde3ea]' : ''
              }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Date grid — fills remaining space, all rows equal */}
      <div
        className="grid grid-cols-7 flex-1 min-h-0"
        style={{ gridTemplateRows: `repeat(${rowCount}, 1fr)` }}
      >
        {days.map((day, idx) => {
          const dateStr = day.format('YYYY-MM-DD')
          const isToday = dateStr === today
          const isCurrentMonth = day.month() === currentMonth
          const isPast = dateStr < today
          const dayEvents = eventsByDate[dateStr] || []
          const hasMore = dayEvents.length > MAX_VISIBLE_EVENTS
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS)
          const isFirstRow = idx < 7

          return (
            <div
              key={dateStr}
              onClick={() => onDateClick?.(dateStr)}
              className={`
                relative flex flex-col border-b border-r border-[#dde3ea] overflow-hidden
                transition-colors duration-100 bg-white
                ${isPast ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              {/* Day number */}
              <div className={`flex justify-center ${isFirstRow ? 'pt-0' : 'pt-[6px]'} pb-px`}>
                <span
                  className={`
                    inline-flex items-center justify-center w-[24px] h-[24px] text-[12px] rounded-full leading-none select-none
                    ${isToday
                      ? 'bg-[#1a73e8] text-white font-bold'
                      : isCurrentMonth
                        ? 'text-[#444746] font-bold'
                        : 'text-[#444746] font-bold'
                    }
                  `}
                >
                  {day.date()}
                </span>
                {day.date() === 1 && !isToday && (
                  <span className={`text-[12px] ml-0.5 leading-[24px] select-none font-bold ${isCurrentMonth ? 'text-[#444746]' : 'text-[#444746]'
                    }`}>
                    thg {day.month() + 1}
                  </span>
                )}
              </div>

              {/* Events */}
              <div className="flex-1 flex flex-col gap-[2px] px-1 min-h-0 overflow-hidden">
                {visibleEvents.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    variant="month"
                    onClick={onEventClick}
                  />
                ))}
                {hasMore && (
                  <button
                    type="button"
                    className="text-[10px] font-medium text-[#1a73e8] hover:bg-[#e8f0fe] rounded px-1 py-px text-left transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDateClick?.(dateStr)
                    }}
                  >
                    +{dayEvents.length - MAX_VISIBLE_EVENTS} thêm
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════
   Week View
═══════════════════════════════ */
const WeekView = ({
  baseDate,
  firstDay,
  events,
  onDateClick,
  onEventClick
}: {
  baseDate: moment.Moment
  firstDay: number
  events: CalendarEvent[]
  onDateClick?: (dateStr: string) => void
  onEventClick?: (event: CalendarEvent) => void
}) => {
  const today = moment().format('YYYY-MM-DD')
  const nowMinutes = moment().hours() * 60 + moment().minutes()
  const days = useMemo(() => getWeekDays(baseDate, firstDay), [baseDate, firstDay])

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    })
    return map
  }, [events])

  const SLOT_HEIGHT = 48
  const START_HOUR = 0
  const END_HOUR = 24
  const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * SLOT_HEIGHT

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header row */}
      <div className="flex border-b border-[#e0e0e0] shrink-0 pr-[6px]">
        <div className="w-14 shrink-0" />
        <div className="flex-1 grid grid-cols-7">
          {days.map((day) => {
            const dateStr = day.format('YYYY-MM-DD')
            const isToday = dateStr === today
            return (
              <div
                key={dateStr}
                className="flex flex-col items-center py-2 cursor-pointer hover:bg-[#f0f4ff] transition-colors"
                onClick={() => onDateClick?.(dateStr)}
              >
                <span className={`text-[11px] font-medium uppercase tracking-wider ${isToday ? 'text-[#1a73e8]' : 'text-[#70757a]'}`}>
                  {WEEKDAY_LABELS_GOOGLE[day.day()]}
                </span>
                <span
                  className={`
                    inline-flex items-center justify-center w-10 h-10 text-xl font-medium rounded-full mt-0.5
                    ${isToday ? 'bg-[#1a73e8] text-white' : 'text-[#3c4043]'}
                  `}
                >
                  {day.date()}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-scroll custom-scrollbar">
        <div className="flex relative mt-2" style={{ height: TOTAL_HEIGHT + 16 }}>
          {/* Time labels */}
          <div className="w-14 shrink-0 relative">
            {[...HOURS, 24].map((hour) => (
              <div
                key={hour}
                className="absolute w-full text-right pr-2 text-[10px] text-[#70757a] font-normal select-none"
                style={{
                  top: (hour - START_HOUR) * SLOT_HEIGHT - 6,
                  lineHeight: '12px',
                }}
              >
                {hour === 24 ? '24:00' : `${String(hour).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dateStr = day.format('YYYY-MM-DD')
            const isToday = dateStr === today
            const dayEvents = eventsByDate[dateStr] || []

            return (
              <div
                key={dateStr}
                className="flex-1 relative border-l border-[#e0e0e0]"
                onClick={() => onDateClick?.(dateStr)}
              >
                {/* Hour lines */}
                {[...HOURS, 24].map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-[#e8eaed]"
                    style={{ top: (hour - START_HOUR) * SLOT_HEIGHT }}
                  />
                ))}
                {/* Half-hour dashed lines */}
                {HOURS.map((hour) => (
                  <div
                    key={`${hour}-half`}
                    className="absolute w-full border-t border-dashed border-[#f0f0f0]"
                    style={{ top: (hour - START_HOUR) * SLOT_HEIGHT + SLOT_HEIGHT / 2 }}
                  />
                ))}

                {/* Now indicator */}
                {isToday && nowMinutes >= START_HOUR * 60 && (
                  <div
                    className="absolute w-full z-10 pointer-events-none"
                    style={{ top: ((nowMinutes - START_HOUR * 60) / 60) * SLOT_HEIGHT }}
                  >
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ea4335] -ml-[5px]" />
                      <div className="flex-1 h-[2px] bg-[#ea4335]" />
                    </div>
                  </div>
                )}

                {/* Events */}
                {dayEvents.map((ev) => {
                  const startMin = ev.startTime ? timeToMinutes(ev.startTime) : 0
                  const endMin = ev.endTime ? timeToMinutes(ev.endTime) : startMin + 60
                  const top = ((startMin - START_HOUR * 60) / 60) * SLOT_HEIGHT
                  const height = Math.max(((endMin - startMin) / 60) * SLOT_HEIGHT, 24)

                  return (
                    <div
                      key={ev.id}
                      className="absolute left-1 right-1 z-5"
                      style={{ top, height }}
                    >
                      <EventCard
                        event={ev}
                        variant="week"
                        onClick={onEventClick}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════
   Day View
═══════════════════════════════ */
const DayView = ({
  baseDate,
  events,
  onDateClick,
  onEventClick
}: {
  baseDate: moment.Moment
  events: CalendarEvent[]
  onDateClick?: (dateStr: string) => void
  onEventClick?: (event: CalendarEvent) => void
}) => {
  const today = moment().format('YYYY-MM-DD')
  const dateStr = baseDate.format('YYYY-MM-DD')
  const isToday = dateStr === today
  const nowMinutes = moment().hours() * 60 + moment().minutes()

  const dayEvents = useMemo(
    () => events.filter((ev) => ev.date === dateStr),
    [events, dateStr]
  )

  const SLOT_HEIGHT = 48
  const START_HOUR = 0
  const END_HOUR = 24
  const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * SLOT_HEIGHT

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e0e0e0] shrink-0">
        <span className={`text-[11px] font-medium uppercase tracking-wider ${isToday ? 'text-[#1a73e8]' : 'text-[#70757a]'}`}>
          {WEEKDAY_LABELS_GOOGLE[baseDate.day()]}
        </span>
        <span
          className={`
            inline-flex items-center justify-center w-10 h-10 text-xl font-medium rounded-full
            ${isToday ? 'bg-[#1a73e8] text-white' : 'text-[#3c4043]'}
          `}
        >
          {baseDate.date()}
        </span>
        <span className="text-sm text-[#70757a]">
          {`Tháng ${baseDate.month() + 1}, ${baseDate.year()}`}
        </span>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-scroll custom-scrollbar">
        <div className="flex relative mt-2" style={{ height: TOTAL_HEIGHT + 16 }}>
          {/* Time labels */}
          <div className="w-16 shrink-0 relative">
            {[...HOURS, 24].map((hour) => (
              <div
                key={hour}
                className="absolute w-full text-right pr-3 text-[11px] text-[#70757a] font-normal select-none"
                style={{
                  top: (hour - START_HOUR) * SLOT_HEIGHT - 7,
                  lineHeight: '14px',
                }}
              >
                {hour === 24 ? '24:00' : `${String(hour).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Main column */}
          <div
            className="flex-1 relative border-l border-[#e0e0e0]"
            onClick={() => onDateClick?.(dateStr)}
          >
            {[...HOURS, 24].map((hour) => (
              <div
                key={hour}
                className="absolute w-full border-t border-[#e8eaed]"
                style={{ top: (hour - START_HOUR) * SLOT_HEIGHT }}
              />
            ))}
            {HOURS.map((hour) => (
              <div
                key={`${hour}-half`}
                className="absolute w-full border-t border-dashed border-[#f0f0f0]"
                style={{ top: (hour - START_HOUR) * SLOT_HEIGHT + SLOT_HEIGHT / 2 }}
              />
            ))}

            {/* Now indicator */}
            {isToday && nowMinutes >= START_HOUR * 60 && (
              <div
                className="absolute w-full z-10 pointer-events-none"
                style={{ top: ((nowMinutes - START_HOUR * 60) / 60) * SLOT_HEIGHT }}
              >
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ea4335] -ml-[5px]" />
                  <div className="flex-1 h-[2px] bg-[#ea4335]" />
                </div>
              </div>
            )}

            {/* Events */}
            {dayEvents.map((ev) => {
              const startMin = ev.startTime ? timeToMinutes(ev.startTime) : 0
              const endMin = ev.endTime ? timeToMinutes(ev.endTime) : startMin + 60
              const top = ((startMin - START_HOUR * 60) / 60) * SLOT_HEIGHT
              const height = Math.max(((endMin - startMin) / 60) * SLOT_HEIGHT, 24)

              return (
                <div
                  key={ev.id}
                  className="absolute left-2 right-2 z-5"
                  style={{ top, height }}
                >
                  <EventCard
                    event={ev}
                    variant="day"
                    onClick={onEventClick}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════
   CustomCalendar (Main)
═══════════════════════════════ */
export const CustomCalendar = forwardRef<CustomCalendarRef, CustomCalendarProps>(
  ({ view, events = [], onDateClick, onEventClick, onNavigate, onDateRangeChange, firstDay = 1, className }, ref) => {
    const [baseDate, setBaseDate] = useState(() => moment())
    const [slideDirection, setSlideDirection] = useState<'up' | 'down' | null>(null)
    const [navKey, setNavKey] = useState(0)

    const getDateRange = useCallback(() => {
      switch (view) {
        case 'month': {
          const start = baseDate.clone().startOf('month').format('YYYY-MM-DD')
          const end = baseDate.clone().endOf('month').format('YYYY-MM-DD')
          return { start, end }
        }
        case 'week': {
          const weekStart = firstDay === 1 ? baseDate.clone().startOf('isoWeek') : baseDate.clone().startOf('week')
          const weekEnd = weekStart.clone().add(6, 'days')
          return { start: weekStart.format('YYYY-MM-DD'), end: weekEnd.format('YYYY-MM-DD') }
        }
        case 'day':
          return { start: baseDate.format('YYYY-MM-DD'), end: baseDate.format('YYYY-MM-DD') }
        default:
          return { start: '', end: '' }
      }
    }, [baseDate, view, firstDay])

    const getTitle = useCallback(() => {
      switch (view) {
        case 'month':
          return `Tháng ${baseDate.month() + 1}, ${baseDate.year()}`
        case 'week': {
          const weekStart = firstDay === 1 ? baseDate.clone().startOf('isoWeek') : baseDate.clone().startOf('week')
          const weekEnd = weekStart.clone().add(6, 'days')
          if (weekStart.month() === weekEnd.month()) {
            return `${weekStart.date()} – ${weekEnd.date()} Tháng ${weekEnd.month() + 1}, ${weekEnd.year()}`
          }
          return `${weekStart.date()} Tháng ${weekStart.month() + 1} – ${weekEnd.date()} Tháng ${weekEnd.month() + 1}, ${weekEnd.year()}`
        }
        case 'day': {
          const vnWeekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
          return `${vnWeekdays[baseDate.day()]}, ${baseDate.date()} Tháng ${baseDate.month() + 1}, ${baseDate.year()}`
        }
        default:
          return ''
      }
    }, [baseDate, view, firstDay])

    // Emit title + date range on navigation / view change
    useEffect(() => {
      onNavigate?.(getTitle())
      onDateRangeChange?.(getDateRange())
    }, [baseDate, view])

    const navigate = useCallback((direction: 'prev' | 'next' | 'today') => {
      if (direction === 'next') setSlideDirection('up')
      else if (direction === 'prev') setSlideDirection('down')
      else setSlideDirection(null)
      setNavKey(k => k + 1)
      setBaseDate((prev) => {
        if (direction === 'today') return moment()
        const delta = direction === 'prev' ? -1 : 1
        switch (view) {
          case 'month': return prev.clone().add(delta, 'month')
          case 'week': return prev.clone().add(delta, 'week')
          case 'day': return prev.clone().add(delta, 'day')
          default: return prev
        }
      })
    }, [view])

    useImperativeHandle(ref, () => ({
      prev: () => navigate('prev'),
      next: () => navigate('next'),
      today: () => navigate('today'),
      getTitle,
      getDateRange
    }), [navigate, getTitle, getDateRange])

    // Scroll navigation (Google Calendar style) — month view only
    const wheelCooldown = useRef(false)
    const handleWheel = useCallback((e: React.WheelEvent) => {
      if (view !== 'month') return
      if (wheelCooldown.current) return
      if (Math.abs(e.deltaY) < 30) return // ignore tiny scroll
      e.preventDefault()
      wheelCooldown.current = true
      navigate(e.deltaY > 0 ? 'next' : 'prev')
      setTimeout(() => { wheelCooldown.current = false }, 300)
    }, [view, navigate])

    return (
      <div className={`h-full flex flex-col bg-white dark:bg-gray-900 ${className || ''}`}
        style={{ fontFamily: "'Google Sans', 'Roboto', 'Arial', sans-serif" }}
        onWheel={handleWheel}
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bdc1c6; }
          .event-card { border: none; outline: none; }
          .event-card:hover { filter: brightness(0.92); }
          @keyframes cal-slide-up {
            from { opacity: 0; transform: translateX(60px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes cal-slide-down {
            from { opacity: 0; transform: translateX(-60px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>

        {view === 'month' && (
          <div
            key={`month-${navKey}`}
            className="flex-1 min-h-0"
            style={slideDirection ? {
              animation: `cal-slide-${slideDirection} 250ms cubic-bezier(0.4, 0, 0.2, 1) both`
            } : undefined}
          >
            <MonthView
              baseDate={baseDate}
              firstDay={firstDay}
              events={events}
              onDateClick={onDateClick}
              onEventClick={onEventClick}
            />
          </div>
        )}
        {view === 'week' && (
          <WeekView
            baseDate={baseDate}
            firstDay={firstDay}
            events={events}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        )}
        {view === 'day' && (
          <DayView
            baseDate={baseDate}
            events={events}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        )}
      </div>
    )
  }
)

CustomCalendar.displayName = 'CustomCalendar'
