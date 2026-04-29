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
  Spinner,
  Chip,
  User
} from '@heroui/react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Columns3Cog,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  MoreVertical,
  RotateCcw
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useLayoutStore } from '@renderer/store/useLayoutStore'
import { capitalize } from '@renderer/utils/string'
import { useNhansuStore } from '@renderer/store/useNhansuStore'
import { useResizableColumns } from '@renderer/hooks/useResizableColumns'

interface TableColumnType<T = unknown> {
  uid: string
  name: string
  className?: string
  render?: (value: unknown, row?: T) => React.ReactNode
  sort?: boolean
}

interface TableNhansuProps<T extends Record<string, unknown>> {
  title?: string
  primaryKey: keyof T
  columns: Array<TableColumnType<T>>
  toggleColumns?: Array<TableColumnType<T>>
  FiltersComponent?: React.JSX.Element
  FilterBoxComponent?: React.JSX.Element
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

const statusColorMap = {
  DANG_LAM_VIEC: 'success',
  NGHI_VIEC: 'danger',
  NGHI_PHEP: 'warning'
}

export default function TableNhansu<T extends Record<string, unknown>>({
  title,
  primaryKey,
  columns,
  toggleColumns,
  FiltersComponent,
  FilterBoxComponent,
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
  initialSortDescriptors = [],
  indexRow,
  setIndexRow
}: TableNhansuProps<T>) {
  const { ScrollValue } = useLayoutStore()
  void totalRecord
  void setlength
  const [isScrolling, setIsScrolling] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(initVisibleColumns))
  const [typingValue, setTypingValue] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<Set<React.Key>>(new Set([]))
  const [isEditing, setIsEditing] = useState(false)
  const { filters, setFilters } = useNhansuStore()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Use toggleColumns for dropdown menu, fallback to columns if not provided
  const columnsForToggle = toggleColumns || columns

  // Initialize resizable columns
  const { columnWidths, resizingColumn, handleMouseDown, resetWidths } = useResizableColumns({
    columns,
    defaultWidth: 150,
    minWidth: 80,
    storageKey: 'nhansu-table-column-widths',
    initialWidths: {
      ma_nhan_vien: 120,
      ho_va_ten: 250,
      ten_don_vi: 200,
      ngay_sinh: 120,
      ngay_lam_chinh_thuc: 140,
      so_dien_thoai: 130,
      mst_ca_nhan: 130,
      id: 80,
      trang_thai: 140,
      nganh_dt: 200
    }
  })

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

  // 👑 Search debounce with useRef to prevent re-renders
  const handleSearchDebounce = useCallback(
    (value: string) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }

