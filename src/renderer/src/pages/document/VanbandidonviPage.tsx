import { AlertDialog, Button, Chip, Tooltip, cn, toast } from '@heroui-v3/react'
import { customDataApi } from '@renderer/api/callApi'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { useTableSort } from '@renderer/hooks/useTableSort'
import { ExistingFile } from '@renderer/shared/CommonInterface'
import { useLayoutStore } from '@renderer/store/useLayoutStore'
import { useVanbandidonviStore } from '@renderer/store/useVanbanStore'
import { enscrypt } from '@renderer/utils/documents/userPreview'
import { date } from '@renderer/utils/formatDate'
import openPopout from '@renderer/utils/openPopout'
import { truncateMiddle } from '@renderer/utils/string'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Delete, Paperclip, Pencil, Plus, Trash2 } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { vanbandidonviAxios } from '../../api/documents/vanbandidonviAxios'
import { STATUS_VBDI_MAP } from '../../utils/documents/statusVanban'
import DrawerDocument from './components/drawer/DrawerDocument'
import FormVanbandidonvi from './components/form/FormVanbandidonvi'
import ListBoxWrapper from './components/ListBox/ListBoxWrapper'
import ModalCompose from './components/modal/ModalCompose'
import { PopupFilter } from './components/table/Filters/PopupFilter'
import RowActionCheckbox from './components/table/RowActionCheckbox'
import TableDocument from './components/table/TableDocument'

import { useComposeStore } from '@renderer/store/useComposeStore'

const COLOR_MAP = {
    teal: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
    blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    yellow:
        'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    green:
        'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    brown:
        'bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800', // dùng amber gần giống brown vì tw không có màu brown
    gray: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
}

