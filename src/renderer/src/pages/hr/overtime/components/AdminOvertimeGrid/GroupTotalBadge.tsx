import React from 'react'
import { DepartmentGridGroup } from '../../hooks/useAdminGridData'

interface GroupTotalBadgeProps {
  group: DepartmentGridGroup
  hiddenStatuses: Set<string>
}

export const GroupTotalBadge = React.memo(function GroupTotalBadge({ 
  group, 
  hiddenStatuses 
}: GroupTotalBadgeProps) {
  let visibleGroupTotal = 0
  
  group.employees.forEach(emp => {
    Object.values(emp.requests).forEach(reqs => {
      reqs.forEach(r => {
        if (!hiddenStatuses.has(r.trang_thai_tong)) {
          visibleGroupTotal += Number(r.so_gio) || 0
        }
      })
    })
  })

  return (
    <span className="text-[#3c4043] dark:text-gray-200 bg-white dark:bg-gray-700 px-2.5 py-1 rounded-[4px] border border-gray-200 dark:border-gray-600 shadow-sm shrink-0 select-none">
      Tổng: {visibleGroupTotal?.toFixed(1)}h
    </span>
  )
})
