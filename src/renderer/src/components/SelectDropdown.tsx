import { cn } from '@heroui-v3/react'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size as floatingSize,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  FloatingPortal
} from '@floating-ui/react'
import { motion } from 'framer-motion'
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  FloatingLabelRadius,
  FloatingLabelSize,
  commonInputClasses,
  radiusStyles,
  sizeStyles
} from './FloatingLabelConfig'

export type SelectOption = { value: string; label: string;[key: string]: any }
export type SelectGroup = { label: string; options: SelectOption[] }

type Props = {
  label: string
  name?: string
  multiple?: boolean
  options: (SelectOption | SelectGroup)[]
  value?: string | string[]
  defaultValue?: string | string[]
  isRequired?: boolean
  onChange?: (value: string | string[]) => void
  onBlur?: () => void
  endContent?: React.ReactNode
  size?: FloatingLabelSize
  radius?: FloatingLabelRadius
  className?: string
  placeholder?: string
  onAddNew?: () => void
  isDisabled?: boolean
  isInvalid?: boolean
  renderOption?: (option: SelectOption) => React.ReactNode
  renderValue?: (option: SelectOption) => React.ReactNode
  height?: string
  labelTop?: string
  /** When true, renders the dropdown inline instead of via FloatingPortal.
   * Use this when SelectDropdown is inside a HeroUI Popover to avoid
   * stacking context / z-index conflicts with the Popover container. */
  disablePortal?: boolean
  /** Max number of chips shown before "+N" overflow badge. Default: 1 */
  maxVisibleChips?: number
  /** When true, the floating label is hidden. Use when context makes the label redundant. */
  hideLabel?: boolean
  /** Visual variant. 'bordered' = default with border. 'flat' = pill-style matching e8eaed inputs. */
  variant?: 'bordered' | 'flat'
}

