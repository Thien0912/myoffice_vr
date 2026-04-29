import { Modal, toast } from '@heroui-v3/react'
import { Button, Chip, Divider, Input, Spinner, Tooltip, useDisclosure } from '@heroui/react'
import { loaiDeXuatAxios } from '@renderer/api/hr/loaiDeXuatAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { DrawerCommon } from '@renderer/components/DrawerCommon'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useLoaiDeXuatStore } from '@renderer/store/useLoaiDeXuatStore'
import { useQuery } from '@tanstack/react-query'
import { Edit, Plus, RotateCcw, Search, Trash, History } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import FormLoaiDeXuat from './FormLoaiDeXuat'
import DrawerLichSuChung from '@renderer/components/DrawerLichSuChung'

const CHON_DON_VI_LABELS: Record<
    number,
    {
        label: string
        color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
    }
> = {
    0: { label: 'Không cần chọn', color: 'default' },
    1: { label: 'Bắt buộc chọn', color: 'primary' },
    2: { label: 'Có hoặc không', color: 'warning' }
}

type LoaiDeXuatModalProps = {
    isOpen: boolean
    onClose: () => void
}

export default function LoaiDeXuatModal({ isOpen, onClose }: LoaiDeXuatModalProps) {
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
    } = useLoaiDeXuatStore()

    const [recordsTotal, setRecordsTotal] = useState(0)
    const [recordsFiltered, setRecordsFiltered] = useState(0)
    const [isResetting, setIsResetting] = useState(false)
    const [typingValue, setTypingValue] = useState(filters.searchValue)
    const [formData, setFormData] = useState<Record<string, any>>({ chon_don_vi: '0' })
    const [editingId, setEditingId] = useState<string | number | null>(null)
    const [deletingId, setDeletingId] = useState<string | number | null>(null)
    // Track request ID để tránh race condition khi show() resolve muộn
    const editRequestRef = useRef(0)

    const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()
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
        isOpen: isOpenHistory,
        onClose: onCloseHistory,
        onOpen: onOpenHistory
    } = useDisclosure()

    const {
        data: responseData,
        isLoading,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ['loaiDeXuatData', filters, sortDescriptors],
        queryFn: async () => {
            const payload = {
                searchValue: filters.searchValue,
                start: (filters.page - 1) * filters.length,
                length: filters.length,
                order: sortDescriptors.map((desc) => ({
                    column: desc.column,
                    dir: desc.direction === 'ascending' ? 'asc' : 'desc'
                }))
            }
            return loaiDeXuatAxios.fetch(payload)
        },
        enabled: isOpen
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
        setTimeout(() => setIsResetting(false), 500)
    }

    const handleDelete = (id: string | number) => {
        setDeletingId(id)
        onOpenConfirm()
    }

    const onConfirmDelete = async () => {
        if (!deletingId) return
        try {
            const response = await loaiDeXuatAxios.delete(deletingId)
            if (response.success) {
                toast('Xóa loại đề xuất thành công', { variant: 'success' })
                refetch()
            } else {
                toast(response.message || 'Xóa thất bại', { variant: 'danger' })
            }
        } catch {
            toast('Có lỗi xảy ra', { variant: 'danger' })
        } finally {
            onCloseConfirm()
            setDeletingId(null)
        }
    }

    const allColumns: TableColumnType[] = useMemo(
        () => [
            {
                uid: 'stt',
                name: '#',
                sortable: false,
                width: 50,
                className: 'text-center w-10 p-0 font-bold',
                pinned: 'left'
            },
            {
                uid: 'ma_loai',
                name: 'Mã loại',
                sortable: true,
                width: 130,
                render: (_, row: any) => (
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-semibold text-gray-700 dark:text-gray-300">
                        {row.ma_loai}
                    </span>
                )
            },
            {
                uid: 'ten_loai',
                name: 'Tên loại đề xuất',
                sortable: true,
                width: 260,
                render: (_, row: any) => (
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{row.ten_loai}</span>
                )
            },
            {
                uid: 'chon_don_vi',
                name: 'Chọn đơn vị',
                sortable: false,
                width: 160,
                className: 'text-center',
                render: (_, row: any) => {
                    const cfg = CHON_DON_VI_LABELS[row.chon_don_vi] || CHON_DON_VI_LABELS[0]
                    return (
                        <Chip size="sm" color={cfg.color} variant="flat" className="text-xs">
                            {cfg.label}
                        </Chip>
                    )
                }
            },
            {
                uid: 'mo_ta',
                name: 'Mô tả',
                sortable: false,
                width: 280,
                render: (_, row: any) => (
                    <span className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                        {row.mo_ta || '--'}
                    </span>
                )
            },
            {
                uid: 'actions',
                name: 'Thao tác',
                sortable: false,
                width: 90,
                pinned: 'right',
                className: 'text-center',
                render: (_, row: any) => (
                    <div className="flex items-center justify-center gap-1">
                        <Tooltip content="Chỉnh sửa">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-gray-500 hover:text-blue-600"
                                onPress={async () => {
                                    // Tăng requestId mỗi lần click -> stale request cũ sẽ bị bỏ qua
                                    const requestId = ++editRequestRef.current
                                    setEditingId(row.id_dx_loai_de_xuat)
                                    const base = {
                                        ma_loai: row.ma_loai,
                                        ten_loai: row.ten_loai,
                                        mo_ta: row.mo_ta || '',
                                        chon_don_vi: String(row.chon_don_vi ?? '0'),
                                        quy_trinh_ky: []
                                    }
                                    setFormData(base)
                                    onOpenDrawerEdit()
                                    // Load quy_trinh_ky sau khi drawer đã mở
                                    const res = await loaiDeXuatAxios.show(row.id_dx_loai_de_xuat)
                                    // Chỉ set nếu đây vẫn là request mới nhất (tránh race condition)
                                    if (requestId !== editRequestRef.current) return
                                    if (res?.data?.quy_trinh_ky) {
                                        setFormData({
                                            ...base,
                                            quy_trinh_ky: res.data.quy_trinh_ky.map((item: any) => ({
                                                id_don_vi: String(item.id_don_vi),
                                                ten_don_vi: item.ten_don_vi || ''
                                            }))
                                        })
                                    }
                                }}
                            >
                                <Edit size={16} />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Xóa" color="danger">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-gray-500 hover:text-red-600"
                                onPress={() => handleDelete(row.id_dx_loai_de_xuat)}
                            >
                                <Trash size={16} />
                            </Button>
                        </Tooltip>
                    </div>
                )
            }
        ],
        [responseData]
    )

    const columnsWithSettings = useMemo(
        () =>
            allColumns.map((col) => ({
                ...col,
                width: columnWidths[col.uid] || col.width,
                pinned: pinnedColumns[col.uid] || col.pinned
            })),
        [allColumns, columnWidths, pinnedColumns]
    )

    const visibleColumns = useMemo(
        () => columnsWithSettings.filter((col) => filters.initial_visible_columns.includes(col.uid)),
        [columnsWithSettings, filters.initial_visible_columns]
    )

    const rows = useMemo(() => responseData?.data || [], [responseData])

    return (
        <Modal.Backdrop
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
            isDismissable={false}
        >
            <Modal.Container size="cover" scroll="inside">
                <Modal.Dialog className="max-w-7xl h-[90vh] flex flex-col">
                    <Modal.CloseTrigger />

                    {/* Header */}
                    <Modal.Header>
                        <Modal.Heading>Danh mục loại đề xuất</Modal.Heading>
                    </Modal.Header>

                    {/* Toolbar */}
                    <Modal.Body className="flex flex-col gap-0 p-0 flex-1 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                                <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                                    <Input
                                        type="search"
                                        placeholder="Tìm kiếm loại đề xuất..."
                                        startContent={<Search className="text-gray-500" size={16} />}
                                        value={typingValue}
                                        onValueChange={setTypingValue}
                                        className="w-full md:max-w-[360px]"
                                        classNames={{
                                            inputWrapper: 'h-9 bg-white border border-gray-200 rounded-md'
                                        }}
                                        endContent={isFetching && <Spinner size="sm" />}
                                    />
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
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                            onClick={handleResetTable}
                                            isLoading={isResetting}
                                        >
                                            <RotateCcw size={16} className="text-gray-600" />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Lịch sử chỉnh sửa">
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                            onPress={onOpenHistory}
                                        >
                                            <History size={16} className="text-gray-600" />
                                        </Button>
                                    </Tooltip>
                                    <Divider orientation="vertical" className="h-6" />
                                    <Button
                                        color="primary"
                                        size="sm"
                                        startContent={<Plus size={16} />}
                                        className="font-medium"
                                        onPress={() => {
                                            setFormData({ chon_don_vi: '0' })
                                            onOpenDrawerAdd()
                                        }}
                                    >
                                        Thêm mới
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-hidden relative">
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
                        </div>

                        {/* Pagination */}
                        <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-4">
                            <TablePagination
                                page={filters.page}
                                total={recordsTotal}
                                filtered={recordsFiltered}
                                limit={filters.length}
                                onChangePage={(page) => setFilters({ page })}
                                onChangeLimit={(length) => setFilters({ length, page: 1 })}
                            />
                        </div>
                    </Modal.Body>

                    {/* Drawer Thêm - đặt trong Modal.Dialog để không bị inert */}
                    <DrawerCommon
                        title="Thêm loại đề xuất"
                        open={isOpenDrawerAdd}
                        onClose={() => {
                            onCloseDrawerAdd()
                            setFormData({ chon_don_vi: '0' })
                        }}
                        handleSubmitApi={(_id, data) => loaiDeXuatAxios.create(data!)}
                        formData={formData}
                        usePortal={false}
                        onSubmitSuccess={() => {
                            refetch()
                            setFormData({ chon_don_vi: '0' })
                        }}
                    >
                        <FormLoaiDeXuat formData={formData} setFormData={setFormData} isEdit={false} />
                    </DrawerCommon>

                    {/* Drawer Sửa */}
                    <DrawerCommon
                        title="Sửa loại đề xuất"
                        open={isOpenDrawerEdit}
                        onClose={() => {
                            onCloseDrawerEdit()
                            // Reset toàn bộ formData kể cả quy_trinh_ky khi đóng
                            setFormData({ chon_don_vi: '0', quy_trinh_ky: [] })
                            editRequestRef.current++ // Hủy bất kỳ show() đang pending
                        }}
                        handleSubmitApi={(_id, data) => loaiDeXuatAxios.update(String(editingId), data!)}
                        formData={formData}
                        usePortal={false}
                        onSubmitSuccess={() => {
                            refetch()
                            setFormData({ chon_don_vi: '0' })
                        }}
                    >
                        <FormLoaiDeXuat formData={formData} setFormData={setFormData} isEdit={true} />
                    </DrawerCommon>

                    {/* Confirm Xóa */}
                    <ConfirmModal
                        isOpen={isOpenConfirm}
                        onClose={onCloseConfirm}
                        onConfirm={onConfirmDelete}
                        title="Xác nhận xóa"
                        content="Bạn có chắc chắn muốn xóa loại đề xuất này không? Hành động này không thể hoàn tác."
                        isDanger={true}
                    />
                </Modal.Dialog>
            </Modal.Container>

            {/* History Drawer */}
            <DrawerLichSuChung 
                open={isOpenHistory} 
                onClose={onCloseHistory}
                queryKey={['lich-su-loaidexuat']}
                apiUrl="admin/hrm/loaidexuat/view_log"
                title="Lịch sử chỉnh sửa"
            />

        </Modal.Backdrop>
    )
}

