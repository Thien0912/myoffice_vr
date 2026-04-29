import { Button, toast } from "@heroui-v3/react"
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { HrPrimaryButton, HrTextarea } from '@renderer/components/hero-custom'
import { useNgoaiGioStore } from '@renderer/store/useNgoaiGioStore'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar as CalendarIcon, CheckCircle2, Filter, History, LayoutGrid, Table2 as Table2Icon, XCircle, X as XIcon } from 'lucide-react'
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CreateOvertimeDrawer from './components/CreateOvertimeDrawer'
import MobileFilterSheet from './components/MobileFilterSheet'
import { OvertimeDetailDrawer } from './components/OvertimeDetailDrawer'
import OvertimeSummaryCards from './components/OvertimeSummaryCards'
import OvertimeToolbar, { type OvertimeViewMode } from './components/OvertimeToolbar'
import TimesheetSelector from './components/TimesheetSelector'
import { useNgoaiGioPermissions } from './hooks/useNgoaiGioPermissions'
import { OvertimeRequest } from './types'
import { OvertimeQuickEditModal } from './components/OvertimeQuickEditModal'


// Lazy load heavy components — parse only when needed
const AdminOvertimeGrid = lazy(() => import('./components/AdminOvertimeGridView'))
const LeaderMonthCalendar = lazy(() => import('./components/LeaderMonthCalendar'))
const LeaderOvertimeView = lazy(() => import('./components/LeaderOvertimeView'))
const EmployeeOvertimeCalendar = lazy(() => import('./components/EmployeeOvertimeCalendar'))

const HistoryDrawer = lazy(() => import('./components/HistoryDrawer'))


type ConfirmModalType = 'approve' | 'reject' | 'delete'
interface ConfirmModalState {
  isOpen: boolean
  type: ConfirmModalType
  isBulk: boolean
  id?: number
  bulkIds?: number[]
}

