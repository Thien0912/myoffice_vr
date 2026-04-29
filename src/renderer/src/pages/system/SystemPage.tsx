import { useMemo, useState } from 'react'
import { Activity, Bell, Key, Shield, Users } from 'lucide-react'
import { SystemSidebar, SystemTabItem } from './components/SystemSidebar'
import { HistoryLogTab } from './tabs/HistoryLogTab'
import { NotificationTab } from './tabs/NotificationTab'
import { PermissionTab } from './tabs/PermissionTab'
import { RoleTab } from './tabs/RoleTab'
import { UserTab } from './tabs/UserTab'

type Props = {}

export default function SystemPage({}: Props) {
  const [activeTab, setActiveTab] = useState('users')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const SYSTEM_TABS: SystemTabItem[] = useMemo(
    () => [
      {
        id: 'users',
        label: 'Người dùng',
        icon: Users,
        description: 'Quản lý tài khoản và thông tin người dùng',
        component: <UserTab />
      },
      {
        id: 'roles',
        label: 'Vai trò hệ thống',
        icon: Shield,
        description: 'Định nghĩa các vai trò và chức danh',
        component: <RoleTab />
      },
      {
        id: 'permissions',
        label: 'Quyền hệ thống',
        icon: Key,
        description: 'Phân quyền truy cập chi tiết',
        component: <PermissionTab />
      },
      {
        id: 'notifications',
        label: 'Quản lý thông báo',
        icon: Bell,
        description: 'Cấu hình và gửi thông báo hệ thống',
        component: <NotificationTab />
      },
      {
        id: 'logs',
        label: 'Nhật ký hoạt động',
        icon: Activity,
        description: 'Xem lịch sử hoạt động của hệ thống',
        component: <HistoryLogTab />
      }
    ],
    []
  )

  const activeContent = SYSTEM_TABS.find((tab) => tab.id === activeTab)?.component

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900 min-h-screen p-0 font-sans transition-colors w-full max-w-[100vw] overflow-x-hidden">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start mt-4 md:mt-6">
        <SystemSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={SYSTEM_TABS}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="flex-1 w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 h-[calc(100vh-6rem)] sticky top-6 flex flex-col overflow-hidden">
          <div className="p-6 pb-0 shrink-0">
            <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white capitalize border-b border-gray-100 dark:border-gray-700 pb-4">
              {SYSTEM_TABS.find((tab) => tab.id === activeTab)?.label}
            </h2>
          </div>

          <div
            key={activeTab}
            className="flex-1 overflow-auto p-6 pt-4 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            {activeContent}
          </div>
        </div>
      </div>
    </div>
  )
}
