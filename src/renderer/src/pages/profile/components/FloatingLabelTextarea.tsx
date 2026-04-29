import { useId } from 'react'
import { cn } from '@heroui-v3/react'

interface FloatingLabelTextareaProps {
  id?: string
  label?: string
  name?: string
  value?: string
  defaultValue?: string
  isRequired?: boolean
  onChange?: (val: string) => void
  minRows?: number
  disabled?: boolean
  placeholder?: string
  className?: string
  maxLength?: number
}

export const FloatingLabelTextarea: React.FC<FloatingLabelTextareaProps> = ({
  id,
  label,
  name,
  value,
  defaultValue = '',
  isRequired,
  onChange,
  minRows = 3,
  disabled,
  placeholder,
  className,
  maxLength
}) => {
  const autoId = useId()
  const textareaId = id || autoId

  const currentValue = value ?? defaultValue
  const hasValue = currentValue && currentValue.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className={cn("relative font-['Roboto',sans-serif]", className)}>
      <textarea
        id={textareaId}
        name={name}
        value={currentValue}
        disabled={disabled}
        placeholder=" "
        onChange={handleChange}
        rows={minRows}
        maxLength={maxLength}
        className={cn(
          'text-base border border-[#c4c4c4] outline-none w-full rounded px-3.5 py-4 min-h-14',
          'hover:border-blue-400',
          'focus:border-2 focus:border-blue-600! focus:px-[13px] focus:py-[15px]',
          'transition-colors duration-200 peer',
          disabled && 'bg-gray-50 cursor-not-allowed hover:border-[#c4c4c4]'
        )}
      />
      <label
        htmlFor={textareaId}
        className={cn(
          "absolute left-2.5 bg-white px-1 transition-all duration-200 pointer-events-none font-['Momo_Trust_Sans',sans-serif]",
          'top-7 -translate-y-1/2 text-base text-[#666]',
          'peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:font-medium',
          hasValue && 'top-0 -translate-y-1/2 text-xs font-medium'
        )}
      >
        {label}
        {isRequired && <span className="text-red-500 ml-0.5 font-bold">*</span>}
      </label>
      {placeholder && !hasValue && (
        <div className="absolute top-4 left-3.5 text-base text-gray-400 pointer-events-none opacity-0 peer-focus:opacity-100 transition-opacity duration-200">
          {placeholder}
        </div>
      )}
      {maxLength && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 select-none">
          {currentValue.length}/{maxLength}
        </div>
      )}
    </div>
  )
}

export default FloatingLabelTextarea
