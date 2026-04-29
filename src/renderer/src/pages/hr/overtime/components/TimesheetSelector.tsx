import { Accordion, AccordionItem, Popover, PopoverContent, PopoverTrigger, Tooltip } from '@heroui/react'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { useNgoaiGioStore } from '@renderer/store/useNgoaiGioStore'
import { useQuery } from '@tanstack/react-query'
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

// Matches the backend hrm_bang_cham_cong_thang structure
export interface LockedDateRange {
  start: string  // YYYY-MM-DD
  end: string    // YYYY-MM-DD
  locked_at?: string
  locked_by?: string
}

export interface BangChamCong {
  id: string | number
  thang: string
  ten_bang: string
  ngay_bat_dau: string
  ngay_ket_thuc: string
  trang_thai: string
  locked_dates?: LockedDateRange[] | null
}

/** Format "2026-01-21 0:00:00" → "21/01/2026" */
function formatDateDisplay(raw: any): string {
  if (!raw) return ''
  const str = typeof raw === 'string' ? raw : String(raw)
  const datePart = str.includes('T') ? str.split('T')[0] : str.split(' ')[0]
  if (!datePart.includes('-')) return str
  const [y, m, d] = datePart.split('-')
  return `${d}/${m}/${y}`
}

interface TimesheetSelectorProps {
  calendarViewType?: 'week' | 'month'
}

