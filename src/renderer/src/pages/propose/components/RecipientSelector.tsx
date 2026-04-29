import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  Button,
  Tooltip,
  Chip
} from '@heroui/react'
import { Building2 } from 'lucide-react'
import { removeVietnameseTones } from '@renderer/utils/string'
import SelectRecipientsModal from './SelectRecipientsModal'

export interface Recipient {
  id: number | string
  name: string
  email: string
  code: string
  unitId?: number | string
  type: 'person' | 'unit'
}

interface RecipientSelectorProps {
  selectedRecipients: Recipient[]
  setSelectedRecipients: React.Dispatch<React.SetStateAction<Recipient[]>>
  isViewOnly?: boolean
  unitOptions: any[]
  missingLevels?: number[]
}

export default function RecipientSelector({
  selectedRecipients,
  setSelectedRecipients,
  isViewOnly = false,
  unitOptions,
  missingLevels = []
}: RecipientSelectorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Filter combined options (People + Units)
  const filteredSuggestions = useMemo(() => {
    setActiveIndex(-1) // Reset selection when filtering
    if (!inputValue) return []
    const searchNormalized = removeVietnameseTones(inputValue)
    
    // Unit suggestions
    const filteredUnits = unitOptions.map(u => ({ ...u, type: 'unit' as const })).filter(unit => {
      if (selectedRecipients.some(s => s.type === 'unit' && s.id === unit.id)) return false
      return (
        removeVietnameseTones(unit.name || '').includes(searchNormalized) ||
        (unit.email && removeVietnameseTones(unit.email).includes(searchNormalized)) ||
        (unit.code && removeVietnameseTones(unit.code).includes(searchNormalized))
      )
    })

    return filteredUnits.slice(0, 8)
  }, [inputValue, unitOptions, selectedRecipients])

  // Handle selection
  const handleSelect = (item: any) => {
    // Determine the next available level if there are missing levels
    let assignedLevel: number | undefined = undefined
    if (missingLevels.length > 0) {
        // Find levels already taken in selectedRecipients
        const takenLevels = selectedRecipients.map(r => (r as any).level).filter(Boolean)
        assignedLevel = missingLevels.find(lvl => !takenLevels.includes(lvl))
    }

    const newItem = { 
        ...item, 
        type: 'unit' as const,
        level: assignedLevel // Add level property
    }

    console.log('Đơn vị được chọn:', newItem)
    setSelectedRecipients(prev => [...prev, newItem])
    setInputValue('')
    setShowSuggestions(false)
    setActiveIndex(-1)
  }

  // Handle remove
  const handleRemove = (item: Recipient) => {
    setSelectedRecipients(prev => prev.filter(r => !(r.type === item.type && r.id === item.id)))
  }

  // Handle Input KeyDown
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !inputValue && selectedRecipients.length > 0) {
        setSelectedRecipients(prev => prev.slice(0, -1))
    }

    if (showSuggestions && filteredSuggestions.length > 0) {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(prev => (prev > 0 ? prev - 1 : 0))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (activeIndex >= 0) {
                handleSelect(filteredSuggestions[activeIndex])
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }
  }

  // Handle confirm selection from Modal (Units)
  const handleRecipientModalConfirm = (selectedUnits: any[]) => {
      setSelectedRecipients(prev => {
          const currentUnitIds = new Set(prev.map(r => String(r.id)))
          const takenLevels = new Set(prev.map(r => (r as any).level).filter(Boolean))
          
          let availableLevelIdx = 0
          const newUnits = selectedUnits
            .filter(u => !currentUnitIds.has(String(u.id)))
            .map(u => {
                let level: number | undefined = undefined
                // Find next available level not in takenLevels
                while (availableLevelIdx < missingLevels.length) {
                    const candidate = missingLevels[availableLevelIdx]
                    if (!takenLevels.has(candidate)) {
                        level = candidate
                        takenLevels.add(candidate)
                        availableLevelIdx++
                        break
                    }
                    availableLevelIdx++
                }

                return { ...u, type: 'unit' as const, level }
            })
          return [...prev, ...newUnits]
      })
      setIsRecipientModalOpen(false)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSuggestions])

  // Update dropdown position
  useEffect(() => {
    if (showSuggestions && containerRef.current) {
        const updatePosition = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                setCoords({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width
                })
            }
        }
        updatePosition()
        window.addEventListener('resize', updatePosition)
        return () => window.removeEventListener('resize', updatePosition)
    }
    return undefined
  }, [showSuggestions])

  const suggestionsDropdown = showSuggestions && !isViewOnly && filteredSuggestions.length > 0 ? createPortal(
    <div 
        ref={suggestionsRef}
        style={{
            position: 'absolute',
            top: coords.top + 8,
            left: coords.left,
            width: coords.width,
            zIndex: 10001
        }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-2xl overflow-y-auto max-h-[320px] scrollbar-hide animate-in fade-in slide-in-from-top-2 duration-200"
    >
        <div className="py-1">
            {filteredSuggestions.map((item, index) => (
                <div
                    key={`${item.type}-${item.id}-${index}`}
                    className={`px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group ${
                        activeIndex === index ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-inset ring-blue-100 dark:ring-blue-800' : ''
                    }`}
                    onClick={() => handleSelect(item)}
                >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-100 text-gray-600 dark:bg-gray-700">
                        <Building2 size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{item.name}</span>
                            {item.code && <span className="border border-blue-200 dark:border-blue-700 px-1 rounded text-[10px] text-blue-700 dark:text-blue-400 font-semibold">{item.code}</span>}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            Đơn vị phòng ban
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>,
    document.body
  ) : null

  return (
    <div className="flex items-center gap-3 group px-4 py-2 relative bg-white dark:bg-gray-800 flex-1">
      <span className="text-sm text-gray-400 min-w-[90px]">
          Đơn vị <span className="text-red-500">*</span>:
      </span>
      <div className="flex-1 relative" ref={containerRef}>
        <div 
            className="w-full min-h-[32px] flex flex-wrap gap-2 items-center bg-transparent"
        >
            {selectedRecipients.filter(r => !(r as any).level).map((item, idx) => {
                return (
                    <Chip
                        key={`${item.type}-${item.id}-${idx}`}
                        onClose={isViewOnly ? undefined : () => handleRemove(item)}
                        variant="flat"
                        color="primary"
                        size="sm"
                        className="max-w-[250px]"
                        startContent={<Building2 size={12} className="ml-1" strokeWidth={2.5} />}
                        classNames={{
                            base: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-100",
                            content: "text-xs font-medium"
                        }}
                    >
                        {item.name}
                    </Chip>
                )
            })}
            
            {selectedRecipients.filter(r => !(r as any).level).length === 0 && (
                <span className="text-xs text-gray-400 italic">Chọn đơn vị tại thanh "Thứ tự trình ký" bên phải</span>
            )}
        </div>
        
        {suggestionsDropdown}
      </div>

      <SelectRecipientsModal
          isOpen={isRecipientModalOpen}
          onClose={() => setIsRecipientModalOpen(false)}
          onConfirm={handleRecipientModalConfirm}
          unitData={unitOptions}
      />
    </div>
  )
}
