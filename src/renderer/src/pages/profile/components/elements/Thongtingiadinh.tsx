import { toast } from "@heroui-v3/react"
import { Button, Tooltip, useDisclosure } from '@heroui/react'
import { thongtingiadinhAxios } from '@renderer/api/hr/thongtingiadinhAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { DataGrid, DataGridColumn } from '@renderer/components/DataGrid'
import { useSidePanel } from '@renderer/components/side-panel'
import { useQueryClient } from '@tanstack/react-query'
import { Edit, Plus, Trash } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { dispatchSectionChanged, SECTION_EVENTS } from '../../constants/sectionEvents'
import FormThongtingiadinh from './FormThontingiadinh'

interface ThongtingiadinhData {
  id_thong_tin_gia_dinh: string | number
  id_nhan_vien: string | number
  ho_ten: string
  ngay_sinh: string | null
  nam_sinh: string
  gioi_tinh: string | number
  moi_quan_he: string
  nghe_nghiep: string
  so_dien_thoai: string
}

interface ThongtingiadinhProps {
  list?: ThongtingiadinhData[]
  user?: {
    id_nhan_vien: string
  }
}

export default function Thongtingiadinh({ list, user }: ThongtingiadinhProps) {
  const queryClient = useQueryClient()
  const { openPanel, closePanel, updateFormData, setBridgedToDrawer } = useSidePanel()

  const [columnWidths, setColumnWidth] = useState<Record<string, number>>({})
  const [sortDescriptors, setSortDescriptors] = useState<any[]>([])
  const [, setPinnedColumn] = useState<string[]>([])

  const [data, setData] = useState<ThongtingiadinhData[]>([])
  const [, setFormDataLocal] = useState<Record<string, any>>({})
  const [editingId, setEditingId] = useState<string | number | null>(null)

  // Sync local formData to SidePanel context so handleSubmit gets the latest data
  const setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>> = useCallback((action) => {
    setFormDataLocal((prev) => {
      const next = typeof action === 'function' ? action(prev) : action
      updateFormData(next)
      return next
    })
  }, [updateFormData])

  const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

  useEffect(() => {
    if (list) {
      setData(list)
    }
  }, [list])

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
      const response = await thongtingiadinhAxios.delete({ ids: payload })
      if (response.success) {
        toast(response.message || 'Xóa thông tin thành công', { variant: 'success' })
        setData((prev) => prev.filter((item) => !payload.includes(item.id_thong_tin_gia_dinh)))
        queryClient.invalidateQueries({ queryKey: ['thongtingiadinhData'] })
        dispatchSectionChanged(SECTION_EVENTS.THONGTINGIADINH)
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

  const handleOpenAdd = () => {
    const addFormData = { id_nhan_vien: String(user?.id_nhan_vien || '') }
    setFormData(addFormData)
    openPanel({
      title: 'Thêm thông tin gia đình',
      content: <FormThongtingiadinh formData={addFormData} setFormData={setFormData} />,
      formData: addFormData,
      onSubmit: (_id, data) => thongtingiadinhAxios.create(data!),
      onSubmitSuccess: (response) => {
        const newData = response.data
        queryClient.invalidateQueries({ queryKey: ['thongtingiadinhData'] })
        if (newData && typeof newData === 'object') {
          setData((prev) => [...prev, newData as ThongtingiadinhData])
        }
        setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        dispatchSectionChanged(SECTION_EVENTS.THONGTINGIADINH)
      }
    })
  }

  const handleEdit = async (row: ThongtingiadinhData) => {
    let rowData = row
    try {
      const res = await thongtingiadinhAxios.show(row.id_thong_tin_gia_dinh)
      if (res.success && res.data) rowData = res.data
    } catch (e) {
      console.error('Error fetching detail', e)
    }

    setEditingId(rowData.id_thong_tin_gia_dinh)
    setFormData(rowData)
    // Signal the dual drawer bridge BEFORE openPanel so HrDrawer secondary picks it up
    setBridgedToDrawer(true)
    openPanel({
      title: 'Sửa thông tin gia đình',
      content: <FormThongtingiadinh formData={rowData} setFormData={setFormData} />,
      formData: rowData as Record<string, any>,
      onSubmit: (_id, data) => thongtingiadinhAxios.update(String(rowData.id_thong_tin_gia_dinh), data!),
      onSubmitSuccess: (response) => {
        const updatedData = response.data
        queryClient.invalidateQueries({ queryKey: ['thongtingiadinhData'] })
        if (updatedData && typeof updatedData === 'object') {
          setData((prev) =>
            prev.map((item) =>
              item.id_thong_tin_gia_dinh === (updatedData as ThongtingiadinhData).id_thong_tin_gia_dinh
                ? (updatedData as ThongtingiadinhData)
                : item
            )
          )
        }
        setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        dispatchSectionChanged(SECTION_EVENTS.THONGTINGIADINH)
      }
    })
  }

  // Listen for external "Thêm mới" trigger from FormCollapse header
  useEffect(() => {
    const handler = () => handleOpenAdd()
    window.addEventListener('trigger-add-section-4', handler)
    return () => window.removeEventListener('trigger-add-section-4', handler)
  }, [user])

  const gridColumns: DataGridColumn[] = [
    { key: 'ho_ten', header: 'Họ và tên', flex: 2 },
    { key: 'moi_quan_he', header: 'Mối quan hệ', flex: 1.5 },
    { key: 'nam_sinh', header: 'Năm sinh', width: 90 },
    { key: 'gioi_tinh', header: 'Giới tính', width: 90 },
    { key: 'nghe_nghiep', header: 'Nghề nghiệp', flex: 2 },
    { key: 'so_dien_thoai', header: 'SĐT', width: 120 },
    { key: 'actions', header: 'Thao tác', width: 80, align: 'right' }
  ]

  const renderCell = (row: ThongtingiadinhData, col: DataGridColumn) => {
    switch (col.key) {
      case 'ho_ten':
        return (
          <span className="text-[13.5px] font-medium text-gray-800 truncate block">
            {row.ho_ten || '—'}
          </span>
        )
      case 'moi_quan_he':
        return (
          <span className="text-[13px] text-gray-600 truncate block">
            {row.moi_quan_he || '—'}
          </span>
        )
      case 'nam_sinh':
        return (
          <span className="text-[13px] text-gray-500">
            {row.nam_sinh || (row.ngay_sinh ? new Date(row.ngay_sinh).getFullYear() : '—')}
          </span>
        )
      case 'gioi_tinh':
        return (
          <span className="text-[13px] text-gray-500">
            {String(row.gioi_tinh) === '1' ? 'Nam' : String(row.gioi_tinh) === '0' ? 'Nữ' : '—'}
          </span>
        )
      case 'nghe_nghiep':
        return (
          <span className="text-[13px] text-gray-500 truncate block">
            {row.nghe_nghiep || '—'}
          </span>
        )
      case 'so_dien_thoai':
        return (
          <span className="text-[13px] text-gray-500">
            {row.so_dien_thoai || '—'}
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
                onClick={() => handleDelete(row.id_thong_tin_gia_dinh)}
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
    <div className="space-y-4 flex flex-col">
      <div className="justify-between items-center shrink-0 hidden">
        <h3 className="text-lg font-semibold text-gray-700">Thông tin gia đình</h3>
        <Button color="primary" size="sm" startContent={<Plus size={16} />} onPress={handleOpenAdd}>
          Thêm mới
        </Button>
      </div>

      <DataGrid<ThongtingiadinhData>
        columns={gridColumns}
        data={data}
        rowKey={(item) => String(item.id_thong_tin_gia_dinh)}
        renderCell={renderCell}
        emptyText="Chưa có thông tin gia đình"
      />

      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa thông tin này không? Hành động này không thể hoàn tác."
        isDanger
      />
    </div>
  )
}
