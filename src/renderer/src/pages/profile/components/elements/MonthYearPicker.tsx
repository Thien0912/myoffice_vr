import { HrFormField } from '@renderer/components/hero-custom'
import { Calendar } from 'lucide-react'
import React, { useRef } from 'react'

interface MonthYearPickerProps {
  label: string
  /** Value as "YYYY-MM-DD" (FormBangcap format) or "YYYY-MM" or "" */
  value?: string | null
  /** Returns "YYYY-MM-DD" (first day of month) */
  onChange: (val: string) => void
  placeholder?: string
  readOnly?: boolean
}

/**
 * Reusable month/year picker.
 * Displays "MM/YYYY" visually, stores "YYYY-MM-DD" (first day of month) in parent.
 * Uses a hidden native <input type="month"> for browser date picker support.
 */
const MonthYearPicker = React.memo(function MonthYearPicker({
  label,
  value,
  onChange,
  placeholder = 'mm/yyyy',
  readOnly = false
}: MonthYearPickerProps) {
  const hiddenRef = useRef<HTMLInputElement>(null)

  // Parse incoming value to YYYY and MM
  const { yyyy, mm } = React.useMemo(() => {
    if (!value) return { yyyy: '', mm: '' }
    const parts = String(value).split('-')
    if (parts.length >= 2) {
      // YYYY-MM or YYYY-MM-DD
      if (parts[0].length === 4) return { yyyy: parts[0], mm: parts[1] }
      // DD-MM-YYYY fallback
      if (parts[2]?.length === 4) return { yyyy: parts[2], mm: parts[1] }
    }
    return { yyyy: '', mm: '' }
  }, [value])

  // Display: "06/2026"
  const displayVal = mm && yyyy ? `${mm.padStart(2, '0')}/${yyyy}` : ''

  // Hidden picker value: "2026-06"
  const hiddenVal = mm && yyyy ? `${yyyy}-${mm.padStart(2, '0')}` : ''

  const openPicker = () => {
    if (readOnly) return
    try {
      hiddenRef.current?.showPicker()
    } catch {
      hiddenRef.current?.click()
    }
  }

  const handleHiddenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [y = '', m = ''] = (e.target.value || '').split('-')
    if (y && m) {
      onChange(`${y}-${m.padStart(2, '0')}-01`)
    }
  }

  return (
    <div className="relative">
      <HrFormField
        fieldLabel={label}
        value={displayVal}
        readOnly
        placeholder={placeholder}
        onFocus={openPicker}
        endContent={
          !readOnly ? (
            <button
              type="button"
              onClick={openPicker}
              className="text-default-400 hover:text-blue-500 transition-colors"
            >
              <Calendar size={16} className="text-gray-400" />
            </button>
          ) : undefined
        }
      />
      {/* Hidden native month picker */}
      {!readOnly && (
        <input
          ref={hiddenRef}
          type="month"
          value={hiddenVal}
          onChange={handleHiddenChange}
          tabIndex={-1}
          className="absolute opacity-0 w-0 h-0 pointer-events-none top-0 left-0"
        />
      )}
    </div>
  )
})

export default MonthYearPicker
