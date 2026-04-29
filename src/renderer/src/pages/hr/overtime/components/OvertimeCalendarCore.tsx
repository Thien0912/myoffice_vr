import { Button, Select, ListBox } from '@heroui-v3/react'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { ChevronLeft, ChevronRight, ChevronUp, Menu, PieChart, X } from 'lucide-react'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { useCreateOvertimeRequest } from '../hooks/useCreateOvertimeRequest'
import type { CalendarViewType, CustomCalendarRef } from './calendar'
import { CustomCalendarView } from './CustomCalendarView'
import { MiniCalendar } from './MiniCalendar'
import { OvertimeFormContent } from './OvertimeFormContent'
import type { BangChamCong } from './TimesheetSelector'

/* ═══════════════════════════════
   Precomputed class constants
═══════════════════════════════ */
const SELECT_TRIGGER_CLS = [
  'h-9 px-4 rounded-full',
  'border border-[#dadce0] dark:border-gray-600',
  'bg-white dark:bg-gray-800',
  'text-[13.5px] font-medium text-[#3c4043] dark:text-gray-200',
  'hover:bg-[#f1f3f4] dark:hover:bg-gray-700',
  'transition-colors duration-150',
  'shadow-none outline-none',
  'flex items-center gap-2',
].join(' ')

const SELECT_POPOVER_CLS = [
  'min-w-[120px] rounded-xl overflow-hidden',
  'bg-white dark:bg-gray-800',
  'border border-[#e0e0e0] dark:border-gray-700',
  'shadow-[0_2px_10px_rgba(0,0,0,0.15)]',
  'py-1',
].join(' ')

const LISTBOX_ITEM_BASE_CLS = [
  'flex items-center justify-between',
  'px-4 py-2 text-[13.5px] font-medium',
  'cursor-pointer select-none outline-none',
  'text-[#3c4043] dark:text-gray-200',
  'hover:bg-[#f1f3f4] dark:hover:bg-gray-700',
  'transition-colors duration-100',
].join(' ')

const LISTBOX_ITEM_ACTIVE_CLS = 'text-[#1a73e8] bg-[#e8f0fe] dark:bg-blue-900/30 dark:text-blue-400'

const FONT_FAMILY = "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif"

const calcHours = (start?: string, end?: string) => {
  if (!start || !end) return 0
  const mStart = moment(start, 'HH:mm')
  const mEnd = moment(end, 'HH:mm')
  if (!mStart.isValid() || !mEnd.isValid()) return 0
  let diff = mEnd.diff(mStart, 'hours', true)
  if (diff < 0) diff += 24
  return Math.round(diff * 10) / 10
}

/* ═══════════════════════════════
   OvertimeCalendarCore
   Shared core for both standalone page & drawer modal
═══════════════════════════════ */
interface OvertimeCalendarCoreProps {
  onSuccess?: () => void
  onClose?: () => void        // show X button in toolbar when provided
  variant?: 'page' | 'drawer' // controls bg, corners, shadows
  isActive?: boolean           // when false → reset entries (for drawer close)
  initialAutoOpenForm?: boolean // auto trigger blank form
}

