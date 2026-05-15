import { Button, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import { hinhthucAxios } from './mockApi'
import DebugBox from '@renderer/components/DebugBox'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery } from '@tanstack/react-query'
import { Edit, Plus, RotateCcw, Search, Trash } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useHinhThucStore } from '@renderer/store/useHinhThucStore'
import { ModalCommon } from '@renderer/components/ModalCommon'
import FormHinhThuc from './components/FormHinhThuc'
import { HrPrimaryButton } from '@renderer/components/hero-custom'
import { toast } from "@heroui-v3/react";
import HistoryDrawer from './components/HistoryDrawer'

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
            const response = await hinhthucAxios.delete(deletingId as string)
            if (response.success) {
                toast('Xóa hình thức thành công', { variant: 'success' })
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
            // Inline edit not supported in backend controller explicitly yet but usually full update works if we just send changed field? 
            // The controller Hinhthuc.php I wrote expects 'ten_hinh_thuc' required.
            // So inline edit might fail if I only send one field. 
            // I should update Hinhthuc.php to allow partial update OR fetch full object here and send it.
            // But creating full edit for inline is safer.
            // For now, let's disable inline editing or support it fully.
            // Easiest is to disable inline edit logic or fetch full object.
            // Actually, my update_post requires 'ten_hinh_thuc'. If I only update 'ma_hinh_thuc', it might fail validation.
            // Let's rely on standard full edit via Drawer for now to be safe, or just implementing full fetch-merge-update.

            // Let's just create drawer edit for now and disable inline edit specific logic if not needed, 
            // but the UI has it. I'll just make sure update handles it.
            // Wait, I didn't valid 'ma_hinh_thuc' as required. 'ten_hinh_thuc' is required.
            // If I edit 'ma_hinh_thuc', I need to send 'ten_hinh_thuc' too.
            // So inline edit needs to fetch the row content first.

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
                                    setEditingId(row.id_hinh_thuc)

                                    const res = await hinhthucAxios.fetch({}, row.id_hinh_thuc)
                                    setFormData({
                                        ten_hinh_thuc: res.data.ten_hinh_thuc,
                                        ma_hinh_thuc: res.data.ma_hinh_thuc,
                                    })
                                    onOpenDrawerEdit()
                                }}
                            >
                                <Edit size={18} />
                            </button>
                        </Tooltip>
                        {/* <Tooltip content="Xóa" color="danger">
                            <button className="text-gray-500 hover:text-red-600" onClick={() => handleDelete(row.id_hinh_thuc)}>
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
                            placeholder="Tìm kiếm hình thức..."
                            startContent={<Search className="text-gray-500" size={18} />}
                            value={typingValue}
                            onValueChange={setTypingValue}
                            className="w-full md:max-w-[400px]"
                            classNames={{ inputWrapper: 'h-10 bg-white border border-gray-200 rounded-md' }}
                            endContent={isFetching && <Spinner size="sm" />}
                        />

<<<<<<< Updated upstream
=======
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
                    title="Thêm hình thức"
                    open={isOpenDrawerAdd}
                    onClose={() => {
                        onCloseDrawerAdd()
                        setFormData({})
                    }}
                    handleSubmitApi={(_id, data) => hinhthucAxios.create(Object.fromEntries(data!))}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch()
                        setFormData({})
                    }}
                >
                    <FormHinhThuc formData={formData} setFormData={setFormData} />
                </ModalCommon>

                <ModalCommon
                    title="Sửa hình thức"
                    open={isOpenDrawerEdit}
                    onClose={() => {
                        onCloseDrawerEdit()
                        setFormData({})
                    }}
                    handleSubmitApi={(_id, data) => hinhthucAxios.update(String(editingId), Object.fromEntries(data!))}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch()
                        setFormData({})
                    }}
                >
                    <FormHinhThuc formData={formData} setFormData={setFormData} />
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
                content="Bạn có chắc chắn muốn xóa hình thức này không? Hành động này không thể hoàn tác."
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
            <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} entityType="hinhthuc" />
        </div>
    )
}
