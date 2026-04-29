import {
  Button,
  Input,
  DateRangePicker,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Badge
} from '@heroui/react'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { FileDinhKem } from '@renderer/shared/CommonInterface'
import { Search, Ellipsis, Download, Eye, Filter, ChevronsUpDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { date } from '@renderer/utils/formatDate'
import { truncateMiddle } from '@renderer/utils/string'
import { download, enscrypt } from '@renderer/utils/documents/userPreview'
import openPopout from '@renderer/utils/openPopout'

interface BoxSearchFileProps {
  data?: FileDinhKem[] | null
  onLoadMore: () => void
  hasMore: boolean
  isFetchingNextPage: boolean
  setSearchFile?: (term: string) => void
  searchFile?: string
  setFilterFile?: (filter: {
    fileType: string
    author: string
    date: { start: string; end: string } | null
  }) => void
  filterFile?: {
    fileType: string
    author: string
    date: { start: string; end: string } | null
  }
}

type GroupedFiles = { [date: string]: FileDinhKem[] }

// Hàm group file theo ngày
const groupFilesByDate = (files: FileDinhKem[]): GroupedFiles => {
  // Reduce để gom theo ngày
  const grouped = files.reduce<GroupedFiles>((acc, file) => {
    if (!file?.ngay_tao) return acc

    const dayOnly = new Date(file.ngay_tao).toISOString().split('T')[0]

    if (!acc[dayOnly]) acc[dayOnly] = []
    acc[dayOnly].push(file)

    return acc
  }, {})

  // Sort ngày mới nhất lên đầu
  const sorted = Object.fromEntries(
    Object.entries(grouped).sort(([a], [b]) => {
      return new Date(b).getTime() - new Date(a).getTime()
    })
  )

  return sorted
}

export default function BoxSearchFile({
  data,
  onLoadMore,
  hasMore,
  isFetchingNextPage,
  setSearchFile,
  searchFile,
  setFilterFile,
  filterFile
}: BoxSearchFileProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [groupedResult, setGroupedResult] = useState<GroupedFiles>({})

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (data?.length) {
      const grouped = groupFilesByDate(data)
      setGroupedResult(grouped)
    } else {
      setGroupedResult({})
    }
  }, [data])

  return (
    <div className="bg-white p-4 space-y-2 fixed lg:sticky lg:top-0 z-20 inset-x-0 bottom-0 lg:bottom-auto w-full lg:max-w-[600px] lg:overflow-visible shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:shadow-none border-t lg:border border-gray-100 min-h-[60vh] lg:min-h-auto lg:rounded-lg lg:bg-white">
      <Input
        size="md"
        ref={inputRef}
        startContent={<Search size={18} />}
        endContent={<PopoverFilter setFilterFile={setFilterFile} />}
        value={searchFile} // ✅
        onChange={(e) => setSearchFile?.(e.target.value)} // ✅
        placeholder="Tìm kiếm theo tên file"
      />
      {data && data.length ? (
        <div
          className="space-y-3 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2 pt-1"
          onScroll={(e) => {
            const target = e.currentTarget
            const isBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 10
            if (isBottom && hasMore && !isFetchingNextPage) {
              onLoadMore()
            }
          }}
        >
          {Object.entries(groupedResult)
            .filter(([dateStr, files]) => dateStr && files?.length > 0)
            .map(([dateStr, files]) => (
              <GroupItemFile key={dateStr} dateStr={dateStr} group={files} />
            ))}
          {isFetchingNextPage && (
            <div className="text-center text-gray-400 py-2 text-xs animate-pulse">
              Đang tải thêm...
            </div>
          )}
        </div>
      ) : (
        <div className="py-10 flex flex-col items-center justify-center text-center text-gray-500 px-3 space-y-1">
          <OfficeIcon name="Document.png" size={64} color="#cfcdcc" />
          <div>
            <div className="font-medium">Chưa có tệp đính kèm</div>
            <div className="text-xs">Không tìm thấy tệp đính kèm nào</div>
          </div>
        </div>
      )}
    </div>
  )
}

interface GroupFileProps {
  dateStr: string
  group: FileDinhKem[]
}

