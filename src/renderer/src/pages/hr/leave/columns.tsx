import { Button, Popover, Tooltip } from '@heroui-v3/react'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import UserAvatar from '@renderer/components/UserAvatar'
import { date as formatDate } from '@renderer/utils/formatDate'
import { LEAVE_STATUS_CONFIG, LeaveRequest } from './mockData'
// Removed unused framer-motion imports
import {
  Calendar,
  Check,
  ChevronDown,
  FileText,
  Image,
  ShieldCheck,
  User,
  X
} from 'lucide-react'
import { getLeaveDateRange } from './utils/leaveUtils'

const StatusBadge = ({
  status,
  approverName,
  level,
  showChevron = false
}: {
  status: keyof typeof LEAVE_STATUS_CONFIG
  approverName?: string
  level?: 1 | 2
  showChevron?: boolean
}) => {
  const config = LEAVE_STATUS_CONFIG[status] || LEAVE_STATUS_CONFIG['Cho_duyet'] // Fallback
  const Icon = level === 1 ? ShieldCheck : User
  return (
    <div className="flex flex-col leading-none py-1 gap-0.5 items-center justify-center w-full">
      <div
        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${config.text}`}
      >
        {status === 'Da_duyet' && <Check size={11} strokeWidth={3} />}
        {status === 'Tu_choi' && <X size={11} strokeWidth={3} />}
        {config.label}
        {showChevron && (
          <ChevronDown
            size={13}
            className="text-gray-300 ml-0.5 group-hover:text-blue-500 transition-colors"
          />
        )}
      </div>
      {approverName && (
        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium opacity-80">
          <Icon size={10} className="opacity-60" />
          <span className="whitespace-nowrap">{approverName}</span>
        </div>
      )}
    </div>
  )
}

interface ApprovalCellProps {
  value: string
  row: LeaveRequest
  level: 1 | 2
  openConfirm: (
    row: LeaveRequest,
    level: 1 | 2,
    type: 'approve' | 'reject',
    reason?: string,
    isOnBehalf?: boolean
  ) => void
  allowAction?: boolean
  canApproveOnBehalf?: boolean
  onPreviewFile: (url: string, name: string, ext: string) => void
}

const ApprovalCell = ({
  value,
  row,
  level,
  openConfirm,
  allowAction,
  canApproveOnBehalf,
  onPreviewFile
}: ApprovalCellProps) => {
  const status = (value as keyof typeof LEAVE_STATUS_CONFIG) || 'Cho_duyet'
  const config = LEAVE_STATUS_CONFIG[status] || LEAVE_STATUS_CONFIG['Cho_duyet']
  const approverName =
    level === 1 ? row.nguoi_duyet_cap_mot_ho_ten || '' : row.nguoi_duyet_cap_hai_ho_ten || ''

  if (level === 2 && row.trang_thai_cap_mot === 'Cho_duyet') {
    return (
      <div className="flex flex-col leading-none py-1 gap-0.5 items-center justify-center w-full">
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse shadow-[0_0_4px_rgba(156,163,175,0.5)]`}
          />
          Chờ đơn vị duyệt
        </div>
      </div>
    )
  } else if (level === 2 && row.trang_thai_cap_mot === 'Tu_choi') {
    return '---'
  }

  // LOGIC: Hiện nút action nếu có quyền (allowAction HOẶC canApproveOnBehalf)
  // Cho phép thay đổi trạng thái ngay cả khi đã duyệt/từ chối (CHỈ CẤP 2)
  const showAction = allowAction || canApproveOnBehalf
  const isOnBehalf = !allowAction && canApproveOnBehalf

  if (showAction) {
    // Nếu đã có trạng thái (đã duyệt hoặc từ chối), chỉ cho phép đổi trạng thái nếu là cấp 2
    if (status === 'Da_duyet' || status === 'Tu_choi') {
      const approverNameDisplay =
        level === 1
          ? row.nguoi_duyet_ho_cap_mot_ho_ten
            ? `${row.nguoi_duyet_ho_cap_mot_ho_ten} (Duyệt hộ ${row.nguoi_duyet_cap_mot_ho_ten})`
            : row.nguoi_duyet_cap_mot_ho_ten
          : row.nguoi_duyet_ho_cap_hai_ho_ten
            ? `${row.nguoi_duyet_ho_cap_hai_ho_ten} (Duyệt hộ ${row.nguoi_duyet_cap_hai_ho_ten})`
            : row.nguoi_duyet_cap_hai_ho_ten

      const time = formatDate(
        'H:i d/m/Y',
        row[`thoi_gian_duyet_cap_${level === 1 ? 'mot' : 'hai'}` as keyof LeaveRequest] as string
      )
      const reason = row[`ly_do_duyet_cap_${level === 1 ? 'mot' : 'hai'}` as keyof LeaveRequest]

      // CHỈ CẤP 2 MỚI ĐƯỢC ĐỔI TRẠNG THÁI
      if (level === 2) {
        return (
          <Popover>
            <Popover.Trigger>
              <div className="group/approval relative flex items-center justify-center h-9 w-full overflow-hidden cursor-pointer">
                <div className="flex flex-col items-center leading-none gap-0.5 group-hover/approval:opacity-0 transition-opacity duration-200">
                  <div
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${config.text}`}
                  >
                    {status === 'Da_duyet' && <Check size={11} strokeWidth={3} />}
                    {status === 'Tu_choi' && <X size={11} strokeWidth={3} />}
                    {config.label}
                    <ChevronDown size={13} className="text-gray-300 ml-0.5" />
                  </div>
                  {approverNameDisplay && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium opacity-80">
                      <User size={10} className="opacity-60" />
                      <span className="whitespace-nowrap">{approverNameDisplay}</span>
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 opacity-0 group-hover/approval:opacity-100 flex items-center justify-center gap-1.5 pointer-events-none group-hover/approval:pointer-events-auto transition-all duration-300 translate-y-2 group-hover/approval:translate-y-0">
                  {status === 'Da_duyet' ? (
                    <Tooltip delay={0}>
                      <Button
                        size="sm"
                        className={`h-7 px-2.5 ${isOnBehalf ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'} text-white font-bold text-[9px] rounded-md shadow-sm`}
                        onPress={() =>
                          (row?.id_nghi_phep || row?.uuid_nghi_phep) &&
                          openConfirm(row, level, 'reject', undefined, isOnBehalf)
                        }
                      >
                        {isOnBehalf ? 'TỪ CHỐI HỘ' : 'TỪ CHỐI'}
                      </Button>
                      <Tooltip.Content>
                        {isOnBehalf ? 'Đổi sang Từ chối hộ' : 'Đổi sang Từ chối'}
                      </Tooltip.Content>
                    </Tooltip>
                  ) : (
                    <Tooltip delay={0}>
                      <Button
                        size="sm"
                        className={`h-7 px-2.5 ${isOnBehalf ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold text-[9px] rounded-md shadow-sm`}
                        onPress={() =>
                          (row?.id_nghi_phep || row?.uuid_nghi_phep) &&
                          openConfirm(row, level, 'approve', undefined, isOnBehalf)
                        }
                      >
                        {isOnBehalf ? 'DUYỆT HỘ' : 'DUYỆT'}
                      </Button>
                      <Tooltip.Content>
                        {isOnBehalf ? 'Đổi sang Duyệt hộ' : 'Đổi sang Duyệt'}
                      </Tooltip.Content>
                    </Tooltip>
                  )}
                </div>
              </div>
            </Popover.Trigger>
            <Popover.Content
              placement="right"
              offset={10}
              className="p-0 border border-gray-200 shadow-xl overflow-hidden rounded-sm w-72"
            >
              <Popover.Dialog className="p-0 outline-none">
                <Popover.Arrow />
                <div
                  className={`w-full px-3 py-2 border-b border-gray-100 flex items-center justify-between ${status === 'Da_duyet' ? 'bg-green-50' : 'bg-red-50'}`}
                >
                  <span
                    className={`text-[11px] font-bold ${status === 'Da_duyet' ? 'text-green-700' : 'text-red-700'}`}
                  >
                    Thông tin {status === 'Da_duyet' ? 'duyệt' : 'từ chối'}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Cấp tổ chức</span>
                </div>
                <div className="p-3 space-y-2 w-full">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      Người xử lý
                    </span>
                    <div className="flex items-center gap-1.5">
                      <UserAvatar
                        name={approverNameDisplay || approverName || 'Unknown'}
                        size="sm"
                        className="w-5 h-5 flex-none text-[8px]"
                      />
                      <span className="text-xs font-semibold text-gray-700">
                        {approverNameDisplay || approverName || '---'}
                      </span>
                    </div>
                  </div>
                  {time && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        Thời gian
                      </span>
                      <span className="text-xs text-gray-600">{time}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      Ghi chú / Lý do
                    </span>
                    <span className="text-xs text-gray-600 italic wrap-break-word whitespace-normal">
                      {reason || 'Không có ghi chú'}
                    </span>
                  </div>
                  {row.minh_chung_duyet_ho_cap_hai && (
                    <div className="mt-1 pt-2 border-t border-gray-50 flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px] font-bold text-success"
                        onPress={() =>
                          onPreviewFile(
                            row.minh_chung_duyet_ho_cap_hai!,
                            'Minh chứng duyệt hộ',
                            'jpg'
                          )
                        }
                      >
                        <Image size={14} /> XEM MINH CHỨNG
                      </Button>
                    </div>
                  )}
                </div>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        )
      }
      // CẤP 1 KHÔNG ĐƯỢC ĐỔI TRẠNG THÁI - chỉ hiển thị thông tin như không có quyền
      // (fall through to the read-only section below)
    }

    // Trạng thái chờ duyệt - hiển thị cả 2 nút (CHỈ KHI STATUS LÀ CHO_DUYET)
    if (status === 'Cho_duyet') {
      return (
        <div className="group/approval relative flex items-center justify-center h-9 w-full overflow-hidden">
          <div className="flex flex-col items-center leading-none gap-0.5 group-hover/approval:opacity-0 transition-opacity duration-200">
            <div
              className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${config.text}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${(config as any).dot} animate-pulse shadow-[0_0_4px_rgba(234,179,8,0.5)]`}
              />
              {config.label}
              <ChevronDown size={13} className="text-gray-300 ml-0.5" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Chưa duyệt</span>
          </div>

          <div className="absolute inset-0 opacity-0 group-hover/approval:opacity-100 flex items-center justify-center gap-1.5 pointer-events-none group-hover/approval:pointer-events-auto transition-all duration-300 translate-y-2 group-hover/approval:translate-y-0">
            <Tooltip delay={0}>
              <Button
                size="sm"
                className={`h-7 px-2.5 ${isOnBehalf ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold text-[9px] rounded-md shadow-sm`}
                onPress={() =>
                  (row?.id_nghi_phep || row?.uuid_nghi_phep) &&
                  openConfirm(row, level, 'approve', undefined, isOnBehalf)
                }
              >
                {isOnBehalf ? 'DUYỆT HỘ' : 'DUYỆT'}
              </Button>
              <Tooltip.Content>{isOnBehalf ? 'Duyệt hộ lãnh đạo' : 'Duyệt đơn'}</Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0}>
              <Button
                size="sm"
                className={`h-7 px-2.5 ${isOnBehalf ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'} text-white font-bold text-[9px] rounded-md shadow-sm`}
                onPress={() =>
                  (row?.id_nghi_phep || row?.uuid_nghi_phep) &&
                  openConfirm(row, level, 'reject', undefined, isOnBehalf)
                }
              >
                {isOnBehalf ? 'TỪ CHỐI HỘ' : 'TỪ CHỐI'}
              </Button>
              <Tooltip.Content>
                {isOnBehalf ? 'Từ chối hộ lãnh đạo' : 'Từ chối đơn'}
              </Tooltip.Content>
            </Tooltip>
          </div>
        </div>
      )
    }
  }

  // Không có quyền - chỉ hiển thị thông tin
  if (status === 'Da_duyet' || status === 'Tu_choi') {
    const approverNameDisplay =
      level === 1
        ? row.nguoi_duyet_ho_cap_mot_ho_ten
          ? `${row.nguoi_duyet_ho_cap_mot_ho_ten} (Duyệt hộ ${row.nguoi_duyet_cap_mot_ho_ten})`
          : row.nguoi_duyet_cap_mot_ho_ten
        : row.nguoi_duyet_ho_cap_hai_ho_ten
          ? `${row.nguoi_duyet_ho_cap_hai_ho_ten} (Duyệt hộ ${row.nguoi_duyet_cap_hai_ho_ten})`
          : row.nguoi_duyet_cap_hai_ho_ten

    const time = formatDate(
      'H:i d/m/Y',
      row[`thoi_gian_duyet_cap_${level === 1 ? 'mot' : 'hai'}` as keyof LeaveRequest] as string
    )
    const reason = row[`ly_do_duyet_cap_${level === 1 ? 'mot' : 'hai'}` as keyof LeaveRequest] // Chưa có field này trong mockData nhưng sẽ handle

    return (
      <Popover>
        <Popover.Trigger>
          <div className="cursor-pointer group/approval">
            <StatusBadge
              status={status}
              approverName={approverNameDisplay || approverName}
              level={level}
              showChevron
            />
          </div>
        </Popover.Trigger>
        <Popover.Content
          placement="right"
          offset={10}
          className="p-0 border border-gray-200 shadow-xl overflow-hidden rounded-sm w-72"
        >
          <Popover.Dialog className="p-0 outline-none">
            <Popover.Arrow />
            <div
              className={`w-full px-3 py-2 border-b border-gray-100 flex items-center justify-between ${status === 'Da_duyet' ? 'bg-green-50' : 'bg-red-50'}`}
            >
              <span
                className={`text-[11px] font-bold ${status === 'Da_duyet' ? 'text-green-700' : 'text-red-700'}`}
              >
                Thông tin {status === 'Da_duyet' ? 'duyệt' : 'từ chối'}
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                {level === 1 ? 'Cấp đơn vị' : 'Cấp tổ chức'}
              </span>
            </div>
            <div className="p-3 space-y-2 w-full">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">Người xử lý</span>
                <div className="flex items-center gap-1.5">
                  <UserAvatar
                    name={approverNameDisplay || approverName || 'Unknown'}
                    size="sm"
                    className="w-5 h-5 flex-none text-[8px]"
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    {approverNameDisplay || approverName || '---'}
                  </span>
                </div>
              </div>
              {time && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Thời gian</span>
                  <span className="text-xs text-gray-600">{time}</span>
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Ghi chú / Lý do
                </span>
                <span className="text-xs text-gray-600 italic wrap-break-word whitespace-normal">
                  {reason || 'Không có ghi chú'}
                </span>
              </div>
              {level === 1 && row.minh_chung_duyet_ho_cap_mot && (
                <div className="mt-1 pt-2 border-t border-gray-50 flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px] font-bold text-success"
                    onPress={() =>
                      onPreviewFile(row.minh_chung_duyet_ho_cap_mot!, 'Minh chứng duyệt hộ', 'jpg')
                    }
                  >
                    <Image size={14} /> XEM MINH CHỨNG
                  </Button>
                </div>
              )}
              {level === 2 && row.minh_chung_duyet_ho_cap_hai && (
                <div className="mt-1 pt-2 border-t border-gray-50 flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px] font-bold text-success"
                    onPress={() =>
                      onPreviewFile(row.minh_chung_duyet_ho_cap_hai!, 'Minh chứng duyệt hộ', 'jpg')
                    }
                  >
                    <Image size={14} /> XEM MINH CHỨNG
                  </Button>
                </div>
              )}
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    )
  }

  return <StatusBadge status={status} approverName={approverName} level={level} />
}

export const getLeaveColumns = (
  openConfirm: (
    row: LeaveRequest,
    level: 1 | 2,
    type: 'approve' | 'reject',
    reason?: string,
    isOnBehalf?: boolean
  ) => void,
  handleEdit: (row: LeaveRequest) => void,
  handleView: (row: LeaveRequest) => void,
  handleRecall: (row: LeaveRequest) => void,
  handleMinhChung: (row: LeaveRequest) => void,
  onPreviewFile: (url: string, name: string, ext: string) => void,
  permissions: {
    canApproveLevel1: boolean
    canApproveLevel2: boolean
    canApprove: boolean
    canApproveOnBehalf?: boolean
  },
  currentUserId?: string | number,
  handlePhucKhao?: (row: LeaveRequest) => void
): TableColumnType<LeaveRequest>[] => [
    {
      uid: 'stt',
      name: '#',
      width: 40,
      pinned: 'left',
      className: 'text-center font-bold p-0!',
      render: (_, row: any) => {
        if (row.so_lan_phuc_khao > 0 && row.thoi_gian_phuc_khao) {
          return (
            <div className="absolute -top-[18px] left-0 z-50">
              <Tooltip delay={0}>
                <Tooltip.Trigger>
                  <div
                    className="w-0 h-0 cursor-help"
                    style={{
                      borderTop: '14px solid #22c55e',
                      borderRight: '14px solid transparent'
                    }}
                  />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  Phúc khảo lúc {formatDate('H:i d/m/Y', row.thoi_gian_phuc_khao)}
                </Tooltip.Content>
              </Tooltip>
            </div>
          )
        }
        return null
      }
    },
    // {
    //   uid: 'uuid',
    //   name: 'MÃ ĐƠN',
    //   width: 130,
    //   pinned: 'left',
    //   sortable: false,
    //   render: (_, row: any) => (
    //     <span
    //       className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors uppercase underline font-medium"
    //       onClick={() => handleView(row)}
    //     >
    //       #{row.uuid_nghi_phep || '---'}
    //     </span>
    //   )
    // },
    {
      uid: 'nhan_vien',
      name: 'Nhân viên',
      width: 180,
      pinned: 'left',
      render: (_, row: any) => {
        return (
          <>
            <div className="group relative flex items-center gap-2 w-full px-1">
              <div
                onClick={() => handleView(row)}
                className="flex items-center gap-2 flex-1 min-w-0 hover:underline cursor-pointer"
              >
                <div className="shrink-0 flex items-center justify-center">
                  <UserAvatar
                    name={row.ho_va_ten || `User ${row?.id_nhan_vien}`}
                    src={row.avatar}
                    gender={row.gioi_tinh}
                    size="sm"
                  />
                </div>
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                  <span className="text-gray-700 dark:text-gray-200 truncate font-medium">
                    {row.ho_va_ten || `Nhân viên ${row.id_nhan_vien}`}
                  </span>
                  <span className="text-[10px] mt-0.5 text-gray-500 uppercase font-bold">
                    {`UID: ${row.ma_nhan_vien}, #${row.uuid_nghi_phep || '---'}`}
                  </span>
                </div>
              </div>
            </div>
          </>
        )
      }
    },
    {
      uid: 'chi_tiet_ngay_nghi',
      name: 'Ngày nghỉ',
      width: 180,
      render: (value: any) => {
        const { totalDays, dateRangeDisplay } = getLeaveDateRange(value)
        if (totalDays === 0) return '---'

        if (!Array.isArray(value)) return '---'

        const sortedDates = [...value].sort(
          (a, b) => new Date(a.ngay_nghi).getTime() - new Date(b.ngay_nghi).getTime()
        )

        return (
          <Popover>
            <Popover.Trigger>
              <div className="flex flex-col leading-tight py-1 cursor-pointer hover:opacity-80 transition-opacity group">
                <span className="text-gray-900 font-medium text-sm flex items-center gap-1">
                  {totalDays} Ngày
                  <ChevronDown
                    size={14}
                    className="text-gray-400 group-hover:text-gray-900 transition-colors"
                  />
                </span>
                <div className="flex items-center gap-1 text-gray-500 text-[11px] mt-0.5">
                  <Calendar size={10} className="opacity-60" />
                  <span>{dateRangeDisplay}</span>
                </div>
              </div>
            </Popover.Trigger>
            <Popover.Content
              placement="right"
              offset={10}
              className="p-0 border border-gray-200 shadow-xl overflow-hidden rounded-sm"
            >
              <Popover.Dialog className="p-0 outline-none">
                <Popover.Arrow />
                <div className="flex flex-col w-56">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-600">Lịch nghỉ chi tiết</span>
                    <span className="text-[10px] font-bold text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded-sm">
                      {totalDays} ngày công
                    </span>
                  </div>
                  <div className="p-1 space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar">
                    {sortedDates.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-sm transition-colors"
                      >
                        <div className="flex flex-col leading-none gap-1">
                          <span className="text-[11px] font-medium text-gray-700">
                            {formatDate('d/m/Y', String(item.ngay_nghi))}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold ${item.buoi_nghi === 'Sang'
                            ? 'bg-blue-100 text-blue-700'
                            : item.buoi_nghi === 'Chieu'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                            }`}
                        >
                          {item.buoi_nghi === 'Sang'
                            ? 'SÁNG'
                            : item.buoi_nghi === 'Chieu'
                              ? 'CHIỀU'
                              : 'CẢ NGÀY'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        )
      }
    },
    {
      uid: 'trang_thai_cap_mot',
      name: 'Cấp đơn vị',
      width: 160,
      className: 'text-center',
      render: (value, row) =>
        row && (
          <ApprovalCell
            value={value as string}
            row={row}
            level={1}
            openConfirm={openConfirm}
            allowAction={permissions.canApproveLevel1}
            canApproveOnBehalf={permissions.canApproveOnBehalf}
            onPreviewFile={onPreviewFile}
          />
        )
    },
    {
      uid: 'trang_thai_cap_hai',
      name: 'Cấp tổ chức',
      width: 160,
      className: 'text-center',
      render: (value, row) => {
        return (
          row && (
            <ApprovalCell
              value={value as string}
              row={row}
              level={2}
              openConfirm={openConfirm}
              allowAction={permissions.canApproveLevel2}
              canApproveOnBehalf={false}
              onPreviewFile={onPreviewFile}
            />
          )
        )
      }
    },
    {
      uid: 'ly_do_nghi',
      name: 'Lý do',
      width: 300,
      render: (value: any, row: any) => (
        <div className="flex flex-col gap-1 py-1 min-w-0">
          <div
            className="text-gray-800 leading-normal truncate"
            title={String(value || 'Nghỉ phép năm')}
          >
            {String(value || 'Nghỉ phép năm')}
          </div>
          {row.minh_chung && (
            <div className="flex items-center mt-0.5">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onPreviewFile(row.minh_chung, `Minh chứng - ${row.ho_va_ten}`, row.minh_chung_ext)
                }}
                title="Click để xem minh chứng"
                className="group flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 text-blue-600 hover:text-white transition-all duration-200 shadow-sm cursor-pointer"
              >
                <FileText size={10} strokeWidth={3} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Xem Minh Chứng</span>
              </button>
            </div>
          )}
        </div>
      )
    },
    {
      uid: 'ten_don_vi',
      name: 'Đơn vị',
      width: 200,
      render: (value: any) => (
        <span className="font-medium">{String(value || '---')}</span>
      )
    },
    {
      uid: 'ten_loai_phep',
      name: 'Loại phép',
      width: 150,
      render: (value: any) => (
        <span className="font-medium">
          {String(value || 'Nghỉ phép năm')}
        </span>
      )
    },
    {
      uid: 'loai_nghi',
      name: 'Loại nghỉ',
      width: 100,
      className: 'text-center',
      render: (value) => {
        if (value === 'Dot_xuat') {
          return <span className="text-red-500 font-medium text-xs">Đột xuất</span>
        }
        if (value === 'Binh_thuong') {
          return <span className="text-gray-600 text-xs">Xin trước</span>
        }
        return <span className="text-gray-400 text-xs">---</span>
      }
    },
    {
      uid: 'ngay_nop',
      name: 'Ngày nộp',
      width: 170,
      render: (_, row: any) => (
        <div className="flex flex-col text-xs leading-tight py-1">
          <span className="font-medium text-gray-800">{formatDate('d/m/Y', row.created_at)}</span>
          <span className="text-[10px] text-gray-400 font-medium">{formatDate('H:i:s', row.created_at)}</span>
        </div>
      )
    },
    {
      uid: 'nguoi_tao',
      name: 'Người tạo',
      width: 170,
      render: (_: any, row: any) => {
        const taoHo = Number(row.tao_ho) === 1
        if (taoHo) {
          return (
            <div className="flex flex-col gap-0.5 py-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded w-fit">
                <User size={10} strokeWidth={3} />
                Tạo hộ
              </span>
              {row.nguoi_tao_ho_ten && (
                <span className="text-xs text-gray-600 truncate">{row.nguoi_tao_ho_ten}</span>
              )}
            </div>
          )
        }
        return (
          <div className="flex items-center gap-1 text-xs text-gray-500 py-0.5">
            <User size={12} className="text-blue-400 shrink-0" />
            <span className="truncate">{row.ho_va_ten || '---'}</span>
          </div>
        )
      }
    }
  ]
