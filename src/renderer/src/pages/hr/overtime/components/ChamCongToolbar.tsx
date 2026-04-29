import { useState, useEffect, useMemo } from 'react'
import { cn, Popover, Calendar, RangeCalendar, Checkbox, CheckboxGroup, Label, Input, Button } from '@heroui-v3/react'
import { parseDate, CalendarDate } from '@internationalized/date'
import { ChevronLeft, ChevronRight, Clock, MapPin, XCircle, CalendarDays, ChevronDown, Search, Filter, RotateCcw, User, Eye, EyeOff } from 'lucide-react'
import { AdvancedFilterPopover, TimeFilterBlock } from '@renderer/components/advanced-filter'
import { ChamCongFilter } from '../types/BangChamCongTypes'
import MobileFilterSheet from './MobileFilterSheet'
import { useNgoaiGioPermissions } from '../hooks/useNgoaiGioPermissions'
import { useAuthStore } from '@renderer/store/useAuthStore'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatLocal = (d: Date): string => {
  const local = new Date(d)
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset())
  return local.toISOString().split('T')[0]
}

const formatDisplay = (raw: string): string => {
  if (!raw) return ''
  const [y, m, d] = raw.split('-')
  return `${d}/${m}/${y}`
}

const todayStr = () => formatLocal(new Date())

const calcRange = (from: string, to: string, direction: 'prev' | 'next'): { from: string; to: string } => {
  const fromD = new Date(from)
  const toD = new Date(to)

  const diffTime = toD.getTime() - fromD.getTime()
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24)) + 1

  const offset = direction === 'prev' ? -diffDays : diffDays
  fromD.setDate(fromD.getDate() + offset)
  toD.setDate(toD.getDate() + offset)

  return { from: formatLocal(fromD), to: formatLocal(toD) }
}

const rangeLabel = (filter: ChamCongFilter): string => {
  const from = filter.dateRange?.from
  const to = filter.dateRange?.to
  if (!from) return 'Tất cả thời gian'
  if (!to || from === to) return formatDisplay(from)
  return `${formatDisplay(from)} → ${formatDisplay(to)}`
}

import { mapDonviGroupedOptionsV2 } from '@renderer/api/danhmuc/DonviAxios'
import { mapNhanSuCungDonviOptions } from '@renderer/api/danhmuc/nhansuAxios'
import SearchInput from '@renderer/components/SearchInput'

