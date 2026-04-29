/* eslint-disable @typescript-eslint/no-explicit-any */
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { Button, Card, Input, Textarea, Select, SelectItem, Chip } from '@heroui/react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Lock, Unlock, Check, X, Edit2, Trash2, Calendar } from 'lucide-react'
import { toast } from '@heroui-v3/react'
import ConfirmModal from '@renderer/components/ConfirmModal'
import { canAccess } from '@renderer/utils/permissions/permissions'
import { useAuthStore } from '@renderer/store/useAuthStore'

interface BangChamCongThang {
  id: number
  thang: string
  ngay_bat_dau: string
  ngay_ket_thuc: string
  ten_bang: string
  trang_thai: 'DANG_CHO_DUYET' | 'DA_DUYET' | 'BI_TU_CHOI' | 'KHOA' | 'MO'
  nguoi_duyet?: number
  ngay_duyet?: string
  nguoi_duyet_ho_ten?: string
  nguoi_tao_ho_ten?: string
  ly_do_tu_choi?: string
  ghi_chu?: string
  created_at: string
}

interface FormData {
  id?: number
  thang: string
  ngay_bat_dau: string
  ngay_ket_thuc: string
  ten_bang: string
  ghi_chu: string
}

const TRANG_THAI_CONFIG = {
  MO: { label: 'Đang mở', color: 'success', icon: Unlock },
  KHOA: { label: 'Đã khóa', color: 'warning', icon: Lock },
  DA_DUYET: { label: 'Đã duyệt', color: 'primary', icon: Check },
  BI_TU_CHOI: { label: 'Bị từ chối', color: 'danger', icon: X },
  DANG_CHO_DUYET: { label: 'Chờ duyệt', color: 'default', icon: Calendar }
}

