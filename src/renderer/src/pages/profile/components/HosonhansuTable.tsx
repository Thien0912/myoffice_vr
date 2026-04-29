import { Selection } from '@heroui/react'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import React from 'react'

interface HosonhansuTableProps {
    columns: any[]
    data: any[]
    isLoading: boolean
    page: number
    total: number
    filtered: number
    limit: number
    selectedKeys: Selection
    sortDescriptors: any[]
    onSelectionChange: (keys: Selection) => void
    onSortChange: (sort: any[]) => void
    onChangePage: (page: number) => void
    onChangeLimit: (limit: number) => void
    columnWidths: Record<string, number>
    onColumnResize: (uid: string, width: number) => void
    pinnedColumns: Record<string, 'left' | 'right' | undefined>
    onPinColumn: (uid: string, pin: 'left' | 'right' | undefined) => void
    onRowChange: (id: string | number, columnUid: string, value: any) => void
    onRowContextMenu: (e: React.MouseEvent, row: any) => void
    contextMenuRowId: string | number | null
}

const HosonhansuTable: React.FC<HosonhansuTableProps> = ({
    columns,
    data,
    isLoading,
    page,
    total,
    filtered,
    limit,
    selectedKeys,
    sortDescriptors,
    onSelectionChange,
    onSortChange,
    onChangePage,
    onChangeLimit,
    columnWidths,
    onColumnResize,
    pinnedColumns,
    onPinColumn,
    onRowChange,
    onRowContextMenu,
    contextMenuRowId
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 flex flex-col flex-1 min-h-0 max-h-[calc(100dvh-130px)] w-full overflow-hidden relative">
            <div className="flex-1 flex flex-col min-h-0 relative">
                <TableHr
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    primaryKey="id_nhan_vien"
                    onRowChange={onRowChange}
                    selectedKeys={selectedKeys}
                    sortDescriptors={sortDescriptors}
                    onRowClick={() => { }}
                    onSortChange={onSortChange}
                    onSelectionChange={onSelectionChange}
                    columnWidths={columnWidths}
                    onColumnResize={onColumnResize}
                    pinnedColumns={pinnedColumns}
                    onPinColumn={onPinColumn}
                    onRowContextMenu={onRowContextMenu}
                    contextMenuRowId={contextMenuRowId}
                    enableStickyScrollbar={false}
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
                className="border-t border-gray-200 dark:border-gray-700 p-2"
            />
        </div>
    )
}

export default HosonhansuTable
