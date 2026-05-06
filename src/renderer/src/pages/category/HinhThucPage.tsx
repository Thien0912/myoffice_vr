import { Button, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import { hinhthucAxios } from '@renderer/api/danhmuc/hinhthucAxios'
import DebugBox from '@renderer/components/DebugBox'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useHinhThucStore } from '@renderer/store/useHinhThucStore'
import { DrawerCommon } from '@renderer/components/DrawerCommon'
import FormHinhThuc from './components/FormHinhThuc'
import { toast } from "@heroui-v3/react";

export default function HinhThucPage() {
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
    } = useHinhThucStore()

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

    const {
        data: responseData,
        isLoading: isLoading,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ['hinhthucData', filters, sortDescriptors],
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
            const response = await hinhthucAxios.fetch(payload)
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
        return responseData.data.filter((row: any) => selectedKeys.has(String(row.id_hinh_thuc)))
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
                    ten_hinh_thuc: row.ten_hinh_thuc + ' (Copy)',
                    ma_hinh_thuc: row.ma_hinh_thuc,
                }
                return hinhthucAxios.create(payload)
            })
            const results = await Promise.all(promises)
            const allSuccess = results.every((r: any) => r.success)
            if (allSuccess) {
                toast(`Sao chép thành công ${selectedRows.length} hình thức`, { variant: 'success' })
                setSelectedKeys(new Set())
                refetch()
            } else {
                toast('Một số hình thức sao chép thất bại', { variant: 'danger' })
            }
        } catch (error) {
            toast('Có lỗi xảy ra khi sao chép', { variant: 'danger' })
        }
    }

    const handleOpenEdit = async () => {
        if (selectedRows.length !== 1) return
        const row = selectedRows[0]
        setEditingId(row.id_hinh_thuc)
        try {
            const detail = await hinhthucAxios.fetch({}, row.id_hinh_thuc)
            if (detail.success && detail.data) {
                setFormData({
                    ten_hinh_thuc: detail.data.ten_hinh_thuc || '',
                    ma_hinh_thuc: detail.data.ma_hinh_thuc || ''
                })
            } else {
                setFormData({
                    ten_hinh_thuc: row.ten_hinh_thuc || '',
                    ma_hinh_thuc: row.ma_hinh_thuc || ''
                })
            }
        } catch {
            setFormData({
                ten_hinh_thuc: row.ten_hinh_thuc || '',
                ma_hinh_thuc: row.ma_hinh_thuc || ''
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
                ids.map((id) => hinhthucAxios.delete(String(id)))
            )
            const failed = results.filter((r: any) => !r.success)
            if (failed.length === 0) {
                toast(`Xóa thành công ${ids.length} hình thức`, { variant: 'success' })
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

        const currentRow = responseData?.data.find(
            (r: any) => r.id_hinh_thuc === editingCell.id
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
                (r: any) => r.id_hinh_thuc === pendingEdit.id
            )

            const payload = {
                ten_hinh_thuc: currentRow.ten_hinh_thuc,
                ma_hinh_thuc: currentRow.ma_hinh_thuc,
                [pendingEdit.column]: pendingEdit.value
            }

            const response = await hinhthucAxios.update(pendingEdit.id, payload)
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
                uid: 'ten_hinh_thuc',
                name: 'Tên hình thức',
                sortable: true,
                width: 350,
                render: (_, row: any) => {
                    const isEditing =
                        editingCell?.id === row.id_hinh_thuc && editingCell?.column === 'ten_hinh_thuc'
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
                            className={`font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors ${!row.ten_hinh_thuc ? 'text-gray-400 italic' : ''}`}
                            onDoubleClick={() =>
                                setEditingCell({
                                    id: row.id_hinh_thuc,
                                    column: 'ten_hinh_thuc',
                                    value: row.ten_hinh_thuc
                                })
                            }
                            title="Double click để sửa"
                        >
                            {row.ten_hinh_thuc}
                        </div>
                    )
                }
            },
            {
                uid: 'ma_hinh_thuc',
                name: 'Mã hình thức',
                sortable: true,
                width: 200,
                render: (_, row: any) => {
                    const isEditing =
                        editingCell?.id === row.id_hinh_thuc && editingCell?.column === 'ma_hinh_thuc'
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
                            className={`text-gray-700 cursor-pointer hover:text-blue-600 transition-colors ${!row.ma_hinh_thuc ? 'text-gray-400 italic' : ''}`}
                            onDoubleClick={() =>
                                setEditingCell({
                                    id: row.id_hinh_thuc,
                                    column: 'ma_hinh_thuc',
                                    value: row.ma_hinh_thuc || ''
                                })
                            }
                            title="Double click để sửa"
                        >
                            {row.ma_hinh_thuc || '--'}
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
                        placeholder="Tìm kiếm hình thức..."
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
                        color="primary"
                        size="sm"
                        startContent={<Plus size={18} />}
                        className="font-medium"
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
                    primaryKey="id_hinh_thuc"
                />

                <DrawerCommon
                    title="Thêm hình thức"
                    open={isOpenDrawerAdd}
                    onClose={() => {
                        onCloseDrawerAdd()
                        setFormData({})
                    }}
                    handleSubmitApi={(_id, data) => hinhthucAxios.create(data!)}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch()
                        setFormData({})
                    }}
                >
                    <FormHinhThuc formData={formData} setFormData={setFormData} />
                </DrawerCommon>

                <DrawerCommon
                    title="Sửa hình thức"
                    open={isOpenDrawerEdit}
                    onClose={() => {
                        onCloseDrawerEdit()
                        setFormData({})
                    }}
                    handleSubmitApi={(_id, data) => hinhthucAxios.update(String(editingId), data!)}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch()
                        setFormData({})
                    }}
                >
                    <FormHinhThuc formData={formData} setFormData={setFormData} />
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
                        ? `Bạn có chắc chắn muốn xóa ${deletingId.length} hình thức đã chọn không? Hành động này không thể hoàn tác.`
                        : 'Bạn có chắc chắn muốn xóa hình thức này không? Hành động này không thể hoàn tác.'
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
