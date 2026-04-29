import { toast } from "@heroui-v3/react"
import { Button, Chip, Tooltip, useDisclosure } from '@heroui/react'
import { convertSize, guessMimeType } from '@renderer/api/danhmuc/hopDong'
import { quatrinhcongtacAxios } from '@renderer/api/hr/quatrinhcongtacAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { DataGrid, DataGridColumn } from '@renderer/components/DataGrid'
import OfficeIcon from '@renderer/components/OfficeIcon'
import { useSidePanel } from '@renderer/components/side-panel'
import { ExistingFile } from '@renderer/shared/CommonInterface'
import { enscrypt } from '@renderer/utils/documents/userPreview'
import openPopout from '@renderer/utils/openPopout'
import { truncateMiddle } from '@renderer/utils/string'
import { useQueryClient } from '@tanstack/react-query'
import { Edit, Plus, Trash } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { dispatchSectionChanged, SECTION_EVENTS } from '../../constants/sectionEvents'
import FormQuatrinhcongtac from './FormQuatrinhcongtac'

interface QuatrinhcongtacData {
  id_qua_trinh_cong_tac: string | number
  id_nhan_vien: string | number
  ngay_bat_dau: string
  ngay_ket_thuc: string
  id_vi_tri_cong_viec: string | number
  id_don_vi: string | number
  ghi_chu: string
  cap: string | null
  bac: string | null
  files?: string | any // JSON string or object
  ten_don_vi?: string
  ten_cong_viec?: string
  ten_cong_viec_en?: string
}

interface QuatrinhcongtacProps {
  quatrinhcongtacList?: QuatrinhcongtacData[]
  user?: {
    id_nhan_vien: string
    id_vi_tri_cong_viec: string
    id_don_vi_cong_tac: string
    ma_nhan_vien: string
  }
}

