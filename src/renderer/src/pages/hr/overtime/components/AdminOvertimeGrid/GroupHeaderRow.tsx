import React from 'react'
import { cn } from '@heroui/react'
import { ChevronDown, ChevronRight, Users } from 'lucide-react'
import { GroupHeaderRowProps } from './types'
import { EMPTY_STRING_SET } from './constants'

const StatusBadge = React.memo(function StatusBadge({
  count,
  label,
  status,
  isHidden,
  onClick
}: {
  count: number
  label: string
  status: string
  isHidden: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  const colorMap: Record<string, { active: string; ghost: string }> = {
    Da_duyet: {
      active: 'bg-[#33b679] text-white border-[#33b679] shadow-sm hover:bg-[#2b9c68]',
      ghost: 'bg-transparent text-[#33b679] border-[#33b679]/60 hover:bg-green-50 dark:hover:bg-[#33b679]/10'
    },
    Cho_duyet: {
      active: 'bg-[#039be5] text-white border-[#039be5] shadow-sm hover:bg-[#0284c7]',
      ghost: 'bg-transparent text-[#039be5] border-[#039be5]/60 hover:bg-blue-50 dark:hover:bg-[#039be5]/10'
    },
    Tu_choi: {
      active: 'bg-[#e53935] text-white border-[#e53935] shadow-sm hover:bg-[#c62828]',
      ghost: 'bg-transparent text-[#e53935] border-[#e53935]/60 hover:bg-red-50 dark:hover:bg-[#e53935]/10'
    },
    Huy: {
      active: 'bg-gray-500 text-white border-gray-500 shadow-sm hover:bg-gray-600',
      ghost: 'bg-transparent text-gray-500 border-gray-500/60 hover:bg-gray-50 dark:hover:bg-gray-500/10'
    }
  }
  const c = colorMap[status] ?? colorMap.Cho_duyet

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150 cursor-pointer select-none shrink-0',
        isHidden ? c.ghost : c.active
      )}
    >
      <span className={cn('w-[5px] h-[5px] rounded-full inline-block shrink-0', isHidden ? 'border border-current' : 'bg-white/70')} />
      <span>{count}</span>
      <span className='font-medium opacity-85'>{label}</span>
    </button>
  )
})

export const GroupHeaderRow = React.memo(function GroupHeaderRow({
  groupName,
  isExpanded,
  employeeCount,
  stats,
  hiddenStatuses,
  totalHours,
  theadHeight,
  showLeftShadow,
  showHeaderShadow,
  onToggleDept,
  onToggleGroupStatus,
  datesLength
}: GroupHeaderRowProps) {
  return (
    <tr
      className='cursor-pointer group select-none h-px'
      onClick={() => onToggleDept(groupName)}
    >
      {/* Sticky name cell */}
      <td
        colSpan={1}
        style={{ top: `${theadHeight}px` }}
        className={cn(
          'sticky left-0 z-45 bg-slate-100/95 dark:bg-gray-800/95 backdrop-blur-sm',
          'group-hover:bg-slate-200/95 dark:group-hover:bg-gray-700/95 transition-colors duration-150',
          'border-y border-r-2 border-slate-200 dark:border-gray-700 border-r-slate-300 dark:border-r-gray-600',
          'min-w-[180px] w-[180px] max-w-[180px] py-2 px-3',
          showLeftShadow && 'shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_-2px_rgba(0,0,0,0.25)]'
        )}
      >
        <div className='flex items-center gap-2 w-full min-w-0'>
          {/* Chevron */}
          <span className='shrink-0 text-gray-500 dark:text-gray-400'>
            {isExpanded
              ? <ChevronDown size={15} className='transition-transform duration-200' />
              : <ChevronRight size={15} className='transition-transform duration-200' />
            }
          </span>

          {/* Dept name */}
          <span
            className='font-semibold text-[13px] text-gray-800 dark:text-gray-100 truncate flex-1 min-w-0'
            title={groupName}
          >
            {groupName}
          </span>

          {/* Employee count pill — always rendered, no overflow tricks */}
          <span className='shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-[11px] text-gray-500 dark:text-gray-400 shadow-xs'>
            <Users size={10} className='shrink-0' />
            {employeeCount}
          </span>
        </div>
      </td>

      {/* Stats cell — spans remaining columns */}
      <td
        colSpan={datesLength + 4}
        style={{ top: `${theadHeight}px` }}
        className={cn(
          'sticky z-35 bg-slate-100/95 dark:bg-gray-800/95 backdrop-blur-sm',
          'group-hover:bg-slate-200/95 dark:group-hover:bg-gray-700/95 transition-colors duration-150',
          'border-y border-slate-200 dark:border-gray-700',
          showHeaderShadow && 'shadow-[0_1px_4px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_-2px_rgba(0,0,0,0.2)]'
        )}
      >
        <div className='flex items-center gap-2 px-3 h-full'>
          {/* Status badges */}
          {stats.approvedRequests > 0 && (
            <StatusBadge
              count={stats.approvedRequests}
              label='Đã duyệt'
              status='Da_duyet'
              isHidden={hiddenStatuses.has('Da_duyet')}
              onClick={(e) => { e.stopPropagation(); onToggleGroupStatus(groupName, 'Da_duyet') }}
            />
          )}
          {stats.pendingRequests > 0 && (
            <StatusBadge
              count={stats.pendingRequests}
              label='Chờ duyệt'
              status='Cho_duyet'
              isHidden={hiddenStatuses.has('Cho_duyet')}
              onClick={(e) => { e.stopPropagation(); onToggleGroupStatus(groupName, 'Cho_duyet') }}
            />
          )}
          {stats.rejectedRequests > 0 && (
            <StatusBadge
              count={stats.rejectedRequests}
              label='Từ chối'
              status='Tu_choi'
              isHidden={hiddenStatuses.has('Tu_choi')}
              onClick={(e) => { e.stopPropagation(); onToggleGroupStatus(groupName, 'Tu_choi') }}
            />
          )}
          {stats.canceledRequests > 0 && (
            <StatusBadge
              count={stats.canceledRequests}
              label='Hủy'
              status='Huy'
              isHidden={hiddenStatuses.has('Huy')}
              onClick={(e) => { e.stopPropagation(); onToggleGroupStatus(groupName, 'Huy') }}
            />
          )}

          {/* Divider */}
          {(stats.approvedRequests > 0 || stats.pendingRequests > 0 || stats.rejectedRequests > 0 || stats.canceledRequests > 0) && (
            <div className='w-px h-4 bg-slate-300 dark:bg-gray-600 shrink-0 mx-0.5' />
          )}

          {/* Total hours chip */}
          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-[11px] font-semibold text-gray-600 dark:text-gray-300 shadow-xs shrink-0 select-none'>
            ⏱ Tổng: <span className='text-gray-800 dark:text-gray-100'>{totalHours.toFixed(1)}h</span>
          </span>
        </div>
      </td>
    </tr>
  )
})
