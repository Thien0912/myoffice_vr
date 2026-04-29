import React, { useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react'
import { useForm } from 'react-hook-form'
import { rolesAxios, Role } from '@renderer/api/admin/rolesAxios'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from "@heroui-v3/react";

interface RoleModalProps {
  isOpen: boolean
  onClose: () => void
  role: Role | null
  onSuccess?: () => void
}

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, role, onSuccess }) => {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      ql_vai_tro_ten: '',
      ql_vai_tro_mo_ta: ''
    }
  })

  useEffect(() => {
    if (role) {
      reset({
        ql_vai_tro_ten: role.ql_vai_tro_ten,
        ql_vai_tro_mo_ta: role.ql_vai_tro_mo_ta || ''
      })
    } else {
      reset({
        ql_vai_tro_ten: '',
        ql_vai_tro_mo_ta: ''
      })
    }
  }, [role, reset, isOpen])

  const onSubmit = async (data: any) => {
    try {
      let res: any
      if (role) {
        res = await rolesAxios.update(role.ql_vai_tro_id, data)
      } else {
        res = await rolesAxios.create(data)
      }

      if (res.success) {
        toast('Thành công', { description: role ? 'Cập nhật vai trò thành công' : 'Tạo mới vai trò thành công', variant: 'success' })
        queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
        onSuccess?.()
        onClose()
      } else {
        toast('Lỗi', { description: res.message || 'Xử lý yêu cầu thất bại', variant: 'danger' })
      }
    } catch (error: any) {
      toast('Lỗi', { description: error.message || 'Có lỗi xảy ra', variant: 'danger' })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside" radius="sm">
      <ModalContent className="dark:bg-gray-800 dark:text-gray-100">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1 text-blue-600 dark:text-blue-400">
            {role ? 'CẬP NHẬT VAI TRÒ' : 'TẠO MỚI VAI TRÒ'}
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="flex flex-col gap-6">
              <InputFloatingLabel
                label="Tên vai trò"
                {...register('ql_vai_tro_ten', { required: 'Vui lòng nhập tên vai trò' })}
                errorMessage={errors.ql_vai_tro_ten?.message as string}
                isInvalid={!!errors.ql_vai_tro_ten}
              />
              <TextareaFloatingLabel
                label="Mô tả"
                {...register('ql_vai_tro_mo_ta')}
                rows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-gray-100 dark:border-gray-700 mt-2">
            <Button variant="light" onPress={onClose} radius="sm" className="font-medium text-gray-500 dark:text-gray-400">
              Đóng
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting}
              radius="sm"
              className="font-bold px-6"
            >
              {role ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
