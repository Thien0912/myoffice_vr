import { Button, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import { caLamViecAxios } from '@renderer/api/danhmuc/caLamViecAxios'
import DebugBox from '@renderer/components/DebugBox'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery } from '@tanstack/react-query'
import { Edit, Plus, RotateCcw, Search, Trash } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useCaLamViecStore } from '@renderer/store/useCaLamViecStore'
import { DrawerCommon } from '@renderer/components/DrawerCommon'
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

  // const onConfirmDelete = async () => {
  //     if (!deletingId) return
  //     try {
  //         const response = await caLamViecAxios.delete(deletingId as string)
  //         if (response.success) {
  //             toast({ title: 'Xóa ca làm việc thành công', color: 'success' })
  //             refetch()
  //         } else {
  //             toast({ title: response.message || 'Xóa thất bại', color: 'danger' })
  //         }
  //     } catch (error) {
  //         toast({ title: 'Có lỗi xảy ra', color: 'danger' })
  //     } finally {
  //         onCloseConfirm()
  //         setDeletingId(null)
  //     }
  // }

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
                  setEditingId(row.id)
                  const res = await caLamViecAxios.fetch({}, row.id)
                  setFormData(res.data)
                  onOpenDrawerEdit()
                }}
              >
                <Edit size={18} />
              </button>
            </Tooltip>
            {/* <Tooltip content="Xóa" color="danger">
                            <button className="text-gray-500 hover:text-red-600" onClick={() => handleDelete(row.id)}>
                                <Trash size={18} />
                            </button>
                        </Tooltip> */}
          </div>
        )
      }
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
    <div className="flex flex-col gap-4 h-[calc(100vh-180px)]">
      <DebugBox />
      <div className="bg-slate-50">
        <div className="p-3 flex flex-col md:flex-row items-center justify-between gap-2 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            <Input
              type="search"
              placeholder="Tìm kiếm ca làm việc..."
              startContent={<Search className="text-gray-500" size={18} />}
              value={typingValue}
              onValueChange={setTypingValue}
              className="w-full md:max-w-[400px]"
              classNames={{ inputWrapper: 'h-10 bg-white border border-gray-200 rounded-md' }}
              endContent={isFetching && <Spinner size="sm" />}
            />

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

        <DrawerCommon
          title="Thêm ca làm việc"
          open={isOpenDrawerAdd}
          onClose={() => {
            onCloseDrawerAdd()
            setFormData({})
          }}
          handleSubmitApi={(_id, data) => caLamViecAxios.create(data!)}
          formData={formData}
          onSubmitSuccess={() => {
            refetch()
            setFormData({})
          }}
        >
          <FormCaLamViec formData={formData} setFormData={setFormData} />
        </DrawerCommon>

        <DrawerCommon
          title="Sửa ca làm việc"
          open={isOpenDrawerEdit}
          onClose={() => {
            onCloseDrawerEdit()
            setFormData({})
          }}
          handleSubmitApi={(_id, data) => caLamViecAxios.update(String(editingId), data!)}
          formData={formData}
          onSubmitSuccess={() => {
            refetch()
            setFormData({})
          }}
        >
          <FormCaLamViec formData={formData} setFormData={setFormData} />
        </DrawerCommon>
      </div>

      <TablePagination
        page={filters.page}
        total={recordsTotal}
        filtered={recordsFiltered}
        limit={filters.length}
        onChangePage={(page) => setFilters({ page })}
        onChangeLimit={(length) => setFilters({ length, page: 1 })}
      />

      {/* <ConfirmModal
                isOpen={isOpenConfirm}
                onClose={onCloseConfirm}
                onConfirm={onConfirmDelete}
                title="Xác nhận xóa"
                content="Bạn có chắc chắn muốn xóa ca làm việc này không? Hành động này không thể hoàn tác."
                isDanger={true}
            /> */}
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
    </div>
  )
}
