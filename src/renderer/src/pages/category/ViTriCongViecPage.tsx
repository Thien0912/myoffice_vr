import { Button, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import { vitricongviecAxios } from './mockApi'
import DebugBox from '@renderer/components/DebugBox'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery } from '@tanstack/react-query'
import { Edit, Plus, RotateCcw, Search, Trash } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useViTriCongViecStore } from '@renderer/store/useViTriCongViecStore'
import { ModalCommon } from '@renderer/components/ModalCommon'
import FormViTriCongViec from './components/FormViTriCongViec'
import { HrPrimaryButton } from '@renderer/components/hero-custom'
import { toast } from "@heroui-v3/react";
import HistoryDrawer from './components/HistoryDrawer'

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

    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

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
    reset()
    setTimeout(() => {
      setIsResetting(false)
    }, 500)
  }

  const handleDelete = (id: string | number) => {
    setDeletingId(id)
    onOpenConfirm()
  }

  const onConfirmDelete = async () => {
    if (!deletingId) return
    try {
      const response = await vitricongviecAxios.delete(deletingId as string)
      if (response.success) {
        toast('Xóa vị trí công việc thành công', { variant: 'success' })
        refetch()
      } else {
        toast(response.message || 'Xóa thất bại', { variant: 'danger' })
      }
    } catch (error) {
      toast('Có lỗi xảy ra', { variant: 'danger' })
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
        refetch()
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
      {
        uid: 'actions',
        name: 'Thao tác',
        sortable: false,
        width: 80,
        pinned: 'right',
        className: 'text-center',
        render: (_, row: any) => (
          <div className="flex items-center justify-center gap-2">
            <Tooltip content="Chỉnh sửa">
              <button
                className="text-gray-500 hover:text-blue-600"
                onClick={async () => {
                  setEditingId(row.id_vi_tri_cong_viec)

                  const vitriSelected = await vitricongviecAxios.show(row.id_vi_tri_cong_viec)
                  setFormData({
                    ten_cong_viec: vitriSelected.data.ten_cong_viec,
                    ten_cong_viec_en: vitriSelected.data.ten_cong_viec_en
                  })
                  onOpenDrawerEdit()
                }}
              >
                <Edit size={18} />
              </button>
            </Tooltip>
            {/* <Tooltip content="Xóa" color="danger">
                <button className="text-gray-500 hover:text-red-600" onClick={() => handleDelete(row.id_vi_tri_cong_viec)}>
                    <Trash size={18} />
                </button>
            </Tooltip> */}
          </div>
        )
      }
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
    <div className="flex flex-col gap-4 h-[calc(100vh-180px)]">
      <DebugBox />
      <div className="bg-slate-50">
        <div className="p-3 flex flex-col md:flex-row items-center justify-between gap-2 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            <Input
              type="search"
              placeholder="Tìm kiếm vị trí..."
              startContent={<Search className="text-gray-500" size={18} />}
              value={typingValue}
              onValueChange={setTypingValue}
              className="w-full md:max-w-[400px]"
              classNames={{ inputWrapper: 'h-10 bg-white border border-gray-200 rounded-md' }}
              endContent={isFetching && <Spinner size="sm" />}
            />

<<<<<<< Updated upstream
=======
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
                        <Button variant="light" size="sm" className="text-gray-600 font-medium" onPress={() => setIsHistoryOpen(true)}>Lịch sử</Button>
                        {(canCopy || canEdit || canDelete) && <Divider orientation="vertical" className="h-6 bg-gray-200" />}
            <HrPrimaryButton
              startContent={<Plus size={18} />}
              className="px-4"
              onPress={() => { setFormData({}); onOpenDrawerAdd() }}
            >
              Thêm mới
            </HrPrimaryButton>
>>>>>>> Stashed changes
            <TableColumnVisibility
              columns={allColumns}
              visibleColumns={new Set(filters.initial_visible_columns)}
              setVisibleColumns={(keys) =>
                setFilters({ initial_visible_columns: Array.from(keys) as string[] })
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content="Tải lại dữ liệu">
              <Button isIconOnly variant="light" onClick={handleResetTable} isLoading={isResetting}>
                <RotateCcw size={18} className="text-gray-600" />
              </Button>
            </Tooltip>
            <Divider orientation="vertical" className="h-6" />
            <Button
              color="primary"
              startContent={<Plus size={18} />}
              className="font-medium"
              onPress={() => onOpenDrawerAdd()}
            >
              Thêm mới
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative rounded-md border border-gray-200 bg-white">
        <TableHr
          data={rows}
          columns={visibleColumns}
          isLoading={isLoading}
          sortDescriptors={sortDescriptors}
          onSortChange={setSortDescriptors}
          columnWidths={columnWidths}
          onColumnResize={setColumnWidth}
          onPinColumn={setPinnedColumn}
        />

        <ModalCommon
          title="Thêm vị trí công việc"
          open={isOpenDrawerAdd}
          onClose={() => {
            onCloseDrawerAdd()
            setFormData({})
          }}
          handleSubmitApi={(_id, data) => vitricongviecAxios.create(Object.fromEntries(data!))}
          formData={formData}
          onSubmitSuccess={() => {
            refetch()
            setFormData({})
          }}
        >
          <FormViTriCongViec formData={formData} setFormData={setFormData} />
        </ModalCommon>

        <ModalCommon
          title="Sửa vị trí công việc"
          open={isOpenDrawerEdit}
          onClose={() => {
            onCloseDrawerEdit()
            setFormData({})
          }}
          handleSubmitApi={(_id, data) => vitricongviecAxios.update(String(editingId), Object.fromEntries(data!))}
          formData={formData}
          onSubmitSuccess={() => {
            refetch()
            setFormData({})
          }}
        >
          <FormViTriCongViec formData={formData} setFormData={setFormData} />
        </ModalCommon>
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
        content="Bạn có chắc chắn muốn xóa vị trí công việc này không? Hành động này không thể hoàn tác."
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
            <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} entityType="vitricongviec" />
        </div>
  )
}
