import { Button, Tabs, Tab } from '@heroui/react'
import { X, Info, Calendar, User, Mail, Hash, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import { mapVitriOptions } from '@renderer/api/danhmuc/VitriAxios'
import {
  DrawerCustom,
  DrawerHeaderCustom,
  DrawerContentCustom,
  DrawerFooterCustom
} from '@renderer/components/DrawerCustom'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'

interface HosonhansuFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filter: Record<string, any>
  onFilterChange: (filter: Record<string, any>) => void
  onApply: () => void
  onClear: () => void
  syncFilters: () => void
  trangThaiOptions: { label: string; value: string }[]
}

export default function HosonhansuFilterDrawer({
  isOpen,
  onClose,
  filter,
  onFilterChange,
  onApply,
  onClear,
  syncFilters,
  trangThaiOptions
}: HosonhansuFilterDrawerProps) {
  const [departments, setDepartments] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState<string | number>('general')
  const tabsRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  useEffect(() => {
    if (isOpen) {
      syncFilters()
    }
  }, [isOpen])

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 2)
    }
  }

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const { scrollLeft } = tabsRef.current
      const scrollTo = direction === 'left' ? scrollLeft - 100 : scrollLeft + 100
      tabsRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [isOpen, selectedTab])

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

  return (
    <DrawerCustom open={isOpen} position="right" width={400}>
      <DrawerHeaderCustom>
        <div className="flex items-center gap-1">
          <Button
            isIconOnly
            variant="light"
            radius="full"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            onPress={onClose}
          >
            <X size={20} />
          </Button>
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Bộ lọc hồ sơ
          </span>
        </div>
      </DrawerHeaderCustom>

      <DrawerContentCustom className="p-0 flex flex-col pt-0">
        {/* Tab Selection area matching DrawerDocument style but optimized */}
        <div className="relative w-full border-b border-gray-100 dark:border-gray-800 group">
          {showLeftArrow && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-6 min-w-6 bg-linear-to-r from-white/95 to-transparent dark:from-gray-900/95 text-gray-500"
              onPress={() => scrollTabs('left')}
            >
              <ChevronLeft size={14} />
            </Button>
          )}

          <div
            ref={tabsRef}
            onScroll={checkScroll}
            className="overflow-x-auto scrollbar-hide w-full px-3 grow scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={setSelectedTab}
              color="primary"
              variant="underlined"
              aria-label="Filter Tabs"
              classNames={{
                tabList: 'flex-nowrap h-auto w-max gap-6',
                tab: 'max-w-fit px-0 h-9',
                cursor: 'w-full'
              }}
            >
              <Tab
                key="general"
                title={
                  <div className="flex items-center gap-2">
                    <Info size={14} />
                    <span>Thông tin</span>
                  </div>
                }
              />
              <Tab
                key="time"
                title={
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Thời gian</span>
                  </div>
                }
              />
            </Tabs>
          </div>

          {showRightArrow && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-6 min-w-6 bg-linear-to-l from-white/95 to-transparent dark:from-gray-900/95 text-gray-500"
              onPress={() => scrollTabs('right')}
            >
              <ChevronRight size={14} />
            </Button>
          )}
        </div>

        {/* Content area */}
        <div className="px-3 py-6 overflow-y-auto custom-scrollbar flex-1">
          {selectedTab === 'general' ? (
            <div className="flex flex-col gap-6">
              <InputFloatingLabel
                label="Mã nhân viên"
                placeholder="Nhập mã nhân viên..."
                value={filter.ma_nhan_vien || ''}
                onChange={(val) => onFilterChange({ ...filter, ma_nhan_vien: val })}
                endContent={<Hash size={16} className="text-gray-400" />}
              />

              <InputFloatingLabel
                label="Họ và tên"
                placeholder="Nhập họ và tên..."
                value={filter.ho_ten || ''}
                onChange={(val) => onFilterChange({ ...filter, ho_ten: val })}
                endContent={<User size={16} className="text-gray-400" />}
              />

              <InputFloatingLabel
                label="Email"
                placeholder="Nhập email..."
                value={filter.email || ''}
                onChange={(val) => onFilterChange({ ...filter, email: val })}
                endContent={<Mail size={16} className="text-gray-400" />}
              />

              <InputFloatingLabel
                label="Mã số CCCD"
                placeholder="Nhập mã số CCCD..."
                value={filter.so_cccd || ''}
                onChange={(val) => onFilterChange({ ...filter, so_cccd: val })}
                endContent={<Hash size={16} className="text-gray-400" />}
              />

              <DateInputFloatingLabel
                label="Ngày sinh"
                value={filter.ngay_sinh || ''}
                onChange={(val) => onFilterChange({ ...filter, ngay_sinh: val })}
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

              <SelectDropdown
                label="Trạng thái"
                options={trangThaiOptions}
                value={filter.trang_thai || ''}
                onChange={(val) => onFilterChange({ ...filter, trang_thai: val })}
                placeholder="Tất cả trạng thái"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">
                  Ngày vào làm chính thức
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DateInputFloatingLabel
                    label="Từ ngày"
                    value={filter.dateRange?.fromDate || ''}
                    onChange={(val) =>
                      onFilterChange({ ...filter, dateRange: { ...filter.dateRange, fromDate: val } })
                    }
                  />
                  <DateInputFloatingLabel
                    label="Đến ngày"
                    value={filter.dateRange?.toDate || ''}
                    onChange={(val) =>
                      onFilterChange({ ...filter, dateRange: { ...filter.dateRange, toDate: val } })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </DrawerContentCustom>

      <DrawerFooterCustom>
        <Button variant="light" color="danger" onPress={onClear}>
          Thiết lập lại
        </Button>
        <Button
          color="primary"
          onPress={() => {
            onApply()
            onClose()
          }}
        >
          Lưu bộ lọc
        </Button>
      </DrawerFooterCustom>
    </DrawerCustom>
  )
}
