import { Button, Popover, PopoverContent, PopoverTrigger, Select, SelectItem } from '@heroui/react'
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  EllipsisVertical,
  FileDown,
  Search
} from 'lucide-react'
import React from 'react'
import { AdvancedFilterPopover } from '../../../../components/advanced-filter/AdvancedFilterPopover'
import TableColumnConfig from '../../../../components/table/TableColumnConfig'
import {
  filterTabs,
  RecruitmentFilters,
  TABLE_CONFIG_COLUMNS
} from '../../constants/recruitmentConstants'
import RecruitmentFilterContent from './RecruitmentFilterContent'

type RecruitmentToolbarProps = {
  // Filter
  tabsWithState: any[]
  activeTabId: string
  onTabChange: (id: string) => void
  activeFilterCount: number
  onClearAllFilters: () => void
  isFilterOpen: boolean
  onFilterOpenChange: (open: boolean) => void
  filters: RecruitmentFilters
  onFilterChange: (tabId: string, values: string[]) => void
  // Pagination
  page: number
  onPageChange: (page: number) => void
  totalPages: number
  rowsPerPage: number
  onRowsPerPageChange: (value: number) => void
  totalItems: number
  // Column config
  visibleColumns: Set<string>
  onVisibleColumnsChange: (columns: Set<string>) => void
  columnOrder: string[]
  onColumnOrderChange: (order: string[]) => void
  // Overflow menu
  isPopoverOpen: boolean
  onPopoverOpenChange: (open: boolean) => void
}

