import { SideLeftToggle } from '../components/sideLeft/SideLeftToggle'
import { SideLeftCompose } from '../components/sideLeft/SideLeftCompose'
import { SideLeftNavigation, SideLeftTabItem } from '../components/sideLeft/SideLeftNavigation'

export type { SideLeftTabItem }

interface SideLeftVanbanProps {
  activeTab: string
  onTabChange: (id: string) => void
  isCollapsed: boolean
  onToggle: () => void
}

export const SideLeftVanban = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggle
}: SideLeftVanbanProps) => {
  return (
    <div
      className={`
        shrink-0 bg-white dark:bg-gray-800 h-full transition-all duration-300 flex flex-col
        ${isCollapsed ? 'w-[72px] py-4' : 'w-64 pr-3 py-4'}
      `}
    >
      <SideLeftToggle isCollapsed={isCollapsed} onToggle={onToggle} />
      <SideLeftCompose isCollapsed={isCollapsed} />
      <SideLeftNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        isCollapsed={isCollapsed}
      />
    </div>
  )
}

export default SideLeftVanban
