import { useState, useEffect } from 'react'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  DateInput,
  Select,
  SelectItem,
  Input
} from '@heroui/react'
import { Filter } from 'lucide-react'
import { callApi } from '@renderer/api/callApi'
import { useNhansuStore } from '@renderer/store/useNhansuStore'

interface DonVi {
  id_don_vi: string
  ten_don_vi: string
}

interface ViTriCongViec {
  id_vi_tri_cong_viec: string
  ten_vi_tri_cong_viec: string
}

export function NhansuFilter(): React.JSX.Element {
  const [donVi, setDonVi] = useState<DonVi[]>([])
  const [viTriCongViec, setViTriCongViec] = useState<ViTriCongViec[]>([])
  const [typingValueMaNV, setTypingValueMaNV] = useState('')
  const [typingValueHoTen, setTypingValueHoTen] = useState('')
  const [typingValueEmail, setTypingValueEmail] = useState('')

  const { filters, setFilters } = useNhansuStore()

  // Fetch departments
  const getDonVi = async () => {
    try {
      const res = await callApi('admin/danhmuc/donvi', {
        method: 'GET',
        data: {},
        headers: {},
        timeout: 30000,
        throwException: false,
        debug: false
      })
      setDonVi(res.data ?? [])
    } catch (error) {
      console.error('Error fetching don vi:', error)
      setDonVi([])
    }
  }

  // Fetch job positions (if available)
  const getViTriCongViec = async () => {
    try {
      const res = await callApi('admin/danhmuc/vitricongviec', {
        method: 'GET',
        data: {},
        headers: {},
        timeout: 30000,
        throwException: false,
        debug: false
      })
      setViTriCongViec(res.data ?? [])
    } catch (error) {
      console.error('Error fetching vi tri cong viec:', error)
      setViTriCongViec([])
    }
  }

  useEffect(() => {
    getDonVi()
    getViTriCongViec()
  }, [])

  // Debounced filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({
        ma_nhan_vien: typingValueMaNV,
        ho_ten: typingValueHoTen,
        email: typingValueEmail
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [typingValueMaNV, typingValueHoTen, typingValueEmail, setFilters])

  // Check if any filter is active
  const hasActiveFilters = !!(
    filters.ma_nhan_vien ||
    filters.ho_ten ||
    filters.email ||
    filters.id_don_vi ||
    filters.id_vi_tri_cong_viec ||
    filters.trang_thai ||
    (filters.dateRange?.fromDate &&
      filters.dateRange?.fromDate !== `${new Date().getFullYear()}-01-01`) ||
    (filters.dateRange?.toDate && filters.dateRange?.toDate !== `${new Date().getFullYear()}-12-31`)
  )

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          size="md"
          className="sm:w-auto relative"
          variant="light"
          isIconOnly
          startContent={<Filter size={18} />}
        >
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-1 ring-white" />
          )}
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        className="min-w-full md:min-w-[50vw] max-w-[90vw]"
        itemClasses={{
          base: 'hover:bg-transparent data-[hover=true]:bg-transparent mb-2 last:mb-0'
        }}
      >
        <DropdownItem key="filter1" isReadOnly>
          <div className="grid md:grid-cols-2 gap-4 p-2">
            {/* Left Column - Basic Info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Thông tin cơ bản</h4>

              <Input
                label="Mã nhân viên"
                placeholder="Nhập mã nhân viên..."
                labelPlacement="outside"
                size="sm"
                classNames={{ base: 'w-full', inputWrapper: 'w-full' }}
                value={typingValueMaNV}
                onChange={(e) => setTypingValueMaNV(e.target.value)}
              />

              <Input
                label="Họ và tên"
                placeholder="Nhập họ và tên..."
                labelPlacement="outside"
                size="sm"
                classNames={{ base: 'w-full', inputWrapper: 'w-full' }}
                value={typingValueHoTen}
                onChange={(e) => setTypingValueHoTen(e.target.value)}
              />

              <Input
                label="Email"
                placeholder="Nhập email..."
                labelPlacement="outside"
                size="sm"
                classNames={{ base: 'w-full', inputWrapper: 'w-full' }}
                value={typingValueEmail}
                onChange={(e) => setTypingValueEmail(e.target.value)}
              />

              <Select
                placeholder="Chọn trạng thái"
                labelPlacement="outside"
                label="Trạng thái"
                size="sm"
                classNames={{ base: 'w-full', trigger: 'w-full' }}
                selectedKeys={filters.trang_thai ? [filters.trang_thai] : []}
                onSelectionChange={(keys) =>
                  setFilters({ trang_thai: Array.from(keys as Set<string>)[0] || '' })
                }
              >
                <SelectItem key="DANG_LAM_VIEC">Đang làm việc</SelectItem>
                <SelectItem key="NGHI_PHEP">Nghỉ phép</SelectItem>
                <SelectItem key="NGHI_VIEC">Nghỉ việc</SelectItem>
              </Select>
            </div>

            {/* Right Column - Advanced Filters */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Bộ lọc nâng cao</h4>

              <Select
                placeholder="Chọn đơn vị"
                labelPlacement="outside"
                label="Đơn vị"
                size="sm"
                classNames={{ base: 'w-full', trigger: 'w-full' }}
                selectedKeys={filters.id_don_vi ? [filters.id_don_vi] : []}
                onSelectionChange={(keys) =>
                  setFilters({ id_don_vi: Array.from(keys as Set<string>)[0] || '' })
                }
              >
                {donVi.map((dv) => (
                  <SelectItem key={dv.id_don_vi}>{dv.ten_don_vi}</SelectItem>
                ))}
              </Select>

              <Select
                placeholder="Chọn vị trí công việc"
                labelPlacement="outside"
                label="Vị trí công việc"
                size="sm"
                classNames={{ base: 'w-full', trigger: 'w-full' }}
                selectedKeys={filters.id_vi_tri_cong_viec ? [filters.id_vi_tri_cong_viec] : []}
                onSelectionChange={(keys) =>
                  setFilters({ id_vi_tri_cong_viec: Array.from(keys as Set<string>)[0] || '' })
                }
              >
                {viTriCongViec.map((vt) => (
                  <SelectItem key={vt.id_vi_tri_cong_viec}>{vt.ten_vi_tri_cong_viec}</SelectItem>
                ))}
              </Select>

              <div className="grid grid-cols-2 gap-2">
                <DateInput
                  label="Ngày làm chính thức từ"
                  labelPlacement="outside"
                  size="sm"
                  onChange={(val) =>
                    setFilters({
                      dateRange: { ...filters.dateRange, fromDate: val?.toString() ?? '' }
                    })
                  }
                />

                <DateInput
                  label="Ngày làm chính thức đến"
                  labelPlacement="outside"
                  size="sm"
                  onChange={(val) =>
                    setFilters({
                      dateRange: { ...filters.dateRange, toDate: val?.toString() ?? '' }
                    })
                  }
                />
              </div>

              {/* Reset Filters Button */}
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  className="w-full"
                  onPress={() => {
                    // Reset all typing values
                    setTypingValueMaNV('')
                    setTypingValueHoTen('')
                    setTypingValueEmail('')

                    // Reset filters in store
                    const currentYear = new Date().getFullYear()
                    setFilters({
                      ma_nhan_vien: '',
                      ho_ten: '',
                      email: '',
                      id_don_vi: '',
                      id_vi_tri_cong_viec: '',
                      trang_thai: '',
                      dateRange: {
                        fromDate: `${currentYear}-01-01`,
                        toDate: `${currentYear}-12-31`
                      }
                    })
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
