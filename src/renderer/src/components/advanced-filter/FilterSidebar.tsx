import { Button, cn, Tabs } from '@heroui-v3/react'
import { RotateCcw } from 'lucide-react'
import React from 'react'
import { FilterTab } from './types'

interface FilterSidebarProps {
  title: string
  tabs: FilterTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  hasActiveFilters: boolean
  onClearAll: () => void
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  title,
  tabs,
  activeTabId,
  onTabChange,
  hasActiveFilters,
  onClearAll
}) => {
  return (
    <div className="w-full sm:w-[220px] h-full shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/30 flex flex-col p-0 z-10 relative">
      <div className="p-3 pb-0 flex flex-col flex-1 overflow-hidden">
        <span className="hidden sm:block text-[11px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-2 px-1 mt-1">
          {title}
        </span>

        <div className="flex-1 overflow-x-auto sm:overflow-x-visible pb-0 custom-scrollbar">
          <Tabs
            aria-label="Filter Tabs"
            selectedKey={activeTabId}
            onSelectionChange={(key) => onTabChange(key as string)}
            variant="secondary"
            className="w-full"
          >
            <Tabs.ListContainer>
              <Tabs.List className="flex-row sm:flex-col items-start gap-1 p-0 bg-transparent min-w-max sm:min-w-0 sm:w-full border-none shadow-none [&_[data-slot=cursor]]:hidden">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTabId === tab.id

                  return (
                    <Tabs.Tab
                      id={tab.id}
                      key={tab.id}
                      isDisabled={tab.disabled}
                      className="justify-start px-0 h-auto py-0 w-auto sm:w-full shrink-0 border-none shadow-none"
                    >
                      <div
                        className={cn(
                          'flex items-center gap-2.5 w-full relative px-2.5 py-2 rounded-xl transition-all',
                          isActive
                            ? 'bg-white dark:bg-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 pointer-events-none'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent cursor-pointer'
                        )}
                      >
                        <div className={cn(
                          'flex items-center justify-center transition-colors',
                          isActive
                            ? 'text-blue-600'
                            : tab.hasFilter
                              ? 'text-blue-500'
                              : 'text-gray-400'
                        )}>
                          <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                        </div>

                        <div className="flex flex-col items-start hidden sm:flex flex-1 min-w-0 pr-4">
                          <span
                            className={cn(
                              'font-bold text-[13px] transition-colors w-full text-left',
                              isActive
                                ? 'text-gray-900 dark:text-gray-100'
                                : tab.disabled
                                  ? 'text-gray-400 line-through'
                                  : tab.hasFilter
                                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                                    : 'text-gray-600 dark:text-gray-400 font-semibold'
                            )}
                          >
                            {tab.label}
                          </span>
                          {tab.subtitle && (
                            <span className={cn(
                              'text-[11px] mt-0.5 w-full text-left whitespace-nowrap overflow-hidden text-ellipsis',
                              isActive
                                ? 'text-gray-700 dark:text-gray-300 font-medium'
                                : tab.disabled
                                  ? 'text-gray-400 line-through'
                                  : tab.hasFilter
                                    ? 'text-blue-500/70 dark:text-blue-400/70'
                                    : 'text-gray-400'
                            )}>
                              {tab.subtitle}
                            </span>
                          )}
                        </div>

                        {tab.hasFilter && !tab.disabled && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.6)]" />
                        )}

                        {/* Active Blue Pill indicator */}
                        {isActive && (
                          <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-[3px] h-[20px] rounded-l-full bg-blue-600" />
                        )}
                      </div>
                    </Tabs.Tab>
                  )
                })}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        </div>
      </div>

      <div className="w-full h-[60px] shrink-0 border-t border-gray-100 dark:border-gray-700 flex items-center px-3">
        <Button
          variant="ghost"
          isDisabled={!hasActiveFilters}
          className={cn(
            'w-full justify-start px-2 sm:px-3 h-10 text-[13px] font-bold transition-colors',
            hasActiveFilters
              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-gray-400 opacity-60 pointer-events-none'
          )}
          onPress={onClearAll}
        >
          <div className="flex items-center gap-2">
            <RotateCcw size={15} />
            <span className="hidden sm:inline">Đặt lại bộ lọc</span>
            <span className="sm:hidden">Reset</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
