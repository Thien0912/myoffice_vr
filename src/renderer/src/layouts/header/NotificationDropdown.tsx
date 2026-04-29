import { Badge, Button, Popover, Spinner, Tooltip } from '@heroui-v3/react'
import { useNotificationStore } from '@renderer/store/useNotificationStore'
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Clock, Mail } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { thongbaoAxios } from '../../api/thongbaoAxios'
import { timeAgo } from '../../utils/formatDate'
import { getSmartNotificationLink } from '../../utils/urlUtils'

// --- Types ---
interface Notification {
    ql_thong_bao_id: string
    ql_thong_bao_tieu_de: string
    ql_thong_bao_noi_dung: string
    ql_thong_bao_ngay_gui: string
    ql_thong_bao_loai: string
    ql_thong_bao_da_doc: string
    ql_thong_bao_link?: string
}

// --- Icon based on type ---
const NotificationIcon = ({ type }: { type: string }): React.JSX.Element => {
    const isReminder = type === '2'
    return (
        <div
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isReminder
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500'
                }`}
        >
            {isReminder ? <Clock className="size-5" /> : <Mail className="size-5" />}
        </div>
    )
}

// --- Notification row ---
const NotificationItem = React.memo(({
    notification,
    onClick
}: {
    notification: Notification
    onClick: (n: Notification) => void
}): React.JSX.Element => {
    const isUnread = notification.ql_thong_bao_da_doc === '0'

    return (
        <li className="relative group border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div
                onClick={() => onClick(notification)}
                className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer"
            >
                <NotificationIcon type={notification.ql_thong_bao_loai} />
                <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-sm mb-1 ${isUnread ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                        {notification.ql_thong_bao_tieu_de}
                    </p>
                    {/* {notification.ql_thong_bao_noi_dung && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 whitespace-pre-line">
                            {notification.ql_thong_bao_noi_dung
                                .replace(/<[^>]*>?/gm, '') // Strip HTML
                                .replace(/(?:Link:\s*)?https?:\/\/[^\s]+/g, '') // Remove HTTP/HTTPS links
                                .replace(/\n\s*\n/g, '\n') // Collapse multiple newlines
                                .trim()}
                        </p>
                    )} */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {timeAgo(notification.ql_thong_bao_ngay_gui)}
                    </p>
                </div>
                {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 absolute top-1/2 -translate-y-1/2 right-6" />
                )}
            </div>
        </li>
    )
})

// --- Main Component ---

export default function NotificationDropdown(): React.JSX.Element {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = React.useState(false)
    const unreadCount = useNotificationStore((state) => state.unreadCount)
    const observerRef = React.useRef<IntersectionObserver | null>(null)
    const loadMoreRef = React.useRef<HTMLDivElement>(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['notifications', 'header'],
        queryFn: ({ pageParam = 1 }) => {
            return thongbaoAxios.fetch({ page: pageParam, per_page: 15 })
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: any, allPages) => {
            const notifications = lastPage?.data?.notifications || []
            if (notifications.length === 15) {
                return allPages.length + 1
            }
            return undefined
        },
        enabled: isOpen,
        staleTime: 1000 * 60
    })

    React.useEffect(() => {
        if (!isOpen) return

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            }
        }, { threshold: 0.1 })

        const el = loadMoreRef.current
        if (el) observerRef.current.observe(el)

        return () => {
            if (el && observerRef.current) observerRef.current.unobserve(el)
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, isOpen])

    const updateStatusMutation = useMutation({
        mutationFn: (id: string) => thongbaoAxios.updateStatus(id, 1),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            thongbaoAxios.countUnread().then((response: any) => {
                useNotificationStore.getState().setUnreadCount(response.new_noti || 0)
            })
        }
    })

    const notifications: Notification[] = React.useMemo(() => {
        return data?.pages.flatMap((page) => page?.data?.notifications || []) || []
    }, [data?.pages])

    const unreadNotifications = React.useMemo(() => {
        return notifications.filter((n) => n.ql_thong_bao_da_doc === '0')
    }, [notifications])

    const handleMarkAllRead = React.useCallback((): void => {
        if (unreadNotifications.length === 0) return
        Promise.all(unreadNotifications.map((n) => thongbaoAxios.updateStatus(n.ql_thong_bao_id, 1)))
            .then(() => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] })
                useNotificationStore.getState().setUnreadCount(0)
            })
            .catch(() => { })
    }, [unreadNotifications, queryClient])

    const handleNotificationClick = React.useCallback((notification: Notification): void => {
        if (notification.ql_thong_bao_da_doc === '0') {
            updateStatusMutation.mutate(notification.ql_thong_bao_id)
        }
        if (notification.ql_thong_bao_link) {
            navigate(getSmartNotificationLink(notification.ql_thong_bao_link))
        }
        setIsOpen(false)
    }, [updateStatusMutation, navigate, setIsOpen])

    return (
        <Badge.Anchor>
            <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
                <Popover.Trigger>
                    <Button isIconOnly variant="ghost" className="text-gray-600 dark:text-gray-300">
                        <Bell className="size-5" />
                    </Button>
                </Popover.Trigger>
                <Popover.Content
                    placement="bottom end"
                    offset={12}
                    className="w-[90vw] sm:w-[400px] p-0 overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800"
                >
                    <Popover.Dialog className="w-full p-0">
                        <div className="flex flex-col w-full text-left bg-white dark:bg-gray-900 rounded-xl overflow-hidden">

                            {/* Header */}
                            <div className="px-6 py-4 flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-[Manrope,sans-serif]">Thông báo</h2>
                                {unreadNotifications.length > 0 && (
                                    <Tooltip>
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none p-1 rounded-md hover:bg-white dark:hover:bg-gray-700"
                                            aria-label="Đánh dấu tất cả đã đọc"
                                        >
                                            <CheckCheck className="size-5" />
                                        </button>
                                    </Tooltip>
                                )}
                            </div>

                            {/* List */}
                            <div className="bg-white dark:bg-gray-900 w-full">
                                <div className="max-h-[400px] overflow-y-auto">
                                    {isLoading ? (
                                        <div className="flex justify-center items-center py-10">
                                            <Spinner size="sm" />
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                            </div>
                                            <p className="text-sm font-medium">Không có thông báo nào</p>
                                        </div>
                                    ) : (
                                        <>
                                            <ul className="flex flex-col m-0 p-0 text-left">
                                                {notifications.map((n, idx) => (
                                                    <NotificationItem
                                                        key={`notification-${n.ql_thong_bao_id}-${idx}`}
                                                        notification={n}
                                                        onClick={handleNotificationClick}
                                                    />
                                                ))}
                                            </ul>
                                            {hasNextPage && (
                                                <div ref={loadMoreRef} className="py-4 flex justify-center">
                                                    {isFetchingNextPage && <Spinner size="sm" />}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-center w-full">
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        navigate('/thong-bao')
                                    }}
                                    className="text-sm font-medium cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus:outline-none"
                                >
                                    Xem tất cả thông báo
                                </button>
                            </div>
                        </div>
                    </Popover.Dialog>
                </Popover.Content>
            </Popover>
            {unreadCount > 0 && (
                <Badge color="danger" size="sm" className='p-0.5 border-none shadow-sm'>
                    {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
            )}
        </Badge.Anchor>
    )
}
