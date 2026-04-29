import { DatePicker, DatePickerProps } from '@heroui/react'
import { parseDate } from '@internationalized/date'
import { useMemo, forwardRef } from 'react'
import moment from 'moment'
import { sharedInputWrapperClasses, alwaysFloatedLabelClasses, sharedInputClasses } from './HrInput'

type HrDateInputProps = Omit<DatePickerProps, 'value' | 'onChange'> & {
  value?: string
  onChangeValue?: (val: string) => void
}

export const HrDateInput = forwardRef<HTMLDivElement, HrDateInputProps>((props, ref) => {
  const { value, onChangeValue, ...rest } = props

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
    <div onPaste={handlePaste} className="w-full">
      <DatePicker
        ref={ref as any}
        value={dateValue as any}
        onChange={(date) => onChangeValue?.(date ? date.toString() : '')}
        variant="bordered"
        labelPlacement="inside"
        radius="sm"
        showMonthAndYearPickers
        hideTimeZone
        granularity="day"
        classNames={{
          base: ['group', props.className],
          inputWrapper: [
            ...sharedInputWrapperClasses,
          ],
          label: [...alwaysFloatedLabelClasses, 'mt-0 mb-1.5', '!font-light'],
          innerWrapper: '!mt-0',
          input: sharedInputClasses,
          segment: [
            ...sharedInputClasses,
            'focus:bg-blue-100 dark:focus:bg-blue-900/40 rounded-sm'
          ],
          selectorButton: 'text-[#666] dark:text-gray-400'
        }}
        {...rest}
        className={undefined}
      />
    </div>
  )
})