export default function OvertimeCalendarCore({
  onSuccess,
  onClose,
  variant = 'page',
  isActive = true,
  initialAutoOpenForm
}: OvertimeCalendarCoreProps) {
  const {
    form,
    entries,
    employeeOptions,
    existingOvertime,
    handleAddEntry,
    handleRemoveEntry,
    handleDuplicateEntry,
    handleCreate,
    isLoadingEmployees,
    isLoadingExisting,
    isLoading,
    isEmployeeSelectDisabled,
    isMultipleSelect,
    remove,
    submitImmediately
  } = useCreateOvertimeRequest({ onSuccess: onSuccess || (() => { }) })

  // Calendar view state
  const [currentView, setCurrentView] = useState<CalendarViewType>('month')
  const [currentTitle, setCurrentTitle] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [baseDate, setBaseDate] = useState(() => moment())
  const [miniViewingDate, setMiniViewingDate] = useState(() => moment())
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const calendarRef = useRef<CustomCalendarRef | null>(null)
  const openBlankFormFnRef = useRef<(() => void) | null>(null)

  // Fetch bảng chấm công đang mở
  const { data: openTimesheets, isLoading: isLoadingTimesheets } = useQuery({
    queryKey: ['hrmBangChamCongThangMO'],
    queryFn: async () => {
      const response = await ngoaiGioAxios.getBangChamCongThang({
        start: 0,
        length: 12,
        trang_thai: 'MO'
      })
      return (response?.data?.data as BangChamCong[]) || []
    },
    staleTime: 0
  })

  // Derive active timesheet covering current view month (for display purposes)
  const activeBangChamCong = useMemo(() => {
    if (!openTimesheets?.length) return null
    const viewStart = baseDate.clone().startOf('month').format('YYYY-MM-DD')
    const viewEnd = baseDate.clone().endOf('month').format('YYYY-MM-DD')
    const covering = openTimesheets.find(t => {
      const start = t.ngay_bat_dau?.split(' ')[0] ?? ''
      const end = t.ngay_ket_thuc?.split(' ')[0] ?? ''
      return start <= viewEnd && end >= viewStart
    })
    if (covering) return covering
    const viewMonth = baseDate.format('YYYY-MM')
    return openTimesheets.find(t => t.thang === viewMonth) || openTimesheets[0]
  }, [openTimesheets, baseDate])

  // Merged range from ALL open timesheets (union of all date ranges)
  const timesheetRange = useMemo(() => {
    if (!openTimesheets?.length) return null
    const starts = openTimesheets.map(t => t.ngay_bat_dau?.split(' ')[0] ?? '').filter(Boolean)
    const ends = openTimesheets.map(t => t.ngay_ket_thuc?.split(' ')[0] ?? '').filter(Boolean)
    if (!starts.length || !ends.length) return null
    return {
      start: starts.reduce((a, b) => a < b ? a : b),
      end: ends.reduce((a, b) => a > b ? a : b)
    }
  }, [openTimesheets])

  // Compute locked dates for MiniCalendar — union of all open timesheets
  const miniLockedDates = useMemo(() => {
    const locked = new Set<string>()
    const isTimesheetsReady = !isLoadingTimesheets

    if (isTimesheetsReady && (!openTimesheets?.length || !timesheetRange)) {
      const lockStart = moment().subtract(6, 'months').startOf('month')
      const lockEnd = moment().add(6, 'months').endOf('month')
      const cur = lockStart.clone()
      while (cur.isSameOrBefore(lockEnd, 'day')) {
        locked.add(cur.format('YYYY-MM-DD'))
        cur.add(1, 'day')
      }
      return locked
    }

    if (!openTimesheets?.length || !timesheetRange) return locked

    // Build set of ALL allowed dates across all open timesheets
    const allowedDates = new Set<string>()
    for (const ts of openTimesheets) {
      const tsStart = ts.ngay_bat_dau?.split(' ')[0] ?? ''
      const tsEnd = ts.ngay_ket_thuc?.split(' ')[0] ?? ''
      if (!tsStart || !tsEnd) continue
      const cur = moment(tsStart)
      while (cur.isSameOrBefore(moment(tsEnd), 'day')) {
        allowedDates.add(cur.format('YYYY-MM-DD'))
        cur.add(1, 'day')
      }
    }

    // Lock all dates in scan window that are NOT in allowed set
    const { start, end } = timesheetRange
    const scanStart = moment(start).subtract(1, 'month').startOf('month')
    const scanEnd = moment(end).add(1, 'month').endOf('month')
    const cur = scanStart.clone()
    while (cur.isSameOrBefore(scanEnd, 'day')) {
      const d = cur.format('YYYY-MM-DD')
      if (!allowedDates.has(d)) locked.add(d)
      cur.add(1, 'day')
    }

    // Also apply locked_dates ranges from each open timesheet
    for (const ts of openTimesheets) {
      const rawLocked = ts.locked_dates
      const parsedLocked: { start: string; end: string }[] = Array.isArray(rawLocked)
        ? rawLocked
        : typeof rawLocked === 'string' && rawLocked
          ? (() => { try { return JSON.parse(rawLocked) } catch { return [] } })()
          : []
      parsedLocked.forEach((range) => {
        if (!range.start || !range.end) return
        const lCur = moment(range.start)
        while (lCur.isSameOrBefore(moment(range.end), 'day')) {
          locked.add(lCur.format('YYYY-MM-DD'))
          lCur.add(1, 'day')
        }
      })
    }

    return locked
  }, [openTimesheets, timesheetRange, isLoadingTimesheets])

  // Statistics
  const stats = useMemo(() => {
    const summary: Record<string, { count: number; hours: number; color: string; label: string }> = {
      Da_duyet: { count: 0, hours: 0, color: '#33b679', label: 'Đã duyệt' },
      Cho_duyet: { count: 0, hours: 0, color: '#fbbc04', label: 'Chờ duyệt' },
      Tu_choi: { count: 0, hours: 0, color: '#d50000', label: 'Từ chối' },
      Huy: { count: 0, hours: 0, color: '#9ca3af', label: 'Đã hủy' },
      Draft: { count: 0, hours: 0, color: '#039be5', label: 'Đang tạo' }
    }
    let totalCount = 0
    let totalHours = 0

    existingOvertime.forEach((item: any) => {
      const st = item.trang_thai_tong || 'Cho_duyet'
      const hrs = Number(item.so_gio || 0)
      if (summary[st]) { summary[st].count += 1; summary[st].hours += hrs }
      else { summary.Cho_duyet.count += 1; summary.Cho_duyet.hours += hrs }
      totalCount += 1
      totalHours += hrs
    })

    entries.filter((e: any) => e.date).forEach((e: any) => {
      const hrs = calcHours(e.startTime, e.endTime)
      summary.Draft.count += 1
      summary.Draft.hours += hrs
      totalCount += 1
      totalHours += hrs
    })

    return { summary, totalCount, totalHours }
  }, [existingOvertime, entries])

  // Event color dots for MiniCalendar
  const eventColorsMap = useMemo(() => {
    const map = new Map<string, string[]>()
    const addColor = (dateStr: string, color: string) => {
      if (!map.has(dateStr)) map.set(dateStr, [])
      const colors = map.get(dateStr)!
      if (!colors.includes(color) && colors.length < 3) colors.push(color)
    }

    existingOvertime.forEach((item: any) => {
      const dateStr = item.ngay_dang_ky?.substring(0, 10)
      if (dateStr) {
        const status = item.trang_thai_tong || 'Cho_duyet'
        let bgColor = '#fbbc04'
        if (status === 'Da_duyet') bgColor = '#33b679'
        if (status === 'Tu_choi') bgColor = '#d50000'
        if (status === 'Huy') bgColor = '#9e9e9e'
        addColor(dateStr, bgColor)
      }
    })
    entries.forEach((e: any) => {
      if (e.date) addColor(e.date, '#039be5')
    })
    return map
  }, [existingOvertime, entries])

  // Responsive detection
  useEffect(() => {
    const checkSize = () => setIsSmallScreen(window.innerWidth < 768)
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  // Reset entries when drawer closes
  useEffect(() => {
    if (!isActive) form.setValue('entries', [])
  }, [isActive])

  // Stable callbacks
  const handleViewChange = useCallback((view: CalendarViewType) => setCurrentView(view), [])
  const handleBaseDateChange = useCallback((date: moment.Moment) => {
    setBaseDate(date)
    setMiniViewingDate((prev) => date.isSame(prev, 'month') ? prev : date.clone())
  }, [])
  const handleRegisterOpenBlankForm = useCallback((fn: () => void) => { openBlankFormFnRef.current = fn }, [])
  const handlePrev = useCallback(() => calendarRef.current?.prev(), [])
  const handleNext = useCallback(() => calendarRef.current?.next(), [])
  const handleToday = useCallback(() => calendarRef.current?.today(), [])

  const showCalendar = !isSmallScreen
  const isDrawer = variant === 'drawer'

  // Variant-specific classes
  const rootCls = isDrawer
    ? 'flex flex-col h-full w-full min-h-0 pt-2 bg-[#f8fafd] dark:bg-gray-900 rounded-tl-4xl rounded-bl-4xl overflow-hidden'
    : 'flex flex-col w-full h-[calc(100vh-57px)] bg-white dark:bg-gray-900 overflow-hidden'
  const toolbarBgCls = isDrawer ? 'bg-[#f8fafd]' : 'bg-white'
  const sidebarBgCls = isDrawer ? 'bg-[#f8fafd]' : 'bg-white'

  const isInitializing = isLoadingEmployees || isLoadingExisting || isLoadingTimesheets

  return (
    <div className={rootCls} style={{ fontFamily: FONT_FAMILY }}>
      {isInitializing && (
        <div className="absolute inset-0 z-100 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full shadow-sm" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
      <FormProvider {...form}>
        {/* ═══ Toolbar ═══ */}
        <div className={`flex items-center justify-between h-14 px-6 shrink-0 ${toolbarBgCls}`}>
          {/* Left: navigation */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-[250px]">
            {showCalendar && (
              <>
                <Button size="sm" variant="ghost" className="text-[#5f6368] hover:bg-gray-100 rounded-full w-10 h-10 mr-1" onPress={() => setIsSidebarOpen(!isSidebarOpen)}>
                  <Menu size={20} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full px-4 h-9 font-medium text-[#3c4043] border-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-800"
                  onPress={handleToday}
                >
                  Hôm nay
                </Button>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="text-[#5f6368] hover:bg-gray-100 rounded-full w-9 h-9" onPress={handlePrev}>
                    <ChevronLeft size={20} />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-[#5f6368] hover:bg-gray-100 rounded-full w-9 h-9" onPress={handleNext}>
                    <ChevronRight size={20} />
                  </Button>
                </div>
                <h2 className="text-[22px] text-[#3c4043] dark:text-gray-100 ml-2 select-none tracking-tight">
                  {currentTitle}
                </h2>
              </>
            )}
          </div>

          <div className="flex-1 flex justify-center" />

          {/* Right: view selector + stats toggle + close */}
          <div className="flex items-center gap-2 sm:gap-4 justify-end">
            {showCalendar && (
              <>
                <Select
                  selectedKey={currentView}
                  onSelectionChange={(key) => handleViewChange(key as CalendarViewType)}
                  className="w-[110px]"
                  aria-label="Chế độ xem"
                >
                  <Select.Trigger className={SELECT_TRIGGER_CLS}>
                    <Select.Value />
                    <Select.Indicator className="text-[#5f6368] dark:text-gray-400 ml-0.5 size-4" />
                  </Select.Trigger>
                  <Select.Popover data-react-aria-top-layer="true" className={SELECT_POPOVER_CLS}>
                    <ListBox className="outline-none">
                      {(['day', 'week', 'month'] as const).map((view) => {
                        const labels = { day: 'Ngày', week: 'Tuần', month: 'Tháng' }
                        return (
                          <ListBox.Item
                            key={view}
                            id={view}
                            textValue={labels[view]}
                            className={`${LISTBOX_ITEM_BASE_CLS} ${currentView === view ? LISTBOX_ITEM_ACTIVE_CLS : ''}`}
                          >
                            {labels[view]}
                            <ListBox.ItemIndicator className="text-[#1a73e8] dark:text-blue-400 size-3.5" />
                          </ListBox.Item>
                        )
                      })}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <Button
                  size="sm"
                  variant="ghost"
                  className={[
                    'h-9 px-4 rounded-full text-[13.5px] font-medium',
                    'border transition-colors duration-150',
                    isRightSidebarOpen
                      ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8] dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500'
                      : 'border-[#dadce0] dark:border-gray-600 text-[#3c4043] dark:text-gray-200 hover:bg-[#f1f3f4] dark:hover:bg-gray-700',
                  ].join(' ')}
                  onPress={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                >
                  <PieChart size={15} />
                  Thống kê
                </Button>
              </>
            )}

            {onClose && (
              <Button
                size="sm"
                variant="ghost"
                onPress={onClose}
                className="text-[#5f6368] hover:bg-gray-100 rounded-full w-9 h-9"
              >
                <X size={20} />
              </Button>
            )}
          </div>
        </div>

        {/* ═══ Body ═══ */}
        <div className={`flex-1 flex flex-row min-h-0 overflow-hidden ${!isDrawer ? 'relative z-10' : ''}`}>
          {/* Sidebar */}
          <div
            className={`shrink-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen && showCalendar
                ? 'w-[256px] opacity-100 border-r border-transparent'
                : 'w-0 opacity-0 border-r-0'
              }`}
          >
            <div className={`w-[256px] h-full flex flex-col p-4 ${sidebarBgCls} overflow-y-auto pt-2`}>
              {/* "Tạo" Button — Google Calendar style */}
              <button
                type="button"
                onClick={() => openBlankFormFnRef.current?.()}
                className="h-[48px] w-auto self-start inline-flex items-center gap-2 px-3 mb-6 rounded-[16px] bg-white shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:bg-[#f8f9fa] hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] text-[#3c4043] font-medium text-sm border-0 cursor-pointer transition-all outline-none"
              >
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <path fill="#34A853" d="M16 16v14h4V20z" />
                  <path fill="#4285F4" d="M30 16H20l-4 4h14z" />
                  <path fill="#FBBC05" d="M6 16v4h10l4-4z" />
                  <path fill="#EA4335" d="M20 16V6h-4v14z" />
                  <path fill="none" d="M0 0h36v36H0z" />
                </svg>
                <span className="ml-1 mr-4 text-[14px] tracking-wide">Tạo</span>
              </button>

              {/* Mini Calendar */}
              {showCalendar && (
                <div className="mb-4">
                  <MiniCalendar
                    currentDate={baseDate}
                    viewingDate={miniViewingDate}
                    onDateClick={(date) => {
                      calendarRef.current?.gotoDate(date)
                      setBaseDate(date)
                    }}
                    onViewingDateChange={(date) => {
                      setMiniViewingDate(date)
                      setBaseDate(date)
                      calendarRef.current?.gotoDate(date)
                    }}
                    eventDates={eventColorsMap}
                    lockedDates={miniLockedDates}
                    timesheetRange={timesheetRange}
                  />
                </div>
              )}

              {/* Employee Selector */}
              {!isEmployeeSelectDisabled && (
                <div className="mb-4 border-t border-gray-200 pt-4 dark:border-gray-800 animate-in fade-in slide-in-from-top-1">
                  <Controller
                    name="selectedEmployeeId"
                    control={form.control}
                    rules={{ required: true }}
                    render={({ field, fieldState }) => (
                      <SelectDropdown
                        label="Nhân viên"
                        options={employeeOptions}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        isRequired
                        placeholder={isLoadingEmployees ? 'Đang tải...' : 'Tìm người'}
                        isDisabled={isEmployeeSelectDisabled}
                        isInvalid={fieldState.invalid}
                        size="md"
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`flex-1 min-h-0 overflow-hidden bg-white flex flex-col transition-all duration-300 ${isDrawer
              ? `sm:rounded-l-2xl sm:mb-[10px] shadow-[-4px_0_16px_rgba(0,0,0,0.04)] ${!isRightSidebarOpen || !showCalendar ? 'sm:rounded-r-2xl sm:mr-[10px]' : ''}`
              : `sm:rounded-tl-2xl sm:rounded-bl-2xl shadow-[-1px_-1px_3px_rgba(0,0,0,0.05)] relative z-10 ${!isRightSidebarOpen || !showCalendar ? 'sm:rounded-r-2xl sm:mr-[10px]' : ''}`
            }`}>
            {showCalendar ? (
              <CustomCalendarView
                form={form}
                currentView={currentView}
                calendarRef={calendarRef}
                onTitleChange={setCurrentTitle}
                onBaseDateChange={handleBaseDateChange}
                existingOvertime={existingOvertime}
                activeBangChamCong={activeBangChamCong}
                openTimesheets={openTimesheets || []}
                remove={remove}
                submitImmediately={submitImmediately}
                onRegisterOpenBlankForm={handleRegisterOpenBlankForm}
                employeeOptions={employeeOptions}
                isMultipleSelect={isMultipleSelect}
                initialAutoOpenForm={initialAutoOpenForm}
              />
            ) : (
              <div className="h-full overflow-y-auto">
                <OvertimeFormContent
                  form={form}
                  entries={entries}
                  employeeOptions={employeeOptions}
                  handleAddEntry={handleAddEntry}
                  handleRemoveEntry={handleRemoveEntry}
                  handleDuplicateEntry={handleDuplicateEntry}
                  isLoadingEmployees={isLoadingEmployees}
                  isEmployeeSelectDisabled={isEmployeeSelectDisabled}
                  isMultipleSelect={isMultipleSelect}
                  handleCreate={handleCreate}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar — Statistics */}
          <div
            className={`shrink-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-white border-l border-gray-100 dark:border-gray-800 ${isDrawer ? 'sm:mb-[10px] sm:ml-2' : ''
              } ${isRightSidebarOpen && showCalendar
                ? isDrawer
                  ? 'w-[280px] opacity-100 sm:rounded-2xl shadow-[-4px_0_16px_rgba(0,0,0,0.04)] sm:mr-[10px]'
                  : 'w-[280px] opacity-100 sm:rounded-r-2xl sm:mr-[10px] shadow-[4px_0_16px_rgba(0,0,0,0.04)]'
                : 'w-0 opacity-0 border-l-0 sm:mr-0'
              }`}
          >
            <div className="w-[280px] h-full flex flex-col p-4 overflow-y-auto">
              {/* Header */}
              <div
                className="flex items-center justify-between bg-[#f1f3f4] rounded-full px-4 py-2 cursor-pointer select-none mb-4 hover:bg-[#e8eaed] transition-colors"
                onClick={() => setIsRightSidebarOpen(false)}
              >
                <span className="text-[14px] font-medium text-[#3c4043]">Thông tin chi tiết</span>
                <ChevronUp size={18} className="text-[#3c4043]" />
              </div>

              <div className="text-[11px] font-semibold text-[#70757a] uppercase tracking-wider mb-2">
                Các đơn trên hệ thống
              </div>

              {/* Stacked Progress Bar */}
              <div className="flex h-[10px] w-full rounded-full overflow-hidden gap-px mb-3">
                {Object.values(stats.summary).map(st => st.hours > 0 && (
                  <div key={st.label} style={{ width: `${(st.hours / Math.max(stats.totalHours, 1)) * 100}%`, backgroundColor: st.color }} />
                ))}
                {stats.totalHours === 0 && <div className="w-full bg-[#f1f3f4]" />}
              </div>

              <div className="text-[13px] text-[#3c4043] mb-6 font-normal">
                Tổng cộng: <span className="font-medium">{stats.totalCount} đơn</span> / <span className="font-medium">{stats.totalHours} giờ</span>
              </div>

              {/* Breakdown List */}
              <div className="flex flex-col gap-3">
                {Object.values(stats.summary).map(st => st.count > 0 && (
                  <div key={st.label} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2 text-[#3c4043]">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }} />
                      {st.label}
                    </div>
                    <div className="text-[#70757a] text-right leading-tight min-w-[60px]">
                      <span className="font-medium text-[#3c4043]">{st.count}</span> đơn<br />
                      <span className="text-[11px]">{st.hours} giờ</span>
                    </div>
                  </div>
                ))}
                {stats.totalCount === 0 && (
                  <div className="text-[13px] text-[#70757a] text-center mt-4 border border-dashed border-gray-200 p-4 rounded-xl">Chưa có đơn nào</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </FormProvider>
    </div>
  )
}
