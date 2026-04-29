import { SelectFloatingLabel } from '@renderer/components/SelectFloatingLabel'
import { minhchungAxios, type LoaiMinhChung } from '@renderer/api/hr/minhchungAxios'
import { CloudUpload, Eye, FileText, Image as ImageIcon, Info, Trash2, Calendar, ChevronDown } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Controller, useForm, useFormState, useWatch } from 'react-hook-form'
import MinhChungPreview, { type PreviewFile } from './MinhChungPreview'
import { toast } from "@heroui-v3/react";
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel';


const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar']
const isImageFile = (file: File) => file.type.startsWith('image/')

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: `Tháng ${i + 1}` }))
const yearOptions = (() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 60 }, (_, i) => ({ value: String(current + 10 - i), label: String(current + 10 - i) }))
})()
const xepLoaiOptions = [
  { value: 'Khong_dat', label: 'Không đạt' },
  { value: 'Trung_binh', label: 'Trung bình' },
  { value: 'Kha', label: 'Khá' },
  { value: 'Gioi', label: 'Giỏi' },
  { value: 'Xuat_sac', label: 'Xuất sắc' }
]

export interface FileWithDetails {
  file: File
  id: string
  details?: Record<string, any>
}

export interface CachedMinhChung {
  id_loai_minh_chung: string
  categoryLabel?: string
  files: FileWithDetails[]
}

/**
 * Validate minh chứng details: chứng chỉ requires ten_chung_chi, bằng cấp requires noi_dao_tao + chuyen_nganh
 * Returns list of error messages, empty if valid
 */
export function validateMinhChungDetails(items: CachedMinhChung[], getCategoryLabel?: (catId: string) => string): string[] {
  const errors: string[] = []
  for (const group of items) {
    const catLabel = (group.categoryLabel || getCategoryLabel?.(group.id_loai_minh_chung) || '').toLowerCase()
    const isChungChi = catLabel.includes('chứng chỉ')
    const isBangCap = catLabel.includes('bằng') || catLabel.includes('tốt nghiệp')

    if (!isChungChi && !isBangCap) continue

    for (const fObj of group.files) {
      const d = fObj.details || {}
      if (isChungChi && !d.ten_chung_chi) {
        errors.push(`File "${fObj.file.name}": Tên chứng chỉ là bắt buộc`)
      }
      if (isBangCap) {
        if (!d.noi_dao_tao) errors.push(`File "${fObj.file.name}": Nơi đào tạo là bắt buộc`)
        if (!d.chuyen_nganh) errors.push(`File "${fObj.file.name}": Chuyên ngành là bắt buộc`)
      }
    }
  }
  return errors
}

export interface MinhChungCollectorRef {
  validate: () => Promise<boolean>
  /** Returns cachedMinhChung with latest form details synced (avoids stale state) */
  getLatestData: () => CachedMinhChung[]
}

interface MinhChungCollectorProps {
  value: CachedMinhChung[]
  onChange: (items: CachedMinhChung[]) => void
  isFormAdd?: boolean
}

// --- MonthYearField: numeric mm/yyyy display + hidden native month picker ---
interface MonthYearFieldProps {
  label: string
  monthName: string
  yearName: string
  control: any
  setValue: any
  syncToParent: () => void
}

const MonthYearField = React.memo(function MonthYearField({
  label, monthName, yearName, control, setValue, syncToParent
}: MonthYearFieldProps) {
  const hiddenRef = useRef<HTMLInputElement>(null)
  const monthVal = useWatch({ control, name: monthName }) || ''
  const yearVal = useWatch({ control, name: yearName }) || ''

  // Visible: "06/2026" (numbers)
  const displayVal = monthVal && yearVal
    ? `${String(monthVal).padStart(2, '0')}/${yearVal}`
    : ''

  // Hidden picker: "2026-06" (YYYY-MM)
  const hiddenVal = monthVal && yearVal
    ? `${yearVal}-${String(monthVal).padStart(2, '0')}`
    : ''

  const openPicker = () => {
    try { hiddenRef.current?.showPicker() } catch { hiddenRef.current?.click() }
  }

  const handleHiddenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [yyyy = '', mm = ''] = (e.target.value || '').split('-')
    setValue(monthName, mm)
    setValue(yearName, yyyy)
    syncToParent()
  }

  return (
    <div className="relative">
      <InputFloatingLabel
        label={label}
        value={displayVal}
        readOnly
        placeholder="mm/yyyy"
        onFocus={openPicker}
        endContent={
          <button type="button" onClick={openPicker} className="text-default-400 hover:text-blue-500 transition-colors">
            <Calendar size={14} />
          </button>
        }
      />
      {/* Hidden native month picker */}
      <input
        ref={hiddenRef}
        type="month"
        value={hiddenVal}
        onChange={handleHiddenChange}
        tabIndex={-1}
        className="absolute opacity-0 w-0 h-0 pointer-events-none top-0 left-0"
      />
    </div>
  )
})

