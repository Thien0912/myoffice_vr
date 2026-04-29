import React from 'react'
import { Button, cn } from '@heroui-v3/react'



export interface FilterStatusOption {
  value: string
  label: string
  color?: string // Tailwind color class applied to ring/dot, e.g., 'text-blue-500'
  iconStyle?: 'dotted' | 'solid' | 'ring' | 'default'
}

export interface FilterStatusGroup {
  id: string
  label: string
  options: FilterStatusOption[]
}

interface CategorizedStatusBlockProps {
  title?: string
  groups: FilterStatusGroup[]
  selectedValue: string
  onChange: (val: string) => void
}

export const CategorizedStatusBlock: React.FC<CategorizedStatusBlockProps> = ({
  title = 'Chọn trạng thái',
  groups,
  selectedValue,
  onChange
}) => {
  const renderIcon = (option: FilterStatusOption, isSelected: boolean) => {
    const baseColor = option.color || 'text-gray-500'
    const colorBg = baseColor.replace('text-', 'bg-')
    const colorBorder = baseColor.replace('text-', 'border-')

    if (option.iconStyle === 'dotted') {
      return (
        <div
          className={cn(
            'flex items-center justify-center w-4 h-4 rounded-full border-2 border-dotted',
            isSelected ? colorBorder : 'border-gray-400 dark:border-gray-600',
            isSelected && 'bg-opacity-10'
          )}
        >
          {isSelected && <div className={cn('w-1.5 h-1.5 rounded-full', colorBg)} />}
        </div>
      )
    }

    if (option.iconStyle === 'ring') {
      return (
        <div
          className={cn(
            'flex items-center justify-center w-4 h-4 rounded-full border-2',
            isSelected || option.color ? colorBorder : 'border-gray-400 dark:border-gray-600'
          )}
        >
          <div className={cn('w-2 h-2 rounded-full', isSelected || option.color ? colorBg : 'bg-gray-400')} />
        </div>
      )
    }

    // Default simple radio appearance
    return (
      <div
        className={cn(
          'flex items-center justify-center w-4 h-4 rounded-full border-2',
          isSelected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
        )}
      >
        {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[15px] text-gray-800 dark:text-gray-200">{title}</h3>
      </div>

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
              {group.label}
              <div className="w-3 h-3 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold">
                ?
              </div>
            </span>
            <div className="flex flex-col gap-1">
              {group.options.map((opt) => {
                const isSelected = selectedValue === opt.value
                return (
                    <Button
                      key={opt.value}
                      variant="ghost"
                      onPress={() => onChange(opt.value)}
                      className={cn(
                        'justify-start flex items-center gap-3 py-2 px-2 rounded-lg transition-all w-full text-left h-auto min-h-unit-10',
                        isSelected
                          ? 'bg-blue-50/50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      {renderIcon(opt, isSelected)}
                      <span
                        className={cn(
                          'text-[14px] flex-1 text-left',
                          isSelected ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
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
      </div>
    </div>
  )
}
