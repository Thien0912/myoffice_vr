import { cn } from '@heroui/react'
import moment from 'moment'
import { useMemo, useRef } from 'react'

import { EventCard, LockIcon } from './EventCard'
import { getMonthGrid, reorderWeekdays } from './helpers'
import type { CalendarEvent } from './types'

export const MonthView = ({
  baseDate,
  firstDay,
  events,
  lockedDates,
  timesheetRange,
  existingDates,
  onDateClick,
  onEventClick,
  flashDate,
  canBypassLock
}: {
  baseDate: moment.Moment
  firstDay: number
  events: CalendarEvent[]
  lockedDates?: Set<string>
  timesheetRange?: { start: string; end: string } | null
  existingDates?: Set<string>
  onDateClick?: (dateStr: string) => void
  onEventClick?: (event: CalendarEvent, position?: { x: number; y: number }, element?: HTMLElement) => void
  flashDate?: string | null
  canBypassLock?: boolean
}) => {
  const today = moment().format('YYYY-MM-DD')
  const currentMonth = baseDate.month()
  const { days, rowCount } = useMemo(() => getMonthGrid(baseDate, firstDay), [baseDate, firstDay])
  const weekdayLabels = useMemo(() => reorderWeekdays(firstDay), [firstDay])

  const containerRef = useRef<HTMLDivElement>(null)

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    })
    return map
  }, [events])

  const MAX_VISIBLE_EVENTS = 1

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-white overflow-hidden">
      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 shrink-0 border-b border-[#e5e5ea] pb-2 pt-3">
        {weekdayLabels.map((lbl, idx) => {
          const colDay = (firstDay + idx) % 7
          const isTodayWeekday = colDay === moment().day()
          return (
            <div key={idx} className={`px-2 text-[12px] font-medium tracking-wide select-none ${isTodayWeekday ? 'text-[#ff3b30]' : 'text-[#8e8e93]'}`}>
              {lbl}
            </div>
          )
        })}
      </div>

      {/* Date grid */}
      <div
        className="grid grid-cols-7 flex-1 min-h-0"
        style={{ gridTemplateRows: `repeat(${rowCount}, 1fr)` }}
      >
        {days.map((day, idx) => {
          const dateStr = day.format('YYYY-MM-DD')
          const isToday = dateStr === today
          const isCurrentMonth = day.month() === currentMonth
          const isPast = dateStr < today
          const isLocked = lockedDates?.has(dateStr) ?? false
          const dayEvents = eventsByDate[dateStr] || []
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS)
          const isEdgeColumn = idx % 7 === 0 || idx % 7 === 6
          const isFlashed = dateStr === flashDate

          const isInTimesheetRange =
            timesheetRange
              ? dateStr >= timesheetRange.start && dateStr <= timesheetRange.end
              : !isPast
          const isTooOld = isPast && !isInTimesheetRange
          const isRegistered = existingDates?.has(dateStr) ?? false

          const eventCount = dayEvents.length
          const hoverLabel = isLocked
            ? { text: 'Đã khóa', bg: 'bg-amber-500' }
            : isTooOld
              ? { text: 'Ngoài kỳ', bg: 'bg-slate-400' }
              : isRegistered && eventCount > 0
                ? { text: `+${eventCount} đăng ký`, bg: 'bg-blue-500' }
                : { text: 'Đăng ký', bg: 'bg-emerald-500' }

          return (
            <div
              key={dateStr}
              onClick={() => {
                if ((!isLocked && !isTooOld) || canBypassLock) {
                  onDateClick?.(dateStr)
                }
              }}
              className={cn(
                "group relative flex flex-col overflow-visible transition-colors duration-150",
                idx < days.length - 7 ? "border-b border-[#e5e5ea]" : "",
                isEdgeColumn ? "bg-[#f9f9f9]" : "bg-white",
                isLocked ? (canBypassLock ? "cursor-pointer" : "cursor-not-allowed")
                  : isTooOld ? (canBypassLock ? "cursor-pointer" : "cursor-default")
                    : "cursor-pointer",
                !isLocked && !isTooOld && !isRegistered && "hover:bg-emerald-50/60",
                !isLocked && !isTooOld && isRegistered && "hover:bg-blue-50/60",
                isLocked && "hover:bg-amber-50/70",
                isTooOld && "hover:bg-slate-50",
                isFlashed ? "bg-blue-50/60! shadow-[inset_0_0_0_2px_#1a73e8] z-20" : "z-0"
              )}
            >
              {/* Hover badge */}
              <span className={cn(
                "absolute top-1 right-1 z-30 px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-white",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none select-none",
                hoverLabel.bg
              )}>
                {hoverLabel.text}
              </span>

              {/* Day Number */}
              <div className="flex flex-col items-start px-2 py-1.5 z-10 w-full">
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[28px] h-[28px] px-1 text-[15px] rounded-full leading-none select-none
                    ${isToday
                      ? 'bg-[#ff3b30] text-white font-medium'
                      : isCurrentMonth
                        ? isTooOld
                          ? 'text-[#b0b0b5] font-medium'
                          : 'text-[#1c1c1e] font-medium'
                        : 'text-[#d1d1d6] font-medium'
                    }
                  `}
                >
                  {day.date() === 1 && !isToday ? `${day.date()}, Thg ${day.month() + 1}` : day.date()}
                </span>
              </div>

              {/* Lock Overlay */}
              {isLocked && dayEvents.length === 0 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-amber-50/40">
                  <span className="text-amber-500 opacity-80 drop-shadow-sm">
                    <LockIcon />
                  </span>
                </div>
              )}
              {isLocked && dayEvents.length > 0 && (
                <div className="absolute top-1 left-1 z-20 pointer-events-none">
                  <span className="text-amber-500 opacity-60 drop-shadow-sm">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" aria-label="Ngày bị khóa">
                      <path d="M12 1C9.24 1 7 3.24 7 6v2H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
                    </svg>
                  </span>
                </div>
              )}

              {/* Events Area */}
              <div className="flex-1 flex flex-col gap-[2px] px-1 min-h-0 overflow-y-auto custom-scrollbar mt-1">
                {(!isLocked || dayEvents.length > 0) && visibleEvents.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    variant="month"
                    onClick={onEventClick}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
