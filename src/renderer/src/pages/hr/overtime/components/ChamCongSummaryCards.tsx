import { memo, useMemo, useState, ReactNode } from 'react'
import { Clock, TrendingDown, TrendingUp, AlertTriangle, ChevronUp, ChevronDown, BarChart2 } from 'lucide-react'
import { cn } from '@heroui/react'
import { ChamCongRecord, ChamCongStats } from '../types/BangChamCongTypes'
import { SummaryCard } from '@renderer/components/overview-cards'



// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-4 flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
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
      <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  </div>
)

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
interface ChamCongSummaryCardsProps {
  data?: ChamCongRecord[]
  isLoading?: boolean
  totalRecords?: number
  isExpanded?: boolean
  onToggleExpand?: (expanded: boolean) => void
  headerRightActions?: ReactNode
}

export const ChamCongSummaryCards = memo(({
  data = [],
  isLoading,
  totalRecords,
  isExpanded: propIsExpanded,
  onToggleExpand,
  headerRightActions
}: ChamCongSummaryCardsProps) => {
  const [internalExpanded, setInternalExpanded] = useState(true)
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : internalExpanded

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand(!isExpanded)
    } else {
      setInternalExpanded(v => !v)
    }
  }

  const stats: ChamCongStats = useMemo(() => {
    return data.reduce<ChamCongStats>((acc, row) => ({
      tong_gio_lam: acc.tong_gio_lam + (row.tong_gio_lam ?? 0),
      // convert minutes → hours for display
      tong_di_tre: acc.tong_di_tre + (row.gio_di_tre ?? 0),
      tong_ve_som: acc.tong_ve_som + (row.gio_ve_som ?? 0),
      tong_no_ot: acc.tong_no_ot + (row.no_ot ?? 0),
      tong_gio_ot: acc.tong_gio_ot + (row.tong_gio_ot ?? 0)
    }), { tong_gio_lam: 0, tong_di_tre: 0, tong_ve_som: 0, tong_no_ot: 0, tong_gio_ot: 0 })
  }, [data])

  const displayCount = totalRecords ?? data.length

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#1f2023] flex-none border-b border-gray-200/80 dark:border-gray-800">
      {/* Header toggle */}
      <div className="flex items-center justify-between px-4 py-2 select-none hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors">
        <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={handleToggle}>
          <BarChart2 size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
            TỔNG QUAN {displayCount > 0 ? `(${displayCount} BẢN GHI)` : ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {headerRightActions && (
            <div className="flex items-center border-l border-gray-300 dark:border-gray-600 pl-3">
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

      {/* Collapsible cards area */}
      <div
        className={cn(
          'px-3 sm:px-4 transition-all duration-300 ease-in-out origin-top overflow-hidden',
          isExpanded ? 'max-h-[500px] sm:max-h-[300px] pb-3 pt-1 opacity-100' : 'max-h-0 pb-0 pt-0 opacity-0'
        )}
      >
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <SummaryCard
              title="Tổng giờ làm việc"
              value={stats.tong_gio_lam.toFixed(1)}
              unit="giờ"
              subtitle={`${data.length} bản ghi chấm công`}
              icon={Clock}
              colorScheme="blue"
            />
            <SummaryCard
              title="Tổng giờ đi trễ"
              value={(stats.tong_di_tre / 60).toFixed(1)}
              unit="giờ"
              subtitle={`${data.filter(r => r.gio_di_tre > 0).length} nhân viên đi trễ`}
              icon={TrendingUp}
              colorScheme="yellow"
            />
            <SummaryCard
              title="Tổng giờ về sớm"
              value={(stats.tong_ve_som / 60).toFixed(1)}
              unit="giờ"
              subtitle={`${data.filter(r => r.gio_ve_som > 0).length} nhân viên về sớm`}
              icon={TrendingDown}
              colorScheme="orange"
            />
            {/* <SummaryCard
              title="Tổng giờ nợ OT"
              value={stats.tong_no_ot.toFixed(1)}
              unit="giờ"
              subtitle={`${data.filter(r => r.no_ot > 0).length} người chưa hoàn thành OT`}
              icon={AlertTriangle}
              colorScheme={stats.tong_no_ot > 0 ? 'red' : 'yellow'}
            /> */}
          </div>
        )}
      </div>
    </div>
  )
})
ChamCongSummaryCards.displayName = 'ChamCongSummaryCards'

export default ChamCongSummaryCards
