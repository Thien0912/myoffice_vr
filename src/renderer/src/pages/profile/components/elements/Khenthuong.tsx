import { toast } from "@heroui-v3/react"
import { Button, Tooltip, useDisclosure } from '@heroui/react'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import { khenthuongAxios } from '@renderer/api/hr/khenthuongAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import DataGrid, { DataGridColumn } from '@renderer/components/DataGrid'
import { useSidePanel } from '@renderer/components/side-panel'
import { NguoiDung } from '@renderer/shared/CommonInterface'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dispatchSectionChanged, SECTION_EVENTS } from '../../constants/sectionEvents'
import FormKhenthuong from './FormKhenthuong'

export interface KhenthuongData {
  id?: string | number // Fallback for legacy data
  id_nhan_vien: string | number
  ten_thuong: string
  created_at?: string
  deleted_at?: string
  dieu_kien_xet?: string
  id_thuong?: string
  loai_thuong: string
  so_tien: string | number
  tham_nien_tai_thoi_diem: string
  trang_thai: string
  updated_at: string
}

interface KhenthuongProps {
  khenthuongList?: KhenthuongData[]
  user?: {
    id_nhan_vien: string
    id_vi_tri_cong_viec: string
    id_don_vi_cong_tac: string
    ma_nhan_vien: string
  }
}

export default function Khenthuong({ khenthuongList, user }: KhenthuongProps) {
  const queryClient = useQueryClient()
  const { openPanel } = useSidePanel()

  const [data, setData] = useState<KhenthuongData[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [allUser, setAllUser] = useState<NguoiDung[]>([])

  const [deletingId, setDeletingId] = useState<(string | number) | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

  useEffect(() => {
    if (khenthuongList) {
      setData(khenthuongList)
    }
  }, [khenthuongList])

  useEffect(() => {
    const fetchUser = async () => {
      const formData = new FormData()
      formData.append('start', '0')
      formData.append('length', '9999')

      const response = await NhansuAxios.fetch(formData)

      if (response.status == 200) {
        setAllUser(response.data.data || [])
      }
    }
    fetchUser()

    if (user) {
      setFormData((prev) => ({
        ...prev,
        ids_nhan_vien: String(user.id_nhan_vien),
        id_nhan_vien_hien_tai: String(user.id_nhan_vien)
      }))
    }
  }, [user])

  const handleDelete = (id: string | number) => {
    setDeletingId(id)
    onOpenConfirm()
  }

  const onConfirmDelete = async () => {
    if (!deletingId) return
    const payload = Array.isArray(deletingId) ? deletingId : [deletingId]

    try {
      const response = await khenthuongAxios.delete({ ids: payload })
      if (response.status === 200) {
        if (response.success) {
          toast(response.message || 'Xóa khen thưởng thành công', { variant: 'success' })
          setData((prev) => prev.filter((item) => !payload.includes(item.id as string | number)))
          queryClient.invalidateQueries({ queryKey: ['khenthuongData'] })
          dispatchSectionChanged(SECTION_EVENTS.KHENTHUONG)
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

  const gridColumns: DataGridColumn[] = [
    { key: 'ten_thuong', header: 'Tên thưởng', flex: 2 },
    { key: 'loai_thuong', header: 'Loại thưởng', flex: 2 },
    { key: 'so_tien', header: 'Số tiền', width: 120 },
    { key: 'trang_thai', header: 'Trạng thái', width: 120, align: 'center' },
    { key: 'created_at', header: 'Ngày tạo', width: 100 },
    { key: 'actions', header: 'Thao tác', width: 80, align: 'right' },
  ]

  const renderCell = (row: KhenthuongData, col: DataGridColumn) => {
    const statusMap: Record<string, string> = {
      chua_duyet: 'Chưa duyệt',
      da_duyet: 'Đã duyệt',
      tu_choi: 'Từ chối'
    }
    switch (col.key) {
      case 'ten_thuong':
        return (
          <span className="text-[13.5px] font-medium text-gray-800 truncate block">
            {row.ten_thuong || '—'}
          </span>
        )
      case 'loai_thuong':
        return (
          <span className="text-[13px] text-gray-600 truncate block">
            {row.loai_thuong || '—'}
          </span>
        )
      case 'so_tien':
        return (
          <span className="text-[13px] text-gray-700 font-medium">
            {row.so_tien
              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(row.so_tien))
              : '0 đ'}
          </span>
        )
      case 'trang_thai':
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${row.trang_thai === 'da_duyet'
              ? 'bg-green-100 text-green-700'
              : row.trang_thai === 'chua_duyet'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
              }`}
          >
            {statusMap[row.trang_thai] || row.trang_thai || '—'}
          </span>
        )
      case 'created_at':
        return (
          <span className="text-[13px] text-gray-500">
            {row.created_at && !isNaN(new Date(row.created_at).getTime())
              ? new Date(row.created_at).toLocaleDateString('vi-VN')
              : '—'}
          </span>
        )
      case 'actions':
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Tooltip content="Xóa" color="danger" closeDelay={0}>
              <button
                type="button"
                onClick={() => handleDelete(row.id_thuong || (row as any).id)}
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
    const addFormData = { ids_nhan_vien: String(user?.id_nhan_vien || ''), id_nhan_vien_hien_tai: String(user?.id_nhan_vien || '') }
    setFormData(addFormData)
    openPanel({
      title: 'Thêm khen thưởng',
      content: <FormKhenthuong formData={addFormData} setFormData={setFormData} allUser={allUser} />,
      formData: addFormData,
      onSubmit: (_id, data) => khenthuongAxios.create(data!),
      onSubmitSuccess: (response) => {
        let newData = response.data
        let item = {} as any
        if (Array.isArray(newData)) {
          item = newData.find((nd: any) => nd.id_nhan_vien == String(user?.id_nhan_vien))
        }
        setData((prev) => [...prev, item as KhenthuongData])
        setFormData({ ids_nhan_vien: String(user?.id_nhan_vien || '') })
        dispatchSectionChanged(SECTION_EVENTS.KHENTHUONG)
      }
    })
  }

  useEffect(() => {
    const handler = () => handleOpenAdd()
    window.addEventListener('trigger-add-section-12', handler)
    return () => window.removeEventListener('trigger-add-section-12', handler)
  }, [user])

  return (
    <div className="space-y-4 flex flex-col">
      <div className="justify-between items-center shrink-0 hidden">
        <h3 className="text-lg font-semibold text-gray-700">Danh sách khen thưởng</h3>
        <Button color="primary" size="sm" startContent={<Plus size={16} />} onPress={handleOpenAdd}>
          Thêm mới
        </Button>
      </div>

      <DataGrid<KhenthuongData>
        columns={gridColumns}
        data={data}
        rowKey={(item) => String(item.id_thuong || (item as any).id || '')}
        renderCell={renderCell}
        emptyText="Chưa có khen thưởng nào"
      />



      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa khen thưởng này không? Hành động này không thể hoàn tác."
        isDanger
      />
    </div>
  )
}
