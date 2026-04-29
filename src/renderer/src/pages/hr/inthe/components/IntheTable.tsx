import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { Selection } from '@heroui/react'

interface IntheTableProps {
  columns: any[]
  data: any[]
  isLoading: boolean
  total: number
  filtered: number
  page: number
  limit: number
  selectedKeys: Selection
  columnWidths: Record<string, number>
  onColumnResize: (uid: string, width: number) => void
  sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]
  onSortChange: (sorts: { column: string; direction: 'ascending' | 'descending' }[]) => void
  pinnedColumns: Record<string, 'left' | 'right' | undefined>
  onPinColumn: (uid: string, pin: 'left' | 'right' | undefined) => void
  onSelectionChange: (keys: Selection) => void
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export default function IntheTable({
  columns,
  data,
  isLoading,
  total,
  filtered,
  page,
  limit,
  selectedKeys,
  columnWidths,
  onColumnResize,
  sortDescriptors,
  onSortChange,
  pinnedColumns,
  onPinColumn,
  onSelectionChange,
  onPageChange,
  onLimitChange
}: IntheTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 flex flex-col flex-1 min-h-0 w-full overflow-hidden relative">
      <div className="flex-1 flex flex-col min-h-0 relative">
        <TableHr
          columns={columns as any}
          data={data}
          isLoading={isLoading}
          primaryKey="id_nhan_vien"
          selectedKeys={selectedKeys}
          columnWidths={columnWidths}
          onColumnResize={onColumnResize}
          sortDescriptors={sortDescriptors}
          onSortChange={onSortChange}
          pinnedColumns={pinnedColumns}
          onPinColumn={onPinColumn}
          onSelectionChange={onSelectionChange}
          enableStickyScrollbar={false}
          showVerticalBorders={true}
          enableResizing={true}
          enableCopy={true}
          onRowClick={() => {}}
          activeRowId={null}
        />
      </div>

      <TablePagination
        page={page}
        total={total}
        filtered={filtered}
        limit={limit}
        onChangePage={onPageChange}
        onChangeLimit={onLimitChange}
        className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50"
      />
    </div>
  )
}
