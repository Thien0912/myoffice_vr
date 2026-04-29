import { cn } from '@heroui-v3/react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
  FloatingLabelRadius,
  FloatingLabelSize,
  commonInputClasses,
  radiusStyles,
  sizeStyles
} from './FloatingLabelConfig'

type Option = { value: string; label: string }
type GroupOption = { label: string; options: Option[] }

type Props = {
  label: string
  name?: string
  multiple?: boolean
  options: (Option | GroupOption)[]
  value?: string | string[]
  defaultValue?: string | string[]
  isRequired?: boolean
  onChange?: (value: string | string[]) => void // trực tiếp
  size?: FloatingLabelSize
  radius?: FloatingLabelRadius
  labelPlacement?: 'inside' | 'outside'
  placeholder?: string
  classNames?: {
    base?: string
    trigger?: string
    label?: string
    popover?: string
    content?: string
  }
}

import { createPortal } from 'react-dom'

export function SelectFloatingLabel({
  label,
  name,
  multiple = false,
  options = [],
  value,
  defaultValue = multiple ? [] : '',
  isRequired,
  onChange,
  size = 'md',
  radius = 'sm',
  labelPlacement = 'inside',
  placeholder,
  classNames
}: Props) {
  const id = useId()
  const triggerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [hoverBadge, setHoverBadge] = useState(false)
  const portalRef = useRef<HTMLDivElement>(null)

  const inputStyleClass = labelPlacement === 'outside'
    ? 'bg-default-100 hover:bg-default-200 border-transparent rounded-medium transition-colors w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-default-100'
    : commonInputClasses

  const [internalSelected, setInternalSelected] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
  )
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const [flipUp, setFlipUp] = useState(false)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  // Cập nhật vị trí và độ rộng của dropdown (with flip-up detection)
  const DROPDOWN_MAX_H = 340 // max-h-72 (288px) + search bar + padding
  const updateCoords = () => {
    if (triggerRef.current && portalContainer) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const shouldFlip = spaceBelow < DROPDOWN_MAX_H && spaceAbove > spaceBelow
      setFlipUp(shouldFlip)

      if (portalContainer === document.body) {
        setCoords({
          top: shouldFlip ? rect.top : rect.bottom,
          left: rect.left,
          width: rect.width
        })
      } else {
        // Nếu nằm trong Modal (dialog), tính tọa độ tương đối với Modal
        const containerRect = portalContainer.getBoundingClientRect()
        const base = shouldFlip
          ? rect.top - containerRect.top + portalContainer.scrollTop
          : rect.bottom - containerRect.top + portalContainer.scrollTop
        setCoords({
          top: base,
          left: rect.left - containerRect.left + portalContainer.scrollLeft,
          width: rect.width
        })
      }
    }
  }

  // Chạy ngay khi mở để tránh giật
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isOpen) {
      // Reset coords để tránh jump vị trí cũ
      setCoords((prev) => ({ ...prev, width: 0 }))

      // Phát tín hiệu đóng các select khác
      const event = new CustomEvent('close-other-selects', { detail: { id } })
      window.dispatchEvent(event)

      // Tìm kiếm dialog container ngay khi click
      // const dialog = triggerRef.current?.closest('[role="dialog"]') as HTMLElement
      setPortalContainer(document.body)

      // Đợi container state update rồi tính tọa độ
      setTimeout(updateCoords, 0)
    }
    setIsOpen(!isOpen)
  }

  // Lắng nghe tín hiệu từ các select khác để tự đóng
  useEffect(() => {
    const handleCloseOthers = (e: any) => {
      if (e.detail?.id !== id) {
        setIsOpen(false)
      }
    }
    window.addEventListener('close-other-selects', handleCloseOthers)
    return () => {
      window.removeEventListener('close-other-selects', handleCloseOthers)
    }
  }, [id])

  // Xử lý Click Outside và đồng bộ vị trí khi scroll/resize
  useLayoutEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portal = document.getElementById(`portal-${id}`)
        if (portal && portal.contains(event.target as Node)) return
        setIsOpen(false)
      }
    }

    if (isOpen && portalContainer) {
      updateCoords()
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', updateCoords, true)
      window.addEventListener('resize', updateCoords)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', updateCoords, true)
      window.removeEventListener('resize', updateCoords)
    }
  }, [isOpen, id, portalContainer])

  // Auto focus search input khi mở & Reset search khi đóng
  // Also neutralize inert/aria-hidden that React Aria sets on portal siblings
  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      return
    }

    const neutralize = () => {
      const el = portalRef.current
      if (el) {
        el.removeAttribute('inert')
        el.removeAttribute('aria-hidden')
      }
    }

    // Observe & neutralize inert that React Aria keeps re-applying
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && (m.attributeName === 'inert' || m.attributeName === 'aria-hidden')) {
          neutralize()
        }
      }
    })

    // Try focus with retry (portal may not be in DOM yet on first tick)
    const tryFocus = (attempt = 0) => {
      if (attempt > 5) return
      neutralize()
      const input = searchInputRef.current
      if (input) {
        input.focus()
        if (document.activeElement === input) return
      }
      requestAnimationFrame(() => setTimeout(() => tryFocus(attempt + 1), 30))
    }

    requestAnimationFrame(() => {
      tryFocus()
      // Start observing after first focus attempt
      if (portalRef.current) {
        observer.observe(portalRef.current, { attributes: true, attributeFilter: ['inert', 'aria-hidden'] })
      }
    })

    return () => observer.disconnect()
  }, [isOpen])

  // Flatten options for logic purposes
  const allOptions = useMemo(() => {
    const flat: Option[] = []
    options.forEach((opt) => {
      if ('options' in opt) {
        flat.push(...opt.options)
      } else {
        flat.push(opt)
      }
    })
    return flat
  }, [options])

  // Lọc và gom nhóm options
  const filteredOutput = useMemo(() => {
    const maxItems = 100
    let totalCount = 0

    if (!search) {
      const result: (Option | GroupOption)[] = []
      for (const opt of options) {
        if (totalCount >= maxItems) break
        if ('options' in opt) {
          const sliced = opt.options.slice(0, maxItems - totalCount)
          if (sliced.length > 0) {
            result.push({ ...opt, options: sliced })
            totalCount += sliced.length
          }
        } else {
          result.push(opt)
          totalCount++
        }
      }
      return result
    }

    const result: (Option | GroupOption)[] = []
    for (const opt of options) {
      if (totalCount >= maxItems) break
      if ('options' in opt) {
        const matchingSub = opt.options.filter((sub) =>
          (sub.label || '').toLowerCase().includes(search.toLowerCase())
        )
        const sliced = matchingSub.slice(0, maxItems - totalCount)
        if (sliced.length > 0) {
          result.push({ ...opt, options: sliced })
          totalCount += sliced.length
        }
      } else {
        if ((opt.label || '').toLowerCase().includes(search.toLowerCase())) {
          result.push(opt)
          totalCount++
        }
      }
    }
    return result
  }, [options, search])

  const isControlled = value !== undefined
  const selected = isControlled ? (Array.isArray(value) ? value : [value]) : internalSelected

  const toggleValue = (val: string) => {
    let newVal: string[]
    if (multiple) {
      newVal = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
    } else {
      newVal = [val]
      // Trì hoãn việc đóng để Modal ko bị đóng nhầm (do dropdown bị xóa khỏi DOM quá nhanh)
      setTimeout(() => {
        setIsOpen(false)
      }, 100)
    }

    if (!isControlled) {
      setInternalSelected(newVal)
    }
    onChange?.(multiple ? newVal : newVal[0])
  }

  const getLabel = (v: string) => allOptions.find((opt) => opt.value === v)?.label || v
  const hasValue = selected.some((v) => v !== '' && v !== null && v !== undefined)
  const maxVisible = 2
  const hiddenCount = selected.length - maxVisible
  const visibleTags = selected.slice(0, maxVisible)
  const hiddenTags = selected.slice(maxVisible)

  const currentSize = sizeStyles[size]
  const currentRadius = radiusStyles[radius]

  // Chặn sự kiện lan ra ngoài Modal (Native Event)
  const stopAllPropgation = (e: any) => {
    e.stopPropagation()
    if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation()
    }
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Hidden input cho FormData */}
      {multiple
        ? selected.map((v, i) => <input key={i} type="hidden" name={`${name}[]`} value={v} />)
        : selected[0] && <input type="hidden" name={name} value={selected[0]} />}

      {/* Label Outside */}
      {labelPlacement === 'outside' && (
        <div className={cn("mb-1 text-[13px] text-foreground-600 block font-medium pointer-events-none", classNames?.label)}>
          {label} {isRequired && <span className="text-danger">*</span>}
        </div>
      )}

      <div
        ref={triggerRef}
        className={cn(
          inputStyleClass,
          'px-3 py-1.5 flex flex-wrap gap-1 items-center cursor-pointer relative z-20',
          isOpen && (labelPlacement === 'outside' ? 'bg-default-100' : 'ring-2 ring-primary/20 border-primary'),
          currentSize.inputMin,
          currentRadius,
          labelPlacement === 'outside' && 'min-h-[40px]',
          classNames?.trigger
        )}
        onClick={handleToggle}
        onMouseDown={stopAllPropgation}
      >
        {multiple ? (
          hasValue ? (
            <>
              {visibleTags.map((v) => (
                <span
                  key={v}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                  onClick={(e) => {
                    stopAllPropgation(e)
                  }}
                >
                  {getLabel(v)}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-red-500"
                    onClick={(e) => {
                      stopAllPropgation(e)
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
                  onMouseDown={stopAllPropgation}
                >
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full cursor-default select-none">
                    +{hiddenCount}
                  </span>
                  {hoverBadge && (
                    <div
                      className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-xs right-0 top-full w-44"
                      onMouseDown={stopAllPropgation}
                      onClick={stopAllPropgation}
                    >
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
                              stopAllPropgation(e)
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
          <span className={cn('text-sm truncate w-full pr-4 inline-block', hasValue ? 'text-gray-800' : 'text-gray-400')}>
            {hasValue ? getLabel(selected[0]) : (placeholder || ' ')}
          </span>
        )}

        {labelPlacement === 'inside' && (
          <motion.label
            htmlFor={id}
            initial={false}
            animate={{
              y: hasValue || isOpen ? '-145%' : '-50%',
              x: hasValue || isOpen ? -4 : 0,
              scale: hasValue || isOpen ? 0.88 : 1,
              color: hasValue || isOpen ? '#2563eb' : '#9ca3af'
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={cn(
              'absolute left-3 bg-white dark:bg-gray-800 px-1 pointer-events-none z-10 origin-left select-none',
              currentSize.label,
              'top-1/2'
            )}
          >
            {label}
            {isRequired && <span className="text-red-500 ml-0.5 font-bold">*</span>}
          </motion.label>
        )}
      </div>

      {/* Dropdown Danh sách (Sử dụng Portal để đè lên modal) */}
      {isOpen &&
        portalContainer &&
        createPortal(
          <div
            ref={portalRef}
            id={`portal-${id}`}
            data-react-aria-top-layer="true"
            className={cn(
              'bg-white border border-gray-200 shadow-xl rounded-md z-9999 overflow-hidden animate-in fade-in zoom-in-95 duration-100',
              flipUp ? 'origin-bottom mb-1' : 'origin-top mt-1',
              portalContainer === document.body ? 'fixed' : 'absolute',
              coords.width === 0 && 'opacity-0'
            )}
            style={{
              ...(flipUp
                ? { bottom: window.innerHeight - coords.top, left: coords.left, width: coords.width }
                : { top: coords.top, left: coords.left, width: coords.width }
              )
            }}
            onMouseDown={stopAllPropgation}
            onMouseUp={stopAllPropgation}
            onClick={stopAllPropgation}
            onPointerDown={stopAllPropgation}
          >
            <div className="w-full max-h-72 overflow-auto">
              <div className="sticky top-0 bg-white p-2 border-b border-gray-200 z-10">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="Tìm kiếm..."
                  className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {search && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSearch('')
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Option rỗng để unselect */}
              {!multiple && search === '' && (
                <div
                  className={cn(
                    'px-3 py-2 cursor-pointer text-sm text-foreground-500 hover:bg-default-100 transition-colors italic border-b border-dashed border-divider',
                    selected.length === 0 && 'bg-primary-50 font-medium text-primary'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isControlled) setInternalSelected([])
                    onChange?.('')
                    setIsOpen(false)
                  }}
                >
                  -- Chọn --
                </div>
              )}

              {filteredOutput.length > 0 ? (
                filteredOutput.map((item, idx) => {
                  if ('options' in item) {
                    return (
                      <div key={`group-${idx}`} className="mb-0">
                        <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-y border-gray-200">
                          {item.label}
                        </div>
                        {item.options.map((opt) => (
                          <div
                            key={opt.value}
                            className={cn(
                              'px-4 py-2 cursor-pointer text-sm hover:bg-default-100 transition-colors flex items-center justify-between',
                              selected.includes(opt.value) && 'bg-primary-50 text-primary font-medium'
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleValue(opt.value)
                            }}
                          >
                            <span>{opt.label}</span>
                            {selected.includes(opt.value) && (
                              <span className="text-primary">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  }

                  return (
                    <div
                      key={item.value}
                      className={cn(
                        'px-4 py-2 cursor-pointer text-sm hover:bg-default-100 transition-colors flex items-center justify-between',
                        selected.includes(item.value) && 'bg-primary-50 text-primary font-medium'
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleValue(item.value)
                      }}
                    >
                      <span>{item.label}</span>
                      {selected.includes(item.value) && <span className="text-primary">✓</span>}
                    </div>
                  )
                })
              ) : (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">
                  Không tìm thấy kết quả
                </div>
              )}
            </div>
          </div>,
          portalContainer
        )}
    </div>
  )
}
