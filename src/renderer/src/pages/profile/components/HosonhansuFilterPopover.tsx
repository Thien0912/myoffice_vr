import { Badge, Button, Popover, Tabs, cn } from '@heroui-v3/react'
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import { mapVitriOptions } from '@renderer/api/danhmuc/VitriAxios'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import {
  Check,
  ChevronRight,
  Clock,
  FileText,
  Funnel,
  FunnelPlus,
  Hash,
  Inbox,
  RotateCcw,
  User
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface HosonhansuFilterPopoverProps {
  filter: Record<string, any>
  onFilterChange: (filter: Record<string, any>) => void
  onClear: () => void
  trangThaiOptions: { label: string; value: string }[]
  activeFilterCount: number
  hasActiveFilters: boolean
}

export default function HosonhansuFilterPopover({
  filter,
  onFilterChange,
  onClear,
  trangThaiOptions,
  activeFilterCount,
  hasActiveFilters
}: HosonhansuFilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])

  // --- Local state for debounced inputs ---
  const [maNhanVien, setMaNhanVien] = useState(filter.ma_nhan_vien || '')
  const [hoTen, setHoTen] = useState(filter.ho_ten || '')
  const [email, setEmail] = useState(filter.email || '')
  const [soCccd, setSoCccd] = useState(filter.so_cccd || '')

  const [activeFilterTab, setActiveFilterTab] = useState('work_time')
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch options when popover opens
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depts, vts] = await Promise.all([mapDonviGroupedOptions(), mapVitriOptions()])
        setDepartments(depts)
        setPositions(vts)
      } catch (error) {
        console.error('Error fetching filter options:', error)
      }
    }
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  // Sync local state when parent filter prop changes
  useEffect(() => {
    setMaNhanVien(filter.ma_nhan_vien || '')
    setHoTen(filter.ho_ten || '')
    setEmail(filter.email || '')
    setSoCccd(filter.so_cccd || '')
  }, [filter.ma_nhan_vien, filter.ho_ten, filter.email, filter.so_cccd])

  // Debounce for text inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasChanged =
        maNhanVien !== (filter.ma_nhan_vien || '') ||
        hoTen !== (filter.ho_ten || '') ||
        email !== (filter.email || '') ||
        soCccd !== (filter.so_cccd || '')

      if (hasChanged) {
        onFilterChange({
          ...filter,
          ma_nhan_vien: maNhanVien,
          ho_ten: hoTen,
          email: email,
          so_cccd: soCccd
        })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [maNhanVien, hoTen, email, soCccd])

  const today = new Date()
  const last7days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const thisYearStart = new Date(today.getFullYear(), 0, 1)

  const formatDate = (date: Date) => {
    const d = new Date(date)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().split('T')[0]
  }

  const timePresets = [
    { label: 'Hôm nay', value: { from: formatDate(today), to: formatDate(today) } },
    { label: '7 ngày qua', value: { from: formatDate(last7days), to: formatDate(today) } },
    { label: '30 ngày qua', value: { from: formatDate(last30days), to: formatDate(today) } },
    {
      label: `Năm nay (${today.getFullYear()})`,
      value: { from: formatDate(thisYearStart), to: formatDate(today) }
    }
  ]

  const FILTER_TABS = [
    { id: 'work_time', label: 'Ngày vào làm', icon: Clock },
    { id: 'info', label: 'Thông tin', icon: User },
    { id: 'organization', label: 'Đơn vị & Vị trí', icon: Inbox },
    { id: 'birth_date', label: 'Ngày sinh', icon: FileText }
  ]

  const isTimeTab = activeFilterTab === 'work_time'

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Badge.Anchor>
        <Popover.Trigger>
          <Button
            variant="secondary"
            isIconOnly
            size="sm"
            className={cn(
              'h-8 w-8 min-w-8 transition-colors',
              hasActiveFilters ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500'
            )}
          >
            {hasActiveFilters ? <FunnelPlus size={18} /> : <Funnel size={18} />}
          </Button>
        </Popover.Trigger>
        {hasActiveFilters && (
          <Badge
            size="sm"
            className="font-bold border-1 border-white dark:border-gray-800 bg-blue-600 text-white"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Badge.Anchor>

      <Popover.Content
        placement={isMobile ? 'bottom start' : 'bottom'}
        offset={10}
        className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl overflow-visible"
        shouldCloseOnInteractOutside={(e) => {
          if (!e || !e.closest) return true
          const isOverlay =
            e.closest('[data-slot="popover"]') ||
            e.closest('[data-slot="content"]') ||
            e.closest('[role="dialog"]') ||
            e.closest('[role="listbox"]')
          if (isOverlay) return false
          return true
        }}
      >
        <Popover.Dialog className="p-0 border-none shadow-none focus:outline-none">
          <Popover.Arrow />
          <div
            className={cn(
              'flex flex-col sm:flex-row w-[calc(100vw-40px)] sm:w-auto max-w-[460px] sm:max-w-none max-h-[80vh] sm:max-h-[500px] overflow-visible'
            )}
          >
            {/* Left Panel - Tabs */}
            <div className="w-full sm:w-[200px] shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col p-2 sm:p-3 z-10 overflow-hidden">
              <span className="hidden sm:block text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-4 px-2 mt-1">
                BỘ LỌC HỒ SƠ
              </span>

              <div className="flex-1 overflow-x-auto sm:overflow-x-visible pb-0 custom-scrollbar">
                <Tabs
                  aria-label="Filter Tabs"
                  selectedKey={activeFilterTab}
                  onSelectionChange={(key) => {
                    setActiveFilterTab(key as string)
                    setShowCustomDate(false)
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  <Tabs.ListContainer>
                    <Tabs.List className="flex-row sm:flex-col items-start gap-0.5 p-0 bg-transparent min-w-max sm:min-w-0 sm:w-full border-none shadow-none">
                      {FILTER_TABS.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeFilterTab === tab.id

                        let hasFilter = false
                        if (
                          tab.id === 'work_time' &&
                          (filter.dateRange?.fromDate || filter.dateRange?.toDate)
                        )
                          hasFilter = true
                        if (
                          tab.id === 'info' &&
                          (filter.ma_nhan_vien || filter.ho_ten || filter.email || filter.so_cccd)
                        )
                          hasFilter = true
                        if (
                          tab.id === 'organization' &&
                          (filter.id_don_vi || filter.id_vi_tri_cong_viec || filter.trang_thai)
                        )
                          hasFilter = true
                        if (tab.id === 'birth_date' && filter.ngay_sinh) hasFilter = true

                        return (
                          <Tabs.Tab
                            id={tab.id}
                            key={tab.id}
                            className="justify-start px-0 h-11 w-auto sm:w-full shrink-0 border-none shadow-none"
                          >
                            <div className="flex items-center gap-3 w-full relative px-3">
                              <Icon
                                size={16}
                                className={cn(
                                  isActive ? 'text-blue-600' : 'text-gray-400 opacity-80'
                                )}
                              />
                              <span
                                className={cn(
                                  'font-medium transition-colors hidden sm:block w-full text-left',
                                  isActive
                                    ? 'text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                )}
                              >
                                {tab.label}
                              </span>
                              {hasFilter && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.6)]" />
                              )}
                            </div>
                          </Tabs.Tab>
                        )
                      })}
                    </Tabs.List>
                  </Tabs.ListContainer>
                </Tabs>
              </div>

              <div className="mt-2 sm:mt-auto pt-2">
                <Button
                  variant="ghost"
                  isDisabled={!hasActiveFilters}
                  className={cn(
                    'w-full justify-start px-2 sm:px-3 h-10 text-[13px] font-bold transition-colors',
                    hasActiveFilters
                      ? 'text-red-500'
                      : 'text-gray-400 opacity-60 pointer-events-none'
                  )}
                  onPress={onClear}
                >
                  <RotateCcw size={15} />
                  <span className="hidden sm:inline">Đặt lại bộ lọc</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
              </div>
            </div>

            {/* Right Panel - Content */}
            <div
              className={cn(
                'bg-white dark:bg-gray-800 overflow-y-auto overflow-x-visible custom-scrollbar flex flex-col flex-1 sm:min-w-[320px]',
                isTimeTab ? 'p-0' : 'p-4 sm:p-5 gap-3'
              )}
            >
              {isTimeTab && (
                <div className="flex flex-col sm:flex-row w-full h-full sm:min-h-[350px]">
                  {isMobile ? (
                    !showCustomDate ? (
                      <div className="w-full flex flex-col p-2">
                        {timePresets.map((preset, idx) => {
                          const isSelected =
                            filter.dateRange?.fromDate === preset.value.from &&
                            filter.dateRange?.toDate === preset.value.to

                          return (
                            <Button
                              key={idx}
                              variant="ghost"
                              className={cn(
                                'justify-start h-10 px-3 min-h-10 text-[13px] rounded-md font-medium',
                                isSelected
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              )}
                              onPress={() => {
                                onFilterChange({
                                  ...filter,
                                  dateRange: {
                                    fromDate: preset.value.from,
                                    toDate: preset.value.to
                                  }
                                })
                              }}
                            >
                              <span className="flex-1 text-left">{preset.label}</span>
                              {isSelected && (
                                <Check size={15} className="text-blue-600 dark:text-blue-400" />
                              )}
                            </Button>
                          )
                        })}
                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-2 mx-2" />
                        <Button
                          variant="ghost"
                          className="justify-between h-10 px-3 min-h-10 text-[13px] rounded-md font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onPress={() => setShowCustomDate(true)}
                        >
                          Phạm vi ngày tùy chỉnh
                          <ChevronRight size={15} className="text-gray-400" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col">
                        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 dark:border-gray-700">
                          <Button
                            isIconOnly
                            variant="ghost"
                            size="sm"
                            onPress={() => setShowCustomDate(false)}
                          >
                            <ChevronRight size={16} className="rotate-180" />
                          </Button>
                          <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                            Phạm vi ngày tùy chỉnh
                          </span>
                        </div>
                        <div className="flex flex-col gap-3 p-4">
                          <DateInputFloatingLabel
                            label="Từ ngày"
                            value={filter.dateRange?.fromDate || ''}
                            onChange={(val) =>
                              onFilterChange({
                                ...filter,
                                dateRange: { ...filter.dateRange, fromDate: val }
                              })
                            }
                          />
                          <DateInputFloatingLabel
                            label="Đến ngày"
                            value={filter.dateRange?.toDate || ''}
                            onChange={(val) =>
                              onFilterChange({
                                ...filter,
                                dateRange: { ...filter.dateRange, toDate: val }
                              })
                            }
                          />
                        </div>
                      </div>
                    )
                  ) : (
                    <>
                      <div
                        className={cn(
                          'w-[220px] shrink-0 bg-white dark:bg-gray-800 flex flex-col z-20',
                          showCustomDate && 'border-r border-gray-100 dark:border-gray-700'
                        )}
                      >
                        <div className="flex flex-col flex-1 p-2">
                          {timePresets.map((preset, idx) => {
                            const isSelected =
                              filter.dateRange?.fromDate === preset.value.from &&
                              filter.dateRange?.toDate === preset.value.to &&
                              !showCustomDate

                            return (
                              <Button
                                key={idx}
                                variant="ghost"
                                className={cn(
                                  'justify-start h-10 px-3 min-h-10 text-[13px] rounded-md font-medium',
                                  isSelected
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                )}
                                onPress={() => {
                                  setShowCustomDate(false)
                                  onFilterChange({
                                    ...filter,
                                    dateRange: {
                                      fromDate: preset.value.from,
                                      toDate: preset.value.to
                                    }
                                  })
                                }}
                              >
                                <span className="flex-1 text-left">{preset.label}</span>
                                {isSelected && (
                                  <Check size={16} className="text-blue-600 dark:text-blue-400" />
                                )}
                              </Button>
                            )
                          })}
                          <div
                            className={cn(
                              'h-px bg-gray-200 dark:bg-gray-700 my-2',
                              !showCustomDate ? '-mx-2' : 'mx-2'
                            )}
                          />
                          <Button
                            variant="ghost"
                            className={cn(
                              'justify-between h-10 px-3 min-h-10 text-[13px] rounded-md font-medium',
                              showCustomDate
                                ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            )}
                            onPress={() => setShowCustomDate(true)}
                          >
                            Tùy chỉnh khoảng ngày
                            <ChevronRight
                              size={16}
                              className={cn(
                                'text-gray-400 transition-transform',
                                showCustomDate && 'text-gray-600 dark:text-gray-300'
                              )}
                            />
                          </Button>
                        </div>
                      </div>
                      {showCustomDate && (
                        <div style={{ width: 340 }}>
                          <div className="w-[340px] h-full flex flex-col bg-white dark:bg-gray-800">
                            <div className="flex-1 p-6 flex flex-col gap-3 mt-2 overflow-y-auto custom-scrollbar">
                              <DateInputFloatingLabel
                                label="Từ ngày"
                                value={filter.dateRange?.fromDate || ''}
                                onChange={(val) =>
                                  onFilterChange({
                                    ...filter,
                                    dateRange: { ...filter.dateRange, fromDate: val }
                                  })
                                }
                              />
                              <DateInputFloatingLabel
                                label="Đến ngày"
                                value={filter.dateRange?.toDate || ''}
                                onChange={(val) =>
                                  onFilterChange({
                                    ...filter,
                                    dateRange: { ...filter.dateRange, toDate: val }
                                  })
                                }
                              />
                            </div>
                            <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 font-medium hover:text-red-500"
                                onPress={() => {
                                  onFilterChange({
                                    ...filter,
                                    dateRange: { fromDate: '', toDate: '' }
                                  })
                                }}
                              >
                                Xóa
                              </Button>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 font-bold px-4"
                                  onPress={() => setShowCustomDate(false)}
                                >
                                  Huỷ
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="font-bold px-6 shadow-md"
                                  onPress={() => setShowCustomDate(false)}
                                >
                                  Áp dụng
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeFilterTab === 'info' && (
                <div className="flex flex-col gap-3">
                  <InputFloatingLabel
                    label="Mã nhân viên"
                    placeholder="Nhập mã..."
                    value={maNhanVien}
                    onChange={setMaNhanVien}
                    endContent={<Hash size={14} className="text-gray-400" />}
                  />
                  <InputFloatingLabel
                    label="Họ và tên"
                    placeholder="Nhập tên..."
                    value={hoTen}
                    onChange={setHoTen}
                    endContent={<User size={14} className="text-gray-400" />}
                  />
                  <InputFloatingLabel
                    label="Email"
                    placeholder="Nhập email..."
                    value={email}
                    onChange={setEmail}
                    endContent={<Hash size={14} className="text-gray-400" />}
                  />
                  <InputFloatingLabel
                    label="Mã số CCCD"
                    placeholder="Nhập số CCCD..."
                    value={soCccd}
                    onChange={setSoCccd}
                    endContent={<Hash size={14} className="text-gray-400" />}
                  />
                </div>
              )}

              {activeFilterTab === 'organization' && (
                <div className="flex flex-col gap-3">
                  <SelectDropdown
                    label="Trạng thái"
                    options={trangThaiOptions}
                    value={filter.trang_thai || ''}
                    onChange={(val) => onFilterChange({ ...filter, trang_thai: val })}
                    placeholder="Tất cả"
                  />
                  <SelectDropdown
                    label="Đơn vị"
                    options={departments}
                    value={filter.id_don_vi || ''}
                    onChange={(val) => onFilterChange({ ...filter, id_don_vi: val })}
                    placeholder="Tất cả đơn vị"
                  />
                  <SelectDropdown
                    label="Vị trí công việc"
                    options={positions}
                    value={filter.id_vi_tri_cong_viec || ''}
                    onChange={(val) => onFilterChange({ ...filter, id_vi_tri_cong_viec: val })}
                    placeholder="Tất cả vị trí"
                  />
                </div>
              )}

              {activeFilterTab === 'birth_date' && (
                <div className="flex flex-col gap-3">
                  <DateInputFloatingLabel
                    label="Ngày sinh"
                    value={filter.ngay_sinh || ''}
                    onChange={(val) => onFilterChange({ ...filter, ngay_sinh: val })}
                  />
                </div>
              )}
            </div>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}
