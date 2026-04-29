import { Input, InputProps } from '@heroui/react'
import { forwardRef } from 'react'

export const sharedInputWrapperClasses = [
  'bg-[#f5f5f5] dark:bg-gray-700',
  'border-none',
  'hover:bg-[#ebebeb] dark:hover:bg-gray-600',
  'data-[focus=true]:!bg-[#f5f5f5] dark:data-[focus=true]:!bg-gray-700',
  'transition-all duration-300',
  'shadow-none',
  'min-h-[64px]', // min-h-16
  'rounded-xl',
  'pl-3',
]

export const sharedLabelClasses = [
  'text-black dark:text-gray-200',
  'data-[focus=true]:text-blue-600 dark:data-[focus=true]:text-blue-500',
  "font-['Momo_Trust_Sans',sans-serif]",
  'font-light!',
  'uppercase',
  'mb-[8px]',
  'truncate',
]

// For Input/Autocomplete/Textarea — label centers when empty, floats up when filled
export const floatableLabelClasses = [
  'text-black dark:text-gray-200',
  'data-[focus=true]:text-blue-600 dark:data-[focus=true]:text-blue-500',
  "font-['Momo_Trust_Sans',sans-serif]",
  // 'font-bold',
  'uppercase',
  'text-[15px]',
  'font-light!',
  'truncate',
  'group-data-[filled-within=true]:!scale-100',
  'group-data-[filled-within=true]:!text-[13px]',
  'group-data-[filled-within=true]:!mb-[8px]',
  'group-data-[filled-within=true]:!text-black dark:group-data-[filled-within=true]:!text-gray-200',
]

// For GenderInput/DateInput — label always floated at 13px
export const alwaysFloatedLabelClasses = [
  ...sharedLabelClasses,
  'text-[13px]',
]

export const sharedInputClasses = [
  "font-['Momo_Trust_Sans',sans-serif]",
  'text-[16px]',
  'text-gray-900 dark:text-gray-100',
  'font-medium'
]

type HrInputProps = InputProps & {
  onChange?: (val: string) => void
}

export const HrInput = forwardRef<HTMLInputElement, HrInputProps>((props, ref) => {
  const { onChange, onValueChange, ...rest } = props

  return (
    <Input
      ref={ref}
      variant="bordered"
      labelPlacement="inside"
      radius="sm"
      placeholder=" "
      classNames={{
        base: props.className,
        inputWrapper: sharedInputWrapperClasses,
        label: floatableLabelClasses,
        input: sharedInputClasses
      }}
      onValueChange={onChange || onValueChange}
      {...rest}
      className={undefined}
    />
  )
})
