import { toast } from "@heroui-v3/react"
import { Button, Chip, Tooltip, useDisclosure } from '@heroui/react'
import { kinhnghiemlamviecAxios } from '@renderer/api/hr/kinhnghiemlamviecAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { DataGrid, DataGridColumn } from '@renderer/components/DataGrid'
import { useSidePanel } from '@renderer/components/side-panel'
import { useQueryClient } from '@tanstack/react-query'
import { Edit, Plus, Trash } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { dispatchSectionChanged, SECTION_EVENTS } from '../../constants/sectionEvents'
import FormKinhnghiemlamviec from './FormKinhnghiemlamviec'

interface KinhnghiemData {
  id_kinh_nghiem: string | number
  id_nhan_vien: string | number
  ten_cong_ty: string
  ngay_bat_dau: string
  ngay_ket_thuc: string
  mo_ta: string
  la_kinh_nghiem_noi_bo: boolean | string | number
  chuc_danh: string
}

interface KinhnghiemProps {
  kinhnghiemList?: KinhnghiemData[]
  user?: {
    id_nhan_vien: string
  }
}

export default function Kinhnghiemlamviec({ kinhnghiemList, user }: KinhnghiemProps) {
  const queryClient = useQueryClient()
  const { openPanel, setBridgedToDrawer } = useSidePanel()

  const [data, setData] = useState<KinhnghiemData[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})

  const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

  useEffect(() => {
    if (kinhnghiemList) {
      setData(kinhnghiemList)
    }
  }, [kinhnghiemList])

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

  const onConfirmDelete = async () => {
    if (!deletingId) return
    const payload = Array.isArray(deletingId) ? deletingId : [deletingId]

    try {
      const response = await kinhnghiemlamviecAxios.delete({ ids: payload })
      if (response.success) {
        toast(response.message || 'Xóa kinh nghiệm thành công', { variant: 'success' })
        // setData((prev) => prev.filter((item) => !payload.some((id) => String(id) === String(item.id_kinh_nghiem))))
        setData((prev) => prev.filter((item) => !payload.includes(item.id_kinh_nghiem)))
        queryClient.invalidateQueries({ queryKey: ['kinhnghiemData'] })
        dispatchSectionChanged(SECTION_EVENTS.KINHNGHIEM)
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

  const handleEdit = async (row: KinhnghiemData) => {
    let rowData = row
    try {
      const res = await kinhnghiemlamviecAxios.show(row.id_kinh_nghiem)
      if (res.success && res.data) {
        rowData = res.data
      }
    } catch (e) {
      console.error('Error fetching detail', e)
    }

    const editFormData = { ...rowData, la_kinh_nghiem_noi_bo: Boolean(rowData.la_kinh_nghiem_noi_bo) }
    setFormData(editFormData)
    setBridgedToDrawer(true)
    openPanel({
      title: 'Sửa kinh nghiệm',
      content: <FormKinhnghiemlamviec formData={editFormData} setFormData={setFormData} />,
      formData: editFormData,
      onSubmit: (_id, data) => kinhnghiemlamviecAxios.update(String(rowData.id_kinh_nghiem), data!),
      onSubmitSuccess: (response) => {
        const updatedData = response.data
        queryClient.invalidateQueries({ queryKey: ['kinhnghiemData'] })
        if (updatedData && typeof updatedData === 'object') {
          setData((prev) => prev.map((item) => item.id_kinh_nghiem === (updatedData as KinhnghiemData).id_kinh_nghiem ? (updatedData as KinhnghiemData) : item))
        }
        setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        dispatchSectionChanged(SECTION_EVENTS.KINHNGHIEM)
      }
    })
  }

  const gridColumns: DataGridColumn[] = [
    { key: 'ten_cong_ty', header: 'Công ty', flex: 2 },
    { key: 'chuc_danh', header: 'Chức danh', flex: 2 },
    { key: 'thoi_gian', header: 'Thời gian', width: 200 },
    { key: 'la_kinh_nghiem_noi_bo', header: 'Loại', width: 120, align: 'center' },
    { key: 'mo_ta', header: 'Mô tả', flex: 2 },
    { key: 'actions', header: 'Thao tác', width: 80, align: 'right' }
  ]

  const renderCell = (row: KinhnghiemData, col: DataGridColumn) => {
    switch (col.key) {
      case 'ten_cong_ty':
        return (
          <span className="text-[13.5px] font-medium text-gray-800 truncate block">
            {row.ten_cong_ty || '—'}
          </span>
        )
      case 'chuc_danh':
        return (
          <span className="text-[13px] text-gray-600 truncate block">
            {row.chuc_danh || '—'}
          </span>
        )
      case 'thoi_gian': {
        const start = row.ngay_bat_dau
          ? new Date(row.ngay_bat_dau).toLocaleDateString('vi-VN')
          : '...'
        const end = row.ngay_ket_thuc
          ? new Date(row.ngay_ket_thuc).toLocaleDateString('vi-VN')
          : 'Hiện tại'
        return (
          <span className="text-[13px] text-gray-600">
            {start} - {end}
          </span>
        )
      }
      case 'la_kinh_nghiem_noi_bo':
        return row.la_kinh_nghiem_noi_bo == 1 ? (
          <Chip size="sm" color="primary" variant="flat" className="text-[11px] h-5">
            Nội bộ
          </Chip>
        ) : (
          <Chip size="sm" variant="flat" className="text-[11px] h-5">
            Bên ngoài
          </Chip>
        )
      case 'mo_ta':
        return (
          <span className="text-[13px] text-gray-500 truncate block">
            {row.mo_ta || '—'}
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
                onClick={() => handleDelete(row.id_kinh_nghiem)}
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
      title: 'Thêm kinh nghiệm',
      content: <FormKinhnghiemlamviec formData={addFormData} setFormData={setFormData} />,
      formData: addFormData,
      onSubmit: (_id, data) => kinhnghiemlamviecAxios.create(data!),
      onSubmitSuccess: (response) => {
        const newData = response.data
        queryClient.invalidateQueries({ queryKey: ['kinhnghiemData'] })
        if (newData && typeof newData === 'object') {
          setData((prev) => [...prev, newData as KinhnghiemData])
        }
        setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        dispatchSectionChanged(SECTION_EVENTS.KINHNGHIEM)
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

  useEffect(() => {
    const handler = () => handleOpenAddRef.current()
    window.addEventListener('trigger-add-section-8', handler)
    return () => window.removeEventListener('trigger-add-section-8', handler)
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
    window.addEventListener('trigger-edit-section-8', editHandler)
    window.addEventListener('trigger-delete-section-8', deleteHandler)
    return () => {
      window.removeEventListener('trigger-edit-section-8', editHandler)
      window.removeEventListener('trigger-delete-section-8', deleteHandler)
    }
  }, [])

  return (
    <div className="space-y-4 flex flex-col">
      <div className="justify-between items-center shrink-0 hidden">
        <h3 className="text-lg font-semibold text-gray-700">Kinh nghiệm làm việc</h3>
        <Button color="primary" size="sm" startContent={<Plus size={16} />} onPress={handleOpenAdd}>
          Thêm mới
        </Button>
      </div>

      <DataGrid<KinhnghiemData>
        columns={gridColumns}
        data={data}
        rowKey={(item) => String(item.id_kinh_nghiem)}
        renderCell={renderCell}
        emptyText="Chưa có kinh nghiệm làm việc nào"
      />

      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa kinh nghiệm này không? Hành động này không thể hoàn tác."
        isDanger
      />
    </div>
  )
}
