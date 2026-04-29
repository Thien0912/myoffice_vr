import { useState, useMemo, useEffect } from 'react'
import {
  Button,
  Input,
  Checkbox,
  ScrollShadow
} from "@heroui/react"
import { UserAvatarVertical } from '@renderer/components/UserAvatar'
import { Search, User as UserIcon, X } from 'lucide-react'
import { removeVietnameseTones } from '@renderer/utils/string'
import DraggableModal from '@renderer/components/DraggableModal'
import { useQuery } from '@tanstack/react-query'
import { usersAxios } from '@renderer/api/admin/usersAxios'

interface SelectUsersModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedUsers: any[]) => void
  unitId: string | number
  unitName: string
  initialSelected?: any[]
}

export default function SelectUsersModal({
  isOpen,
  onClose,
  onConfirm,
  unitId,
  unitName,
  initialSelected = []
}: SelectUsersModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())

  // Fetch Users for this unit
  const { data: userData = [], isLoading } = useQuery({
    queryKey: ['users-by-unit', unitId],
    queryFn: async () => {
      if (!unitId) return []
      try {
        const res = await usersAxios.getByUnit(String(unitId), ['Bảo vệ', 'Tài xế'])
        
        if (!res?.success) return []

        const items = Array.isArray(res.data) ? res.data : []
        return items
      } catch (err) {
        console.error('Error fetching users by unit:', err)
        return []
      }
    },
    enabled: isOpen && !!unitId,
    staleTime: 0
  })

  // Sync initial selection
  useEffect(() => {
    if (isOpen) {
        setSearchQuery('')
        // Chỉ lấy những người có ID hợp lệ để tránh "null" hoặc undefined trong Set
        const validInitial = (initialSelected || []).filter(u => u && u.ql_nguoi_dung_id)
        const initialIds = new Set(validInitial.map(u => String(u.ql_nguoi_dung_id)))
        setSelectedUserIds(initialIds)
    }
  }, [isOpen, initialSelected])

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return userData
    const queryNormalized = removeVietnameseTones(searchQuery)
    return userData.filter((u: any) => 
        removeVietnameseTones(u.ql_nguoi_dung_ho_ten || u.ho_va_ten || u.name || '').includes(queryNormalized) ||
        (u.ql_nguoi_dung_email && u.ql_nguoi_dung_email.toLowerCase().includes(queryNormalized))
    )
  }, [userData, searchQuery])

  // Create a combined list of users for lookup
  const allKnownUsers = useMemo(() => {
    const map = new Map()
    // Add initial ones first
    initialSelected.forEach(u => map.set(String(u.ql_nguoi_dung_id), u))
    // Add/Overwrite with fresh data from API
    userData.forEach(u => map.set(String(u.ql_nguoi_dung_id), u))
    return map
  }, [userData, initialSelected])

  // Identifiers for selected users to show at top
  const selectedUsers = useMemo(() => {
    return Array.from(selectedUserIds)
      .map(id => allKnownUsers.get(id))
      .filter(Boolean)
  }, [selectedUserIds, allKnownUsers])

  // Handlers
  const toggleUser = (userId: string) => {
      setSelectedUserIds(prev => {
          const newSet = new Set(prev)
          if (newSet.has(userId)) {
              newSet.delete(userId)
          } else {
              newSet.add(userId)
          }
          return newSet
      })
  }

  const handleConfirm = () => {
      onConfirm(selectedUsers)
      onClose()
  }

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chọn người ký - ${unitName}`}
      width="max-w-md"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <div className="text-[13px] text-gray-500">
                Đã chọn <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedUserIds.size}</span> người
            </div>
            {selectedUserIds.size > 0 && (
                <button 
                    className="text-[11px] text-red-500 hover:text-red-600 hover:underline font-medium transition-colors"
                    onClick={() => setSelectedUserIds(new Set())}
                >
                    Bỏ chọn tất cả
                </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="light" size="sm" onPress={onClose} className="font-medium text-[13px]">
              Hủy
            </Button>
            <Button color="primary" size="sm" onPress={handleConfirm} className="bg-blue-600 font-medium text-[13px]">
              Xác nhận
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col">
        {/* Search Box */}
        <div className="py-2 px-1">
            <Input 
                placeholder="Tìm kiếm tên, email..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                variant="bordered"
                radius="lg"
                className="w-full"
                classNames={{
                    inputWrapper: "h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 group-data-[focus=true]:border-blue-500",
                    input: "text-[13px]",
                }}
                startContent={<Search size={16} className="text-gray-400" strokeWidth={1.5} />}
                isClearable
                onClear={() => setSearchQuery('')}
            />
        </div>

        {/* Selected Users Chips */}
        {selectedUsers.length > 0 && (
            <div className="px-1 mb-2">
                <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                    {selectedUsers.map((u: any) => (
                        <div 
                            key={`chip-${u.ql_nguoi_dung_id}`}
                            className="group flex items-center gap-1.5 bg-white dark:bg-gray-800 pl-2 pr-1 py-1 rounded-md border border-blue-200 dark:border-blue-800 shadow-sm animate-in zoom-in-95 duration-200"
                        > 
                            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 truncate max-w-[100px]">
                                {u.ql_nguoi_dung_ho_ten || u.ho_va_ten || u.name}
                            </span>
                            <button 
                                onClick={() => toggleUser(String(u.ql_nguoi_dung_id))}
                                className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                            >
                                <X size={12} strokeWidth={2.5} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        <ScrollShadow className="max-h-[320px] px-1 custom-scrollbar">
          {isLoading ? (
             <div className="flex flex-col gap-2 p-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-2 border border-gray-100 dark:border-gray-800 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                        </div>
                    </div>
                ))}
             </div>
          ) : (
            <div className="flex flex-col gap-1 pb-2">
                {filteredUsers.map((user: any) => {
                const userId = String(user.ql_nguoi_dung_id)
                const isSelected = selectedUserIds.has(userId)
                
                return (
                    <div 
                    key={userId}
                    className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-200 border ${
                        isSelected 
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 shadow-sm' 
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/50 hover:border-blue-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                    onClick={() => toggleUser(userId)}
                    >
                    <div className="flex items-center gap-3">
                        <Checkbox 
                            isSelected={isSelected}
                            onValueChange={() => toggleUser(userId)}
                            size="sm"
                            color="primary"
                            className="mr-1"
                            classNames={{
                                wrapper: "group-data-[selected=true]:bg-blue-600 group-data-[selected=true]:border-blue-600"
                            }}
                        />
                        <UserAvatarVertical
                            name={user.ql_nguoi_dung_ho_ten || user.ho_va_ten || user.name}
                            description={
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] text-gray-400 leading-tight">
                                        {user.ql_nguoi_dung_email || user.email}
                                    </span>
                                    {user.ten_cong_viec && (
                                        <span className="text-[10px] text-gray-400 italic leading-tight">
                                            {user.ten_cong_viec}
                                        </span>
                                    )}
                                </div>
                            }
                            src={user.ql_nguoi_dung_avatar || user.hinh_anh || user.avatar || user.ql_nguoi_dung_hinh_anh || user.hinh}
                            size="sm"
                            className="bg-transparent hover:bg-transparent px-0 py-0"
                        />
                    </div>
                    {user.ql_nguoi_dung_la_lan_dao === '1' && (
                        <div className="bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200/50 shadow-sm shrink-0">
                            LÃNH ĐẠO
                        </div>
                    )}
                    </div>
                )
                })}

                {filteredUsers.length === 0 && (
                    <div className="py-8 text-center flex flex-col items-center gap-2">
                        <div className="p-3 bg-gray-50 rounded-full">
                            <UserIcon size={24} className="text-gray-400 dark:text-gray-600" />
                        </div>
                        <p className="text-[13px] text-gray-500">Không tìm thấy nhân sự nào</p>
                    </div>
                )}
            </div>
          )}
        </ScrollShadow>
      </div>
    </DraggableModal>
  )
}
