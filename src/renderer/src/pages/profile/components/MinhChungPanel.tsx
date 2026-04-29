import { useCallback, useEffect, useMemo, useState } from 'react'
import { PhotoProvider } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'
import {
  RotateCw, ZoomIn, ZoomOut, FlipHorizontal, FlipVertical, RotateCcw,
  RefreshCw, ImageOff, Trash2, Loader2, Download, FileText, Clock,
  CheckSquare2, X, Send
} from 'lucide-react'
import { minhchungAxios, type MinhChungCategory, type MinhChungFile } from '@renderer/api/hr/minhchungAxios'
import { nhanvientucapnhatAxios } from '@renderer/api/hr/nhanvientucapnhatAxios'
import { profileAxios } from '@renderer/api/profileAxios'
import { getFileUrl } from '@renderer/utils/urlUtils'
import { Spinner } from '@heroui/react'
import { useQueryClient } from '@tanstack/react-query'
import { SECTION_EVENTS } from '../constants/sectionEvents'
import MinhChungPreview, { type PreviewFile } from './MinhChungPreview'
import { toast } from "@heroui-v3/react";

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg']
const TOOLBAR_BTN =
  'w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer'

interface FlatFile {
  file: MinhChungFile
  categoryName: string
  categoryId: number
  globalIndex: number
}

interface MinhChungPanelProps {
  idNhanVien: string | number
  /** When true: enables HR-approval request flow instead of direct delete */
  readOnly?: boolean
  /** Employee's ma_nhan_vien — used to filter pending delete requests */
  maNhanVien?: string
}

