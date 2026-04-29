import { toast } from "@heroui-v3/react"
import { Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, Tooltip, useDisclosure } from '@heroui/react'
import { mapDonviOptions } from '@renderer/api/danhmuc/DonviAxios'
import { convertSize, guessMimeType } from '@renderer/api/danhmuc/hopDong'
import { mapVitriOptions } from '@renderer/api/danhmuc/VitriAxios'
import { hopdongAxios, INITIAL_VISIBLE_COLUMNS } from '@renderer/api/hr/hopdongAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import ContextMenu from '@renderer/components/ContextMenu'
import { DrawerCommon } from '@renderer/components/DrawerCommon'
import OfficeIcon from '@renderer/components/OfficeIcon'
import TableColumnVisibility from '@renderer/components/table/TableColumnVisibility'
import TableHr from '@renderer/components/table/TableHr'
import TablePagination from '@renderer/components/table/TablePagination'
import { TableColumnType } from '@renderer/components/table/TableTypes'
import UserAvatar from '@renderer/components/UserAvatar'
import { ExistingFile } from '@renderer/shared/CommonInterface'
import { usePageActionsStore } from '@renderer/store/usePageActionsStore'
import { useHopdongStore } from '@renderer/store/useProfileStore'
import { enscrypt } from '@renderer/utils/documents/userPreview'
import openPopout from '@renderer/utils/openPopout'
import { truncateMiddle } from '@renderer/utils/string'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    ArchiveRestore,
    Edit,
    Eye,
    EyeOff,
    History,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    ServerCog,
    Trash,
    Trash2
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FormHopDong from './FormHopdong'
import HopdongFilterPopover from './HopdongFilterPopover'
import LichSuHopdongDrawer from './LichSuHopdongDrawer'
import ViewPhulucModal from './ViewPhulucModal'

type SalaryVisibility = {
    muc_luong: boolean
    muc_luong_bao_hiem: boolean
    luong_co_ban: boolean
}

type VisibilityState = Record<string | number, SalaryVisibility>

