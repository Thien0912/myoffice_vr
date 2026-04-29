import React from 'react'
import { Button, cn, DateRangePicker, DateField, RangeCalendar } from '@heroui-v3/react'
import { parseDate } from '@internationalized/date'

export interface TimePreset {
  label: string
  value: { from: string; to: string }
}

interface TimeFilterBlockProps {
  presets: TimePreset[]
  dateRange: { from?: string; to?: string }
  onChange: (range: { from?: string; to?: string }) => void
}

export const TimeFilterBlock: React.FC<TimeFilterBlockProps> = ({
  presets,
  dateRange,
  onChange
}) => {
  const currentRange = dateRange || {}

  return (
    <div className="flex flex-col w-full h-full p-6">
      <h3 className="font-bold text-[15px] mb-5 text-gray-900 dark:text-gray-100">
        Chọn khoảng thời gian
      </h3>

      <div className="flex flex-col gap-4">
        <DateRangePicker
          aria-label="Chọn khoản thời gian"
          value={
            currentRange.from && currentRange.to
              ? {
                start: parseDate(currentRange.from.split('T')[0].split(' ')[0]),
                end: parseDate(currentRange.to.split('T')[0].split(' ')[0])
              }
              : null
          }
          onChange={(range) => {
            if (range) {
              onChange({
                ...currentRange,
                from: range.start.toString(),
                to: range.end.toString()
              })
            } else {
              onChange({ ...currentRange, from: undefined, to: undefined })
            }
          }}
        >
          <DateField.Group
            className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all hover:border-blue-400 focus-within:border-blue-500 w-full px-0"
            fullWidth
            variant="secondary"
          >
            <DateField.InputContainer>
              <DateField.Input slot="start">
                {(segment) => (
                  <DateField.Segment
                    segment={segment}
                    className="outline-none focus:bg-blue-100 dark:focus:bg-blue-900/50 rounded-sm"
                  />
                )}
              </DateField.Input>
              <DateRangePicker.RangeSeparator className="px-2 text-gray-400" />
              <DateField.Input slot="end">
                {(segment) => (
                  <DateField.Segment
                    segment={segment}
                    className="outline-none focus:bg-blue-100 dark:focus:bg-blue-900/50 rounded-sm"
                  />
                )}
              </DateField.Input>
            </DateField.InputContainer>
            <DateField.Suffix>
              <DateRangePicker.Trigger className="outline-none focus:outline-none flex justify-center items-center">
                <DateRangePicker.TriggerIndicator className="text-gray-400 w-4 h-4 ml-1" />
              </DateRangePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>

          <DateRangePicker.Popover className="rounded-md p-2">
            <RangeCalendar>
              <RangeCalendar.Header>
                <RangeCalendar.Heading />
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
            </RangeCalendar>
          </DateRangePicker.Popover>
        </DateRangePicker>
      </div>

      <Button
        variant="secondary"
        className="w-full mt-4 h-10 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
        onPress={() => onChange({})}
        isDisabled={!currentRange.from && !currentRange.to}
      >
        Xóa chọn
      </Button>

      <div className="mt-8">
        <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          CHỌN NHANH
        </h4>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => {
            const isSelected =
              currentRange.from === preset.value.from && currentRange.to === preset.value.to

            return (
              <Button
                key={idx}
                variant="secondary"
                className={cn(
                  'h-8 px-4 min-w-0 font-medium text-[13px] rounded-lg border transition-colors',
                  isSelected
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
                onPress={() => onChange(preset.value)}
              >
                {preset.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
