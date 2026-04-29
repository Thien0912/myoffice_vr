import { Tooltip, useDisclosure } from '@heroui/react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import DataGrid, { DataGridColumn } from '@renderer/components/DataGrid'
import { Edit, Trash } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { chungchiAxios } from '@renderer/api/hr/chungchiAxios'
import { profileAxios } from '@renderer/api/profileAxios'

import { useSidePanel } from '@renderer/components/side-panel'
import { dispatchSectionChanged, SECTION_EVENTS } from '../../constants/sectionEvents'
import FormChungchi from './FormChungchi'
import FormSkeletonLoader from './FormSkeletonLoader'

import { ExistingFile } from '@renderer/shared/CommonInterface'
import { convertSize, guessMimeType } from '@renderer/api/danhmuc/hopDong'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { getFileUrl } from '@renderer/utils/urlUtils'
import { truncateMiddle } from '@renderer/utils/string'
import { toast } from "@heroui-v3/react";
import MinhChungPreview, { PreviewFile, resolveFileExt } from '../MinhChungPreview'

interface ChungchiData {
  id_chung_chi: string | number
  id_nhan_vien: string | number
  ten_chung_chi: string
  ngay_cap_chung_chi: string
  files?: string | any // JSON string or object
  noi_cap: string
}

interface PendingChungChi {
  action: 'add' | 'update' | 'delete'
  tempId?: string
  id_chung_chi?: string | number
  ten_chung_chi?: string
  ngay_cap_chung_chi?: string
  noi_cap?: string
  newFiles?: File[]          // new files to be uploaded on final submit
  keptFilePaths?: string[]   // existing file_paths to keep
  [key: string]: any
}

interface ChungchiProps {
  chungchiList?: ChungchiData[]
  user?: {
    id_nhan_vien: string
  }
  /** 'direct' = HR writes to DB immediately. 'request' = cache for approval */
  mode?: 'direct' | 'request'
  onPendingChange?: (pending: PendingChungChi[]) => void
}

