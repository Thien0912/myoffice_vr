import { useId, useState, useRef, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { cn } from '@heroui-v3/react'
import { createPortal } from 'react-dom'

type Option = { value: string; label: string }

type Props = {
  label: string
  name?: string
  multiple?: boolean
  options: Option[]
  value?: string | string[]
  defaultValue?: string | string[]
  isRequired?: boolean
  onChange?: (value: string | string[]) => void // trực tiếp
}

export function FloatingLabelSelect({
  label,
  name,
  multiple = false,
  options = [],
  value,
  defaultValue = multiple ? [] : '',
  isRequired,
  onChange
}: Props) {
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [hoverBadge, setHoverBadge] = useState(false)
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })

  // Use controlled value if provided, otherwise use defaultValue
  const currentValue = value ?? defaultValue
  const selected = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : []

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus()
    } else {
      // Reset search when closing
      setSearch('')
    }
  }, [isOpen])

  // lọc options
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    if (!isOpen) return

    const handler = (e: MouseEvent) => {
      const target = e.target as Node

      // nếu click bên trong select hoặc dropdown thì bỏ qua
      if (ref.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return
      }

      setIsOpen(false)
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const toggleValue = (val: string) => {
    let newVal: string[]

    if (multiple) {
      // Giữ dropdown mở khi multiple
      newVal = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
    } else {
      // Chọn 1 giá trị thì đóng dropdown
      newVal = [val]
      setIsOpen(false)
    }

    onChange?.(multiple ? newVal : newVal[0])
  }

  const getLabel = (v: string) => options.find((opt) => opt.value === v)?.label || v
  const hasValue = selected.length > 0
  const maxVisible = 2
  const hiddenCount = selected.length - maxVisible
  const visibleTags = selected.slice(0, maxVisible)
  const hiddenTags = selected.slice(maxVisible)

  return (
    <div className="relative" ref={ref}>
      {/* Hidden input cho FormData */}
      {multiple
        ? selected.map((v, i) => <input key={i} type="hidden" name={`${name}[]`} value={v} />)
        : selected[0] && <input type="hidden" name={name} value={selected[0]} />}

      {/* Field hiển thị */}
      <div
        className={cn(
          'border border-gray-300 min-h-10 rounded-sm px-2 py-1 pr-8 flex flex-wrap gap-1 items-center cursor-pointer bg-white w-full',
          'focus-within:outline-blue-700 outline-gray-100 transition-all duration-200'
        )}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        {multiple ? (
          hasValue ? (
            <>
              {visibleTags.map((v) => (
                <span
                  key={v}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  {getLabel(v)}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleValue(v)
                    }}
                  />
                </span>
              ))}
              {hiddenCount > 0 && (
                <div
                  className="relative"
                  onMouseEnter={() => setHoverBadge(true)}
                  onMouseLeave={() => setHoverBadge(false)}
                >
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full cursor-default select-none">
                    +{hiddenCount}
                  </span>
                  {hoverBadge && (
                    <div className="absolute z-9999 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-xs right-0 top-full w-44">
                      {hiddenTags.map((v) => (
                        <div
                          key={v}
                          className="flex items-center justify-between hover:bg-gray-50 px-1 py-0.5 rounded-sm"
                        >
                          <span>{getLabel(v)}</span>
                          <X
                            size={12}
                            className="cursor-pointer text-gray-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleValue(v)
                            }}
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
          <span className={cn('text-sm', hasValue ? 'text-gray-800' : 'text-gray-400')}>
            {hasValue ? getLabel(selected[0]) : ' '}
          </span>
        )}
      </div>

      {/* Chevron icon */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown
          size={16}
          className={cn('text-gray-400 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </div>

      {/* Floating label */}
      <label
        htmlFor={id}
        className={cn(
          'absolute left-3.5 bg-white px-1 transition-all duration-200 transform pointer-events-none text-sm text-gray-500',
          hasValue || isOpen
            ? cn('-top-1.5 text-xs font-medium', isOpen && 'text-blue-600')
            : 'top-1/2 -translate-y-1/2 text-gray-500'
        )}
      >
        {label}
        {isRequired && <span className="text-red-500 ml-0.5 font-bold">*</span>}
      </label>

      {/* Dropdown */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="absolute z-9999 w-(--select-width) bg-white border border-gray-200 rounded-sm shadow-md max-h-72 overflow-auto"
            style={{
              position: 'absolute',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width
            }}
          >
            <div className="relative p-1">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm..."
                className="w-full border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-blue-500"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={cn(
                    'px-4 py-1.5 cursor-pointer text-sm hover:bg-blue-50',
                    selected.includes(opt.value) && 'bg-blue-100 text-blue-700 font-medium'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleValue(opt.value)
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-400 text-center">
                Không tìm thấy kết quả
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  )
}
