import { Chip } from '@heroui/react'
import { CheckCircle2, Ban, Clock, Check } from 'lucide-react'
import { STATUS_MAP } from '../constants/proposeConstants'
import { ProposeData } from '../hooks/usePropose'

interface ProposeStatusProps {
  status: string
  row: ProposeData
}

export const ProposeStatus = ({ status: value, row }: ProposeStatusProps) => {
  if (!row) return null

  const isApprovedGlobal = String(value) === 'da_duyet'
  const isRejectedGlobal = String(value) === 'tu_choi'
  const isProcessing = String(value) === 'dang_xu_ly'
  const isDraft = String(value) === 'nhap'

  const approvedCount = parseInt(String(row.count_approved || 0))
  const totalCount = parseInt(String(row.count_total || 0))
  const progress = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0

  // Lấy trạng thái cục bộ từ đơn vị
  const isUnitApproved = Number(row.is_unit_approved) === 1
  const isMyUnitTurn = Number(row.is_my_unit_turn) === 1

  // 1. TRƯỜNG HỢP ĐỀ XUẤT HOÀN THÀNH TỔNG THỂ
  if (isApprovedGlobal) {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <div className="flex items-center gap-1.5 text-green-600 font-bold whitespace-nowrap text-[13px]">
          <CheckCircle2 size={15} className="text-green-600" />
          <span>Hoàn thành</span>
        </div>
        {row.nguoi_hoan_thanh && (
          <span className="text-[10px] text-gray-400 font-medium">
            TCHC: {row.nguoi_hoan_thanh}
          </span>
        )}
      </div>
    )
  }

  // 2. TRƯỜNG HỢP ĐỀ XUẤT BỊ HỦY
  if (isRejectedGlobal) {
    return (
      <div className="flex items-center gap-2 text-gray-500 font-medium whitespace-nowrap text-[13px]">
        <Ban size={16} />
        <span>Hủy bỏ</span>
      </div>
    )
  }

  // 3. TRƯỜNG HỢP ĐANG XỬ LÝ
  if (isProcessing) {
    return (
      <div className="flex flex-col gap-1 w-full py-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {isUnitApproved ? (
              <div className="flex items-center gap-1 text-blue-600 font-semibold text-[13px]">
                <Check size={14} strokeWidth={3} />
                <span>Đã xác nhận</span>
              </div>
            ) : (
              <span
                className={`text-[13px] ${isMyUnitTurn ? 'text-blue-600 font-bold' : 'text-gray-500 font-medium'}`}
              >
                {isMyUnitTurn ? 'Chờ tôi ký' : 'Đang trình ký'}
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 font-medium shrink-0">
            {approvedCount}/{totalCount}
          </span>
        </div>
        <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${isUnitApproved || isMyUnitTurn ? 'bg-blue-500' : 'bg-gray-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  // 4. BẢN NHÁP
  if (isDraft) {
    return (
      <div className="flex items-center gap-2 text-gray-400 font-medium whitespace-nowrap text-[13px]">
        <Clock size={16} />
        <span>Bản nháp</span>
      </div>
    )
  }

  const status = STATUS_MAP[String(value) as keyof typeof STATUS_MAP] || {
    label: 'Không xác định',
    color: 'default'
  }

  return (
    <Chip size="sm" variant="flat" color={status.color} className="h-5 text-[11px]">
      {status.label}
    </Chip>
  )
}
