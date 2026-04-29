import {
  CheckCircle2, CloudUpload,
  Info,
  ArrowLeft,
  ChevronDown
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { minhchungAxios, type LoaiMinhChung } from '@renderer/api/hr/minhchungAxios'
import MinhChungPreview, { type PreviewFile } from './MinhChungPreview'
import { FileCard, validateMinhChungDetails, type CachedMinhChung, type FileWithDetails } from './MinhChungCollector'
import { SelectFloatingLabel } from '@renderer/components/SelectFloatingLabel'
import { toast } from "@heroui-v3/react";

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar']
const isImageFile = (file: File) => file.type.startsWith('image/')

interface MinhChungUploadPanelProps {
  idNhanVien: string | number
  onBack: () => void
}

export default function MinhChungUploadPanel({
  idNhanVien,
  onBack
}: MinhChungUploadPanelProps) {
  const [groups, setGroups] = useState<CachedMinhChung[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([])
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [hintOpen, setHintOpen] = useState(true)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  // react-hook-form for file details (same as MinhChungCollector)
  const { control, getValues, setValue, trigger } = useForm({ defaultValues: {} as Record<string, any> })

  // Stable ref
  const groupsRef = useRef(groups)
  groupsRef.current = groups

  const toggleGroup = useCallback((id: string) =>
    setCollapsedGroups(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
    , [])

  // Fetch categories from API
  useEffect(() => {
    const fetchLoai = async () => {
      try {
        const res = await minhchungAxios.getLoai()
        if (res.success && res.data) {
          setCategoryOptions(
            res.data.map((loai: LoaiMinhChung) => ({
              value: String(loai.id_loai_minh_chung),
              label: loai.ten_loai
            }))
          )
        }
      } catch (err) {
        console.error('Lỗi tải loại minh chứng:', err)
      }
    }
    fetchLoai()
  }, [])

  // Sync form details → groups (same pattern as MinhChungCollector.syncToParent)
  const syncToParent = useCallback(() => {
    const formData = getValues()
    const updated = groupsRef.current.map(group => ({
      ...group,
      files: group.files.map(fObj => {
        const fileDetails = formData[fObj.id]
        return { ...fObj, details: fileDetails || fObj.details || {} }
      })
    }))
    setGroups(updated)
  }, [getValues])

  // Build synced snapshot for upload
  const buildSyncedSnapshot = useCallback((): CachedMinhChung[] => {
    const formData = getValues()
    return groupsRef.current.map(group => ({
      ...group,
      files: group.files.map(fObj => {
        const fileDetails = formData[fObj.id]
        return { ...fObj, details: fileDetails || fObj.details || {} }
      })
    }))
  }, [getValues])

  const getCategoryLabel = useCallback((catId: string) =>
    categoryOptions.find((o) => o.value === catId)?.label || catId, [categoryOptions])

  const handleReset = useCallback(() => {
    setGroups([])
    setSelectedCategory('')
  }, [])

  // Upload: call API once per category group
  const handleUpload = useCallback(async () => {
    // Validate form fields first
    const isFormValid = await trigger()
    const currentGroups = buildSyncedSnapshot()
    if (currentGroups.length === 0 || !idNhanVien) return

    // Validate business rules (required details for bằng cấp / chứng chỉ)
    const validationErrors = validateMinhChungDetails(currentGroups, getCategoryLabel)
    if (!isFormValid || validationErrors.length > 0) {
      validationErrors.forEach(err => toast(err, { variant: 'danger', timeout: 5000 }))
      if (!isFormValid && validationErrors.length === 0) {
        toast('Vui lòng điền đầy đủ thông tin bắt buộc', { variant: 'warning' })
      }
      return
    }
    try {
      setIsLoading(true)
      let totalFiles = 0
      for (const group of currentGroups) {
        const res = await minhchungAxios.upload({
          id_nhan_vien: idNhanVien,
          id_loai_minh_chung: group.id_loai_minh_chung,
          files: group.files
        })
        if (!res.success) {
          toast('Lỗi', { description: res.message, variant: 'danger' })
          return
        }
        totalFiles += group.files.length
      }
      toast(`Đã tải lên ${totalFiles} tệp`, { variant: 'success' })
      window.dispatchEvent(new CustomEvent('minh-chung-refresh'))
      // Refresh bảng cấp & chứng chỉ nếu backend auto-insert
      window.dispatchEvent(new CustomEvent('section-bangcap-changed'))
      window.dispatchEvent(new CustomEvent('section-chungchi-changed'))
      handleReset()
      onBack()
    } catch {
      toast('Lỗi', { description: 'Không thể tải lên minh chứng', variant: 'danger' })
    } finally {
      setIsLoading(false)
    }
  }, [buildSyncedSnapshot, idNhanVien, handleReset, onBack, trigger, getCategoryLabel])

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles || !selectedCategory) {
      if (!selectedCategory) toast('Vui lòng chọn loại minh chứng trước', { variant: 'warning' })
      return
    }

    const incoming = Array.from(newFiles)
    const accepted: FileWithDetails[] = []
    const rejected: string[] = []

    incoming.forEach((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase() || ''
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        accepted.push({ file: f, id: Math.random().toString(36).substring(7), details: {} })
      } else {
        rejected.push(f.name)
      }
    })

    if (rejected.length > 0) {
      toast(`${rejected.length} tệp không được hỗ trợ`, { description: `${rejected.join(', ')}`, variant: 'warning', timeout: 5000 })
    }

    if (accepted.length > 0) {
      const updated = groupsRef.current.map((item) => ({ ...item, files: [...item.files] }))
      const existing = updated.find((item) => item.id_loai_minh_chung === selectedCategory)
      if (existing) {
        existing.files = [...existing.files, ...accepted]
      } else {
        const catLabel = categoryOptions.find(o => o.value === selectedCategory)?.label || selectedCategory
        updated.push({ id_loai_minh_chung: selectedCategory, categoryLabel: catLabel, files: accepted })
      }
      setGroups(updated)

      const catLabel = categoryOptions.find(o => o.value === selectedCategory)?.label || selectedCategory
      toast(`Đã thêm ${accepted.length} tệp vào "${catLabel}"`, { description: 'Chọn loại khác để tiếp tục thêm', variant: 'success', timeout: 3000 })
    }

    if (inputRef.current) inputRef.current.value = ''
  }, [selectedCategory, categoryOptions])

  const removeFile = useCallback((catId: string, fileIndex: number) => {
    const updated = groupsRef.current.map((item) => {
      if (item.id_loai_minh_chung !== catId) return item
      return { ...item, files: item.files.filter((_, i) => i !== fileIndex) }
    }).filter((item) => item.files.length > 0)
    setGroups(updated)
  }, [])

  const totalFiles = useMemo(() => groups.reduce((sum, g) => sum + g.files.length, 0), [groups])



  // Build PreviewFile[] for the shared preview component
  const previewFiles: PreviewFile[] = useMemo(() => {
    const files: PreviewFile[] = []
    groups.forEach((group) => {
      group.files.forEach((fObj, idx) => {
        const file = fObj.file
        const isPdf = file.name.split('.').pop()?.toLowerCase() === 'pdf' || file.type === 'application/pdf'
        const url = isImageFile(file) || isPdf ? URL.createObjectURL(file) : ''
        const ext = file.name.split('.').pop()?.toLowerCase() || ''
        files.push({
          id: `${group.id_loai_minh_chung}-${idx}`,
          file_name: file.name,
          url,
          file_extension: ext,
          categoryName: getCategoryLabel(group.id_loai_minh_chung),
          categoryId: group.id_loai_minh_chung,
        })
      })
    })
    return files
  }, [groups, categoryOptions])

  const handlePreviewDelete = useCallback((id: string | number) => {
    const idStr = String(id)
    const parts = idStr.split('-')
    const catId = parts.slice(0, -1).join('-')
    const fileIdx = parseInt(parts[parts.length - 1], 10)
    removeFile(catId, fileIdx)
  }, [removeFile])

  const handlePreviewDownload = useCallback((_url: string, fileName: string) => {
    for (const group of groupsRef.current) {
      for (const fObj of group.files) {
        if (fObj.file.name === fileName) {
          const blobUrl = URL.createObjectURL(fObj.file)
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = fileName
          a.click()
          URL.revokeObjectURL(blobUrl)
          return
        }
      }
    }
  }, [])

  const getPreviewIndex = useCallback((catId: string, fileIndex: number) => {
    let idx = 0
    for (const group of groupsRef.current) {
      for (let i = 0; i < group.files.length; i++) {
        if (group.id_loai_minh_chung === catId && i === fileIndex) return idx
        idx++
      }
    }
    return -1
  }, [])

  const canUpload = totalFiles > 0

  return (
    <>
      {/* Shared fullscreen preview */}
      <MinhChungPreview
        files={previewFiles}
        initialIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onDelete={handlePreviewDelete}
        onDownload={handlePreviewDownload}
      />

      <div className="flex flex-col h-full">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {/* Instruction hint — full-width collapsible Google-style banner (same as MinhChungCollector) */}
            <div className="bg-[#E8F0FE] border-y border-[#C5D8F5]">
              <button
                type="button"
                onClick={() => setHintOpen(v => !v)}
                className="flex items-center justify-between w-full px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Info size={17} className="text-[#1967D2] shrink-0" />
                  <span className="text-sm font-semibold text-[#1967D2]">Hướng dẫn thêm minh chứng</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-[#1967D2] transition-transform duration-200 ${hintOpen ? 'rotate-0' : '-rotate-90'}`}
                />
              </button>
              {hintOpen && (
                <p className="px-4 pb-2.5 text-xs text-[#1967D2]/80 leading-relaxed">
                  Chọn loại minh chứng, thêm tệp, rồi <strong>chọn loại khác để thêm tiếp</strong>. Tất cả sẽ được tải lên cùng lúc.
                </p>
              )}
            </div>

            {/* Category selector + Drop zone (same layout as MinhChungCollector) */}
            <div className="space-y-4 py-3 px-4">
              <SelectFloatingLabel
                label="Loại minh chứng"
                options={categoryOptions}
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val as string)}
              />

              {/* Drop zone */}
              <div
                className={`group border-2 border-dashed rounded-xl p-4
                       flex flex-col items-center justify-center text-center cursor-pointer
                       transition-all duration-200
                       ${selectedCategory
                    ? 'border-blue-300 hover:bg-blue-50/30 hover:border-blue-400'
                    : 'border-default-200 opacity-60 cursor-not-allowed'
                  }`}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
                onClick={() => selectedCategory && inputRef.current?.click()}
              >
                {selectedCategory && (
                  <span className="text-[10px] text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full font-semibold mb-1.5">
                    {categoryOptions.find(o => o.value === selectedCategory)?.label || selectedCategory}
                  </span>
                )}
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm mb-1.5 group-hover:scale-110 transition-transform">
                  <CloudUpload className="text-blue-500 w-4 h-4" />
                </div>
                <div className="text-xs text-default-700 group-hover:text-blue-600 transition-colors">
                  {selectedCategory ? 'Nhấn để chọn hoặc kéo thả tệp' : 'Vui lòng chọn loại minh chứng trước'}
                </div>
                <div className="text-[10px] text-default-400 mt-0.5">
                  Ảnh (JPG, PNG, WEBP), PDF · Tối đa 10 tệp/loại
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>
            </div>
          </div>

          {/* File list — using FileCard from MinhChungCollector for identical UI */}
          {totalFiles > 0 && (
            <div className="flex flex-col">
              {groups.map((group) => {
                const isOpen = !collapsedGroups.has(group.id_loai_minh_chung)
                return (
                  <div key={group.id_loai_minh_chung}>
                    {/* Collapse header — full-width flat like MinhChungCollector */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id_loai_minh_chung)}
                      className="flex items-center justify-between w-full px-4 py-2.5 border-y border-default-200 bg-default-50 dark:bg-default-100"
                    >
                      <span className="text-[13px] font-semibold text-default-700">
                        {getCategoryLabel(group.id_loai_minh_chung)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                          {group.files.length} tệp
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-default-400 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                        />
                      </div>
                    </button>
                    {/* Collapsible content */}
                    {isOpen && (
                      <div className="px-4 py-3 space-y-4">
                        {group.files.map((fObj, idx) => (
                          <FileCard
                            key={fObj.id}
                            fObj={fObj}
                            groupId={group.id_loai_minh_chung}
                            categoryLabel={getCategoryLabel(group.id_loai_minh_chung)}
                            control={control}
                            setValue={setValue}
                            onRemove={() => removeFile(group.id_loai_minh_chung, idx)}
                            onPreview={() => {
                              const pIdx = getPreviewIndex(group.id_loai_minh_chung, idx)
                              if (pIdx >= 0) setPreviewIndex(pIdx)
                            }}
                            syncToParent={syncToParent}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Fixed bottom action bar */}
        <div className="shrink-0 border-t border-default-200 bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => { handleReset(); onBack() }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-default-600 hover:bg-default-100 transition-colors"
          >
            <ArrowLeft size={14} />
            Quay lại
          </button>
          <button
            type="button"
            disabled={!canUpload || isLoading}
            onClick={handleUpload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tải...
              </span>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Tải lên {totalFiles > 0 && `(${totalFiles})`}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
