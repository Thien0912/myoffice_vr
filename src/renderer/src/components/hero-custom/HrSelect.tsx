import { Select, SelectItem, SelectProps } from '@heroui/react'
import { forwardRef, useMemo } from 'react'
import { sharedInputWrapperClasses, sharedLabelClasses, sharedInputClasses } from './HrInput'

type Option = { value: string; label: string }

type HrSelectProps = Omit<SelectProps<any>, 'children' | 'onChange'> & {
  options: Option[]
  onChange?: (val: string | string[]) => void
}

export const HrSelect = forwardRef<HTMLSelectElement, HrSelectProps>((props, ref) => {
  const { options, onChange, onSelectionChange, ...rest } = props

  // Memoize selectedKeys so HeroUI Select doesn't reset internal state on re-renders
  const selectedKeys = useMemo<'all' | Iterable<string | number> | undefined>(() => {
    if (props.selectedKeys) return props.selectedKeys
    if (props.value === undefined) return undefined
    if (Array.isArray(props.value)) {
      const filtered = (props.value as string[]).filter(Boolean)
      return filtered.length > 0 ? new Set(filtered) : new Set<string>()
    }
    if (props.value !== '') {
      return new Set([String(props.value)])
    }
    return new Set<string>()
  }, [props.value, props.selectedKeys])

  return (
    <Select
      ref={ref}
      variant="bordered"
      labelPlacement="inside"
      radius="sm"
      selectedKeys={selectedKeys}
      classNames={{
        base: props.className,
        trigger: [
          ...sharedInputWrapperClasses,
          '!min-h-[56px]',
          'py-2'
        ],
        label: sharedLabelClasses,
        value: sharedInputClasses
      }}
      popoverProps={{
        className: 'z-[9999]',
      }}
      onSelectionChange={(keys) => {
        if (onSelectionChange) onSelectionChange(keys);
        if (onChange) {
          const arr = Array.from(keys).map(k => String(k));
          if (props.selectionMode === "multiple") {
            onChange(arr);
          } else {
            onChange(arr[0] || "");
          }
        }
      }}
      {...rest}
      value={undefined}
      className={undefined}
    >
      {options.map((opt) => (
        <SelectItem key={opt.value} textValue={opt.label}>
          {opt.label}
        </SelectItem>
      ))}
    </Select>
  )
})

