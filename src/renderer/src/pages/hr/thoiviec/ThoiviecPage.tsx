import { mapDonviOptions } from '@renderer/api/danhmuc/DonviAxios'
import { mapVitriOptions } from '@renderer/api/danhmuc/VitriAxios'
import { thoiviecAxios } from '@renderer/api/hr/thoiviecAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import ContextMenu from '@renderer/components/ContextMenu'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import UserAvatar from '@renderer/components/UserAvatar'
import { useContextMenu } from '@renderer/hooks/useContextMenu'
import { useThoiviecStore } from '@renderer/store/useThoiviecStore'
import { useQuery } from '@tanstack/react-query'
import {
    Edit,
    Eye,
    History,
    RotateCcw,
    Trash
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AddThoiviecModal from './AddThoiviecModal'
import DrawerLichSuChung from '@renderer/components/DrawerLichSuChung'
import ManageProceduresModal from './ManageProceduresModal'
import ThoiviecProcedures from './ThoiviecProcedures'
import ThoiviecStats from './ThoiviecStats'
import ThoiviecToolbar from './ThoiviecToolbar'
import { toast, Button } from "@heroui-v3/react";
import { usePageActions } from '@renderer/hooks/usePageActions'
import { canAccess } from '@renderer/utils/permissions/permissions'

export default function ThoiviecPage() {
    const {
        columnWidths,
        setColumnWidth,
        pinnedColumns,
        visibleColumns,
        setVisibleColumns,
        reset,
        filter,
        setFilter,
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        sortDescriptors,
        setSortDescriptors,
        setPinnedColumn,
        showStats,
        setShowStats
    } = useThoiviecStore()

    const [recordsTotal, setRecordsTotal] = useState(0)
    const [recordsFiltered, setRecordsFiltered] = useState(0)

    const {
        data: responseData,
        isLoading,
        refetch
    } = useQuery({
        queryKey: ['thoiviecData', page, limit, search, filter, sortDescriptors],
        queryFn: async () => {
            const apiFilter: any = { ...filter }
            if (filter.tu_ngay || filter.den_ngay) {
                apiFilter.ngay_lam_chinh_thuc_ket_thuc = {
                    from: filter.tu_ngay || '',
                    to: filter.den_ngay || ''
                }
                delete apiFilter.tu_ngay
                delete apiFilter.den_ngay
            }

            const payload = {
                draw: page,
                start: (page - 1) * limit,
                length: limit,
                search: { value: search.trim() },
                filter: apiFilter,
                order: sortDescriptors.map((desc) => ({
                    column: desc.column,
                    dir: desc.direction === 'ascending' ? 'asc' : 'desc'
                }))
            }
            const response = await thoiviecAxios.fetch(payload)
            return response?.data || { data: [], recordsTotal: 0, recordsFiltered: 0 }
        }
    })

    const sortedUsers = useMemo(() => {
        const list = [...(responseData?.data || [])]
        if (sortDescriptors.length === 0) return list

        return list.sort((a, b) => {
            for (const sort of sortDescriptors) {
                let aValue = a[sort.column]
                let bValue = b[sort.column]

                // Handle nested or special columns if needed
                if (sort.column === 'ho_va_ten') {
                    aValue = a.ho_va_ten || ''
                    bValue = b.ho_va_ten || ''
                }

                if (aValue === bValue) continue

                const multiplier = sort.direction === 'descending' ? -1 : 1
                if (aValue < bValue) return -1 * multiplier
                if (aValue > bValue) return 1 * multiplier
            }
            return 0
        })
    }, [responseData, sortDescriptors])

    const { data: donviOptions = [], isLoading: isLoadingDonvi } = useQuery({
        queryKey: ['donviOptions'],
        queryFn: mapDonviOptions
    })

    const { data: vitriOptions = [], isLoading: isLoadingVitri } = useQuery({
        queryKey: ['vitriOptions'],
        queryFn: mapVitriOptions
    })

    const [users, setUsers] = useState<any[]>([])
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]))
    const contextMenu = useContextMenu<any>()

    const [isResetting, setIsResetting] = useState(false)

    const handleResetTable = () => {
        setIsResetting(true)
        setTimeout(() => {
            reset()
            setIsResetting(false)
        }, 500)
    }

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isManageProceduresModalOpen, setIsManageProceduresModalOpen] = useState(false)
    const [isLichSuOpen, setIsLichSuOpen] = useState(false)

    usePageActions(
        canAccess('thoiviec.view_log') ? (
            <Button
                variant="outline"
                className="flex items-center gap-2 rounded-full"
                onPress={() => setIsLichSuOpen(true)}
            >
                <History size={15} />
                Lịch sử chỉnh sửa
            </Button>
        ) : null
    )

    const handleAddClick = () => {
        setIsAddModalOpen(true)
    }

    useEffect(() => {
        if (sortedUsers) {
            setUsers(sortedUsers)
            setRecordsTotal(responseData?.recordsTotal || 0)
            setRecordsFiltered(responseData?.recordsFiltered || 0)
        }
    }, [sortedUsers, responseData])

    useEffect(() => {
        console.log('Selected IDs:', Array.from(selectedKeys))
    }, [selectedKeys])

    const handleRowChange = useCallback(
        async (id: string | number, columnUid: string, value: any) => {
            // Optimistic update
            setUsers((prev) =>
                prev.map((row) => {
                    if (row.id_nhan_vien === id) {
                        return { ...row, [columnUid]: value }
                    }
                    return row
                })
            )
            console.log('Row changed:', { id, columnUid, value })

            // Call API to update
            if (['trang_thai', 'ly_do_thoi_viec', 'ngay_lam_chinh_thuc_ket_thuc'].includes(columnUid)) {
                try {
                    let formattedValue = value
                    if (columnUid === 'ngay_lam_chinh_thuc_ket_thuc') {
                        if (value && typeof value === 'object' && 'year' in value) {
                            formattedValue = `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`
                        } else if (typeof value === 'string') {
                            formattedValue = value
                        } else {
                            formattedValue = null
                        }
                    }

                    const res = await thoiviecAxios.updateEmployeeInfo({
                        id_nhan_vien: id,
                        [columnUid]: formattedValue
                    })

                    if (res.success === false) {
                        toast('Lỗi', { description: res.message || 'Cập nhật thất bại', variant: 'danger' })
                        // Revert change if needed (optional, requires keeping previous state)
                    } else {
                        toast('Thành công', { description: 'Cập nhật thông tin thành công', variant: 'success' })
                        refetch()
                    }
                } catch (error: any) {
                    console.error('Update error:', error)
                    toast('Lỗi', { description: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật', variant: 'danger' })
                }
            }
        },
        [refetch]
    )

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

    const { data: dataThutuc, isLoading: isLoadingThutuc } = useQuery({
        queryKey: ['dataThutuc', selectedEmployeeId],
        queryFn: () =>
            thoiviecAxios.fetchThoi_viec_byIdNhanVien({
                id_nhan_vien: selectedEmployeeId,
                length: 9999
            }),
        enabled: !!selectedEmployeeId
    })

    const handleRowClick = (row: any) => {
        console.log('Row clicked:', row)
        setSelectedEmployeeId(row.id_nhan_vien)
    }

    const handleRowDoubleClick = (row: any) => {
        console.log('Row double clicked:', row)
    }

    const [editingEmployee, setEditingEmployee] = useState<any>(null)

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        content: '',
        onConfirm: () => { },
        isDanger: false,
        isLoading: false
    })

    const handleReturnToWork = (employee: any) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xác nhận',
            content: `Bạn có chắc chắn muốn cho nhân viên ${employee.ho_va_ten} quay trở lại làm việc?`,
            isDanger: false,
            isLoading: false,
            onConfirm: async () => {
                setConfirmModal((prev) => ({ ...prev, isLoading: true }))
                try {
                    const res = await thoiviecAxios.updates({
                        type: 'returnToWork',
                        ids_nhan_vien: [employee.id_nhan_vien]
                    })
                    if (res.success) {
                        toast('Thành công', { description: 'Đã cập nhật trạng thái nhân viên quay lại làm việc', variant: 'success' })
                        refetch()
                        setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                    } else {
                        toast('Lỗi', { description: res.message || 'Có lỗi xảy ra', variant: 'danger' })
                    }
                } catch (error: any) {
                    toast('Lỗi', { description: error.response?.data?.message || 'Có lỗi xảy ra', variant: 'danger' })
                } finally {
                    setConfirmModal((prev) => ({ ...prev, isLoading: false }))
                }
            }
        })
    }

    const menuItems = [
        {
            label: 'Xem chi tiết',
            icon: <Eye size={16} />,
            onClick: () => {
                if (contextMenu.data) {
                    setSelectedEmployeeId(contextMenu.data.id_nhan_vien)
                }
            }
        },
        {
            label: 'Chỉnh sửa',
            icon: <Edit size={16} />,
            onClick: () => {
                if (contextMenu.data) {
                    setEditingEmployee(contextMenu.data)
                    setIsAddModalOpen(true)
                }
            }
        },
        { label: 'separator' },
        {
            label: 'Quay lại làm việc',
            icon: <RotateCcw size={16} />,
            onClick: () => {
                if (contextMenu.data) {
                    handleReturnToWork(contextMenu.data)
                }
            }
        }
    ]

    const allColumns: TableColumnType[] = useMemo(() => {
        const columns: TableColumnType[] = [
            {
                uid: 'stt',
                sortable: false,
                name: '#',
                width: 30,
                className: 'text-center w-10 p-0 font-bold',
                pinned: 'left',
                disablePinning: true
            },
            {
                uid: 'ho_va_ten',
                name: 'Họ và tên',
                sortable: true,
                width: 250,
                pinned: 'left',
                editable: false,
                render: (_, row: any) => (
                    <div className="flex items-center gap-2 w-full px-1">
                        <div className="shrink-0 flex items-center justify-center">
                            <UserAvatar
                                name={row.ho_va_ten || `User ${row?.id_nhan_vien}`}
                                src={row.avatar}
                                gender={row.gioi_tinh}
                                size="sm"
                            />
                        </div>
                        <div className="flex flex-col leading-tight min-w-0">
                            <span className="text-gray-700 dark:text-gray-200 truncate">
                                {row.ho_va_ten || `Nhân viên ${row.id_nhan_vien}`}
                            </span>
                            <span className="text-[10px] mt-0.5 text-gray-500 uppercase font-bold">
                                {`UID: ${row.ma_nhan_vien}` || `#${row.id_nhan_vien}`}
                            </span>
                        </div>
                    </div>
                )
            },
            {
                uid: 'email',
                name: 'Email',
                sortable: true,
                editable: false
            },
            {
                uid: 'trang_thai',
                name: 'Trạng thái',
                sortable: true,
                width: 200,
                type: 'select',
                options: [
                    { label: 'Đang làm việc', value: 'DANG_LAM_VIEC' },
                    { label: 'Đang làm thủ tục thôi việc', value: 'DANG_LAM_THU_TUC_THOI_VIEC' },
                    { label: 'Nghỉ việc', value: 'NGHI_VIEC' },
                    { label: 'Thôi việc', value: 'THOI_VIEC' }
                ]
            },
            { uid: 'so_dien_thoai', name: 'Số điện thoại', sortable: true },
            { uid: 'ly_do_thoi_viec', name: 'Lý do', sortable: true },
            { uid: 'id_thu_tuc_thoi_viec', name: 'Thủ tục', sortable: true },
            {
                uid: 'ten_don_vi',
                name: 'Đơn vị',
                sortable: true,
                type: 'select',
                className: 'max-w-[150px]',
                editable: false,
                options: donviOptions
            },
            {
                uid: 'ten_cong_viec',
                name: 'Vị trí',
                sortable: true,
                type: 'select',
                editable: false,
                options: vitriOptions
            },
            {
                uid: 'ngay_lam_chinh_thuc',
                name: 'Ngày vào làm',
                sortable: true,
                type: 'date',
                editable: false,
                width: 160
            },
            {
                uid: 'ngay_lam_chinh_thuc_ket_thuc',
                name: 'Ngày thôi việc',
                sortable: true,
                type: 'date',
                width: 160
            },
            { uid: 'trinh_do_dt', name: 'Trình độ', sortable: true }
        ]

        return columns.map((col) => {
            const storedPin = pinnedColumns[col.uid]
            if (Object.prototype.hasOwnProperty.call(pinnedColumns, col.uid)) {
                const normalized = (storedPin as any) === 'none' ? undefined : storedPin
                return { ...col, pinned: normalized }
            }
            return col
        })
    }, [donviOptions, vitriOptions, handleRowChange, pinnedColumns])

    const columns = useMemo(
        () => allColumns.filter((col) => visibleColumns.has(col.uid)),
        [allColumns, visibleColumns]
    )

    return (
        <div className="flex flex-col gap-2 flex-1 min-h-0 h-[calc(100dvh-130px)]">
            <ThoiviecStats show={showStats} stats={responseData?.thongke} />

            <div className="sticky top-0 z-30 backdrop-blur-sm pt-2 pb-1">
                <ThoiviecToolbar
                    showStats={showStats}
                    setShowStats={setShowStats}
                    onSearch={(val) => {
                        setSearch(val)
                        setPage(1)
                    }}
                    isLoading={isLoading}
                    filter={filter}
                    setFilter={setFilter}
                    onClearFilter={() => {
                        setFilter({})
                        setPage(1)
                    }}
                    donviOptions={donviOptions}
                    vitriOptions={vitriOptions}
                    allColumns={allColumns}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                    onOpenManageProcedures={() => setIsManageProceduresModalOpen(true)}
                    onOpenAdd={handleAddClick}
                    onResetTable={handleResetTable}
                />
            </div>

            <div className="flex-1 overflow-hidden flex flex-row relative gap-2 min-h-0">
                <div className="w-full overflow-hidden relative transition-all duration-300 h-full flex flex-col">
                    <div className="flex-1 flex flex-col min-h-0 relative w-full overflow-hidden">
                        <TableHr
                            columns={columns}
                            data={users}
                            isLoading={isLoading || isLoadingDonvi || isLoadingVitri || isResetting}
                            primaryKey="id_nhan_vien"
                            onRowChange={handleRowChange}
                            selectedKeys={selectedKeys}
                            onSelectionChange={setSelectedKeys}
                            columnWidths={columnWidths}
                            onColumnResize={setColumnWidth}
                            onRowContextMenu={contextMenu.openMenu}
                            onRowClick={(row) => handleRowClick(row)}
                            onRowDoubleClick={handleRowDoubleClick}
                            contextMenuRowId={contextMenu.data?.id_nhan_vien}
                            onPinColumn={setPinnedColumn}
                            enableStickyScrollbar={false}
                            borderColor="border-gray-200 dark:border-gray-700"
                            sortDescriptors={sortDescriptors}
                            onSortChange={setSortDescriptors}
                        />
                    </div>
                    <TablePagination
                        page={page}
                        total={recordsTotal}
                        filtered={recordsFiltered}
                        limit={limit}
                        onChangePage={setPage}
                        onChangeLimit={(val) => {
                            setLimit(val)
                            setPage(1)
                        }}
                        className="border-t border-gray-200 dark:border-gray-700 p-2"
                    />
                </div>
            </div>
            {contextMenu.isOpen && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    isOpen={contextMenu.isOpen}
                    items={menuItems}
                    onClose={contextMenu.closeMenu}
                />
            )}
            <AddThoiviecModal
                isOpen={isAddModalOpen}
                onOpenChange={(open) => {
                    setIsAddModalOpen(open)
                    if (!open) setEditingEmployee(null)
                }}
                employee={editingEmployee}
                onSuccess={() => {
                    refetch()
                    setEditingEmployee(null)
                }}
            />
            <ManageProceduresModal
                isOpen={isManageProceduresModalOpen}
                onOpenChange={setIsManageProceduresModalOpen}
            />
            <ThoiviecProcedures
                procedures={dataThutuc?.data?.data || []}
                isLoading={isLoadingThutuc}
                employeeId={selectedEmployeeId}
                employee={selectedEmployeeId ? users.find((u) => u.id_nhan_vien === selectedEmployeeId) : undefined}
                onClose={() => setSelectedEmployeeId(null)}
            />
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                content={confirmModal.content}
                isDanger={confirmModal.isDanger}
                isLoading={confirmModal.isLoading}
            />
            <DrawerLichSuChung
                open={isLichSuOpen}
                onClose={() => setIsLichSuOpen(false)}
                queryKey={['lich-su-thoiviec']}
                apiUrl="admin/hrm/thoiviec/view_log"
                title="Lịch sử chỉnh sửa"
            />
        </div>
    )
}
