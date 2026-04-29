import { useEffect, useState } from 'react'
import { Button, Modal, Spinner } from '@heroui-v3/react'
import { thuTucAxios } from '@renderer/api/danhmuc/thuTucAxios'
import { thoiviecAxios } from '@renderer/api/hr/thoiviecAxios'
import { HrDateInput } from '@renderer/components/hero-custom/HrDateInput'
import { SelectFloatingLabel } from '@renderer/components/SelectFloatingLabel'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { toast } from "@heroui-v3/react";

interface AddProcedureModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  employeeId: string | null
}

interface ProcedureForm {
  id_tttv: string
  ngay_hoan_thanh: string
  trang_thai: string
}

export default function AddProcedureModal({
  isOpen,
  onOpenChange,
  employeeId
}: AddProcedureModalProps) {
  const queryClient = useQueryClient()
  const [procedures, setProcedures] = useState<{ value: string; label: string }[]>([])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProcedureForm>({
    defaultValues: {
      id_tttv: '',
      ngay_hoan_thanh: new Date().toISOString().split('T')[0],
      trang_thai: '0'
    }
  })

  useEffect(() => {
    if (isOpen) {
      fetchProcedures()
    }
  }, [isOpen])

  const fetchProcedures = async () => {
    try {
      const res = await thuTucAxios.fetchAll()
      console.log(res)

      if (res?.data) {
        const options = res.data.map((item: any) => ({
          value: item.id_tttv,
          label: item.ten_thu_tuc
        }))
        setProcedures(options)
      }
    } catch (error) {
      console.error('Failed to fetch procedures:', error)
    }
  }

  const onSubmit = async (data: ProcedureForm) => {
    if (!employeeId) return

    try {
      await thoiviecAxios.add({
        thu_tuc: [
          {
            id_nhan_vien: employeeId,
            id_tttv: data.id_tttv,
            ngay_hoan_thanh: data.ngay_hoan_thanh,
            trang_thai: data.trang_thai
          }
        ]
      })
      toast('Thành công', { description: 'Thêm thủ tục thành công', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['dataThutuc', employeeId] })
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error(error)
      toast('Lỗi', { description: 'Có lỗi xảy ra khi thêm thủ tục', variant: 'danger' })
    }
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container>
          <Modal.Dialog>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="flex flex-col gap-1">
                <Modal.Heading>Thêm thủ tục mới</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <Controller
                  name="id_tttv"
                  control={control}
                  rules={{ required: 'Vui lòng chọn tên thủ tục' }}
                  render={({ field }) => (
                    <SelectFloatingLabel
                      label="Tên thủ tục"
                      options={procedures}
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      isRequired
                    />
                  )}
                />
                {errors.id_tttv && (
                  <span className="text-xs text-red-500">{errors.id_tttv.message}</span>
                )}

                <Controller
                  name="ngay_hoan_thanh"
                  control={control}
                  render={({ field }) => (
                    <HrDateInput
                      label="Ngày hoàn thành"
                      value={field.value || ''}
                      onChangeValue={field.onChange}
                    />
                  )}
                />

                <Controller
                  name="trang_thai"
                  control={control}
                  render={({ field }) => (
                    <SelectFloatingLabel
                      label="Trạng thái"
                      options={[
                        { value: '0', label: 'Chưa xong' },
                        { value: '1', label: 'Hoàn thành' }
                      ]}
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                    />
                  )}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="danger-soft" onPress={() => onOpenChange(false)}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" isDisabled={isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" /> : null}
                  Lưu
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
