import { OvertimeDetailDrawer } from './components/OvertimeDetailDrawer'
import CreateOvertimeDrawer from './components/CreateOvertimeDrawer'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import { toast } from '@heroui/react'
import { useNgoaiGioStore } from '@renderer/store/useNgoaiGioStore'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { OvertimeRequest } from './types'
import { getOvertimeColumns } from './columns'
import OvertimeStats from './components/OvertimeStats'
import OvertimeToolbar from './components/OvertimeToolbar'
import OvertimeTable from './components/OvertimeTable'

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
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
              Bạn đang thực hiện{' '}
              <span className="font-bold underline text-blue-800 dark:text-blue-200">
                {isApprove ? 'duyệt' : 'từ chối'}
              </span>{' '}
              <span className="font-bold underline text-blue-800 dark:text-blue-200">
                {confirmModal.bulkIds?.length}
              </span>{' '}
              đơn ngoài giờ đã chọn. Hành động này không thể hoàn tác.
            </p>
          </div>
        ) : (
          <div
            className={`p-4 rounded-lg border leading-relaxed ${
              isApprove
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                isApprove ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'
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
          <TextareaFloatingLabel
            label={confirmModal.isBulk ? "Ghi chú / Lý do (áp dụng cho tất cả)" : "Ghi chú / Lý do"}
            placeholder="Nhập ghi chú nếu có (không bắt buộc)..."
            value={localReason}
            onChange={(e) => setLocalReason(e.target.value)}
            rows={3}
          />
        </div>
      </div>
    )
  }
)

const MemoizedOvertimeToolbar = React.memo(OvertimeToolbar)
const MemoizedOvertimeTable = React.memo(OvertimeTable)

export default function NgoaiGioPage() {
  const queryClient = useQueryClient()
  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    filter,
    setFilter,
    sortDescriptors,
    setSortDescriptors,
    showStatsCards,
    setShowStatsCards,
    columnWidths,
    setColumnWidth,
    setIsOpenDetail,
    setSelectedRequest
  } = useNgoaiGioStore()

  const [selectedKeys, setSelectedKeys] = useState<any>(new Set([]))
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    type: 'approve',
    isBulk: false
  })
  const [localReason, setLocalReason] = useState('')

  // Close drawer on unmount (page navigation)
  useEffect(() => {
    return () => {
      setIsOpenDetail(false)
      setSelectedRequest(null)
    }
  }, [])

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch real data from API
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['hrmNgoaiGio', page, limit, debouncedSearch, filter, sortDescriptors],
    queryFn: async () => {
      const payload = {
        start: (page - 1) * limit,
        length: limit,
        searchValue: debouncedSearch.trim(),
        searchKey: {
          ...Object.fromEntries(
            Object.entries(filter).filter(([_, v]) => v !== 'all' && v !== null)
          )
        },
        order: sortDescriptors.map((desc) => ({
          column: desc.column,
          dir: desc.direction === 'ascending' ? 'asc' : 'desc'
        }))
      }
      const response = await ngoaiGioAxios.fetch(payload)
      return response?.data || { data: [], recordsTotal: 0, recordsFiltered: 0, thongke: null }
    }
  })

  // Handlers
  const approveMutation = useMutation({
    mutationFn: (params: { ids: number[]; action: 'duyet' | 'tu_choi'; reason?: string }) =>
      ngoaiGioAxios.approve({
        id_ngoai_gio: params.ids,
        hanh_dong: params.action,
        ly_do_duyet: params.reason
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
      setSelectedKeys(new Set([]))
      toast({
        title: 'Thành công',
        description: `Xử lý phê duyệt thành công`,
        color: 'success'
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Lỗi',
        description: err?.message || 'Không thể thực hiện phê duyệt',
        color: 'danger'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (row: OvertimeRequest) => ngoaiGioAxios.delete(row.id_ngoai_gio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
      toast({
        title: 'Thành công',
        description: 'Đã xóa đơn ngoài giờ',
        color: 'success'
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Lỗi',
        description: err?.message || 'Không thể xóa đơn',
        color: 'danger'
      })
    }
  })

  const handleApprove = useCallback((row: OvertimeRequest) => {
    setConfirmModal({
      isOpen: true,
      type: 'approve',
      isBulk: false,
      id: row.id_ngoai_gio
    })
    setLocalReason('')
  }, [])

  const handleReject = useCallback((row: OvertimeRequest) => {
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      isBulk: false,
      id: row.id_ngoai_gio
    })
    setLocalReason('')
  }, [])

  const selectedIds = useMemo(() => {
    if (selectedKeys === 'all') {
      return (responseData?.data || []).map((d: any) => Number(d.id_ngoai_gio))
    }
    return Array.from(selectedKeys).map((id) => Number(id))
  }, [selectedKeys, responseData])

  const handleBulkApprove = useCallback(() => {
    if (selectedIds.length === 0) return
    setConfirmModal({
      isOpen: true,
      type: 'approve',
      isBulk: true,
      bulkIds: selectedIds
    })
    setLocalReason('')
  }, [selectedIds])

  const handleBulkReject = useCallback(() => {
    if (selectedIds.length === 0) return
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      isBulk: true,
      bulkIds: selectedIds
    })
    setLocalReason('')
  }, [selectedIds])

  const handleConfirmAction = useCallback(() => {
    if (confirmModal.type === 'approve' || confirmModal.type === 'reject') {
      const ids = confirmModal.isBulk ? confirmModal.bulkIds || [] : confirmModal.id ? [confirmModal.id] : []
      if (ids.length === 0) return

      approveMutation.mutate({
        ids,
        action: confirmModal.type === 'approve' ? 'duyet' : 'tu_choi',
        reason: localReason
      })
      
      // Close modal on success is handled in onSuccess theoretically, but let's do it here or wait for success
      setConfirmModal((prev) => ({ ...prev, isOpen: false }))
    }
  }, [confirmModal, localReason, approveMutation])

  const [deleteTarget, setDeleteTarget] = useState<OvertimeRequest | null>(null)

  const handleDelete = useCallback((row: OvertimeRequest) => {
    setDeleteTarget(row)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget)
      setDeleteTarget(null)
    }
  }, [deleteTarget, deleteMutation])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleCreate = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const handleViewDetail = useCallback(async (row: OvertimeRequest) => {
    try {
      const response = await ngoaiGioAxios.getDetail(row.id_ngoai_gio)
      if (response?.status) {
        setSelectedRequest(response.data)
        setIsOpenDetail(true)
      } else {
        throw new Error(response?.message || 'Không thể lấy thông tin chi tiết')
      }
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err?.message || 'Có lỗi xảy ra khi lấy chi tiết đơn',
        color: 'danger'
      })
    }
  }, [setSelectedRequest, setIsOpenDetail])

  const columns = useMemo(
    () => getOvertimeColumns(handleApprove, handleReject, handleDelete, handleViewDetail),
    [handleApprove, handleReject, handleDelete, handleViewDetail]
  )

  const stats = useMemo(() => {
    // If backend returns thongke, use it. Otherwise calculate from current data.
    if (responseData?.thongke) {
      return {
        total: responseData.recordsTotal || 0,
        pending: responseData.thongke.pending || 0,
        approved: responseData.thongke.approved || 0,
        rejected: responseData.thongke.rejected || 0
      }
    }

    // Fallback: simple count from fetched data (might not be full count if paginated)
    const data = responseData?.data || []
    return {
      total: responseData?.recordsTotal || 0,
      pending: data.filter((d: any) => d.trang_thai_tong === 'Cho_duyet').length,
      approved: data.filter((d: any) => d.trang_thai_tong === 'Da_duyet').length,
      rejected: data.filter((d: any) => d.trang_thai_tong === 'Tu_choi').length
    }
  }, [responseData])

  return (
    <div className="flex flex-col gap-2 w-full relative">
      <OvertimeStats
        show={showStatsCards}
        total={stats.total}
        pending={stats.pending}
        approved={stats.approved}
        rejected={stats.rejected}
      />

      <div className="bg-white flex flex-col border border-gray-200 dark:border-gray-800">
        <div className="z-30 dark:bg-gray-900/95 pt-0 pb-1 w-full">
          <MemoizedOvertimeToolbar
            showStatsCards={showStatsCards}
            setShowStatsCards={setShowStatsCards}
            onSearch={setSearch}
            searchValue={search}
            onCreate={handleCreate}
            filter={filter}
            onFilterChange={setFilter}
            selectedCount={selectedIds.length}
            onBulkApprove={handleBulkApprove}
            onBulkReject={handleBulkReject}
          />
        </div>

        <div className="flex flex-row relative px-4">
          <div className="flex flex-col flex-1 min-w-0 sm:px-2 max-h-[calc(100dvh-170px)] overflow-hidden">
            <div className="relative flex-1 min-w-0 overflow-hidden h-full">
              <div className="flex flex-col h-full relative">
                <MemoizedOvertimeTable
                  columns={columns}
                  data={responseData?.data || []}
                  isLoading={isLoading}
                  page={page}
                  total={responseData?.recordsTotal || 0}
                  filtered={responseData?.recordsFiltered || 0}
                  limit={limit}
                  sortDescriptors={sortDescriptors}
                  columnWidths={columnWidths}
                  onColumnResize={setColumnWidth}
                  onSortChange={setSortDescriptors}
                  onChangePage={setPage}
                  onChangeLimit={setLimit}
                  selectedKeys={selectedKeys}
                  onSelectionChange={setSelectedKeys}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <OvertimeDetailDrawer />
      <CreateOvertimeDrawer
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })}
      />
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
        size="md"
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        content={`Bạn có chắc chắn muốn xóa đơn ngoài giờ của ${deleteTarget?.ho_va_ten || ''}?`}
        confirmText="Xóa"
        cancelText="Hủy"
        isDanger
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
