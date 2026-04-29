import { TextField, InputGroup, Button } from '@heroui-v3/react'
import { Filter, Search } from 'lucide-react'
import { useLayoutStore } from '@renderer/store/useLayoutStore'

type FilterVanbanProps = {
  isSidebarCollapsed?: boolean
}

export default function FilterVanban({ isSidebarCollapsed = false }: FilterVanbanProps) {
  const { setFilterDrawer } = useLayoutStore()

  return (
    <div className="flex w-full items-center transition-all duration-300">
      <div
        className={`shrink-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
      ></div>
      <div className="pl-3 flex-1">
        <TextField className="w-full max-w-md mb-0">
          <InputGroup
            className="bg-white border border-gray-200 shadow-none hover:bg-gray-50 hover:border-gray-300 h-10 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 rounded-medium"
          >
            <InputGroup.Prefix className="pl-3">
              <Search size={16} className="text-gray-400" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="Nhập nội dung, số hiệu, trích yếu văn bản"
              className="w-full px-2"
            />
            <InputGroup.Suffix className="pr-1">
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onPress={() => setFilterDrawer(true)}
              >
                <Filter size={16} className="text-gray-400" />
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>
      </div>
    </div>
  )
}
