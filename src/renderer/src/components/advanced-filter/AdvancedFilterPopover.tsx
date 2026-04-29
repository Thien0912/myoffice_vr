import React from 'react'
import { Badge, Button, Popover, PopoverContent, PopoverTrigger, cn } from '@heroui-v3/react'
import { Funnel, FunnelPlus, RotateCcw } from 'lucide-react'
import { AdvancedFilterPopoverProps } from './types'
import { FilterSidebar } from './FilterSidebar'

export const AdvancedFilterPopover: React.FC<AdvancedFilterPopoverProps> = ({
  title = 'BỘ LỌC NÂNG CAO',
  tabs,
  activeTabId,
  onTabChange,
  activeFilterCount,
  onClearAll,
  isOpen,
  onOpenChange,
  children,
  customTrigger,
  isMobile,
  shouldCloseOnInteractOutside,
  className
}) => {
  const hasActiveFilters = activeFilterCount > 0

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Popover.Trigger>
        {customTrigger ? (
          customTrigger
        ) : (
          <Badge.Anchor>
            <Button
              variant="ghost"
              isIconOnly
              size="sm"
              className={cn(
                'h-8 w-8 min-w-8 transition-colors',
                hasActiveFilters ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
              )}
            >
              {hasActiveFilters ? <FunnelPlus size={18} /> : <Funnel size={18} />}
            </Button>
            {hasActiveFilters && (
              <Badge
                size="sm"
                className="font-bold border-1 border-white dark:border-gray-800 bg-blue-600 text-white"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Badge.Anchor>
        )}
      </Popover.Trigger>

      <Popover.Content
        placement={isMobile ? 'bottom start' : 'bottom'}
        offset={10}
        shouldCloseOnInteractOutside={(e) => {
          if (shouldCloseOnInteractOutside) {
            return shouldCloseOnInteractOutside(e)
          }
          if (!e || !e.closest) return true
          const isOverlay =
            e.closest('[data-slot="popover"]') ||
            e.closest('[data-slot="content"]') ||
            e.closest('[role="dialog"]') ||
            e.closest('[role="listbox"]')
          if (isOverlay) return false
          return true
        }}
        className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl overflow-visible"
      >
        <Popover.Dialog className="p-0 border-none shadow-none focus:outline-none">
          <Popover.Arrow />
          <div
            className={cn(
              'flex flex-col sm:flex-row w-[calc(100vw-40px)] sm:w-[600px] max-w-[460px] sm:max-w-none sm:h-[400px] overflow-hidden rounded-2xl',
              className
            )}
          >
            {/* Left Panel - Tabs */}
            <FilterSidebar
              title={title}
              tabs={tabs}
              activeTabId={activeTabId}
              onTabChange={onTabChange}
              hasActiveFilters={hasActiveFilters}
              onClearAll={onClearAll}
            />

            {/* Right Panel - Content */}
            <div
              className={cn(
                'bg-white dark:bg-gray-800 overflow-y-auto overflow-x-visible custom-scrollbar flex flex-col flex-1 sm:w-auto h-full relative'
              )}
            >
              {children}
            </div>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}
