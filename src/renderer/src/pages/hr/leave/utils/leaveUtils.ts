import { date as formatDate } from '@renderer/utils/formatDate'

export const getLeaveDateRange = (value: any[]) => {
  if (!Array.isArray(value) || value.length === 0) return { totalDays: 0, dateRangeDisplay: '---' }

  const sortedDates = [...value].sort(
    (a, b) => new Date(a.ngay_nghi).getTime() - new Date(b.ngay_nghi).getTime()
  )
  const totalDays = value.reduce((sum, item) => sum + (Number(item.so_ngay_nghi) || 0), 0)

  const first = sortedDates[0].ngay_nghi
  const last = sortedDates[sortedDates.length - 1].ngay_nghi

  let dateRangeDisplay = ''
  if (first === last) {
    dateRangeDisplay = formatDate('d/m/Y', first)
  } else {
    const day1 = formatDate('d', first)
    const month1 = formatDate('m', first)
    const year1 = formatDate('Y', first)
    const day2 = formatDate('d', last)
    const month2 = formatDate('m', last)
    const year2 = formatDate('Y', last)

    if (month1 === month2 && year1 === year2) {
      dateRangeDisplay = `${day1}-${day2}/${month1}/${year1}`
    } else if (year1 === year2) {
      dateRangeDisplay = `${day1}/${month1}-${day2}/${month2}/${year1}`
    } else {
      dateRangeDisplay = `${day1}/${month1}/${year1}-${day2}/${month2}/${year2}`
    }
  }

  return { totalDays, dateRangeDisplay }
}
