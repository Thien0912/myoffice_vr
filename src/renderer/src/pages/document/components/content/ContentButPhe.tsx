import { useMemo, useCallback } from 'react'
import { date } from '@renderer/utils/formatDate'
import { CalendarDays, MessageSquare, User, Folders, Download, Eye } from 'lucide-react'
import { Item } from '../drawer/DrawerDocument'
import { Button, Tooltip } from '@heroui-v3/react'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { download, enscrypt } from '@renderer/utils/documents/userPreview'
import openPopout from '@renderer/utils/openPopout'

type ContentButPheProps = {
  data?: {
    id_but_phe: string
    id_van_ban: string
    id_nguoi_but_phe: string
    ngay_but_phe: string
    noi_dung_but_phe: string
    file_but_phe: string | null
    ngay_tao: string
    ngay_sua: string
    id_nguoi_tao: string
    id_nguoi_sua: string
    nguoi_but_phe_ho_ten: string
  }
}

export default function ContentButPhe({ data }: ContentButPheProps) {
  const files = useMemo(() => {
    if (!data?.file_but_phe) return []
    try {
      if (typeof data.file_but_phe === 'string') {
        const parsed = JSON.parse(data.file_but_phe)
        return Array.isArray(parsed) ? parsed : []
      }
      return Array.isArray(data.file_but_phe) ? data.file_but_phe : []
    } catch (error) {
      console.error('Error parsing file_but_phe:', error)
      return []
    }
  }, [data?.file_but_phe])

  // Xử lý preview file
  const handlePreview = useCallback(async (url: string, name: string): Promise<void> => {
    const link = await enscrypt(url, name)
    if (link) {
      openPopout(link, name)
    }
  }, [])

  // Xử lý download file
  const handleDownload = useCallback(async (url: string, name: string): Promise<void> => {
    const link = await enscrypt(url, name)
    if (link) {
      download(link)
    }
  }, [])

  const renderFiles = useMemo(() => {
    if (files.length === 0) return null

    return files.map((file: any, index: number) => {
      // Mapping fields based on the user provided structure
      // "file_name": "...", "file_path": "...", "file_extension": "...", "file_size": ...
      // Adjust field access as per potential API variants if needed, but aiming for the provided one.
      const fileName = file.file_name || file.ten_file_goc
      const filePath = file.file_path || file.duong_dan
      const fileSize = file.file_size || file.dung_luong // Assuming file_size might be number or formatted string

      return (
        <div
          key={`${filePath}-${index}`}
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-md mb-2 w-full max-w-full overflow-hidden bg-white dark:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <span className="shrink-0">
              <OfficeIcon name={fileName} size={32} />
            </span>

            <div className="grow text-xs overflow-hidden">
              <div className="font-medium truncate dark:text-gray-200">{fileName}</div>
              <div className="text-gray-500 dark:text-gray-400 truncate">{fileSize}</div>
            </div>

            <div className="flex shrink-0 gap-1 ml-2">
              <Tooltip>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => handleDownload(filePath, fileName)}
                >
                  <Download size={14} />
                </Button>
                <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                  Tải xuống
                </Tooltip.Content>
              </Tooltip>

              <Tooltip>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => handlePreview(filePath, fileName)}
                >
                  <Eye size={14} />
                </Button>
                <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                  Xem trước
                </Tooltip.Content>
              </Tooltip>
            </div>
          </div>
        </div>
      )
    })
  }, [files, handleDownload, handlePreview])

  return (
    <div className="p-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
      <Item icon={<User size={14} />} label="Người bút phê" value={data?.nguoi_but_phe_ho_ten} />
      <Item
        icon={<CalendarDays size={14} />}
        label="Ngày bút phê"
        value={data?.ngay_but_phe ? date('d/m/Y', data.ngay_but_phe) : undefined}
      />
      <Item 
        icon={<MessageSquare size={14} />} 
        label="Nội dung" 
        value={
          data?.noi_dung_but_phe ? (
            <div 
              className="prose prose-sm max-w-none dark:prose-invert" 
              dangerouslySetInnerHTML={{ __html: data.noi_dung_but_phe }} 
            />
          ) : undefined
        } 
      />
      <Item icon={<Folders size={14} />} label="File đính kèm" value={renderFiles} />
    </div>
  )
}
