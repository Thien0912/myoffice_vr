/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
import { Button, Chip, toast, Tooltip } from '@heroui-v3/react'
import { useLayoutStore } from '@renderer/store/useLayoutStore'
import {
    ArchiveRestore,
    Clock,
    Eye,
    FolderCheck,
    Info,
    MessageSquare,
    MessagesSquare,
    Paperclip,
    Pencil,
    PenTool,
    Plus,
    RotateCcw,
    Send,
    Trash2
} from 'lucide-react'
import ListBoxWrapper from './components/ListBox/ListBoxWrapper'
import TableDocument from './components/table/TableDocument'

import { useCallback, useEffect, useRef, useState } from 'react'
// import { truncateMiddle } from '@renderer/utils/string'
// import OfficeIcon from '@renderer/components/OfficeIcon'
import { callApi, customDataApi } from '@renderer/api/callApi'
import { getStatusDocument } from '@renderer/utils/documents/statusVanban'
import DrawerDocument from './components/drawer/DrawerDocument'
import { PopupFilter } from './components/table/Filters/PopupFilter'
// import { enscrypt } from '@renderer/utils/documents/userPreview'
import { vanbandenAxios } from '@renderer/api/documents/vanbandenAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import ContextMenu from '@renderer/components/ContextMenu'
import { useContextMenu } from '@renderer/hooks/useContextMenu'
import { useTableSort } from '@renderer/hooks/useTableSort'
import { ExistingFile, VanBanData } from '@renderer/shared/CommonInterface'
import { useVanbandenStore } from '@renderer/store/useVanbanStore'
import { date } from '@renderer/utils/formatDate'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import BoxSearchFile from './components/BoxSearchFile'
import FormButPheLanhDao from './components/form/FormButPheLanhDao'
import FormChuyendonvixuly from './components/form/FormChuyendonvixuly'
import FormPhanhoi from './components/form/FormPhanhoi'
import FormVanbanden from './components/form/FormVanbanden'
import FormViewDonvixuly from './components/form/FormViewDonvixuly'
import InputPhanhoi from './components/InputPhanhoi'
import ModalCompose from './components/modal/ModalCompose'
import FileChip from './components/table/FileChip'
import RowActionCheckbox from './components/table/RowActionCheckbox'

import { useComposeStore } from '@renderer/store/useComposeStore'
import { useLocation } from 'react-router-dom'
import VanbandenLayoutList from './layout/VanbandenLayoutList'

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

function useDisclosure(defaultOpen = false) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const onOpen = useCallback(() => setIsOpen(true), []);
    const onClose = useCallback(() => setIsOpen(false), []);
    const onOpenChange = useCallback((open: boolean) => setIsOpen(open), []);
    const onToggle = useCallback(() => setIsOpen(prev => !prev), []);
    return { isOpen, onOpen, onClose, onOpenChange, onToggle };
}