const RecruitmentToolbar = React.memo(
  ({
    tabsWithState,
    activeTabId,
    onTabChange,
    activeFilterCount,
    onClearAllFilters,
    isFilterOpen,
    onFilterOpenChange,
    filters,
    onFilterChange,
    page,
    onPageChange,
    totalPages,
    rowsPerPage,
    onRowsPerPageChange,
    totalItems,
    visibleColumns,
    onVisibleColumnsChange,
    columnOrder,
    onColumnOrderChange,
    isPopoverOpen,
    onPopoverOpenChange
  }: RecruitmentToolbarProps) => {
    const tabLabel = filterTabs.find((t) => t.id === activeTabId)?.label || ''

    return (
      <div className="flex items-center justify-between gap-4 px-6 pb-2">
        {/* Search + Filter */}
        <div className="flex items-center bg-gray-50/80 border border-gray-100 rounded-lg h-9 w-[320px] px-1 pl-3">
          <Search size={16} className="text-gray-400 mr-2 min-w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm ứng viên..."
            className="w-full h-full bg-transparent border-none outline-none text-xs text-gray-700 placeholder:text-gray-400 focus:ring-0 p-0"
          />
          <div className="w-px h-5 bg-gray-200 mx-2 flex-shrink-0" />
          <AdvancedFilterPopover
            tabs={tabsWithState}
            activeTabId={activeTabId}
            onTabChange={onTabChange}
            activeFilterCount={activeFilterCount}
            onClearAll={onClearAllFilters}
            isOpen={isFilterOpen}
            onOpenChange={onFilterOpenChange}
          >
            <div className="p-4 flex flex-col h-full">
              <h4 className="text-sm font-bold text-gray-800 mb-4 px-1">{tabLabel}</h4>
              <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                <RecruitmentFilterContent
                  activeTabId={activeTabId}
                  filters={filters}
                  onFilterChange={onFilterChange}
                  tabLabel={tabLabel}
                />
              </div>
            </div>
          </AdvancedFilterPopover>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          <div>
            <Button className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-medium px-4 h-9 rounded-lg text-sm shadow-sm">
              Thêm ứng viên
            </Button>
          </div>

          {/* Rows per page */}
          <Select
            size="sm"
            selectedKeys={[rowsPerPage.toString()]}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string
              onRowsPerPageChange(Number(val))
            }}
            className="w-20"
            variant="bordered"
            classNames={{
              trigger: 'h-8 min-h-8 bg-white border border-gray-200 rounded-lg shadow-sm data-[focus-visible=true]:outline-none data-[focus-visible=true]:ring-0',
              value: 'text-xs font-semibold text-gray-700',
              innerWrapper: 'gap-1'
            }}
            listboxProps={{
              itemClasses: {
                base: [
                  'data-[focus-visible=true]:outline-none',
                  'data-[focus-visible=true]:ring-0',
                  'data-[focus-visible=true]:ring-offset-0'
                ]
              }
            }}
            renderValue={(items) => {
              return items.map((item) => (
                <span key={item.key} className="flex items-center gap-1">
                  <span className="text-gray-700 font-bold">{item.textValue}</span>
                </span>
              ))
            }}
          >
            <SelectItem key="20" textValue="20">
              20
            </SelectItem>
            <SelectItem key="50" textValue="50">
              50
            </SelectItem>
            <SelectItem key="100" textValue="100">
              100
            </SelectItem>
          </Select>

          {/* Page info */}
          <div className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
            <span className="text-gray-800">
              {(page - 1) * rowsPerPage + 1}-{Math.min(page * rowsPerPage, totalItems)}
            </span>
            <span className="text-gray-300 font-medium">/</span>
            <span className="text-gray-500">{totalItems}</span>
          </div>

          {/* Pagination */}
          <div className="flex items-center h-8 bg-white border border-gray-200 rounded-lg shadow-sm">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-8 h-full flex items-center justify-center text-gray-400 disabled:text-gray-200 hover:bg-gray-50 rounded-l-lg transition-colors cursor-pointer disabled:cursor-default"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="px-1.5 h-full flex items-center justify-center text-sm font-semibold gap-1">
              <input
                type="text"
                inputMode="numeric"
                value={page}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  if (val === '') {
                    onPageChange(1)
                    return
                  }
                  const num = parseInt(val, 10)
                  if (!isNaN(num)) onPageChange(Math.max(1, Math.min(totalPages || 1, num)))
                }}
                onBlur={(e) => {
                  const num = parseInt(e.target.value, 10)
                  if (isNaN(num) || num < 1) onPageChange(1)
                  else onPageChange(Math.min(totalPages || 1, num))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                }}
                onFocus={(e) => e.target.select()}
                className="w-7 text-center text-blue-600 font-semibold bg-transparent outline-none border border-transparent hover:border-gray-300 focus:border-blue-400 rounded transition-colors text-sm cursor-pointer"
              />
              <span className="text-gray-300 font-medium">/</span>
              <span className="text-gray-600">{totalPages > 0 ? totalPages : 1}</span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="w-8 h-full flex items-center justify-center text-gray-400 disabled:text-gray-200 hover:bg-gray-50 rounded-r-lg transition-colors cursor-pointer disabled:cursor-default"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Overflow menu */}
          <Popover
            isOpen={isPopoverOpen}
            onOpenChange={onPopoverOpenChange}
            placement="bottom-end"
            data-react-aria-top-layer="true"
          >
            <PopoverTrigger>
              <Button
                isIconOnly
                variant="flat"
                className="bg-gray-50/80 border border-gray-100 text-gray-600 min-w-9 w-9 h-9 rounded-lg"
              >
                <EllipsisVertical size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-1 min-w-[150px]">
              <div className="flex flex-col w-full gap-0.5" aria-label="Toolbar Actions">
                <button
                  onClick={() => {
                    onPopoverOpenChange(false)
                    // TODO: handle export
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 cursor-pointer text-gray-700 hover:bg-gray-100 rounded-lg outline-none border-none transition-colors"
                >
                  <FileDown size={16} className="text-gray-500" />
                  <span className="text-sm font-medium">Xuất Excel</span>
                </button>

                <TableColumnConfig
                  columns={TABLE_CONFIG_COLUMNS}
                  visibleColumns={visibleColumns}
                  setVisibleColumns={onVisibleColumnsChange}
                  columnOrder={columnOrder}
                  setColumnOrder={onColumnOrderChange}
                  label="Hiển thị cột"
                  customTrigger={
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 cursor-pointer text-gray-700 hover:bg-gray-100 rounded-lg outline-none border-none transition-colors text-left">
                      <Columns3 size={16} className="text-gray-500" />
                      <span className="text-sm font-medium">Hiển thị cột</span>
                    </button>
                  }
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    )
  }
)

RecruitmentToolbar.displayName = 'RecruitmentToolbar'

export default RecruitmentToolbar