export default function VanbandidonviPage(): React.JSX.Element {
    const queryClient = useQueryClient()
    const { listBox, toggleListBox } = useLayoutStore()
    const location = useLocation()

    const { filters, setFilters, setCreate, setStatisticals } = useVanbandidonviStore()
    const [page, setPage] = useState(filters.page ?? 1)
    const [length, setlength] = useState(filters.length ?? 10)
    const [totalRecord, setTotalRecord] = useState(0)
    const [totalRecordFiltered, setTotalRecordFiltered] = useState(0)
    const [editingId, setEditingId] = useState<string | number | null>(null)
    const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])
    const [existingFilesInternal, setExistingFilesInternal] = useState<ExistingFile[]>([])
    const [indexRow, setIndexRow] = useState<number>(-1)

    const [selectedRow, setSelectedRow] = useState<string | number>('')

    // Search văn bản đến
    const onSearchChange = (value: string): void => {
        setFilters({ searchValue: value, page: 1 })
    }
    // Cập nhật lại filter khi page hoặc length thay đổi
    useEffect(() => {
        setFilters({ page, length })
        setIndexRow(-1)
    }, [page, length])

    const [openDetail, setOpenDetail] = useState(false)
    const { onOpen: onOpenComposeGlobal } = useComposeStore()

    // Auto open Create Modal if passed in navigation state
    useEffect(() => {
        if (location.state && (location.state as any).openCreateModal) {
            onOpenComposeGlobal('vanbandidonvi')
            // Clear the state
            window.history.replaceState({}, document.title)
        }
    }, [location.state])
    const [isOpenComposeEdit, setIsOpenComposeEdit] = useState(false)
    const onOpenComposeEdit = () => setIsOpenComposeEdit(true)
    const onCloseComposeEdit = () => setIsOpenComposeEdit(false)

    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
    const [idsToDelete, setIdsToDelete] = useState<(string | number) | (string | number)[] | null>(
        null
    )
    const [isDeleting, setIsDeleting] = useState(false)

    const [isOpenDelete, setIsOpenDelete] = useState(false)
    const onOpenDelete = () => setIsOpenDelete(true)
    const onCloseDelete = () => setIsOpenDelete(false)

    //handle selectedids
    const handleSelectedIds = useCallback((ids: Set<string | number>) => {
        setSelectedIds(ids)
    }, [])

    //Sort
    const { initialSortDescriptors, handleSortChange } = useTableSort({
        orders: filters.orders,
        setFilters
    })

    // Quản lý dữ liệu từ form trong modal
    const [formData, setFormData] = useState<Record<string, object>>({})
    // Quản lý file từ form con
    const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({})
    const onFilesChange = (name: string, files: File[]) => {
        const oldFiles = fileGroups[name] || []
        const deletedFiles = oldFiles.filter(
            (old) => !files.some((f) => f.name === old.name && f.size === old.size)
        )

        if (deletedFiles.length > 0) {
            console.log(
                'File đã bị xóa: ',
                deletedFiles.map((f) => f.name)
            )

            const deletedFileNames = deletedFiles.map((f) => f.name)

            // Duyệt tất cả key trong formData (files, files_tchc, file_ban_hanh_old…)
            const listFileOldName = ['file_ban_hanh_old', 'file_noi_bo_old']
            Object.keys(formData).forEach((key) => {
                if (!listFileOldName.includes(key)) return

                const value = formData[key]
                if (Array.isArray(value)) {
                    // Tìm file trong từng mảng của formData
                    const matched = value.filter((item) => deletedFileNames.includes(item.ten_file_goc))

                    const notMatched = value.filter((item) => !deletedFileNames.includes(item.ten_file_goc))

                    if (matched.length > 0) {
                        // console.log(`🔥 FormData.${key} có file tương ứng bị xoá:`, matched)
                    }

                    if (notMatched.length > 0) {
                        // console.log(`🔥 FormData.${key} có file tương ứng còn lại`, notMatched)
                        setFormData((p) => ({ ...p, [key]: notMatched }))
                    }
                }
            })
        }

        setFileGroups((p) => ({ ...p, [name]: files }))
    }

    // Preview file
    const handlePreview = async (url: string, name: string): Promise<void> => {
        const link = await enscrypt(url, name)
        if (link) {
            openPopout(link, name)
        }
    }

    const convertSize = (str: string) => {
        const [num, unit] = str.split(' ')
        const n = parseFloat(num)
        if (unit === 'KB') return n * 1024
        if (unit === 'MB') return n * 1024 * 1024
        return n
    }

    const guessMimeType = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase()
        switch (ext) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg'
            case 'png':
                return 'image/png'
            case 'pdf':
                return 'application/pdf'
            case 'doc':
            case 'docx':
                return 'application/msword'
            case 'xlsx':
            case 'xls':
                return 'application/vnd.ms-excel'
            default:
                return 'application/octet-stream'
        }
    }

    const handleDelete = (ids: (string | number) | (string | number)[]) => {
        setIdsToDelete(Array.isArray(ids) ? ids : [ids])
        onOpenDelete()
    }

    const confirmDelete = async () => {
        if (!idsToDelete) return
        setIsDeleting(true)
        const payload = Array.isArray(idsToDelete) ? idsToDelete : [idsToDelete]
        await vanbandidonviAxios
            .moveToTrash({ ids: payload })
            .then((response) => {
                if (response.status === 200) {
                    vanbandidonviRefetch().then(() => {
                        if (response.success) {
                            toast(response.message || 'Xóa văn bản thành công', { variant: 'success' })
                        } else {
                            toast(response.message || 'Xóa văn bản thất bại', { variant: 'danger' })
                        }
                    })
                    setSelectedIds(new Set())
                }
            })
            .finally(() => {
                setIsDeleting(false)
                onCloseDelete()
                setIdsToDelete(null)
            })
    }

    const handleClone = async (id: string | number) => {
        await vanbandidonviAxios.cloneVanban(id).then((response) => {
            if (response.success) {
                toast('Sao chép văn bản thành công', { variant: 'success' })
                vanbandidonviRefetch()
                setSelectedRow(response.data.id_van_ban)
            } else {
                toast('Sao chép văn bản thất bại', { variant: 'danger' })
            }
        })
    }

    const onClickRow = async (row: object): Promise<void> => {
        const id = row['id_van_ban'] as string | number
        setOpenDetail(true)
        setSelectedRow(id)

        // Tìm index của row này để đồng bộ highlight
        const idx = (vanbandidonviData as any[])?.findIndex((r) => r.id_van_ban === id) ?? -1
        if (idx !== -1) setIndexRow(idx)
    }

    // Tùy chỉnh columns
    const customColumns = filters.tableColumn.map((col) => {
        switch (col.uid) {
            case 'ten_nguoi_tao':
                return {
                    ...col,
                    className: 'w-22 hidden lg:table-cell',
                    render: (value, row) => (
                        <div className="text-zinc-500 dark:text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap w-30">
                            {value}
                            <div>
                                <small>{row.email_nguoi_tao}</small>
                            </div>
                        </div>
                    )
                }

            case 'so_van_ban':
                return {
                    ...col,
                    className: 'w-18 hidden lg:table-cell',
                    render: (value) => <div className="text-zinc-600 dark:text-zinc-300 pl-3">{value}</div>
                }

            case 'so_hieu_van_ban':
                return {
                    ...col,
                    className: 'w-5 hidden lg:table-cell',
                    render: (value) => (
                        <div className="text-zinc-600 dark:text-zinc-300 truncate overflow-hidden text-ellipsis whitespace-nowrap w-28">
                            {value}
                        </div>
                    )
                }

            case 'trang_thai':
                return {
                    ...col,
                    className: 'w-28 text-center',
                    render: (value) => {
                        const matchedStatus = Object.values(STATUS_VBDI_MAP).find(
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
                    render: (value, row) => {
                        return (
                            <div className="flex justify-between gap-2 items-center p-0.5 pr-3">
                                <div className="flex flex-col grow">
                                    <span className="line-clamp-1 mb-0.5 text-gray-700 dark:text-gray-200 select-text! cursor-text">
                                        {value}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        {row.thoi_gian_xu_ly && (
                                            <div
                                                className={cn(
                                                    'flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-sm border',
                                                    new Date(row.thoi_gian_xu_ly) < new Date()
                                                        ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                                        : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                                )}
                                            >
                                                <Clock size={12} />
                                                <span>Hạn xử lý: {date('vi', row.thoi_gian_xu_ly)}</span>
                                            </div>
                                        )}
                                        {row.files?.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1">
                                                {row.files.slice(0, 2).map((f, index) => (
                                                    <Chip
                                                        key={f.ten_file_goc + index}
                                                        size="sm"
                                                        className="text-xs bg-transparent border-1 border-gray-300 dark:border-gray-600 p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handlePreview(f.duong_dan, f.ten_file_goc)
                                                        }}
                                                    >
                                                        <div className="flex gap-2">
                                                            <OfficeIcon name={f.ten_file_goc} size={14} />
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                {truncateMiddle(f.ten_file_goc)}
                                                            </span>
                                                        </div>
                                                    </Chip>
                                                ))}
                                                {row.files.length > 2 && (
                                                    <Chip
                                                        size="sm"
                                                        variant="soft"
                                                        className="text-[10px] h-6 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 font-bold"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onClickRow(row)
                                                        }}
                                                    >
                                                        +{row.files.length - 2}
                                                    </Chip>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span>
                                    <ActionRowDocument
                                        data={row}
                                        onDelete={handleDelete}
                                        onOpenComposeEdit={async () => {
                                            const id = row['id_van_ban'] as string | number
                                            const res = await vanbandidonviAxios.show(id)
                                            if (res.status == 200) {
                                                const data = res.data || {}
                                                const ids_ql_nguoi_dung_fd = data.e_nguoi_xu_ly
                                                    .map((item) => item.id_nguoi_xu_ly)
                                                    .join(',')

                                                const ids_don_vi_xu_ly_fd = [
                                                    ...new Set(data.e_nguoi_xu_ly.map((item) => item.id_don_vi))
                                                ].join(',')

                                                setFormData({
                                                    ...data,
                                                    ids_hinh_thuc: (data.e_vb_hinh_thuc || [])
                                                        .map((item) => item.id_hinh_thuc)
                                                        .join(','),
                                                    file_ban_hanh_old: data.files,
                                                    file_noi_bo_old: data.files_tchc,
                                                    ids_ql_nguoi_dung: ids_ql_nguoi_dung_fd,
                                                    ids_don_vi_xu_ly: ids_don_vi_xu_ly_fd
                                                })

                                                const existingFiles = data.files.map((f) => ({
                                                    id: Number(f.id_file_dinh_kem),
                                                    name: f.ten_file_goc,
                                                    size: convertSize(f.dung_luong),
                                                    url: f.duong_dan, // hoặc API cung cấp URL decode
                                                    type: guessMimeType(f.ten_file_goc)
                                                }))

                                                setExistingFiles(existingFiles)

                                                // console.log('existingFiles: ', existingFiles)

                                                const existingFilesInternal = data.files_tchc.map((f) => ({
                                                    id: Number(f.id_file_dinh_kem),
                                                    name: f.ten_file_goc,
                                                    size: convertSize(f.dung_luong),
                                                    url: f.duong_dan, // hoặc API cung cấp URL decode
                                                    type: guessMimeType(f.ten_file_goc)
                                                }))

                                                setExistingFilesInternal(existingFilesInternal)
                                            }

                                            setEditingId(id)
                                            onOpenComposeEdit()
                                        }}
                                    />
                                </span>
                            </div>
                        )
                    }
                }

            default:
                return col
        }
    })

    // useQuery danh sách văn bản
    const {
        data: vanbandidonviData = [],
        isLoading: vanbandidonviIsLoading,
        isFetching: vanbandidonviIsFetching,
        refetch: vanbandidonviRefetch
    } = useQuery({
        queryKey: ['vanbandidonvi', filters, length],
        queryFn: () => {
            return vanbandidonviAxios.fetch(customDataApi(filters)).then((response) => {
                setTotalRecord(response.recordsTotal || 0)
                setTotalRecordFiltered(response.recordsFiltered || 0)

                if (response.thoi_han) {
                    setStatisticals([
                        { classify: 'all', count: response.thoi_han.all || 0 },
                        { classify: 'luu_tru', count: response.thoi_han.luu_tru || 0 },
                        { classify: 'cho_xu_ly', count: response.thoi_han.cho_xu_ly || 0 },
                        { classify: 'hoan_thanh', count: response.thoi_han.hoan_thanh || 0 },
                        { classify: 'thu_hoi', count: response.thoi_han.thu_hoi || 0 }
                    ])
                }

                return response.data || []
            })
        }
    })
    // useQuery chi tiết văn bản
    const {
        data: detailData,
        isLoading: detailIsLoading,
        isFetching: detailIsFetching
        // refetch: detailRefetch
    } = useQuery({
        queryKey: ['detail', selectedRow],
        queryFn: async () => {
            return vanbandidonviAxios.show(selectedRow!).then((response) => response.data || null)
        },
        enabled: !!selectedRow // Chỉ chạy khi có selectedRow và click trái
    })

    // Xử lý khi indexRow thay đổi - cập nhật selectedRow
    useEffect(() => {
        if (indexRow >= 0 && vanbandidonviData && vanbandidonviData[indexRow]) {
            const row = vanbandidonviData[indexRow]
            const id = row['id_van_ban'] as string | number
            setSelectedRow(id)

            if (openDetail) {
                setOpenDetail(true) // Keep it open if it was already open
            }
        }
    }, [indexRow]) // ONLY trigger when indexRow changes numerically

    // Reset indexRow when filters truly change (page change, search change, filter change)
    useEffect(() => {
        setIndexRow(-1)
    }, [filters]) // Reset highlight/index when filters change, NOT just when data refetches

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!vanbandidonviData || (vanbandidonviData as any[]).length === 0) return

            // Tránh phiền toái khi đang gõ vào input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setIndexRow((prev) => (prev < (vanbandidonviData as any[]).length - 1 ? prev + 1 : prev))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setIndexRow((prev) => (prev > 0 ? prev - 1 : prev))
            } else if (e.key === 'Enter') {
                if (indexRow >= 0) {
                    setOpenDetail(true)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [vanbandidonviData, indexRow, openDetail])

    // Tự động cuộn tới hàng đang chọn (hỗ trợ phím mũi tên)
    useEffect(() => {
        if (indexRow >= 0) {
            const rowElement = document.querySelector(`[data-row-index="${indexRow}"]`)
            if (rowElement) {
                rowElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
        }
    }, [indexRow])

    // menu action khi có chọn nhiều checkbox
    const menuActionCheckboxs = () => [
        {
            label: 'Chuyển vào thùng rác',
            icon: <Delete size={15} />,
            onClick: () => {
                handleDelete([...selectedIds])
                setSelectedIds(new Set())
            }
        }
    ]

    return (
        <div className="space-y-2">
            <div className="lg:flex gap-0">
                <div className="">
                    <div className="block xl:hidden">
                        <Button
                            isIconOnly
                            variant="primary"
                            onPress={toggleListBox}
                            className="rounded-full fixed z-10 right-4 bottom-7 shadow-lg w-15 h-15"
                        >
                            <Plus />
                        </Button>
                    </div>
                    <div
                        className={`fixed xl:hidden top-0 left-0 right-0 bottom-0 bg-gray-500/50 dark:bg-gray-900/50 z-20 ${listBox ? 'block' : 'hidden'}`}
                        onClick={toggleListBox}
                    ></div>
                    <ListBoxWrapper
                        open={listBox}
                        onOpenCompose={() => onOpenComposeGlobal('vanbandidonvi')}
                    />
                </div>
                <div className="lg:flex-1 space-y-3">
                    <div className="space-y-3">
                        <TableDocument
                            title="Danh sách văn bản"
                            primaryKey="id_van_ban"
                            FiltersComponent={<PopupFilter />}
                            RowActionComponent={
                                selectedIds.size > 0 ? (
                                    <RowActionCheckbox selectedIds={[...selectedIds]} menu={menuActionCheckboxs()} />
                                ) : undefined
                            }
                            columns={customColumns}
                            initVisibleColumns={filters.initial_visible_columns}
                            page={filters.page}
                            totalRecordFiltered={totalRecordFiltered}
                            data={(vanbandidonviData as Record<string, unknown>[]) || []}
                            onPageChange={setPage}
                            length={length}
                            setlength={setlength}
                            totalRecord={totalRecord}
                            onSearchChange={onSearchChange}
                            onClickRow={onClickRow}
                            selectedRow={selectedRow}
                            isLoading={vanbandidonviIsLoading || vanbandidonviIsFetching}
                            handleSelectedIds={handleSelectedIds}
                            selectedIds={selectedIds}
                            onSortChange={handleSortChange}
                            indexRow={indexRow}
                            setIndexRow={setIndexRow}
                            initialSortDescriptors={initialSortDescriptors}
                        />
                    </div>
                </div>
            </div>
            <DrawerDocument
                open={openDetail}
                isLoading={detailIsLoading || detailIsFetching}
                onClose={() => setOpenDetail(false)}
                data={detailData}
                indexRow={indexRow}
                setIndexRow={setIndexRow}
                actionClone={handleClone}
            />

            <ModalCompose
                title="Sửa văn bản đi đơn vị"
                isOpenCompose={isOpenComposeEdit}
                onClose={() => {
                    onCloseComposeEdit()
                    setFormData({})
                    setFileGroups({})
                }}
                size="5xl"
                fileGroups={fileGroups}
                handleSubmitApi={(_id, data) => vanbandidonviAxios.update(String(editingId), data!)}
                onSubmitSuccess={() => {
                    queryClient.invalidateQueries({
                        queryKey: ['vanbandidonvi']
                    })
                    queryClient.invalidateQueries({
                        queryKey: ['detail']
                    })
                    setCreate({
                        ids_co_quan: '',
                        ids_ql_nguoi_dung: '',
                        ids_don_vi_xu_ly: ''
                    })
                    setFormData({})
                }}
                formData={formData}
            >
                <FormVanbandidonvi
                    formData={formData}
                    setFormData={setFormData}
                    onFilesChange={onFilesChange}
                    existingFiles={existingFiles}
                    existingFilesInternal={existingFilesInternal}
                />
            </ModalCompose>

            {/* Modal Xóa */}
            <AlertDialog>
                <AlertDialog.Backdrop isOpen={isOpenDelete} onOpenChange={setIsOpenDelete}>
                    <AlertDialog.Container>
                        <AlertDialog.Dialog className="sm:max-w-[400px]">
                            <AlertDialog.Header>
                                <AlertDialog.Heading>Xác nhận chuyển vào thùng rác</AlertDialog.Heading>
                            </AlertDialog.Header>
                            <AlertDialog.Body>
                                <p>Bạn có chắc chắn muốn chuyển văn bản này vào thùng rác?</p>
                            </AlertDialog.Body>
                            <AlertDialog.Footer>
                                <Button variant="danger-soft" onPress={onCloseDelete}>
                                    Hủy
                                </Button>
                                <Button variant="danger" onPress={confirmDelete} isPending={isDeleting}>
                                    Xác nhận
                                </Button>
                            </AlertDialog.Footer>
                        </AlertDialog.Dialog>
                    </AlertDialog.Container>
                </AlertDialog.Backdrop>
            </AlertDialog>
        </div>
    )
}

function ActionRowDocument({
    data,
    onOpenComposeEdit = () => { },
    onDelete
}: {
    data: Record<string, unknown>
    onDelete: (id: string | number) => void
    onOpenComposeEdit?: () => void
}): React.JSX.Element {
    if (!data) return <></>
    const id = data.id_van_ban as string | number

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 w-0 overflow-hidden group-hover:w-auto transition-all duration-500">
                <Tooltip>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        className="rounded-full"
                        onPress={() => {
                            onOpenComposeEdit()
                        }}
                    >
                        <Pencil size={14} />
                    </Button>
                    <Tooltip.Content className="capitalize bg-slate-100 rounded-none text-xs px-2 py-1">Sửa</Tooltip.Content>
                </Tooltip>

                <Tooltip>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        className="rounded-full"
                        onPress={() => {
                            onDelete(id)
                        }}
                    >
                        <Trash2 size={14} className="text-danger" />
                    </Button>
                    <Tooltip.Content className="capitalize bg-slate-100 rounded-none text-xs px-2 py-1">Chuyển vào thùng rác</Tooltip.Content>
                </Tooltip>
            </div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] truncate">
                {date('vi', data.ngay_tao as string)}
            </span>
            {Array.isArray(data.files) && data.files.length > 0 && (
                <Paperclip className="size-3 text-slate-400 dark:text-slate-500" />
            )}
        </div>
    )
}
