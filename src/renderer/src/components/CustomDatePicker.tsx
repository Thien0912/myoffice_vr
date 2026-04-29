import { DatePicker, DatePickerProps } from '@heroui/react'
import { parseDate } from '@internationalized/date'
import { I18nProvider } from '@react-aria/i18n'
import { cn } from '@heroui/react'

interface CustomDatePickerProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
}

export default function CustomDatePicker({
  label,
  value,
  onChange,
  size = 'md',
  radius = 'sm',
  className,
  isRequired,
  ...props
}: CustomDatePickerProps) {
  const dateValue = value ? parseDate(value) : undefined

  // Map size to custom classes for floating label effect
  const sizeClasses = {
    sm: {
      label: 'text-xs md:text-sm',
      labelFloating: '-translate-y-1/2 text-[10px]',
      inputWrapper: 'h-10 md:h-12 min-h-10 md:min-h-12'
    },
    md: {
      label: 'text-sm',
      labelFloating: '-translate-y-1/2 text-xs',
      inputWrapper: 'h-10 min-h-10'
    },
    lg: {
      label: 'text-base',
      labelFloating: '-translate-y-1/2 text-sm',
      inputWrapper: 'h-12 min-h-12'
    }
  }

  const currentSize = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md

  return (
    <I18nProvider locale="vi-VN">
      <DatePicker
        {...props}
        label={
          label ? (
            <span>
              {label}
              {isRequired && <span className="text-red-500 ml-0.5 font-bold">*</span>}
            </span>
          ) : undefined
        }
        value={dateValue as any}
        onChange={(date) => {
          onChange(date ? date.toString() : '')
        }}
        size={size}
        radius={radius}
        variant="bordered"
        labelPlacement="outside"
        classNames={{
          base: cn('w-full relative group', className),
          inputWrapper: cn(
            'relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus-within:!border-blue-700 dark:focus-within:!border-blue-500 focus-within:!ring-0 shadow-none transition-colors',
            currentSize.inputWrapper
          ),
          label: cn(
            'absolute left-2 z-10 pointer-events-none transition-all duration-200 origin-top-left bg-white dark:bg-gray-900 px-1 w-fit top-0',
            currentSize.label,
            currentSize.labelFloating,
            'text-gray-500 dark:text-gray-400',
            'group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 group-focus-within:font-medium',
            value && 'text-blue-600 dark:text-blue-400 font-medium'
          ),
          innerWrapper: 'group-data-[has-label=true]:pt-0',
          input: 'group-data-[has-label=true]:pt-0 text-gray-900 dark:text-gray-100'
        }}
      />
    </I18nProvider>
  )
}