export default function Quatrinhcongtac({ quatrinhcongtacList, user }: QuatrinhcongtacProps) {
  const queryClient = useQueryClient()
  const { openPanel, setBridgedToDrawer, updateFileGroups } = useSidePanel()

  const [columnWidths, setColumnWidth] = useState<Record<string, number>>({})
  const [sortDescriptors, setSortDescriptors] = useState<any[]>([])
  const [, setPinnedColumn] = useState<string[]>([])

  const [data, setData] = useState<QuatrinhcongtacData[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({})
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])

  const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

  const sortData = (list: QuatrinhcongtacData[]) => {
    return [...list].sort((a, b) => {
      const dateA = a.ngay_bat_dau ? new Date(a.ngay_bat_dau).getTime() : 0
      const dateB = b.ngay_bat_dau ? new Date(b.ngay_bat_dau).getTime() : 0
      if (dateA !== dateB) return dateB - dateA
      return Number(b.id_qua_trinh_cong_tac || 0) - Number(a.id_qua_trinh_cong_tac || 0)
    })
  }

  useEffect(() => {
    if (quatrinhcongtacList) {
      setData(sortData(quatrinhcongtacList))
    }
  }, [quatrinhcongtacList])

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        id_nhan_vien: String(user.id_nhan_vien)
      }))
    }
  }, [user])

  // Sync local fileGroups to SidePanelContext ref so handleSecondarySubmit can read them
  useEffect(() => {
    updateFileGroups(fileGroups)
  }, [fileGroups])

  const onFilesChange = (name: string, files: File[]) => {
    const oldFiles = fileGroups[name] || []
    const deletedFiles = oldFiles.filter(
      (old) => !files.some((f) => f.name === old.name && f.size === old.size)
    )

    if (deletedFiles.length > 0) {
      const deletedFileNames = deletedFiles.map((f) => f.name)

      const listFileOldName = ['files_dinh_kem_old']
      Object.keys(formData).forEach((key) => {
        if (!listFileOldName.includes(key)) return

        const value = formData[key]
        if (Array.isArray(value)) {
          const matched = value.filter((item) => deletedFileNames.includes(item.file_name))
          const notMatched = value.filter((item) => !deletedFileNames.includes(item.file_name))

          // Update form data with the remaining non-deleted files (even if empty)
          setFormData((p) => ({ ...p, [key]: notMatched }))
        }
      })
    }

    setFileGroups((p) => ({ ...p, [name]: files }))
  }

  const handleDelete = (ids: (string | number) | (string | number)[]) => {
    setDeletingId(ids)
    onOpenConfirm()
  }

  const onConfirmDelete = async () => {
    if (!deletingId) return
    const payload = Array.isArray(deletingId) ? deletingId : [deletingId]

    try {
      const response = await quatrinhcongtacAxios.delete({ ids: payload })
      if (response.status === 200) {
        if (response.success) {
          toast(response.message || 'Xóa quá trình công tác thành công', { variant: 'success' })
          setData((prev) => prev.filter((item) => !payload.includes(item.id_qua_trinh_cong_tac)))
          queryClient.invalidateQueries({ queryKey: ['quatrinhcongtacData'] })
          dispatchSectionChanged(SECTION_EVENTS.QUATRINHCONGTAC)
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

  const handleEdit = async (row: QuatrinhcongtacData) => {
    let rowData = row
    try {
      const res = await quatrinhcongtacAxios.show(row.id_qua_trinh_cong_tac)
      if (res.success && res.data) {
        rowData = res.data
      }
    } catch (e) {
      console.error('Error fetching detail', e)
    }

    setEditingId(rowData.id_qua_trinh_cong_tac)
    setFormData({
      ...rowData,
      id_don_vi: String(rowData.id_don_vi),
      id_vi_tri_cong_viec: String(rowData.id_vi_tri_cong_viec),
      files_dinh_kem_old: rowData.files
    })

    // Parse files
    let files: any[] = []
    if (typeof rowData.files === 'string') {
      try {
        const parsed = JSON.parse(rowData.files)
        files = Array.isArray(parsed) ? parsed : [parsed]
      } catch (e) {
        files = []
      }
    } else if (Array.isArray(rowData.files)) {
      files = rowData.files
    } else if (rowData.files) {
      files = [rowData.files]
    }

    const mappedFiles = files.map((f: any) => ({
      id: f.file_path || f.file_name,
      name: f.file_name,
      size: f.file_size ? Number(convertSize(f.file_size)) : 0,
      url: f.file_path,
      type: guessMimeType(f.file_name)
    }))

    setExistingFiles(mappedFiles)

    const editFormData = {
      ...rowData,
      id_don_vi: String(rowData.id_don_vi),
      id_vi_tri_cong_viec: String(rowData.id_vi_tri_cong_viec),
      files_dinh_kem_old: rowData.files
    }
    setBridgedToDrawer(true)
    openPanel({
      title: 'Sửa quá trình công tác',
      content: <FormQuatrinhcongtac formData={editFormData} setFormData={setFormData} onFilesChange={onFilesChange} existingFiles={mappedFiles} />,
      formData: editFormData,
      fileGroups: {},  // Files are synced reactively via updateFileGroups in the useEffect above
      onSubmit: (_id, data) => quatrinhcongtacAxios.update(String(rowData.id_qua_trinh_cong_tac), data!),
      onSubmitSuccess: (response) => {
        const updatedData = response.data
        queryClient.invalidateQueries({ queryKey: ['quatrinhcongtacData'] })
        if (updatedData && typeof updatedData === 'object') {
          setData((prev) =>
            sortData(prev.map((item) =>
              item.id_qua_trinh_cong_tac === (updatedData as QuatrinhcongtacData).id_qua_trinh_cong_tac
                ? (updatedData as QuatrinhcongtacData)
                : item
            ))
          )
        }
        setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        dispatchSectionChanged(SECTION_EVENTS.QUATRINHCONGTAC)
        setFileGroups({})
      }
    })
  }

  // Preview file
  const handlePreview = async (url: string, name: string): Promise<void> => {
    const link = await enscrypt(url, name)
    if (link) {
      openPopout(link, name)
    }
  }

  const gridColumns: DataGridColumn[] = [
    { key: 'ten_don_vi', header: 'Đơn vị', flex: 2 },
    { key: 'ten_cong_viec', header: 'Vị trí công việc', flex: 2 },
    { key: 'ngay_bat_dau', header: 'Ngày bắt đầu', width: 110 },
    { key: 'ngay_ket_thuc', header: 'Ngày kết thúc', width: 110 },
    { key: 'files', header: 'File', flex: 2 },
    { key: 'ghi_chu', header: 'Ghi chú', flex: 2 },
    { key: 'actions', header: 'Thao tác', width: 80, align: 'right' }
  ]

  const renderCell = (row: QuatrinhcongtacData, col: DataGridColumn) => {
    switch (col.key) {
      case 'ten_don_vi':
        return (
          <span className="text-[13.5px] font-medium text-gray-800 truncate block">
            {row.ten_don_vi || '—'}
          </span>
        )
      case 'ten_cong_viec':
        return (
          <span className="text-[13px] text-gray-600 truncate block">
            {row.ten_cong_viec || '—'}
          </span>
        )
      case 'ngay_bat_dau':
      case 'ngay_ket_thuc': {
        const val = row[col.key]
        return (
          <span className="text-[13px] text-gray-500">
            {val && !isNaN(new Date(val).getTime())
              ? new Date(val).toLocaleDateString('vi-VN')
              : '—'}
          </span>
        )
      }
      case 'files': {
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
        } catch (e) {
          files = []
        }

        if (!files?.length) return <span className="text-gray-400">—</span>

        return (
          <div className="flex flex-wrap gap-1">
            {files.map((f, index) => (
              <Chip
                key={(f.file_name || 'file') + index}
                size="sm"
                className="text-[11px] bg-gray-50 border-1 border-gray-200 p-0.5 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  if (f.file_path) {
                    handlePreview(f.file_path, f.file_name || 'document')
                  }
                }}
              >
                <div className="flex gap-1.5 items-center px-1">
                  <OfficeIcon name={f.file_name || 'file'} size={13} />
                  <span className="text-gray-600 max-w-[100px] truncate">
                    {truncateMiddle(f.file_name || 'File')}
                  </span>
                </div>
              </Chip>
            ))}
          </div>
        )
      }
      case 'ghi_chu':
        return (
          <span className="text-[13px] text-gray-500 truncate block">
            {row.ghi_chu || '—'}
          </span>
        )
      case 'actions':
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Tooltip content="Chỉnh sửa" color="primary" closeDelay={0}>
              <button
                type="button"
                onClick={() => handleEdit(row)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <Edit size={15} />
              </button>
            </Tooltip>
            <Tooltip content="Xóa" color="danger" closeDelay={0}>
              <button
                type="button"
                onClick={() => handleDelete(row.id_qua_trinh_cong_tac)}
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
    openPanel({
      title: 'Thêm quá trình công tác',
      content: <FormQuatrinhcongtac formData={addFormData} setFormData={setFormData} onFilesChange={onFilesChange} />,
      formData: addFormData,
      fileGroups: {},  // Files are synced reactively via updateFileGroups in the useEffect above
      onSubmit: (_id, data) => quatrinhcongtacAxios.create(data!),
      onSubmitSuccess: (response) => {
        const newData = response.data
        queryClient.invalidateQueries({ queryKey: ['quatrinhcongtacData'] })
        if (newData && typeof newData === 'object') {
          setData((prev) => sortData([...prev, newData as QuatrinhcongtacData]))
        }
        setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        dispatchSectionChanged(SECTION_EVENTS.QUATRINHCONGTAC)
        setFileGroups({})
      }
    })
  }

  const handleOpenAddRef = useRef(handleOpenAdd)
  const handleEditRef = useRef(handleEdit)
  const handleDeleteRef = useRef(handleDelete)

  useEffect(() => {
    handleOpenAddRef.current = handleOpenAdd
    handleEditRef.current = handleEdit
    handleDeleteRef.current = handleDelete
  })

  // Listen for external "Thêm mới" trigger from FormCollapse header
  useEffect(() => {
    const handler = () => handleOpenAddRef.current()
    window.addEventListener('trigger-add-section-6', handler)
    return () => window.removeEventListener('trigger-add-section-6', handler)
  }, [])

  // Listen for external edit/delete triggers from TabCareer visual cards
  useEffect(() => {
    const editHandler = (e: Event) => {
      const row = (e as CustomEvent).detail
      if (row) handleEditRef.current(row)
    }
    const deleteHandler = (e: Event) => {
      const id = (e as CustomEvent).detail
      if (id) handleDeleteRef.current(id)
    }
    window.addEventListener('trigger-edit-section-6', editHandler)
    window.addEventListener('trigger-delete-section-6', deleteHandler)
    return () => {
      window.removeEventListener('trigger-edit-section-6', editHandler)
      window.removeEventListener('trigger-delete-section-6', deleteHandler)
    }
  }, [])

  return (
    <div className="space-y-4 flex flex-col">
      <div className="justify-between items-center shrink-0 hidden">
        <h3 className="text-lg font-semibold text-gray-700">Quá trình công tác</h3>
        <Button color="primary" size="sm" startContent={<Plus size={16} />} onPress={handleOpenAdd}>
          Thêm mới
        </Button>
      </div>

      <DataGrid<QuatrinhcongtacData>
        columns={gridColumns}
        data={data}
        rowKey={(item) => String(item.id_qua_trinh_cong_tac)}
        renderCell={renderCell}
        emptyText="Chưa có quá trình công tác nào"
      />

      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa quá trình công tác này không? Hành động này không thể hoàn tác."
        isDanger
      />
    </div>
  )
}
