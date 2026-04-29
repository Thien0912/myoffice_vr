import { Button as ButtonV3, Modal, toast } from '@heroui-v3/react'
import { bangChamCongAxios } from '@renderer/api/hr/bangChamCongAxios'
import { Check, ChevronDown, ChevronRight, Download, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChamCongFilter } from '../types/BangChamCongTypes'

interface ChamCongExportModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  filter: ChamCongFilter
  activeTab: string
  departments?: any[]
}

interface DepartmentOption {
  id: string
  label: string
  group?: string
}

const normalizeText = (text: string) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function ChamCongExportModal({
  isOpen,
  onOpenChange,
  filter,
  activeTab,
  departments = []
}: ChamCongExportModalProps) {
  const [selectedDonVi, setSelectedDonVi] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [unitSearch, setUnitSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const flatDepartments = useMemo<DepartmentOption[]>(() => {
    const normalized: DepartmentOption[] = []

    departments.forEach((item: any) => {
      if (item?.options && Array.isArray(item.options)) {
        const group = item.label || ''
        item.options.forEach((opt: any) => {
          const id = String(opt.value ?? opt.id ?? '')
          const label = String(opt.label ?? opt.name ?? id)
          if (id) normalized.push({ id, label, group })
        })
        return
      }

      const id = String(item?.value ?? item?.id ?? '')
      const label = String(item?.label ?? item?.name ?? id)
      if (id) normalized.push({ id, label })
    })

    const dedup = new Map<string, DepartmentOption>()
    normalized.forEach((d) => {
      if (!dedup.has(d.id)) dedup.set(d.id, d)
    })

    return Array.from(dedup.values())
  }, [departments])

  // Group departments (filtered by search)
  const groupedDepartments = useMemo(() => {
    const groups: { groupLabel: string; items: DepartmentOption[] }[] = []
    const groupMap = new Map<string, DepartmentOption[]>()
    const NO_GROUP = '__no_group__'

    const source = unitSearch
      ? flatDepartments.filter((d) => normalizeText(d.label).includes(normalizeText(unitSearch)))
      : flatDepartments

    source.forEach((d) => {
      const key = d.group || NO_GROUP
      if (!groupMap.has(key)) groupMap.set(key, [])
      groupMap.get(key)!.push(d)
    })

    groupMap.forEach((items, key) => {
      groups.push({ groupLabel: key === NO_GROUP ? '' : key, items })
    })

    return groups
  }, [flatDepartments, unitSearch])

  const isAllSelected = selectedDonVi.length > 0 && selectedDonVi.length === flatDepartments.length

  const selectedDepartments = useMemo(() => {
    const selectedSet = new Set(selectedDonVi)
    return flatDepartments.filter((d) => selectedSet.has(d.id))
  }, [flatDepartments, selectedDonVi])

  const closeModal = () => {
    setSelectedDonVi([])
    setUnitSearch('')
    setShowDropdown(false)
    onOpenChange(false)
  }

  useEffect(() => {
    if (isOpen) {
      setSelectedDonVi([])
      setUnitSearch('')
      setShowDropdown(false)
    }
  }, [isOpen])

  const toggleItem = (id: string) => {
    setSelectedDonVi((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedDonVi([])
    } else {
      setSelectedDonVi(flatDepartments.map((d) => d.id))
    }
  }

  const toggleGroup = (groupLabel: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupLabel]: !prev[groupLabel] }))
  }

  const toggleGroupSelect = (items: DepartmentOption[]) => {
    const ids = items.map((i) => i.id)
    const allSelected = ids.every((id) => selectedDonVi.includes(id))
    if (allSelected) {
      setSelectedDonVi((prev) => prev.filter((id) => !ids.includes(id)))
    } else {
      setSelectedDonVi((prev) => Array.from(new Set([...prev, ...ids])))
    }
  }

  const removeChip = (id: string) => {
    setSelectedDonVi((prev) => prev.filter((v) => v !== id))
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportParams: any = {
        tab: activeTab
      }

      if (filter.dateRange?.from) {
        exportParams.from_date = filter.dateRange.from
      }
      if (filter.dateRange?.to) {
        exportParams.to_date = filter.dateRange.to
      }

      if (selectedDonVi.length > 0) {
        exportParams.id_don_vi = selectedDonVi.join(',')
      } else if (filter.don_vi_ids && filter.don_vi_ids.length > 0) {
        exportParams.id_don_vi = filter.don_vi_ids.join(',')
      }

      if (filter.nhan_vien_ids && filter.nhan_vien_ids.length > 0) {
        exportParams.id_nhan_vien = filter.nhan_vien_ids.join(',')
      }

      const response = await bangChamCongAxios.exportExcel(exportParams)

      if (response?.success && response?.data?.file_path) {
        const a = document.createElement('a')
        a.href = response.data.file_path
        a.download = response.data.filename || 'bao-cao-cham-cong.xlsx'
        a.click()
        toast('Xuất báo cáo thành công', { variant: 'success' })
        closeModal()
      } else {
        toast(response?.message || 'Lỗi khi xuất báo cáo', { variant: 'danger' })
      }
    } catch {
      toast('Lỗi khi xuất báo cáo', { variant: 'danger' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) closeModal() }}
      variant="opaque"
      isDismissable={false}
    >
      <Modal.Container placement="center">
        <Modal.Dialog
          aria-label="Xuất Excel chấm công"
          className="w-full max-w-lg rounded-3xl p-0 bg-white dark:bg-gray-900 shadow-[0_12px_32px_rgba(0,0,0,0.12)] outline-none overflow-visible"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                Xuất dữ liệu Excel
              </h2>
              <button
                type="button"
                className="p-2 cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Chọn các đơn vị cần trích xuất dữ liệu cho báo cáo
              {filter.dateRange ? ` (${filter.dateRange.from} – ${filter.dateRange.to})` : ' định kỳ'}.
            </p>

            {/* Tag Input with Grouped Dropdown */}
            <div ref={containerRef} className="relative">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Đơn vị trích xuất
              </label>

              {/* Chip container + inline search */}
              <div
                className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-1.5 min-h-[52px] max-h-[120px] overflow-y-auto custom-scrollbar flex flex-wrap gap-2 items-center cursor-text transition-all focus-within:border-gray-400 dark:focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-300/30"
                onClick={() => {
                  inputRef.current?.focus()
                  setShowDropdown(true)
                }}
              >
                {/* Selected Chips */}
                {isAllSelected ? (
                  <div className="flex items-center gap-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium">
                    <span>Tất cả đơn vị</span>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); setSelectedDonVi([]) }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  selectedDepartments.map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center gap-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium"
                    >
                      <span className="truncate max-w-[160px]">{dept.label}</span>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors flex-shrink-0"
                        onClick={(e) => { e.stopPropagation(); removeChip(dept.id) }}
                        aria-label={`Bỏ chọn ${dept.label}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}

                {/* Inline Search */}
                <input
                  ref={inputRef}
                  type="text"
                  className="bg-transparent border-none outline-none focus:ring-0 text-sm flex-1 min-w-[140px] py-1 placeholder:text-gray-400/60 dark:placeholder:text-gray-500/60 text-gray-800 dark:text-gray-200"
                  placeholder={selectedDepartments.length > 0 ? 'Thêm đơn vị...' : 'Tìm và chọn đơn vị...'}
                  value={unitSearch}
                  onChange={(e) => {
                    setUnitSearch(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
              </div>

              {/* Grouped Dropdown */}
              {showDropdown && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                  {/* Search inside dropdown */}
                  <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-gray-300 dark:focus:border-gray-600 placeholder:text-gray-400"
                        placeholder="Tìm đơn vị..."
                        value={unitSearch}
                        onChange={(e) => setUnitSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Options */}
                  <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                    {/* Select All */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left border-b border-gray-100 dark:border-gray-700"
                      onClick={toggleAll}
                    >
                      <span className={`font-medium ${isAllSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>
                        Tất cả đơn vị
                      </span>
                      {isAllSelected && <Check size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                    </button>

                    {/* Grouped Items */}
                    {groupedDepartments.map(({ groupLabel, items }) => {
                      const isCollapsed = collapsedGroups[groupLabel] ?? false
                      const groupIds = items.map((i) => i.id)
                      const allGroupSelected = groupIds.every((id) => selectedDonVi.includes(id))
                      const someGroupSelected = !allGroupSelected && groupIds.some((id) => selectedDonVi.includes(id))

                      return (
                        <div key={groupLabel || 'no-group'}>
                          {groupLabel && (
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50/80 dark:bg-gray-900/40 cursor-pointer select-none"
                              onClick={() => toggleGroup(groupLabel)}
                            >
                              <div className="flex items-center gap-2">
                                {isCollapsed
                                  ? <ChevronRight size={14} className="text-gray-400" />
                                  : <ChevronDown size={14} className="text-gray-400" />
                                }
                                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                  {groupLabel}
                                </span>
                              </div>
                              <button
                                type="button"
                                className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${allGroupSelected
                                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                  : someGroupSelected
                                    ? 'text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
                                  }`}
                                onClick={(e) => { e.stopPropagation(); toggleGroupSelect(items) }}
                                aria-label={`Chọn tất cả ${groupLabel}`}
                              >
                                {allGroupSelected ? (
                                  <span className="flex items-center gap-1"><Check size={12} /> Đã chọn</span>
                                ) : (
                                  'Chọn tất cả'
                                )}
                              </button>
                            </div>
                          )}
                          {!isCollapsed && items.map((d) => {
                            const isSelected = selectedDonVi.includes(d.id)
                            return (
                              <button
                                key={d.id}
                                type="button"
                                className={`w-full flex items-center cursor-pointer justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${groupLabel ? 'pl-8' : ''}`}
                                onClick={() => toggleItem(d.id)}
                              >
                                <span className={isSelected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}>
                                  {d.label}
                                </span>
                                {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}

                    {groupedDepartments.length === 0 && unitSearch && (
                      <div className="px-3 py-6 text-center text-sm text-gray-400">
                        Không tìm thấy đơn vị "{unitSearch}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2 rounded-b-3xl">
            <ButtonV3
              variant="ghost"
              className="px-5 py-2 text-gray-500 dark:text-gray-400 font-medium text-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onPress={closeModal}
            >
              Hủy bỏ
            </ButtonV3>
            <ButtonV3
              className="px-6 py-2 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 font-medium text-sm rounded-full shadow-sm hover:shadow-md hover:bg-gray-700 dark:hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              isDisabled={isExporting || selectedDonVi.length === 0}
              onPress={handleExport}
            >
              {isExporting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin inline-block" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Xuất tệp Excel
                </>
              )}
            </ButtonV3>
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
