import { Pencil } from 'lucide-react'
import { Button, cn } from '@heroui-v3/react'

interface SideLeftComposeProps {
  isCollapsed: boolean
}

export const SideLeftCompose = ({ isCollapsed }: SideLeftComposeProps) => {
  return (
    <div className="mb-4 pl-2">
      <Button
        className={cn(
          'w-full flex items-center bg-[#c2e7ff] hover:bg-[#b0e0ff] text-[#001d35] font-semibold transition-all duration-200 border-none rounded-full',
          isCollapsed ? 'mb-4 mt-2 h-14 w-14 min-w-14 mx-auto p-0 justify-center' : 'mb-6 mt-4 h-14 pl-5 justify-start'
        )}
      >
        <Pencil size={24} />
        <span
          className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
            isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 ml-3 block'
          }`}
        >
          Soạn thư
        </span>
      </Button>
    </div>
  )
}
