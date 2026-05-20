import { Button, Chip, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import DebugBox from '@renderer/components/DebugBox'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { History, Plus, Search } from 'lucide-react'
import CategoryHistoryDrawer from './components/CategoryHistoryDrawer'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { CategoryModal } from './components/CategoryModal'
import { toast } from "@heroui-v3/react";
import { KhoaAxios } from './mockApi'
import FormKhoa from './components/FormKhoa'

interface DonViDemoPageProps {
  title: string
  apiService: {
    fetch: (payload: object) => Promise<any>
    show: (id: number | string) => Promise<any>
    create: (data: object) => Promise<any>
    update: (id: number | string, data: object) => Promise<any>
    delete: (id: number | string) => Promise<any>
  }
  columns?: TableColumnType[]
  formComponent: React.FC<any>
  primaryKey: string
  tenField: string
  // Props cho chế độ xem Khoa của Trường
  idTruong?: string | number
  tenTruong?: string
  // Props cho chế độ lọc Khoa không có trường
  filterNoTruong?: boolean
}

export default function DonViDemoPage({
  title,
  apiService,
  columns: customColumns,
  formComponent: FormComponent,
  primaryKey,
  tenField,
  idTruong,
  tenTruong,
  filterNoTruong
}: DonViDemoPageProps) {
  const { user } = useAuthStore()
  const permissions = user?.permissions || []
  const isAdmin = permissions.includes('IS_ADMIN')
  const queryClient = useQueryClient()

  const invalidateSidebarCounts = () => {
    queryClient.invalidateQueries({ queryKey: ['count'] })
    queryClient.invalidateQueries({ queryKey: ['khoa', 'all'] })
  }

  // Mỗi bảng có state filters riêng, không dùng chung
  const [page, setPage] = useState(1)
  const [length, setLength] = useState(10)
  const [searchValue, setSearchValue] = useState('')

  // Chế độ xem Khoa của một Trường cụ thể (có idTruong)
  const isKhoaOfTruongMode = !!idTruong
  // Chế độ xem Khoa (bất kỳ trường hợp nào: xem tất cả khoa hoặc khoa của trường)
  const isKhoaMode = isKhoaOfTruongMode || title === 'Khoa'

  // Reset page về 1 khi chuyển sang bảng khác (title thay đổi)
  useEffect(() => {
    setPage(1)
    setSearchValue('')
    setTypingValue('')
    setSelectedKeys(new Set())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])
  const [sortDescriptors, setSortDescriptors] = useState<{ column: string; direction: 'ascending' | 'descending' }[]>([])
  const [recordsTotal, setRecordsTotal] = useState(0)
  const [recordsFiltered, setRecordsFiltered] = useState(0)
  const [typingValue, setTypingValue] = useState('')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const [pinnedColumns, setPinnedColumns] = useState<Record<string, 'left' | 'right'>>({ stt: 'left' })

  // Confirm Modal State
  const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

  // Drawer states
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const { isOpen: isOpenDrawerAdd, onClose: onCloseDrawerAdd, onOpen: onOpenDrawerAdd } = useDisclosure()
  const { isOpen: isOpenDrawerEdit, onClose: onCloseDrawerEdit, onOpen: onOpenDrawerEdit } = useDisclosure()

  // Inline Edit State
  const [editingCell, setEditingCell] = useState<{
    id: string | number
    column: string
    value: string
  } | null>(null)
  const [pendingEdit, setPendingEdit] = useState<{
    id: string | number
    column: string
    value: string
  } | null>(null)
  const { isOpen: isOpenConfirmEdit, onOpen: onOpenConfirmEdit, onClose: onCloseConfirmEdit } = useDisclosure()

  const [lichSuOpen, setLichSuOpen] = useState(false)

  // Query danh sách chính
  const { data: responseData, isLoading, refetch, isFetching } = useQuery({
    queryKey: [title, page, length, searchValue, sortDescriptors, filterNoTruong],
    queryFn: async () => {
      // Nếu filterNoTruong = true, fetch tất cả để lọc
      const fetchLength = filterNoTruong ? 10000 : length
      const payload = {
        searchValue: searchValue,
        start: filterNoTruong ? 0 : (page - 1) * length,
        length: fetchLength,
        order: sortDescriptors.map((desc) => ({
          column: desc.column,
          dir: desc.direction === 'ascending' ? 'asc' : 'desc'
        }))
      }
      const response = await apiService.fetch(payload)
      
      // Nếu filterNoTruong = true, lọc các khoa không có trường
      if (filterNoTruong && response?.data) {
        const filteredData = response.data.filter((item: any) => !item.id_truong)
        // Phân trang thủ công
        const start = (page - 1) * length
        const paginatedData = filteredData.slice(start, start + length)
        return {
          ...response,
          data: paginatedData,
          recordsTotal: filteredData.length,
          recordsFiltered: filteredData.length
        }
      }
      
      return response
    }
  })

  // Query khoa theo trường (khi đang xem khoa của 1 trường)
  const { data: khoaByTruongData, isLoading: isLoadingKhoa, refetch: refetchKhoa } = useQuery({
    queryKey: ['khoa-by-truong', idTruong, page, length, searchValue],
    queryFn: async () => {
      if (!idTruong) return null
      const response = await KhoaAxios.getByTruong(idTruong)
      // Phân trang thủ công + loại bỏ duplicate
      const allData = response.data || []
      // Loại bỏ duplicate dựa trên id_khoa
      const seen = new Set()
      const uniqueData = allData.filter((item: any) => {
        const id = String(item.id_khoa)
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      const filteredData = searchValue 
        ? uniqueData.filter((item: any) => item.ten_khoa?.toLowerCase().includes(searchValue.toLowerCase()))
        : uniqueData
      const start = (page - 1) * length
      const paginatedData = filteredData.slice(start, start + length)
      return {
        data: paginatedData,
        recordsTotal: uniqueData.length,
        recordsFiltered: filteredData.length
      }
    },
    enabled: isKhoaMode // Chỉ chạy khi ở chế độ xem khoa
  })

  // Cập nhật records từ đúng data source
  useEffect(() => {
    if (isKhoaMode && khoaByTruongData) {
      // Đang xem khoa của trường
      setRecordsTotal(khoaByTruongData.recordsTotal || 0)
      setRecordsFiltered(khoaByTruongData.recordsFiltered || 0)
    } else if (responseData?.data) {
      // Đang xem danh sách chính
      setRecordsTotal(responseData.recordsTotal || 0)
      setRecordsFiltered(responseData.recordsFiltered || 0)
    }
  }, [responseData, khoaByTruongData, isKhoaMode])

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchValue(typingValue)
      setPage(1) // Reset về trang 1 khi search
    }, 500)
    return () => clearTimeout(timer)
  }, [typingValue])

  const handleResetTable = () => {
    setTypingValue('')
    setSelectedKeys(new Set())
    setPage(1)
    setLength(10)
    setSearchValue('')
  }

  const currentPrimaryKey = isKhoaMode ? 'id_khoa' : primaryKey
  const currentData = isKhoaOfTruongMode ? khoaByTruongData?.data : responseData?.data
  const currentApiService = isKhoaMode ? KhoaAxios : apiService

  const selectedRows = useMemo(() => {
    if (!currentData) return []
    return currentData.filter((row: any) => selectedKeys.has(String(row[currentPrimaryKey])))
  }, [currentData, selectedKeys, currentPrimaryKey])

  const selectedCount = selectedKeys.size
  const canCopy = selectedCount > 0
  const canEdit = selectedCount === 1
  const canDelete = selectedCount > 0
  const canCreate = true

  const handleCopyRows = async () => {
    if (selectedRows.length === 0) return
    try {
      const promises = selectedRows.map((row: any) => {
        const payload: any = {}
        
        // Khi đang xem khoa (cứa trường hoặc tất cả)
        if (isKhoaMode) {
          payload.ten_khoa = row.ten_khoa + ' (Copy)'
          // Nếu đang xem khoa của 1 trường cụ thể, dùng idTruong
          // Nếu đang xem danh sách khoa (title === 'Khoa'), giữ nguyên id_truong của row (có thể null)
          payload.id_truong = isKhoaOfTruongMode ? idTruong : row.id_truong
          return KhoaAxios.create(payload)
        }
        
        if (title === 'Phòng ban') {
          payload.ten_phong_ban = row.ten_phong_ban + ' (Copy)'
          payload.ten_viet_tat = row.ten_viet_tat
          payload.ten_tieng_anh = row.ten_tieng_anh
          payload.ma_don_vi = row.ma_don_vi
          payload.email = row.email
        } else if (title === 'Trung tâm') {
          payload.ten_trung_tam = row.ten_trung_tam + ' (Copy)'
          payload.ten_viet_tat = row.ten_viet_tat
          payload.ten_tieng_anh = row.ten_tieng_anh
          payload.email = row.email
        }
        
        return apiService.create(payload)
      })
      const results = await Promise.all(promises)
      const allSuccess = results.every((r: any) => r.success)
      if (allSuccess) {
        toast(`Sao chép thành công ${selectedRows.length} bản ghi`, { variant: 'success' })
        setSelectedKeys(new Set())
        if (isKhoaOfTruongMode) {
          refetchKhoa()
        } else {
          refetch()
        }
        invalidateSidebarCounts()
      } else {
        toast('Một số bản ghi sao chép thất bại', { variant: 'danger' })
      }
    } catch (error) {
      toast('Có lỗi xảy ra khi sao chép', { variant: 'danger' })
    }
  }

  const handleOpenEdit = async () => {
    if (selectedRows.length !== 1) return
    const row = selectedRows[0]
    setEditingId(row[currentPrimaryKey])
    try {
      const detail = await currentApiService.show(row[currentPrimaryKey])
      if (detail.success && detail.data) {
        setFormData({ ...detail.data })
      } else {
        setFormData({ ...row })
      }
    } catch {
      setFormData({ ...row })
    }
    onOpenDrawerEdit()
  }

  const handleDelete = () => {
    if (selectedCount === 0) return
    const ids = Array.from(selectedKeys).map((id) => Number(id))
    setDeletingId(ids.length === 1 ? ids[0] : ids)
    onOpenConfirm()
  }

  const onConfirmDelete = async () => {
    if (!deletingId) return
    try {
      const ids = Array.isArray(deletingId) ? deletingId : [deletingId]
      const results = await Promise.all(ids.map((id) => currentApiService.delete(String(id))))
      const failed = results.filter((r: any) => !r.success)
      if (failed.length === 0) {
        toast(`Xóa thành công ${ids.length} bản ghi`, { variant: 'success' })
        setSelectedKeys(new Set())
        if (isKhoaOfTruongMode) {
          refetchKhoa()
        } else {
          refetch()
        }
        invalidateSidebarCounts()
      } else {
        const firstError = failed[0]?.message || 'Không xác định'
        toast(`Xóa thất bại: ${firstError}`, { variant: 'danger' })
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Lỗi không xác định'
      toast(`Xóa thất bại: ${msg}`, { variant: 'danger' })
    } finally {
      onCloseConfirm()
      setDeletingId(null)
    }
  }

  const handleFinishEdit = () => {
    if (!editingCell) return
    const currentRow = currentData?.find((r: any) => r[currentPrimaryKey] === editingCell.id)
    if (!currentRow) return
    const originalValue = currentRow[editingCell.column]
    if (editingCell.value !== originalValue) {
      setPendingEdit(editingCell)
      onOpenConfirmEdit()
    } else {
      setEditingCell(null)
    }
  }

  const handleSaveEdit = async () => {
    if (!pendingEdit) return
    try {
      const payload = {
        inline_edit: true,
        column: pendingEdit.column,
        value: pendingEdit.value
      }
      const response = await currentApiService.update(pendingEdit.id, payload)
      if (response.success) {
        toast('Cập nhật thành công', { variant: 'success' })
        if (isKhoaOfTruongMode) {
          refetchKhoa()
        } else {
          refetch()
        }
      } else {
        toast(response.message || 'Cập nhật thất bại', { variant: 'danger' })
      }
    } catch (error) {
      toast('Có lỗi xảy ra', { variant: 'danger' })
    } finally {
      onCloseConfirmEdit()
      setPendingEdit(null)
      setEditingCell(null)
    }
  }

  // Hàm render cell với inline editing - sử dụng ref để tránh recreate columns
  const renderEditableCell = (value: string, row: any, column: string) => {
    const isEditing = editingCell?.id === row[currentPrimaryKey] && editingCell?.column === column
    if (isEditing) {
      return (
        <Input
          autoFocus
          size="sm"
          variant="bordered"
          value={editingCell.value}
          onValueChange={(val) => setEditingCell((prev) => (prev ? { ...prev, value: val } : null))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleFinishEdit()
            if (e.key === 'Escape') setEditingCell(null)
          }}
          onBlur={handleFinishEdit}
          classNames={{ input: 'text-sm' }}
        />
      )
    }
    return (
      <div
        className={`cursor-pointer hover:text-blue-600 transition-colors ${!value ? 'text-gray-400 italic' : ''}`}
        onDoubleClick={() => setEditingCell({ id: row[currentPrimaryKey], column, value: value || '' })}
        title="Double click để sửa"
      >
        {value || '--'}
      </div>
    )
  }

  // Định nghĩa columns theo loại đơn vị - chỉ phụ thuộc vào title để đảm bảo thứ tự không đổi
  const allColumns = useMemo((): TableColumnType[] => {
    // PHÒNG BAN: id, ten_phong_ban, ten_viet_tat, ten_tieng_anh, ma_don_vi, email, created_at, deleted_at
    if (title === 'Phòng ban') {
      return [
        {
          uid: 'stt',
          name: '#',
          sortable: false,
          width: 50,
          className: 'text-center w-10 p-0 font-bold',
          pinned: 'left'
        },
        {
          uid: 'ten_phong_ban',
          name: 'Tên phòng ban',
          sortable: true,
          width: 300,
          render: (_, row: any) => (
            <div className="font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
              {renderEditableCell(row.ten_phong_ban, row, 'ten_phong_ban')}
            </div>
          )
        },
        {
          uid: 'ten_viet_tat',
          name: 'Tên viết tắt',
          sortable: true,
          width: 150,
          render: (_, row: any) => (
            <div className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
              {renderEditableCell(row.ten_viet_tat, row, 'ten_viet_tat')}
            </div>
          )
        },
        {
          uid: 'ten_tieng_anh',
          name: 'Tên tiếng Anh',
          sortable: true,
          width: 220,
          render: (_, row: any) => (
            <div className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
              {renderEditableCell(row.ten_tieng_anh, row, 'ten_tieng_anh')}
            </div>
          )
        },
        {
          uid: 'ma_don_vi',
          name: 'Mã đơn vị',
          sortable: true,
          width: 120,
          render: (_, row: any) => (
            <div className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
              {renderEditableCell(row.ma_don_vi, row, 'ma_don_vi')}
            </div>
          )
        },
        {
          uid: 'email',
          name: 'Email',
          sortable: true,
          width: 250,
          render: (_, row: any) => (
            <div className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
              {renderEditableCell(row.email, row, 'email')}
            </div>
          )
        }
      ]
    }
    // TRUNG TÂM: id, ten_trung_tam, ten_viet_tat, ten_tieng_anh, email, created_at, deleted_at
    else if (title === 'Trung tâm') {
      return [
        {
          uid: 'stt',
          name: '#',
          sortable: false,
          width: 50,
          className: 'text-center w-10 p-0 font-bold',
          pinned: 'left'
        },
        {
          uid: 'ten_trung_tam',
          name: 'Tên trung tâm',
          sortable: true,
          width: 320,
          render: (_, row: any) => (
            <div className="font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
              {renderEditableCell(row.ten_trung_tam, row, 'ten_trung_tam')}
            </div>
          )
        },
        {
          uid: 'ten_viet_tat',
          name: 'Tên viết tắt',
          sortable: true,
          width: 150,
          render: (_, row: any) => (
            <div className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
              {renderEditableCell(row.ten_viet_tat, row, 'ten_viet_tat')}
            </div>
          )
        },
        {
          uid: 'ten_tieng_anh',
          name: 'Tên tiếng Anh',
          sortable: true,
          width: 240,
          render: (_, row: any) => (
            <div className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
              {renderEditableCell(row.ten_tieng_anh, row, 'ten_tieng_anh')}
            </div>
          )
        },
        {
          uid: 'email',
          name: 'Email',
          sortable: true,
          width: 280,
          render: (_, row: any) => (
            <div className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
              {renderEditableCell(row.email, row, 'email')}
            </div>
          )
        }
      ]
    }
    // KHOA: id_khoa, id_truong, ten_khoa, created_at, deleted_at
    else if (isKhoaMode || title.startsWith('Khoa -') || title === 'Khoa') {
      return [
        {
          uid: 'stt',
          name: '#',
          sortable: false,
          width: 50,
          className: 'text-center w-10 p-0 font-bold',
          pinned: 'left'
        },
        {
          uid: 'ten_khoa',
          name: 'Tên khoa',
          sortable: true,
          width: 500,
          render: (_, row: any) => (
            <div className="font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
              {renderEditableCell(row.ten_khoa, row, 'ten_khoa')}
            </div>
          )
        }
      ]
    }

    return []
  // Phụ thuộc vào title và editingCell để inline editing hoạt động đúng
  }, [title, editingCell, currentPrimaryKey])

  const columnsWithSettings = useMemo(() => {
    return allColumns.map((col) => ({
      ...col,
      width: columnWidths[col.uid] || col.width,
      pinned: pinnedColumns[col.uid] || col.pinned
    }))
  }, [allColumns, columnWidths, pinnedColumns])

  const visibleColumns = useMemo(() => {
    return columnsWithSettings
  }, [columnsWithSettings])

  // Lấy data từ đúng source
  const rows = useMemo(() => {
    if (isKhoaOfTruongMode && khoaByTruongData) {
      return khoaByTruongData.data || []
    }
    return responseData?.data || []
  }, [responseData, khoaByTruongData, isKhoaOfTruongMode])

  // Loading state
  const isTableLoading = isKhoaOfTruongMode ? isLoadingKhoa : isLoading

  return (
    <div className="flex flex-col w-full h-full overflow-hidden relative bg-white">
      <DebugBox />
      
      <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <Input
            type="search"
            placeholder={isKhoaMode && tenTruong
              ? `Tìm kiếm khoa của ${tenTruong}...`
              : `Tìm kiếm ${title.toLowerCase()}...`
            }
            startContent={<Search className="text-gray-500" size={18} />}
            value={typingValue}
            onValueChange={setTypingValue}
            className="w-full md:max-w-[300px]"
            classNames={{ inputWrapper: 'h-8 bg-white border border-gray-200 rounded-lg' }}
            endContent={isFetching && <Spinner size="sm" />}
          />
        </div>

        <div className="flex items-center gap-1.5">
          {canCopy && (
            <Button variant="light" size="sm" className="text-gray-600 font-medium" onPress={handleCopyRows}>
              Sao chép
            </Button>
          )}
          {canEdit && (
            <Button variant="light" size="sm" className="text-gray-600 font-medium" onPress={handleOpenEdit}>
              Sửa
            </Button>
          )}
          {canDelete && (
            <Button variant="light" size="sm" className="text-gray-600 font-medium" onPress={handleDelete}>
              Xóa
            </Button>
          )}
          {(canCopy || canEdit || canDelete) && <Divider orientation="vertical" className="h-6 bg-gray-200" />}
          {canCreate && (
            <>
              <Button variant="light" size="sm" startContent={<History size={16} />} className="text-gray-600 font-medium" onPress={() => setLichSuOpen(true)}>
                Lịch sử
              </Button>
              <Button color="primary" size="sm" startContent={<Plus size={18} />} className="font-medium rounded-md px-4" onPress={() => {
                if (isKhoaOfTruongMode) {
                  setFormData({ id_truong: String(idTruong) })
                }
                onOpenDrawerAdd()
              }}>
                Thêm mới
              </Button>
            </>
          )}
          <TableColumnVisibility
            columns={allColumns}
            visibleColumns={new Set(allColumns.map(c => c.uid))}
            setVisibleColumns={() => {}}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-white min-h-0">
        <TableHr
          key={`table-${title}-${idTruong || 'list'}`}
          data={rows}
          columns={visibleColumns}
          isLoading={isTableLoading}
          sortDescriptors={sortDescriptors}
          onSortChange={setSortDescriptors}
          columnWidths={columnWidths}
          onColumnResize={(uid, width) => setColumnWidths({ ...columnWidths, [uid]: width })}
          onPinColumn={(uid, pin) => setPinnedColumns({ ...pinnedColumns, [uid]: pin })}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          selectionMode="multiple"
          primaryKey={isKhoaMode ? 'id_khoa' : primaryKey}
        />

        {isKhoaOfTruongMode ? (
          // Đang xem khoa của 1 trường cụ thể
          <>
            <CategoryModal
              isOpen={isOpenDrawerAdd}
              onOpenChange={(open) => { if (!open) { onCloseDrawerAdd(); setFormData({}) } }}
              title="Thêm khoa"
              handleSubmitApi={(_id, data) => KhoaAxios.create(data!)}
              formData={formData}
              onSubmitSuccess={() => { refetchKhoa(); setFormData({}); invalidateSidebarCounts() }}
            >
              <FormKhoa formData={formData} setFormData={setFormData} isEdit={false} />
            </CategoryModal>

            <CategoryModal
              isOpen={isOpenDrawerEdit}
              onOpenChange={(open) => { if (!open) { onCloseDrawerEdit(); setFormData({}) } }}
              title="Sửa khoa"
              handleSubmitApi={(_id, data) => KhoaAxios.update(String(editingId), data!)}
              formData={formData}
              onSubmitSuccess={() => { refetchKhoa(); setFormData({}); invalidateSidebarCounts() }}
            >
              <FormKhoa formData={formData} setFormData={setFormData} />
            </CategoryModal>
          </>
        ) : isKhoaMode ? (
          // Khoa standalone (không thuộc trường nào)
          <>
            <CategoryModal
              isOpen={isOpenDrawerAdd}
              onOpenChange={(open) => { if (!open) { onCloseDrawerAdd(); setFormData({}) } }}
              title="Thêm khoa"
              handleSubmitApi={(_id, data) => KhoaAxios.create(data!)}
              formData={formData}
              onSubmitSuccess={() => { refetch(); setFormData({}); invalidateSidebarCounts() }}
            >
              <FormKhoa formData={formData} setFormData={setFormData} isEdit={false} />
            </CategoryModal>

            <CategoryModal
              isOpen={isOpenDrawerEdit}
              onOpenChange={(open) => { if (!open) { onCloseDrawerEdit(); setFormData({}) } }}
              title="Sửa khoa"
              handleSubmitApi={(_id, data) => KhoaAxios.update(String(editingId), data!)}
              formData={formData}
              onSubmitSuccess={() => { refetch(); setFormData({}); invalidateSidebarCounts() }}
            >
              <FormKhoa formData={formData} setFormData={setFormData} />
            </CategoryModal>
          </>
        ) : (
          // Mặc định - dùng form của component
          <>
            <CategoryModal
              isOpen={isOpenDrawerAdd}
              onOpenChange={(open) => { if (!open) { onCloseDrawerAdd(); setFormData({}) } }}
              title={`Thêm ${title.toLowerCase()}`}
              handleSubmitApi={(_id, data) => apiService.create(data!)}
              formData={formData}
              onSubmitSuccess={() => { refetch(); setFormData({}); invalidateSidebarCounts() }}
            >
              <FormComponent formData={formData} setFormData={setFormData} isEdit={false} />
            </CategoryModal>

            <CategoryModal
              isOpen={isOpenDrawerEdit}
              onOpenChange={(open) => { if (!open) { onCloseDrawerEdit(); setFormData({}) } }}
              title={`Sửa ${title.toLowerCase()}`}
              handleSubmitApi={(_id, data) => apiService.update(String(editingId), data!)}
              formData={formData}
              onSubmitSuccess={() => { refetch(); setFormData({}); invalidateSidebarCounts() }}
            >
              <FormComponent formData={formData} setFormData={setFormData} />
            </CategoryModal>
          </>
        )}
      </div>

      <TablePagination
        page={page}
        total={recordsTotal}
        filtered={recordsFiltered}
        limit={length}
        onChangePage={setPage}
        onChangeLimit={(newLength) => { setLength(newLength); setPage(1) }}
      />

      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content={Array.isArray(deletingId)
          ? `Bạn có chắc chắn muốn xóa ${deletingId.length} bản ghi đã chọn không?`
          : `Bạn có chắc chắn muốn xóa ${title.toLowerCase()} này không?`}
        isDanger={true}
      />
      <ConfirmModal
        isOpen={isOpenConfirmEdit}
        onClose={() => { onCloseConfirmEdit(); setPendingEdit(null); setEditingCell(null) }}
        onConfirm={handleSaveEdit}
        title="Xác nhận sửa đổi"
        content="Bạn có chắc chắn muốn lưu thay đổi này không?"
        isDanger={false}
      />
      <CategoryHistoryDrawer
        open={lichSuOpen}
        onClose={() => setLichSuOpen(false)}
        entityKey={isKhoaMode ? 'khoa' : title === 'Phòng ban' ? 'phongban' : title === 'Trung tâm' ? 'trungtam' : 'truong'}
      />
    </div>
  )
}
