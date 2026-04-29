import { Input } from '@heroui-v3/react'
import UserAvatar from '@renderer/components/UserAvatar'
import {
  Bell,
  Info,
  LogOut,
  Monitor,
  User,
  Search,
  ShieldCheck,
  Palette,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'
import { allowedSyncIds } from '@renderer/config/permissions'

type ProfileSidebarProps = {
  user: any
  selectedTab: string | number
  setSelectedTab: (key: string | number) => void
  handleLogout: () => void
}

export default function ProfileSidebar({
  user,
  selectedTab,
  setSelectedTab,
  handleLogout
}: ProfileSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const showSyncTab = allowedSyncIds.includes(Number(user?.ql_nguoi_dung_id))

  const menuGroups = [
    {
      title: 'Cài đặt người dùng',
      items: [
        { key: 'profile', label: 'Hồ sơ người dùng', icon: User },
        { key: 'security', label: 'Bảo mật & Tài khoản', icon: ShieldCheck },
        { key: 'update-request', label: 'Yêu cầu cập nhật thông tin', icon: ExternalLink },
        { key: 'devices', label: 'Thiết bị', icon: Monitor, isDisabled: true }
      ]
    },
    {
      title: 'Cài đặt ứng dụng',
      items: [
        { key: 'appearance', label: 'Giao diện & Hiển thị', icon: Palette, isDisabled: true },
        { key: 'notifications', label: 'Các thông báo', icon: Bell },
        { key: 'app-info', label: 'Thông tin ứng dụng', icon: Info },
        ...(showSyncTab ? [{ key: 'sync-data', label: 'Đồng bộ dữ liệu', icon: RefreshCw }] : [])
      ]
    }
  ]

  const MenuItem = ({ item }: { item: any }) => {
    const isActive = selectedTab === item.key
    const Icon = item.icon

    return (
      <button
        onClick={() => !item.isDisabled && setSelectedTab(item.key)}
        className={`w-full flex justify-between items-center px-3 py-1.5 rounded-md transition-all group relative mb-0.5 ${isActive
          ? 'bg-gray-200/80 dark:bg-gray-700/80 text-gray-900 dark:text-white'
          : item.isDisabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
      >
        <div className="flex items-center gap-2">
          <Icon
            size={15}
            className={`${isActive ? 'text-gray-900 dark:text-blue-400' : item.isDisabled ? 'text-gray-400' : 'text-gray-800/80 dark:text-gray-500'}`}
          />
          <span className={`text-left text-[14px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
            {item.label}
          </span>
          {item.labelSuffix && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-1 rounded-sm uppercase ml-1">
              {item.labelSuffix}
            </span>
          )}
        </div>
      </button>
    )
  }

  // Helper function to remove Vietnamese accents
  const removeAccents = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
  }

  // Filter menu groups based on search term
  const filteredGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const searchNormalized = removeAccents(searchTerm.toLowerCase())
        const labelNormalized = removeAccents(item.label.toLowerCase())
        return labelNormalized.includes(searchNormalized)
      })
    }))
    .filter((group) => group.items.length > 0)

  return (
    <div className="w-full h-full md:w-64 bg-gray-50/50 dark:bg-gray-900 flex-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
      {/* Search Section */}
      <div className="p-4 pb-2 space-y-4">
        {/* User Card - Discord Style */}
        <div className="flex justify-center gap-2 p-2 pt-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
          <div className="relative shrink-0">
            <UserAvatar
              src={user?.ql_nguoi_dung_avatar}
              name={user?.ql_nguoi_dung_ho_ten}
              className="size-20 ring-1 ring-gray-200 dark:ring-gray-700"
            />
            {/* <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div> */}
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar space-y-5">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h4 className="px-3 text-[12px] font-normal text-gray-900 dark:text-gray-900 mb-1.5 mt-2">
                {group.title}
              </h4>
              {group.items.map((item) => (
                <MenuItem key={item.key} item={item} />
              ))}
              {gIdx < filteredGroups.length - 1 && (
                <div className="mx-3 mt-4 border-t border-gray-100 dark:border-gray-800" />
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-2 text-center">
            <p className="text-[13px] text-gray-500">
              Không tìm thấy kết quả nào cho "{searchTerm}"
            </p>
          </div>
        )}

        {/* Logout at bottom of scroll area */}
        <div className="pt-4 space-y-1 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 px-3 py-1.5 rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium"
          >
            <LogOut size={18} />
            <span className="text-[13px]">Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  )
}
