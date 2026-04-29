import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  cn,
  Selection,
  ButtonGroup,
  Divider,
  Skeleton,
  Spinner
} from '@heroui/react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Columns3Cog,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Inbox
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLayoutStore } from '@renderer/store/useLayoutStore'
import { capitalize } from '@renderer/utils/string'

const notSee = { className: 'bg-white [&_td]:font-semibold' }

export interface TableColumnType<T = unknown> {
  uid: string
  name: string
  className?: string
  render?: (value: unknown, row?: T) => React.ReactNode
  sort?: boolean
}

interface TableCustomProps<T extends Record<string, unknown>> {
  title?: string
  primaryKey: keyof T
  columns: Array<TableColumnType<T>>
  FiltersComponent?: React.JSX.Element
  FilterBoxComponent?: React.JSX.Element
  SearchFile?: React.JSX.Element
  RowActionComponent?: React.JSX.Element
  initVisibleColumns: Array<string>
  data: T[]
  page: number
  onPageChange?: (page: number) => void
  totalRecordFiltered: number
  totalRecord?: number
  length?: number
  setlength?: (length: number) => void
  onSearchChange?: (value: string) => void
  onClickRow?: (row: T) => void
  selectedRow?: string | number
  handleSelectedIds?: (ids: Set<string | number>) => void
  onContextMenuRow?: (e: React.MouseEvent, row: any) => void
  isLoading?: boolean
  selectedIds?: Set<string | number>
  onSortChange?: (
    sort:
      | []
      | Array<{
          column: string
          direction: 'ascending' | 'descending'
        }>
  ) => void
  initialSortDescriptors?: Array<{
    column: string
    direction: 'ascending' | 'descending'
  }>
  indexRow?: number
  setIndexRow?: (index: number) => void
}

const DEFAULT_SORT_DESCRIPTORS = []

