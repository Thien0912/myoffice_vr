import { MoreHorizontal, X, FileText } from 'lucide-react'
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { ComposeItem } from '@renderer/store/useComposeStore'

type MinimizedMoreProps = {
  items: ComposeItem[]
  onRestore: (id: string) => void
  onClose: (id: string) => void
  style?: React.CSSProperties
}

export default function MinimizedMore({ items, onRestore, onClose, style }: MinimizedMoreProps) {
  if (items.length === 0) return null

  return (
    <div
      className="fixed bottom-0 z-50 hidden md:flex w-72 right-10 bg-white dark:bg-gray-800 border-x border-t border-gray-200 dark:border-gray-700 rounded-t-xl shadow-2xl flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]"
      style={style}
    >
      <Dropdown placement="top-end">
        <DropdownTrigger>
          <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50/80 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer backdrop-blur-sm">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-200 truncate select-none flex-1 flex items-center gap-2">
              <MoreHorizontal size={18} />
              <span>+{items.length} bản nháp khác</span>
            </div>
          </div>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Danh sách bản nháp"
          className="w-72"
          onAction={(key) => onRestore(key as string)}
        >
          {items.map((item) => {
            let title = ''
            switch (item.type) {
              case 'vanbanden':
                title = 'Văn bản đến'
                break
              case 'vanbandi':
                title = 'Văn bản đi'
                break
              case 'vanbannoibo':
                title = 'Văn bản nội bộ'
                break
              case 'vanbandidonvi':
                title = 'Văn bản đi đơn vị'
                break
            }

            const summary = item.formData.trich_yeu || `Đang soạn ${title.toLowerCase()}...`

            return (
              <DropdownItem key={item.id} textValue={title} className="p-0">
                <div className="flex flex-col p-2 gap-1 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
                      <FileText size={14} />
                      <span className="text-xs uppercase">{title}</span>
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      radius="full"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        onClose(item.id)
                      }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 italic pr-6">
                    {summary}
                  </div>
                </div>
              </DropdownItem>
            )
          })}
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
