import { Button, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import { baomatAxios } from './mockApi'
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
import { useBaoMatStore } from '@renderer/store/useBaoMatStore'
import { CategoryModal } from './components/CategoryModal'
import FormBaoMat from './components/FormBaoMat'
import { toast } from "@heroui-v3/react";

export default function BaoMatPage() {
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
    } = useBaoMatStore()

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
        queryKey: ['baomatData', filters, sortDescriptors],
        queryFn: async () => {
            const payload = {
                searchValue: filters.searchValue,
                start: (filters.page - 1) * filters.length,
                length: filters.length,
                order: sortDescriptors.map((desc) => ({
                    column: desc.column,
                    dir: desc.direction === 'ascending' ? 'asc' : 'desc'
                })),
            }
            const response = await baomatAxios.fetch(payload)
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
        return responseData.data.filter((row: any) => selectedKeys.has(String(row.id_bao_mat)))
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
                    ten_bao_mat: row.ten_bao_mat + ' (Copy)',
                    class_color: row.class_color,
                }
                return baomatAxios.create(payload)
            })
            const results = await Promise.all(promises)
            const allSuccess = results.every((r: any) => r.success)
            if (allSuccess) {
                toast(`Sao chép thành công ${selectedRows.length} mức độ bảo mật`, { variant: 'success' })
                setSelectedKeys(new Set())
                refetch(); queryClient.invalidateQueries({ queryKey: ["count"] })
            } else {
                toast('Một số mức độ bảo mật sao chép thất bại', { variant: 'danger' })
            }
        } catch (error) {
            toast('Có lỗi xảy ra khi sao chép', { variant: 'danger' })
        }
    }

    const handleOpenEdit = async () => {
        if (selectedRows.length !== 1) return
        const row = selectedRows[0]
        setEditingId(row.id_bao_mat)
        try {
            const detail = await baomatAxios.fetch({}, row.id_bao_mat)
            if (detail.success && detail.data) {
                setFormData({
                    ten_bao_mat: detail.data.ten_bao_mat || '',
                    class_color: detail.data.class_color || ''
                })
            } else {
                setFormData({
                    ten_bao_mat: row.ten_bao_mat || '',
                    class_color: row.class_color || ''
                })
            }
        } catch {
            setFormData({
                ten_bao_mat: row.ten_bao_mat || '',
                class_color: row.class_color || ''
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
                ids.map((id) => baomatAxios.delete(String(id)))
            )
            const failed = results.filter((r: any) => !r.success)
            if (failed.length === 0) {
                toast(`Xóa thành công ${ids.length} mức độ bảo mật`, { variant: 'success' })
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
            (r: any) => r.id_bao_mat === editingCell.id
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
            const currentRow = responseData?.data.find(
                (r: any) => r.id_bao_mat === pendingEdit.id
            )

            const payload = {
                ten_bao_mat: currentRow.ten_bao_mat,
                class_color: currentRow.class_color,
                [pendingEdit.column]: pendingEdit.value
            }

            const response = await baomatAxios.update(pendingEdit.id, payload)
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
                uid: 'ten_bao_mat',
                name: 'Tên bảo mật',
                sortable: true,
                width: 350,
                render: (_, row: any) => {
                    const isEditing =
                        editingCell?.id === row.id_bao_mat && editingCell?.column === 'ten_bao_mat'
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
                            className={`font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors ${!row.ten_bao_mat ? 'text-gray-400 italic' : ''}`}
                            onDoubleClick={() =>
                                setEditingCell({
                                    id: row.id_bao_mat,
                                    column: 'ten_bao_mat',
                                    value: row.ten_bao_mat
                                })
                            }
                            title="Double click để sửa"
                        >
                            {row.ten_bao_mat}
                        </div>
                    )
                }
            },
            {
                uid: 'class_color',
                name: 'Màu sắc (Class)',
                sortable: true,
                width: 200,
                render: (_, row: any) => {
                    const isEditing =
                        editingCell?.id === row.id_bao_mat && editingCell?.column === 'class_color'
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
                            className={`cursor-pointer hover:text-blue-600 transition-colors ${!row.class_color ? 'text-gray-400 italic' : ''}`}
                            onDoubleClick={() =>
                                setEditingCell({
                                    id: row.id_bao_mat,
                                    column: 'class_color',
                                    value: row.class_color || ''
                                })
                            }
                            title="Double click để sửa"
                        >
                            <div className='flex items-center gap-2'>
                                {row.class_color && <span className={`inline-block w-4 h-4 rounded-full ${row.class_color.replace('text-', 'bg-')}`}></span>}
                                <span>{row.class_color || '--'}</span>
                            </div>
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
                            placeholder="Tìm kiếm mức độ bảo mật..."
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
                    primaryKey="id_bao_mat"
                />

                <CategoryModal
                    isOpen={isOpenDrawerAdd}
                    onOpenChange={(open) => { if (!open) {
                        onCloseDrawerAdd()
                        setFormData({})
                    } }}
                    title="Thêm mức độ bảo mật"
                    handleSubmitApi={(_id, data) => baomatAxios.create(data!)}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch(); queryClient.invalidateQueries({ queryKey: ["count"] })
                        setFormData({})
                    }}
                >
                    <FormBaoMat formData={formData} setFormData={setFormData} />
                </CategoryModal>

                <CategoryModal
                    isOpen={isOpenDrawerEdit}
                    onOpenChange={(open) => { if (!open) {
                        onCloseDrawerEdit()
                        setFormData({})
                    } }}
                    title="Sửa mức độ bảo mật"
                    handleSubmitApi={(_id, data) => baomatAxios.update(String(editingId), data!)}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch(); queryClient.invalidateQueries({ queryKey: ["count"] })
                        setFormData({})
                    }}
                >
                    <FormBaoMat formData={formData} setFormData={setFormData} />
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
                        ? `Bạn có chắc chắn muốn xóa ${deletingId.length} mức độ bảo mật đã chọn không? Hành động này không thể hoàn tác.`
                        : 'Bạn có chắc chắn muốn xóa mức độ bảo mật này không? Hành động này không thể hoàn tác.'
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
                entityKey="baomat"
            />
        </div>
    )
}
