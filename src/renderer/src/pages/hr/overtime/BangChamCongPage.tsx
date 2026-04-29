import { Button, cn, Popover, PopoverContent, PopoverTrigger, toast } from '@heroui-v3/react'
import { mapDonviGroupedOptionsV2 } from '@renderer/api/danhmuc/DonviAxios'
import { bangChamCongAxios } from '@renderer/api/hr/bangChamCongAxios'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useBreakpoint } from '@renderer/hooks/useBreakpoint'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ChamCongExportModal from './components/ChamCongExportModal'
import ChamCongMobileList from './components/ChamCongMobileList'
import ChamCongSummaryCards from './components/ChamCongSummaryCards'
import ChamCongTabs from './components/ChamCongTabs'
import ChamCongToolbar from './components/ChamCongToolbar'
import { EmployeeDetailDrawer } from './components/EmployeeDetailDrawer'
import { useNgoaiGioPermissions } from './hooks/useNgoaiGioPermissions'
import { ChamCongFilter, ChamCongRecord } from './types/BangChamCongTypes'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const DAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

const fmtDate = (raw: string) => {
  if (!raw) return ''
  const [y, m, d] = raw.split('-')
  const dateStr = `${d}/${m}/${y}`

  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
  if (isNaN(dateObj.getTime())) return dateStr

  const dayName = DAYS[dateObj.getDay()]
  return `${dateStr} (${dayName})`
}

const fmtMinutes = (mins: number) => {
  if (!mins || mins === 0) return null
  return `${Math.round(mins)} phút`
}

/**
 * Xác định ca làm việc (sáng/chiều) dựa trên thời gian chấm so với ca làm việc
 * @param punchTime - Thời gian chấm công (HH:mm)
 * @param ca_check_in - Thời điểm bắt đầu ca sáng
 * @param ca_ket_thuc_check_in - Thời điểm kết thúc check-in sáng (trước giờ nghỉ trưa)
 * @param ca_bat_dau_check_out - Thời điểm bắt đầu check-out chiều (sau giờ nghỉ trưa)
 * @returns 'morning' | 'afternoon'
 */
const detectShiftPeriod = (
  punchTime: string | null | undefined,
  ca_check_in: string | null | undefined,
  ca_ket_thuc_check_in: string | null | undefined,
  ca_bat_dau_check_out: string | null | undefined
): 'morning' | 'afternoon' => {
  if (!punchTime || punchTime === '-') {
    return 'morning' // default
  }

  // Convert HH:mm to minutes for comparison
  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const punchMinutes = timeToMinutes(punchTime)

  // Nếu có đủ thông tin ca làm việc thì phân loại chính xác
  if (ca_check_in && ca_ket_thuc_check_in && ca_bat_dau_check_out) {
    const morningStartMinutes = timeToMinutes(ca_check_in)
    const morningEndMinutes = timeToMinutes(ca_ket_thuc_check_in)
    const afternoonStartMinutes = timeToMinutes(ca_bat_dau_check_out)

    // Nếu chấm trong khoảng [ca_check_in, ca_ket_thuc_check_in] → Ca sáng
    if (punchMinutes >= morningStartMinutes && punchMinutes <= morningEndMinutes) {
      return 'morning'
    }

    // Nếu chấm sau ca_bat_dau_check_out → Ca chiều
    if (punchMinutes >= afternoonStartMinutes) {
      return 'afternoon'
    }

    // Nếu chấm trong khoảng giữa (giờ nghỉ trưa) → xem gần ca nào hơn
    const distanceToMorningEnd = Math.abs(punchMinutes - morningEndMinutes)
    const distanceToAfternoonStart = Math.abs(punchMinutes - afternoonStartMinutes)

    return distanceToMorningEnd < distanceToAfternoonStart ? 'morning' : 'afternoon'
  }

  // Fallback: nếu không có thông tin ca, dựa vào giờ thông thường
  // Trước 12:00 → sáng, sau 12:00 → chiều
  return punchMinutes < 12 * 60 ? 'morning' : 'afternoon'
}

/**
 * Format work time luôn hiển thị dưới dạng HH:mm (giờ:phút)
 */
