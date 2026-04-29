import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@heroui-v3/react'

interface SideLeftToggleProps {
  isCollapsed: boolean
  onToggle: () => void
}

export const SideLeftToggle = ({ isCollapsed, onToggle }: SideLeftToggleProps) => {
  return (
    <div
      className={`
          flex justify-${isCollapsed ? 'center' : 'end pr-2'} items-center
          py-${isCollapsed ? '1' : '1'} 
        `}
    >
      <Button
        isIconOnly
        variant="ghost"
        onPress={onToggle}
        className="text-gray-500 w-10 h-10 min-w-10 rounded-full border-none"
      >
        {isCollapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
      </Button>
    </div>
  )
}
