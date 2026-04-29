import { Tabs, cn } from '@heroui-v3/react'
import { useState, useEffect, useTransition } from 'react'
import {
  Inbox,
  Users,
  GraduationCap,
  Building2,
  Building,
  LayoutGrid
} from 'lucide-react'

export interface ChamCongTabsProps {
  activeTab: string
  onTabChange: (key: string) => void
  className?: string
}

const TABS = [
  { key: 'tat-ca', title: 'Tất cả', icon: Inbox },
  { key: 'phong-ban', title: 'Phòng Ban', icon: Users },
  { key: 'truong-khoa', title: 'Trường và Khoa', icon: GraduationCap },
  { key: 'trung-tam', title: 'Trung Tâm', icon: Building2 },
  { key: 'doanh-nghiep', title: 'Doanh nghiệp', icon: Building },
  { key: 'khac', title: 'Khác', icon: LayoutGrid },
]

export default function ChamCongTabs({ activeTab, onTabChange, className }: ChamCongTabsProps) {
  const [localTab, setLocalTab] = useState(activeTab)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setLocalTab(activeTab)
  }, [activeTab])

  const handleSelectionChange = (key: string) => {
    setLocalTab(key)
    // Delay the heavy parent update slightly to allow the Tab indicator animation to paint
    setTimeout(() => {
      startTransition(() => {
        onTabChange(key)
      })
    }, 0)
  }

  return (
    <div className={cn('w-full', className)}>
      <Tabs
        variant="secondary"
        selectedKey={localTab}
        onSelectionChange={(key) => handleSelectionChange(key as string)}
      >
        <Tabs.ListContainer>
          <Tabs.List
            aria-label="Cham Cong Tabs"
            className="w-full relative rounded-none p-0 border-b border-divider gap-0 overflow-x-auto flex-nowrap hide-scrollbar"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <Tabs.Tab
                  key={tab.key}
                  id={tab.key}
                  className="max-w-fit px-4 h-10 data-[selected=true]:text-blue-600 text-gray-600 font-medium text-sm flex items-center gap-2 shrink-0 whitespace-nowrap outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-md"
                >
                  <Icon size={16} />
                  {tab.title}
                  <Tabs.Indicator className="bg-blue-600" />
                </Tabs.Tab>
              )
            })}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </div>
  )
}
