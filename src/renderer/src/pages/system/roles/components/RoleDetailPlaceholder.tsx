import { Shield } from 'lucide-react'

export const RoleDetailPlaceholder = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm flex-1 border border-gray-100 dark:border-gray-700 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto text-blue-500 animate-pulse">
          <Shield size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-200">
            Vui lòng chọn vai trò
          </h3>
          <p className="text-[13px] text-gray-400 max-w-xs mx-auto">
            Chọn một vai trò từ danh sách bên trái để xem và quản lý chi tiết quyền hạn.
          </p>
        </div>
      </div>
    </div>
  )
}
