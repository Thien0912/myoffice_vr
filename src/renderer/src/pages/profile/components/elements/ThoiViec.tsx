import { toast } from "@heroui-v3/react"
import { Button, Tooltip, useDisclosure } from '@heroui/react'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import { thoiviecAxios } from '@renderer/api/hr/thoiviecAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { DataGrid, DataGridColumn } from '@renderer/components/DataGrid'
import { useSidePanel } from '@renderer/components/side-panel'
import AddThoiviecModal from '@renderer/pages/hr/thoiviec/AddThoiviecModal'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Trash } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import FormThoiviec from './FormThoiviec'

export interface ThoiViecData {
  id_nhan_vien_thoi_viec?: string | number
  id_nhan_vien: string | number
  id_tttv: string | number
  ngay_thuc_hien?: string
  ngay_hoan_thanh?: string
  trang_thai: string
  ten_thu_tuc?: string
  nhom_thu_tuc?: string
  created_at?: string
}

interface ThoiViecProps {
  thoiviecList?: ThoiViecData[]
  procedureList?: any[]
  user?: {
    id_nhan_vien: string
    id_vi_tri_cong_viec: string
    id_don_vi_cong_tac: string
    ma_nhan_vien: string
    ho_va_ten?: string
  }
  trangThai?: string | any
  onDataChange?: (data: any[]) => void
  capNhatTrangThai: (data?: any) => void
}