export function SelectDropdown({
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
  size = 'md',
  radius = 'sm',
  className,
  placeholder = '',
  onAddNew,
  isDisabled = false,
  isInvalid = false,
  renderOption,
  renderValue,
  height,
  labelTop = 'top-1/2',
  disablePortal = false,
  maxVisibleChips = 1,
  hideLabel = false,
  variant = 'bordered'
}: Props) {
  const autoId = useId()
  const id = name || autoId
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isKeyboardRef = useRef(false)
  // Ref for the portal wrapper – used to neutralize React Aria `inert` / `aria-hidden`
  // that HeroUI v3 Drawer/Modal focus-trap applies to document.body children.
  const portalWrapperRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [hoverBadge, setHoverBadge] = useState(false)
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined)

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    options.forEach((item) => {
      if ('options' in item && item.label) {
        initial.add(item.label)
      }
    })
    return initial
  })

  const toggleGroup = (groupLabel: string, e: React.MouseEvent) => {
    e.stopPropagation()
    isKeyboardRef.current = false
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupLabel)) next.delete(groupLabel)
      else next.add(groupLabel)
      return next
    })
  }

  // ── Floating UI setup ──────────────────────────────────────────────────────
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (isDisabled) return
      setIsOpen(open)
      if (!open) onBlur?.()
    },
    placement: 'bottom-start',
    strategy: 'fixed', // escape CSS transform stacking contexts
    whileElementsMounted: autoUpdate, // auto reposition on scroll/resize
    middleware: [
      offset(6),                 // gap between trigger and panel
      flip({ padding: 8 }),      // flip to top if not enough space below
      shift({ padding: 8 }),     // prevent overflow on left/right edges
      floatingSize({             // match panel width to trigger width
        apply({ rects, elements }) {
          setDropdownWidth(rects.reference.width)
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`
          })
        },
        padding: 8
      })
    ]
  })

  // Floating UI interactions
  const click = useClick(context, { enabled: !isDisabled })
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss])

  // ── Value logic ────────────────────────────────────────────────────────────
  const currentValue = value ?? defaultValue
  const selected = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : []

  const currentSize = sizeStyles[size]
  const currentRadius = radiusStyles[radius]

  // Helper: normalize Vietnamese strings for accent-insensitive search
  const removeAccents = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()

  // Flatten options for value lookup
  const flatOptions = useMemo(() => {
    const list: SelectOption[] = []
    options.forEach((item) => {
      if ('options' in item) list.push(...item.options)
      else list.push(item)
    })
    return list
  }, [options])

  const [activeIndex, setActiveIndex] = useState(0)
  const activeItemRef = useRef<HTMLDivElement>(null)

  // Filter options based on search
  const filteredGroups = useMemo(() => {
    if (!search) return options
    const searchNormalized = removeAccents(search)
    return options
      .map((item) => {
        if ('options' in item) {
          const groupLabelMatches = removeAccents(item.label ?? '').includes(searchNormalized)
          if (groupLabelMatches) return item
          const filteredOptions = item.options.filter((opt) =>
            removeAccents(opt?.label ?? '').includes(searchNormalized)
          )
          return filteredOptions.length > 0 ? { ...item, options: filteredOptions } : null
        } else {
          return removeAccents(item.label ?? '').includes(searchNormalized) ? item : null
        }
      })
      .filter(Boolean) as (SelectOption | SelectGroup)[]
  }, [options, search])

  const flattenedFilteredOptions = useMemo(() => {
    const flat: SelectOption[] = []
    const isSearching = search.trim().length > 0
    filteredGroups.forEach((grp) => {
      if ('options' in grp) {
        if (isSearching || !collapsedGroups.has(grp.label)) {
          flat.push(...grp.options)
        }
      }
      else flat.push(grp)
    })
    return flat
  }, [filteredGroups, collapsedGroups, search])

  // Reset active index when search/open changes
  useEffect(() => { setActiveIndex(0) }, [search, isOpen])

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && activeItemRef.current && isKeyboardRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      isKeyboardRef.current = false
    }
  }, [activeIndex, isOpen])

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      setSearch('')
    }
  }, [isOpen])

  useLayoutEffect(() => {
    if (!isOpen) return

    const handleCapture = (e: Event) => {
      const wrapper = portalWrapperRef.current
      if (wrapper && wrapper.contains(e.target as Node)) {
        // Click is inside our portal dropdown — block React Aria from detecting it
        // as an "outside" interaction (which would close the parent Popover)
        e.stopImmediatePropagation()
      }
    }

    // Register with { capture: true } so we intercept before any bubble-phase handlers
    document.addEventListener('pointerdown', handleCapture, { capture: true })
    document.addEventListener('mousedown', handleCapture, { capture: true })

    return () => {
      document.removeEventListener('pointerdown', handleCapture, { capture: true })
      document.removeEventListener('mousedown', handleCapture, { capture: true })
    }
  }, [isOpen])


  useEffect(() => {
    if (!isOpen) return

    const neutralize = () => {
      const el = portalWrapperRef.current
      if (!el) return
      if (el.hasAttribute('inert')) el.removeAttribute('inert')
      if (el.hasAttribute('aria-hidden')) el.removeAttribute('aria-hidden')
      // Also check the FloatingPortal root (parent of our wrapper div)
      const portalRoot = el.parentElement
      if (portalRoot && portalRoot !== document.body) {
        if (portalRoot.hasAttribute('inert')) portalRoot.removeAttribute('inert')
        if (portalRoot.hasAttribute('aria-hidden')) portalRoot.removeAttribute('aria-hidden')
      }
    }

    // Run once immediately (after React renders the portal)
    const rafId = requestAnimationFrame(neutralize)

    // Watch for React Aria re-applying inert/aria-hidden
    const observer = new MutationObserver(neutralize)

    // Observe document.body so we catch when React Aria adds inert to portal root
    observer.observe(document.body, {
      childList: true,
      attributes: true,
      attributeFilter: ['inert', 'aria-hidden'],
      subtree: true
    })

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (flattenedFilteredOptions.length > 0) {
          isKeyboardRef.current = true
          setActiveIndex((prev) => (prev + 1) % flattenedFilteredOptions.length)
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (flattenedFilteredOptions.length > 0) {
          isKeyboardRef.current = true
          setActiveIndex((prev) => (prev - 1 + flattenedFilteredOptions.length) % flattenedFilteredOptions.length)
        }
        break
      case 'Enter':
        e.preventDefault()
        if (flattenedFilteredOptions.length > 0) {
          handleToggleValue(flattenedFilteredOptions[activeIndex].value)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        onBlur?.()
        break
    }
  }

  const isEmpty = filteredGroups.length === 0

  const handleToggleValue = (val: string) => {
    let newVal: string[]
    if (multiple) {
      newVal = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
    } else {
      newVal = selected.includes(val) ? [] : [val]
      setIsOpen(false)
      onBlur?.()
    }
    onChange?.(multiple ? newVal : (newVal[0] ?? ''))
  }

  const handleRemoveValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newVal = selected.filter((v) => v !== val)
    onChange?.(multiple ? newVal : newVal[0] || '')
  }

  const getOption = (v: string) => flatOptions.find((opt) => opt.value === v)
  const getLabel = (v: string) => getOption(v)?.label || v
  const hasValue = selected.some((v) => v !== '' && v !== null && v !== undefined && v !== 'all')
  const maxVisible = maxVisibleChips
  const hiddenCount = selected.length - maxVisible
  const visibleTags = selected.slice(0, maxVisible)
  const hiddenTags = selected.slice(maxVisible)

  return (
    <div
      className={cn('relative w-full', isDisabled && 'opacity-60 pointer-events-none', className)}
    >
      {/* Hidden inputs for form submission */}
      {multiple
        ? selected.map((v, i) => <input key={i} type="hidden" name={`${name}[]`} value={v} />)
        : selected[0] && <input type="hidden" name={name} value={selected[0]} />}

      {/* Main Display Field — Floating UI reference element */}
      <div
        ref={refs.setReference}
        className={cn(
          variant === 'flat'
            ? 'border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 outline-none shadow-none transition-colors'
            : commonInputClasses,
          'px-3 pr-14 flex flex-wrap gap-1 items-center cursor-pointer w-full h-full',
          variant === 'flat'
            ? 'bg-gray-50 dark:bg-gray-800/40'
            : (!isInvalid && 'bg-white'),
          isOpen && (variant === 'flat'
            ? 'ring-2 ring-blue-500/20 border-blue-400 bg-white'
            : 'ring-2 ring-blue-500/20 border-blue-500'),
          isInvalid && 'border-red-500 dark:border-red-500 hover:border-red-600',
          isInvalid && !isOpen && 'bg-red-50/10',
          isInvalid && isOpen && 'ring-2 ring-red-500/20',
          isDisabled && 'bg-gray-50 cursor-not-allowed',
          height || currentSize.inputMin,
          multiple && hasValue ? 'py-1.5' : 'py-0',
          currentRadius
        )}
        {...getReferenceProps()}
      >
        {multiple ? (
          hasValue ? (
            <div className="flex flex-wrap gap-1 items-center">
              {visibleTags.map((v) => (
                <span
                  key={v}
                  className={cn(
                    'flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border',
                    variant === 'flat'
                      ? 'bg-white text-gray-800 border-gray-200'
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                  )}
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
                  <span className={cn(
                    'text-[11px] px-2 py-0.5 rounded-full cursor-default select-none border',
                    variant === 'flat'
                      ? 'bg-white text-gray-600 border-gray-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  )}>
                    +{hiddenCount}
                  </span>
                  {hoverBadge && (
                    <div className="absolute z-60 bg-white border border-gray-200 rounded-md shadow-xl p-2 text-xs right-0 top-full mt-1 w-48 animate-in fade-in zoom-in duration-200">
                      <div className="font-semibold text-gray-500 mb-1 px-1 border-b pb-1">
                        Đã chọn:
                      </div>
                      {hiddenTags.map((v) => (
                        <div
                          key={v}
                          className="flex items-center justify-between hover:bg-gray-50 px-2 py-1.5 rounded-sm group"
                        >
                          <span className="truncate flex-1 pr-2">
                            {renderOption
                              ? renderOption(getOption(v) as SelectOption)
                              : getLabel(v)}
                          </span>
                          <X
                            size={12}
                            className="cursor-pointer text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                            onClick={(e) => handleRemoveValue(v, e)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className={hideLabel ? 'text-[#70757a] text-[13px]' : 'text-transparent'}>
              {placeholder || label || 'Placeholder'}
            </span>
          )
        ) : (
          <span className={cn('text-sm truncate', hasValue ? 'text-gray-900' : 'text-transparent')}>
            {hasValue
              ? renderValue
                ? renderValue(
                  (getOption(selected[0]) || { value: selected[0], label: selected[0] }) as SelectOption
                )
                : renderOption
                  ? renderOption(
                    (getOption(selected[0]) || { value: selected[0], label: selected[0] }) as SelectOption
                  )
                  : getLabel(selected[0])
              : 'Placeholder'}
          </span>
        )}

        {/* Chevron & Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
          {hasValue && !isDisabled && (
            <button
              type="button"
              className="p-0.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onChange?.(multiple ? [] : '')
              }}
            >
              <X size={14} />
            </button>
          )}
          {endContent && <div className="pointer-events-auto shrink-0">{endContent}</div>}
          <ChevronDown
            size={16}
            className={cn(
              'text-gray-400 transition-transform duration-300 pointer-events-none',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </div>

      {/* Floating Label */}
      {!hideLabel && (
        <motion.label
          htmlFor={id}
          initial={false}
          animate={{
            y: hasValue || isOpen ? '-155%' : '-50%',
            x: hasValue || isOpen ? -4 : 0,
            scale: hasValue || isOpen ? 0.88 : 1,
            color: hasValue || isOpen ? (isInvalid ? '#ef4444' : '#2563eb') : '#9ca3af'
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={cn(
            'absolute left-3 bg-white dark:bg-gray-800 px-1 pointer-events-none z-10 origin-left select-none',
            currentSize.label,
            labelTop
          )}
        >
          {label}
          {isRequired && <span className="text-red-500 ml-0.5 font-bold">*</span>}
        </motion.label>
      )}

      {/* Dropdown Panel via Floating UI Portal */}
      {isOpen && (() => {
        const sharedStyle = {
          ...floatingStyles,
          width: dropdownWidth,
          zIndex: 999999
        }
        const sharedClass = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-2xl overflow-hidden flex flex-col"

        const optionsList = (
          <div className="overflow-y-auto py-1 custom-scrollbar max-h-64">
            {!isEmpty ? (
              options.map((item, grpIdx) => {
                if ('options' in item) {
                  const searchNormalized = removeAccents(search)
                  const groupLabelMatches = removeAccents(item.label ?? '').includes(searchNormalized)
                  let filteredOptions = item.options
                  if (!groupLabelMatches && search) {
                    filteredOptions = item.options.filter((opt) =>
                      removeAccents(opt?.label ?? '').includes(searchNormalized)
                    )
                  }
                  if (filteredOptions.length === 0) return null
                  const isSearching = search.trim().length > 0
                  const isCollapsed = !isSearching && collapsedGroups.has(item.label)

                  return (
                    <div key={`group-${grpIdx}`} className="mb-2">
                      <div
                        className="px-4 py-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/50 cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={(e) => toggleGroup(item.label, e)}
                      >
                        <span className="truncate pr-2">{item.label}</span>
                        <ChevronDown
                          size={14}
                          className={cn(
                            "text-gray-400 transition-transform duration-200 shrink-0",
                            isCollapsed ? "-rotate-90" : "rotate-0"
                          )}
                        />
                      </div>
                      {!isCollapsed && filteredOptions.map((opt) => {
                        const globalIndex = flattenedFilteredOptions.findIndex((o) => o.value === opt.value)
                        const isSelected = selected.includes(opt.value)
                        const isActive = globalIndex === activeIndex
                        return (
                          <div
                            key={opt.value}
                            ref={(el) => {
                              if (isActive) activeItemRef.current = el
                            }}
                            className={cn(
                              'px-5 py-1.5 cursor-pointer text-[13px] transition-all flex items-center justify-between',
                              isActive
                                ? 'bg-blue-200/50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100'
                                : 'text-gray-700 dark:text-gray-300',
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            )}
                            onClick={() => handleToggleValue(opt.value)}
                            onMouseEnter={() => setActiveIndex(globalIndex)}
                          >
                            <div className="truncate flex-1">{renderOption ? renderOption(opt) : opt.label}</div>
                            {isSelected && <Check size={16} className="text-blue-600 shrink-0 ml-2" />}
                          </div>
                        )
                      })}
                    </div>
                  )
                } else {
                  const opt = item as SelectOption
                  const searchNormalized = removeAccents(search)
                  if (search && !removeAccents(opt.label ?? '').includes(searchNormalized)) return null
                  const globalIndex = flattenedFilteredOptions.findIndex((o) => o.value === opt.value)
                  if (globalIndex === -1) return null
                  const isSelected = selected.includes(opt.value)
                  const isActive = globalIndex === activeIndex
                  return (
                    <div
                      key={opt.value}
                      ref={(el) => {
                        if (isActive) activeItemRef.current = el
                      }}
                      className={cn(
                        'px-4 py-1.5 cursor-pointer text-[13px] transition-all flex items-center justify-between',
                        isActive ? 'bg-blue-200/50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300',
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      )}
                      onClick={() => handleToggleValue(opt.value)}
                      onMouseEnter={() => { isKeyboardRef.current = false; setActiveIndex(globalIndex) }}
                    >
                      <div className="truncate flex-1">{renderOption ? renderOption(opt) : opt.label}</div>
                      {isSelected && <Check size={16} className="text-blue-600 shrink-0 ml-2" />}
                    </div>
                  )
                }
              })
            ) : (
              <div className="px-4 py-8 text-sm text-gray-400 dark:text-gray-500 text-center flex flex-col items-center gap-2">
                <Search size={24} className="text-gray-200 dark:text-gray-600" />
                <span>Không tìm thấy "{search}"</span>
              </div>
            )}
          </div>
        )

        const searchHeader = (
          <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-10">
            <div className="relative group">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || `Tìm ${label.toLowerCase()}...`}
                className={cn(
                  'w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md pl-8 py-1.5 text-sm focus:outline-none focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 dark:text-gray-100 transition-all',
                  search || onAddNew ? 'pr-14' : 'pr-8'
                )}
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-all cursor-pointer">
                    <X size={14} />
                  </button>
                )}
                {/* {onAddNew && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setIsOpen(false); onAddNew() }} className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-all border border-blue-100 bg-blue-50/50" title={`Thêm mới ${label}`}>
                    <Plus size={14} />
                  </button>
                )} */}
              </div>
            </div>
          </div>
        )

        const panel = (
          <div
            ref={refs.setFloating}
            data-react-aria-top-layer="true"
            style={sharedStyle}
            className={sharedClass}
            // Prevent parent HeroUI Popover/Modal from treating clicks on this portal
            // as "interact outside" (which would close the Popover before selection)
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            {...getFloatingProps()}
          >
            {searchHeader}
            {optionsList}
          </div>
        )

        if (disablePortal) {
          return (
            <div ref={portalWrapperRef} data-react-aria-top-layer="true">
              {panel}
            </div>
          )
        }

        return (
          <FloatingPortal>
            <div ref={portalWrapperRef} data-react-aria-top-layer="true">
              {panel}
            </div>
          </FloatingPortal>
        )
      })()}
    </div>
  )
}
