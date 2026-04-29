import {
  CreditCard,
  User as UserIcon,
  Briefcase,
  Building2,
  Hash,
  Calendar,
  Mail,
  MapPin,
  CircleUser
} from 'lucide-react'
import { date } from '@renderer/utils/formatDate'

type PersonalInfoSectionProps = {
  user: any
}

type InfoRowProps = {
  label: string
  value: any
  icon: any
  accentValue?: boolean
  fullWidth?: boolean
}

function InfoRow({ label, value, icon: Icon, accentValue, fullWidth }: InfoRowProps) {
  return (
    <div
      className={`flex items-start gap-3.5 px-4 py-3.5 bg-white dark:bg-gray-900
        hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors duration-100
        cursor-default border-b border-gray-100 dark:border-gray-800/60 last:border-0
        ${fullWidth ? 'col-span-2' : ''}
      `}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        <Icon size={18} className="text-gray-400 dark:text-gray-500" strokeWidth={1.75} />
      </div>

      {/* Text */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200 leading-snug">
          {label}
        </span>
        {value ? (
          <span
            className={`text-[13px] leading-snug mt-0.5 wrap-break-word ${accentValue
              ? 'text-blue-600 dark:text-blue-400 font-medium'
              : 'text-gray-500 dark:text-gray-400'
              }`}
          >
            {value}
          </span>
        ) : (
          <span className="text-[13px] leading-snug mt-0.5 text-gray-300 dark:text-gray-600">
            Chưa cập nhật
          </span>
        )}
      </div>
    </div>
  )
}

export default function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  const formatGender = (gender: any) => {
    if (String(gender) === '1') return 'Nam'
    if (String(gender) === '2') return 'Nữ'
    return null
  }

  return (
    <div className="space-y-3 max-w-3xl mx-auto mt-2">

      {/* 2-column grid card */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <InfoRow
            icon={UserIcon}
            label="Họ và tên"
            value={user?.ho_va_ten || user?.ql_nguoi_dung_ho_ten}
            accentValue
          />
          <InfoRow
            icon={CreditCard}
            label="Mã nhân sự"
            value={user?.ma_nhan_vien}
          />
          <InfoRow
            icon={CircleUser}
            label="Giới tính"
            value={formatGender(user?.gioi_tinh)}
          />
          <InfoRow
            icon={Calendar}
            label="Ngày sinh"
            value={user?.ngay_sinh ? date('d/m/Y', user.ngay_sinh) : null}
          />
          <InfoRow
            icon={Mail}
            label="Email"
            value={user?.ql_nguoi_dung_email || user?.email}
          />
          <InfoRow
            icon={Hash}
            label="Số căn cước"
            value={user?.cccd_so}
          />
          <InfoRow
            icon={Briefcase}
            label="Chức danh"
            value={user?.ten_cong_viec}
          />
          <InfoRow
            icon={Building2}
            label="Đơn vị"
            value={user?.ten_don_vi}
          />
          {/* Full-width rows */}
          <InfoRow
            icon={MapPin}
            label="Địa chỉ hộ khẩu thường trú"
            value={user?.hktt_dia_chi}
            fullWidth
          />
          <InfoRow
            icon={MapPin}
            label="Chỗ ở hiện nay"
            value={user?.cohn_so_nha}
            fullWidth
          />
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-600 pt-1 italic">
        * Dữ liệu được trích xuất từ hệ thống quản lý nhân sự tập trung
      </p>
    </div>
  )
}