export default function ThoiViec({
  thoiviecList,
  user,
  procedureList = [],
  trangThai = '',
  onDataChange,
  capNhatTrangThai
}: ThoiViecProps) {
  const queryClient = useQueryClient()
  const { openPanel } = useSidePanel()

  const [data, setData] = useState<ThoiViecData[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})

  const [deletingId, setDeletingId] = useState<(string | number) | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()
  const {
    isOpen: isOpenCreateConfirm,
    onOpen: onOpenCreateConfirm,
    onClose: onCloseCreateConfirm
  } = useDisclosure()

  const {
    isOpen: isOpenThoiViecForm,
    onOpen: onOpenThoiViecForm,
    onClose: onCloseThoiViecForm
  } = useDisclosure()
  const [formDataThoiViec, setFormDataThoiViec] = useState({
    ngay_lam_chinh_thuc_ket_thuc: '',
    ly_do_thoi_viec: ''
  })

  // Guard ref to prevent infinite loop: prop sync → onDataChange → parent setState → re-render
  const isSyncingFromProp = useRef(false)

  useEffect(() => {
    if (thoiviecList) {
      isSyncingFromProp.current = true
      setData(thoiviecList)
    }
  }, [thoiviecList])

  useEffect(() => {
    if (isSyncingFromProp.current) {
      isSyncingFromProp.current = false
      return
    }
    onDataChange?.(data)
  }, [data])

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        id_nhan_vien: String(user.id_nhan_vien),
        id_tttv: '',
        ngay_hoan_thanh: new Date().toLocaleDateString('en-CA'),
        trang_thai: 'Chua_hoan_thanh'
      }))
    }
  }, [user])

  const handleOpenDrawer = () => {
    const addFormData = {
      id_nhan_vien: String(user?.id_nhan_vien || ''),
      id_tttv: '',
      ngay_hoan_thanh: new Date().toLocaleDateString('en-CA'),
      trang_thai: 'Chua_hoan_thanh'
    }
    setFormData(addFormData)
    openPanel({
      title: 'Thêm thủ tục thôi việc',
      content: <FormThoiviec formData={addFormData} setFormData={setFormData} procedureList={procedureList} />,
      formData: addFormData,
      onSubmit: (_id, _data) =>
        thoiviecAxios.add({
          thu_tuc: [
            {
              id_nhan_vien: String(user?.id_nhan_vien),
              id_tttv: addFormData?.id_tttv || '',
              ngay_hoan_thanh: addFormData?.ngay_hoan_thanh || '',
              trang_thai: addFormData?.trang_thai || ''
            }
          ]
        }),
      onSubmitSuccess: (response) => {
        if (response.data && Array.isArray(response.data)) {
          const newItems = response.data.map((item: any) => {
            const procedure = procedureList?.find(
              (p) => String(p.id_tttv) === String(item.id_tttv)
            )
            return {
              ...item,
              id_nhan_vien_thoi_viec: item.id_nhan_vien_thoi_viec,
              ten_thu_tuc: procedure?.ten_thu_tuc || '',
              nhom_thu_tuc: procedure?.nhom_thu_tuc || ''
            }
          })
          setData((prev) => [...prev, ...newItems])
        }

        if (response.nhan_vien_trang_thai_thoi_viec) {
          const statusInfo = response.nhan_vien_trang_thai_thoi_viec.find(
            (item: any) => String(item.id_nhan_vien) === String(user?.id_nhan_vien)
          )
          if (statusInfo && statusInfo.isNghiViec) {
            capNhatTrangThai('NGHI_VIEC')
          }
        }

        setFormData({
          id_nhan_vien: String(user?.id_nhan_vien || ''),
          id_tttv: '',
          ngay_hoan_thanh: new Date().toLocaleDateString('en-CA'),
          trang_thai: 'Chua_hoan_thanh'
        })
      }
    })
  }

  const handleDelete = (id: string | number) => {
    setDeletingId(id)
    onOpenConfirm()
  }

  const onConfirmCreate = async () => {
    const payload = {
      ...formDataThoiViec,
      id_nhan_vien: user?.id_nhan_vien,
      ho_va_ten: user?.ho_va_ten
    }
    // console.log('formDataThoiViec:', payload)

    const response = await NhansuAxios.resignation(payload)
    // console.log('Resignation response:', response)
    capNhatTrangThai(response.trang_thai)

    onCloseCreateConfirm()
    onCloseThoiViecForm()
    handleOpenDrawer()
  }

  const handleFormSubmit = () => {
    onOpenCreateConfirm()
  }

  const onConfirmDelete = async () => {
    if (!deletingId) return

    try {
      const response = await thoiviecAxios.delete(deletingId)
      if (response.status === 200) {
        if (response.success) {
          toast(response.message || 'Xóa thành công', { variant: 'success' })
          setData((prev) => prev.filter((item) => item.id_nhan_vien_thoi_viec !== deletingId))
          // queryClient.invalidateQueries({ queryKey: ['thoiviecData'] })
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
    { key: 'ten_thu_tuc', header: 'Tên thủ tục', flex: 2 },
    { key: 'nhom_thu_tuc', header: 'Nhóm', flex: 1.5 },
    { key: 'ngay_hoan_thanh', header: 'Ngày hoàn thành', width: 140 },
    { key: 'trang_thai', header: 'Trạng thái', width: 130 },
    { key: 'actions', header: 'Thao tác', width: 60, align: 'center' }
  ]

  const renderCell = (row: ThoiViecData, col: DataGridColumn) => {
    switch (col.key) {
      case 'ten_thu_tuc':
        return (
          <span className="text-[13.5px] font-medium text-gray-800 truncate block">
            {row.ten_thu_tuc || '—'}
          </span>
        )
      case 'nhom_thu_tuc':
        return (
          <span className="text-[13px] text-gray-600 truncate block">
            {row.nhom_thu_tuc || '—'}
          </span>
        )
      case 'ngay_hoan_thanh':
        return (
          <input
            type="date"
            className="w-full bg-transparent text-[13px] text-gray-700 outline-none cursor-pointer border-b border-transparent hover:border-gray-300 focus:border-blue-500 transition-colors"
            value={row.ngay_hoan_thanh || ''}
            onChange={(e) => handleUpdateDate(String(row.id_nhan_vien_thoi_viec), e.target.value)}
          />
        )
      case 'trang_thai':
        return (
          <select
            className={`w-full bg-transparent text-[13px] outline-none cursor-pointer border-b border-transparent hover:border-gray-300 focus:border-blue-500 transition-colors ${row.trang_thai === 'Hoan_thanh' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}`}
            value={row.trang_thai || 'Chua_hoan_thanh'}
            onChange={(e) => handleUpdateStatus(String(row.id_nhan_vien_thoi_viec), e.target.value)}
          >
            <option value="Hoan_thanh" className="text-green-600">Hoàn thành</option>
            <option value="Chua_hoan_thanh" className="text-amber-600">Chưa xong</option>
          </select>
        )
      case 'actions':
        return (
          <div className="flex items-center justify-center">
            <Tooltip content="Xóa" color="danger" closeDelay={0}>
              <button
                type="button"
                onClick={() => handleDelete(row.id_nhan_vien_thoi_viec as any)}
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

  const handleUpdateStatus = async (id: string, status: string) => {
    const procedure = data.find((p) => String(p.id_nhan_vien_thoi_viec) === String(id))
    if (!procedure) {
      console.error('Procedure not found for id:', id)
      return
    }

    // Optimistic update
    const previousData = [...data]
    setData((prev) =>
      prev.map((item) =>
        String(item.id_nhan_vien_thoi_viec) === String(id) ? { ...item, trang_thai: status } : item
      )
    )

    // console.log('Updating status:', { id, status, id_tttv: procedure.id_tttv })
    try {
      const res = await thoiviecAxios.update(id, {
        trang_thai: status,
        id_tttv: procedure.id_tttv
      })
      console.log('Update response:', res)

      if (res.success === false) {
        toast('Lỗi', { description: res.message || 'Có lỗi xảy ra', variant: 'danger' })
        // Revert change
        setData(previousData)
        queryClient.invalidateQueries({ queryKey: ['dataThutuc', user?.id_nhan_vien] })
        return
      }
      toast('Thành công', { description: 'Cập nhật trạng thái thành công', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['dataThutuc', user?.id_nhan_vien] })
      capNhatTrangThai(res.data.trang_thai)
    } catch (error: any) {
      console.error('Update error:', error)
      toast('Lỗi', { description: error.response?.data?.message || error.message || 'Có lỗi xảy ra', variant: 'danger' })
      // Revert change
      setData(previousData)
      queryClient.invalidateQueries({ queryKey: ['dataThutuc', user?.id_nhan_vien] })
    }
  }

  const handleUpdateDate = async (id: string, date: any) => {
    const procedure = data.find((p) => p.id_nhan_vien_thoi_viec === id)
    if (!procedure) return

    // Format date YYYY-MM-DD for API
    // Kiểm tra nếu date là object CalendarDate (có year, month, day)
    let formattedDate: string | null = null
    if (date && typeof date === 'object' && 'year' in date) {
      formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    } else if (typeof date === 'string') {
      // Trường hợp date là string (vd: từ input type="date" hoặc đã format)
      formattedDate = date
    }

    // console.log('Updating date:', { id, rawDate: date, formattedDate, id_tttv: procedure.id_tttv })

    try {
      const res = await thoiviecAxios.update(id, {
        ngay_hoan_thanh: formattedDate,
        id_tttv: procedure.id_tttv
      })

      if (res.success === false) {
        toast('Lỗi', { description: res.message || 'Có lỗi xảy ra', variant: 'danger' })
        queryClient.invalidateQueries({ queryKey: ['dataThutuc', user?.id_nhan_vien] })
        return
      }
      toast('Thành công', { description: 'Cập nhật ngày hoàn thành thành công', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['dataThutuc', user?.id_nhan_vien] })
    } catch (error: any) {
      console.error('Update date error:', error)
      toast('Lỗi', { description: error.response?.data?.message || error.message || 'Có lỗi xảy ra', variant: 'danger' })
      queryClient.invalidateQueries({ queryKey: ['dataThutuc', user?.id_nhan_vien] })
    }
  }

  // Listen for external "Thêm mới" trigger from FormCollapse header
  useEffect(() => {
    const handler = () => {
      if (trangThai == 'DANG_LAM_THU_TUC_THOI_VIEC') {
        handleOpenDrawer()
      } else {
        onOpenThoiViecForm()
      }
    }
    window.addEventListener('trigger-add-section-13', handler)
    return () => window.removeEventListener('trigger-add-section-13', handler)
  }, [user, trangThai])

  return (
    <div className="space-y-4 flex flex-col">
      <div className="justify-between items-center shrink-0 hidden">
        <h3 className="text-lg font-semibold text-gray-700">Thủ tục thôi việc</h3>
        {trangThai !== 'NGHI_VIEC' && (
          <Button
            color="primary"
            size="sm"
            startContent={<Plus size={16} />}
            onPress={() => {
              if (trangThai == 'DANG_LAM_THU_TUC_THOI_VIEC') {
                handleOpenDrawer()
              } else {
                onOpenThoiViecForm()
              }
            }}
          >
            Thêm mới
          </Button>
        )}
      </div>

      <DataGrid<ThoiViecData>
        columns={gridColumns}
        data={data}
        rowKey={(item) => String(item.id_nhan_vien_thoi_viec)}
        renderCell={renderCell}
        emptyText="Chưa có thủ tục thôi việc"
      />



      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa thủ tục này không?"
        isDanger
      />

      <AddThoiviecModal
        isOpen={isOpenThoiViecForm}
        onOpenChange={(open) => {
          if (open) {
            onOpenThoiViecForm()
          } else {
            onCloseThoiViecForm()
          }
        }}
        employee={user}
        onSuccess={(response) => {
          console.log('response', response)
          capNhatTrangThai(response.trang_thai)

          onCloseThoiViecForm()
          handleOpenDrawer()
        }}
      />
    </div>
  )
}
