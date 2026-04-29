import { useMemo } from 'react'
import { OvertimeRequest } from '../types'

export interface MonthCalendarDay {
  dateStr: string // "YYYY-MM-DD"
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  requests: OvertimeRequest[]
  units: Record<string, { count: number, employees: OvertimeRequest[], hasPending: boolean, unitName: string }>
}

export function useMonthCalendarData(
  data: OvertimeRequest[],
  startDate: Date,
  endDate: Date
) {
  // Generate a flat array of days covering the full month grid
  const calendarDays = useMemo(() => {
    // To support flexible date ranges, we base the grid on startDate and endDate directly.
    const activeStart = new Date(startDate)
    activeStart.setHours(0, 0, 0, 0)
    const activeEnd = new Date(endDate)
    activeEnd.setHours(0, 0, 0, 0)

    let visualStart = new Date(activeStart)
    let visualEnd = new Date(activeEnd)

    // For short ranges (like 1 week), expand visual boundaries to the full natural calendar month
    const diffDays = (activeEnd.getTime() - activeStart.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays <= 28) {
      visualStart = new Date(activeStart.getFullYear(), activeStart.getMonth(), 1)
      visualEnd = new Date(activeStart.getFullYear(), activeStart.getMonth() + 1, 0)
    }

    // Find first Monday for the start of the grid
    const firstDay = new Date(visualStart)
    const startDayOfWeek = firstDay.getDay() // 0 = Sunday
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1
    firstDay.setDate(firstDay.getDate() - offset)

    // Find last Sunday for the end of the grid
    const endDayOfWeek = visualEnd.getDay()
    const lastDay = new Date(visualEnd)
    const endOffset = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek
    lastDay.setDate(lastDay.getDate() + endOffset)

    const list: MonthCalendarDay[] = []
    const currentIter = new Date(firstDay)
    
    // Correctly get exactly 2026-04-09 from `Date`
    const today = new Date()
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
    const todayStr = today.toISOString().split('T')[0]

    while (currentIter <= lastDay) {
      // Local ISO string hack to avoid timezone mismatch
      const temp = new Date(currentIter)
      temp.setMinutes(temp.getMinutes() - temp.getTimezoneOffset())
      const dateStr = temp.toISOString().split('T')[0]

      list.push({
        dateStr,
        date: new Date(currentIter),
        isCurrentMonth: currentIter >= activeStart && currentIter <= activeEnd,
        isToday: dateStr === todayStr,
        requests: [],
        units: {}
      })
      currentIter.setDate(currentIter.getDate() + 1)
    }
    return list
  }, [startDate, endDate])

  // Map the requests into the calendar days
  const groupedData = useMemo(() => {
    const finalDays = calendarDays.map(d => ({...d, requests: [...d.requests], units: { ...d.units }}))
    const finalDayMap = new Map(finalDays.map(d => [d.dateStr, d]))

    data.forEach(req => {
      const reqDateStr = req.ngay_dang_ky?.substring(0, 10)
      if (reqDateStr && finalDayMap.has(reqDateStr)) {
        const day = finalDayMap.get(reqDateStr)!
        day.requests.push(req)
        
        const unitName = req.ten_don_vi || 'Khác'
        if (!day.units[unitName]) {
          day.units[unitName] = { count: 0, employees: [], hasPending: false, unitName }
        }
        
        day.units[unitName].employees.push(req)
        day.units[unitName].hasPending = day.units[unitName].hasPending || req.trang_thai_tong === 'Cho_duyet'
        
        // Count unique employees to avoid double counting multiple shifts of the same person
        const uniqueEmpIds = new Set(day.units[unitName].employees.map(e => e.id_nhan_vien))
        day.units[unitName].count = uniqueEmpIds.size
      }
    })

    // Optionally Sort the units so highest count is first or alphabetical
    finalDays.forEach(day => {
       const sortedUnitsEntries = Object.entries(day.units).sort((a, b) => b[1].count - a[1].count)
       // Reconstruct object
       day.units = Object.fromEntries(sortedUnitsEntries)
    })

    return finalDays
  }, [data, calendarDays])

  return { calendarDays: groupedData }
}