export default function TimesheetSelector({ calendarViewType = 'month' }: TimesheetSelectorProps) {
  const { filter, setFilter } = useNgoaiGioStore()
  const [isOpen, setIsOpen] = useState(false)

  const { data: allData, isLoading } = useQuery({
    queryKey: ['hrmBangChamCongThangList'],
    queryFn: async () => {
      const response = await ngoaiGioAxios.getBangChamCongThang({
        start: 0,
        length: 24
      })
      return (response?.data?.data as BangChamCong[]) || []
    }
  })

  // Chỉ hiển thị bảng đang mở (trang_thai = MO)
  const data = useMemo(() => {
    return (allData || []).filter(t => t.trang_thai === 'MO')
  }, [allData])

  // Determine active timesheet based on id or dateRange filter
  const activeTimesheet = useMemo(() => {
    if (!data?.length) return null

    // Priority: match by id first
    if (filter.id_bang_cham_cong) {
      const byId = data.find((t) => String(t.id) === String(filter.id_bang_cham_cong))
      if (byId) return byId
    }

    // Fallback: match by dateRange
    if (filter.dateRange?.from && filter.dateRange?.to) {
      const matched = data.find(
        (t) =>
          t.ngay_bat_dau === filter.dateRange.from && t.ngay_ket_thuc === filter.dateRange.to
      )
      if (matched) return matched
    }
    return null
  }, [data, filter.dateRange, filter.id_bang_cham_cong])

  // Auto-select the most recent timesheet on mount or when id is missing
  useEffect(() => {
    if (!data?.length) return
    // Run if no dateRange set, OR dateRange is set but id_bang_cham_cong is missing
    const needsAutoSelect = !filter.dateRange?.from || !filter.id_bang_cham_cong
    if (!needsAutoSelect) return

    // Try to match existing dateRange to a timesheet
    if (filter.dateRange?.from && !filter.id_bang_cham_cong) {
      const matched = data.find(
        (t) =>
          t.ngay_bat_dau === filter.dateRange.from && t.ngay_ket_thuc === filter.dateRange.to
      )
      if (matched) {
        setFilter({ ...filter, id_bang_cham_cong: matched.id })
        return
      }
    }

    // Default: select the most recent
    const latest = data[0]
    setFilter({
      ...filter,
      id_bang_cham_cong: latest.id,
      dateRange: {
        from: latest.ngay_bat_dau,
        to: latest.ngay_ket_thuc
      }
    })
  }, [data, filter.dateRange?.from, filter.id_bang_cham_cong])

  const prevViewType = useRef(calendarViewType)
  useEffect(() => {
    if (prevViewType.current !== calendarViewType) {
      if (calendarViewType === 'week') {
        if (filter.dateRange?.from) {
          const fromD = new Date(filter.dateRange.from)
          const today = new Date()

          let targetDate = fromD
          if (activeTimesheet) {
            const endD = new Date(activeTimesheet.ngay_ket_thuc)
            if (today >= fromD && today <= endD) {
              targetDate = today
            }
          }

          const day = targetDate.getDay()
          const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1)
          targetDate.setDate(diff)

          const toD = new Date(targetDate)
          toD.setDate(targetDate.getDate() + 6)

          const formatLocal = (d: Date) => {
            const local = new Date(d)
            local.setMinutes(local.getMinutes() - local.getTimezoneOffset())
            return local.toISOString().split('T')[0]
          }

          setFilter({
            ...filter,
            dateRange: {
              from: formatLocal(targetDate),
              to: formatLocal(toD)
            }
          })
        }
      } else if (calendarViewType === 'month' && activeTimesheet) {
        setFilter({
          ...filter,
          dateRange: {
            from: activeTimesheet.ngay_bat_dau,
            to: activeTimesheet.ngay_ket_thuc
          }
        })
      }
      prevViewType.current = calendarViewType
    }
  }, [calendarViewType, activeTimesheet])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 animate-pulse">
        <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="w-24 h-4 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    )
  }

  if (!data?.length) return null

  const getShortDisplayText = (timesheet: BangChamCong): string => {
    const match = timesheet.ten_bang.match(/tháng\s+(\d{1,2}\/\d{4})/i)
    if (match) return `Tháng ${match[1]}`
    if (timesheet.ngay_bat_dau) {
      const datePart = timesheet.ngay_bat_dau.split(' ')[0]
      const [y, m] = datePart.split('-')
      return `Tháng ${parseInt(m)}/${y}`
    }
    return timesheet.ten_bang
  }

  const getWeekDisplayText = () => {
    if (!filter.dateRange?.from || !filter.dateRange?.to) return 'Chọn tuần'
    const fromStr = formatDateDisplay(filter.dateRange.from)
    const toStr = formatDateDisplay(filter.dateRange.to)
    return `Tuần: ${fromStr.slice(0, 5)} - ${toStr.slice(0, 5)}`
  }

  // To highlight active selections inside accordion
  const currentRange = { from: filter.dateRange?.from, to: filter.dateRange?.to }
  const isMonthSelected = (item: BangChamCong) =>
    item.id === filter.id_bang_cham_cong && currentRange.from === item.ngay_bat_dau && currentRange.to === item.ngay_ket_thuc

  const isWeekSelected = (item: BangChamCong, weekStart: string, weekEnd: string) =>
    item.id === filter.id_bang_cham_cong && currentRange.from === weekStart && currentRange.to === weekEnd

  const isCurrentViewMonth = activeTimesheet && isMonthSelected(activeTimesheet)

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      if (!data?.length) return;
      const today = new Date();
      const formatLocal = (d: Date) => {
        const local = new Date(d);
        local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
        return local.toISOString().split('T')[0];
      };
      const todayStr = formatLocal(today);

      // Tìm bảng công chứa ngày hôm nay (trong các bảng đang mở)
      let targetTimesheet = data.find(t => t.ngay_bat_dau <= todayStr && t.ngay_ket_thuc >= todayStr);
      if (!targetTimesheet) targetTimesheet = data[0]; // fallback nếu không thấy
      if (!targetTimesheet) return;

      if (calendarViewType === 'month') {
        setFilter({
          ...filter,
          id_bang_cham_cong: targetTimesheet.id,
          dateRange: {
            from: targetTimesheet.ngay_bat_dau,
            to: targetTimesheet.ngay_ket_thuc
          }
        });
      } else {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(today);
        weekStart.setDate(diff);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        setFilter({
          ...filter,
          id_bang_cham_cong: targetTimesheet.id,
          dateRange: {
            from: formatLocal(weekStart),
            to: formatLocal(weekEnd)
          }
        });
      }
      return;
    }

    if (isCurrentViewMonth) {
      if (!data?.length || !activeTimesheet) return
      const currentIndex = data.findIndex(t => String(t.id) === String(activeTimesheet.id))
      if (currentIndex === -1) return

      // Since later months are usually index 0, "prev" in terms of time means going to an older month => index + 1
      const newIndex = direction === 'prev' ? currentIndex + 1 : currentIndex - 1
      if (newIndex >= 0 && newIndex < data.length) {
        const selected = data[newIndex]
        setFilter({
          ...filter,
          id_bang_cham_cong: selected.id,
          dateRange: {
            from: selected.ngay_bat_dau,
            to: selected.ngay_ket_thuc
          }
        })
      }
    } else {
      // Week navigation
      if (!filter.dateRange?.from || !filter.dateRange?.to) return
      const fromD = new Date(filter.dateRange.from)
      const toD = new Date(filter.dateRange.to)

      const offset = direction === 'prev' ? -7 : 7
      fromD.setDate(fromD.getDate() + offset)
      toD.setDate(toD.getDate() + offset)

      const formatLocal = (d: Date) => {
        const local = new Date(d)
        local.setMinutes(local.getMinutes() - local.getTimezoneOffset())
        return local.toISOString().split('T')[0]
      }

      setFilter({
        ...filter,
        dateRange: {
          from: formatLocal(fromD),
          to: formatLocal(toD)
        }
      })
    }
  }

  const displayText = !isCurrentViewMonth
    ? getWeekDisplayText()
    : (activeTimesheet ? getShortDisplayText(activeTimesheet) : 'Chọn bảng công')

  const getWeeksForTimesheet = (timesheet: BangChamCong) => {
    const start = new Date(timesheet.ngay_bat_dau)
    const end = new Date(timesheet.ngay_ket_thuc)

    const weeks: Array<{ id: string; label: string; start: string; end: string }> = []
    const current = new Date(start)

    const currentDay = current.getDay()
    current.setDate(current.getDate() - currentDay + (currentDay === 0 ? -6 : 1))

    let weekIndex = 1
    while (current <= end) {
      const weekStart = new Date(current)
      const weekEnd = new Date(current)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const formatLocal = (d: Date) => {
        const local = new Date(d)
        local.setMinutes(local.getMinutes() - local.getTimezoneOffset())
        return local.toISOString().split('T')[0]
      }

      weeks.push({
        id: `week-${weekStart.getTime()}`,
        label: `Tuần ${weekIndex}`,
        start: formatLocal(weekStart),
        end: formatLocal(weekEnd)
      })

      current.setDate(current.getDate() + 7)
      weekIndex++
    }
    return weeks
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip content={calendarViewType === 'month' ? "Tháng trước" : "Tuần trước"} delay={500}>
        <button
          onClick={() => handleNavigate('prev')}
          className="flex flex-none items-center cursor-pointer justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>
      </Tooltip>

      <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start" classNames={{ content: 'p-0 min-w-[280px] overflow-hidden' }}>
        <PopoverTrigger>
          <div className="flex items-center justify-center gap-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1.5 cursor-pointer transition-all w-[220px]">
            <CalendarIcon size={16} className="text-gray-500 shrink-0" />
            <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200 truncate flex-1 text-center">
              {displayText}
            </span>
            <ChevronDown size={14} className="text-gray-500 shrink-0" />
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div className="w-full max-h-[350px] overflow-y-auto custom-scrollbar">
            <Accordion
              isCompact
              selectionMode="single"
              className="px-0"
              defaultExpandedKeys={activeTimesheet ? [activeTimesheet.id.toString()] : undefined}
              itemClasses={{
                base: "px-0 border-b border-gray-100 last:border-b-0",
                title: "text-sm font-semibold text-gray-800",
                trigger: "px-4 py-3 hover:bg-gray-50 data-[open=true]:bg-blue-50/30",
                content: "px-0 py-0 bg-gray-50 dark:bg-gray-800/50"
              }}
            >
              {data.map(item => (
                <AccordionItem
                  key={item.id.toString()}
                  title={item.ten_bang}
                  subtitle={
                    <span className="text-[11px] cursor-pointer text-gray-500 font-normal block mt-0.5">
                      {formatDateDisplay(item.ngay_bat_dau)} → {formatDateDisplay(item.ngay_ket_thuc)}
                    </span>
                  }
                >
                  <div className="flex flex-col border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setFilter({
                          ...filter,
                          id_bang_cham_cong: item.id,
                          dateRange: { from: item.ngay_bat_dau, to: item.ngay_ket_thuc }
                        })
                        setIsOpen(false)
                      }}
                      className={`cursor-pointer flex justify-between items-center text-left px-5 py-2.5 text-[13px] transition-colors ${isMonthSelected(item) ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                      <span>Cả tháng</span>
                    </button>
                    {getWeeksForTimesheet(item).map(week => {
                      const selected = isWeekSelected(item, week.start, week.end)
                      return (
                        <button
                          key={week.id}
                          onClick={() => {
                            setFilter({
                              ...filter,
                              id_bang_cham_cong: item.id,
                              dateRange: { from: week.start, to: week.end }
                            })
                            setIsOpen(false)
                          }}
                          className={`cursor-pointer flex justify-between items-center text-left px-5 py-2 hover:bg-gray-200 text-[13px] transition-colors ${selected ? 'bg-blue-100 text-blue-700' : ''
                            }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className={selected ? 'font-medium' : 'text-gray-700'}>{week.label}</span>
                            <span className="text-[11px] text-gray-500 opacity-80">{formatDateDisplay(week.start)} → {formatDateDisplay(week.end)}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </PopoverContent>
      </Popover>

      <Tooltip content={calendarViewType === 'month' ? "Tháng sau" : "Tuần sau"} delay={500}>
        <button
          onClick={() => handleNavigate('next')}
          className="flex flex-none items-center cursor-pointer justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </Tooltip>

      <button
        onClick={() => handleNavigate('today')}
        className="ml-1 px-3 py-1 h-8 cursor-pointer text-[13px] font-medium rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center shrink-0"
      >
        Hôm nay
      </button>
    </div>
  )
}