export default function TableCustom<T extends Record<string, unknown>>({
  title,
  primaryKey,
  columns,
  FiltersComponent,
  FilterBoxComponent,
  SearchFile,
  RowActionComponent,
  data,
  initVisibleColumns,
  page,
  totalRecordFiltered,
  totalRecord,
  length,
  setlength,
  onPageChange,
  onClickRow,
  selectedRow,
  handleSelectedIds,
  onContextMenuRow,
  isLoading = false,
  selectedIds,
  onSortChange,
  initialSortDescriptors = DEFAULT_SORT_DESCRIPTORS,
  indexRow,
  setIndexRow
}: TableCustomProps<T>) {
  const { ScrollValue } = useLayoutStore()
  void totalRecord
  void setlength
  const [isScrolling, setIsScrolling] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(initVisibleColumns))
  const [typingValue, setTypingValue] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<Set<React.Key>>(new Set([]))
  const [isEditing, setIsEditing] = useState(false)

  // 👑 Column Resizing Logic
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const [resizingCol, setResizingCol] = useState<string | null>(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)

  const handleMouseDown = (e: React.MouseEvent, colUid: string) => {
    e.preventDefault()
    e.stopPropagation()
    const headerCell = (e.target as HTMLElement).closest('th')
    if (headerCell) {
      setResizingCol(colUid)
      setStartX(e.clientX)
      setStartWidth(headerCell.offsetWidth)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol) {
        const delta = e.clientX - startX
        const newWidth = Math.max(50, startWidth + delta) // Min width 50px
        setColumnWidths((prev) => ({ ...prev, [resizingCol]: newWidth }))
      }
    }

    const handleMouseUp = () => {
      if (resizingCol) {
        setResizingCol(null)
      }
    }

    if (resizingCol) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingCol, startX, startWidth])

  //Sort
  const sanitizeSortDescriptors = useCallback(
    (descriptors: Array<{ column: string; direction: 'ascending' | 'descending' }>) =>
      descriptors.filter((item) => item.column && item.direction),
    []
  )

  const [sortDescriptors, setSortDescriptors] = useState<
    Array<{ column: string; direction: 'ascending' | 'descending' }>
  >(() => sanitizeSortDescriptors(initialSortDescriptors))

  useEffect(() => {
    const sanitized = sanitizeSortDescriptors(initialSortDescriptors)
    setSortDescriptors((prev) => {
      const isSame =
        sanitized.length === prev.length &&
        sanitized.every(
          (item, idx) =>
            prev[idx]?.column === item.column && prev[idx]?.direction === item.direction
        )
      return isSame ? prev : sanitized
    })
  }, [initialSortDescriptors, sanitizeSortDescriptors])

  // 👑 Selection logic
  const handleSelectionChange = (keys: Selection) => {
    const ids =
      keys === 'all'
        ? new Set(data.map((item) => String(item[primaryKey])))
        : new Set([...keys].map((k) => String(k)))

    setSelectedKeys(ids)
    handleSelectedIds?.(ids)
  }

  useEffect(() => {
    handleSelectedIds?.(selectedKeys as Set<string | number>)
  }, [selectedKeys])

  // 👑 Scroll shadow
  useEffect(() => {
    setIsScrolling(ScrollValue > 200)
  }, [ScrollValue])

  // 👑 Pagination
  const totalPages = useMemo(
    () => Math.ceil(totalRecordFiltered / (length || 5)),
    [length, totalRecordFiltered]
  )
  const handlePrev = () => page > 1 && onPageChange?.(page - 1)
  const handleNext = () => page < totalPages && onPageChange?.(page + 1)

  useEffect(() => {
    if (page > totalPages && totalPages > 0) onPageChange?.(totalPages)
  }, [totalPages, page, onPageChange])

  // 👑 TopContent component
  const TopContent = useMemo(
    () => (
      <div className="flex justify-end items-center gap-2 w-full">
        <div className="flex justify-between md:justify-end gap-1 items-center w-full md:w-auto">
          <div className="text-xs text-gray-600">
            Hiển thị {length} / {totalRecordFiltered} dòng
          </div>
          {totalRecordFiltered > 1 && (
            <ButtonGroup variant="light" size="sm" radius="sm" className="items-center">
              <Button isIconOnly onPress={handlePrev} isDisabled={page === 1}>
                <ChevronLeft size={18} strokeWidth={1.5} />
              </Button>
              {isEditing ? (
                <Input
                  type="number"
                  size="sm"
                  radius="none"
                  classNames={{ base: 'w-[110px] h-[36px]', input: 'text-center text-sm py-0' }}
                  min={1}
                  max={totalRecordFiltered}
                  autoFocus
                  onValueChange={(val) => {
                    const v = Number(val)
                    if (v >= 1 && v <= totalRecordFiltered) onPageChange?.(v)
                  }}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                />
              ) : (
                <Button
                  variant="flat"
                  disableRipple
                  className="px-3 cursor-pointer"
                  onPress={() => setIsEditing(true)}
                >
                  Trang {page} / {totalPages}
                </Button>
              )}
              <Button isIconOnly onPress={handleNext} isDisabled={page === totalPages}>
                <ChevronRight size={18} strokeWidth={1.5} />
              </Button>
            </ButtonGroup>
          )}
        </div>
      </div>
    ),
    [length, totalRecordFiltered, page, isEditing, totalPages]
  )

  // 👑 Search debounce
  useEffect(() => {
    // const timer = setTimeout(() => setFilters({ searchValue: typingValue }), 500)
    // return () => clearTimeout(timer)
  }, [typingValue])

  // 👑 Render helpers
  const handleColumnSort = useCallback(
    (column: TableColumnType<T>) => {
      if (!column.sort) return
      const columnUid = column.uid
      setSortDescriptors((prev) => {
        const existingIndex = prev.findIndex((item) => item.column === columnUid)
        const existing = existingIndex >= 0 ? prev[existingIndex] : undefined
        const nextDirection = existing
          ? existing.direction === 'ascending'
            ? 'descending'
            : undefined
          : 'ascending'

        let updated = [...prev]

        if (existingIndex >= 0) {
          updated.splice(existingIndex, 1)
        }

        if (nextDirection) {
          updated = [{ column: columnUid, direction: nextDirection }, ...updated]
        }

        onSortChange?.(updated)
        return updated
      })
    },
    [onSortChange]
  )

  const renderHeader = () => (
    <TableHeader>
      {columns
        .filter((col) => visibleColumns === 'all' || Array.from(visibleColumns).includes(col.uid))
        .map((col) => (
          <TableColumn
            key={col.uid}
            className={cn(col.className, 'relative group/header')}
            width={columnWidths[col.uid]}
            aria-sort={
              col.sort
                ? (sortDescriptors.find((item) => item.column === col.uid)?.direction ?? 'none')
                : 'none'
            }
          >
            <div className="flex items-center justify-between h-full w-full">
              {col.sort ? (
                <button
                  type="button"
                  className="flex items-center gap-1 cursor-pointer select-none grow text-left"
                  onClick={() => handleColumnSort(col)}
                >
                  {col.name}
                  {(() => {
                    const descriptor = sortDescriptors.find((item) => item.column === col.uid)
                    if (!descriptor)
                      return (
                        <span className="relative w-5 h-5 inline-flex items-center justify-center text-inherit opacity-50">
                          <ArrowDownNarrowWide size={14} />
                        </span>
                      )

                    const isAsc = descriptor.direction === 'ascending'
                    return (
                      <span className="relative w-5 h-5 inline-flex items-center justify-center overflow-hidden text-blue-500">
                        <span
                          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isAsc ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
                        >
                          <ArrowUpNarrowWide size={14} />
                        </span>
                        <span
                          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isAsc ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
                        >
                          <ArrowDownNarrowWide size={14} />
                        </span>
                      </span>
                    )
                  })()}
                </button>
              ) : (
                <div className="flex items-center gap-1 text-left select-none grow">{col.name}</div>
              )}

              {/* Resizer Handle */}
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-600 z-20"
                onMouseDown={(e) => handleMouseDown(e, col.uid)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </TableColumn>
        ))}
    </TableHeader>
  )

  return (
    <div>
      {/* Top filter + search */}
      <div
        className={`py-2 px-4 space-y-3 sticky top-0 z-1 bg-white ${isScrolling ? 'shadow-md border-b border-gray-200' : 'shadow-none'}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="col-span-1 flex items-center gap-2">
            <Input
              isClearable
              className="w-full lg:max-w-md"
              placeholder="Tìm kiếm..."
              size="md"
              startContent={<Search strokeWidth={1.5} className="text-gray-400" />}
              endContent={isLoading && <Spinner size="sm" className="mr-2" />}
              value={typingValue}
              onChange={(e) => setTypingValue(e.target.value)}
            />
            {FiltersComponent}
            {SearchFile}
          </div>
          <div className="col-span-1 flex items-center gap-1">
            {TopContent}
            <Divider orientation="vertical" className="hidden lg:block h-6" />
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={
                    <div className="relative">
                      <Columns3Cog size={16} />
                      {visibleColumns !== 'all' &&
                        columns.some((col) => !Array.from(visibleColumns).includes(col.uid)) && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-1 ring-white" />
                        )}
                    </div>
                  }
                  variant="light"
                  isIconOnly
                />
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  setVisibleColumns(keys)
                }}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        {FilterBoxComponent}
        {RowActionComponent && <div>{RowActionComponent}</div>}
      </div>

      {/* Table */}
      <Table
        aria-label={title}
        shadow="sm"
        radius="none"
        layout="fixed"
        selectionMode="multiple"
        selectionBehavior="toggle"
        onSelectionChange={handleSelectionChange}
        selectedKeys={selectedIds}
        onRowAction={(key) => {
          const index = data.findIndex((row) => String(row[primaryKey]) === String(key))
          const selectedRow = data[index]
          setIndexRow?.(index)
          return onClickRow?.(selectedRow)
        }}
        isHeaderSticky
        classNames={{
          base: '[&>div]:p-0 [&>div]:gap-0 overflow-auto',
          thead: `[&_tr.w-px.h-px.block]:hidden [&_tr_th:not(:first-child)]:px-1 [&_tr_th]:bg-white [&>tr]:first:shadow-none [&_tr_th:first-child]:w-10`,
          table: 'shadow-sm'
        }}
      >
        {renderHeader()}
        <TableBody
          emptyContent={
            !isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 h-[260px]">
                <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <Inbox size={32} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Không tìm thấy dữ liệu</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              </div>
            ) : null
          }
          className="divide-y divide-slate-200 border border-slate-200"
        >
          {isLoading
            ? [...Array(8)].map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`} className="border-t border-slate-100">
                {columns
                  .filter((col) => visibleColumns === 'all' || Array.from(visibleColumns).includes(col.uid))
                  .map((col) => (
                    <TableCell
                      key={col.uid}
                      className={cn('p-3', col.className)}
                      width={columnWidths[col.uid]}
                    >
                      <Skeleton className="h-3 w-full rounded-md" />
                    </TableCell>
                  ))}
              </TableRow>
            ))
            : data.length > 0
              ? data.map((row, idx) => {
                  const isNotSee = row['da_xem'] === 0
                  const isSelected = selectedRow === row[primaryKey] || indexRow === idx
                  return (
                    <TableRow
                      key={String(row[primaryKey])}
                      className={cn(
                        'bg-[#f2f6fc] hover:bg-white transition-colors border-t border-slate-200 first:border-t-1 last:border group',
                        isSelected &&
                          'border border-blue-500 bg-linear-to-t from-white to-indigo-100 relative z-10',
                        isNotSee && notSee.className
                      )}
                      onContextMenu={(e) => onContextMenuRow?.(e, row)}
                    >
                      {columns
                        .filter(
                          (col) =>
                            visibleColumns === 'all' || Array.from(visibleColumns).includes(col.uid)
                        )
                        .map((col) => {
                          const val = getKeyValue(row, col.uid)
                          return (
                            <TableCell
                              key={col.uid}
                              className={cn(
                                'text-xs p-0.5 overflow-hidden text-ellipsis whitespace-nowrap',
                                col.className
                              )}
                              width={columnWidths[col.uid]}
                            >
                              {col.render?.(val, row) ?? val}
                            </TableCell>
                          )
                        })}
                    </TableRow>
                  )
                })
              : []}
        </TableBody>
      </Table>
    </div>
  )
}
