import { Button, Chip, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import { daotaoAxios } from '@renderer/api/danhmuc/daotaoAxios'
import DebugBox from '@renderer/components/DebugBox'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useDaoTaoStore } from '@renderer/store/useDaoTaoStore'
import { DrawerCommon } from '@renderer/components/DrawerCommon'
import FormDaoTao from './components/FormDaoTao'
import moment from 'moment'
import { toast } from "@heroui-v3/react";

export default function DaoTaoPage() {
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
    } = useDaoTaoStore()

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
        queryKey: ['daotaoData', filters, sortDescriptors],
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
            const response = await daotaoAxios.fetch(payload)
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
        return responseData.data.filter((row: any) => selectedKeys.has(String(row.id_dao_tao)))
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
                    ten_khoa_hoc: row.ten_khoa_hoc + ' (Copy)',
                    noi_dung: row.noi_dung,
                    ngay_bat_dau: row.ngay_bat_dau,
                    ngay_ket_thuc: row.ngay_ket_thuc,
                    trang_thai: row.trang_thai,
                }
                return daotaoAxios.create(payload)
            })
            const results = await Promise.all(promises)
            const allSuccess = results.every((r: any) => r.success)
            if (allSuccess) {
                toast(`Sao chép thành công ${selectedRows.length} khóa đào tạo`, { variant: 'success' })
                setSelectedKeys(new Set())
                refetch()
            } else {
                toast('Một số khóa đào tạo sao chép thất bại', { variant: 'danger' })
            }
        } catch (error) {
            toast('Có lỗi xảy ra khi sao chép', { variant: 'danger' })
        }
    }

    const handleOpenEdit = async () => {
        if (selectedRows.length !== 1) return
        const row = selectedRows[0]
        setEditingId(row.id_dao_tao)
        try {
            const detail = await daotaoAxios.show(row.id_dao_tao)
            if (detail.success && detail.data) {
                setFormData({
                    ten_khoa_hoc: detail.data.ten_khoa_hoc || '',
                    noi_dung: detail.data.noi_dung || '',
                    ngay_bat_dau: detail.data.ngay_bat_dau || '',
                    ngay_ket_thuc: detail.data.ngay_ket_thuc || '',
                    trang_thai: detail.data.trang_thai || 'Dang_dien_ra'
                })
            } else {
                setFormData({
                    ten_khoa_hoc: row.ten_khoa_hoc || '',
                    noi_dung: row.noi_dung || '',
                    ngay_bat_dau: row.ngay_bat_dau || '',
                    ngay_ket_thuc: row.ngay_ket_thuc || '',
                    trang_thai: row.trang_thai || 'Dang_dien_ra'
                })
            }
        } catch {
            setFormData({
                ten_khoa_hoc: row.ten_khoa_hoc || '',
                noi_dung: row.noi_dung || '',
                ngay_bat_dau: row.ngay_bat_dau || '',
                ngay_ket_thuc: row.ngay_ket_thuc || '',
                trang_thai: row.trang_thai || 'Dang_dien_ra'
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
                ids.map((id) => daotaoAxios.delete(String(id)))
            )
            const failed = results.filter((r: any) => !r.success)
            if (failed.length === 0) {
                toast(`Xóa thành công ${ids.length} khóa đào tạo`, { variant: 'success' })
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
                pinned: 'left',
                render: (_: unknown, __: unknown, index?: number) => (filters.page - 1) * filters.length + (index || 0) + 1
            },
            {
                uid: 'ten_khoa_hoc',
                name: 'Tên khóa học',
                sortable: true,
                width: 250,
                render: (_, row: any) => (
                    <div className="font-semibold text-gray-700">
                        {row.ten_khoa_hoc}
                    </div>
                )
            },
            {
                uid: 'noi_dung',
                name: 'Nội dung',
                sortable: true,
                width: 300,
                render: (_, row: any) => (
                    <div className="text-gray-600 line-clamp-2" title={row.noi_dung}>
                        {row.noi_dung}
                    </div>
                )
            },
            {
                uid: 'ngay_bat_dau',
                name: 'Ngày bắt đầu',
                sortable: true,
                width: 150,
                render: (_, row: any) => row.ngay_bat_dau ? moment(row.ngay_bat_dau).format('DD/MM/YYYY') : '--'
            },
            {
                uid: 'ngay_ket_thuc',
                name: 'Ngày kết thúc',
                sortable: true,
                width: 150,
                render: (_, row: any) => row.ngay_ket_thuc ? moment(row.ngay_ket_thuc).format('DD/MM/YYYY') : '--'
            },
            {
                uid: 'trang_thai',
                name: 'Trạng thái',
                sortable: true,
                width: 150,
                render: (_, row: any) => {
                    const isHoanThanh = row.trang_thai === 'Hoan_thanh'
                    return (
                        <Chip
                            color={isHoanThanh ? 'success' : 'warning'}
                            variant="flat"
                            size="sm"
                        >
                            {isHoanThanh ? 'Hoàn thành' : 'Đang diễn ra'}
                        </Chip>
                    )
                }
            },
            ]
    }, [responseData, filters.page, filters.length])

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
                            placeholder="Tìm kiếm khóa đào tạo..."
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
                            onPress={() => {
                                setFormData({ trang_thai: 'Dang_dien_ra' })
                                onOpenDrawerAdd()
                            }}
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
                    primaryKey="id_dao_tao"
                />

                <DrawerCommon
                    title="Thêm khóa đào tạo"
                    open={isOpenDrawerAdd}
                    onClose={() => {
                        onCloseDrawerAdd()
                        setFormData({})
                    }}
                    handleSubmitApi={(_id, data) => daotaoAxios.create(Object.fromEntries(data!))}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch()
                        setFormData({})
                    }}
                >
                    <FormDaoTao formData={formData} setFormData={setFormData} />
                </DrawerCommon>

                <DrawerCommon
                    title="Sửa khóa đào tạo"
                    open={isOpenDrawerEdit}
                    onClose={() => {
                        onCloseDrawerEdit()
                        setFormData({})
                    }}
                    handleSubmitApi={(_id, data) => daotaoAxios.update(String(editingId), Object.fromEntries(data!))}
                    formData={formData}
                    onSubmitSuccess={() => {
                        refetch()
                        setFormData({})
                    }}
                >
                    <FormDaoTao formData={formData} setFormData={setFormData} />
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
                        ? `Bạn có chắc chắn muốn xóa ${deletingId.length} khóa đào tạo đã chọn không? Hành động này không thể hoàn tác.`
                        : 'Bạn có chắc chắn muốn xóa khóa đào tạo này không? Hành động này không thể hoàn tác.'
                }
                isDanger={true}
            />
        </div>
    )
}
