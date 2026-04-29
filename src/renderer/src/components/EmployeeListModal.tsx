import DraggableModal from './DraggableModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { Input, cn } from '@heroui/react'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search } from 'lucide-react'
import { SelectDropdown } from './SelectDropdown'
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'

interface EmployeeListModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (employee: any) => void
  title?: string
}

export default function EmployeeListModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Tra cứu thông tin nhân sự'
}: EmployeeListModalProps) {
  const [searchValue, setSearchValue] = useState('')
  const [idDonvi, setIdDonvi] = useState<string>('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const STORAGE_KEY = 'table_employee_lookup_widths'

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {
      index: 40,
      ma_nhan_vien: 120,
      ho_va_ten: 250,
      ten_don_vi: 300
    }
  })

  // Lưu state khi có thay đổi
  const handleResize = useCallback((uid: string, width: number) => {
    setColumnWidths((prev) => {
      const next = { ...prev, [uid]: width }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // Reset page khi search hoặc đơn vị thay đổi
  useEffect(() => {
    setPage(1)
  }, [searchValue, idDonvi])

  const { data: donviOptions = [] } = useQuery({
    queryKey: ['donviOptions'],
    queryFn: mapDonviGroupedOptions,
    enabled: isOpen
  })

  const { data: response, isLoading } = useQuery({
    queryKey: ['employeeList', searchValue, page, limit, idDonvi],
    queryFn: async () => {
      const payload = {
        start: (page - 1) * limit,
        length: limit,
        search: { value: searchValue, regex: false },
        filter: { 
          id_don_vi: idDonvi || undefined
        }
      }
      const res = await NhansuAxios.fetch(payload)
      return res?.data
    },
    enabled: isOpen
  })

  const employees = response?.data || []
  const total = response?.recordsTotal || 0
  const filtered = response?.recordsFiltered || 0

  const columns = useMemo(() => [
    {
      uid: 'index',
      name: 'STT',
      sortable: false,
      disablePinning: true,
      width: columnWidths.index,
      render: (_: any, __: any, index?: number) => (
        <div className="flex justify-center w-full">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {(page - 1) * limit + (index ?? 0) + 1}
          </span>
        </div>
      )
    },
    { uid: 'ma_nhan_vien', name: 'Mã', width: columnWidths.ma_nhan_vien, sort: true },
    { uid: 'ho_va_ten', name: 'Họ và tên', width: columnWidths.ho_va_ten, sort: true },
    { uid: 'ten_don_vi', name: 'Đơn vị', width: columnWidths.ten_don_vi, sort: true }
  ], [page, limit, columnWidths])

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="max-w-4xl"
    >
      <div className="flex flex-col h-[650px]">
        {/* Toolbar */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <Input
            placeholder="Tìm theo mã, họ tên, đơn vị..."
            value={searchValue}
            onValueChange={setSearchValue}
            startContent={<Search className="text-gray-400" size={20} />}
            radius="sm"
              classNames={{
                base: 'max-w-full',
                inputWrapper: cn(
                  'bg-white border border-gray-200 shadow-none hover:bg-gray-50 hover:border-gray-300 h-10 transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 group-data-[focus=true]:border-blue-500 dark:group-data-[focus=true]:border-blue-400',
                  searchValue && 'bg-blue-50/50 border-blue-400 dark:bg-blue-900/10 dark:border-blue-500'
                ),
                input: 'text-sm'
              }}
            /> 
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-2">
          <TableHr
            columns={columns}
            data={employees}
            isLoading={isLoading}
            primaryKey="id_nhan_vien"
            onRowClick={(row) => onSelect?.(row)}
            enableStickyScrollbar={false}
            enableResizing={true}
            columnWidths={columnWidths}
            onColumnResize={handleResize}
            enableCopy={true}
            borderColor="border-gray-200 dark:border-gray-700"
          />
        </div>

        {/* Pagination */}
        <TablePagination
          page={page}
          total={total}
          filtered={filtered}
          limit={limit}
          onChangePage={setPage}
          onChangeLimit={(val) => {
            setLimit(val)
            setPage(1)
          }}
          className="px-4 py-2 border-t border-gray-100 dark:border-gray-700"
        />
      </div>
    </DraggableModal>
  )
}
