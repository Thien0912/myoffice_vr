import { Clock, Paperclip, RotateCcw, Search, Trash2 } from 'lucide-react'

import { Button, Chip, cn, Tooltip, toast } from '@heroui-v3/react'
import { useLayoutStore } from '@renderer/store/useLayoutStore'
import ListBoxWrapper from './components/ListBox/ListBoxWrapper'
import TableDocument from './components/table/TableDocument'

import { customDataApi } from '@renderer/api/callApi'
import { vanbandaxoaAxios } from '@renderer/api/documents/vanbandaxoaAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { useTableSort } from '@renderer/hooks/useTableSort'
import { useVanbandaxoaStore } from '@renderer/store/useVanbanStore'
import { STATUS_VBDEN_MAP } from '@renderer/utils/documents/statusVanban'
import { enscrypt } from '@renderer/utils/documents/userPreview'
import { date } from '@renderer/utils/formatDate'
import openPopout from '@renderer/utils/openPopout'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import BoxSearchFile from './components/BoxSearchFile'
import DrawerDocument from './components/drawer/DrawerDocument'
import FileChip from './components/table/FileChip'
import { PopupFilter } from './components/table/Filters/PopupFilter'
import { columnVanban } from './components/table/TableColumns'

const COLOR_MAP = {
    sky: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
    blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    orange:
        'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    amber:
        'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    green:
        'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    gray: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
}

