import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  RangeCalendar
} from '@heroui-v3/react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { parseDate } from '@internationalized/date'

export interface EmployeeOvertimeToolbarProps {
  dateRange: { from: string; to: string }
  onDateRangeChange: (range: { from: string; to: string }) => void
}

export default function EmployeeOvertimeToolbar({
  dateRange,
  onDateRangeChange
}: EmployeeOvertimeToolbarProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [tempRange, setTempRange] = useState<{ from: string; to: string }>(dateRange)

  useEffect(() => {
    if (isPopoverOpen) {
      setTempRange(dateRange)
    }
  }, [isPopoverOpen, dateRange])

  const formatShortDate = (dateStr: string): string => {
    if (!dateStr) return 'Ngày'
    const parts = dateStr.split(' ')[0].split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`
    }
    return dateStr
  }

  const shiftDays = (dateStr: string, days: number): string => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    d.setDate(d.getDate() + days)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }

  const navigatePrevWeek = (): void => {
    onDateRangeChange({
      from: shiftDays(dateRange.from, -7),
      to: shiftDays(dateRange.to, -7)
    })
  }

  const navigateNextWeek = (): void => {
    onDateRangeChange({
      from: shiftDays(dateRange.from, 7),
      to: shiftDays(dateRange.to, 7)
    })
  }

  const navigateToToday = (): void => {
    const today = new Date()
    const day = today.getDay()
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1)
    const start = new Date(today)
    start.setDate(diffToMonday)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    const fmt = (d: Date): string => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${dd}`
    }
    onDateRangeChange({ from: fmt(start), to: fmt(end) })
  }

  return (
    <div className="flex items-center gap-1">
      {/* Date Navigator */}
      <Button variant="outline" size="sm" className="font-medium h-8" onPress={navigateToToday}>
        Hôm nay
      </Button>

      <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-8 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={navigatePrevWeek}
          className="px-2 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-r border-gray-200 dark:border-gray-700"
          title="Lùi 7 ngày"
        >
          <ChevronLeft size={16} />
        </button>

        <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger>
            <button className="px-3 flex items-center justify-center min-w-[130px] hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors outline-none h-full">
              <Calendar size={14} className="text-gray-500 mr-2" />
              <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                {formatShortDate(dateRange.from)} - {formatShortDate(dateRange.to)}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent placement="bottom" offset={10}>
            <Popover.Arrow />
            <div className="flex flex-col gap-5 p-4 min-w-[280px]">
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
                  if (range) {
                    setTempRange({
                      from: range.start.toString(),
                      to: range.end.toString()
                    })
                  } else {
                    setTempRange({ from: '', to: '' })
                  }
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
              <div className="flex justify-between items-center mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-medium text-gray-500"
                  onPress={() => setIsPopoverOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="font-bold px-5"
                  onPress={() => {
                    onDateRangeChange(tempRange)
                    setIsPopoverOpen(false)
                  }}
                  isDisabled={!tempRange.from || !tempRange.to}
                >
                  Áp dụng
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <button
          onClick={navigateNextWeek}
          className="px-2 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-l border-gray-200 dark:border-gray-700"
          title="Tiến 7 ngày"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
