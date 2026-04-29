import { DatePicker, cn } from '@heroui/react'
import { parseDate } from '@internationalized/date'
import { I18nProvider } from '@react-aria/i18n'
import { motion } from 'framer-motion'
import moment from 'moment'
import React, { useCallback, useMemo, useState } from 'react'

interface DateInputFloatingProps {
  label?: React.ReactNode
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  isRequired?: boolean
  isInvalid?: boolean
  className?: string
  endContent?: React.ReactNode
}

const SIZE_WRAPPER = 'h-14 min-h-14'

export default function DateInputFloating({
  label,
  value,
  onChange,
  onBlur,
  isRequired,
  isInvalid,
  className,
  endContent
}: DateInputFloatingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const dateValue = useMemo(() => {
    if (!value) return undefined
    try {
      return parseDate(value.slice(0, 10))
    } catch {
      return undefined
    }
  }, [value])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (!open) onBlur?.()
    },
    [onBlur]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const txt = e.clipboardData.getData('text')
      if (!txt) return
      const m = moment(txt.trim(), [
        'DD/MM/YYYY', 'D/M/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY',
        'DDMMYYYY', 'DDMYYYY', 'DMMYYYY', 'DMYYYY', 'YYYYMMDD'
      ], true)
      if (m.isValid()) {
        e.preventDefault()
        onChange(m.format('YYYY-MM-DD'))
      }
    },
    [onChange]
  )

  const isFloating = !!(dateValue || isOpen || isFocused)

  return (
    <I18nProvider locale="en-GB">
      <div onPaste={handlePaste} className="w-full h-fit relative group font-['Roboto',sans-serif]">
        <DatePicker
          label={null}
          value={dateValue}
          onChange={(date) => onChange(date ? date.toString() : '')}
          onOpenChange={handleOpenChange}
          onFocusChange={setIsFocused}
          onKeyDown={(e) => {
            if (e.key === 'Delete') {
              e.preventDefault()
              onChange('')
            }
          }}
          size="md"
          variant="bordered"
          labelPlacement="outside"
          endContent={endContent}
          showMonthAndYearPickers
          hideTimeZone
          granularity="day"
          {...({ formatOptions: { day: '2-digit', month: '2-digit', year: 'numeric' } } as any)}
          classNames={{
            base: cn('w-full relative group', className),
            inputWrapper: cn(
              'rounded! px-3.5!',
              'border! border-[#c4c4c4]! bg-white dark:bg-gray-800 transition-all duration-200',
              'hover:border-blue-400! dark:hover:border-blue-300!',
              'group-focus-within:border-2! group-focus-within:border-blue-600! group-focus-within:hover:border-blue-600! dark:group-focus-within:border-blue-500! group-focus-within:ring-0! group-focus-within:px-[13px]!',
              SIZE_WRAPPER
            ),
            innerWrapper: 'group-data-[has-label=true]:pt-0',
            input: 'group-data-[has-label=true]:pt-0 text-base text-gray-900 dark:text-gray-100',
            segment: cn(
              'focus:bg-blue-50 dark:focus:bg-blue-900/40 rounded-sm leading-none transition-opacity duration-200',
              isFloating ? 'opacity-100 text-gray-900 dark:text-gray-100' : 'opacity-0'
            ),
            selectorIcon: 'text-gray-400 dark:text-gray-500 w-4 h-4'
          }}
        />
        <motion.label
          initial={false}
          animate={{
            y: isFloating ? '-160%' : '-50%',
            x: 0,
            scale: isFloating ? 0.75 : 1,
            color: isFloating ? (isInvalid ? '#ef4444' : (isFocused ? '#2563eb' : '#666')) : '#666',
            fontWeight: 500
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={cn(
            "absolute left-2.5 bg-white dark:bg-gray-800 px-1 pointer-events-none z-10 origin-left select-none font-['Momo_Trust_Sans',sans-serif]",
            'text-base font-medium',
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
