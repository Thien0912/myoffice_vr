export function date(format: string = 'Y-m-d H:i:s', dateInput?: string | number | Date): string {
  let date: Date

  if (!dateInput) {
    date = new Date() // nếu không truyền thì lấy hiện tại
  } else if (typeof dateInput === 'number') {
    // Nếu truyền timestamp (seconds hoặc ms)
    date = new Date(dateInput.toString().length === 10 ? dateInput * 1000 : dateInput)
  } else {
    date = new Date(dateInput)
  }

  if (isNaN(date.getTime())) return 'Invalid Date'

  if (['vn', 'vi'].includes(format)) {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const nowYear = new Date().getFullYear()
    return year === nowYear ? `${day} tháng ${month}` : `${day} tháng ${month}, ${year}`
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  const map: Record<string, string> = {
    // Date
    d: pad(date.getDate()),
    D: date.toLocaleString('en-US', { weekday: 'short' }),
    j: String(date.getDate()),
    l: date.toLocaleString('en-US', { weekday: 'long' }),
    N: String(date.getDay() === 0 ? 7 : date.getDay()),
    w: String(date.getDay()),
    z: String(
      Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
    ),
    // Month
    m: pad(date.getMonth() + 1),
    n: String(date.getMonth() + 1),
    M: date.toLocaleString('en-US', { month: 'short' }),
    F: date.toLocaleString('en-US', { month: 'long' }),
    t: String(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()),
    // Year
    Y: String(date.getFullYear()),
    y: String(date.getFullYear()).slice(-2),
    // Time
    H: pad(date.getHours()),
    h: pad(((date.getHours() + 11) % 12) + 1),
    i: pad(date.getMinutes()),
    s: pad(date.getSeconds()),
    a: date.getHours() < 12 ? 'am' : 'pm',
    A: date.getHours() < 12 ? 'AM' : 'PM'
  }

  return format.replace(/[dDjlNwzmnMFtYyHhisAa]/g, (token) => map[token] ?? token)
}

export function timeAgo(input: string | number | Date): string {
  const now = new Date()
  const date =
    typeof input === 'number'
      ? new Date(input.toString().length === 10 ? input * 1000 : input)
      : new Date(input)

  if (isNaN(date.getTime())) return ''

  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diffSeconds < 5) return 'Vừa xong'

  const minutes = Math.floor(diffSeconds / 60)
  const hours = Math.floor(diffSeconds / 3600)
  const days = Math.floor(diffSeconds / 86400)

  // Nếu khác năm → hiển thị đầy đủ ngày giờ
  if (now.getFullYear() !== date.getFullYear()) {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()} ${date
        .getHours()
        .toString()
        .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // Nếu quá 7 ngày → hiển thị dạng "dd/mm HH:mm"
  if (days > 7) {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
  }

  // Hiển thị ngắn gọn
  if (days > 0) return `${days} ngày trước`
  if (hours > 0) return `${hours} giờ trước`
  if (minutes > 0) return `${minutes} phút trước`
  return `${diffSeconds} giây trước`
}
