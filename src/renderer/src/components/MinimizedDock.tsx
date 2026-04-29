import { Maximize2, X, Minus } from 'lucide-react'
import { Button, Tooltip } from '@heroui/react'

type MinimizedDockProps = {
  title: string
  onRestore: () => void
  onClose: () => void
  style?: React.CSSProperties
}

export default function MinimizedDock({ title, onRestore, onClose, style }: MinimizedDockProps) {
  return (
    <div
      className="fixed bottom-0 z-50 hidden md:flex w-72 right-10 bg-white dark:bg-gray-800 border-x border-t border-blue-200 dark:border-gray-700 rounded-t-xl shadow-2xl flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]"
      style={style}
    >
      <div
        className="flex items-center justify-between px-3 py-2.5 bg-blue-100/80 dark:bg-gray-800 border-b border-blue-200 dark:border-gray-700 hover:bg-blue-200 dark:hover:bg-gray-700 transition-colors cursor-pointer backdrop-blur-sm"
        onClick={onRestore}
      >
        <div className="text-sm font-semibold text-blue-700 dark:text-gray-200 truncate select-none flex-1">
          {title}
        </div>
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <Tooltip content="Thu nhỏ" delay={100} closeDelay={0}>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              className="h-7 w-7 min-w-7 text-blue-600/70 hover:text-blue-700 hover:bg-blue-200/50 dark:text-gray-400 dark:hover:text-gray-200"
              onPress={() => {}}
            >
              <Minus size={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Mở rộng" delay={100} closeDelay={0}>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              className="h-7 w-7 min-w-7 text-blue-600/70 hover:text-blue-700 hover:bg-blue-200/50 dark:text-gray-400 dark:hover:text-gray-200"
              onPress={onRestore}
            >
              <Maximize2 size={15} />
            </Button>
          </Tooltip>
          <Tooltip content="Đóng" delay={100} closeDelay={0}>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              className="h-7 w-7 min-w-7 text-blue-600/70 hover:text-blue-700 hover:bg-red-100 group dark:text-gray-400 dark:hover:text-gray-200"
              onPress={onClose}
            >
              <X size={16} className="group-hover:text-red-500" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
