import { ReactNode, useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@heroui/react'

export interface StatsOverviewProps {
  title: ReactNode
  icon?: ReactNode
  isExpanded: boolean
  onToggleExpand: (val: boolean) => void
  rightActions?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
}

export function StatsOverview({
  title,
  icon,
  isExpanded,
  onToggleExpand,
  rightActions,
  children,
  className,
  headerClassName
}: StatsOverviewProps) {
  const [shouldRenderStats, setShouldRenderStats] = useState(isExpanded)
  const isDesktop = window.innerWidth >= 640

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isExpanded) {
      setShouldRenderStats(true)
    } else if (isDesktop) {
      // Don't unmount on desktop, wait for collapse animation
      timer = setTimeout(() => setShouldRenderStats(false), 300)
    } else {
      setShouldRenderStats(false)
    }
    return () => clearTimeout(timer)
  }, [isExpanded, isDesktop])

  return (
    <div className={cn("bg-[#f8f9fa] dark:bg-[#1f2023] border-b border-gray-200/80 dark:border-gray-800", className)}>
      <div className={cn("flex flex-row items-center justify-between px-3 sm:px-4 py-2 select-none group transition-colors hover:bg-[#f1f3f4] dark:hover:bg-[#303134]", headerClassName)}>
        <div
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
          onClick={() => onToggleExpand(!isExpanded)}
        >
          {icon && <div className="shrink-0">{icon}</div>}
          <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest leading-tight truncate pt-0.5">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
          {rightActions}

          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 sm:bg-transparent sm:group-hover:bg-gray-200/50 dark:bg-gray-800 sm:dark:bg-transparent dark:sm:group-hover:bg-gray-700/50 text-gray-500 sm:text-gray-400 sm:group-hover:text-gray-600 dark:text-gray-200 dark:sm:group-hover:text-gray-300 transition-colors cursor-pointer shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(!isExpanded)
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden hidden sm:block",
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 sm:pt-2">
          {shouldRenderStats && children}
        </div>
      </div>
      
      {/* Mobile rendering - no fixed height animation due to unmounting inside */}
      <div className={cn("sm:hidden", isExpanded ? "block" : "hidden")}>
         <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 sm:pt-2">
          {shouldRenderStats && children}
        </div>
      </div>
    </div>
  )
}
