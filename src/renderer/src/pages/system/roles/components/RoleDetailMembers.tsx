import { useMemo } from 'react'
import { Input, cn, Button, Chip } from '@heroui/react'
import { Search, Users, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useRoleMemberLogic } from '../hooks/useRoleMemberLogic'
import { User } from '@renderer/api/admin/usersAxios'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { UserAvatarVertical } from '@renderer/components/UserAvatar'
import { motion, AnimatePresence } from 'framer-motion'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { Role } from '@renderer/api/admin/rolesAxios'

interface RoleDetailMembersProps {
  activeRole: Role | undefined
}

export const RoleDetailMembers = ({ activeRole }: RoleDetailMembersProps) => {
  const {
    isManaging,
    setIsManaging,
    // InRole State
    searchInRole,
    setSearchInRole,
    pageInRole,
    setPageInRole,
    limitInRole,
    setLimitInRole,
    // Available State
    searchAvailable,
    setSearchAvailable,
    pageAvailable,
    setPageAvailable,
    limitAvailable,
    setLimitAvailable,
    // Other
    selectedInRole,
    setSelectedInRole,
    selectedAvailable,
    setSelectedAvailable,
    columnWidths,
    setColumnWidths,
    currentMembers,
    availableUsers,
    isLoadingCurrent,
    isLoadingAvailable,
    recordsFilteredCurrent,
    recordsFilteredAvailable,
    handleAddMembers,
    handleRemoveMembers,
    isPendingAdd,
    isPendingRemove
  } = useRoleMemberLogic({ activeRole })

  const columns: TableColumnType<User>[] = useMemo(
    () => [
      { name: 'STT', uid: 'stt', width: 50 },
      {
        name: 'THÀNH VIÊN',
        uid: 'ql_nguoi_dung_ho_ten',
        width: 250,
        render: (val: any, row: any) => (
          <UserAvatarVertical
            name={val}
            src={row.ql_nguoi_dung_avatar}
          />
        )
      },
      { name: 'EMAIL', uid: 'ql_nguoi_dung_email', width: 220 },
      {
        name: 'TRẠNG THÁI',
        uid: 'active_flag',
        width: 120,
        render: (val: any) => (
          <Chip
            size="sm"
            variant="flat"
            color={Number(val) === 1 ? 'success' : 'danger'}
            className="capitalize border-none"
          >
            {Number(val) === 1 ? 'Hoạt động' : 'Khóa'}
          </Chip>
        )
      },
      {
        name: 'ĐƠN VỊ',
        uid: 'ten_don_vi',
        width: 200
      }
    ],
    []
  )

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl">


      <div className={cn('flex gap-4 relative', isManaging && 'min-h-[500px]')}>
        {/* Left Board: Members in Role */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn('flex flex-col min-h-0', isManaging ? 'flex-1 w-0' : 'w-full')}
        >
          <div className={cn('flex flex-col overflow-hidden bg-white dark:bg-gray-900 rounded-lg', isManaging && 'flex-1')}>
            <div className="px-4 py-2 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                Thành viên vai trò ({recordsFilteredCurrent})
              </span>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Tìm kiếm..."
                  startContent={<Search size={18} className="text-gray-400" />}
                  variant="bordered"
                  radius="sm"
                  value={searchInRole}
                  onValueChange={setSearchInRole}
                />
                <Button
                  color={isManaging ? 'danger' : 'primary'}
                  variant="flat"
                  radius="sm"
                  onPress={() => setIsManaging(!isManaging)}
                  startContent={isManaging ? <X size={18} className="shrink-0" /> : <Users size={18} className="shrink-0" />}
                  className="font-medium shrink-0 whitespace-nowrap"
                >
                  {isManaging ? 'Đóng' : 'Thêm thành viên'}
                </Button>
              </div>
            </div>
            <div className={cn('overflow-hidden min-w-0', isManaging && 'flex-1')}>
              <TableHr
                columns={columns}
                data={currentMembers}
                isLoading={isLoadingCurrent}
                primaryKey="ql_nguoi_dung_id"
                enableSorting={false}
                selectedKeys={isManaging ? selectedInRole : undefined}
                onSelectionChange={isManaging ? setSelectedInRole : undefined}
                enableResizing
                enablePinning={false}
                columnWidths={columnWidths}
                onColumnResize={(uid, width) =>
                  setColumnWidths((prev) => ({ ...prev, [uid]: width }))
                }
                className="h-full"
              />
            </div>
            <TablePagination
              page={pageInRole}
              total={recordsFilteredCurrent}
              limit={limitInRole}
              onChangePage={setPageInRole}
              onChangeLimit={setLimitInRole}
              className="p-2 border-t border-gray-50 dark:border-gray-800"
            />
          </div>
        </motion.div>

        <AnimatePresence>
          {isManaging && (
            <>
              {/* Middle Actions */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col justify-center gap-3 z-10"
              >
                <Button
                  isIconOnly
                  variant="flat"
                  color="primary"
                  className="shadow-sm border border-blue-200"
                  size="md"
                  title="Bỏ khỏi vai trò"
                  isLoading={isPendingRemove}
                  onPress={handleRemoveMembers}
                >
                  <ChevronRight size={20} />
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                  color="primary"
                  className="shadow-sm border border-blue-200"
                  size="md"
                  title="Thêm vào vai trò"
                  isLoading={isPendingAdd}
                  onPress={handleAddMembers}
                >
                  <ChevronLeft size={20} />
                </Button>
              </motion.div>

              {/* Right Board: Available Users */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 w-0 flex flex-col min-h-0"
              >
                <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900 rounded-lg">
                  <div className="px-4 py-2 flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                      Danh sách người dùng ({recordsFilteredAvailable})
                    </span>
                    <Input
                      placeholder="Tìm người dùng..."
                      startContent={<Search size={18} className="text-gray-400 shrink-0" />}
                      variant="bordered"
                      radius="sm"
                      value={searchAvailable}
                      onValueChange={setSearchAvailable}
                    />
                  </div>
                  <div className="flex-1 overflow-hidden min-w-0">
                    <TableHr
                      columns={columns}
                      data={availableUsers}
                      isLoading={isLoadingAvailable}
                      primaryKey="ql_nguoi_dung_id"
                      enableSorting={false}
                      selectedKeys={selectedAvailable}
                      onSelectionChange={setSelectedAvailable}
                      enableResizing
                      enablePinning={false}
                      columnWidths={columnWidths}
                      onColumnResize={(uid, width) =>
                        setColumnWidths((prev) => ({ ...prev, [uid]: width }))
                      }
                      className="h-full"
                    />
                  </div>
                  <TablePagination
                    page={pageAvailable}
                    total={recordsFilteredAvailable}
                    limit={limitAvailable}
                    onChangePage={setPageAvailable}
                    onChangeLimit={setLimitAvailable}
                    className="p-2 border-t border-gray-50 dark:border-gray-800"
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
