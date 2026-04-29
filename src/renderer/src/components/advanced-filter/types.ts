import { ReactNode } from 'react'

export interface FilterTab {
  id: string
  label: string
  subtitle?: string
  icon: any
  hasFilter?: boolean
  disabled?: boolean
}

export interface AdvancedFilterPopoverProps {
  title?: string
  tabs: FilterTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  activeFilterCount: number
  onClearAll: () => void
  
  // Trạng thái popover (Controlled)
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  
  // Children render Content động theo Tab
  children: ReactNode

  // Tuỳ chọn Trigger nâng cao nếu không dùng mặc định
  customTrigger?: ReactNode
  
  // Responsive / Behavior
  isMobile?: boolean
  shouldCloseOnInteractOutside?: (e: Element) => boolean
  className?: string
}
