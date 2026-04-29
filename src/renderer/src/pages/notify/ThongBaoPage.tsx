import { SearchField, Tabs } from '@heroui-v3/react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import DateRangeSelector from '@renderer/components/DateRangeSelector'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { Clock, Inbox, Star } from 'lucide-react'
import { NotificationList } from './components/NotificationList'
import { NotificationListHeader } from './components/NotificationListHeader'
import { NOTIFICATION_REQUIRED_PERMISSIONS } from './constants'
import { useNotifications } from './hooks/useNotifications'

export default function ThongBaoPage() {
    const { user } = useAuthStore()
    const { filters, data, actions, selection, deleteConfirmation } = useNotifications()
    const ROWS_PER_PAGE = 20

    const { dateFrom, setDateFrom, dateTo, setDateTo } = filters

    const hasPermissionStatus = (() => {
        if (!actions.selectedNotification?.ql_thong_bao_link) return true
        return NOTIFICATION_REQUIRED_PERMISSIONS.some((p) => user?.permissions?.includes(p))
    })()

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Scrollable Canvas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-12">
                <div className="mx-auto">
                    {/* Page Header */}
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
                                Thông báo
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                Quản lý thông báo và nhắc nhở công việc
                            </p>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
                        <Tabs
                            className="w-full gap-0"
                            variant="secondary"
                            selectedKey={filters.selectedTab}
                            onSelectionChange={(key) => {
                                filters.setSelectedTab(key.toString())
                                filters.setPage(1)
                            }}
                        >
                            <Tabs.List
                                aria-label="Inbox categories"
                                className="[&_[data-selected]]:text-blue-600 [&_[data-selected]]:font-bold max-w-lg border-0 bg-transparent px-0"
                            >
                                <Tabs.Tab id="notifications" className="gap-2 justify-start py-5 text-sm pl-1">
                                    <Inbox size={18} />
                                    <Tabs.Indicator className="h-0.5" />
                                    <div className="whitespace-nowrap">Chính</div>
                                </Tabs.Tab>
                                <Tabs.Tab id="reminders" className="gap-2 justify-start py-5 text-sm px-4">
                                    <Clock size={18} />
                                    <Tabs.Indicator className="h-0.5" />
                                    <div className="whitespace-nowrap">Nhắc nhở</div>
                                </Tabs.Tab>
                                <Tabs.Tab id="starred" className="gap-2 justify-start py-5 text-sm px-4">
                                    <Star size={18} />
                                    <Tabs.Indicator className="h-0.5" />
                                    <div className="whitespace-nowrap">Quan trọng</div>
                                </Tabs.Tab>
                            </Tabs.List>
                        </Tabs>
                    </div>

                    {/* Glassmorphism Utilities Bar */}
                    <div className="mb-6 flex flex-col sm:flex-row items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <SearchField
                            value={filters.search}
                            onChange={filters.setSearch}
                            className="flex-1 w-full"
                        >
                            <SearchField.Group className="h-11 bg-gray-100/50 dark:bg-gray-800/50 border-none rounded-xl shadow-none">
                                <SearchField.SearchIcon className="ml-2 text-gray-400" />
                                <SearchField.Input
                                    placeholder="Tìm thông báo..."
                                    className="text-sm placeholder:text-gray-400 py-0"
                                />
                                <SearchField.ClearButton className="mr-1" />
                            </SearchField.Group>
                        </SearchField>
                        <div className="w-full sm:w-auto shrink-0">
                            <DateRangeSelector
                                className="h-11 rounded-xl px-4 font-medium"
                                label="Thời gian"
                                value={{ from: dateFrom, to: dateTo }}
                                onChange={(range) => {
                                    setDateFrom(range.from || '')
                                    setDateTo(range.to || '')
                                }}
                            />
                        </div>
                    </div>

                    {/* Bulk Actions + Pagination */}
                    <NotificationListHeader
                        selectedTab={filters.selectedTab}
                        setSelectedTab={filters.setSelectedTab}
                        setPage={filters.setPage}
                        isLoading={data.isLoading}
                        currentCount={data.notifications.length}
                        totalItems={data.totalItems}
                        page={filters.page}
                        rowsPerPage={ROWS_PER_PAGE}
                        selectedCount={selection.selectedIds.length}
                        onSelectAll={selection.toggleSelectAll}
                        onSelectUnread={selection.selectUnread}
                        onSelectRead={selection.selectRead}
                        onMarkAsRead={selection.markSelectedAsRead}
                        onMarkAllAsRead={actions.markAllViewedAsRead}
                        isMarkingAsRead={selection.isMarkingAsRead}
                        onRefresh={actions.refresh}
                        unreadOnly={filters.unreadOnly}
                        setUnreadOnly={filters.setUnreadOnly}
                        onDelete={selection.deleteSelected}
                        isDeleting={selection.isDeleting}
                    />

                    {/* Feed */}
                    <NotificationList
                        notifications={data.notifications}
                        isLoading={data.isLoading}
                        isError={data.isError}
                        error={data.error}
                        onNotificationClick={actions.handleNotificationClick}
                        selectedIds={selection.selectedIds}
                        onToggleSelect={selection.toggleSelect}
                        onToggleStar={actions.handleToggleStar}
                    />
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirmation.isDeleteConfirmOpen}
                onClose={() => deleteConfirmation.setIsDeleteConfirmOpen(false)}
                title="Xóa thông báo"
                content={`Bạn có chắc chắn muốn xóa ${deleteConfirmation.deleteConfirmCount} thông báo đã chọn?\n\nHành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                isDanger={true}
                isLoading={selection.isDeleting}
                onConfirm={deleteConfirmation.confirmDelete}
            />
        </div>
    )
}
