import { Button, Tooltip } from '@heroui/react'
import { ChevronDown, ChevronUp, HelpCircle, History, MessageCircle } from 'lucide-react'
import { FilterTags } from '../../components/advanced-filter/FilterTags'
import { useRemainingHeight } from '../../hooks/useRemainingHeight'
import { filterOptionsMap, filterTabs } from './constants/recruitmentConstants'
import { useRecruitment } from './hooks/useRecruitment'
import AllNotesDrawer from './components/recruitment/AllNotesDrawer'
import HistoryDrawer from './components/recruitment/HistoryDrawer'
import RecruitmentDetailDrawer from './components/recruitment/RecruitmentDetailDrawer'
import RecruitmentStats from './components/recruitment/RecruitmentStats'
import RecruitmentToolbar from './components/recruitment/RecruitmentToolbar'
import RecruitmentTable from './components/recruitment/RecruitmentTable'
import RecruitmentSelectionBar from './components/recruitment/RecruitmentSelectionBar'
import StatusManagementModal from './components/recruitment/StatusManagementModal'

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────

export default function RecruitmentPage() {
  const r = useRecruitment()
  const [tableContainerRef, tableHeight] = useRemainingHeight([r.showStats])

  return (
    <div className="flex flex-col w-full text-gray-800 font-sans pt-6 bg-white">
      {/* Header Title with Collapse Button */}
      <div className="flex items-center gap-3 px-6 mb-4">
        <h1 className="text-lg xl:text-xl font-medium text-gray-900 dark:text-gray-100 transition-colors">
          Tuyển dụng
        </h1>
        <Tooltip
          content="Quản lý quá trình tuyển dụng"
          placement="top"
          classNames={{ content: 'text-xs font-medium' }}
        >
          <div className="text-gray-500 cursor-help mt-0.5">
            <HelpCircle size={15} strokeWidth={2.5} />
          </div>
        </Tooltip>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <Button
          size="sm"
          variant="light"
          className="text-gray-500 font-medium px-2 min-w-0 h-7"
          onPress={r.toggleStats}
          endContent={r.showStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        >
          {r.showStats ? 'Ẩn thống kê' : 'Hiện thống kê'}
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            size="sm"
            variant="light"
            className="text-gray-500 font-medium px-2 min-w-0 h-7"
            startContent={<History size={15} className="text-gray-500" />}
            onPress={() => r.setIsHistoryDrawerOpen(true)}
          >
            Lịch sử
          </Button>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <Button
            size="sm"
            variant="light"
            className="text-gray-500 font-medium px-2 min-w-0 h-7"
            startContent={<MessageCircle size={15} className="text-blue-500" />}
            onPress={() => r.setIsNotesDrawerOpen(true)}
          >
            Tất cả ghi chú
          </Button>
        </div>
        <AllNotesDrawer
          isOpen={r.isNotesDrawerOpen}
          onClose={() => r.setIsNotesDrawerOpen(false)}
        />
        <HistoryDrawer
          isOpen={r.isHistoryDrawerOpen}
          onClose={() => r.setIsHistoryDrawerOpen(false)}
        />
      </div>

      {/* Statistics Widgets */}
      {r.showStats && <RecruitmentStats />}

      {/* Toolbar Row */}
      <RecruitmentToolbar
        tabsWithState={r.tabsWithState}
        activeTabId={r.activeTabId}
        onTabChange={r.setActiveTabId}
        activeFilterCount={r.activeFilterCount}
        onClearAllFilters={r.clearAllFilters}
        isFilterOpen={r.isFilterOpen}
        onFilterOpenChange={r.setIsFilterOpen}
        filters={r.filters}
        onFilterChange={r.handleFilterChange}
        page={r.page}
        onPageChange={r.setPage}
        totalPages={r.totalPages}
        rowsPerPage={r.rowsPerPage}
        onRowsPerPageChange={r.handleRowsPerPageChange}
        totalItems={r.filteredCandidates.length}
        visibleColumns={r.visibleColumns}
        onVisibleColumnsChange={r.setVisibleColumns}
        columnOrder={r.columnOrder}
        onColumnOrderChange={r.setColumnOrder}
        isPopoverOpen={r.isPopoverOpen}
        onPopoverOpenChange={r.setIsPopoverOpen}
      />

      {/* Filter Tags */}
      {r.activeFilterCount > 0 && (
        <div className="px-6 pb-2">
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <FilterTags
              filters={r.filters}
              optionsMap={filterOptionsMap}
              tabs={filterTabs}
              onRemoveFilter={r.removeFilter}
              onClearAll={r.clearAllFilters}
            />
          </div>
        </div>
      )}

      {/* Selection Toolbar */}
      {r.hasSelection && (
        <RecruitmentSelectionBar
          selectedKeys={r.selectedKeys}
          selectedCount={r.selectedCount}
          onClearSelection={r.clearSelection}
          onOpenStatusModal={() => r.setIsStatusModalOpen(true)}
          onOpenCandidateDrawer={r.openCandidateDrawer}
        />
      )}

      {/* Data Table */}
      <RecruitmentTable
        paginatedCandidates={r.paginatedCandidates}
        selectedKeys={r.selectedKeys}
        onSelectionChange={r.setSelectedKeys}
        visibleColumns={r.visibleColumns}
        columnOrder={r.columnOrder}
        onColumnOrderChange={r.setColumnOrder}
        tableContainerRef={tableContainerRef}
        tableHeight={tableHeight}
        onOpenCandidateDrawer={r.openCandidateDrawer}
        onOpenStatusModal={() => r.setIsStatusModalOpen(true)}
      />

      {/* Status Management Modal */}
      <StatusManagementModal isOpen={r.isStatusModalOpen} onOpenChange={r.setIsStatusModalOpen} />

      {/* Candidate Detail Drawer */}
      <RecruitmentDetailDrawer
        candidate={r.selectedCandidate}
        isOpen={r.isDrawerOpen}
        onClose={r.closeCandidateDrawer}
      />
    </div>
  )
}
