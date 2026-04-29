import { Button, Modal, toast } from '@heroui-v3/react'
import { useState } from 'react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaiNghiPhepAxios } from '@renderer/api/danhmuc/loaiNghiPhepAxios'

interface CreateLeaveTypeModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (newId?: string) => void
}

export default function CreateLeaveTypeModal({
  isOpen,
  onOpenChange,
  onSuccess
}: CreateLeaveTypeModalProps) {
  const [tenLoaiPhep, setTenLoaiPhep] = useState('')
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: any) => LoaiNghiPhepAxios.create(data),
    onSuccess: (res) => {
      if (res.success) {
        toast('Thành công', { description: 'Thêm loại nghỉ phép thành công', variant: 'success' })
        queryClient.invalidateQueries({ queryKey: ['hrmLoaiNghiPhep'] })
        onSuccess(String(res.data?.insertId || '')) // Pass back the new ID if available
        onOpenChange(false)
        setTenLoaiPhep('')
      } else {
        toast('Lỗi', { description: res.message || 'Thêm thất bại', variant: 'danger' })
      }
    },
    onError: () => {
      toast('Lỗi', { description: 'Lỗi kết nối server', variant: 'danger' })
    }
  })

  const handleSave = () => {
    if (!tenLoaiPhep.trim()) {
      toast('Vui lòng nhập tên loại nghỉ phép', { variant: 'warning' })
      return
    }
    createMutation.mutate({ ten_loai_phep: tenLoaiPhep })
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Thêm loại nghỉ phép</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="pt-6">
              <InputFloatingLabel
                label="Tên loại nghỉ phép"
                value={tenLoaiPhep}
                onChange={setTenLoaiPhep}
                isRequired
                autoFocus
                radius="xl"
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" className="text-danger hover:bg-danger/10" onPress={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button variant="primary" onPress={handleSave} isPending={createMutation.isPending}>
                Lưu
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
