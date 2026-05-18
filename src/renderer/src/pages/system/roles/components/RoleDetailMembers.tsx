import { useMemo, useState } from 'react'
import { Input, Button, Chip } from '@heroui/react'
import { Search, Trash2, Plus, X } from 'lucide-react'
import { useRoleMemberLogic } from '../hooks/useRoleMemberLogic'
import { User } from '@renderer/api/admin/usersAxios'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { UserAvatarVertical } from '@renderer/components/UserAvatar'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { Role } from '@renderer/api/admin/rolesAxios'
import { AddMemberModal } from './AddMemberModal'
import SearchInput from '@renderer/components/SearchInput'
import ConfirmModal from '@renderer/components/ConfirmModal'

interface RoleDetailMembersProps {
  activeRole: Role | undefined
}

export const RoleDetailMembers = ({ activeRole }: RoleDetailMembersProps) => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    content: '',
    onConfirm: () => {}
  })

  const {
    isAddModalOpen,
    setIsAddModalOpen,

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

  const selectedInRoleCount =
    selectedInRole === 'all'
      ? recordsFilteredCurrent
      : selectedInRole instanceof Set
        ? selectedInRole.size
        : 0

  return (
  <div className="flex flex-col w-full h-full overflow-hidden bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800">

        <div className="w-52">
            <div className="w-full max-w-md">
              <SearchInput
                placeholder="Tìm kiếm thành viên..."
                value={searchInRole}
                onChange={setSearchInRole}
                className="w-full bg-white dark:bg-gray-900"
              />
            </div>
          </div>

        <div className="flex items-center gap-2">

          {selectedInRoleCount > 0 && (
            <>
              <Button
                onPress={() => setSelectedInRole(new Set([]))}
                className="h-9 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-250 border-none flex items-center gap-1.5"
              >
                <X size={16} />
                Bỏ chọn tất cả
              </Button>
              <Button
                onPress={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Xác nhận xóa thành viên',
                    content: `Bạn có chắc chắn muốn xóa ${selectedInRoleCount} thành viên khỏi vai trò "${activeRole?.ql_vai_tro_ten || ''}"?`,
                    onConfirm: () => {
                      handleRemoveMembers()
                      setConfirmModal(prev => ({
                        ...prev,
                        isOpen: false
                      }))
                    }
                  })
                }}
                isLoading={isPendingRemove}
                className="h-9 px-4 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 font-semibold rounded-xl transition-all duration-250 border-none flex items-center gap-1.5"
              >
                <Trash2 size={16} />
                Xóa ({selectedInRoleCount})
              </Button>
            </>
          )}


          <Button
            onPress={() => setIsAddModalOpen(true)}
            className="h-9 px-4 bg-[#C2E7FF] hover:bg-[#b5dffa] active:bg-[#99c8e8] text-[#001D35] font-semibold rounded-xl transition-all duration-250 shadow-sm hover:shadow-md border-none flex items-center gap-1.5 shrink-0 whitespace-nowrap"
          >
            <Plus size={16} />
            Thêm thành viên
          </Button>

        </div>
      </div>

      {/* Members Table */}
<div
  className="
    flex-1 overflow-hidden relative min-h-0
    [&_td]:!min-h-7
    [&_.min-h-12]:!min-h-6
    [&_.min-h-10]:!min-h-6
    [&_.py-3]:!py-0.5
    [&_.px-4]:!px-2
  "
>
  <TableHr
    columns={columns}
    data={currentMembers}
    isLoading={isLoadingCurrent}
    primaryKey="ql_nguoi_dung_id"
    enableSorting={false}
    selectedKeys={selectedInRole}
    onSelectionChange={setSelectedInRole}
    enableResizing
    enablePinning={false}
    columnWidths={columnWidths}
    onColumnResize={(uid, width) =>
      setColumnWidths((prev) => ({ ...prev, [uid]: width }))
    }
  />
</div>

      {/* Pagination */}
      <div>
        <TablePagination
          page={pageInRole}
          total={recordsFilteredCurrent}
          limit={limitInRole}
          onChangePage={setPageInRole}
          onChangeLimit={setLimitInRole}
          enableStickyPagination
          className="p-1.5 border-t border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-800"
        />
      </div>

      {/* Confirm Remove Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal(prev => ({
            ...prev,
            isOpen: false
          }))
        }
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        content={confirmModal.content}
        isDanger
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open)
          if (!open) {
            setSelectedAvailable(new Set([]))
          }
        }}
        activeRoleName={activeRole?.ql_vai_tro_ten}
        availableUsers={availableUsers}
        isLoading={isLoadingAvailable}
        search={searchAvailable}
        onSearchChange={setSearchAvailable}
        page={pageAvailable}
        limit={limitAvailable}
        recordsFiltered={recordsFilteredAvailable}
        onChangePage={setPageAvailable}
        onChangeLimit={setLimitAvailable}
        selectedKeys={selectedAvailable}
        onSelectionChange={setSelectedAvailable}
        onAdd={() => {
          handleAddMembers()
          setIsAddModalOpen(false)
        }}
        isPendingAdd={isPendingAdd}
      />
    </div>
  )
}
