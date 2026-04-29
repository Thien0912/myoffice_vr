import { cn } from '@heroui-v3/react'
import { CheckCircle2, Clock, Image, MinusCircle, XCircle } from 'lucide-react'
import { NghiPhep } from '../types'

interface LeaveApprovalTimelineProps {
  data: NghiPhep
  defaultExpanded?: boolean
  onPreviewFile?: (url: string, name: string, ext: string) => void
  onStepClick?: (time: string) => void
}

export const LeaveApprovalTimeline = ({
  data,
  onPreviewFile,
  onStepClick
}: LeaveApprovalTimelineProps) => {
  const approvalSteps = [
    {
      label: 'Cấp đơn vị',
      name: data.nguoi_duyet_ho_cap_mot_ho_ten
        ? `${data.nguoi_duyet_ho_cap_mot_ho_ten} (Duyệt hộ ${data.nguoi_duyet_cap_mot_ho_ten})`
        : data.nguoi_duyet_cap_mot_ho_ten,
      status: data.trang_thai_cap_mot,
      time: data.thoi_gian_duyet_cap_mot,
      reason: data.ly_do_duyet_cap_mot,
      proofFile: data.minh_chung_duyet_ho_cap_mot
    },
    {
      label: 'Phòng TC-HC',
      name: data.nguoi_duyet_ho_cap_hai_ho_ten
        ? `${data.nguoi_duyet_ho_cap_hai_ho_ten} (Duyệt hộ ${data.nguoi_duyet_cap_hai_ho_ten})`
        : data.nguoi_duyet_cap_hai_ho_ten,
      status: data.trang_thai_cap_hai,
      time: data.thoi_gian_duyet_cap_hai,
      reason: data.ly_do_duyet_cap_hai,
      proofFile: data.minh_chung_duyet_ho_cap_hai
    }
  ]

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Da_duyet':
        return {
          label: 'Đã duyệt',
          icon: CheckCircle2,
          iconClasses: 'bg-[#10B981] text-white ring-4 ring-[#10B981]/20 dark:ring-[#10B981]/10',
          pillClasses: 'bg-[#10B981] text-white',
          lineClasses: 'border-[#10B981] border-solid'
        }
      case 'Tu_choi':
        return {
          label: 'Từ chối',
          icon: XCircle,
          iconClasses: 'bg-[#EF4444] text-white ring-4 ring-[#EF4444]/20 dark:ring-[#EF4444]/10',
          pillClasses: 'bg-[#EF4444] text-white',
          lineClasses: 'border-[#EF4444] border-solid'
        }
      case 'Cho_duyet':
        return {
          label: 'Chờ duyệt',
          icon: Clock,
          iconClasses: 'bg-[#EAB308] text-white ring-4 ring-[#EAB308]/20 dark:ring-[#EAB308]/10',
          pillClasses: 'bg-[#EAB308] text-white',
          lineClasses: 'border-[#EAB308] border-dashed'
        }
      default:
        return {
          label: 'Chưa xử lý',
          icon: MinusCircle,
          iconClasses:
            'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400 ring-4 ring-gray-100 dark:ring-gray-800/50',
          pillClasses: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
          lineClasses: 'border-gray-200 dark:border-gray-800 border-dashed'
        }
    }
  }

  return (
    <section className="px-5 sm:px-6">
      <div className="relative pb-2">
        <div className="flex w-full items-start justify-center min-w-[360px] max-w-xl mx-auto px-1.5">
          {approvalSteps.map((step, idx) => {
            const isLast = idx === approvalSteps.length - 1
            const info = getStatusInfo(step.status)
            const Icon = info.icon

            return (
              <div key={idx} className="relative flex flex-col flex-1 items-center p-2 rounded-xl">
                {/* Node & Connecting Line Row */}
                <div className="flex items-center justify-center w-full mb-3.5 relative">
                  {/* Line out to the next node safely using exact calc */}
                  {!isLast && (
                    <div
                      className={cn(
                        'absolute top-1/2 left-[calc(50%+1.5rem)] w-[calc(100%-3rem)] h-0 border-t-2 -translate-y-1/2',
                        info.lineClasses
                      )}
                    />
                  )}

                  <div
                    className={cn(
                      'shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300',
                      info.iconClasses,
                      step.time ? 'cursor-pointer hover:scale-110 active:scale-95 shadow-sm' : ''
                    )}
                    onClick={() => step.time && onStepClick?.(step.time as string)}
                  >
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                </div>

                {/* Content Data */}
                <div className="flex flex-col items-center px-2 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-gray-500 dark:text-gray-400">
                    {step.label}
                  </span>

                  <div className="flex flex-col justify-start mt-1">
                    <span className="text-[13px] font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                      {step.name || (step.status === 'Cho_duyet' ? 'Chờ duyệt' : 'Chưa xử lý')}
                    </span>
                  </div>

                  <div className="mt-1.5">
                    <span
                      className={cn(
                        'inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide',
                        info.pillClasses
                      )}
                    >
                      {info.label}
                    </span>
                  </div>

                  {/* Extra Step Info: Proof File */}
                  {step.proofFile && onPreviewFile && (
                    <button
                      onClick={() => onPreviewFile(step.proofFile!, 'Minh chứng', 'jpg')}
                      className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 w-fit px-2.5 py-1.5 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      <Image size={14} strokeWidth={2.5} />
                      M.Chứng
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
