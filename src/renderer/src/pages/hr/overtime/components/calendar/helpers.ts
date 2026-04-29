import moment from 'moment'

/* ═══════════════════════════════
   Constants
═══════════════════════════════ */
export const WEEKDAY_LABELS_APPLE = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']
export const HOURS = Array.from({ length: 24 }, (_, i) => i) // 00:00 – 23:00

export const reorderWeekdays = (firstDay: number) => {
  const labels = [...WEEKDAY_LABELS_APPLE]
  return [...labels.slice(firstDay), ...labels.slice(0, firstDay)]
}

/* ═══════════════════════════════
   Helpers
═══════════════════════════════ */
export const getMonthGrid = (baseDate: moment.Moment, firstDay: number): { days: moment.Moment[]; rowCount: number } => {
  const startOfMonth = baseDate.clone().startOf('month')
  const endOfMonth = baseDate.clone().endOf('month')

  let gridStart = startOfMonth.clone().startOf('week')
  if (firstDay === 1) {
    gridStart = startOfMonth.clone().startOf('isoWeek')
  }

  const daysFromGridStartToEndOfMonth = endOfMonth.diff(gridStart, 'days') + 1
  const rowCount = Math.ceil(daysFromGridStartToEndOfMonth / 7)
  const totalCells = rowCount * 7

  const days: moment.Moment[] = []
  const cursor = gridStart.clone()
  for (let i = 0; i < totalCells; i++) {
    days.push(cursor.clone())
    cursor.add(1, 'day')
  }
  return { days, rowCount }
}

export const getWeekDays = (baseDate: moment.Moment, firstDay: number): moment.Moment[] => {
  let weekStart: moment.Moment
  if (firstDay === 1) {
    weekStart = baseDate.clone().startOf('isoWeek')
  } else {
    weekStart = baseDate.clone().startOf('week')
  }
  return Array.from({ length: 7 }, (_, i) => weekStart.clone().add(i, 'day'))
}

export const timeToMinutes = (time: string): number => {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}
