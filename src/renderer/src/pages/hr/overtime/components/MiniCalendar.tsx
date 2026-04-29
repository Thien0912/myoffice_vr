import { useMemo } from 'react'
import moment from 'moment'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@heroui/react'

interface MiniCalendarProps {
  currentDate: moment.Moment // The date currently active/selected in the main view
  viewingDate: moment.Moment // The month currently being viewed in the mini-calendar
  onDateClick: (date: moment.Moment) => void
  onViewingDateChange: (date: moment.Moment) => void
  eventDates?: Map<string, string[]>
  lockedDates?: Set<string>
  timesheetRange?: { start: string; end: string } | null
}

const WEEKDAYS = ['Cn', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// Tiny lock SVG (12x12)
const MiniLockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2">
    <path d="M12 1C9.24 1 7 3.24 7 6v2H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
  </svg>
)

export const MiniCalendar = ({
  currentDate,
  viewingDate,
  onDateClick,
  onViewingDateChange,
  eventDates,
  lockedDates,
  timesheetRange
}: MiniCalendarProps) => {
  const today = moment().format('YYYY-MM-DD')

  const { days } = useMemo(() => {
    const startOfMonth = viewingDate.clone().startOf('month')
    const startIdx = startOfMonth.day()
    const startObj = startOfMonth.clone().subtract(startIdx, 'days')
    const days: moment.Moment[] = []
    const current = startObj.clone()
    for (let i = 0; i < 42; i++) {
      days.push(current.clone())
      current.add(1, 'day')
    }
    return { days }
  }, [viewingDate])

  const handlePrevMonth = () => onViewingDateChange(viewingDate.clone().subtract(1, 'month'))
  const handleNextMonth = () => onViewingDateChange(viewingDate.clone().add(1, 'month'))

  return (
    <div className="w-[224px] select-none text-[#3c4043]" style={{ fontFamily: "'Google Sans', 'Roboto', 'Arial', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pl-2 pr-1">
        <div className="text-[14px] font-medium tracking-wide">
          Tháng {viewingDate.month() + 1}, {viewingDate.year()}
        </div>
        <div className="flex gap-1">
          <Button isIconOnly size="sm" variant="light" className="text-[#3c4043] hover:bg-[#f1f3f4] rounded-full w-7 h-7 min-w-7" onPress={handlePrevMonth}>
            <ChevronLeft size={16} />
          </Button>
          <Button isIconOnly size="sm" variant="light" className="text-[#3c4043] hover:bg-[#f1f3f4] rounded-full w-7 h-7 min-w-7" onPress={handleNextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day, i) => (
          <div key={i} className="text-center text-[11px] text-[#70757a] font-normal h-6 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      {/* Legend */}
      {timesheetRange && (
        <div className="flex items-center gap-3 px-1 mb-2 text-[10px] text-[#70757a]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            Đăng ký được
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            Đã khóa
          </span>
        </div>
      )}

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, i) => {
          const isCurrentMonth = day.month() === viewingDate.month()
          const isToday = day.isSame(moment(), 'day')
          const isSelected = day.isSame(currentDate, 'day')
          const dateStr = day.format('YYYY-MM-DD')
          const eventColors = eventDates?.get(dateStr) || []

          // Classify state
          // When timesheetRange is null: no open timesheet — treat ALL current-month dates as locked
          const noOpenTimesheet = timesheetRange === null || timesheetRange === undefined
          const isPast = dateStr < today
          const isLocked = noOpenTimesheet
            ? isCurrentMonth  // all current-month dates are locked when no open timesheet
            : (lockedDates?.has(dateStr) ?? false)
          const isInTimesheetRange = timesheetRange
            ? dateStr >= timesheetRange.start && dateStr <= timesheetRange.end
            : false
          const isTooOld = isPast && !isInTimesheetRange && !noOpenTimesheet
          const isRegisterable = !isLocked && isInTimesheetRange && isCurrentMonth

          // Base text color
          let textColor = '#3c4043'
          if (!isCurrentMonth) textColor = '#b0b5bb'
          if (isTooOld && isCurrentMonth) textColor = '#c0c4c8'
          if (isSelected) textColor = '#041e49'
          if (isToday && !isSelected) textColor = '#fff'

          // Ring/indicator style based on state
          const stateRing = isCurrentMonth && !isToday && !isSelected
            ? isLocked
              ? 'ring-1 ring-amber-400 bg-amber-50'
              : isTooOld
              ? ''  // dimmed, no ring
              : isRegisterable
              ? 'ring-1 ring-emerald-300 bg-emerald-50/60'
              : ''
            : ''

          return (
            <div key={i} className="flex flex-col justify-start items-center h-8 relative pt-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => onDateClick(day)}
                  title={
                    isLocked ? 'Ngày đã khóa'
                      : isTooOld ? 'Ngoài kỳ chấm công'
                      : isRegisterable ? 'Có thể đăng ký'
                      : ''
                  }
                  className={[
                    'w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-medium transition-all duration-150',
                    isSelected ? 'bg-[#d3e3fd]' : '',
                    isToday && !isSelected ? 'bg-[#1a73e8]' : '',
                    !isSelected && !isToday ? stateRing : '',
                    !isSelected && !isToday && !isLocked && !isTooOld ? 'hover:bg-emerald-100' : '',
                    !isSelected && !isToday && isLocked ? 'hover:bg-amber-100 cursor-not-allowed' : '',
                    !isSelected && !isToday && isTooOld ? 'cursor-default opacity-60' : '',
                    !isSelected && !isToday && !isLocked && !isTooOld ? 'cursor-pointer' : '',
                  ].filter(Boolean).join(' ')}
                  style={{ color: textColor }}
                >
                  {day.date()}
                </button>

                {/* Lock indicator dot — top-right of the number */}
                {isCurrentMonth && isLocked && !isToday && !isSelected && (
                  <span className="absolute -top-0.5 -right-0.5 text-amber-500 pointer-events-none">
                    <MiniLockIcon />
                  </span>
                )}
              </div>

              {/* Event dots — always show if events exist, regardless of lock state */}
              {eventColors.length > 0 && (
                <div className="flex gap-[2px] mt-px">
                  {eventColors.slice(0, 3).map((color, idx) => (
                    <div key={idx} className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
