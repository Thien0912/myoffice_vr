import { Popover, toast } from '@heroui-v3/react'
import { Button, cn, Listbox, ListboxItem } from '@heroui/react'
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import {
  AdvancedFilterPopover,
  CategorizedStatusBlock,
  TimeFilterBlock
} from '@renderer/components/advanced-filter'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { useNgoaiGioStore } from '@renderer/store/useNgoaiGioStore'
import {
  CheckCircle2,
  Clock,
  Columns3Icon,
  EllipsisVerticalIcon,
  FileDownIcon,
  LayoutGrid,
  LockIcon,
  MapPin,
  RotateCcw,
  Sigma,
  X,
  XCircle
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNgoaiGioPermissions } from '../hooks/useNgoaiGioPermissions'
import OvertimeExportModal from './OvertimeExportModal'
import OvertimeLockModal from './OvertimeLockModal'
import TableColumnConfig from '@renderer/components/table/TableColumnConfig'

export type OvertimeViewMode = 'excel' | 'table'

interface OvertimeToolbarProps {
  onCreate?: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange: (filter: Record<string, any>) => void
  canViewDonViFilter?: boolean
  selectedCount?: number
  onBulkApprove?: () => void
  onBulkReject?: () => void
  onClearSelection?: () => void
  stats?: { approved: number; pending: number; rejected: number }
  viewMode?: OvertimeViewMode
  calendarViewType?: 'week' | 'month'
  /** Controls visibility of tool-action buttons (Lock, Export, Sigma) and filter popover */
  isToolbarActionsVisible?: boolean
  /** Optional content rendered on the left side of the toolbar (before filter chips) */
  leftContent?: React.ReactNode
  /** Optional content rendered on the right side of the toolbar */
  rightContent?: React.ReactNode
  columns?: { uid: string; name: string }[]
  visibleColumns?: Set<string>
  setVisibleColumns?: (keys: Set<string>) => void
  columnOrder?: string[]
  setColumnOrder?: (order: string[]) => void
}

