import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Button, Chip, toast, Tooltip } from '@heroui-v3/react'
import { vanbandendonviAxios } from '@renderer/api/documents/vanbandendonviAxios'
import {
    DrawerContentCustom,
    DrawerCustom,
    DrawerHeaderCustom
} from '@renderer/components/DrawerCustom'
import LoadingOverlay from '@renderer/components/LoadingOverlay'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { VanBanData } from '@renderer/shared/CommonInterface'
import { download, enscrypt } from '@renderer/utils/documents/userPreview'
import { date } from '@renderer/utils/formatDate'
import openPopout from '@renderer/utils/openPopout'
import {
    Archive,
    BookmarkPlus,
    Building2,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    ChevronUp,
    Copy,
    Download,
    Eye,
    FileText,
    FileX,
    Folders,
    History as HistoryIcon,
    Landmark,
    Link,
    Mail,
    MessagesSquare,
    SquareChevronDown,
    User
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import ContentButPhe from '../content/ContentButPhe'
import ContentDonvixuly from '../content/ContentDonvixuly'
import ContentHistoryLog from '../content/ContentHistoryLog'
import ContentPhanhoi from '../content/ContentPhanhoi'
import ContentThongtinbanhanh from '../content/ContentThongtinbanhanh'
import ContentTimeLine from '../content/ContentTimeLine'

type DrawerDocumentProps = {
    open: boolean
    onClose: () => void
    data?: VanBanData | null
    isLoading?: boolean
    indexRow: number
    setIndexRow: (index: number) => void
    actionClone?: (id: string | number) => void
    defaultTab?: string
}
type FileLinksMap = { [originalPath: string]: string | null }

export default function DrawerDocument({
    open,
    onClose,
    data,
    isLoading,
    indexRow,
    setIndexRow,
    actionClone,
    defaultTab
}: DrawerDocumentProps) {
    const [doc, setDoc] = useState<VanBanData | null>(null)
    const [isVanbanden, setIsVanbanden] = useState<boolean>(false)
    const [finalLink, setFinalLink] = useState<FileLinksMap>({})
    const [selectedTab, setSelectedTab] = useState<string | number>('info')
    const location = useLocation()
    const pathname = location.pathname
    const tabsRef = React.useRef<HTMLDivElement>(null)

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsRef.current) {
            const { scrollLeft } = tabsRef.current
            const scrollTo = direction === 'left' ? scrollLeft - 200 : scrollLeft + 200
            tabsRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
        }
    }

    let logType: 'den' | 'di' | 'didonvi' | 'dendonvi' | 'noibo' = 'den'
    if (pathname.includes('vanbandidonvi')) {
        logType = 'didonvi'
    } else if (pathname.includes('vanbandendonvi')) {
        logType = 'dendonvi'
    } else if (pathname.includes('vanbannoibo')) {
        logType = 'noibo'
    } else if (pathname.includes('vanbandi')) {
        logType = 'di'
    }

    const canCopyLinkDocument = true

    const routeMap: Record<string, string> = {
        den: 'vanbanden',
        di: 'vanbandi',
        didonvi: 'vanbandidonvi',
        dendonvi: 'vanbandendonvi',
        noibo: 'vanbannoibo'
    }
    const currentRoute = routeMap[logType] || 'vanbanden'

    useEffect(() => {
        setDoc(null)
        setFinalLink({}) // Reset links mỗi khi mở/đổi data
        if (!open || !data) return

        setTimeout(() => {
            setDoc(data)
            setIsVanbanden(data.loai_van_ban === '1')
        }, 500)

        // ✅ FIX 2: GỌI LOGIC MÃ HÓA CHO TẤT CẢ FILE TRONG useEffect này
        if (data.files && data.files.length > 0) {
            const fetchLinks = async () => {
                const linksMap: FileLinksMap = {}
                for (const file of data.files) {
                    // Gọi enscrypt cho từng file
                    const link = await enscrypt(file.duong_dan, file.ten_file_goc)
                    linksMap[file.duong_dan] = link // Lưu link mới vào Map
                }
                setFinalLink(linksMap)
            }
            fetchLinks()
        }
    }, [data, open]) // Dependencies: data và open

    // Xử lý preview file
    const handlePreview = useCallback(async (url: string, name: string): Promise<void> => {
        const link = await enscrypt(url, name)
        if (link) {
            openPopout(link, name)
        }
    }, [])

    // Xử lý download file
    const handleDownload = useCallback(async (url: string, name: string): Promise<void> => {
        const link = await enscrypt(url, name)
        if (link) {
            download(link)
        }
    }, [])

    // Render danh sách file với useMemo để tránh lỗi hooks
    const fileList: React.ReactNode = useMemo(() => {
        const files = doc?.files || []

        if (files.length === 0) return null

        return files.map((file: any, index: number) => {
            return (
                <div
                    key={`${file.duong_dan}-${index}`}
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-md mb-2 w-full max-w-full overflow-hidden bg-white dark:bg-gray-800"
                >
                    <div className="flex items-center gap-3">
                        <span className="shrink-0">
                            <OfficeIcon name={file.ten_file_goc} size={32} />
                        </span>

                        <div className="grow text-xs overflow-hidden">
                            <div className="font-medium truncate dark:text-gray-200">{file.ten_file_goc}</div>
                            <div className="text-gray-500 dark:text-gray-400 truncate">{file.dung_luong}</div>
                        </div>

                        <div className="flex shrink-0 gap-1 ml-2">
                            <Tooltip>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => handleDownload(file.duong_dan, file.ten_file_goc)}
                                >
                                    <Download size={14} />
                                </Button>
                                <Tooltip.Content className="capitalize bg-slate-100 cursor-pointer rounded-none">
                                    Tải xuống
                                </Tooltip.Content>
                            </Tooltip>

                            <Tooltip>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => handlePreview(file.duong_dan, file.ten_file_goc)}
                                >
                                    <Eye size={14} />
                                </Button>
                                <Tooltip.Content className="capitalize bg-slate-100 cursor-pointer rounded-none">
                                    Xem trước
                                </Tooltip.Content>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            )
        })
    }, [doc?.files, finalLink, handleDownload, handlePreview])

    const fileInternalList: React.ReactNode = useMemo(() => {
        const files = doc?.files_tchc || []

        if (files.length === 0) return null

        return files.map((file: any, index: number) => {
            return (
                <div
                    key={`${file.duong_dan}-${index}`}
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-md mb-2 w-full max-w-full overflow-hidden bg-white dark:bg-gray-800"
                >
                    <div className="flex items-center gap-3">
                        <span className="shrink-0">
                            <OfficeIcon name={file.ten_file_goc} size={32} />
                        </span>

                        <div className="grow text-xs overflow-hidden">
                            <div className="font-medium truncate dark:text-gray-200">{file.ten_file_goc}</div>
                            <div className="text-gray-500 dark:text-gray-400 truncate">{file.dung_luong}</div>
                        </div>

                        <div className="flex shrink-0 gap-1 ml-2">
                            <Tooltip>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => handleDownload(file.duong_dan, file.ten_file_goc)}
                                >
                                    <Download size={14} />
                                </Button>
                                <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                                    Tải xuống
                                </Tooltip.Content>
                            </Tooltip>

                            <Tooltip>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => handlePreview(file.duong_dan, file.ten_file_goc)}
                                >
                                    <Eye size={14} />
                                </Button>
                                <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                                    Xem trước
                                </Tooltip.Content>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            )
        })
    }, [doc?.files, finalLink, handleDownload, handlePreview])

    const handleReload = async () => {
        if (!doc?.id_van_ban) return
        try {
            const res = await vanbandendonviAxios.show(doc.id_van_ban)
            if (res?.data) {
                setDoc((prev) => ({ ...prev, ...res.data }))
            } else if (res) {
                setDoc((prev) => ({ ...prev, ...res }))
            }
        } catch (error) {
            console.error('Reload error', error)
        }
    }

    if (!open) return null

    const nextRowIndex = () => {
        indexRow >= 0 ? setIndexRow(indexRow + 1) : indexRow
    }
    const prevRowIndex = () => {
        indexRow >= 0 ? setIndexRow(indexRow - 1) : indexRow
    }

    return (
        <DrawerCustom open={open} position="right">
            <LoadingOverlay visible={isLoading} />
            <DrawerHeaderCustom title="Chi tiết văn bản" onClose={onClose}>
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <Button isIconOnly size="sm" variant="ghost" onPress={onClose}>
                            <ChevronsRight size={18} />
                        </Button>
                        <Tooltip.Content className="capitalize bg-slate-100 rounded-none" placement="left">
                            Đóng
                        </Tooltip.Content>
                    </Tooltip>
                    {doc && (
                        <div className="flex items-center gap-2">
                            {logType === 'dendonvi' ? (
                                <Tooltip>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="border border-gray-200 dark:border-gray-700 flex gap-2 items-center"
                                        onPress={async () => {
                                            try {
                                                const res: any = await vanbandendonviAxios.saveToInternal(doc.id_van_ban)
                                                if (res?.success) toast.success('Đã lưu vào Công văn nội bộ')
                                                else toast.danger(res?.message || 'Có lỗi xảy ra')
                                            } catch (e) {
                                                toast.danger('Có lỗi xảy ra')
                                            }
                                        }}
                                    >
                                        <BookmarkPlus size={16} />
                                        Lưu vào nội bộ
                                    </Button>
                                    <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                                        Lưu vào Công văn nội bộ
                                    </Tooltip.Content>
                                </Tooltip>
                            ) : (
                                <Tooltip>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="border border-gray-200 dark:border-gray-700 flex gap-2 items-center"
                                        onPress={() => actionClone?.(doc?.id_van_ban || 0)}
                                    >
                                        <Copy size={16} />
                                        Tạo bản sao
                                    </Button>
                                    <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                                        Tạo bản sao
                                    </Tooltip.Content>
                                </Tooltip>
                            )}

                            {canCopyLinkDocument && (
                                <Tooltip>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onPress={async () => {
                                            try {
                                                const currentDomain = window.location.origin || 'http://localhost:5173'
                                                const baseUrl = import.meta.env.VITE_BASE_URL.endsWith('/')
                                                    ? import.meta.env.VITE_BASE_URL
                                                    : import.meta.env.VITE_BASE_URL + '/'

                                                await navigator.clipboard.writeText(
                                                    `${currentDomain + baseUrl}${currentRoute}${doc?.id_van_ban ? '/' + doc?.id_van_ban : ''}`
                                                )
                                                toast.success('Đã sao chép link!')
                                            } catch (error) {
                                                console.log('Lỗi sao chép link:', error)
                                            }
                                        }}
                                        isIconOnly
                                        className="border border-gray-200 dark:border-gray-700"
                                    >
                                        <Link size={16} />
                                    </Button>
                                    <Tooltip.Content className="capitalize bg-slate-100 rounded-none">
                                        Sao chép link
                                    </Tooltip.Content>
                                </Tooltip>
                            )}

                            <Button
                                size="sm"
                                className="border border-gray-200 hidden flex items-center gap-2"
                                variant="primary"
                            >
                                <BookmarkPlus size={16} />
                                Thêm vào nội bộ
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex justify-content-between">
                    <div className="grow"></div>
                    <div className="flex items-center gap-1">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            className="border-1 text-gray-500 dark:text-gray-400 dark:border-gray-600"
                            onPress={prevRowIndex}
                        >
                            <ChevronUp size={18} />
                        </Button>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            className="border-1 text-gray-500 dark:text-gray-400 dark:border-gray-600"
                            onPress={nextRowIndex}
                        >
                            <ChevronDown size={18} />
                        </Button>
                    </div>
                </div>
            </DrawerHeaderCustom>

            {doc && (
                <div className="w-full border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shrink-0 flex items-center">
                    <button
                        type="button"
                        className="shrink-0 h-8 w-6 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => scrollTabs('left')}
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <div
                        ref={tabsRef}
                        className="flex-1 overflow-x-auto scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="flex items-center gap-1 w-max h-9">
                            {[
                                { id: 'info', label: 'Thông tin', show: true },
                                { id: 'butphe', label: 'Người bút phê', show: isVanbanden },
                                { id: 'xuly', label: 'Đơn vị xử lý', show: isVanbanden },
                                { id: 'thongtinbanhanh', label: 'Thông tin ban hành', show: !isVanbanden },
                                { id: 'timeline', label: 'Timeline', show: true },
                                {
                                    id: 'feedback',
                                    label: (
                                        <span className="flex items-center gap-1">
                                            <MessagesSquare size={13} />
                                            Phản hồi
                                        </span>
                                    ),
                                    show: true
                                },
                                {
                                    id: 'history',
                                    label: (
                                        <span className="flex items-center gap-1">
                                            <HistoryIcon size={13} />
                                            Lịch sử
                                        </span>
                                    ),
                                    show: true
                                }
                            ]
                                .filter((t) => t.show)
                                .map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setSelectedTab(tab.id)}
                                        className={`whitespace-nowrap px-3 h-full text-sm transition-colors border-b-2 ${selectedTab === tab.id
                                            ? 'border-blue-600 text-blue-600 font-medium dark:border-blue-400 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="shrink-0 h-8 w-6 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => scrollTabs('right')}
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}

            <DrawerContentCustom>
                {!doc ? (
                    <NoDocument />
                ) : (
                    <>
                        <div className="pt-3">
                            {selectedTab === 'info' && (
                                <div>
                                    <div className="px-2 space-y-4 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="text-gray-500 dark:text-gray-400 text-sm">Số hiệu: </div>
                                                <div className="text-2xl font-semibold text-slate-500 dark:text-slate-300">
                                                    {doc?.so_hieu_van_ban || '-'}
                                                </div>
                                                <div className="mt-1">
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">Số đến: </span>
                                                    <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                                                        {doc?.so_van_ban || '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                        Loại văn bản:{' '}
                                                    </span>
                                                    <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                                                        {doc?.ten_loai || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-gray-500 dark:text-gray-400 text-xs">Trạng thái:</div>
                                                <Chip color="accent" size="sm" variant="soft">
                                                    Chờ lãnh đạo bút phê
                                                </Chip>
                                                <div>
                                                    <small>
                                                        {doc?.van_ban_chi_doc === '1' ? (
                                                            <>
                                                                <span className="text-green-500">Chỉ đọc</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-orange-500">Cần phản hồi</span>
                                                            </>
                                                        )}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-3 dark:border-gray-700" />

                                    <div className="px-2 md:px-3 space-y-2">
                                        <Item
                                            icon={<FileText size={14} />}
                                            label={
                                                <div className="flex items-center gap-1">
                                                    <span>Trích yếu</span>
                                                </div>
                                            }
                                            value={
                                                <div className="min-w-0">
                                                    <span className="whitespace-pre-wrap break-words">
                                                        {doc?.trich_yeu || '-'}
                                                    </span>
                                                    <Tooltip>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="shrink-0 w-fit ml-2 px-2 flex"
                                                            isIconOnly
                                                            onPress={() => {
                                                                navigator.clipboard.writeText(doc.trich_yeu || '')
                                                                toast.success('Thành công', {
                                                                    description: 'Đã sao chép trích yếu'
                                                                })
                                                            }}
                                                        >
                                                            <div className="text-blue-500 flex items-center gap-1">
                                                                <Copy size={14} />
                                                                <span>Sao chép</span>
                                                            </div>
                                                        </Button>
                                                        <Tooltip.Content
                                                            placement="right"
                                                            className="bg-slate-100 capitalize rounded-sm"
                                                        >
                                                            Sao chép trích yếu
                                                        </Tooltip.Content>
                                                    </Tooltip>
                                                </div>
                                            }
                                            vertical
                                        />
                                        <Item icon={<User size={14} />} label="Người ký" value={doc?.nguoi_ky} />
                                        <Item
                                            icon={<CalendarDays size={14} />}
                                            label="Ngày ký"
                                            value={doc?.ngay_ky ? date('d/m/Y', doc?.ngay_ky) : undefined}
                                        />
                                        <Item
                                            icon={<CalendarDays size={14} />}
                                            label="Ngày nhận"
                                            value={doc?.ngay_nhan ? date('d/m/Y', doc?.ngay_nhan) : undefined}
                                        />
                                        <Item
                                            icon={<CalendarDays size={14} />}
                                            label="Ngày ban hành"
                                            value={doc?.ngay_ban_hanh ? date('d/m/Y', doc?.ngay_ban_hanh) : undefined}
                                        />
                                        <Item
                                            icon={<CalendarDays size={14} />}
                                            label="Thời gian xử lý"
                                            value={
                                                doc?.thoi_gian_xu_ly ? date('d/m/Y H:i', doc.thoi_gian_xu_ly) : undefined
                                            }
                                        />
                                        <Item
                                            icon={<SquareChevronDown size={14} />}
                                            label="Tính chất"
                                            value={doc?.ten_tinh_chat}
                                        />
                                        <Item
                                            icon={<SquareChevronDown size={14} />}
                                            label="Bảo mật"
                                            value={doc?.ten_bao_mat}
                                        />
                                        <Item
                                            icon={<Landmark size={14} />}
                                            label="Khối cơ quan"
                                            value={doc?.ten_khoi_co_quan}
                                        />
                                        <Item
                                            icon={<Building2 size={14} />}
                                            label="Cơ quan BH"
                                            value={doc?.ten_co_quan}
                                        />
                                        <Item
                                            icon={<Mail size={14} />}
                                            label="Hình thức nhận"
                                            value={doc?.ten_hinh_thuc}
                                        />
                                        <Item icon={<Mail size={14} />} label="Lĩnh vực" value={doc?.linh_vuc} />
                                        <Item
                                            icon={<Archive size={14} />}
                                            label="Nơi lưu trữ"
                                            value={doc?.noi_luu_tru}
                                        />
                                        <Item icon={<Folders size={14} />} label="Tệp đính kèm" value={fileList} />

                                        {data?.files_tchc && (
                                            <Item
                                                icon={<Folders size={14} />}
                                                label="Tệp nội bộ"
                                                value={fileInternalList}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedTab === 'butphe' && isVanbanden && <ContentButPhe data={doc?.but_phe} />}
                            {selectedTab === 'xuly' && isVanbanden && <ContentDonvixuly data={doc?.xu_ly} />}
                            {selectedTab === 'thongtinbanhanh' && !isVanbanden && (
                                <ContentThongtinbanhanh data={doc?.thong_tin_ban_hanh} />
                            )}
                            {selectedTab === 'timeline' && (
                                <div className="p-4">
                                    <ContentTimeLine data={doc?.timeline || []} />
                                </div>
                            )}
                            {selectedTab === 'feedback' && (
                                <ContentPhanhoi vanban={doc} data={doc?.phan_hoi || []} onReload={handleReload} />
                            )}
                            {selectedTab === 'history' && (
                                <ContentHistoryLog
                                    id_van_ban={doc?.id_van_ban ? Number(doc.id_van_ban) : undefined}
                                    type={logType}
                                />
                            )}
                        </div>
                    </>
                )}
            </DrawerContentCustom>
        </DrawerCustom>
    )
}

export function Item({
    icon,
    label,
    value,
    vertical = false
}: {
    icon?: React.ReactNode
    label: React.ReactNode
    value?: React.ReactNode
    vertical?: boolean
}) {
    if (vertical) {
        return (
            <div className="flex flex-col py-2 gap-1.5">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm font-medium">
                    {icon && <span className="text-gray-500 dark:text-gray-500">{icon}</span>}
                    <span>{label}</span>
                </div>
                <div className="text-gray-800 dark:text-gray-200 text-sm pl-0 break-words min-w-0">
                    {typeof value === 'string' || typeof value === 'number' ? value || '-' : (value ?? '-')}
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-12 items-start py-1">
            <div className="col-span-5 md:col-span-4 flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                {icon && <span className="text-gray-500 dark:text-gray-500">{icon}</span>}
                <span>{label}</span>
            </div>
            <div className="col-span-7 md:col-span-8 text-gray-800 dark:text-gray-200 text-sm break-words min-w-0">
                {typeof value === 'string' || typeof value === 'number' ? value || '-' : (value ?? '-')}
            </div>
        </div>
    )
}

function NoDocument() {
    return (
        <div className="p-4 text-center content-center h-full">
            <div className="flex flex-col items-center">
                <FileX size={108} strokeWidth={1} className="text-gray-300" />
                <small className="text-gray-400">Văn bản này không có sẵn</small>
            </div>
        </div>
    )
}
