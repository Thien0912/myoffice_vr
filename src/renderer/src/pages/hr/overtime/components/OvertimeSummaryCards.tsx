import React, { useMemo, memo, useState, ReactNode } from 'react'
import { Clock, CheckCircle2, AlertTriangle, ChevronUp, ChevronDown, BarChart2, XCircle } from 'lucide-react'
import { cn } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { SummaryCard, StatsOverview } from '@renderer/components/overview-cards'

export interface OvertimeStats {
  totalRegisteredHours: number
  totalActualHours: number
  totalDebtHours: number
  totalRequests: number
}

interface OvertimeSummaryCardsProps {
  searchValue?: string
  searchKey?: any
  isLoading?: boolean
  totalRecords?: number
  isExpanded?: boolean
  onToggleExpand?: (expanded: boolean) => void
  headerRightActions?: ReactNode
  activeStatus?: string | null
  onStatusChange?: (status: string | null) => void
}

export const OvertimeSummaryCards = memo(({ searchValue, searchKey, isLoading: externalLoading, totalRecords, isExpanded: propIsExpanded, onToggleExpand, headerRightActions, activeStatus, onStatusChange }: OvertimeSummaryCardsProps) => {
  const [internalExpanded, setInternalExpanded] = useState(true)
  const hiddenFunctionByDeploy = false;

  const isEmployeeMode = typeof onStatusChange === 'function'
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : internalExpanded
  const handleToggle = () => {
    if (hiddenFunctionByDeploy) return;

    if (onToggleExpand) {
      onToggleExpand(!isExpanded)
    } else {
      setInternalExpanded(!isExpanded)
    }
  }

  // Fetch statistics từ backend
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['ngoaigio-statistics', searchValue, searchKey],
    queryFn: async () => {
      const response = await ngoaiGioAxios.getStatistics({
        searchValue,
        searchKey
      })
      return response.data
    },
    refetchOnWindowFocus: false
  })

  const isLoading = externalLoading || statsLoading

  const displayStats: OvertimeStats = useMemo(() => {
    if (!statsData) {
      return {
        totalRegisteredHours: 0,
        totalActualHours: 0,
        totalDebtHours: 0,
        totalRequests: 0
      }
    }
    return {
      totalRegisteredHours: statsData.totalRegisteredHours || 0,
      totalActualHours: statsData.totalActualHours || 0,
      totalDebtHours: statsData.totalDebtHours || 0,
      totalRequests: statsData.totalRequests || 0
    }
  }, [statsData])

  // statusStats từ backend cho employee mode
  const statusStats = useMemo(() => {
    if (!statsData?.statusStats) {
      return {
        pending: { count: 0, hours: 0 },
        approved: { count: 0, hours: 0 },
        rejected: { count: 0, hours: 0 },
        cancelled: { count: 0, hours: 0 }
      }
    }
    return {
      ...statsData.statusStats,
      cancelled: statsData.statusStats.cancelled || { count: 0, hours: 0 }
    }
  }, [statsData])

  const handleStatusClick = (value: string | null) => {
    if (!onStatusChange) return
    onStatusChange(activeStatus === value ? null : value)
  }

  if (isLoading) {
    return (
      <div className="bg-[#f8f9fa] dark:bg-[#1f2023] border-b border-gray-200/80 dark:border-gray-800">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between px-4 py-2 select-none group hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors">
          <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0" onClick={handleToggle}>
            <BarChart2 size={16} className="text-gray-500 dark:text-gray-400 shrink-0" />
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest truncate">
              <span className="hidden sm:inline">TỔNG QUAN </span>THỐNG KÊ
            </span>
            <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse ml-1 shrink-0" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Hidden on mobile — actions live in MobileFilterSheet strip */}
            {headerRightActions && (
              <div className="flex items-center gap-2">
                {headerRightActions}
              </div>
            )}
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#4d4f55] text-gray-500 dark:text-gray-400 transition-colors focus:outline-none"
              aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
              onClick={handleToggle}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Cards Skeleton */}
        {!hiddenFunctionByDeploy ? <div
          className={cn(
            "px-4 transition-all duration-300 ease-in-out origin-top overflow-hidden",
            isExpanded ? "max-h-[500px] pb-3 pt-1 opacity-100" : "max-h-0 pb-0 pt-0 opacity-0"
          )}
        >
          <div className={cn("grid gap-4", isEmployeeMode ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-6" : "grid-cols-1 md:grid-cols-3")}>
            {Array.from({ length: isEmployeeMode ? 6 : 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-4 flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="flex items-baseline gap-2 mt-1">
                      <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                      <div className="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-[10px] animate-pulse shrink-0" />
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div> : null}
      </div>
    )
  }

  return !hiddenFunctionByDeploy ? (
    <StatsOverview
      title={`TỔNG QUAN THỐNG KÊ ${ (totalRecords ?? displayStats.totalRequests) > 0 ?("(" + (totalRecords ?? displayStats.totalRequests) + " ĐƠN)") : "" }`}
      icon={<BarChart2 size={16} className="text-gray-500 dark:text-gray-400" />}
      isExpanded={isExpanded}
      onToggleExpand={handleToggle}
      rightActions={headerRightActions}
    >
        {isEmployeeMode ? (
          /* EMPLOYEE MODE: 5 Cards (4 Filters + 1 Info) */
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <SummaryCard
              title="Tổng Đăng Ký"
              value={displayStats.totalRegisteredHours.toFixed(1)}
              unit="giờ"
              subtitleBold={displayStats.totalRequests}
              subtitle="Đơn trong kỳ"
              icon={Clock}
              colorScheme="blue"
              isClickable
              isActive={activeStatus === null || activeStatus === undefined}
              onClick={() => handleStatusClick(null)}
            />
            <SummaryCard
              title="Chờ Duyệt"
              value={statusStats.pending.hours.toFixed(1)}
              unit="giờ"
              subtitleBold={statusStats.pending.count}
              subtitle="Đơn chờ duyệt"
              icon={Clock}
              colorScheme="yellow"
              isClickable
              isActive={activeStatus === 'Cho_duyet'}
              onClick={() => handleStatusClick('Cho_duyet')}
            />
            <SummaryCard
              title="Đã Duyệt"
              value={statusStats.approved.hours.toFixed(1)}
              unit="giờ"
              subtitleBold={statusStats.approved.count}
              subtitle="Đơn đã duyệt"
              icon={CheckCircle2}
              colorScheme="emerald"
              isClickable
              isActive={activeStatus === 'Da_duyet'}
              onClick={() => handleStatusClick('Da_duyet')}
            />
            <SummaryCard
              title="Từ Chối"
              value={statusStats.rejected.hours.toFixed(1)}
              unit="giờ"
              subtitleBold={statusStats.rejected.count}
              subtitle="Đơn bị từ chối"
              icon={XCircle}
              colorScheme="red"
              isClickable
              isActive={activeStatus === 'Tu_choi'}
              onClick={() => handleStatusClick('Tu_choi')}
            />
            <SummaryCard
              title="Đã Hủy"
              value={statusStats.cancelled.hours.toFixed(1)}
              unit="giờ"
              subtitleBold={statusStats.cancelled.count}
              subtitle="Đơn đã hủy"
              icon={XCircle}
              colorScheme="slate"
              isClickable
              isActive={activeStatus === 'Huy'}
              onClick={() => handleStatusClick('Huy')}
            />
            <SummaryCard
              title="OT Khớp Máy"
              value={displayStats.totalActualHours.toFixed(1)}
              unit="giờ"
              subtitleBold=""
              subtitle="Từ máy chấm công"
              icon={CheckCircle2}
              colorScheme="emerald"
            />
          </div>
        ) : (
          /* ADMIN MODE: 3 Cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              title="Tổng Đăng Ký"
              value={displayStats.totalRegisteredHours.toFixed(1)}
              unit="giờ"
              subtitleBold={displayStats.totalRequests}
              subtitle="Đơn trong kỳ"
              icon={Clock}
              colorScheme="blue"
            />
            <SummaryCard
              title="OT KHỚP MÁY CHẤM CÔNG"
              value={displayStats.totalActualHours.toFixed(1)}
              unit="giờ"
              subtitleBold=""
              subtitle="Thời gian thực tế từ máy chấm công"
              icon={CheckCircle2}
              colorScheme="emerald"
            />
            <SummaryCard
              title="TỔNG NỢ OT"
              value={displayStats.totalDebtHours.toFixed(1)}
              unit="giờ"
              subtitleBold=""
              subtitle="Đi trễ + Về sớm so với ca làm việc"
              icon={AlertTriangle}
              colorScheme={displayStats.totalDebtHours > 0.5 ? "red" : "yellow"}
            />
          </div>
        )}
      </StatsOverview>
  ) : null
})
OvertimeSummaryCards.displayName = 'OvertimeSummaryCards'

export default OvertimeSummaryCards
