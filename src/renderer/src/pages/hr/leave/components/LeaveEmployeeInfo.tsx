import { Button } from '@heroui-v3/react'
import { date as formatDate } from '@renderer/utils/formatDate'
import {
  Activity,
  AlertCircle,
  Briefcase,
  CalendarDays,
  Clock,
  Download,
  FileText,
  Paperclip
} from 'lucide-react'
import { NghiPhep } from '../types'

interface LeaveEmployeeInfoProps {
  data: NghiPhep
  onSupplementMinhChung?: (data: NghiPhep) => void
  onPreviewMinhChung?: (url: string, name: string, ext?: string) => void
}

export const LeaveEmployeeInfo = ({
  data,
  onSupplementMinhChung,
  onPreviewMinhChung
}: LeaveEmployeeInfoProps) => {
  // Render component

  return (
    <section className="flex flex-col gap-6">
      {/* Grid of key details */}
      <div className="grid grid-cols-2 gap-4">
        {/* Type */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex flex-col gap-2 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Briefcase size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Loại phép</span>
          </div>
          <span className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
            {data.ten_loai_phep}
          </span>
        </div>

        {/* Loai nghi */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex flex-col gap-2 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <AlertCircle size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Loại nghỉ phép</span>
          </div>
          <span className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
            {data.loai_nghi === 'Binh_thuong' ? 'Xin trước' : 'Đột xuất'}
          </span>
        </div>

        {/* Duration */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex flex-col gap-2 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Clock size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Thời gian</span>
          </div>
          <span className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
            {data.so_ngay_nghi} ngày
          </span>
        </div>

        {/* Status */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex flex-col gap-2 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Activity size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Trạng thái</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(() => {
              const st1 = data.trang_thai_cap_mot || 'Cho_duyet'
              const st2 = data.trang_thai_cap_hai || 'Cho_duyet'

              const getColor = (st: string) => {
                if (st === 'Da_duyet') return 'text-green-600 dark:text-green-500'
                if (st === 'Tu_choi') return 'text-red-600 dark:text-red-500'
                return 'text-yellow-500 dark:text-yellow-400'
              }

              const getText = (st: string) => {
                if (st === 'Da_duyet') return 'Đã duyệt'
                if (st === 'Tu_choi') return 'Từ chối'
                return 'Chờ duyệt'
              }

              if (st1 === st2) {
                return (
                  <span
                    className={`${getColor(st1)} text-[11px] font-bold uppercase leading-tight`}
                  >
                    {getText(st1)}
                  </span>
                )
              }

              return (
                <>
                  <span
                    className={`${getColor(st1)} text-[11px] font-bold uppercase leading-tight`}
                  >
                    ĐV: {getText(st1)}
                  </span>
                  {st1 !== 'Tu_choi' && (
                    <span
                      className={`${getColor(st2)} text-[11px] font-bold uppercase leading-tight`}
                    >
                      TC: {getText(st2)}
                    </span>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Chi tiết ngày nghỉ */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <CalendarDays size={18} className="text-gray-500" />
          <span className="text-sm font-bold">Chi tiết ngày nghỉ</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data.chi_tiet_ngay_nghi?.map((ngay: any, idx: number) => {
            const dateObj = new Date(ngay.ngay_nghi)
            const dayName = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(dateObj)
            const monthStr = formatDate('d/m', ngay.ngay_nghi)

            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 min-w-[70px]"
              >
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {monthStr}
                </span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
                  {dayName}
                </span>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mt-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                  {ngay.buoi_nghi === 'Ca_ngay'
                    ? 'Cả ngày'
                    : ngay.buoi_nghi === 'Sang'
                      ? 'Sáng'
                      : 'Chiều'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lý do */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <FileText size={18} className="text-gray-500" />
          <span className="text-sm font-bold">Lý do nghỉ</span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700/50 leading-relaxed">
          {data.ly_do_nghi || <span className="italic text-gray-400">Không có lý do</span>}
        </div>
      </div>

      {/* Minh chứng */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <Paperclip size={18} className="text-gray-500" />
          <span className="text-sm font-bold">Minh chứng đính kèm</span>
        </div>
        {data.minh_chung ? (
          <div
            className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-xl p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98] w-full"
            onClick={() =>
              onPreviewMinhChung?.(data.minh_chung!, 'Minh chứng nghỉ phép', data.minh_chung_ext)
            }
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                <FileText size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 break-words">
                  Minh chứng đính kèm
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {data.minh_chung_ext?.toUpperCase() || 'FILE'}
                </span>
              </div>
            </div>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            >
              <Download size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4">
            <span className="text-sm text-gray-500 italic">Chưa có minh chứng đính kèm</span>
            {onSupplementMinhChung && (
              <Button
                size="sm"
                variant="ghost"
                onPress={() => onSupplementMinhChung(data)}
                className="font-semibold bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                Bổ sung
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
