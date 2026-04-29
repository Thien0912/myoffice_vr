import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { useBreakpoint } from '@renderer/hooks/useBreakpoint'
import { useNgoaiGioStore } from '@renderer/store/useNgoaiGioStore'
import { memo } from 'react'
import { OvertimePermissions } from '../columns'
import { OvertimeRequest } from '../types'
import OvertimeMobileList from './OvertimeMobileList'

interface OvertimeTableProps {
  columns: any[]
  data: any[]
  isLoading: boolean
  page: number
  total: number
  filtered: number
  limit: number
  sortDescriptors: any[]
  columnWidths: Record<string, number>
  selectedKeys?: any
  disabledKeys?: any
  onSelectionChange?: (keys: any) => void
  onColumnResize: (uid: string, width: number) => void
  onSortChange: (sort: any[]) => void
  onChangePage: (page: number) => void
  onChangeLimit: (limit: number) => void
  onRowClick?: (row: any) => void
  // Mobile-specific props
  isManager?: boolean
  permissions?: OvertimePermissions
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onDelete?: (row: OvertimeRequest) => void
  onEdit?: (row: OvertimeRequest) => void
  currentUserId?: number | string
  columnOrder?: string[]
  onColumnOrderChange?: (columnOrder: string[]) => void
}

const OvertimeTable = memo(function OvertimeTable({
  columns,
  data,
  isLoading,
  page,
  total,
  filtered,
  limit,
  sortDescriptors,
  columnWidths,
  selectedKeys,
  disabledKeys,
  onSelectionChange,
  onColumnResize,
  onSortChange,
  onChangePage,
  onChangeLimit,
  onRowClick,
  isManager = false,
  permissions,
  onApprove,
  onReject,
  onDelete,
  onEdit,
  currentUserId,
  columnOrder,
  onColumnOrderChange
}: OvertimeTableProps) {
  const { isMobile } = useBreakpoint()
  const selectedRequest = useNgoaiGioStore((s) => s.selectedRequest)

  // ── Mobile: card list ────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="bg-white dark:bg-gray-900 flex flex-col flex-1 min-h-0 overflow-hidden">
        <OvertimeMobileList
          data={data as OvertimeRequest[]}
          isLoading={isLoading}
          page={page}
          total={total}
          filtered={filtered}
          limit={limit}
          isManager={isManager}
          selectedKeys={selectedKeys}
          onSelectionChange={onSelectionChange}
          onViewDetail={onRowClick}
          onApprove={onApprove}
          onReject={onReject}
          onDelete={onDelete}
          onEdit={onEdit}
          currentUserId={currentUserId}
          onChangePage={onChangePage}
          onChangeLimit={onChangeLimit}
          permissions={permissions}
        />
      </div>
    )
  }

  // ── Desktop: original TableHr ────────────────────────────────────
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden flex gap-2 flex-row relative flex-1 min-h-0">
      <div className="w-full relative dark:border-gray-700 transition-all duration-300 h-full flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          <TableHr
            columns={columns as any}
            data={data as any}
            isLoading={isLoading}
            primaryKey="id_ngoai_gio"
            editable={true}
            selectedKeys={selectedKeys}
            disabledKeys={disabledKeys}
            onSelectionChange={onSelectionChange}
            columnWidths={columnWidths}
            onColumnResize={onColumnResize}
            sortDescriptors={sortDescriptors}
            onSortChange={onSortChange}
            enableStickyScrollbar={false}
            borderColor="border-gray-200 dark:border-gray-700"
            columnOrder={columnOrder}
            onColumnOrderChange={onColumnOrderChange}
            activeRowId={selectedRequest?.id_ngoai_gio}
          />
        </div>
        <TablePagination
          page={page}
          total={total}
          filtered={filtered}
          limit={limit}
          onChangePage={onChangePage}
          onChangeLimit={onChangeLimit}
          enableStickyPagination={true}
          className="p-2"
        />
      </div>
    </div>
  )
})

export default OvertimeTable
