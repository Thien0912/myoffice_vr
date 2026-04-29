import { toast } from "@heroui-v3/react"
import { Button, Chip, Tooltip, useDisclosure } from '@heroui/react'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import { quatrinhdaotaoAxios } from '@renderer/api/hr/quatrinhdaotaoAxios'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { DataGrid, DataGridColumn } from '@renderer/components/DataGrid'
import { useSidePanel } from '@renderer/components/side-panel'
import { NguoiDung } from '@renderer/shared/CommonInterface'
import { Edit, Plus, Trash } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { dispatchSectionChanged, SECTION_EVENTS } from '../../constants/sectionEvents'
import FormQuatrinhdaotao from './FormQuatrinhdaotao'

interface QuatrinhdaotaoData {
  id_nhan_vien_dao_tao: string | number
  id_nhan_vien: string | number
  id_dao_tao: string | number
  ket_qua: string
  ten_khoa_hoc: string
  noi_dung: string
  ngay_bat_dau: string
  ngay_ket_thuc: string
  trang_thai: string
}

interface QuatrinhdaotaoProps {
  quatrinhdaotaoList?: QuatrinhdaotaoData[]
  user?: {
    id_nhan_vien: string
    id_vi_tri_cong_viec: string
    id_don_vi_cong_tac: string
    ma_nhan_vien: string
  }
}

