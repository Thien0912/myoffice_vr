import { Button, Chip, Selection, useDisclosure } from '@heroui/react'
import { userAxios } from '@renderer/api/auth/userAxios'
import { nhanvientucapnhatAxios, YeuCauCapNhat } from '@renderer/api/hr/nhanvientucapnhatAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import DebugBox from '@renderer/components/DebugBox'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import UserAvatar from '@renderer/components/UserAvatar'
import { usePageActions } from '@renderer/hooks/usePageActions'
import { useNhanVienTuCapNhatStore } from '@renderer/store/hr/useNhanVienTuCapNhatStore'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
    CheckCircle2,
    Clock,
    History,
    UserCheck,
    XCircle
} from 'lucide-react'
import { useMemo, useState, useCallback } from 'react'
import DrawerLichSuChung from '@renderer/components/DrawerLichSuChung'
import { FIELD_LABELS } from './constants/fieldLabels'
import ModalDetailYeuCau from './components/ModalDetailYeuCau'
import NhanVienTuCapNhatStats from './components/NhanVienTuCapNhatStats'
import NhanVienTuCapNhatToolbar from './components/NhanVienTuCapNhatToolbar'
import { toast, Button as ButtonV3 } from '@heroui-v3/react'

export default function NhanVienTuCapNhatPage() {
    const queryClient = useQueryClient()
    const {
        filters,
        setFilters,
        columnWidths,
        setColumnWidth,
        pinnedColumns,
        setPinnedColumn,
        sortDescriptors,
        setSortDescriptors,
        showStatsCards,
        setShowStatsCards
    } = useNhanVienTuCapNhatStore()
    const { setUser } = useAuthStore()

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))

    // Confirm actions
    const [actionData, setActionData] = useState<{ id: string; status: number; title: string } | null>(null)
    const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

    // Bulk Confirm actions
    const [bulkActionData, setBulkActionData] = useState<{ ids: string[]; status: number; title: string } | null>(null)
    const { isOpen: isOpenBulkConfirm, onOpen: onOpenBulkConfirm, onClose: onCloseBulkConfirm } = useDisclosure()

    // Detail Modal
    const [selectedRequest, setSelectedRequest] = useState<YeuCauCapNhat | null>(null)
    const { isOpen: isOpenDetail, onOpen: onOpenDetail, onClose: onCloseDetail } = useDisclosure()

    // Lịch sử chỉnh sửa Drawer
    const [isOpenLichSu, setIsOpenLichSu] = useState(false)

    // Mount button lịch sử vào góc phải header page
    usePageActions(
        <ButtonV3
            variant="outline"
            className="flex items-center gap-2 rounded-full"
            onPress={() => setIsOpenLichSu(true)}
        >
            <History size={15} />
            Lịch sử chỉnh sửa
        </ButtonV3>
    )
    const {
        data: responseData,
        isLoading: isLoadingData
    } = useQuery({
        queryKey: [
            'nhanVienTuCapNhatData',
            filters.page,
            filters.length,
            filters.searchValue,
            sortDescriptors
        ],
        queryFn: () => {
            const payload = {
                searchValue: filters.searchValue,
                searchKey: JSON.stringify({
                    searchValue: filters.searchValue
                }),
                order: sortDescriptors.map((desc) => ({
                    column: desc.column,
                    dir: desc.direction === 'ascending' ? 'asc' : 'desc'
                })),
                start: (filters.page - 1) * (filters.length || 10),
                length: filters.length || 10
            }
            return nhanvientucapnhatAxios.fetch(payload)
        }
    })

    // Mutations
    const duyetMutation = useMutation({
        mutationFn: (params: { id_yeu_cau_cap_nhat: string; trang_thai: number }) => {
            if (params.trang_thai === 1) {
                return nhanvientucapnhatAxios.duyetCapNhat(params.id_yeu_cau_cap_nhat)
            }
            return nhanvientucapnhatAxios.tuchoi(params.id_yeu_cau_cap_nhat)
        },
        onSuccess: async (res) => {
            if (res.success) {
                toast('Thao tác thành công', { variant: 'success' })
                queryClient.invalidateQueries({ queryKey: ['nhanVienTuCapNhatData'] })
                queryClient.invalidateQueries({ queryKey: ['my-update-requests'] })
                queryClient.invalidateQueries({ queryKey: ['hr-update-requests-pending-count'] })
                onCloseDetail()
                // Refresh user info in header
                try {
                    const meRes = await userAxios.me()
                    if (meRes?.success && meRes?.data?.user) {
                        setUser(meRes.data.user)
                    }
                } catch (e) {
                    console.error('Failed to refresh user info:', e)
                }
            } else {
                toast(res.message || 'Thao tác thất bại', { variant: 'danger' })
            }
        }
    })

    // Bulk mutations
    const bulkDuyetMutation = useMutation({
        mutationFn: (params: { ids_yeu_cau_cap_nhat: string[]; trang_thai: number }) => {
            return nhanvientucapnhatAxios.duyetNhieu(params)
        },
        onSuccess: (res) => {
            if (res.success) {
                toast('Thao tác hàng loạt thành công', { variant: 'success' })
                queryClient.invalidateQueries({ queryKey: ['nhanVienTuCapNhatData'] })
                queryClient.invalidateQueries({ queryKey: ['my-update-requests'] })
                queryClient.invalidateQueries({ queryKey: ['hr-update-requests-pending-count'] })
                setSelectedKeys(new Set([]))
            } else {
                toast(res.message || 'Thao tác thất bại', { variant: 'danger' })
            }
        },
        onError: (error) => {
            console.error('Bulk action error:', error)
            toast('Có lỗi xảy ra', { variant: 'danger' })
        }
    })

    const handleAction = (id: string, status: number, title: string) => {
        setActionData({ id, status, title })
        onOpenConfirm()
    }

    const confirmAction = async () => {
        if (!actionData) return
        await duyetMutation.mutateAsync({
            id_yeu_cau_cap_nhat: actionData.id,
            trang_thai: actionData.status
        })
        onCloseConfirm()
    }

    const handleBulkApprove = () => {
        if (!selectedKeys || (selectedKeys instanceof Set && selectedKeys.size === 0)) {
            toast('Vui lòng chọn các yêu cầu cần duyệt', { variant: 'warning' })
            return
        }

        const ids = selectedKeys === 'all' ? [] : Array.from(selectedKeys).map(id => String(id))
        if (selectedKeys === 'all' || ids.length === 0) {
            toast('Vui lòng chọn cụ thể các yêu cầu cần duyệt', { variant: 'warning' })
            return
        }

        setBulkActionData({
            ids,
            status: 1,
            title: `Bạn có chắc chắn muốn duyệt ${ids.length} yêu cầu cập nhật đã chọn?`
        })
        onOpenBulkConfirm()
    }

    const handleBulkReject = () => {
        if (!selectedKeys || (selectedKeys instanceof Set && selectedKeys.size === 0)) {
            toast('Vui lòng chọn các yêu cầu cần từ chối', { variant: 'warning' })
            return
        }

        const ids = selectedKeys === 'all' ? [] : Array.from(selectedKeys).map(id => String(id))
        if (selectedKeys === 'all' || ids.length === 0) {
            toast('Vui lòng chọn cụ thể các yêu cầu cần từ chối', { variant: 'warning' })
            return
        }

        setBulkActionData({
            ids,
            status: 2,
            title: `Bạn có chắc chắn muốn từ chối ${ids.length} yêu cầu cập nhật đã chọn?`
        })
        onOpenBulkConfirm()
    }

    const confirmBulkAction = async () => {
        if (!bulkActionData) return
        await bulkDuyetMutation.mutateAsync({
            ids_yeu_cau_cap_nhat: bulkActionData.ids,
            trang_thai: bulkActionData.status
        })
        onCloseBulkConfirm()
    }

    const allColumns: TableColumnType<YeuCauCapNhat>[] = useMemo(() => [
        {
            uid: 'stt',
            name: 'STT',
            width: 60,
            sortable: false,
            className: 'text-center font-medium',
            pinned: 'left'
        },
        {
            uid: 'ma_nhan_vien',
            name: 'Mã nhân viên',
            width: 120,
            className: 'text-center',
            render: (_: any, row: any) => (
                <span
                    className="text-blue-700 dark:text-blue-400 cursor-pointer underline font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    onClick={() => {
                        setSelectedRequest(row)
                        onOpenDetail()
                    }}
                >
                    {row?.ma_nhan_vien}
                </span>
            )
        },
        {
            uid: 'ho_va_ten',
            name: 'Họ tên',
            width: 250,
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <UserAvatar name={row?.ho_va_ten} gender={row?.gioi_tinh} size="sm" />
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{row?.ho_va_ten}</span>
                        <span className="text-xs text-gray-500">{row?.email}</span>
                    </div>
                </div>
            )
        },
        {
            uid: 'trang_thai',
            name: 'Trạng thái',
            width: 150,
            className: 'text-center',
            render: (_: any, row: any) => {
                const status = Number(row?.trang_thai)
                if (status === 1) {
                    return (
                        <Chip
                            variant="flat"
                            color="success"
                            size="sm"
                            className="font-bold border-1 border-green-500/20"
                            startContent={<CheckCircle2 size={14} />}
                        >
                            Đã duyệt
                        </Chip>
                    )
                }
                if (status === 2) {
                    return (
                        <Chip
                            variant="flat"
                            color="danger"
                            size="sm"
                            className="font-bold border-1 border-red-500/20"
                            startContent={<XCircle size={14} />}
                        >
                            Từ chối
                        </Chip>
                    )
                }
                return (
                    <Chip
                        variant="flat"
                        color="warning"
                        size="sm"
                        className="font-bold border-1 border-orange-500/20 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                        startContent={<Clock size={14} />}
                    >
                        Chưa duyệt
                    </Chip>
                )
            }
        },
        {
            uid: 'ql_nguoi_dung_ho_ten',
            name: 'Người duyệt',
            width: 200,
            render: (_: any, row: any) => (
                row?.ql_nguoi_dung_ho_ten ? (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <UserCheck size={16} className="text-blue-500" />
                        <span>{row.ql_nguoi_dung_ho_ten}</span>
                    </div>
                ) : <span className="text-gray-400 italic text-xs">Đang chờ...</span>
            )
        },
        {
            uid: 'du_lieu',
            name: 'Dữ liệu cập nhật',
            width: 200,
            render: (_: any, row: any) => {
                if (!row?.du_lieu) return <span className="text-gray-400 italic text-xs">Không có</span>
                try {
                    const data = JSON.parse(row.du_lieu)
                    const fields = Object.keys(data)
                    if (fields.length === 0) return <span className="text-gray-400 italic text-xs">Không có</span>

                    return (
                        <div className="flex flex-wrap gap-1">
                            {fields.slice(0, 3).map((field, idx) => (
                                <Chip
                                    key={idx}
                                    size="sm"
                                    variant="flat"
                                    className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                >
                                    {FIELD_LABELS[field] || field}
                                </Chip>
                            ))}
                            {fields.length > 3 && (
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                >
                                    +{fields.length - 3}
                                </Chip>
                            )}
                        </div>
                    )
                } catch (e) {
                    return <span className="text-gray-400 italic text-xs">Lỗi dữ liệu</span>
                }
            }
        },
        {
            uid: 'ngay_tao',
            name: 'Ngày yêu cầu',
            width: 50,
            className: 'text-center',
            render: (_: any, row: any) => {
                if (!row?.ngay_tao) return null
                const [date, time] = row.ngay_tao.split(' ')
                const [y, m, d] = date.split('-')
                return (
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">{time}</span>
                        <span className="text-xs text-gray-500">{`${d}/${m}/${y}`}</span>
                    </div>
                )
            }
        }
    ], [])

    const columns = useMemo(() => {
        const currentVisible = filters.initial_visible_columns
            ? new Set(filters.initial_visible_columns)
            : new Set(['stt', 'ma_nhan_vien', 'ho_va_ten', 'trang_thai', 'ql_nguoi_dung_ho_ten', 'du_lieu', 'ngay_tao'])

        return allColumns
            .filter((col) => currentVisible.has(col.uid))
            .map((col) => ({
                ...col,
                pinned: pinnedColumns[col.uid] || col.pinned
            }))
    }, [allColumns, filters.initial_visible_columns, pinnedColumns])

    const data = useMemo(() => {
        if (!responseData?.data) return []
        return responseData.data.map((item, index) => ({
            ...item,
            stt: (filters.page - 1) * filters.length + index + 1
        }))
    }, [responseData, filters.page, filters.length])

    // Calculate stats from data
    const stats = useMemo(() => {
        // Since we don't have a separate stats API, we'll use the recordsFiltered as total
        // and calculate based on current page data for now
        // TODO: Add a proper stats API endpoint
        const total = responseData?.recordsFiltered || 0
        const allData = responseData?.data || []
        const pending = allData.filter((item: YeuCauCapNhat) => Number(item.trang_thai) === 0).length
        const approved = allData.filter((item: YeuCauCapNhat) => Number(item.trang_thai) === 1).length
        const rejected = allData.filter((item: YeuCauCapNhat) => Number(item.trang_thai) === 2).length

        return { total, pending, approved, rejected }
    }, [responseData])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 h-[calc(100vh-110px)]"
        >
            <DebugBox />

            {/* Stats Cards */}
            {showStatsCards && (
                <div>
                    <NhanVienTuCapNhatStats
                        show={true}
                        total={stats.total}
                        pending={stats.pending}
                        approved={stats.approved}
                        rejected={stats.rejected}
                        isLoading={isLoadingData}
                    />
                </div>
            )}

            {/* Toolbar */}
            <div className="sticky top-0 z-30 backdrop-blur-sm">
                <NhanVienTuCapNhatToolbar
                    showStatsCards={showStatsCards}
                    setShowStatsCards={setShowStatsCards}
                    searchTerm={filters.searchValue}
                    onSearch={useCallback((value: string) => setFilters({ searchValue: value, page: 1 }), [setFilters])}
                    selectedKeys={selectedKeys}
                    allColumns={allColumns}
                    visibleColumns={Array.from(new Set(filters.initial_visible_columns))}
                    setVisibleColumns={(cols) => setFilters({ initial_visible_columns: Array.from(cols) as string[] })}
                    onBulkApprove={handleBulkApprove}
                    onBulkReject={handleBulkReject}
                    isProcessing={bulkDuyetMutation.isPending}
                />
            </div>

            {/* Main Table Content */}
            <div className="flex-1 bg-white dark:bg-gray-800 overflow-hidden flex flex-col relative">
                <TableHr
                    columns={columns as any}
                    data={data}
                    primaryKey="id_yeu_cau_cap_nhat"
                    onPinColumn={setPinnedColumn}
                    sortDescriptors={sortDescriptors}
                    onSortChange={setSortDescriptors}
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    isLoading={isLoadingData}
                />

                {/* Pagination Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10">
                    <TablePagination
                        total={responseData?.recordsFiltered || 0}
                        limit={filters.length}
                        page={filters.page}
                        onChangePage={(p) => setFilters({ page: p })}
                        onChangeLimit={(l) => setFilters({ length: l, page: 1 })}
                    />
                </div>
            </div>

            <ConfirmModal
                isOpen={isOpenConfirm}
                onClose={onCloseConfirm}
                onConfirm={confirmAction}
                title="Xác nhận thao tác"
                content={actionData?.title || ''}
                isDanger={actionData?.status === 2}
                isLoading={duyetMutation.isPending}
            />

            <ConfirmModal
                isOpen={isOpenBulkConfirm}
                onClose={onCloseBulkConfirm}
                onConfirm={confirmBulkAction}
                title="Xác nhận thao tác hàng loạt"
                content={bulkActionData?.title || ''}
                isDanger={bulkActionData?.status === 2}
                isLoading={bulkDuyetMutation.isPending}
            />

            {selectedRequest && (
                <ModalDetailYeuCau
                    isOpen={isOpenDetail}
                    onClose={onCloseDetail}
                    id_nhan_vien={selectedRequest.id_nhan_vien}
                    id_yeu_cau_cap_nhat={selectedRequest.id_yeu_cau_cap_nhat}
                    isApproving={duyetMutation.isPending && actionData?.status === 1}
                    isRejecting={duyetMutation.isPending && actionData?.status === 2}
                    onApprove={() => handleAction(selectedRequest.id_yeu_cau_cap_nhat, 1, 'Hệ thống sẽ cập nhật thông tin mới vào hồ sơ nhân viên. Bạn có chắc chắn muốn duyệt yêu cầu này?')}
                    onReject={() => handleAction(selectedRequest.id_yeu_cau_cap_nhat, 2, 'Bạn có chắc chắn muốn từ chối yêu cầu cập nhật này?')}
                    variant="drawer"
                />
            )}

            {/* Lịch sử chỉnh sửa Drawer */}
            <DrawerLichSuChung
                open={isOpenLichSu}
                onClose={() => setIsOpenLichSu(false)}
                queryKey={['lich-su-nhanvientucapnhat']}
                apiUrl="admin/hrm/nhanvientucapnhat/view_log"
                title="Lịch sử chỉnh sửa"
            />
        </motion.div>
    )
}
