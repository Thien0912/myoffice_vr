import { date as formatDate } from './formatDate'

/**
 * Format danh sách ngày nghỉ theo yêu cầu:
 * - 1 ngày: DD/MM/YYYY
 * - Nửa ngày: Sáng/Chiều DD/MM/YYYY
 * - Nhiều ngày cùng tháng (không liền kề): DD, DD/MM/YYYY
 * - Chuỗi ngày liền kề: DD-DD/MM/YYYY
 */
export function formatLeaveDates(chiTiet: any[]): string {
    if (!chiTiet || chiTiet.length === 0) return ''

    // Sắp xếp ngày tăng dần
    const sorted = [...chiTiet].sort(
        (a, b) => new Date(a.ngay_nghi).getTime() - new Date(b.ngay_nghi).getTime()
    )

    // Trường hợp chỉ có 1 bản ghi
    if (sorted.length === 1) {
        const item = sorted[0]
        const dStr = formatDate('d/m/Y', item.ngay_nghi)
        if (item.buoi_nghi === 'Sang') return `Sáng ${dStr}`
        if (item.buoi_nghi === 'Chieu') return `Chiều ${dStr}`
        return dStr
    }

    // Nhóm theo Tháng/Năm
    const groups: { [key: string]: any[] } = {}
    sorted.forEach((item) => {
        const d = new Date(item.ngay_nghi)
        const key = `${d.getMonth() + 1}/${d.getFullYear()}`
        if (!groups[key]) groups[key] = []
        groups[key].push(item)
    })

    const resultParts: string[] = []

    // Xử lý từng nhóm Tháng/Năm
    Object.keys(groups).forEach((key) => {
        const items = groups[key]
        const [month, year] = key.split('/')

        const dayRanges: string[] = []
        let startIdx = 0

        for (let i = 0; i < items.length; i++) {
            // Kiểm tra xem ngày tiếp theo có liền kề không
            const current = new Date(items[i].ngay_nghi)
            const next = items[i + 1] ? new Date(items[i + 1].ngay_nghi) : null

            const isConsecutive =
                next && (next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24) === 1

            if (!isConsecutive) {
                // Kết thúc một chuỗi (hoặc chỉ có 1 ngày lẻ)
                const startDay = new Date(items[startIdx].ngay_nghi).getDate().toString().padStart(2, '0')
                const endDay = current.getDate().toString().padStart(2, '0')

                if (startIdx === i) {
                    dayRanges.push(startDay)
                } else {
                    dayRanges.push(`${startDay}-${endDay}`)
                }
                startIdx = i + 1
            }
        }

        resultParts.push(`${dayRanges.join(', ')}/${month.padStart(2, '0')}/${year}`)
    })

    return resultParts.join('; ')
}