export default function VanbandenPage(): React.JSX.Element {
    const [formData, setFormData] = useState<Record<string, any>>({})
    const { listBox, toggleListBox } = useLayoutStore()
    const location = useLocation()
    const params = new URLSearchParams(location.search)

    const { filters, setFilters, setStatisticals } = useVanbandenStore()
    const [page, setPage] = useState(filters.page ?? 1)
    const [length, setlength] = useState(filters.length ?? 30)
    const [totalRecord, setTotalRecord] = useState(0)
    const [totalRecordFiltered, setTotalRecordFiltered] = useState(0)
    const [editingId, setEditingId] = useState<string | number | null>(null)
    const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])
    const [indexRow, setIndexRow] = useState<number>(-1)
    const [openSearchFile, setOpenSearchFile] = useState(false)

    const { initialSortDescriptors, handleSortChange } = useTableSort({
        orders: filters.orders,
        setFilters
    })

    // Cập nhật lại filter khi page hoặc length thay đổi
    useEffect(() => {
        setFilters({ page, length })
        setIndexRow(-1)
    }, [page, length])

    // Auto open Create Modal if passed in navigation state
    useEffect(() => {
        if (location.state && (location.state as any).openCreateModal) {
            onOpenCompose('vanbanden')
            // Clear the state to prevent reopening if the user navigates elsewhere and comes back (though state usually is per entry)
            // or just to clean up.
            window.history.replaceState({}, document.title)
        }
    }, [location.state])

    const [contextRow, setContextRow] = useState<string | number>('')
    const [selectedRow, setSelectedRow] = useState<string | number>('')
    const [openDetail, setOpenDetail] = useState(false)
    const [drawerDefaultTab, setDrawerDefaultTab] = useState<string>('info')

    // Global Compose Store for "Thêm mới"
    const { onOpen: onOpenCompose } = useComposeStore()

    const {
        isOpen: isOpenComposeEdit,
        onClose: onCloseComposeEdit,
        onOpen: onOpenComposeEdit
    } = useDisclosure()
    // Bút phê lãnh đạo
    const {
        isOpen: isOpenComposeButPheLanhDao,
        onClose: onCloseComposeButPheLanhDao,
        onOpen: onOpenComposeButPheLanhDao
    } = useDisclosure()
    // Chuyển đơn vị xử lý
    const {
        isOpen: isOpenComposeChuyendonvixuly,
        onClose: onCloseComposeChuyendonvixuly,
        onOpen: onOpenComposeChuyendonvixuly
    } = useDisclosure()
    //Phản hồi
    const { isOpen: isOpenPhanhoi, onClose: onClosePhanhoi, onOpen: onOpenPhanhoi } = useDisclosure()
    // Xem đơn vị được phân công
    const {
        isOpen: isOpenXemPhanCong,
        onClose: onCloseXemPhanCong,
        onOpen: onOpenXemPhanCong
    } = useDisclosure()
    // Xác nhận xóa
    const { isOpen: isOpenRecall, onOpen: onOpenRecall, onClose: onCloseRecall } = useDisclosure()
    const {
        isOpen: isOpenComplete,
        onOpen: onOpenComplete,
        onClose: onCloseComplete
    } = useDisclosure()

    const [idsToRecall, setIdsToRecall] = useState<(string | number)[] | null>(null)
    const [idsToComplete, setIdsToComplete] = useState<(string | number)[] | null>(null)
    const [idsToRestore, setIdsToRestore] = useState<(string | number)[] | null>(null)
    const [isRecalling, setIsRecalling] = useState(false)
    const [isRestoring, setIsRestoring] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [isLoadingForm, setIsLoadingForm] = useState(false)

    const { isOpen: isOpenRestore, onOpen: onOpenRestore, onClose: onCloseRestore } = useDisclosure()

    const {
        isOpen: isOpenMoveTrash,
        onOpen: onOpenMoveTrash,
        onClose: onCloseMoveTrash
    } = useDisclosure()

    const [idsToMoveTrash, setIdsToMoveTrash] = useState<(string | number)[] | null>(null)
    const [isMovingTrash, setIsMovingTrash] = useState(false)

    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())

    //handle selectedids
    const handleSelectedIds = useCallback((ids: Set<string | number>) => {
        setSelectedIds(ids)
    }, [])

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
            const listFileOldName = ['file_dinh_kem_old']
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
    //Staticticals store

    // Preview file
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

    const handleRecall = (ids: (string | number) | (string | number)[]) => {
        setIdsToRecall(Array.isArray(ids) ? ids : [ids])
        onOpenRecall()
    }

    const confirmRecall = async () => {
        if (!idsToRecall) return
        setIsRecalling(true)
        await vanbandenAxios
            .revoke({ ids: idsToRecall })
            .then((response) => {
                if (response.success) {
                    vanbandenRefetch().then(() => {
                        toast.success('Thu hồi văn bản thành công')
                    })
                    setSelectedIds(new Set())
                } else {
                    toast.danger('Thất bại', {
                        description: `Thu hồi văn bản thất bại: ${response.message || ''}`
                    })
                }
            })
            .finally(() => {
                setIsRecalling(false)
                onCloseRecall()
                setIdsToRecall(null)
            })
    }

    const handleRestore = (ids: (string | number) | (string | number)[]) => {
        setIdsToRestore(Array.isArray(ids) ? ids : [ids])
        onOpenRestore()
    }

    const confirmRestore = async () => {
        if (!idsToRestore) return
        setIsRestoring(true)
        await vanbandenAxios
            .restore({ ids: idsToRestore })
            .then((response) => {
                if (response.success) {
                    vanbandenRefetch().then(() => {
                        toast.success('Khôi phục văn bản thành công')
                    })
                    setSelectedIds(new Set())
                } else {
                    toast.danger('Thất bại', {
                        description: `Khôi phục văn bản thất bại: ${response.message || ''}`
                    })
                }
            })
            .finally(() => {
                setIsRestoring(false)
                onCloseRestore()
                setIdsToRestore(null)
            })
    }

    const handleMoveToTrash = (ids: (string | number) | (string | number)[]) => {
        setIdsToMoveTrash(Array.isArray(ids) ? ids : [ids])
        onOpenMoveTrash()
    }

    const confirmMoveToTrash = async () => {
        if (!idsToMoveTrash) return
        setIsMovingTrash(true)
        await vanbandenAxios
            .moveToTrash({ ids: idsToMoveTrash })
            .then((response) => {
                if (response.success) {
                    vanbandenRefetch().then(() => {
                        toast.success('Chuyển vào thùng rác thành công')
                    })
                    setSelectedIds(new Set())
                } else {
                    toast.danger('Thất bại', {
                        description: `Chuyển vào thùng rác thất bại: ${response.message || ''}`
                    })
                }
            })
            .finally(() => {
                setIsMovingTrash(false)
                onCloseMoveTrash()
                setIdsToMoveTrash(null)
            })
    }

    const handleUpdateCompleted = (ids: (string | number) | (string | number)[]) => {
        setIdsToComplete(Array.isArray(ids) ? ids : [ids])
        onOpenComplete()
    }

    const confirmUpdateCompleted = async () => {
        if (!idsToComplete) return
        setIsUpdatingStatus(true)

        const promises = idsToComplete.map((id) => vanbandenAxios.changeStatus(id, 'HOAN_THANH'))

        await Promise.all(promises)
            .then((responses) => {
                const allSuccess = responses.every((res) => res.success)
                if (allSuccess) {
                    vanbandenRefetch().then(() => {
                        toast.success('Cập nhận văn bản hoàn thành thành công')
                    })
                    setSelectedIds(new Set())
                } else {
                    toast.danger('Thất bại', {
                        description: 'Cập nhật nội dung thất bại'
                    })
                }
            })
            .finally(() => {
                setIsUpdatingStatus(false)
                onCloseComplete()
                setIdsToComplete(null)
            })
    }

    const handleClone = async (id: string | number) => {
        await vanbandenAxios.cloneVanban(id).then((response) => {
            if (response.success) {
                toast.success('Sao chép văn bản thành công')
                vanbandenRefetch()
                setSelectedRow(response.data.id_van_ban)
            } else {
                toast.danger('Thất bại', {
                    description: 'Sao chép văn bản thất bại'
                })
            }
        })
    }

    // Tùy chỉnh columns
    const customColumns = filters.tableColumn.map((col) => {
        switch (col.uid) {
            // case 'id_van_ban':
            //   return {
            //     ...col,
            //     className: 'w-11 hidden lg:table-cell',
            //     render: (value) => (
            //       <div className="flex items-center">
            //         <Button
            //           isIconOnly
            //           startContent={
            //             <Star
            //               strokeWidth={1}
            //               size={18}
            //               className={`transition-colors ${
            //                 starredIds.has(value) ? 'text-yellow-500 fill-yellow-400' : 'text-zinc-500'
            //               }`}
            //             />
            //           }
            //           variant="light"
            //           radius="full"
            //           size="sm"
            //           onClick={(e) => setStar(e, value)}
            //         />

            //         <Button
            //           isIconOnly
            //           startContent={
            //             <Bookmark
            //               strokeWidth={1}
            //               size={18}
            //               className={`transition-colors ${
            //                 bookmarkedIds.has(value) ? 'text-blue-500 fill-blue-400' : 'text-zinc-500'
            //               }`}
            //             />
            //           }
            //           variant="light"
            //           radius="full"
            //           size="sm"
            //           onClick={(e) => setBookmark(e, value)}
            //         />
            //       </div>
            //     )
            //   }

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
                    render: (value, row) => {
                        console.log('value: ', value, 'loai_van_ban: ', row.loai_van_ban)
                        const status = getStatusDocument(value, row.loai_van_ban || '1')

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
                    render: (value, row) => (
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
                                                // Quá hạn - Red
                                                colorClass =
                                                    'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                            } else if (diffDays === 0) {
                                                // Hôm nay - Amber
                                                colorClass =
                                                    'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                            } else if (diffDays <= 5) {
                                                // Sắp tới hạn (<= 5 ngày) - Blue
                                                colorClass =
                                                    'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                            } else {
                                                // Trên 5 ngày - Green
                                                colorClass =
                                                    'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                            }

                                            return (
                                                <Chip
                                                    size="sm"
                                                    className={`h-auto py-0.5 px-0.5 border gap-1 rounded-sm ${colorClass}`}
                                                >
                                                    <div className="flex items-center">
                                                        <Clock size={12} className="mr-1" />
                                                        <span className="text-tiny font-medium px-0">
                                                            Hạn xử lý: {date('vi', row.thoi_gian_xu_ly)}
                                                        </span>
                                                    </div>
                                                </Chip>
                                            )
                                        })()}
                                    {row.files?.length > 0 && (
                                        <FileChip files={row.files} onClickRow={() => onClickRow(row)} />
                                    )}
                                </div>
                            </div>
                            <span>
                                <ActionRowDocument
                                    row={row}
                                    onDelete={handleRecall}
                                    onEdit={() => handleEditRow(row)}
                                    onRestore={handleRestore}
                                    onMoveToTrash={handleMoveToTrash}
                                />
                            </span>
                        </div>
                    )
                }

            default:
                return col
        }
    })

    // Column actions cố định (luôn hiển thị, không lấy từ store)
    const actionsColumn = {
        uid: 'actions',
        name: '',
        sort: false,
        className: 'w-14 !pr-0',
        render: (_value: unknown, row?: Record<string, unknown>) => (
            <div className="flex items-center gap-0.5">
                <Tooltip>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-gray-400 hover:text-blue-500"
                        onPress={() => {
                            setSelectedRow(row?.id_van_ban as string | number)
                            setDrawerDefaultTab('info')
                            setOpenDetail(true)
                        }}
                    >
                        <Info size={14} />
                    </Button>
                    <Tooltip.Content className="bg-slate-100 rounded-none text-xs">
                        Xem chi tiết
                    </Tooltip.Content>
                </Tooltip>
                <Tooltip>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-gray-400 hover:text-blue-500"
                        onPress={() => {
                            setSelectedRow(row?.id_van_ban as string | number)
                            setDrawerDefaultTab('feedback')
                            setOpenDetail(true)
                        }}
                    >
                        <MessageSquare size={14} />
                    </Button>
                    <Tooltip.Content className="bg-slate-100 rounded-none text-xs">
                        Xem phản hồi
                    </Tooltip.Content>
                </Tooltip>
            </div>
        )
    }

    const columnsWithActions = [actionsColumn, ...customColumns]

    const onClickRow = async (row: object): Promise<void> => {
        const id = row['id_van_ban'] as string | number
        setOpenDetail(true)
        handleCloseMenu()
        setSelectedRow(id)

        // Tìm index của row này để đồng bộ highlight
        const idx = vanbandenData?.findIndex((r) => r.id_van_ban === id) ?? -1
        if (idx !== -1) setIndexRow(idx)
    }

    const handleEditRow = async (row: any) => {
        onOpenComposeEdit()
        setEditingId(row['id_van_ban'])

        const res = await vanbandenAxios.show(row['id_van_ban'])
        if (res.data) {
            // console.log('data: ', res.data)
            setFormData({
                ...res.data,
                file_dinh_kem_old: res.data.files
            })

            const existingFiles = res.data.files.map((f) => ({
                id: Number(f.id_file_dinh_kem),
                name: f.ten_file_goc,
                size: convertSize(f.dung_luong),
                url: f.duong_dan, // hoặc API cung cấp URL decode
                type: guessMimeType(f.ten_file_goc)
            }))

            setExistingFiles(existingFiles)
        }
    }

    //Context menu
    const { menu, handleContextMenu, handleCloseMenu } = useContextMenu(() => {
        // Không reset selection khi đóng menu để giữ trạng thái cho các Modal action
        // setSelectedRow('')
        // setIndexRow(-1)
    })
    const menuItems = (row: any) => [
        {
            label: 'Chỉnh sửa',
            icon: <Pencil size={14} />,
            onClick: async () => {
                handleEditRow(row)
            }
        },
        {
            label: 'Bút phê lãnh đạo',
            icon: <PenTool size={14} />,
            onClick: async () => {
                setFormData({}) // Reset if no existing endorsement
                setFileGroups({})
                setSelectedRow(row['id_van_ban'])
                onOpenComposeButPheLanhDao()
                handleCloseMenu()

                setIsLoadingForm(true)
                try {
                    const res = await vanbandenAxios.show(row['id_van_ban'])
                    if (res.data && res.data.but_phe) {
                        setFormData(res.data.but_phe)
                    }
                } finally {
                    setIsLoadingForm(false)
                }
            }
        },
        {
            label: 'Chuyển đơn vị xử lý',
            icon: <Send size={14} />,
            onClick: async () => {
                setFormData({
                    id_don_vi_xu_ly: [],
                    id_don_vi_phoi_hop: [],
                    nguoi_duyet: '',
                    ngay_duyet: '',
                    ghi_chu_duyet: ''
                })
                setSelectedRow(row['id_van_ban'])
                onOpenComposeChuyendonvixuly()
                handleCloseMenu()

                setIsLoadingForm(true)
                try {
                    const res = await vanbandenAxios.show(row['id_van_ban'])
                    if (res.data && res.data.xu_ly) {
                        const xu_ly = res.data.xu_ly
                        setFormData({
                            ...xu_ly,
                            id_don_vi_xu_ly: xu_ly.don_vi_xu_ly_chinh?.map((dv: any) => String(dv.id_don_vi)) || [],
                            id_don_vi_phoi_hop:
                                xu_ly.don_vi_xu_ly_phoi_hop?.map((dv: any) => String(dv.id_don_vi)) || [],
                            nguoi_duyet: xu_ly.nguoi_duyet || '',
                            ngay_duyet:
                                xu_ly.ngay_duyet && !String(xu_ly.ngay_duyet).startsWith('0000')
                                    ? String(xu_ly.ngay_duyet).split(' ')[0]
                                    : '',
                            ghi_chu_duyet: xu_ly.ghi_chu_duyet || ''
                        })
                    }
                } finally {
                    setIsLoadingForm(false)
                }
            }
        },
        {
            label: 'Xem phản hồi',
            icon: <MessagesSquare size={14} />,
            onClick: () => {
                onOpenPhanhoi()
                setContextRow(row.id_van_ban)
            }
        },
        {
            label: 'Xác nhận hoàn thành',
            icon: <FolderCheck size={14} />,
            onClick: () => {
                const id = row.id_van_ban || null
                if (id) {
                    handleUpdateCompleted(id)
                } else {
                    toast.danger('Thất bại', { description: 'Không tìm thấy ID văn bản' })
                }
            }
        },
        { label: 'separator' },
        {
            label: 'Xem đơn vị được phân công',
            icon: <Eye size={14} />,
            onClick: () => {
                onOpenXemPhanCong()
                setSelectedRow(row.id_van_ban)
            }
        },
        { label: 'separator' },
        {
            label: 'Xem chi tiết',
            icon: <Eye size={14} />,
            onClick: () => {
                setOpenDetail(true)
                setSelectedRow(row.id_van_ban)
            }
        },
        row.deleted_at
            ? {
                label: 'Khôi phục',
                icon: <ArchiveRestore size={14} />,
                onClick: () => {
                    handleRestore(row.id_van_ban)
                }
            }
            : {
                label: 'Thu hồi',
                icon: <RotateCcw size={14} />,
                onClick: () => {
                    handleRecall(row.id_van_ban)
                }
            },
        {
            label: 'Chuyển vào thùng rác',
            icon: <Trash2 size={14} className="text-danger" />,
            className: 'text-danger',
            onClick: () => {
                handleMoveToTrash(row.id_van_ban)
            }
        }
    ]

    // useQuery danh sách (no destructuring to avoid unused variable errors)
    const {
        data: vanbandenData,
        isLoading: vanbandenIsLoading,
        refetch: vanbandenRefetch
    } = useQuery({
        queryKey: ['vanbanden', filters],
        queryFn: () => {
            return vanbandenAxios.fetch(customDataApi(filters)).then((response) => {
                setTotalRecord(response.recordsTotal || 0)
                setTotalRecordFiltered(response.recordsFiltered || 0)

                if (response.thoi_han) {
                    setStatisticals([
                        { classify: 'all', count: response.thoi_han.all || 0 },
                        { classify: 'tiep_nhan', count: response.thoi_han.tiep_nhan || 0 },
                        { classify: 'cho_but_phe', count: response.thoi_han.cho_but_phe || 0 },
                        { classify: 'da_but_phe', count: response.thoi_han.da_but_phe || 0 },
                        {
                            classify: 'da_chuyen_don_vi_xu_ly',
                            count: response.thoi_han.da_chuyen_don_vi_xu_ly || 0
                        },
                        { classify: 'da_xu_ly', count: response.thoi_han.da_xu_ly || 0 },
                        { classify: 'hoan_thanh', count: response.thoi_han.hoan_thanh || 0 },
                        { classify: 'luu_tru', count: response.thoi_han.luu_tru || 0 },
                        { classify: 'thu_hoi', count: response.thoi_han.thu_hoi || 0 },
                        { classify: 'qua_han', count: response.thoi_han.qua_han || 0 },
                        { classify: 'hom_nay', count: response.thoi_han.hom_nay || 0 },
                        { classify: 'duoi_5_ngay', count: response.thoi_han.duoi_5_ngay || 0 },
                        { classify: 'tren_5_ngay', count: response.thoi_han.tren_5_ngay || 0 }
                    ])
                }

                return response.data || []
            })
        }
    })
    // useQuery detail văn bản
    const {
        data: detailData,
        isLoading: detailIsLoading,
        isFetching: detailIsFetching
    } = useQuery({
        queryKey: ['detail', selectedRow],
        queryFn: async () => {
            return vanbandenAxios.show(selectedRow!).then((response) => response.data || null)
        },
        enabled: !!selectedRow
    })

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input or textarea
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                (document.activeElement as HTMLElement)?.isContentEditable
            ) {
                return
            }

            const dataLength = vanbandenData?.length || 0
            if (dataLength === 0) return

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setIndexRow((prev) => (prev < dataLength - 1 ? prev + 1 : prev))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setIndexRow((prev) => (prev > 0 ? prev - 1 : 0))
            } else if (e.key === 'Enter') {
                if (indexRow >= 0 && vanbandenData?.[indexRow]) {
                    const row = vanbandenData[indexRow]
                    onClickRow(row)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [vanbandenData, indexRow, onClickRow])

    // Xử lý khi indexRow thay đổi - cập nhật selectedRow và cuộn tới hàng đó if needed
    useEffect(() => {
        if (indexRow >= 0 && vanbandenData && vanbandenData[indexRow]) {
            const row = vanbandenData[indexRow]
            const id = row['id_van_ban'] as string | number
            setSelectedRow(id)

            // Auto open detail only if the user is explicitly navigating at the start
            // or if we want it to stay open when switching rows.
            if (openDetail) {
                setOpenDetail(true) // Keep it open if it was already open
            }
        }
    }, [indexRow]) // ONLY trigger when indexRow changes numerically

    // Reset indexRow when filters truly change (search change, filter change, page change)
    useEffect(() => {
        setIndexRow(-1)
    }, [filters]) // Reset highlight/index when filters change, NOT just when data refetches

    // Trong component VanbandenPage
    const containerRef = useRef<HTMLDivElement>(null)
    const onContextMenuRow = (e: React.MouseEvent, row: any) => {
        e.preventDefault() // ngăn menu mặc định
        setSelectedRow(row['id_van_ban'] || row['id']) // <-- set row hiện tại

        handleContextMenu(e, row) // lưu menu vị trí + row

        // Tìm index của row này để đồng bộ highlight
        const idx = vanbandenData?.findIndex((r) => r.id_van_ban === row.id_van_ban) ?? -1
        if (idx !== -1) setIndexRow(idx)
    }

    const menuActionCheckboxs = () => {
        const items = [
            {
                label: 'Chuyển vào thùng rác mục đã chọn',
                icon: <Trash2 size={14} className="text-danger" />,
                className: 'text-danger',
                onClick: () => {
                    handleMoveToTrash(Array.from(selectedIds))
                    setSelectedIds(new Set())
                }
            },
            {
                label: 'Hoàn thành',
                icon: <FolderCheck size={14} className="text-success" />,
                className: 'text-success',
                onClick: () => {
                    // handleUpdateStatus(Array.from(selectedIds), 'HOAN_THANH')
                    handleUpdateCompleted(Array.from(selectedIds))
                    setSelectedIds(new Set())
                }
            }
        ]

        if (filters.selectedClassify !== 'thu_hoi') {
            items.unshift({
                label: 'Thu hồi mục đã chọn',
                icon: <RotateCcw size={14} className="text-danger" />,
                className: 'text-danger',
                onClick: () => {
                    handleRecall(Array.from(selectedIds))
                    setSelectedIds(new Set())
                }
            })
        }

        return items
    }

    //Clone văn bản
    // Tự động cuộn tới hàng đang chọn (hỗ trợ phím mũi tên)
    useEffect(() => {
        if (indexRow >= 0) {
            const rowElement = document.querySelector(`[data-row-index="${indexRow}"]`)
            if (rowElement) {
                rowElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
        }
    }, [indexRow])

    // File list
    const [searchFile, setSearchFile] = useState('')
    const [filterFile, setFilterFile] = useState<{
        fileType: string
        author: string
        date: { start: string; end: string } | null
    }>({ fileType: '', author: '', date: null })
    const {
        data: dataFiles,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useInfiniteQuery({
        queryKey: ['files', openSearchFile, searchFile, filterFile],
        enabled: !!openSearchFile,
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
            vanbandenAxios
                .files({
                    page: pageParam,
                    limit: 20,
                    search: searchFile,
                    fileType: filterFile.fileType,
                    author: filterFile.author,
                    date: filterFile.date
                })
                .then((res) => {
                    // API trả về object với structure: { status, message, page, limit, data: [...] }
                    // Cần lấy res.data.data thay vì res.data
                    const files = Array.isArray(res.data) ? res.data : res.data?.data || []
                    return files
                }),
        getNextPageParam: (lastPage, pages) => (lastPage?.length ? pages.length + 1 : undefined)
    })

    const allFiles = dataFiles?.pages.flat() || []

    useEffect(() => {
        const timeout = setTimeout(() => {
            refetch()
        }, 300)
        return () => clearTimeout(timeout)
    }, [searchFile, filterFile])

    if (params.get('layout') === 'list') {
        return <VanbandenLayoutList />
    }

    return (
        <div className="space-y-2">
            <div className="lg:flex gap-0">
                <div className="">
                    <div className="flex flex-col gap-2">
                        <div className="block xl:hidden">
                            <Button
                                isIconOnly
                                size="lg"
                                className="fixed z-10 right-4 bottom-7 shadow-lg bg-primary text-white rounded-full"
                                onPress={toggleListBox}
                            >
                                <Plus />
                            </Button>
                        </div>

                        {/* Layout Toggle Button - Visible on Desktop */}
                    </div>
                    <div
                        className={`fixed xl:hidden top-0 left-0 right-0 bottom-0 bg-gray-500/50 dark:bg-gray-900/50 z-30 ${listBox ? 'block' : 'hidden'} `}
                        onClick={toggleListBox}
                    ></div>
                    <ListBoxWrapper open={listBox} onOpenCompose={() => onOpenCompose('vanbanden')} />
                </div>
                <div ref={containerRef} className="lg:flex-1 space-y-3 relative">
                    <TableDocument
                        title="Danh sách văn bản"
                        primaryKey="id_van_ban"
                        FiltersComponent={<PopupFilter />}
                        SearchFile={
                            <InputSearchFile
                                openSearchFile={openSearchFile}
                                setOpenSearchFile={setOpenSearchFile}
                            />
                        }
                        RowActionComponent={
                            selectedIds.size > 0 ? (
                                <RowActionCheckbox selectedIds={[...selectedIds]} menu={menuActionCheckboxs()} />
                            ) : undefined
                        }
                        columns={columnsWithActions}
                        initVisibleColumns={filters.initial_visible_columns}
                        totalRecordFiltered={totalRecordFiltered}
                        data={(vanbandenData as Record<string, unknown>[]) || []}
                        page={page}
                        onPageChange={setPage}
                        length={length}
                        setlength={setlength}
                        totalRecord={totalRecord}
                        onClickRow={undefined}
                        selectedRow={selectedRow}
                        handleSelectedIds={handleSelectedIds}
                        onContextMenuRow={onContextMenuRow}
                        isLoading={vanbandenIsLoading}
                        selectedIds={selectedIds}
                        onSortChange={handleSortChange}
                        indexRow={indexRow}
                        setIndexRow={setIndexRow}
                        initialSortDescriptors={initialSortDescriptors}
                    />
                    {/* Context menu */}
                    {menu.row && (
                        <ContextMenu
                            x={menu.x}
                            y={menu.y}
                            isOpen={menu.isOpen}
                            items={menuItems(menu.row)}
                            onClose={handleCloseMenu}
                        />
                    )}
                </div>
                {openSearchFile && (
                    <div className="lg:min-w-sm">
                        <BoxSearchFile
                            data={allFiles}
                            onLoadMore={fetchNextPage}
                            hasMore={hasNextPage ?? false}
                            isFetchingNextPage={isFetchingNextPage}
                            setSearchFile={setSearchFile}
                            searchFile={searchFile}
                            setFilterFile={setFilterFile}
                            filterFile={filterFile}
                        />
                    </div>
                )}
            </div>
            {/* Bản xem chi tiết */}
            <DrawerDocument
                open={openDetail}
                isLoading={detailIsLoading || detailIsFetching}
                onClose={() => setOpenDetail(false)}
                data={detailData}
                indexRow={indexRow}
                setIndexRow={setIndexRow}
                actionClone={handleClone}
                defaultTab={drawerDefaultTab}
            />

            {/* Modal thêm văn bản -> Moved to GlobalCompose */}

            {/* Modal sửa văn bản */}
            <ModalCompose
                title="Sửa văn bản đến"
                size="5xl"
                isOpenCompose={isOpenComposeEdit}
                onClose={() => {
                    onCloseComposeEdit()
                    setFormData({})
                    setFileGroups({})
                    setExistingFiles([])
                }}
                handleSubmitApi={(_id, data) => vanbandenAxios.update(editingId!, data!)}
                fileGroups={fileGroups}
                onSubmitSuccess={() => {
                    vanbandenRefetch()
                    setFormData({})
                }}
                formData={formData}
            >
                <FormVanbanden
                    onFilesChange={onFilesChange}
                    formData={formData}
                    setFormData={setFormData}
                    existingFiles={existingFiles}
                    fileGroups={fileGroups}
                />
            </ModalCompose>

            {/* Modal thêm bút phê lãnh đạo */}
            <ModalCompose
                title="Bút phê lãnh đạo"
                isOpenCompose={isOpenComposeButPheLanhDao}
                onClose={onCloseComposeButPheLanhDao}
                size="xl"
                fileGroups={fileGroups}
                idSubmitApi={selectedRow}
                handleSubmitApi={(id, data) => vanbandenAxios.createButphe(id!, data!)}
                onSubmitSuccess={() => {
                    vanbandenRefetch()
                    setFormData({})
                }}
                formData={formData}
                isLoading={isLoadingForm}
            >
                <FormButPheLanhDao
                    formData={formData}
                    setFormData={setFormData}
                    onFilesChange={onFilesChange}
                    fileGroups={fileGroups}
                    documentData={detailData}
                />
            </ModalCompose>

            {/* Modal chuyển đơn vị xử lý */}
            <ModalCompose
                title="Chuyển đơn vị xử lý"
                isOpenCompose={isOpenComposeChuyendonvixuly}
                onClose={onCloseComposeChuyendonvixuly}
                size="5xl"
                fileGroups={fileGroups}
                idSubmitApi={selectedRow}
                handleSubmitApi={(id, data) => vanbandenAxios.createXuly(id!, data!)}
                isLoading={isLoadingForm}
                onSubmitSuccess={(newData) => {
                    onCloseComposeChuyendonvixuly() // đóng modal
                    vanbandenRefetch()
                    setFormData({})

                    if (newData.send_mail && window.location.hostname == 'myoffice.nctu.edu.vn') {
                        callApi('admin/vanban/vanbanden/sendMailVBDen/' + newData.data.id_van_ban, {
                            method: 'GET'
                        })
                            .then((res) => {
                                if (res.data?.success === true) {
                                    setTimeout(() => {
                                        toast.success('Thành công', {
                                            description: res.data.message
                                        })
                                    }, 2000)
                                }
                            })
                            .catch((error) => {
                                const message = error?.response?.data?.message || 'Please call IT'

                                toast.danger('Lỗi', {
                                    description: message
                                })
                            })
                    }
                }}
                formData={formData}
            >
                <FormChuyendonvixuly formData={formData} setFormData={setFormData} />
            </ModalCompose>

            {/* Modal xem phản hồi */}
            <ModalCompose
                title="Phản hồi"
                isOpenCompose={isOpenPhanhoi}
                onClose={onClosePhanhoi}
                idSubmitApi={contextRow}
                handleSubmitApi={(_id, data) => vanbandenAxios.createPhanhoi(_id!, data!)}
                fileGroups={fileGroups}
                onSubmitSuccess={() => {
                    // console.log('thành công')
                }}
                formData={{}}
                footerContent={
                    <>
                        <InputPhanhoi name="noi_dung" />
                    </>
                }
            >
                <FormPhanhoi id={contextRow} onFilesChange={onFilesChange} type="vanbanden" />
            </ModalCompose>
            {/* Comfirm Xem đơn vị được phân công */}

            <ModalCompose
                title="Đơn vị được phân công"
                size="4xl"
                isOpenCompose={isOpenXemPhanCong}
                onClose={onCloseXemPhanCong}
                idSubmitApi={contextRow}
            >
                <FormViewDonvixuly row={detailData} />
            </ModalCompose>
            {/* Comfirm xác nhận hoàn thành */}
            {/* Confirm xóa văn bản */}
            <ConfirmModal
                isOpen={isOpenMoveTrash}
                onClose={onCloseMoveTrash}
                title="Chuyển vào thùng rác"
                content="Bạn có chắc chắn muốn chuyển văn bản này vào thùng rác không?"
                onConfirm={confirmMoveToTrash}
                isLoading={isMovingTrash}
                isDanger={true}
            />

            <ConfirmModal
                isOpen={isOpenRecall}
                onClose={onCloseRecall}
                title="Xác nhận thu hồi"
                size="xl"
                content={
                    <div className="flex flex-col gap-2">
                        <div className="mb-3">Bạn có chắc chắn muốn thu hồi văn bản này không?</div>
                        <div className="text-xs text-gray-400">
                            * Nếu văn bản đã được phân công xử lý, các đơn vị sẽ nhận được thông báo về việc thu
                            hồi, và các dữ liệu liên quan đến
                            <u className="text-gray-900"> phân công xử lý </u>
                            và
                            <u className="text-gray-900"> phản hồi</u> của các đơn vị đều sẽ bị xóa.
                        </div>
                    </div>
                }
                onConfirm={confirmRecall}
                isLoading={isRecalling}
                isDanger={true}
            />

            <ConfirmModal
                isOpen={isOpenComplete}
                onClose={onCloseComplete}
                title="Xác nhận hoàn thành"
                content="Bạn có chắc chắn muốn xác nhận hoàn thành cho các văn bản này không?"
                onConfirm={confirmUpdateCompleted}
                isLoading={isUpdatingStatus}
            />
            <ConfirmModal
                isOpen={isOpenRestore}
                onClose={onCloseRestore}
                title="Xác nhận khôi phục"
                content="Bạn có chắc chắn muốn khôi phục văn bản này không?"
                onConfirm={confirmRestore}
                isLoading={isRestoring}
            />
        </div>
    )
}

type ActionRowDocumentProps = {
    row: VanBanData
    onDelete?: (id: string | number) => void
    onEdit?: () => void
    onRestore?: (id: string | number) => void
    onMoveToTrash?: (id: string | number) => void
}
function ActionRowDocument({
    row,
    onDelete,
    onEdit,
    onRestore,
    onMoveToTrash
}: ActionRowDocumentProps): React.JSX.Element {
    const id = row.id_van_ban || null
    if (!id) return <></>

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 w-0 overflow-hidden group-hover:w-auto transition-all duration-500">
                <Tooltip>
                    <Button isIconOnly size="sm" variant="ghost" className="rounded-full" onPress={onEdit}>
                        <Pencil size={14} />
                    </Button>
                    <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                        Sửa
                    </Tooltip.Content>
                </Tooltip>

                {!row.deleted_at ? (
                    <>
                        <Tooltip>
                            <Button isIconOnly size="sm" variant="ghost" className="rounded-full" onPress={() => onDelete?.(id)}>
                                <RotateCcw size={14} className="text-danger" />
                            </Button>
                            <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                                Thu hồi
                            </Tooltip.Content>
                        </Tooltip>
                        <Tooltip>
                            <Button isIconOnly size="sm" variant="ghost" className="rounded-full" onPress={() => onMoveToTrash?.(id)}>
                                <Trash2 size={14} className="text-gray-500" />
                            </Button>
                            <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                                Chuyển vào thùng rác
                            </Tooltip.Content>
                        </Tooltip>
                    </>
                ) : (
                    <>
                        <Tooltip>
                            <Button isIconOnly size="sm" variant="ghost" className="rounded-full" onPress={() => onRestore?.(id)}>
                                <ArchiveRestore size={14} />
                            </Button>
                            <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                                Khôi phục
                            </Tooltip.Content>
                        </Tooltip>

                        <Tooltip>
                            <Button isIconOnly size="sm" variant="ghost" className="rounded-full" onPress={() => onDelete?.(id)}>
                                <Trash2 size={14} className="text-danger" />
                            </Button>
                            <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                                Xóa vĩnh viễn
                            </Tooltip.Content>
                        </Tooltip>
                    </>
                )}
            </div>
            <span className="text-slate-400 dark:text-slate-500 text-tiny truncate">
                {date('vi', row.ngay_tao as string)}
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
