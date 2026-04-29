import { toast } from "@heroui-v3/react"
import { Button } from '@heroui/react'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import ApproveModal from '@renderer/components/ApproveModal'
import MinimizedDock from '@renderer/components/MinimizedDock'
import { usePageActions } from '@renderer/hooks/usePageActions'
import { AnimatePresence, motion } from 'framer-motion'
import { History, Info, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CreateProposeModal from './components/CreateProposeModal'
import DrawerAllComments from './components/DrawerAllComments'
import DrawerLichSuChung from '@renderer/components/DrawerLichSuChung'
import DrawerPropose from './components/DrawerPropose'
import LoaiDeXuatModal from './components/LoaiDeXuatModal'
import MinimizedMorePropose from './components/MinimizedMorePropose'
import ProposeDetailModal from './components/ProposeDetailModal'
import ProposeListView from './components/ProposeListView'; // Added import
import ProposeStats from './components/ProposeStats'
import ProposeTable from './components/ProposeTable'
import ProposeToolbar from './components/ProposeToolbar'
import { ProposeData, usePropose } from './hooks/usePropose'

export default function ProposePage() {
    const {
        data,
        isLoading,
        page,
        setPage,
        limit,
        setLimit,
        recordsFiltered,
        total,
        columnWidths,
        setColumnWidths,
        pinnedColumns,
        setPinnedColumns,
        search,
        setSearch,
        selectedKeys,
        setSelectedKeys,
        stats,
        showStatsCards,
        setShowStatsCards,
        activeTab,
        setActiveTab,
        viewType,
        setViewType,
        sortDescriptors,
        setSortDescriptors,
        // New multi-modal props
        instances,
        addInstance,
        closeInstance,
        minimizeInstance,
        restoreInstance,
        refetch,
        setFilters,
        visibleColumns,
        setVisibleColumns
    } = usePropose()

    const [searchParams, setSearchParams] = useSearchParams()

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [allCommentsDrawerOpen, setAllCommentsDrawerOpen] = useState(false)
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [detailProposeId, setDetailProposeId] = useState<string | null>(null)
    const [drawerData, setDrawerData] = useState<ProposeData | null>(null)
    const [approveModal, setApproveModal] = useState<{
        isOpen: boolean
        type: 'approve' | 'reject'
        proposeId: string | null
    }>({
        isOpen: false,
        type: 'approve',
        proposeId: null
    })
    const [isApproving, setIsApproving] = useState(false)
    const [isLoaiDeXuatOpen, setIsLoaiDeXuatOpen] = useState(false)
    const [lichSuOpen, setLichSuOpen] = useState(false)

    usePageActions(
        <Button
            variant="bordered"
            radius="full"
            startContent={<History size={15} />}
            onPress={() => setLichSuOpen(true)}
        >
            Lịch sử chỉnh sửa
        </Button>
    )

    const [isAlertClosed, setIsAlertClosed] = useState(() => {
        return sessionStorage.getItem('propose_alert_closed') === 'true'
    })

    const handleCloseAlert = () => {
        setIsAlertClosed(true)
        sessionStorage.setItem('propose_alert_closed', 'true')
    }

    const allColumns = [
        { uid: 'stt', name: 'STT' },
        { uid: 'tieu_de', name: 'Tiêu đề' },
        { uid: 'ho_va_ten', name: 'Người trình ký' },
        { uid: 'created_at', name: 'Ngày gửi' },
        { uid: 'trang_thai', name: 'Tình trạng' },
        { uid: 'ten_loai_de_xuat', name: 'Loại' },
        { uid: 'actions', name: 'Thao tác' }
    ]

    // Sync state FROM URL params (for link sharing, refresh, back/forward)
    useEffect(() => {
        const id = searchParams.get('id')
        const view = searchParams.get('view') || 'drawer'

        if (id) {
            setDetailProposeId(id)
            if (view === 'modal') {
                setDetailModalOpen(true)
                setDrawerOpen(false)
            } else {
                setDrawerOpen(true)
                setDetailModalOpen(false)
                // Pre-set basic data for drawer to show loading state correctly
                setDrawerData((prev) => (prev?.id_de_xuat === id ? prev : ({ id_de_xuat: id } as any)))
            }
        } else {
            setDrawerOpen(false)
            setDetailModalOpen(false)
            setDetailProposeId(null)
        }
    }, [searchParams])

    // Cập nhật drawerData từ data danh sách khi drawer đang mở
    useEffect(() => {
        if (drawerOpen && detailProposeId && data) {
            const currentItem = data.find((item: ProposeData) => item.id_de_xuat === detailProposeId)
            if (currentItem) {
                setDrawerData(currentItem)
            }
        }
    }, [data, drawerOpen, detailProposeId])

    const handleRowClick = (row: ProposeData) => {
        const params = new URLSearchParams(searchParams)
        params.set('id', row.id_de_xuat)
        params.delete('view')
        setSearchParams(params)
        // Cập nhật state ngay lập tức để mượt hơn
        setDetailProposeId(row.id_de_xuat)
        setDrawerOpen(true)
        setDetailModalOpen(false)
    }

    const handleDrawerClose = () => {
        const params = new URLSearchParams(searchParams)
        params.delete('id')
        params.delete('view')
        setSearchParams(params)
        setDrawerOpen(false)
    }

    const handleApproveClick = (id: string) => {
        setApproveModal({
            isOpen: true,
            type: 'approve',
            proposeId: id
        })
    }

    const handleConfirmApprove = async (reason: string) => {
        if (!approveModal.proposeId) return
        setIsApproving(true)
        try {
            const res = await dexuatAxios.approve(approveModal.proposeId, {
                da_duyet: approveModal.type === 'reject' ? 0 : 1,
                ly_do: reason
            })

            if (res.success || res.status) {
                toast(approveModal.type === 'reject' ? 'Đã từ chối' : 'Đã duyệt đề xuất', { variant: approveModal.type === 'reject' ? 'warning' : 'success' })
                setApproveModal((prev) => ({ ...prev, isOpen: false }))
                refetch()
            } else {
                toast('Thất bại', { description: res.message || 'Thao tác thất bại', variant: 'danger' })
            }
        } catch (error) {
            console.error(error)
            toast('Lỗi', { description: 'Có lỗi xảy ra', variant: 'danger' })
        } finally {
            setIsApproving(false)
        }
    }

    const handleModalClose = () => {
        const params = new URLSearchParams(searchParams)
        params.delete('id')
        params.delete('view')
        setSearchParams(params)
        setDetailModalOpen(false)
    }

    const handleCreate = () => {
        addInstance('create')
    }

    const handleExport = () => {
        console.log('Export data')
    }

    const handleCreateSuccess = () => {
        refetch()
    }

    return (
        <div className="flex items-start gap-0">

            {/* Main Content Section */}
            <div className="flex-1 flex flex-col gap-2 min-w-0 pr-4">
                <AnimatePresence>
                    {!isAlertClosed && (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="flex items-center gap-3 p-2 mx-6 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg w-full"
                        >
                            <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                <Info size={18} className="text-blue-600 dark:text-blue-400" />
                            </div>

                            <p className="font-medium text-blue-700 dark:text-blue-300 flex-1">
                                Vui lòng thực hiện nhập liệu lên{' '}
                                <span className="font-bold underline">hệ thống</span> đồng thời với việc trình ký{' '}
                                <span className="font-bold underline">bản giấy</span> để phục vụ công tác theo dõi
                                và lưu trữ dữ liệu đồng bộ.
                            </p>

                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                radius="full"
                                onPress={handleCloseAlert}
                                className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                                title="Đóng thông báo"
                            >
                                <X size={16} />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {showStatsCards && (
                    <div className="px-6">
                        <ProposeStats
                            show={true}
                            total={stats.total}
                            pending={stats.pending}
                            approved={stats.approved}
                            rejected={stats.rejected}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                <div className="sticky top-0 z-30 backdrop-blur-sm -mx-2 px-8 py-1">
                    <ProposeToolbar
                        showStatsCards={showStatsCards}
                        setShowStatsCards={setShowStatsCards}
                        viewType={viewType}
                        onViewTypeChange={setViewType}
                        search={search}
                        onSearch={setSearch}
                        onCreate={handleCreate}
                        selectedKeys={selectedKeys}
                        onOpenExport={handleExport}
                        onFilterChange={(key, value) => {
                            setFilters((prev: any) => ({ ...prev, [key]: value }))
                        }}
                        allColumns={allColumns}
                        visibleColumns={visibleColumns}
                        setVisibleColumns={setVisibleColumns}
                        onComment={() => {
                            setAllCommentsDrawerOpen(true)
                        }}
                        onOpenLoaiDeXuat={() => setIsLoaiDeXuatOpen(true)}
                        onTrash={() => setActiveTab(activeTab === 'trash' ? 'all' : 'trash')}
                        activeTab={activeTab}
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-sm overflow-hidden flex flex-col">
                    {viewType === 'table' ? (
                        <ProposeTable
                            data={data}
                            isLoading={isLoading}
                            page={page}
                            totalRecord={total}
                            totalRecordFiltered={recordsFiltered}
                            limit={limit}
                            onChangePage={setPage}
                            onChangeLimit={setLimit}
                            onRowClick={handleRowClick}
                            onViewDetail={(id) => {
                                const params = new URLSearchParams(searchParams)
                                params.set('id', id)
                                params.set('view', 'modal')
                                setSearchParams(params)
                                setDetailProposeId(id)
                                setDetailModalOpen(true)
                                setDrawerOpen(false)
                            }}
                            onApproveClick={handleApproveClick}
                            selectedKeys={selectedKeys}
                            onSelectionChange={setSelectedKeys}
                            columnWidths={columnWidths}
                            onColumnResize={setColumnWidths}
                            pinnedColumns={pinnedColumns}
                            onPinColumn={setPinnedColumns}
                            activeId={searchParams.get('id')}
                            visibleColumns={visibleColumns}
                            sortDescriptors={sortDescriptors}
                            onSortChange={setSortDescriptors}
                        />
                    ) : (
                        <ProposeListView
                            data={data}
                            isLoading={isLoading}
                            page={page}
                            totalRecordFiltered={recordsFiltered}
                            limit={limit}
                            onChangePage={setPage}
                            onChangeLimit={setLimit}
                            onRowClick={handleRowClick}
                            onViewDetail={(id) => {
                                const params = new URLSearchParams(searchParams)
                                params.set('id', id)
                                params.set('view', 'modal')
                                setSearchParams(params)
                                setDetailProposeId(id)
                                setDetailModalOpen(true)
                                setDrawerOpen(false)
                            }}
                            selectedKeys={selectedKeys}
                            onSelectionChange={setSelectedKeys}
                            activeId={searchParams.get('id')}
                        />
                    )}
                </div>
            </div>

            {/* Floating Action Button (FAB) - Mobile only */}
            <AnimatePresence>
                <motion.div
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="fixed bottom-8 right-8 z-60 md:hidden"
                >
                    <Button
                        color="primary"
                        radius="full"
                        onPress={handleCreate}
                        className="h-16 w-16 min-w-0 p-0 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white group"
                        title="Soạn đề xuất"
                    >
                        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                    </Button>
                </motion.div>
            </AnimatePresence>

            {/* Modals and Drawers */}
            {instances.map((instance) => (
                <CreateProposeModal
                    key={instance.id}
                    isOpen={instance.isOpen}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) closeInstance(instance.id)
                    }}
                    onSuccess={handleCreateSuccess}
                    onMinimize={() => minimizeInstance(instance.id)}
                    viewingData={instance.type === 'view' ? instance.data : undefined}
                    editingData={instance.type === 'edit' ? instance.data : undefined}
                />
            ))}

            {(() => {
                const minimizedInstances = instances.filter((i) => i.isMinimized)
                const MAX_VISIBLE = 3
                const visibleMinimizes = minimizedInstances.slice(0, MAX_VISIBLE)
                const overflowMinimizes = minimizedInstances.slice(MAX_VISIBLE)
                const hasMore = overflowMinimizes.length > 0

                return (
                    <>
                        {hasMore && (
                            <MinimizedMorePropose
                                items={overflowMinimizes}
                                onRestore={restoreInstance}
                                onClose={closeInstance}
                                style={{
                                    right: '40px',
                                    bottom: '0px',
                                    transition: 'right 0.3s ease-in-out'
                                }}
                            />
                        )}

                        {visibleMinimizes.map((instance, index) => {
                            const rightOffset = (hasMore ? 340 : 40) + index * 300
                            return (
                                <MinimizedDock
                                    key={instance.id}
                                    title={
                                        instance.type === 'create'
                                            ? 'Soạn đề xuất'
                                            : instance.data?.tieu_de || 'Chi tiết đề xuất'
                                    }
                                    onRestore={() => restoreInstance(instance.id)}
                                    onClose={() => closeInstance(instance.id)}
                                    style={{
                                        right: `${rightOffset}px`,
                                        bottom: '0px',
                                        transition: 'right 0.3s ease-in-out'
                                    }}
                                />
                            )
                        })}
                    </>
                )
            })()}

            <DrawerPropose
                open={drawerOpen}
                onClose={handleDrawerClose}
                data={drawerData}
                onReload={refetch}
                onExpand={() => {
                    if (detailProposeId) {
                        const params = new URLSearchParams(searchParams)
                        params.set('id', detailProposeId)
                        params.set('view', 'modal')
                        setSearchParams(params)
                        setDetailModalOpen(true)
                        setDrawerOpen(false)
                    }
                }}
            />

            <DrawerAllComments
                open={allCommentsDrawerOpen}
                onClose={() => setAllCommentsDrawerOpen(false)}
                onOpenDetail={(id) => {
                    const params = new URLSearchParams(searchParams)
                    params.set('id', id)
                    params.delete('view')
                    setSearchParams(params)
                    setDetailProposeId(id)
                    setDrawerOpen(true)
                    setDetailModalOpen(false)
                }}
            />

            <ApproveModal
                isOpen={approveModal.isOpen}
                onClose={() => setApproveModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmApprove}
                isReject={approveModal.type === 'reject'}
                isLoading={isApproving}
                entityId={approveModal.proposeId || undefined}
                verificationType="none"
            />

            <ProposeDetailModal
                isOpen={detailModalOpen}
                onOpenChange={(open) => {
                    if (!open) handleModalClose()
                }}
                proposeId={detailProposeId}
                onReload={refetch}
            />

            <LoaiDeXuatModal
                isOpen={isLoaiDeXuatOpen}
                onClose={() => setIsLoaiDeXuatOpen(false)}
            />

            <DrawerLichSuChung
                open={lichSuOpen}
                onClose={() => setLichSuOpen(false)}
                queryKey={['lich-su-dexuat']}
                apiUrl="admin/hrm/dexuat/view_log"
                title="Lịch sử chỉnh sửa"
            />
        </div>
    )
}
