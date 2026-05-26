import { Button, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import { HrPrimaryButton } from '@renderer/components/hero-custom/HrPrimaryButton'
import { vitricongviecAxios } from './mockApi'
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
import { useViTriCongViecStore } from '@renderer/store/useViTriCongViecStore'
import { CategoryModal } from './components/CategoryModal'
import FormViTriCongViec from './components/FormViTriCongViec'
import { toast } from "@heroui-v3/react";

export default function ViTriCongViecPage() {
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
  } = useViTriCongViecStore()

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
    queryKey: ['vitricongviecData', filters, sortDescriptors],
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
      const response = await vitricongviecAxios.fetch(payload)
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
    return responseData.data.filter((row: any) => selectedKeys.has(String(row.id_vi_tri_cong_viec)))
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
          ten_cong_viec: row.ten_cong_viec + ' (Copy)',
          ten_cong_viec_en: row.ten_cong_viec_en,
        }
        return vitricongviecAxios.create(payload)
      })
      const results = await Promise.all(promises)
      const allSuccess = results.every((r: any) => r.success)
      if (allSuccess) {
        toast(`Sao chép thành công ${selectedRows.length} vị trí công việc`, { variant: 'success' })
        setSelectedKeys(new Set())
        refetch(); queryClient.invalidateQueries({ queryKey: ["count"] })
      } else {
        toast('Một số vị trí công việc sao chép thất bại', { variant: 'danger' })
      }
    } catch (error) {
      toast('Có lỗi xảy ra khi sao chép', { variant: 'danger' })
    }
  }

  const handleOpenEdit = async () => {
    if (selectedRows.length !== 1) return
    const row = selectedRows[0]
    setEditingId(row.id_vi_tri_cong_viec)
    try {
            const detail = await vitricongviecAxios.show(row.id_vi_tri_cong_viec)
      if (detail.success && detail.data) {
        setFormData({
          ten_cong_viec: detail.data.ten_cong_viec || '',
          ten_cong_viec_en: detail.data.ten_cong_viec_en || ''
        })
      } else {
        setFormData({
          ten_cong_viec: row.ten_cong_viec || '',
          ten_cong_viec_en: row.ten_cong_viec_en || ''
        })
      }
    } catch {
      setFormData({
        ten_cong_viec: row.ten_cong_viec || '',
        ten_cong_viec_en: row.ten_cong_viec_en || ''
      })
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
      const results = await Promise.all(
        ids.map((id) => vitricongviecAxios.delete(String(id)))
      )
      const failed = results.filter((r: any) => !r.success)
      if (failed.length === 0) {
        toast(`Xóa thành công ${ids.length} vị trí công việc`, { variant: 'success' })
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

  const handleFinishEdit = () => {
    if (!editingCell) return

    // Find original value to compare
    const currentRow = responseData?.data.find(
      (r: any) => r.id_vi_tri_cong_viec === editingCell.id
    )
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
      const response = await vitricongviecAxios.update(pendingEdit.id, payload)
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
        uid: 'ten_cong_viec',
        name: 'Tên vị trí công việc',
        sortable: true,
        width: 300,
        render: (_, row: any) => {
          const isEditing =
            editingCell?.id === row.id_vi_tri_cong_viec && editingCell?.column === 'ten_cong_viec'
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
              className="font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id_vi_tri_cong_viec,
                  column: 'ten_cong_viec',
                  value: row.ten_cong_viec
                })
              }
              title="Double click để sửa"
            >
              {row.ten_cong_viec}
            </div>
          )
        }
      },
      {
        uid: 'ten_cong_viec_en',
        name: 'Tên tiếng anh',
        sortable: true,
        width: 250,
        render: (_, row: any) => {
          const isEditing =
            editingCell?.id === row.id_vi_tri_cong_viec &&
            editingCell?.column === 'ten_cong_viec_en'
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
              className="cursor-pointer hover:text-blue-600 transition-colors"
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id_vi_tri_cong_viec,
                  column: 'ten_cong_viec_en',
                  value: row.ten_cong_viec_en || ''
                })
              }
              title="Double click để sửa"
            >
              {row.ten_cong_viec_en || '--'}
            </div>
          )
        }
      },
      ]
  }, [editingCell, responseData, editingId])

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
              placeholder="Tìm kiếm vị trí..."
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
          primaryKey="id_vi_tri_cong_viec"
        />

        <CategoryModal
          isOpen={isOpenDrawerAdd}
          onOpenChange={(open) => { if (!open) {
            onCloseDrawerAdd()
            setFormData({})
          } }}
          title="Thêm vị trí công việc"
          handleSubmitApi={(_id, data) => vitricongviecAxios.create(data!)}
          formData={formData}
          onSubmitSuccess={() => {
            refetch(); queryClient.invalidateQueries({ queryKey: ["count"] })
            setFormData({})
          }}
        >
          <FormViTriCongViec formData={formData} setFormData={setFormData} />
        </CategoryModal>

        <CategoryModal
          isOpen={isOpenDrawerEdit}
          onOpenChange={(open) => { if (!open) {
            onCloseDrawerEdit()
            setFormData({})
          } }}
          title="Sửa vị trí công việc"
          handleSubmitApi={(_id, data) => vitricongviecAxios.update(String(editingId), data!)}
          formData={formData}
          onSubmitSuccess={() => {
            refetch(); queryClient.invalidateQueries({ queryKey: ["count"] })
            setFormData({})
          }}
        >
          <FormViTriCongViec formData={formData} setFormData={setFormData} />
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
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content={
          Array.isArray(deletingId)
            ? `Bạn có chắc chắn muốn xóa ${deletingId.length} vị trí công việc đã chọn không? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa vị trí công việc này không? Hành động này không thể hoàn tác.'
        }
        isDanger={true}
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
      <CategoryHistoryDrawer
        open={lichSuOpen}
        onClose={() => setLichSuOpen(false)}
        entityKey="vitricongviec"
      />
    </div>
  )
}
