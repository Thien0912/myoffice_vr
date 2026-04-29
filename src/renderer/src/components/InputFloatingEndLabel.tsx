import { useId, useState, memo } from 'react'
import { cn, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'

import {
  sizeStyles,
  radiusStyles,
  FloatingLabelSize,
  FloatingLabelRadius,
  commonInputClasses
} from './FloatingLabelConfig'

type DropdownItemType = { key: string; label: string; value?: string }

type InputFloatingEndLabelProps = {
  id?: string
  label: string
  name?: string
  value?: string // controlled
  defaultValue?: string // initial value
  type?: string
  isRequired?: boolean
  onChange?: (val: string) => void
  size?: FloatingLabelSize
  radius?: FloatingLabelRadius
  className?: string
  // End icon/button
  endIcon?: React.ReactNode
  onEndIconClick?: () => void
  endAriaLabel?: string
  endDisabled?: boolean
  endTooltip?: React.ReactNode
  // Dropdown support
  dropdownItems?: DropdownItemType[]
  onDropdownSelect?: (item: DropdownItemType) => void
  closeOnSelect?: boolean
  onFocus?: () => void
}

export function InputFloatingEndLabel({
  label,
  name,
  value,
  defaultValue = '',
  type = 'text',
  isRequired,
  onChange,
  className,
  endIcon,
  onEndIconClick,
  endAriaLabel,
  endDisabled,
  endTooltip,
  dropdownItems,
  onDropdownSelect,
  closeOnSelect = true,
  size = 'md',
  radius = 'sm',
  onFocus
}: InputFloatingEndLabelProps) {
  const autoId = useId()
  const id = autoId

  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)

  const currentValue = isControlled ? value : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e.target.value)
  }

  const hasValue = currentValue && currentValue.length > 0
  const hasDropdown = dropdownItems && dropdownItems.length > 0
  const hasEnd = Boolean(endIcon) || hasDropdown

  const currentSize = sizeStyles[size]
  const currentRadius = radiusStyles[radius]

  const triggerBtn = (
    <button
      type="button"
      aria-label={endAriaLabel}
      disabled={endDisabled}
      onClick={!hasDropdown ? onEndIconClick : undefined}
      // title={typeof endTooltip === 'string' ? endTooltip : undefined}
      className={cn(
        'cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center',
        'text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      {endIcon}
    </button>
  )

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        value={currentValue}
        onChange={handleChange}
        onFocus={onFocus}
        placeholder=" "
        className={cn(
          commonInputClasses,
          'px-3 peer w-full',
          currentSize.input,
          currentRadius,
          hasEnd && 'pr-10',
          className
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          'absolute left-3 text-gray-500 bg-white px-1 transition-all duration-200 transform pointer-events-none font-light',
          'top-1/2 -translate-y-1/2',
          'peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-gray-400',
          currentSize.label,
          'peer-focus:top-0 peer-focus:text-blue-600 peer-focus:font-medium',
          `peer-focus:${currentSize.labelFloating} peer-not-placeholder-shown:${currentSize.labelFloating}`,
          'peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-gray-400',
          hasValue &&
            `top-0 ${currentSize.labelFloating} peer-not-placeholder-shown:text-blue-600 font-medium`
        )}
      >
        {label}
        {isRequired && <span className="text-red-500 ml-0.5 font-bold">*</span>}
      </label>

      {hasEnd &&
        (hasDropdown ? (
          // IMPORTANT: Do not wrap DropdownTrigger child with Tooltip to avoid ResizeObserver errors.
          <Dropdown>
            <DropdownTrigger>{triggerBtn}</DropdownTrigger>
            <DropdownMenu
              aria-label={`Menu lựa chọn cho ${label}`}
              onAction={(key) => {
                const item = dropdownItems!.find((i) => i.key === key)
                if (item) {
                  onDropdownSelect?.(item)
                  if (item.value !== undefined) {
                    onChange?.(item.value)
                    if (!isControlled) setInternalValue(item.value)
                  }
                }
              }}
              closeOnSelect={closeOnSelect}
            >
              {dropdownItems!.map((item) => (
                <DropdownItem key={item.key}>{item.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        ) : endTooltip ? (
          <Tooltip placement="left" content={endTooltip}>
            {triggerBtn}
          </Tooltip>
        ) : (
          triggerBtn
        ))}
    </div>
  )
}

export default memo(InputFloatingEndLabel)
