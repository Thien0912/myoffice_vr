import { useState } from 'react'
import { Spinner } from '@heroui-v3/react'
import { Search as SearchIcon } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import moment from 'moment'
import { DocumentRow, DocumentItem } from './DocumentRow'

interface SideRightVanbanProps {
  documents?: DocumentItem[]
  isLoading?: boolean
  isError?: boolean
  error?: any
}

export default function SideRightVanban({
  documents = [],
  isLoading = false,
  isError = false,
  error = null
}: SideRightVanbanProps) {
  const MOCK_DOCUMENTS: DocumentItem[] = Array.from({ length: 30 }).map((_, i) => ({
    id_van_ban: `mock-${i}`,
    vb_trich_yeu: `Văn bản mẫu số ${i + 1} - Về việc triển khai kế hoạch năm 2025`,
    vb_ngay_ban_hanh: moment().subtract(i, 'days').toISOString(),
    co_quan_ban_hanh_ten: i % 2 === 0 ? 'UBND Tỉnh' : 'Sở Thông tin & Truyền thông',
    isUnread: ![1, 3, 4].includes(i), // Items 2, 4, 5 are Read (colored)
    attachments:
      i % 3 === 0 ? ['quyet_dinh.pdf', 'phu_luc.docx'] : i % 2 === 0 ? ['thong_bao.pdf'] : []
  }))

  const finalDocuments = documents.length > 0 ? documents : MOCK_DOCUMENTS

  // Mock state for selection/star until fully integrated
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  const toggleStar = (item: any) => console.log('Toggle star', item)

  return (
    <div className="flex-1 min-w-0 w-full max-w-full flex flex-col bg-[#f2f6fc] dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 min-h-[500px]">
      <div className="flex flex-col py-0 min-h-[400px] overflow-x-hidden">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="flex-1 flex justify-center items-center text-red-500">
            Lỗi: {error ? error.message : 'Lỗi không xác định'}
          </div>
        ) : finalDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-gray-300">
              <SearchIcon size={24} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Không tìm thấy văn bản nào
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {finalDocuments.map((item, index) => (
              <DocumentRow
                key={item.id_van_ban || index}
                item={item}
                index={index}
                isSelected={selectedIds.includes(item.id_van_ban)}
                onSelect={toggleSelect}
                onToggleStar={toggleStar}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
