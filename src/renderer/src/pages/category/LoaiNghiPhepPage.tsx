import { Button, Chip, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import { LoaiNghiPhepAxios } from '@renderer/api/danhmuc/loaiNghiPhepAxios'
import DebugBox from '@renderer/components/DebugBox'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useLoaiNghiPhepStore } from '@renderer/store/useLoaiNghiPhepStore'
import { DrawerCommon } from '@renderer/components/DrawerCommon'
import FormLoaiNghiPhep from './components/FormLoaiNghiPhep'
import { toast } from "@heroui-v3/react";

export default function LoaiNghiPhepPage() {
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
    } = useLoaiNghiPhepStore()

    const [recordsTotal, setRecordsTotal] = useState(0)
    const [recordsFiltered, setRecordsFiltered] = useState(0)
    const [isResetting, setIsResetting] = useState(false)
    const [typingValue, setTypingValue] = useState(filters.searchValue)
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

    // Confirm Modal State
    const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
    const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

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
        queryKey: ['loainghiphepData', filters, sortDescriptors],
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
            const response = await LoaiNghiPhepAxios.fetch(payload)
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
        return responseData.data.filter((row: any) => selectedKeys.has(String(row.id_loai_phep)))
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
                    ma_loai_phep: row.ma_loai_phep,
                    ten_loai_phep: row.ten_loai_phep + ' (Copy)',
                    so_ngay_mac_dinh: row.so_ngay_mac_dinh,
                    co_tinh_luong: row.co_tinh_luong,
                    ghi_chu: row.ghi_chu,
                }
                return LoaiNghiPhepAxios.create(payload)
            })
            const results = await Promise.all(promises)
            const allSuccess = results.every((r: any) => r.success)
            if (allSuccess) {
                toast(`Sao chép thành công ${selectedRows.length} loại nghỉ phép`, { variant: 'success' })
                setSelectedKeys(new Set())
                refetch()
            } else {
                toast('Một số loại nghỉ phép sao chép thất bại', { variant: 'danger' })
            }
        } catch (error) {
            toast('Có lỗi xảy ra khi sao chép', { variant: 'danger' })
        }
    }

    const handleOpenEdit = async () => {
        if (selectedRows.length !== 1) return
        const row = selectedRows[0]
        setEditingId(row.id_loai_phep)
        try {
            const detail = await LoaiNghiPhepAxios.fetch({}, row.id_loai_phep)
            if (detail.success && detail.data) {
                setFormData({
                    ma_loai_phep: detail.data.ma_loai_phep || '',
                    ten_loai_phep: detail.data.ten_loai_phep || '',
                    so_ngay_mac_dinh: detail.data.so_ngay_mac_dinh || 0,
                    co_tinh_luong: detail.data.co_tinh_luong ?? 1,
                    ghi_chu: detail.data.ghi_chu || ''
                })
            } else {
                setFormData({
                    ma_loai_phep: row.ma_loai_phep || '',
                    ten_loai_phep: row.ten_loai_phep || '',
                    so_ngay_mac_dinh: row.so_ngay_mac_dinh || 0,
                    co_tinh_luong: row.co_tinh_luong ?? 1,
                    ghi_chu: row.ghi_chu || ''
                })
            }
        } catch {
            setFormData({
                ma_loai_phep: row.ma_loai_phep || '',
                ten_loai_phep: row.ten_loai_phep || '',
                so_ngay_mac_dinh: row.so_ngay_mac_dinh || 0,
                co_tinh_luong: row.co_tinh_luong ?? 1,
                ghi_chu: row.ghi_chu || ''
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
                ids.map((id) => LoaiNghiPhepAxios.delete(String(id)))
            )
            const failed = results.filter((r: any) => !r.success)
            if (failed.length === 0) {
                toast(`Xóa thành công ${ids.length} loại nghỉ phép`, { variant: 'success' })
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
                uid: 'ma_loai_phep',
                name: 'Mã loại',
                sortable: true,
                width: 150,
                render: (_, row: any) => (
                    <div className="font-medium text-blue-600">{row.ma_loai_phep}</div>
                )
            },
            {
                uid: 'ten_loai_phep',
                name: 'Tên loại nghỉ phép',
                sortable: true,
                width: 300,
                render: (_, row: any) => (
                    <div className="font-semibold text-gray-700">{row.ten_loai_phep}</div>
                )
            },
            {
                uid: 'so_ngay_mac_dinh',
                name: 'Số ngày mặc định',
                sortable: true,
                width: 150,
                className: 'text-center',
                render: (_, row: any) => (
                    <div className="font-medium">{row.so_ngay_mac_dinh || 0} ngày</div>
                )
            },
            {
                uid: 'co_tinh_luong',
                name: 'Tính lương',
                sortable: true,
                width: 150,
                className: 'text-center',
                render: (_, row: any) => (
                    <Chip
                        variant="flat"
                        color={row.co_tinh_luong == 1 ? 'success' : 'warning'}
                        size="sm"
                        className="font-medium"
                    >
                        {row.co_tinh_luong == 1 ? 'Có tính lương' : 'Không tính lương'}
                    </Chip>
                )
            },
            {
                uid: 'ghi_chu',
                name: 'Ghi chú',
                sortable: false,
                width: 250,
                render: (_, row: any) => (
                    <div className="text-sm text-gray-500 truncate max-w-[200px]" title={row.ghi_chu}>
                        {row.ghi_chu || '--'}
                    </div>
                )
            },
            ]
    }, [responseData])

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
                            placeholder="Tìm kiếm loại nghỉ phép..."
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
                    primaryKey="id_loai_phep"
                />

                <DrawerCommon
                    title="Thêm loại nghỉ phép"
                    open={isOpenDrawerAdd}
                    onClose={() => {
                        onCloseDrawerAdd()
                        setFormData({})
                    }}
                    handleSubmitApi={(_id, data) => LoaiNghiPhepAxios.create(data!)}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch()
                        setFormData({})
                    }}
                >
                    <FormLoaiNghiPhep formData={formData} setFormData={setFormData} />
                </DrawerCommon>

                <DrawerCommon
                    title="Sửa loại nghỉ phép"
                    open={isOpenDrawerEdit}
                    onClose={() => {
                        onCloseDrawerEdit()
                        setFormData({})
                    }}
                    handleSubmitApi={(_id, data) => LoaiNghiPhepAxios.update(String(editingId), data!)}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch()
                        setFormData({})
                    }}
                >
                    <FormLoaiNghiPhep formData={formData} setFormData={setFormData} />
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
                        ? `Bạn có chắc chắn muốn xóa ${deletingId.length} loại nghỉ phép đã chọn không? Hành động này không thể hoàn tác.`
                        : 'Bạn có chắc chắn muốn xóa loại nghỉ phép này không? Hành động này không thể hoàn tác.'
                }
                isDanger={true}
            />
        </div>
    )
}