export default function Chungchi({ chungchiList, user, mode = 'direct', onPendingChange }: ChungchiProps) {
  const queryClient = useQueryClient()
  const { openPanel, setBridgedToDrawer, updateFileGroups, updateFormData, fileGroupsRef, formDataRef } = useSidePanel()
  const [pendingChanges, setPendingChanges] = useState<PendingChungChi[]>([])
  const isRequestMode = mode === 'request'

  const [data, setData] = useState<ChungchiData[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({})
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])
  // Independent ref for kept existing files — not subject to React state batching or formDataRef race conditions
  const keptOldFilesRef = useRef<any[]>([])

  const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

  useEffect(() => {
    if (chungchiList) {
      setData(chungchiList)
    }
  }, [chungchiList])

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        id_nhan_vien: String(user.id_nhan_vien)
      }))
    }
  }, [user])

  // Sync formData changes to SidePanel context
  useEffect(() => {
    updateFormData(formData)
  }, [formData])

  // Sync fileGroups changes to SidePanel context
  useEffect(() => {
    updateFileGroups(fileGroups)
  }, [fileGroups])

  const onFilesChange = (name: string, files: File[]) => {
    // Use keptOldFilesRef — always current, immune to React state batching and context ref overwrites
    const keptOldFiles = keptOldFilesRef.current.filter((old: any) =>
      files.some((f) => f.name === old.file_name)
    )
    // Update ref immediately for next call
    keptOldFilesRef.current = keptOldFiles

    // New files = those NOT in kept old files
    const newFilesToUpload = files.filter(
      (f) => !keptOldFiles.some((old: any) => old.file_name === f.name)
    )
    fileGroupsRef.current = { ...fileGroupsRef.current, [name]: newFilesToUpload }

    // CRITICAL: update formDataRef.current SYNCHRONOUSLY here
    // setFormData → updateFormData useEffect is async (needs React re-render cycle)
    // handleSubmit reads formDataRef.current directly — if user submits before re-render, old value is sent
    formDataRef.current = { ...formDataRef.current, old_files: keptOldFiles }

    setFormData((prev) => ({ ...prev, old_files: keptOldFiles }))
    setFileGroups((prev) => ({ ...prev, [name]: newFilesToUpload }))
  }

  const handleDelete = (ids: (string | number) | (string | number)[]) => {
    setDeletingId(ids)
    onOpenConfirm()
  }

  // Sync pending changes to parent
  useEffect(() => {
    if (isRequestMode) onPendingChange?.(pendingChanges)
  }, [pendingChanges, isRequestMode])

  const onConfirmDelete = async () => {
    if (!deletingId) return
    const payload = Array.isArray(deletingId) ? deletingId : [deletingId]

    if (isRequestMode) {
      // Send delete request for approval immediately
      try {
        const deleteItems = payload.map((id) => {
          const row = data.find((d) => String(d.id_chung_chi) === String(id))
          return {
            action: 'delete' as const,
            id_chung_chi: id,
            // Include display fields so HR review modal can show what's being deleted
            ten_chung_chi: row?.ten_chung_chi ?? null,
            ngay_cap_chung_chi: row?.ngay_cap_chung_chi ?? null,
            noi_cap: row?.noi_cap ?? null,
          }
        })
        const response = await profileAxios.yeucaucapnhat({ chung_chi: deleteItems })
        if (response.success) {
          // Also remove any pending adds that were cached locally
          const newPending = [...pendingChanges]
          payload.forEach((id) => {
            const idStr = String(id)
            const pendingIdx = newPending.findIndex((p) => p.tempId === idStr)
            if (pendingIdx >= 0) {
              newPending.splice(pendingIdx, 1)
            }
          })
          setPendingChanges(newPending)
          setData((prev) =>
            prev.filter((item) => !payload.some((id) => String(id) === String(item.id_chung_chi)))
          )
          toast('Yêu cầu xóa chứng chỉ đã được gửi và đang chờ duyệt', { variant: 'success' })
          queryClient.invalidateQueries({ queryKey: ['hr-update-requests-pending-count'] })
          queryClient.invalidateQueries({ queryKey: ['my-update-requests'] })
          queryClient.invalidateQueries({ queryKey: ['nhanVienTuCapNhatData'] })
        } else {
          toast(response.message || 'Gửi yêu cầu xóa thất bại', { variant: 'danger' })
        }
      } catch (error: any) {
        console.error(error)
        toast('Có lỗi xảy ra khi gửi yêu cầu xóa', { variant: 'danger' })
      } finally {
        onCloseConfirm()
        setDeletingId(null)
      }
      return
    }

    try {
      const response = await chungchiAxios.delete({ ids: payload })
      if (response.success) {
        toast(response.message || 'Xóa chứng chỉ thành công', { variant: 'success' })
        setData((prev) =>
          prev.filter((item) => !payload.some((id) => String(id) === String(item.id_chung_chi)))
        )
        queryClient.invalidateQueries({ queryKey: ['chungchiData'] })
        dispatchSectionChanged(SECTION_EVENTS.CHUNGCHI)
      } else {
        toast(response.message || 'Xóa thất bại', { variant: 'danger' })
      }
    } catch (error) {
      console.error(error)
      toast('Có lỗi xảy ra', { variant: 'danger' })
    } finally {
      onCloseConfirm()
      setDeletingId(null)
    }
  }

  const handleEdit = (row: ChungchiData) => {
    // Shared file parser
    const parseFiles = (rowData: ChungchiData) => {
      let files: any[] = []
      if (typeof rowData.files === 'string') {
        try {
          const parsed = JSON.parse(rowData.files)
          files = Array.isArray(parsed) ? parsed : [parsed]
        } catch { files = [] }
      } else if (Array.isArray(rowData.files)) {
        files = rowData.files
      } else if (rowData.files) {
        files = [rowData.files]
      }
      return files
    }

    // ① Show skeleton immediately — panel opens with no delay
    setBridgedToDrawer(true)
    openPanel({
      title: 'Sửa chứng chỉ',
      content: <FormSkeletonLoader rows={4} />,
      formData: {},
    })

    // ② Fetch detail ONCE → replace skeleton with real form (never called again = no stale reset)
    const openWithData = (rowData: ChungchiData) => {
      const files = parseFiles(rowData)
      // Initialize the kept-files ref — this is the source of truth for onFilesChange
      keptOldFilesRef.current = files
      const editFormData = { ...rowData, old_files: files }
      setFormData(editFormData)

      const mappedFiles = files.map((f: any) => ({
        id: f.file_path || f.file_name,
        name: f.file_name,
        size: f.file_size ? convertSize(f.file_size) : 0,
        url: f.file_path,
        type: guessMimeType(f.file_name)
      }))
      setExistingFiles(mappedFiles)

      if (isRequestMode) {
        openPanel({
          title: 'Sửa chứng chỉ',
          content: <FormChungchi formData={editFormData} setFormData={setFormData} onFilesChange={onFilesChange} existingFiles={mappedFiles} />,
          formData: editFormData,
          fileGroups,
          onSubmit: async (_id, fd) => {
            const entry: any = {}
            if (fd instanceof FormData) { fd.forEach((v, k) => { if (k !== 'files[]') entry[k] = v }) } else { Object.assign(entry, fd) }
            const submittedFileGroups = fileGroupsRef.current
            const newFiles = Object.values(submittedFileGroups).flat().filter((f) => f instanceof File)

            // old_files comes from FormData as a JSON string — parse it
            // Also fallback to keptOldFilesRef.current which is always the latest filtered list
            let parsedOldFiles: any[] = keptOldFilesRef.current
            if (entry.old_files && typeof entry.old_files === 'string') {
              try { parsedOldFiles = JSON.parse(entry.old_files) } catch { /* keep ref value */ }
            } else if (Array.isArray(entry.old_files)) {
              parsedOldFiles = entry.old_files
            }
            const keptFilePaths = parsedOldFiles.map((f: any) => f.file_path).filter(Boolean)
            const isPendingItem = String(rowData.id_chung_chi).startsWith('pending-')
            const change: PendingChungChi = {
              action: isPendingItem ? 'add' : 'update',
              ...(isPendingItem ? { tempId: String(rowData.id_chung_chi) } : { id_chung_chi: rowData.id_chung_chi }),
              ten_chung_chi: entry.ten_chung_chi,
              ngay_cap_chung_chi: entry.ngay_cap_chung_chi,
              noi_cap: entry.noi_cap,
              newFiles,
              keptFilePaths,
            }
            setPendingChanges((prev) => {
              const filtered = prev.filter((p) =>
                isPendingItem ? p.tempId !== String(rowData.id_chung_chi) : !(p.action === 'update' && p.id_chung_chi === rowData.id_chung_chi)
              )
              return [...filtered, change]
            })
            return { success: true, data: { ...entry, id_chung_chi: rowData.id_chung_chi } }
          },
          onSubmitSuccess: (response) => {
            const updatedData = response.data
            if (updatedData && typeof updatedData === 'object') {
              setData((prev) => prev.map((item) => item.id_chung_chi === (updatedData as ChungchiData).id_chung_chi ? (updatedData as ChungchiData) : item))
            }
            toast('Đã lưu tạm thời. Nhấn "Gửi yêu cầu lưu" để hoàn tất yêu cầu cập nhật.', { variant: 'warning' })
            setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
            setFileGroups({})
          }
        })
      } else {
        openPanel({
          title: 'Sửa chứng chỉ',
          content: <FormChungchi formData={editFormData} setFormData={setFormData} onFilesChange={onFilesChange} existingFiles={mappedFiles} />,
          formData: editFormData,
          fileGroups,
          onSubmit: (_id, data) => chungchiAxios.update(String(rowData.id_chung_chi), data!),
          onSubmitSuccess: (response) => {
            const updatedData = response.data
            queryClient.invalidateQueries({ queryKey: ['chungchiData'] })
            if (updatedData && typeof updatedData === 'object') {
              setData((prev) => prev.map((item) => item.id_chung_chi === (updatedData as ChungchiData).id_chung_chi ? (updatedData as ChungchiData) : item))
            }
            setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
            dispatchSectionChanged(SECTION_EVENTS.CHUNGCHI)
            setFileGroups({})
          }
        })
      }
    }

    if (isRequestMode) {
      // No server fetch needed for request mode — use row data directly
      openWithData(row)
    } else {
      // Fetch once → open form. openWithData is only called here, never again (no stale race condition)
      chungchiAxios.show(row.id_chung_chi)
        .then((res) => openWithData(res.success && res.data ? res.data : row))
        .catch(() => openWithData(row))
    }
  }

  // ── MinhChungPreview state ──
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([])
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  /** Open inline preview overlay for clicked file */
  const handlePreview = useCallback((targetRow: ChungchiData, fileIndex: number = 0) => {
    // Collect ALL files across all rows
    const allFiles: PreviewFile[] = []
    let clickedIdx = 0

    data.forEach((r) => {
      const files = parseRowFiles(r)
      files.forEach((f: any, fIdx: number) => {
        if (f.file_path) {
          const fileName = f.file_name || 'document'
          const ext = resolveFileExt(null, fileName)
          const url = getFileUrl(f.file_path, fileName) || ''
          if (url) {
            // Mark the clicked file's global index
            if (r.id_chung_chi === targetRow.id_chung_chi && fIdx === fileIndex) {
              clickedIdx = allFiles.length
            }
            allFiles.push({
              id: `${r.id_chung_chi}-${f.file_path}`,
              file_name: fileName,
              url,
              file_extension: ext,
              categoryName: r.ten_chung_chi || 'Chứng chỉ',
              categoryId: r.id_chung_chi,
            })
          }
        }
      })
    })

    setPreviewFiles(allFiles)
    setPreviewIndex(clickedIdx)
  }, [data])



  const handleOpenAdd = () => {
    const addFormData = { id_nhan_vien: String(user?.id_nhan_vien || '') }
    setFormData(addFormData)
    setBridgedToDrawer(true)

    if (isRequestMode) {
      // Cache add for approval — don't call API
      openPanel({
        title: 'Thêm chứng chỉ',
        content: <FormChungchi formData={addFormData} setFormData={setFormData} onFilesChange={onFilesChange} />,
        formData: addFormData,
        fileGroups,
        onSubmit: async (_id, fd) => {
          const entry: any = {}
          if (fd instanceof FormData) { fd.forEach((v, k) => { if (k !== 'files[]') entry[k] = v }) } else { Object.assign(entry, fd) }
          // Snapshot files at submit time via ref (always latest)
          const submittedFileGroups = fileGroupsRef.current
          const newFiles = Object.values(submittedFileGroups).flat().filter((f) => f instanceof File)
          const tempId = `pending-${Date.now()}`
          const change: PendingChungChi = {
            action: 'add',
            tempId,
            ten_chung_chi: entry.ten_chung_chi,
            ngay_cap_chung_chi: entry.ngay_cap_chung_chi,
            noi_cap: entry.noi_cap,
            newFiles,
            keptFilePaths: [],
          }
          setPendingChanges((prev) => [...prev, change])
          return { success: true, data: { ...entry, id_chung_chi: tempId } }
        },
        onSubmitSuccess: (response) => {
          const newData = response.data
          if (newData && typeof newData === 'object') {
            setData((prev) => [...prev, newData as ChungchiData])
          }
          toast('Đã lưu tạm thời. Nhấn "Gửi yêu cầu lưu" để hoàn tất yêu cầu cập nhật.', { variant: 'warning' })
          setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
          setFileGroups({})
        }
      })
    } else {
      openPanel({
        title: 'Thêm chứng chỉ',
        content: <FormChungchi formData={addFormData} setFormData={setFormData} onFilesChange={onFilesChange} />,
        formData: addFormData,
        fileGroups,
        onSubmit: (_id, data) => chungchiAxios.create(data!),
        onSubmitSuccess: (response) => {
          const newData = response.data
          queryClient.invalidateQueries({ queryKey: ['chungchiData'] })
          if (newData && typeof newData === 'object') {
            setData((prev) => [...prev, newData as ChungchiData])
          }
          setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
          dispatchSectionChanged(SECTION_EVENTS.CHUNGCHI)
          setFileGroups({})
        }
      })
    }
  }

  useEffect(() => {
    const handler = () => handleOpenAdd()
    window.addEventListener('trigger-add-section-9', handler)
    return () => window.removeEventListener('trigger-add-section-9', handler)
  }, [user])

  /** Parse files from a row (JSON string, array, or single object) */
  const parseRowFiles = (row: ChungchiData): any[] => {
    let files: any[] = []
    try {
      if (typeof row.files === 'string') {
        const parsed = JSON.parse(row.files)
        files = Array.isArray(parsed) ? parsed : [parsed]
      } else if (Array.isArray(row.files)) {
        files = row.files
      } else if (row.files) {
        files = [row.files]
      }
    } catch { files = [] }
    return files
  }

  const gridColumns: DataGridColumn[] = [
    { key: 'ten_chung_chi', header: 'Tên chứng chỉ', flex: 3 },
    { key: 'noi_cap', header: 'Đơn vị cấp', flex: 2 },
    { key: 'ngay_cap_chung_chi', header: 'Ngày cấp', width: 100 },
    { key: 'files', header: 'File', flex: 2 },
    { key: 'actions', header: 'Thao tác', width: 80, align: 'right' },
  ]

  const renderCell = (row: ChungchiData, col: DataGridColumn) => {
    switch (col.key) {
      case 'ten_chung_chi':
        return (
          <span className="text-[13.5px] font-medium text-gray-800 truncate block">
            {row.ten_chung_chi || '—'}
          </span>
        )
      case 'noi_cap':
        return (
          <span className="text-[13px] text-gray-600 truncate block">
            {row.noi_cap || '—'}
          </span>
        )
      case 'ngay_cap_chung_chi':
        return (
          <span className="text-[13px] text-gray-500">
            {row.ngay_cap_chung_chi && !isNaN(new Date(row.ngay_cap_chung_chi).getTime())
              ? new Date(row.ngay_cap_chung_chi).toLocaleDateString('vi-VN')
              : '—'}
          </span>
        )
      case 'files': {
        const files = parseRowFiles(row)
        if (!files.length) return <span className="text-[12px] text-gray-300 italic">—</span>
        const f = files[0]
        return (
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => f.file_path && handlePreview(row, 0)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer max-w-full group/file"
            >
              <OfficeIcon name={f.file_name || 'file'} size={14} />
              <span className="text-[12px] text-gray-600 truncate max-w-[100px] group-hover/file:text-gray-800">
                {truncateMiddle(f.file_name || 'File')}
              </span>
              {files.length > 1 && (
                <span className="text-[10px] text-gray-400 ml-0.5">+{files.length - 1}</span>
              )}
            </button>
          </div>
        )
      }
      case 'actions':
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Tooltip content="Chỉnh sửa" closeDelay={0}>
              <button
                type="button"
                onClick={() => handleEdit(row)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <Edit size={15} />
              </button>
            </Tooltip>
            <Tooltip content="Xóa" color="danger" closeDelay={0}>
              <button
                type="button"
                onClick={() => handleDelete(row.id_chung_chi)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
              >
                <Trash size={15} />
              </button>
            </Tooltip>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col">
      <DataGrid<ChungchiData>
        columns={gridColumns}
        data={data}
        rowKey="id_chung_chi"
        renderCell={renderCell}
        emptyText="Chưa có chứng chỉ nào"
        rowClassName={(row) =>
          String(row.id_chung_chi).startsWith('pending-') ? 'bg-amber-50/40' : ''
        }
      />

      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa chứng chỉ này không? Hành động này không thể hoàn tác."
        isDanger
      />

      {/* Inline file preview overlay */}
      <MinhChungPreview
        files={previewFiles}
        initialIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
        readOnly
      />
    </div>
  )
}
