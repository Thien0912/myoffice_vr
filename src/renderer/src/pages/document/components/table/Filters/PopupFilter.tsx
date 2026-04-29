import { Badge, Button, Popover, Tabs, cn } from '@heroui-v3/react'
import { callApi } from '@renderer/api/callApi'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { DonVi, LoaiVanBan } from '@renderer/shared/CommonInterface'
import { useCurrentStore } from '@renderer/utils/useCurrentStore'
import { Check, ChevronRight, Clock, FileText, Filter, RotateCcw, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function PopupFilter({ hideTrigger = false }: { hideTrigger?: boolean }): React.JSX.Element {
  const { filters } = useCurrentStore()

  // Tính số lượng bộ lọc đang hoạt động (không tính các giá trị mặc định của năm)
  const activeCount = [
    filters.so_van_ban,
    filters.so_hieu_van_ban,
    filters.trich_yeu,
    filters.id_loai,
    filters.id_don_vi_xu_ly,
    filters.id_don_vi_soan,
    filters.dateRange?.fromProcess || filters.dateRange?.toProcess,
    filters.dateRange?.fromReceive || filters.dateRange?.toReceive,
    filters.sortOrder ? 'sort' : null
  ].filter(Boolean).length

  return (
    <>
      {!hideTrigger && (
        <Popover>
          <Badge.Anchor>
            <Popover.Trigger>
              <Button
                variant="ghost"
                isIconOnly
                aria-label="Filter"
                className={`rounded-full ${activeCount > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-800'} hover:text-blue-600 transition-colors h-9 w-9 min-w-9`}
              >
                <Filter size={18} />
              </Button>
            </Popover.Trigger>
            {activeCount > 0 && (
              <Badge
                size="sm"
                className="font-bold border-1 border-white dark:border-gray-800 bg-blue-600 text-white"
              >
                {activeCount}
              </Badge>
            )}
          </Badge.Anchor>
          <Popover.Content
            placement="bottom"
            offset={10}
            shouldCloseOnInteractOutside={(e) => {
              if (!e || !e.closest) return true
              // Prevent closing when interacting with DatePicker or Select dropdowns
              const isOverlay =
                e.closest('[data-slot="popover"]') ||
                e.closest('[data-slot="content"]') ||
                e.closest('[role="dialog"]') ||
                e.closest('[role="listbox"]')
              if (isOverlay) return false
              return true
            }}
          >
            <Popover.Dialog className="p-0 bg-white dark:bg-gray-800 border-none shadow-2xl rounded-2xl overflow-hidden">
              <Popover.Arrow />
              <PopupFilterContent />
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      )}
    </>
  )
}

export function PopupFilterContent(): React.JSX.Element {
  const [loaiVanban, setLoaiVanban] = useState<LoaiVanBan[]>([])
  const [donVi, setDonVi] = useState<DonVi[]>([])
  const [typingValueSVB, setTypingValueSVB] = useState('')
  const [typingValueSHVB, setTypingValueSHVB] = useState('')
  const [typingValueTrichYeu, setTypingValueTrichYeu] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState('time')
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [customDateRange, setCustomDateRange] = useState<{
    fromReceive?: string
    toReceive?: string
    fromProcess?: string
    toProcess?: string
  }>({})
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()

  const currentStore = useCurrentStore()
  const { filters, setFilters } = currentStore

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setCustomDateRange({
      fromReceive: filters.dateRange?.fromReceive,
      toReceive: filters.dateRange?.toReceive,
      fromProcess: filters.dateRange?.fromProcess,
      toProcess: filters.dateRange?.toProcess
    })
  }, [filters.dateRange])

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

  const getLoaiVanban = async () => {
    const res = await callApi('admin/danhmuc/loai', {
      method: 'GET',
      data: { length: 1000 }
    })
    setLoaiVanban(res.data ?? [])
  }

  const getDonVi = async () => {
    const res = await callApi('admin/danhmuc/donvi', {
      method: 'GET',
      data: { length: 1000 }
    })
    setDonVi(res.data ?? [])
  }

  useEffect(() => {
    getLoaiVanban()
    getDonVi()
    if (filters.so_van_ban) setTypingValueSVB(filters.so_van_ban)
    if (filters.so_hieu_van_ban) setTypingValueSHVB(filters.so_hieu_van_ban)
    if (filters.trich_yeu) setTypingValueTrichYeu(filters.trich_yeu)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({
        so_van_ban: typingValueSVB,
        so_hieu_van_ban: typingValueSHVB,
        trich_yeu: typingValueTrichYeu
      })
    }, 1000)
    return () => clearTimeout(timer)
  }, [typingValueSVB, typingValueSHVB, typingValueTrichYeu])

  const handleReset = () => {
    setTypingValueSVB('')
    setTypingValueSHVB('')
    setTypingValueTrichYeu('')
    setFilters({
      so_van_ban: '',
      so_hieu_van_ban: '',
      trich_yeu: '',
      id_loai: '',
      id_don_vi_xu_ly: '',
      id_don_vi_soan: '',
      dateRange: {
        fromProcess: '',
        toProcess: '',
        fromReceive: '',
        toReceive: '',
        fromDate: '',
        toDate: ''
      },
      sortOrder: ''
    })
  }

  useEffect(() => {
    const handleResetEvent = () => handleReset()
    window.addEventListener('filter-reset', handleResetEvent)
    return () => window.removeEventListener('filter-reset', handleResetEvent)
  }, [])

  const loaiOptions = loaiVanban.map((m) => ({ value: String(m.id_loai), label: m.ten_loai }))
  const donviOptions = donVi.map((m) => ({ value: String(m.id_don_vi), label: m.ten_don_vi }))

  const FILTER_TABS = [
    {
      id: 'time',
      label: location.pathname.includes('vanbannoibo') ? 'Thời gian ký' : 'Thời gian nhận',
      icon: Clock
    },
    { id: 'timeProcess', label: 'Thời gian xử lý', icon: Clock },
    { id: 'info', label: 'Thông tin chung', icon: FileText },
    { id: 'category', label: 'Phân loại', icon: Tag }
  ]

  const isTimeTab = activeFilterTab === 'time' || activeFilterTab === 'timeProcess'
  const hasActiveFilters =
    filters.so_van_ban ||
    filters.so_hieu_van_ban ||
    filters.trich_yeu ||
    filters.id_loai ||
    filters.id_don_vi_xu_ly ||
    filters.id_don_vi_soan ||
    filters.sortOrder ||
    filters.dateRange?.fromReceive ||
    filters.dateRange?.toReceive ||
    filters.dateRange?.fromProcess ||
    filters.dateRange?.toProcess ||
    filters.dateRange?.fromDate ||
    filters.dateRange?.toDate

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row w-[calc(100vw-40px)] sm:w-auto max-w-[460px] sm:max-w-none max-h-[80vh] sm:max-h-[500px] overflow-hidden'
      )}
    >
      {/* Left Panel - Tabs */}
      <div className="w-full sm:w-[200px] shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col p-2 sm:p-3 z-10">
        <span className="hidden sm:block text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-4 px-2 mt-1">
          BỘ LỌC NÂNG CAO
        </span>

        <div className="flex-1 overflow-x-auto sm:overflow-x-visible pb-0 custom-scrollbar">
          <Tabs
            aria-label="Filter Tabs"
            selectedKey={activeFilterTab}
            onSelectionChange={(key) => setActiveFilterTab(key as string)}
            className="w-full"
          >
            <Tabs.ListContainer>
              <Tabs.List className="flex-row sm:flex-col items-start gap-0.5 p-0 bg-transparent min-w-max sm:min-w-0 sm:w-full border-none shadow-none">
                {FILTER_TABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeFilterTab === tab.id

                  let hasFilter = false
                  if (
                    tab.id === 'time' &&
                    (filters.dateRange?.fromReceive || filters.dateRange?.toReceive)
                  )
                    hasFilter = true
                  if (
                    tab.id === 'timeProcess' &&
                    (filters.dateRange?.fromProcess || filters.dateRange?.toProcess)
                  )
                    hasFilter = true
                  if (
                    tab.id === 'info' &&
                    (filters.so_van_ban || filters.so_hieu_van_ban || filters.trich_yeu)
                  )
                    hasFilter = true
                  if (
                    tab.id === 'category' &&
                    (filters.id_loai ||
                      filters.id_don_vi_xu_ly ||
                      filters.id_don_vi_soan ||
                      filters.sortOrder)
                  )
                    hasFilter = true

                  return (
                    <Tabs.Tab
                      id={tab.id}
                      key={tab.id}
                      className="justify-start px-0 h-10 w-auto sm:w-full shrink-0 border-none shadow-none"
                    >
                      <div className="flex items-center gap-2 w-full relative px-2">
                        <Icon
                          size={15}
                          className={cn(isActive ? 'text-blue-600' : 'text-gray-400 opacity-80')}
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
            {FILTER_TABS.map((tab) => (
              <Tabs.Panel id={tab.id} key={tab.id} className="hidden">
                <></>
              </Tabs.Panel>
            ))}
          </Tabs>
        </div>

        <div className="mt-2 sm:mt-auto pt-2">
          <Button
            variant="ghost"
            isDisabled={!hasActiveFilters}
            className={cn(
              'w-full justify-start px-2 sm:px-3 h-10 text-[13px] font-bold transition-colors',
              hasActiveFilters ? 'text-red-500' : 'text-gray-400 opacity-60 pointer-events-none'
            )}
            onPress={() => {
              const resetEvent = new CustomEvent('filter-reset')
              window.dispatchEvent(resetEvent)
            }}
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
          'bg-white dark:bg-gray-800 overflow-y-auto custom-scrollbar flex flex-col flex-1 sm:min-w-[300px]',
          isTimeTab ? 'p-0' : 'p-4 sm:p-5 gap-6'
        )}
      >
        {isTimeTab &&
          (() => {
            const isProcess = activeFilterTab === 'timeProcess'
            const fromKey = isProcess ? 'fromProcess' : 'fromReceive'
            const toKey = isProcess ? 'toProcess' : 'toReceive'
            const customFromVal = customDateRange[fromKey] || ''
            const customToVal = customDateRange[toKey] || ''
            const filterFromVal = filters.dateRange?.[fromKey]
            const filterToVal = filters.dateRange?.[toKey]

            return (
              <div className="flex flex-col sm:flex-row w-full h-full sm:min-h-[350px]">
                {isMobile ? (
                  !showCustomDate ? (
                    <div key="presets" className="w-full flex flex-col p-2">
                      {timePresets.map((preset, idx) => {
                        const isSelected =
                          filterFromVal === preset.value.from &&
                          filterToVal === preset.value.to &&
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
                              setFilters({
                                dateRange: {
                                  ...filters.dateRange,
                                  [fromKey]: preset.value.from,
                                  [toKey]: preset.value.to
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
                    <div key="custom-date-mobile" className="w-full flex flex-col">
                      {/* Header back */}
                      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 dark:border-gray-700">
                        <Button
                          isIconOnly
                          variant="ghost"
                          size="sm"
                          onPress={() => {
                            setShowCustomDate(false)
                            setCustomDateRange({
                              ...customDateRange,
                              [fromKey]: filters.dateRange?.[fromKey],
                              [toKey]: filters.dateRange?.[toKey]
                            })
                          }}
                        >
                          <ChevronRight size={16} className="rotate-180" />
                        </Button>
                        <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
                          Phạm vi ngày tùy chỉnh
                        </span>
                      </div>
                      {/* Date Inputs */}
                      <div className="flex flex-col gap-5 p-4">
                        <DateInputFloatingLabel
                          label="Từ ngày (Sau)"
                          value={customFromVal}
                          onChange={(val) =>
                            setCustomDateRange((prev) => ({ ...prev, [fromKey]: val }))
                          }
                        />
                        <DateInputFloatingLabel
                          label="Đến ngày (Trước)"
                          value={customToVal}
                          onChange={(val) =>
                            setCustomDateRange((prev) => ({ ...prev, [toKey]: val }))
                          }
                        />
                      </div>
                      {/* Actions */}
                      <div className="px-4 pb-4 flex justify-between items-center">
                        <Button
                          variant="ghost"
                          className={cn(
                            'font-medium px-2 min-w-max hover:bg-transparent text-[13px]',
                            customFromVal || customToVal ? 'text-red-500' : 'text-gray-400'
                          )}
                          onPress={() => {
                            // Clear custom inputs
                            setCustomDateRange((prev) => ({
                              ...prev,
                              [fromKey]: undefined,
                              [toKey]: undefined
                            }))
                            // Clear actual filter store
                            const newFilter = { ...filters }
                            newFilter.dateRange = {
                              ...newFilter.dateRange,
                              [fromKey]: '',
                              [toKey]: ''
                            }
                            setFilters(newFilter)
                          }}
                          isDisabled={!customFromVal && !customToVal}
                        >
                          Xóa
                        </Button>
                        <Button
                          variant="primary"
                          className="font-semibold px-5 text-[13px]"
                          isDisabled={!customFromVal && !customToVal}
                          onPress={() => {
                            const newFilter = { ...filters }
                            newFilter.dateRange = {
                              ...newFilter.dateRange,
                              [fromKey]: customFromVal,
                              [toKey]: customToVal
                            }
                            setFilters(newFilter)
                            setShowCustomDate(false)
                          }}
                        >
                          Áp dụng
                        </Button>
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
                            filterFromVal === preset.value.from &&
                            filterToVal === preset.value.to &&
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
                                setFilters({
                                  dateRange: {
                                    ...filters.dateRange,
                                    [fromKey]: preset.value.from,
                                    [toKey]: preset.value.to
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
                          Phạm vi ngày tùy chỉnh
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
                      <div style={{ overflow: 'hidden', width: 340 }}>
                        <div className="w-[340px] h-full flex flex-col bg-white dark:bg-gray-800">
                          <div className="flex-1 p-6 pb-2 flex flex-col gap-6 mt-2 overflow-y-auto custom-scrollbar">
                            <DateInputFloatingLabel
                              label="Từ ngày (Sau)"
                              value={customFromVal}
                              onChange={(val) =>
                                setCustomDateRange((prev) => ({ ...prev, [fromKey]: val }))
                              }
                            />
                            <DateInputFloatingLabel
                              label="Đến ngày (Trước)"
                              value={customToVal}
                              onChange={(val) =>
                                setCustomDateRange((prev) => ({ ...prev, [toKey]: val }))
                              }
                            />
                          </div>
                          <div className="p-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                            <Button
                              variant="ghost"
                              className={cn(
                                'font-medium px-2 min-w-max hover:bg-transparent tracking-wide text-[13px] transition-colors',
                                customFromVal || customToVal
                                  ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
                                  : 'text-gray-400 dark:text-gray-500'
                              )}
                              onPress={() => {
                                // Clear custom inputs
                                setCustomDateRange((prev) => ({
                                  ...prev,
                                  [fromKey]: undefined,
                                  [toKey]: undefined
                                }))
                                // Clear actual filter store
                                const newFilter = { ...filters }
                                newFilter.dateRange = {
                                  ...newFilter.dateRange,
                                  [fromKey]: '',
                                  [toKey]: ''
                                }
                                setFilters(newFilter)
                              }}
                              isDisabled={!customFromVal && !customToVal}
                            >
                              Xóa
                            </Button>
                            <div className="flex gap-2">
                              <Button
                                variant="tertiary"
                                className="bg-transparent text-blue-600 font-semibold px-4 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-[13px] min-w-0"
                                onPress={() => {
                                  setShowCustomDate(false)
                                  setCustomDateRange({
                                    ...customDateRange,
                                    [fromKey]: filters.dateRange?.[fromKey],
                                    [toKey]: filters.dateRange?.[toKey]
                                  })
                                }}
                              >
                                Huỷ
                              </Button>
                              <Button
                                variant="primary"
                                className="font-semibold px-4 text-[13px] min-w-0"
                                isDisabled={!customFromVal && !customToVal}
                                onPress={() => {
                                  const newFilter = { ...filters }
                                  newFilter.dateRange = {
                                    ...newFilter.dateRange,
                                    [fromKey]: customFromVal,
                                    [toKey]: customToVal
                                  }
                                  setFilters(newFilter)
                                }}
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
            )
          })()}

        {activeFilterTab === 'info' && (
          <div className="flex flex-col gap-4">
            <InputFloatingLabel
              label="Số đến"
              placeholder="Nhập số đến..."
              value={typingValueSVB}
              onChange={setTypingValueSVB}
            />
            <InputFloatingLabel
              label="Số hiệu văn bản"
              placeholder="Ví dụ: 123/QD-UBND..."
              value={typingValueSHVB}
              onChange={setTypingValueSHVB}
            />
            <InputFloatingLabel
              label="Trích yếu nội dung"
              placeholder="Nhập từ khóa trích yếu..."
              value={typingValueTrichYeu}
              onChange={setTypingValueTrichYeu}
            />
          </div>
        )}

        {activeFilterTab === 'category' && (
          <div className="flex flex-col gap-4">
            <SelectDropdown
              label="Loại văn bản"
              placeholder="Chọn loại văn bản"
              options={loaiOptions}
              value={filters.id_loai}
              onChange={(val) => setFilters({ id_loai: String(val) })}
            />
            <SelectDropdown
              label="Đơn vị nhận/xử lý"
              placeholder="Chọn đơn vị xử lý"
              options={donviOptions}
              value={filters.id_don_vi_xu_ly}
              onChange={(val) => setFilters({ id_don_vi_xu_ly: String(val) })}
            />
            {location.pathname.includes('vanbannoibo') && (
              <SelectDropdown
                label="Đơn vị soạn"
                placeholder="Chọn đơn vị soạn"
                options={donviOptions}
                value={filters.id_don_vi_soan}
                onChange={(val) => setFilters({ id_don_vi_soan: String(val) })}
              />
            )}
            <SelectDropdown
              label="Thứ tự sắp xếp"
              placeholder="Chọn thứ tự"
              options={[
                { value: 'newest', label: 'Mới nhất' },
                { value: 'oldest', label: 'Cũ nhất' }
              ]}
              value={filters.sortOrder}
              onChange={(val) => setFilters({ sortOrder: val as any })}
            />
          </div>
        )}
      </div>
    </div>
  )
}
