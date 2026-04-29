import { CreditCard } from 'lucide-react'

export default function IntheHeader() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-none flex items-center gap-4">
      <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
        <CreditCard size={28} />
      </div>
      <div>
        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          Cấu hình In thẻ Nhân sự
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Chọn nhân sự từ danh sách bên dưới để bắt đầu quy trình in thẻ định danh cơ quan.
        </p>
      </div>
    </div>
  )
}
