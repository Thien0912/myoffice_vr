import { useMemo, useState, useRef } from 'react'
import { date as formatDate } from '@renderer/utils/formatDate'
import { BinhLuan, ProposeData } from '../hooks/usePropose'
import { UserAvatar } from '@renderer/components/UserAvatar'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { Pencil, Trash2, Reply, MoreHorizontal } from 'lucide-react'
import { Button, Input, Chip, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import ProposeCommentInput from './ProposeCommentInput'
import { toast } from "@heroui-v3/react";

type ProposeCommentListProps = {
  data: BinhLuan[]
  idDeXuat: string
  onReload?: () => void
  propose?: ProposeData | null
}

export default function ProposeCommentList({ data, idDeXuat, onReload, propose }: ProposeCommentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const groupedComments = useMemo(() => {
    // Chỉ lấy bình luận cha (parent_id là null hoặc '0')
    const mainComments = data.filter((item) => {
      const pId = String(item.parent_id || '0')
      return pId === '0' || !item.parent_id
    })

    // Nhóm theo ngày
    const groups: Record<string, BinhLuan[]> = {}
    mainComments.forEach((item) => {
      const dateLabel = formatDate('vi', item.created_at)
      
      if (!groups[dateLabel]) groups[dateLabel] = []
      groups[dateLabel].push(item)
    })

    return groups
  }, [data])

  const handleStartEdit = (item: BinhLuan) => {
    setEditingId(item.id_binh_luan)
    setEditValue(item.noi_dung)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleUpdate = async (id: string) => {
    if (!editValue.trim() || isUpdating) return
    setIsUpdating(true)
    try {
      const res = await dexuatAxios.updateBinhLuan(id, {
        noi_dung: editValue
      })
      if (res.status || res.success) {
        toast('Thành công', { description: 'Cập nhật thảo luận thành công', variant: 'success' })
        handleCancelEdit()
        onReload?.()
      }
    } catch (error) {
      console.error(error)
      toast('Lỗi', { variant: 'danger' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
    setShowConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return

    setIsDeleting(deleteId)
    setShowConfirm(false)
    try {
      const res = await dexuatAxios.deleteBinhLuan([deleteId])
      if (res.status || res.success) {
        toast('Thành công', { description: 'Xóa thảo luận thành công', variant: 'success' })
        onReload?.()
      }
    } catch (error) {
      console.error(error)
      toast('Lỗi', { variant: 'danger' })
    } finally {
      setIsDeleting(null)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6 pr-1">
      {/* Proposal Initial Message */} 
      {data.length === 0 && !propose && (
        <div className="text-center py-10 text-gray-400 italic text-sm">Chưa có thảo luận nào</div>
      )}

      {Object.entries(groupedComments).map(([dateLabel, comments]) => (
        <div key={dateLabel} className="space-y-4">
          {/* Date Separator matching mockup */}
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            <span className="flex-shrink mx-4 text-[13px] font-medium text-gray-400">
              {dateLabel}
            </span>
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
          </div>

          {comments.map((item) => (
            <div key={item.id_binh_luan} className="flex flex-col gap-4 relative">
              <CommentItem
                item={item}
                idDeXuat={idDeXuat}
                onReload={onReload}
                isEditing={editingId === item.id_binh_luan}
                editValue={editValue}
                setEditValue={setEditValue}
                onStartEdit={() => handleStartEdit(item)}
                onCancelEdit={handleCancelEdit}
                onUpdate={() => handleUpdate(item.id_binh_luan)}
                isUpdating={isUpdating}
                onDelete={() => handleDelete(item.id_binh_luan)}
                isDeleting={isDeleting === item.id_binh_luan}
              />

              {item.replies && item.replies.length > 0 && (
                <div className="ml-12 space-y-4">
                  {item.replies.map((child) => (
                    <CommentItem
                      key={child.id_binh_luan}
                      item={child}
                      idDeXuat={idDeXuat}
                      onReload={onReload}
                      isChild
                      isEditing={editingId === child.id_binh_luan}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      onStartEdit={() => handleStartEdit(child)}
                      onCancelEdit={handleCancelEdit}
                      onUpdate={() => handleUpdate(child.id_binh_luan)}
                      isUpdating={isUpdating}
                      onDelete={() => handleDelete(child.id_binh_luan)}
                      isDeleting={isDeleting === child.id_binh_luan}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Scroll target */}
      <div ref={bottomRef} />

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa thảo luận"
        content="Bạn có chắc chắn muốn xóa thảo luận này? Hành động này không thể hoàn tác."
        isDanger
        confirmText="Xóa ngay"
        isLoading={!!isDeleting}
      />
    </div>
  )
}

function CommentItem({
  item,
  idDeXuat,
  onReload,
  isChild = false,
  isEditing = false,
  editValue = '',
  setEditValue,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  isUpdating = false,
  onDelete,
  isDeleting = false
}: {
  item: BinhLuan
  idDeXuat: string
  onReload?: () => void
  isChild?: boolean
  isEditing?: boolean
  editValue?: string
  setEditValue: (val: string) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onUpdate: () => void
  isUpdating?: boolean
  onDelete: () => void
  isDeleting?: boolean
}) {
  const { user } = useAuthStore()
  const [replyingId, setReplyingId] = useState<string | null>(null)
  
  // Staff logic for mockup style
  const isStaff = item.ten_vi_tri_cong_viec || item.ten_don_vi
  const nameColor = isStaff ? 'text-[#2e7d32] dark:text-green-400' : 'text-blue-700 dark:text-blue-400'
  const isOwner = String(user?.ql_nguoi_dung_id) === String(item.created_user_id)

  return (
    <div className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex gap-4 items-start">
        <UserAvatar
          name={item.ten_nguoi_binh_luan || 'User'}
          src={item.avatar}
          gender={item.gioi_tinh}
          size="sm"
          className={`${isChild ? 'w-8 h-8' : 'w-10 h-10'} shrink-0 ring-2 ring-transparent group-hover:ring-blue-50 dark:group-hover:ring-blue-900/20 transition-all`}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-bold text-[14px] ${nameColor}`}>
                {item.ten_nguoi_binh_luan}
              </span>
              
              {isStaff && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="success"
                  className="h-4 px-1 text-[9px] font-bold bg-green-50 dark:bg-green-900/20 text-[#2e7d32] dark:text-green-400 border-none"
                >
                  {item.ten_vi_tri_cong_viec || 'Staff'}
                </Chip>
              )}
              
              <span className="text-[11px] text-gray-400 font-medium">
                {formatDate('d/m/Y, H:i', item.created_at)}
              </span>
            </div>

            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Popover placement="bottom-end">
                 <PopoverTrigger>
                   <Button isIconOnly variant="light" size="sm" className="w-8 h-8 min-w-0">
                     <MoreHorizontal size={16} className="text-gray-400" />
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="p-1 min-w-[120px]">
                   <div className="flex flex-col w-full">
                     {!isChild && (
                       <Button
                         variant="light"
                         size="sm"
                         className="justify-start font-medium"
                         startContent={<Reply size={14} />}
                         onPress={() => setReplyingId(item.id_binh_luan)}
                       >
                         Trả lời
                       </Button>
                     )}
                     {isOwner && (
                       <>
                         <Button
                           variant="light"
                           size="sm"
                           className="justify-start font-medium text-blue-600"
                           startContent={<Pencil size={14} />}
                           onPress={onStartEdit}
                         >
                           Chỉnh sửa
                         </Button>
                         <Button
                           variant="light"
                           size="sm"
                           className="justify-start font-medium text-red-600"
                           startContent={<Trash2 size={14} />}
                           onPress={onDelete}
                           isDisabled={isDeleting}
                         >
                           Xóa
                         </Button>
                       </>
                     )}
                   </div>
                 </PopoverContent>
               </Popover>
            </div>
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Input
                size="sm"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                variant="bordered"
                radius="lg"
                classNames={{
                  inputWrapper: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-10'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onUpdate()
                  if (e.key === 'Escape') onCancelEdit()
                }}
              />
              <div className="flex items-center gap-2">
                <Button size="sm" color="primary" onPress={onUpdate} isLoading={isUpdating} className="h-8 font-bold">Lưu</Button>
                <Button size="sm" variant="light" onPress={onCancelEdit} isDisabled={isUpdating} className="h-8 font-bold">Hủy</Button>
              </div>
            </div>
          ) : (
            <div className="text-[13px] text-gray-700 dark:text-gray-200 leading-relaxed mt-1 whitespace-pre-wrap">
              {item.noi_dung}
            </div>
          )}

          {/* Inline Reply Input for CommentItem */}
          {replyingId && (
            <div className="mt-3">
              <ProposeCommentInput
                idDeXuat={idDeXuat}
                parentId={item.id_binh_luan}
                autoFocus
                isReply
                onCancel={() => setReplyingId(null)}
                onSuccess={() => {
                  setReplyingId(null)
                  onReload?.()
                }}
                placeholder={`Trả lời ${item.ten_nguoi_binh_luan}...`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
