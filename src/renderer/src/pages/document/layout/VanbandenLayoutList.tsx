import { useState } from 'react'
import SideLeftVanban from './SideLeftVanban'
import SideRightVanban from './SideRightVanban'
import FilterVanban from './FilterVanban'
import { PopupFilter } from '../components/table/Filters/PopupFilter'

export default function VanbandenLayoutList() {
  const [activeTab, setActiveTab] = useState('tat_ca')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="space-y-2">
      <div className="sticky top-0 z-20 p-2 bg-white">
        <FilterVanban isSidebarCollapsed={isSidebarCollapsed} />
      </div>
      <div className="flex items-start gap-2">
        <div className="sticky top-14">
          <SideLeftVanban
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>
        <div className="flex-1">
          <SideRightVanban />
        </div>
      </div>

      <PopupFilter hideTrigger />
    </div>
  )
}
