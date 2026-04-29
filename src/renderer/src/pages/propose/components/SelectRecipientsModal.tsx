import { useState, useMemo, useEffect } from 'react'
import {
  Button,
  Input,
  Checkbox,
  ScrollShadow
} from "@heroui/react"
import { Search } from 'lucide-react'
import { removeVietnameseTones } from '@renderer/utils/string'
import DraggableModal from '@renderer/components/DraggableModal'

export interface Unit {
  id: number | string
  name: string
  email?: string
  code?: string
}

interface SelectRecipientsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: Unit[]) => void
  unitData: Unit[]
}

export default function SelectRecipientsModal({
  isOpen,
  onClose,
  onConfirm,
  unitData
}: SelectRecipientsModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set())

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
        setSelectedUnitIds(new Set())
        setSearchQuery('')
    }
  }, [isOpen])

  // Filter units
  const filteredUnits = useMemo(() => {
    let result = unitData;
    if (searchQuery) {
        const queryNormalized = removeVietnameseTones(searchQuery)
        result = result.filter(u => 
            removeVietnameseTones(u.name).includes(queryNormalized) ||
            (u.email && u.email.toLowerCase().includes(queryNormalized))
        )
    }
    return result
  }, [unitData, searchQuery])

  // Handlers
  const toggleUnit = (unitId: string) => {
      setSelectedUnitIds(prev => {
          const newSet = new Set(prev)
          if (newSet.has(unitId)) {
              newSet.delete(unitId)
          } else {
              newSet.add(unitId)
          }
          return newSet
      })
  }

  const toggleSelectAll = () => {
      if (selectedUnitIds.size === filteredUnits.length && filteredUnits.length > 0) {
          setSelectedUnitIds(new Set())
      } else {
          const newSet = new Set<string>()
          filteredUnits.forEach(u => newSet.add(String(u.id)))
          setSelectedUnitIds(newSet)
      }
  }

  const isAllSelected = filteredUnits.length > 0 && filteredUnits.every(u => selectedUnitIds.has(String(u.id)))
  const isIndeterminate = selectedUnitIds.size > 0 && !isAllSelected

  const handleConfirm = () => {
      const selectedUnits = unitData.filter(u => selectedUnitIds.has(String(u.id)))
      onConfirm(selectedUnits)
      onClose()
  }

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn đơn vị nhận"
      width="max-w-lg"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-xs text-gray-500">
            Đã chọn {selectedUnitIds.size} đơn vị
          </div>
          <div className="flex gap-2">
            <Button variant="light" size="sm" onPress={onClose}>
              Hủy
            </Button>
            <Button color="primary" size="sm" onPress={handleConfirm}>
              Xác nhận
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Search Box */}
        <div className="px-1">
            <Input 
                placeholder="Tìm kiếm tên đơn vị, email..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                variant="bordered"
                radius="lg"
                className="w-full"
                classNames={{
                    inputWrapper: "h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
                    input: "text-sm",
                }}
                startContent={<Search size={18} className="text-gray-400" strokeWidth={1.5} />}
            />
        </div>

        {/* Selection Area */}
        <div className="flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Checkbox 
                isSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                onValueChange={toggleSelectAll}
                size="sm"
            >
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-tight">
                    Tất cả đơn vị ({filteredUnits.length})
                </span>
            </Checkbox>
        </div>

        {/* Unit List */}
        <ScrollShadow className="max-h-72 px-1">
          <div className="flex flex-col gap-1">
            {filteredUnits.map((unit) => {
              const unitId = String(unit.id)
              const isSelected = selectedUnitIds.has(unitId)
              
              return (
                <div 
                  key={unitId}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                    isSelected 
                        ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                  }`}
                  onClick={() => toggleUnit(unitId)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox 
                        isSelected={isSelected}
                        onValueChange={() => toggleUnit(unitId)}
                        size="sm"
                        color="primary"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                           {unit.name} 
                           {unit.email && <span className="text-xs font-normal text-gray-500 italic ml-1">({unit.email})</span>}
                        </span>
                        {unit.code && (
                             <span className="text-[10px] text-gray-400 font-mono uppercase">
                                Mã: {unit.code}
                             </span>
                        )}
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredUnits.length === 0 && (
                <div className="py-12 text-center flex flex-col items-center gap-2">
                    <Search size={32} className="text-gray-200 dark:text-gray-700" />
                    <p className="text-xs text-gray-400">Không tìm thấy đơn vị nào khớp</p>
                </div>
            )}
          </div>
        </ScrollShadow>
      </div>
    </DraggableModal>
  )
}
