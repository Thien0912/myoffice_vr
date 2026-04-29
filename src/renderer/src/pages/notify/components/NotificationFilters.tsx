import { Button, DatePicker, Label, Popover, SearchField } from '@heroui-v3/react'
import { parseDate } from '@internationalized/date'
import { I18nProvider } from '@react-aria/i18n'
import { CalendarDays, Filter } from 'lucide-react'
import React from 'react'

interface NotificationFiltersProps {
    search: string
    setSearch: (value: string) => void
    dateFrom: string
    setDateFrom: (value: string) => void
    dateTo: string
    setDateTo: (value: string) => void
    unreadOnly: boolean
    setUnreadOnly: (value: boolean) => void
    onClear: () => void
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    unreadOnly: _unreadOnly,
    setUnreadOnly: _setUnreadOnly,
    onClear
}) => {
    const [showFilters, setShowFilters] = React.useState(false)

    // Date Pickers Content Component
    const DateFilterContent = ({ className = '' }: { className?: string }) => (
        <I18nProvider locale="vi-VN">
            <div className={`flex flex-col gap-3 ${className}`}>
                <div className="flex flex-col gap-1 w-full">
                    <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Từ ngày</Label>
                    <DatePicker
                        aria-label="Từ ngày"
                        value={dateFrom ? (parseDate(dateFrom) as any) : null}
                        onChange={(date) => setDateFrom(date ? date.toString() : '')}
                        className="w-full rounded-sm bg-white border border-gray-200 shadow-none hover:bg-gray-50 h-10 transition-colors dark:bg-gray-800 dark:border-gray-700 text-sm"
                    />
                </div>
                <div className="flex flex-col gap-1 w-full">
                    <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Đến ngày</Label>
                    <DatePicker
                        aria-label="Đến ngày"
                        value={dateTo ? (parseDate(dateTo) as any) : null}
                        onChange={(date) => setDateTo(date ? date.toString() : '')}
                        className="w-full rounded-lg bg-white border border-gray-200 shadow-none hover:bg-gray-50 h-10 transition-colors dark:bg-gray-800 dark:border-gray-700 text-sm"
                    />
                </div>
            </div>
        </I18nProvider>
    )

    const hasDateFilter = dateFrom || dateTo

    return (
        <div className="flex flex-col gap-4 items-end sm:flex-row lg:gap-4 w-full sm:w-auto">
            <div className="flex w-full sm:w-auto gap-2 items-center">
                <SearchField
                    value={search}
                    onChange={setSearch}
                    aria-label="Tìm kiếm thông báo"
                    className="w-full sm:w-lg"
                >
                    <SearchField.Group>
                        <SearchField.SearchIcon />
                        <SearchField.Input
                            placeholder="Tìm kiếm thông báo..."
                        />
                        <SearchField.ClearButton />
                    </SearchField.Group>
                </SearchField>

                {/* Desktop Date Filter Popover */}
                <div className="hidden sm:block">
                    <Popover>
                        <Popover.Trigger>
                            <Button
                                variant="secondary"
                                className={`bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${hasDateFilter ? 'text-blue-600 dark:text-blue-500' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                <CalendarDays size={18} />
                                {hasDateFilter ? 'Đã chọn ngày' : 'Thời gian'}
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content placement="bottom start" className="p-4 bg-[white] dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                            <DateFilterContent className="w-[280px]" />
                        </Popover.Content>
                    </Popover>
                </div>

                {(search || dateFrom || dateTo) && (
                    <Button
                        size="sm"
                        variant="danger-soft"
                        onClick={onClear}
                        className="min-w-fit mb-0.5 hidden sm:flex"
                    >
                        Xóa lọc
                    </Button>
                )}

                {/* Mobile Filter Toggle */}
                <Button
                    isIconOnly
                    variant="secondary"
                    className="sm:hidden bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={20} className={hasDateFilter ? 'text-blue-600' : 'text-gray-500'} />
                </Button>
            </div>

            {/* Mobile Filter Collapse */}
            <div className={`w-full sm:hidden ${showFilters ? 'block' : 'hidden'}`}>
                <div className="flex justify-end mb-2">
                    {(search || dateFrom || dateTo) && (
                        <Button
                            size="sm"
                            variant="danger-soft"
                            onClick={onClear}
                            className="min-w-fit"
                        >
                            Xóa lọc
                        </Button>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <DateFilterContent />
                </div>
            </div>
        </div>
    )
}
