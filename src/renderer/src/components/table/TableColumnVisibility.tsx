import {
  Button,
  Dropdown,
  Label,
  Separator
} from '@heroui-v3/react'
import { Columns3Cog } from 'lucide-react'
import { useState, useEffect } from 'react'
interface TableColumnVisibilityProps {
  visibleColumns: Set<string>
  setVisibleColumns: (keys: Set<string>) => void
  columns: { uid: string; name: string }[]
  label?: string
}

/**
 * Component hiển thị dropdown cho phép người dùng ẩn/hiện các cột trong bảng.
 *
 * @param {Set<string>} visibleColumns - Set chứa các uid của các cột đang hiển thị.
 * @param {function} setVisibleColumns - Hàm cập nhật state visibleColumns.
 * @param {Array<{ uid: string; name: string }>} columns - Danh sách tất cả các cột có thể hiển thị.
 */
export default function TableColumnVisibility({
  visibleColumns,
  setVisibleColumns,
  columns,
  label
}: TableColumnVisibilityProps) {
  const [localKeys, setLocalKeys] = useState<Set<string>>(visibleColumns)

  useEffect(() => {
    setLocalKeys(visibleColumns)
  }, [visibleColumns])

  return (
    <div className="inline-flex">
      <Dropdown>
          <Button
            variant="ghost"
            isIconOnly
            className={`bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 h-10 font-medium ${localKeys.size !== columns.length ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}
          >
            <div className="relative">
              <Columns3Cog size={18} />
              {localKeys.size !== columns.length && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-gray-800" />
              )}
            </div>
          </Button>
        <Dropdown.Popover placement="bottom end" className="min-w-64 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-md p-1 z-50">
          <Dropdown.Menu
            disallowEmptySelection={false}
            aria-label={label || "Ẩn hiện cột"}
            selectedKeys={localKeys}
            selectionMode="multiple"
            onSelectionChange={(keys) => {
              let newKeys: Set<string>;
              
              if (keys === 'all') {
                newKeys = new Set(columns.map((c) => c.uid))
              } else {
                const selected = new Set(keys as any)
                if (selected.has('show_all')) {
                  newKeys = new Set(columns.map((c) => c.uid))
                } else if (selected.has('hide_all')) {
                  newKeys = new Set(['stt'])
                } else {
                  newKeys = keys as Set<string>
                }
              }

              // Update local dropdown UI instantly
              setLocalKeys(newKeys)
              
              // Defer parent table update (Zustand causes synchronous re-renders, 
              // ignoring startTransition). Use setTimeout so UI repaints checked state first.
              setTimeout(() => {
                setVisibleColumns(newKeys)
              }, 0)
            }}
            className="max-h-[400px] overflow-y-auto w-full"
          >
            <Dropdown.Section>
              <Dropdown.Item id="show_all" textValue="Hiện tất cả" className="data-hovered:bg-gray-100 dark:data-hovered:bg-gray-700">
                <Label className="font-semibold text-gray-900 dark:text-gray-200 cursor-pointer">
                  Hiện tất cả
                </Label>
              </Dropdown.Item>
              <Dropdown.Item id="hide_all" variant="danger" textValue="Ẩn nhanh" className="data-hovered:bg-red-50 dark:data-hovered:bg-red-900/20">
                <Label className="font-semibold text-red-500 cursor-pointer">
                  Ẩn nhanh
                </Label>
              </Dropdown.Item>
            </Dropdown.Section>
            <Separator />
            <Dropdown.Section>
              {columns.map((column) => (
                <Dropdown.Item
                  key={column.uid}
                  id={column.uid}
                  textValue={column.name || column.uid}
                  className="capitalize data-hovered:bg-gray-100 dark:data-hovered:bg-gray-700"
                >
                  <Dropdown.ItemIndicator />
                  <Label className="cursor-pointer">{column.name || column.uid}</Label>
                </Dropdown.Item>
              ))}
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  )
}

