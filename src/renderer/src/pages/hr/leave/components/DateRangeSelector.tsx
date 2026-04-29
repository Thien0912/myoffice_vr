import { Button, Input, Popover, cn } from '@heroui-v3/react'
import { Calendar, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface DateRange {
    from?: string
    to?: string
}

interface DateRangeSelectorProps {
    label: string
    value?: DateRange
    onChange?: (range: DateRange) => void
    className?: string
}

export default function DateRangeSelector({
    label = '',
    value = {},
    onChange = () => { },
    className
}: DateRangeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [localRange, setLocalRange] = useState<DateRange>(value)
    const [isCustomMode, setIsCustomMode] = useState(false)

    const today = new Date()
    const last7days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const thisYearStart = new Date(today.getFullYear(), 0, 1)
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1)
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31)

    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    const formatDisplayDate = (dateStr?: string) => {
        if (!dateStr) return ''
        const [year, month, day] = dateStr.split('-')
        return `${day}/${month}/${year}`
    }

    const presets = [
        {
            label: 'Hôm nay',
            key: 'today',
            value: { from: formatDate(today), to: formatDate(today) }
        },
        {
            label: '7 ngày qua',
            key: 'last7',
            value: { from: formatDate(last7days), to: formatDate(today) }
        },
        {
            label: '30 ngày qua',
            key: 'last30',
            value: { from: formatDate(last30days), to: formatDate(today) }
        },
        {
            label: `Năm nay (${today.getFullYear()})`,
            key: 'thisyear',
            value: { from: formatDate(thisYearStart), to: formatDate(today) }
        },
        {
            label: `Năm ngoài (${today.getFullYear() - 1})`,
            key: 'lastyear',
            value: { from: formatDate(lastYearStart), to: formatDate(lastYearEnd) }
        }
    ]

    const isPresetSelected = (presetValue: DateRange) => {
        return value.from === presetValue.from && value.to === presetValue.to
    }

    const handlePresetSelect = (range: DateRange) => {
        setLocalRange(range)
        onChange(range)
        setIsOpen(false)
    }

    const handleCustomChange = (field: 'from' | 'to', value: string) => {
        const updated = { ...localRange, [field]: value }
        setLocalRange(updated)
        setIsCustomMode(true)
    }

    const handleReset = () => {
        setLocalRange({})
        onChange({})
        setIsCustomMode(false)
    }

    const getDisplayLabel = () => {
        if (!value.from && !value.to) return 'Năm nay'
        if (value.from && value.to) {
            if (value.from === value.to) return formatDisplayDate(value.from)
            return `${formatDisplayDate(value.from)} - ${formatDisplayDate(value.to)}`
        }
        if (value.from) return `Từ ${formatDisplayDate(value.from)}`
        return `Đến ${formatDisplayDate(value.to)}`
    }

    return (
        <div className="w-full flex flex-col">
            {label && (
                <label
                    className={cn(
                        'text-[12px] font-semibold mb-1.5 transition-colors',
                        isFocused || isOpen
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                    )}
                >
                    {label}
                </label>
            )}
            <Popover
                isOpen={isOpen}
                onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) {
                        setIsCustomMode(false)
                        setLocalRange(value)
                        setIsFocused(false)
                    }
                }}
            >
                <Popover.Trigger>
                    <Button
                        size="sm"
                        variant="tertiary"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={cn(
                            'w-full justify-between h-9 min-h-9 px-3',
                            'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-none',
                            'hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-600 transition-all',
                            value.from || value.to ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-900/20' : '',
                            className
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span className="truncate text-[13px] font-medium text-gray-800 dark:text-gray-200">
                                {getDisplayLabel()}
                            </span>
                        </div>
                        <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
                    </Button>
                </Popover.Trigger>

                <Popover.Content
                    placement="right"
                    className="rounded-lg shadow-lg bg-white dark:bg-gray-800 p-0 w-auto overflow-hidden"
                >
                    <Popover.Dialog className="outline-none p-0">
                        <div className="flex w-full max-w-3xl">
                            {/* Left side - Preset options */}
                            <div className="w-48 border-r border-gray-200 dark:border-gray-700 overflow-y-auto max-h-96">
                                <div className="py-2">
                                    {presets.map((preset) => {
                                        const isSelected = isPresetSelected(preset.value)
                                        return (
                                            <Button
                                                key={preset.key}
                                                fullWidth
                                                variant="ghost"
                                                className={cn(
                                                    'justify-between px-4 py-3 h-auto min-h-11 rounded-none text-sm',
                                                    isSelected
                                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                )}
                                                onPress={() => handlePresetSelect(preset.value)}
                                            >
                                                <span>{preset.label}</span>
                                                {isSelected && <Check size={16} className="ml-2" />}
                                            </Button>
                                        )
                                    })}
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                                    <Button
                                        fullWidth
                                        variant="ghost"
                                        className="justify-between px-4 py-3 h-auto min-h-11 font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-none text-sm"
                                        onPress={() => {
                                            setIsCustomMode(true)
                                            setLocalRange(value)
                                        }}
                                    >
                                        <span>Phạm vi ngày tùy chỉnh</span>
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>

                            {/* Right side - Date inputs (visible by default, or in custom mode) */}
                            <div className="flex-1 p-6 space-y-4 min-w-80 border-l border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                                        Từ ngày
                                    </label>
                                    <Input
                                        type="date"
                                        value={localRange.from || ''}
                                        onChange={(e) => handleCustomChange('from', e.target.value)}
                                        className="w-full text-sm bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 h-12 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                                        Đến ngày
                                    </label>
                                    <Input
                                        type="date"
                                        value={localRange.to || ''}
                                        onChange={(e) => handleCustomChange('to', e.target.value)}
                                        className="w-full text-sm bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 h-12 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer - Căn lề chuẩn left/right */}
                        <div className="border-t border-gray-200 dark:border-gray-700 w-full px-4 py-4 flex flex-row items-center justify-between bg-white dark:bg-gray-800">
                            {/* Nhóm bên trái */}
                            <div className="flex justify-start">
                                {(localRange.from || localRange.to) && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-blue-600 dark:text-blue-400 font-medium px-0 min-w-max hover:bg-transparent"
                                        onPress={handleReset}
                                    >
                                        Xóa tất cả
                                    </Button>
                                )}
                            </div>

                            {/* Nhóm bên phải */}
                            <div className="flex flex-row gap-2 justify-end items-center">
                                <Button
                                    size="md"
                                    variant="tertiary"
                                    className="rounded-full bg-[#f0f4ff] text-blue-600 font-semibold px-6 h-10 min-w-[80px]"
                                    onPress={() => {
                                        setIsCustomMode(false)
                                        setLocalRange(value)
                                        setIsOpen(false)
                                    }}
                                >
                                    Huỷ
                                </Button>
                                <Button
                                    size="md"
                                    variant="primary"
                                    // Chỉ disabled khi không có thay đổi nào so với giá trị ban đầu
                                    isDisabled={
                                        !isCustomMode && localRange.from === value.from && localRange.to === value.to
                                    }
                                    className={cn(
                                        'font-semibold px-6 h-10 min-w-[100px] shadow-none',
                                        !isCustomMode && localRange.from === value.from && localRange.to === value.to
                                            ? 'bg-gray-200 text-gray-400'
                                            : 'bg-blue-600 text-white'
                                    )}
                                    onPress={() => {
                                        onChange(localRange)
                                        setIsCustomMode(false)
                                        setIsOpen(false)
                                    }}
                                >
                                    Áp dụng
                                </Button>
                            </div>
                        </div>
                    </Popover.Dialog>
                </Popover.Content>
            </Popover>
        </div>
    )
}
