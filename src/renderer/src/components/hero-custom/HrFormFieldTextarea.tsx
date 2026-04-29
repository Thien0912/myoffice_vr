import { Textarea, cn } from '@heroui/react'
import { Label } from '@heroui-v3/react'
import { forwardRef } from 'react'
import { formFieldLabelClasses, formFieldInputClasses } from './HrFormField'

type HrFormFieldTextareaProps = React.ComponentProps<typeof Textarea> & {
  fieldLabel?: string
  labelClasses?: string
  inputClasses?: string
  onChange?: (val: string) => void
}

export const HrFormFieldTextarea = forwardRef<HTMLTextAreaElement, HrFormFieldTextareaProps>((props, ref) => {
  const { fieldLabel, labelClasses, inputClasses, onChange, onValueChange, id, ...rest } = props

  return (
    <div className="flex flex-col gap-1">
      {fieldLabel && (
        <Label htmlFor={id} className={cn(...formFieldLabelClasses, labelClasses)}>
          {fieldLabel}
        </Label>
      )}
      <Textarea
        ref={ref}
        id={id}
        variant="bordered"
        radius="sm"
        size="sm"
        classNames={{
          base: props.className,
          inputWrapper: [
            ...formFieldInputClasses,
            'items-start',
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
