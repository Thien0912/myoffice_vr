import { useMemo, useState, useEffect } from 'react'
import {
  Input,
  Button,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
  Chip,
  Tooltip
} from '@heroui/react'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, RotateCcw, ServerCog, X, Check, Edit, History } from 'lucide-react'
import { UserModal } from '../modals/UserModal'
import { LoginHistoryModal } from '../modals/LoginHistoryModal'
import { usersAxios, User } from '@renderer/api/admin/usersAxios'
import { rolesAxios } from '@renderer/api/admin/rolesAxios'
import { mapDonviOptions } from '@renderer/api/danhmuc/DonviAxios'
import TableHr from '@renderer/components/table/TableHr'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { useUserStore } from '@renderer/store/useUserStore'
import TablePagination from '@renderer/components/table/TablePagination'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import DebugBox from '@renderer/components/DebugBox'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { toast } from "@heroui-v3/react";

export const UserTab = () => {
  const {
    columnWidths,
    setColumnWidth,
    pinnedColumns,
    visibleColumns,
    setVisibleColumns,
    reset,
    filter,
    setFilter,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    sortDescriptors,
    setSortDescriptors,
    setPinnedColumn
  } = useUserStore()

  const queryClient = useQueryClient()
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]))
  const [isResetting, setIsResetting] = useState(false)
  const [recordsTotal, setRecordsTotal] = useState(0)
  const [recordsFiltered, setRecordsFiltered] = useState(0)

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    content: '',
    onConfirm: () => {},
    isDanger: false,
    isLoading: false
  })

  // User Modal State
  const [userModal, setUserModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null
  })

  const handleCreateUser = () => {
    setUserModal({ isOpen: true, user: null })
  }

  const handleEditUser = (user: User) => {
    setUserModal({ isOpen: true, user })
  }

  const handleResetTable = () => {
    setIsResetting(true)
    setTimeout(() => {
      reset()
      setIsResetting(false)
    }, 500)
  }

  // --- Fetch Options ---
  const { data: donviOptions = [] } = useQuery({
    queryKey: ['donviOptions'],
    queryFn: mapDonviOptions
  })

  const { data: roleOptions = [] } = useQuery({
    queryKey: ['roleOptions'],
    queryFn: async () => {
      try {
        const res: any = await rolesAxios.getOptions()
        if (res.success && Array.isArray(res.data)) {
          // specific mapping if needed
          return res.data.map((r) => ({
            label: r.ql_vai_tro_ten || r.label,
            value: r.ql_vai_tro_id || r.value
          }))
        }
        return []
      } catch (e) {
        console.warn('Failed to fetch roles', e)
        return []
      }
    }
  })

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['admin-users', page, limit, search, filter, sortDescriptors],
    queryFn: async () => {
      const order = sortDescriptors.map((desc) => ({
        column: desc.column,
        dir: desc.direction === 'ascending' ? 'asc' : 'desc'
      }))

      // Combine backend params
      const params = {
        page,
        per_page: limit,
        search,
        ...filter,
        order: JSON.stringify(order)
      }

      const res: any = await usersAxios.getAll(params)

      return res?.data || { data: [], recordsTotal: 0, recordsFiltered: 0 }
    },
    placeholderData: keepPreviousData
  })

  useEffect(() => {
    if (responseData) {
      setRecordsTotal(responseData.recordsTotal || 0)
      setRecordsFiltered(responseData.recordsFiltered || 0)
    }
  }, [responseData])

  const users: User[] = Array.isArray(responseData?.data) ? responseData.data : []

  const handleRowChange = async (id: string | number, columnUid: string, value: any) => {
    try {
      const res = await usersAxios.update(String(id), { [columnUid]: value })
      if (res.success) {
        toast('Thành công', { description: 'Cập nhật thành công', variant: 'success' })
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      } else {
        toast('Lỗi', { description: res.message || 'Cập nhật thất bại', variant: 'danger' })
      }
    } catch (error: any) {
      toast('Lỗi', { description: error.message || 'Có lỗi xảy ra', variant: 'danger' })
    }
  }

  // --- Columns Definition ---
  const allColumns: TableColumnType<User>[] = useMemo(() => {
    const cols: TableColumnType<User>[] = [
      {
        name: 'STT',
        uid: 'stt',
        width: 50
      },
      {
        name: 'HỌ TÊN',
        uid: 'ql_nguoi_dung_ho_ten',
        width: 200,
        sortable: true
      },
      {
        name: 'EMAIL',
        uid: 'ql_nguoi_dung_email',
        width: 200,
        sortable: true
      },
      {
        name: 'ADMIN',
        uid: 'ql_nguoi_dung_is_admin',
        width: 80,
        sortable: false,
        editable: false,
        render: (value: any) =>
          String(value) === '1' ? (
            <div className="w-full flex justify-center">
              <Check size={18} className="text-blue-600" />
            </div>
          ) : null
      },
      {
        name: 'ĐƠN VỊ',
        uid: 'id_don_vi',
        width: 250,
        sortable: true,
        type: 'select',
        options: donviOptions
      },
      {
        name: 'VAI TRÒ',
        uid: 'role_ids',
        width: 250,
        sortable: false,
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
          const remainingRoles = roles.slice(2)

          return (
            <div className="flex flex-wrap gap-1">
              {visibleRoles.map((role, idx) => (
                <Chip key={idx} size="sm" variant="flat" color="primary" className="rounded-md">
                  {role}
                </Chip>
              ))}
              {remaining > 0 && (
                <Tooltip
                  content={
                    <div className="flex flex-col gap-1">
                      {remainingRoles.map((role, idx) => (
                        <div key={idx} className="text-small">
                          {role}
                        </div>
                      ))}
                    </div>
                  }
                  placement="bottom"
                  classNames={{
                    content:
                      'py-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-md'
                  }}
                >
                  <Chip
                    size="sm"
                    variant="flat"
                    className="rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default"
                  >
                    +{remaining}
                  </Chip>
                </Tooltip>
              )}
            </div>
          )
        }
      },
      {
        name: 'TRẠNG THÁI',
        uid: 'active_flag',
        width: 120,
        sortable: false,
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
        name: 'THỜI GIAN ĐĂNG NHẬP',
        uid: 'lan_dang_nhap_cuoi',
        width: 180,
        sortable: true,
        editable: false
      },
      {
        name: 'ZALO OA UID',
        uid: 'ql_nguoi_dung_zalo_oa_uid',
        width: 200,
        sortable: true,
        render: (value: any) =>
          value ? (
            <div className="w-full flex justify-start pl-2">
              <Chip size="sm" variant="flat" color="warning" className="rounded-md">
                {value}
              </Chip>
            </div>
          ) : null
      },
      {
        name: 'ZALO UID',
        uid: 'ql_nguoi_dung_zalo_uid',
        width: 200,
        sortable: true,
        editable: false,
        render: (value: any) =>
          value ? (
            <div className="w-full flex justify-start pl-2">
              <Chip size="sm" variant="flat" color="primary" className="rounded-md">
                {value}
              </Chip>
            </div>
          ) : null
      },
      {
        name: '',
        uid: 'actions',
        width: 80,
        className: 'text-center',
        sortable: false,
        editable: false,
        pinned: 'right',
        render: (_: any, user: User | undefined) => {
          if (!user) return null
          return (
            <div className="flex items-center justify-center gap-2 w-full">
              <button
                onClick={() => {
                  setSelectedUserForHistory(user)
                  setIsHistoryModalOpen(true)
                }}
                className="text-gray-500 hover:text-blue-600 transition-colors"
                title="Xem lịch sử đăng nhập"
              >
                <History size={18} />
              </button>
              <button
                onClick={() => handleEditUser(user)}
                className="text-gray-500 hover:text-blue-600 transition-colors"
                title="Chỉnh sửa"
              >
                <Edit size={18} />
              </button>
            </div>
          )
        }
      }
    ]
    return cols.map((col) => ({
      ...col,
      pinned: pinnedColumns[col.uid] ?? col.pinned
    }))
  }, [pinnedColumns, page, limit, donviOptions])

  const columns = useMemo(
    () => allColumns.filter((col) => visibleColumns.has(col.uid)),
    [allColumns, visibleColumns]
  )

  /* Search Debounce */
  const [searchValue, setSearchValue] = useState(search)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchValue)
      if (searchValue !== search) {
        setPage(1)
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchValue, setSearch, setPage])

  // Sync with store if store changes externally (e.g. reset)
  useEffect(() => {
    if (search !== searchValue) {
      setSearchValue(search)
    }
  }, [search])

  return (
    <div className="flex flex-col gap-4 h-full">
      <DebugBox />

      <div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto flex-1">
              <Input
                isClearable
                radius="sm"
                classNames={{
                  base: 'w-full md:max-w-[400px]',
                  inputWrapper:
                    'bg-white dark:bg-gray-900 border-1 border-gray-200 dark:border-gray-700 h-10'
                }}
                placeholder="Tìm kiếm người dùng..."
                startContent={<Search className="text-gray-500 dark:text-gray-400" size={18} />}
                value={searchValue}
                onValueChange={setSearchValue}
                onClear={() => setSearchValue('')}
                endContent={isLoading && <Spinner size="sm" />}
              />
              <TableColumnVisibility
                columns={allColumns}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
              />
            </div>

            <div className="flex justify-end gap-2 w-full md:w-auto">
              <Button
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium"
                radius="sm"
                startContent={<History size={18} className="text-gray-500" />}
                onPress={() => {
                  setSelectedUserForHistory(null)
                  setIsHistoryModalOpen(true)
                }}
              >
                Lịch sử
              </Button>
              <Button
                className="bg-blue-600 text-white font-semibold shadow-sm"
                radius="sm"
                startContent={<Plus size={16} />}
                onPress={handleCreateUser}
              >
                Thêm mới
              </Button>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    radius="sm"
                    isIconOnly
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  >
                    <ServerCog
                      size={20}
                      strokeWidth={1.5}
                      className="text-gray-600 dark:text-gray-400"
                    />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Table Settings">
                  <DropdownItem
                    key="reset"
                    startContent={<RotateCcw size={16} />}
                    onPress={handleResetTable}
                    className="text-danger"
                    color="danger"
                  >
                    Khôi phục mặc định
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select
              placeholder="Đơn vị"
              className="w-full sm:w-48"
              size="sm"
              radius="sm"
              selectedKeys={filter.id_don_vi ? [filter.id_don_vi] : []}
              onChange={(e) => {
                setFilter({ ...filter, id_don_vi: e.target.value })
                setPage(1)
              }}
              aria-label="Đơn vị"
              classNames={{
                trigger: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
              }}
            >
              {donviOptions.map((item: any) => (
                <SelectItem key={item.value}>{item.label}</SelectItem>
              ))}
            </Select>

            <Select
              placeholder="Vai trò"
              className="w-full sm:w-40"
              size="sm"
              radius="sm"
              selectedKeys={filter.ql_vai_tro_id ? [filter.ql_vai_tro_id] : []}
              onChange={(e) => {
                setFilter({ ...filter, ql_vai_tro_id: e.target.value })
                setPage(1)
              }}
              aria-label="Vai trò"
              classNames={{
                trigger: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
              }}
            >
              {roleOptions.map((item: any) => (
                <SelectItem key={item.value}>{item.label}</SelectItem>
              ))}
            </Select>

            <Select
              placeholder="Trạng thái"
              className="w-full sm:w-40"
              size="sm"
              radius="sm"
              selectedKeys={filter.active_flag ? [String(filter.active_flag)] : []}
              onChange={(e) => {
                setFilter({ ...filter, active_flag: e.target.value })
                setPage(1)
              }}
              aria-label="Trạng thái"
              classNames={{
                trigger: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
              }}
            >
              <SelectItem key="1">Hoạt động</SelectItem>
              <SelectItem key="0">Đã khóa</SelectItem>
            </Select>

            {(filter.id_don_vi || filter.ql_vai_tro_id || filter.active_flag !== undefined) && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => {
                  setFilter({})
                  setPage(1)
                }}
              >
                <X size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden relative">
          <TableHr
            columns={columns}
            data={users}
            isLoading={isLoading || isResetting}
            enablePinning={true}
            enableResizing={true}
            enableSorting={true}
            editable={true}
            primaryKey="ql_nguoi_dung_id"
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            columnWidths={columnWidths}
            onColumnResize={setColumnWidth}
            sortDescriptors={sortDescriptors}
            onSortChange={setSortDescriptors}
            onPinColumn={setPinnedColumn}
            onRowChange={handleRowChange}
            borderColor="border-gray-200 dark:border-gray-700"
            enableStickyScrollbar={true}
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
          className="border-t border-gray-200 dark:border-gray-700 p-2"
        />
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        content={confirmModal.content}
        isDanger={confirmModal.isDanger}
        isLoading={confirmModal.isLoading}
      />

      <UserModal
        isOpen={userModal.isOpen}
        onClose={() => setUserModal({ ...userModal, isOpen: false })}
        user={userModal.user}
      />

      <LoginHistoryModal
        isOpen={isHistoryModalOpen}
        user={selectedUserForHistory}
        onClose={() => {
          setIsHistoryModalOpen(false)
          setSelectedUserForHistory(null)
        }}
      />
    </div>
  )
}
