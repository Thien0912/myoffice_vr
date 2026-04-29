import { ProgressBar, Tooltip, Skeleton } from '@heroui-v3/react'
import { useEffect } from 'react'
import { UserAvatar } from '@renderer/components/UserAvatar'
import { useQuery } from '@tanstack/react-query'
import { nghiphepAxios } from '@renderer/api/hr/nghiphepAxios'

interface EmployeeLeaveQuotaProps {
  startDate: string
  endDate: string
  id_don_vi?: string
  onLoad?: (count: number) => void
  isCollapsed?: boolean
  search?: string
}

export default function EmployeeLeaveQuota({
  startDate,
  endDate,
  id_don_vi,
  onLoad,
  isCollapsed = false,
  search = ''
}: EmployeeLeaveQuotaProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['leave-statistics', startDate, endDate, id_don_vi, search],
    queryFn: async () => {
      const res = await nghiphepAxios.getStatistics(startDate, endDate, id_don_vi, search)
      return res?.data || []
    }
  })

  useEffect(() => {
    if (data && onLoad) {
      onLoad(data.length)
    }
  }, [data, onLoad])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 pr-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-2">
            <Skeleton className="rounded-full w-8 h-8 flex-none" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/2 rounded-lg" />
              <Skeleton className="h-2 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const filteredData = (data || []).filter((item: any) => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.uid && String(item.uid).toLowerCase().includes(q)) ||
      (item.email && String(item.email).toLowerCase().includes(q)) ||
      (item.id && String(item.id).toLowerCase().includes(q))
    )
  })

  const displayData = filteredData

  if (displayData.length === 0) {
    return <div className="p-4 text-center text-xs text-gray-500">Không có dữ liệu</div>
  }

  return (
    <div className="flex flex-col gap-1 pr-1">
      {displayData.map((item: any, index: number) => {
        const percentage = Math.min((item.used / item.total) * 100, 100)
        const isWarning = percentage > 70
        const isDanger = percentage >= 100

        return (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center gap-4 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group"
          >
            <div className="shrink-0">
              <UserAvatar
                name={item.name}
                src={item.avatar}
                gender={item.gender as any}
                size="sm"
                isBordered
              />
            </div>

            <div className={`flex-1 min-w-0 ${isCollapsed ? 'flex flex-col justify-center' : ''}`}>
              <div
                className={`flex items-center mb-1 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              >
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <Tooltip>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate cursor-default">
                        {item.name}
                      </span>
                      <Tooltip.Content showArrow placement="top start">
                        {item.name}
                      </Tooltip.Content>
                    </Tooltip>
                    <span className="text-[10px] text-gray-400">MNS: {item.uid}</span>
                  </div>
                )}
                <div className={`text-right whitespace-nowrap ${!isCollapsed ? 'ml-2' : ''}`}>
                  <span
                    className={`font-bold ${isCollapsed ? 'text-[10px]' : 'text-[11px]'} ${isDanger ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-blue-600'}`}
                  >
                    {item.used}/{item.total}
                  </span>
                  {!isCollapsed && <span className="text-[10px] text-gray-400 ml-1">ngày</span>}
                </div>
              </div>
              <ProgressBar
                value={percentage}
                color={isDanger ? 'danger' : isWarning ? 'warning' : 'accent'}
                size="sm"
                aria-label={`Tiến độ nghỉ phép của ${item.name}`}
                className="max-w-full"
              >
                <ProgressBar.Track className="h-1.5">
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            </div>
          </div>
        )
      })}
    </div>
  )
}
