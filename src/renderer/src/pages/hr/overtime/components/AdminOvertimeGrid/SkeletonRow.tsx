import React from 'react'
import { Skeleton } from '@heroui/react'

interface SkeletonRowProps {
  colCount: number
  showTotalHoursColumn?: boolean
}

export const SkeletonRow = React.memo(function SkeletonRow({ colCount, showTotalHoursColumn }: SkeletonRowProps) {
  return (
    <tr>
      <td className="p-2 border-r border-b border-[#dadce0] dark:border-gray-700">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-28 rounded-md" />
          <Skeleton className="h-2.5 w-16 rounded-md" />
        </div>
      </td>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="p-1 border-r border-b border-gray-200 dark:border-gray-800">
          {i % 3 === 0 && <Skeleton className="h-10 w-full rounded-lg" />}
        </td>
      ))}
      {/* Sticky Total Columns — only when showTotalHoursColumn is enabled */}
      {showTotalHoursColumn && (
        <>
          <td className="sticky right-[180px] z-20 bg-gray-50 dark:bg-gray-800 p-2 border-r border-b border-[#dadce0] dark:border-gray-700">
            <Skeleton className="h-4 w-8 rounded-md mx-auto" />
          </td>
          <td className="sticky right-[120px] z-20 bg-gray-50 dark:bg-gray-800 p-2 border-r border-b border-[#dadce0] dark:border-gray-700">
            <Skeleton className="h-4 w-8 rounded-md mx-auto" />
          </td>
          <td className="sticky right-[60px] z-20 bg-gray-50 dark:bg-gray-800 p-2 border-r border-b border-[#dadce0] dark:border-gray-700">
            <Skeleton className="h-4 w-8 rounded-md mx-auto" />
          </td>
          <td className="sticky right-0 z-20 bg-gray-50 dark:bg-gray-800 p-2 border-b border-[#dadce0] dark:border-gray-700">
            <Skeleton className="h-4 w-8 rounded-md mx-auto" />
          </td>
        </>
      )}
    </tr>
  )
})