export default function BangChamCongManager() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BangChamCongThang | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: 'delete' | 'khoa' | 'mo' | 'duyet' | 'tu_choi'
    item: BangChamCongThang | null
  }>({ isOpen: false, type: 'delete', item: null })

  // Check permission
  const hasChamCongPermission = canAccess('chamcong.view')

  const [formData, setFormData] = useState<FormData>({
    thang: '',
    ngay_bat_dau: '',
    ngay_ket_thuc: '',
    ten_bang: '',
    ghi_chu: ''
  })

  // Query danh sách
  const { data, isLoading } = useQuery({
    queryKey: ['bangChamCongThang', filterStatus],
    queryFn: async () => {
      const res = await ngoaiGioAxios.getBangChamCongThang({
        trang_thai: filterStatus as any,
        length: 100
      })
      return res.data
    }
  })

  // Mutation tạo mới
  const createMutation = useMutation({
    mutationFn: (data: any) => ngoaiGioAxios.createBangChamCong(data),
    onSuccess: () => {
      toast('Tạo bảng chấm công thành công', { variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      toast(error?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'danger' })
    }
  })

  // Mutation cập nhật
  const updateMutation = useMutation({
    mutationFn: (data: any) => ngoaiGioAxios.updateBangChamCong(data),
    onSuccess: () => {
      toast('Cập nhật bảng chấm công thành công', { variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      toast(error?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'danger' })
    }
  })

  // Mutation khóa/mở
  const toggleKhoaMutation = useMutation({
    mutationFn: ({ id, trang_thai }: { id: number; trang_thai: 'KHOA' | 'MO' }) =>
      ngoaiGioAxios.khoaBangChamCong({ id, trang_thai }),
    onSuccess: (_, variables) => {
      const action = variables.trang_thai === 'KHOA' ? 'Khóa' : 'Mở khóa'
      toast(`${action} bảng chấm công thành công`, { variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
      setConfirmModal({ isOpen: false, type: 'delete', item: null })
    },
    onError: (error: any) => {
      toast(error?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'danger' })
    }
  })

  // Mutation duyệt
  const approveMutation = useMutation({
    mutationFn: ({ id, hanh_dong }: { id: number; hanh_dong: 'duyet' | 'tu_choi' }) =>
      ngoaiGioAxios.duyetBangChamCong({ id, hanh_dong }),
    onSuccess: (_, variables) => {
      const action = variables.hanh_dong === 'duyet' ? 'Duyệt' : 'Từ chối'
      toast(`${action} bảng chấm công thành công`, { variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
      setConfirmModal({ isOpen: false, type: 'delete', item: null })
    },
    onError: (error: any) => {
      toast(error?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'danger' })
    }
  })

  // Mutation xóa
  const deleteMutation = useMutation({
    mutationFn: (id: number) => ngoaiGioAxios.deleteBangChamCong(id),
    onSuccess: () => {
      toast('Xóa bảng chấm công thành công', { variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
      setConfirmModal({ isOpen: false, type: 'delete', item: null })
    },
    onError: (error: any) => {
      toast(error?.response?.data?.message || 'Có lỗi xảy ra', { variant: 'danger' })
    }
  })

  const handleOpenModal = (item?: BangChamCongThang) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        id: item.id,
        thang: item.thang,
        ngay_bat_dau: item.ngay_bat_dau,
        ngay_ket_thuc: item.ngay_ket_thuc,
        ten_bang: item.ten_bang,
        ghi_chu: item.ghi_chu || ''
      })
    } else {
      setEditingItem(null)
      setFormData({
        thang: '',
        ngay_bat_dau: '',
        ngay_ket_thuc: '',
        ten_bang: '',
        ghi_chu: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      thang: '',
      ngay_bat_dau: '',
      ngay_ket_thuc: '',
      ten_bang: '',
      ghi_chu: ''
    })
  }

  const handleSubmit = () => {
    if (!formData.thang || !formData.ngay_bat_dau || !formData.ngay_ket_thuc) {
      toast('Vui lòng nhập đầy đủ thông tin', { variant: 'warning' })
      return
    }

    if (editingItem) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleConfirmAction = () => {
    const { type, item } = confirmModal
    if (!item) return

    switch (type) {
      case 'delete':
        deleteMutation.mutate(item.id)
        break
      case 'khoa':
        toggleKhoaMutation.mutate({ id: item.id, trang_thai: 'KHOA' })
        break
      case 'mo':
        toggleKhoaMutation.mutate({ id: item.id, trang_thai: 'MO' })
        break
      case 'duyet':
        approveMutation.mutate({ id: item.id, hanh_dong: 'duyet' })
        break
      case 'tu_choi':
        approveMutation.mutate({ id: item.id, hanh_dong: 'tu_choi' })
        break
    }
  }

  const bangChamCongs = data?.data || []

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý bảng chấm công tháng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tạo và quản lý kỳ chấm công cho đăng ký ngoài giờ
          </p>
        </div>
        <Button color="primary" startContent={<Plus size={18} />} onPress={() => handleOpenModal()}>
          Tạo bảng chấm công
        </Button>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Lọc trạng thái:</span>
          <Select
            placeholder="Tất cả"
            className="max-w-xs"
            size="sm"
            selectedKeys={filterStatus ? [filterStatus] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0]
              setFilterStatus(selected ? String(selected) : '')
            }}
          >
            <SelectItem key="">
              Tất cả
            </SelectItem>
            <SelectItem key="MO">
              Đang mở
            </SelectItem>
            <SelectItem key="KHOA">
              Đã khóa
            </SelectItem>
            <SelectItem key="DA_DUYET">
              Đã duyệt
            </SelectItem>
            <SelectItem key="BI_TU_CHOI">
              Bị từ chối
            </SelectItem>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Tháng</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Tên bảng</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Người tạo</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : bangChamCongs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Chưa có bảng chấm công nào
                  </td>
                </tr>
              ) : (
                bangChamCongs.map((item: BangChamCongThang) => {
                  const config = TRANG_THAI_CONFIG[item.trang_thai]
                  const Icon = config.icon

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm font-medium">{item.thang}</td>
                      <td className="px-4 py-3 text-sm">{item.ten_bang}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(item.ngay_bat_dau).toLocaleDateString('vi-VN')} -{' '}
                        {new Date(item.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={config.color as any}
                          startContent={<Icon size={14} />}
                        >
                          {config.label}
                        </Chip>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.nguoi_tao_ho_ten}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {item.trang_thai !== 'DA_DUYET' && (
                            <Button
                              size="sm"
                              variant="flat"
                              isIconOnly
                              onPress={() => handleOpenModal(item)}
                            >
                              <Edit2 size={16} />
                            </Button>
                          )}

                          {item.trang_thai === 'MO' && hasChamCongPermission && (
                            <Button
                              size="sm"
                              variant="flat"
                              color="warning"
                              isIconOnly
                              onPress={() =>
                                setConfirmModal({ isOpen: true, type: 'khoa', item })
                              }
                            >
                              <Lock size={16} />
                            </Button>
                          )}

                          {item.trang_thai === 'KHOA' && hasChamCongPermission && (
                            <Button
                              size="sm"
                              variant="flat"
                              color="success"
                              isIconOnly
                              onPress={() => setConfirmModal({ isOpen: true, type: 'mo', item })}
                            >
                              <Unlock size={16} />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            isIconOnly
                            onPress={() =>
                              setConfirmModal({ isOpen: true, type: 'delete', item })
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Create/Edit */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-bold">
              {editingItem ? 'Cập nhật bảng chấm công' : 'Tạo bảng chấm công mới'}
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Tháng"
                placeholder="MM/YYYY (VD: 04/2026)"
                value={formData.thang}
                onValueChange={(val) => setFormData({ ...formData, thang: val })}
              />
              <Input
                label="Tên bảng chấm công"
                placeholder="VD: Bảng chấm công tháng 4/2026"
                value={formData.ten_bang}
                onValueChange={(val) => setFormData({ ...formData, ten_bang: val })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Ngày bắt đầu"
                  value={formData.ngay_bat_dau}
                  onValueChange={(val) => setFormData({ ...formData, ngay_bat_dau: val })}
                />
                <Input
                  type="date"
                  label="Ngày kết thúc"
                  value={formData.ngay_ket_thuc}
                  onValueChange={(val) => setFormData({ ...formData, ngay_ket_thuc: val })}
                />
              </div>
              <Textarea
                label="Ghi chú"
                placeholder="Ghi chú về kỳ chấm công..."
                value={formData.ghi_chu}
                onValueChange={(val) => setFormData({ ...formData, ghi_chu: val })}
                minRows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleCloseModal}>
              Hủy
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingItem ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: 'delete', item: null })}
        onConfirm={handleConfirmAction}
        title={
          confirmModal.type === 'delete'
            ? 'Xác nhận xóa'
            : confirmModal.type === 'khoa'
              ? 'Xác nhận khóa'
              : confirmModal.type === 'mo'
                ? 'Xác nhận mở khóa'
                : confirmModal.type === 'duyet'
                  ? 'Xác nhận duyệt'
                  : 'Xác nhận từ chối'
        }
        content={
          confirmModal.type === 'delete'
            ? `Bạn có chắc chắn muốn xóa bảng chấm công "${confirmModal.item?.ten_bang}"?`
            : confirmModal.type === 'khoa'
              ? `Khóa bảng chấm công "${confirmModal.item?.ten_bang}"? Nhân viên sẽ không thể đăng ký ngoài giờ trong kỳ này.`
              : confirmModal.type === 'mo'
                ? `Mở khóa bảng chấm công "${confirmModal.item?.ten_bang}"? Nhân viên sẽ được phép đăng ký ngoài giờ.`
                : confirmModal.type === 'duyet'
                  ? `Duyệt bảng chấm công "${confirmModal.item?.ten_bang}"?`
                  : `Từ chối bảng chấm công "${confirmModal.item?.ten_bang}"?`
        }
        confirmText={
          confirmModal.type === 'delete'
            ? 'Xóa'
            : confirmModal.type === 'khoa'
              ? 'Khóa'
              : confirmModal.type === 'mo'
                ? 'Mở khóa'
                : confirmModal.type === 'duyet'
                  ? 'Duyệt'
                  : 'Từ chối'
        }
        isDanger={confirmModal.type === 'delete' || confirmModal.type === 'tu_choi'}
        isLoading={
          deleteMutation.isPending || toggleKhoaMutation.isPending || approveMutation.isPending
        }
      />
    </div>
  )
}