      if (value === '') {
        setFilters({ searchValue: '' })
        return
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        setFilters({ searchValue: value })
        debounceTimerRef.current = null
      }, 500)
    },
    [setFilters]
  )

  useEffect(() => {
    handleSearchDebounce(typingValue)

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [typingValue, handleSearchDebounce])

  useEffect(() => {
    if (filters.searchValue) {
      setTypingValue(filters.searchValue)
    }
  }, [])

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
            className={col.className}
            style={{ width: columnWidths[col.uid] || 150, minWidth: 80 }}
            aria-sort={
              col.sort
                ? (sortDescriptors.find((item) => item.column === col.uid)?.direction ?? 'none')
                : 'none'
            }
          >
            <div className="flex items-center justify-between gap-1 relative group">
              {col.sort ? (
                <button
                  type="button"
                  className="flex items-center gap-1 cursor-pointer select-none flex-1"
                  onClick={() => handleColumnSort(col)}
                >
                  {col.name}
                  {(() => {
                    const descriptor = sortDescriptors.find((item) => item.column === col.uid)
                    if (!descriptor)
                      return (
                        <span className="relative w-5 h-5 inline-flex items-center justify-center text-gray-300">
                          <ArrowDownNarrowWide size={14} className="opacity-0" />
                        </span>
                      )

                    const isAsc = descriptor.direction === 'ascending'
                    return (
                      <span className="relative w-5 h-5 inline-flex items-center justify-center overflow-hidden">
                        <span
                          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isAsc ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
                        >
                          <ArrowUpNarrowWide size={14} className="text-blue-500" />
                        </span>
                        <span
                          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isAsc ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
                        >
                          <ArrowDownNarrowWide size={14} className="text-blue-500" />
                        </span>
                      </span>
                    )
                  })()}
                </button>
              ) : (
                <div className="flex items-center gap-1 text-left select-none flex-1">
                  {col.name}
                </div>
              )}

              {/* Resize handle */}
              <div
                className={cn(
                  'absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors',
                  resizingColumn === col.uid && 'bg-blue-500'
                )}
                onMouseDown={(e) => handleMouseDown(col.uid, e)}
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
        className={`py-2 px-2 space-y-3 sticky top-0 z-1 bg-white ${isScrolling ? 'shadow-md border-b border-gray-200' : 'shadow-none'}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="col-span-1 flex items-center gap-2">
            <Input
              isClearable
              className="w-full lg:max-w-md"
              placeholder="Tìm theo mã nhân viên, họ tên, email..."
              size="md"
              startContent={<Search strokeWidth={1.5} className="text-gray-400" />}
              endContent={isLoading && <Spinner size="sm" className="mr-2" />}
              value={typingValue}
              onChange={(e) => setTypingValue(e.target.value)}
            />
            {FiltersComponent}
          </div>
          <div className="col-span-1 flex items-center gap-1">
            {TopContent}
            <Divider orientation="vertical" className="hidden lg:block h-6" />

            {/* Page Size Dropdown */}
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button variant="light" size="sm" className="px-2 min-w-unit-12">
                  {length} dòng
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Page Size"
                selectedKeys={new Set([String(length)])}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const newLength = Number([...keys][0])
                  setlength?.(newLength)
                  setFilters({
                    ...filters,
                    length: newLength
                  })
                }}
              >
                <DropdownItem key="5">5 dòng</DropdownItem>
                <DropdownItem key="10">10 dòng</DropdownItem>
                <DropdownItem key="20">20 dòng</DropdownItem>
                <DropdownItem key="30">30 dòng</DropdownItem>
                <DropdownItem key="50">50 dòng</DropdownItem>
                <DropdownItem key="100">100 dòng</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={
                    <div className="relative">
                      <Columns3Cog size={16} />
                      {visibleColumns !== 'all' &&
                        columnsForToggle.some(
                          (col) => !Array.from(visibleColumns).includes(col.uid)
                        ) && (
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
                  // Only update store without triggering API reload
                  const { filters: currentFilters, setFilters: updateFilters } =
                    useNhansuStore.getState()
                  updateFilters({
                    ...currentFilters,
                    initial_visible_columns: Array.from(keys).map(String)
                  })
                }}
              >
                {columnsForToggle.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {/* Reset column widths button */}
            <Button
              variant="light"
              size="sm"
              isIconOnly
              onPress={resetWidths}
              title="Reset độ rộng cột"
              className="hidden sm:flex"
            >
              <RotateCcw size={16} />
            </Button>
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
        layout="auto"
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
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
          emptyContent="Không tìm thấy dữ liệu."
          className="divide-y divide-slate-200 border border-slate-200"
        >
          {data.length > 0
            ? data.map((row, idx) => {
                const isSelected = selectedRow === row[primaryKey] || indexRow === idx
                return (
                  <TableRow
                    key={String(row[primaryKey])}
                    className={cn(
                      'bg-[#f2f6fc] hover:bg-white transition-colors border-t border-slate-200 first:border-t-1 last:border group',
                      isSelected &&
                        'border border-blue-500 bg-linear-to-t from-white to-indigo-100 relative z-10'
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
                            className={cn('text-xs p-0.5', col.className)}
                            style={{ width: columnWidths[col.uid] || 150, minWidth: 80 }}
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
