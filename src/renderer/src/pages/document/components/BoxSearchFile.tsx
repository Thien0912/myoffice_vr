import {
  Button,
  DateRangePicker,
  Popover,
  Select,
  ListBox,
  ScrollShadow,
  InputGroup,
  TextField,
  RangeCalendar,
  DateField,
  Label
} from '@heroui-v3/react'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { FileDinhKem } from '@renderer/shared/CommonInterface'
import {
  Search,
  EllipsisVertical,
  Download,
  Eye,
  Filter,
  ChevronsUpDown,
  Calendar,
  User,
  FileText
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { vanbandendonviAxios } from '@renderer/api/documents/vanbandendonviAxios'
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

const groupFilesByDate = (files: FileDinhKem[]): GroupedFiles => {
  const grouped = files.reduce<GroupedFiles>((acc, file) => {
    if (!file?.ngay_tao) return acc
    const dayOnly = new Date(file.ngay_tao).toISOString().split('T')[0]
    if (!acc[dayOnly]) acc[dayOnly] = []
    acc[dayOnly].push(file)
    return acc
  }, {})

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
  setFilterFile
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
    <div className="bg-white dark:bg-gray-800 flex flex-col fixed lg:sticky lg:top-0 z-20 inset-x-0 bottom-0 lg:bottom-auto w-full lg:overflow-visible shadow-xl lg:shadow-none border-t lg:border-l lg:border-t-8 border-[#f8fafb] dark:border-gray-900 border-gray-100 dark:border-gray-700 h-[70vh] lg:h-[calc(100vh-100px)] transition-all">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-10">
        <TextField
          aria-label="Tìm kiếm tệp"
          value={searchFile}
          onChange={(val) => setSearchFile?.(val)}
          className="w-full"
        >
          <InputGroup className="bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 border-none transition-colors rounded-xl shadow-none p-1">
            <InputGroup.Prefix>
              <Search size={18} className="text-gray-400" />
            </InputGroup.Prefix>
            <InputGroup.Input
              ref={inputRef}
              className="text-sm bg-transparent border-none outline-none outline-0 focus:ring-0 px-2"
              placeholder="Tìm kiếm tệp..."
            />
            <InputGroup.Suffix>
              <PopoverFilter setFilterFile={setFilterFile} />
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>
      </div>

      {/* Content Area */}
      <ScrollShadow
        className="flex-1 p-3"
        hideScrollBar
        onScroll={(e) => {
          const target = e.currentTarget
          const isBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 20
          if (isBottom && hasMore && !isFetchingNextPage) {
            onLoadMore()
          }
        }}
      >
        {data && data.length ? (
          <div className="space-y-6">
            {Object.entries(groupedResult)
              .filter(([dateStr, files]) => dateStr && files?.length > 0)
              .map(([dateStr, files]) => (
                <GroupItemFile key={dateStr} dateStr={dateStr} group={files} />
              ))}

            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!hasMore && data.length > 5 && (
              <div className="text-center py-4 text-xs text-gray-400 font-medium">
                — Đã hiển thị tất cả tệp —
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/30 rounded-full flex items-center justify-center mb-2 text-gray-300 dark:text-gray-600">
              <svg
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Không tìm thấy tệp
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Cố gắng tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
              </p>
            </div>
          </div>
        )}
      </ScrollShadow>
    </div>
  )
}

interface GroupFileProps {
  dateStr: string
  group: FileDinhKem[]
}

function GroupItemFile({ dateStr, group }: GroupFileProps) {
  if (!dateStr || !group?.length) return null
  const formattedDate = date('d/m/Y', dateStr)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-700"></div>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          {formattedDate}
        </span>
        <div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-700"></div>
      </div>

      <div className="grid gap-2">
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
    <div
      className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-200 cursor-pointer shadow-none hover:shadow-md"
      onClick={() => handlePreview(file.duong_dan, file.ten_file_goc)}
    >
      <div className="shrink-0 w-10 h-10 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
        <OfficeIcon name={file.ten_file_goc || ''} size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200 truncate leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {truncateMiddle(file.ten_file_goc, 32)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-400 font-medium bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 rounded uppercase">
            {file.ten_file_goc.split('.').pop()}
          </span>
          <span className="text-[11px] text-gray-400 line-clamp-1">
            {file.dung_luong || '0 KB'}
          </span>
        </div>
      </div>

      <Popover>
        <Popover.Trigger>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVertical size={16} />
          </Button>
        </Popover.Trigger>

        <Popover.Content placement="bottom end" className="p-1 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl rounded-lg">
          <div className="p-2 mb-1 border-b border-gray-50 dark:border-gray-700/50 flex flex-col gap-0.5 w-full">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              Thông tin tệp
            </span>
            <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
              {date('d/m/Y H:i', file.ngay_tao || '')}
            </span>
          </div>

          <Button
            fullWidth
            size="sm"
            variant="ghost"
            className="justify-start inline-flex items-center gap-2 h-9 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onPress={() => handlePreview(file.duong_dan, file.ten_file_goc)}
          >
            <Eye size={16} className="text-blue-500" />
            Xem trực tuyến
          </Button>

          <Button
            fullWidth
            size="sm"
            variant="ghost"
            className="justify-start inline-flex items-center gap-2 h-9 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20"
            onPress={() => handleButtonClick(file.duong_dan)}
          >
            <Download size={16} className="text-green-500" />
            Tải về máy
          </Button>
        </Popover.Content>
      </Popover>
    </div>
  )
}

function PopoverFilter({ setFilterFile }: { setFilterFile?: (filter: any) => void }) {
  const [filter, setFilter] = useState({
    fileType: '',
    author: '',
    date: null as any
  })

  const hasFilter = !!(filter.fileType || filter.author || filter.date)

  const handleApply = () => {
    if (!setFilterFile) return

    const formattedDate = filter.date
      ? {
          start: filter.date.start.toString(),
          end: filter.date.end.toString()
        }
      : null

    setFilterFile({
      ...filter,
      date: formattedDate
    })
  }

  const handleClear = () => {
    const cleared = { fileType: '', author: '', date: null }
    setFilter(cleared)
    setFilterFile?.(cleared)
  }

  return (
    <Popover>
      <Popover.Trigger>
        <Button
          isIconOnly
          variant="tertiary"
          size="sm"
          className={`relative rounded-lg ${hasFilter ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-transparent text-gray-400 shadow-none hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <Filter size={16} />
          {hasFilter && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white dark:ring-gray-800"></span>
          )}
        </Button>
      </Popover.Trigger>

      <Popover.Content placement="bottom end" className="w-80 p-4 space-y-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:outline-none rounded-lg shadow-lg">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50 dark:border-gray-700/50">
            <Filter size={14} className="text-blue-500" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              Bộ lọc nâng cao
            </span>
          </div>

          <Select
            name="loai_tep_tin"
            selectedKey={filter.fileType || ''}
            onSelectionChange={(key) =>
              setFilter((p) => ({ ...p, fileType: key as string }))
            }
          >
            <Label className="text-xs font-medium">Loại tệp tin</Label>
            <Select.Trigger className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <FileText size={16} />
                <Select.Value className="text-sm font-medium text-gray-800 dark:text-gray-200" />
              </div>
              <Select.Indicator>
                <ChevronsUpDown size={16} />
              </Select.Indicator>
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="pdf" textValue="Tài liệu PDF">Tài liệu PDF</ListBox.Item>
                <ListBox.Item id="doc, docx" textValue="Văn bản Word">Văn bản Word</ListBox.Item>
                <ListBox.Item id="png, jpg, jpeg" textValue="Hình ảnh, đồ họa">Hình ảnh, đồ họa</ListBox.Item>
                <ListBox.Item id="xls, xlsx" textValue="Bảng tính Excel">Bảng tính Excel</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>

          <SelectCreators filter={filter} setFilter={setFilter} />

          <DateRangePicker
            value={filter.date}
            onChange={(val) => setFilter((p) => ({ ...p, date: val as any }))}
            className="w-full relative"
          >
            <Label className="text-xs font-medium">Khoảng thời gian</Label>
            <DateField.Group fullWidth className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center">
              <Calendar size={16} className="text-gray-400 mr-2 shrink-0" />
              <DateField.Input slot="start">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateRangePicker.RangeSeparator />
              <DateField.Input slot="end">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix className="ml-auto">
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DateRangePicker.Popover className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl p-2 z-[60]">
              <RangeCalendar aria-label="Khoảng thời gian">
                <RangeCalendar.Header>
                  <RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.YearPickerTriggerHeading />
                    <RangeCalendar.YearPickerTriggerIndicator />
                  </RangeCalendar.YearPickerTrigger>
                  <RangeCalendar.NavButton slot="previous" />
                  <RangeCalendar.NavButton slot="next" />
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader>
                    {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => <RangeCalendar.Cell date={date} />}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
                <RangeCalendar.YearPickerGrid>
                  <RangeCalendar.YearPickerGridBody>
                    {({year}) => <RangeCalendar.YearPickerCell year={year} />}
                  </RangeCalendar.YearPickerGridBody>
                </RangeCalendar.YearPickerGrid>
              </RangeCalendar>
            </DateRangePicker.Popover>
          </DateRangePicker>

          <Button
            fullWidth
            variant="primary"
            size="sm"
            className="font-bold rounded-xl mt-2"
            onPress={handleApply}
          >
            Áp dụng bộ lọc
          </Button>

          {hasFilter && (
            <Button
              fullWidth
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-500 font-medium"
              onPress={handleClear}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </Popover.Content>
    </Popover>
  )
}

function SelectCreators({ filter, setFilter }: { filter: any; setFilter: (val: any) => void }) {
  const { data: creators } = useQuery({
    queryKey: ['creators'],
    queryFn: async () => {
      const resp = await vanbandendonviAxios.creators()
      return resp.data || []
    }
  })

  return (
    <Select
      selectedKey={filter.author || ''}
      onSelectionChange={(key) => {
        setFilter((p) => ({ ...p, author: key as string }))
      }}
    >
      <Label className="text-xs font-medium">Người tải lên</Label>
      <Select.Trigger className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          <User size={16} />
          <Select.Value className="text-sm font-medium text-gray-800 dark:text-gray-200" />
        </div>
        <Select.Indicator>
          <ChevronsUpDown size={16} />
        </Select.Indicator>
      </Select.Trigger>

      <Select.Popover>
        <ListBox>
          {(creators || []).map((c: any) => (
            <ListBox.Item key={c.id_nguoi_tao} id={c.id_nguoi_tao} textValue={c.ql_nguoi_dung_ho_ten}>
              <div className="flex flex-col">
                <span className="text-small">{c.ql_nguoi_dung_ho_ten}</span>
                <span className="text-tiny text-gray-400">{c.ql_nguoi_dung_email}</span>
              </div>
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
