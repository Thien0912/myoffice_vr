import {
  Selection,
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  Button
} from '@heroui/react'
import { ChevronLeft, RotateCw, MoreVertical, ChevronRight, Settings2 } from 'lucide-react'

interface ProposeListHeaderProps {
  selectedKeys: Selection
  dataLength: number
  onSelectionChange: (keys: Selection) => void
  onRefresh?: () => void
  page: number
  limit: number
  totalRecordFiltered: number
  onChangePage: (page: number) => void
  onChangeLimit: (limit: number) => void
}

export const ProposeListHeader = ({
  selectedKeys,
  dataLength,
  onSelectionChange,
  onRefresh,
  page,
  limit,
  totalRecordFiltered,
  onChangePage,
  onChangeLimit
}: ProposeListHeaderProps) => {
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      onSelectionChange('all')
    } else {
      onSelectionChange(new Set([]) as any)
    }
  }

  const startRecord = (page - 1) * limit + 1
  const endRecord = Math.min(page * limit, totalRecordFiltered)
  const totalPages = Math.ceil(totalRecordFiltered / limit)

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-20">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5">
          <Checkbox
            isSelected={
              selectedKeys === 'all' ||
              ((selectedKeys as Set<React.Key>).size === dataLength && dataLength > 0)
            }
            isIndeterminate={
              selectedKeys !== 'all' &&
              (selectedKeys as Set<React.Key>).size > 0 &&
              (selectedKeys as Set<React.Key>).size < dataLength
            }
            onValueChange={handleSelectAll}
            className="mr-1"
          />
          <Dropdown size="sm">
            <DropdownTrigger>
              <div className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors">
                <ChevronLeft size={14} className="-rotate-90 text-gray-500" />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Selection overlap">
              <DropdownItem key="all" onPress={() => onSelectionChange('all')}>
                Tất cả
              </DropdownItem>
              <DropdownItem key="none" onPress={() => onSelectionChange(new Set([]) as any)}>
                Không chọn
              </DropdownItem>
              <DropdownItem key="read" isDisabled>
                Đã xem
              </DropdownItem>
              <DropdownItem key="unread" isDisabled>
                Chưa xem
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <Tooltip content="Làm mới">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            onPress={onRefresh}
          >
            <RotateCw size={18} />
          </Button>
        </Tooltip>

        <Dropdown size="sm">
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreVertical size={18} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="More actions">
            <DropdownItem key="mark-all-read">Đánh dấu tất cả là đã đọc</DropdownItem>
            <DropdownItem key="archive-all">Lưu trữ tất cả</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-[13px] text-gray-500 dark:text-gray-400">
          {totalRecordFiltered > 0 ? (
            <>
              <span className="text-gray-900 dark:text-gray-200">
                {dataLength}
              </span>
              <span className="mx-1">trong số</span>
              <span className="text-gray-900 dark:text-gray-100">{totalRecordFiltered}</span>
            </>
          ) : (
            '0 trong số 0'
          )}
        </div>

        <Dropdown size="sm" placement="bottom-end">
          <DropdownTrigger>
            <Button isIconOnly variant="light" size="sm" className="text-gray-500">
              <Settings2 size={18} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Display settings"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([String(limit)])}
            onSelectionChange={(keys) => {
              const newLimit = Array.from(keys)[0]
              onChangeLimit(Number(newLimit))
            }}
          >
            <DropdownItem key="10">10 dòng / trang</DropdownItem>
            <DropdownItem key="25">25 dòng / trang</DropdownItem>
            <DropdownItem key="50">50 dòng / trang</DropdownItem>
            <DropdownItem key="100">100 dòng / trang</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  )
}
