import { Badge, Button, Popover, Tabs, cn } from '@heroui-v3/react'
import { LOAI_HOP_DONG } from '@renderer/api/danhmuc/hopDong'
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
  RotateCcw,
  Tag
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface HopdongFilterPopoverProps {
  filter: any
  onFilterChange: (filter: any) => void
  onClear: () => void
}

export default function HopdongFilterPopover({
  filter,
  onFilterChange,
  onClear
}: HopdongFilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [soHopDong, setSoHopDong] = useState(filter.so_hop_dong || '')
  const [activeFilterTab, setActiveFilterTab] = useState('time')
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const loaiHopdongOptions = Object.values(LOAI_HOP_DONG)
  const trangThaiOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang hiệu lực', value: 'dang_hieu_luc' },
    { label: 'Hết hiệu lực', value: 'het_hieu_luc' },
    { label: 'Đã xóa', value: 'da_xoa' }
  ]

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sync local state when filter prop changes
  useEffect(() => {
    setSoHopDong(filter.so_hop_dong || '')
  }, [filter.so_hop_dong])

  // Debounce so_hop_dong
  useEffect(() => {
    const timer = setTimeout(() => {
      if (soHopDong !== (filter.so_hop_dong || '')) {
        onFilterChange({ ...filter, so_hop_dong: soHopDong })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [soHopDong])

  const activeFilterCount = [
    filter.so_hop_dong,
    filter.loai_hop_dong,
    filter.selectedClassify !== 'all' ? filter.selectedClassify : null,
    filter.ngay_ky_tu || filter.ngay_ky_den ? 'date_ky' : null,
    filter.ngay_ket_thuc_tu || filter.ngay_ket_thuc_den ? 'date_ket_thuc' : null
  ].filter(Boolean).length

  const today = new Date()
  const last7days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const thisYearStart = new Date(today.getFullYear(), 0, 1)
  const lastYearStart = new Date(today.getFullYear() - 1, 0, 1)
  const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31)

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
    },
    {
      label: `Năm ngoái (${today.getFullYear() - 1})`,
      value: { from: formatDate(lastYearStart), to: formatDate(lastYearEnd) }
    }
  ]

  const FILTER_TABS = [
    { id: 'time', label: 'Thời gian ký', icon: Clock },
    { id: 'expiration', label: 'Thời hạn kết thúc', icon: Clock },
    { id: 'info', label: 'Thông tin chung', icon: FileText },
    { id: 'category', label: 'Trạng thái', icon: Tag }
  ]

  const isTimeTab = activeFilterTab === 'time' || activeFilterTab === 'expiration'

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Badge.Anchor>
        <Popover.Trigger>
          <Button
            variant="secondary"
            isIconOnly
            size="sm"
            className={`min-w-8 w-8 h-8 ${activeFilterCount > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500'}`}
          >
            {activeFilterCount > 0 ? <FunnelPlus size={18} /> : <Funnel size={18} />}
          </Button>
        </Popover.Trigger>
        {!isOpen && activeFilterCount > 0 && (
          <Badge
            size="sm"
            className="font-bold border-1 border-white dark:border-gray-800 bg-red-600 text-white"
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
              'flex flex-col sm:flex-row w-[calc(100vw-40px)] sm:w-auto max-w-[460px] sm:max-w-none max-h-[80vh] sm:max-h-[500px] overflow-visible',
              !isTimeTab && 'sm:min-w-[550px] sm:w-[550px]',
              isTimeTab && 'sm:w-max'
            )}
          >
            {/* Left Panel - Tabs */}
            <div className="w-full sm:w-[200px] shrink-0 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col p-2 sm:p-3 z-10 overflow-hidden">
              <span className="hidden sm:block text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-4 px-2 mt-1">
                BỘ LỌC NÂNG CAO
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
                    <Tabs.List className="flex-row sm:flex-col gap-0.5 p-0 bg-transparent min-w-max sm:min-w-0 sm:w-full border-none shadow-none">
                      {FILTER_TABS.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeFilterTab === tab.id

                        let hasFilter = false
                        if (
                          tab.id === 'time' &&
                          (filter.ngay_ky_tu || filter.ngay_ky_den || filter.year !== 'all')
                        )
                          hasFilter = true
                        if (
                          tab.id === 'expiration' &&
                          (filter.ngay_ket_thuc_tu || filter.ngay_ket_thuc_den)
                        )
                          hasFilter = true
                        if (tab.id === 'info' && (filter.so_hop_dong || filter.loai_hop_dong))
                          hasFilter = true
                        if (tab.id === 'category' && filter.selectedClassify !== 'all')
                          hasFilter = true

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
                  isDisabled={activeFilterCount === 0}
                  className={cn(
                    'w-full justify-start px-2 sm:px-3 h-10 text-[13px] font-bold transition-colors',
                    activeFilterCount > 0
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
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
                'bg-white dark:bg-gray-800 overflow-y-auto overflow-x-visible custom-scrollbar flex flex-col flex-1 min-w-0',
                isTimeTab ? 'p-0' : 'p-4 sm:p-5 gap-6'
              )}
            >
              {isTimeTab && (
                <div className="flex flex-col sm:flex-row w-full h-full sm:min-h-[350px]">
                  {isMobile ? (
                    !showCustomDate ? (
                      <div className="w-full flex flex-col p-2">
                        {timePresets.map((preset, idx) => {
                          const isExp = activeFilterTab === 'expiration'
                          const fromVal = isExp ? filter.ngay_ket_thuc_tu : filter.ngay_ky_tu
                          const toVal = isExp ? filter.ngay_ket_thuc_den : filter.ngay_ky_den
                          const isSelected =
                            fromVal === preset.value.from && toVal === preset.value.to

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
                                if (activeFilterTab === 'expiration') {
                                  onFilterChange({
                                    ...filter,
                                    ngay_ket_thuc_tu: preset.value.from,
                                    ngay_ket_thuc_den: preset.value.to
                                  })
                                } else {
                                  onFilterChange({
                                    ...filter,
                                    ngay_ky_tu: preset.value.from,
                                    ngay_ky_den: preset.value.to
                                  })
                                }
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
                        <div className="flex flex-col gap-5 p-4">
                          {activeFilterTab === 'expiration' ? (
                            <>
                              <DateInputFloatingLabel
                                label="Từ ngày"
                                value={filter.ngay_ket_thuc_tu || ''}
                                onChange={(val) =>
                                  onFilterChange({ ...filter, ngay_ket_thuc_tu: val })
                                }
                              />
                              <DateInputFloatingLabel
                                label="Đến ngày"
                                value={filter.ngay_ket_thuc_den || ''}
                                onChange={(val) =>
                                  onFilterChange({ ...filter, ngay_ket_thuc_den: val })
                                }
                              />
                            </>
                          ) : (
                            <>
                              <DateInputFloatingLabel
                                label="Từ ngày"
                                value={filter.ngay_ky_tu || ''}
                                onChange={(val) => onFilterChange({ ...filter, ngay_ky_tu: val })}
                              />
                              <DateInputFloatingLabel
                                label="Đến ngày"
                                value={filter.ngay_ky_den || ''}
                                onChange={(val) => onFilterChange({ ...filter, ngay_ky_den: val })}
                              />
                            </>
                          )}
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
                            const isExp = activeFilterTab === 'expiration'
                            const fromVal = isExp ? filter.ngay_ket_thuc_tu : filter.ngay_ky_tu
                            const toVal = isExp ? filter.ngay_ket_thuc_den : filter.ngay_ky_den
                            const isSelected =
                              fromVal === preset.value.from &&
                              toVal === preset.value.to &&
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
                                  if (isExp) {
                                    onFilterChange({
                                      ...filter,
                                      ngay_ket_thuc_tu: preset.value.from,
                                      ngay_ket_thuc_den: preset.value.to
                                    })
                                  } else {
                                    onFilterChange({
                                      ...filter,
                                      ngay_ky_tu: preset.value.from,
                                      ngay_ky_den: preset.value.to
                                    })
                                  }
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
                            <div className="flex-1 p-6 flex flex-col gap-6 mt-2 overflow-y-auto custom-scrollbar">
                              {activeFilterTab === 'time' && (
                                <SelectDropdown
                                  label="Năm"
                                  options={[
                                    { label: 'Tất cả năm', value: 'all' },
                                    ...Array.from({ length: 15 }, (_, i) => {
                                      const year = new Date().getFullYear() - i
                                      return { label: `Năm ${year}`, value: year.toString() }
                                    })
                                  ]}
                                  value={filter.year || 'all'}
                                  onChange={(val) => {
                                    if (val === 'all') {
                                      onFilterChange({
                                        ...filter,
                                        year: 'all',
                                        ngay_ky_tu: '',
                                        ngay_ky_den: ''
                                      })
                                    } else {
                                      onFilterChange({
                                        ...filter,
                                        year: val,
                                        ngay_ky_tu: `${val}-01-01`,
                                        ngay_ky_den: `${val}-12-31`
                                      })
                                    }
                                  }}
                                />
                              )}
                              <DateInputFloatingLabel
                                label="Từ ngày"
                                value={
                                  activeFilterTab === 'expiration'
                                    ? filter.ngay_ket_thuc_tu || ''
                                    : filter.ngay_ky_tu || ''
                                }
                                onChange={(val) => {
                                  if (activeFilterTab === 'expiration') {
                                    onFilterChange({ ...filter, ngay_ket_thuc_tu: val })
                                  } else {
                                    onFilterChange({ ...filter, ngay_ky_tu: val })
                                  }
                                }}
                              />
                              <DateInputFloatingLabel
                                label="Đến ngày"
                                value={
                                  activeFilterTab === 'expiration'
                                    ? filter.ngay_ket_thuc_den || ''
                                    : filter.ngay_ky_den || ''
                                }
                                onChange={(val) => {
                                  if (activeFilterTab === 'expiration') {
                                    onFilterChange({ ...filter, ngay_ket_thuc_den: val })
                                  } else {
                                    onFilterChange({ ...filter, ngay_ky_den: val })
                                  }
                                }}
                              />
                            </div>
                            <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 font-medium hover:text-red-500"
                                onPress={() => {
                                  if (activeFilterTab === 'expiration') {
                                    onFilterChange({
                                      ...filter,
                                      ngay_ket_thuc_tu: '',
                                      ngay_ket_thuc_den: ''
                                    })
                                  } else {
                                    onFilterChange({ ...filter, ngay_ky_tu: '', ngay_ky_den: '' })
                                  }
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
                <div className="flex flex-col gap-4">
                  <InputFloatingLabel
                    label="Số hợp đồng"
                    value={soHopDong}
                    onChange={setSoHopDong}
                    placeholder="Nhập số..."
                    endContent={<Hash size={14} className="text-gray-400" />}
                  />
                  <SelectDropdown
                    label="Loại hợp đồng"
                    placeholder="Chọn loại hợp đồng"
                    options={loaiHopdongOptions}
                    value={filter.loai_hop_dong || ''}
                    onChange={(val) => onFilterChange({ ...filter, loai_hop_dong: val })}
                  />
                </div>
              )}

              {activeFilterTab === 'category' && (
                <div className="flex flex-col gap-4">
                  <SelectDropdown
                    label="Trạng thái"
                    placeholder="Chọn trạng thái"
                    options={trangThaiOptions}
                    value={filter.selectedClassify || 'all'}
                    onChange={(val) => onFilterChange({ ...filter, selectedClassify: val })}
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
