import { Button } from '@heroui/button'
import { Modal, toast } from '@heroui-v3/react'
import { HrAutocomplete } from '@renderer/components/hero-custom/HrAutocomplete'
import {
  CheckCircle2, CloudUpload,
  Eye, FileText,
  Image as ImageIcon,
  Info,
  Trash2,
  Upload
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { minhchungAxios, type LoaiMinhChung } from '@renderer/api/hr/minhchungAxios'
import MinhChungPreview, { type PreviewFile } from './MinhChungPreview'
import type { CachedMinhChung, FileWithDetails } from './MinhChungCollector'
import { HrInput } from '@renderer/components/hero-custom/HrInput'
import { HrSelect } from '@renderer/components/hero-custom/HrSelect'

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

interface MinhChungUploadModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  idNhanVien: string | number
}

export default function MinhChungUploadModal({
  isOpen,
  onOpenChange,
  idNhanVien
}: MinhChungUploadModalProps) {
  const [groups, setGroups] = useState<CachedMinhChung[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([])
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch categories from API
  useEffect(() => {
    if (!isOpen) return
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
  }, [isOpen])

  const handleClose = useCallback(() => {
    setGroups([])
    setSelectedCategory('')
    onOpenChange(false)
  }, [onOpenChange])

  // Upload: call API once per category group
  const handleUpload = useCallback(async () => {
    if (groups.length === 0 || !idNhanVien) return
    try {
      setIsLoading(true)
      let totalFiles = 0
      for (const group of groups) {
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
      handleClose()
    } catch {
      toast('Lỗi', { description: 'Không thể tải lên minh chứng', variant: 'danger' })
    } finally {
      setIsLoading(false)
    }
  }, [groups, idNhanVien, handleClose])

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
      setGroups(prev => {
        const updated = prev.map((item) => ({ ...item, files: [...item.files] }))
        const existing = updated.find((item) => item.id_loai_minh_chung === selectedCategory)
        if (existing) {
          existing.files = [...existing.files, ...accepted]
        } else {
          updated.push({ id_loai_minh_chung: selectedCategory, files: accepted })
        }
        return updated
      })

      const catLabel = categoryOptions.find(o => o.value === selectedCategory)?.label || selectedCategory
      toast(`Đã thêm ${accepted.length} tệp vào "${catLabel}"`, { description: 'Chọn loại khác để tiếp tục thêm', variant: 'success', timeout: 3000 })
    }

    if (inputRef.current) inputRef.current.value = ''
  }, [selectedCategory, categoryOptions])

  const removeFile = useCallback((catId: string, fileIndex: number) => {
    setGroups(prev => {
      const updated = prev.map((item) => {
        if (item.id_loai_minh_chung !== catId) return item
        return { ...item, files: item.files.filter((_, i) => i !== fileIndex) }
      }).filter((item) => item.files.length > 0)
      return updated
    })
  }, [])

  const totalFiles = useMemo(() => groups.reduce((sum, g) => sum + g.files.length, 0), [groups])

  const getCategoryLabel = (catId: string) =>
    categoryOptions.find((o) => o.value === catId)?.label || catId

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
    for (const group of groups) {
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
  }, [groups])

  // Map from (catId, fileIndex) to flat preview index
  const getPreviewIndex = (catId: string, fileIndex: number) => {
    let idx = 0
    for (const group of groups) {
      for (let i = 0; i < group.files.length; i++) {
        if (group.id_loai_minh_chung === catId && i === fileIndex) return idx
        idx++
      }
    }
    return -1
  }

  const canUpload = totalFiles > 0
  const selectedCatLabel = categoryOptions.find(o => o.value === selectedCategory)?.label

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

      <Modal>
        <Modal.Backdrop
          isOpen={isOpen}
          onOpenChange={(val) => {
            if (!val) handleClose()
            else onOpenChange(val)
          }}
          isDismissable={false}
          isKeyboardDismissDisabled
        >
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-lg gap-0 rounded-xl overflow-hidden bg-white dark:bg-gray-800 p-0 shadow-lg">
              <Modal.CloseTrigger className="z-50 top-3 right-3" />
              <Modal.Header className="flex flex-row items-center gap-2 border-b border-default-100 py-3 px-5">
                <Upload size={18} className="text-blue-600" />
                <span className="text-base font-bold text-foreground uppercase tracking-wide m-0">
                  BỔ SUNG MINH CHỨNG
                </span>
              </Modal.Header>

              <Modal.Body className="py-4 px-5">
                <div className="flex flex-col gap-3">
                  {/* Instruction hint */}
                  <div className="flex items-start gap-2 px-3 py-2 bg-blue-50/70 rounded-lg border border-blue-100 mt-2">
                    <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      Chọn loại minh chứng, thêm tệp, rồi <strong>chọn loại khác để thêm tiếp</strong>. Tất cả sẽ được tải lên cùng lúc.
                    </p>
                  </div>

                  <HrAutocomplete
                    label="Loại minh chứng"
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val)}
                    isRequired
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
                    {/* Category badge */}
                    {selectedCatLabel && (
                      <span className="text-[10px] text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full font-semibold mb-2">
                        {selectedCatLabel}
                      </span>
                    )}
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm mb-1.5 group-hover:scale-110 transition-transform">
                      <CloudUpload className="text-blue-500 w-4 h-4" />
                    </div>
                    <div className="text-xs text-default-700 group-hover:text-blue-600 transition-colors">
                      {selectedCategory ? 'Nhấn để chọn hoặc kéo thả tệp' : 'Vui lòng chọn loại minh chứng trước'}
                    </div>
                    <div className="text-[10px] text-default-400 mt-0.5">
                      Ảnh, PDF, Word, Excel · Tối đa 10 tệp/loại
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

                  {/* Grouped file list */}
                  {totalFiles > 0 && (
                    <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
                      <div className="text-xs font-medium text-default-500">
                        Đã chọn {totalFiles} tệp · {groups.length} loại
                      </div>
                      {groups.map((group) => (
                        <div key={group.id_loai_minh_chung} className="rounded-lg border border-default-200 p-2">
                          <div className="text-[11px] font-semibold text-default-600 mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {getCategoryLabel(group.id_loai_minh_chung)}
                            <span className="text-default-400 font-normal">({group.files.length})</span>
                          </div>
                          <div className="space-y-4">
                            {group.files.map((fObj, idx) => {
                              const file = fObj.file
                              const fileDetails = fObj.details || {}
                              const isImage = isImageFile(file)
                              const previewUrl = isImage ? URL.createObjectURL(file) : null
                              const catLabelLower = getCategoryLabel(group.id_loai_minh_chung).toLowerCase()
                              const isBangCap = catLabelLower.includes('bằng') || catLabelLower.includes('tốt nghiệp')
                              const isChungChi = catLabelLower.includes('chứng chỉ')

                              const updateDetails = (key: string, val: any) => {
                                setGroups((prev) => {
                                  const updated = [...prev]
                                  const groupIndex = updated.findIndex((g) => g.id_loai_minh_chung === group.id_loai_minh_chung)
                                  if (groupIndex !== -1) {
                                    const newFiles = [...updated[groupIndex].files]
                                    newFiles[idx] = { ...newFiles[idx], details: { ...newFiles[idx].details, [key]: val } }
                                    updated[groupIndex] = { ...updated[groupIndex], files: newFiles }
                                  }
                                  return updated
                                })
                              }

                              return (
                                <div
                                  key={`${file.name}-${idx}`}
                                  className="flex flex-col p-3 border border-default-200 rounded-xl bg-white hover:shadow-sm transition-shadow gap-3"
                                >
                                  <div className="flex items-center">
                                    {isImage && previewUrl ? (
                                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 mr-3 border border-default-100">
                                        <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                                      </div>
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mr-3">
                                        <FileText size={22} className="text-red-500" />
                                      </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs truncate text-default-800 font-medium" title={file.name}>{file.name}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-blue-500 font-medium">{formatSize(file.size)}</span>
                                        {isImage && (
                                          <span className="text-[10px] text-default-400 flex items-center gap-0.5">
                                            <ImageIcon size={10} /> Ảnh
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-0.5 ml-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const pIdx = getPreviewIndex(group.id_loai_minh_chung, idx)
                                          if (pIdx >= 0) setPreviewIndex(pIdx)
                                        }}
                                        className="p-1.5 text-default-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Xem trước"
                                      >
                                        <Eye size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeFile(group.id_loai_minh_chung, idx)}
                                        className="p-1.5 text-default-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title="Xóa"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Forms details */}
                                  {isChungChi && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-dashed border-default-200">
                                      <HrInput
                                        label="Tên chứng chỉ"
                                        placeholder="Nhập tên chứng chỉ"
                                        value={fileDetails.ten_chung_chi || ''}
                                        onChange={(val) => updateDetails('ten_chung_chi', val)}
                                        className="md:col-span-2"
                                      />
                                      <HrInput
                                        type="date"
                                        label="Ngày cấp chứng chỉ"
                                        value={fileDetails.ngay_cap_chung_chi || ''}
                                        onChange={(val) => updateDetails('ngay_cap_chung_chi', val)}
                                      />
                                      <HrInput
                                        label="Nơi cấp"
                                        placeholder="Nhập nơi cấp"
                                        value={fileDetails.noi_cap || ''}
                                        onChange={(val) => updateDetails('noi_cap', val)}
                                      />
                                    </div>
                                  )}

                                  {isBangCap && (
                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed border-default-200">
                                      <div className="col-span-2 grid grid-cols-2 gap-3">
                                        <HrSelect
                                          label="Từ tháng"
                                          options={monthOptions}
                                          value={fileDetails.tu_thang || ''}
                                          onChange={(val) => updateDetails('tu_thang', val as string)}
                                        />
                                        <HrSelect
                                          label="Năm"
                                          options={yearOptions}
                                          value={fileDetails.nam_tu || ''}
                                          onChange={(val) => updateDetails('nam_tu', val as string)}
                                        />
                                      </div>
                                      <div className="col-span-2 grid grid-cols-2 gap-3">
                                        <HrSelect
                                          label="Đến tháng"
                                          options={monthOptions}
                                          value={fileDetails.den_thang || ''}
                                          onChange={(val) => updateDetails('den_thang', val as string)}
                                        />
                                        <HrSelect
                                          label="Năm"
                                          options={yearOptions}
                                          value={fileDetails.nam_den || ''}
                                          onChange={(val) => updateDetails('nam_den', val as string)}
                                        />
                                      </div>
                                      <HrInput
                                        label="Nơi đào tạo"
                                        placeholder="Tên trường..."
                                        value={fileDetails.noi_dao_tao || ''}
                                        onChange={(val) => updateDetails('noi_dao_tao', val)}
                                        className="col-span-2"
                                      />
                                      <HrInput
                                        label="Chuyên ngành"
                                        placeholder="Nhập chuyên ngành"
                                        value={fileDetails.chuyen_nganh || ''}
                                        onChange={(val) => updateDetails('chuyen_nganh', val)}
                                        className="col-span-2 md:col-span-1"
                                      />
                                      <HrInput
                                        label="Trình độ đào tạo"
                                        placeholder="Ví dụ: Đại học..."
                                        value={fileDetails.trinh_do_dao_tao || ''}
                                        onChange={(val) => updateDetails('trinh_do_dao_tao', val)}
                                        className="col-span-2 md:col-span-1"
                                      />
                                      <HrSelect
                                        label="Xếp loại"
                                        options={xepLoaiOptions}
                                        value={fileDetails.xep_loai || ''}
                                        onChange={(val) => updateDetails('xep_loai', val as string)}
                                        className="col-span-2"
                                      />
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Modal.Body>

              <Modal.Footer className="border-t border-default-100 py-3 px-5">
                <Button
                  variant="flat"
                  onPress={handleClose}
                  className="font-semibold text-default-600"
                >
                  Hủy
                </Button>
                <Button
                  color="primary"
                  className="font-semibold"
                  isDisabled={!canUpload}
                  isLoading={isLoading}
                  onPress={handleUpload}
                  startContent={!isLoading && <CheckCircle2 size={16} />}
                >
                  Tải lên {totalFiles > 0 && `(${totalFiles})`}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  )
}
