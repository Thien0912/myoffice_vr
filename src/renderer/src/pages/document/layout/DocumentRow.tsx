import { Checkbox } from '@heroui-v3/react'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import OfficeIcon from '../../../components/OfficeIcon'
import { date } from '@renderer/utils/formatDate'

export interface DocumentItem {
  id_van_ban: string
  vb_trich_yeu: string
  vb_ngay_ban_hanh: string
  attachments?: string[]
  // Add other required fields
  [key: string]: any
}

interface RowCheckboxProps {
  isSelected: boolean
  onSelect: (id: string) => void
  onToggleStar: (item: DocumentItem) => void
  isStarred: boolean
  item: DocumentItem
}

const RowCheckbox = ({ isSelected, onSelect, onToggleStar, isStarred, item }: RowCheckboxProps) => (
  <div className="flex items-center gap-0.5 sm:gap-4 shrink-0 sm:pt-0">
    <div onClick={(e) => e.stopPropagation()}>
      <Checkbox
        isSelected={isSelected}
        onChange={() => onSelect(item.id_van_ban)}
        aria-label="Select document"
        className="m-0 p-0"
      >
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox>
    </div>
    <div
      onClick={(e) => {
        e.stopPropagation()
        onToggleStar(item)
      }}
      className="p-0.5"
    >
      <Star
        size={18}
        className={`transition-colors ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`}
      />
    </div>
  </div>
)

interface RowSenderProps {
  senderName: string
  isUnread: boolean
}

const RowSender = ({ senderName, isUnread }: RowSenderProps) => (
  <div
    className={`hidden sm:block w-32 shrink-0 font-medium ml-4 ${isUnread ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'} truncate`}
  >
    {senderName || 'Cơ quan'}
  </div>
)

interface RowContentProps {
  content: string
  attachments?: string[]
  isUnread: boolean
}

const RowContent = ({ content, attachments, isUnread }: RowContentProps) => (
  <div className="hidden sm:flex flex-1 min-w-0 pr-4 items-center gap-2 w-full ml-4">
    <div>
      <span
        className={`truncate flex-1 leading-relaxed ${isUnread ? 'text-gray-800 dark:text-white' : 'font-normal text-gray-500 dark:text-gray-400'}`}
      >
        {content}
      </span>

      {/* File Chips */}
      {attachments && attachments.length > 0 && (
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              title={file}
              className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium
                    ${
                      isUnread
                        ? 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }
                `}
            >
              <OfficeIcon name={file} size={14} />
              <span className="truncate max-w-20">{file}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)

interface RowDateProps {
  datevanban: string
  isUnread: boolean
}

const RowDate = ({ datevanban, isUnread }: RowDateProps) => (
  <div
    className={`hidden sm:block w-24 shrink-0 text-right ${isUnread ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
  >
    {date('vi', datevanban)}
  </div>
)

interface DocumentRowProps {
  item: DocumentItem
  index: number
  isSelected: boolean
  onSelect: (id: string) => void
  onToggleStar: (item: DocumentItem) => void
}

export const DocumentRow = ({
  item,
  index,
  isSelected,
  onSelect,
  onToggleStar
}: DocumentRowProps) => {
  const isStarred = false // Replace with actual property check
  const isUnread = item.isUnread // Replace with actual property check

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={`
        group w-full max-w-full flex items-center py-2.5 px-3 sm:px-6 border-b border-gray-100 dark:border-gray-800 transition-all cursor-pointer overflow-hidden
        relative gap-1.5 sm:gap-0
        ${isUnread ? 'bg-white dark:bg-gray-900' : 'bg-[#f2f6fc] dark:bg-gray-800/50'}
        hover:bg-gray-50 dark:hover:bg-gray-800/60
      `}
    >
      <RowCheckbox
        isSelected={isSelected}
        onSelect={onSelect}
        onToggleStar={onToggleStar}
        isStarred={isStarred}
        item={item}
      />
      <RowSender senderName={item.co_quan_ban_hanh_ten} isUnread={isUnread} />
      <RowContent content={item.vb_trich_yeu} attachments={item.attachments} isUnread={isUnread} />
      <RowDate datevanban={item.vb_ngay_ban_hanh} isUnread={isUnread} />
    </motion.div>
  )
}
