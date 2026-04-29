import { Chip, Skeleton } from '@heroui-v3/react'
import type { YeuCauCapNhat } from '@renderer/api/hr/nhanvientucapnhatAxios'
import { CheckCircle2, Clock, FilePen, XCircle } from 'lucide-react'

const FIELD_LABELS: Record<string, string> = {
  ho_va_ten: 'Họ và tên',
  ngay_sinh: 'Ngày sinh',
  gioi_tinh: 'Giới tính',
  so_dien_thoai: 'Số điện thoại',
  email: 'Email',
  mst_ca_nhan: 'Mã số thuế cá nhân',
  cccd_so: 'Số CCCD',
  cccd_noi_cap: 'Nơi cấp CCCD',
  cccd_ngay_cap: 'Ngày cấp CCCD',
  cccd_ngay_het_han: 'Ngày hết hạn CCCD',
  ho_chieu_so: 'Số hộ chiếu',
  ho_chieu_noi_cap: 'Nơi cấp hộ chiếu',
  ho_chieu_ngay_cap: 'Ngày cấp hộ chiếu',
  ho_chieu_ngay_het_han: 'Ngày hết hạn hộ chiếu',
  id_don_vi_cong_tac: 'Đơn vị công tác',
  id_vi_tri_cong_viec: 'Chức vụ',
  id_dan_toc: 'Dân tộc',
  id_ton_giao: 'Tôn giáo',
  id_quoc_tich: 'Quốc tịch',
  que_quan: 'Quê quán',
  hktt_dia_chi: 'Địa chỉ HKTT',
  hktt_so_nha: 'Số nhà HKTT',
  cohn_dia_chi: 'Địa chỉ hiện tại',
  cohn_so_nha: 'Số nhà hiện tại',
  trinh_do_vh: 'Trình độ văn hóa',
  hoc_ham: 'Học hàm',
  trinh_do_dt: 'Học vị',
  noi_dt: 'Nơi đào tạo',
  nganh_dt: 'Chuyên ngành',
  avatar: 'Ảnh đại diện',
  lhkc_ho_ten: 'Liên hệ KC - Họ tên',
  lhkc_quan_he: 'Liên hệ KC - Quan hệ',
  lhkc_sdt_di_dong: 'Liên hệ KC - SĐT',
  lhkc_email: 'Liên hệ KC - Email',
  bang_cap: 'Bằng cấp',
  chung_chi: 'Chứng chỉ',
  minh_chung: 'Minh chứng'
}

type StatusConfig = {
  label: string
  color: 'success' | 'danger' | 'warning'
  icon: React.ReactNode
  borderColor: string
}

function getStatusConfig(status: number): StatusConfig {
  if (status === 1) return {
    label: 'Đã duyệt',
    color: 'success',
    icon: <CheckCircle2 size={15} />,
    borderColor: 'border-l-green-500'
  }
  if (status === 2) return {
    label: 'Từ chối',
    color: 'danger',
    icon: <XCircle size={15} />,
    borderColor: 'border-l-red-500'
  }
  return {
    label: 'Chờ duyệt',
    color: 'warning',
    icon: <Clock size={15} />,
    borderColor: 'border-l-orange-500'
  }
}

function formatDate(ngay_tao: string) {
  const [datePart, timePart] = ngay_tao.split(' ')
  const [y, m, d] = datePart.split('-')
  return { time: timePart, date: `${d}/${m}/${y}` }
}

type Props = {
  myRequests: YeuCauCapNhat[]
  isLoadingRequests: boolean
  onOpenRequest: (req: YeuCauCapNhat) => void
}

export default function UpdateRequestSection({
  myRequests,
  isLoadingRequests,
  onOpenRequest
}: Props) {
  return (
    <div className="space-y-4 mt-2">

      {/* Loading */}
      {isLoadingRequests && (
        <div className="space-y-0 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-24 h-3 rounded" />
                <Skeleton className="w-48 h-3 rounded" />
              </div>
              <Skeleton className="w-16 h-6 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoadingRequests && myRequests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <FilePen size={20} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Bạn chưa có yêu cầu cập nhật nào</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Nhấn "Tạo yêu cầu" để bắt đầu</p>
        </div>
      )}

      {/* Request list — Google Account style */}
      {!isLoadingRequests && myRequests.length > 0 && (
        <div className="flex flex-col gap-1">
          {myRequests.map((req) => {
            const status = Number(req.trang_thai)
            const statusCfg = getStatusConfig(status)

            let fields: string[] = []
            try {
              fields = Object.keys(JSON.parse(req.du_lieu || '{}'))
            } catch { /* empty */ }

            const formatted = req.ngay_tao ? formatDate(req.ngay_tao) : null

            return (
              <button
                key={req.id_yeu_cau_cap_nhat}
                type="button"
                onClick={() => onOpenRequest(req)}
                className="w-full text-left flex items-start gap-4 px-4 py-4
                  bg-white dark:bg-gray-900
                  hover:bg-gray-50 dark:hover:bg-gray-800/60
                  border border-gray-100 dark:border-gray-800
                  rounded-xl
                  transition-colors duration-100 cursor-pointer focus:outline-none"
              >

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Chip size="sm" color={statusCfg.color} variant="soft">
                      {statusCfg.label}
                    </Chip>
                    {req.ql_nguoi_dung_ho_ten && (
                      <span className="text-xs text-gray-400 truncate">
                        · Duyệt bởi: {req.ql_nguoi_dung_ho_ten}
                      </span>
                    )}
                  </div>
                  {fields.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {fields.slice(0, 4).map((f) => (
                        <Chip key={f} size="sm" color="accent" variant="soft">
                          {FIELD_LABELS[f] || f}
                        </Chip>
                      ))}
                      {fields.length > 4 && (
                        <Chip size="sm" color="default" variant="soft">
                          +{fields.length - 4}
                        </Chip>
                      )}
                    </div>
                  )}
                </div>

                {/* Date */}
                {formatted && (
                  <div className="text-right shrink-0">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                      {formatted.time}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                      {formatted.date}
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
