import { Button, cn, Skeleton, Spinner, Tooltip } from '@heroui/react'
import {
  HrDrawer,
  HrDrawerBody,
  HrDrawerFooter,
  HrDrawerHeader,
} from '@renderer/components/hero-custom/HrDrawer'
import UserAvatar from '@renderer/components/UserAvatar'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useNgoaiGioStore } from '@renderer/store/useNgoaiGioStore'
import { date as formatDate } from '@renderer/utils/formatDate'
import { BadgeCheck, Clock, Pencil, Quote, X } from 'lucide-react'
import React from 'react'
import { useNgoaiGioPermissions } from '../hooks/useNgoaiGioPermissions'
import { OVERTIME_STATUS_CONFIG } from '../types'

interface OvertimeDetailDrawerProps {
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onEdit?: (row: any) => void
  isLoading?: boolean
}

export const OvertimeDetailDrawer: React.FC<OvertimeDetailDrawerProps> = ({
  onApprove,
  onReject,
  onEdit,
  isLoading,
}) => {
  const { isOpenDetail, setIsOpenDetail, selectedRequest, setSelectedRequest } =
    useNgoaiGioStore()
  const currentUser = useAuthStore((s) => s.user)
  const { canApprove, canApproveDotXuat, canApproveByTCHC } = useNgoaiGioPermissions()

  // Render drawer khi isOpenDetail = true, bất kể có data hay không
  if (!isOpenDetail) return null

  const handleClose = () => {
    setIsOpenDetail(false)
    setTimeout(() => setSelectedRequest(null), 300)
  }

  // Nếu đang loading hoặc chưa có data đầy đủ, hiển thị skeleton
  if (isLoading || !selectedRequest?.ho_va_ten) {
    return (
      <HrDrawer
        isOpen={isOpenDetail}
        onClose={handleClose}
        secondaryTitle="Chi tiết làm việc ngoài giờ"
        defaultWidth={520}
        resizable={false}
        classNames={{ base: 'rounded-tl-2xl! rounded-bl-2xl!' }}
      >
        <HrDrawerHeader className="px-6! py-5! h-auto! border-b-0! flex-col! items-start! gap-0! bg-[#f3f4f5]! rounded-tl-2xl!">
          <div className="flex items-start justify-between w-full">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32 rounded" />
                <Skeleton className="h-6 w-40 rounded" />
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-full transition-colors hover:bg-black/5 text-[#414754]">
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </HrDrawerHeader>
        <HrDrawerBody className="p-0! block! overflow-hidden h-full bg-[#f8f9fa]!">
          <div className="overflow-y-auto px-6 py-6 space-y-8 h-full">
            <section className="space-y-4">
              <Skeleton className="h-4 w-32 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-[88px] w-full rounded-xl" />
                <Skeleton className="h-[88px] w-full rounded-xl" />
              </div>
            </section>
            <section className="space-y-4">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </section>
            <section className="space-y-4">
              <Skeleton className="h-3 w-28 rounded" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </section>
          </div>
        </HrDrawerBody>
      </HrDrawer>
    )
  }

  const status = selectedRequest.trang_thai_tong as keyof typeof OVERTIME_STATUS_CONFIG
  const config = OVERTIME_STATUS_CONFIG[status] || OVERTIME_STATUS_CONFIG['Cho_duyet']

  const formatTime = (time?: string | null) => {
    if (!time) return '--:--'
    return time.slice(0, 5)
  }

  const parseHours = (value?: string | number | null) => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0
    const parsed = parseFloat(String(value).replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : 0
  }

  /**
   * Tính khoảng thời gian (giờ) giữa start và end
   * Trừ giờ trưa (11:30-13:00) nếu không phải Chủ nhật
   */
  const calcDurationHours = (start?: string | null, end?: string | null, dateStr?: string | null) => {
    if (!start || !end) return 0
    const startMs = new Date(start.replace(/-/g, '/')).getTime()
    const endMs = new Date(end.replace(/-/g, '/')).getTime()
    const diffMs = endMs - startMs
    if (isNaN(diffMs) || diffMs <= 0) return 0

    let totalMinutes = Math.floor(diffMs / 60000)

    // Kiểm tra xem có phải Chủ nhật không
    const checkDate = dateStr ? new Date(dateStr.replace(/-/g, '/')) : new Date(start.replace(/-/g, '/'))
    const isSunday = checkDate.getDay() === 0

    // Nếu không phải Chủ nhật, trừ giờ trưa nếu có chồng lấn
    if (!isSunday && dateStr) {
      const lunchStartStr = `${dateStr} 11:30:00`
      const lunchEndStr = `${dateStr} 13:00:00`
      const lunchStartMs = new Date(lunchStartStr.replace(/-/g, '/')).getTime()
      const lunchEndMs = new Date(lunchEndStr.replace(/-/g, '/')).getTime()

      const workStartMs = Math.max(startMs, lunchStartMs)
      const workEndMs = Math.min(endMs, lunchEndMs)

      if (workStartMs < workEndMs) {
        const lunchOverlapMs = workEndMs - workStartMs
        totalMinutes -= Math.floor(lunchOverlapMs / 60000)
      }
    }

    return totalMinutes / 60
  }

  /**
   * Tính số giờ thực tế ngoài giờ:
   * từ (ngày_đăng_ký + giờ_bắt_đầu_đăng_ký) → thời_gian_kết_thúc_chấm_công
   * Trừ giờ trưa (11:30-13:00) nếu không phải Chủ nhật
   */
  const calcOvertimeDuration = (
    registeredStart?: string | null,
    registeredDate?: string | null,
    actualEnd?: string | null,
  ): number | null => {
    if (!registeredStart || !registeredDate || !actualEnd) return null
    const startStr = `${registeredDate} ${registeredStart}`
    const startMs = new Date(startStr.replace(/-/g, '/')).getTime()
    const endMs = new Date(actualEnd.replace(/-/g, '/')).getTime()
    const diffMs = endMs - startMs
    if (isNaN(diffMs) || diffMs <= 0) return null

    let totalMinutes = Math.floor(diffMs / 60000)

    // Kiểm tra xem có phải Chủ nhật không (0 = Sunday)
    const startDate = new Date(startStr.replace(/-/g, '/'))
    const isSunday = startDate.getDay() === 0

    // Nếu không phải Chủ nhật, kiểm tra có qua giờ trưa không
    if (!isSunday) {
      // Tạo thời điểm 11:30 và 13:00 cùng ngày
      const lunchStartStr = `${registeredDate} 11:30:00`
      const lunchEndStr = `${registeredDate} 13:00:00`
      const lunchStartMs = new Date(lunchStartStr.replace(/-/g, '/')).getTime()
      const lunchEndMs = new Date(lunchEndStr.replace(/-/g, '/')).getTime()

      // Kiểm tra xem khoảng thời gian làm việc có chồng lấn với giờ trưa không
      const workStartMs = Math.max(startMs, lunchStartMs)
      const workEndMs = Math.min(endMs, lunchEndMs)

      if (workStartMs < workEndMs) {
        // Có chồng lấn với giờ trưa → trừ đi thời gian chồng lấn
        const lunchOverlapMs = workEndMs - workStartMs
        totalMinutes -= Math.floor(lunchOverlapMs / 60000)
      }
    }

    const hours = totalMinutes / 60
    return Number(hours.toFixed(2))
  }

  const registeredHours = parseHours(selectedRequest.so_gio)

  // Số giờ chấm công: từ giờ bắt đầu đăng ký → thời gian kết thúc chấm công (đã trừ giờ trưa)
  const actualHours = calcOvertimeDuration(
    selectedRequest.gio_bat_dau,
    selectedRequest.ngay_dang_ky,
    selectedRequest.thoi_gian_ket_thuc_cham_cong,
  ) || 0

  // Format to remove trailing zeros (e.g. 1.50 -> 1.5)
  const displayActualHours = actualHours.toString()

  /* ─── Người duyệt ─── */
  const hasDanhSach = !!(
    selectedRequest.danh_sach_nguoi_duyet &&
    selectedRequest.danh_sach_nguoi_duyet.length > 0
  )
  const approverItems: any[] = hasDanhSach
    ? selectedRequest.danh_sach_nguoi_duyet || []
    : selectedRequest.nguoi_duyet || []
  const assignedApprover =
    approverItems.find((item: any) => item?.trang_thai === 'Cho_duyet') ||
    approverItems[0]
  const assignedApproverName = hasDanhSach
    ? assignedApprover?.ql_nguoi_dung_ho_ten
    : assignedApprover?.ho_ten_nguoi_duyet

  // Nếu user hiện tại có quyền duyệt, hiển thị tên họ thay vì người được assign
  const hasApprovalPermission = canApprove || canApproveDotXuat || canApproveByTCHC
  const displayApproverName = hasApprovalPermission
    ? (currentUser?.ql_nguoi_dung_ho_ten || assignedApproverName)
    : assignedApproverName

  const isDotXuat =
    selectedRequest.is_dotxuat === '1' || selectedRequest.is_dotxuat === 1

  const currentApprovalLevel = parseInt(String(selectedRequest.cap_duyet_hien_tai || '1'), 10)

  // Xác định các cấp duyệt mà user có quyền - CHỈ HIỂN THỊ CẤP HIỆN TẠI
  const approvalRoles: string[] = []

  // Đột xuất: chỉ hiển thị nếu đơn là đột xuất VÀ user có quyền
  if (isDotXuat && canApproveDotXuat) {
    approvalRoles.push('Đột xuất')
  }

  // Cấp 1 (Lãnh đạo): chỉ hiển thị nếu đang ở cấp 1 VÀ user có quyền
  if (currentApprovalLevel === 1 && canApprove) {
    approvalRoles.push('Lãnh đạo')
  }

  // Cấp 2+ (Phòng Tổ chức): chỉ hiển thị nếu đang ở cấp 2 trở lên VÀ user có quyền
  if (currentApprovalLevel >= 2 && canApproveByTCHC) {
    approvalRoles.push(`Phòng Tổ chức`)
  }

  // noi_dung = tiêu đề tăng ca, chi_tiet = chi tiết nội dung tăng ca
  const requestTitle = (selectedRequest.noi_dung || '').toString().trim()
  const justification = (selectedRequest.chi_tiet || '').toString().trim()

  const isOwner = !!currentUser?.id_nhan_vien && !!selectedRequest?.id_nhan_vien && String(selectedRequest.id_nhan_vien) === String(currentUser.id_nhan_vien)

  return (
    <HrDrawer
      isOpen={isOpenDetail}
      onClose={handleClose}
      secondaryTitle="Chi tiết làm việc ngoài giờ"
      defaultWidth={520}
      resizable={false}
      classNames={{ base: 'rounded-tl-2xl! rounded-bl-2xl!' }}
    >
      {/* ... header and body unchanged ... */}
      {/* I'll use a larger block for replacement to ensure stability */}
      <HrDrawerHeader>
        <div className="flex w-full items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <UserAvatar name={selectedRequest.ho_va_ten || ''} size="md" className="w-10 h-10 shrink-0 mt-0.5" />
            <div className="flex flex-col flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight" title={selectedRequest.ho_va_ten}>
                {selectedRequest.ho_va_ten}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-gray-500 font-mono shrink-0">
                  {selectedRequest.ma_nhan_vien}
                </span>
                <span className="text-[10px] text-gray-300 dark:text-gray-600 shrink-0">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400" title={selectedRequest.ten_chuc_vu ? `${selectedRequest.ten_chuc_vu} - ${selectedRequest.ten_don_vi}` : selectedRequest.ten_don_vi}>
                  {selectedRequest.ten_chuc_vu ? `${selectedRequest.ten_chuc_vu} - ` : ''}{selectedRequest.ten_don_vi}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-1 shrink-0 mt-0.5">
            {isLoading && <Spinner size="sm" color="primary" />}
            {/* {isOwner && status === 'Cho_duyet' && onEdit && (
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                onPress={() => onEdit(selectedRequest)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Pencil size={18} />
              </Button>
            )} */}
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              onPress={handleClose}
            >
              <X size={18} />
            </Button>
          </div>
        </div>
      </HrDrawerHeader>

      <HrDrawerBody className="p-0! block! overflow-hidden h-full bg-white dark:bg-[#1e1e24]!">
        <div className="overflow-y-auto px-6 py-6 space-y-8 h-full">
          {/* Thông tin chung */}
          <section className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex flex-col justify-center border border-gray-100 dark:border-gray-700/50">
                <p className="text-[0.65rem] font-bold uppercase tracking-tighter mb-1 text-[#727785]">
                  Loại đăng ký
                </p>
                <span className="font-medium text-[#191c1d] dark:text-white leading-tight">
                  {isDotXuat ? 'Đột xuất' : 'Bình thường'}
                </span>
              </div>

              {/* Status */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex flex-col justify-center border border-gray-100 dark:border-gray-700/50">
                <p className="text-[0.65rem] font-bold uppercase tracking-tighter mb-1 text-[#727785]">
                  Trạng thái
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={cn("font-medium leading-tight", {
                    'text-yellow-600 dark:text-yellow-500': status === 'Cho_duyet',
                    'text-green-600 dark:text-green-500': status === 'Da_duyet',
                    'text-red-600 dark:text-red-500': status === 'Tu_choi',
                    'text-gray-600 dark:text-gray-400': status === 'Huy'
                  })}>
                    {config.label}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── So sánh thời gian ── */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#191c1d]">
                So sánh thời gian
              </h4>
            </div>

            <div className={cn("grid gap-4", actualHours > 0 || isLoading ? "grid-cols-2" : "grid-cols-1")}>
              {isLoading ? (
                <>
                  <Skeleton className="h-[88px] w-full rounded-xl" />
                  <Skeleton className="h-[88px] w-full rounded-xl" />
                </>
              ) : (
                <>
                  {/* Đăng ký */}
                  <div className="p-4 rounded-xl bg-[#f3f4f5]">
                    <p className="text-[0.65rem] font-bold uppercase tracking-tighter mb-1 text-[#727785]">
                      Đăng ký
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-[#191c1d]">
                        {registeredHours.toFixed(2)}
                      </span>
                      <span className="text-xs text-[#414754]">giờ</span>
                    </div>
                    <p className="text-xs mt-1 text-[#414754]">
                      {formatTime(selectedRequest.gio_bat_dau)} –{' '}
                      {formatTime(selectedRequest.gio_ket_thuc)}
                    </p>
                  </div>

                  {/* Thực tế — primary-fixed */}
                  {actualHours > 0 && (
                    <div className="p-4 rounded-xl bg-[#d8e2ff]">
                      <p className="text-[0.65rem] font-bold uppercase tracking-tighter mb-1 text-[#004493]">
                        Chấm công
                      </p>
                      <Tooltip content={`${actualHours} giờ`} placement="top">
                        <div className="flex items-baseline gap-1 cursor-default w-fit">
                          <span className="text-xl font-bold text-[#001a41]">
                            {displayActualHours}
                          </span>
                          <span className="text-xs text-[#004493]">giờ</span>
                        </div>
                      </Tooltip>
                      <p className="text-xs mt-1 text-[#004493]">
                        {formatTime(selectedRequest.gio_bat_dau)} –{' '}
                        {selectedRequest.thoi_gian_ket_thuc_cham_cong
                          ? formatDate('H:i', selectedRequest.thoi_gian_ket_thuc_cham_cong)
                          : '--:--'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* ── Nội dung ── */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#191c1d]">
              Nội dung
            </h4>
            <div className="p-5 rounded-2xl relative overflow-hidden bg-[#f3f4f5]">
              <Quote
                size={30}
                className="absolute right-1 bottom-1 select-none text-[#e7e8e9]"
              />
              {/* Tiêu đề yêu cầu */}
              {requestTitle ? (
                <p className="text-[0.7rem] font-bold uppercase tracking-wide mb-2 text-[#727785] relative z-10">
                  {requestTitle}
                </p>
              ) : null}
              {/* Nội dung giải trình — dấu " - " được convert thành xuống dòng */}
              {justification ? (
                <p className="text-sm leading-relaxed relative z-10 italic text-[#414754] whitespace-pre-line">
                  {`${justification
                    .replace(/ - /g, '\n- ')   // ' - ' → newline + '- '
                    .replace(/\n- /g, '\n- ')  // normalize nếu đã có \n thật
                    }`}
                </p>
              ) : (
                <p className="text-sm relative z-10 text-[#727785]">
                  Không có nội dung giải trình.
                </p>
              )}
            </div>
          </section>

          {/* ── Lý do hủy / từ chối ── chỉ hiện khi status là Tu_choi / Huy */}
          {(status === 'Tu_choi' || status === 'Huy') && (() => {
            const cancelReason = (
              (selectedRequest as any).ly_do_tu_choi ||
              (selectedRequest as any).ly_do_huy ||
              (selectedRequest as any).ghi_chu_duyet ||
              ''
            ).toString().trim()
            const cancelBy = (selectedRequest as any).ten_nguoi_tu_choi || ''
            return (
              <section className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#191c1d]">
                  {status === 'Tu_choi' ? 'Lý do từ chối' : 'Lý do hủy'}
                </h4>
                <div className="p-5 rounded-2xl relative overflow-hidden bg-[#f3f4f5]">
                  <Quote
                    size={30}
                    className="absolute right-1 bottom-1 select-none text-[#e7e8e9]"
                  />
                  {cancelBy ? (
                    <p className="text-[0.7rem] font-bold uppercase tracking-wide mb-2 text-[#727785] relative z-10">
                      {cancelBy}
                    </p>
                  ) : null}
                  <p className="text-sm leading-relaxed text-[#414754] relative z-10 whitespace-pre-line">
                    {cancelReason
                      ? cancelReason.replace(/ - /g, '\n- ').replace(/\n- /g, '\n- ')
                      : 'Không có lý do được ghi nhận.'}
                  </p>
                </div>
              </section>
            )
          })()}

          {/* ── Lịch sử duyệt (Gộp theo cấp) ── */}
          {approverItems.length > 0 && status !== 'Huy' && (() => {
            // Nhóm người duyệt theo cấp duyệt
            const approvalGroups = approverItems.reduce((acc: Record<string, any[]>, approver) => {
              const cap = approver.cap_duyet || 'unknown';
              if (!acc[cap]) acc[cap] = [];
              acc[cap].push(approver);
              return acc;
            }, {});

            const levels = Object.values(approvalGroups);

            return (
              <section className="space-y-4">
                <h4 className="text-[10px] font-bold text-[#727785] uppercase tracking-widest">
                  Lịch sử duyệt
                </h4>
                <div className="relative pt-2">
                  {levels.map((group, index) => {
                    const isAnyApproved = group.some(a => a.trang_thai === 'Da_duyet')
                    const isAnyDenied = group.some(a => a.trang_thai === 'Tu_choi' || a.trang_thai === 'Huy')
                    const isPassed = isAnyApproved || isAnyDenied
                    const isPending = group.some(a => a.trang_thai === 'Cho_duyet') && !isPassed

                    // Nếu đã có người duyệt/từ chối, chỉ hiển thị người đó. Nếu đang chờ, hiển thị tất cả
                    const displayApprovers = isPassed
                      ? group.filter(a => a.trang_thai === 'Da_duyet' || a.trang_thai === 'Tu_choi' || a.trang_thai === 'Huy')
                      : group

                    const levelDisplay = index === 0 ? 'Lãnh đạo' : 'Phòng Tổ chức'
                    const isLastLevel = index === levels.length - 1

                    return (
                      <div key={index} className={cn("relative flex gap-4", !isLastLevel && "pb-6")}>
                        {/* Timeline Path cho từng block (không hiển thị ở block cuối) */}
                        {!isLastLevel && (
                          <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-[#e1e3e4]" />
                        )}
                        
                        {/* Node Circle */}
                        {isPassed ? (
                          <div className={cn(
                            "relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                            isAnyDenied ? "bg-red-600" : "bg-[#005bc0]"
                          )}>
                            {isAnyDenied ? (
                              <X size={14} className="text-white" strokeWidth={3} />
                            ) : (
                              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        ) : (
                          <div className="relative z-10 w-6 h-6 rounded-full bg-[#e1e3e4] border-2 border-[#f8f9fa] flex items-center justify-center shrink-0">
                            {isPending && <span className="w-2 h-2 rounded-full bg-[#727785]"></span>}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          {/* Header của Node */}
                          {isPassed ? (
                            <p className={cn(
                              "text-[10px] font-bold uppercase tracking-wider mb-1.5",
                              isAnyDenied ? "text-red-600" : "text-[#005bc0]"
                            )}>
                              Cấp {index + 1}: {levelDisplay} - {isAnyDenied ? 'Từ chối' : 'Đã duyệt'}
                            </p>
                          ) : (
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[10px] font-bold text-[#727785] uppercase tracking-wider">
                                Cấp {index + 1}: {levelDisplay}
                              </p>
                              {isPending && (
                                <span className="text-[11px] text-[#9e4300] font-bold flex items-center gap-1">
                                  <Clock size={12} /> ĐANG CHỜ
                                </span>
                              )}
                            </div>
                          )}

                          {/* List người duyệt cùng cấp */}
                          <div className="space-y-2">
                            {displayApprovers.map((approver, i) => {
                              const isApproverApproved = approver.trang_thai === 'Da_duyet' || approver.trang_thai === 'Tu_choi' || approver.trang_thai === 'Huy'
                              const approverDenied = approver.trang_thai === 'Tu_choi' || approver.trang_thai === 'Huy'
                              const approverName = approver.ql_nguoi_dung_ho_ten || approver.nguoi_duyet_ho_ten || approver.ho_ten_nguoi_duyet || '---'
                              const approvalReason = approver.ly_do_duyet || approver.ly_do || ''

                              // Chỉ hiển thị 'Đang chờ xác nhận' cho người duyệt nếu node đang pending và họ cũng chưa duyệt
                              const showPendingText = !isApproverApproved && isPending

                              return (
                                <div key={i} className={cn(
                                  "flex items-start justify-between p-3 rounded-lg border transition-all",
                                  isApproverApproved
                                    ? (approverDenied ? "bg-red-50 border-red-200" : "bg-[#f3f4f5] border-[#005bc0]/20")
                                    : "bg-white border-[#edeeef] hover:border-[#c1c6d6]"
                                )}>
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e7e8e9] shrink-0">
                                      <UserAvatar name={approverName} className="w-full h-full rounded-full" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-[#191c1d]">{approverName}</p>
                                        {isApproverApproved && approver.thoi_gian_duyet && (
                                          <>
                                            <span className="text-[#727785]">•</span>
                                            <p className="text-[10px] text-[#727785]">
                                              {formatDate('H:i d/m/Y', approver.thoi_gian_duyet)}
                                            </p>
                                          </>
                                        )}
                                      </div>
                                      {showPendingText && (
                                        <p className="text-[10px] text-[#727785] mt-0.5">Đang chờ xác nhận</p>
                                      )}
                                      {isApproverApproved && approvalReason ? (
                                        <p className="text-xs italic text-[#727785] mt-1.5 leading-relaxed">
                                          {`"${approvalReason}"`}
                                        </p>
                                      ) : "--"}
                                    </div>
                                  </div>
                                  {isApproverApproved && !approverDenied && <BadgeCheck size={20} className="text-[#005bc0] shrink-0" />}
                                  {approverDenied && <X size={20} className="text-red-500 shrink-0" />}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })()}
        </div>
      </HrDrawerBody>

      {/* ─── Footer ─── */}
      {status === 'Cho_duyet' && (onApprove || onReject) && approvalRoles.length > 0 && (
        <HrDrawerFooter className="px-6! py-5! flex-col! items-stretch! gap-4! border-t-0! bg-[#f3f4f5]! rounded-bl-2xl!">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e7e8e9] shrink-0">
                <UserAvatar
                  name={displayApproverName || ''}
                  src={hasApprovalPermission ? currentUser?.ql_nguoi_dung_avatar : undefined}
                  className="w-full h-full rounded-full"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#191c1d]">
                  {displayApproverName || '---'}
                </p>
                {hasApprovalPermission && approvalRoles.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-[#727785] uppercase tracking-wide">
                      Quyền duyệt:
                    </span>
                    {approvalRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d8e2ff] text-[#004493] border border-[#b8d0ff]"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <BadgeCheck size={22} className="text-[#005bc0] shrink-0" />
          </div>

          <div className="flex gap-3">
            {onReject && (
              <Button
                variant="flat"
                className="flex-1 py-3 font-bold rounded-xl text-sm bg-[#e1e3e4] text-[#191c1d] hover:bg-[#e7e8e9]"
                onPress={() => onReject(selectedRequest.id_ngoai_gio)}
              >
                Từ chối
              </Button>
            )}
            {onApprove && (
              <Button
                className="flex-2 py-3 font-bold rounded-xl text-sm text-white shadow-md bg-[#005bc0] hover:opacity-90"
                startContent={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                }
                onPress={() => onApprove(selectedRequest.id_ngoai_gio)}
              >
                Duyệt giờ
              </Button>
            )}
          </div>
        </HrDrawerFooter>
      )}
    </HrDrawer>
  )
}
