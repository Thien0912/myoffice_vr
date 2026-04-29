import { useMemo } from 'react'
import {
  DrawerContentCustom,
  DrawerCustom,
  DrawerHeaderCustom
} from '@renderer/components/DrawerCustom'
import { FileX, Check, MoreVertical } from 'lucide-react'
import { timeAgo } from '@renderer/utils/formatDate'
import { UserAvatar } from '@renderer/components/UserAvatar'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useQuery } from '@tanstack/react-query'
import { dexuatAxios } from '@renderer/api/hr/dexuatAxios'
import { Spinner } from '@heroui-v3/react'

type DrawerAllCommentsProps = {
  open: boolean
  onClose: () => void
  onOpenDetail?: (id: string) => void
}

export default function DrawerAllComments({ open, onClose, onOpenDetail }: DrawerAllCommentsProps) {
  const { user } = useAuthStore()

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['propose-all-comments'],
    queryFn: () => dexuatAxios.getBinhLuan(),
    enabled: open
  })

  // Get all comments from all proposals of the user
  const allComments = useMemo(() => {
    const data = apiData?.data || []
    if (!data || data.length === 0) return []

    const extractedComments = data.flatMap((propose: any) => {
      const commentsRaw = propose.binh_luan || []

      const flattenComments = (comments: any[]): any[] => {
        let flat: any[] = []
        for (const c of comments) {
          flat.push({ ...c, proposal_tieu_de: propose.ten_de_xuat, id_de_xuat: propose.id_de_xuat })
          if (c.tra_loi_binh_luan && c.tra_loi_binh_luan.length > 0) {
            flat = flat.concat(flattenComments(c.tra_loi_binh_luan))
          }
        }
        return flat
      }

      return flattenComments(commentsRaw)
    })

    // Sort by most recent first
    return extractedComments.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [apiData])

  return (
    <DrawerCustom open={open} position="right" onClose={onClose} width={500}>
      <DrawerHeaderCustom title="Tất cả bình luận đề xuất" onClose={onClose} />
      <DrawerContentCustom>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20">
            <Spinner />
            <span className="text-sm text-gray-500">Đang tải bình luận...</span>
          </div>
        ) : allComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <FileX size={48} className="opacity-50" strokeWidth={1} />
            <p className="text-sm">Chưa có bình luận nào trên các đề xuất của bạn.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {allComments.map((comment) => (
              <div
                key={comment.id_binh_luan}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200/80 dark:border-gray-700 flex flex-col gap-3"
              >
                {/* Header row */}
                <div
                  className="text-[12px] text-gray-500 dark:text-gray-400 cursor-pointer hover:underline underline-offset-2 w-fit line-clamp-1"
                  onClick={() => {
                    if (onOpenDetail) {
                      onOpenDetail(comment.id_de_xuat)
                      onClose()
                    }
                  }}
                >
                  <span className="font-bold text-gray-700 dark:text-gray-200">
                    {comment.proposal_tieu_de}
                  </span>
                </div>

                {/* User row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={comment.ten_nguoi_binh_luan || 'User'}
                      src={comment.avatar}
                      gender={comment.gioi_tinh}
                      size="sm"
                      className="w-10 h-10 shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-[14px] text-blue-900 dark:text-blue-300 leading-tight">
                        {comment.ten_nguoi_binh_luan}
                      </span>
                      <span className="text-[12px] text-gray-500 mt-0.5">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500">
                    {String(user?.ql_nguoi_dung_id) === String(comment.created_user_id) && (
                      <div
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer transition-colors"
                        title="Đánh dấu là đã giải quyết"
                      >
                        <Check size={18} className="text-blue-600" />
                      </div>
                    )}
                    <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer transition-colors">
                      <MoreVertical size={18} />
                    </div>
                  </div>
                </div>

                {/* Comment content */}
                <div className="text-[13px] text-gray-800 dark:text-gray-200 whitespace-pre-wrap pl-1 mt-1">
                  {comment.noi_dung}
                </div>
              </div>
            ))}
          </div>
        )}
      </DrawerContentCustom>
    </DrawerCustom>
  )
}
