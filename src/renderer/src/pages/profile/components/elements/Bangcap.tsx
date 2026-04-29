import { Tooltip, useDisclosure } from '@heroui/react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import DataGrid, { DataGridColumn } from '@renderer/components/DataGrid'
import { Edit, Trash } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { bangcapAxios } from '@renderer/api/hr/bangcapAxios'
import { profileAxios } from '@renderer/api/profileAxios'
import { useSidePanel } from '@renderer/components/side-panel'
import { dispatchSectionChanged, SECTION_EVENTS } from '../../constants/sectionEvents'
import FormBangcap from './FormBangcap'
import FormSkeletonLoader from './FormSkeletonLoader'
import { toast } from "@heroui-v3/react";
import OfficeIcon from '@renderer/components/OfficeIcon'
import { getFileUrl } from '@renderer/utils/urlUtils'
import { truncateMiddle } from '@renderer/utils/string'
import MinhChungPreview, { PreviewFile, resolveFileExt } from '../MinhChungPreview'

interface BangcapData {
  id_bang_cap: string | number
  id_nhan_vien: string | number
  tu_thang: string
  den_thang: string
  noi_dao_tao: string
  chuyen_nganh: string
  trinh_do_dt: string
  xep_loai_dt: string
  file_path?: string | null
  file_name?: string | null
  file_extension?: string | null
}

interface PendingBangCap {
  action: 'add' | 'update' | 'delete'
  tempId?: string
  id_bang_cap?: string | number
  tu_thang?: string
  den_thang?: string
  noi_dao_tao?: string
  chuyen_nganh?: string
  trinh_do_dt?: string
  xep_loai_dt?: string
  file_path?: string | null
  file?: File | null
  [key: string]: any
}

interface BangcapProps {
  bangCapList?: BangcapData[]
  user?: {
    id_nhan_vien: string
    id_vi_tri_cong_viec: string
    id_don_vi_cong_tac: string
    ma_nhan_vien: string
  }
  /** 'direct' = HR writes to DB immediately. 'request' = cache for approval */
  mode?: 'direct' | 'request'
  onPendingChange?: (pending: PendingBangCap[]) => void
}

