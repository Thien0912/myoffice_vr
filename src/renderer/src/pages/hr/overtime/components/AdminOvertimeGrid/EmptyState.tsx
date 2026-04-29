import React from 'react'
import { Clock, Inbox } from 'lucide-react'

export const EmptyState = React.memo(function EmptyState() {
  return (
    <div className="absolute inset-0 top-[80px] flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center text-center pointer-events-auto">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 flex items-center justify-center border-2 border-dashed border-blue-200 dark:border-blue-800">
            <Inbox size={40} className="text-blue-300 dark:text-blue-600" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
            <Clock size={14} className="text-gray-400" />
          </div>
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Chưa có đơn ngoài giờ
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-md leading-relaxed">
          Không tìm thấy đơn ngoài giờ nào trong khoảng thời gian đã chọn.
          <br />
          Hãy thử chọn bảng công khác hoặc thay đổi bộ lọc.
        </p>
      </div>
    </div>
  )
})
