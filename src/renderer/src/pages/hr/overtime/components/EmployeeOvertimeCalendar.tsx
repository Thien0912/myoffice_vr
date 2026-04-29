import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@heroui-v3/react'
import { Plus } from 'lucide-react'
import { lazy, Suspense, useCallback, useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HrPrimaryButton } from '@renderer/components/hero-custom'
import { OvertimeRequest } from '../types'
import { useNgoaiGioStore } from '@renderer/store/useNgoaiGioStore'
import { OvertimeDetailDrawer } from './OvertimeDetailDrawer'
import EmployeeOvertimeToolbar from './EmployeeOvertimeToolbar'
import OvertimeSummaryCards from './OvertimeSummaryCards'
import MobileFilterSheet from './MobileFilterSheet'
import { OvertimeQuickEditModal } from './OvertimeQuickEditModal'

const LeaderOvertimeView = lazy(() => import('./LeaderOvertimeView'))
const CreateOvertimeDrawer = lazy(() => import('./CreateOvertimeDrawer'))


const Spinner = () => (
  <div className="flex-1 flex items-center justify-center p-12">
    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
  </div>
)

interface EmployeeOvertimeCalendarProps {
  onSuccess?: () => void
}

export default function EmployeeOvertimeCalendar({
  onSuccess
}: EmployeeOvertimeCalendarProps = {}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [autoOpenCreate, setAutoOpenCreate] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false)
  const [quickEditData, setQuickEditData] = useState<any>(null)

  const handleOpenQuickEdit = useCallback((row: OvertimeRequest) => {
    setQuickEditData(row)
    setIsQuickEditOpen(true)
  }, [])
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('action') === 'create_overtime') {
      setIsCreateOpen(true)
      setAutoOpenCreate(true)
      setSearchParams(prev => {
        prev.delete('action')
        return prev
      }, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const [dateRange, setDateRange] = useState<{ from: string, to: string }>(() => {
    const today = new Date()
    const day = today.getDay()
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1)
    const start = new Date(today)
    start.setDate(diffToMonday)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    const fmt = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${dd}`
    }
    return { from: fmt(start), to: fmt(end) }
  })
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const { setSelectedRequest, setIsOpenDetail } = useNgoaiGioStore()

  const EMPTY: OvertimeRequest[] = useMemo(() => [], [])

  // Stats query — NO status filter, always fetches all records in date range
  // Used exclusively for computing card statistics
  const statsQueryKey = useMemo(() => ({
    dateRange: { from: dateRange.from, to: dateRange.to }
  }), [dateRange])

  const { data: statsResponseData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['hrmNgoaiGioStats', statsQueryKey],
    queryFn: async () => {
      const res = await ngoaiGioAxios.fetch({
        start: 0,
        length: 500,
        searchValue: '',
        searchKey: statsQueryKey,
        order: [{ column: 'gio_bat_dau', dir: 'desc' }]
      })
      return res?.data || { data: [], recordsTotal: 0 }
    }
  })

  // Display query — includes status filter, used for the table
  const displayQueryKey = useMemo(() => {
    const searchKey: any = {
      dateRange: { from: dateRange.from, to: dateRange.to }
    }
    if (statusFilter) {
      searchKey.trang_thai = statusFilter
    }
    return searchKey
  }, [dateRange, statusFilter])

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['hrmNgoaiGioDisplay', displayQueryKey],
    queryFn: async () => {
      const res = await ngoaiGioAxios.fetch({
        start: 0,
        length: 500,
        searchValue: '',
        searchKey: displayQueryKey,
        order: [{ column: 'gio_bat_dau', dir: 'desc' }]
      })
      return res?.data || { data: [], recordsTotal: 0 }
    }
  })

  // statsData — full unfiltered data for card computation
  const statsData: OvertimeRequest[] = statsResponseData?.data ?? EMPTY
  // stableData — filtered data for table display
  const stableData: OvertimeRequest[] = responseData?.data ?? EMPTY

  const handleCreateSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioStats'] })
    queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioDisplay'] })
    queryClient.invalidateQueries({ queryKey: ['ngoaigio-statistics'] })
    onSuccess?.()
  }, [queryClient, onSuccess])

  // Shared detail drawer logic — same as NgoaiGioPage
  const handleViewDetail = useCallback(async (row: OvertimeRequest) => {
    setSelectedRequest(row)
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
    } finally {
      setIsDetailLoading(false)
    }
  }, [setSelectedRequest, setIsOpenDetail])

  // Soft update local status to bypass immediate refetch overhead - wait, in employee view we use query invalidations
  const handleUpdateShift = useCallback(async (row: OvertimeRequest, start: string, end: string) => {
    try {
      const res = await ngoaiGioAxios.update({
        id_ngoai_gio: row.id_ngoai_gio,
        gio_bat_dau: start + ':00',
        gio_ket_thuc: end + ':00'
      })
      if (res.success) {
        toast('Thành công', { description: 'Đã cập nhật ca làm việc', variant: 'success' })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioStats'] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioDisplay'] })
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

  const handleDeleteItem = useCallback(async (row: OvertimeRequest) => {
    try {
      const res = await ngoaiGioAxios.delete(row.id_ngoai_gio)
      if (res.success) {
        toast('Thành công', { description: 'Đã xóa đơn đăng ký', variant: 'success' })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioStats'] })
        queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioDisplay'] })
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

  // ── Date navigation helpers (also used by MobileFilterSheet) ─────
  const shiftDays = useCallback((dateStr: string, days: number): string => {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + days)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }, [])

  const navigatePrevWeek = useCallback(() => {
    setDateRange(prev => ({ from: shiftDays(prev.from, -7), to: shiftDays(prev.to, -7) }))
  }, [shiftDays])

  const navigateNextWeek = useCallback(() => {
    setDateRange(prev => ({ from: shiftDays(prev.from, 7), to: shiftDays(prev.to, 7) }))
  }, [shiftDays])

  const navigateToday = useCallback(() => {
    const today = new Date()
    const day = today.getDay()
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1)
    const start = new Date(today)
    start.setDate(diffToMonday)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setDateRange({ from: fmt(start), to: fmt(end) })
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] w-full bg-white dark:bg-gray-900 border-none">

      {/* Summary cards — employee mode: passes activeStatus + onStatusChange for clickable filter cards */}
      <OvertimeSummaryCards
        searchValue=""
        searchKey={statsQueryKey}
        isLoading={isStatsLoading}
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        headerRightActions={
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            <div className="flex shrink-0">
              <EmployeeOvertimeToolbar
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 hidden sm:block mx-1" />

            <HrPrimaryButton
              onPress={() => setIsCreateOpen(true)}
            >
              <span className="hidden sm:inline">Đăng ký ngoài giờ</span>
            </HrPrimaryButton>
          </div>
        }
      />

      {/* Mobile filter strip — only visible on mobile (<768px) */}
      <MobileFilterSheet
        dateRange={dateRange}
        trangThai={statusFilter || undefined}
        showStatusFilter
        onDateRangeChange={setDateRange}
        onTrangThaiChange={(val) => setStatusFilter(val || null)}
        onNavigatePrev={navigatePrevWeek}
        onNavigateNext={navigateNextWeek}
        onNavigateToday={navigateToday}
        topActions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="h-8 px-3 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 active:scale-[0.97] transition-all text-[11px] whitespace-nowrap flex items-center gap-1"
          >
            <Plus size={13} />
            Đăng ký
          </button>
        }
      />

      {/* Table */}
      <div className="flex-1 min-h-0 flex flex-col relative z-0">
        <Suspense fallback={<Spinner />}>
          <LeaderOvertimeView
            data={stableData}
            total={stableData.length}
            filtered={stableData.length}
            page={1}
            limit={stableData.length || 50}
            sortDescriptors={[]}
            onChangePage={() => { }}
            onChangeLimit={() => { }}
            onSortChange={() => { }}
            isLoading={isLoading}
            onRowClick={handleViewDetail}
            selectedRequests={new Set()}
            onSelectRequest={() => { }}
            onSelectAll={() => { }}
            onUpdateShift={handleUpdateShift}
            onDelete={handleDeleteItem}
            onEdit={handleOpenQuickEdit}
          />
        </Suspense>
      </div>

      {/* Shared Detail Drawer — same component as NgoaiGioPage */}
      <OvertimeDetailDrawer
        onEdit={handleOpenQuickEdit}
        isLoading={isDetailLoading}
      />

      {/* Create Drawer */}
      <Suspense fallback={null}>
        <CreateOvertimeDrawer
          isOpen={isCreateOpen}
          initialAutoOpenForm={autoOpenCreate}
          onClose={() => {
            setIsCreateOpen(false)
            setAutoOpenCreate(false)
          }}
          onSuccess={handleCreateSuccess}
        />
      </Suspense>

      <Suspense fallback={null}>
        <OvertimeQuickEditModal
          isOpen={isQuickEditOpen}
          requestData={quickEditData}
          onClose={() => setIsQuickEditOpen(false)}
          onSaveSuccess={async () => {
            queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioStats'] })
            queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioDisplay'] })
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

