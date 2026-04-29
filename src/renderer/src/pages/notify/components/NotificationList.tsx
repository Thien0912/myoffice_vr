import { Spinner } from '@heroui-v3/react'
import { Search as SearchIcon } from 'lucide-react'
import moment from 'moment'
import React from 'react'
import { Notification } from '../types'
import { NotificationItem } from './NotificationItem'

interface NotificationListProps {
    notifications: Notification[]
    isLoading: boolean
    isError: boolean
    error: any
    onNotificationClick: (item: Notification) => void
    selectedIds: string[]
    onToggleSelect: (id: string) => void
    onToggleStar: (notification: Notification) => void
}

/** Group notifications by date label (Hôm nay, Hôm qua, DD/MM/YYYY) */
const groupByDate = (notifications: Notification[]) => {
    const groups: { label: string; items: Notification[] }[] = []
    const map = new Map<string, Notification[]>()

    const today = moment().format('YYYY-MM-DD')
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD')

    for (const item of notifications) {
        const mDate = moment(item.ql_thong_bao_ngay_gui, [
            moment.ISO_8601,
            'YYYY-MM-DD HH:mm:ss',
            'DD/MM/YYYY HH:mm:ss',
            'YYYY-MM-DD',
            'DD/MM/YYYY'
        ])
        let key: string
        if (!mDate.isValid()) {
            key = 'Khác'
        } else {
            const dateStr = mDate.format('YYYY-MM-DD')
            if (dateStr === today) key = 'Hôm nay'
            else if (dateStr === yesterday) key = 'Hôm qua'
            else key = mDate.format('DD/MM/YYYY')
        }

        if (!map.has(key)) {
            map.set(key, [])
        }
        map.get(key)!.push(item)
    }

    // Convert map to array preserving insertion order
    for (const [label, items] of map) {
        groups.push({ label, items })
    }

    return groups
}

export const NotificationList: React.FC<NotificationListProps> = ({
    notifications,
    isLoading,
    isError,
    error,
    onNotificationClick,
    selectedIds,
    onToggleSelect,
    onToggleStar
}) => {
    // Deduplicate
    const getUniqueNotifications = () => {
        const seenIds = new Set()
        return notifications.filter((item) => {
            if (seenIds.has(item.ql_thong_bao_id)) return false
            seenIds.add(item.ql_thong_bao_id)
            return true
        })
    }

    const uniqueNotifications = getUniqueNotifications()
    const dateGroups = React.useMemo(() => groupByDate(uniqueNotifications), [uniqueNotifications])

    let globalIndex = 0

    return (
        <div className="w-full h-full min-h-[400px]">
            {isLoading ? (
                <div className="flex w-full h-full min-h-[400px] justify-center items-center">
                    <Spinner size="lg" />
                </div>
            ) : isError ? (
                <div className="flex w-full h-full min-h-[400px] justify-center items-center text-red-500">
                    Lỗi: {error ? error.message : 'Lỗi không xác định'}
                </div>
            ) : uniqueNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center min-h-[400px]">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4 text-gray-300">
                        <SearchIcon size={24} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Không tìm thấy thông báo nào
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn
                    </p>
                </div>
            ) : (
                <div className="flex flex-col w-full">
                    {dateGroups.map((group) => (
                        <div key={group.label} className="mb-6 last:mb-0">
                            {/* Date Group Header */}
                            <div className="flex items-center gap-3 mb-3 px-1">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {group.label}
                                </span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {group.items.length} Thông báo
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="space-y-3">
                                {group.items.map((item) => {
                                    const idx = globalIndex++
                                    return (
                                        <NotificationItem
                                            key={item.ql_thong_bao_id}
                                            item={item}
                                            index={idx}
                                            isSelected={selectedIds.includes(item.ql_thong_bao_id)}
                                            onSelect={onToggleSelect}
                                            onToggleStar={onToggleStar}
                                            onClick={onNotificationClick}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
