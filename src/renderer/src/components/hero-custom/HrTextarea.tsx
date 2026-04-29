import { Textarea, TextAreaProps } from '@heroui/react'
import { forwardRef } from 'react'
import { floatableLabelClasses, sharedInputClasses, sharedInputWrapperClasses } from './HrInput'

type HrTextareaProps = TextAreaProps & {
    onChange?: (val: string) => void
}

export const HrTextarea = forwardRef<HTMLTextAreaElement, HrTextareaProps>((props, ref) => {
    const { onChange, onValueChange, ...rest } = props

    return (
        <Textarea
            ref={ref}
            variant="bordered"
            labelPlacement="inside"
            radius="sm"
            placeholder=" "
            classNames={{
                base: props.className,
                inputWrapper: [
                    ...sharedInputWrapperClasses,
                    'items-start'
                ],
                label: floatableLabelClasses,
                input: sharedInputClasses
            }}
            onValueChange={onChange || onValueChange}
            {...rest}
            className={undefined}
        />
    )
})