export default function VanbandaxoaTheodonvi(): React.JSX.Element {
    const processingIdRef = useRef<string | number | null>(null)
    const { listBox, toggleListBox } = useLayoutStore()

    const { filters, setFilters, setStatisticals } = useVanbandaxoaStore()
    const [page, setPage] = useState(filters.page ?? 1)
    const [length, setlength] = useState(filters.length ?? 30)
    const [totalRecord, setTotalRecord] = useState(0)
    const [totalRecordFiltered, setTotalRecordFiltered] = useState(0)

    // Sync columns if missing or order is incorrect (handle persisted state issue)
    useEffect(() => {
        const hasNewColumn = filters.tableColumn?.some((col) => col.uid === 'ten_nguoi_xoa')
        const isFirstColumnCorrect = filters.tableColumn?.[0]?.uid === 'ten_nguoi_xoa'

        if (!hasNewColumn || !isFirstColumnCorrect) {
            setFilters({ tableColumn: columnVanban })
        }
    }, [filters.tableColumn, setFilters])

    const [indexRow, setIndexRow] = useState<number>(-1)

    useEffect(() => {
        setFilters({ page, length })
        setIndexRow(-1)
    }, [page, length])

    const [selectedRow, setSelectedRow] = useState<string | number>('')
    const [openDetail, setOpenDetail] = useState(false)
    const [openSearchFile, setOpenSearchFile] = useState(false)

    const [searchFile, setSearchFile] = useState('')
    const [filterFile, setFilterFile] = useState({
        fileType: '',
        author: '',
        date: null as { start: string; end: string } | null
    })

    // Sort logic
    const { initialSortDescriptors, handleSortChange } = useTableSort({
        orders: filters.orders,
        setFilters
    })

    const {
        data: vanbandaxoaData,
        isLoading: vanbandaxoaIsLoading,
        isFetching: vanbandaxoaIsFetching,
        refetch: vanbandaxoaRefetch
    } = useQuery({
        queryKey: ['vanbandaxoa', filters],
        queryFn: () => {
            return vanbandaxoaAxios.fetch(customDataApi(filters)).then((response) => {
                setTotalRecord(response.recordsTotal || 0)
                setTotalRecordFiltered(response.recordsFiltered || 0)

                if (response.thoi_han) {
                    setStatisticals([
                        { classify: 'all', count: response.thoi_han.all || 0 },
                        { classify: 'van_ban_den', count: response.thoi_han.van_ban_den || 0 },
                        { classify: 'van_ban_di', count: response.thoi_han.van_ban_di || 0 },
                        { classify: 'van_ban_noi_bo', count: response.thoi_han.van_ban_noi_bo || 0 },
                        { classify: 'hom_nay', count: response.thoi_han.hom_nay || 0 },
                        { classify: '7_ngay_qua', count: response.thoi_han['7_ngay_qua'] || 0 },
                        { classify: 'truoc_do', count: response.thoi_han.truoc_do || 0 }
                    ])
                }

                return (
                    response.data?.map((item: any) => ({
                        ...item,
                        da_xem: 1
                    })) || []
                )
            })
        }
    })

    // Search Files Infinite Query
    const {
        data: dataFiles,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch: refetchFiles
    } = useInfiniteQuery({
        queryKey: ['files-trash', searchFile, filterFile],
        initialPageParam: 1,
        queryFn: ({ pageParam = 1 }) =>
            vanbandaxoaAxios
                .files({
                    page: pageParam,
                    limit: 20,
                    search: searchFile,
                    fileType: filterFile.fileType,
                    author: filterFile.author,
                    date: filterFile.date
                })
                .then((res) => {
                    const files = Array.isArray(res.data) ? res.data : res.data?.data || []
                    return files
                }),
        getNextPageParam: (lastPage, pages) => (lastPage?.length ? pages.length + 1 : undefined)
    })

    const allFiles = dataFiles?.pages.flat() || []

    useEffect(() => {
        const timeout = setTimeout(() => {
            refetchFiles()
        }, 300)
        return () => clearTimeout(timeout)
    }, [searchFile, filterFile])

    const {
        data: detailData,
        isLoading: detailIsLoading,
        isFetching: detailIsFetching
    } = useQuery({
        queryKey: ['vanbandadonvi-detail', selectedRow],
        enabled: !!selectedRow && openDetail,
        queryFn: () => vanbandaxoaAxios.show(selectedRow).then((res) => res.data)
    })

    const onClickRow = (row: any) => {
        const id = row['id_van_ban'] as string | number
        setOpenDetail(true)
        setSelectedRow(id)
        processingIdRef.current = id
        const idx = vanbandaxoaData?.findIndex((r: any) => r.id_van_ban === id) ?? -1
        if (idx !== -1) setIndexRow(idx)
    }

    // Preview file
    const handlePreview = async (url: string, name: string): Promise<void> => {
        const link = await enscrypt(url, name)
        if (link) {
            openPopout(link, name)
        }
    }

    const handleRestore = useCallback(
        (id: string | number) => {
            vanbandaxoaAxios
                .restore(id)
                .then(() => {
                    toast(`Khôi phục văn bản thành công`, { variant: 'success' })
                    vanbandaxoaRefetch()
                })
                .catch((err) => {
                    toast(`Lỗi khôi phục: ${err}`, { variant: 'danger' })
                })
        },
        [vanbandaxoaRefetch]
    )

    const [deleteId, setDeleteId] = useState<string | number | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeletePermanently = useCallback((id: string | number) => {
        setDeleteId(id)
        setIsConfirmOpen(true)
    }, [])

    const onConfirmDelete = async () => {
        if (!deleteId) return

        setIsDeleting(true)
        try {
            await vanbandaxoaAxios.deletePermanently(deleteId)
            toast('Xóa vĩnh viễn văn bản thành công', { variant: 'success' })
            vanbandaxoaRefetch()
            setIsConfirmOpen(false)
        } catch (error) {
            toast(`Lỗi xóa vĩnh viễn: ${error}`, { variant: 'danger' })
        } finally {
            setIsDeleting(false)
        }
    }

    const customColumns = filters.tableColumn.map((col) => {
        switch (col.uid) {
            case 'ten_nguoi_xoa':
                return {
                    ...col,
                    className: 'w-22 hidden lg:table-cell',
                    render: (value: any, row: any) => (
                        <div className="text-zinc-500 dark:text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap w-30">
                            {value}
                            <div>
                                <small>{row.email_nguoi_xoa}</small>
                            </div>
                        </div>
                    )
                }

            case 'so_van_ban':
                return {
                    ...col,
                    className: 'w-18 hidden lg:table-cell',
                    render: (value: any) => (
                        <div className="text-zinc-600 dark:text-zinc-300 pl-3">{value}</div>
                    )
                }

            case 'so_hieu_van_ban':
                return {
                    ...col,
                    className: 'w-5 hidden lg:table-cell',
                    render: (value: any) => (
                        <div className="text-zinc-600 dark:text-zinc-300 truncate overflow-hidden text-ellipsis whitespace-nowrap w-28">
                            {value}
                        </div>
                    )
                }

            case 'trang_thai':
                return {
                    ...col,
                    className: 'w-28 text-center hidden lg:table-cell',
                    render: (value: any) => {
                        const matchedStatus = Object.values(STATUS_VBDEN_MAP).find(
                            (status) => status.value === Number(value)
                        )
                        const status = matchedStatus || { label: 'Không xác định', color: 'gray', value: 0 }
                        return (
                            <Chip
                                size="sm"
                                variant="soft"
                                className={`text-xs font-medium ${COLOR_MAP[status.color] || COLOR_MAP.gray}`}
                            >
                                {status.label}
                            </Chip>
                        )
                    }
                }

            case 'trich_yeu':
                return {
                    ...col,
                    render: (value: any, row: any) => (
                        <div className="flex justify-between gap-2 items-center p-0.5 pr-3">
                            <div className="flex flex-col grow">
                                <span className="line-clamp-1 mb-0.5 text-gray-700 dark:text-gray-200 select-text! cursor-text">
                                    {value}
                                </span>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    {row.thoi_gian_xu_ly &&
                                        (() => {
                                            const now = new Date()
                                            now.setHours(0, 0, 0, 0)
                                            const deadline = new Date(row.thoi_gian_xu_ly)
                                            deadline.setHours(0, 0, 0, 0)
                                            const diffTime = deadline.getTime() - now.getTime()
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                                            let colorClass = ''
                                            if (diffDays < 0) {
                                                colorClass =
                                                    'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                            } else if (diffDays === 0) {
                                                colorClass =
                                                    'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                            } else if (diffDays <= 5) {
                                                colorClass =
                                                    'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                            } else {
                                                colorClass =
                                                    'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                            }

                                            return (
                                                <div
                                                    className={cn(
                                                        'flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-sm border',
                                                        colorClass
                                                    )}
                                                >
                                                    <Clock size={12} />
                                                    <span>Hạn xử lý: {date('vi', row.thoi_gian_xu_ly)}</span>
                                                </div>
                                            )
                                        })()}
                                    {row.files?.length > 0 && (
                                        <FileChip files={row.files} onClickRow={() => onClickRow(row)} />
                                    )}
                                </div>
                            </div>
                            <ActionRowTrash
                                row={row}
                                onRestore={handleRestore}
                                onDeletePermanently={handleDeletePermanently}
                            />
                        </div>
                    )
                }

            default:
                return col
        }
    })

    return (
        <div className="space-y-2">
            <div className="lg:flex gap-0">
                <div className="">
                    {/* Mobile floating button */}
                    <div className="block xl:hidden">
                        <Button
                            isIconOnly
                            variant="primary"
                            className="rounded-full fixed z-10 right-4 bottom-7 shadow-lg w-15 h-15"
                            onPress={toggleListBox}
                        >
                            <Search />
                        </Button>
                    </div>
                    {/* Mobile backdrop */}
                    <div
                        className={`fixed xl:hidden top-0 left-0 right-0 bottom-0 bg-gray-500/50 dark:bg-gray-900/50 z-20 ${listBox ? 'block' : 'hidden'}`}
                        onClick={toggleListBox}
                    ></div>
                    <ListBoxWrapper open={listBox} onOpenCompose={() => { }} />
                </div>

                <div className="lg:flex-1 space-y-3">
                    <TableDocument
                        title="Thùng rác văn bản"
                        primaryKey="id_van_ban"
                        FiltersComponent={<PopupFilter />}
                        SearchFile={
                            <InputSearchFile
                                openSearchFile={openSearchFile}
                                setOpenSearchFile={setOpenSearchFile}
                            />
                        }
                        columns={customColumns}
                        initVisibleColumns={filters.initial_visible_columns}
                        data={vanbandaxoaData || []}
                        isLoading={vanbandaxoaIsLoading || vanbandaxoaIsFetching}
                        totalRecord={totalRecord}
                        totalRecordFiltered={totalRecordFiltered}
                        page={page}
                        onPageChange={setPage}
                        length={length}
                        setlength={setlength}
                        onClickRow={onClickRow}
                        selectedRow={selectedRow}
                        onSortChange={handleSortChange}
                        initialSortDescriptors={initialSortDescriptors}
                        indexRow={indexRow}
                        setIndexRow={setIndexRow}
                    />
                </div>

                {openSearchFile && (
                    <div className="lg:min-w-sm">
                        <BoxSearchFile
                            data={allFiles}
                            onLoadMore={fetchNextPage}
                            hasMore={!!hasNextPage}
                            isFetchingNextPage={isFetchingNextPage}
                            setSearchFile={setSearchFile}
                            searchFile={searchFile}
                            setFilterFile={setFilterFile}
                        />
                    </div>
                )}
            </div>

            <DrawerDocument
                open={openDetail}
                isLoading={detailIsLoading || detailIsFetching}
                onClose={() => setOpenDetail(false)}
                data={detailData}
                indexRow={indexRow}
                setIndexRow={setIndexRow}
            />
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={onConfirmDelete}
                title="Xóa vĩnh viễn văn bản"
                content="Bạn có chắc chắn muốn xóa vĩnh viễn văn bản này không? Hành động này không thể hoàn tác."
                isDanger={true}
                isLoading={isDeleting}
            />
        </div>
    )
}

function ActionRowTrash({
    row,
    onRestore,
    onDeletePermanently
}: {
    row: any
    onRestore: (id: string | number) => void
    onDeletePermanently: (id: string | number) => void
}) {
    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                    <Button
                        isIconOnly
                        className="rounded-full text-blue-500"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation()
                            onRestore(row.id_van_ban)
                        }}
                    >
                        <RotateCcw size={14} />
                    </Button>
                    <Tooltip.Content className="capitalize bg-slate-100 rounded-none px-2 py-1 text-xs text-gray-700">Khôi phục</Tooltip.Content>
                </Tooltip>
                <Tooltip>
                    <Button
                        isIconOnly
                        className="rounded-full text-danger"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDeletePermanently(row.id_van_ban)
                        }}
                    >
                        <Trash2 size={14} />
                    </Button>
                    <Tooltip.Content className="capitalize bg-slate-100 rounded-none px-2 py-1 text-xs text-gray-700">Xóa vĩnh viễn</Tooltip.Content>
                </Tooltip>
            </div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] truncate">
                {date('vi', row.deleted_at as string)}
            </span>
            {row.files?.length > 0 && <Paperclip className="size-3 text-slate-400 dark:text-slate-500" />}
        </div>
    )
}

function InputSearchFile({
    openSearchFile,
    setOpenSearchFile
}: {
    openSearchFile: boolean
    setOpenSearchFile: (value: boolean) => void
}) {
    return null
}
