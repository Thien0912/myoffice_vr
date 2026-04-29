import moment from 'moment'

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
  gotoDate: (date: string | moment.Moment, forceFlash?: boolean) => void
  getBaseDate: () => moment.Moment
}

export interface CustomCalendarProps {
  view: CalendarViewType
  events?: CalendarEvent[]
  lockedDates?: Set<string>
  timesheetRange?: { start: string; end: string } | null
  existingDates?: Set<string>
  onDateClick?: (dateStr: string) => void
  onEventClick?: (event: CalendarEvent, position?: { x: number; y: number }, element?: HTMLElement) => void
  onNavigate?: (title: string) => void
  onDateRangeChange?: (range: { start: string; end: string }) => void
  onBaseDateChange?: (date: moment.Moment) => void
  firstDay?: number // 0=Sun, 1=Mon
  className?: string
  canBypassLock?: boolean
}
