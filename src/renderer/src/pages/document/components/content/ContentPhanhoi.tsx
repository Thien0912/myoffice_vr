import { MessageSquareText } from 'lucide-react'
import { PhanHoi } from '@renderer/shared/CommonInterface'
import ItemComment from '@renderer/components/ItemComment'
import InputPhanhoi from '../InputPhanhoi'

type ContentPhanhoiProps = {
  data?: PhanHoi[]
  vanban?: any
  onReload?: () => void
}

export default function ContentPhanhoi({ data = [], vanban, onReload }: ContentPhanhoiProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400 gap-2 h-full">
            <MessageSquareText size={32} strokeWidth={1.5} className="opacity-40" />
            <span className="text-sm italic">Chưa có phản hồi nào</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4 sticky top-0 bg-transparent z-10 py-2 border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm">
              <span className="text-sm text-blue-900 dark:text-blue-400 font-medium flex items-center gap-2">
                <MessageSquareText size={16} />
                Danh sách phản hồi ({data.length})
              </span>
            </div>
            <div className="pr-1 pb-4">
              <ItemComment data={data} />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
        <InputPhanhoi
          vanban={vanban}
          onSuccess={onReload}
        />
      </div>
    </div>
  )
}
