import { useMemo, useState, useEffect } from 'react'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersAxios, User } from '@renderer/api/admin/usersAxios'
import { rolesAxios } from '@renderer/api/admin/rolesAxios'
import { mapDonviOptions } from '@renderer/api/danhmuc/DonviAxios'
import { useUserStore } from '@renderer/store/useUserStore'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { UserModal } from '../modals/UserModal'
import { LoginHistoryModal } from '../modals/LoginHistoryModal'
import { UserToolbar } from './components/UserToolbar'
import { UserTable } from './components/UserTable'
import { Selection } from '@heroui/react'
import { toast } from "@heroui-v3/react";

export default function UserPage() {
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
  } = useUserStore()

  const queryClient = useQueryClient()
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))
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

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null)

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

  const allColumnsForToolbar = useMemo(() => [
    { name: 'STT', uid: 'stt' },
    { name: 'HỌ TÊN', uid: 'ql_nguoi_dung_ho_ten' },
    { name: 'EMAIL', uid: 'ql_nguoi_dung_email' },
    { name: 'ADMIN', uid: 'ql_nguoi_dung_is_admin' },
    { name: 'ĐƠN VỊ', uid: 'id_don_vi' },
    { name: 'TRẠNG THÁI', uid: 'active_flag' },
    { name: 'VAI TRÒ', uid: 'role_ids' },
    { name: '', uid: 'actions' }
  ], [])

  return (
    <div className="flex flex-col overflow-hidden bg-gray-50/50 dark:bg-gray-900">
      <div className="flex flex-col h-full gap-2">
        <UserToolbar 
          search={search}
          onSearchChange={setSearch}
          isLoading={isLoading}
          onAddUser={handleCreateUser}
          onHistoryOpen={() => setIsHistoryModalOpen(true)}
          onReset={handleResetTable}
          filter={filter}
          setFilter={setFilter}
          onPageChange={setPage}
          columns={allColumnsForToolbar}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          donviOptions={donviOptions}
          roleOptions={roleOptions}
        />

        <UserTable
          users={users}
          isLoading={isLoading}
          isResetting={isResetting}
          page={page}
          limit={limit}
          recordsTotal={recordsTotal}
          recordsFiltered={recordsFiltered}
          setPage={setPage}
          setLimit={setLimit}
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
          columnWidths={columnWidths}
          setColumnWidth={setColumnWidth}
          sortDescriptors={sortDescriptors}
          setSortDescriptors={setSortDescriptors}
          onRowChange={handleRowChange}
          onEditUser={handleEditUser}
          onHistoryOpen={(user) => {
            setSelectedUserForHistory(user)
            setIsHistoryModalOpen(true)
          }}
          pinnedColumns={pinnedColumns}
          visibleColumns={visibleColumns}
          donviOptions={donviOptions}
          roleOptions={roleOptions}
        />
      </div>

      <UserModal isOpen={userModal.isOpen} onClose={() => setUserModal({ ...userModal, isOpen: false })} user={userModal.user} />
      <LoginHistoryModal isOpen={isHistoryModalOpen} user={selectedUserForHistory} onClose={() => { setIsHistoryModalOpen(false); setSelectedUserForHistory(null); }} />
      <ConfirmModal 
         isOpen={confirmModal.isOpen} 
         onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))} 
         onConfirm={confirmModal.onConfirm} 
         title={confirmModal.title} 
         content={confirmModal.content} 
      />
    </div>
  )
}
