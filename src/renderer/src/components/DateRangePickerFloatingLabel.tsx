import type { DateRangePickerProps } from '@heroui-v3/react'
import { cn, DateField, DateRangePicker, RangeCalendar } from '@heroui-v3/react'
import { I18nProvider } from '@react-aria/i18n'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

import {
    FloatingLabelRadius,
    FloatingLabelSize,
    radiusStyles,
    sizeStyles
} from './FloatingLabelConfig'

type DateRangePickerFloatingLabelProps = Omit<DateRangePickerProps<any>, 'label' | 'size'> & {
    label?: string
    isRequired?: boolean
    className?: string
    size?: FloatingLabelSize
    radius?: FloatingLabelRadius
}

export const DateRangePickerFloatingLabel = ({
    label,
    value,
    onChange,
    isRequired,
    className,
    size = 'md',
    radius = 'sm',
    ...rest
}: DateRangePickerFloatingLabelProps) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const hasValue = useMemo(() => {
        if (!value) return false
        if (typeof value === 'object') {
            return !!((value as any).start || (value as any).end)
        }
        return !!value
    }, [value])

    const currentSize = sizeStyles[size] || sizeStyles.md
    const currentRadius = radiusStyles[radius] || radiusStyles.none
    const isFloating = hasValue || isFocused || isOpen

    return (
        <I18nProvider locale="en-GB">
            <div className={cn("relative w-full group", currentSize.input, className)}>
                <DateRangePicker
                    value={value as any}
                    onChange={(val) => {
                        onChange?.(val as any)
                    }}
                    onOpenChange={setIsOpen}
                    onFocusChange={setIsFocused}
                    className="w-full h-full relative"
                    isRequired={isRequired}
                    {...rest}
                >
                    <DateField.Group
                        fullWidth
                        className={cn(
                            'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300',
                            'hover:border-blue-400 dark:hover:border-blue-300',
                            'focus-within:border-blue-600 dark:focus-within:border-blue-500 shadow-none w-full px-0',
                            'h-full',
                            currentRadius
                        )}
                    >
                        <DateField.Input slot="start">
                            {(segment) => (
                                <DateField.Segment
                                    segment={segment}
                                    className={cn(
                                        "outline-none focus:bg-blue-100 dark:focus:bg-blue-900/50 rounded-sm",
                                        !isFloating ? 'opacity-0' : 'opacity-100'
                                    )}
                                />
                            )}
                        </DateField.Input>
                        <DateRangePicker.RangeSeparator />
                        <DateField.Input slot="end">
                            {(segment) => (
                                <DateField.Segment
                                    segment={segment}
                                    className={cn(
                                        "outline-none focus:bg-blue-100 dark:focus:bg-blue-900/50 rounded-sm",
                                        !isFloating ? 'opacity-0' : 'opacity-100'
                                    )}
                                />
                            )}
                        </DateField.Input>
                        <DateField.Suffix>
                            <DateRangePicker.Trigger className="outline-none focus:outline-none flex justify-center items-center">
                                <DateRangePicker.TriggerIndicator className="text-gray-400 dark:text-gray-500 w-4 h-4 ml-1" />
                            </DateRangePicker.Trigger>
                        </DateField.Suffix>
                    </DateField.Group>

                    <DateRangePicker.Popover>
                        <RangeCalendar aria-label={label || 'Dates'}>
                            <RangeCalendar.Header>
                                <RangeCalendar.YearPickerTrigger>
                                    <RangeCalendar.YearPickerTriggerHeading />
                                    <RangeCalendar.YearPickerTriggerIndicator />
                                </RangeCalendar.YearPickerTrigger>
                                <RangeCalendar.NavButton slot="previous" />
                                <RangeCalendar.NavButton slot="next" />
                            </RangeCalendar.Header>

                            <RangeCalendar.Grid>
                                <RangeCalendar.GridHeader>
                                    {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                                </RangeCalendar.GridHeader>
                                <RangeCalendar.GridBody>
                                    {(date) => <RangeCalendar.Cell date={date} />}
                                </RangeCalendar.GridBody>
                            </RangeCalendar.Grid>

                            <RangeCalendar.YearPickerGrid>
                                <RangeCalendar.YearPickerGridBody>
                                    {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
                                </RangeCalendar.YearPickerGridBody>
                            </RangeCalendar.YearPickerGrid>
                        </RangeCalendar>
                    </DateRangePicker.Popover>
                </DateRangePicker>

                <motion.label
                    initial={false}
                    animate={{
                        y: isFloating ? '-150%' : '-50%',
                        x: isFloating ? -4 : 0,
                        scale: isFloating ? 0.88 : 1,
                        color: isFloating ? '#2563eb' : '#9ca3af'
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
            </div>
        </I18nProvider>
    )
}
