import moment from 'moment'
import { useMemo } from 'react'

import { EventCard } from './EventCard'
import { HOURS, timeToMinutes, WEEKDAY_LABELS_APPLE } from './helpers'
import type { CalendarEvent } from './types'

export const DayView = ({
  baseDate,
  events,
  onDateClick,
  onEventClick
}: {
  baseDate: moment.Moment
  events: CalendarEvent[]
  onDateClick?: (dateStr: string) => void
  onEventClick?: (event: CalendarEvent, position?: { x: number; y: number }, element?: HTMLElement) => void
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
        <span className={`text-[11px] font-medium uppercase tracking-wider ${isToday ? 'text-[#ff3b30]' : 'text-[#70757a]'}`}>
          {WEEKDAY_LABELS_APPLE[baseDate.day()]}
        </span>
        <span
          className={`
            inline-flex items-center justify-center w-10 h-10 text-xl font-medium rounded-full
            ${isToday ? 'bg-[#ff3b30] text-white' : 'text-[#3c4043]'}
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
