import { useState } from 'react'
import { Building2, Building, Users } from 'lucide-react'
import { Chip } from '@heroui-v3/react'
import { ThongTinBanHanh } from '@renderer/shared/CommonInterface'

type Props = {
  data?: ThongTinBanHanh
}

type GroupItem = {
  label: string
  da_xem?: string
}

export default function ContentThongtinbanhanh({ data }: Props) {
  const [open, setOpen] = useState<string | null>('donvi')

  // Helper sort function: da_xem='1' lên đầu
  const sortSeen = (a: any, b: any) => {
    const aSeen = String(a.da_xem) === '1' ? 1 : 0
    const bSeen = String(b.da_xem) === '1' ? 1 : 0
    return bSeen - aSeen // 1 returns first
  }

  // Pre-process data
  const coQuanItems: GroupItem[] = (data?.e_vb_co_quan ?? []).map((item) => ({
    label: item.ten_co_quan
  }))

  const donViItems: GroupItem[] = (data?.e_don_vi_xu_ly ?? []).map((item) => ({
    label: item.ten_don_vi
  }))

  const nguoiNhanItems: GroupItem[] = (data?.e_nguoi_xu_ly ?? [])
    .sort(sortSeen)
    .map((item) => ({ label: item.ql_nguoi_dung_ho_ten, da_xem: item.da_xem }))

  // Gom dữ liệu theo nhóm
  const groups = [
    {
      title: 'Cơ quan',
      icon: <Building2 size={16} />,
      count: coQuanItems.length,
      items: coQuanItems
    },
    {
      title: 'Đơn vị ban hành',
      icon: <Building size={16} />,
      count: donViItems.length,
      items: donViItems
    },
    {
      title: 'Người nhận',
      icon: <Users size={16} />,
      count: nguoiNhanItems.length,
      items: nguoiNhanItems
    }
  ]

  return (
    <div className="space-y-2 text-sm w-full">
      {groups.map((group) => (
        <div key={group.title} className="border border-gray-100 dark:border-gray-700 rounded-md overflow-hidden">
          {/* Header */}
          <button
            className={`w-full flex items-center justify-between px-3 py-2 font-medium text-left bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 transition`}
            onClick={() => setOpen(open === group.title ? null : group.title)}
          >
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              {group.icon}
              <span>
                {group.title} ({group.count})
              </span>
            </div>
            <span className="text-blue-500 dark:text-blue-400 text-xs">
              {open === group.title ? '▲' : '▼'}
            </span>
          </button>

          {/* Content */}
          {open === group.title && group.items.length > 0 && (
            <div className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 space-y-2">
              {group.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-gray-400 dark:text-gray-500">+</span>
                  <div className="flex items-center gap-2 grow">
                    <span>{item.label}</span>
                    {String(item.da_xem) === '1' && (
                      <Chip size="sm" color="success" variant="soft" className="h-5 text-[10px] px-1">
                        Đã xem
                      </Chip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
