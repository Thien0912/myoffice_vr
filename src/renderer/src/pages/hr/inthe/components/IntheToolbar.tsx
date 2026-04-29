import { useEffect, useState } from 'react'
import { Printer, RotateCcw } from 'lucide-react'
import { Button, Tooltip, Spinner } from '@heroui/react'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { motion, AnimatePresence } from 'framer-motion'
import SearchInput from '@renderer/components/SearchInput'

interface IntheToolbarProps {
  searchValue: string
  setSearchValue: (val: string) => void
  idDonvi: string
  setIdDonvi: (val: string) => void
  donviOptions: any[]
  isLoading: boolean
  hasSelection: boolean
  selectedCount: number
  onClearFilters: () => void
  setPage: (page: number) => void
}

export default function IntheToolbar({
  searchValue,
  setSearchValue,
  idDonvi,
  setIdDonvi,
  donviOptions,
  isLoading,
  hasSelection,
  selectedCount,
  onClearFilters,
  setPage
}: IntheToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)

  // Sync external clear
  useEffect(() => {
    setLocalSearch(searchValue)
  }, [searchValue])

  // Debounce external update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        setSearchValue(localSearch)
        setPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localSearch, searchValue, setSearchValue, setPage])

  return (
    <div className="flex flex-col gap-4 rounded-sm px-6">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-2 w-full">
          <div className="flex-1 md:max-w-[320px] lg:max-w-[400px] flex items-center gap-2 min-w-0">
            <SearchInput
              className="flex-1 w-full"
              placeholder="Tìm tự do tên, email, sdt, căn cước..."
              value={localSearch}
              onChange={setLocalSearch}
            />
            {isLoading && <Spinner size="sm" />}
          </div>
          <div className="w-full sm:w-[280px]">
            <SelectDropdown
              label=""
              placeholder="Tất cả đơn vị"
              value={idDonvi}
              onChange={(val) => {
                setIdDonvi(val as string)
                setPage(1)
              }}
              options={donviOptions}
            />
          </div>
          {(searchValue || idDonvi) && (
            <Tooltip content="Xóa bộ lọc" closeDelay={0}>
              <Button
                isIconOnly
                variant="flat"
                color="danger"
                size="sm"
                radius="sm"
                onPress={onClearFilters}
                className="bg-red-50 text-red-500 dark:bg-red-900/20 hover:scale-105 active:scale-95 transition-transform h-10 w-10 shrink-0"
              >
                <RotateCcw size={16} />
              </Button>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
        <AnimatePresence mode="wait">
          {hasSelection ? (
            <motion.div
              key="bulk-actions"
              initial={{ opacity: 0, scale: 0.98, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98, x: 10 }}
              className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-900/10 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30"
            >
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-blue-500 font-bold">
                  Đã chọn
                </span>
                <span className="text-sm font-black text-blue-700 dark:text-blue-300 leading-none">
                  {selectedCount} nhân sự
                </span>
              </div>
              <div className="h-8 w-px bg-blue-200 dark:bg-blue-800 mx-1" />
              <Button
                color="primary"
                size="md"
                radius="sm"
                startContent={<Printer size={18} />}
                className="font-bold h-10 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
              >
                BẮT ĐẦU IN
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="standard-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              {/* <Button
                variant="flat"
                color="default"
                size="md"
                radius="sm"
                startContent={<History size={18} />}
                className="h-10 px-4 font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-none transition-all"
              >
                LỊCH SỬ IN THẺ
              </Button> */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  )
}
