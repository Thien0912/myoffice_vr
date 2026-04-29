import { Button as ButtonV3 } from '@heroui-v3/react'
import { Button } from '@heroui/react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import ContextMenu from '@renderer/components/ContextMenu'
import DrawerLichSuChung from '@renderer/components/DrawerLichSuChung'
import { SidePanelProvider, useSidePanel } from '@renderer/components/side-panel'
import AddThoiviecModal from '@renderer/pages/hr/thoiviec/AddThoiviecModal'
import { usePageActionsStore } from '@renderer/store/usePageActionsStore'
import { useQueryClient } from '@tanstack/react-query'
import { Edit, Eye, EyeOff, History, Trash, UserMinus } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import HosonhansuStats from './components/HosonhansuStats'
import HosonhansuTable from './components/HosonhansuTable'
import { HosonhansuToolbar } from './components/HosonhansuToolbar'
import EmployeeEditDrawer from './components/EmployeeEditDrawer'
import EmployeeDetailDrawer from './components/EmployeeDetailDrawer'
import { useHosonhansu } from './hooks/useHosonhansu'
import { useHosonhansuColumns } from './hooks/useHosonhansuColumns'

export default function HosonhansuPage() {
    return (
        <SidePanelProvider>
            <HosonhansuPageInner />
        </SidePanelProvider>
    )
}

