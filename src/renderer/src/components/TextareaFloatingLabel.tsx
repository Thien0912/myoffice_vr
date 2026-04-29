import { cn } from '@heroui-v3/react'
import { motion } from 'framer-motion'
import { forwardRef, useEffect, useId, useState } from 'react'

import {
  FloatingLabelRadius,
  FloatingLabelSize,
  commonInputClasses,
  radiusStyles,
  sizeStyles
} from './FloatingLabelConfig'

type TextareaFloatingLabelProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange' | 'size'
> & {
  label?: string
  onChange?: any
  size?: FloatingLabelSize
  radius?: FloatingLabelRadius
  isRequired?: boolean
  isInvalid?: boolean
  hideLabel?: boolean
  errorMessage?: string
}

export const TextareaFloatingLabel = forwardRef<HTMLTextAreaElement, TextareaFloatingLabelProps>(
  (
    {
      label,
      name,
      value,
      defaultValue = '',
      isRequired,
      isInvalid,
      errorMessage,
      onChange,
      rows = 3,
      size = 'md',
      radius = 'sm',
      className,
      hideLabel,
      ...rest
    },
    ref
  ) => {
    const autoId = useId()
    const { placeholder: propPlaceholder, onFocus, onBlur, ...otherRest } = rest
    const id = otherRest.id || autoId
    const [isFocused, setIsFocused] = useState(false)

    const [val, setVal] = useState<string | number | readonly string[]>(value ?? defaultValue ?? '')

    // Đồng bộ value khi parent control
    useEffect(() => {
      if (value !== undefined) setVal(value)
    }, [value])

    useEffect(() => {
      const textarea =
        ref && 'current' in ref ? ref.current : (document.getElementById(id) as HTMLTextAreaElement)
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [val])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setVal(e.target.value)
      onChange?.(e.target.value)

      // Auto-resize logic
      e.target.style.height = 'auto'
      e.target.style.height = `${e.target.scrollHeight}px`
    }

    const hasValue = String(val).length > 0

    const currentSize = sizeStyles[size]
    const currentRadius = radiusStyles[radius]

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    return (
      <div className="relative">
        <textarea
          ref={ref}
          name={name}
          rows={rows}
          className={cn(
            commonInputClasses,
            'w-full peer transition-all',
            !isInvalid && 'bg-white dark:bg-gray-800',
            isInvalid && 'border-red-500 dark:border-red-500 hover:border-red-600 bg-red-50/10',
            currentSize.textarea,
            currentRadius,
            className
          )}
          placeholder={propPlaceholder || ' '}
          value={val}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...otherRest}
          id={id}
        />
        {!hideLabel && label && (
          <motion.label
            htmlFor={id}
            initial={false}
            animate={{
              y: hasValue || isFocused ? '-145%' : '-50%',
              x: hasValue || isFocused ? -4 : 0,
              scale: hasValue || isFocused ? 0.88 : 1,
              color: hasValue || isFocused ? (isInvalid ? '#ef4444' : '#2563eb') : '#9ca3af'
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={cn(
              'absolute left-3 bg-white dark:bg-gray-800 px-1 pointer-events-none z-10 origin-left select-none',
              currentSize.label,
              'top-5' // Textareas start from top, so top-5 or top-6 is more centered with the first line
            )}
          >
            {label}
            {isRequired && <span className="text-red-500 ml-0.5 font-bold">*</span>}
          </motion.label>
        )}
        {errorMessage && isInvalid && (
          <div className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-medium truncate w-full">
            {errorMessage}
          </div>
        )}
      </div>
    )
  }
)

TextareaFloatingLabel.displayName = 'TextareaFloatingLabel'