// --- ChungChiFields: chứng chỉ detail form with single error summary ---
export function ChungChiFields({ fid, control, setValue, syncToParent }: { fid: string; control: any; setValue: any; syncToParent: () => void }) {
  const { errors } = useFormState({ control, name: [`${fid}.ten_chung_chi`] })
  const hasError = !!(errors as any)?.[fid]?.ten_chung_chi
  return (
    <div className="border-t border-default-100 px-3 py-3 grid grid-cols-1 gap-3">
      <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wide -mb-1">Thông tin chứng chỉ</p>
      <Controller name={`${fid}.ten_chung_chi`} control={control} defaultValue="" rules={{ required: true }} render={({ field, fieldState }) => (
        <InputFloatingLabel label="Tên chứng chỉ *" placeholder="Nhập tên chứng chỉ" value={field.value} onChange={field.onChange} onBlur={syncToParent} className={fieldState.invalid ? '[&_input]:border-red-400 [&_input]:border-2' : ''} />
      )} />
      <div className="grid grid-cols-2 gap-3">
        <Controller name={`${fid}.ngay_cap_chung_chi`} control={control} defaultValue="" render={({ field }) => (
          <InputFloatingLabel type="date" label="Ngày cấp" value={field.value} onChange={field.onChange} onBlur={syncToParent} />
        )} />
        <Controller name={`${fid}.noi_cap`} control={control} defaultValue="" render={({ field }) => (
          <InputFloatingLabel label="Nơi cấp" placeholder="Nhập nơi cấp" value={field.value} onChange={field.onChange} onBlur={syncToParent} />
        )} />
      </div>
      {hasError && <span className="text-[11px] text-red-500 -mt-1">Vui lòng nhập tên chứng chỉ.</span>}
    </div>
  )
}

// --- BangCapFields: bằng cấp detail form with single error summary ---
export function BangCapFields({ fid, control, setValue, syncToParent }: { fid: string; control: any; setValue: any; syncToParent: () => void }) {
  const { errors } = useFormState({ control, name: [`${fid}.noi_dao_tao`, `${fid}.chuyen_nganh`] })
  const errs = (errors as any)?.[fid] ?? {}
  const missingFields: string[] = []
  if (errs.noi_dao_tao) missingFields.push('Nơi đào tạo')
  if (errs.chuyen_nganh) missingFields.push('Chuyên ngành')
  return (
    <div className="border-t border-default-100 px-3 py-3 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <MonthYearField label="Ngày bắt đầu" monthName={`${fid}.tu_thang`} yearName={`${fid}.nam_tu`} control={control} setValue={setValue} syncToParent={syncToParent} />
        <MonthYearField label="Ngày hoàn thành" monthName={`${fid}.den_thang`} yearName={`${fid}.nam_den`} control={control} setValue={setValue} syncToParent={syncToParent} />
      </div>
      <div className="flex flex-col gap-3">
        <Controller name={`${fid}.noi_dao_tao`} control={control} defaultValue="" rules={{ required: true }} render={({ field, fieldState }) => (
          <InputFloatingLabel label="Nơi đào tạo *" placeholder="Tên trường..." value={field.value} onChange={field.onChange} onBlur={syncToParent} className={fieldState.invalid ? '[&_input]:border-red-400 [&_input]:border-2' : ''} />
        )} />
        <div className="grid grid-cols-2 gap-3">
          <Controller name={`${fid}.chuyen_nganh`} control={control} defaultValue="" rules={{ required: true }} render={({ field, fieldState }) => (
            <InputFloatingLabel label="Chuyên ngành *" placeholder="Ngành học" value={field.value} onChange={field.onChange} onBlur={syncToParent} className={fieldState.invalid ? '[&_input]:border-red-400 [&_input]:border-2' : ''} />
          )} />
          <Controller name={`${fid}.trinh_do_dao_tao`} control={control} defaultValue="" render={({ field }) => (
            <InputFloatingLabel label="Trình độ" placeholder="Ví dụ: Đại học" value={field.value} onChange={field.onChange} onBlur={syncToParent} />
          )} />
        </div>
        <Controller name={`${fid}.xep_loai`} control={control} defaultValue="" render={({ field }) => (
          <SelectFloatingLabel label="Xếp loại tốt nghiệp" options={xepLoaiOptions} value={field.value} onChange={(val) => { field.onChange(val as string); syncToParent() }} />
        )} />
      </div>
      {missingFields.length > 0 && (
        <span className="text-[11px] text-red-500 -mt-1">Bắt buộc: {missingFields.join(', ')}.</span>
      )}
    </div>
  )
}

