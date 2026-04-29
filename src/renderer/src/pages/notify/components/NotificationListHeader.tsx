import {
    Button,
    Checkbox,
    Dropdown,
    Label,
    Separator,
    Tooltip
} from '@heroui-v3/react'
import {
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    MailOpen,
    MoreVertical,
    RotateCw,
    Trash2
} from 'lucide-react'
import React from 'react'

interface NotificationListHeaderProps {
    selectedTab: string
    setSelectedTab: (tab: string) => void
    setPage: (page: number) => void
    isLoading: boolean
    currentCount: number
    totalItems: number
    page: number
    rowsPerPage: number
    selectedCount: number
    onSelectAll: () => void
    onSelectUnread: () => void
    onSelectRead: () => void
    onMarkAsRead: () => void
    onMarkAllAsRead: () => void
    isMarkingAsRead: boolean
    onRefresh: () => void
    unreadOnly: boolean
    setUnreadOnly: (val: boolean) => void
    onDelete: () => void
    isDeleting: boolean
}

export const NotificationListHeader: React.FC<NotificationListHeaderProps> = ({
    selectedTab,
    setSelectedTab,
    setPage,
    isLoading,
    currentCount,
    totalItems,
    page,
    rowsPerPage,
    selectedCount,
    onSelectAll,
    onSelectUnread,
    onSelectRead,
    onMarkAsRead,
    onMarkAllAsRead,
    isMarkingAsRead,
    onRefresh,
    unreadOnly,
    setUnreadOnly,
    onDelete,
    isDeleting
}) => {
    const totalPages = Math.ceil(totalItems / rowsPerPage)
    const isAllSelected = currentCount > 0 && selectedCount === currentCount
    const startIdx = (page - 1) * rowsPerPage
    const endIdx = startIdx + currentCount

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4 px-1">
            {/* Left: Select all + bulk actions */}
            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                    <Checkbox
                        isSelected={isAllSelected}
                        isIndeterminate={selectedCount > 0 && selectedCount < currentCount}
                        onChange={() => onSelectAll()}
                        aria-label="Chọn tất cả"
                    >
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                    </Checkbox>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors select-none">
                        Chọn tất cả
                    </span>
                </label>

                {selectedCount > 0 && (
                    <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-200">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">
                            ({selectedCount})
                        </span>

                        <Tooltip delay={0}>
                            <Tooltip.Trigger>
                                <Button isIconOnly size="sm" variant="ghost" onClick={onMarkAsRead}>
                                    {isMarkingAsRead ? (
                                        <RotateCw className="text-blue-500 animate-spin" size={16} />
                                    ) : (
                                        <CheckCheck className="text-gray-600 dark:text-gray-400" size={16} />
                                    )}
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content offset={10}>Đánh dấu đã đọc</Tooltip.Content>
                        </Tooltip>

                        <Tooltip delay={0}>
                            <Tooltip.Trigger>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    onClick={onDelete}
                                    isDisabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <RotateCw className="text-danger animate-spin" size={16} />
                                    ) : (
                                        <Trash2 className="text-danger" size={16} />
                                    )}
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content offset={10}>Xóa</Tooltip.Content>
                        </Tooltip>
                    </div>
                )}

                {selectedCount === 0 && (
                    <div className="flex items-center gap-1">
                        <Tooltip delay={0}>
                            <Tooltip.Trigger>
                                <Button isIconOnly size="sm" variant="ghost" onClick={onRefresh}>
                                    <RotateCw className="text-gray-500 dark:text-gray-400" size={16} />
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content offset={10}>Làm mới</Tooltip.Content>
                        </Tooltip>

                        <Tooltip delay={0}>
                            <Tooltip.Trigger>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant={unreadOnly ? 'secondary' : 'ghost'}
                                    onPress={() => setUnreadOnly(!unreadOnly)}
                                    className={`${unreadOnly ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    <MailOpen size={16} />
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content offset={10}>
                                {unreadOnly ? 'Hiện tất cả' : 'Chỉ hiện chưa đọc'}
                            </Tooltip.Content>
                        </Tooltip>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <Button isIconOnly size="sm" variant="ghost" aria-label="Khác">
                                    <MoreVertical className="text-gray-500 dark:text-gray-400" size={16} />
                                </Button>
                            </Dropdown.Trigger>
                            <Dropdown.Popover className="min-w-[220px]">
                                <Dropdown.Menu
                                    onAction={(key) => {
                                        if (key === 'show-unread') setUnreadOnly(true)
                                        if (key === 'show-all') setUnreadOnly(false)
                                        if (key === 'select-unread') onSelectUnread()
                                        if (key === 'select-read') onSelectRead()
                                        if (key === 'mark-all-read') onMarkAllAsRead()
                                    }}
                                >
                                    <Dropdown.Section>
                                        <Dropdown.Item id="show-all" textValue="Hiển thị tất cả">
                                            <Label className={!unreadOnly ? 'font-semibold text-primary' : ''}>
                                                Hiển thị tất cả
                                            </Label>
                                        </Dropdown.Item>
                                        <Dropdown.Item id="show-unread" textValue="Chỉ hiển thị chưa xem">
                                            <Label className={unreadOnly ? 'font-semibold text-primary' : ''}>
                                                Chỉ hiển thị chưa xem
                                            </Label>
                                        </Dropdown.Item>
                                    </Dropdown.Section>
                                    <Separator />
                                    <Dropdown.Section>
                                        <Dropdown.Item id="select-unread" textValue="Chọn thông báo chưa xem">
                                            <Label>Chọn thông báo chưa xem</Label>
                                        </Dropdown.Item>
                                        <Dropdown.Item id="select-read" textValue="Chọn thông báo đã xem">
                                            <Label>Chọn thông báo đã xem</Label>
                                        </Dropdown.Item>
                                    </Dropdown.Section>
                                    <Separator />
                                    <Dropdown.Section>
                                        <Dropdown.Item id="mark-all-read" textValue="Đánh dấu tất cả là đã đọc">
                                            <Label>Đánh dấu tất cả là đã đọc</Label>
                                        </Dropdown.Item>
                                    </Dropdown.Section>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    </div>
                )}
            </div>

            {/* Right: Pagination */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {isLoading ? (
                        <span>Đang tải...</span>
                    ) : currentCount > 0 ? (
                        <span>
                            {startIdx + 1}-{Math.min(endIdx, totalItems)} trong số {totalItems}
                        </span>
                    ) : (
                        <span>0 kết quả</span>
                    )}
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        isDisabled={page === 1 || isLoading}
                        onPress={() => setPage(Math.max(1, page - 1))}
                        className="w-8 h-8 min-w-8 rounded-full"
                    >
                        <ChevronLeft size={18} className={page === 1 ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} />
                    </Button>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        isDisabled={page === totalPages || isLoading}
                        onPress={() => setPage(Math.min(totalPages, page + 1))}
                        className="w-8 h-8 min-w-8 rounded-full"
                    >
                        <ChevronRight size={18} className={page === totalPages ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} />
                    </Button>
                </div>
            </div>
        </div>
    )
}
