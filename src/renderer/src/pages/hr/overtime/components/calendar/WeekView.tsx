import { cn } from '@heroui/react'
import moment from 'moment'
import { useMemo } from 'react'

import { EventCard, LockIcon } from './EventCard'
import { getWeekDays, HOURS, timeToMinutes, WEEKDAY_LABELS_APPLE } from './helpers'
import type { CalendarEvent } from './types'

export const WeekView = ({
  baseDate,
  firstDay,
  events,
  lockedDates,
  onDateClick,
  onEventClick,
  flashDate,
  canBypassLock
}: {
  baseDate: moment.Moment
  firstDay: number
  events: CalendarEvent[]
  lockedDates?: Set<string>
  onDateClick?: (dateStr: string) => void
  onEventClick?: (event: CalendarEvent, position?: { x: number; y: number }, element?: HTMLElement) => void
  flashDate?: string | null
  canBypassLock?: boolean
}) => {
  const today = moment().format('YYYY-MM-DD')
  const nowMinutes = moment().hours() * 60 + moment().minutes()
  const days = useMemo(() => getWeekDays(baseDate, firstDay), [baseDate, firstDay])

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
                <span className={`text-[11px] font-medium uppercase tracking-wider ${isToday ? 'text-[#ff3b30]' : 'text-[#70757a]'}`}>
                  {WEEKDAY_LABELS_APPLE[day.day()]}
                </span>
                <span
                  className={`
                    inline-flex items-center justify-center w-10 h-10 text-xl font-medium rounded-full mt-0.5
                    ${isToday ? 'bg-[#ff3b30] text-white' : 'text-[#3c4043]'}
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
            const isFlashed = dateStr === flashDate
            const isLocked = lockedDates?.has(dateStr) ?? false
            const dayEvents = eventsByDate[dateStr] || []

            return (
              <div
                key={dateStr}
                className={cn(
                  "flex-1 relative border-l border-[#e0e0e0] transition-colors duration-700",
                  isLocked ? (canBypassLock ? "cursor-pointer" : "cursor-not-allowed") : "",
                  isFlashed ? "bg-blue-50/20! shadow-[inset_0_0_0_2px_rgba(26,115,232,0.4)] z-20" : ""
                )}
                onClick={() => {
                  if (!isLocked || canBypassLock) {
                    onDateClick?.(dateStr)
                  }
                }}
              >
                {/* Lock Overlay */}
                {isLocked && dayEvents.length === 0 && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-amber-50/30">
                    <span className="text-amber-500 opacity-70 drop-shadow-sm">
                      <LockIcon />
                    </span>
                  </div>
                )}
                {isLocked && dayEvents.length > 0 && (
                  <div className="absolute top-1 left-1 z-20 pointer-events-none">
                    <span className="text-amber-500 opacity-50">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path d="M12 1C9.24 1 7 3.24 7 6v2H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
                      </svg>
                    </span>
                  </div>
                )}
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
