import { Plus, RotateCcw, Search, ServerCog, PanelsLeftBottom } from 'lucide-react'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spinner, Input, cn } from '@heroui/react'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'

interface RoleToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
  onAddRole?: () => void
  onReset?: () => void
  columns: any[]
  visibleColumns: Set<string>
  setVisibleColumns: (keys: any) => void
  isSidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export const RoleToolbar: React.FC<RoleToolbarProps> = ({
  search,
  onSearchChange,
  isLoading,
  onAddRole,
  onReset,
  columns,
  visibleColumns,
  setVisibleColumns,
  onToggleSidebar
}) => {
  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 mb-1 rounded-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full lg:flex-1">
          {onToggleSidebar && (
            <Button
              isIconOnly
              variant="light"
              onPress={onToggleSidebar}
              className="lg:hidden text-gray-500"
              size="sm"
              radius="sm"
            >
              <PanelsLeftBottom size={20} /> 
            </Button>
          )}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm vai trò..."
              value={search}
              onValueChange={onSearchChange}
              radius="sm"
              classNames={{
                base: 'max-w-full',
                inputWrapper: cn(
                  'bg-white border border-gray-200 shadow-none hover:bg-gray-50 hover:border-gray-300 h-10 pr-2 transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 group-data-[focus=true]:border-blue-500 dark:group-data-[focus=true]:border-blue-400',
                  search && 'bg-blue-50/50 border-blue-400 dark:bg-blue-900/10 dark:border-blue-500'
                ),
                input: 'text-sm'
              }}
              startContent={<Search className="text-gray-400" size={22} />}
              endContent={
                <div className="flex items-center gap-1">
                  {isLoading && <Spinner size="sm" />}
                </div>
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 lg:ml-auto w-full lg:w-auto justify-end">
          <TableColumnVisibility
            columns={columns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            label="Ẩn/Hiện Cột"
          />

          <Button
            color="primary"
            variant="solid"
            className="font-bold px-4"
            radius="sm"
            size="sm"
            startContent={<Plus size={18} strokeWidth={3} />}
            onPress={onAddRole}
          >
            Tạo mới
          </Button>

          <Dropdown
            classNames={{
              content: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 min-w-[180px]'
            }}
          >
            <DropdownTrigger>
              <Button
                variant="flat"
                radius="sm"
                isIconOnly
                size="sm"
                className="bg-gray-100 dark:bg-gray-700 h-8 w-8 min-w-8"
              >
                <ServerCog
                  size={18}
                  strokeWidth={2}
                  className="text-gray-600 dark:text-gray-400"
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="More Actions" variant="flat">
              <DropdownItem
                key="reset"
                startContent={<RotateCcw size={16} />}
                onPress={onReset}
                className="text-danger font-medium"
                color="danger"
              >
                Khôi phục mặc định
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  )
}