function GroupItemFile({ dateStr, group }: GroupFileProps) {
  if (!dateStr || !group?.length) return null

  const formattedDate = date('d/m/Y', dateStr) // dùng hàm date bạn cung cấp

  return (
    <div className="space-y-1">
      <div className="font-medium text-xs text-slate-500">Ngày {formattedDate}</div>

      <div className="space-y-2">
        {group.map((file) => (
          <ItemFile key={file.id_file_dinh_kem} file={file} />
        ))}
      </div>
    </div>
  )
}

function ItemFile({ file }: { file: FileDinhKem }) {
  const handlePreview = async (url: string, name: string): Promise<void> => {
    const link = await enscrypt(url, name)
    if (link) {
      openPopout(link, name)
    }
  }

  const handleButtonClick = (link: string) => {
    const url = link.split('/').pop() || 'download'
    download(url)
  }

  return (
    <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-md text-xs hover:shadow cursor-pointer">
      <div className="shrink-0">
        <OfficeIcon name={file.ten_file_goc || ''} size={26} />
      </div>
      <div
        className="leading-tight flex-1"
        onClick={() => handlePreview(file.duong_dan, file.ten_file_goc)}
      >
        <p className="line-clamp-1">{truncateMiddle(file.ten_file_goc, 30)}</p>
        <div className="text-gray-500 text-[10px]">{file.dung_luong || '-'}</div>
      </div>
      <Popover placement="left" showArrow radius="none">
        <PopoverTrigger>
          <Button isIconOnly variant="light" radius="full" size="sm">
            <Ellipsis size={13} />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 min-w-[150px]">
          <span className="text-[10px] text-gray-400 leading-tight flex flex-col items-start justify-start p-2">
            <div>Thông tin tệp</div>
            <div>{date('d/m/Y H:i', file.ngay_tao || '')}</div>
          </span>
          <Button
            startContent={<Eye size={14} />}
            radius="none"
            fullWidth
            size="sm"
            variant="light"
            className="justify-start"
            onPress={() => handlePreview(file.duong_dan, file.ten_file_goc)}
          >
            Xem trước
          </Button>

          <Button
            startContent={<Download size={14} />}
            radius="none"
            fullWidth
            size="sm"
            variant="light"
            className="justify-start"
            onPress={() => handleButtonClick(file.duong_dan)}
          >
            Tải xuống
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}

/* ========================
        FILTER POPUP
======================== */
function PopoverFilter({ setFilterFile }: { setFilterFile?: (filter: any) => void }) {
  const [filter, setFilter] = useState({ fileType: '', author: '', date: null })

  useEffect(() => {
    setFilterFile?.(filter)
  }, [filter])
  const hasFilter = filter.fileType || filter.author || filter.date
  return (
    <Popover placement="left-start" showArrow radius="none">
      <PopoverTrigger>
        <Button isIconOnly variant="light" radius="full" size="sm" className="relative">
          <Filter size={14} />
          {hasFilter && (
            <Badge color="danger" className="w-2 h-2 p-0 absolute -top-1 -right-1">
              &nbsp;
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="min-w-sm p-3 space-y-3">
        <Select
          label="Chọn loại file"
          placeholder="Chọn loại file"
          value={filter.fileType}
          onChange={(e) => setFilter((p) => ({ ...p, fileType: e.target.value }))}
          selectorIcon={<ChevronsUpDown />}
        >
          <SelectItem key="pdf">PDF</SelectItem>
          <SelectItem key="doc, docx">Word</SelectItem>
          <SelectItem key="png, jpg, jpeg">Image</SelectItem>
          <SelectItem key="xls, xlsx">Excel</SelectItem>
        </Select>

        <Select
          label="Người soạn"
          placeholder="Chọn người soạn"
          value={filter.author}
          onChange={(e) => setFilter((p) => ({ ...p, author: e.target.value }))}
          selectorIcon={<ChevronsUpDown />}
        >
          <SelectItem key="anhnv">Nguyễn Văn Anh</SelectItem>
          <SelectItem key="linhpt">Phạm Thảo Linh</SelectItem>
          <SelectItem key="huybk">Bùi Khánh Huy</SelectItem>
        </Select>

        <DateRangePicker label="Thời gian" value={filter.date} />
      </PopoverContent>
    </Popover>
  )
}
