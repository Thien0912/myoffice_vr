import {
  Checkbox,
  DatePicker,
  Input,
  Select,
  SelectItem,
  TableCell,
  TableRow,
  getKeyValue
} from '@heroui/react'
import { parseDate } from '@internationalized/date'
import { I18nProvider } from '@react-aria/i18n'
import React, { memo } from 'react'
import { TableColumnType } from './TableTypes'

interface TableHrRowProps<T> {
  row: T
  idx: number
  columns: TableColumnType<T>[]
  primaryKey: string
  selectedKeys: any
  contextMenuRowId: string | number | null | undefined
  onRowContextMenu?: (e: React.MouseEvent, row: T) => void
  onRowChange?: (id: string | number, columnUid: string, value: any) => void
  onSelectionChange?: (keys: any) => void
  toggleRow: (id: string) => void
  stickyStyles: Record<string, React.CSSProperties>
  columnWidths: Record<string, number>
  onResizeStart: (e: React.MouseEvent, uid: string, width: number) => void
  lastLeftPinned: string | null
  firstRightPinned: string | null
  isScrolledLeft: boolean
  isScrolledRight: boolean
}

const textColor = '!text-gray-700'

function TableHrRowComponent<T extends Record<string, unknown>>({
  row,
  idx,
  columns,
  primaryKey,
  selectedKeys,
  contextMenuRowId,
  onRowContextMenu,
  onRowChange,
  toggleRow,
  stickyStyles,
  columnWidths,
  onResizeStart,
  lastLeftPinned,
  firstRightPinned,
  isScrolledLeft,
  isScrolledRight
}: TableHrRowProps<T>) {
  const rowKey = String(row[primaryKey] || idx)
  const isSelected =
    selectedKeys === 'all' || (selectedKeys instanceof Set && selectedKeys.has(rowKey))
  const isContextMenuActive = String(contextMenuRowId) === rowKey

  const renderCell = (row: T, col: TableColumnType<T>, index: number) => {
    const val = getKeyValue(row, col.uid)
    const rowId = (row[primaryKey] || index) as string | number
    const width = columnWidths[col.uid] || col.width

    let content: React.ReactNode = <span className={`text-small ${textColor}`}>{val}</span>

    if (col.uid === 'stt') {
      content = (
        <div className="relative flex items-center justify-center w-full h-full min-h-8">
          {col.render && col.render(val, row, index)}
          <span
            className={`text-small text-gray-500 ${isSelected ? 'hidden' : 'block group-hover:hidden'}`}
          >
            {index !== undefined ? index + 1 : ''}
          </span>
          <Checkbox
            isSelected={isSelected}
            onValueChange={() => toggleRow(String(rowId))}
            size="sm"
            className="flex m-0 p-0"
            classNames={{ wrapper: 'm-0 before:!border-black' }}
            aria-label="Select row"
          />
        </div>
      )
    } else if (col.render) {
      content = col.render(val, row, index)
    } else if (col.type === 'select' && col.options) {
      content = (
        <Select
          aria-label={col.name}
          size="sm"
          radius="none"
          selectedKeys={val ? [String(val)] : []}
          onChange={(e) => onRowChange?.(rowId, col.uid, e.target.value)}
          classNames={{
            trigger:
              'bg-transparent data-[hover=true]:bg-transparent shadow-none border-1 border-transparent data-[focus=true]:border-blue-500 data-[focus=true]:shadow-[0_0_8px_rgba(59,130,246,0.6)] data-[open=true]:border-blue-500 data-[open=true]:shadow-[0_0_8px_rgba(59,130,246,0.6)] rounded-none min-h-8 h-8 group',
            value: `text-small ${textColor}`,
            label: textColor,
            selectorIcon: 'text-gray-300 group-hover:text-gray-600'
          }}
        >
          {col.options.map((opt) => (
            <SelectItem key={opt.value} classNames={{ title: textColor }}>
              {opt.label}
            </SelectItem>
          ))}
        </Select>
      )
    } else if ((col.type as any) === 'date') {
      let dateValue
      try {
        dateValue = val ? parseDate(String(val)) : null
      } catch (e) {
        dateValue = null
      }

      content = (
        <I18nProvider locale="vi-VN">
          <DatePicker
            id={`${col.uid}-${rowId}`}
            aria-label={col.name}
            size="sm"
            radius="none"
            value={dateValue}
            onChange={(date) => onRowChange?.(rowId, col.uid, date ? date.toString() : '')}
            classNames={{
              base: 'min-w-full p-0',
              inputWrapper:
                'bg-transparent data-[hover=true]:bg-transparent shadow-none border-1 border-transparent data-[focus=true]:border-blue-500 data-[focus=true]:shadow-[0_0_8px_rgba(59,130,246,0.6)] rounded-none min-h-8 h-8'
            }}
          />
        </I18nProvider>
      )
    } else if (col.editable !== false) {
      content = (
        <Input
          id={`${col.uid}-${rowId}`}
          autoComplete="off"
          aria-label={col.name}
          size="sm"
          defaultValue={val ? String(val) : ''}
          type={col.type === 'date' ? 'date' : 'text'}
          onValueChange={(value) => onRowChange?.(rowId, col.uid, value)}
          classNames={{
            inputWrapper:
              'bg-transparent data-[hover=true]:bg-transparent shadow-none border-1 border-transparent group-data-[focus=true]:border-blue-500 group-data-[focus=true]:shadow-[0_0_8px_rgba(59,130,246,0.6)] rounded-none min-h-8 h-8',
            input: `text-small ${textColor}`
          }}
        />
      )
    }

    return (
      <div className="relative w-full h-full flex items-center group/cell">
        {content}
        {/* Resize Handle for Cell */}
        <div
          className="absolute -right-2 top-0 h-full w-4 cursor-col-resize z-20 flex justify-center"
          onMouseDown={(e) => {
            const currentWidth =
              typeof width === 'number' ? width : e.currentTarget.closest('td')?.offsetWidth || 100
            onResizeStart(e, col.uid, currentWidth)
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-1 h-full bg-blue-500 opacity-0 group-hover/cell:opacity-100 transition-opacity" />
        </div>

        {/* Shadow Overlay */}
        {col.uid === lastLeftPinned && isScrolledLeft && (
          <div className="absolute top-0 right-0 bottom-0 w-4 translate-x-full bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-50 h-full" />
        )}
        {col.uid === firstRightPinned && isScrolledRight && (
          <div className="absolute top-0 left-0 bottom-0 w-4 -translate-x-full bg-gradient-to-l from-black/5 to-transparent pointer-events-none z-50 h-full" />
        )}
      </div>
    )
  }

  return (
    <TableRow
      key={rowKey}
      className={'group ' + (isSelected || isContextMenuActive ? 'bg-slate-200' : 'bg-white')}
      data-selected={isSelected}
      onContextMenu={(e) => {
        if (onRowContextMenu) {
          e.preventDefault()
          onRowContextMenu(e, row)
        }
      }}
    >
      {columns.map((col) => (
        <TableCell
          key={col.uid}
          className={
            col.className +
            ' p-0 border border-gray-200 hover:bg-blue-100 ' +
            (col.pinned ? (isSelected || isContextMenuActive ? 'bg-slate-200' : 'bg-white') : '')
          }
          style={stickyStyles[col.uid]}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {renderCell(row, col, idx)}
        </TableCell>
      ))}
    </TableRow>
  )
}

export const TableHrRow = memo(TableHrRowComponent) as typeof TableHrRowComponent
