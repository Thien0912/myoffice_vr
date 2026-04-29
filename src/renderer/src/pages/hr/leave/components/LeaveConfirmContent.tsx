import { date as formatDate } from '@renderer/utils/formatDate'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'

interface LeaveConfirmContentProps {
  row: any
  totalDays: number
  dateStr: string
  reason?: string
  onReasonChange?: (val: string) => void
}

export default function LeaveConfirmContent({
  row,
  totalDays,
  dateStr,
  reason = '',
  onReasonChange = () => {}
}: LeaveConfirmContentProps) {
  if (!row) return null

  const details = Array.isArray(row.chi_tiet_ngay_nghi) ? row.chi_tiet_ngay_nghi : []
  const sortedDetails = [...details].sort(
    (a, b) => new Date(a.ngay_nghi).getTime() - new Date(b.ngay_nghi).getTime()
  )

  return (
    <div className="flex flex-col gap-5 py-2">
      <div className="grid grid-cols-[120px_1fr] gap-y-5 text-sm items-baseline">
        <span className="text-gray-500 dark:text-gray-400 font-medium">Họ tên:</span>
        <span className="text-gray-900 dark:text-gray-100 font-bold capitalize">
          {row.ho_va_ten || `Nhân viên #${row.id_nhan_vien || row.ma_nhan_vien}`}
        </span>

        <span className="text-gray-500 dark:text-gray-400 font-medium">Thời gian nghỉ:</span>
        <div className="flex flex-col gap-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-sm border border-blue-100 dark:border-blue-800 w-fit">
            <span className="text-blue-700 dark:text-blue-400 font-bold">
              Tổng: {totalDays} ngày
            </span>
            <span className="text-[11px] text-blue-600/70 dark:text-blue-400/70 ml-1">
              ({dateStr})
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            {sortedDetails.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-sm w-fit min-w-[150px]"
              >
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 min-w-[80px]">
                  {formatDate('d/m/Y', item.ngay_nghi)}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold shadow-sm whitespace-nowrap ${
                    item.buoi_nghi === 'Sang'
                      ? 'bg-blue-100 text-blue-700'
                      : item.buoi_nghi === 'Chieu'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {item.buoi_nghi === 'Sang'
                    ? 'SÁNG'
                    : item.buoi_nghi === 'Chieu'
                      ? 'CHIỀU'
                      : 'CẢ NGÀY'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <span className="text-gray-500 dark:text-gray-400 font-medium">Loại phép:</span>
        <span className="text-gray-800 dark:text-gray-200">
          <span className="font-medium">
            {row.ten_loai_phep || row.loai_phep || 'Nghỉ phép năm'}
          </span>
        </span>

        <span className="text-gray-500 dark:text-gray-400 font-medium">Lý do nghỉ:</span>
        <span className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium bg-gray-50 dark:bg-gray-800/50 p-2 rounded-sm border border-gray-100 dark:border-gray-700 italic">
          "{row.ly_do_nghi}"
        </span>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
        <TextareaFloatingLabel
          label="Ghi chú / Lý do duyệt"
          placeholder="Nhập ghi chú nếu có (không bắt buộc)..."
          value={reason}
          onChange={onReasonChange}
          rows={2}
        />
      </div>
    </div>
  )
}
