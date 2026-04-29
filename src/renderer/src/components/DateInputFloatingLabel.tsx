import { cn, DateField, DatePicker, Calendar } from '@heroui-v3/react'
import type { DatePickerProps } from '@heroui-v3/react'
import { I18nProvider } from '@react-aria/i18n'
import { parseDate } from '@internationalized/date'
import { motion } from 'framer-motion'
import moment from 'moment'
import { useCallback, useMemo, useState } from 'react'

import {
    FloatingLabelRadius,
    FloatingLabelSize,
    radiusStyles,
    sizeStyles
} from './FloatingLabelConfig'

interface DateInputProps extends Omit<DatePickerProps<any>, 'value' | 'onChange' | 'label' | 'size'> {
    value?: string | null
    onChange: (value: string) => void
    onBlur?: () => void
    label?: string
    isRequired?: boolean
    endContent?: React.ReactNode
    className?: string
    size?: FloatingLabelSize
    radius?: FloatingLabelRadius
    isFloatingLabel?: boolean
    labelPlacement?: 'inside' | 'outside' | 'outside-left' | string
}

export default function DateInputFloatingLabel({
    label,
    value,
    onChange,
    onBlur,
    size = 'md',
    radius = 'sm',
    className,
    isRequired,
    endContent,
    isFloatingLabel = true,
    labelPlacement,
    ...props
}: DateInputProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const dateValue = useMemo(() => {
        if (!value || value === '0000-00-00' || value === '0000-00-00 00:00:00') return undefined

        const sliced = value.slice(0, 10)
        try {
            return parseDate(sliced)
        } catch (err) {
            const m = moment(value, ['YYYY-MM-DD HH:mm:ss', 'DD/MM/YYYY', 'D/M/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], true)
            if (m.isValid()) {
                try {
                    return parseDate(m.format('YYYY-MM-DD'))
                } catch (e) {
                    return undefined
                }
            }
            return undefined
        }
    }, [value])

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsOpen(open)
            if (!open) {
                onBlur?.()
            }
        },
        [onBlur]
    )

    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            const pasteData = e.clipboardData.getData('text')
            if (!pasteData) return
            const formats = [
                'DD/MM/YYYY', 'D/M/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY',
                'DDMMYYYY', 'DDMYYYY', 'DMMYYYY', 'DMYYYY', 'YYYYMMDD'
            ]
            const m = moment(pasteData.trim(), formats, true)
            if (m.isValid()) {
                e.preventDefault()
                onChange(m.format('YYYY-MM-DD'))
            }
        },
        [onChange]
    )

    const currentSize = sizeStyles[size] || sizeStyles.md
    const currentRadius = radiusStyles[radius] || radiusStyles.none
    const isFloating = !!(dateValue || isOpen || isFocused)

    return (
        <I18nProvider locale="en-GB">
            <div onPaste={handlePaste} className={cn("relative w-full group", isFloatingLabel ? currentSize.input : 'flex flex-col gap-1 h-auto', className)}>
                {!isFloatingLabel && label && (
                    <label className={cn("text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap", isRequired ? 'after:content-["*"] after:text-danger after:ml-0.5' : '')}>
                        {label}
                    </label>
                )}

                <DatePicker
                    {...props}
                    value={dateValue as any}
                    onChange={(date) => {
                        onChange(date ? date.toString() : '')
                    }}
                    onOpenChange={handleOpenChange}
                    onFocusChange={setIsFocused}
                    onKeyDown={(e) => {
                        if (e.key === 'Delete') {
                            e.preventDefault()
                            onChange('')
                        }
                    }}
                    className="w-full h-full relative"
                    isRequired={isRequired}
                >
                    <DateField.Group
                        fullWidth
                        className={cn(
                            'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300',
                            'hover:border-blue-400 dark:hover:border-blue-300',
                            'focus-within:border-blue-600 dark:focus-within:border-blue-500 shadow-none w-full',
                            isFloatingLabel ? 'h-full' : cn("h-10", currentSize.input),
                            currentRadius
                        )}
                    >
                        <DateField.Input>
                            {(segment) => (
                                <DateField.Segment
                                    segment={segment}
                                    className={cn(
                                        "outline-none focus:bg-blue-100 dark:focus:bg-blue-900/50 rounded-sm",
                                        isFloatingLabel && label && !isFloating ? 'opacity-0' : 'opacity-100'
                                    )}
                                />
                            )}
                        </DateField.Input>
                        <DateField.Suffix className="flex items-center gap-1">
                            {endContent}
                            <DatePicker.Trigger className="outline-none focus:outline-none">
                                <DatePicker.TriggerIndicator className="text-gray-400 dark:text-gray-500 w-4 h-4 ml-1" />
                            </DatePicker.Trigger>
                        </DateField.Suffix>
                    </DateField.Group>

                    <DatePicker.Popover placement="bottom start" shouldCloseOnInteractOutside={(e) => {
                        if (!e || !e.closest) return true
                        const isOverlay =
                            e.closest('[data-slot="popover"]') ||
                            e.closest('[role="dialog"]') ||
                            e.closest('.group') // Prevent immediate close if clicking within the group 
                        if (isOverlay) return false
                        return true
                    }} className="w-auto min-w-[280px] z-999999">
                        <Calendar aria-label={label || 'Date'}>
                            <Calendar.Header>
                                <Calendar.YearPickerTrigger>
                                    <Calendar.YearPickerTriggerHeading />
                                    <Calendar.YearPickerTriggerIndicator />
                                </Calendar.YearPickerTrigger>
                                <Calendar.NavButton slot="previous" />
                                <Calendar.NavButton slot="next" />
                            </Calendar.Header>
                            <Calendar.Grid>
                                <Calendar.GridHeader>
                                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                                </Calendar.GridHeader>
                                <Calendar.GridBody>
                                    {(date) => <Calendar.Cell date={date} />}
                                </Calendar.GridBody>
                            </Calendar.Grid>
                            <Calendar.YearPickerGrid>
                                <Calendar.YearPickerGridBody>
                                    {({ year }) => <Calendar.YearPickerCell year={year} />}
                                </Calendar.YearPickerGridBody>
                            </Calendar.YearPickerGrid>
                        </Calendar>
                    </DatePicker.Popover>
                </DatePicker>

                {isFloatingLabel && label && (
                    <motion.label
                        initial={false}
                        animate={{
                            y: isFloating ? '-150%' : '-50%',
                            x: isFloating ? -4 : 0,
                            scale: isFloating ? 0.88 : 1,
                            color: isFloating ? (props.isInvalid ? '#ef4444' : '#2563eb') : '#9ca3af'
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className={cn(
                            'absolute left-3 bg-white dark:bg-gray-800 px-1 pointer-events-none z-10 origin-left select-none outline-none',
                            currentSize.label,
                            'top-1/2'
                        )}
                    >
                        {label}
                        {isRequired && <span className="text-red-500 ml-0.5 font-bold">*</span>}
                    </motion.label>
                )}
            </div>
        </I18nProvider>
    )
}
