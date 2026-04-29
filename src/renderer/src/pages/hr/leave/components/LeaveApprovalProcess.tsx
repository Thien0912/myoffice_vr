import { Info, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { cn } from '@heroui-v3/react'
import { date as formatDate } from '@renderer/utils/formatDate'
import { NghiPhep } from '../types'

interface LeaveApprovalProcessProps {
  data: NghiPhep
  getStatusChip: (status: string) => React.ReactNode
}

export const LeaveApprovalProcess = ({ data, getStatusChip }: LeaveApprovalProcessProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Info size={16} className="text-gray-400" />
        <h2 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
          Tiến trình phê duyệt
        </h2>
      </div>
      <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
        {/* Cấp 1 */}
        <div className="flex gap-4 relative">
          <div
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 ring-4 transition-all duration-300',
              data.trang_thai_cap_mot === 'Da_duyet'
                ? 'bg-green-500 ring-green-500/10'
                : data.trang_thai_cap_mot === 'Tu_choi'
                  ? 'bg-red-500 ring-red-500/10'
                  : 'bg-amber-500 ring-amber-500/10'
            )}
          >
            {data.trang_thai_cap_mot === 'Da_duyet' ? (
              <CheckCircle2 size={14} className="text-white" />
            ) : data.trang_thai_cap_mot === 'Tu_choi' ? (
              <XCircle size={14} className="text-white" />
            ) : (
              <Clock size={14} className="text-white" />
            )}
          </div>
          <div className="flex-1 -mt-1 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100">
                  Cấp đơn vị:{' '}
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    {data.nguoi_duyet_cap_mot_ho_ten || 'Đang chờ xử lý'}
                  </span>
                </p>
                {data.thoi_gian_duyet_cap_mot && (
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 font-medium mt-0.5">
                    <Clock size={10} /> {formatDate('H:i d/m/Y', data.thoi_gian_duyet_cap_mot)}
                  </p>
                )}
              </div>
              {getStatusChip(data.trang_thai_cap_mot)}
            </div>
            {data.ly_do_duyet_cap_mot && (
              <div className="mt-2 px-3 py-1.5 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 relative">
                <p className="text-[11px] text-gray-600 dark:text-gray-400 italic">
                  "{data.ly_do_duyet_cap_mot}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cấp 2 */}
        <div className="flex gap-4 relative">
          <div
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 ring-4 transition-all duration-300',
              data.trang_thai_cap_hai === 'Da_duyet'
                ? 'bg-blue-600 ring-blue-600/10'
                : data.trang_thai_cap_hai === 'Tu_choi'
                  ? 'bg-red-500 ring-red-500/10'
                  : 'bg-gray-200 dark:bg-gray-700 ring-gray-100 dark:ring-gray-800'
            )}
          >
            {data.trang_thai_cap_hai === 'Da_duyet' ? (
              <CheckCircle2 size={14} className="text-white" />
            ) : data.trang_thai_cap_hai === 'Tu_choi' ? (
              <XCircle size={14} className="text-white" />
            ) : (
              <Clock
                size={14}
                className={cn(
                  data.trang_thai_cap_hai === 'Cho_duyet' ? 'text-white' : 'text-gray-400'
                )}
              />
            )}
          </div>
          <div className="flex-1 -mt-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100">
                  Phòng TC-HC:{' '}
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    {data.nguoi_duyet_cap_hai_ho_ten || 'Chờ cập nhật...'}
                  </span>
                </p>
                {data.thoi_gian_duyet_cap_hai && (
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 font-medium mt-0.5">
                    <Clock size={10} /> {formatDate('H:i d/m/Y', data.thoi_gian_duyet_cap_hai)}
                  </p>
                )}
              </div>
              {getStatusChip(data.trang_thai_cap_hai)}
            </div>
            {data.ly_do_duyet_cap_hai && (
              <div className="mt-2 px-3 py-1.5 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 relative">
                <p className="text-[11px] text-gray-600 dark:text-gray-400 italic">
                  "{data.ly_do_duyet_cap_hai}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