export default function MinhChungPanel({ idNhanVien, readOnly, maNhanVien }: MinhChungPanelProps) {
  const queryClient = useQueryClient()
  const [categories, setCategories] = useState<MinhChungCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Pending delete IDs (already have a pending HR request)
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<number>>(new Set())

  // ── Batch-select deletion state ──────────────────────────────────────────
  const [isSelectMode, setIsSelectMode] = useState(false)
  /** IDs currently selected for batch delete request */
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  // ────────────────────────────────────────────────────────────────────────

  const [flipX, setFlipX] = useState(false)
  const [flipY, setFlipY] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    if (!idNhanVien) return
    try {
      setIsLoading(true)
      const res = await minhchungAxios.getByNhanVien(idNhanVien)
      if (res.success) {
        setCategories(res.data || [])
      }
    } catch (err) {
      console.error('Lỗi tải minh chứng:', err)
    } finally {
      setIsLoading(false)
    }
  }, [idNhanVien])

  /** Fetch pending delete requests for this employee to mark them visually */
  const loadPendingDeletes = useCallback(async () => {
    if (!readOnly || !maNhanVien) return
    try {
      const res = await nhanvientucapnhatAxios.fetch({
        searchValue: maNhanVien,
        searchKey: JSON.stringify({ searchValue: maNhanVien }),
        start: 0,
        length: 50,
        _t: Date.now()
      })
      const pendingIds = new Set<number>()
        ; (res?.data || []).forEach((req: any) => {
          if (req.trang_thai !== '0') return // only pending
          try {
            const du_lieu = JSON.parse(req.du_lieu || '{}')
              ; (du_lieu.minh_chung || []).forEach((mc: any) => {
                if (mc.action === 'delete' && mc.id_minh_chung) {
                  pendingIds.add(Number(mc.id_minh_chung))
                }
              })
          } catch { /* ignore */ }
        })
      setPendingDeleteIds(pendingIds)
    } catch { /* silent */ }
  }, [readOnly, maNhanVien])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { loadPendingDeletes() }, [loadPendingDeletes])

  // Listen for refresh events (debounced)
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>
    const handler = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(fetchData, 300)
    }
    const events: string[] = ['minh-chung-refresh', ...(Object.values(SECTION_EVENTS) as string[])]
    events.forEach((evt) => window.addEventListener(evt, handler))
    return () => {
      clearTimeout(debounceTimer)
      events.forEach((evt) => window.removeEventListener(evt, handler))
    }
  }, [fetchData])

  // Flatten categories → ordered file list for preview
  const flatFiles: FlatFile[] = useMemo(() => {
    let idx = 0
    return categories.flatMap((cat) =>
      cat.files.map((file) => ({
        file,
        categoryName: cat.ten_loai,
        categoryId: cat.id_loai_minh_chung,
        globalIndex: idx++,
      }))
    )
  }, [categories])

  // Keep previewIndex in bounds
  useEffect(() => {
    if (previewIndex !== null && flatFiles.length > 0 && previewIndex >= flatFiles.length) {
      setPreviewIndex(Math.max(0, flatFiles.length - 1))
    }
    if (previewIndex !== null && flatFiles.length === 0) {
      setPreviewIndex(null)
    }
  }, [flatFiles.length, previewIndex])

  const openPreview = useCallback((index: number) => {
    if (isSelectMode) return // don't open preview in select mode
    setPreviewIndex(index)
  }, [isSelectMode])

  // ── Direct delete (HR mode, non-readOnly) ───────────────────────────────
  const handleDelete = useCallback(async (idMinhChung: number) => {
    try {
      setDeletingId(idMinhChung)
      const res = await minhchungAxios.delete(idMinhChung)
      if (res.success) {
        await fetchData()
        window.dispatchEvent(new CustomEvent('minh-chung-refresh'))
        toast('Đã xóa minh chứng', { variant: 'success' })
      } else {
        toast('Lỗi', { description: res.message, variant: 'danger' })
      }
    } catch {
      toast('Lỗi', { description: 'Không thể xóa minh chứng', variant: 'danger' })
    } finally {
      setDeletingId(null)
    }
  }, [fetchData])

  // ── Batch request delete (readOnly / user mode) ──────────────────────────
  const toggleSelectMode = useCallback(() => {
    setIsSelectMode(prev => !prev)
    setSelectedIds(new Set()) // clear selection when toggling
  }, [])

  const toggleSelectId = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  /** Build payload items for each selected id, lookup file_name & cat name from categories */
  const buildBatchPayload = useCallback(() => {
    const items: { id_minh_chung: number; file_name: string; loai_label: string }[] = []
    categories.forEach(cat => {
      cat.files.forEach(f => {
        if (selectedIds.has(f.id_minh_chung)) {
          items.push({
            id_minh_chung: f.id_minh_chung,
            file_name: f.file_name,
            loai_label: cat.ten_loai,
          })
        }
      })
    })
    return items
  }, [categories, selectedIds])

  const handleSubmitBatchRequest = useCallback(async () => {
    const items = buildBatchPayload()
    if (items.length === 0) return

    // Check if any are already pending
    const alreadyPending = items.filter(i => pendingDeleteIds.has(i.id_minh_chung))
    if (alreadyPending.length > 0) {
      toast('Thông báo', {
        description: `${alreadyPending.length} file đã có yêu cầu đang chờ HR duyệt.`,
        variant: 'warning'
      })
      return
    }

    try {
      setIsSendingRequest(true)
      const res = await profileAxios.requestDeleteMinhChung({ items })
      if (res.success) {
        setIsSelectMode(false)
        setSelectedIds(new Set())
        // Refetch pending states from server to ensure accuracy
        await loadPendingDeletes()
        // Notify parent/siblings to refresh
        window.dispatchEvent(new CustomEvent('minh-chung-refresh'))
        queryClient.invalidateQueries({ queryKey: ['hr-update-requests-pending-count'] })
        queryClient.invalidateQueries({ queryKey: ['my-update-requests'] })
        queryClient.invalidateQueries({ queryKey: ['nhanVienTuCapNhatData'] })
        queryClient.invalidateQueries({ queryKey: ['personnel-profile'] })
        toast('Đã gửi yêu cầu', {
          description: `Yêu cầu xóa ${items.length} minh chứng đã được gửi, vui lòng chờ HR xét duyệt.`,
          variant: 'success'
        })
      } else {
        toast('Lỗi', { description: res.message || 'Không thể gửi yêu cầu', variant: 'danger' })
      }
    } catch {
      toast('Lỗi', { description: 'Không thể gửi yêu cầu xóa', variant: 'danger' })
    } finally {
      setIsSendingRequest(false)
    }
  }, [buildBatchPayload, pendingDeleteIds, loadPendingDeletes])

  // ── Download ─────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async (fileUrl: string | undefined, fileName: string) => {
    try {
      if (!fileUrl) return
      const res = await fetch(fileUrl)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = fileName
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      toast('Không thể tải file', { variant: 'danger' })
    }
  }, [])

  // Map flatFiles to PreviewFile[] for the shared preview component
  const previewFiles: PreviewFile[] = useMemo(() =>
    flatFiles.map((ff) => ({
      id: ff.file.id_minh_chung,
      file_name: ff.file.file_name,
      url: getFileUrl(ff.file.file_path, ff.file.file_name) || '',
      file_extension: ff.file.file_extension || '',
      categoryName: ff.categoryName,
      categoryId: ff.categoryId,
    })),
    [flatFiles]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Spinner size="sm" label="Đang tải minh chứng..." />
      </div>
    )
  }

  const allImageFileNames = categories.flatMap((cat) =>
    cat.files.filter((f) => IMAGE_EXTS.includes((f.file_extension || '').toLowerCase())).map((f) => f.file_name)
  )

  // Total non-pending deletable files (for select-all)
  const allDeletableIds = categories.flatMap(cat =>
    cat.files.filter(f => !pendingDeleteIds.has(f.id_minh_chung)).map(f => f.id_minh_chung)
  )

  return (
    <>
      {/* Shared fullscreen preview */}
      <MinhChungPreview
        files={previewFiles}
        initialIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onDelete={(id) => handleDelete(id as number)}
        deletingId={deletingId}
        readOnly={readOnly}
      />

      {/* ── Toolbar: "Chọn để xóa" button (readOnly mode only) ── */}
      {readOnly && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-default-400">
            {pendingDeleteIds.size > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <Clock size={12} />
                {pendingDeleteIds.size} file đang chờ HR duyệt xóa
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={toggleSelectMode}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              isSelectMode
                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                : 'bg-default-100 text-default-600 hover:bg-default-200 border border-default-200'
            ].join(' ')}
          >
            {isSelectMode ? (
              <><X size={13} />Hủy chọn</>
            ) : (
              <><Trash2 size={13} />Yêu cầu xóa ảnh</>
            )}
          </button>
        </div>
      )}

      {/* ── Select-all bar (shown when isSelectMode) ── */}
      {isSelectMode && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
          <button
            type="button"
            onClick={() => {
              const allSelected = allDeletableIds.every(id => selectedIds.has(id))
              setSelectedIds(allSelected ? new Set() : new Set(allDeletableIds))
            }}
            className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
          >
            <CheckSquare2 size={13} />
            {allDeletableIds.every(id => selectedIds.has(id)) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </button>
          <span className="text-xs text-red-400 ml-auto">
            Click vào ảnh để chọn / bỏ chọn
          </span>
        </div>
      )}

      <PhotoProvider
        speed={() => 300}
        easing={() => 'cubic-bezier(0.25, 0.8, 0.25, 1)'}
        overlayRender={({ index }) => (
          <>
            {(flipX || flipY) && (
              <style>{`
                .PhotoView__Photo {
                  scale: ${flipX ? -1 : 1} ${flipY ? -1 : 1};
                }
              `}</style>
            )}
            {allImageFileNames[index] && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 text-white text-sm px-4 py-1.5 rounded-full max-w-[80%] truncate pointer-events-none">
                {allImageFileNames[index]}
              </div>
            )}
          </>
        )}
        toolbarRender={({ rotate, onRotate, onScale, scale }) => (
          <div className="flex items-center gap-1.5">
            <button className={TOOLBAR_BTN} onClick={() => onScale(scale + 0.5)} title="Phóng to">
              <ZoomIn size={20} />
            </button>
            <button className={TOOLBAR_BTN} onClick={() => onScale(scale - 0.5)} title="Thu nhỏ">
              <ZoomOut size={20} />
            </button>
            <div className="w-px h-5 bg-white/30 mx-1" />
            <button className={TOOLBAR_BTN} onClick={() => onRotate(rotate - 90)} title="Xoay trái">
              <RotateCcw size={20} />
            </button>
            <button className={TOOLBAR_BTN} onClick={() => onRotate(rotate + 90)} title="Xoay phải">
              <RotateCw size={20} />
            </button>
            <div className="w-px h-5 bg-white/30 mx-1" />
            <button
              className={`${TOOLBAR_BTN} ${flipX ? 'bg-white/30' : ''}`}
              onClick={() => setFlipX(prev => !prev)}
              title="Lật ngang"
            >
              <FlipHorizontal size={20} />
            </button>
            <button
              className={`${TOOLBAR_BTN} ${flipY ? 'bg-white/30' : ''}`}
              onClick={() => setFlipY(prev => !prev)}
              title="Lật dọc"
            >
              <FlipVertical size={20} />
            </button>
            <div className="w-px h-5 bg-white/30 mx-1" />
            <button
              className={TOOLBAR_BTN}
              onClick={() => {
                onRotate(0)
                onScale(1)
                setFlipX(false)
                setFlipY(false)
              }}
              title="Đặt lại"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        )}
        onIndexChange={() => {
          setFlipX(false)
          setFlipY(false)
        }}
      >
        <div className="flex flex-col gap-6">
          {categories.map((cat) => {
            let catStartIndex = 0
            for (const c of categories) {
              if (c.id_loai_minh_chung === cat.id_loai_minh_chung) break
              catStartIndex += c.files.length
            }

            return (
              <div key={cat.id_loai_minh_chung}>
                {/* Category divider */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-default-200" />
                  <span className="text-xs font-semibold text-default-600 bg-default-100 px-3 py-1 rounded-full whitespace-nowrap">
                    {cat.ten_loai}
                  </span>
                  <div className="flex-1 h-px bg-default-200" />
                </div>

                {cat.files.length > 0 ? (
                  <div className="rounded-xl border border-dashed border-default-300 bg-default-50/50 p-3">
                    <div className="flex flex-wrap gap-2">
                      {cat.files.map((img, fileIdx) => {
                        const fileUrl = getFileUrl(img.file_path, img.file_name)
                        const ext = (img.file_extension || '').toLowerCase()
                        const isImage = IMAGE_EXTS.includes(ext)
                        const globalIdx = catStartIndex + fileIdx

                        const isPending = pendingDeleteIds.has(img.id_minh_chung)
                        const isSelected = selectedIds.has(img.id_minh_chung)

                        const thumbnailContent = isImage ? (
                          <img
                            src={fileUrl}
                            alt={img.file_name}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-default-100">
                            <FileText size={24} className="text-red-500 mb-1" />
                            <span className="text-[9px] text-default-500 uppercase font-bold">{ext}</span>
                          </div>
                        )

                        // ── SELECT MODE ──────────────────────────────────
                        if (isSelectMode) {
                          return (
                            <div
                              key={img.id_minh_chung}
                              onClick={() => !isPending && toggleSelectId(img.id_minh_chung)}
                              className={[
                                'relative w-28 h-24 rounded-lg overflow-hidden border-2 transition-all',
                                isPending
                                  ? 'border-amber-400 opacity-50 cursor-not-allowed'
                                  : isSelected
                                    ? 'border-red-500 cursor-pointer ring-2 ring-red-300'
                                    : 'border-default-200 cursor-pointer hover:border-red-300'
                              ].join(' ')}
                            >
                              {thumbnailContent}

                              {/* Selection overlay */}
                              {!isPending && (
                                <div className={[
                                  'absolute inset-0 transition-all',
                                  isSelected ? 'bg-red-500/20' : 'bg-transparent'
                                ].join(' ')}>
                                  {/* Checkbox top-right */}
                                  <div className={[
                                    'absolute top-1.5 right-1.5 w-5 h-5 rounded border-2 flex items-center justify-center',
                                    isSelected
                                      ? 'bg-red-500 border-red-500'
                                      : 'bg-white/80 border-white/60'
                                  ].join(' ')}>
                                    {isSelected && <X size={11} className="text-white" strokeWidth={3} />}
                                  </div>
                                </div>
                              )}

                              {/* Pending badge */}
                              {isPending && (
                                <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-white text-[9px] font-bold px-1 py-0.5 text-center leading-tight flex items-center justify-center gap-0.5">
                                  <Clock size={8} />
                                  Chờ duyệt
                                </div>
                              )}

                              {/* File name */}
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate">
                                {img.file_name}
                              </div>
                            </div>
                          )
                        }

                        // ── NORMAL MODE ──────────────────────────────────
                        const actionButtons = (
                          <>
                            {/* HR direct delete button (non-readOnly) */}
                            {!readOnly && (
                              <button
                                type="button"
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                                title="Xóa"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(img.id_minh_chung)
                                }}
                              >
                                {deletingId === img.id_minh_chung ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <Trash2 size={10} />
                                )}
                              </button>
                            )}

                            {/* Pending badge (readOnly) */}
                            {isPending && (
                              <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-white text-[9px] font-bold px-1 py-0.5 text-center leading-tight flex items-center justify-center gap-0.5 pointer-events-none">
                                <Clock size={8} />
                                Chờ duyệt xóa
                              </div>
                            )}

                            <button
                              type="button"
                              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-blue-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 z-10"
                              title="Tải xuống"
                              onClick={async (e) => {
                                e.stopPropagation()
                                await handleDownload(fileUrl, img.file_name)
                              }}
                            >
                              <Download size={10} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                              {img.file_name}
                            </div>
                          </>
                        )

                        if (isImage) {
                          return (
                            <div
                              key={img.id_minh_chung}
                              className="relative w-28 h-24 rounded-lg overflow-hidden border border-default-200 cursor-pointer group"
                              onClick={() => openPreview(globalIdx)}
                            >
                              <img
                                src={fileUrl}
                                referrerPolicy="no-referrer"
                                alt={img.file_name}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                onError={(e) => {
                                  const target = e.currentTarget
                                  if (!target.dataset.retried && fileUrl) {
                                    target.dataset.retried = '1'
                                    const sep = fileUrl.includes('?') ? '&' : '?'
                                    target.src = `${fileUrl}${sep}_t=${Date.now()}`
                                  }
                                }}
                              />
                              {actionButtons}
                            </div>
                          )
                        }

                        return (
                          <div
                            key={img.id_minh_chung}
                            className="relative w-28 h-24 rounded-lg overflow-hidden border border-default-200 cursor-pointer group bg-default-100 flex flex-col items-center justify-center"
                            onClick={() => openPreview(globalIdx)}
                          >
                            <FileText size={24} className="text-red-500 mb-1" />
                            <span className="text-[9px] text-default-500 uppercase font-bold">{ext}</span>
                            {actionButtons}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-default-300 bg-default-50/50 py-8 flex flex-col items-center justify-center gap-2">
                    <ImageOff size={24} className="text-default-300" />
                    <p className="text-sm text-default-400">Không có hình ảnh để hiển thị</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </PhotoProvider>

      {/* ── Floating action bar (batch submit) ─────────────────────────────── */}
      {isSelectMode && (
        <div className={[
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300',
          selectedIds.size > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        ].join(' ')}>
          <div className="flex items-center gap-3 bg-white border border-red-200 shadow-2xl rounded-2xl px-5 py-3">
            <div className="text-sm font-semibold text-red-700">
              {selectedIds.size} ảnh được chọn
            </div>
            <div className="w-px h-5 bg-red-200" />
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-default-500 hover:text-default-800 flex items-center gap-1"
            >
              <X size={13} />
              Bỏ chọn
            </button>
            <button
              type="button"
              disabled={isSendingRequest}
              onClick={handleSubmitBatchRequest}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSendingRequest ? (
                <><Loader2 size={14} className="animate-spin" />Đang gửi...</>
              ) : (
                <><Send size={14} />Gửi yêu cầu xóa</>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