function OvertimeToolbar({
  filter,
  onFilterChange,
  canViewDonViFilter = true,
  selectedCount = 0,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  viewMode = 'excel',
  calendarViewType,
  isToolbarActionsVisible = true,
  leftContent,
  rightContent,
  columns,
  visibleColumns,
  setVisibleColumns,
  columnOrder,
  setColumnOrder
}: OvertimeToolbarProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [departments, setDepartments] = useState<any[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { canExportExcel, canViewChamCong } = useNgoaiGioPermissions()

  useEffect(() => {
    const checkMobile = (): void => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', checkMobile)
    checkMobile()
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState('time')
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const { showTotalHoursColumn, setShowTotalHoursColumn } = useNgoaiGioStore()

  const today = new Date()
  const last7days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const thisYearStart = new Date(today.getFullYear(), 0, 1)
  const lastYearStart = new Date(today.getFullYear() - 1, 0, 1)
  const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31)

  const formatDateUtil = (date: Date): string => {
    const d = new Date(date)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().split('T')[0]
  }

  const timePresets = [
    { label: 'Đ', value: { from: formatDateUtil(today), to: formatDateUtil(today) } },
    { label: '7 ngày qua', value: { from: formatDateUtil(last7days), to: formatDateUtil(today) } },
    {
      label: '30 ngày qua',
      value: { from: formatDateUtil(last30days), to: formatDateUtil(today) }
    },
    {
      label: `Năm nay (${today.getFullYear()})`,
      value: { from: formatDateUtil(thisYearStart), to: formatDateUtil(today) }
    },
    {
      label: `Năm ngoái (${today.getFullYear() - 1})`,
      value: { from: formatDateUtil(lastYearStart), to: formatDateUtil(lastYearEnd) }
    }
  ]

  const getFilterSubtitle = (tabId: string): string => {
    if (tabId === 'time') {
      if (filter.dateRange?.from) {
        const from = formatDateUtil(new Date(filter.dateRange.from))
        const to = filter.dateRange.to ? formatDateUtil(new Date(filter.dateRange.to)) : '...'
        return `${from.split('-').reverse().join('/')} - ${to.split('-').reverse().join('/')}`
      }
      return 'Tất cả thời gian'
    }
    if (tabId === 'status') {
      const statusMap: Record<string, string> = {
        Cho_duyet: 'Chờ duyệt',
        Da_duyet: 'Đã duyệt',
        Tu_choi: 'Từ chối',
        Huy: 'Đã huỷ'
      }
      let sub = ''
      if (filter.trang_thai) sub = statusMap[filter.trang_thai] || 'Đã chọn 1'
      if (filter.is_dotxuat !== undefined) {
        sub += sub ? ', ' : ''
        sub += (String(filter.is_dotxuat) === '1' ? 'Đột xuất' : 'Bình thường')
      }
      if (sub) return sub
      return 'Tất cả trạng thái'
    }
    if (tabId === 'unit') {
      if (filter.id_don_vi && filter.id_don_vi !== 'all') {
        const dept = departments
          .flatMap((d) => d.items || [d])
          .find((d) => d.value === filter.id_don_vi)
        return dept ? dept.label : 'Đã chọn đơn vị'
      }
      return 'Tất cả đơn vị'
    }
    return ''
  }

  const FILTER_TABS = [
    {
      id: 'time',
      label: 'Thời gian',
      icon: Clock,
      subtitle: getFilterSubtitle('time'),
      hasFilter: !!filter.dateRange?.from
    },
    {
      id: 'status',
      label: 'Trạng thái',
      icon: LayoutGrid,
      subtitle: getFilterSubtitle('status'),
      hasFilter: !!filter.trang_thai || filter.is_dotxuat !== undefined
    },
    ...(canViewDonViFilter
      ? [
        {
          id: 'unit',
          label: 'Đơn vị',
          icon: MapPin,
          subtitle: getFilterSubtitle('unit'),
          hasFilter: !!(filter.id_don_vi && filter.id_don_vi !== 'all')
        }
      ]
      : [])
  ]

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const depts = await mapDonviGroupedOptions()
      setDepartments(depts || [])
    }
    if (isFilterPopoverOpen || isExportModalOpen || filter.id_don_vi) fetchData()
  }, [isFilterPopoverOpen, isExportModalOpen, filter.id_don_vi])

  const activeFilterCount = Object.entries(filter).filter(([key, val]) => {
    if (val === '' || val === null || val === undefined || val === 'all') return false
    if (key === 'dateRange' && !val.from) return false
    return true
  }).length

  return (
    <div className="flex flex-col bg-transparent">
      {/*
       * Row 1 — Always Visible on DESKTOP: TimesheetSelector + inline filter chips + context action bar
       * Hidden on mobile — MobileFilterSheet handles filter on mobile
       */}
      <div className="hidden md:flex items-center justify-between gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Left slot — TimesheetSelector or other content passed from parent */}
          {leftContent && (
            <div className="flex shrink-0">
              {leftContent}
            </div>
          )}
          {/* Inline filter chips — only when filters are active */}
          {(filter.trang_thai ||
            filter.is_dotxuat !== undefined ||
            (filter.id_don_vi && filter.id_don_vi !== 'all') ||
            filter.dateRange?.from) && (
              <div className="flex items-center gap-1 flex-wrap ml-1">
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
                          className="ml-0.5 cursor-pointer w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                          <XCircle size={11} />
                        </button>
                      </div>
                    )
                  })()}

                {filter.trang_thai &&
                  (() => {
                    const statusMap: Record<string, { label: string; color: string }> = {
                      Cho_duyet: {
                        label: 'Chờ duyệt',
                        color:
                          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                      },
                      Da_duyet: {
                        label: 'Đã duyệt',
                        color:
                          'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                      },
                      Tu_choi: {
                        label: 'Từ chối',
                        color:
                          'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                      },
                      Huy: {
                        label: 'Đã huỷ',
                        color:
                          'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800'
                      }
                    }
                    const s = statusMap[filter.trang_thai]
                    return s ? (
                      <div
                        className={cn(
                          'flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border text-[11px] font-medium',
                          s.color
                        )}
                      >
                        <span className="text-gray-500 dark:text-gray-400 font-normal mr-0.5">
                          Trạng thái:
                        </span>
                        <span>{s.label}</span>
                        <button
                          onClick={() => {
                            const f = { ...filter }
                            delete f.trang_thai
                            onFilterChange(f)
                          }}
                          className="ml-0.5 cursor-pointer w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                          <XCircle size={11} />
                        </button>
                      </div>
                    ) : null
                  })()}

                {filter.is_dotxuat !== undefined && (
                  <div
                    className={cn(
                      'flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border text-[11px] font-medium',
                      String(filter.is_dotxuat) === '1'
                        ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                    )}
                  >
                    <span className="text-gray-500 dark:text-gray-400 font-normal mr-0.5">
                      Phân loại:
                    </span>
                    <span>{String(filter.is_dotxuat) === '1' ? 'Đột xuất' : 'Bình thường'}</span>
                    <button
                      onClick={() => {
                        const f = { ...filter }
                        delete f.is_dotxuat
                        onFilterChange(f)
                      }}
                      className="ml-0.5 cursor-pointer w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      <XCircle size={11} />
                    </button>
                  </div>
                )}

                {filter.id_don_vi &&
                  filter.id_don_vi !== 'all' &&
                  (() => {
                    const deptName =
                      departments
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .flatMap((g: any) => g.options || [g])
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .find((d: any) => String(d.value) === String(filter.id_don_vi))?.label ||
                      filter.id_don_vi
                    return (
                      <div className="flex items-center gap-1 h-6 pl-2 pr-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                        <span className="text-gray-500 dark:text-gray-400 font-normal mr-0.5">
                          Đơn vị:
                        </span>
                        <span className="max-w-[100px] truncate">{deptName}</span>
                        <button
                          onClick={() => {
                            const f = { ...filter }
                            delete f.id_don_vi
                            onFilterChange(f)
                          }}
                          className="ml-0.5 cursor-pointer w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                          <XCircle size={11} />
                        </button>
                      </div>
                    )
                  })()}

                {[
                  filter.trang_thai,
                  filter.id_don_vi && filter.id_don_vi !== 'all',
                  filter.dateRange?.from
                ].filter(Boolean).length > 1 && (
                    <button
                      onClick={() => {
                        const f = { ...filter }
                        delete f.trang_thai
                        delete f.id_don_vi
                        delete f.dateRange
                        onFilterChange(f)
                      }}
                      className="cursor-pointer flex items-center gap-0.5 h-6 px-2 rounded-full text-[11px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <RotateCcw size={10} />
                      <span>Xóa</span>
                    </button>
                  )}
              </div>
            )}
        </div>

        {/* RIGHT: Relative wrapper for normal actions ↔ bulk action crossfade */}
        <div className="relative flex items-center justify-end flex-none">
          {/* ── NORMAL TOOL ACTIONS ── */}
          <div
            className={cn(
              'flex items-center gap-1 transition-opacity duration-200 ease-in-out',
              selectedCount > 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
            )}
          >
            {/* Filter popover + tool actions: collapse when isToolbarActionsVisible=false */}
            <div
              className={cn(
                'flex items-center gap-1 transition-all duration-200',
                isToolbarActionsVisible
                  ? 'opacity-100 max-w-[400px]'
                  : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
              )}
            >
              {/* Advanced Filter */}
              <AdvancedFilterPopover
                isOpen={isFilterPopoverOpen}
                onOpenChange={setIsFilterPopoverOpen}
                isMobile={isMobile}
                activeFilterCount={activeFilterCount}
                onClearAll={() => onFilterChange({})}
                tabs={FILTER_TABS}
                activeTabId={activeFilterTab}
                onTabChange={(tabId) => setActiveFilterTab(tabId)}
              >
                {activeFilterTab === 'time' && (
                  <TimeFilterBlock
                    presets={timePresets}
                    dateRange={filter.dateRange || {}}
                    onChange={(val) => {
                      onFilterChange({ ...filter, dateRange: val })
                    }}
                  />
                )}

                {activeFilterTab === 'status' && (
                  <div className="flex flex-col h-full overflow-y-auto">
                    <CategorizedStatusBlock
                      title="Chọn trạng thái"
                      selectedValue={filter.trang_thai}
                      onChange={(val) => {
                        const newFilter = { ...filter }
                        if (filter.trang_thai === val) {
                          delete newFilter.trang_thai
                        } else {
                          newFilter.trang_thai = val
                        }
                        onFilterChange(newFilter)
                      }}
                      groups={[
                        {
                          id: 'TRONG_QUA_TRINH',
                          label: 'TRONG QUÁ TRÌNH',
                          options: [
                            {
                              value: 'Cho_duyet',
                              label: 'Chờ duyệt',
                              color: 'text-yellow-500',
                              iconStyle: 'solid'
                            }
                          ]
                        },
                        {
                          id: 'HOAN_THANH',
                          label: 'HOÀN THÀNH',
                          options: [
                            {
                              value: 'Da_duyet',
                              label: 'Đã duyệt',
                              color: 'text-green-500',
                              iconStyle: 'solid'
                            },
                            {
                              value: 'Tu_choi',
                              label: 'Từ chối',
                              color: 'text-red-500',
                              iconStyle: 'dotted'
                            },
                            {
                              value: 'Huy',
                              label: 'Đã huỷ',
                              color: 'text-gray-500',
                              iconStyle: 'dotted'
                            }
                          ]
                        }
                      ]}
                    />

                    <CategorizedStatusBlock
                      title="Phân loại đăng ký"
                      selectedValue={filter.is_dotxuat !== undefined ? String(filter.is_dotxuat) : ''}
                      onChange={(val) => {
                        const newFilter = { ...filter }
                        if (String(filter.is_dotxuat) === val) {
                          delete newFilter.is_dotxuat
                        } else {
                          newFilter.is_dotxuat = Number(val)
                        }
                        onFilterChange(newFilter)
                      }}
                      groups={[
                        {
                          id: 'LOAI',
                          label: 'TÍNH CHẤT',
                          options: [
                            {
                              value: '0',
                              label: 'Bình thường',
                              color: 'text-blue-500',
                              iconStyle: 'ring'
                            },
                            {
                              value: '1',
                              label: 'Đột xuất',
                              color: 'text-orange-500',
                              iconStyle: 'ring'
                            }
                          ]
                        }
                      ]}
                    />
                  </div>
                )}

                {activeFilterTab === 'unit' && (
                  <div className="flex flex-col gap-5 p-6">
                    <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
                      Chọn đơn vị
                    </span>
                    <SelectDropdown
                      label="Đơn vị"
                      placeholder="Tất cả đơn vị"
                      value={filter.id_don_vi || undefined}
                      onChange={(val) => onFilterChange({ ...filter, id_don_vi: val as string })}
                      options={departments}
                      disablePortal
                    />
                  </div>
                )}
              </AdvancedFilterPopover>

              {/* Tool actions group — separated by divider from filter */}
              <>
                {rightContent && (
                  <>
                    <div className="w-px h-5 hidden sm:block bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" />
                    <div className="flex items-center mr-1">
                      {rightContent}
                    </div>
                  </>
                )}
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" />

                <div className="flex items-center gap-0.5">
                  {/* <Button
                    variant="flat"
                    isIconOnly
                    radius="sm"
                    className="h-8 w-8 min-w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    onPress={() => {
                      if (!filter.id_bang_cham_cong) {
                        toast('Vui lòng chọn bảng chấm công trước', { variant: 'danger' })
                        return
                      }
                      setIsLockModalOpen(true)
                    }}
                    title="Khóa/Mở khóa khoảng thời gian"
                  >
                    <EllipsisVerticalIcon size={15} />
                  </Button> */}

                  <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <Popover.Trigger>
                      <Button
                        variant="flat"
                        isIconOnly
                        radius="sm"
                        className="h-8 w-8 min-w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        title="Tùy chọn"
                        onPress={() => setIsPopoverOpen(true)}
                      >
                        <EllipsisVerticalIcon size={18} />
                      </Button>
                    </Popover.Trigger>
                    <Popover.Content className="p-1 min-w-[220px] border-small border-default-100 shadow-lg rounded-lg">
                      <Popover.Arrow />
                      <Listbox
                        aria-label="Actions"
                        // onAction={(key) => handleAction(key)}
                        variant="flat"
                        itemClasses={{
                          base: [
                            "rounded-md",
                            "transition-opacity",
                            "data-[hover=true]:text-default-900",
                            "data-[hover=true]:bg-default-100",
                            "dark:data-[hover=true]:bg-default-50",
                            "data-[selectable=true]:focus:bg-default-50",
                            "py-2",
                            "px-3",
                          ],
                          title: "text-small font-normal",
                        }}
                      >
                        {canViewChamCong ? (
                          <ListboxItem
                            key="lock"
                            startContent={<LockIcon size={16} className="text-gray-500" />}
                            onPress={() => {
                              setIsLockModalOpen(true)
                              setIsPopoverOpen(false)
                            }}
                          >
                            Khóa/Mở khóa khoảng thời gian
                          </ListboxItem>
                        ) : null}

                        {canExportExcel ? (
                          <ListboxItem
                            key="excel"
                            startContent={<FileDownIcon size={16} className="text-gray-500" />}
                            onPress={() => {
                              setIsExportModalOpen(true)
                              setIsPopoverOpen(false)
                            }}
                          >
                            Xuất excel
                          </ListboxItem>
                        ) : null}

                        {viewMode === 'table' && columns && visibleColumns && setVisibleColumns ? (
                          <ListboxItem
                            key="columns"
                            textValue="Hiển thị cột"
                            className="p-0"
                          >
                            <TableColumnConfig
                              columns={columns}
                              visibleColumns={visibleColumns}
                              setVisibleColumns={setVisibleColumns}
                              columnOrder={columnOrder}
                              setColumnOrder={setColumnOrder}
                              customTrigger={
                                <div className="flex items-center py-2 px-3 gap-2 w-full text-small font-normal">
                                  <Columns3Icon size={16} className="text-gray-500 shrink-0" />
                                  <span>Hiển thị cột</span>
                                </div>
                              }
                            />
                          </ListboxItem>
                        ) : null}
                      </Listbox>
                    </Popover.Content>
                  </Popover>

                  {/* {canViewChamCong && (
                    <Button
                      variant="ghost"
                      isIconOnly
                      radius="sm"
                      className="h-8 w-8 min-w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      onPress={() => {
                        if (!filter.id_bang_cham_cong) {
                          toast('Vui lòng chọn bảng chấm công trước', { variant: 'danger' })
                          return
                        }
                        setIsLockModalOpen(true)
                      }}
                      title="Khóa/Mở khóa khoảng thời gian"
                    >
                      <Lock size={15} />
                    </Button>
                  )}

                  {canExportExcel && (
                    <Tooltip content="Xuất Excel theo đơn vị" placement="bottom">
                      <Button
                        variant="ghost"
                        isIconOnly
                        radius="sm"
                        className="h-8 w-8 min-w-8 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                        onPress={() => {
                          if (!filter.id_bang_cham_cong) {
                            toast('Vui lòng chọn bảng chấm công trước', { variant: 'danger' })
                            return
                          }
                          setIsExportModalOpen(true)
                        }}
                        title="Xuất Excel"
                      >
                        <Download size={15} />
                      </Button>
                    </Tooltip>
                  )} */}

                  {viewMode === 'excel' && calendarViewType === 'week' && (
                    <Button
                      variant="ghost"
                      isIconOnly
                      radius="sm"
                      className={cn(
                        'h-8 w-8 min-w-8',
                        showTotalHoursColumn
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      )}
                      onPress={() => setShowTotalHoursColumn(!showTotalHoursColumn)}
                      title="Mở/tắt cột tính tổng giờ"
                    >
                      <Sigma size={15} />
                    </Button>
                  )}
                </div>
              </>
            </div>
          </div>

          {/* ── BULK ACTION BAR ── slides in from right when items are selected */}
          <div
            className={cn(
              'absolute inset-y-0 right-0 flex items-center gap-1.5 bg-white dark:bg-gray-900',
              'transition-[opacity,transform] duration-200 ease-in-out',
              selectedCount > 0
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-3 pointer-events-none'
            )}
          >
            {/* Count badge */}
            <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <CheckCircle2 size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-300 whitespace-nowrap">
                Đã chọn{' '}
                <span
                  key={selectedCount}
                  className="inline-block bg-blue-600 text-white px-1.5 py-0.5 rounded-md text-[10px] ml-0.5 animate-[countPop_0.25s_ease-out]"
                >
                  {selectedCount}
                </span>{' '}
                đơn
              </span>
            </div>

            {/* Separator */}
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 shrink-0" />

            {/* Approve */}
            <Button
              variant="flat"
              color="success"
              startContent={<CheckCircle2 size={13} />}
              onPress={onBulkApprove}
              className="font-bold h-8 text-[12px] rounded-md"
            >
              DUYỆT
            </Button>

            {/* Reject */}
            <Button
              variant="flat"
              color="danger"
              radius="md"
              startContent={<XCircle size={13} />}
              onPress={onBulkReject}
              className="h-8 px-3 font-bold text-[12px] rounded-md"
            >
              TỪ CHỐI
            </Button>

            {/* Separator */}
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 shrink-0" />

            {/* Deselect all */}
            <Button
              variant="ghost"
              isIconOnly
              radius="sm"
              className="h-8 w-8 min-w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Bỏ chọn tất cả"
              onPress={onClearSelection}
            >
              <X size={15} />
            </Button>
          </div>
        </div>
      </div>
      <OvertimeLockModal
        isOpen={isLockModalOpen}
        onOpenChange={setIsLockModalOpen}
        timesheetId={filter.id_bang_cham_cong}
      />

      <OvertimeExportModal
        isOpen={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        timesheetId={filter.id_bang_cham_cong}
        departments={departments}
      />
    </div>
  )
}

export default React.memo(OvertimeToolbar)
