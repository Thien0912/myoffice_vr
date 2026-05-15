<<<<<<< Updated upstream
﻿import { Button, Input, Spinner, Tooltip, useDisclosure, Divider, Chip } from '@heroui/react'
import { daotaoAxios } from '@renderer/api/danhmuc/daotaoAxios'
=======
﻿import { Button, Chip, Input, Spinner, Tooltip, useDisclosure, Divider } from '@heroui/react'
import { daotaoAxios } from './mockApi'
>>>>>>> Stashed changes
import DebugBox from '@renderer/components/DebugBox'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useQuery } from '@tanstack/react-query'
import { Edit, Plus, RotateCcw, Search, Trash } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useDaoTaoStore } from '@renderer/store/useDaoTaoStore'
import { ModalCommon } from '@renderer/components/ModalCommon'
import FormDaoTao from './components/FormDaoTao'
import moment from 'moment'
import { HrPrimaryButton } from '@renderer/components/hero-custom'
import { toast } from "@heroui-v3/react";
import HistoryDrawer from './components/HistoryDrawer'

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

    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

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
            const response = await daotaoAxios.delete(deletingId as string)
            if (response.success) {
                toast('Xóa khóa đào tạo thành công', { variant: 'success' })
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
                                    setEditingId(row.id_dao_tao)
                                    setFormData({
                                        ten_khoa_hoc: row.ten_khoa_hoc,
                                        noi_dung: row.noi_dung,
                                        ngay_bat_dau: row.ngay_bat_dau,
                                        ngay_ket_thuc: row.ngay_ket_thuc,
                                        trang_thai: row.trang_thai,
                                    })
                                    onOpenDrawerEdit()
                                }}
                            >
                                <Edit size={18} />
                            </button>
                        </Tooltip>
                        {/* <Tooltip content="Xóa" color="danger">
                            <button className="text-gray-500 hover:text-red-600" onClick={() => handleDelete(row.id_dao_tao)}>
                                <Trash size={18} />
                            </button>
                        </Tooltip> */}
                    </div>
                )
            }
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
        <div className="flex flex-col gap-4 h-[calc(100vh-180px)]">
            <DebugBox />
            <div className="bg-slate-50">
                <div className="p-3 flex flex-col md:flex-row items-center justify-between gap-2 bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                        <Input
                            type="search"
                            placeholder="Tìm kiếm khóa đào tạo..."
                            startContent={<Search className="text-gray-500" size={18} />}
                            value={typingValue}
                            onValueChange={setTypingValue}
                            className="w-full md:max-w-[400px]"
                            classNames={{ inputWrapper: 'h-10 bg-white border border-gray-200 rounded-md' }}
                            endContent={isFetching && <Spinner size="sm" />}
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
                            onPress={() => {
                                setFormData({ trang_thai: 'Dang_dien_ra' })
                                onOpenDrawerAdd()
                            }}
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
                            onPress={() => {
                                setFormData({ trang_thai: 'Dang_dien_ra' })
                                onOpenDrawerAdd()
                            }}
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
                </ModalCommon>

                <ModalCommon
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
                content="Bạn có chắc chắn muốn xóa khóa đào tạo này không? Hành động này không thể hoàn tác."
                isDanger={true}
            />
            <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} entityType="daotao" />
        </div>
    )
}
