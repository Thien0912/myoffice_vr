import { Button, Popover } from '@heroui-v3/react'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import { Calendar, Check, ChevronRight } from 'lucide-react'
import React, { useState } from 'react'

interface DateRange {
    from?: string
    to?: string
}

interface DateRangeSelectorProps {
    label?: string
    value?: DateRange
    onChange: (range: DateRange) => void
    className?: string
}

export default function DateRangeSelector({
    label = 'Thời gian',
    value = { from: '', to: '' },
    onChange,
    className
}: DateRangeSelectorProps) {
    const dateFrom = value.from || ''
    const dateTo = value.to || ''
    const hasDateFilter = Boolean(dateFrom || dateTo)

    const [isOpen, setIsOpen] = useState(false)
    const [isCustomMode, setIsCustomMode] = useState(false)

    // Local state to hold temporary dates before "Áp dụng" is clicked
    const [localDateFrom, setLocalDateFrom] = useState(dateFrom)
    const [localDateTo, setLocalDateTo] = useState(dateTo)

    // Sync local state when popover opens or prop changes
    React.useEffect(() => {
        if (isOpen) {
            setLocalDateFrom(dateFrom)
            setLocalDateTo(dateTo)
        }
    }, [isOpen, dateFrom, dateTo])

    const getPresetDates = (preset: string) => {
        const today = new Date()
        const format = (d: Date) => d.toISOString().split('T')[0]
        let from = '', to = ''

        switch (preset) {
            case 'today':
                from = to = format(today)
                break
            case 'yesterday': {
                const y = new Date(today)
                y.setDate(y.getDate() - 1)
                from = to = format(y)
                break
            }
            case '7days': {
                const w = new Date(today)
                to = format(w)
                w.setDate(w.getDate() - 6)
                from = format(w)
                break
            }
            case '30days': {
                const w = new Date(today)
                to = format(w)
                w.setDate(w.getDate() - 29)
                from = format(w)
                break
            }
            case 'thisYear': {
                const start = new Date(today.getFullYear(), 0, 1)
                const end = new Date(today.getFullYear(), 11, 31)
                from = format(start)
                to = format(end)
                break
            }
            case 'lastYear': {
                const start = new Date(today.getFullYear() - 1, 0, 1)
                const end = new Date(today.getFullYear() - 1, 11, 31)
                from = format(start)
                to = format(end)
                break
            }
        }
        return { from, to }
    }

    const handlePreset = (preset: string) => {
        const { from, to } = getPresetDates(preset)
        onChange({ from, to })
        setIsOpen(false)
        setIsCustomMode(false)
    }

    const isPresetActive = (preset: string) => {
        if (!dateFrom && !dateTo) return false
        if (isCustomMode) return false
        const { from, to } = getPresetDates(preset)
        return dateFrom === from && dateTo === to
    }

    const clearDate = () => {
        onChange({ from: '', to: '' })
        setIsOpen(false)
        setIsCustomMode(false)
    }

    const handleCustomApply = () => {
        onChange({ from: localDateFrom, to: localDateTo })
        setIsOpen(false)
        setIsCustomMode(false)
    }

    const hasLocalChanges = localDateFrom !== dateFrom || localDateTo !== dateTo

    const getActiveLabel = () => {
        if (!dateFrom && !dateTo) return label
        if (isPresetActive('today')) return 'Hôm nay'
        if (isPresetActive('yesterday')) return 'Hôm qua'
        if (isPresetActive('7days')) return '7 ngày qua'
        if (isPresetActive('30days')) return '30 ngày qua'
        if (isPresetActive('thisYear')) return `Năm nay (${new Date().getFullYear()})`
        if (isPresetActive('lastYear')) return `Năm ngoái (${new Date().getFullYear() - 1})`

        if (dateFrom && dateTo) {
            if (dateFrom === dateTo) return dateFrom.split('-').reverse().join('/')
            return `${dateFrom.split('-').reverse().join('/')} - ${dateTo.split('-').reverse().join('/')}`
        }
        if (dateFrom) return `Từ ${dateFrom.split('-').reverse().join('/')}`
        if (dateTo) return `Trước ${dateTo.split('-').reverse().join('/')}`

        return label
    }

    return (
        <Popover
            isOpen={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (!open) setIsCustomMode(false)
            }}
        >
            <Popover.Trigger>
                <Button variant={hasDateFilter ? 'primary' : 'secondary'} className={className}>
                    <Calendar size={16} />
                    <span className="hidden sm:block">{getActiveLabel()}</span>
                </Button>
            </Popover.Trigger>
            <Popover.Content className="w-[95vw] sm:w-auto max-w-[95vw] sm:max-w-none min-w-0 p-0 overflow-hidden" placement="bottom start">
                <Popover.Dialog className="p-0">
                    <Popover.Arrow />
                    <div className="flex flex-col outline-none">
                        <div className="flex flex-col sm:flex-row transition-all duration-300">
                            {/* Khối chức năng trái */}
                            <div className={`flex flex-col w-full sm:w-[260px] py-2 overflow-y-auto max-h-[350px] ${isCustomMode ? "border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800" : ""}`}>
                                <Button variant="ghost" className={`w-full justify-between rounded-none h-10 px-4 text-sm ${isPresetActive('today') ? "bg-gray-100 font-medium" : "font-normal"}`} onPress={() => handlePreset('today')}>
                                    Hôm nay {isPresetActive('today') && <Check size={16} className="text-gray-600" />}
                                </Button>
                                <Button variant="ghost" className={`w-full justify-between rounded-none h-10 px-4 text-sm ${isPresetActive('yesterday') ? "bg-gray-100 font-medium" : "font-normal"}`} onPress={() => handlePreset('yesterday')}>
                                    Hôm qua {isPresetActive('yesterday') && <Check size={16} className="text-gray-600" />}
                                </Button>
                                <Button variant="ghost" className={`w-full justify-between rounded-none h-10 px-4 text-sm ${isPresetActive('7days') ? "bg-gray-100 font-medium" : "font-normal"}`} onPress={() => handlePreset('7days')}>
                                    7 ngày qua {isPresetActive('7days') && <Check size={16} className="text-gray-600" />}
                                </Button>
                                <Button variant="ghost" className={`w-full justify-between rounded-none h-10 px-4 text-sm ${isPresetActive('30days') ? "bg-gray-100 font-medium" : "font-normal"}`} onPress={() => handlePreset('30days')}>
                                    30 ngày qua {isPresetActive('30days') && <Check size={16} className="text-gray-600" />}
                                </Button>
                                <Button variant="ghost" className={`w-full justify-between rounded-none h-10 px-4 text-sm ${isPresetActive('thisYear') ? "bg-gray-100 font-medium" : "font-normal"}`} onPress={() => handlePreset('thisYear')}>
                                    Năm nay ({new Date().getFullYear()}) {isPresetActive('thisYear') && <Check size={16} className="text-gray-600" />}
                                </Button>
                                <Button variant="ghost" className={`w-full justify-between rounded-none h-10 px-4 text-sm ${isPresetActive('lastYear') ? "bg-gray-100 font-medium" : "font-normal"}`} onPress={() => handlePreset('lastYear')}>
                                    Năm ngoái ({new Date().getFullYear() - 1}) {isPresetActive('lastYear') && <Check size={16} className="text-gray-600" />}
                                </Button>

                                <Button
                                    variant="ghost"
                                    className={`w-full justify-between rounded-none h-10 px-4 text-sm ${isCustomMode ? "bg-gray-100 font-medium" : "font-normal"}`}
                                    onPress={() => setIsCustomMode(!isCustomMode)}
                                >
                                    Phạm vi ngày tùy chỉnh <ChevronRight size={16} className={`transition-transform ${isCustomMode ? "text-gray-800" : "text-gray-400"}`} />
                                </Button>
                            </div>

                            {/* Khối chọn ngày (Mở rộng ra bên phải) */}
                            {isCustomMode && (
                                <div className="flex flex-col w-full sm:w-[280px] gap-4 p-5 animate-in fade-in slide-in-from-top-2 sm:slide-in-from-left-2 duration-300">
                                    <DateInputFloatingLabel
                                        label="Sau"
                                        value={localDateFrom || ''}
                                        onChange={(val) => setLocalDateFrom(val)}
                                    />
                                    <DateInputFloatingLabel
                                        label="Trước"
                                        value={localDateTo || ''}
                                        onChange={(val) => setLocalDateTo(val)}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 w-full">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`font-medium px-2 transition-colors ${hasDateFilter ? 'text-red-500' : 'text-gray-400 cursor-not-allowed'}`}
                                isDisabled={!dateFrom && !dateTo && !localDateFrom && !localDateTo}
                                onPress={clearDate}
                            >
                                Xóa tất cả
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="font-medium text-blue-600 px-3" onPress={() => setIsOpen(false)}>Huỷ</Button>
                                <Button variant="ghost" size="sm" className={hasLocalChanges ? "font-medium text-blue-600 px-3 cursor-pointer" : "font-medium text-gray-400 px-3"} isDisabled={!hasLocalChanges} onPress={handleCustomApply}>Áp dụng</Button>
                            </div>
                        </div>
                    </div>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    )
}
