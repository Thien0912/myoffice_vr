import { cn, Spinner } from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAdminGridData } from '../hooks/useAdminGridData'
import { OvertimeRequest } from '../types'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import {
  EmployeeRow,
  SkeletonRow,
  GroupTotalBadge,
  GridHeader,
  GroupHeaderRow,
  EmptyState,
  EMPTY_SET,
  EMPTY_STRING_SET
} from './AdminOvertimeGrid/index'

interface AdminOvertimeGridViewProps {
  data: OvertimeRequest[]
  startDate: Date
  endDate: Date
  showTotalHoursColumn: boolean
  isLoading?: boolean
  onRowClick?: (req: OvertimeRequest) => void
  selectedRequests?: Set<number>
  onSelectRequest?: (reqId: number, selected: boolean) => void
  onSelectAll?: (ids: number[], selected: boolean) => void
  page?: number
  totalRecords?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onScrollY?: (scrollTop: number) => void
}

const AdminOvertimeGridView = React.memo(function AdminOvertimeGridView({
  data,
  startDate,
  endDate,
  showTotalHoursColumn: propShowTotalHoursColumn,
  isLoading = false,
  onRowClick,
  selectedRequests = EMPTY_SET,
  onSelectRequest,
  onSelectAll,
  page = 1,
  totalRecords = 0,
  pageSize = 200,
  onPageChange,
  onScrollY
}: AdminOvertimeGridViewProps) {
  const { dates, groupedData } = useAdminGridData(data, startDate, endDate)
  const [hiddenGroupStatuses, setHiddenGroupStatuses] = useState<Record<string, Set<string>>>({})

  // Use refs for scroll state to avoid re-renders on every scroll pixel (Rule 5.12)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isScrolledXRef = useRef(false)
  const isScrolledYRef = useRef(false)
  const theadRef = useRef<HTMLTableSectionElement>(null)

  // Separate state only for thead shadow (only changes on boundary 0 -> >0)
  const [showHeaderShadow, setShowHeaderShadow] = useState(false)
  const [showLeftShadow, setShowLeftShadow] = useState(false)

  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    groupedData.forEach(g => { initial[g.ten_don_vi] = false })
    return initial
  })

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [searchText, setSearchText] = useState('')
  const [pinnedEmployees, setPinnedEmployees] = useState<Set<number>>(new Set())
  
  const [theadHeight, setTheadHeight] = useState(113)

  const [showTotalHoursColumn, setShowTotalHoursColumn] = useState(propShowTotalHoursColumn)
  const [totalHoursByDayType, setTotalHoursByDayType] = useState<Record<number, { NT: number; CN: number; LE: number }>>({})
  const [isLoadingTotalHours, setIsLoadingTotalHours] = useState(false)
  const [totalHoursViewMode, setTotalHoursViewMode] = useState<'hours' | 'days'>('hours')

  // Hoist today's dateStr
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA'), [])
  const fetchTotalHours = useCallback(async () => {
    if (!startDate || !endDate) return
    
    setIsLoadingTotalHours(true)
    try {
      const startDateStr = startDate.toLocaleDateString('en-CA')
      const endDateStr = endDate.toLocaleDateString('en-CA')
      const response = await ngoaiGioAxios.getTongGioTheoLoaiNgay({
        start_date: startDateStr,
        end_date: endDateStr
      })
      if (response?.data) {
        setTotalHoursByDayType(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch total hours by day type:', error)
    } finally {
      setIsLoadingTotalHours(false)
    }
  }, [startDate, endDate])

  // Fetch data khi startDate/endDate thay đổi hoặc khi toggle ON lần đầu
  useEffect(() => {
    if (showTotalHoursColumn) {
      fetchTotalHours()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, showTotalHoursColumn])

  // Merge tổng giờ theo loại ngày vào employee data (tạo bản sao mới để trigger re-render)
  const groupedDataWithTotalHours = useMemo(() => {
    return groupedData.map(dept => ({
      ...dept,
      employees: dept.employees.map(emp => {
        const empHours = totalHoursByDayType[emp.id_nhan_vien]
        const hoursNT = empHours?.NT || 0
        const hoursCN = empHours?.CN || 0
        const hoursLE = empHours?.LE || 0
        const daysNT = hoursNT / 8
        const daysCN = hoursCN / 8
        const daysLE = hoursLE / 8
        return {
          ...emp,
          totalHoursNT: hoursNT,
          totalHoursCN: hoursCN,
          totalHoursLE: hoursLE,
          totalDaysNT: daysNT,
          totalDaysCN: daysCN,
          totalDaysLE: daysLE,
          totalHoursSum: hoursNT + hoursCN + hoursLE,
          totalDaysSum: daysNT + daysCN + daysLE
        }
      })
    }))
  }, [groupedData, totalHoursByDayType])

  // Toggle hiển thị cột ngay lập tức, không đợi data
  useEffect(() => {
    if (propShowTotalHoursColumn !== showTotalHoursColumn) {
      startTransition(() => {
        setShowTotalHoursColumn(propShowTotalHoursColumn)
      })
    }
  }, [propShowTotalHoursColumn, showTotalHoursColumn])

  useEffect(() => {
    if (!theadRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTheadHeight(entry.target.getBoundingClientRect().height)
      }
    })
    observer.observe(theadRef.current)
    return () => observer.disconnect()
  }, [dates])

  const onScrollYRef = useRef(onScrollY)
  useEffect(() => {
    onScrollYRef.current = onScrollY
  }, [onScrollY])

  // Optimized scroll handler: only setState when crossing the 0 boundary (Rule 5.12)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrolledX = container.scrollLeft > 0
      const scrolledY = container.scrollTop > 0

      if (scrolledX !== isScrolledXRef.current) {
        isScrolledXRef.current = scrolledX
        setShowLeftShadow(scrolledX)
      }
      if (scrolledY !== isScrolledYRef.current) {
        isScrolledYRef.current = scrolledY
        setShowHeaderShadow(scrolledY)
      }
      
      onScrollYRef.current?.(container.scrollTop)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setSearchText(inputValue), 400)
    return () => clearTimeout(timer)
  }, [inputValue])

  const togglePinEmployee = useCallback((empId: number) => {
    setPinnedEmployees(prev => {
      const next = new Set(prev)
      if (next.has(empId)) next.delete(empId)
      else next.add(empId)
      return next
    })
  }, [])

  const toggleDept = useCallback((deptName: string) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptName]: !(prev[deptName] ?? true)
    }))
  }, [])

  const toggleGroupStatus = useCallback((groupName: string, status: string) => {
    setHiddenGroupStatuses(prev => {
      const groupSet = new Set(prev[groupName] || [])
      if (groupSet.has(status)) groupSet.delete(status)
      else groupSet.add(status)
      return { ...prev, [groupName]: groupSet }
    })
  }, [])

  const allPendingIds = useMemo(() => {
    const ids: number[] = []
    groupedDataWithTotalHours.forEach(group => {
      const groupHidden = hiddenGroupStatuses[group.ten_don_vi] || EMPTY_STRING_SET
      if (groupHidden.has('Cho_duyet')) return

      group.employees.forEach(emp => {
        Object.values(emp.requests).forEach(reqs => {
          reqs.forEach(req => {
            if (req?.trang_thai_tong === 'Cho_duyet') {
              ids.push(req.id_ngoai_gio)
            }
          })
        })
      })
    })
    return ids
  }, [groupedDataWithTotalHours, hiddenGroupStatuses, EMPTY_STRING_SET])

  const isAllPendingSelected = allPendingIds.length > 0 &&
    allPendingIds.every(id => selectedRequests.has(id))

  const isSomePendingSelected = allPendingIds.some(id => selectedRequests.has(id)) && !isAllPendingSelected

  const colCount = dates.length

  // Tối ưu performance: tắt transition khi có quá nhiều rows
  const totalEmployeeCount = useMemo(() => {
    return groupedDataWithTotalHours.reduce((sum, dept) => sum + dept.employees.length, 0)
  }, [groupedDataWithTotalHours])
  const shouldDisableTransition = totalEmployeeCount > 50
  const transitionClass = shouldDisableTransition ? 'duration-0' : 'duration-200'

  return (
    <div className="flex-1 w-full bg-white dark:bg-gray-900 shadow-sm border-t border-b border-l border-gray-200/60 dark:border-gray-800 overflow-hidden flex flex-col h-full relative z-0">

      {/* Global Loading Overlay for Pagination/Data Fetching */}
      {isLoading && (
        <div className="absolute inset-0 z-[200] bg-white/40 dark:bg-gray-900/40 backdrop-blur-[1.5px] flex items-center justify-center transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
            <Spinner size="lg" color="primary" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Đang xử lý dữ liệu...</span>
          </div>
        </div>
      )}

      {/* Loading Overlay khi đang fetch dữ liệu tổng giờ */}
      {isLoadingTotalHours && showTotalHoursColumn && (
        <div className="absolute top-4 right-6 z-100 bg-white dark:bg-gray-800 shadow-xl rounded-full px-4 py-2 flex items-center justify-center gap-2 border border-blue-100 dark:border-blue-900/50 animate-pulse transition-opacity">
          <Spinner size="sm" color="primary" />
          <span className="text-[13px] font-medium text-blue-600 dark:text-blue-400">
            Đang tải dữ liệu tổng giờ...
          </span>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto custom-scrollbar relative"
        style={{ willChange: 'scroll-position', contain: 'strict' } as React.CSSProperties}
      >
        <table className="table-fixed w-max min-w-full border-separate border-spacing-0 text-sm text-left h-full">
          <GridHeader
            dates={dates}
            showTotalHoursColumn={showTotalHoursColumn}
            totalHoursViewMode={totalHoursViewMode}
            setTotalHoursViewMode={setTotalHoursViewMode}
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            inputValue={inputValue}
            setInputValue={setInputValue}
            allPendingIds={allPendingIds}
            selectedRequests={selectedRequests}
            onSelectAll={onSelectAll}
            transitionClass={transitionClass}
            todayStr={todayStr}
            theadRef={theadRef}
            showHeaderShadow={showHeaderShadow}
          />

          <tbody className="bg-white dark:bg-gray-900">
            {/* Loading State */}
            {isLoading && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={`skeleton-${i}`} colCount={colCount} showTotalHoursColumn={showTotalHoursColumn} />
                ))}
              </>
            )}



            {/* Data */}
            {!isLoading && groupedDataWithTotalHours.map((group) => {
              const isExpanded = expandedDepts[group.ten_don_vi] ?? false
              const filteredEmployees = group.employees.filter(emp =>
                emp.ho_va_ten.toLowerCase().includes(searchText.toLowerCase()) ||
                emp.ma_nhan_vien.toLowerCase().includes(searchText.toLowerCase())
              )

              if (filteredEmployees.length === 0) return null

              return (
                <React.Fragment key={`dept-${group.ten_don_vi}`}>
                  <GroupHeaderRow
                    groupName={group.ten_don_vi}
                    isExpanded={isExpanded}
                    employeeCount={filteredEmployees.length}
                    stats={group.stats}
                    totalHours={group.stats.totalHours}
                    hiddenStatuses={hiddenGroupStatuses[group.ten_don_vi] || EMPTY_STRING_SET}
                    theadHeight={theadHeight}
                    showLeftShadow={showLeftShadow}
                    showHeaderShadow={showHeaderShadow}
                    datesLength={dates.length}
                    onToggleDept={toggleDept}
                    onToggleGroupStatus={toggleGroupStatus}
                  />

                  {/* Employee Rows */}
                  {isExpanded && filteredEmployees.map((emp) => {
                    const groupHiddenStatuses = hiddenGroupStatuses[group.ten_don_vi] || EMPTY_STRING_SET
                    return (
                      <EmployeeRow
                        key={emp.id_nhan_vien}
                        emp={emp}
                        dates={dates}
                        hiddenStatuses={groupHiddenStatuses}
                        showTotalHoursColumn={showTotalHoursColumn}
                        totalHoursViewMode={totalHoursViewMode}
                        isPinned={pinnedEmployees.has(emp.id_nhan_vien)}
                        isScrolledX={showLeftShadow}
                        selectedRequests={selectedRequests}
                        onRowClick={onRowClick}
                        onSelectRequest={onSelectRequest}
                        onSelectAll={onSelectAll}
                        onTogglePin={togglePinEmployee}
                        transitionClass={transitionClass}
                      />
                    )
                  })}
                </React.Fragment>
              )
            })}

            {/* Filler Row (Empty Space) */}
            {!isLoading && groupedDataWithTotalHours.length > 0 && (
              <tr className="h-full bg-white dark:bg-gray-900">
                <td className="sticky left-0 min-w-[250px] w-[250px] max-w-[250px] z-10 bg-white dark:bg-[#1e1e1e] border-r border-[#dadce0] dark:border-gray-700 transition-colors"></td>
                {dates.map((d) => {
                  const isWeekend = d.dayOfWeek === 0
                  const baseBg = isWeekend ? 'bg-orange-50/80 dark:bg-orange-900/20' : 'bg-white dark:bg-gray-900'
                  return <td key={`filler-${d.dateStr}`} className={cn("border-r border-[#dadce0] dark:border-gray-700 w-[100px] p-0 m-0", baseBg)}></td>
                })}
                {/* Total Columns (4 columns) */}
                <td className={cn("sticky right-[180px] z-20 bg-gray-50 dark:bg-gray-800 border-l-gray-300 dark:border-l-gray-600 border-[#dadce0] dark:border-gray-700 transition-[width] ease-in-out", transitionClass, showTotalHoursColumn ? "w-[60px] border-l-2 border-r shadow-[-5px_0_10px_-2px_rgba(0,0,0,0.08)]" : "w-0 border-l-0")}></td>
                <td className={cn("sticky right-[120px] z-20 bg-gray-50 dark:bg-gray-800 border-[#dadce0] dark:border-gray-700 transition-[width] ease-in-out", transitionClass, showTotalHoursColumn ? "w-[60px] border-r" : "w-0 border-r-0")}></td>
                <td className={cn("sticky right-[60px] z-20 bg-gray-50 dark:bg-gray-800 border-[#dadce0] dark:border-gray-700 transition-[width] ease-in-out", transitionClass, showTotalHoursColumn ? "w-[60px] border-r" : "w-0 border-r-0")}></td>
                <td className={cn("sticky right-0 z-20 bg-gray-50 dark:bg-gray-800 border-[#dadce0] dark:border-gray-700 transition-[width] ease-in-out", transitionClass, showTotalHoursColumn ? "w-[60px]" : "w-0")}></td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Empty State Overlay — outside table so it's always visible without horizontal scroll */}
        {!isLoading && groupedDataWithTotalHours.length === 0 && (
          <div className="absolute inset-0 top-[80px] flex items-center justify-center pointer-events-none">
            <EmptyState />
          </div>
        )}
      </div>

      {/* Pagination bar */}
      {totalRecords > pageSize && onPageChange && (
        <div className="flex-none flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Hiển thị {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalRecords)} / {totalRecords.toLocaleString('vi-VN')} đơn
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.ceil(totalRecords / pageSize) }, (_, i) => i + 1)
              .filter(p => p === 1 || p === Math.ceil(totalRecords / pageSize) || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-xs text-gray-400 px-1">…</span>
                  )}
                  <button
                    onClick={() => onPageChange(p)}
                    className={cn(
                      'min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors',
                      p === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))
            }
            <button
              disabled={page >= Math.ceil(totalRecords / pageSize)}
              onClick={() => onPageChange(page + 1)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

export default AdminOvertimeGridView