export default function HopdongPage() {
    const queryClient = useQueryClient()

    const {
        filters,
        setFilters,
        columnWidths,
        setColumnWidth,
        pinnedColumns,
        setPinnedColumn,
        sortDescriptors,
        setSortDescriptors,
        resetFilters
    } = useHopdongStore()

    const setActions = usePageActionsStore((state) => state.setActions)
    const clearActions = usePageActionsStore((state) => state.clearActions)

    const [recordsTotal, setRecordsTotal] = useState(0)
    const [recordsFiltered, setRecordsFiltered] = useState(0)
    const isShiftPressed = useRef(false)
    const [isResetting, setIsResetting] = useState(false)
    const [editingId, setEditingId] = useState<string | number | null>(null)
    const [typingValue, setTypingValue] = useState('')
    const [formData, setFormData] = useState<Record<string, object>>({})
    const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({})
    const [visibilityStates, setVisibilityStates] = useState<VisibilityState>({})

    const toggleVisibility = useCallback((id: string | number, type: keyof SalaryVisibility) => {
        setVisibilityStates((prev) => {
            const current = prev[id] || {
                muc_luong: false,
                muc_luong_bao_hiem: false,
                luong_co_ban: false
            }
            return {
                ...prev,
                [id]: {
                    ...current,
                    [type]: !current[type]
                }
            }
        })

        hopdongAxios.xemluongcoban(id)
    }, [])

    useEffect(() => {
        // console.log('visibilityStates', visibilityStates)
    }, [visibilityStates])

    // Confirm Modal State
    const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
    const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()
    const { isOpen: isOpenRestore, onOpen: onOpenRestore, onClose: onCloseRestore } = useDisclosure()

    const onFilesChange = (name: string, files: File[]) => {
        const oldFiles = fileGroups[name] || []
        const deletedFiles = oldFiles.filter(
            (old) => !files.some((f) => f.name === old.name && f.size === old.size)
        )

        if (deletedFiles.length > 0) {
            const deletedFileNames = deletedFiles.map((f) => f.name)

            const listFileOldName = ['files_dinh_kem_old']
            Object.keys(formData).forEach((key) => {
                if (!listFileOldName.includes(key)) return

                const value = formData[key]
                if (Array.isArray(value)) {
                    const matched = value.filter((item) => deletedFileNames.includes(item.file_name))
                    const notMatched = value.filter((item) => !deletedFileNames.includes(item.file_name))

                    // if (matched.length > 0) {}
                    if (notMatched.length > 0) {
                        setFormData((p) => ({ ...p, [key]: notMatched }))
                    }
                }
            })
        }

        setFileGroups((p) => ({ ...p, [name]: files }))
    }
    const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])
    const { isOpen: isOpenDrawer, onClose: onCloseDrawer, onOpen: onOpenDrawer } = useDisclosure()
    const {
        isOpen: isOpenDrawerEdit,
        onClose: onCloseDrawerEdit,
        onOpen: onOpenDrawerEdit
    } = useDisclosure()
    const {
        isOpen: isOpenLichSu,
        onClose: onCloseLichSu,
        onOpen: onOpenLichSu
    } = useDisclosure()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') isShiftPressed.current = true
        }
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') isShiftPressed.current = false
        }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useEffect(() => {
        setActions(
            <Button
                variant="flat"
                className="h-9 px-3 font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                radius="sm"
                onPress={onOpenLichSu}
                startContent={<History size={16} />}
            >
                Lịch sử chỉnh sửa
            </Button>
        )
        return () => clearActions()
    }, [onOpenLichSu, setActions, clearActions])

    const {
        data: responseData,
        isLoading: isLoadingHopdong,
        isFetching: isFetchingHopdong,
        refetch: hopdongRefetch
    } = useQuery({
        queryKey: [
            'hopdongData',
            filters.page,
            filters.length,
            filters.searchValue,
            filters,
            sortDescriptors
        ],
        queryFn: async () => {
            const payload = {
                searchValue: filters.searchValue,
                searchKey: JSON.stringify({
                    searchValue: filters.searchValue,
                    selectedClassify: filters.selectedClassify || 'all',
                    so_hop_dong: 'so_hop_dong' in filters ? filters.so_hop_dong : '',
                    loai_hop_dong: 'loai_hop_dong' in filters ? filters.loai_hop_dong : '',
                    ngay_ky_tu: 'ngay_ky_tu' in filters ? filters.ngay_ky_tu : '',
                    ngay_ky_den: 'ngay_ky_den' in filters ? filters.ngay_ky_den : '',
                    ngay_ket_thuc_tu: 'ngay_ket_thuc_tu' in filters ? filters.ngay_ket_thuc_tu : '',
                    ngay_ket_thuc_den: 'ngay_ket_thuc_den' in filters ? filters.ngay_ket_thuc_den : ''
                }),
                fromDate: filters.dateRange.fromDate || undefined,
                toDate: filters.dateRange.toDate || undefined,
                order: sortDescriptors.map((desc) => ({
                    column: desc.column,
                    dir: desc.direction === 'ascending' ? 'asc' : 'desc'
                })),
                start: (filters.page - 1) * (filters.length || 10),
                length: filters.length || 10,
                // Additional
                page: filters.page
            }
            const response = await hopdongAxios.fetch(payload)
            return response
        }
    })

    const { data: donviOptions = [], isLoading: isLoadingDonvi } = useQuery({
        queryKey: ['donviOptions'],
        queryFn: mapDonviOptions
    })

    const { data: vitriOptions = [], isLoading: isLoadingVitri } = useQuery({
        queryKey: ['vitriOptions'],
        queryFn: mapVitriOptions
    })

    const [users, setUsers] = useState<any[]>([])
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]))
    const [contextMenu, setContextMenu] = useState<{
        x: number
        y: number
        isOpen: boolean
        row: any | null
    }>({
        x: 0,
        y: 0,
        isOpen: false,
        row: null
    })

    const [idToRestore, setIdToRestore] = useState<(string | number) | (string | number)[] | null>(
        null
    )
    const [isRestoring, setIsRestoring] = useState(false)

    // State specific for ViewPhulucModal
    const [viewPhulucContractId, setViewPhulucContractId] = useState<string | number | null>(null)
    const [viewPhulucContractData, setViewPhulucContractData] = useState<any>(null)
    const { isOpen: isOpenPhuluc, onOpen: onOpenPhuluc, onClose: onClosePhuluc } = useDisclosure()

    const handleOpenPhuluc = useCallback((contractId: string | number, rowData?: any) => {
        setViewPhulucContractId(contractId)
        if (rowData) setViewPhulucContractData(rowData)
        onOpenPhuluc()
    }, [])

    const confirmRestore = async () => {
        // ... existing code

        if (!idToRestore) return
        setIsRestoring(true)

        const payload = {
            key: 'deleted_at',
            value: null
        }

        const formData = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
            formData.append(k, v ?? '')
        })

        await hopdongAxios
            .update(String(idToRestore), formData)
            .then((response) => {
                console.log('response: ', response)
                if (response.success) {
                    hopdongRefetch().then(() => {
                        toast('Khôi phục hợp đồng thành công', { variant: 'success' })
                    })
                } else {
                    toast(`Khôi phục hợp đồng thất bại: ${response.message || ''}`, { variant: 'danger' })
                }
            })
            .finally(() => {
                setIsRestoring(false)
                onCloseRestore()
                setIdToRestore(null)
            })
    }

    const handleResetTable = () => {
        setIsResetting(true)
        setTimeout(() => {
            setIsResetting(false)
        }, 500)
    }

    useEffect(() => {
        if (responseData?.data) {
            setUsers(responseData.data)
            setRecordsTotal(responseData.recordsTotal)
            setRecordsFiltered(responseData.recordsFiltered)
        }
    }, [responseData])

    useEffect(() => {
        // console.log('Selected IDs:', Array.from(selectedKeys))
    }, [selectedKeys])

    const handleRowChange = useCallback((id: string | number, columnUid: string, value: any) => {
        setUsers((prev) =>
            prev.map((row) => {
                if (row.id_nhan_vien === id) {
                    return { ...row, [columnUid]: value }
                }
                return row
            })
        )
        console.log('Row changed:', { id, columnUid, value })
    }, [])

    const handleContextMenu = (e: React.MouseEvent, row: any) => {
        setContextMenu({ x: e.clientX, y: e.clientY, isOpen: true, row })
    }

    const handleCloseContextMenu = () => {
        setContextMenu({ x: 0, y: 0, isOpen: false, row: null })
    }

    const handleDelete = (ids: (string | number) | (string | number)[]) => {
        setDeletingId(ids)
        onOpenConfirm()
    }

    const onConfirmDelete = async () => {
        if (!deletingId) return
        const payload = Array.isArray(deletingId) ? deletingId : [deletingId]

        try {
            const response = await hopdongAxios.delete({ ids: payload })
            if (response.status === 200) {
                hopdongRefetch().then(() => {
                    if (response.success) {
                        toast(response.message || 'Xóa hợp đồng thành công', { variant: 'success' })
                    } else {
                        toast(response.message || 'Xóa hợp đồng thất bại', { variant: 'danger' })
                    }
                })
            }
        } catch (error) {
            console.error(error)
            toast('Có lỗi xảy ra', { variant: 'danger' })
        } finally {
            onCloseConfirm()
            setDeletingId(null)
        }
    }

    const menuItems = [
        // {
        //   label: 'Xem chi tiết',
        //   icon: <Eye size={16} />,
        //   onClick: () => console.log('View', contextMenu.row)
        // },
        {
            label: 'Chỉnh sửa',
            icon: <Edit size={16} />,
            onClick: async () => {
                // const data = contextMenu.row
                const response = await hopdongAxios.show(contextMenu.row.id_hop_dong)
                // const data = response.data
                const { files_hop_dong, ...data } = response.data
                setEditingId(data.id_hop_dong)
                setFormData({
                    ...data,
                    // files_hop_dong: data.files_hop_dong,
                    files_dinh_kem_old: files_hop_dong // tại vì đã tách data.files_hop_dong thành files_hop_dong
                })
                if (files_hop_dong && files_hop_dong.length > 0) {
                    const existingFiles = files_hop_dong.map((f) => ({
                        // id: Number(f.id_file_dinh_kem), không có id
                        id: Number(f.file_path),
                        name: f.file_name,
                        size: convertSize(f.file_size),
                        url: f.file_path, // hoặc API cung cấp URL decode
                        type: guessMimeType(f.file_name)
                    }))

                    setExistingFiles(existingFiles)
                }

                onOpenDrawerEdit()
            }
        },
        { label: 'separator' },
        {
            label: 'Xóa',
            icon: <Trash size={16} />,
            onClick: () => {
                handleDelete([contextMenu.row.id_hop_dong])
                // console.log('Delete', contextMenu.row) }
            }
        }
    ]

    // Preview file
    const handlePreview = async (url: string, name: string): Promise<void> => {
        const link = await enscrypt(url, name)
        if (link) {
            openPopout(link, name)
        }
    }

    const handleRestore = (id: (string | number) | (string | number)[]) => {
        setIdToRestore(id)
        onOpenRestore()
    }

    const allColumns: TableColumnType[] = useMemo(() => {
        const columns: TableColumnType[] = [
            {
                uid: 'stt',
                sortable: false,
                name: '#',
                width: 40,
                className: 'text-center w-10 p-0 font-bold',
                pinned: 'left'
            },
            {
                uid: 'ten_nguoi_tao',
                name: 'Người tạo',
                width: 104,
                className: 'w-26 pl-1.5!',
                editable: false
                // render: (_, row: any) => (
                //   <div className="text-zinc-500 overflow-hidden text-ellipsis whitespace-nowrap w-30">
                //     {row.ten_nguoi_tao} ---
                //     <div>
                //       <small>{row.email_nguoi_tao}</small>
                //     </div>
                //   </div>
                // )
            },
            {
                uid: 'dang_hieu_luc',
                name: 'Trạng thái',
                width: 80,
                className: 'w-16 pl-1.5!',
                editable: false,
                render: (_, row: any) => {
                    const isActive = Number(row.dang_hieu_luc) === 1

                    return (
                        <div
                            className={`
          inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
          ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
        `}
                        >
                            <span
                                className={`
            w-2 h-2 rounded-full 
            ${isActive ? 'bg-green-500' : 'bg-red-500'}
          `}
                            ></span>

                            {isActive ? 'Có hiệu lực' : 'Hết hiệu lực'}
                        </div>
                    )
                }
            },
            {
                uid: 'so_hop_dong',
                name: 'Số hợp đồng',
                width: 104,
                className: 'w-26 pl-1.5!',
                editable: false,
                render: (_, row: any) => (
                    <div className="flex justify-between gap-2 items-center p-0.5 pr-3 w-10">
                        <div className="flex flex-col grow">
                            <span className="mb-1 whitespace-nowrap">{row.so_hop_dong}</span>
                            {row.files_hop_dong?.length > 0 && (
                                <span className="text-gray-500">
                                    {row.files_hop_dong.map((f, index) => (
                                        <Chip
                                            key={f.file_name + index}
                                            size="sm"
                                            className="text-xs bg-transparent border-1 border-gray-300 p-1 mr-1 mb-1 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handlePreview(f.file_path, f.file_name)
                                            }}
                                        >
                                            <div className="flex gap-2">
                                                <OfficeIcon name={f.file_name} size={14} />
                                                <span className="text-gray-600">{truncateMiddle(f.file_name)}</span>
                                            </div>
                                        </Chip>
                                    ))}
                                </span>
                            )}
                        </div>
                    </div>
                )
            },
            {
                uid: 'ho_va_ten',
                name: 'Họ và tên',
                className: 'pl-1.5! w-40', // <-- width thật của cột
                width: 200,
                editable: false,
                render: (_, row: any) => (
                    <div className="flex justify-between gap-2 items-center p-0.5 pr-3 w-40">
                        <div className="flex justify-center p-0.5 w-full">
                            <UserAvatar name={row.ho_va_ten} gender={row.gioi_tinh} src={row.anh_dai_dien} />
                        </div>
                        <div className="flex flex-col grow">
                            <div className="text-zinc-500 overflow-hidden text-ellipsis whitespace-nowrap w-40">
                                {row.ho_va_ten}
                                <div>
                                    <small className="whitespace-nowrap">{row.ten_don_vi}</small>
                                </div>
                            </div>
                        </div>
                        <span>
                            <ActionRowDocument
                                data={row}
                                onDelete={handleDelete}
                                onRestore={handleRestore}
                                onOpenDrawerEdit={async () => {
                                    const id = row['id_hop_dong'] as string | number
                                    const response = await hopdongAxios.show(id)
                                    // const data = response.data
                                    const { files_hop_dong, ...data } = response.data
                                    setEditingId(data.id_hop_dong)
                                    setFormData({
                                        ...data,
                                        // files_hop_dong: data.files_hop_dong,
                                        files_dinh_kem_old: files_hop_dong // tại vì đã tách data.files_hop_dong thành files_hop_dong
                                    })
                                    if (files_hop_dong && files_hop_dong.length > 0) {
                                        const existingFiles = files_hop_dong.map((f) => ({
                                            // id: Number(f.id_file_dinh_kem), không có id
                                            id: Number(f.file_path),
                                            name: f.file_name,
                                            size: convertSize(f.file_size),
                                            url: f.file_path, // hoặc API cung cấp URL decode
                                            type: guessMimeType(f.file_name)
                                        }))

                                        setExistingFiles(existingFiles)
                                    }

                                    onOpenDrawerEdit()
                                }}
                            />
                        </span>
                    </div>
                )
            },
            {
                uid: 'ngay_bat_dau',
                name: 'Ngày bắt đầu',
                width: 120,
                className: 'w-30 pl-1.5! text-center',
                editable: false,
                render: (_, row: any) => {
                    const value = row.ngay_bat_dau

                    if (!value) return <div className="text-zinc-600 w-24 whitespace-nowrap"></div>

                    const date = new Date(value)
                    const formatted = date.toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })

                    return <div className="text-zinc-600 w-24 whitespace-nowrap">{formatted}</div>
                }
            },
            {
                uid: 'ngay_ket_thuc',
                name: 'Ngày kết thúc',
                width: 120,
                className: 'w-30 pl-1.5! text-center',
                editable: false,
                render: (_, row: any) => {
                    const value = row.ngay_ket_thuc

                    if (!value) return <div className="text-zinc-600 w-24 whitespace-nowrap"></div>

                    const date = new Date(value)
                    const formatted = date.toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })

                    return <div className="text-zinc-600 w-24 whitespace-nowrap">{formatted}</div>
                }
            },
            {
                uid: 'tong_phu_luc',
                name: 'Tổng phụ lục',
                width: 120,
                className: 'w-30 pl-1.5! text-center',
                editable: false,
                render: (_, row: any) => {
                    const total = row.tong_phu_luc ?? 0

                    return (
                        <button
                            className="text-blue-600 underline underline-offset-2 hover:text-blue-800 font-medium"
                            onClick={() => handleOpenPhuluc(row.id_hop_dong, row)}
                        >
                            {total} phụ lục
                        </button>
                    )
                }
            },
            {
                uid: 'luong_co_ban',
                name: 'Lương cơ bản',
                width: 120,
                className: 'w-28 pl-1.5! hidden lg:table-cell',
                editable: false,
                render: (_, row: any) => {
                    const value = row.luong_co_ban
                    const isVisible = visibilityStates[row.id_hop_dong]?.luong_co_ban

                    const formatted = Number(value || 0).toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })

                    return (
                        <div className="flex items-center gap-2 text-zinc-600 w-28">
                            <span className="truncate">{isVisible ? formatted : '**********'}</span>

                            <button
                                className="cursor-pointer text-gray-500 hover:text-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleVisibility(row.id_hop_dong, 'luong_co_ban')
                                }}
                            >
                                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    )
                }
            },
            {
                uid: 'muc_luong_bao_hiem',
                name: 'Lương có bảo hiểm',
                width: 120,
                className: 'w-28 pl-1.5! hidden lg:table-cell',
                editable: false,
                render: (_, row: any) => {
                    const value = row.muc_luong_bao_hiem
                    const isVisible = visibilityStates[row.id_hop_dong]?.muc_luong_bao_hiem

                    const formatted = Number(value || 0).toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })

                    return (
                        <div className="flex items-center gap-2 text-zinc-600 w-28">
                            <span className="truncate">{isVisible ? formatted : '**********'}</span>

                            <button
                                className="cursor-pointer text-gray-500 hover:text-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleVisibility(row.id_hop_dong, 'muc_luong_bao_hiem')
                                }}
                            >
                                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    )
                }
            },
            {
                uid: 'muc_luong',
                name: 'Mức lương',
                width: 120,
                className: 'w-28 pl-1.5! hidden lg:table-cell',
                editable: false,
                render: (_, row: any) => {
                    const value = row.muc_luong
                    const isVisible = visibilityStates[row.id_hop_dong]?.muc_luong

                    const formatted = Number(value || 0).toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })

                    return (
                        <div className="flex items-center gap-2 text-zinc-600 w-28">
                            <span className="truncate">{isVisible ? formatted : '**********'}</span>

                            <button
                                className="cursor-pointer text-gray-500 hover:text-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleVisibility(row.id_hop_dong, 'muc_luong')
                                }}
                            >
                                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    )
                }
            }
        ]

        return columns.map((col) => ({
            ...col,
            pinned: Object.prototype.hasOwnProperty.call(pinnedColumns, col.uid)
                ? pinnedColumns[col.uid]
                : col.pinned
        }))
    }, [
        donviOptions,
        vitriOptions,
        handleRowChange,
        pinnedColumns,
        visibilityStates,
        toggleVisibility,
        handleOpenPhuluc
    ])

    const columns = useMemo(() => {
        const currentVisible = filters.initial_visible_columns
            ? new Set(filters.initial_visible_columns)
            : new Set(INITIAL_VISIBLE_COLUMNS)

        return allColumns.filter((col) => currentVisible.has(col.uid))
    }, [allColumns, filters.initial_visible_columns])

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

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-110px)]">
            <div className="flex flex-col gap-3 px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto flex-1">
                        <Input
                            type="search"
                            placeholder="Tìm kiếm..."
                            startContent={<Search className="text-gray-400" size={22} />}
                            value={filters.searchValue || ''}
                            onValueChange={(val) => {
                                setTypingValue(val)
                            }}
                            radius="sm"
                            className="w-full md:max-w-[400px]"
                            classNames={{
                                inputWrapper:
                                    'bg-white border border-gray-200 shadow-none hover:bg-gray-50 hover:border-gray-300 h-10 pr-2 transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 group-data-[focus=true]:border-blue-500 dark:group-data-[focus=true]:border-blue-400',
                                input: 'text-sm'
                            }}
                            endContent={
                                <div className="flex items-center gap-1">
                                    {isLoadingHopdong && <Spinner size="sm" />}
                                    <HopdongFilterPopover
                                        filter={filters}
                                        onFilterChange={setFilters}
                                        onClear={resetFilters}
                                    />
                                </div>
                            }
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <TableColumnVisibility
                            columns={allColumns}
                            visibleColumns={new Set(filters.initial_visible_columns)}
                            setVisibleColumns={(keys: Set<string>) => {
                                setFilters({ initial_visible_columns: [...keys] })
                            }}
                            label="Cột"
                        />
                        <Button
                            color="primary"
                            className="font-bold shadow-md shadow-blue-50/20 px-4 h-10"
                            radius="sm"
                            onPress={onOpenDrawer}
                            startContent={<Plus size={18} />}
                        >
                            Thêm hợp đồng
                        </Button>
                        <Tooltip content="Cài đặt bảng" closeDelay={0}>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        variant="light"
                                        radius="sm"
                                        isIconOnly
                                        className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 h-10 w-10"
                                    >
                                        <ServerCog size={20} strokeWidth={1.5} className="text-gray-600 dark:text-gray-300" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Table Settings" variant="flat">
                                    <DropdownItem
                                        key="reset"
                                        startContent={<RotateCcw size={16} />}
                                        onPress={handleResetTable}
                                        className="text-danger"
                                        color="danger"
                                    >
                                        Khôi phục mặc định
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white overflow-hidden flex flex-col relative">
                <div className="flex-1 overflow-hidden relative">
                    <TableHr
                        columns={columns}
                        data={users}
                        isLoading={isLoadingHopdong || isLoadingDonvi || isLoadingVitri || isResetting}
                        primaryKey="id_hop_dong"
                        onRowChange={handleRowChange}
                        selectedKeys={selectedKeys}
                        onSelectionChange={setSelectedKeys}
                        columnWidths={columnWidths}
                        onColumnResize={setColumnWidth}
                        onRowContextMenu={handleContextMenu}
                        contextMenuRowId={contextMenu.row?.id_hop_dong}
                        onPinColumn={setPinnedColumn}
                        enableStickyScrollbar={true}
                        borderColor="border-gray-200"
                        editable={true}
                        sortDescriptors={sortDescriptors}
                        onSortChange={setSortDescriptors}
                    />
                </div>
                <TablePagination
                    page={filters.page}
                    total={recordsTotal}
                    filtered={recordsFiltered}
                    limit={filters.length}
                    onChangePage={(val) => setFilters({ page: val })}
                    onChangeLimit={(val) => {
                        setFilters({ length: val })
                        setFilters({ page: 1 })
                    }}
                    className="sticky bottom-0 z-50"
                />
                {contextMenu.isOpen && (
                    <ContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        isOpen={contextMenu.isOpen}
                        items={menuItems}
                        onClose={handleCloseContextMenu}
                    />
                )}
            </div>

            <DrawerCommon
                title="Thêm hợp đồng"
                open={isOpenDrawer}
                onClose={onCloseDrawer}
                handleSubmitApi={async (_id, data) => {
                    const res = await hopdongAxios.create(data!)
                    // @ts-ignore
                    if (res && res.success && res.data?.id_hop_dong) {
                        // @ts-ignore
                        const newId = res.data.id_hop_dong

                        setVisibilityStates((prev) => ({
                            ...prev,
                            [newId]: {
                                muc_luong: false,
                                muc_luong_bao_hiem: false,
                                luong_co_ban: false
                            }
                        }))
                    }
                    return res
                }}
                formData={formData}
                fileGroups={fileGroups}
                onSubmitSuccess={() => {
                    queryClient.invalidateQueries({
                        queryKey: ['hopdongData']
                    })
                    setFormData({})
                    setFileGroups({})
                    setExistingFiles([])
                }}
            >
                <FormHopDong
                    formData={formData}
                    setFormData={setFormData}
                    onFilesChange={onFilesChange}
                    isEditting={false}
                />
            </DrawerCommon>

            <DrawerCommon
                title="Sửa hợp đồng"
                open={isOpenDrawerEdit}
                onClose={() => {
                    onCloseDrawerEdit()
                    setFormData({})
                    setFileGroups({})
                }}
                handleSubmitApi={(_id, data) => hopdongAxios.update(String(editingId), data!)}
                formData={formData}
                fileGroups={fileGroups}
                onSubmitSuccess={() => {
                    queryClient.invalidateQueries({
                        queryKey: ['hopdongData']
                    })
                    setFormData({})
                    setFileGroups({})
                    setExistingFiles([])
                }}
            >
                <FormHopDong
                    formData={formData}
                    setFormData={setFormData}
                    onFilesChange={onFilesChange}
                    existingFiles={existingFiles}
                    isEditting={true}
                />
            </DrawerCommon>

            <ConfirmModal
                isOpen={isOpenConfirm}
                onClose={onCloseConfirm}
                onConfirm={onConfirmDelete}
                title="Xác nhận xóa"
                content="Bạn có chắc chắn muốn xóa hợp đồng này không? Hành động này không thể hoàn tác."
                isDanger
            />

            {/* Modal Khôi phục */}
            <Modal isOpen={isOpenRestore} onClose={onCloseRestore}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Xác nhận khôi phục</ModalHeader>
                    <ModalBody>
                        <p>Bạn có chắc chắn muốn khôi phục văn bản này?</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onCloseRestore}>
                            Hủy
                        </Button>
                        <Button color="primary" onPress={confirmRestore} isLoading={isRestoring}>
                            Xác nhận
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <ViewPhulucModal
                isOpen={isOpenPhuluc}
                onOpenChange={onClosePhuluc}
                contractId={viewPhulucContractId}
                contractData={viewPhulucContractData}
                onChangeData={(newData) => {
                    queryClient.invalidateQueries({
                        queryKey: ['hopdongData']
                    })
                }}
            />

            <LichSuHopdongDrawer open={isOpenLichSu} onClose={onCloseLichSu} />
        </div>
    )
}

