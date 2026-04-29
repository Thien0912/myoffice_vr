import { RadioGroup, Radio } from '@heroui/react'
import { forwardRef } from 'react'
import { sharedInputWrapperClasses, alwaysFloatedLabelClasses, sharedInputClasses } from './HrInput'

type HrGenderInputProps = {
  label?: string
  value?: string
  onChange?: (val: string) => void
  isRequired?: boolean
  readOnly?: boolean
  className?: string
}

export const HrGenderInput = forwardRef<HTMLDivElement, HrGenderInputProps>(
  ({ label = 'Giới tính', value, onChange, isRequired, readOnly, className }, ref) => {
    return (
      <RadioGroup
        ref={ref}
        label={label}
        orientation="horizontal"
        value={value}
        onValueChange={onChange}
        isRequired={isRequired}
        isReadOnly={readOnly}
        classNames={{
          base: [
            ...sharedInputWrapperClasses,
            'px-3',
            className
          ],
          label: [...alwaysFloatedLabelClasses, 'mb-0 mt-2', '!font-light'],
          wrapper: ['gap-6', '!-mt-0', ...sharedInputClasses, readOnly && 'pointer-events-none']
        }}
      >
        <Radio value="1" size="sm" classNames={{ label: 'text-sm' }}>Nam</Radio>
        <Radio value="2" size="sm" classNames={{ label: 'text-sm' }}>Nữ</Radio>
      </RadioGroup>
    )
  }
)
