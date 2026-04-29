import { LucideIcon, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Tooltip } from '@heroui/react'

export interface SystemTabItem {
  id: string
  label: string
  icon: LucideIcon
  description: string
  component: React.ReactNode
}

interface SystemSidebarProps {
  activeTab: string
  onTabChange: (id: string) => void
  tabs: SystemTabItem[]
  isCollapsed: boolean
  onToggle: () => void
}

export const SystemSidebar = ({
  activeTab,
  onTabChange,
  tabs,
  isCollapsed,
  onToggle
}: SystemSidebarProps) => {
  return (
    <div
      className={`
        shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 h-fit md:sticky md:top-6 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-full md:w-72'}
    `}
    >
      <div
        className={`flex items-center mb-4 px-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
      >
        {!isCollapsed && (
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
            Hệ thống
          </h2>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-500 transition-colors cursor-pointer"
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          const content = (
            <button
              onClick={() => onTabChange(tab.id)}
              className={`
                            group flex items-center p-2 rounded-lg transition-all duration-200 text-left w-full
                            ${
                              isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
            >
              <div
                className={`
                            p-2 rounded-md transition-colors shrink-0
                            ${isActive ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700'}
                            ${!isCollapsed ? 'mr-3' : ''}
                        `}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
              </div>

              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {tab.label}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 truncate">
                      {tab.description}
                    </div>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-blue-400 shrink-0 ml-2" />}
                </>
              )}
            </button>
          )

          if (isCollapsed) {
            return (
              <Tooltip key={tab.id} content={tab.label} placement="right">
                {content}
              </Tooltip>
            )
          }

          return <div key={tab.id}>{content}</div>
        })}
      </div>
    </div>
  )
}