const formatWorkTime = (hours: number): string => {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60

  // Format HH:mm
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/**
 * Kiểm tra xem có nên hiển thị trạng thái thiếu chấm công hay không
 * Chỉ hiển thị sau khi kết thúc buổi (sáng hoặc chiều)
 */
const shouldShowMissingStatus = (ngayChamCong: string, shiftType: 'sang' | 'chieu'): boolean => {
  if (!ngayChamCong) return true // Nếu không có ngày, hiển thị luôn (fallback)

  // Parse ngày chấm công (format: YYYY-MM-DD)
  const [year, month, day] = ngayChamCong.split('-').map(Number)
  const chamCongDate = new Date(year, month - 1, day)
  chamCongDate.setHours(0, 0, 0, 0) // Reset to start of day

  // Lấy ngày hiện tại
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  today.setHours(0, 0, 0, 0) // Reset to start of day

  // Nếu là ngày trong quá khứ, hiển thị trạng thái đầy đủ
  if (chamCongDate < today) {
    return true
  }

  // Nếu không phải ngày hôm nay, không hiển thị (ngày tương lai)
  if (chamCongDate.getTime() !== today.getTime()) {
    return false
  }

  // Nếu là ngày hôm nay, kiểm tra giờ hiện tại
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinutes

  if (shiftType === 'sang') {
    // Chỉ hiển thị thiếu chấm công sáng sau 13:00 (780 phút)
    return currentTimeInMinutes >= 780 // 13:00
  } else {
    // Chỉ hiển thị thiếu chấm công chiều sau 17:00 (1020 phút)
    return currentTimeInMinutes >= 1020 // 17:00
  }
}

// ---------------------------------------------------------------------------
// Column definitions factory
// ---------------------------------------------------------------------------
const createColumns = (
  onViewEmployee?: (id: number) => void
): TableColumnType<ChamCongRecord>[] => [
    {
      name: 'STT',
      uid: 'stt',
      width: 56,
      // render: (_: unknown, _row?: ChamCongRecord, index?: number) => (
      //   <span className="text-gray-500 dark:text-gray-400 text-xs">{(index ?? 0) + 1}</span>
      // )
    },
    {
      name: 'Họ và tên',
      uid: 'ho_va_ten',
      width: 280,
      render: (_: unknown, row?: ChamCongRecord) => {
        console.log(`row:::`, row)
        if (!row) return null
        return (
          <div className="flex flex-col min-w-0 py-1">
            <div className="flex items-center gap-1 min-w-0">
              <span
                className={cn(
                  "text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate",
                  onViewEmployee && "cursor-pointer hover:text-[#004493] hover:underline"
                )}
                onClick={(e) => {
                  const empId = row.id_nhan_vien as number | undefined

                  // console.log(`empId:::`, { empId, row })
                  if (onViewEmployee && empId) {
                    e.stopPropagation()
                    onViewEmployee(empId)
                  }
                }}
              >
                {row.ho_va_ten}
              </span>
              <span className="text-[12px] text-gray-500 font-normal shrink-0">
                ({row.ten_chuc_vu || row.ma_nhan_vien})
              </span>
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {row.ten_don_vi}
            </span>
          </div>
        )
      }
    },
    {
      name: 'Ngày chấm công',
      uid: 'ngay_cham_cong',
      width: 150,
      render: (_: unknown, row?: ChamCongRecord) => {
        if (!row) return null

        // Phát hiện ngày Chủ nhật (nếu BE chưa trả về is_sunday)
        const isSunday = row.is_sunday || (row.ngay_cham_cong && new Date(row.ngay_cham_cong).getDay() === 0)

        // Lấy 4 lần chấm công từ dữ liệu thực tế
        const punch1 = row.punch_1 || '-'
        const punch2 = row.punch_2 || '-'
        const punch3 = row.punch_3 || '-'
        const punch4 = row.punch_4 || '-'

        // Đối với Chủ nhật, tìm giờ Out cuối cùng thực tế (không hiển thị dấu -)
        const lastOut = isSunday
          ? (punch4 && punch4 !== '-' ? punch4 : (punch3 && punch3 !== '-' ? punch3 : (punch2 && punch2 !== '-' ? punch2 : '-')))
          : punch4

        // Lấy thời gian hiệu lực (đã điều chỉnh theo quy định)
        const effectivePunch1 = row.gio_vao_sang_hieu_luc || punch1
        const effectivePunch2 = row.gio_ra_sang_hieu_luc || punch2
        const effectivePunch3 = row.gio_vao_chieu_hieu_luc || punch3
        const effectivePunch4 = row.gio_ra_chieu_hieu_luc || punch4

        // Xác định In/Out hiển thị dựa vào nghỉ phép  
        let displayIn = punch1
        let displayOut = lastOut

        if (row.nghi_phep_sang && !row.nghi_phep_chieu) {
          // Nghỉ sáng, chỉ làm chiều → hiển thị In/Out ca chiều (dùng hiệu lực)
          displayIn = row.gio_vao_chieu_hieu_luc || punch1  // fallback nếu chưa có dữ liệu hiệu lực
          displayOut = row.gio_ra_chieu_hieu_luc || punch2  // fallback nếu chưa có dữ liệu hiệu lực
          // Xử lý case chưa checkout
          if (!displayOut || displayOut === '-' || displayOut === null) displayOut = '-'
        } else if (row.nghi_phep_chieu && !row.nghi_phep_sang) {
          // Nghỉ chiều, chỉ làm sáng → hiển thị In/Out ca sáng (dùng hiệu lực)
          displayIn = row.gio_vao_sang_hieu_luc || punch1
          displayOut = row.gio_ra_sang_hieu_luc || punch2
          if (!displayOut || displayOut === '-' || displayOut === null) displayOut = '-'
        }
        // Nếu nghỉ cả ngày hoặc không nghỉ → giữ logic cũ (displayIn/displayOut đã được gán)

        // Nhóm các lần chấm theo ca (sử dụng thời gian hiệu lực)
        const morningPunches: Array<{ label: string; time: string; type: 'in' | 'out' }> = []
        const afternoonPunches: Array<{ label: string; time: string; type: 'in' | 'out' }> = []
        const sundayPunches: Array<{ label: string; time: string; type: 'in' | 'out' }> = []

        // Nếu là Chủ nhật, nhóm tất cả vào 1 nhóm duy nhất
        if (isSunday) {
          if (punch1 !== '-') sundayPunches.push({ label: 'In', time: effectivePunch1, type: 'in' })
          if (punch2 !== '-') sundayPunches.push({ label: 'Out', time: effectivePunch2, type: 'out' })
          if (punch3 !== '-') sundayPunches.push({ label: 'In', time: effectivePunch3, type: 'in' })
          if (punch4 !== '-') sundayPunches.push({ label: 'Out', time: effectivePunch4, type: 'out' })
        } else {
          // Ngày thường: punch_1 và punch_2 luôn là CA SÁNG, punch_3 và punch_4 luôn là CA CHIỀU
          if (punch1 !== '-') morningPunches.push({ label: 'In', time: effectivePunch1, type: 'in' })
          if (punch2 !== '-') morningPunches.push({ label: 'Out', time: effectivePunch2, type: 'out' })
          if (punch3 !== '-') afternoonPunches.push({ label: 'In', time: effectivePunch3, type: 'in' })
          if (punch4 !== '-') afternoonPunches.push({ label: 'Out', time: effectivePunch4, type: 'out' })
        }

        return (
          <Popover>
            <PopoverTrigger>
              <button className="flex flex-col min-w-0 text-left outline-none p-1 -m-1 cursor-pointer">
                <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  {fmtDate(row.ngay_cham_cong)}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {displayIn} → {displayOut}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Popover.Arrow />
              <div className="flex flex-col min-w-[200px] rounded-[inherit] overflow-hidden">
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/20">
                  <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                    Lịch sử Check-in/out
                  </span>
                </div>

                <div className="p-2 flex flex-col gap-1.5">
                  {/* Chủ nhật: hiển thị tất cả lần chấm trong 1 nhóm */}
                  {isSunday && sundayPunches.length > 0 && (
                    <div className="flex flex-col gap-1 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border-l-2 border-purple-400">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-gray-700 dark:text-gray-300">Chủ Nhật</span>
                      <div className="flex gap-3 items-center flex-wrap text-[12px] font-medium text-gray-700 dark:text-gray-300">
                        {sundayPunches.map((punch, idx) => (
                          <span key={idx}>{punch.label}: <span className={cn(
                            "ml-1",
                            punch.type === 'in' ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"
                          )}>{punch.time}</span></span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ngày thường: chia ca sáng/chiều */}
                  {!isSunday && (
                    <>
                      {/* Ca sáng */}
                      {morningPunches.length > 0 && (
                        <div className="flex flex-col gap-1 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border-l-2 border-emerald-400">
                          <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">Ca Sáng</span>
                          <div className="flex gap-3 items-center text-[12px] font-medium text-gray-700 dark:text-gray-300">
                            {morningPunches.map((punch, idx) => (
                              <span key={idx}>{punch.label}: <span className={cn(
                                "ml-1",
                                punch.type === 'in' ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"
                              )}>{punch.time}</span></span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ca chiều */}
                      {afternoonPunches.length > 0 && (
                        <div className="flex flex-col gap-1 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border-l-2 border-indigo-400">
                          <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">Ca Chiều (có thể kèm OT)</span>
                          <div className="flex gap-3 items-center text-[12px] font-medium text-gray-700 dark:text-gray-300">
                            {afternoonPunches.map((punch, idx) => (
                              <span key={idx}>{punch.label}: <span className={cn(
                                "ml-1",
                                punch.type === 'in' ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"
                              )}>{punch.time}</span></span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/40 text-[11px] text-gray-400 text-center italic">
                  {isSunday ? 'Chủ nhật - không chia ca' : 'Tổng hợp 4 lần chấm công'}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )
      }
    },
    {
      name: 'Trạng thái',
      uid: 'trang_thai',
      width: 140,
      render: (_: unknown, row?: ChamCongRecord) => {
        if (!row) return null

        // Kiểm tra xem có dữ liệu chấm công không
        const hasPunchData = (row.punch_1 && row.punch_1 !== '-') ||
          (row.punch_2 && row.punch_2 !== '-') ||
          (row.punch_3 && row.punch_3 !== '-') ||
          (row.punch_4 && row.punch_4 !== '-')

        const hasWorkHours = (row.gio_lam_sang && row.gio_lam_sang > 0) ||
          (row.gio_lam_chieu && row.gio_lam_chieu > 0) ||
          (row.tong_gio_lam && row.tong_gio_lam > 0)

        // Kiểm tra trạng thái chấm công chưa hoàn thành (chỉ hiển thị sau khi kết thúc buổi)
        if (row.trang_thai_cham_cong === 'thieu_cham_cong_sang' && shouldShowMissingStatus(row.ngay_cham_cong, 'sang')) {
          return (
            <div className="flex items-center justify-center px-2 py-1">
              <span className="text-[12px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md border border-orange-200 dark:border-orange-800/40">
                Thiếu chấm công sáng
              </span>
            </div>
          )
        }

        if (row.trang_thai_cham_cong === 'thieu_cham_cong_chieu' && shouldShowMissingStatus(row.ngay_cham_cong, 'chieu')) {
          return (
            <div className="flex items-center justify-center px-2 py-1">
              <span className="text-[12px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md border border-orange-200 dark:border-orange-800/40">
                Thiếu chấm công chiều
              </span>
            </div>
          )
        }

        // Nghỉ phép toàn ngày (không có chấm công, có đơn phép được duyệt)
        if (row.trang_thai_cham_cong === 'nghi_phep') {
          return (
            <div className="flex items-center justify-center px-2 py-1">
              <span className="text-[12px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md border border-purple-200 dark:border-purple-800/40">
                Nghỉ phép
              </span>
            </div>
          )
        }

        // Vắng mặt không phép
        if (row.trang_thai_cham_cong === 'vang_mat') {
          return (
            <div className="flex items-center justify-center px-2 py-1">
              <span className="text-[12px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md border border-red-200 dark:border-red-800/40">
                Vắng mặt
              </span>
            </div>
          )
        }

        if (!hasPunchData && !hasWorkHours) {
          return (
            <div className="flex items-center justify-center px-2 py-1">
              <span className="text-[12px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md border border-red-200 dark:border-red-800/40">
                Không chấm công buổi nào
              </span>
            </div>
          )
        }

        return (
          <div className="flex items-center justify-center px-2 py-1">
            <span className="text-[12px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md border border-green-200 dark:border-green-800/40">
              Đã chấm công
            </span>
          </div>
        )
      }
    },
    {
      name: 'Giờ làm sáng',
      uid: 'gio_lam_sang',
      width: 100,
      className: 'justify-center',
      render: (_: unknown, row?: ChamCongRecord) => {
        // Nếu là Chủ nhật, không hiển thị ca sáng/chiều
        if (row?.is_sunday) return <span className="text-[12px] text-gray-300 text-center block">—</span>
        // Hiển thị 0 thay vì số âm hoặc giá trị null
        const gioLamSang = Math.max(0, row?.gio_lam_sang ?? 0)
        if (!row || gioLamSang === 0) {
          if (row?.nghi_phep_sang) {
            return <span className="text-[12px] text-gray-500 dark:text-gray-400 italic text-center block">Nghỉ phép</span>
          }
          return <span className="text-[12px] text-gray-300 text-center block">—</span>
        }

        const effectivePunch1 = row.gio_vao_sang_hieu_luc || row.punch_1 || null
        const effectivePunch2 = row.gio_ra_sang_hieu_luc || row.punch_2 || null

        return (
          <Popover>
            <PopoverTrigger className="w-full">
              <div className="w-full h-full flex items-center justify-center cursor-pointer px-2 py-1">
                <span className="text-[12px] font-medium text-gray-600 dark:text-gray-400">
                  {formatWorkTime(gioLamSang)}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Popover.Arrow />
              <div className="flex flex-col min-w-[200px] rounded-[inherit] overflow-hidden">
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 bg-emerald-50/50 dark:bg-emerald-900/10">
                  <span className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Chi tiết ca sáng
                  </span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  {effectivePunch1 && effectivePunch2 && (
                    <>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-600 dark:text-gray-400">Giờ vào:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{effectivePunch1}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-600 dark:text-gray-400">Giờ ra:</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">{effectivePunch2}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )
      }
    },
    {
      name: 'Giờ làm chiều',
      uid: 'gio_lam_chieu',
      width: 100,
      className: 'justify-center',
      render: (_: unknown, row?: ChamCongRecord) => {
        // Nếu là Chủ nhật, không hiển thị ca sáng/chiều
        if (row?.is_sunday) return <span className="text-[12px] text-gray-300 text-center block">—</span>
        // Hiển thị 0 thay vì số âm hoặc giá trị null
        const gioLamChieu = Math.max(0, row?.gio_lam_chieu ?? 0)
        if (!row || gioLamChieu === 0) {
          if (row?.nghi_phep_chieu) {
            return <span className="text-[12px] text-gray-500 dark:text-gray-400 italic text-center block">Nghỉ phép</span>
          }
          return <span className="text-[12px] text-gray-300 text-center block">—</span>
        }

        const effectivePunch3 = row.gio_vao_chieu_hieu_luc || row.punch_3 || null
        const effectivePunch4 = row.gio_ra_chieu_hieu_luc || row.punch_4 || null

        return (
          <Popover>
            <PopoverTrigger className="w-full">
              <div className="w-full h-full flex items-center justify-center cursor-pointer px-2 py-1">
                <span className="text-[12px] font-medium text-gray-600 dark:text-gray-400">
                  {formatWorkTime(gioLamChieu)}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Popover.Arrow />
              <div className="flex flex-col min-w-[200px] rounded-[inherit] overflow-hidden">
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 bg-blue-50/50 dark:bg-blue-900/10">
                  <span className="text-[13px] font-semibold text-blue-700 dark:text-blue-400">
                    Chi tiết ca chiều
                  </span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  {effectivePunch3 && effectivePunch4 && (
                    <>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-600 dark:text-gray-400">Giờ vào:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{effectivePunch3}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-600 dark:text-gray-400">Giờ ra:</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">{effectivePunch4}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )
      }
    },
    {
      name: 'Tổng giờ làm',
      uid: 'tong_gio_lam',
      width: 100,
      render: (_: unknown, row?: ChamCongRecord) => {
        if (!row || row.tong_gio_lam == null || row.tong_gio_lam === 0) return <span className="text-[12px] text-gray-300 text-center block">—</span>

        // Lấy thời gian hiệu lực (KHÔNG fallback nếu null - null nghĩa là không làm ca đó do nghỉ phép)
        const effectivePunch1 = row.gio_vao_sang_hieu_luc || null
        const effectivePunch2 = row.gio_ra_sang_hieu_luc || null
        const effectivePunch3 = row.gio_vao_chieu_hieu_luc || null
        const effectivePunch4 = row.gio_ra_chieu_hieu_luc || null

        // Giờ Out hiệu lực cuối cùng cho Chủ nhật
        const effectiveLastOut = row.is_sunday
          ? (effectivePunch4 && effectivePunch4 !== null && effectivePunch4 !== '-' ? effectivePunch4
            : (effectivePunch3 && effectivePunch3 !== null && effectivePunch3 !== '-' ? effectivePunch3
              : (effectivePunch2 && effectivePunch2 !== null && effectivePunch2 !== '-' ? effectivePunch2 : null)))
          : effectivePunch4

        let gioLamSang = 0
        let gioLamChieu = 0

        // Tính giờ làm ca sáng (sử dụng thời gian hiệu lực)
        if (effectivePunch1 && effectivePunch2) {
          const t1 = new Date('1970-01-01 ' + effectivePunch1)
          const t2 = new Date('1970-01-01 ' + effectivePunch2)
          const diffInHours = (t2.getTime() - t1.getTime()) / (1000 * 60 * 60)
          // Nếu checkout sớm hơn checkin hoặc không có checkout → gán = 0
          gioLamSang = Math.max(0, diffInHours)
        }

        // Tính giờ làm ca chiều (sử dụng thời gian hiệu lực)
        if (effectivePunch3 && effectivePunch4) {
          const t3 = new Date('1970-01-01 ' + effectivePunch3)
          const t4 = new Date('1970-01-01 ' + effectivePunch4)
          const diffInHours = (t4.getTime() - t3.getTime()) / (1000 * 60 * 60)
          // Nếu checkout sớm hơn checkin hoặc không có checkout → gán = 0
          gioLamChieu = Math.max(0, diffInHours)
        }

        const tongGioTinhTay = gioLamSang + gioLamChieu

        return (
          <Popover>
            <PopoverTrigger className="w-full">
              <div className="w-full h-full flex items-center justify-center cursor-pointer px-2 py-1">
                <span className="text-[12px] font-medium text-gray-600 dark:text-gray-400">
                  {formatWorkTime(Number(row.tong_gio_lam ?? 0))}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Popover.Arrow />
              <div className="flex flex-col min-w-[280px] rounded-[inherit] overflow-hidden">
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/20">
                  <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                    {row.is_sunday ? 'Chi tiết giờ làm - Chủ nhật' : 'Chi tiết tính giờ làm'}
                  </span>
                </div>

                <div className="p-3 flex flex-col gap-2.5">
                  {/* Chủ nhật: hiển thị đơn giản */}
                  {row.is_sunday ? (
                    <>
                      <div className="flex flex-col gap-1 p-2 bg-purple-50/50 dark:bg-purple-900/10 rounded-md border border-purple-200/50 dark:border-purple-800/30">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold uppercase text-gray-700 dark:text-gray-300">Chủ Nhật</span>
                          <span className="text-[13px] font-bold text-purple-600 dark:text-purple-400">{formatWorkTime(row.tong_gio_lam)}</span>
                        </div>
                        <div className="text-[12px] text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{effectivePunch1}</span> → <span className="font-medium">{effectiveLastOut}</span>
                        </div>
                      </div>
                      <div className="mt-1 p-2 bg-purple-50/30 dark:bg-purple-900/5 rounded-md border border-purple-100 dark:border-purple-800/20">
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 italic">
                          💡 Chủ nhật không áp dụng logic ca sáng/chiều và giờ nghỉ trưa
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Ca sáng */}
                      {effectivePunch1 && effectivePunch2 && gioLamSang > 0 && (
                        <div className="flex flex-col gap-1 p-2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-md border border-emerald-200/50 dark:border-emerald-800/30">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Ca Sáng</span>
                            <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">{formatWorkTime(gioLamSang)}</span>
                          </div>
                          <div className="text-[12px] text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{effectivePunch1}</span> → <span className="font-medium">{effectivePunch2}</span>
                          </div>
                        </div>
                      )}

                      {/* Ca chiều */}
                      {effectivePunch3 && effectivePunch4 && gioLamChieu > 0 && (
                        <div className="flex flex-col gap-1 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-md border border-blue-200/50 dark:border-blue-800/30">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold uppercase text-blue-700 dark:text-blue-400">Ca Chiều</span>
                            <span className="text-[13px] font-bold text-blue-600 dark:text-blue-400">{formatWorkTime(gioLamChieu)}</span>
                          </div>
                          <div className="text-[12px] text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{effectivePunch3}</span> → <span className="font-medium">{effectivePunch4}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )
      }
    },
    {
      name: 'Tổng giờ nợ',
      uid: 'tong_gio_no',
      width: 120,
      render: (_: unknown, row?: ChamCongRecord) => {
        const gioDiTre = row?.gio_di_tre ?? 0
        const gioVeSom = row?.gio_ve_som ?? 0
        const tongNo = Math.round(gioDiTre + gioVeSom)

        // Dư dị tình người: nếu nợ từ 0-30 phút thì không hiển thị (bỏ qua các trường hợp đi trễ vài phút bất đắc dĩ)
        if (tongNo <= 30) return <span className="text-[12px] text-gray-300 text-center block">—</span>

        // Tính giờ đã bù từ thời gian chấm công thực tế
        const tongNoGio = tongNo / 60  // Chuyển từ phút sang giờ

        // Tính giờ làm bù: so sánh giờ ra thực tế với giờ ra chuẩn
        let gioBu = 0
        const punch4 = row?.punch_4 || row?.gio_ra_chieu_hieu_luc
        const punch2 = row?.punch_2 || row?.gio_ra_sang_hieu_luc
        const caCheckOut = row?.ca_check_out
        const caKetThucCheckIn = row?.ca_ket_thuc_check_in

        // Parse time từ HH:mm:ss hoặc HH:mm
        const parseTime = (timeStr: string): number => {
          const parts = timeStr.split(':')
          const hours = parseInt(parts[0]) || 0
          const minutes = parseInt(parts[1]) || 0
          return hours * 60 + minutes // Trả về tổng số phút
        }

        // Ưu tiên tính từ ca chiều (punch_4)
        if (punch4 && caCheckOut) {
          const punch4Minutes = parseTime(punch4)
          const checkOutMinutes = parseTime(caCheckOut)

          // Nếu ra muộn hơn giờ chuẩn → đó là giờ làm bù
          if (punch4Minutes > checkOutMinutes) {
            gioBu = (punch4Minutes - checkOutMinutes) / 60 // Chuyển sang giờ
          }
        } else if (punch2 && caKetThucCheckIn && !punch4) {
          // Nếu chỉ làm ca sáng, kiểm tra xem có làm bù vào cuối ca sáng không
          const punch2Minutes = parseTime(punch2)
          const checkInEndMinutes = parseTime(caKetThucCheckIn)

          if (punch2Minutes > checkInEndMinutes) {
            gioBu = (punch2Minutes - checkInEndMinutes) / 60
          }
        }

        // Cộng thêm OT đã đăng ký (nếu có)
        const gioOT = Number(row?.tong_gio_ot ?? 0)
        const tongGioBu = gioBu + gioOT

        const conThieu = tongNoGio - tongGioBu  // Số giờ còn thiếu (âm = đã bù dư)

        return (
          <Popover>
            <PopoverTrigger className="w-full">
              <div className="w-full h-full flex items-center justify-center cursor-pointer px-2 py-1">
                {/* Hiển thị chip trạng thái bù */}
                <div className={cn(
                  "px-2.5 py-1 rounded-md font-semibold text-[12px] border",
                  conThieu > 0.01  // Còn thiếu (có tolerance nhỏ)
                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                    : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                )}>
                  {conThieu > 0.01 ? '-' : '+'}{formatWorkTime(Math.abs(conThieu))}
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Popover.Arrow />
              <div className="flex flex-col min-w-60 rounded-[inherit] overflow-hidden">
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-red-50/50 dark:bg-red-900/10">
                  <span className="text-[13px] font-semibold text-red-700 dark:text-red-400">
                    Chi tiết nợ OT
                  </span>
                </div>

                <div className="p-3 flex flex-col gap-3">
                  {/* Hàng 1: Tổng nợ (gộp đi trễ + về sớm) */}
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-[12px] text-gray-600 dark:text-gray-400">Tổng nợ</span>
                    <span className="font-bold text-red-600 dark:text-red-400 text-[14px]">{formatWorkTime(tongNoGio)}</span>
                  </div>

                  {/* Hàng 2: Còn thiếu/Đã bù (chỉ hiển thị text, không có chip) */}
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-gray-600 dark:text-gray-400">
                      {conThieu > 0.01 ? 'Còn thiếu' : 'Đã bù'}
                    </span>
                    <span className={cn(
                      "font-semibold text-[13px]",
                      conThieu > 0.01
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    )}>
                      {formatWorkTime(Math.abs(conThieu))}
                    </span>
                  </div>

                  {/* Chi tiết tính toán */}
                  <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-800 space-y-1">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                      Đi trễ {formatWorkTime(gioDiTre / 60)} + Về sớm {formatWorkTime(gioVeSom / 60)} = <span className="font-semibold">{formatWorkTime(tongNo / 60)}</span>
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] text-gray-400 dark:text-gray-500">
                      {row && Number(row.gio_di_tre_sang) > 0 && (
                        <span>Đi trễ sáng: <span className="font-semibold text-gray-600 dark:text-gray-300">{formatWorkTime(Number(row.gio_di_tre_sang) / 60)}</span></span>
                      )}
                      {row && Number(row.gio_di_tre_chieu) > 0 && (
                        <span>Đi trễ chiều: <span className="font-semibold text-gray-600 dark:text-gray-300">{formatWorkTime(Number(row.gio_di_tre_chieu) / 60)}</span></span>
                      )}
                      {row && Number(row.gio_ve_som_sang) > 0 && (
                        <span>Về sớm sáng: <span className="font-semibold text-gray-600 dark:text-gray-300">{formatWorkTime(Number(row.gio_ve_som_sang) / 60)}</span></span>
                      )}
                      {row && Number(row.gio_ve_som_chieu) > 0 && (
                        <span>Về sớm chiều: <span className="font-semibold text-gray-600 dark:text-gray-300">{formatWorkTime(Number(row.gio_ve_som_chieu) / 60)}</span></span>
                      )}
                    </div>
                    {tongGioBu > 0 && (
                      <>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                          Đã làm bù: <span className="font-semibold">{formatWorkTime(tongGioBu)}</span>
                        </p>
                        {gioBu > 0 && gioOT > 0 && (
                          <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center italic">
                            (Làm thêm {formatWorkTime(gioBu)} + OT {formatWorkTime(gioOT)})
                          </p>
                        )}
                        {gioBu > 0 && gioOT === 0 && (
                          <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center italic">
                            (Làm thêm sau giờ chuẩn)
                          </p>
                        )}
                        {gioBu === 0 && gioOT > 0 && (
                          <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center italic">
                            (OT đã đăng ký)
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )
      }
    },
    {
      name: 'OT đã đăng ký',
      uid: 'ot_frames',
      width: 130,
      render: (_: unknown, row?: ChamCongRecord) => {
        const frames = row?.ot_frames ?? []
        const totalMinutes = Math.round(Number(row?.tong_gio_ot ?? 0) * 60)

        return (
          <Popover>
            <PopoverTrigger className="w-full">
              <div className="w-full h-full flex items-center justify-center cursor-pointer px-2 py-1">
                <span className={cn(
                  "text-[12px] font-medium",
                  frames.length > 0
                    ? "text-gray-600 dark:text-gray-400"
                    : "text-gray-300 dark:text-gray-500"
                )}>
                  {frames.length > 0 ? formatWorkTime(totalMinutes / 60) : '—'}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Popover.Arrow />
              <div className="flex flex-col min-w-[220px] rounded-[inherit] overflow-hidden">
                {/* Header */}
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                  <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                    Chi tiết OT đã đăng ký
                  </span>
                  {frames.length > 0 && (
                    <span className="text-[11px] font-medium text-gray-500 bg-gray-200/50 dark:bg-gray-700 px-1.5 py-0.5 rounded-md">
                      {frames.length} ca
                    </span>
                  )}
                </div>

                {/* Body */}
                {frames.length > 0 ? (
                  <div className="p-1.5 flex flex-col">
                    {frames.map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center px-2.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-md transition-colors">
                        <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          {f.gio_tu} <span className="text-gray-400 text-[11px]">→</span> {f.gio_den}
                        </span>
                        <span className="text-[13px] font-semibold text-blue-600 dark:text-blue-400">
                          {formatWorkTime(Number(f.tong_gio ?? 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-2xl text-gray-400 dark:text-gray-500">📋</span>
                    </div>
                    <span className="text-[12px] text-gray-500 dark:text-gray-400 text-center">
                      Chưa có OT đăng ký
                    </span>
                  </div>
                )}

                {/* Footer (Total) */}
                {frames.length > 1 && (
                  <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/40">
                    <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Tổng thời gian</span>
                    <span className="text-[14px] font-bold text-blue-600 dark:text-blue-500">
                      {formatWorkTime(totalMinutes / 60)}
                    </span>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )
      }
    },
    {
      name: 'Ca làm việc',
      uid: 'ca_lam_viec',
      width: 150,
      render: (_: unknown, row?: ChamCongRecord) => {
        if (!row || !row.ca_lam_viec) return <span className="text-[12px] text-gray-300 text-center block">—</span>

        return (
          <Popover>
            <PopoverTrigger className="w-full">
              <div className="w-full h-full flex items-center justify-center cursor-pointer px-2 py-1">
                <span className="text-[12px] font-medium text-gray-600 dark:text-gray-400">
                  {row.ca_lam_viec}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <Popover.Arrow />
              <div className="flex flex-col min-w-[280px] rounded-[inherit] overflow-hidden">
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/20">
                  <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                    Chi tiết ca làm việc
                  </span>
                </div>

                <div className="p-3 flex flex-col gap-2">
                  {/* Tên ca */}
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-[12px] text-gray-600 dark:text-gray-400">Tên ca</span>
                    <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">{row.ca_lam_viec}</span>
                  </div>

                  {/* Ca sáng */}
                  <div className="p-2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-md border border-emerald-200/50 dark:border-emerald-800/30">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Ca Sáng</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-gray-600 dark:text-gray-400">Check-in:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {row.ca_check_in ? row.ca_check_in.substring(0, 5) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-gray-600 dark:text-gray-400">Check-out:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {row.ca_ket_thuc_check_in ? row.ca_ket_thuc_check_in.substring(0, 5) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Ca chiều */}
                  <div className="p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-md border border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold uppercase text-blue-700 dark:text-blue-400">Ca Chiều</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-gray-600 dark:text-gray-400">Check-in:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {row.ca_bat_dau_check_out ? row.ca_bat_dau_check_out.substring(0, 5) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-gray-600 dark:text-gray-400">Check-out:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {row.ca_check_out ? row.ca_check_out.substring(0, 5) : '—'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </PopoverContent>
          </Popover>
        )
      }
    }
  ]

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
const PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function BangChamCongPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'tat-ca'
  const urlSearch = searchParams.get('search') || ''
  const [filter, setFilter] = useState<ChamCongFilter>({})
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [isStatsExpanded, setIsStatsExpanded] = useState(true)
  const [showShiftColumns, setShowShiftColumns] = useState(true) // Toggle hiển thị cột giờ làm sáng/chiều
  // Removed displayUnit state - always show "HH:mm" format (e.g., 04:15)
  const [columnOrder, setColumnOrder] = useState<string[]>(() => createColumns().map(c => c.uid)) // Maintain column order
  const [isExporting, setIsExporting] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const { isSuperAdmin, isPhongTCHC, canViewAll } = useNgoaiGioPermissions()
  const canViewAllDepartments = isSuperAdmin || isPhongTCHC || canViewAll

  // Drawer state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleTabChange = (key: string) => {
    setSearchParams(prev => {
      prev.set('tab', key)
      return prev
    })
    setPage(1)
  }

  // Fetch departments for export modal
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!canViewAllDepartments) return
      try {
        const res = await mapDonviGroupedOptionsV2()
        if (res && res.length > 0) {
          // Giữ nguyên grouped structure cho modal
          setDepartments(res)
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err)
      }
    }
    fetchDepartments()
  }, [canViewAllDepartments])

  // Fetch data from API
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['bangchamcong', activeTab, page, limit, urlSearch, filter],
    queryFn: async () => {
      const params: any = {
        start: (page - 1) * limit,
        length: limit,
        search: { value: urlSearch },
        tab: activeTab,
        draw: 1
      }

      if (filter.dateRange?.from) {
        params.from_date = filter.dateRange.from
      }
      if (filter.dateRange?.to) {
        params.to_date = filter.dateRange.to
      }
      if (filter.don_vi_ids && filter.don_vi_ids.length > 0) {
        params.id_don_vi = filter.don_vi_ids.join(',')
      } else if (filter.id_don_vi) {
        params.id_don_vi = filter.id_don_vi
      }

      if (filter.nhan_vien_ids && filter.nhan_vien_ids.length > 0) {
        params.id_nhan_vien = filter.nhan_vien_ids.join(',')
      }

      const response = await bangChamCongAxios.fetch(params)
      return response
    },
    staleTime: 30000 // 30 seconds
  })

  // Transform API data to ChamCongRecord format
  const transformedData: ChamCongRecord[] = useMemo(() => {
    if (!apiResponse?.data) return []

    // Backend already grouped by employee + date and calculated all metrics
    return apiResponse.data.map((record: any, index: number) => {
      // Debug: log trạng thái chấm công
      if (record.trang_thai_cham_cong !== 'day_du') {
        console.log('🔍 Record với trạng thái đặc biệt:', {
          ngay: record.ngay_cham_cong,
          ho_ten: record.ho_va_ten,
          trang_thai: record.trang_thai_cham_cong,
          punch_1: record.punch_1,
          punch_2: record.punch_2,
          punch_3: record.punch_3,
          punch_4: record.punch_4
        })
      }

      // Build OT frames array from backend data
      const ot_frames: { gio_tu: string; gio_den: string; tong_gio: number }[] = []
      let tong_gio_ot = 0

      if (record.ot_gio_bat_dau && record.ot_gio_ket_thuc && record.ot_so_gio_dang_ky) {
        ot_frames.push({
          gio_tu: record.ot_gio_bat_dau.substring(0, 5), // HH:MM
          gio_den: record.ot_gio_ket_thuc.substring(0, 5),   // HH:MM
          tong_gio: parseFloat(record.ot_so_gio_dang_ky) || 0
        })
        tong_gio_ot = parseFloat(record.ot_so_gio_dang_ky) || 0
      }

      return {
        id: index + 1,
        ma_nhan_vien: record.ma_nhan_vien || record.emp_code || '',
        ho_va_ten: record.ho_va_ten || record.emp_code || '',
        ten_chuc_vu: '',
        ten_don_vi: record.ten_don_vi || '',
        id_don_vi: record.id_don_vi_cong_tac?.toString() || '',
        ngay_cham_cong: record.ngay_cham_cong,
        gio_vao: record.gio_vao || '',
        gio_ra: record.gio_ra || '',
        punch_1: record.punch_1 || null,
        punch_2: record.punch_2 || null,
        punch_3: record.punch_3 || null,
        punch_4: record.punch_4 || null,
        gio_vao_sang_hieu_luc: record.gio_vao_sang_hieu_luc || null,
        gio_ra_sang_hieu_luc: record.gio_ra_sang_hieu_luc || null,
        gio_vao_chieu_hieu_luc: record.gio_vao_chieu_hieu_luc || null,
        gio_ra_chieu_hieu_luc: record.gio_ra_chieu_hieu_luc || null,
        gio_lam_sang: parseFloat(record.gio_lam_sang) || 0,
        gio_lam_chieu: parseFloat(record.gio_lam_chieu) || 0,
        tong_gio_lam: parseFloat(record.tong_gio_lam) || 0,
        gio_di_tre: parseInt(record.gio_di_tre) || 0,
        gio_ve_som: parseInt(record.gio_ve_som) || 0,
        no_ot: parseFloat(record.no_ot) || 0,
        ot_frames,
        tong_gio_ot,
        // Status chấm công
        trang_thai_cham_cong: record.trang_thai_cham_cong || 'day_du',
        is_sunday: record.is_sunday || false,
        // Nghỉ phép theo buổi (từ hrm_nghi_phep_chi_tiet)
        nghi_phep_sang: record.nghi_phep_sang === true || record.nghi_phep_sang === 1,
        nghi_phep_chieu: record.nghi_phep_chieu === true || record.nghi_phep_chieu === 1,
        // Include shift info for debugging/display if needed
        ca_lam_viec: record.ca_lam_viec || null,
        ca_check_in: record.ca_check_in || null,
        ca_ket_thuc_check_in: record.ca_ket_thuc_check_in || null,
        ca_bat_dau_check_out: record.ca_bat_dau_check_out || null,
        ca_check_out: record.ca_check_out || null,
        // OT registration info
        id_ngoai_gio: record.id_ngoai_gio || null,
        ot_trang_thai: record.ot_trang_thai || null,
        id_nhan_vien: record.id_nhan_vien || null,
      }
    })
  }, [apiResponse])

  const total = apiResponse?.recordsTotal || 0
  const filteredTotal = apiResponse?.recordsFiltered || 0

  // Tạo columns (luôn hiển thị dạng "HH:mm")
  const columns = useMemo(() => createColumns((id) => {
    setSelectedEmployeeId(id)
    setIsDrawerOpen(true)
  }), [])

  // Filter columns để ẩn/hiện cột giờ làm sáng/chiều, giữ nguyên thứ tự theo columnOrder
  const visibleColumns = useMemo(() => {
    let cols = showShiftColumns
      ? columns
      : columns.filter(col => col.uid !== 'gio_lam_sang' && col.uid !== 'gio_lam_chieu')

    // Sort theo columnOrder để giữ nguyên vị trí khi user đã reorder
    return cols.sort((a, b) => {
      const indexA = columnOrder.indexOf(a.uid)
      const indexB = columnOrder.indexOf(b.uid)
      return indexA - indexB
    })
  }, [showShiftColumns, columnOrder, columns])

  const { isMobile } = useBreakpoint()

  // Reset to page 1 when filter changes
  const handleFilterChange = (f: ChamCongFilter) => {
    setFilter(f)
    setPage(1)
  }

  // Handle export Excel
  const handleExportExcel = async () => {
    // Nếu có quyền xemtatca (superadmin) thì mở modal cho chọn đơn vị
    if (canViewAllDepartments) {
      setIsExportModalOpen(true)
      return
    }

    // Nếu không có quyền xemtatca thì xuất trực tiếp (theo đơn vị hoặc cá nhân)
    setIsExporting(true)
    try {
      const exportParams: any = {
        tab: activeTab
      }

      if (filter.dateRange?.from) {
        exportParams.from_date = filter.dateRange.from
      }
      if (filter.dateRange?.to) {
        exportParams.to_date = filter.dateRange.to
      }
      if (filter.don_vi_ids && filter.don_vi_ids.length > 0) {
        exportParams.id_don_vi = filter.don_vi_ids.join(',')
      }
      if (filter.nhan_vien_ids && filter.nhan_vien_ids.length > 0) {
        exportParams.id_nhan_vien = filter.nhan_vien_ids.join(',')
      }

      const response = await bangChamCongAxios.exportExcel(exportParams)

      if (response?.success && response?.data?.file_path) {
        const a = document.createElement('a')
        a.href = response.data.file_path
        a.download = response.data.filename || 'bao-cao-cham-cong.xlsx'
        a.click()
        toast('Xuất báo cáo thành công', { variant: 'success' })
      } else {
        toast(response?.message || 'Lỗi khi xuất báo cáo', { variant: 'danger' })
      }
    } catch (error) {
      toast('Lỗi khi xuất báo cáo', { variant: 'danger' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-110px)] overflow-hidden relative bg-white dark:bg-gray-900">
      <div className="flex flex-col h-full flex-1 min-h-0">

        {/* ── HEADER ZONE ── */}
        <div className="z-30 bg-white dark:bg-gray-900/95 flex-none border-b border-gray-200 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">

          {/* Summary Cards */}
          <ChamCongSummaryCards
            data={transformedData}
            totalRecords={filteredTotal}
            isExpanded={isStatsExpanded}
            onToggleExpand={setIsStatsExpanded}
            headerRightActions={
              <Button
                className="h-8 px-3 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onPress={handleExportExcel}
                isDisabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    Xuất Excel
                  </>
                )}
              </Button>
            }
          />

          {/* Toolbar */}
          <ChamCongToolbar
            filter={filter}
            onFilterChange={handleFilterChange}
            activeTab={activeTab}
            showShiftColumns={showShiftColumns}
            onToggleShiftColumns={() => setShowShiftColumns(!showShiftColumns)}
          // Removed displayUnit toggle
          />

          {/* Tabs */}
          {canViewAllDepartments && (
            <ChamCongTabs
              activeTab={activeTab}
              onTabChange={(key) => {
                // Reset don_vi_ids when switching tabs
                setFilter({ ...filter, don_vi_ids: [] })
                handleTabChange(key)
              }}
            />
          )}
        </div>

        {/* ── CONTENT: TABLE ── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-gray-50/30 dark:bg-gray-900/50">
          {isMobile ? (
            <ChamCongMobileList
              data={transformedData}
              isLoading={false}
            />
          ) : (
            <TableHr<ChamCongRecord>
              columns={visibleColumns}
              data={transformedData}
              isLoading={isLoading}
              primaryKey="id"
              enableStickyScrollbar={false}
              className="flex-1 min-h-0"
              columnOrder={columnOrder}
              onColumnOrderChange={setColumnOrder}
            />
          )}

          {/* Pagination */}
          <div className="flex-none border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 shrink-0">
            <TablePagination
              page={page}
              limit={limit}
              total={total}
              filtered={filteredTotal}
              onChangePage={p => setPage(p)}
              onChangeLimit={l => { setLimit(l); setPage(1) }}
              enableStickyPagination={!isMobile}
              className={isMobile ? "p-2" : ""}
            />
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ChamCongExportModal
        isOpen={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        filter={filter}
        activeTab={activeTab}
        departments={departments}
      />

      <EmployeeDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        employeeId={selectedEmployeeId!}
      />
    </div>
  )
}
