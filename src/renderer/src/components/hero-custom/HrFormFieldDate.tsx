import { cn, DatePicker, DatePickerProps } from '@heroui/react'
import { Label } from '@heroui-v3/react'
import { parseDate } from '@internationalized/date'
import { useMemo, forwardRef } from 'react'
import moment from 'moment'
import { formFieldLabelClasses, formFieldInputClasses } from './HrFormField'
import { sharedInputClasses } from './HrInput'

type HrFormFieldDateProps = Omit<DatePickerProps, 'value' | 'onChange'> & {
  fieldLabel?: string
  labelClasses?: string
  inputClasses?: string
  value?: string
  onChangeValue?: (val: string) => void
}

export const HrFormFieldDate = forwardRef<HTMLDivElement, HrFormFieldDateProps>((props, ref) => {
  const { fieldLabel, labelClasses, inputClasses, value, onChangeValue, id, ...rest } = props

  const dateValue = useMemo(() => {
    if (!value) return null
    const sliced = value.slice(0, 10)
    try {
      return parseDate(sliced)
    } catch {
      return null
    }
  }, [value])

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData('text')
    if (!pasteData) return
    const formats = ['DD/MM/YYYY', 'D/M/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY', 'DDMMYYYY', 'DDMYYYY', 'DMMYYYY', 'DMYYYY', 'YYYYMMDD']
    const m = moment(pasteData.trim(), formats, true)
    if (m.isValid()) {
      e.preventDefault()
      onChangeValue?.(m.format('YYYY-MM-DD'))
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {fieldLabel && (
        <Label htmlFor={id} className={cn(...formFieldLabelClasses, labelClasses)}>
          {fieldLabel}
        </Label>
      )}
      <div onPaste={handlePaste} className="w-full">
        <DatePicker
          ref={ref as any}
          id={id}
          value={dateValue as any}
          onChange={(date) => onChangeValue?.(date ? date.toString() : '')}
          variant="bordered"
          radius="sm"
          size="sm"
          showMonthAndYearPickers
          hideTimeZone
          granularity="day"
          classNames={{
            base: ['group', props.className],
            inputWrapper: [
              ...formFieldInputClasses,
            ],
            innerWrapper: '!mt-0',
            input: [
              "font-['Momo_Trust_Sans',sans-serif]",
              'text-sm',
              'text-gray-800 dark:text-gray-100',
              'font-normal',
            ],
            segment: [
              "font-['Momo_Trust_Sans',sans-serif]",
              'text-sm',
              'text-gray-800 dark:text-gray-100',
              'font-normal',
              'focus:bg-blue-100 dark:focus:bg-blue-900/40 rounded-sm',
            ],
            selectorButton: 'text-[#666] dark:text-gray-400',
          }}
          {...rest}
          className={undefined}
        />
      </div>
    </div>
  )
})
