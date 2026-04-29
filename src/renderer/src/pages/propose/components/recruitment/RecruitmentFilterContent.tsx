import { DateField, DateRangePicker, RangeCalendar } from '@heroui-v3/react'
import { Button, cn } from '@heroui/react'
import { parseDate } from '@internationalized/date'
import React from 'react'
import {
  FilterOption,
  filterOptionsMap,
  getQuickSelectDates,
  RecruitmentFilters
} from '../../constants/recruitmentConstants'

type RecruitmentFilterContentProps = {
  activeTabId: string
  filters: RecruitmentFilters
  onFilterChange: (tabId: string, values: string[]) => void
  tabLabel: string
}

const RecruitmentFilterContent = React.memo(
  ({ activeTabId, filters, onFilterChange, tabLabel }: RecruitmentFilterContentProps) => {
    if (activeTabId === 'time') {
      return <TimeFilterContent filters={filters} onFilterChange={onFilterChange} />
    }

    return (
      <CheckboxFilterContent
        activeTabId={activeTabId}
        filters={filters}
        onFilterChange={onFilterChange}
      />
    )
  }
)

RecruitmentFilterContent.displayName = 'RecruitmentFilterContent'

// ──────────────────────────────────────────────
// Time Filter Sub-component
// ──────────────────────────────────────────────

const TimeFilterContent = React.memo(
  ({
    filters,
    onFilterChange
  }: {
    filters: RecruitmentFilters
    onFilterChange: (tabId: string, values: string[]) => void
  }) => (
    <div className="flex flex-col gap-4 px-1 pb-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <DateRangePicker
            className="w-full"
            value={
              filters.time?.[0] &&
              filters.time[0].includes('-') &&
              filters.time?.[1] &&
              filters.time[1].includes('-')
                ? { start: parseDate(filters.time[0]), end: parseDate(filters.time[1]) }
                : null
            }
            onChange={(value) => {
              if (value && value.start && value.end) {
                onFilterChange('time', [value.start.toString(), value.end.toString()])
              } else {
                onFilterChange('time', [])
              }
            }}
          >
            <DateField.Group>
              <DateField.InputContainer>
                <DateField.Input slot="start">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateRangePicker.RangeSeparator />
                <DateField.Input slot="end">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
              </DateField.InputContainer>
              <DateField.Suffix>
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DateRangePicker.Popover>
              <RangeCalendar aria-label="Lịch chọn ngày">
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
        </div>
        <Button
          variant="bordered"
          className="w-full mt-1 border-gray-200 text-gray-600 font-medium h-9 rounded-lg"
          onPress={() => onFilterChange('time', [])}
        >
          Xóa chọn
        </Button>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          CHỌN NHANH
        </label>
        <div className="flex flex-wrap gap-2">
          {['Hôm nay', 'Hôm qua', 'Tuần này', 'Tháng này', 'Năm nay'].map((quick) => {
            const quickDates = getQuickSelectDates(quick)
            const isActive =
              filters.time?.[0] === quickDates[0] && filters.time?.[1] === quickDates[1]

            return (
              <Button
                key={quick}
                size="sm"
                variant="bordered"
                className={cn(
                  'border border-gray-200 font-medium text-xs px-3 min-w-0 rounded-lg h-8 transition-colors',
                  isActive
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                onPress={() => onFilterChange('time', quickDates)}
              >
                {quick}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
)

TimeFilterContent.displayName = 'TimeFilterContent'

// ──────────────────────────────────────────────
// Checkbox Filter Sub-component
// ──────────────────────────────────────────────

const CheckboxFilterContent = React.memo(
  ({
    activeTabId,
    filters,
    onFilterChange
  }: {
    activeTabId: string
    filters: RecruitmentFilters
    onFilterChange: (tabId: string, values: string[]) => void
  }) => {
    const options = filterOptionsMap[activeTabId] || []
    const grouped = options.reduce(
      (acc, opt) => {
        const groupName = opt.group || 'DEFAULT'
        if (!acc[groupName]) acc[groupName] = []
        acc[groupName].push(opt)
        return acc
      },
      {} as Record<string, FilterOption[]>
    )

    return (
      <>
        {Object.entries(grouped).map(([groupName, groupOptions]) => (
          <div key={groupName} className="flex flex-col gap-1">
            {groupName !== 'DEFAULT' && (
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2 px-1">
                {groupName}
                <div className="w-3 h-3 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold">
                  ?
                </div>
              </span>
            )}
            <div className="flex flex-col gap-1">
              {groupOptions.map((opt) => {
                const selectedValues = filters[activeTabId as keyof RecruitmentFilters]
                const isSelected = selectedValues.includes(opt.value)

                const renderIcon = () => {
                  if (!opt.iconStyle) {
                    return (
                      <div
                        className={cn(
                          'flex items-center justify-center w-4 h-4 rounded-[4px] border-2 transition-colors shrink-0',
                          isSelected
                            ? 'border-blue-400 bg-blue-400'
                            : 'border-gray-300 dark:border-gray-600'
                        )}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    )
                  }
                  const baseColor = opt.color || 'text-gray-500'
                  const colorBg = baseColor.replace('text-', 'bg-')
                  const colorBorder = baseColor.replace('text-', 'border-')
                  if (opt.iconStyle === 'dotted') {
                    return (
                      <div
                        className={cn(
                          'flex items-center justify-center w-4 h-4 rounded-full border-2 border-dotted shrink-0',
                          isSelected ? colorBorder : 'border-gray-400 dark:border-gray-600',
                          isSelected && 'bg-opacity-10'
                        )}
                      >
                        {isSelected && <div className={cn('w-1.5 h-1.5 rounded-full', colorBg)} />}
                      </div>
                    )
                  }
                  if (opt.iconStyle === 'icon') {
                    const IconComp = opt.icon
                    return (
                      <div
                        className={cn(
                          'flex items-center justify-center w-4 h-4 shrink-0',
                          isSelected ? colorBorder : 'text-gray-400 dark:text-gray-500'
                        )}
                      >
                        <IconComp size={14} strokeWidth={2.5} />
                      </div>
                    )
                  }
                  if (opt.iconStyle === 'ring') {
                    return (
                      <div
                        className={cn(
                          'flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0',
                          isSelected || opt.color
                            ? colorBorder
                            : 'border-gray-400 dark:border-gray-600'
                        )}
                      >
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            isSelected || opt.color ? colorBg : 'bg-gray-400'
                          )}
                        />
                      </div>
                    )
                  }
                }

                return (
                  <Button
                    key={opt.value}
                    variant="light"
                    onPress={() => {
                      const newValues = isSelected
                        ? selectedValues.filter((v) => v !== opt.value)
                        : [...selectedValues, opt.value]
                      onFilterChange(activeTabId, newValues)
                    }}
                    className={cn(
                      'justify-start flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all w-full text-left h-auto hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {renderIcon()}
                    <span
                      className={cn(
                        'text-[14px] flex-1 text-left',
                        isSelected
                          ? 'font-medium text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      {opt.label}
                    </span>
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </>
    )
  }
)

CheckboxFilterContent.displayName = 'CheckboxFilterContent'

export default RecruitmentFilterContent
