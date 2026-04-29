import { useId, useState, useRef, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { cn } from '@heroui-v3/react'

type Option = { value: string; label: string }

type Props = {
  label: string
  name?: string
  multiple?: boolean
  options: Option[]
  value?: string | string[]
  defaultValue?: string | string[]
  isRequired?: boolean
  onChange?: (value: string | string[]) => void
  onBlur?: () => void
  endContent?: React.ReactNode
  errorMessage?: string
}

export function SearchableSelect({
  label,
  name,
  multiple = false,
  options = [],
  value,
  defaultValue = multiple ? [] : '',
  isRequired,
  onChange,
  onBlur,
  endContent,
  errorMessage
}: Props) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [hoverBadge, setHoverBadge] = useState(false)

  // Controlled value
  const currentValue = value ?? defaultValue
  const selected = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : []

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
    (opt?.label ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // Scroll to selected item when dropdown opens (within list only, not browser)
  useEffect(() => {
    if (isOpen && selected.length > 0 && listRef.current) {
      requestAnimationFrame(() => {
        const list = listRef.current
        const activeEl = list?.querySelector(
          `[data-value="${CSS.escape(selected[0])}"]`
        ) as HTMLElement | null
        if (list && activeEl) {
          const listHeight = list.clientHeight
          const itemTop = activeEl.offsetTop
          const itemHeight = activeEl.offsetHeight
          list.scrollTop = itemTop - listHeight / 2 + itemHeight / 2
        }
      })
    }
  }, [isOpen])

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0)
    } else {
      setSearch('')
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleToggleValue = (val: string) => {
    let newVal: string[]

    if (multiple) {
      newVal = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
    } else {
      newVal = [val]
      setIsOpen(false)
      onBlur?.()
    }

    const selectedLabel = getLabel(val)
    console.log('Select Changed:', {
      name: name,
      value: multiple ? newVal : newVal[0],
      label: selectedLabel,
      multiple: multiple,
      allSelected: newVal
    })

    onChange?.(multiple ? newVal : newVal[0])
  }

  const handleRemoveValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newVal = selected.filter((v) => v !== val)
    onChange?.(multiple ? newVal : newVal[0] || '')
  }

  const getLabel = (v: string) => options.find((opt) => opt.value === v)?.label || v
  const hasValue = selected.length > 0
  const maxVisible = 2
  const hiddenCount = selected.length - maxVisible
  const visibleTags = selected.slice(0, maxVisible)
  const hiddenTags = selected.slice(maxVisible)

  return (
    <div className="relative font-['Roboto',sans-serif]" ref={containerRef}>
      {/* Hidden inputs for form submission */}
      {multiple
        ? selected.map((v, i) => <input key={i} type="hidden" name={`${name}[]`} value={v} />)
        : selected[0] && <input type="hidden" name={name} value={selected[0]} />}

      {/* Display field */}
      <div
        className={cn(
          'border border-[#c4c4c4] dark:border-gray-700 min-h-14 rounded px-3.5 py-1 pr-8 flex flex-wrap gap-1 items-center cursor-pointer bg-white dark:bg-gray-800 w-full overflow-hidden min-w-0',
          'hover:border-blue-400 dark:hover:border-blue-300 transition-colors duration-200',
          isOpen && 'border-2 border-blue-600 hover:border-blue-600 dark:border-blue-500 px-[13px]',
          errorMessage && !isOpen && 'border-red-500 hover:border-red-700'
        )}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false)
            onBlur?.()
          } else {
            setIsOpen(true)
          }
        }}
      >
        {multiple ? (
          hasValue ? (
            <>
              {visibleTags.map((v) => (
                <span
                  key={v}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-4 py-0.5 rounded-full"
                >
                  {getLabel(v)}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-red-500 transition-colors"
                    onClick={(e) => handleRemoveValue(v, e)}
                  />
                </span>
              ))}
              {hiddenCount > 0 && (
                <div
                  className="relative"
                  onMouseEnter={() => setHoverBadge(true)}
                  onMouseLeave={() => setHoverBadge(false)}
                >
                  <span className="bg-gray-200 text-gray-700 text-xs px-4 py-0.5 rounded-full cursor-default select-none">
                    +{hiddenCount}
                  </span>
                  {hoverBadge && (
                    <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-xs right-0 top-full mt-1 w-44">
                      {hiddenTags.map((v) => (
                        <div
                          key={v}
                          className="flex items-center justify-between hover:bg-gray-50 px-1 py-0.5 rounded-md"
                        >
                          <span>{getLabel(v)}</span>
                          <X
                            size={12}
                            className="cursor-pointer text-gray-400 hover:text-red-500"
                            onClick={(e) => handleRemoveValue(v, e)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-sm px-1"> </span>
          )
        ) : (
          <span className={cn('text-base truncate', hasValue ? 'text-gray-900' : 'text-gray-400')}>
            {hasValue ? getLabel(selected[0]) : ' '}
          </span>
        )}
      </div>

      {/* Chevron icon */}
      <div
        className={cn(
          'absolute right-3 top-1/2 -translate-y-1/2',
          'pointer-events-none flex items-center'
        )}
      >
        {endContent && <div className="pointer-events-auto">{endContent}</div>}
        <ChevronDown
          size={16}
          className={cn('text-gray-400 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </div>

      {/* Floating label — left shifts by 1px when border-2 is active to stay visually aligned (MUI-style) */}
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-2.5 bg-white dark:bg-gray-800 px-1 text-base text-[#666] dark:text-gray-400 font-['Momo_Trust_Sans',sans-serif] whitespace-nowrap",
          'transition-all duration-200',
          hasValue || isOpen
            ? cn(
                'top-0 -translate-y-1/2 text-xs font-medium',
                isOpen && 'text-blue-600 dark:text-blue-400'
              )
            : 'top-1/2 -translate-y-1/2'
        )}
      >
        {label}
        {isRequired && <span className="text-red-500 ml-0.5 font-bold">*</span>}
      </label>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xl mt-1 max-h-72 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={'Tìm ' + label}
                className="w-full border border-[#c4c4c4] dark:border-gray-700 dark:bg-gray-900 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-[10px] text-gray-400 hover:text-gray-600"
                >
                  <X className="cursor-pointer" size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div ref={listRef} className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selected.includes(opt.value)
                return (
                  <div
                    key={opt.value}
                    data-value={opt.value}
                    className={cn(
                      'px-4 py-2 cursor-pointer text-sm transition-colors',
                      'hover:bg-blue-50',
                      isSelected && 'bg-blue-100 text-blue-700 font-medium'
                    )}
                    onClick={() => handleToggleValue(opt.value)}
                  >
                    {opt.label}
                  </div>
                )
              })
            ) : (
              <div className="px-4 py-4 text-sm text-gray-400 text-center">
                Không tìm thấy "{search}" trong {label}
              </div>
            )}
          </div>
        </div>
      )}
      {errorMessage && <p className="text-xs text-red-500 mt-1">{errorMessage}</p>}
    </div>
  )
}
