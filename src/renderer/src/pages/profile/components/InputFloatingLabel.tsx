import { useId } from 'react'
import { cn } from '@heroui-v3/react'

type InputFloatingLabelProps = {
  id?: string
  label?: string
  name?: string
  value?: string // controlled
  defaultValue?: string // initial value
  type?: string
  isRequired?: boolean
  onChange?: (val: string) => void
  onBlur?: () => void
  endContent?: React.ReactNode
  className?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  errorMessage?: string
}

export function InputFloatingLabel({
  label,
  name,
  value,
  defaultValue = '',
  type = 'text',
  isRequired,
  onChange,
  onBlur,
  endContent,
  disabled,
  readOnly,
  errorMessage,
  className,
  ...rest
}: InputFloatingLabelProps) {
  const autoId = useId()
  const id = rest.id || autoId

  // Use controlled value if provided, otherwise use defaultValue
  const currentValue = value ?? defaultValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  const hasValue = currentValue && currentValue.length > 0
  return (
    <div className="relative h-fit font-['Roboto',sans-serif]">
      <input
        id={id}
        name={name}
        type={type}
        value={currentValue}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        placeholder=" "
        className={cn(
          'text-base font-medium min-h-14 rounded w-full outline-none transition-colors duration-200 peer px-3.5',
          disabled
            ? 'bg-gray-50 cursor-not-allowed text-gray-500 border border-[#c4c4c4]'
            : readOnly
              ? 'cursor-default text-gray-900 border border-[#c4c4c4]'
              : 'border border-[#c4c4c4] hover:border-blue-400 focus:border-2 focus:border-blue-600! focus:px-[13px]',
          errorMessage && !readOnly && !disabled
            ? 'border-red-500 hover:border-red-700 focus:border-red-500'
            : '',
          className
        )}
      />

      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-2.5 bg-white px-1 text-base text-[#666] font-['Momo_Trust_Sans',sans-serif] whitespace-nowrap",
          'transition-all duration-200',
          'top-1/2 -translate-y-1/2',
          // Only show at center if it's not a date-like type and the placeholder is shown
          !['date', 'time', 'datetime-local', 'month', 'week'].includes(type) &&
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[#666]',
          !readOnly &&
            !disabled &&
            'peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:font-medium',
          (hasValue ||
            ['date', 'time', 'datetime-local', 'month', 'week'].includes(type) ||
            readOnly ||
            disabled) &&
            'top-0 -translate-y-1/2 text-xs font-medium',
          errorMessage && !readOnly && !disabled && 'peer-focus:text-red-500',
          errorMessage && hasValue && 'text-red-500'
        )}
      >
        {label}
        {isRequired && <span className="text-red-500 ml-0.5 font-bold">*</span>}
      </label>

      {endContent && <div className="absolute right-3 top-1/2 -translate-y-1/2">{endContent}</div>}
      {errorMessage && <p className="text-xs text-red-500 mt-1">{errorMessage}</p>}
    </div>
  )
}
