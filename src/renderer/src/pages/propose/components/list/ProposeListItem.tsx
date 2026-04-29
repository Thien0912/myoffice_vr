import { Checkbox, Button, Chip, Tooltip } from '@heroui/react'
import { Star, Maximize2, MessageSquare, MoreVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import { ProposeData } from '../../hooks/usePropose'
import { date as formatDate } from '@renderer/utils/formatDate'
import { UserAvatarVertical } from '@renderer/components/UserAvatar'

import { ProposeStatus } from '../ProposeStatus'
import OfficeIcon from '@renderer/components/OfficeIcon'

import { truncateMiddle } from '@renderer/utils/string'

interface ProposeListItemProps {
  row: ProposeData
  index: number
  active: boolean
  isSelected: boolean
  onSelectRow: (id: string | number, isChecked: boolean) => void
  onRowClick: (row: ProposeData) => void
  onViewDetail?: (id: string, row: ProposeData) => void
  onPreviewFile: (url: string, name: string) => void
}

export const ProposeListItem = ({
  row,
  index,
  active,
  isSelected,
  onSelectRow,
  onRowClick,
  onViewDetail,
  onPreviewFile
}: ProposeListItemProps) => {
  // Strip HTML tags for clean display
  const cleanContent = row.noi_dung
    ? row.noi_dung.replace(/<[^>]*>?/gm, '').replace(/&amp;/g, '&')
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onRowClick(row)}
      className={`
        group flex items-center gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-700 
        cursor-pointer transition-all relative
        ${active ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'}
        ${isSelected ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}
      `}
    >
      {/* Active Indicator */}
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}

      {/* Checkbox & Star */}
      <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          isSelected={isSelected}
          onValueChange={(val) => onSelectRow(row.id_de_xuat, val)}
        />
        <Button
          isIconOnly
          variant="light"
          size="sm"
          className="text-gray-300 hover:text-yellow-400 min-w-8 w-8 h-8"
        >
          <Star size={18} />
        </Button>
      </div>

      {/* Sender */}
      <div className="w-40 shrink-0 flex items-center">
        <UserAvatarVertical
          name={row.ho_va_ten}
          description={row.email}
          src={row.avatar_nguoi_tao || row.avatar}
          gender={row.gioi_tinh}
          size="sm"
        />
      </div>

      {/* Status */}
      <div className="w-36 shrink-0 flex items-center pl-2">
        <ProposeStatus status={String(row.trang_thai)} row={row} />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <Chip
            size="sm"
            variant="flat"
            radius="sm"
            className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 h-5 px-1.5 shrink-0"
          >
            {row.ten_loai_de_xuat}
          </Chip>
          <span className="text-gray-800 dark:text-gray-100 font-medium max-w-64 truncate">
            {row.tieu_de}
          </span>
          <span className="text-gray-600 dark:text-gray-300 truncate flex-1">{cleanContent}</span>
        </div>

        {/* Attachment Snippets */}
        {(row.so_luong_file ?? 0) > 0 && (
          <div className="flex flex-wrap gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            {row.file_dinh_kem?.slice(0, 2).map((file, idx) => (
              <Chip
                key={idx}
                size="sm"
                variant="bordered"
                radius="full"
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 h-7 px-1.5 gap-1.5 transition-all cursor-pointer max-w-[200px]"
                startContent={<OfficeIcon name={file.ten_file_goc} size={18} />}
                onClick={() => onPreviewFile(file.duong_dan, file.ten_file_goc)}
              >
                <span className="text-[12px] text-gray-500 dark:text-gray-400 font-normal pr-1">
                  {truncateMiddle(file.ten_file_goc, 25)}
                </span>
              </Chip>
            ))}
            {(row.file_dinh_kem?.length ?? 0) > 2 && (
              <Chip
                size="sm"
                variant="flat"
                radius="full"
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 h-7 px-2 font-bold cursor-default"
              >
                +{row.file_dinh_kem!.length - 2}
              </Chip>
            )}
          </div>
        )}
      </div>

      {/* Actions & Date Container - Fixed width to prevent jitter */}
      <div className="w-32 shrink-0 relative flex items-center justify-end">
        {/* Action Controls (Show on Hover) */}
        <div
          className="absolute inset-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-inherit pointer-events-none group-hover:pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip content="Mở chi tiết">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => onViewDetail?.(String(row.id_de_xuat), row)}
            >
              <Maximize2 size={16} className="text-gray-500" />
            </Button>
          </Tooltip>
          {(row.so_luong_binh_luan ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 rounded-md">
              <MessageSquare size={16} />
              <span className="text-xs font-bold">{row.so_luong_binh_luan}</span>
            </div>
          )}
          <Button isIconOnly size="sm" variant="light">
            <MoreVertical size={16} className="text-gray-500" />
          </Button>
        </div>

        {/* Date (Hidden on Hover) */}
        <div className="flex flex-col justify-center text-right font-medium text-gray-800 dark:text-gray-400 group-hover:opacity-0 transition-opacity duration-200">
          <div className="text-[13px]">{formatDate('H:i:s', String(row.created_at))}</div>
          <div className="text-[13px]">{formatDate('d/m/Y', String(row.created_at))}</div>
        </div>
      </div>
    </motion.div>
  )
}