export type ApiDonviGroup = {
  label: string
  options: { id: string; name: string }[]
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface ChamCongToolbarProps {
  filter: ChamCongFilter
  onFilterChange: (f: ChamCongFilter) => void
  activeTab: string
  showShiftColumns?: boolean
  onToggleShiftColumns?: () => void
  // Removed displayUnit and onDisplayUnitChange - always show "X giờ Y phút" format
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ChamCongToolbar({
  filter,
  onFilterChange,
  activeTab,
  showShiftColumns = true,
  onToggleShiftColumns
}: ChamCongToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCalOpen, setIsCalOpen] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState('time')
  const [isMobile, setIsMobile] = useState(false)
  const { isSuperAdmin, isPhongTCHC, canViewAll, canViewUnit } = useNgoaiGioPermissions()
  const canViewAllDepartments = isSuperAdmin || isPhongTCHC || canViewAll
  const user = useAuthStore((s) => s.user)

  // Local state for unit search inside the popover
  const [unitSearch, setUnitSearch] = useState('')

  // Local state for API fetched units
  const [apiGroups, setApiGroups] = useState<ApiDonviGroup[]>([])

  // Local state for employee search inside the popover
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [apiEmployees, setApiEmployees] = useState<{ value: string, label: string, ten_don_vi?: string, id_don_vi?: string, email?: string }[]>([])



  // Collapse states for unit groups (Default: all collapsed)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupKey)) next.delete(groupKey)
      else next.add(groupKey)
      return next
    })
  }

  // Fetch departments on mount
  useEffect(() => {
    const fetchDonvi = async () => {
      try {
        const res = await mapDonviGroupedOptionsV2()

        console.log(`response:::`, res)
        if (res && res.length > 0) {
          const formatted = res.map((group: any) => ({
            label: group.label,
            options: group.options.map((o: any) => ({ id: o.value, name: o.label }))
          }))
          setApiGroups(formatted)
          setCollapsedGroups(new Set(formatted.map(g => g.label)))
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err)
      }
    }
    fetchDonvi()
  }, [])

  // Fetch employees when don_vi_ids change
  useEffect(() => {
    const fetchStaff = async () => {
      let units = filter.don_vi_ids || []
      
      if (canViewAllDepartments && units.length === 0) {
        setApiEmployees([])
        return
      }

      // If user can only view their own unit, bypass empty array which fetches all,
      // and explicitly pass the user's unit ID.
      if (!canViewAllDepartments && canViewUnit && units.length === 0) {
        if (user?.id_don_vi) {
          units = [user.id_don_vi]
        }
      }

      try {
        const res = await mapNhanSuCungDonviOptions(units)
        // API returns objects with {value, label, avatar, ma_nhan_vien, ho_va_ten, id_don_vi, ten_don_vi}
        const mappedRes = res.map((emp: any) => ({
          ...emp,
          value: emp.id_nhan_vien || emp.value
        }))
        setApiEmployees(mappedRes)
        // Auto expand all groups by default

        const empGroups = [...new Set(res.map((emp: any) => `emp_${emp.ten_don_vi || 'Khác'}`))]
        setCollapsedGroups(prev => new Set([...prev, ...empGroups]))
      } catch (err) {
        console.error('Failed to fetch employees:', err)
        setApiEmployees([])
      }
    }
    fetchStaff()
  }, [filter.don_vi_ids, canViewAllDepartments, canViewUnit, user?.id_don_vi])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', check)
    check()
    return () => window.removeEventListener('resize', check)
  }, [])

  // Today shortcut
  const handleToday = () => {
    const t = todayStr()
    onFilterChange({ ...filter, dateRange: { from: t, to: t } })
  }

  // Prev / Next navigation
  const handleNav = (direction: 'prev' | 'next') => {
    const from = filter.dateRange?.from ?? todayStr()
    const to = filter.dateRange?.to ?? from
    onFilterChange({ ...filter, dateRange: calcRange(from, to, direction) })
  }

  // Count active filters (date + units + employees)
  const activeFilterCount = (filter.dateRange?.from ? 1 : 0) +
    (filter.don_vi_ids?.length || 0) +
    (filter.nhan_vien_ids?.length || 0)

  const hasDateFilter = !!filter.dateRange?.from
  const hasUnitFilter = (filter.don_vi_ids?.length || 0) > 0
  const hasEmployeeFilter = (filter.nhan_vien_ids?.length || 0) > 0

  const today = new Date()
  const last7 = new Date(today.getTime() - 7 * 24 * 3600 * 1000)
  const last30 = new Date(today.getTime() - 30 * 24 * 3600 * 1000)
  const thisYearStart = new Date(today.getFullYear(), 0, 1)

  const timePresets = [
    { label: 'Hôm nay', value: { from: formatLocal(today), to: formatLocal(today) } },
    { label: '7 ngày qua', value: { from: formatLocal(last7), to: formatLocal(today) } },
    { label: '30 ngày qua', value: { from: formatLocal(last30), to: formatLocal(today) } },
    { label: `Năm nay (${today.getFullYear()})`, value: { from: formatLocal(thisYearStart), to: formatLocal(today) } }
  ]

  // Define unitItems combining all options from API mapping to active tabs
  const normalizeText = (txt: string) => txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')

  const filteredApiGroups = activeTab === 'tat-ca'
    ? apiGroups
    : apiGroups.filter(g => {
      if (activeTab === 'phong-ban' && g.label === 'Phòng ban') return true
      if (activeTab === 'truong-khoa' && (g.label === 'Khoa' || g.label.toLowerCase().includes('trường'))) return true
      if (activeTab === 'trung-tam' && g.label === 'Trung tâm') return true
      if (activeTab === 'doanh-nghiep' && g.label === 'Doanh nghiệp') return true
      if (activeTab === 'khac' && g.label === 'Khác') return true
      return false
    })

  const unitItems = filteredApiGroups.flatMap(g => g.options)
  const filteredUnitItems = unitItems.filter(u => normalizeText(u.name).includes(normalizeText(unitSearch)))

  const filteredEmployeeItems = apiEmployees.filter(u => {
    const normalizedSearch = normalizeText(employeeSearch)
    return normalizeText(u.label).includes(normalizedSearch) ||
      (u.email && normalizeText(u.email).includes(normalizedSearch))
  })

  const donViOptionsForSheet = useMemo(() => {
    return apiGroups.map(g => ({
      label: g.label,
      options: g.options.map(o => ({ value: o.id, label: o.name }))
    }))
  }, [apiGroups])

  return (
    <div className="flex flex-col bg-transparent">
      {/* ── DESKTOP/TABLET TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        {/* LEFT/TOP: Date navigation */}
        <div className="hidden sm:flex flex-row items-center gap-3 w-auto min-w-0 flex-1">
          {/* Date navigation controls */}
          <div className="flex items-center justify-start w-auto gap-1.5 flex-nowrap shrink-0">
            {/* Prev */}
            <button
              onClick={() => handleNav('prev')}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors shrink-0"
              title="Trước"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            {/* Date range display — clickable calendar popover */}
            <Popover
              isOpen={isCalOpen}
              onOpenChange={setIsCalOpen}
            >
              <Popover.Trigger>
                <button className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all shrink-0 cursor-pointer">
                  <CalendarDays size={13} className="text-gray-400" />
                  <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                    {rangeLabel(filter)}
                  </span>
                  <ChevronDown size={12} className="text-gray-400 ml-0.5" />
                </button>
              </Popover.Trigger>
              <Popover.Content
                placement="bottom start"
                className="p-0 overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl"
              >
                <Popover.Dialog className="p-0 border-none shadow-none focus:outline-none">
                  <div className="p-2">
                    {/* Header label */}
                    <div className="px-2 py-1.5 mb-1 flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-blue-500" />
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Chọn khoảng thời gian
                      </span>
                    </div>

                    {/* Range mode: RangeCalendar */}
                    <RangeCalendar
                      aria-label="Chọn khoảng thời gian"
                      className="[&_[data-outside-visible-range]]:invisible [&_[data-outside-visible-range]]:pointer-events-none"
                      value={
                        filter.dateRange?.from && filter.dateRange?.to
                          ? { start: parseDate(filter.dateRange.from), end: parseDate(filter.dateRange.to) }
                          : undefined
                      }
                      onChange={(range) => {
                        if (!range) return
                        onFilterChange({ ...filter, dateRange: { from: range.start.toString(), to: range.end.toString() } })
                      }}
                    >
                      <RangeCalendar.Header>
                        <RangeCalendar.Heading />
                        <RangeCalendar.NavButton slot="previous" />
                        <RangeCalendar.NavButton slot="next" />
                      </RangeCalendar.Header>
                      <RangeCalendar.Grid>
                        <RangeCalendar.GridHeader>
                          {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                        </RangeCalendar.GridHeader>
                        <RangeCalendar.GridBody>
                          {(date) => <RangeCalendar.Cell date={date} />}
                        </RangeCalendar.GridBody>
                      </RangeCalendar.Grid>
                    </RangeCalendar>
                  </div>
                </Popover.Dialog>
              </Popover.Content>
            </Popover>

            {/* Next */}
            <button
              onClick={() => handleNav('next')}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors shrink-0"
              title="Tiếp"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>

            {/* Today Button Desktop Only */}
            <button
              onClick={handleToday}
              className="hidden sm:flex px-3 h-8 text-[13px] items-center font-medium rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors shrink-0"
            >
              Hôm nay
            </button>

            {/* Active filter chips */}
            {(filter.dateRange?.from || (filter.don_vi_ids && filter.don_vi_ids.length > 0) || (filter.nhan_vien_ids && filter.nhan_vien_ids.length > 0)) && (
              <div className="hidden sm:flex items-center gap-1 flex-wrap ml-2 shrink-0">
                {filter.dateRange?.from &&
                  (() => {
                    const fmt = (raw: string): string => {
                      if (!raw) return ''
                      const datePart = raw.includes('T') ? raw.split('T')[0] : raw.split(' ')[0]
                      if (!datePart.includes('-')) return raw
                      const [y, m, d] = datePart.split('-')
                      return `${d}/${m}/${y}`
                    }
                    return (
                      <div className="flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 text-[11px] font-medium text-orange-700 dark:text-orange-300">
                        <Clock size={10} className="text-orange-400 shrink-0" />
                        <span>
                          {fmt(filter.dateRange.from)}
                          {filter.dateRange.to ? ` → ${fmt(filter.dateRange.to)}` : ''}
                        </span>
                        <button
                          onClick={() => {
                            const f = { ...filter }
                            delete f.dateRange
                            onFilterChange(f)
                          }}
                          className="ml-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                          <XCircle size={11} />
                        </button>
                      </div>
                    )
                  })()}

                {canViewAllDepartments && filter.don_vi_ids && filter.don_vi_ids.length > 0 &&
                  (() => {
                    const VISIBLE_LIMIT = 2
                    const visibleIds = filter.don_vi_ids.slice(0, VISIBLE_LIMIT)
                    const hiddenIds = filter.don_vi_ids.slice(VISIBLE_LIMIT)

                    const renderChip = (unitId: string) => {
                      const deptName =
                        apiGroups
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          .flatMap((g: any) => g.options || [g])
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          .find((d: any) => String(d.id) === String(unitId))?.name ||
                        unitId
                      return (
                        <div key={unitId} className="flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                          <MapPin size={10} className="text-gray-400 shrink-0" />
                          <span className="max-w-[120px] truncate">{deptName}</span>
                          <button
                            onClick={() => {
                              const f = { ...filter, don_vi_ids: filter.don_vi_ids?.filter(id => id !== unitId) }
                              onFilterChange(f)
                            }}
                            className="ml-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                          >
                            <XCircle size={11} />
                          </button>
                        </div>
                      )
                    }

                    return (
                      <>
                        {visibleIds.map(renderChip)}
                        {hiddenIds.length > 0 && (
                          <Popover>
                            <Popover.Trigger>
                              <button className="flex items-center gap-1 h-6 px-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                +{hiddenIds.length}
                              </button>
                            </Popover.Trigger>
                            <Popover.Content placement="bottom" className="p-4 w-[300px] border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl z-50">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2 block border-b border-gray-100 dark:border-gray-800 pb-2">
                                Các đơn vị khác đã chọn ({hiddenIds.length})
                              </span>
                              <div className="flex flex-wrap gap-1.5 pt-2 max-h-[250px] overflow-y-auto thin-scrollbar">
                                {hiddenIds.map(renderChip)}
                              </div>
                            </Popover.Content>
                          </Popover>
                        )}
                      </>
                    )
                  })()}

                {filter.nhan_vien_ids && filter.nhan_vien_ids.length > 0 &&
                  (() => {
                    const VISIBLE_LIMIT = 2
                    const visibleIds = filter.nhan_vien_ids.slice(0, VISIBLE_LIMIT)
                    const hiddenIds = filter.nhan_vien_ids.slice(VISIBLE_LIMIT)

                    const renderChip = (empId: string) => {
                      const emp = apiEmployees.find(d => String(d.value) === String(empId))
                      const empName = emp?.label || empId
                      return (
                        <div key={empId} className="flex items-center gap-1.5 py-0.5 pl-2.5 pr-1 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-[11px] text-blue-700 dark:text-blue-300">
                          <User size={12} className="text-blue-500 shrink-0" />
                          <div className="flex flex-col justify-center leading-tight">
                            <span className="max-w-[160px] truncate font-medium" title={empName}>
                              {empName}
                            </span>
                            {emp?.email && (
                              <span className="max-w-[160px] truncate text-[9.5px] opacity-75" title={emp.email}>
                                {emp.email}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              const f = { ...filter, nhan_vien_ids: filter.nhan_vien_ids?.filter(id => id !== empId) }
                              onFilterChange(f)
                            }}
                            className="ml-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                          >
                            <XCircle size={11} />
                          </button>
                        </div>
                      )
                    }

                    return (
                      <>
                        {visibleIds.map(renderChip)}
                        {hiddenIds.length > 0 && (
                          <Popover>
                            <Popover.Trigger>
                              <button className="flex items-center gap-1 h-6 px-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-[11px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors cursor-pointer">
                                +{hiddenIds.length}
                              </button>
                            </Popover.Trigger>
                            <Popover.Content placement="bottom" className="p-4 w-[300px] border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl z-50">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2 block border-b border-gray-100 dark:border-gray-800 pb-2">
                                Các nhân viên khác đã chọn ({hiddenIds.length})
                              </span>
                              <div className="flex flex-wrap gap-1.5 pt-2 max-h-[250px] overflow-y-auto thin-scrollbar">
                                {hiddenIds.map(renderChip)}
                              </div>
                            </Popover.Content>
                          </Popover>
                        )}
                      </>
                    )
                  })()}

                {activeFilterCount > 1 && (
                  <button
                    onClick={() => {
                      const f = { ...filter }
                      delete f.don_vi_ids
                      delete f.nhan_vien_ids
                      delete f.dateRange
                      onFilterChange(f)
                    }}
                    className="flex items-center gap-0.5 h-6 px-2 rounded-full text-[11px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <RotateCcw size={10} />
                    <span>Xóa</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT/BOTTOM: Filter */}
        <div className="hidden sm:flex items-center justify-between sm:justify-end w-full sm:w-auto shrink-0 flex-none sm:ml-4 py-2 sm:py-0 px-4 sm:px-0">

          <div className="hidden sm:block">
            <AdvancedFilterPopover
              isOpen={isFilterOpen}
              onOpenChange={setIsFilterOpen}
              isMobile={isMobile}
              activeFilterCount={activeFilterCount}
              onClearAll={() => onFilterChange({})}
              tabs={[
                {
                  id: 'time',
                  label: 'Thời gian',
                  icon: Clock,
                  subtitle: hasDateFilter && filter.dateRange
                    ? `${formatDisplay(filter.dateRange.from ?? '')} → ${formatDisplay(filter.dateRange.to ?? '')}`
                    : 'Tất cả thời gian',
                  hasFilter: hasDateFilter
                },
                ...(canViewAllDepartments ? [{
                  id: 'unit',
                  label: 'Đơn vị',
                  icon: MapPin,
                  subtitle: hasUnitFilter
                    ? `${filter.don_vi_ids?.length} đơn vị đã chọn`
                    : 'Tất cả đơn vị',
                  hasFilter: hasUnitFilter
                }] : []),
                ...(canViewUnit ? [{
                  id: 'employee',
                  label: 'Nhân viên',
                  icon: User,
                  subtitle: hasEmployeeFilter
                    ? `${filter.nhan_vien_ids?.length} nhân viên`
                    : 'Tất cả nhân viên',
                  hasFilter: hasEmployeeFilter
                }] : [])
              ]}
              activeTabId={activeFilterTab}
              onTabChange={setActiveFilterTab}
            >
              {activeFilterTab === 'time' && (
                <TimeFilterBlock
                  presets={timePresets}
                  dateRange={filter.dateRange ?? {}}
                  onChange={val => onFilterChange({ ...filter, dateRange: val })}
                />
              )}

              {activeFilterTab === 'unit' && (
                <div className="flex flex-col">
                  <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-800">
                    <SearchInput
                      size="sm"
                      placeholder="Tìm đơn vị..."
                      value={unitSearch}
                      onChange={setUnitSearch}
                    />
                  </div>

                  <div className="p-4">
                    {filteredUnitItems.length > 0 ? (
                      <CheckboxGroup
                        value={filter.don_vi_ids || []}
                        onChange={(val) => onFilterChange({ ...filter, don_vi_ids: val })}
                      >
                        <div className="flex flex-col gap-1 py-1">
                          {filteredApiGroups.map((group) => {
                            const groupLabel = group.label
                            const filteredGroupUnits = group.options.filter(u => normalizeText(u.name).includes(normalizeText(unitSearch)))
                            if (filteredGroupUnits.length === 0) return null

                            // Auto expand if actively searching
                            const isCollapsed = collapsedGroups.has(groupLabel) && !unitSearch

                            return (
                              <div key={groupLabel} className="mb-2">
                                {/* Group Header */}
                                <div
                                  className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider bg-gray-50 dark:bg-gray-800/80 cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors rounded-md select-none"
                                  onClick={() => toggleGroup(groupLabel)}
                                >
                                  <span className="truncate pr-2 uppercase">{groupLabel}</span>
                                  <ChevronDown
                                    size={14}
                                    className={cn(
                                      "text-gray-400 transition-transform duration-200 shrink-0",
                                      isCollapsed ? "-rotate-90" : "rotate-0"
                                    )}
                                  />
                                </div>

                                {/* Group Items */}
                                {!isCollapsed && (
                                  <div className="flex flex-col gap-3 pt-3 px-3 pb-2">
                                    {filteredGroupUnits.map(u => (
                                      <Checkbox key={u.id} value={u.id}>
                                        <Checkbox.Control>
                                          <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content>
                                          <Label className="text-sm cursor-pointer">{u.name}</Label>
                                        </Checkbox.Content>
                                      </Checkbox>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </CheckboxGroup>
                    ) : (
                      <div className="py-8 flex items-center justify-center text-sm text-gray-500">
                        Không tìm thấy đơn vị "{unitSearch}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeFilterTab === 'employee' && (
                <div className="flex flex-col">
                  {canViewAllDepartments && (!filter.don_vi_ids || filter.don_vi_ids.length === 0) ? (
                    <div className="py-12 px-4 flex flex-col items-center justify-center text-sm text-center text-gray-500">
                      <MapPin size={28} className="mb-3 text-gray-300" />
                      <p>Vui lòng chọn <strong>Đơn vị</strong> trước<br />để xem danh sách nhân viên.</p>
                    </div>
                  ) : (
                    <>
                      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-800">
                        <SearchInput
                          size="sm"
                          placeholder="Tìm tên hoặc mã NV..."
                          value={employeeSearch}
                          onChange={setEmployeeSearch}
                        />
                      </div>
                      <div className="p-4">
                        {filteredEmployeeItems.length > 0 ? (
                          <CheckboxGroup
                            value={filter.nhan_vien_ids || []}
                            onChange={(val) => onFilterChange({ ...filter, nhan_vien_ids: val })}
                          >
                            <div className="flex flex-col gap-1 py-1">
                              {(() => {
                                const groups = filteredEmployeeItems.reduce((acc, emp) => {
                                  const dept = emp.ten_don_vi || 'Khác';
                                  if (!acc[dept]) acc[dept] = [];
                                  acc[dept].push(emp);
                                  return acc;
                                }, {} as Record<string, typeof filteredEmployeeItems>);

                                const groupEntries = Object.entries(groups);

                                if (groupEntries.length <= 1) {
                                  return (
                                    <div className="flex flex-col gap-1.5 pt-2 pb-1 px-1">
                                      {filteredEmployeeItems.map(nv => (
                                        <Checkbox key={nv.value} value={nv.value} className="items-start py-0.5">
                                          <Checkbox.Control className="mt-0.5">
                                            <Checkbox.Indicator />
                                          </Checkbox.Control>
                                          <Checkbox.Content>
                                            <div className="flex flex-col gap-0">
                                              <Label className="text-sm cursor-pointer select-none leading-tight text-gray-800 dark:text-gray-200">{nv.label}</Label>
                                              {nv.email && <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{nv.email}</span>}
                                            </div>
                                          </Checkbox.Content>
                                        </Checkbox>
                                      ))}
                                    </div>
                                  );
                                }

                                return groupEntries.map(([deptName, emps]) => {
                                  const isCollapsed = collapsedGroups.has(`emp_${deptName}`) && !employeeSearch;

                                  return (
                                    <div key={deptName} className="mb-2">
                                      {/* Group Header */}
                                      <div
                                        className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider bg-gray-50 dark:bg-gray-800/80 cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors rounded-md select-none"
                                        onClick={() => toggleGroup(`emp_${deptName}`)}
                                      >
                                        <span className="truncate pr-2 uppercase">{deptName}</span>
                                        <ChevronDown
                                          size={14}
                                          className={cn(
                                            "text-gray-400 transition-transform duration-200 shrink-0",
                                            isCollapsed ? "-rotate-90" : "rotate-0"
                                          )}
                                        />
                                      </div>

                                      {/* Group Items */}
                                      {!isCollapsed && (
                                        <div className="flex flex-col gap-1.5 pt-2 px-3 pb-2">
                                          {emps.map(nv => (
                                            <Checkbox key={nv.value} value={nv.value} className="items-start py-0.5">
                                              <Checkbox.Control className="mt-0.5">
                                                <Checkbox.Indicator />
                                              </Checkbox.Control>
                                              <Checkbox.Content>
                                                <div className="flex flex-col gap-0">
                                                  <Label className="text-sm cursor-pointer select-none leading-tight text-gray-800 dark:text-gray-200">{nv.label}</Label>
                                                  {nv.email && <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{nv.email}</span>}
                                                </div>
                                              </Checkbox.Content>
                                            </Checkbox>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </CheckboxGroup>
                        ) : (
                          <div className="py-8 flex items-center justify-center text-sm text-gray-500">
                            Không tìm thấy nhân viên "{employeeSearch}"
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </AdvancedFilterPopover>
          </div>

          {/* Separator */}
          {onToggleShiftColumns && (
            <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-gray-700 shrink-0 mx-2" />
          )}

          {/* Toggle Shift Columns Button */}
          {onToggleShiftColumns && (
            <button
              onClick={onToggleShiftColumns}
              className={cn(
                'hidden sm:flex px-3 h-8 text-[13px] items-center gap-2 font-medium rounded-full border transition-colors shrink-0 ',
                showShiftColumns
                  ? 'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
              title={showShiftColumns ? "Ẩn cột giờ làm sáng/chiều" : "Hiện cột giờ làm sáng/chiều"}
            >
              Chi tiết
            </button>
          )}
        </div>
      </div>

      {/* ── MOBILE SHEET TOOLBAR ── */}
      <MobileFilterSheet
        dateRange={filter.dateRange as { from: string; to: string } | undefined}
        showDonViFilter={canViewAllDepartments}
        showStatusFilter={false}
        donViValues={filter.don_vi_ids || []}
        donViOptions={donViOptionsForSheet}
        // MobileSheet currently lacks Employee Selector! Will need to be added to MobileFilterSheet later if required.
        onDateRangeChange={(range) => onFilterChange({ ...filter, dateRange: range })}
        onDonViValuesChange={(vals) => onFilterChange({ ...filter, don_vi_ids: vals })}
        onResetAll={() => onFilterChange({ ...filter, don_vi_ids: [], nhan_vien_ids: [], dateRange: undefined })}
        onNavigatePrev={() => handleNav('prev')}
        onNavigateNext={() => handleNav('next')}
        onNavigateToday={handleToday}
      />
    </div>
  )
}
