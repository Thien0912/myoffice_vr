import { Button, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import { coquanAxios } from './mockApi'
import DebugBox from '@renderer/components/DebugBox'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery } from '@tanstack/react-query'
import { Edit, Plus, RotateCcw, Search, Trash } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useCoQuanStore } from '@renderer/store/useCoQuanStore'
<<<<<<< Updated upstream
=======
import { ModalCommon } from '@renderer/components/ModalCommon'
import FormCoQuan from './components/FormCoQuan'
import { HrPrimaryButton } from '@renderer/components/hero-custom'
>>>>>>> Stashed changes
import { toast } from "@heroui-v3/react";
import HistoryDrawer from './components/HistoryDrawer'

export default function CoQuanPage() {
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
    } = useCoQuanStore()

    const [recordsTotal, setRecordsTotal] = useState(0)
    const [recordsFiltered, setRecordsFiltered] = useState(0)
    const [isResetting, setIsResetting] = useState(false)
    const [typingValue, setTypingValue] = useState(filters.searchValue)

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

    // State for Quick Add
    const [newName, setNewName] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    const {
        data: responseData,
        isLoading: isLoading,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ['coquanData', filters, sortDescriptors],
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
            const response = await coquanAxios.fetch(payload)
            return response
        }
    })

    const handleCreate = async () => {
        if (!newName.trim()) {
            toast('Vui lòng nhập tên cơ quan', { variant: 'warning' })
            return
        }
        setIsAdding(true)
        try {
            const response = await coquanAxios.create({ ten_co_quan: newName.trim() })
            if (response.success) {
                toast('Thêm cơ quan thành công', { variant: 'success' })
                setNewName('')
                refetch()
            } else {
                toast(response.message || 'Thêm thất bại', { variant: 'danger' })
            }
        } catch (error) {
            toast('Có lỗi xảy ra', { variant: 'danger' })
        } finally {
            setIsAdding(false)
        }
    }

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
            const response = await coquanAxios.delete(deletingId as string)
            if (response.success) {
                toast('Xóa cơ quan thành công', { variant: 'success' })
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
            (r: any) => r.id_co_quan === editingCell.id
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
            const response = await coquanAxios.update(pendingEdit.id, {
                ten_co_quan: pendingEdit.value
            })
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
                uid: 'ten_co_quan',
                name: 'Tên cơ quan',
                sortable: true,
                width: 550,
                render: (_, row: any) => {
                    const isEditing =
                        editingCell?.id === row.id_co_quan && editingCell?.column === 'ten_co_quan'
                    return isEditing ? (
                        <Input
                            autoFocus
                            size="sm"
                            variant="flat"
                            value={editingCell.value}
                            onValueChange={(val) =>
                                setEditingCell((prev) => (prev ? { ...prev, value: val } : null))
                            }
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleFinishEdit()
                                if (e.key === 'Escape') setEditingCell(null)
                            }}
                            onBlur={handleFinishEdit}
                            classNames={{ input: 'text-sm font-semibold' }}
                        />
                    ) : (
                        <div
                            className={`font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors ${!row.ten_co_quan ? 'text-gray-400 italic' : ''}`}
                            onDoubleClick={() =>
                                setEditingCell({
                                    id: row.id_co_quan,
                                    column: 'ten_co_quan',
                                    value: row.ten_co_quan
                                })
                            }
                            title="Double click để sửa"
                        >
                            {row.ten_co_quan}
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
                        {/* <Tooltip content="Chỉnh sửa">
                            <button
                                className="text-gray-500 hover:text-blue-600"
                                onClick={() => {
                                    setEditingCell({
                                        id: row.id_co_quan,
                                        column: 'ten_co_quan',
                                        value: row.ten_co_quan
                                    })
                                }}
                            >
                                <Edit size={18} />
                            </button>
                        </Tooltip> */}
                        <Tooltip content="Xóa" color="danger">
                            <button className="text-gray-500 hover:text-red-600" onClick={() => handleDelete(row.id_co_quan)}>
                                <Trash size={18} />
                            </button>
                        </Tooltip>
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
                            placeholder="Tìm kiếm cơ quan..."
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

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-blue-50/50 p-1 px-2 rounded-lg border border-blue-100">
                            <Input
                                size="sm"
                                variant="underlined"
                                placeholder="Tên cơ quan mới..."
                                value={newName}
                                onValueChange={setNewName}
                                className="w-[200px]"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreate()
                                }}
                                classNames={{
                                    input: 'text-sm font-medium',
                                    inputWrapper: 'h-8 px-1'
                                }}
                            />
                            <Tooltip content="Thêm cơ quan">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    color="primary"
                                    variant="flat"
                                    className="min-w-8 w-8 h-8"
                                    onClick={handleCreate}
                                    isLoading={isAdding}
                                >
                                    <Plus size={16} />
                                </Button>
                            </Tooltip>
                        </div>

                        <Divider orientation="vertical" className="h-6" />

                        <Tooltip content="Tải lại dữ liệu">
                            <Button isIconOnly variant="light" onClick={handleResetTable} isLoading={isResetting}>
                                <RotateCcw size={18} className="text-gray-600" />
                            </Button>
                        </Tooltip>
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
<<<<<<< Updated upstream
=======

                <ModalCommon
                    title="Thêm cơ quan"
                    open={isOpenDrawerAdd}
                    onClose={() => {
                        onCloseDrawerAdd()
                        setFormData({})
                    }}
                    handleSubmitApi={(_id, data) => coquanAxios.create(Object.fromEntries(data!))}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch()
                        setFormData({})
                    }}
                >
                    <FormCoQuan formData={formData} setFormData={setFormData} />
                </ModalCommon>

                <ModalCommon
                    title="Sửa cơ quan"
                    open={isOpenDrawerEdit}
                    onClose={() => {
                        onCloseDrawerEdit()
                        setFormData({})
                    }}
                    handleSubmitApi={(_id, data) => coquanAxios.update(String(editingId), Object.fromEntries(data!))}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch()
                        setFormData({})
                    }}
                >
                    <FormCoQuan formData={formData} setFormData={setFormData} />
                </ModalCommon>
>>>>>>> Stashed changes
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
                content="Bạn có chắc chắn muốn xóa cơ quan này không? Hành động này không thể hoàn tác."
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
            <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} entityType="coquan" />
        </div>
    )
}
