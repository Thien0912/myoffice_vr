import { memo, useState } from 'react'
import { cn, Popover, PopoverTrigger, PopoverContent } from '@heroui-v3/react'
import { ChevronDown } from 'lucide-react'
import { ChamCongRecord } from '../types/BangChamCongTypes'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmtDate = (raw: string) => {
  if (!raw) return ''
  const [y, m, d] = raw.split('-')
  return `${d}/${m}/${y}`
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

export interface ChamCongMobileCardProps {
  row: ChamCongRecord
  index: number
}

const ChamCongMobileCard = memo(function ChamCongMobileCard({
  row,
}: ChamCongMobileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
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
  
  // Giờ Out hiệu lực cuối cùng cho Chủ nhật
  const effectiveLastOut = isSunday
    ? (effectivePunch4 && effectivePunch4 !== '-' ? effectivePunch4 
      : (effectivePunch3 && effectivePunch3 !== '-' ? effectivePunch3 
        : (effectivePunch2 && effectivePunch2 !== '-' ? effectivePunch2 : '-')))
    : effectivePunch4

  // Xác định ca làm việc cho từng lần chấm
  const shift1 = detectShiftPeriod(row.punch_1, row.ca_check_in, row.ca_ket_thuc_check_in, row.ca_bat_dau_check_out)
  const shift2 = detectShiftPeriod(row.punch_2, row.ca_check_in, row.ca_ket_thuc_check_in, row.ca_bat_dau_check_out)
  const shift3 = detectShiftPeriod(row.punch_3, row.ca_check_in, row.ca_ket_thuc_check_in, row.ca_bat_dau_check_out)
  const shift4 = detectShiftPeriod(row.punch_4, row.ca_check_in, row.ca_ket_thuc_check_in, row.ca_bat_dau_check_out)

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
    // Ngày thường: chia ca sáng/chiều
    if (punch1 !== '-') {
      const target = shift1 === 'morning' ? morningPunches : afternoonPunches
      target.push({ label: 'In', time: effectivePunch1, type: 'in' })
    }
    if (punch2 !== '-') {
      const target = shift2 === 'morning' ? morningPunches : afternoonPunches
      target.push({ label: 'Out', time: effectivePunch2, type: 'out' })
    }
    if (punch3 !== '-') {
      const target = shift3 === 'morning' ? morningPunches : afternoonPunches
      target.push({ label: 'In', time: effectivePunch3, type: 'in' })
    }
    if (punch4 !== '-') {
      const target = shift4 === 'morning' ? morningPunches : afternoonPunches
      target.push({ label: 'Out', time: effectivePunch4, type: 'out' })
    }
  }

  // Sử dụng giờ làm từ backend (đã tính toán đúng theo quy định)
  const gioLamSang = row.gio_lam_sang || 0
  const gioLamChieu = row.gio_lam_chieu || 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 p-4 flex flex-col gap-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      {/* Header: User Info & Check In/Out */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100 truncate">
              {row.ho_va_ten} <span className="text-gray-500 font-normal text-[12px]">({row.ten_chuc_vu || row.ma_nhan_vien})</span>
            </span>
            <span className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {row.ten_don_vi}
            </span>
          </div>
        </div>

        <Popover>
          <PopoverTrigger>
            <button className="flex flex-col items-end shrink-0 text-right outline-none p-1.5 -m-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <span className={cn(
                'text-[14px] font-black',
                row.tong_gio_lam >= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200'
              )}>
                {row.tong_gio_lam.toFixed(2)}h
              </span>
              <span className="text-[11px] text-gray-400 font-medium tracking-wide">TỔNG GIỜ</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Popover.Arrow />
            <div className="flex flex-col min-w-[280px] rounded-[inherit] overflow-hidden">
              <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/20">
                <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                  {isSunday ? 'Chi tiết giờ làm - Chủ nhật' : 'Chi tiết tính giờ làm'}
                </span>
              </div>

              <div className="p-3 flex flex-col gap-2.5">
                {/* Chủ nhật: hiển thị đơn giản */}
                {isSunday ? (
                  <>
                    <div className="flex flex-col gap-1 p-2 bg-purple-50/50 dark:bg-purple-900/10 rounded-md border border-purple-200/50 dark:border-purple-800/30">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold uppercase text-gray-700 dark:text-gray-300">Chủ Nhật</span>
                        <span className="text-[13px] font-bold text-purple-600 dark:text-purple-400">{row.tong_gio_lam.toFixed(2)}h</span>
                      </div>
                      <div className="text-[12px] text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{effectivePunch1}</span> → <span className="font-medium">{effectiveLastOut}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-500 italic">
                        = {Math.floor(row.tong_gio_lam)} giờ {Math.round((row.tong_gio_lam % 1) * 60)} phút
                      </div>
                    </div>
                    <div className="mt-1 p-2 bg-purple-50/30 dark:bg-purple-900/5 rounded-md border border-purple-100 dark:border-purple-800/20">
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 italic">
                        💡 Chủ nhật không áp dụng logic ca sáng/chiều
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Ca sáng */}
                    {punch1 !== '-' && punch2 !== '-' && (
                      <div className="flex flex-col gap-1 p-2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-md border border-emerald-200/50 dark:border-emerald-800/30">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Ca Sáng</span>
                          <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">{gioLamSang.toFixed(2)}h</span>
                        </div>
                        <div className="text-[12px] text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{effectivePunch1}</span> → <span className="font-medium">{effectivePunch2}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-500 italic">
                          = {Math.floor(gioLamSang)} giờ {Math.round((gioLamSang % 1) * 60)} phút
                        </div>
                      </div>
                    )}

                    {/* Ca chiều */}
                    {punch3 !== '-' && punch4 !== '-' && (
                      <div className="flex flex-col gap-1 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-md border border-blue-200/50 dark:border-blue-800/30">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold uppercase text-blue-700 dark:text-blue-400">Ca Chiều</span>
                          <span className="text-[13px] font-bold text-blue-600 dark:text-blue-400">{gioLamChieu.toFixed(2)}h</span>
                        </div>
                        <div className="text-[12px] text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{effectivePunch3}</span> → <span className="font-medium">{effectivePunch4}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-500 italic">
                          = {Math.floor(gioLamChieu)} giờ {Math.round((gioLamChieu % 1) * 60)} phút
                        </div>
                      </div>
                    )}

                    {/* Tổng */}
                    <div className="mt-1 pt-2.5 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">Tổng giờ làm</span>
                        <span className="text-[15px] font-black text-gray-900 dark:text-white">
                          {row.tong_gio_lam.toFixed(2)}h
                        </span>
                      </div>
                      {(gioLamSang > 0 || gioLamChieu > 0) && (
                        <div className="text-[11px] text-gray-500 dark:text-gray-500 italic mt-1">
                          {gioLamSang.toFixed(2)}h + {gioLamChieu.toFixed(2)}h = {row.tong_gio_lam.toFixed(2)}h
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />

      {/* Date & Time Check In */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Popover>
            <PopoverTrigger>
              <button className="flex flex-col text-left outline-none p-1.5 -m-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">
                    {fmtDate(row.ngay_cham_cong)}
                  </span>
                  {isSunday && (
                    <span className="text-[9px] font-bold uppercase bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded">
                      CN
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  {punch1} <span className="mx-1 font-normal text-gray-300">→</span> {lastOut}
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
        </div>

        {/* OT đã đăng ký */}
        {row.tong_gio_ot > 0 && row.ot_frames && row.ot_frames.length > 0 && (
          <div className="flex justify-end shrink-0 pl-2">
            <Popover>
              <PopoverTrigger>
                <button className="flex flex-col text-right outline-none p-1.5 -m-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-[12px] font-bold text-gray-800 dark:text-gray-200">
                    OT: {Math.round(row.tong_gio_ot * 60)} phút
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    {row.ot_frames.length} ca
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <Popover.Arrow />
                <div className="flex flex-col min-w-[220px] rounded-[inherit] overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                    <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                      Chi tiết OT đã đăng ký
                    </span>
                    <span className="text-[11px] font-medium text-gray-500 bg-gray-200/50 dark:bg-gray-700 px-1.5 py-0.5 rounded-md">
                      {row.ot_frames.length} ca
                    </span>
                  </div>

                  <div className="p-2 flex flex-col gap-1.5 max-h-[250px] overflow-y-auto">
                    {row.ot_frames.map((frame, i) => (
                      <div key={i} className="flex justify-between items-center text-[12px] p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-md transition-colors border border-gray-100 dark:border-gray-700/50">
                        <span className="font-medium text-gray-600 dark:text-gray-300 tracking-wide">
                          {frame.gio_tu} <span className="mx-1 text-gray-400 font-normal">→</span> {frame.gio_den}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-500">
                          {Math.round(frame.tong_gio * 60)} phút
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/40">
                    <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Tổng thời gian</span>
                    <span className="text-[14px] font-bold text-gray-900 dark:text-white">
                      {Math.round(row.tong_gio_ot * 60)} phút
                    </span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Collapse details for Total Debt */}
      {(() => {
        const tongGioNo = (row.gio_di_tre ?? 0) + (row.gio_ve_som ?? 0)
        if (tongGioNo === 0) return null
        
        return (
          <>
            <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between p-1.5 -m-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left outline-none"
              >
                <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">Tổng giờ nợ</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {tongGioNo} phút
                  </span>
                  <ChevronDown size={16} className={cn("text-gray-400 transition-transform", isExpanded && "rotate-180")} />
                </div>
              </button>

              {isExpanded && (
                <div className="flex flex-col gap-2 p-3 mt-1 bg-red-50/50 dark:bg-red-900/10 rounded-lg text-[12px] border border-red-100 dark:border-red-900/30">
                  {row.gio_di_tre > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Đi trễ</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">{row.gio_di_tre} phút</span>
                    </div>
                  )}
                  {row.gio_ve_som > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Về sớm</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">{row.gio_ve_som} phút</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 mt-1 border-t border-red-200/50 dark:border-red-800/50">
                    <span className="text-gray-700 dark:text-gray-300 font-bold">Tổng</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{tongGioNo} phút</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )
      })()}
    </div>
  )
})

export default ChamCongMobileCard
