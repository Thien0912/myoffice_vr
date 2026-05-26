import { Button, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import { HrPrimaryButton } from '@renderer/components/hero-custom/HrPrimaryButton'
import { caLamViecAxios } from './mockApi'
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
import { useCaLamViecStore } from '@renderer/store/useCaLamViecStore'
import { CategoryModal } from './components/CategoryModal'
import FormCaLamViec from './components/FormCaLamViec'
import { toast } from '@heroui-v3/react'

export default function CaLamViecPage() {
  const {
    filters,
    setFilters,
    sortDescriptors,
    setSortDescriptors,
    columnWidths,
    setColumnWidth,
    pinnedColumns,
    setPinnedColumn,
    reset
  } = useCaLamViecStore()

  const [recordsTotal, setRecordsTotal] = useState(0)
  const [recordsFiltered, setRecordsFiltered] = useState(0)
  const [isResetting, setIsResetting] = useState(false)
  const [typingValue, setTypingValue] = useState(filters.searchValue)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

  // Confirm Modal State
  const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

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
  const {
    isOpen: isOpenConfirmEdit,
    onOpen: onOpenConfirmEdit,
    onClose: onCloseConfirmEdit
  } = useDisclosure()

  // Drawer / Edit states
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const {
    isOpen: isOpenDrawerAdd,
    onClose: onCloseDrawerAdd,
    onOpen: onOpenDrawerAdd
  } = useDisclosure()

    const {
        isOpen: isOpenDrawerEdit,
        onClose: onCloseDrawerEdit,
        onOpen: onOpenDrawerEdit
    } = useDisclosure()

    const [lichSuOpen, setLichSuOpen] = useState(false)

  const {
    data: responseData,
    isLoading: isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['caLamViecData', filters, sortDescriptors],
    queryFn: async () => {
      const payload = {
        searchValue: filters.searchValue,
        start: (filters.page - 1) * filters.length,
        length: filters.length,
        order: sortDescriptors.map((desc) => ({
          column: desc.column,
          dir: desc.direction === 'ascending' ? 'asc' : 'desc'
        }))
      }
      const response = await caLamViecAxios.fetch(payload)
      return response
    }
  })

    const queryClient = useQueryClient()

  useEffect(() => {
    if (responseData?.data) {
      setRecordsTotal(responseData.recordsTotal || 0)
      setRecordsFiltered(responseData.recordsFiltered || 0)
    }
  }, [responseData])

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ searchValue: typingValue, page: 1 })
    }, 500)
    return () => clearTimeout(timer)
  }, [typingValue])

  const handleResetTable = () => {
    setIsResetting(true)
    setTypingValue('')
    setSelectedKeys(new Set())
    reset()
    setTimeout(() => {
      setIsResetting(false)
    }, 500)
  }

  const selectedRows = useMemo(() => {
    if (!responseData?.data) return []
    return responseData.data.filter((row: any) => selectedKeys.has(String(row.id)))
  }, [responseData, selectedKeys])

  const selectedCount = selectedKeys.size
  const canCopy = selectedCount > 0
  const canEdit = selectedCount === 1
  const canDelete = selectedCount > 0

  const handleCopyRows = async () => {
    if (selectedRows.length === 0) return
    try {
      const promises = selectedRows.map((row: any) => {
        const payload = {
          ca_lam_viec: row.ca_lam_viec + ' (Copy)',
          check_in: row.check_in,
          check_out: row.check_out,
          no_leave_day: row.no_leave_day,
        }
        return caLamViecAxios.create(payload)
      })
      const results = await Promise.all(promises)
      const allSuccess = results.every((r: any) => r.success)
      if (allSuccess) {
        toast(`Sao chép thành công ${selectedRows.length} ca làm việc`, { variant: 'success' })
        setSelectedKeys(new Set())
        refetch(); queryClient.invalidateQueries({ queryKey: ["count"] })
      } else {
        toast('Một số ca làm việc sao chép thất bại', { variant: 'danger' })
      }
    } catch (error) {
      toast('Có lỗi xảy ra khi sao chép', { variant: 'danger' })
    }
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
      const results = await Promise.all(
        ids.map((id) => caLamViecAxios.delete(String(id)))
      )
      const failed = results.filter((r: any) => !r.success)
      if (failed.length === 0) {
        toast(`Xóa thành công ${ids.length} ca làm việc`, { variant: 'success' })
        setSelectedKeys(new Set())
        refetch(); queryClient.invalidateQueries({ queryKey: ["count"] })
      } else {
        const firstError = failed[0]?.message || 'Không xác định'
        toast(`Xóa thất bại: ${firstError}`, { variant: 'danger' })
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Lỗi không xác định từ server'
      toast(`Xóa thất bại: ${msg}`, { variant: 'danger' })
    } finally {
      onCloseConfirm()
      setDeletingId(null)
    }
  }

  const handleOpenEdit = async () => {
    if (selectedRows.length !== 1) return
    const row = selectedRows[0]
    setEditingId(row.id)
    try {
      const detail = await caLamViecAxios.show(row.id)
      if (detail.success && detail.data) {
        setFormData({
          ca_lam_viec: detail.data.ca_lam_viec || '',
          check_in: detail.data.check_in || '',
          check_out: detail.data.check_out || '',
          no_leave_day: detail.data.no_leave_day ?? 0
        })
      } else {
        setFormData({
          ca_lam_viec: row.ca_lam_viec || '',
          check_in: row.check_in || '',
          check_out: row.check_out || '',
          no_leave_day: row.no_leave_day ?? 0
        })
      }
    } catch {
      setFormData({
        ca_lam_viec: row.ca_lam_viec || '',
        check_in: row.check_in || '',
        check_out: row.check_out || '',
        no_leave_day: row.no_leave_day ?? 0
      })
    }
    onOpenDrawerEdit()
  }

  const handleFinishEdit = () => {
    if (!editingCell) return

    const currentRow = responseData?.data.find((r: any) => r.id === editingCell.id)
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
      const currentRow = responseData?.data.find((r: any) => r.id === pendingEdit.id)

      const payload = {
        ...currentRow,
        [pendingEdit.column]: pendingEdit.value
      }

      const response = await caLamViecAxios.update(pendingEdit.id, payload)
      if (response.success) {
        toast('Cập nhật thành công', { variant: 'success' })
        refetch(); queryClient.invalidateQueries({ queryKey: ["count"] })
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

  const allColumns: TableColumnType[] = useMemo(() => {
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
        uid: 'ca_lam_viec',
        name: 'Tên ca làm việc',
        sortable: true,
        width: 250,
        render: (_, row: any) => {
          const isEditing = editingCell?.id === row.id && editingCell?.column === 'ca_lam_viec'
          return isEditing ? (
            <Input
              autoFocus
              size="sm"
              variant="bordered"
              value={editingCell.value}
              onValueChange={(val) =>
                setEditingCell((prev) => (prev ? { ...prev, value: val } : null))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishEdit()
                if (e.key === 'Escape') setEditingCell(null)
              }}
              onBlur={handleFinishEdit}
              classNames={{ input: 'text-sm' }}
            />
          ) : (
            <div
              className={`font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors ${!row.ca_lam_viec ? 'text-gray-400 italic' : ''}`}
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id,
                  column: 'ca_lam_viec',
                  value: row.ca_lam_viec || ''
                })
              }
              title="Double click để sửa"
            >
              {row.ca_lam_viec}
            </div>
          )
        }
      },
      {
        uid: 'check_in',
        name: 'Giờ vào',
        sortable: true,
        width: 120,
        className: 'text-center',
        render: (_, row: any) => (
          <div className="text-blue-600 font-medium">{row.check_in || '--:--'}</div>
        )
      },
      {
        uid: 'check_out',
        name: 'Giờ ra',
        sortable: true,
        width: 120,
        className: 'text-center',
        render: (_, row: any) => (
          <div className="text-red-500 font-medium">{row.check_out || '--:--'}</div>
        )
      },
      {
        uid: 'no_leave_day',
        name: 'Ngày nghỉ',
        sortable: true,
        width: 120,
        className: 'text-center',
        render: (_, row: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${row.no_leave_day ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}
          >
            {row.no_leave_day ? 'Không tính' : 'Tính bình thường'}
          </span>
        )
      },
      ]
  }, [editingCell, responseData])

  const columnsWithSettings = useMemo(() => {
    return allColumns.map((col) => ({
      ...col,
      width: columnWidths[col.uid] || col.width,
      pinned: pinnedColumns[col.uid] || col.pinned
    }))
  }, [allColumns, columnWidths, pinnedColumns])

  const visibleColumns = useMemo(() => {
    return columnsWithSettings.filter((col) => filters.initial_visible_columns.includes(col.uid))
  }, [columnsWithSettings, filters.initial_visible_columns])

  const rows = useMemo(() => responseData?.data || [], [responseData])

  return (
    <div className="flex flex-col w-full h-full overflow-hidden relative bg-white">
      <DebugBox />
      
      <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            <Input
              type="search"
              placeholder="Tìm kiếm ca làm việc..."
              startContent={<Search className="text-gray-500" size={18} />}
              value={typingValue}
              onValueChange={setTypingValue}
              className="w-full md:max-w-[300px]"
              classNames={{ inputWrapper: 'h-7 bg-white border border-gray-200 rounded-lg' }}
              endContent={isFetching && <Spinner size="sm" />}
            />

          </div>

          <div className="flex items-center gap-1.5">
            {canCopy && (
              <Button
                variant="light"
                size="sm"
                className="text-gray-600 font-medium"
                onPress={handleCopyRows}
              >
                Sao chép
              </Button>
            )}
            {canEdit && (
              <Button
                variant="light"
                size="sm"
                className="text-gray-600 font-medium"
                onPress={handleOpenEdit}
              >
                Sửa
              </Button>
            )}
            {canDelete && (
              <Button
                variant="light"
                size="sm"
                className="text-gray-600 font-medium"
                onPress={handleDelete}
              >
                Xóa
              </Button>
            )}
            {(canCopy || canEdit || canDelete) && <Divider orientation="vertical" className="h-6 bg-gray-200" />}
            <Button
                            variant="light"
                            size="sm"
                            startContent={<History size={16} />}
                            className="text-gray-600 font-medium"
                            onPress={() => setLichSuOpen(true)}
                        >
                            Lịch sử
                        </Button>
            <HrPrimaryButton
                startContent={<Plus size={18} />}
                onPress={() => onOpenDrawerAdd()}
            >
                Thêm mới
            </HrPrimaryButton>
            <TableColumnVisibility
              columns={allColumns}
              visibleColumns={new Set(filters.initial_visible_columns)}
              setVisibleColumns={(keys) =>
                setFilters({ initial_visible_columns: Array.from(keys) as string[] })
              }
            />
          </div>
        </div>

            <div className="flex-1 overflow-hidden relative bg-white min-h-0">
                <TableHr size="sm"
          data={rows}
          columns={visibleColumns}
          isLoading={isLoading}
          sortDescriptors={sortDescriptors}
          onSortChange={setSortDescriptors}
          columnWidths={columnWidths}
          onColumnResize={setColumnWidth}
          onPinColumn={setPinnedColumn}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          selectionMode="multiple"
          primaryKey="id"
        />

        <CategoryModal
          isOpen={isOpenDrawerAdd}
          onOpenChange={(open) => { if (!open) {
            onCloseDrawerAdd()
            setFormData({})
          } }}
          title="Thêm ca làm việc"
          handleSubmitApi={(_id, data) => caLamViecAxios.create(data!)}
          formData={formData}
          onSubmitSuccess={() => {
            refetch(); queryClient.invalidateQueries({ queryKey: ["count"] })
            setFormData({})
          }}
        >
          <FormCaLamViec formData={formData} setFormData={setFormData} />
        </CategoryModal>

        <CategoryModal
          isOpen={isOpenDrawerEdit}
          onOpenChange={(open) => { if (!open) {
            onCloseDrawerEdit()
            setFormData({})
          } }}
          title="Sửa ca làm việc"
          handleSubmitApi={(_id, data) => caLamViecAxios.update(String(editingId), data!)}
          formData={formData}
          onSubmitSuccess={() => {
            refetch(); queryClient.invalidateQueries({ queryKey: ["count"] })
            setFormData({})
          }}
        >
          <FormCaLamViec formData={formData} setFormData={setFormData} />
        </CategoryModal>
      </div>

      <TablePagination
        page={filters.page}
        total={recordsTotal}
        filtered={recordsFiltered}
        limit={filters.length}
        onChangePage={(page) => setFilters({ page })}
        onChangeLimit={(length) => setFilters({ length, page: 1 })}
      />

      <ConfirmModal
        isOpen={isOpenConfirmEdit}
        onClose={() => {
          onCloseConfirmEdit()
          setPendingEdit(null)
          setEditingCell(null)
        }}
        onConfirm={handleSaveEdit}
        title="Xác nhận sửa đổi"
        content="Bạn có chắc chắn muốn lưu thay đổi này không?"
        isDanger={false}
      />
      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={() => {
          onCloseConfirm()
          setDeletingId(null)
        }}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content={
          Array.isArray(deletingId)
            ? `Bạn có chắc chắn muốn xóa ${deletingId.length} ca làm việc đã chọn không? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa ca làm việc này không? Hành động này không thể hoàn tác.'
        }
        isDanger={true}
      />
      <CategoryHistoryDrawer
        open={lichSuOpen}
        onClose={() => setLichSuOpen(false)}
        entityKey="calamviec"
      />
    </div>
  )
}
