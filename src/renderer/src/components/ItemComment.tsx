import { timeAgo } from '@renderer/utils/formatDate'
import { BadgeCheck } from 'lucide-react'
import { Tooltip } from '@heroui/react'
import { PhanHoi } from '@renderer/shared/CommonInterface'

type ItemCommentProps = {
  data: PhanHoi[]
}

export default function ItemComment({ data }: ItemCommentProps) {
  const CheckIcon = () => {
    return (
      <Tooltip content="Đơn vị của bạn đã phản hồi văn bản này">
        <BadgeCheck size={19} className="text-white fill-green-700" />
      </Tooltip>
    )
  }

  return (
    <div className="space-y-0.5">
      {data?.map((item, index) => {
        return (
          <div key={index} className="py-2 text-xs">
            <div className="flex justify-between items-center">
              <div className="font-medium flex items-center gap-2">
                {item.ten_don_vi} {item.send && <CheckIcon />}
              </div>
              <small className="text-gray-400">{timeAgo(item.ngay_tao)}</small>
            </div>
            <div className="text-sm text-gray-700">{item.noi_dung}</div>
          </div>
        )
      })}
    </div>
  )
}
