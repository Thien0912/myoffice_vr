import { Button, Checkbox, Chip } from '@heroui-v3/react'
import { motion } from 'framer-motion'
import { AlertTriangle, Bell, Clock, Star } from 'lucide-react'
import moment from 'moment'
import React from 'react'
import { Notification } from '../types'

interface NotificationItemProps {
    item: Notification
    onClick: (item: Notification) => void
    index: number
    isSelected: boolean
    onSelect: (id: string) => void
    onToggleStar: (notification: Notification) => void
}

/** Map notification type to icon, bg color, text color, and priority pill color */
const getNotificationStyle = (item: Notification) => {
    const isStarred = item.ql_thong_bao_sao === '1'
    const type = item.ql_thong_bao_loai

    // Starred / Important
    if (isStarred) {
        return {
            icon: AlertTriangle,
            iconBg: 'bg-red-50 dark:bg-red-900/20',
            iconColor: 'text-red-600 dark:text-red-400',
            pillColor: 'bg-red-500',
            pillVisible: true
        }
    }

    // Reminder type
    if (type === '2') {
        return {
            icon: Clock,
            iconBg: 'bg-amber-50 dark:bg-amber-900/20',
            iconColor: 'text-amber-600 dark:text-amber-400',
            pillColor: 'bg-amber-500',
            pillVisible: true
        }
    }

    // Default / Standard
    return {
        icon: Bell,
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        pillColor: 'bg-blue-500',
        pillVisible: false
    }
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    item,
    onClick,
    index,
    isSelected,
    onSelect,
    onToggleStar
}) => {
    const isStarred = item.ql_thong_bao_sao === '1'
    const isUnread = String(item.ql_thong_bao_da_doc) === '0' || !item.ql_thong_bao_da_doc
    const style = getNotificationStyle(item)
    const IconComponent = style.icon

    const mDate = moment(item.ql_thong_bao_ngay_gui, [
        moment.ISO_8601,
        'YYYY-MM-DD HH:mm:ss',
        'DD/MM/YYYY HH:mm:ss',
        'YYYY-MM-DD',
        'DD/MM/YYYY'
    ])
    const isToday = mDate.isValid() && mDate.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
    const showNewBadge = isUnread && isToday

    const formatDate = () => {
        if (!mDate.isValid()) return ''
        if (isToday) return mDate.format('h:mm A')
        const yesterday = moment().subtract(1, 'day')
        if (mDate.format('YYYY-MM-DD') === yesterday.format('YYYY-MM-DD')) return 'Hôm qua'
        return mDate.format('h:mm A')
    }

    // Strip HTML tags from content for preview
    const contentPreview = (item.ql_thong_bao_noi_dung || '')
        .replace(/<[^>]*>/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim()
        .slice(0, 150)

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className={`
                group relative rounded-xl p-4 md:p-5 cursor-pointer
                transition-all duration-200 overflow-hidden
                border
                ${isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : isUnread
                        ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm'
                        : 'bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'
                }
                hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:shadow-md
            `}
            onClick={() => onClick(item)}
        >
            {/* Priority Pill — left edge accent bar */}
            {style.pillVisible && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 ${style.pillColor} rounded-r-full`} />
            )}

            <div className="flex items-start gap-3 ml-1">
                {/* Checkbox */}
                <div className="pt-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        isSelected={isSelected}
                        onChange={() => onSelect(item.ql_thong_bao_id)}
                        aria-label="Chọn thông báo"
                    >
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                    </Checkbox>
                </div>

                {/* Icon in colored square */}
                <div className={`p-2.5 ${style.iconBg} rounded-xl shrink-0`}>
                    <IconComponent size={20} className={style.iconColor} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <h3 className={`truncate text-sm ${isUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-500 dark:text-gray-400'}`}>
                                {item.ql_thong_bao_tieu_de}
                            </h3>
                            {showNewBadge && (
                                <Chip
                                    size="sm"
                                    color="accent"
                                    variant="primary"
                                    className="h-5 shrink-0 px-1 text-tiny font-bold tracking-wide"
                                >
                                    MỚI
                                </Chip>
                            )}
                        </div>

                        <div className="flex items-center gap-2 ml-3 shrink-0">
                            {/* Star button */}
                            <Button
                                isIconOnly
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onToggleStar(item)
                                }}
                                className={`min-w-7 w-7 h-7 rounded-full transition-opacity ${isStarred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                                <Star
                                    size={16}
                                    className={`transition-colors ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`}
                                />
                            </Button>

                            {/* Date */}
                            <span className={`text-xs whitespace-nowrap ${isUnread ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                {formatDate()}
                            </span>
                        </div>
                    </div>

                    {/* Content preview */}
                    {contentPreview && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                            {contentPreview}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