export default function Bangcap({ bangCapList, user, mode = 'direct', onPendingChange }: BangcapProps) {
  const queryClient = useQueryClient()
  const { openPanel, setBridgedToDrawer } = useSidePanel()
  const [pendingChanges, setPendingChanges] = useState<PendingBangCap[]>([])
  const isRequestMode = mode === 'request'
  // Direct file capture — bypasses formDataRef chain which loses File across React contexts
  const capturedFileRef = useRef<File | null>(null)

  const [data, setData] = useState<BangcapData[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})

  const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

  useEffect(() => {
    if (bangCapList) {
      setData(bangCapList)
    }
  }, [bangCapList])

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        id_nhan_vien: String(user.id_nhan_vien)
      }))
    }
  }, [user])


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
          const row = data.find((d) => String(d.id_bang_cap) === String(id))
          return {
            action: 'delete' as const,
            id_bang_cap: id,
            // Include display fields so HR review modal can show what's being deleted
            tu_thang: row?.tu_thang ?? null,
            den_thang: row?.den_thang ?? null,
            noi_dao_tao: row?.noi_dao_tao ?? null,
            chuyen_nganh: row?.chuyen_nganh ?? null,
            trinh_do_dt: row?.trinh_do_dt ?? null,
            xep_loai_dt: row?.xep_loai_dt ?? null,
            file_path: row?.file_path ?? null,
          }
        })
        const response = await profileAxios.yeucaucapnhat({ bang_cap: deleteItems })
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
          setData((prev) => prev.filter((item) => !payload.includes(item.id_bang_cap)))
          toast('Yêu cầu xóa bằng cấp đã được gửi và đang chờ duyệt', { variant: 'success' })
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
      const response = await bangcapAxios.delete({ ids: payload })
      if (response.status === 200) {
        if (response.success) {
          toast(response.message || 'Xóa bằng cấp thành công', { variant: 'success' })
          setData((prev) => prev.filter((item) => !payload.includes(item.id_bang_cap)))
          dispatchSectionChanged(SECTION_EVENTS.BANGCAP)
        } else {
          toast(response.message || 'Xóa thất bại', { variant: 'danger' })
        }
      }
    } catch (error) {
      console.error(error)
      toast('Có lỗi xảy ra', { variant: 'danger' })
    } finally {
      onCloseConfirm()
      setDeletingId(null)
    }
  }

  const handleEdit = (row: BangcapData) => {
    // Shared onSubmit/onSubmitSuccess builders (captured row ID via closure)
    const buildOnSubmitCallbacks = (rowData: BangcapData) => ({
      onSubmit: isRequestMode
        ? async (_id: any, fd: any) => {
          const entry: any = {}
          if (fd instanceof FormData) { fd.forEach((v: any, k: string) => { entry[k] = v }) } else { Object.assign(entry, fd) }
          const isPendingItem = String(rowData.id_bang_cap).startsWith('pending-')
          const change: PendingBangCap = {
            action: isPendingItem ? 'add' : 'update',
            ...(isPendingItem ? { tempId: String(rowData.id_bang_cap) } : { id_bang_cap: rowData.id_bang_cap }),
            tu_thang: entry.tu_thang, den_thang: entry.den_thang,
            noi_dao_tao: entry.noi_dao_tao, chuyen_nganh: entry.chuyen_nganh,
            trinh_do_dt: entry.trinh_do_dt, xep_loai_dt: entry.xep_loai_dt,
            file: capturedFileRef.current ?? null,
            file_path: entry.file_path ?? null,
          }
          setPendingChanges((prev) => {
            const filtered = prev.filter((p) =>
              isPendingItem ? p.tempId !== String(rowData.id_bang_cap) : !(p.action === 'update' && p.id_bang_cap === rowData.id_bang_cap)
            )
            return [...filtered, change]
          })
          return { success: true, data: { ...entry, id_bang_cap: rowData.id_bang_cap } }
        }
        : (_id: any, data: any) => {
          const fd = data instanceof FormData ? data : new FormData()
          if (!(data instanceof FormData)) {
            Object.entries(data as Record<string, any>).forEach(([k, v]) => {
              if (k === 'file' && v instanceof File) fd.append('file', v)
              else if (k !== 'file' && v != null) fd.append(k, String(v))
            })
          }
          return bangcapAxios.update(String(rowData.id_bang_cap), fd)
        },
      onSubmitSuccess: isRequestMode
        ? (response: any) => {
          const updatedData = response.data
          if (updatedData && typeof updatedData === 'object') {
            setData((prev) => prev.map((item) => item.id_bang_cap === (updatedData as BangcapData).id_bang_cap ? (updatedData as BangcapData) : item))
          }
          toast('Đã lưu tạm thời. Nhấn "Gửi yêu cầu lưu" để hoàn tất yêu cầu cập nhật.', { variant: 'warning' })
          setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        }
        : (response: any) => {
          let updatedData = response.data
          if (updatedData && typeof updatedData === 'object') {
            if (updatedData.xep_loai_dt == 'Khong_dat') updatedData.xep_loai_dt = 'Không đạt'
            if (updatedData.xep_loai_dt == 'Trung_binh') updatedData.xep_loai_dt = 'Trung bình'
            if (updatedData.xep_loai_dt == 'Kha') updatedData.xep_loai_dt = 'Khá'
            if (updatedData.xep_loai_dt == 'Gioi') updatedData.xep_loai_dt = 'Giỏi'
            if (updatedData.xep_loai_dt == 'Xuat_sac') updatedData.xep_loai_dt = 'Xuất sắc'
            setData((prev) => prev.map((item) => item.id_bang_cap === (updatedData as BangcapData).id_bang_cap ? (updatedData as BangcapData) : item))
          }
          setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
          dispatchSectionChanged(SECTION_EVENTS.BANGCAP)
        }
    })

    // ① Open immediately with skeleton — panel appears instantly
    setBridgedToDrawer(true)
    if (isRequestMode) capturedFileRef.current = null
    openPanel({
      title: 'Sửa bằng cấp',
      content: <FormSkeletonLoader rows={5} />,
      formData: {},
    })

    // ② Fetch detail → replace skeleton with real form (called ONCE only — no stale reset risk)
    const openWithData = async (rowData: BangcapData) => {
      const editFormData = { ...rowData }
      setFormData(editFormData)
      openPanel({
        title: 'Sửa bằng cấp',
        content: isRequestMode
          ? <FormBangcap formData={editFormData} setFormData={setFormData} onFileChange={(f) => { capturedFileRef.current = f }} />
          : <FormBangcap formData={editFormData} setFormData={setFormData} />,
        formData: editFormData,
        ...buildOnSubmitCallbacks(rowData)
      })
    }

    if (isRequestMode) {
      // No server fetch needed for request mode — use row data directly
      openWithData(row)
    } else {
      // Fetch once → open form. openWithData is only called here, never again (no stale reset risk)
      bangcapAxios.show(row.id_bang_cap)
        .then((res) => openWithData(res.success && res.data ? res.data : row))
        .catch(() => openWithData(row))
    }
  }

  // ── MinhChungPreview state ──
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([])
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  /** Open inline preview overlay for clicked file */
  const handlePreview = useCallback((row: BangcapData) => {
    if (!row.file_path) return

    // Collect all files from all rows that have file_path
    const allFiles: PreviewFile[] = []
    let clickedIdx = 0
    data.forEach((r) => {
      if (r.file_path) {
        const dn = r.file_name || `bang_cap_${r.id_bang_cap}`
        const ext = resolveFileExt(r.file_extension, dn)
        const url = getFileUrl(r.file_path, dn) || ''
        if (url) {
          if (r.id_bang_cap === row.id_bang_cap) clickedIdx = allFiles.length
          allFiles.push({
            id: r.id_bang_cap,
            file_name: dn,
            url,
            file_extension: ext,
            categoryName: 'Bằng cấp',
            categoryId: 'bangcap',
          })
        }
      }
    })

    setPreviewFiles(allFiles)
    setPreviewIndex(clickedIdx)
  }, [data])

  const gridColumns: DataGridColumn[] = [
    { key: 'ten_bang_cap', header: 'Tên bằng cấp', flex: 3 },
    { key: 'noi_dao_tao', header: 'Đơn vị cấp', flex: 2 },
    { key: 'ngay_cap', header: 'Ngày cấp', width: 110 },
    { key: 'file_path', header: 'File', width: 180 },
    { key: 'actions', header: 'Thao tác', width: 90, align: 'right' },
  ]

  const renderCell = (row: BangcapData, col: DataGridColumn) => {
    switch (col.key) {
      case 'ten_bang_cap':
        return (
          <div className="truncate">
            <span className="text-[13.5px] font-medium text-gray-800 truncate block">
              {row.noi_dao_tao || '—'}
            </span>
            {row.chuyen_nganh && (
              <span className="text-[11.5px] text-gray-400 truncate block">
                Chuyên ngành: {row.chuyen_nganh}
              </span>
            )}
          </div>
        )
      case 'noi_dao_tao':
        return (
          <span className="text-[13px] text-gray-600 truncate block">
            {row.noi_dao_tao || '—'}
          </span>
        )
      case 'ngay_cap':
        return (
          <span className="text-[13px] text-gray-500">
            {row.den_thang && !isNaN(new Date(row.den_thang).getTime())
              ? new Date(row.den_thang).toLocaleDateString('vi-VN')
              : '—'}
          </span>
        )
      case 'file_path': {
        if (!row.file_path) return <span className="text-[12px] text-gray-300 italic">—</span>
        const displayName = row.file_name || `bang_cap_${row.id_bang_cap}`
        return (
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => handlePreview(row)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer max-w-full group/file"
            >
              <OfficeIcon name={displayName} size={14} />
              <span className="text-[12px] text-gray-600 truncate max-w-[100px] group-hover/file:text-gray-800">
                {truncateMiddle(displayName)}
              </span>
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
                onClick={() => handleDelete(row.id_bang_cap)}
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

  const handleOpenAdd = () => {
    const addFormData = { id_nhan_vien: String(user?.id_nhan_vien || '') }
    setFormData(addFormData)

    if (isRequestMode) {
      capturedFileRef.current = null   // reset before opening panel
      openPanel({
        title: 'Thêm bằng cấp',
        content: <FormBangcap
          formData={addFormData}
          setFormData={setFormData}
          onFileChange={(f) => { capturedFileRef.current = f }}
        />,
        formData: addFormData,
        onSubmit: async (_id, fd) => {
          const entry: any = {}
          if (fd instanceof FormData) { fd.forEach((v, k) => { entry[k] = v }) } else { Object.assign(entry, fd) }
          const tempId = `pending-${Date.now()}`
          // capturedFileRef is updated directly by onFileChange — always has the raw File
          console.log('[BangCap onSubmit ADD] capturedFile:', capturedFileRef.current)
          const change: PendingBangCap = {
            action: 'add', tempId,
            tu_thang: entry.tu_thang, den_thang: entry.den_thang,
            noi_dao_tao: entry.noi_dao_tao, chuyen_nganh: entry.chuyen_nganh,
            trinh_do_dt: entry.trinh_do_dt, xep_loai_dt: entry.xep_loai_dt,
            file: capturedFileRef.current ?? null,
            file_path: entry.file_path ?? null,
          }
          setPendingChanges((prev) => [...prev, change])
          return { success: true, data: { ...entry, id_bang_cap: tempId } }
        },
        onSubmitSuccess: (response) => {
          let newData = response.data
          if (newData && typeof newData === 'object') {
            setData((prev) => [...prev, newData as BangcapData])
          }
          toast('Đã lưu tạm thời. Nhấn "Gửi yêu cầu lưu" để hoàn tất yêu cầu cập nhật.', { variant: 'warning' })
          setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        }
      })
    } else {
      openPanel({
        title: 'Thêm bằng cấp',
        content: <FormBangcap formData={addFormData} setFormData={setFormData} />,
        formData: addFormData,
        onSubmit: (_id, data) => {
          // Build FormData so file binary is sent correctly
          const fd = data instanceof FormData ? data : new FormData()
          if (!(data instanceof FormData)) {
            Object.entries(data as Record<string, any>).forEach(([k, v]) => {
              if (k === 'file' && v instanceof File) fd.append('file', v)
              else if (k !== 'file' && v != null) fd.append(k, String(v))
            })
          }
          return bangcapAxios.create(fd)
        },
        onSubmitSuccess: (response) => {
          let newData = response.data
          if (newData && typeof newData === 'object') {
            if (newData.xep_loai_dt == 'Khong_dat') newData.xep_loai_dt = 'Không đạt'
            if (newData.xep_loai_dt == 'Trung_binh') newData.xep_loai_dt = 'Trung bình'
            if (newData.xep_loai_dt == 'Kha') newData.xep_loai_dt = 'Khá'
            if (newData.xep_loai_dt == 'Gioi') newData.xep_loai_dt = 'Giỏi'
            if (newData.xep_loai_dt == 'Xuat_sac') newData.xep_loai_dt = 'Xuất sắc'
            setData((prev) => [...prev, newData as BangcapData])
          }
          setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
          dispatchSectionChanged(SECTION_EVENTS.BANGCAP)
        }
      })
    }
  }

  useEffect(() => {
    const handler = () => handleOpenAdd()
    window.addEventListener('trigger-add-section-10', handler)
    return () => window.removeEventListener('trigger-add-section-10', handler)
  }, [user])

  return (
    <div className="flex flex-col">
      <DataGrid<BangcapData>
        columns={gridColumns}
        data={data}
        rowKey="id_bang_cap"
        renderCell={renderCell}
        emptyText="Chưa có bằng cấp nào"
        rowClassName={(row) =>
          String(row.id_bang_cap).startsWith('pending-') ? 'bg-amber-50/40' : ''
        }
      />

      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa bằng cấp này không? Hành động này không thể hoàn tác."
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
