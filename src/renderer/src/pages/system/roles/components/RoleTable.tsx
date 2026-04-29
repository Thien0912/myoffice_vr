import React, { useMemo } from 'react'
import { Edit2, MoreVertical, Trash2 } from 'lucide-react'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Selection,
  Skeleton
} from '@heroui/react'
import { Role } from '@renderer/api/admin/rolesAxios'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { date } from '@renderer/utils/formatDate'

interface RoleTableProps {
  roles: Role[]
  isLoading?: boolean
  isResetting?: boolean
  page: number
  limit: number
  recordsTotal: number
  recordsFiltered: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  selectedKeys: Selection
  setSelectedKeys: (keys: Selection) => void
  columnWidths: Record<string, number>
  setColumnWidth: (uid: string, width: number) => void
  sortDescriptors: { column: string; direction: 'ascending' | 'descending' }[]
  setSortDescriptors: (descriptors: any) => void
  onRowChange?: (id: string | number, columnUid: string, value: any) => void
  onEditRole?: (role: Role) => void
  onDeleteRole?: (role: Role) => void
  pinnedColumns: Record<string, 'left' | 'right' | undefined>
  visibleColumns: Set<string>
}

export const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  isLoading,
  isResetting,
  page,
  limit,
  recordsTotal,
  recordsFiltered,
  setPage,
  setLimit,
  selectedKeys,
  setSelectedKeys,
  columnWidths,
  setColumnWidth,
  sortDescriptors,
  setSortDescriptors,
  onEditRole,
  onDeleteRole,
  pinnedColumns,
  visibleColumns
}) => {
  const allColumns: TableColumnType<Role>[] = useMemo(() => {
    const cols: TableColumnType<Role>[] = [
      { name: 'STT', uid: 'stt', width: 60, editable: false },
      {
        name: 'TÊN VAI TRÒ',
        uid: 'ql_vai_tro_ten',
        width: 250,
        sortable: true,
        editable: false
      },
      {
        name: 'MÔ TẢ',
        uid: 'ql_vai_tro_mo_ta',
        width: 350,
        sortable: true,
        editable: false
      },
      {
        name: 'NGÀY TẠO',
        uid: 'ql_vai_tro_ngay_tao',
        width: 150,
        sortable: true,
        editable: false,
        render: (value: any) => date('d/m/Y H:i', value)
      },
      {
        name: '',
        uid: 'actions',
        width: 80,
        pinned: 'right',
        editable: false,
        render: (_: any, role: Role | undefined) => {
          if (!role) return null
          return (
            <div className="flex justify-center items-center gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => onEditRole?.(role)}
                className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Edit2 size={16} />
              </Button>
              <Dropdown
                classNames={{
                  content:
                    'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 min-w-[150px]'
                }}
              >
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <MoreVertical size={16} className="text-gray-500" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Role Actions" variant="flat">
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<Trash2 size={16} />}
                    onPress={() => onDeleteRole?.(role)}
                  >
                    Xóa vai trò
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )
        }
      }
    ]
    return cols.map((col) => ({ ...col, pinned: pinnedColumns[col.uid] ?? col.pinned }))
  }, [onEditRole, onDeleteRole, pinnedColumns])

  const columns = useMemo(() => {
    return allColumns.filter((col) => visibleColumns.has(col.uid))
  }, [allColumns, visibleColumns])

  if (isResetting) {
    return (
      <div className="flex flex-col gap-4 p-4 box-border h-full">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col gap-2 min-h-0 min-w-0 px-3">
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-gray-800 flex flex-col border border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex flex-col overflow-hidden">
          <TableHr
            data={roles}
            columns={columns}
            isLoading={isLoading}
            columnWidths={columnWidths}
            onColumnResize={setColumnWidth}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            sortDescriptors={sortDescriptors}
            onSortChange={setSortDescriptors}
            pinnedColumns={pinnedColumns}
            editable
          />
        </div>

        <TablePagination
          page={page}
          total={recordsTotal}
          filtered={recordsFiltered}
          limit={limit}
          onChangePage={setPage}
          onChangeLimit={(val) => {
            setLimit(val)
            setPage(1)
          }}
          className="mt-0 pt-2 border-t border-gray-200 dark:border-gray-700"
        />
      </div>
    </div>
  )
}
