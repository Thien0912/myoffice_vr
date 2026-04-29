/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
import ConfirmModal from '@renderer/components/ConfirmModal'
import { FilePreviewModal } from '@renderer/components/FilePreviewModal'
import MinimizedDock from '@renderer/components/MinimizedDock'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useNghiPhepStore } from '@renderer/store/useNghiPhepStore'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getLeaveColumns } from './columns'
import CreateLeaveRequestModal from './components/CreateLeaveRequestModal'
import LeaveRequestDetailDrawer from './components/LeaveRequestDetailDrawer'
import EmployeeLeaveQuota from './components/EmployeeLeaveQuota'
import ExportLeaveByDepartmentModal from './components/ExportLeaveByDepartmentModal'
import ExportNghiPhepModal from './components/ExportNghiPhepModal'
import ImportNghiPhepModal from './components/ImportNghiPhepModal'
import LeaveStats from './components/LeaveStats'
import LeaveTable from './components/LeaveTable'
import NghiPhepToolbar from './components/NghiPhepToolbar'
import ThongKeDonViTab from './components/statistics/ThongKeDonViTab'
import { useNghiPhep } from './hooks/useNghiPhep'

import { Button, cn, Skeleton, Tabs, toast } from '@heroui-v3/react'
import { nghiphepAxios } from '@renderer/api/hr/nghiphepAxios'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import { BarChart2, ChevronLeft, ChevronRight, Inbox, History, Search, X, LayoutDashboard, CircleQuestionMark } from 'lucide-react'
import SupplementMinhChungModal from './components/SupplementMinhChungModal'
import PhucKhaoModal from './components/PhucKhaoModal'
import { usePageActions } from '@renderer/hooks/usePageActions'
import { Tooltip } from '@heroui-v3/react'
import { useBreadcrumbMap } from '@renderer/store/useBreadcrumbMap'
import DrawerLichSuChung from '@renderer/components/DrawerLichSuChung'

const MemoizedNghiPhepToolbar = React.memo(NghiPhepToolbar)
const MemoizedLeaveTable = React.memo(LeaveTable)

