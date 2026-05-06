import { Button, Chip, Input, Spinner, Tooltip, useDisclosure, Divider, Select, SelectItem } from '@heroui/react'
import { DonviAxios } from '@renderer/api/danhmuc/DonviAxios'
import DebugBox from '@renderer/components/DebugBox'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useDonviStore } from '@renderer/store/useDonviStore'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { DrawerCommon } from '@renderer/components/DrawerCommon'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import FormDonvi from './components/FormDonvi'
import { toast } from "@heroui-v3/react";

export default function DonviPage() {
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
  } = useDonviStore()

  const { user } = useAuthStore()
  const permissions = user?.permissions || []
  const isAdmin = permissions.includes('IS_ADMIN')

  const [recordsTotal, setRecordsTotal] = useState(0)
  const [recordsFiltered, setRecordsFiltered] = useState(0)
  const [isResetting, setIsResetting] = useState(false)
  const [typingValue, setTypingValue] = useState(filters.searchValue)
  const [formData, setFormData] = useState<Record<string, object>>({})
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

  // Confirm Modal State
  const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

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

  const {
    data: responseData,
    isLoading: isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['donviData', filters, sortDescriptors],
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
      const response = await DonviAxios.fetch(payload)
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
    setSelectedKeys(new Set())
    reset()
    setTimeout(() => {
      setIsResetting(false)
    }, 500)
  }

  const selectedRows = useMemo(() => {
    if (!responseData?.data) return []
    return responseData.data.filter((row: any) => selectedKeys.has(String(row.id_don_vi)))
  }, [responseData, selectedKeys])

  const selectedCount = selectedKeys.size
  const canCopy = selectedCount > 0
  const canEdit = selectedCount === 1
  const canDelete = selectedCount > 0
  const canCreate = isAdmin || permissions.includes('donvi.create')

  const handleCopyRows = async () => {
    if (selectedRows.length === 0) return
    try {
      const promises = selectedRows.map((row: any) => {
        const payload = {
          ten_don_vi: row.ten_don_vi + ' (Copy)',
          ten_viet_tat: row.ten_viet_tat,
          loai: row.loai,
          email: row.email,
          nguoi_co_quyen_van_thu: row.nguoi_co_quyen_van_thu,
        }
        return DonviAxios.create(payload)
      })
      const results = await Promise.all(promises)
      const allSuccess = results.every((r: any) => r.success)
      if (allSuccess) {
        toast(`Sao chép thành công ${selectedRows.length} đơn vị`, { variant: 'success' })
        setSelectedKeys(new Set())
        refetch()
      } else {
        toast('Một số đơn vị sao chép thất bại', { variant: 'danger' })
      }
    } catch (error) {
      toast('Có lỗi xảy ra khi sao chép', { variant: 'danger' })
    }
  }

  const handleOpenEdit = async () => {
    if (selectedRows.length !== 1) return
    const row = selectedRows[0]
    setEditingId(row.id_don_vi)
    try {
            const detail = await DonviAxios.show(row.id_don_vi)
      if (detail.success && detail.data) {
        setFormData({
          ten_don_vi: detail.data.ten_don_vi || '',
          ten_viet_tat: detail.data.ten_viet_tat || '',
          loai: detail.data.loai || '',
          email: detail.data.email || '',
          nguoi_co_quyen_van_thu: detail.data.nguoi_co_quyen_van_thu || []
        })
      } else {
        setFormData({
          ten_don_vi: row.ten_don_vi || '',
          ten_viet_tat: row.ten_viet_tat || '',
          loai: row.loai || '',
          email: row.email || '',
          nguoi_co_quyen_van_thu: row.nguoi_co_quyen_van_thu || []
        })
      }
    } catch {
      setFormData({
        ten_don_vi: row.ten_don_vi || '',
        ten_viet_tat: row.ten_viet_tat || '',
        loai: row.loai || '',
        email: row.email || '',
        nguoi_co_quyen_van_thu: row.nguoi_co_quyen_van_thu || []
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
        ids.map((id) => DonviAxios.delete(String(id)))
      )
      const failed = results.filter((r: any) => !r.success)
      if (failed.length === 0) {
        toast(`Xóa thành công ${ids.length} đơn vị`, { variant: 'success' })
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
    const currentRow = responseData?.data.find(
      (r: any) => r.id_don_vi === editingCell.id
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

  // Wrapper for Select change which might not trigger standard onBlur nicely with current logic
  const handleFinishEditWithVal = (newVal: string, column: string, id: string | number) => {
    const currentRow = responseData?.data.find(
      (r: any) => r.id_don_vi === id
    )
    if (!currentRow) return

    const originalValue = currentRow[column]
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
      const response = await DonviAxios.update(pendingEdit.id, payload)
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

  const UNIT_TYPE_LABELS: Record<string, string> = {
    LANH_DAO: 'Lãnh đạo',
    PHONG: 'Phòng',
    KHOA_BOMON: 'Khoa / Bộ môn',
    BAN: 'Ban',
    VIEN: 'Viện',
    TRUNG_TAM: 'Trung tâm',
    DON_VI_KHAC: 'Đơn vị khác'
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
        uid: 'ten_don_vi',
        name: 'Tên đơn vị',
        sortable: true,
        width: 250,
        render: (_, row: any) => {
          const isEditing =
            editingCell?.id === row.id_don_vi && editingCell?.column === 'ten_don_vi'
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
              className={`font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors`}
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id_don_vi,
                  column: 'ten_don_vi',
                  value: row.ten_don_vi
                })
              }
              title="Double click để sửa"
            >
              {row.ten_don_vi}
            </div>
          )
        }
      },
      {
        uid: 'ten_viet_tat',
        name: 'Tên viết tắt',
        sortable: true,
        width: 120,
        render: (_, row: any) => {
          const isEditing =
            editingCell?.id === row.id_don_vi && editingCell?.column === 'ten_viet_tat'
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
              className={`text-gray-600 cursor-pointer hover:text-blue-600 transition-colors ${!row.ten_viet_tat ? 'text-gray-400 italic' : ''}`}
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id_don_vi,
                  column: 'ten_viet_tat',
                  value: row.ten_viet_tat || ''
                })
              }
              title="Double click để sửa"
            >
              {row.ten_viet_tat || '--'}
            </div>
          )
        }
      },
      {
        uid: 'loai',
        name: 'Loại',
        sortable: true,
        width: 150,
        render: (_, row: any) => {
          const isEditing =
            editingCell?.id === row.id_don_vi && editingCell?.column === 'loai'

          if (isEditing) {
            return (
              <Select
                className="max-w-[200px]"
                size="sm"
                selectedKeys={editingCell.value ? [editingCell.value] : []}
                onChange={(e) => {
                  const val = e.target.value
                  setEditingCell((prev) => (prev ? { ...prev, value: val } : null))
                  if (val && val !== row.loai) {
                    setTimeout(() => {
                      handleFinishEditWithVal(val, 'loai', row.id_don_vi)
                    }, 100)
                  }
                }}
                aria-label="Chọn loại đơn vị"
              >
                {Object.entries(UNIT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key}>
                    {label}
                  </SelectItem>
                ))}
              </Select>
            )
          }

          let color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' =
            'default'
          switch (row.loai) {
            case 'KHOA_BOMON':
              color = 'primary'
              break
            case 'PHONG':
              color = 'success'
              break
            case 'BAN':
              color = 'warning'
              break
            case 'TRUNG_TAM':
              color = 'secondary'
              break
            default:
              color = 'default'
          }
          return (
            <div
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id_don_vi,
                  column: 'loai',
                  value: row.loai
                })
              }
              className="cursor-pointer"
              title="Double click để sửa"
            >
              <Chip size="sm" color={color} variant="flat" className="capitalize">
                {UNIT_TYPE_LABELS[row.loai]}
              </Chip>
            </div>
          )
        }
      },
      {
        uid: 'email',
        name: 'Email',
        sortable: true,
        width: 200,
        render: (_, row: any) => {
          const isEditing =
            editingCell?.id === row.id_don_vi && editingCell?.column === 'email'
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
              className={`text-gray-600 cursor-pointer hover:text-blue-600 transition-colors ${!row.email ? 'text-gray-400 italic' : ''}`}
              onDoubleClick={() =>
                setEditingCell({
                  id: row.id_don_vi,
                  column: 'email',
                  value: row.email || ''
                })
              }
              title="Double click để sửa"
            >
              {row.email || '--'}
            </div>
          )
        }
      },
      {
        uid: 'nguoi_co_quyen_van_thu',
        name: 'Văn thư / Lãnh đạo',
        sortable: false,
        width: 300,
        render: (_, row: any) => {
          const users = row.nguoi_co_quyen_van_thu || []
          if (users.length === 0)
            return <span className="text-gray-400 italic">Chưa có nhân sự</span>

          // Show only first 3 then +N
          const displayUsers = users.slice(0, 3)
          const remaining = users.length - 3

          return (
            <div className="flex flex-col gap-1">
              {displayUsers.map((u: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1 text-xs">
                  <span className="font-medium text-gray-700">{u.ql_nguoi_dung_ho_ten}</span>
                  <span className="text-gray-400">-</span>
                  <span className="text-gray-500 italic">{u.ql_vai_tro_ten}</span>
                </div>
              ))}
              {remaining > 0 && (
                <Tooltip
                  content={
                    <div className="flex flex-col gap-1 p-1">
                      {users.slice(3).map((u: any, idx: number) => (
                        <div key={idx} className="text-xs">
                          <b>{u.ql_nguoi_dung_ho_ten}</b> - {u.ql_vai_tro_ten}
                        </div>
                      ))}
                    </div>
                  }
                >
                  <span className="text-xs text-blue-600 cursor-pointer font-medium">
                    +{remaining} người khác
                  </span>
                </Tooltip>
              )}
            </div>
          )
        }
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
      
      <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            <Input
              type="search"
              placeholder="Tìm kiếm đơn vị..."
              startContent={<Search className="text-gray-500" size={18} />}
              value={typingValue}
              onValueChange={setTypingValue}
              className="w-full md:max-w-[300px]"
              classNames={{ inputWrapper: 'h-8 bg-white border border-gray-200 rounded-lg' }}
              endContent={isFetching && <Spinner size="sm" />}
            />
            <SelectDropdown
              label="Loại đơn vị"
              options={[
                { value: 'all', label: 'Tất cả loại' },
                ...Object.entries(UNIT_TYPE_LABELS).map(([key, label]) => ({
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
            {canCreate && (
              <Button
                color="primary"
                size="sm"
                startContent={<Plus size={18} />}
                className="font-medium"
                onPress={() => onOpenDrawerAdd()}
              >
                Thêm mới
              </Button>
            )}
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
          primaryKey="id_don_vi"
        />

        <DrawerCommon
          title="Thêm đơn vị"
          open={isOpenDrawerAdd}
          onClose={() => {
            onCloseDrawerAdd()
            setFormData({})
          }}
          handleSubmitApi={(_id, data) => DonviAxios.create(data!)}
          formData={formData}
          onSubmitSuccess={() => {
            refetch()
            setFormData({})
          }}
        >
          <FormDonvi formData={formData} setFormData={setFormData} isEdit={false} />
        </DrawerCommon>

        <DrawerCommon
          title="Sửa đơn vị"
          open={isOpenDrawerEdit}
          onClose={() => {
            onCloseDrawerEdit()
            setFormData({})
          }}
          handleSubmitApi={(_id, data) => DonviAxios.update(String(editingId), data!)}
          formData={formData}
          onSubmitSuccess={() => {
            refetch()
            setFormData({})
          }}
        >
          <FormDonvi formData={formData} setFormData={setFormData} />
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

      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content={
          Array.isArray(deletingId)
            ? `Bạn có chắc chắn muốn xóa ${deletingId.length} đơn vị đã chọn không? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa đơn vị này không? Hành động này không thể hoàn tác.'
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
    </div>
  )
}
