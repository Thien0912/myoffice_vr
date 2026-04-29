import React, { useMemo } from 'react'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { User } from '@renderer/api/admin/usersAxios'
import UserAvatar from '@renderer/components/UserAvatar'
import { Chip, Selection } from '@heroui/react'
import { Edit, History, Check } from 'lucide-react'

interface UserTableProps {
  users: User[]
  isLoading: boolean
  isResetting: boolean
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
  sortDescriptors: any[]
  setSortDescriptors: (sort: any[]) => void
  onRowChange: (id: string | number, columnUid: string, value: any) => void
  onEditUser: (user: User) => void
  onHistoryOpen: (user: User) => void
  pinnedColumns: Record<string, 'left' | 'right' | undefined>
  visibleColumns: Set<string>
  donviOptions: any[]
  roleOptions: any[]
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
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
  onRowChange,
  onEditUser,
  onHistoryOpen,
  pinnedColumns,
  visibleColumns,
  donviOptions,
  roleOptions
}) => {
  const allColumns: TableColumnType<User>[] = useMemo(() => {
    const cols: TableColumnType<User>[] = [
      { name: 'STT', uid: 'stt', width: 50, editable: false },
      {
        name: 'HỌ TÊN',
        uid: 'ql_nguoi_dung_ho_ten',
        width: 200,
        sortable: true,
        editable: false,
        render: (_, row?: User) => {
          if (!row) return null
          return (
            <div className="relative flex items-center gap-2 w-full px-1">
              <div className="shrink-0 flex items-center justify-center">
                <UserAvatar
                  name={row.ql_nguoi_dung_ho_ten}
                  src={row.ql_nguoi_dung_avatar}
                  gender={row.ql_nguoi_dung_gioi_tinh}
                  size="sm"
                />
              </div>
              <div className="flex flex-col leading-tight min-w-0 flex-1">
                <span className="text-gray-700 dark:text-gray-200 truncate font-medium">
                  {row.ql_nguoi_dung_ho_ten}
                </span>
                <span className="text-[10px] mt-0.5 text-gray-500 uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {row.ql_nguoi_dung_ten_dang_nhap
                    ? `UID: ${row.ql_nguoi_dung_ten_dang_nhap}`
                    : `ID: ${row.ql_nguoi_dung_id}`}
                </span>
              </div>
            </div>
          )
        }
      },
      { name: 'EMAIL', uid: 'ql_nguoi_dung_email', width: 220, sortable: true, editable: false },
      {
        name: 'ADMIN',
        uid: 'ql_nguoi_dung_is_admin',
        width: 80,
        editable: false,
        render: (value: any) =>
          String(value) === '1' ? <Check size={18} className="text-blue-600 mx-auto" /> : null
      },
      {
        name: 'ĐƠN VỊ',
        uid: 'id_don_vi',
        width: 200,
        sortable: true,
        type: 'select',
        options: donviOptions
      },
      {
        name: 'TRẠNG THÁI',
        uid: 'active_flag',
        width: 120,
        editable: true,
        type: 'select',
        options: [
          { label: 'Hoạt động', value: '1' },
          { label: 'Đã khóa', value: '0' }
        ],
        renderDisplay: (value: any) => {
          const isActive = String(value) === '1'
          return (
            <Chip
              size="sm"
              variant="flat"
              color={isActive ? 'success' : 'danger'}
              className="rounded-md"
            >
              {isActive ? 'Hoạt động' : 'Đã khóa'}
            </Chip>
          )
        }
      },
      {
        name: 'VAI TRÒ',
        uid: 'role_ids',
        width: 250,
        editable: true,
        type: 'select',
        options: roleOptions,
        multiple: true,
        renderDisplay: (_, row) => {
          if (!row?.vai_tro) return null
          const roles = String(row.vai_tro)
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean)
          const visibleRoles = roles.slice(0, 2)
          const remaining = roles.length - 2
          return (
            <div className="flex flex-wrap gap-1">
              {visibleRoles.map((role, idx) => (
                <Chip key={idx} size="sm" variant="flat" color="primary" className="rounded-md">
                  {role}
                </Chip>
              ))}
              {remaining > 0 && (
                <Chip size="sm" variant="flat" className="rounded-md">
                  +{remaining}
                </Chip>
              )}
            </div>
          )
        }
      },
      {
        name: '',
        uid: 'actions',
        width: 80,
        pinned: 'right',
        editable: false,
        render: (_: any, user: User | undefined) => {
          if (!user) return null
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onHistoryOpen(user)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Lịch sử đăng nhập"
              >
                <History size={18} />
              </button>
              <button
                onClick={() => onEditUser(user)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Chỉnh sửa"
              >
                <Edit size={18} />
              </button>
            </div>
          )
        }
      }
    ]
    return cols.map((col) => ({ ...col, pinned: pinnedColumns[col.uid] ?? col.pinned }))
  }, [pinnedColumns, donviOptions, roleOptions, onHistoryOpen, onEditUser])

  const columns = useMemo(
    () => allColumns.filter((col) => visibleColumns.has(col.uid)),
    [allColumns, visibleColumns]
  )

  return (
    <div className="flex-1 flex flex-col gap-2 min-h-0 min-w-0">
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-gray-800 flex flex-col">
        <div className="flex-1 lg:min-h-0 lg:max-h-[calc(100vh-250px)] flex flex-col overflow-hidden">
          <TableHr
            columns={columns}
            data={users}
            isLoading={isLoading || isResetting}
            primaryKey="ql_nguoi_dung_id"
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            columnWidths={columnWidths}
            onColumnResize={setColumnWidth}
            sortDescriptors={sortDescriptors}
            onSortChange={setSortDescriptors}
            onRowChange={onRowChange}
            enablePinning
            enableResizing
            enableSorting
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

