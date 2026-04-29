import { memo } from 'react'
import { ChamCongRecord } from '../types/BangChamCongTypes'
import ChamCongMobileCard from './ChamCongMobileCard'

export interface ChamCongMobileListProps {
  data: ChamCongRecord[]
  isLoading: boolean
}

// ─── Empty state ───────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg className="w-7 h-7 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">Không có dữ liệu</span>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">Chưa có bản ghi chấm công nào phù hợp.</span>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-3">
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <div className="h-4 w-40 rounded-md bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="h-3 w-56 rounded-md bg-gray-100 dark:bg-gray-700 animate-pulse mt-0.5" />
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <div className="h-5 w-8 rounded-md bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="h-3 w-12 rounded-md bg-gray-100 dark:bg-gray-700 animate-pulse" />
        </div>
      </div>
      <div className="h-px w-full bg-gray-100 dark:bg-gray-700" />
      <div className="flex justify-between">
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3.5 w-24 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="flex gap-1.5">
           <div className="h-5 w-10 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
           <div className="h-5 w-10 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

const ChamCongMobileList = memo(function ChamCongMobileList({
  data,
  isLoading,
}: ChamCongMobileListProps) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="flex flex-col gap-3 p-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          data.map((row, idx) => (
            <ChamCongMobileCard
              key={row.id}
              row={row}
              index={idx}
            />
          ))
        )}
      </div>
    </div>
  )
})

export default ChamCongMobileList

