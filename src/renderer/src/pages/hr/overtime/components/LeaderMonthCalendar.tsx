import React, { useMemo, useState } from 'react'
import { cn, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import { OvertimeRequest } from '../types'
import { useMonthCalendarData, MonthCalendarDay } from '../hooks/useMonthCalendarData'

interface LeaderMonthCalendarProps {
  data: OvertimeRequest[]
  startDate: Date
  endDate: Date
  isLoading?: boolean
  selectedRequests?: Set<number>
  onSelectRequest?: (id: number, selected: boolean) => void
  onSelectAll?: (ids: number[], selected: boolean) => void
  onDayClick?: (date: Date) => void
  onRowClick?: (req: OvertimeRequest) => void
}

const colorPresets = [
  'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
]

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Cho_duyet':
      return <span className="text-[9px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">Chờ duyệt</span>
    case 'Da_duyet':
      return <span className="text-[9px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">Đã duyệt</span>
    case 'Tu_choi':
      return <span className="text-[9px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">Từ chối</span>
    case 'Huy':
      return <span className="text-[9px] font-medium bg-gray-200 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600">Đã hủy</span>
    default:
      return <span className="text-[9px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">{status}</span>
  }
}

const DayUnitBadge = ({ 
  unitName, 
  count, 
  hasPending, 
  employees,
  colorClass,
  selectedRequests,
  onSelectRequest,
  onSelectAll,
  onRowClick
}: { 
  unitName: string, 
  count: number, 
  hasPending: boolean, 
  employees: OvertimeRequest[],
  colorClass: string,
  selectedRequests?: Set<number>,
  onSelectRequest?: (id: number, selected: boolean) => void,
  onSelectAll?: (ids: number[], selected: boolean) => void,
  onRowClick?: (req: OvertimeRequest) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const pendingEmployees = employees.filter(emp => emp.trang_thai_tong === 'Cho_duyet');
  const selectedCount = employees.filter(emp => selectedRequests?.has(emp.id_ngoai_gio)).length;
  const isAllSelected = pendingEmployees.length > 0 && pendingEmployees.every(emp => selectedRequests?.has(emp.id_ngoai_gio));
  
  return (
    <Popover 
      placement="right" 
      showArrow 
      offset={10} 
      isOpen={isOpen} 
      onOpenChange={setIsOpen}
      shouldCloseOnBlur={false}
      shouldCloseOnInteractOutside={(e) => {
        if (e && typeof e.closest === 'function') {
          if (e.closest('[role="dialog"]') || e.closest('[data-slot="backdrop"]')) {
            return false;
          }
        }
        return true;
      }}
    >
      <PopoverTrigger>
        <div className={cn(
          "text-[11px] rounded px-1.5 py-1 font-medium truncate flex justify-between items-center cursor-pointer mb-1 shadow-sm transition-opacity hover:opacity-80 border",
          selectedCount > 0 
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-600" 
            : colorClass
        )}>
          <span className="truncate">{unitName} ({count})</span>
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            {selectedCount > 0 && <span className="bg-blue-500 text-white text-[9px] px-1 rounded font-bold leading-tight select-none">✓ {selectedCount}</span>}
            {hasPending && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm" title="Có đơn chờ duyệt" />}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden max-w-[320px] w-full">
        <div className="flex flex-col w-full">
          <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate pr-2" title={unitName}>{unitName}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded-md font-medium border border-gray-200 dark:border-gray-600 shrink-0">{count} người</span>
              <input 
                type="checkbox" 
                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                checked={isAllSelected}
                disabled={pendingEmployees.length === 0}
                title={pendingEmployees.length === 0 ? "Không có đơn chờ duyệt" : "Chọn tất cả đơn chờ duyệt"}
                onChange={(e) => {
                  e.stopPropagation();
                  if (onSelectAll) {
                    onSelectAll(pendingEmployees.map(e => e.id_ngoai_gio), e.target.checked);
                  }
                }}
              />
            </div>
          </div>
          <div className="p-2 max-h-[250px] overflow-y-auto custom-scrollbar">
            <ul className="flex flex-col gap-1">
              {employees.slice(0, 10).map((emp, i) => {
                const isSelected = selectedRequests?.has(emp.id_ngoai_gio) || false;
                const isPending = emp.trang_thai_tong === 'Cho_duyet';
                return (
                <li 
                  key={`${emp.id_nhan_vien}-${i}`} 
                  className={cn(
                    "flex items-start justify-between text-xs hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md cursor-pointer transition-colors group",
                    isSelected && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => onRowClick && onRowClick(emp)}
                >
                  <div className="flex items-start gap-2 overflow-hidden mt-0.5">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      checked={isSelected}
                      disabled={!isPending}
                      title={!isPending ? "Chỉ được chọn duyệt các đơn đang chờ" : ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (isPending && onSelectRequest) onSelectRequest(emp.id_ngoai_gio, e.target.checked);
                      }}
                    />
                    <div className="flex flex-col -mt-0.5">
                      <span className={cn("truncate max-w-[130px] transition-colors leading-tight", isPending ? "text-gray-800 dark:text-gray-200 font-medium group-hover:text-[#1a73e8]" : "text-gray-500 dark:text-gray-500")}>
                        {emp.ho_va_ten}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center">
                        <svg className="w-2.5 h-2.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {emp.gio_bat_dau?.substring(0, 5)} - {emp.gio_ket_thuc?.substring(0, 5)}
                        <span className="ml-1 text-blue-600/80 dark:text-blue-400 font-medium">({emp.so_gio}h)</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-2 mt-0.5">
                    <StatusBadge status={emp.trang_thai_tong} />
                  </div>
                </li>
              )})}
              {employees.length > 10 && (
                <li className="text-xs text-center text-blue-500 pt-1.5 border-t border-gray-100 dark:border-gray-700 mt-1 cursor-pointer hover:underline">
                  + {employees.length - 10} người khác (Click vào "+ N đơn vị" để xem hết)
                </li>
              )}
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const HiddenUnitGroup = ({ 
  unit, 
  isExpanded,
  onToggle,
  selectedRequests, 
  onSelectRequest, 
  onSelectAll, 
  onRowClick 
}: {
  unit: { unitName: string, count: number, hasPending: boolean, employees: OvertimeRequest[] },
  isExpanded: boolean,
  onToggle: () => void,
  selectedRequests?: Set<number>,
  onSelectRequest?: (id: number, selected: boolean) => void,
  onSelectAll?: (ids: number[], selected: boolean) => void,
  onRowClick?: (req: OvertimeRequest) => void 
}) => {
  const pendingEmployees = unit.employees.filter(emp => emp.trang_thai_tong === 'Cho_duyet');
  const isAllUnitSelected = pendingEmployees.length > 0 && pendingEmployees.every(emp => selectedRequests?.has(emp.id_ngoai_gio));

  return (
    <div className="flex flex-col border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <div 
        className="bg-[#f8fafd] dark:bg-[#1a1b1e] px-2 py-1.5 flex justify-between items-center sticky top-0 backdrop-blur-md z-[5] cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <svg className={cn("w-3.5 h-3.5 text-gray-400 transition-transform shrink-0", isExpanded ? "rotate-90" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-[#1a73e8] dark:text-blue-400 text-xs truncate pr-2 select-none" title={unit.unitName}>{unit.unitName}</span>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-[10px] text-[#5f6368] font-semibold bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 shrink-0 shadow-sm">{unit.count} người</span>
          <input 
            type="checkbox" 
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            checked={isAllUnitSelected}
            disabled={pendingEmployees.length === 0}
            title={pendingEmployees.length === 0 ? "Không có đơn chờ duyệt" : "Chọn tất cả đơn chờ duyệt"}
            onChange={(e) => {
              e.stopPropagation();
              if (onSelectAll) {
                onSelectAll(pendingEmployees.map(e => e.id_ngoai_gio), e.target.checked);
              }
            }}
          />
        </div>
      </div>
      {isExpanded && (
        <ul className="flex flex-col px-1 py-1.5">
          {unit.employees.map((emp, i) => {
            const isSelected = selectedRequests?.has(emp.id_ngoai_gio) || false;
            const isPending = emp.trang_thai_tong === 'Cho_duyet';
            return (
            <li 
              key={`${emp.id_nhan_vien}-${i}`} 
              className={cn(
                "flex items-start justify-between text-xs hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md cursor-pointer transition-colors group",
                isSelected && "bg-blue-50 dark:bg-blue-900/20"
              )}
              onClick={() => onRowClick && onRowClick(emp)}
            >
              <div className="flex items-start gap-2 overflow-hidden mt-0.5">
                <input 
                  type="checkbox" 
                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  checked={isSelected}
                  disabled={!isPending}
                  title={!isPending ? "Chỉ được chọn duyệt các đơn đang chờ" : ""}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (isPending && onSelectRequest) onSelectRequest(emp.id_ngoai_gio, e.target.checked);
                  }}
                />
                <div className="flex flex-col -mt-0.5">
                  <span className={cn("truncate max-w-[140px] transition-colors leading-tight", isPending ? "text-[#202124] dark:text-gray-200 font-medium group-hover:text-[#1a73e8]" : "text-gray-500 dark:text-gray-500")}>
                    {emp.ho_va_ten}
                  </span>
                  <span className="text-[10px] text-[#5f6368] dark:text-gray-400 mt-0.5 flex items-center">
                    <svg className="w-2.5 h-2.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {emp.gio_bat_dau?.substring(0, 5)} - {emp.gio_ket_thuc?.substring(0, 5)}
                    <span className="ml-1 text-[#1a73e8] dark:text-blue-400 font-medium">({emp.so_gio}h)</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 ml-2 mt-0.5">
                <StatusBadge status={emp.trang_thai_tong} />
              </div>
            </li>
          )})}
        </ul>
      )}
    </div>
  )
}

const HiddenUnitsBadge = ({
  hiddenUnitsCount,
  day,
  unitsEntries,
  selectedRequests,
  onSelectRequest,
  onSelectAll,
  onRowClick
}: {
  hiddenUnitsCount: number,
  day: MonthCalendarDay,
  unitsEntries: { unitName: string, count: number, hasPending: boolean, employees: OvertimeRequest[] }[],
  selectedRequests?: Set<number>,
  onSelectRequest?: (id: number, selected: boolean) => void,
  onSelectAll?: (ids: number[], selected: boolean) => void,
  onRowClick?: (req: OvertimeRequest) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  
  const totalSelectedInHidden = unitsEntries.reduce((sum, unit) => sum + unit.employees.filter(emp => selectedRequests?.has(emp.id_ngoai_gio)).length, 0);

  const allPendingInDay = unitsEntries.flatMap(u => u.employees).filter(emp => emp.trang_thai_tong === 'Cho_duyet');
  const isAllDaySelected = allPendingInDay.length > 0 && allPendingInDay.every(emp => selectedRequests?.has(emp.id_ngoai_gio));

  const isAllExpanded = expandedKeys.size === unitsEntries.length && unitsEntries.length > 0;

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedKeys(new Set()); // Collapse all
    } else {
      setExpandedKeys(new Set(unitsEntries.map(u => u.unitName))); // Expand all
    }
  };

  return (
    <Popover 
      placement="right" 
      showArrow 
      offset={10} 
      isOpen={isOpen} 
      onOpenChange={setIsOpen}
      shouldCloseOnBlur={false}
      shouldCloseOnInteractOutside={(e) => {
        if (e && typeof e.closest === 'function') {
          if (e.closest('[role="dialog"]') || e.closest('[data-slot="backdrop"]')) {
            return false;
          }
        }
        return true;
      }}
    >
      <PopoverTrigger>
        <div 
          className={cn(
            "text-[10px] rounded px-1.5 py-1 font-medium text-center cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1",
            totalSelectedInHidden > 0 
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-400 dark:border-blue-600" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {totalSelectedInHidden > 0 && <span className="bg-blue-500 text-white text-[8px] px-1 rounded font-bold leading-tight select-none">✓ {totalSelectedInHidden}</span>}
          <span>+ {hiddenUnitsCount} đơn vị khác</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden max-w-sm w-[320px]">
        <div className="flex flex-col w-full max-h-[400px]">
          <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shrink-0 shadow-sm flex justify-between items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Ngày {day.date.getDate()}: Tất cả {unitsEntries.length} đơn vị</span>
            <div className="flex items-center gap-2">
              <button 
                title={isAllExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}
                onClick={toggleAll}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0.5 rounded transition-transform flex items-center justify-center shrink-0"
              >
                <svg className={cn("w-4 h-4 transition-transform", isAllExpanded ? "rotate-90" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                checked={isAllDaySelected}
                disabled={allPendingInDay.length === 0}
                title={allPendingInDay.length === 0 ? "Không có đơn chờ duyệt" : "Chọn tất cả đơn chờ duyệt trong ngày"}
                onChange={(e) => {
                  e.stopPropagation();
                  if (onSelectAll) {
                    onSelectAll(allPendingInDay.map(e => e.id_ngoai_gio), e.target.checked);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex flex-col overflow-y-auto custom-scrollbar">
            {unitsEntries.map((unit) => (
              <HiddenUnitGroup 
                key={unit.unitName}
                unit={unit}
                isExpanded={expandedKeys.has(unit.unitName)}
                onToggle={() => {
                  setExpandedKeys(prev => {
                    const next = new Set(prev);
                    if (next.has(unit.unitName)) next.delete(unit.unitName);
                    else next.add(unit.unitName);
                    return next;
                  });
                }}
                selectedRequests={selectedRequests}
                onSelectRequest={onSelectRequest}
                onSelectAll={onSelectAll}
                onRowClick={onRowClick}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function LeaderMonthCalendar({
  data,
  startDate,
  endDate,
  isLoading = false,
  selectedRequests,
  onSelectRequest,
  onSelectAll,
  onDayClick,
  onRowClick
}: LeaderMonthCalendarProps) {
  const { calendarDays } = useMonthCalendarData(data, startDate, endDate)

  // Map unit colors deterministically so they remain consistent
  const unitColorMap = useMemo(() => {
    const map = new Map<string, string>()
    let colorIdx = 0
    calendarDays.forEach(day => {
      Object.keys(day.units).forEach(unit => {
        if (!map.has(unit)) {
          map.set(unit, colorPresets[colorIdx % colorPresets.length])
          colorIdx++
        }
      })
    })
    return map
  }, [calendarDays])

  return (
    <div className="flex-1 w-full bg-[#f8fafc] dark:bg-gray-900 border-t border-b border-l border-gray-200/60 dark:border-gray-800 overflow-hidden flex flex-col h-full relative z-0">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[200] bg-white/40 dark:bg-gray-900/40 backdrop-blur-[1.5px] flex items-center justify-center transition-opacity duration-300">
          <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Days of Week Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
          <div key={day} className="flex-1 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Dynamic Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="grid grid-cols-7 min-h-full bg-gray-200 dark:bg-gray-700 gap-[1px] border-b border-gray-200 dark:border-gray-700">
          {calendarDays.map((day, idx) => {
            const unitsEntries = Object.values(day.units)
            const visibleUnits = unitsEntries.slice(0, 3)
            const hiddenUnitsCount = Math.max(0, unitsEntries.length - 3)

            return (
              <div 
                key={day.dateStr} 
                className={cn(
                  "flex flex-col p-1.5 sm:p-2 min-h-[120px] bg-white dark:bg-gray-900 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 relative group",
                  !day.isCurrentMonth && "bg-gray-50 dark:bg-[#1a1b1e] opacity-60"
                )}
                onClick={() => onDayClick && onDayClick(day.date)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-sm font-medium min-w-[28px] px-1.5 h-7 whitespace-nowrap flex items-center justify-center rounded-full",
                    day.isToday 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  )}>
                    {day.date.getDate() === 1 ? `1/${day.date.getMonth() + 1}` : day.date.getDate()}
                  </span>
                </div>

                {/* Badges Container */}
                <div className="flex flex-col w-full px-0.5">
                  {visibleUnits.map(unit => (
                    <DayUnitBadge 
                      key={unit.unitName}
                      unitName={unit.unitName}
                      count={unit.count}
                      hasPending={unit.hasPending}
                      employees={unit.employees}
                      colorClass={unitColorMap.get(unit.unitName) || colorPresets[0]}
                      selectedRequests={selectedRequests}
                      onSelectRequest={onSelectRequest}
                      onSelectAll={onSelectAll}
                      onRowClick={onRowClick}
                    />
                  ))}

                  {hiddenUnitsCount > 0 && (
                    <HiddenUnitsBadge 
                      hiddenUnitsCount={hiddenUnitsCount}
                      day={day}
                      unitsEntries={unitsEntries}
                      selectedRequests={selectedRequests}
                      onSelectRequest={onSelectRequest}
                      onSelectAll={onSelectAll}
                      onRowClick={onRowClick}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default React.memo(LeaderMonthCalendar)
