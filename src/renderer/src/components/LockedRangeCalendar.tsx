import { RangeCalendar, toast, Button as ButtonV3 } from '@heroui-v3/react'
import { Tooltip } from '@heroui/react'
import { parseDate, DateValue } from '@internationalized/date'
import { Calendar, CircleHelp, Lock, Unlock } from 'lucide-react'
import { useMemo, useState } from 'react'

interface LockedRangeCalendarProps {
    lockedDates: { start: string; end: string }[]
    onLock: (start: string, end: string) => void
    onUnlock: (index: number) => void
    isLocking?: boolean
    title?: string
    description?: string
    compact?: boolean
    /** The full timesheet date range (ngay_bat_dau → ngay_ket_thuc) to display as info chip */
    timesheetRange?: { start: string; end: string }
}

export default function LockedRangeCalendar({
    lockedDates,
    onLock,
    onUnlock,
    isLocking = false,
    title = 'Khóa lịch đăng ký ngoài giờ',
    description = 'Click chọn khoảng thời gian để khóa/mở khóa',
    compact = false,
    timesheetRange
}: LockedRangeCalendarProps) {
    const [selectedRange, setSelectedRange] = useState<{ start: DateValue; end: DateValue } | null>(null)

    const isDateUnavailable = (date: DateValue) => {
        // Locked dates are unavailable
        return lockedDates.some((range) => {
            try {
                const start = parseDate(range.start.split('T')[0])
                const end = parseDate(range.end.split('T')[0])
                return date.compare(start) >= 0 && date.compare(end) <= 0
            } catch (e) {
                return false
            }
        })
    }

    // Compute min/max boundaries from timesheet range (no strikethrough)
    const calendarMinValue = useMemo(() => {
        if (!timesheetRange) return undefined
        try { return parseDate(timesheetRange.start.split('T')[0]) } catch { return undefined }
    }, [timesheetRange])

    const calendarMaxValue = useMemo(() => {
        if (!timesheetRange) return undefined
        try { return parseDate(timesheetRange.end.split('T')[0]) } catch { return undefined }
    }, [timesheetRange])

    const handleLockSelection = () => {
        if (!selectedRange) {
            toast('Vui lòng chọn khoảng thời gian trên lịch', { variant: 'danger' })
            return
        }

        onLock(selectedRange.start.toString(), selectedRange.end.toString())
        setSelectedRange(null)
    }

    // Format timesheet range for display
    const timesheetLabel = useMemo(() => {
        if (!timesheetRange) return null
        try {
            const start = new Date(timesheetRange.start)
            const end = new Date(timesheetRange.end)
            const fmt = (d: Date) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            return `${fmt(start)} — ${fmt(end)}`
        } catch {
            return null
        }
    }, [timesheetRange])

    return (
        <div className={`flex flex-col ${compact ? '' : ''}`}>
            {/* Section heading — Google style with icon */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#5f6368]" />
                    <span className="text-[13px] font-semibold text-[#202124] dark:text-gray-200">
                        {title}
                    </span>
                    <Tooltip content={description} placement="top" color="foreground">
                        <CircleHelp size={13} className="text-[#9aa0a6] cursor-help" />
                    </Tooltip>
                </div>
            </div>


            {/* Calendar — clean, no extra card wrapper */}
            <RangeCalendar
                aria-label="Chọn khoảng thời gian khóa"
                value={selectedRange}
                onChange={setSelectedRange}
                isDateUnavailable={isDateUnavailable}
                minValue={calendarMinValue}
                maxValue={calendarMaxValue}
                className="w-full [&_[data-disabled=true]]:[text-decoration:none!important] [&_[data-disabled=true]_span]:[text-decoration:none!important]"
            >
                <RangeCalendar.Header>
                    <RangeCalendar.Heading className="text-sm font-medium text-[#202124] dark:text-gray-100 capitalize" />
                    <RangeCalendar.NavButton slot="previous" />
                    <RangeCalendar.NavButton slot="next" />
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                    <RangeCalendar.GridHeader>
                        {(day) => (
                            <RangeCalendar.HeaderCell className="text-[12px] font-medium text-[#5f6368] dark:text-gray-400 pb-2">
                                {day}
                            </RangeCalendar.HeaderCell>
                        )}
                    </RangeCalendar.GridHeader>
                    <RangeCalendar.GridBody>
                        {(date) => {
                            const rangeIndex = lockedDates.findIndex((range) => {
                                try {
                                    const s = parseDate(range.start.split('T')[0])
                                    const e = parseDate(range.end.split('T')[0])
                                    return date.compare(s) >= 0 && date.compare(e) <= 0
                                } catch {
                                    return false
                                }
                            })



                            return (
                                <RangeCalendar.Cell date={date} className="text-[13px]">
                                    {({ formattedDate }) => {
                                        if (rangeIndex !== -1) {
                                            const lockedObj = lockedDates[rangeIndex]
                                            const start = parseDate(lockedObj.start.split('T')[0])
                                            const end = parseDate(lockedObj.end.split('T')[0])
                                            const isStart = date.compare(start) === 0
                                            const isEnd = date.compare(end) === 0

                                            let radiusClass = ''
                                            if (isStart && isEnd) radiusClass = 'rounded-full mx-1'
                                            else if (isStart) radiusClass = 'rounded-l-full ml-1 border-r-0'
                                            else if (isEnd) radiusClass = 'rounded-r-full mr-1 border-l-0'
                                            else radiusClass = 'rounded-none border-x-0'

                                            return (
                                                <div
                                                    className={`relative w-full h-[42px] flex items-center justify-center bg-danger-50 text-danger border border-danger-100 font-medium ${radiusClass}`}
                                                >
                                                    <span className="z-10">{formattedDate}</span>
                                                    {isEnd && (
                                                        <button
                                                            title="Mở khóa dải thời gian này"
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                onUnlock(rangeIndex)
                                                            }}
                                                            className="group pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 bg-danger hover:bg-danger-600 transition-colors text-white w-5 h-5 flex items-center justify-center rounded shadow cursor-pointer z-30"
                                                        >
                                                            <Lock
                                                                size={11}
                                                                strokeWidth={2.5}
                                                                className="block group-hover:hidden"
                                                            />
                                                            <Unlock
                                                                size={12}
                                                                strokeWidth={2.5}
                                                                className="hidden group-hover:block"
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        }



                                        return <span>{formattedDate}</span>
                                    }}
                                </RangeCalendar.Cell>
                            )
                        }}
                    </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
            </RangeCalendar>

            {/* Lock button — subtle, aligned right */}
            <div className="flex justify-end mt-4">
                <ButtonV3
                    variant="primary"
                    size="sm"
                    className="font-medium flex items-center gap-2 text-[13px] rounded-lg px-4"
                    isDisabled={!selectedRange}
                    isPending={isLocking}
                    onPress={handleLockSelection}
                >
                    {!isLocking && <Lock size={14} />}
                    <span>Khóa khoảng đã chọn</span>
                </ButtonV3>
            </div>
        </div>
    )
}
