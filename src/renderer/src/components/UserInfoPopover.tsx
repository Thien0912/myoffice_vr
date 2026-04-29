import { Popover, PopoverContent, PopoverTrigger } from '@heroui/react'
import UserAvatar from '@renderer/components/UserAvatar'
import { ReactNode } from 'react'
import { date as formatDate } from '@renderer/utils/formatDate'

interface UserInfoPopoverProps {
  user: {
    ho_va_ten: string
    avatar?: string
    gioi_tinh?: string | number | null
    email?: string
    [key: string]: any
  }
  trigger?: ReactNode
  placement?:
    | 'top'
    | 'bottom'
    | 'right'
    | 'left'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'right-start'
    | 'right-end'
    | 'left-start'
    | 'left-end'
  showExtraInfo?: boolean
}

export const UserInfoPopoverContent = ({
  user,
  showExtraInfo = true
}: {
  user: UserInfoPopoverProps['user']
  showExtraInfo?: boolean
}) => {
  return (
    <div className="p-2 w-72">
      <div className="flex items-center gap-3 mb-3">
        <UserAvatar
          name={user.ho_va_ten}
          gender={user.gioi_tinh === null ? undefined : user.gioi_tinh}
          src={user.avatar}
          className="w-12 h-12 text-sm"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm truncate">{user.ho_va_ten}</span>
          <span className="text-xs text-gray-500 truncate">{user.email || '---'}</span>
          {user.ma_nhan_vien && (
            <span className="font-semibold text-gray-700 mt-0.5 text-xs">
              UID: {user.ma_nhan_vien}
            </span>
          )}
        </div>
      </div>

      {showExtraInfo && (
        <div className="space-y-2 text-xs border-t border-gray-100 pt-2 mt-2 px-2">
          {/* Custom extra fields logic can be expanded here or passed as props */}
          <div className="grid grid-cols-2 gap-2">
            {user.ngay_lam_chinh_thuc && (
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-500 text-[10px] uppercase">Ngày vào làm</span>
                <span className="font-medium">{formatDate('d/m/Y', user.ngay_lam_chinh_thuc)}</span>
              </div>
            )}
            {user.ngay_lam_chinh_thuc_ket_thuc && (
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-500 text-[10px] uppercase">Ngày thôi việc</span>
                <span className="font-medium text-red-500">
                  {formatDate('d/m/Y', user.ngay_lam_chinh_thuc_ket_thuc)}
                </span>
              </div>
            )}
            {user.so_dien_thoai && (
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-500 text-[10px] uppercase">Số điện thoại</span>
                <span className="font-medium">{user.so_dien_thoai}</span>
              </div>
            )}
            {user.ten_don_vi && (
              <div className="flex flex-col gap-0.5 col-span-2">
                <span className="text-gray-500 text-[10px] uppercase">Đơn vị</span>
                <span className="font-medium">{user.ten_don_vi}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function UserInfoPopover({
  user,
  trigger,
  placement = 'bottom-start',
  showExtraInfo = true
}: UserInfoPopoverProps) {
  if (!user) return null

  return (
    <Popover placement={placement} showArrow offset={10}>
      <PopoverTrigger>
        {trigger || (
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-md transition-colors inline-flex">
            <UserAvatar
              name={user.ho_va_ten}
              gender={user.gioi_tinh === null ? undefined : user.gioi_tinh}
              src={user.avatar}
              className="w-6 h-6 text-[10px]"
            />
            <span className="text-xs text-gray-500 font-normal truncate max-w-[150px]">
              {user.ho_va_ten}
            </span>
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0 border border-gray-200 shadow-xl overflow-hidden rounded-sm">
        <UserInfoPopoverContent user={user} showExtraInfo={showExtraInfo} />
      </PopoverContent>
    </Popover>
  )
}
