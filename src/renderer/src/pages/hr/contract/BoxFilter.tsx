import { Select, SelectItem } from '@heroui/react'
import { FolderOpen } from 'lucide-react'
import { useCurrentStore } from '@renderer/utils/useCurrentStore'
import { useQuery } from '@tanstack/react-query'
import { LOAI_HOP_DONG } from '@renderer/api/danhmuc/hopDong'

type Props = {}

export default function BoxFilter({ }: Props) {
  const { filters, setFilters } = useCurrentStore()

  // Loại hợp đồng
  const { data: loaiHopdongOptions = [], isLoading: isLoadingLoai } = useQuery({
    queryKey: ['loai-hopdong'],
    queryFn: () => Object.values(LOAI_HOP_DONG),
    staleTime: 5 * 60 * 1000 // cache 5 phút
  })

  // 🔹 Năm
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2013 + 1 }, (_, i) => {
    const year = currentYear - i
    const from = `${year}-01-01`
    const to = `${year}-12-31`
    return { key: JSON.stringify([from, to]), label: String(year) }
  })

  const defaultKey = JSON.stringify([`${currentYear}-01-01`, `${currentYear}-12-31`])

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Year select */}
      <Select
        className="md:w-32"
        defaultSelectedKeys={[defaultKey]}
        size="sm"
        aria-label="Year"
        startContent={<FolderOpen color="#fbbf24" />}
        style={{ border: 'none' }}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0] as string
          const [fromDate, toDate] = JSON.parse(value)
          setFilters({ dateRange: { fromDate, toDate } })
        }}
      >
        {years.map((y) => (
          <SelectItem key={y.key} className="text-sm">
            {y.label}
          </SelectItem>
        ))}
      </Select>

      {/* hợp đồng */}
      <Select
        placeholder="Loại hợp đồng"
        labelPlacement="outside-left"
        label="Loại hợp đồng"
        size="sm"
        className="md:w-80"
        selectedKeys={!isLoadingLoai ? (filters.loai_hop_dong ? [filters.loai_hop_dong] : []) : []}
        onSelectionChange={(keys) =>
          setFilters({ loai_hop_dong: Array.from(keys as Set<string>)[0] })
        }
      >
        {loaiHopdongOptions.map((opt) => (
          <SelectItem key={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>

      {/* Trạng thái */}
      <Select
        placeholder="Trạng thái"
        labelPlacement="outside-left"
        label="Trạng thái"
        size="sm"
        className="md:w-60"
        selectedKeys={filters.selectedClassify ? [filters.selectedClassify] : ['all']}
        onSelectionChange={(keys) =>
          setFilters({ selectedClassify: Array.from(keys as Set<string>)[0] })
        }
      >
        <SelectItem key="all">Tất cả</SelectItem>
        <SelectItem key="dang_hieu_luc">Đang hiệu lực</SelectItem>
        <SelectItem key="het_hieu_luc">Hết hiệu lực</SelectItem>
        <SelectItem key="da_xoa">Đã xóa</SelectItem>
      </Select>
    </div>
  )
}