// Sub-component to isolate state and prevent lag
const ApprovalModalBody = React.memo(
  ({
    confirmModal,
    setConfirmModal,
    approvers
  }: {
    confirmModal: any
    setConfirmModal: any
    approvers: any[]
  }) => {
    // Local state for all fields in the modal to prevent parent re-renders while typing
    const [localReason, setLocalReason] = React.useState(confirmModal.reason || '')
    const [localApproverId, setLocalApproverId] = React.useState(confirmModal.approverId || '')
    const [localProofFile, setLocalProofFile] = React.useState<File | null>(
      confirmModal.proofFile || null
    )

    // Debounce the update to parent state
    React.useEffect(() => {
      const timer = setTimeout(() => {
        setConfirmModal((prev: any) => {
          // Only update if something actually changed to avoid unnecessary parent re-renders
          if (
            prev.reason === localReason &&
            prev.approverId === localApproverId &&
            prev.proofFile === localProofFile
          ) {
            return prev
          }
          return {
            ...prev,
            reason: localReason,
            approverId: localApproverId,
            proofFile: localProofFile
          }
        })
      }, 300)

      return () => clearTimeout(timer)
    }, [localReason, localApproverId, localProofFile, setConfirmModal])

    if (confirmModal.isBulk) {
      return (
        <div className="flex flex-col gap-4 py-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
              Bạn đang thực hiện{' '}
              <span className="font-bold underline text-blue-800 dark:text-blue-200">
                {confirmModal.isOnBehalf
                  ? confirmModal.type === 'approve'
                    ? 'duyệt hộ'
                    : 'từ chối hộ'
                  : confirmModal.type === 'approve'
                    ? 'duyệt'
                    : 'từ chối'}
              </span>{' '}
              <span className="font-bold underline text-blue-800 dark:text-blue-200">
                {confirmModal.bulkUuids?.length}
              </span>{' '}
              đơn nghỉ phép đã chọn. Hành động này không thể hoàn tác.
            </p>
          </div>

          {confirmModal.isOnBehalf && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col gap-4">
              <SelectDropdown
                label={`Người chủ trì ${confirmModal.type === 'approve' ? 'duyệt' : 'từ chối'} hộ (Cấp 1) *`}
                placeholder="Chọn lãnh đạo (bắt buộc)"
                value={localApproverId ? String(localApproverId) : undefined}
                onChange={(val) => setLocalApproverId(val as string)}
                options={(Array.isArray(approvers) ? approvers : []).map((item: any) => ({
                  value: item.id_nguoi_duyet,
                  label: `${item.ho_ten} (${item.ma_nhan_vien})`
                }))}
              />

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minh chứng duyệt hộ (Hình ảnh - Áp dụng cho tất cả)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setLocalProofFile(file)
                  }}
                  className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                />
                {localProofFile && (
                  <p className="mt-1 text-xs text-green-600">Đã chọn: {localProofFile.name}</p>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <TextareaFloatingLabel
              label="Ghi chú / Lý do (áp dụng cho tất cả)"
              placeholder="Nhập ghi chú nếu có (không bắt buộc)..."
              value={localReason}
              onChange={setLocalReason}
              rows={3}
            />
          </div>
        </div>
      )
    }

    if (confirmModal.type === 'recall') {
      return (
        <div className="py-2">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
              Bạn có chắc chắn muốn <span className="font-bold">thu hồi</span> đơn nghỉ phép này
              không? Đơn sẽ bị xóa và bạn sẽ phải tạo lại nếu muốn gửi lại.
            </p>
          </div>
        </div>
      )
    }

    if (confirmModal.type === 'approve' || confirmModal.type === 'reject') {
      return (
        <div className="flex flex-col gap-4 py-2">
          <div
            className={cn(
              'p-4 rounded-lg border leading-relaxed',
              confirmModal.type === 'approve'
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
            )}
          >
            <p
              className={cn(
                'text-sm font-medium',
                confirmModal.type === 'approve'
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-red-700 dark:text-red-300'
              )}
            >
              Bạn có chắc chắn muốn{' '}
              <span className="font-bold underline">
                {confirmModal.isOnBehalf
                  ? confirmModal.type === 'approve'
                    ? 'duyệt hộ'
                    : 'từ chối hộ'
                  : confirmModal.type === 'approve'
                    ? 'duyệt'
                    : 'từ chối'}
              </span>{' '}
              đơn nghỉ phép này không? Hành động này không thể hoàn tác.
            </p>
          </div>

          {confirmModal.isOnBehalf && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col gap-4">
              <SelectDropdown
                label={`Người chủ trì ${confirmModal.type === 'approve' ? 'duyệt' : 'từ chối'} hộ (Cấp 1) *`}
                placeholder="Chọn lãnh đạo (bắt buộc)"
                value={localApproverId ? String(localApproverId) : undefined}
                onChange={(val) => setLocalApproverId(val as string)}
                options={(Array.isArray(approvers) ? approvers : []).map((item: any) => ({
                  value: item.id_nguoi_duyet,
                  label: `${item.ho_ten} (${item.ma_nhan_vien})`
                }))}
              />

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minh chứng duyệt hộ (Hình ảnh)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setLocalProofFile(file)
                  }}
                  className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                />
                {localProofFile && (
                  <p className="mt-1 text-xs text-green-600">Đã chọn: {localProofFile.name}</p>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <TextareaFloatingLabel
              label="Ghi chú / Lý do"
              placeholder="Nhập ghi chú nếu có (không bắt buộc)..."
              value={localReason}
              onChange={setLocalReason}
              rows={3}
            />
          </div>
        </div>
      )
    }

    return null
  }
)

export default function NghiPhepPage() {
  const {
    showStatsCards,
    setShowStatsCards,
    showQuotaGrid,
    setShowQuotaGrid,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isCreateModalMinimized,
    setIsCreateModalMinimized,
    isDrawerOpen,
    setIsDrawerOpen,
    page,
    setPage,
    limit,
    setLimit,
    selectedKeys,
    setSelectedKeys,
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    paginatedData,
    confirmModal,
    handleConfirmAction,
    handleBulkAction,
    handleBulkApproveOnBehalf,
    setConfirmModal,
    openConfirm,
    search,
    setSearch,
    filter,
    setFilter,
    sortDescriptors,
    setSortDescriptors,
    recordsFiltered,
    isLoading,
    editingRow,
    setEditingRow,
    handleEdit,
    handleView,
    handleRecall,
    isApproving,
    approveActionType,
    viewingRow,
    setViewingRow,
    month,
    year,
    visibleColumns,
    setVisibleColumns,
    columnWidths,
    setColumnWidths,
    pinnedColumns,
    setPinnedColumns,
    handleExport,
    handleExportByEmployee,
    handleDownloadTemplate,
    handleImport,
    isExporting,
    isDownloadingTemplate,
    isImporting,
    isExportModalOpen,
    setIsExportModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isMinhChungModalOpen,
    setIsMinhChungModalOpen,
    minhChungRow,
    handleMinhChung,
    minhChungMutation,
    permissions,
    approvers,
    isPhucKhaoModalOpen,
    setIsPhucKhaoModalOpen,
    phucKhaoRow,
    handlePhucKhao,
    handleConfirmPhucKhao,
    isPhucKhaoLoading
  } = useNghiPhep()

  const { user } = useAuthStore()
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; ext: string } | null>(
    null
  )

  const [isExportByDeptModalOpen, setIsExportByDeptModalOpen] = useState(false)
  const [isExportingByDept, setIsExportingByDept] = useState(false)

  // Handler xuất đơn theo đơn vị
  const handleExportByDepartment = async (employeeIds: string[]) => {
    if (!employeeIds || employeeIds.length === 0) {
      toast('Cảnh báo', { description: 'Vui lòng chọn ít nhất một nhân viên', variant: 'warning' })
      return
    }

    setIsExportingByDept(true)
    try {
      const response = await nghiphepAxios.exportByEmployeeIds({
        year,
        employee_ids: employeeIds.join(',')
      })

      if (response?.success && response?.data) {
        // Download file - Tự động phát hiện extension từ URL
        const link = document.createElement('a')
        link.href = response.data
        link.setAttribute('target', '_blank')

        // Lấy tên file từ URL hoặc tạo tên mặc định
        const urlPath = response.data.split('/').pop() || ''
        const fileName = urlPath || `Don_nghi_phep_${new Date().getTime()}.zip`
        link.setAttribute('download', fileName)

        document.body.appendChild(link)
        link.click()
        link.remove()

        // Hiển thị thông báo với thông tin chi tiết từ backend
        const summary = response?.summary
        let description =
          response?.message || `Đã xuất đơn nghỉ phép của ${employeeIds.length} nhân viên`

        if (summary) {
          description = `Thành công ${summary.success}/${summary.total} nhân viên`
          if (summary.failed > 0) {
            description += ` (${summary.failed} lỗi)`
          }
        }

        toast('Thành công', {
          description: description,
          variant: summary?.failed > 0 ? 'warning' : 'success'
        })

        setIsExportByDeptModalOpen(false)
      } else {
        toast('Thất bại', {
          description: response?.message || 'Có lỗi xảy ra khi xuất đơn nghỉ phép',
          variant: 'danger'
        })
      }
    } catch (error: any) {
      console.error('Export error:', error)
      toast('Lỗi', {
        description: error?.response?.data?.message || 'Có lỗi khi kết nối server',
        variant: 'danger'
      })
    } finally {
      setIsExportingByDept(false)
    }
  }

  // const permissions = {
  //   canApproveLevel1:
  //     Number(user?.ql_nguoi_dung_is_admin) === 1 || user?.loai_lanh_dao === 'LANH_DAO_DON_VI',
  //   canApproveLevel2:
  //     Number(user?.ql_nguoi_dung_is_admin) === 1 || user?.loai_lanh_dao === 'LANH_DAO_TCHC'
  // }

  const handlePreviewFile = React.useCallback(
    (url: string, name: string, ext: string) => setPreviewFile({ url, name, ext }),
    []
  )

  const allColumns = useMemo(
    () =>
      getLeaveColumns(
        openConfirm,
        handleEdit,
        handleView,
        handleRecall,
        handleMinhChung,
        handlePreviewFile,
        permissions,
        user?.ql_nguoi_dung_id,
        handlePhucKhao
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permissions, user?.ql_nguoi_dung_id]
  )

  const columns = useMemo(() => {
    if (!visibleColumns || visibleColumns.length === 0) return allColumns
    return allColumns.filter((col) => visibleColumns.includes(col.uid))
  }, [allColumns, visibleColumns])

  const selectedRows = useMemo(() => {
    if (!selectedKeys || selectedKeys === 'all') return []
    const keysArray = Array.from(selectedKeys)
    return paginatedData.filter((item: any) => keysArray.includes(String(item.id_nghi_phep)))
  }, [selectedKeys, paginatedData])

  const [quotaCount, setQuotaCount] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isQuotaCollapsed, setIsQuotaCollapsed] = useState(true)
  const [isQuotaSearchOpen, setIsQuotaSearchOpen] = useState(false)
  const [quotaSearchValue, setQuotaSearchValue] = useState('')
  const [quotaSearchDebounced, setQuotaSearchDebounced] = useState('')
  const quotaSearchInputRef = useRef<HTMLInputElement>(null)
  const { activeTab, setActiveTab } = useNghiPhepStore()
  const [hasActivatedTab2, setHasActivatedTab2] = useState(activeTab === 'tab2')

  const handleSetActiveTab = useCallback(
    (tab: string) => {
      // Bước 1: Chuyển tab UI ngay lập tức (render nhẹ - chỉ đổi visibility)
      setActiveTab(tab)

      // Bước 2: Mount component nặng SAU KHI browser đã paint frame mới
      if (tab === 'tab2') {
        requestAnimationFrame(() => {
          setHasActivatedTab2(true)
        })
      }
    },
    [setActiveTab]
  )

  const isSuperAdmin =
    Number(user?.ql_nguoi_dung_is_admin) === 1 ||
    user?.vai_tro?.some((r) => r.ql_ma_vai_tro === 'SUPER_ADMIN')

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Debounce quota search
  useEffect(() => {
    const timer = setTimeout(() => setQuotaSearchDebounced(quotaSearchValue), 300)
    return () => clearTimeout(timer)
  }, [quotaSearchValue])
  const breadcrumb = useBreadcrumbMap()
  const currentBreadcrumb = breadcrumb[breadcrumb.length - 1]
  const descriptionLabel = currentBreadcrumb?.description || 'Quản lý ngày nghỉ phép của nhân viên'

  const [isLichSuOpen, setIsLichSuOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2 w-full relative">
      <div className="flex items-center justify-between py-4 px-6 md:px-7">
        <div className="flex items-center gap-2">
          <h1 className="text-lg xl:text-xl font-medium text-gray-900 dark:text-gray-100 transition-colors">
            Nghỉ phép
          </h1>
          {descriptionLabel && (
            <Tooltip delay={0}>
              <Button isIconOnly variant="ghost" size="sm" className="rounded-full w-8 h-8 min-w-8 text-gray-500">
                <CircleQuestionMark size={18} />
              </Button>
              <Tooltip.Content>
                <p>{descriptionLabel}</p>
              </Tooltip.Content>
            </Tooltip>
          )}
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>
          <Tooltip delay={0}>
            <Button
              variant={showStatsCards ? 'ghost' : 'outline'}
              isIconOnly
              size="sm"
              className={`rounded-full w-8 h-8 min-w-8 ${showStatsCards ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''}`}
              onPress={() => setShowStatsCards(!showStatsCards)}
            >
              <LayoutDashboard size={15} />
            </Button>
            <Tooltip.Content>
              <p>{showStatsCards ? 'Ẩn thống kê' : 'Hiện thống kê'}</p>
            </Tooltip.Content>
          </Tooltip>
        </div>

        <Tooltip delay={0}>
          <Button
            variant="outline"
            isIconOnly
            className="rounded-full w-8 h-8 min-w-8 text-gray-500"
            onPress={() => setIsLichSuOpen(true)}
          >
            <History size={15} />
          </Button>
          <Tooltip.Content>
            <p>Lịch sử chỉnh sửa</p>
          </Tooltip.Content>
        </Tooltip>
      </div>

      <LeaveStats
        show={showStatsCards}
        total={totalRequests}
        pending={pendingRequests}
        approved={approvedRequests}
        rejected={rejectedRequests}
      />

      <div className="bg-white flex flex-col">
        <div className="z-30 dark:bg-gray-900/95 pt-0 pb-1 w-full px-2">
          <MemoizedNghiPhepToolbar
            showStatsCards={showStatsCards}
            setShowStatsCards={setShowStatsCards}
            showQuotaSidebar={showQuotaGrid && !isQuotaCollapsed}
            setShowQuotaSidebar={useCallback((val) => {
              setShowQuotaGrid(val)
              if (val) setIsQuotaCollapsed(false)
            }, [])}
            onSearch={setSearch}
            searchValue={search}
            onCreate={useCallback(() => {
              setEditingRow(null)
              setIsCreateModalOpen(true)
              setIsCreateModalMinimized(false)
            }, [])}
            selectedKeys={selectedKeys}
            onBulkAction={handleBulkAction}
            canShowQuota={
              permissions.canApproveLevel1 || permissions.canApproveLevel2 || permissions.canStats
            }
            filter={filter}
            onFilterChange={setFilter}
            allColumns={allColumns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            onOpenExport={useCallback(() => setIsExportModalOpen(true), [])}
            onExportByEmployee={useCallback(() => handleExportByEmployee({ year }), [year])}
            onExportByDepartment={useCallback(() => setIsExportByDeptModalOpen(true), [])}
            onOpenImport={useCallback(() => setIsImportModalOpen(true), [])}
            isExporting={isExporting}
            canExport={permissions.canExportExcel}
            canExportDoc={permissions.canExportDoc}
            canImport={permissions.canImport}
            canApprove={permissions.canApproveLevel1 || permissions.canApproveLevel2}
            canApproveOnBehalf={permissions.canApproveOnBehalf}
            onBulkApproveOnBehalf={handleBulkApproveOnBehalf}
            canViewDonViFilter={permissions.canViewDonViFilter}
            isQuotaCollapsed={isQuotaCollapsed}
            onToggleQuotaCollapse={useCallback(() => setIsQuotaCollapsed((v) => !v), [])}
            onClearSelection={useCallback(() => setSelectedKeys(new Set()), [setSelectedKeys])}
            isTab2={activeTab === 'tab2'}
            selectedRows={selectedRows}
            currentUserId={user?.ql_nguoi_dung_id}
            onEdit={handleEdit}
            onView={handleView}
            onRecall={handleRecall}
            onMinhChung={handleMinhChung}
            onPhucKhao={handlePhucKhao}
          />
        </div>

        <div className="flex flex-row relative px-0">
          {showQuotaGrid &&
            (permissions.canApproveLevel1 ||
              permissions.canApproveLevel2 ||
              permissions.canStats) && (
              <>
                {/* Mobile overlay */}
                {isMobile && !isQuotaCollapsed && (
                  <div
                    className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-[1px]"
                    onClick={() => setShowQuotaGrid(false)}
                  />
                )}

                {/* Mobile: drawer từ trái */}
                {isMobile ? (
                  !isQuotaCollapsed && (
                    <div
                      key="quota-mobile"
                      className="fixed top-0 left-0 bottom-0 z-[101] w-[280px] bg-white dark:bg-gray-800 flex flex-col shadow-2xl"
                    >
                      <div className="border-b border-gray-100 dark:border-gray-700 flex-none px-3 py-1 bg-gray-200 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          {isQuotaSearchOpen ? (
                            <div className="flex items-center gap-1 flex-1 mr-1">
                              <input
                                ref={quotaSearchInputRef}
                                type="text"
                                value={quotaSearchValue}
                                onChange={(e) => setQuotaSearchValue(e.target.value)}
                                placeholder="Tìm nhân viên..."
                                className="flex-1 h-7 px-2 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-colors"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  setIsQuotaSearchOpen(false)
                                  setQuotaSearchValue('')
                                }}
                                className="cursor-pointer w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight whitespace-nowrap">
                                Tổng hợp{' '}
                                <span className="ml-1 text-xs font-normal text-gray-500 normal-case">
                                  ({quotaCount} NS)
                                </span>
                              </span>
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() => {
                                    setIsQuotaSearchOpen(true)
                                    setTimeout(() => quotaSearchInputRef.current?.focus(), 50)
                                  }}
                                  className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  title="Tìm nhân viên"
                                >
                                  <Search size={14} />
                                </button>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  onPress={() => setShowQuotaGrid(false)}
                                >
                                  <ChevronLeft size={16} />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        <EmployeeLeaveQuota
                          startDate={filter.dateRange?.from || ''}
                          endDate={filter.dateRange?.to || ''}
                          id_don_vi={filter.id_don_vi}
                          onLoad={setQuotaCount}
                          isCollapsed={false}
                          search={quotaSearchDebounced}
                        />
                      </div>
                    </div>
                  )
                ) : (
                  /* Desktop: collapse thành dải hẹp (chỉ lề) */
                  <div
                    key="quota-desktop"
                    className={`flex-none bg-white dark:bg-gray-800 flex flex-col max-h-[calc(100dvh-170px)] overflow-hidden ${isQuotaCollapsed ? 'w-10' : 'w-[280px]'}`}
                  >
                    {/* Header dùng chung cho cả 2 trạng thái */}
                    <div
                      className={`border-b border-gray-100 dark:border-gray-700 flex-none bg-gray-200 dark:bg-gray-800/50 ${isQuotaCollapsed ? 'px-0 py-0 h-10' : 'px-3 py-1'}`}
                    >
                      <div
                        className={`flex items-center h-full ${isQuotaCollapsed ? 'justify-center' : 'justify-between'}`}
                      >
                        {!isQuotaCollapsed && (
                          isQuotaSearchOpen ? (
                            <div className="flex items-center gap-1 flex-1 mr-1 min-w-0">
                              <input
                                ref={quotaSearchInputRef}
                                type="text"
                                value={quotaSearchValue}
                                onChange={(e) => setQuotaSearchValue(e.target.value)}
                                placeholder="Tìm nhân viên..."
                                className="flex-1 min-w-0 h-7 px-2 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-colors"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  setIsQuotaSearchOpen(false)
                                  setQuotaSearchValue('')
                                }}
                                className="cursor-pointer w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight whitespace-nowrap overflow-hidden">
                              Tổng hợp{' '}
                              <span className="ml-1 text-xs font-normal text-gray-500 normal-case">
                                ({quotaCount} NS)
                              </span>
                            </span>
                          )
                        )}
                        <div className={`flex items-center gap-0.5 shrink-0 ${isQuotaCollapsed ? 'w-full h-full' : ''}`}>
                          {!isQuotaCollapsed && !isQuotaSearchOpen && (
                            <button
                              onClick={() => {
                                setIsQuotaSearchOpen(true)
                                setTimeout(() => quotaSearchInputRef.current?.focus(), 50)
                              }}
                              className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title="Tìm nhân viên"
                            >
                              <Search size={14} />
                            </button>
                          )}
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            className={
                              isQuotaCollapsed
                                ? 'w-10 h-10 min-w-10 rounded-none'
                                : 'min-w-0 rounded-md'
                            }
                            onPress={() => {
                              setIsQuotaCollapsed(!isQuotaCollapsed)
                              if (!isQuotaCollapsed) {
                                setIsQuotaSearchOpen(false)
                                setQuotaSearchValue('')
                              }
                            }}
                          >
                            {isQuotaCollapsed ? (
                              <ChevronRight size={16} />
                            ) : (
                              <ChevronLeft size={16} />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Nội dung bên dưới - chỉ hiện khi mở */}
                    <div
                      className={`flex-1 overflow-y-auto p-2 custom-scrollbar ${isQuotaCollapsed ? 'hidden' : 'block'}`}
                    >
                      <EmployeeLeaveQuota
                        startDate={filter.dateRange?.from || ''}
                        endDate={filter.dateRange?.to || ''}
                        id_don_vi={filter.id_don_vi}
                        onLoad={setQuotaCount}
                        isCollapsed={false}
                        search={quotaSearchDebounced}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

          {/* Tab content - chứa cả tab 1 và tab 2 */}
          <div
            className={`flex flex-col flex-1 min-w-0 sm:px-2 ${activeTab === 'tab1' ? 'max-h-[calc(100dvh-170px)] overflow-hidden' : ''}`}
          >
            {/* Vùng chứa các Tab */}
            <div className="relative flex-1 min-w-0 overflow-hidden h-full">
              <Tabs
                aria-label="Tabs nghỉ phép"
                selectedKey={activeTab}
                onSelectionChange={(key) => handleSetActiveTab(key.toString())}
                className="flex flex-col h-full gap-0"
              >
                {/* Tab switcher - Gmail style */}
                {isSuperAdmin && (
                  <div className="flex-none border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/95 sticky top-0 z-20">
                    <div className="max-w-md">
                      <Tabs.List className="gap-0 p-0 relative rounded-none bg-transparent">
                        <Tabs.Tab
                          id="tab1"
                          className="px-4 h-12 rounded-none bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-600 data-[selected=true]:text-[#0b57d0] data-[selected=true]:border-b-[3px] data-[selected=true]:border-[#0b57d0]"
                        >
                          <div className="flex items-center space-x-2">
                            <Inbox size={18} />
                            <span>Danh sách đơn</span>
                          </div>
                        </Tabs.Tab>
                        <Tabs.Tab
                          id="tab2"
                          className="px-4 h-12 rounded-none bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-600 data-[selected=true]:text-[#0b57d0] data-[selected=true]:border-b-[3px] data-[selected=true]:border-[#0b57d0]"
                        >
                          <div className="flex items-center space-x-2">
                            <BarChart2 size={18} />
                            <span>Thống kê đơn vị</span>
                          </div>
                        </Tabs.Tab>
                      </Tabs.List>
                    </div>
                  </div>
                )}

                <div className="relative flex-1 min-w-0 overflow-hidden h-full">
                  <Tabs.Panel id="tab1" className="flex flex-col h-full relative p-0">
                    {/* Sử dụng skeleton mặc định của bảng */}
                    <MemoizedLeaveTable
                      columns={columns}
                      data={paginatedData}
                      isLoading={isLoading}
                      page={page}
                      total={totalRequests}
                      filtered={recordsFiltered}
                      limit={limit}
                      selectedKeys={selectedKeys}
                      sortDescriptors={sortDescriptors}
                      onSelectionChange={setSelectedKeys}
                      onSortChange={setSortDescriptors}
                      onChangePage={setPage}
                      onChangeLimit={setLimit}
                      columnWidths={columnWidths}
                      onColumnResize={setColumnWidths}
                      onPinColumn={setPinnedColumns}
                      pinnedColumns={pinnedColumns}
                      isActive={activeTab === 'tab1'}
                      selectionMode={permissions.canApprove ? 'multiple' : 'single'}
                    />
                  </Tabs.Panel>
                  <Tabs.Panel id="tab2" className="flex flex-col h-full p-0">
                    {hasActivatedTab2 ? (
                      <ThongKeDonViTab filter={filter} active={activeTab === 'tab2'} />
                    ) : (
                      /* Skeleton cho tab thống kê khi đang mount */
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Skeleton className="h-24 rounded-xl" />
                          <Skeleton className="h-24 rounded-xl" />
                          <Skeleton className="h-24 rounded-xl" />
                        </div>
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-3/4 rounded-lg" />
                          <Skeleton className="h-4 w-1/2 rounded-lg" />
                        </div>
                      </div>
                    )}
                  </Tabs.Panel>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Docks */}
      <CreateLeaveRequestModal
        isOpen={isCreateModalOpen && !isCreateModalMinimized}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open)
          if (!open) {
            setEditingRow(null)
            setViewingRow(null)
          }
        }}
        onMinimize={() => setIsCreateModalMinimized(true)}
        onSuccess={() => { }}
        editingData={editingRow}
        onPreviewFile={handlePreviewFile}
      />

      <LeaveRequestDetailDrawer
        isOpen={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open)
          if (!open) {
            setViewingRow(null)
          }
        }}
        viewingData={viewingRow}
        openConfirm={openConfirm}
        permissions={permissions}
        isApproving={isApproving}
        approveActionType={approveActionType}
        onSupplementMinhChung={handleMinhChung}
        onPreviewFile={handlePreviewFile}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmAction}
        size="md"
        title={
          confirmModal.isOnBehalf
            ? confirmModal.type === 'approve'
              ? 'Xác nhận duyệt hộ' + (confirmModal.isBulk ? ' hàng loạt' : '')
              : 'Xác nhận từ chối hộ' + (confirmModal.isBulk ? ' hàng loạt' : '')
            : confirmModal.isBulk
              ? confirmModal.type === 'approve'
                ? 'Xác nhận duyệt hàng loạt'
                : 'Xác nhận từ chối hàng loạt'
              : confirmModal.type === 'recall'
                ? 'Xác nhận thu hồi đơn'
                : confirmModal.type === 'approve'
                  ? 'Xác nhận duyệt'
                  : 'Xác nhận từ chối'
        }
        content={
          <ApprovalModalBody
            confirmModal={confirmModal}
            setConfirmModal={setConfirmModal}
            approvers={approvers}
          />
        }
        confirmText={
          confirmModal.isOnBehalf
            ? confirmModal.type === 'approve'
              ? 'Xác nhận duyệt hộ ngay'
              : 'Xác nhận từ chối hộ ngay'
            : confirmModal.isBulk
              ? confirmModal.type === 'approve'
                ? 'Xác nhận duyệt ngay'
                : 'Xác nhận từ chối ngay'
              : confirmModal.type === 'recall'
                ? 'Thu hồi đơn'
                : confirmModal.type === 'approve'
                  ? 'Duyệt đơn'
                  : 'Từ chối'
        }
        isDanger={confirmModal.type === 'reject' || confirmModal.type === 'recall'}
      />

      {
        isCreateModalMinimized && (
          <MinimizedDock
            title="Đơn nghỉ phép mới"
            onClose={() => {
              setIsCreateModalMinimized(false)
              setIsCreateModalOpen(false)
            }}
            onRestore={() => setIsCreateModalMinimized(false)}
          />
        )
      }

      <FilePreviewModal
        isOpen={!!previewFile}
        onOpenChange={() => setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name}
        extension={previewFile?.ext}
      />

      <ExportNghiPhepModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isExporting}
        initialValues={{
          year,
          month,
          id_loai_phep: filter.id_loai_phep,
          trang_thai: filter.trang_thai,
          id_don_vi: filter.id_don_vi
        }}
      />

      <ImportNghiPhepModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        onDownloadTemplate={handleDownloadTemplate}
        isImporting={isImporting}
        isDownloadingTemplate={isDownloadingTemplate}
      />

      <SupplementMinhChungModal
        isOpen={isMinhChungModalOpen}
        onOpenChange={setIsMinhChungModalOpen}
        row={minhChungRow}
        isLoading={minhChungMutation.isPending}
        onSuccess={(uuid, file) =>
          minhChungMutation.mutate({ uuid_nghi_phep: uuid, minh_chung: file })
        }
      />

      <ExportLeaveByDepartmentModal
        isOpen={isExportByDeptModalOpen}
        onClose={() => setIsExportByDeptModalOpen(false)}
        onExport={handleExportByDepartment}
        isExporting={isExportingByDept}
      />

      {/* Modal Phúc Khảo */}
      <PhucKhaoModal
        isOpen={isPhucKhaoModalOpen}
        onClose={() => setIsPhucKhaoModalOpen(false)}
        row={phucKhaoRow}
        onConfirm={handleConfirmPhucKhao}
        isLoading={isPhucKhaoLoading}
      />

      <DrawerLichSuChung
        open={isLichSuOpen}
        onClose={() => setIsLichSuOpen(false)}
        apiUrl="admin/hrm/nghiphep/view_log"
        queryKey={['nghiphep_history', String(year), String(month)]}
      />
    </div >
  )
}
