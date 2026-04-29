import { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  User,
  Input
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { LoginLog, loginLogsAxios } from '@renderer/api/admin/loginLogsAxios'
import { User as UserType } from '@renderer/api/admin/usersAxios'
import moment from 'moment'
import { Search } from 'lucide-react'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'

interface LoginHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  user?: UserType | null
}

export const LoginHistoryModal = ({ isOpen, onClose, user }: LoginHistoryModalProps) => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10) // Support changing limit
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['login-logs', page, limit, user?.ql_nguoi_dung_id, debouncedSearch],
    queryFn: async () => {
      const res: any = await loginLogsAxios.getLogs({
        page,
        per_page: limit,
        user_id: user?.ql_nguoi_dung_id ? Number(user.ql_nguoi_dung_id) : undefined,
        search: debouncedSearch
      })
      return res.success ? res.data : { data: [], total: 0 }
    },
    enabled: isOpen,
    staleTime: 0 // Always fetch fresh
  })

  useEffect(() => {
    if (isOpen) {
      setPage(1)
    }
  }, [isOpen, user])

  const logs: LoginLog[] = data?.data || []
  const total = data?.total || 0

  const columns = useMemo(
    () => [
      {
        uid: 'ql_nguoi_dung_ho_ten',
        name: 'NGƯỜI DÙNG',
        renderCell: (item: any) => (
          <User
            avatarProps={{ radius: 'lg', src: item.ql_nguoi_dung_avatar }}
            description={item.ql_nguoi_dung_email}
            name={item.ql_nguoi_dung_ho_ten}
          >
            {item.ql_nguoi_dung_email}
          </User>
        )
      },
      {
        uid: 'ip_address',
        name: 'IP ADDRESS',
        width: 150,
        renderCell: (item: any) => (
          <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {item.ip_address || 'Unknown'}
          </span>
        )
      },
      {
        uid: 'created_at',
        name: 'THỜI GIAN',
        width: 180,
        renderCell: (item: any) => (
          <div className="flex flex-col">
            <span className="text-small">{moment(item.created_at).format('DD/MM/YYYY')}</span>
            <span className="text-tiny text-default-400">
              {moment(item.created_at).format('HH:mm:ss')}
            </span>
          </div>
        )
      },
      {
        uid: 'user_agent',
        name: 'THIẾT BỊ',
        renderCell: (item: any) => (
          <div className="text-xs text-gray-500 max-w-[300px] truncate" title={item.user_agent}>
            {item.user_agent}
          </div>
        )
      }
    ],
    []
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent className="rounded-lg h-[90vh] bg-white dark:bg-gray-900">
        <ModalHeader className="border-b border-gray-200 dark:border-gray-700 py-4 px-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Lịch sử đăng nhập {user ? `- ${user.ql_nguoi_dung_ho_ten}` : 'toàn hệ thống'}
          </h2>
        </ModalHeader>
        <ModalBody className="p-4 flex flex-col gap-4 bg-white dark:bg-gray-900">
          {!user && (
            <div className="shrink-0">
              <Input
                isClearable
                radius="sm"
                classNames={{
                  inputWrapper:
                    'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-10 transition-all focus-within:border-blue-500'
                }}
                placeholder="Tìm kiếm log (IP, Tên, Email)..."
                startContent={<Search className="text-gray-500 dark:text-gray-400" size={18} />}
                value={search}
                onValueChange={setSearch}
                onClear={() => setSearch('')}
              />
            </div>
          )}

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-hidden relative">
              <TableHr
                columns={columns}
                data={logs as any}
                isLoading={isLoading}
                primaryKey="id"
                borderColor="border-gray-100 dark:border-gray-700"
                enableStickyScrollbar={false}
              />
            </div>
            <TablePagination
              page={page}
              total={total}
              limit={limit}
              onChangePage={setPage}
              onChangeLimit={setLimit}
              className="border-t border-gray-200 dark:border-gray-700 p-2"
            />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
