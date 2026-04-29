/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { Selection } from '@heroui-v3/react'
import { memo } from 'react'

interface LeaveTableProps {
  columns: any[]
  data: any[]
  isLoading: boolean
  page: number
  total: number
  filtered: number
  limit: number
  selectedKeys: Selection
  sortDescriptors: any[]
  onRowChange?: (id: string | number, columnUid: string, value: any) => void
  onSelectionChange: (keys: Selection) => void
  onSortChange: (sort: any[]) => void
  onChangePage: (page: number) => void
  onChangeLimit: (limit: number) => void
  columnWidths?: Record<string, number>
  onColumnResize?: (widths: Record<string, number>) => void
  onPinColumn?: (pinned: Record<string, 'left' | 'right' | undefined>) => void
  pinnedColumns?: Record<string, 'left' | 'right' | undefined>
  isActive?: boolean
  selectionMode?: 'none' | 'single' | 'multiple'
}

const LeaveTable = memo(function LeaveTable({
  columns,
  data,
  isLoading,
  page,
  total,
  filtered,
  limit,
  selectedKeys,
  sortDescriptors,
  onRowChange = () => { },
  onSelectionChange,
  onSortChange,
  onChangePage,
  onChangeLimit,
  columnWidths = {},
  onColumnResize,
  onPinColumn,
  pinnedColumns = {},
  isActive = true,
  selectionMode = 'multiple'
}: LeaveTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden flex gap-2 flex-row relative flex-1 min-h-0">
      <div className="w-full relative dark:border-gray-700 transition-all duration-300 h-full flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          <TableHr
            columns={columns as any}
            data={data as any}
            isLoading={isLoading}
            primaryKey="id_nghi_phep"
            onRowChange={onRowChange}
            editable={false}
            selectedKeys={selectedKeys}
            selectionMode={selectionMode}
            sortDescriptors={sortDescriptors}
            onRowClick={() => { }}
            onSortChange={onSortChange}
            onSelectionChange={onSelectionChange}
            columnWidths={columnWidths}
            onColumnResize={(uid, width) => {
              onColumnResize?.({ ...columnWidths, [uid]: width })
            }}
            onRowContextMenu={() => { }}
            contextMenuRowId={null}
            onPinColumn={(uid, pin) => {
              onPinColumn?.({ ...pinnedColumns, [uid]: pin })
            }}
            pinnedColumns={pinnedColumns}
            enableStickyScrollbar={isActive}
            borderColor="border-gray-200 dark:border-gray-700"
          />
        </div>
        <TablePagination
          page={page}
          total={total}
          filtered={filtered}
          limit={limit}
          onChangePage={onChangePage}
          onChangeLimit={onChangeLimit}
          enableStickyPagination={isActive}
          className="p-2"
        />
      </div>
    </div>
  )
})

export default LeaveTable