// --- Memoized FileCard: only re-renders when file identity changes, NOT on detail edits ---
interface FileCardProps {
  fObj: FileWithDetails
  groupId: string
  categoryLabel: string
  control: any
  setValue: any
  onRemove: () => void
  onPreview: () => void
  syncToParent: () => void
}

export const FileCard = React.memo(function FileCard({
  fObj, categoryLabel, control, setValue, onRemove, onPreview, syncToParent
}: FileCardProps) {
  const file = fObj.file
  const isImage = isImageFile(file)
  const previewUrl = useMemo(() => isImage ? URL.createObjectURL(file) : null, [file, isImage])

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  const catLabelLower = categoryLabel.toLowerCase()
  const isBangCap = catLabelLower.includes('bằng') || catLabelLower.includes('tốt nghiệp')
  const isChungChi = catLabelLower.includes('chứng chỉ')
  const fid = fObj.id

  // Auto-fill year when month is selected (matching FormBangcap pattern)
  const currentYear = String(new Date().getFullYear())
  const handleMonthChange = useCallback((monthField: string, yearField: string, val: string, fieldOnChange: (v: string) => void) => {
    fieldOnChange(val)
    // Auto-set year to current year if not yet filled
    const yearVal = control._formValues?.[fid]?.[yearField.split('.').pop()!]
    if (!yearVal) {
      setValue(yearField, currentYear)
    }
    syncToParent()
  }, [control, fid, setValue, currentYear, syncToParent])

  return (
    <div className="flex flex-col border border-default-200 rounded-xl bg-white overflow-hidden transition-shadow hover:shadow-md">
      {/* File header */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {isImage && previewUrl ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-default-100 shadow-sm">
            <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-red-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] truncate text-default-800 font-medium leading-tight" title={file.name}>{file.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-blue-500 font-semibold">{formatSize(file.size)}</span>
            {isImage && (
              <span className="text-[11px] text-default-400 flex items-center gap-0.5">
                <ImageIcon size={10} /> Ảnh
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={onPreview}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-default-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
            title="Xem trước">
            <Eye size={13} /> Xem
          </button>
          <button type="button" onClick={onRemove}
            className="p-1.5 text-default-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Xóa">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isChungChi && (
        <ChungChiFields fid={fid} control={control} setValue={setValue} syncToParent={syncToParent} />
      )}

      {isBangCap && (
        <BangCapFields fid={fid} control={control} setValue={setValue} syncToParent={syncToParent} />
      )}
    </div>
  )
}, (prev, next) => {
  // Only re-render when file identity or category changes — NOT on detail changes
  return prev.fObj.id === next.fObj.id
    && prev.fObj.file === next.fObj.file
    && prev.categoryLabel === next.categoryLabel
})

// --- Main component ---
const MinhChungCollector = forwardRef<MinhChungCollectorRef, MinhChungCollectorProps>(function MinhChungCollector({ value, isFormAdd = false, onChange }, ref) {
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [hintOpen, setHintOpen] = useState(true)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const toggleGroup = useCallback((id: string) =>
    setCollapsedGroups(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
    , [])
  const inputRef = useRef<HTMLInputElement>(null)

  // react-hook-form manages file details — no more array cloning on every keystroke
  const { control, getValues, setValue, trigger } = useForm({ defaultValues: {} as Record<string, any> })

  // Stable ref for value to avoid stale closures
  const valueRef = useRef(value)
  valueRef.current = value

  // Initialize form values from existing details when files are added
  const initializedIdsRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    value.forEach(group => {
      group.files.forEach(fObj => {
        if (!initializedIdsRef.current.has(fObj.id) && fObj.details) {
          initializedIdsRef.current.add(fObj.id)
          Object.entries(fObj.details).forEach(([k, v]) => {
            setValue(`${fObj.id}.${k}`, v)
          })
        }
      })
    })
    // Cleanup removed file IDs
    const activeIds = new Set(value.flatMap(g => g.files.map(f => f.id)))
    initializedIdsRef.current.forEach(id => {
      if (!activeIds.has(id)) initializedIdsRef.current.delete(id)
    })
  }, [value, setValue])

  // Sync form details → parent value (called on blur for inputs, immediately for selects)
  const syncToParent = useCallback(() => {
    const formData = getValues()
    const updated = valueRef.current.map(group => ({
      ...group,
      files: group.files.map(fObj => {
        const fileDetails = formData[fObj.id]
        return { ...fObj, details: fileDetails || fObj.details || {} }
      })
    }))
    onChange(updated)
  }, [onChange, getValues])

  // Fetch category options
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

  // Helper: build synced data snapshot from current form values
  const buildSyncedSnapshot = useCallback((): CachedMinhChung[] => {
    const formData = getValues()
    return valueRef.current.map(group => ({
      ...group,
      files: group.files.map(fObj => {
        const fileDetails = formData[fObj.id]
        return { ...fObj, details: fileDetails || fObj.details || {} }
      })
    }))
  }, [getValues])

  // Expose validate() and getLatestData() to parent via ref
  useImperativeHandle(ref, () => ({
    validate: async () => {
      syncToParent()
      const isValid = await trigger()
      return isValid
    },
    getLatestData: () => buildSyncedSnapshot()
  }), [syncToParent, trigger, buildSyncedSnapshot])

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
      const updated = valueRef.current.map((item) => ({ ...item, files: [...item.files] }))
      const existing = updated.find((item) => item.id_loai_minh_chung === selectedCategory)
      if (existing) {
        existing.files = [...existing.files, ...accepted]
      } else {
        const catLabel = categoryOptions.find(o => o.value === selectedCategory)?.label || selectedCategory
        updated.push({ id_loai_minh_chung: selectedCategory, categoryLabel: catLabel, files: accepted })
      }
      onChange(updated)

      const catLabel = categoryOptions.find(o => o.value === selectedCategory)?.label || selectedCategory
      toast(`Đã thêm ${accepted.length} tệp vào "${catLabel}"`, { description: 'Chọn loại khác để tiếp tục thêm', variant: 'success', timeout: 3000 })
    }

    if (inputRef.current) inputRef.current.value = ''
  }, [selectedCategory, onChange, categoryOptions])

  const removeFile = useCallback((catId: string, fileIndex: number) => {
    const updated = valueRef.current.map((item) => {
      if (item.id_loai_minh_chung !== catId) return item
      return { ...item, files: item.files.filter((_, i) => i !== fileIndex) }
    }).filter((item) => item.files.length > 0)
    onChange(updated)
  }, [onChange])

  const totalFiles = useMemo(() => value.reduce((sum, item) => sum + item.files.length, 0), [value])

  const getCategoryLabel = useCallback((catId: string) =>
    categoryOptions.find((o) => o.value === catId)?.label || catId, [categoryOptions])

  // Build PreviewFile[] for the shared preview component
  const previewFiles: PreviewFile[] = useMemo(() => {
    const files: PreviewFile[] = []
    value.forEach((group) => {
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
  }, [value, categoryOptions])

  const handlePreviewDelete = useCallback((id: string | number) => {
    const idStr = String(id)
    const parts = idStr.split('-')
    const catId = parts.slice(0, -1).join('-')
    const fileIdx = parseInt(parts[parts.length - 1], 10)
    removeFile(catId, fileIdx)
  }, [removeFile])

  const handlePreviewDownload = useCallback((_: string, fileName: string) => {
    for (const group of valueRef.current) {
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
    for (const group of valueRef.current) {
      for (let i = 0; i < group.files.length; i++) {
        if (group.id_loai_minh_chung === catId && i === fileIndex) return idx
        idx++
      }
    }
    return -1
  }, [])

  return (
    <>
      <MinhChungPreview
        files={previewFiles}
        initialIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onDelete={handlePreviewDelete}
        onDownload={handlePreviewDownload}
      />

      <div className="flex flex-col gap-3">
        {/* Instruction hint — full-width collapsible Google-style banner */}
        <div className={`bg-[#E8F0FE] border-y border-[#C5D8F5] ${isFormAdd ? '-mx-2 md:-mx-4' : '-mx-4 md:-mx-6'}`}>
          <button
            type="button"
            onClick={() => setHintOpen(v => !v)}
            className="flex items-center justify-between w-full px-4 md:px-6 py-2.5"
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
            <p className="px-4 md:px-6 pb-2.5 text-xs text-[#1967D2]/80 leading-relaxed">
              Chọn loại minh chứng, thêm tệp, rồi <strong>chọn loại khác để thêm tiếp</strong>.
            </p>
          )}
        </div>

        <div className='space-y-4 py-3'>{/* Category selector */}
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
              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            /></div>
        </div>

        {/* File list — each FileCard is memoized, detail changes don't re-render siblings */}
        {totalFiles > 0 && (
          <div className="flex flex-col">
            {value.map((group) => {
              const isOpen = !collapsedGroups.has(group.id_loai_minh_chung)
              return (
                <div key={group.id_loai_minh_chung} className="-mx-4 md:-mx-6">
                  {/* Collapse header — full-width flat like CCCD section */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id_loai_minh_chung)}
                    className="flex items-center justify-between w-full px-4 md:px-6 py-2.5 border-y border-default-200 bg-default-50 dark:bg-default-100"
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
                    <div className="px-4 md:px-6 py-3 space-y-4">
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
    </>
  )
})

export default MinhChungCollector