export default function Quatrinhdaotao({ quatrinhdaotaoList, user }: QuatrinhdaotaoProps) {
  const { openPanel, setBridgedToDrawer } = useSidePanel()
  const [data, setData] = useState<QuatrinhdaotaoData[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [allUser, setAllUser] = useState<NguoiDung[]>([])

  const [deletingId, setDeletingId] = useState<(string | number) | (string | number)[] | null>(null)
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure()

  useEffect(() => {
    if (quatrinhdaotaoList) {
      setData(quatrinhdaotaoList)
    }
  }, [quatrinhdaotaoList])

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

  const handleDelete = (ids: (string | number) | (string | number)[]) => {
    setDeletingId(ids)
    onOpenConfirm()
  }

  const onConfirmDelete = async () => {
    if (!deletingId) return
    const payload = Array.isArray(deletingId) ? deletingId : [deletingId]

    try {
      const response = await quatrinhdaotaoAxios.delete({ ids: payload })
      if (response.status === 200) {
        if (response.success) {
          toast(response.message || 'Xóa đào tạo thành công', { variant: 'success' })
          setData((prev) => prev.filter((item) => !payload.includes(item.id_nhan_vien_dao_tao)))
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

  const handleEdit = async (row: QuatrinhdaotaoData) => {
    let rowData = row
    console.log(row)
    try {
      const res = await quatrinhdaotaoAxios.show(row.id_nhan_vien_dao_tao)
      if (res.success && res.data) {
        rowData = res.data
      }
    } catch (e) {
      console.error('Error fetching detail', e)
    }

    const editFormData = { ...rowData, is_edit: true }
    setFormData(editFormData)
    setBridgedToDrawer(true)
    openPanel({
      title: 'Sửa đào tạo',
      content: <FormQuatrinhdaotao formData={editFormData} setFormData={setFormData} allUser={allUser} />,
      formData: editFormData,
      onSubmit: (_id, data) => quatrinhdaotaoAxios.update(String(rowData.id_nhan_vien_dao_tao), data!),
      onSubmitSuccess: (response) => {
        const updatedData = response.data?.data
        if (updatedData && typeof updatedData === 'object') {
          setData((prev) => prev.map((item) => item.id_nhan_vien_dao_tao === (updatedData as QuatrinhdaotaoData).id_nhan_vien_dao_tao ? { ...item, ket_qua: (updatedData as QuatrinhdaotaoData).ket_qua } : item))
        }
        setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        dispatchSectionChanged(SECTION_EVENTS.QUATRINHDAOTAO)
      }
    })
  }

  const gridColumns: DataGridColumn[] = [
    { key: 'thoi_gian', header: 'Thời gian', width: 180 },
    { key: 'ten_khoa_hoc', header: 'Tên khóa học', flex: 2 },
    { key: 'noi_dung', header: 'Nội dung', flex: 2 },
    { key: 'trang_thai', header: 'Trạng thái', width: 140 },
    { key: 'ket_qua', header: 'Kết quả', width: 140 },
    { key: 'actions', header: 'Thao tác', width: 80, align: 'right' }
  ]

  const renderCell = (row: QuatrinhdaotaoData, col: DataGridColumn) => {
    switch (col.key) {
      case 'thoi_gian':
        return (
          <span className="text-[13px] text-gray-500">
            {row.ngay_bat_dau ? new Date(row.ngay_bat_dau).toLocaleDateString('vi-VN') : '...'} -{' '}
            {row.ngay_ket_thuc ? new Date(row.ngay_ket_thuc).toLocaleDateString('vi-VN') : '...'}
          </span>
        )
      case 'ten_khoa_hoc':
        return (
          <span className="text-[13.5px] font-medium text-gray-800 truncate block">
            {row.ten_khoa_hoc || '—'}
          </span>
        )
      case 'noi_dung':
        return (
          <span className="text-[13px] text-gray-500 truncate block">
            {row.noi_dung || '—'}
          </span>
        )
      case 'trang_thai': {
        const map: Record<string, { label: string; color: string; bg: string }> = {
          Dang_dien_ra: { label: 'Đang diễn ra', color: 'text-blue-700', bg: 'bg-blue-50' },
          Hoan_thanh: { label: 'Hoàn thành', color: 'text-green-700', bg: 'bg-green-50' },
          Chua_dien_ra: { label: 'Chưa diễn ra', color: 'text-gray-700', bg: 'bg-gray-50' },
          Huy_bo: { label: 'Hủy bỏ', color: 'text-red-700', bg: 'bg-red-50' }
        }
        const state = map[row.trang_thai]
        if (!state) return <span className="text-[13px] text-gray-500">{row.trang_thai || '—'}</span>
        return (
          <Chip size="sm" classNames={{ base: `border-none ${state.bg}`, content: `${state.color} font-medium text-[11px]` }}>
            {state.label}
          </Chip>
        )
      }
      case 'ket_qua': {
        const map: Record<string, { label: string; color: string; bg: string }> = {
          Chua_hoan_thanh: { label: 'Chưa hoàn thành', color: 'text-amber-700', bg: 'bg-amber-50' },
          Hoan_thanh: { label: 'Hoàn thành', color: 'text-green-700', bg: 'bg-green-50' },
          Dat: { label: 'Đạt', color: 'text-emerald-700', bg: 'bg-emerald-50' },
          Khong_dat: { label: 'Không đạt', color: 'text-red-700', bg: 'bg-red-50' }
        }
        const result = map[row.ket_qua]
        if (!result) return <span className="text-[13px] text-gray-500">{row.ket_qua || '—'}</span>
        return (
          <Chip size="sm" classNames={{ base: `border-none ${result.bg}`, content: `${result.color} font-medium text-[11px]` }}>
            {result.label}
          </Chip>
        )
      }
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
                onClick={() => handleDelete(row.id_nhan_vien_dao_tao)}
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
      title: 'Thêm đào tạo',
      content: <FormQuatrinhdaotao formData={addFormData} setFormData={setFormData} allUser={allUser} />,
      formData: addFormData,
      onSubmit: (_id, data) => quatrinhdaotaoAxios.create(data!),
      onSubmitSuccess: async (response) => {
        let newData = response.data
        let item = {} as any
        if (Array.isArray(newData)) {
          item = newData.find((nd: any) => nd.id_nhan_vien == String(user?.id_nhan_vien))
        }
        if (item && typeof item === 'object') {
          const id = item.id_nhan_vien_dao_tao
          if (id) {
            try {
              const res = await quatrinhdaotaoAxios.show(id)
              if (res.success && res.data) item = res.data
            } catch (e) { console.error(e) }
          }
          setData((prev) => [...prev, item as QuatrinhdaotaoData])
        }
        setFormData({ id_nhan_vien: String(user?.id_nhan_vien || '') })
        dispatchSectionChanged(SECTION_EVENTS.QUATRINHDAOTAO)
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
    window.addEventListener('trigger-add-section-11', handler)
    return () => window.removeEventListener('trigger-add-section-11', handler)
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
    window.addEventListener('trigger-edit-section-11', editHandler)
    window.addEventListener('trigger-delete-section-11', deleteHandler)
    return () => {
      window.removeEventListener('trigger-edit-section-11', editHandler)
      window.removeEventListener('trigger-delete-section-11', deleteHandler)
    }
  }, [])

  return (
    <div className="space-y-4 flex flex-col">
      <div className="justify-between items-center shrink-0 hidden">
        <h3 className="text-lg font-semibold text-gray-700">Quá trình đào tạo</h3>
        <Button color="primary" size="sm" startContent={<Plus size={16} />} onPress={handleOpenAdd}>
          Thêm mới
        </Button>
      </div>

      <DataGrid<QuatrinhdaotaoData>
        columns={gridColumns}
        data={data}
        rowKey={(item) => String(item.id_nhan_vien_dao_tao)}
        renderCell={renderCell}
        emptyText="Chưa có quá trình đào tạo"
      />

      <ConfirmModal
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa bản ghi đào tạo này không? Hành động này không thể hoàn tác."
        isDanger
      />
    </div>
  )
}
