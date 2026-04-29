import { Bell } from 'lucide-react'

export default function NotificationsTabContent() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-400">
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-full mb-4 ring-8 ring-gray-50/50 dark:ring-gray-800/50">
        <Bell size={32} className="opacity-50" />
      </div>
      <p className="font-normal text-sm">Tính năng thông báo đang được phát triển</p>
    </div>
  )
}
