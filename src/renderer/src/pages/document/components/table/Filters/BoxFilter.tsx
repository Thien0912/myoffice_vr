import {
  Button,
  Select,
  ListBox,
  Popover,
  Badge
} from '@heroui-v3/react'
import { FolderOpen, Settings2 } from 'lucide-react'
import { useCurrentStore } from '@renderer/utils/useCurrentStore'
import { useQuery } from '@tanstack/react-query'
import { mapOptionsLoaiVanban } from '@renderer/api/danhmuc/loaiVanbanAxios'
import { mapDonviOptions } from '@renderer/api/danhmuc/DonviAxios'

type Props = {}

type SelectOption = {
  value: string
  label: string
}

type SelectOptionGroup = {
  label: string
  options: SelectOption[]
}

export default function BoxFilter({}: Props) {
  const { filters, setFilters } = useCurrentStore()

  const activeCount = [filters.year, filters.id_loai, filters.id_don_vi_xu_ly].filter(
    Boolean
  ).length

  // ✅ Loại văn bản
  const { data: loaiVanbanGroups = [], isLoading: isLoadingLoai } = useQuery({
    queryKey: ['loai-vanban'],
    queryFn: async (): Promise<SelectOptionGroup[]> => mapOptionsLoaiVanban(),
    staleTime: 5 * 60 * 1000 // cache 5 phút
  })

  const loaiVanbanOptions = loaiVanbanGroups.flatMap((group) => group.options)

  // ✅ Đơn vị nhận
  const { data: donViOptions = [], isLoading: isLoadingDonVi } = useQuery({
    queryKey: ['don-vi-full'],
    queryFn: async (): Promise<SelectOption[]> => mapDonviOptions(),
    staleTime: 5 * 60 * 1000
  })

  // 🔹 Năm
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2013 + 1 }, (_, i) => {
    const year = currentYear - i
    return { key: String(year), label: String(year) }
  })

  // Use filters.year if available, else default to current year.
  const defaultYearKey = filters.year ? String(filters.year) : String(currentYear)

  return (
    <Popover>
      <Popover.Trigger>
        <div className="inline-block cursor-pointer">
          <Badge.Anchor>
            <Button
              variant="outline"
              size="sm"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-10 min-w-10 px-3 font-medium text-gray-700 dark:text-gray-200"
            >
              <Settings2 size={18} className="text-gray-500 shrink-0" />
              <span className="hidden sm:inline">Bộ lọc nhanh</span>
            </Button>
            {activeCount > 0 && (
              <Badge color="accent" size="sm">
                {String(activeCount)}
              </Badge>
            )}
          </Badge.Anchor>
        </div>
      </Popover.Trigger>
      <Popover.Content placement="bottom end" className="p-4 w-80 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-none bg-white">
        <div className="flex flex-col gap-4 w-full">
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 pb-2 mb-1">
            Lọc nhanh văn bản
          </div>

          {/* Year select */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-gray-400 dark:text-gray-500">
              Năm
            </label>
            <Select
              className="w-full"
              value={defaultYearKey}
              aria-label="Year"
              onChange={(value) => {
                if (value) {
                  setFilters({ year: value as string })
                }
              }}
            >
              <Select.Trigger className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-none h-10 w-full rounded-lg px-3 flex items-center justify-between text-left">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FolderOpen className="text-amber-400 shrink-0" size={16} />
                  <Select.Value />
                </div>
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {years.map((y) => (
                    <ListBox.Item id={y.key} textValue={y.label} className="text-sm">
                      {y.label}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* Loại văn bản */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-gray-400 dark:text-gray-500">
              Loại văn bản
            </label>
            <Select
              aria-label="Loại văn bản"
              placeholder="Chọn loại văn bản"
              className="w-full"
              value={!isLoadingLoai ? (filters.id_loai ? filters.id_loai : null) : null}
              onChange={(value) =>
                setFilters({ id_loai: (value as string) || '' })
              }
            >
              <Select.Trigger className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-none h-10 w-full rounded-lg px-3 flex items-center justify-between text-left">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {loaiVanbanOptions.map((opt) => (
                    <ListBox.Item id={opt.value} textValue={opt.label}>
                      {opt.label}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* Đơn vị nhận */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-gray-400 dark:text-gray-500">
              Đơn vị nhận
            </label>
            <Select
              aria-label="Đơn vị nhận"
              placeholder="Chọn đơn vị nhận"
              className="w-full"
              value={!isLoadingDonVi ? (filters.id_don_vi_xu_ly ? filters.id_don_vi_xu_ly : null) : null}
              onChange={(value) =>
                setFilters({ id_don_vi_xu_ly: (value as string) || '' })
              }
            >
              <Select.Trigger className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-none h-10 w-full rounded-lg px-3 flex items-center justify-between text-left">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {donViOptions.map((opt) => (
                    <ListBox.Item id={opt.value} textValue={opt.label}>
                      {opt.label}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          <Button
            variant="ghost"
            className="mt-2 w-full font-medium text-danger hover:bg-danger-50"
            onPress={() =>
              setFilters({ year: String(currentYear), id_loai: '', id_don_vi_xu_ly: '' })
            }
          >
            Đặt lại
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  )
}
