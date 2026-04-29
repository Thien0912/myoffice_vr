import { cn } from '@heroui-v3/react'
import { date as formatDate } from '@renderer/utils/formatDate'
import { ChevronDown, History, Calendar } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { NghiPhep } from '../types'
import { UserAvatar } from '@renderer/components/UserAvatar'

interface LeaveApprovalLogsProps {
  data: NghiPhep
  defaultExpanded?: boolean
  highlightedTime?: string | null
}

const DateGroup = ({ group, highlightedTime }: { group: any, highlightedTime?: string | null }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="mb-4 last:mb-0">
      <div
        className="flex items-center gap-2 cursor-pointer select-none group/header mb-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronDown
          size={14}
          className={cn('text-gray-400 transition-transform', !isExpanded && '-rotate-90')}
        />
        <Calendar size={15} className="text-gray-600 dark:text-gray-400" />
        <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">
          {group.dateLabel}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500">
          {group.items.length} thao tác
        </span>
      </div>

      {isExpanded && (
        <div className="pl-6 space-y-0">
          {group.items.map((log: any, idx: number, arr: any[]) => {
            const isApproved =
              log.hanh_dong === 'duyet' ||
              log.hanh_dong === 'sua_duyet' ||
              log.hanh_dong === 'Approved'
            const isRejected = log.hanh_dong === 'tu_choi' || log.hanh_dong === 'Rejected'
            const isReview = log.hanh_dong === 'phuc_khao' || log.hanh_dong === 'Requested Review'
            const isLast = idx === arr.length - 1

            let actionText = log.hanh_dong
            if (log.hanh_dong === 'duyet') actionText = 'Đã duyệt đơn'
            if (log.hanh_dong === 'tu_choi') actionText = 'Đã từ chối đơn'
            if (log.hanh_dong === 'sua_duyet') actionText = 'Đã cập nhật phê duyệt'
            if (log.hanh_dong === 'phuc_khao') actionText = 'Gửi yêu cầu phúc khảo'

            const actionColor = isApproved
              ? 'text-green-600 dark:text-green-500'
              : isRejected
                ? 'text-red-500 dark:text-red-400'
                : isReview
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-blue-500 dark:text-blue-400'

            const dotColor = isApproved
              ? 'bg-green-500'
              : isRejected
                ? 'bg-red-500'
                : isReview
                  ? 'bg-orange-500'
                  : 'bg-blue-500'

            let boxBgClass =
              'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 text-gray-600 dark:text-gray-400'
            if (isApproved) {
              boxBgClass =
                'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30 text-green-800 dark:text-green-200'
            } else if (isRejected) {
              boxBgClass =
                'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30 text-red-800 dark:text-red-200'
            } else if (isReview) {
              boxBgClass =
                'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30 text-orange-800 dark:text-orange-200'
            }

            const isHighlighted = highlightedTime && log.thoi_gian_thay_doi === highlightedTime;

            return (
              <div 
                key={idx} 
                id={`log-${log.thoi_gian_thay_doi}`}
                className="relative pl-6 group/item min-h-[44px]"
              >
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-[3px] top-[24px] bottom-[-10px] w-[2px] bg-gray-100 dark:bg-gray-800 z-0" />
                )}

                {/* Minimal Dot */}
                <div
                  className={cn(
                    'absolute left-[-1px] top-[14px] w-[10px] h-[10px] rounded-full z-10 border-[2px] border-white dark:border-[#1c1c1e]',
                    dotColor
                  )}
                />

                <div className={cn(
                  "flex pl-2 pb-5 pt-1 -mt-1 transition-colors duration-500 rounded-xl relative",
                  isHighlighted ? "bg-yellow-50/80 dark:bg-yellow-900/20 ring-1 ring-yellow-400/50 dark:ring-yellow-500/30 shadow-sm z-10 -ml-2 px-2" : ""
                )}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-0.5">
                    <UserAvatar
                      src={log.nguoi_thuc_hien_avatar}
                      name={log.nguoi_thuc_hien_ho_ten}
                      size="sm"
                      className="w-8 h-8"
                    />
                  </div>

                  {/* Content */}
                  <div className="ml-3 flex-1 flex flex-col">
                    <div className="flex items-baseline gap-1.5 text-[13px] leading-tight flex-wrap mb-1">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {log.nguoi_thuc_hien_ho_ten}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600 px-0.5">|</span>
                      <span className="text-gray-400 text-[12px] whitespace-nowrap">
                        {log.thoi_gian_thay_doi?.length > 5
                          ? formatDate('H:i', log.thoi_gian_thay_doi)
                          : log.thoi_gian_thay_doi}
                      </span>
                    </div>

                    <div className={cn('text-[13px] font-bold', actionColor)}>{actionText}</div>

                    {log.ly_do && (
                      <div
                        className={cn(
                          'mt-2 text-[12.5px] leading-relaxed rounded-md border px-3 py-2',
                          boxBgClass
                        )}
                      >
                        {log.ly_do}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export const LeaveApprovalLogs = ({ data, defaultExpanded = false, highlightedTime }: LeaveApprovalLogsProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  useEffect(() => {
    setIsExpanded(defaultExpanded)
  }, [defaultExpanded])

  const groupedLogs = useMemo(() => {
    const baseLogs = data.logs || []

    const groups: { date: string; dateLabel: string; items: any[] }[] = []
    baseLogs.forEach((log) => {
      const dbDate = formatDate('Y-m-d', log.thoi_gian_thay_doi)
      const formattedDateStr = formatDate('d/m/Y', log.thoi_gian_thay_doi)

      let displayLabel = formattedDateStr
      const segments = dbDate.split('-').map(Number)
      if (segments.length === 3) {
        const [y, m, d] = segments
        const dateObj = new Date(y, m - 1, d)
        const today = new Date()
        const yesterday = new Date(Date.now() - 86400000)

        if (dateObj.toDateString() === today.toDateString())
          displayLabel = `Hôm nay, ${displayLabel}`
        else if (dateObj.toDateString() === yesterday.toDateString())
          displayLabel = `Hôm qua, ${displayLabel}`
      }

      const existing = groups.find((g) => g.date === dbDate)
      if (existing) {
        existing.items.push(log)
      } else {
        groups.push({ date: dbDate, dateLabel: displayLabel, items: [log] })
      }
    })
    return groups
  }, [data.logs])

  return (
    <section className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-5">
      <div
        className="flex items-center justify-between cursor-pointer group select-none mb-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl text-gray-500 dark:text-gray-400 shadow-sm">
            <History size={18} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[15px] font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              Lịch sử phê duyệt
            </h2>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
              Chi tiết các lần thay đổi trạng thái
            </p>
          </div>
        </div>
        <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-full">
          <ChevronDown
            size={16}
            className={isExpanded ? '' : '-rotate-90'}
            style={{ transition: 'transform 0.2s' }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="overflow-hidden bg-white dark:bg-[#1c1c1e] p-2 rounded-xl">
          {groupedLogs.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <History className="text-gray-300 dark:text-gray-600 mb-2" size={28} strokeWidth={1.5} />
              <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                Chưa có lịch sử phê duyệt
              </span>
            </div>
          ) : (
            groupedLogs.map((group) => <DateGroup key={group.date} group={group} highlightedTime={highlightedTime} />)
          )}
        </div>
      )}
    </section>
  )
}
