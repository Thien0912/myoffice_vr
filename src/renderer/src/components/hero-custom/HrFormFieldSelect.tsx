import { ListBox, Select } from '@heroui-v3/react'
import { Label } from '@heroui-v3/react'
import { forwardRef } from 'react'

type HrFormFieldSelectProps = {
  fieldLabel?: string
  labelClasses?: string
  className?: string
  name?: string
  options: { value: string; label: string }[]
  value?: string
  onChange?: (val: string) => void
  placeholder?: string
}

export const HrFormFieldSelect = forwardRef<HTMLDivElement, HrFormFieldSelectProps>((props, ref) => {
  const { fieldLabel, className, options, value, onChange, placeholder, ...rest } = props

  return (
    <div ref={ref} className="flex flex-col gap-1">
      {fieldLabel && (
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {fieldLabel}
        </Label>
      )}
      <Select
        aria-label={fieldLabel}
        placeholder={placeholder || ' '}
        selectedKey={value}
        onSelectionChange={(key) => {
          if (onChange && key) {
            onChange(key as string)
          }
        }}
        className={className}
        {...rest}
      >
        <Select.Trigger className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 data-[focus=true]:!bg-white dark:data-[focus=true]:!bg-gray-800 data-[focus=true]:!border-blue-600 dark:data-[focus=true]:!border-blue-500 transition-all duration-200 shadow-none px-3 min-h-[40px] rounded-lg">
          <Select.Value
            className="text-sm font-normal text-gray-800 dark:text-gray-100 font-['Momo_Trust_Sans',sans-serif]"
          />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover data-react-aria-top-layer="true">
          <ListBox className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            {options.map((opt) => (
              <ListBox.Item
                key={opt.value}
                id={opt.value}
                textValue={opt.label}
                className="text-sm data-[hovered]:bg-gray-100 dark:data-[hovered]:bg-gray-700 rounded-md data-[selected]:bg-blue-50 dark:data-[selected]:bg-blue-900/30 data-[selected]:text-blue-600 dark:data-[selected]:text-blue-400 font-['Momo_Trust_Sans',sans-serif]"
              >
                {opt.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  )
})
