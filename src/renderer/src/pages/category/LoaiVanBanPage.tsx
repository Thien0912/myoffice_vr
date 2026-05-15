import {
  Button,
  Chip,
  Input,
  Spinner,
  Tooltip,
  useDisclosure,
  Divider,
  Select,
  SelectItem
} from '@heroui/react'
import { loaivanbanAxios } from './mockApi'
import DebugBox from '@renderer/components/DebugBox'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery } from '@tanstack/react-query'
import { Edit, Plus, RotateCcw, Search, Trash, Mail } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useLoaiVanBanStore } from '@renderer/store/useLoaiVanBanStore'
import { ModalCommon } from '@renderer/components/ModalCommon'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import FormLoaiVanBan from './components/FormLoaiVanBan'
import { DonviAxios, mapDonviOptions } from './mockApi'
import { HrPrimaryButton } from '@renderer/components/hero-custom'
import { toast } from "@heroui-v3/react";
import HistoryDrawer from './components/HistoryDrawer'

export default function LoaiVanBanPage() {
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
  } = useLoaiVanBanStore()

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

  // Drawer / Edit states (Placeholder for now)
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
    queryKey: ['loaidonviData', filters, sortDescriptors],
    queryFn: async () => {
      const payload = {
        searchValue: filters.searchValue,
        start: (filters.page - 1) * filters.length,
        length: filters.length,
        order: sortDescriptors.map((desc) => ({
          column: desc.column,
          dir: desc.direction === 'ascending' ? 'asc' : 'desc'
        })),
        searchKey: JSON.stringify({ selectedClassify: filters.selectedClassify })
        // Add other filter mappings if API supports them
      }
      const response = await loaivanbanAxios.fetch(payload)
      return response
    }
  })

  useEffect(() => {
    if (responseData?.data) {
      setRecordsTotal(responseData.recordsTotal || 0)
      setRecordsFiltered(responseData.recordsFiltered || 0)
    }
  }, [responseData])

  // Fetch Donvi options for inline edit
  const { data: donviOptions = [] } = useQuery({
    queryKey: ['donviOptions'],
    queryFn: () => mapDonviOptions(),
    staleTime: 5 * 60 * 1000
  })

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
      const response = await loaivanbanAxios.delete(deletingId as string) // Adjust if API accepts array
      if (response.success) {
        toast('Xóa đơn vị thành công', { variant: 'success' })
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
    const currentRow = responseData?.data.find((r: any) => r.id_loai === editingCell.id)
    if (!currentRow) return

    const originalValue = currentRow[editingCell.column]
    if (editingCell.value !== originalValue) {
      setPendingEdit(editingCell)
      onOpenConfirmEdit()
    } else {
      setEditingCell(null)
    }
  }

  // Wrapper for Select change which might not trigger standard onBlur nicely with current logic
  const handleFinishEditWithVal = (newVal: string, column: string, id: string | number) => {
    const currentRow = responseData?.data.find((r: any) => r.id_loai === id)
    if (!currentRow) return

    const originalValue = currentRow[column]
    // For id_don_vi, originalValue might be null/undefined vs string
    if (String(newVal) !== String(originalValue || '')) {
      // We set pending edit directly here since we already have the new value
      setPendingEdit({
        id,
        column,
        value: newVal
      })
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
      const response = await loaivanbanAxios.update(pendingEdit.id, payload)
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

  const DOCUMENT_TYPE_LABELS: Record<string, string> = {
    CTHDT: 'Chủ tịch Hội đồng trường',
    BGH: 'Ban Giám Hiệu',
    HDT: 'Hội đồng trường',
    DONVI: 'Đơn vị'
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
        uid: 'ten_loai',
        name: 'Tên loại',
        sortable: true,
        width: 250,
        render: (_, row: any) => {
          const isEditing = editingCell?.id === row.id_loai && editingCell?.column === 'ten_loai'
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
              className={`font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors ${!row.ten_loai ? 'text-gray-400 italic' : ''}`}
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id_loai,
                  column: 'ten_loai',
                  value: row.ten_loai
                })
              }
              title="Double click để sửa"
            >
              {row.ten_loai}
            </div>
          )
        }
      },
      {
        uid: 'tien_to',
        name: 'Tiền tố',
        sortable: true,
        width: 120,
        render: (_, row: any) => {
          const isEditing = editingCell?.id === row.id_loai && editingCell?.column === 'tien_to'
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
              className={`cursor-pointer hover:text-blue-600 transition-colors ${!row.tien_to ? 'text-gray-400 italic' : ''}`}
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id_loai,
                  column: 'tien_to',
                  value: row.tien_to || ''
                })
              }
              title="Double click để sửa"
            >
              {row.tien_to || '--'}
            </div>
          )
        }
      },
      {
        uid: 'hau_to',
        name: 'Hậu tố',
        sortable: true,
        width: 150,
        render: (_, row: any) => {
          const isEditing = editingCell?.id === row.id_loai && editingCell?.column === 'hau_to'
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
              className={`cursor-pointer hover:text-blue-600 transition-colors ${!row.hau_to ? 'text-gray-400 italic' : ''}`}
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id_loai,
                  column: 'hau_to',
                  value: row.hau_to || ''
                })
              }
              title="Double click để sửa"
            >
              {row.hau_to || '--'}
            </div>
          )
        }
      },
      {
        uid: 'id_don_vi',
        name: 'Thuộc đơn vị',
        sortable: true,
        width: 200,
        render: (_, row: any) => {
          const isEditing = editingCell?.id === row.id_loai && editingCell?.column === 'id_don_vi'
          return isEditing ? (
            <Select
              className="max-w-[200px]"
              size="sm"
              selectedKeys={editingCell.value ? [String(editingCell.value)] : []}
              onChange={(e) => {
                const val = e.target.value
                setEditingCell((prev) => (prev ? { ...prev, value: val } : null))
                // Auto trigger finish edit on selection change for Select
                if (val && val !== String(row.id_don_vi)) {
                  // Small delay to ensure state update
                  setTimeout(() => {
                    handleFinishEditWithVal(val, 'id_don_vi', row.id_loai)
                  }, 100)
                }
              }}
              onClose={() => {
                // handleFinishEdit() // Optional: if we want closing the dropdown to define "finish"
              }}
              aria-label="Chọn đơn vị"
            >
              {donviOptions.map((item: any) => (
                <SelectItem key={item.value}>{item.label}</SelectItem>
              ))}
            </Select>
          ) : (
            <div
              className={`font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors ${!row.ten_don_vi ? 'text-gray-400 italic' : ''}`}
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id_loai,
                  column: 'id_don_vi',
                  value: row.id_don_vi || ''
                })
              }
              title="Double click để sửa"
            >
              {row.ten_don_vi || '--'}
            </div>
          )
        }
      },
      {
        uid: 'thuoc_nhom',
        name: 'Nhóm',
        sortable: false,
        width: 300,
        render: (_, row: any) => {
          const isEditing = editingCell?.id === row.id_loai && editingCell?.column === 'thuoc_nhom'
          return isEditing ? (
            <Select
              className="max-w-[200px]"
              size="sm"
              selectedKeys={editingCell.value ? [editingCell.value] : []}
              onChange={(e) => {
                const val = e.target.value
                setEditingCell((prev) => (prev ? { ...prev, value: val } : null))
                if (val && val !== row.thuoc_nhom) {
                  setTimeout(() => {
                    handleFinishEditWithVal(val, 'thuoc_nhom', row.id_loai)
                  }, 100)
                }
              }}
              aria-label="Chọn nhóm"
            >
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key}>{label}</SelectItem>
              ))}
            </Select>
          ) : (
            <div
              className="font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id_loai,
                  column: 'thuoc_nhom',
                  value: row.thuoc_nhom
                })
              }
              title="Double click để sửa"
            >
              {DOCUMENT_TYPE_LABELS[row.thuoc_nhom] || row.thuoc_nhom}
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
                  setEditingId(row.id_loai)

                  const loaiSeleted = await loaivanbanAxios.show(row.id_loai)
                  setFormData({
                    ten_loai: loaiSeleted.data.ten_loai,
                    tien_to: loaiSeleted.data.tien_to,
                    hau_to: loaiSeleted.data.hau_to,
                    id_don_vi: loaiSeleted.data.id_don_vi,
                    thuoc_nhom: loaiSeleted.data.thuoc_nhom
                  })
                  onOpenDrawerEdit()
                }}
              >
                <Edit size={18} />
              </button>
            </Tooltip>
            {/* <Tooltip content="Xóa" color="danger">
                            <button className="text-gray-500 hover:text-red-600" onClick={() => handleDelete(row.id_don_vi)}>
                                <Trash size={18} />
                            </button>
                        </Tooltip> */}
          </div>
        )
      }
    ]
  }, [editingCell, responseData, donviOptions])

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

  useEffect(() => {
    setFormData({
      thuoc_nhom: 'BGH'
    })
  }, [])

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-180px)]">
      <DebugBox />
      <div className="bg-slate-50">
        <div className="p-3 flex flex-col md:flex-row items-center justify-between gap-2 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            <Input
              type="search"
              placeholder="Tìm kiếm loại..."
              startContent={<Search className="text-gray-500" size={18} />}
              value={typingValue}
              onValueChange={setTypingValue}
              className="w-full md:max-w-[400px]"
              classNames={{ inputWrapper: 'h-10 bg-white border border-gray-200 rounded-md' }}
              endContent={isFetching && <Spinner size="sm" />}
            />
            <SelectDropdown
              label="Loại văn bản"
              options={[
                { value: 'all', label: 'Tất cả loại' },
                ...Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => ({
                  value: key,
                  label: label
                }))
              ]}
              value={filters.selectedClassify || 'all'}
              onChange={(val) => setFilters({ selectedClassify: val as string, page: 1 })}
              className="w-full md:max-w-[200px]"
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
          // onRowClick={}
          sortDescriptors={sortDescriptors}
          onSortChange={setSortDescriptors}
          columnWidths={columnWidths}
          onColumnResize={setColumnWidth}
          onPinColumn={setPinnedColumn}
        />

        <ModalCommon
          title="Thêm loại văn bản"
          open={isOpenDrawerAdd}
          onClose={() => {
            onCloseDrawerAdd()
            setFormData({
              thuoc_nhom: 'BGH'
            })
          }}
          handleSubmitApi={(_id, data) => loaivanbanAxios.create(Object.fromEntries(data!))}
          formData={formData}
          onSubmitSuccess={() => {
            refetch()
            setFormData({})
            // onCloseDrawerAdd()
          }}
        >
          <FormLoaiVanBan formData={formData} setFormData={setFormData} isEdit={false} />
        </ModalCommon>

        <ModalCommon
          title="Sửa loại văn bản"
          open={isOpenDrawerEdit}
          onClose={() => {
            onCloseDrawerEdit()
            setFormData({
              thuoc_nhom: 'BGH'
            })
          }}
          handleSubmitApi={(_id, data) => loaivanbanAxios.update(String(editingId), Object.fromEntries(data!))}
          formData={formData}
          onSubmitSuccess={() => {
            refetch()
            setFormData({})
          }}
        >
          <FormLoaiVanBan formData={formData} setFormData={setFormData} />
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
        content="Bạn có chắc chắn muốn xóa loại văn bản này không? Hành động này không thể hoàn tác."
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
            <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} entityType="loaivanban" />
        </div>
  )
}
