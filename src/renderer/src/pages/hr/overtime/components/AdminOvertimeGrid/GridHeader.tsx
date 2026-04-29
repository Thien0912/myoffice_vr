import React from 'react'
import { cn, Input, Tabs, Tab } from '@heroui/react'
import { Search, X } from 'lucide-react'
import { GridHeaderProps } from './types'
import { DAY_NAMES } from './constants'

export const GridHeader = React.memo(function GridHeader({
  dates,
  showTotalHoursColumn,
  totalHoursViewMode,
  setTotalHoursViewMode,
  isSearchOpen,
  setIsSearchOpen,
  inputValue,
  setInputValue,
  allPendingIds,
  selectedRequests,
  onSelectAll,
  transitionClass,
  todayStr,
  theadRef,
  showHeaderShadow
}: GridHeaderProps) {
  const isAllPendingSelected = allPendingIds.length > 0 &&
    allPendingIds.every(id => selectedRequests.has(id))
  const isSomePendingSelected = allPendingIds.some(id => selectedRequests.has(id)) && !isAllPendingSelected

  return (
    <thead ref={theadRef} className={cn(
      "sticky top-0 z-50 bg-white dark:bg-gray-900 [&>tr>th]:border-b [&>tr>th]:border-gray-200 dark:[&>tr>th]:border-gray-700 transition-shadow duration-200",
      showHeaderShadow && "shadow-[0_5px_10px_-2px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_10px_-2px_rgba(0,0,0,0.4)]"
    )}>
      {/* Header Row 1 */}
      <tr>
        <th rowSpan={2} style={{ minWidth: 180, maxWidth: 180, width: 180 }} className="sticky left-0 z-60 bg-white dark:bg-gray-900 border-r border-[#dadce0] dark:border-gray-700 p-2 font-medium text-center align-middle whitespace-nowrap text-[#70757a] dark:text-gray-400 group">
          <div className="flex flex-col items-center justify-center w-full px-1">
            <div className="flex items-center justify-center gap-2">
              <span>NHÂN VIÊN</span>
            </div>
          </div>
          {allPendingIds.length > 0 && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                onSelectAll?.(allPendingIds, !isAllPendingSelected)
              }}
              className={cn(
                "absolute top-2 right-2 w-[18px] h-[18px] rounded-full flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer shadow-sm z-20 border",
                isAllPendingSelected
                  ? "bg-blue-600 border-blue-600 text-white scale-100"
                  : isSomePendingSelected
                    ? "bg-blue-600 border-blue-600 text-white scale-100"
                    : "bg-white/40 border-gray-300 text-transparent hover:scale-110 hover:bg-white hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 scale-100"
              )}
              title={isAllPendingSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            >
              {isSomePendingSelected ? (
                <div className="w-2.5 h-[2px] bg-white rounded-full transition-all duration-300 scale-100" />
              ) : (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-all duration-300", isAllPendingSelected ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
                  <polyline points="1.5 4.5 3.5 6.5 8.5 1.5"></polyline>
                </svg>
              )}
            </div>
          )}
        </th>
        {dates.map((d) => {
          const isWeekend = d.dayOfWeek === 0
          const baseBg = isWeekend ? 'bg-orange-50/80 dark:bg-orange-900/20' : ''
          return (
            <th key={`date-${d.dateStr}`} className={cn("relative z-0 border-r border-[#dadce0] dark:border-gray-700 pt-3 px-1 text-center whitespace-nowrap min-w-[86px] w-[86px] max-w-[86px] align-bottom", baseBg)}>
              <div className="text-[11px] font-medium text-[#70757a] dark:text-gray-400 uppercase tracking-wider mb-1">
                {DAY_NAMES[d.dayOfWeek]}
              </div>
            </th>
          )
        })}
        <th colSpan={4} className={cn(
          "sticky right-0 z-55 bg-white dark:bg-gray-900 border-l-gray-300 dark:border-l-gray-600 border-[#dadce0] dark:border-gray-700 text-center font-medium whitespace-nowrap text-[#70757a] dark:text-gray-400 transition-[width,opacity] ease-in-out border-b",
          transitionClass,
          showTotalHoursColumn ? "border-l-2 p-0! w-[240px] min-w-[240px] max-w-[240px] opacity-100 shadow-[-5px_0_10px_-2px_rgba(0,0,0,0.08)]" : "border-l-0 p-0 w-0 min-w-0 max-w-0 opacity-0 overflow-hidden text-transparent"
        )}>
          <div className="w-[240px] flex items-center justify-center">
            <Tabs
              selectedKey={totalHoursViewMode}
              onSelectionChange={(key) => setTotalHoursViewMode(key as 'hours' | 'days')}
              size="sm"
              variant="light"
              fullWidth
              classNames={{
                base: "w-full",
                tabList: "bg-gray-100 dark:bg-gray-800 gap-0.5 w-full",
                tab: "min-w-0 font-medium",
                cursor: "bg-white dark:bg-gray-700 shadow-sm",
              }}
            >
              <Tab key="hours" title="Giờ" />
              <Tab key="days" title="Ngày" />
            </Tabs>
          </div>
        </th>
      </tr>

      {/* Header Row 2: Day Numbers */}
      <tr>
        {dates.map((d) => {
          const isWeekend = d.dayOfWeek === 0
          const baseBg = isWeekend ? 'bg-orange-50/80 dark:bg-orange-900/20' : ''
          return (
            <th key={`day-${d.dateStr}`} className={cn("border-r border-[#dadce0] dark:border-gray-700 py-1.5 px-0 text-center whitespace-nowrap min-w-[86px] w-[86px] max-w-[86px]", baseBg)}>
              <div className={cn(
                "text-xl font-normal mx-auto h-10 px-3 w-fit flex items-center justify-center rounded-full leading-none",
                d.dateStr === todayStr
                  ? "bg-[#1a73e8] text-white"
                  : "text-black dark:text-gray-200"
              )}>
                {d.day}/{d.month}
              </div>
            </th>
          )
        })}
        {totalHoursViewMode === 'hours' ? (
          <>
            <th className={cn(
              "sticky right-[180px] z-55 bg-white dark:bg-gray-900 border-l-gray-300 dark:border-l-gray-600 border-[#dadce0] dark:border-gray-700 border-b border-r text-center font-medium text-xs text-[#70757a] dark:text-gray-400 transition-[width,opacity] ease-in-out",
              transitionClass,
              showTotalHoursColumn ? "border-l-2 p-1 w-[60px] min-w-[60px] max-w-[60px] opacity-100 shadow-[-5px_0_10px_-2px_rgba(0,0,0,0.08)]" : "border-l-0 border-r-0 p-0 w-0 min-w-0 max-w-0 opacity-0 overflow-hidden text-transparent"
            )}>
              <div className="w-[60px] flex flex-col items-center justify-center leading-tight">
                <span className="font-bold">Tổng</span>
                <span className="text-[9px] opacity-60">(Giờ)</span>
              </div>
            </th>
            <th className={cn(
              "sticky right-[120px] z-55 bg-white dark:bg-gray-900 border-[#dadce0] dark:border-gray-700 border-b border-r text-center font-medium text-xs text-[#70757a] dark:text-gray-400 transition-[width,opacity] ease-in-out",
              transitionClass,
              showTotalHoursColumn ? "p-1 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "border-r-0 p-0 w-0 min-w-0 max-w-0 opacity-0 overflow-hidden text-transparent"
            )}>
              <div className="w-[60px] flex flex-col items-center justify-center leading-tight">
                <span className="font-bold">NT</span>
                <span className="text-[9px] opacity-60">(Giờ)</span>
              </div>
            </th>
            <th className={cn(
              "sticky right-[60px] z-55 bg-white dark:bg-gray-900 border-[#dadce0] dark:border-gray-700 border-b border-r text-center font-medium text-xs text-[#70757a] dark:text-gray-400 transition-[width,opacity] ease-in-out",
              transitionClass,
              showTotalHoursColumn ? "p-1 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "border-r-0 p-0 w-0 min-w-0 max-w-0 opacity-0 overflow-hidden text-transparent"
            )}>
              <div className="w-[60px] flex flex-col items-center justify-center leading-tight">
                <span className="font-bold">CN</span>
                <span className="text-[9px] opacity-60">(Giờ)</span>
              </div>
            </th>
            <th className={cn(
              "sticky right-0 z-55 bg-white dark:bg-gray-900 border-b text-center font-medium text-xs text-[#70757a] dark:text-gray-400 transition-[width,opacity] ease-in-out",
              transitionClass,
              showTotalHoursColumn ? "p-1 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "p-0 w-0 min-w-0 max-w-0 opacity-0 overflow-hidden text-transparent"
            )}>
              <div className="w-[60px] flex flex-col items-center justify-center leading-tight">
                <span className="font-bold">LỄ</span>
                <span className="text-[9px] opacity-60">(Giờ)</span>
              </div>
            </th>
          </>
        ) : (
          <>
            <th className={cn(
              "sticky right-[180px] z-55 bg-white dark:bg-gray-900 border-l-gray-300 dark:border-l-gray-600 border-[#dadce0] dark:border-gray-700 border-b border-r text-center font-medium text-xs text-[#70757a] dark:text-gray-400 transition-[width,opacity] ease-in-out",
              transitionClass,
              showTotalHoursColumn ? "border-l-2 p-1 w-[60px] min-w-[60px] max-w-[60px] opacity-100 shadow-[-5px_0_10px_-2px_rgba(0,0,0,0.08)]" : "border-l-0 border-r-0 p-0 w-0 min-w-0 max-w-0 opacity-0 overflow-hidden text-transparent"
            )}>
              <div className="w-[60px] flex flex-col items-center justify-center leading-tight">
                <span className="font-bold">Tổng</span>
                <span className="text-[9px] opacity-60">(Ngày)</span>
              </div>
            </th>
            <th className={cn(
              "sticky right-[120px] z-55 bg-white dark:bg-gray-900 border-[#dadce0] dark:border-gray-700 border-b border-r text-center font-medium text-xs text-[#70757a] dark:text-gray-400 transition-[width,opacity] ease-in-out",
              transitionClass,
              showTotalHoursColumn ? "p-1 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "border-r-0 p-0 w-0 min-w-0 max-w-0 opacity-0 overflow-hidden text-transparent"
            )}>
              <div className="w-[60px] flex flex-col items-center justify-center leading-tight">
                <span className="font-bold">CN</span>
                <span className="text-[9px] opacity-60">(Ngày)</span>
              </div>
            </th>
            <th className={cn(
              "sticky right-[60px] z-55 bg-white dark:bg-gray-900 border-[#dadce0] dark:border-gray-700 border-b border-r text-center font-medium text-xs text-[#70757a] dark:text-gray-400 transition-[width,opacity] ease-in-out",
              transitionClass,
              showTotalHoursColumn ? "p-1 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "border-r-0 p-0 w-0 min-w-0 max-w-0 opacity-0 overflow-hidden text-transparent"
            )}>
              <div className="w-[60px] flex flex-col items-center justify-center leading-tight">
                <span className="font-bold">LỄ</span>
                <span className="text-[9px] opacity-60">(Ngày)</span>
              </div>
            </th>
            <th className={cn(
              "sticky right-0 z-55 bg-white dark:bg-gray-900 border-b text-center font-medium text-xs text-[#70757a] dark:text-gray-400 transition-[width,opacity] ease-in-out",
              transitionClass,
              showTotalHoursColumn ? "p-1 w-[60px] min-w-[60px] max-w-[60px] opacity-100" : "p-0 w-0 min-w-0 max-w-0 opacity-0 overflow-hidden text-transparent"
            )}>
              <div className="w-[60px] flex flex-col items-center justify-center leading-tight">
                <span className="font-bold">KHÁC</span>
                <span className="text-[9px] opacity-60">(Ngày)</span>
              </div>
            </th>
          </>
        )}
      </tr>
    </thead>
  )
})