function ActionRowDocument({
    data,
    onDelete,
    onRestore,
    onOpenDrawerEdit = () => { }
}: {
    data: Record<string, unknown>
    onDelete: (ids: (string | number)[]) => void
    onRestore?: (id: string | number) => void
    onOpenDrawerEdit?: () => void
}): React.JSX.Element {
    if (!data) return <></>
    const id = data.id_hop_dong as string | number

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 w-0 overflow-hidden group-hover:w-auto transition-all duration-500">
                <Tooltip content="Sửa" className="capitalize bg-slate-100" radius="none">
                    <Button
                        isIconOnly
                        radius="full"
                        size="sm"
                        variant="light"
                        onPress={() => {
                            onOpenDrawerEdit()
                        }}
                    >
                        <Pencil size={14} />
                    </Button>
                </Tooltip>

                {!data.deleted_at ? (
                    <>
                        <Tooltip
                            content="Chuyển vào thùng rác"
                            className="capitalize bg-slate-100"
                            radius="none"
                        >
                            <Button
                                isIconOnly
                                radius="full"
                                size="sm"
                                variant="light"
                                onPress={() => {
                                    onDelete([id])
                                }}
                            >
                                <Trash2 size={14} className="text-red-500" />
                            </Button>
                        </Tooltip>
                    </>
                ) : (
                    <Tooltip content="Khôi phục" className="capitalize bg-slate-100" radius="none">
                        <Button
                            isIconOnly
                            radius="full"
                            size="sm"
                            variant="light"
                            onPress={() => onRestore?.(id)}
                        >
                            <ArchiveRestore size={14} className="text-teal-500" />
                        </Button>
                    </Tooltip>
                )}
            </div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] truncate"></span>
        </div>
    )
}
