import { toast } from "@heroui-v3/react"
import { Button, Tooltip, useDisclosure } from '@heroui/react'
import { danhgianhansuAxios } from '@renderer/api/hr/danhgianhansuAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import DataGrid, { DataGridColumn } from '@renderer/components/DataGrid'
import { useSidePanel } from '@renderer/components/side-panel'
import { useQueryClient } from '@tanstack/react-query'
import { Edit, Plus, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dispatchSectionChanged, SECTION_EVENTS } from '../../constants/sectionEvents'
import FormDanhgia from './FormDanhgia'

interface DanhgiaData {
  id_danh_gia_nhan_su: string | number
  id_nhan_vien: string | number
  diem_so: string | number
  nhan_xet: string
  thang: string
}

interface DanhgiaProps {
  danhgiaList?: DanhgiaData[]
  user?: {
    id_nhan_vien: string
    id_vi_tri_cong_viec: string
    id_don_vi_cong_tac: string
    ma_nhan_vien: string
  }
}

export default function Danhgia({ danhgiaList, user }: DanhgiaProps) {
  const queryClient = useQueryClient()
  const { openPanel, setBridgedToDrawer } = useSidePanel()

  const [data, setData] = useState<DanhgiaData[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [editingId, setEditingId] = useState<string | number | null>(null)

  const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

  useEffect(() => {
    if (danhgiaList) {
      setData(danhgiaList)
    }
  }, [danhgiaList])

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
      const response = await danhgianhansuAxios.delete({ ids: payload })
      if (response.status === 200) {
        if (response.success) {
          toast(response.message || 'Xóa đánh giá thành công', { variant: 'success' })
          setData((prev) => prev.filter((item) => !payload.includes(item.id_danh_gia_nhan_su)))
          queryClient.invalidateQueries({ queryKey: ['danhgiaData'] })
          dispatchSectionChanged(SECTION_EVENTS.DANHGIA)
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

  const handleEdit = async (row: DanhgiaData) => {
    let rowData = row
    try {
      const res = await danhgianhansuAxios.show(row.id_danh_gia_nhan_su)
      if (res.success && res.data) {
        rowData = res.data
      }
    } catch (e) {
      console.error('Error fetching detail', e)
    }

    setEditingId(rowData.id_danh_gia_nhan_su)
    const editFormData = { ...rowData }
    setFormData(editFormData)

    setBridgedToDrawer(true)
    openPanel({
      title: 'Sửa đánh giá',
      content: <FormDanhgia formData={editFormData} setFormData={setFormData} />,
      formData: editFormData,
      onSubmit: (_id, data) => danhgianhansuAxios.update(String(rowData.id_danh_gia_nhan_su), data!),
      onSubmitSuccess: (response) => {
        const updatedData = response.data
        queryClient.invalidateQueries({ queryKey: ['danhgiaData'] })
        if (updatedData && typeof updatedData === 'object') {
          setData((prev) =>
            prev.map((item) =>
              item.id_danh_gia_nhan_su === (updatedData as DanhgiaData).id_danh_gia_nhan_su
                ? (updatedData as DanhgiaData)
                : item
            )
          )
        }
        setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        dispatchSectionChanged(SECTION_EVENTS.DANHGIA)
      }
    })
  }

  const gridColumns: DataGridColumn[] = [
    { key: 'thang', header: 'Tháng', width: 100 },
    { key: 'diem_so', header: 'Điểm số', width: 80 },
    { key: 'nhan_xet', header: 'Nhận xét', flex: 3 },
    { key: 'actions', header: 'Thao tác', width: 100, align: 'right' },
  ]

  const renderCell = (row: DanhgiaData, col: DataGridColumn) => {
    switch (col.key) {
      case 'thang':
        return (
          <span className="text-[13px] text-gray-600">
            {row.thang && !isNaN(new Date(row.thang).getTime())
              ? new Date(row.thang).toLocaleDateString('vi-VN')
              : '—'}
          </span>
        )
      case 'diem_so':
        return (
          <span className="text-[13.5px] font-semibold text-gray-800">
            {row.diem_so ?? '—'}
          </span>
        )
      case 'nhan_xet':
        return (
          <span className="text-[13px] text-gray-600 truncate block">
            {row.nhan_xet || '—'}
          </span>
        )
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
                onClick={() => handleDelete(row.id_danh_gia_nhan_su)}
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
      title: 'Thêm đánh giá',
      content: <FormDanhgia formData={addFormData} setFormData={setFormData} />,
      formData: addFormData,
      onSubmit: (_id, data) => danhgianhansuAxios.create(data!),
      onSubmitSuccess: (response) => {
        const newData = response.data
        queryClient.invalidateQueries({ queryKey: ['danhgiaData'] })
        if (newData && typeof newData === 'object') {
          setData((prev) => [...prev, newData as DanhgiaData])
        }
        setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        dispatchSectionChanged(SECTION_EVENTS.DANHGIA)
      }
    })
  }

  useEffect(() => {
    const handler = () => handleOpenAdd()
    window.addEventListener('trigger-add-section-7', handler)
    return () => window.removeEventListener('trigger-add-section-7', handler)
  }, [user])

  return (
    <div className="space-y-4 flex flex-col">
      <div className="justify-between items-center shrink-0 hidden">
        <h3 className="text-lg font-semibold text-gray-700">Đánh giá nhân sự</h3>
        <Button color="primary" size="sm" startContent={<Plus size={16} />} onPress={handleOpenAdd}>
          Thêm mới
        </Button>
      </div>

      <DataGrid<DanhgiaData>
        columns={gridColumns}
        data={data}
        rowKey="id_danh_gia_nhan_su"
        renderCell={renderCell}
        emptyText="Chưa có đánh giá nào"
      />



      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác."
        isDanger
      />
    </div>
  )
}
