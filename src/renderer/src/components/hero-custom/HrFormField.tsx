import { Input, InputProps, cn } from '@heroui/react'
import { Label } from '@heroui-v3/react'
import { forwardRef } from 'react'

export const formFieldLabelClasses = [
  'text-[13px] font-normal text-gray-700 dark:text-gray-300',
]

export const formFieldInputClasses = [
  'bg-white dark:bg-gray-800',
  'border border-gray-200 dark:border-gray-700',
  'hover:border-blue-400 dark:hover:border-blue-500',
  'data-[focus=true]:!bg-white dark:data-[focus=true]:!bg-gray-800',
  'data-[focus=true]:!border-blue-600 dark:data-[focus=true]:!border-blue-500',
  'transition-all duration-200',
  'shadow-none',
  'min-h-[40px]',
  'rounded-lg',
  "font-['Momo_Trust_Sans',sans-serif]",
  'text-sm',
  'text-gray-800 dark:text-gray-100',
  'font-normal',
]

type HrFormFieldProps = InputProps & {
  fieldLabel?: string
  labelClasses?: string
  inputClasses?: string
  onChange?: (val: string) => void
}

export const HrFormField = forwardRef<HTMLInputElement, HrFormFieldProps>((props, ref) => {
  const { fieldLabel, labelClasses, inputClasses, onChange, onValueChange, id, ...rest } = props

  return (
    <div className="flex flex-col gap-1">
      {fieldLabel && (
        <Label htmlFor={id} className={cn(...formFieldLabelClasses, labelClasses)}>
          {fieldLabel}
        </Label>
      )}
      <Input
        ref={ref}
        id={id}
        variant="bordered"
        radius="sm"
        size="sm"
        classNames={{
          base: props.className,
          inputWrapper: [
            ...formFieldInputClasses,
          ],
          input: [
            "font-['Momo_Trust_Sans',sans-serif]",
            'text-sm',
            'text-gray-800 dark:text-gray-100',
            'font-normal',
          ],
        }}
        onValueChange={onChange || onValueChange}
        {...rest}
        className={undefined}
      />
    </div>
  )
})
