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
import { History, Plus, Search } from 'lucide-react'
import CategoryHistoryDrawer from './components/CategoryHistoryDrawer'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useLoaiVanBanStore } from '@renderer/store/useLoaiVanBanStore'
import { CategoryModal } from './components/CategoryModal'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import FormLoaiVanBan from './components/FormLoaiVanBan'
import { DonviAxios, mapDonviOptions } from './mockApi'
import { toast } from "@heroui-v3/react";

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

    const [lichSuOpen, setLichSuOpen] = useState(false)

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
    setSelectedKeys(new Set())
    reset()
    setTimeout(() => {
      setIsResetting(false)
    }, 500)
  }

  const selectedRows = useMemo(() => {
    if (!responseData?.data) return []
    return responseData.data.filter((row: any) => selectedKeys.has(String(row.id_loai)))
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
          ten_loai: row.ten_loai + ' (Copy)',
          tien_to: row.tien_to,
          hau_to: row.hau_to,
          id_don_vi: row.id_don_vi,
          thuoc_nhom: row.thuoc_nhom,
        }
        return loaivanbanAxios.create(payload)
      })
      const results = await Promise.all(promises)
      const allSuccess = results.every((r: any) => r.success)
      if (allSuccess) {
        toast(`Sao chép thành công ${selectedRows.length} loại văn bản`, { variant: 'success' })
        setSelectedKeys(new Set())
        refetch()
      } else {
        toast('Một số loại văn bản sao chép thất bại', { variant: 'danger' })
      }
    } catch (error) {
      toast('Có lỗi xảy ra khi sao chép', { variant: 'danger' })
    }
  }

  const handleOpenEdit = async () => {
    if (selectedRows.length !== 1) return
    const row = selectedRows[0]
    setEditingId(row.id_loai)
    try {
            const detail = await loaivanbanAxios.show(row.id_loai)
      if (detail.success && detail.data) {
        setFormData({
          ten_loai: detail.data.ten_loai || '',
          tien_to: detail.data.tien_to || '',
          hau_to: detail.data.hau_to || '',
          id_don_vi: detail.data.id_don_vi || '',
          thuoc_nhom: detail.data.thuoc_nhom || 'BGH'
        })
      } else {
        setFormData({
          ten_loai: row.ten_loai || '',
          tien_to: row.tien_to || '',
          hau_to: row.hau_to || '',
          id_don_vi: row.id_don_vi || '',
          thuoc_nhom: row.thuoc_nhom || 'BGH'
        })
      }
    } catch {
      setFormData({
        ten_loai: row.ten_loai || '',
        tien_to: row.tien_to || '',
        hau_to: row.hau_to || '',
        id_don_vi: row.id_don_vi || '',
        thuoc_nhom: row.thuoc_nhom || 'BGH'
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
        ids.map((id) => loaivanbanAxios.delete(String(id)))
      )
      const failed = results.filter((r: any) => !r.success)
      if (failed.length === 0) {
        toast(`Xóa thành công ${ids.length} loại văn bản`, { variant: 'success' })
        setSelectedKeys(new Set())
        refetch()
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
    <div className="flex flex-col w-full h-full overflow-hidden relative bg-white">
      <DebugBox />
      
      <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            <Input
              type="search"
              placeholder="Tìm kiếm loại..."
              startContent={<Search className="text-gray-500" size={18} />}
              value={typingValue}
              onValueChange={setTypingValue}
              className="w-full md:max-w-[300px]"
              classNames={{ inputWrapper: 'h-8 bg-white border border-gray-200 rounded-lg' }}
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
            <Button
                            color="primary"
                            size="sm"
                            startContent={<Plus size={18} />}
                            className="font-medium rounded-md px-4"
                            onPress={() => onOpenDrawerAdd()}
                        >
                            Thêm mới
                        </Button>
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
                <TableHr
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
          primaryKey="id_loai"
        />

        <CategoryModal
          isOpen={isOpenDrawerAdd}
          onOpenChange={(open) => { if (!open) {
            onCloseDrawerAdd()
            setFormData({
              thuoc_nhom: 'BGH'
            })
          } }}
          title="Thêm loại văn bản"
          handleSubmitApi={(_id, data) => loaivanbanAxios.create(data!)}
          formData={formData}
          onSubmitSuccess={() => {
            refetch()
            setFormData({})
          }}
        >
          <FormLoaiVanBan formData={formData} setFormData={setFormData} isEdit={false} />
        </CategoryModal>

        <CategoryModal
          isOpen={isOpenDrawerEdit}
          onOpenChange={(open) => { if (!open) {
            onCloseDrawerEdit()
            setFormData({
              thuoc_nhom: 'BGH'
            })
          } }}
          title="Sửa loại văn bản"
          handleSubmitApi={(_id, data) => loaivanbanAxios.update(String(editingId), data!)}
          formData={formData}
          onSubmitSuccess={() => {
            refetch()
            setFormData({})
          }}
        >
          <FormLoaiVanBan formData={formData} setFormData={setFormData} />
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
            ? `Bạn có chắc chắn muốn xóa ${deletingId.length} loại văn bản đã chọn không? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa loại văn bản này không? Hành động này không thể hoàn tác.'
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
        entityKey="loaivanban"
      />
    </div>
  )
}
