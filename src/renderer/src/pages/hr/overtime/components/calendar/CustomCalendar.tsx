import moment from 'moment'
import 'moment/locale/vi'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { DayView } from './DayView'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import type { CustomCalendarProps, CustomCalendarRef } from './types'

export const CustomCalendar = forwardRef<CustomCalendarRef, CustomCalendarProps>(
  ({ view, events = [], lockedDates, timesheetRange, existingDates, onDateClick, onEventClick, onNavigate, onDateRangeChange, onBaseDateChange, firstDay = 1, className, canBypassLock }, ref) => {
    const [baseDate, setBaseDate] = useState(() => moment())
    const [slideDirection, setSlideDirection] = useState<'up' | 'down' | null>(null)
    const [navKey, setNavKey] = useState(0)
    const [flashDate, setFlashDate] = useState<string | null>(null)

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

    const callbacksRef = useRef({ onNavigate, onDateRangeChange, onBaseDateChange })
    useEffect(() => {
      callbacksRef.current = { onNavigate, onDateRangeChange, onBaseDateChange }
    }, [onNavigate, onDateRangeChange, onBaseDateChange])

    useEffect(() => {
      callbacksRef.current.onNavigate?.(getTitle())
      callbacksRef.current.onDateRangeChange?.(getDateRange())
      callbacksRef.current.onBaseDateChange?.(baseDate)
    }, [baseDate, view, getTitle, getDateRange])

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

    const gotoDate = useCallback((date: string | moment.Moment, forceFlash = true) => {
      const targetDate = moment(date)
      setBaseDate(prev => {
        if (!prev.isSame(targetDate, 'month')) {
          setSlideDirection(targetDate.isAfter(prev) ? 'up' : 'down')
          setNavKey(k => k + 1)
        } else {
          setSlideDirection(null)
        }
        return targetDate
      })
      if (forceFlash) {
        setFlashDate(targetDate.format('YYYY-MM-DD'))
        setTimeout(() => setFlashDate(null), 1200)
      }
    }, [])

    useImperativeHandle(ref, () => ({
      prev: () => navigate('prev'),
      next: () => navigate('next'),
      today: () => navigate('today'),
      getTitle,
      getDateRange,
      gotoDate,
      getBaseDate: () => baseDate
    }), [navigate, getTitle, getDateRange, gotoDate, baseDate])

    // Scroll navigation (Google Calendar style) — month view only
    const wheelCooldown = useRef(false)
    const handleWheel = useCallback((e: React.WheelEvent) => {
      if (view !== 'month') return
      if (wheelCooldown.current) return
      if (Math.abs(e.deltaY) < 30) return
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
          .event-card:hover { filter: brightness(1.06); }
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
              lockedDates={lockedDates}
              timesheetRange={timesheetRange}
              existingDates={existingDates}
              onDateClick={onDateClick}
              onEventClick={onEventClick}
              flashDate={flashDate}
              canBypassLock={canBypassLock}
            />
          </div>
        )}
        {view === 'week' && (
          <WeekView
            baseDate={baseDate}
            firstDay={firstDay}
            events={events}
            lockedDates={lockedDates}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            flashDate={flashDate}
            canBypassLock={canBypassLock}
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
