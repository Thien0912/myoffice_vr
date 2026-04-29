/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
import {
    Button,
    ButtonGroup,
    Checkbox,
    cn,
    InputGroup,
    Selection,
    Separator,
    Skeleton,
    Spinner,
    Table,
    TextField,
} from '@heroui-v3/react'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import { useLayoutStore } from '@renderer/store/useLayoutStore'
import { useCurrentStore } from '@renderer/utils/useCurrentStore'
import {
    ArrowDownNarrowWide,
    ArrowUpNarrowWide,
    ChevronLeft,
    ChevronRight,
    Search,
    Inbox
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

const notSee = { className: 'bg-white dark:bg-[#202124] [&_td]:font-semibold text-gray-900 dark:text-white' }

interface TableColumnType<T = unknown> {
    uid: string
    name: string
    className?: string
    render?: (value: unknown, row?: T) => React.ReactNode
    sort?: boolean
}

interface TableDocumentProps<T extends Record<string, unknown>> {
    title?: string
    primaryKey: keyof T
    columns: Array<TableColumnType<T>>
    FiltersComponent?: React.JSX.Element
    FilterBoxComponent?: React.JSX.Element
    LeftFilterComponent?: React.JSX.Element
    SearchFile?: React.JSX.Element
    DataIO?: React.JSX.Element
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
    hasSeenStatus?: boolean
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

export default function TableDocument<T extends Record<string, unknown>>({
    title,
    primaryKey,
    columns,
    FiltersComponent,
    FilterBoxComponent,
    LeftFilterComponent,
    SearchFile,
    DataIO,
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
    hasSeenStatus = false,
    selectedIds,
    onSortChange,
    initialSortDescriptors = [],
    indexRow,
    setIndexRow
}: TableDocumentProps<T>) {
    const { ScrollValue } = useLayoutStore()
    void totalRecord
    void setlength
    const [isScrolling, setIsScrolling] = useState(false)
    const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(initVisibleColumns))
    const [typingValue, setTypingValue] = useState('')
    const [selectedKeys, setSelectedKeys] = useState<Set<React.Key>>(new Set([]))
    const [isEditing, setIsEditing] = useState(false)
    const { filters, setFilters } = useCurrentStore()

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
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        Hiển thị {length} / {totalRecordFiltered} dòng
                    </div>
                    {totalRecordFiltered > 1 && (
                        <ButtonGroup variant="ghost" size="sm" className="items-center">
                            <Button isIconOnly onPress={handlePrev} isDisabled={page === 1} variant="ghost">
                                <ChevronLeft size={18} strokeWidth={1.5} />
                            </Button>
                            {isEditing ? (
                                <TextField
                                    value={String(page)}
                                    onChange={(v) => {
                                        const num = Number(v)
                                        if (num >= 1 && num <= totalRecordFiltered) onPageChange?.(num)
                                    }}
                                    className="w-[110px]"
                                >
                                    <InputGroup>
                                        <InputGroup.Input
                                            type="number"
                                            autoFocus
                                            onBlur={() => setIsEditing(false)}
                                            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                                            className="text-center text-sm py-0 w-[110px]"
                                            min={1}
                                            max={totalRecordFiltered}
                                        />
                                    </InputGroup>
                                </TextField>
                            ) : (
                                <Button
                                    variant="ghost"
                                    className="px-3 cursor-pointer"
                                    onPress={() => setIsEditing(true)}
                                >
                                    Trang {page} / {totalPages}
                                </Button>
                            )}
                            <Button isIconOnly onPress={handleNext} isDisabled={page === totalPages} variant="ghost">
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
        const timer = setTimeout(() => setFilters({ searchValue: typingValue }), 500)
        return () => clearTimeout(timer)
    }, [typingValue])
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



    return (
        <div>
            {/* Top filter + search */}
            <div
                className={`pt-4 pb-2 pr-4 space-y-3 bg-white sticky top-0 z-20 ${isScrolling ? 'shadow-md border-b border-gray-200 dark:border-gray-700' : 'shadow-none'}`}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="col-span-1 flex items-center gap-2">
                        <div className="w-full lg:w-[600px] flex gap-2">
                            {LeftFilterComponent}
                            <TextField aria-label="Tìm kiếm" className="w-full flex-1 flex gap-2" value={typingValue} onChange={setTypingValue}>
                                <InputGroup className="h-11">
                                    <InputGroup.Prefix>
                                        <Search size={22} className="text-gray-400" />
                                    </InputGroup.Prefix>
                                    <InputGroup.Input placeholder="Tìm theo số hiệu, số đến, trích yếu..." className="w-full px-2 outline-none text-[15px]" />
                                    <InputGroup.Suffix>
                                        <div className="flex gap-1 items-center">
                                            {isLoading && <Spinner size="sm" />}
                                            {FiltersComponent}
                                        </div>
                                    </InputGroup.Suffix>
                                </InputGroup>
                            </TextField>
                            {SearchFile}
                            {FilterBoxComponent}

                            {DataIO ?? DataIO}
                        </div>
                    </div>
                    <div className="col-span-1 flex items-center gap-1">
                        {TopContent}
                        <Separator orientation="vertical" className="hidden lg:block h-6" />
                        <div className="hidden sm:flex">
                            <TableColumnVisibility
                                columns={columns.filter((col) => col.name !== '')}
                                visibleColumns={visibleColumns as Set<string>}
                                setVisibleColumns={(keys) => {
                                    setVisibleColumns(keys)
                                    setFilters({
                                        ...filters,
                                        initial_visible_columns: Array.from(keys).map(String)
                                    })
                                }}
                                label="Cột"
                            />
                        </div>
                    </div>
                </div>
                {RowActionComponent && <div>{RowActionComponent}</div>}
            </div>

            {/* Table */}
            <Table aria-label={title}>
                <Table.ScrollContainer className="[&>div]:p-0 [&>div]:gap-0 overflow-auto border-y border-gray-200 dark:border-gray-700">
                    <Table.Content
                        aria-label={title}
                        className="min-w-full"
                        selectionMode="multiple"
                        selectionBehavior="toggle"
                        onSelectionChange={handleSelectionChange}
                        selectedKeys={selectedIds as any}
                    >
                        <Table.Header>
                            <Table.Column className="pr-0 w-10 text-center" key="selection">
                                <Checkbox aria-label="Select all" slot="selection">
                                    <Checkbox.Control>
                                        <Checkbox.Indicator />
                                    </Checkbox.Control>
                                </Checkbox>
                            </Table.Column>
                            {columns
                                .filter((col) => !col.name || visibleColumns === 'all' || Array.from(visibleColumns).includes(col.uid))
                                .map((col, index) => (
                                    <Table.Column
                                        key={col.uid}
                                        className={col.className}
                                        isRowHeader={index === 0}
                                    >
                                        {col.sort ? (
                                            <button
                                                type="button"
                                                className="flex items-center gap-1 cursor-pointer select-none"
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
                                            <div className="flex items-center gap-1 text-left select-none">{col.name}</div>
                                        )}
                                    </Table.Column>
                                ))}
                        </Table.Header>
                        <Table.Body
                            renderEmptyState={() => (
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
                            )}
                        >
                            {isLoading
                                ? [...Array(8)].map((_, rowIndex) => (
                                    <Table.Row key={`skeleton-${rowIndex}`} className="border-t border-slate-100 dark:border-slate-800">
                                        <Table.Cell className="w-10 pr-0">
                                            <Skeleton className="h-4 w-4 rounded mx-auto" />
                                        </Table.Cell>
                                        {columns
                                            .filter((col) => !col.name || visibleColumns === 'all' || Array.from(visibleColumns).includes(col.uid))
                                            .map((col) => (
                                                <Table.Cell key={col.uid} className={cn('px-2 py-3', col.className)}>
                                                    <Skeleton className="h-3 w-full rounded-md" />
                                                </Table.Cell>
                                            ))}
                                    </Table.Row>
                                ))
                                : data.length > 0
                                ? data.map((row, idx) => {
                                    const isNotSee = hasSeenStatus ? Number(row['da_xem']) === 0 : false
                                    const isSeen = hasSeenStatus ? Number(row['da_xem']) !== 0 : false
                                    const isSelected = selectedRow === row[primaryKey] || indexRow === idx
                                    return (
                                        <Table.Row
                                            key={String(row[primaryKey])}
                                            id={String(row[primaryKey])}
                                            className={cn(
                                                'transition-colors border-t border-slate-200 dark:border-slate-700 first:border-t-1 last:border group',
                                                isSelected && '!bg-blue-100 dark:!bg-blue-900/50 relative z-10'
                                            )}
                                            onContextMenu={(e) => onContextMenuRow?.(e, row)}
                                        >
                                            <Table.Cell className={cn(
                                                "pr-0 w-10 text-center relative transition-colors",
                                                isSelected
                                                    ? "!bg-blue-50 dark:!bg-blue-900/30 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-blue-600 dark:before:bg-blue-400"
                                                    : isNotSee
                                                        ? "!bg-white dark:!bg-[#1a1b1e] group-hover:!bg-slate-50 dark:group-hover:!bg-[#202124] text-black dark:text-white"
                                                        : isSeen
                                                            ? "!bg-slate-100 dark:!bg-slate-800/80 text-gray-500 dark:text-gray-400 group-hover:!bg-slate-200 dark:group-hover:!bg-slate-800"
                                                            : "!bg-white dark:!bg-[#1a1b1e] group-hover:!bg-slate-50 dark:group-hover:!bg-[#202124]"
                                            )}>
                                                <Checkbox aria-label="Select row" slot="selection">
                                                    <Checkbox.Control>
                                                        <Checkbox.Indicator />
                                                    </Checkbox.Control>
                                                </Checkbox>
                                            </Table.Cell>
                                            {columns
                                                .filter(
                                                    (col) =>
                                                        !col.name || visibleColumns === 'all' || Array.from(visibleColumns).includes(col.uid)
                                                )
                                                .map((col) => {
                                                    const val = row[col.uid as keyof typeof row]
                                                    return (
                                                        <Table.Cell
                                                            key={col.uid}
                                                            className={cn(
                                                                'text-xs px-2 py-3 align-top transition-colors',
                                                                onClickRow ? 'cursor-pointer' : 'cursor-default',
                                                                col.className,
                                                                isSelected
                                                                    ? "!bg-blue-50 dark:!bg-blue-900/30"
                                                                    : isNotSee
                                                                        ? "!bg-white dark:!bg-[#1a1b1e] group-hover:!bg-slate-50 dark:group-hover:!bg-[#202124] font-semibold text-black dark:text-white"
                                                                        : isSeen
                                                                            ? "!bg-slate-100 dark:!bg-slate-800/80 text-gray-500 dark:text-gray-400 group-hover:!bg-slate-200 dark:group-hover:!bg-slate-800"
                                                                            : "!bg-white dark:!bg-[#1a1b1e] group-hover:!bg-slate-50 dark:group-hover:!bg-[#202124]"
                                                            )}
                                                            onPointerDown={(e) => {
                                                                e.stopPropagation()
                                                                if (e.nativeEvent) e.nativeEvent.stopPropagation()
                                                            }}
                                                            onClick={(e) => {
                                                                if (!onClickRow) return
                                                                e.stopPropagation()
                                                                if (e.nativeEvent) e.nativeEvent.stopPropagation()
                                                                setIndexRow?.(idx)
                                                                onClickRow?.(row)
                                                            }}
                                                        >
                                                            <div className="min-w-0 break-words">
                                                                {col.render?.(val, row) ?? (val !== undefined && val !== null ? String(val) : null)}
                                                            </div>
                                                        </Table.Cell>
                                                    )
                                                })}
                                        </Table.Row>
                                    )
                                })
                                : []}
                        </Table.Body>
                    </Table.Content>
                </Table.ScrollContainer>
            </Table>
        </div>
    )
}