function HosonhansuPageInner() {
    const queryClient = useQueryClient()
    const {
        page,
        setPage,
        limit,
        setLimit,
        setDebouncedSearch,
        recordsTotal,
        recordsFiltered,
        users,
        selectedKeys,
        setSelectedKeys,
        sortDescriptors,
        setSortDescriptors,
        isPrinting,
        isLoading,
        donviOptions,
        vitriOptions,
        statsResponse,
        showStatsCards,
        setShowStatsCards,
        visibleColumns,
        setVisibleColumns,
        columnWidths,
        setColumnWidth,
        pinnedColumns,
        setPinnedColumn,
        handleRowChange,
        setPageStore,
        setLengthStore,
        contextMenu,
        handleContextMenu,
        handleCloseContextMenu,
        confirmDelete,
        setConfirmDelete,
        isDeleting,
        confirmBulkDelete,
        setConfirmBulkDelete,
        handleConfirmDelete,
        handleBulkDelete,
        handleXoaNhanVienSelected,
        handlePrint,
        handleExportExcel,
        handleExportExcelAdvanced,
        isExportingExcel,
        handleClearFilters,
        filters,
        setFilters
    } = useHosonhansu()

    const [drawerEdit, setDrawerEdit] = useState<{ id: string; name: string; ma_nhan_vien?: string; trang_thai?: string } | null>(null)
    const isDrawerOpen = drawerEdit !== null

    // Thôi việc states
    const [isAddThoiviecOpen, setIsAddThoiviecOpen] = useState(false)
    const [selectedThoiviecEmployee, setSelectedThoiviecEmployee] = useState<any>(null)

    // Đăng ký nút ẩn/hiện thống kê + lịch sử lên header layout
    const [isLichSuOpen, setIsLichSuOpen] = useState(false)
    const { setActions, clearActions } = usePageActionsStore()
    useEffect(() => {
        setActions(
            <div className="flex items-center gap-2">
                <ButtonV3
                    variant="outline"
                    className="flex items-center gap-2 rounded-full"
                    onPress={() => setShowStatsCards(!showStatsCards)}
                >
                    {showStatsCards ? <EyeOff size={15} /> : <Eye size={15} />}
                    <span>{showStatsCards ? 'Ẩn thống kê' : 'Hiện thống kê'}</span>
                </ButtonV3>

                <ButtonV3
                    variant="outline"
                    className="flex items-center gap-2 rounded-full"
                    onPress={() => setIsLichSuOpen(true)}
                >
                    <History size={15} />
                    Lịch sử chỉnh sửa
                </ButtonV3>
            </div>
        )
        return () => clearActions()
    }, [showStatsCards, isLichSuOpen])

    // --- Bridge SidePanel → HrDrawer secondary panel ---
    const { setBridgedToDrawer } = useSidePanel()
    const [isSecondaryOpen, setIsSecondaryOpen] = useState(false)
    const [activeSecondarySection, setActiveSecondarySection] = useState<string | null>(null)
    const [isPrimaryHidden, setIsPrimaryHidden] = useState(false)

    // Sections that handle their own UI (modal, etc.) — skip dual drawer bridge
    const SKIP_DUAL_DRAWER_SECTIONS = new Set(['section-13']) // Thủ tục thôi việc

    const handleOpenSecondary = useCallback((sectionId: string) => {
        if (SKIP_DUAL_DRAWER_SECTIONS.has(sectionId)) {
            // Just dispatch event — component handles its own UI
            window.dispatchEvent(new CustomEvent(`trigger-add-${sectionId}`))
            return
        }
        setActiveSecondarySection(sectionId)
        setIsSecondaryOpen(true)
        setBridgedToDrawer(true)
        // Dispatch event — list component will call openPanel() setting SidePanel config
        window.dispatchEvent(new CustomEvent(`trigger-add-${sectionId}`))
    }, [setBridgedToDrawer])

    const [drawerDetail, setDrawerDetail] = useState<{ id: string; name: string } | null>(null)
    const isDetailDrawerOpen = drawerDetail !== null

    const handleOpenEdit = useCallback((id: number, name?: string, maNhanVien?: string, trangThai?: string) => {
        setDrawerDetail(null)
        // Open minh-chung panel by default
        setIsSecondaryOpen(true)
        setActiveSecondarySection('minh-chung')
        setBridgedToDrawer(true)
        setIsPrimaryHidden(false)
        setDrawerEdit({ id: String(id), name: name || '', ma_nhan_vien: maNhanVien, trang_thai: trangThai })
    }, [setBridgedToDrawer])

    const handleOpenDetail = useCallback((id: number, name?: string, maNhanVien?: string, trangThai?: string) => {
        handleOpenEdit(id, name, maNhanVien, trangThai)
    }, [handleOpenEdit])

    const handleCloseDetail = useCallback(() => {
        setDrawerDetail(null)
    }, [])

    const { allColumns, trangThaiOptions } = useHosonhansuColumns(
        donviOptions,
        vitriOptions,
        pinnedColumns,
        handleOpenEdit
    )

    const columns = useMemo(
        () => allColumns.filter((col) => visibleColumns.has(col.uid)),
        [allColumns, visibleColumns]
    )

    const selectedCount = useMemo(
        () => (selectedKeys === 'all' ? users.length : selectedKeys.size),
        [selectedKeys, users]
    )

    const hasSelection = useMemo(() => selectedCount > 0, [selectedCount])

    const activeFilterCount = useMemo(() => {
        return [
            filters.ma_nhan_vien,
            filters.ho_ten,
            filters.email,
            filters.so_cccd,
            filters.ngay_sinh,
            filters.trang_thai,
            filters.id_don_vi,
            filters.id_vi_tri_cong_viec,
            (filters.dateRange?.fromDate || filters.dateRange?.toDate) ? 'work_time' : null
        ].filter(v => v !== '' && v !== null && v !== undefined).length
    }, [filters])

    const hasActiveFilters = useMemo(() => activeFilterCount > 0, [activeFilterCount])

    const menuItems = [
        {
            label: 'Xem chi tiết',
            icon: <Eye size={16} />,
            onClick: () => handleOpenDetail(contextMenu.row.id_nhan_vien, contextMenu.row.ho_va_ten, contextMenu.row.ma_nhan_vien, contextMenu.row.trang_thai)
        },
        {
            label: 'Chỉnh sửa',
            icon: <Edit size={16} />,
            onClick: () => handleOpenEdit(contextMenu.row.id_nhan_vien, contextMenu.row.ho_va_ten, contextMenu.row.ma_nhan_vien, contextMenu.row.trang_thai)
        },
        { label: 'separator' },
        {
            label: 'Làm thủ tục thôi việc',
            icon: <UserMinus size={16} />,
            onClick: () => {
                setSelectedThoiviecEmployee(contextMenu.row)
                setIsAddThoiviecOpen(true)
                handleCloseContextMenu()
            }
        },
        { label: 'separator' },
        {
            label: 'Xóa',
            icon: <Trash size={16} />,
            onClick: () => {
                if (contextMenu.row?.id_nhan_vien) {
                    setConfirmDelete({ isOpen: true, id: contextMenu.row.id_nhan_vien })
                    handleCloseContextMenu()
                }
            }
        }
    ]
    return (
        <div className="flex flex-col gap-2 flex-1 min-h-0 h-[calc(100dvh-130px)]">
            <HosonhansuStats showStatsCards={showStatsCards} statsResponse={statsResponse} />

            <div className="sticky top-0 z-30 backdrop-blur-sm pt-2 pb-1">
                <HosonhansuToolbar
                    onSearch={(val) => {
                        setDebouncedSearch(val)
                        setPage(1)
                    }}
                    isLoading={isLoading}
                    allColumns={allColumns}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                    showStatsCards={showStatsCards}
                    setShowStatsCards={setShowStatsCards}
                    hasActiveFilters={hasActiveFilters}
                    hasSelection={hasSelection}
                    selectedKeys={selectedKeys}
                    setSelectedKeys={setSelectedKeys}
                    selectedCount={selectedCount}
                    handleXoaNhanVienSelected={handleXoaNhanVienSelected}
                    onPrint={(options) => handlePrint(options, donviOptions, vitriOptions)}
                    activeFilterCount={activeFilterCount}
                    filters={filters}
                    setFilters={setFilters}
                    handleClearFilters={handleClearFilters}
                    handleExportExcel={handleExportExcel}
                    handleExportExcelAdvanced={handleExportExcelAdvanced}
                    isExportingExcel={isExportingExcel}
                    donviOptions={donviOptions}
                    vitriOptions={vitriOptions}
                    trangThaiOptions={trangThaiOptions}
                />
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
                <HosonhansuTable
                    columns={columns}
                    data={users}
                    isLoading={isLoading}
                    page={page}
                    total={recordsTotal}
                    filtered={recordsFiltered}
                    limit={limit}
                    selectedKeys={selectedKeys}
                    sortDescriptors={sortDescriptors}
                    onSelectionChange={setSelectedKeys}
                    onSortChange={setSortDescriptors}
                    onChangePage={(val) => {
                        setPage(val)
                        setPageStore(val)
                    }}
                    onChangeLimit={(val) => {
                        setLimit(val)
                        setLengthStore(val)
                        setPage(1)
                        setPageStore(1)
                    }}
                    columnWidths={columnWidths}
                    onColumnResize={setColumnWidth}
                    pinnedColumns={pinnedColumns}
                    onPinColumn={setPinnedColumn}
                    onRowChange={handleRowChange}
                    onRowContextMenu={handleContextMenu}
                    contextMenuRowId={contextMenu.row?.id_nhan_vien}
                />
            </div>

            {contextMenu.isOpen && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    isOpen={contextMenu.isOpen}
                    items={menuItems}
                    onClose={handleCloseContextMenu}
                />
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={handleConfirmDelete}
                title="Xóa nhân viên"
                content="Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                isDanger={true}
                isLoading={isDeleting}
            />

            <AddThoiviecModal
                isOpen={isAddThoiviecOpen}
                onOpenChange={setIsAddThoiviecOpen}
                employee={selectedThoiviecEmployee}
                onSuccess={() => {
                    // Force refresh by triggering query refetch
                    queryClient.invalidateQueries({ queryKey: ['nhansuData'] })
                    setPage(1)
                }}
            />

            <ConfirmModal
                isOpen={confirmBulkDelete.isOpen}
                onClose={() => setConfirmBulkDelete({ isOpen: false, ids: null })}
                onConfirm={handleBulkDelete}
                title="Xóa nhiều nhân viên"
                content={`Bạn có chắc chắn muốn xóa ${confirmBulkDelete.ids?.length} nhân viên đã chọn? Hành động này không thể hoàn tác.`}
                confirmText="Xóa tất cả"
                cancelText="Hủy"
                isDanger={true}
                isLoading={isDeleting}
            />

            {/* Edit Drawer */}
            <EmployeeEditDrawer
                isOpen={isDrawerOpen}
                employeeId={drawerEdit?.id}
                employeeName={drawerEdit?.name}
                maNhanVien={drawerEdit?.ma_nhan_vien}
                trangThai={drawerEdit?.trang_thai}
                onClose={() => setDrawerEdit(null)}
                isSecondaryOpen={isSecondaryOpen}
                setIsSecondaryOpen={setIsSecondaryOpen}
                activeSecondarySection={activeSecondarySection}
                setActiveSecondarySection={setActiveSecondarySection}
                isPrimaryHidden={isPrimaryHidden}
                setIsPrimaryHidden={setIsPrimaryHidden}
                onOpenSecondary={handleOpenSecondary}
            />

            {/* Detail View Drawer */}
            <EmployeeDetailDrawer
                isOpen={isDetailDrawerOpen}
                employeeId={drawerDetail?.id}
                employeeName={drawerDetail?.name}
                onClose={handleCloseDetail}
            />

            <DrawerLichSuChung
                open={isLichSuOpen}
                onClose={() => setIsLichSuOpen(false)}
                queryKey={['lich-su-nhanvien']}
                apiUrl="admin/hrm/nhanvien/view_log"
                title="Lịch sử chỉnh sửa"
            />

        </div>
    )
}
