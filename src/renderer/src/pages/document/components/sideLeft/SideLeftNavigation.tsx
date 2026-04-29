import { Tooltip, Button } from '@heroui-v3/react'
import { ButtonListBoxVanBanDen } from '../ListBox/ListBoxOptions'

export interface SideLeftTabItem {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
}

interface SideLeftNavigationProps {
  activeTab: string
  onTabChange: (id: string) => void
  isCollapsed: boolean
}

export const SideLeftNavigation = ({
  activeTab,
  onTabChange,
  isCollapsed
}: SideLeftNavigationProps) => {
  const TABS: SideLeftTabItem[] = ButtonListBoxVanBanDen.reduce<SideLeftTabItem[]>((acc, item) => {
    if (
      'classify' in item &&
      typeof item.classify === 'string' &&
      'title' in item &&
      typeof item.title === 'string' &&
      'icon' in item
    ) {
      acc.push({
        id: item.classify,
        label: item.title,
        icon: item.icon,
        description: item.title
      })
    }

    return acc
  }, [])

  return (
    <div className="flex-1 flex flex-col gap-1 w-full">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id

        const button = (
          <Button
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            variant="ghost"
            className={`
                relative overflow-hidden transition-all duration-200 rounded-full border-none
                ${
                  isCollapsed
                    ? 'w-12 h-10 min-w-12 p-0 ml-3 justify-center'
                    : 'w-full h-10 justify-start pl-6 rounded-l-none'
                }
                ${
                  isActive
                    ? 'bg-[#d3e3fd] text-[#001d35] font-bold'
                    : 'text-[#444746] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
          >
            <div className="shrink-0 flex items-center justify-center">{tab.icon}</div>
            <div
              className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${
                isCollapsed
                  ? 'w-0 opacity-0 hidden'
                  : 'w-auto opacity-100 ml-4 flex-1 text-left block'
              }`}
            >
              {tab.label}
            </div>
          </Button>
        )

        if (isCollapsed) {
          return (
            <Tooltip key={tab.id}>
              {button}
              <Tooltip.Content placement="right">{tab.label}</Tooltip.Content>
            </Tooltip>
          )
        }

        return <div key={tab.id}>{button}</div>
      })}
    </div>
  )
}
