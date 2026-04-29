import { Button, toast } from '@heroui-v3/react'
import { ChevronRight, Lock, User, KeyRound } from 'lucide-react'
import { useState } from 'react'
import RegisterPinModal from './RegisterPinModal'
import { userAxios } from '@renderer/api/auth/userAxios'

interface AccountSettingsSectionProps {
  user: any
}

export default function AccountSettingsSection({ user }: AccountSettingsSectionProps) {
  const [isRegisterPinOpen, setIsRegisterPinOpen] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleResend = async () => {
    if (!user?.pin_code_id) {
      toast('Lỗi', { description: 'Không tìm thấy thông tin mã PIN. Vui lòng tải lại trang.', variant: 'danger' })
      return
    }

    try {
      setIsResending(true)
      const res: any = await userAxios.sendPinCodeApprovalEmail(user.pin_code_id)
      if (res?.success) {
        toast('Thành công', { description: res.message || 'Đã gửi lại email xác thực.', variant: 'success' })
      } else {
        toast('Lỗi', { description: res.message || 'Gửi email thất bại.', variant: 'danger' })
      }
    } catch (error: any) {
      toast('Lỗi', { description: error?.response?.data?.message || 'Có lỗi xảy ra.', variant: 'danger' })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-4 mt-2">
      <div className="bg-white dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        <Button
          isDisabled
          variant="ghost"
          className="justify-between h-auto py-3 px-4 bg-transparent border-b border-gray-200 dark:border-gray-800/50 last:border-0 hover:bg-transparent group rounded-none w-full"
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="text-gray-400 group-hover:text-blue-500 transition-colors shrink-0">
              <Lock size={18} />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-normal text-gray-800 dark:text-gray-200 truncate w-full text-left">
                Đổi mật khẩu
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-left font-medium">
                Thay đổi mật khẩu định kỳ để bảo mật
              </span>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 ml-2"
          />
        </Button>

        <Button
          isDisabled
          variant="ghost"
          className="justify-between h-auto py-3 px-4 bg-transparent border-b border-gray-200 dark:border-gray-800/50 last:border-0 hover:bg-transparent group rounded-none w-full"
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="text-gray-400 group-hover:text-blue-500 transition-colors shrink-0">
              <User size={18} />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-normal text-gray-800 dark:text-gray-200 truncate w-full text-left">
                Cập nhật thông tin
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-left font-medium">
                Email, số điện thoại và địa chỉ
              </span>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 ml-2"
          />
        </Button>

        <div className="relative w-full">
          <Button
            variant="ghost"
            isDisabled={
              user?.has_pin === 1 ||
              user?.has_pin === '1' ||
              user?.has_pin === 2 ||
              user?.has_pin === '2' ||
              user?.has_pin === 3 ||
              user?.has_pin === '3'
            }
            onPress={() => setIsRegisterPinOpen(true)}
            className={`justify-between h-auto py-3 px-4 bg-transparent border-b border-gray-200 dark:border-gray-800/50 last:border-0 hover:bg-transparent group rounded-none w-full ${user?.has_pin ? 'opacity-100 cursor-default' : ''}`}
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div
                className={`${user?.has_pin === 1 || user?.has_pin === '1'
                  ? 'text-green-500'
                  : user?.has_pin === 2 || user?.has_pin === '2'
                    ? 'text-amber-500'
                    : user?.has_pin === 3 || user?.has_pin === '3'
                      ? 'text-red-500'
                      : 'text-gray-400 group-hover:text-blue-500'
                  } transition-colors shrink-0`}
              >
                <KeyRound size={18} />
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-normal text-gray-800 dark:text-gray-200 truncate w-full text-left">
                  {user?.has_pin === 1 || user?.has_pin === '1'
                    ? 'Đã đăng ký mã PIN'
                    : user?.has_pin === 2 || user?.has_pin === '2'
                      ? 'Mã PIN chờ xác thực'
                      : user?.has_pin === 3 || user?.has_pin === '3'
                        ? 'Mã PIN bị vô hiệu hóa'
                        : 'Đăng ký mã PIN'}
                </span>
                <span
                  className={`text-xs truncate w-full text-left font-medium ${user?.has_pin === 1 || user?.has_pin === '1'
                    ? 'text-green-600 dark:text-green-400'
                    : user?.has_pin === 2 || user?.has_pin === '2'
                      ? 'text-amber-600 dark:text-amber-400'
                      : user?.has_pin === 3 || user?.has_pin === '3'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-500 dark:text-blue-400'
                    }`}
                >
                  {user?.has_pin === 1 || user?.has_pin === '1'
                    ? 'Mã PIN của bạn đang hoạt động'
                    : user?.has_pin === 2 || user?.has_pin === '2'
                      ? 'Vui lòng kiểm tra email để xác thực mã PIN'
                      : user?.has_pin === 3 || user?.has_pin === '3'
                        ? 'Vui lòng liên hệ quản trị viên để mở khóa'
                        : 'Dùng để ký số và xác thực nhanh'}
                </span>
              </div>
            </div>
            {(user?.has_pin === null || user?.has_pin === undefined) && (
              <ChevronRight
                size={16}
                className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 ml-2"
              />
            )}
          </Button>

          {(user?.has_pin === 2 || user?.has_pin === '2') && (
            <Button
              variant="secondary"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-8 px-3 bg-blue-100 text-blue-700 hover:bg-blue-200"
              onPress={handleResend}
              isPending={isResending}
            >
              Gửi xác thực lại
            </Button>
          )}
        </div>
      </div>

      <RegisterPinModal isOpen={isRegisterPinOpen} onClose={() => setIsRegisterPinOpen(false)} />
    </div>
  )
}
