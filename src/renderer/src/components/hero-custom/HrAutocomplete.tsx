import { Autocomplete, AutocompleteItem, type AutocompleteProps } from '@heroui/react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { sharedInputWrapperClasses, floatableLabelClasses, sharedInputClasses } from './HrInput'

type Option = { value: string; label: string }

type HrAutocompleteProps = Omit<AutocompleteProps<any>, 'children' | 'onSelectionChange'> & {
  options: Option[]
  value?: string
  onChange?: (val: string) => void
}

export const HrAutocomplete = forwardRef<HTMLInputElement, HrAutocompleteProps>((props, ref) => {
  const { options, value, onChange, ...rest } = props
  const [inputValue, setInputValue] = useState('')
  // Tracks whether user is actively typing — prevents useEffect from overwriting search input
  const isTypingRef = useRef(false)
  const isFocusedRef = useRef(false)

  // Sync displayed label when value or options change (covers edit mode pre-fill + async options load)
  useEffect(() => {
    if (isTypingRef.current) return
    const matched = options.find((o) => String(o.value) === String(value ?? ''))
    setInputValue(matched?.label ?? '')
  }, [value, options])

  const filteredOptions = inputValue && isTypingRef.current
    ? options.filter((o) => o.label.toLowerCase().includes(inputValue.toLowerCase()))
    : options

  return (
    <Autocomplete
      ref={ref}
      variant="bordered"
      labelPlacement="inside"
      radius="sm"
      placeholder=" "
      items={filteredOptions}
      selectedKey={value || null}
      inputValue={inputValue}
      onFocus={(e) => {
        isFocusedRef.current = true
        rest.onFocus?.(e)
      }}
      onBlur={(e) => {
        isFocusedRef.current = false
        isTypingRef.current = false
        // Revert to matched label if the user leaves without selecting a new option
        const matched = options.find((o) => String(o.value) === String(value ?? ''))
        setInputValue(matched?.label ?? '')
        rest.onBlur?.(e)
      }}
      onInputChange={(val) => {
        // Only react to user typing (when focused).
        // Ignore HeroUI internal callbacks that fire when items/selectedKey change —
        // those would overwrite the display value synced by our useEffect.
        if (!isFocusedRef.current) return
        isTypingRef.current = true
        setInputValue(val)
      }}
      onSelectionChange={(key) => {
        isTypingRef.current = false
        if (key !== null) {
          const selected = options.find((o) => o.value === String(key))
          setInputValue(selected?.label ?? '')
          onChange?.(String(key))
        } else if (isFocusedRef.current) {
          // Only clear the form value when the user explicitly deselects (while focused).
          // Ignore HeroUI internal onSelectionChange(null) that fires
          // when selectedKey doesn't exist in items yet (async options load).
          setInputValue('')
          onChange?.('')
        }
      }}
      classNames={{
        base: props.className,
        listboxWrapper: 'max-h-[300px]',
      }}
      inputProps={{
        classNames: {
          inputWrapper: sharedInputWrapperClasses,
          label: floatableLabelClasses,
          input: sharedInputClasses,
        }
      }}
      {...rest}
      className={undefined}
    >
      {(item: Option) => (
        <AutocompleteItem key={item.value} textValue={item.label}>
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  )
})
