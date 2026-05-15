import { useMemo } from 'react'
import { Button, cn, Modal, SearchField, Tooltip } from '@heroui-v3/react'
import { HelpCircle, Plus, Users, X, Trash2 } from 'lucide-react'
import { User } from '@renderer/api/admin/usersAxios'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { UserAvatarVertical } from '@renderer/components/UserAvatar'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import { Selection } from '@heroui/react'

interface AddMemberModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  activeRoleName?: string
  availableUsers: User[]
  isLoading: boolean
  search: string
  onSearchChange: (val: string) => void
  page: number
  limit: number
  recordsFiltered: number
  onChangePage: (page: number) => void
  onChangeLimit: (limit: number) => void
  selectedKeys: Selection
  onSelectionChange: (keys: Selection) => void
  onAdd: () => void
  isPendingAdd: boolean
}

export const AddMemberModal = ({
  isOpen,
  onOpenChange,
  activeRoleName,
  availableUsers,
  isLoading,
  search,
  onSearchChange,
  page,
  limit,
  recordsFiltered,
  onChangePage,
  onChangeLimit,
  selectedKeys,
  onSelectionChange,
  onAdd,
  isPendingAdd
}: AddMemberModalProps) => {
  const columns: TableColumnType<User>[] = useMemo(
    () => [
      { name: 'STT', uid: 'stt', width: 50 },
      {
        name: 'THÀNH VIÊN',
        uid: 'ql_nguoi_dung_ho_ten',
        width: 250,
        render: (val: any, row: any) => (
          <UserAvatarVertical name={val} src={row.ql_nguoi_dung_avatar} />
        )
      },
      { name: 'EMAIL', uid: 'ql_nguoi_dung_email', width: 220 },
      { name: 'ĐƠN VỊ', uid: 'ten_don_vi', width: 200 }
    ],
    []
  )

  const selectedCount = selectedKeys === 'all' ? recordsFiltered : (selectedKeys instanceof Set ? selectedKeys.size : 0)

  const title = 'Thêm thành viên'
  const subtitle = activeRoleName 
    ? `Thêm thành viên vào vai trò "${activeRoleName}".` 
    : 'Thêm thành viên vào vai trò.'

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container
        size="4xl"
        placement="auto"
        scroll="inside"
        className="max-w-4xl! w-full"
      >
        <Modal.Dialog className="rounded-3xl! overflow-hidden shadow-[0_24px_48px_-12px_rgba(25,28,29,0.15)] p-0">
          {/* ─── Header: Stitch style ─── */}
          <Modal.Header className="px-7 py-5! border-b-0">
            <div className="flex w-full items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5 w-full">
                <div className="flex items-center gap-1.5">
                  <Users size={22} className="text-blue-500" />
                  <Modal.Heading className="text-xl! font-bold tracking-tight">
                    {title}
                  </Modal.Heading>
                  <Tooltip delay={0}>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700 rounded-full h-7 w-7 min-w-7"
                    >
                      <HelpCircle size={16} />
                    </Button>
                    <Tooltip.Content>
                      {subtitle}
                    </Tooltip.Content>
                  </Tooltip>
                </div>
                {activeRoleName && (
                  <span className="text-sm text-gray-500 ml-8">
                    Vai trò: <span className="font-semibold text-gray-700 dark:text-gray-300">{activeRoleName}</span>
                  </span>
                )}
              </div>
              <Tooltip>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full h-9 w-9 min-w-9"
                  onPress={() => onOpenChange(false)}
                >
                  <X size={18} />
                </Button>
                <Tooltip.Content>Đóng</Tooltip.Content>
              </Tooltip>
            </div>
          </Modal.Header>

          {/* ─── Body ─── */}
          <Modal.Body className="py-4 px-7!">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Đã chọn:</span>
                    <span className="font-bold text-blue-600">{selectedCount}</span>
                    <span>thành viên</span>
                  </div>
                  {selectedCount > 0 && (
                    <Button
                      className="h-8 px-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-250 border-none flex items-center gap-1.5 text-xs"
                      onPress={() => onSelectionChange(new Set([]))}
                    >
                      <Trash2 size={14} />
                      Bỏ chọn tất cả
                    </Button>
                  )}
                </div>
                <div className="w-72">
                  <SearchField
                    aria-label="Tìm thành viên"
                    value={search}
                    onChange={onSearchChange}
                    className="w-full"
                  >
                    <SearchField.Group className="h-10">
                      <SearchField.SearchIcon />
                      <SearchField.Input placeholder="Tìm thành viên..." />
                      <SearchField.ClearButton />
                    </SearchField.Group>
                  </SearchField>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <TableHr
                  columns={columns}
                  data={availableUsers}
                  isLoading={isLoading}
                  primaryKey="ql_nguoi_dung_id"
                  enableSorting={false}
                  selectedKeys={selectedKeys}
                  onSelectionChange={onSelectionChange}
                  enableResizing={false}
                  enablePinning={false}
                  className="h-full"
                />
              </div>

              <TablePagination
                page={page}
                total={recordsFiltered}
                limit={limit}
                onChangePage={onChangePage}
                onChangeLimit={onChangeLimit}
                className="p-2 border-t border-gray-100 dark:border-gray-800"
              />
            </div>
          </Modal.Body>

          {/* ─── Footer: Stitch MD3 style ─── */}
          <Modal.Footer className="px-6 py-4! border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
              {/* Info Card */}
              <div className="flex items-center gap-3 bg-blue-50/60 dark:bg-blue-900/15 px-4 py-2.5 rounded-xl w-full sm:w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                    Chọn thành viên để thêm vào vai trò
                  </span>
                </div>
              </div>

              {/* Action buttons - Đồng bộ style với Nghỉ phép */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto sm:ml-auto">
                <Button
                  className="flex-1 sm:flex-none h-11 px-6 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all duration-250 border-none"
                  onPress={() => onOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 sm:flex-none h-11 px-6 bg-[#C2E7FF] hover:bg-[#b5dffa] active:bg-[#99c8e8] text-[#001D35] font-semibold rounded-2xl transition-all duration-250 shadow-sm hover:shadow-md border-none flex items-center gap-2"
                  onPress={onAdd}
                  isPending={isPendingAdd}
                  isDisabled={selectedCount === 0}
                >
                  Thêm {selectedCount > 0 ? `(${selectedCount})` : ''} thành viên
                  {!isPendingAdd && <Plus size={18} />}
                </Button>
              </div>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

export default AddMemberModal
