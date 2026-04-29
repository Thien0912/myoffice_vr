import { Button, Popover, PopoverTrigger, PopoverContent, Badge, cn } from '@heroui/react'
import { Filter, RotateCcw } from 'lucide-react'
import React from 'react'
import { SelectDropdown } from '@renderer/components/SelectDropdown'

interface UserFilterPopoverProps {
  filter: any
  setFilter: (filter: any) => void
  onPageChange: (page: number) => void
  donviOptions: any[]
  roleOptions: any[]
}

export const UserFilterPopover: React.FC<UserFilterPopoverProps> = ({
  filter,
  setFilter,
  onPageChange,
  donviOptions,
  roleOptions
}) => {

  const activeFilterCount = [
    filter.id_don_vi,
    filter.ql_vai_tro_id,
    filter.active_flag
  ].filter(val => val !== undefined && val !== '' && val !== null).length

  const handleReset = () => {
    setFilter({})
    onPageChange(1)
  }

  return (
    <Popover
      placement="bottom-end"
      showArrow
      classNames={{
        content: 'p-0 min-w-[320px] overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl'
      }}
    >
      <PopoverTrigger>
        <button type="button" className="flex items-center justify-center focus:outline-none cursor-pointer">
          <Badge
            content={activeFilterCount}
            color="primary"
            isInvisible={activeFilterCount === 0}
            shape="circle"
            size="sm"
            className="font-bold border-1 border-white dark:border-gray-800"
          >
            <div
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-sm transition-all",
                activeFilterCount > 0 ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Filter size={18} />
            </div>
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col w-full bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-blue-600" />
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Bộ lọc người dùng
              </span>
            </div>
            {activeFilterCount > 0 && (
              <Button
                size="sm"
                variant="light"
                color="danger"
                className="h-8 font-medium"
                startContent={<RotateCcw size={14} />}
                onPress={handleReset}
              >
                Xóa lọc
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-4">
            <SelectDropdown
              label="Đơn vị"
              placeholder="Chọn đơn vị công tác"
              options={donviOptions}
              value={filter.id_don_vi}
              onChange={(val) => {
                setFilter({ ...filter, id_don_vi: val })
                onPageChange(1)
              }}
            />

            <SelectDropdown
              label="Vai trò"
              placeholder="Chọn vai trò hệ thống"
              options={roleOptions}
              value={filter.ql_vai_tro_id}
              onChange={(val) => {
                setFilter({ ...filter, ql_vai_tro_id: val })
                onPageChange(1)
              }}
            />

            <SelectDropdown
              label="Trạng thái"
              placeholder="Chọn trạng thái tài khoản"
              options={[
                { label: 'Hoạt động', value: '1' },
                { label: 'Đã khóa', value: '0' }
              ]}
              value={filter.active_flag !== undefined ? String(filter.active_flag) : ''}
              onChange={(val) => {
                setFilter({ ...filter, active_flag: val })
                onPageChange(1)
              }}
            />
          </div>

        </div>
      </PopoverContent>
    </Popover>
  )
}
