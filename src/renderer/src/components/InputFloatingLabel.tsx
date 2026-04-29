import { useId, useState, forwardRef } from 'react'
import { cn } from '@heroui-v3/react'
import { motion } from 'framer-motion'

import {
  sizeStyles,
  radiusStyles,
  FloatingLabelSize,
  FloatingLabelRadius
} from './FloatingLabelConfig'

type InputFloatingLabelProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'size'
> & {
  label?: string
  onChange?: any
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  size?: FloatingLabelSize
  radius?: FloatingLabelRadius
  isRequired?: boolean
  isInvalid?: boolean
  errorMessage?: string
  height?: string
}

export const InputFloatingLabel = forwardRef<HTMLInputElement, InputFloatingLabelProps>(
  (
    {
      label,
      name,
      value,
      defaultValue = '',
      type = 'text',
      isRequired,
      onChange,
      startContent,
      endContent,
      size = 'md',
      radius = 'sm',
      className,
      isInvalid,
      errorMessage,
      height,
      ...rest
    },
    ref
  ) => {
    const autoId = useId()
    const { placeholder: propPlaceholder, onFocus, onBlur, ...otherRest } = rest
    const id = otherRest.id || autoId
    const [isFocused, setIsFocused] = useState(false)

    // Nếu có value prop => controlled, nếu không => internal state
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue)

    // Determine the actual value to display
    const inputValue = isControlled ? (value ?? '') : internalValue

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value)
      onChange?.(e.target.value)
    }

    const hasValue = inputValue !== undefined && String(inputValue).trim().length > 0
    const currentSize = sizeStyles[size]
    const currentRadius = radiusStyles[radius]
    const isFloating = hasValue || isFocused

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    return (
      <div className={cn('relative w-full group', height || currentSize.input)}>
        {startContent && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            {startContent}
          </div>
        )}
        <input
          ref={ref}
          name={name}
          type={type}
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFloating ? propPlaceholder || ' ' : ' '}
          className={cn(
            'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300',
            'hover:border-blue-400 dark:hover:border-blue-300',
            'focus:border-blue-600 dark:focus:border-blue-500 focus:ring-0 outline-none shadow-none w-full px-3',
            !!startContent && 'pl-10',
            !!endContent && 'pr-10',
            !!startContent && 'pl-10',
            !!endContent && 'pr-10',
            'h-full', // Take full height of container
            currentRadius,
            className
          )}
          {...otherRest}
          id={id}
        />
        <motion.label
          htmlFor={id}
          initial={false}
          animate={{
            y: isFloating ? '-150%' : '-50%',
            x: isFloating ? -4 : startContent ? 28 : 0,
            scale: isFloating ? 0.88 : 1,
            color: isFloating ? (isInvalid ? '#ef4444' : '#2563eb') : '#9ca3af'
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={cn(
            'absolute left-3 bg-white dark:bg-gray-800 px-1 pointer-events-none z-10 origin-left select-none outline-none',
            currentSize.label,
            'top-1/2'
          )}
        >
          {label}
          {isRequired && <span className="text-red-500 ml-0.5 font-bold">*</span>}
        </motion.label>
        {errorMessage && isInvalid && (
          <div className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-medium truncate w-full">
            {errorMessage}
          </div>
        )}
        {endContent && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-gray-400 group-focus-within:text-blue-500 transition-colors">
            {endContent}
          </div>
        )}
      </div>
    )
  }
)

InputFloatingLabel.displayName = 'InputFloatingLabel'