const OvertimeApprovalModalBody = React.memo(
  ({
    confirmModal,
    localReason,
    setLocalReason
  }: {
    confirmModal: ConfirmModalState
    localReason: string
    setLocalReason: (val: string) => void
  }) => {
    const isApprove = confirmModal.type === 'approve'

    return (
      <div className="flex flex-col gap-4 py-2">
        {confirmModal.isBulk ? (
          <div
            className={`p-4 rounded-lg border leading-relaxed ${isApprove
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
              }`}
          >
            <p
              className={`text-sm font-medium ${isApprove ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'
                }`}
            >
              Bạn đang thực hiện{' '}
              <span className="font-bold underline">
                {isApprove ? 'duyệt' : 'từ chối'}
              </span>{' '}
              <span className="font-bold underline">
                {confirmModal.bulkIds?.length}
              </span>{' '}
              đơn ngoài giờ đã chọn. Hành động này không thể hoàn tác.
            </p>
          </div>
        ) : (
          <div
            className={`p-4 rounded-lg border leading-relaxed ${isApprove
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
              }`}
          >
            <p
              className={`text-sm font-medium ${isApprove ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'
                }`}
            >
              Bạn có chắc chắn muốn{' '}
              <span className="font-bold underline">
                {isApprove ? 'duyệt' : 'từ chối'}
              </span>{' '}
              đơn ngoài giờ này không? Hành động này không thể hoàn tác.
            </p>
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <HrTextarea
            label={confirmModal.isBulk ? "Lý do (áp dụng cho tất cả)" : "Ghi chú"}
            placeholder=""
            value={localReason}
            onChange={(val) => setLocalReason(val)}
          />
        </div>
      </div>
    )
  }
)


export default function NgoaiGioPage() {
  const { canViewManagement, canApprove, canCreate, canViewAll } = useNgoaiGioPermissions()

  // Employee view (no management permission)
  if (!canViewManagement) {
    return (
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}>
        <EmployeeOvertimeCalendar />
      </Suspense>
    )
  }

  const queryClient = useQueryClient()
  const {
    search,
    filter,
    setFilter,
    showTotalHoursColumn,
    setIsOpenDetail,
    setSelectedRequest
  } = useNgoaiGioStore()

  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearch = searchParams.get('search') || ''

  const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set())
  const selectedRequestsRef = useRef(selectedRequests)
  selectedRequestsRef.current = selectedRequests
  const [viewMode, setViewMode] = useState<OvertimeViewMode>('table')
  const [calendarViewType, setCalendarViewType] = useState<'week' | 'month'>('month')
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    type: 'approve',
    isBulk: false
  })
  const [localReason, setLocalReason] = useState('')
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false)

  // Dept filter options — only fetched for admin (canViewAll)
  const { data: donViOptions = [] } = useQuery({
    queryKey: ['donViGroupedOptions'],
    queryFn: mapDonviGroupedOptions,
    enabled: canViewAll,
    staleTime: 5 * 60 * 1000,
  })

  const [tablePage, setTablePage] = useState(1)
  const [tableLimit, setTableLimit] = useState(50)
  const [tableSortDescriptors, setTableSortDescriptors] = useState<{ column: string; direction: 'ascending' | 'descending' }[]>([])

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(['stt', 'ngay_dang_ky', 'so_gio', 'nhan_vien', 'duyet_don_vi', 'duyet_to_chuc', 'trang_thai_tong', 'is_dotxuat', 'tao_ho', 'noi_dung', 'chi_tiet', 'ly_do_huy', 'created_at', 'updated_at'])
  )
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'stt', 'ngay_dang_ky', 'so_gio', 'nhan_vien', 'duyet_don_vi', 'duyet_to_chuc', 'trang_thai_tong', 'is_dotxuat', 'tao_ho', 'noi_dung', 'chi_tiet', 'ly_do_huy', 'created_at', 'updated_at'
  ])

  const configColumns = useMemo(() => [
    { uid: 'stt', name: '#' },
    { uid: 'ngay_dang_ky', name: 'Ngày đăng ký' },
    { uid: 'so_gio', name: 'Số giờ' },
    { uid: 'nhan_vien', name: 'Nhân viên' },
    { uid: 'duyet_don_vi', name: 'Duyệt đơn vị' },
    { uid: 'duyet_to_chuc', name: 'Duyệt tổ chức' },
    { uid: 'trang_thai_tong', name: 'Trạng thái tổng' },
    { uid: 'is_dotxuat', name: 'Loại đăng ký' },
    { uid: 'tao_ho', name: 'Người tạo' },
    { uid: 'noi_dung', name: 'Tiêu đề' },
    { uid: 'chi_tiet', name: 'Chi tiết' },
    { uid: 'ly_do_huy', name: 'Lý do hủy' },
    { uid: 'created_at', name: 'Thời gian tạo' },
    { uid: 'updated_at', name: 'Thời gian cập nhật' }
  ], [])

  const [excelPage, setExcelPage] = useState(1)
  const EXCEL_PAGE_SIZE = 200

  const approveMutation = useMutation({
    mutationFn: (params: { ids: number[]; action: 'duyet' | 'tu_choi'; reason?: string; isBulk?: boolean }) => {
      const payload: Record<string, any> = {
        hanh_dong: params.action,
        ly_do_duyet: params.reason
      }
      if (params.isBulk) {
        payload.ids_ngoai_gio = params.ids
      } else {
        payload.id_ngoai_gio = params.ids[0]
      }
      return ngoaiGioAxios.approve(payload as any)
    },
    onSuccess: async (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
      queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioEmployee'] })
      queryClient.invalidateQueries({ queryKey: ['ngoaigio-statistics'] })
      setSelectedRequests(new Set())
      setConfirmModal((prev) => ({ ...prev, isOpen: false }))

      // Refetch detail nếu drawer đang mở
      const currentSelectedId = useNgoaiGioStore.getState().selectedRequest?.id_ngoai_gio
      if (currentSelectedId && useNgoaiGioStore.getState().isOpenDetail) {
        setIsDetailLoading(true)
        try {
          const response = await ngoaiGioAxios.getDetail(currentSelectedId)
          if (response?.status) {
            setSelectedRequest(response.data)
          }
        } catch (err) {
          console.error('Failed to refetch detail:', err)
        } finally {
          setIsDetailLoading(false)
        }
      }

      const data = res?.data
      const failDetails = (data?.details || []).filter((d: any) => !d.success)
      const failMessages = failDetails.map((d: any) => d.message).filter(Boolean)

      if (data?.fail_count > 0) {
        if (data.success_count === 0) {
          // Tất cả đều thất bại → hiện message cụ thể
          const desc = failMessages.length === 1
            ? failMessages[0]
            : failMessages.length > 1
              ? `${failMessages[0]}${failMessages.length > 1 ? ` (và ${failMessages.length - 1} đơn khác)` : ''}`
              : `Thất bại: ${data.fail_count} đơn`
          toast('Thất bại', { description: desc, variant: 'danger' })
        } else {
          // Một phần thành công
          const desc = failMessages.length > 0
            ? `Thành công: ${data.success_count}, Thất bại: ${data.fail_count} — ${failMessages[0]}`
            : `Thành công: ${data.success_count}, Thất bại: ${data.fail_count}`
          toast('Cảnh báo', { description: desc, variant: 'warning' })
        }
      } else {
        toast('Thành công', { description: `Xử lý phê duyệt thành công${data?.success_count > 1 ? ` (${data.success_count} đơn)` : ''}`, variant: 'success' })
      }
    },
    onError: (err: any) => {
      toast('Lỗi', { description: err?.message || 'Không thể thực hiện phê duyệt', variant: 'danger' })
    }
  })

  const handleSelectRequest = useCallback((reqId: number, selected: boolean) => {
    setSelectedRequests((prev) => {
      const next = new Set(prev)
      if (selected) {
        next.add(reqId)
      } else {
        next.delete(reqId)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback((ids: number[], selected: boolean) => {
    setSelectedRequests((prev) => {
      const next = new Set(prev)
      if (selected) {
        ids.forEach(id => next.add(id))
      } else {
        ids.forEach(id => next.delete(id))
      }
      return next
    })
  }, [])

  const handleBulkApprove = useCallback(() => {
    const current = selectedRequestsRef.current
    if (current.size === 0) return
    setConfirmModal({
      isOpen: true,
      type: 'approve',
      isBulk: true,
      bulkIds: Array.from(current)
    })
    setLocalReason('')
  }, [])

  const handleBulkReject = useCallback(() => {
    const current = selectedRequestsRef.current
    if (current.size === 0) return
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      isBulk: true,
      bulkIds: Array.from(current)
    })
    setLocalReason('')
  }, [])

  const handleConfirmAction = useCallback(() => {
    if (confirmModal.type === 'approve' || confirmModal.type === 'reject') {
      const ids = confirmModal.isBulk ? confirmModal.bulkIds || [] : confirmModal.id ? [confirmModal.id] : []
      if (ids.length === 0) return

      approveMutation.mutate({
        ids,
        action: confirmModal.type === 'approve' ? 'duyet' : 'tu_choi',
        reason: localReason,
        isBulk: confirmModal.isBulk
      })
    }
  }, [confirmModal, localReason, approveMutation])

  // Close drawer on unmount (page navigation)
  useEffect(() => {
    return () => {
      setIsOpenDetail(false)
      setSelectedRequest(null)
    }
  }, [])

  // Debounce search from store
  const [debouncedStoreSearch, setDebouncedStoreSearch] = useState(search)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedStoreSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const finalSearchValue = urlSearch || debouncedStoreSearch

  // Build filter entries once for both queries
  const filterEntries = useMemo(() => Object.fromEntries(
    Object.entries(filter).filter(([_, v]) => v !== 'all' && v !== null)
  ), [filter])

  // Excel query — server-side pagination, sorted by employee for matrix grouping
  const { data: excelResponseData, isFetching: isExcelFetching } = useQuery({
    queryKey: ['hrmNgoaiGio', 'excel', finalSearchValue, filterEntries, excelPage],
    queryFn: async () => {
      const payload = {
        start: (excelPage - 1) * EXCEL_PAGE_SIZE,
        length: EXCEL_PAGE_SIZE,
        searchValue: finalSearchValue.trim(),
        searchKey: filterEntries,
        order: [{ column: 'nhan_vien', dir: 'asc' }]
      }
      const response = await ngoaiGioAxios.fetch(payload)
      return response?.data || { data: [], recordsTotal: 0, recordsFiltered: 0, thongke: null }
    },
    enabled: viewMode === 'excel',
    staleTime: 30_000,
    placeholderData: keepPreviousData
  })

  // Table query — server-side pagination + sort (only when table mode is active)
  const { data: tableResponseData, isFetching: isTableFetching } = useQuery({
    queryKey: ['hrmNgoaiGio', 'table', finalSearchValue, filterEntries, tablePage, tableLimit, tableSortDescriptors],
    queryFn: async () => {
      const payload = {
        start: (tablePage - 1) * tableLimit,
        length: tableLimit,
        searchValue: finalSearchValue.trim(),
        searchKey: filterEntries,
        order: tableSortDescriptors.map((desc) => ({
          column: desc.column,
          dir: desc.direction === 'ascending' ? 'asc' : 'desc'
        }))
      }
      const response = await ngoaiGioAxios.fetch(payload)
      return response?.data || { data: [], recordsTotal: 0, recordsFiltered: 0, thongke: null }
    },
    enabled: viewMode === 'table',
    placeholderData: keepPreviousData
  })

  // Stable data references — prevents [] from creating new ref each render
  const EMPTY_DATA: OvertimeRequest[] = useMemo(() => [], [])
  const excelData = excelResponseData?.data ?? EMPTY_DATA
  const excelTotal = excelResponseData?.recordsFiltered ?? 0
  const tableData = tableResponseData?.data ?? EMPTY_DATA
  const tableTotal = tableResponseData?.recordsTotal ?? 0
  const tableFiltered = tableResponseData?.recordsFiltered ?? 0

  // Derived loading state based on active view mode
  const isLoading = viewMode === 'excel' ? isExcelFetching : isTableFetching

  // ── Bulk Selection Logic ───────────────────────────────────────────────────
  const pendingIds = useMemo(() => {
    return tableData.filter(r => r.trang_thai_tong === 'Cho_duyet').map(r => r.id_ngoai_gio)
  }, [tableData])

  const isAllPendingSelected = useMemo(() => {
    if (pendingIds.length === 0) return false
    return pendingIds.every(id => selectedRequests.has(id))
  }, [pendingIds, selectedRequests])

  const handleToggleSelectAllPending = useCallback(() => {
    handleSelectAll(pendingIds, !isAllPendingSelected)
  }, [handleSelectAll, pendingIds, isAllPendingSelected])

  // Stats from BE recordsFiltered (avoid fetching all records)
  // TODO: Replace with dedicated stats endpoint for accurate breakdown
  const gridStats = useMemo(() => {
    return { approved: 0, pending: 0, rejected: 0 }
  }, [])

  // Reset pages when search/filter changes
  useEffect(() => {
    setTablePage(1)
    setExcelPage(1)
  }, [finalSearchValue, filterEntries])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [autoOpenCreate, setAutoOpenCreate] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  useEffect(() => {
    const action = searchParams.get('action')
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    let shouldUpdateSettings = false

    if (action === 'create_overtime') {
      setIsCreateModalOpen(true)
      setAutoOpenCreate(true)
      shouldUpdateSettings = true
    }

    if (start && end) {
      setTimeout(() => {
        setFilter({
          ...useNgoaiGioStore.getState().filter,
          dateRange: { from: start, to: end }
        })
      }, 50)
      shouldUpdateSettings = true
    }

    // if (shouldUpdateSettings) {
    //   setSearchParams(prev => {
    //     prev.delete('action')
    //     prev.delete('start')
    //     prev.delete('end')
    //     return prev
    //   }, { replace: true })
    // }
  }, [searchParams, setSearchParams, setFilter])

  const handleCreate = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false)
  const [quickEditData, setQuickEditData] = useState<any>(null)

  const handleOpenQuickEdit = useCallback((row: OvertimeRequest) => {
    setQuickEditData(row)
    setIsQuickEditOpen(true)
  }, [])

  const handleViewDetail = useCallback(async (row: OvertimeRequest) => {
    // Không hiển thị data cũ, chỉ set placeholder với ID để drawer biết đang load
    setSelectedRequest({ id_ngoai_gio: row.id_ngoai_gio } as any)
    setIsOpenDetail(true)
    setIsDetailLoading(true)

    try {
      const response = await ngoaiGioAxios.getDetail(row.id_ngoai_gio)
      if (response?.status) {
        setSelectedRequest(response.data)
      } else {
        throw new Error(response?.message || 'Không thể lấy thông tin chi tiết')
      }
    } catch (err: any) {
      toast('Lỗi', { description: err?.message || 'Có lỗi xảy ra khi lấy chi tiết đơn', variant: 'danger' })
      setIsOpenDetail(false)
      setSelectedRequest(null)
    } finally {
      setIsDetailLoading(false)
    }
  }, [setSelectedRequest, setIsOpenDetail])

  // M2 fix: Stable drawer callbacks
  const handleDrawerApprove = useCallback((id: number) => {
    setConfirmModal({ isOpen: true, type: 'approve', isBulk: false, id })
    setLocalReason('')
  }, [])

  const handleDrawerReject = useCallback((id: number) => {
    setConfirmModal({ isOpen: true, type: 'reject', isBulk: false, id })
    setLocalReason('')
  }, [])

  const handleDeleteItem = useCallback(async (row: OvertimeRequest) => {
    try {
      const res = await ngoaiGioAxios.delete(row.id_ngoai_gio)
      if (res.success) {
        toast('Thành công', { description: 'Đã xóa đơn đăng ký', variant: 'success' })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
        queryClient.invalidateQueries({ queryKey: ['ngoaigio-statistics'] })
        return true
      }
      toast('Lỗi', { description: res.message || 'Xóa thất bại', variant: 'danger' })
      return false
    } catch (err: any) {
      toast('Lỗi', { description: err.message || 'Có lỗi xảy ra', variant: 'danger' })
      return false
    }
  }, [queryClient])

  const handleUpdateShift = useCallback(async (row: OvertimeRequest, start: string, end: string) => {
    try {
      const res = await ngoaiGioAxios.update({
        id_ngoai_gio: row.id_ngoai_gio,
        gio_bat_dau: start,
        gio_ket_thuc: end
      })
      if (res.success) {
        toast('Thành công', { description: 'Đã cập nhật khung giờ đăng ký', variant: 'success' })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
        queryClient.invalidateQueries({ queryKey: ['ngoaigio-statistics'] })
        return true
      }
      toast('Lỗi', { description: res.message || 'Cập nhật thất bại', variant: 'danger' })
      return false
    } catch (err: any) {
      toast('Lỗi', { description: err.message || 'Có lỗi xảy ra', variant: 'danger' })
      return false
    }
  }, [queryClient])

  // Get date range for Admin Grid. Default to current month if not set in filter.
  const { gridStartDate, gridEndDate } = useMemo(() => {
    let start, end
    if (filter.dateRange?.from && filter.dateRange?.to) {
      start = new Date(filter.dateRange.from)
      end = new Date(filter.dateRange.to)
    } else {
      const now = new Date()
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }
    return { gridStartDate: start, gridEndDate: end }
  }, [filter.dateRange])

  // ── Mobile date navigation for manager toolbar ─────────────────
  const fmtDate = (d: Date) => d.toISOString().split('T')[0]

  const handleMobileNavPrev = useCallback(() => {
    const from = filter.dateRange?.from ? new Date(filter.dateRange.from) : new Date()
    const to = filter.dateRange?.to ? new Date(filter.dateRange.to) : new Date()
    if (calendarViewType === 'week') {
      from.setDate(from.getDate() - 7)
      to.setDate(to.getDate() - 7)
    } else {
      from.setMonth(from.getMonth() - 1)
      to.setMonth(to.getMonth() - 1)
    }
    setFilter({ ...filter, dateRange: { from: fmtDate(from), to: fmtDate(to) } })
  }, [filter, calendarViewType])

  const handleMobileNavNext = useCallback(() => {
    const from = filter.dateRange?.from ? new Date(filter.dateRange.from) : new Date()
    const to = filter.dateRange?.to ? new Date(filter.dateRange.to) : new Date()
    if (calendarViewType === 'week') {
      from.setDate(from.getDate() + 7)
      to.setDate(to.getDate() + 7)
    } else {
      from.setMonth(from.getMonth() + 1)
      to.setMonth(to.getMonth() + 1)
    }
    setFilter({ ...filter, dateRange: { from: fmtDate(from), to: fmtDate(to) } })
  }, [filter, calendarViewType])

  const handleMobileNavToday = useCallback(() => {
    const now = new Date()
    let from: Date, to: Date
    if (calendarViewType === 'week') {
      const day = now.getDay()
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1)
      from = new Date(now); from.setDate(diffToMonday)
      to = new Date(from); to.setDate(from.getDate() + 6)
    } else {
      from = new Date(now.getFullYear(), now.getMonth(), 1)
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }
    setFilter({ ...filter, dateRange: { from: fmtDate(from), to: fmtDate(to) } })
  }, [filter, calendarViewType])

  const [isSummaryExpanded, setIsSummaryExpanded] = useState(window.innerWidth >= 640)
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  // Auto-collapse handler
  const handleScrollY = useCallback((scrollTop: number) => {
    if (scrollTop > 40 && (isSummaryExpanded || isToolbarExpanded)) {
      setIsSummaryExpanded(false)
      setIsToolbarExpanded(false)
    } else if (scrollTop === 0 && (!isSummaryExpanded || !isToolbarExpanded)) {
      setIsSummaryExpanded(true)
      setIsToolbarExpanded(true)
    }
  }, [isSummaryExpanded, isToolbarExpanded])

  const hasActiveFilters =
    !!filter.trang_thai ||
    (!!filter.id_don_vi && filter.id_don_vi !== 'all') ||
    !!filter.dateRange?.from;

  const hasSelectedItems = selectedRequests.size > 0;

  return (
    <div className="flex flex-col w-full h-[calc(100vh-57px)] overflow-hidden relative bg-white">
      <div className="flex flex-col h-full flex-1 min-h-0">
        <div className="z-30 dark:bg-gray-900/95 pt-0 w-full flex-none bg-white border-b border-gray-200 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <OvertimeSummaryCards
            searchValue={finalSearchValue}
            searchKey={filterEntries}
            isLoading={isExcelFetching}
            totalRecords={excelTotal}
            isExpanded={isSummaryExpanded}
            onToggleExpand={setIsSummaryExpanded}
            headerRightActions={
              <div className="flex items-center gap-1.5 sm:gap-2">

                {/* ── Desktop-only actions (hidden on mobile) ── */}
                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                  {/* Calendar View Type — chỉ hiện khi viewMode = excel */}
                  {canViewManagement && viewMode === 'excel' && (
                    <div className="flex items-center h-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <button
                        onClick={(e) => { e.stopPropagation(); setCalendarViewType('month') }}
                        className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-full text-xs font-semibold transition-colors cursor-pointer ${calendarViewType === 'month'
                          ? 'bg-blue-600 text-white'
                          : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        title="Xem theo tháng"
                      >
                        <LayoutGrid size={13} />
                        <span>Tháng</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setCalendarViewType('week') }}
                        className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-full text-xs font-semibold transition-colors cursor-pointer ${calendarViewType === 'week'
                          ? 'bg-blue-600 text-white'
                          : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        title="Xem theo tuần"
                      >
                        <CalendarIcon size={13} />
                        <span>Tuần</span>
                      </button>
                    </div>
                  )}

                  {/* Divider */}
                  {canViewManagement && viewMode === 'excel' && (
                    <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
                  )}

                  {/* View Mode Toggle: Calendar vs Table */}
                  {canViewManagement && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center h-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <button
                          onClick={(e) => { e.stopPropagation(); setViewMode('excel') }}
                          className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-full text-xs font-semibold transition-colors cursor-pointer ${viewMode === 'excel'
                            ? 'bg-blue-600 text-white'
                            : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          title="Xem dạng Calendar"
                        >
                          <CalendarIcon size={13} />
                          <span>Calendar</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setViewMode('table') }}
                          className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-full text-xs font-semibold transition-colors cursor-pointer ${viewMode === 'table'
                            ? 'bg-blue-600 text-white'
                            : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          title="Xem dạng Table"
                        >
                          <Table2Icon size={13} />
                          <span>Table</span>
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsHistoryDrawerOpen(true)
                        }}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-semibold cursor-pointer"
                        title="Xem Lịch sử"
                      >
                        <History size={13} />
                        <span>Lịch sử</span>
                      </button>
                    </div>
                  )}

                </div>

                {/* Create — mobile only, shown near collapse btn */}
                {canCreate && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCreate() }}
                    className="flex sm:hidden h-8 px-3 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-[11px] whitespace-nowrap items-center"
                  >
                    + Đăng ký
                  </button>
                )}

                {/* Filter Toolbar Toggle — desktop only */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsToolbarExpanded(!isToolbarExpanded)
                  }}
                  className={`hidden sm:flex relative p-1.5 h-8 rounded-lg items-center gap-1.5 transition-colors border ${isToolbarExpanded
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border-transparent'
                    : hasActiveFilters || hasSelectedItems
                      ? 'bg-transparent text-blue-600 dark:text-blue-400 border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      : 'bg-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  title={isToolbarExpanded ? 'Thu gọn bộ lọc' : 'Hiện bộ lọc'}
                >
                  <Filter size={13} className={isToolbarExpanded || hasActiveFilters || hasSelectedItems ? 'text-blue-600 dark:text-blue-400' : ''} />
                  <span className="text-[11px] font-semibold tracking-wide hidden sm:inline uppercase">TOOLBAR</span>
                  {!isToolbarExpanded && hasSelectedItems && (
                    <span className="absolute top-[-2px] right-[-2px] w-2 h-2 rounded-full bg-red-500 shadow-sm border border-white dark:border-gray-900 animate-pulse" />
                  )}
                </button>
              </div>
            }
          />

          {/* Sub-toolbar: TimesheetSelector on left + collapsible filter/actions */}
          <OvertimeToolbar
            filter={filter}
            onFilterChange={setFilter}
            selectedCount={canApprove ? selectedRequests.size : 0}
            onBulkApprove={canApprove ? handleBulkApprove : undefined}
            onBulkReject={canApprove ? handleBulkReject : undefined}
            onClearSelection={() => setSelectedRequests(new Set())}
            stats={gridStats}
            viewMode={viewMode}
            calendarViewType={calendarViewType}
            isToolbarActionsVisible={isToolbarExpanded}
            columns={configColumns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            columnOrder={columnOrder}
            setColumnOrder={setColumnOrder}
            leftContent={<TimesheetSelector calendarViewType={calendarViewType} />}
            rightContent={
              canCreate && (
                <HrPrimaryButton
                  onPress={handleCreate}
                >
                  Đăng ký ngoài giờ
                </HrPrimaryButton>
              )
            }
          />
          {/* Mobile filter strip — only visible on mobile, sits below OvertimeToolbar */}
          <MobileFilterSheet
            dateRange={filter.dateRange}
            trangThai={filter.trang_thai}
            donViValue={filter.id_don_vi}
            showStatusFilter
            showDonViFilter={canViewAll}
            donViOptions={donViOptions}
            onDateRangeChange={(range) => setFilter({ ...filter, dateRange: range })}
            onTrangThaiChange={(val) => {
              const f = { ...filter }
              if (val) f.trang_thai = val
              else delete f.trang_thai
              setFilter(f)
            }}
            onDonViChange={(val) => {
              const f = { ...filter }
              if (val) f.id_don_vi = val
              else delete f.id_don_vi
              setFilter(f)
            }}
            onResetAll={() => {
              const now = new Date()
              const defaultRange = {
                from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
                to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
              }
              const f = { ...filter }
              f.dateRange = defaultRange
              delete f.trang_thai
              delete f.id_don_vi
              setFilter(f)
            }}
            onNavigatePrev={handleMobileNavPrev}
            onNavigateNext={handleMobileNavNext}
            onOpenChange={setIsFilterSheetOpen}
            onSelectAllPending={handleToggleSelectAllPending}
            isAllPendingSelected={isAllPendingSelected}
            canSelectAllPending={canApprove}
            selectedCount={selectedRequests.size}
          />
        </div>

        {/* Content area: Excel Grid or Table */}
        <div className={`relative flex-1 min-h-0 w-full ${canApprove ? 'pb-[56px] md:pb-0' : ''}`}>
          <div className={`absolute inset-0 flex flex-row transition-opacity duration-200 ${viewMode === 'excel' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="flex-1 min-w-0 h-full overflow-hidden relative">
              <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}>
                {calendarViewType === 'week' ? (
                  <AdminOvertimeGrid
                    data={excelData}
                    startDate={gridStartDate}
                    endDate={gridEndDate}
                    showTotalHoursColumn={showTotalHoursColumn}
                    isLoading={isExcelFetching}
                    onRowClick={handleViewDetail}
                    selectedRequests={selectedRequests}
                    onSelectRequest={handleSelectRequest}
                    onSelectAll={handleSelectAll}
                    page={excelPage}
                    totalRecords={excelTotal}
                    pageSize={EXCEL_PAGE_SIZE}
                    onPageChange={setExcelPage}
                    onScrollY={handleScrollY}
                  />
                ) : (
                  <LeaderMonthCalendar
                    data={excelData}
                    startDate={gridStartDate}
                    endDate={gridEndDate}
                    isLoading={isExcelFetching}
                    onRowClick={handleViewDetail}
                    selectedRequests={selectedRequests}
                    onSelectRequest={handleSelectRequest}
                    onSelectAll={handleSelectAll}
                    onDayClick={() => {
                      // Removed jumping to week view based on user feedback
                    }}
                  />
                )}
              </Suspense>
            </div>
          </div>

          {/* Only mount table view when actively selected — avoids double-processing data */}
          {viewMode === 'table' && (
            <div className="absolute inset-0 px-0 pb-[5px] flex flex-col overflow-hidden">
              <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}>
                <LeaderOvertimeView
                  data={tableData}
                  total={tableTotal}
                  filtered={tableFiltered}
                  page={tablePage}
                  limit={tableLimit}
                  sortDescriptors={tableSortDescriptors}
                  onChangePage={setTablePage}
                  onChangeLimit={setTableLimit}
                  onSortChange={setTableSortDescriptors}
                  isLoading={isTableFetching}
                  onRowClick={handleViewDetail}
                  selectedRequests={selectedRequests}
                  onSelectRequest={handleSelectRequest}
                  onSelectAll={handleSelectAll}
                  onApprove={handleDrawerApprove}
                  onReject={handleDrawerReject}
                  onDelete={handleDeleteItem}
                  onUpdateShift={handleUpdateShift}
                  onEdit={handleOpenQuickEdit}
                  visibleColumns={visibleColumns}
                  columnOrder={columnOrder}
                  onColumnOrderChange={setColumnOrder}
                />
              </Suspense>
            </div>
          )}
        </div>
      </div>
      <Suspense fallback={null}>
        <OvertimeDetailDrawer
          onApprove={canApprove ? handleDrawerApprove : undefined}
          onReject={canApprove ? handleDrawerReject : undefined}
          onEdit={handleOpenQuickEdit}
          isLoading={isDetailLoading}
        />
      </Suspense>
      <Suspense fallback={null}>
        <CreateOvertimeDrawer
          isOpen={isCreateModalOpen}
          initialAutoOpenForm={autoOpenCreate}
          onClose={() => {
            setIsCreateModalOpen(false)
            setAutoOpenCreate(false)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
            queryClient.invalidateQueries({ queryKey: ['ngoaigio-statistics'] })
          }}
        />
      </Suspense>
      <Suspense fallback={null}>
        <HistoryDrawer
          isOpen={isHistoryDrawerOpen}
          onClose={() => setIsHistoryDrawerOpen(false)}
        />
      </Suspense>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={
          confirmModal.type === 'approve'
            ? confirmModal.isBulk
              ? 'Xác nhận duyệt hàng loạt'
              : 'Xác nhận duyệt đơn'
            : confirmModal.isBulk
              ? 'Xác nhận từ chối hàng loạt'
              : 'Xác nhận từ chối đơn'
        }
        content={
          <OvertimeApprovalModalBody
            confirmModal={confirmModal}
            localReason={localReason}
            setLocalReason={setLocalReason}
          />
        }
        confirmText={confirmModal.type === 'approve' ? 'Duyệt đơn' : 'Từ chối'}
        cancelText="Hủy"
        isDanger={confirmModal.type === 'reject'}
        isLoading={approveMutation.isPending}
      />

      {/* Mobile Manager Action Bar — absolute bottom actions, shown ONLY when items are selected */}
      {canApprove && !isFilterSheetOpen && selectedRequests.size > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-in slide-in-from-bottom duration-300"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="bg-white dark:bg-gray-800 px-4 py-2.5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[13px] font-bold shrink-0 shadow-sm">
                {selectedRequests.size}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100 truncate">Đã chọn</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">để xử lý hàng loạt</span>
              </div>
              <button
                onClick={() => setSelectedRequests(new Set())}
                className="ml-auto shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 transition-colors"
                title="Bỏ chọn tất cả"
              >
                <XIcon size={14} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleBulkReject}
                className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 font-bold text-[12px] transition-all active:scale-[0.97]"
              >
                <XCircle size={15} />
                Từ chối
              </button>
              <button
                onClick={handleBulkApprove}
                className="flex items-center gap-1.5 h-10 px-5 rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.97] text-white text-[12px] font-bold transition-all shadow-md shadow-green-500/20"
              >
                <CheckCircle2 size={15} />
                Duyệt
              </button>
            </div>
          </div>
        </div>
      )}
      <Suspense fallback={null}>
        <OvertimeQuickEditModal
          isOpen={isQuickEditOpen}
          requestData={quickEditData}
          onClose={() => setIsQuickEditOpen(false)}
          onSaveSuccess={async () => {
            queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
            queryClient.invalidateQueries({ queryKey: ['ngoaigio-statistics'] })

            // Refetch detail if drawer is open for this request
            const currentSelected = useNgoaiGioStore.getState().selectedRequest
            if (currentSelected && currentSelected.id_ngoai_gio === quickEditData?.id_ngoai_gio && useNgoaiGioStore.getState().isOpenDetail) {
              const reqId = currentSelected.id_ngoai_gio
              setIsDetailLoading(true)
              try {
                const response = await ngoaiGioAxios.getDetail(reqId)
                if (response?.status) {
                  setSelectedRequest(response.data)
                }
              } catch (err) {
                console.error('Failed to refetch detail after edit:', err)
              } finally {
                setIsDetailLoading(false)
              }
            }
          }}
        />
      </Suspense>
    </div>
  )
}
