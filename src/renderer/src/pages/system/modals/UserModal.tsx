import { useEffect, useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
  Input,
  cn
} from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { User, usersAxios } from '@renderer/api/admin/usersAxios'
import { rolesAxios } from '@renderer/api/admin/rolesAxios'
import { mapDonviOptions } from '@renderer/api/danhmuc/DonviAxios'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { User as UserIcon, Shield, Settings2, Search, CheckCircle2 } from 'lucide-react'
import { toast } from "@heroui-v3/react";

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
}

interface UserFormValues {
  ql_nguoi_dung_ho_ten: string
  ql_nguoi_dung_email: string
  id_don_vi: string
  role_ids: string[]
  active_flag: boolean
  ql_nguoi_dung_is_admin: boolean
}

export const UserModal = ({ isOpen, onClose, user }: UserModalProps) => {
  const queryClient = useQueryClient()
  const isEdit = !!user
  const [isLoading, setIsLoading] = useState(false)
  const [roleSearch, setRoleSearch] = useState('')

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<UserFormValues>({
    defaultValues: {
      ql_nguoi_dung_ho_ten: '',
      ql_nguoi_dung_email: '',
      id_don_vi: '',
      role_ids: [],
      active_flag: true,
      ql_nguoi_dung_is_admin: false
    }
  })

  const { data: donviOptions = [] } = useQuery({
    queryKey: ['donviOptions'],
    queryFn: mapDonviOptions,
    staleTime: 5 * 60 * 1000
  })

  const { data: roleOptions = [] } = useQuery({
    queryKey: ['roleOptions'],
    queryFn: async () => {
      try {
        const res: any = await rolesAxios.getOptions()
        if (res.success && Array.isArray(res.data)) {
          return res.data.map((r) => ({
            label: r.ql_vai_tro_ten || r.label,
            value: r.ql_vai_tro_id || r.value
          }))
        }
        return []
      } catch (e) {
        return []
      }
    },
    staleTime: 5 * 60 * 1000
  })

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setValue('ql_nguoi_dung_ho_ten', user.ql_nguoi_dung_ho_ten || '')
        setValue('ql_nguoi_dung_email', user.ql_nguoi_dung_email || '')
        setValue('id_don_vi', user.id_don_vi ? String(user.id_don_vi) : '')
        setValue('active_flag', String(user.active_flag) === '1')
        setValue('ql_nguoi_dung_is_admin', String(user.ql_nguoi_dung_is_admin) === '1')

        let roles: string[] = []
        if (Array.isArray(user.role_ids)) {
          roles = user.role_ids.map(String)
        } else if (typeof user.role_ids === 'string') {
          roles = user.role_ids.split(',').map((r) => r.trim()).filter(Boolean)
        } else if (user.vai_tro_ids) {
          roles = String(user.vai_tro_ids).split(',').map((r) => r.trim()).filter(Boolean)
        }
        setValue('role_ids', roles)
      } else {
        reset({
          ql_nguoi_dung_ho_ten: '',
          ql_nguoi_dung_email: '',
          id_don_vi: '',
          role_ids: [],
          active_flag: true,
          ql_nguoi_dung_is_admin: false
        })
      }
    }
  }, [isOpen, user, reset, setValue])

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true)
    try {
      const payload: any = {
        ...data,
        active_flag: data.active_flag ? '1' : '0',
        ql_nguoi_dung_is_admin: data.ql_nguoi_dung_is_admin ? '1' : '0'
      }

      let res: any
      if (isEdit && user) {
        res = await usersAxios.update(user.ql_nguoi_dung_id, payload)
      } else {
        res = await usersAxios.create(payload)
      }

      if (res.success) {
        toast('Thành công', { description: isEdit ? 'Cập nhật thành công' : 'Đã thêm người dùng', variant: 'success' })
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        onClose()
      } else {
        toast('Lỗi', { description: res.message || 'Có lỗi xảy ra', variant: 'danger' })
      }
    } catch (error: any) {
      toast('Lỗi', { description: error.message || 'Có lỗi xảy ra', variant: 'danger' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        header: 'border-b border-gray-100 dark:border-gray-800',
        footer: 'border-t border-gray-100 dark:border-gray-800',
        backdrop: 'bg-gray-900/50 backdrop-blur-sm'
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1 py-4">
            <h2 className="text-xl font-bold text-blue-600">
              {isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
            </h2>
            <p className="text-xs font-normal text-gray-500">
              {isEdit ? 'Chỉnh sửa thông tin tài khoản người dùng trên hệ thống' : 'Tạo tài khoản mới cho cán bộ nhân viên'}
            </p>
          </ModalHeader>
          <ModalBody className="py-6 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* CỘT 1: THÔNG TIN CĂN BẢN (Col-7) */}
              <div className="lg:col-span-7 space-y-8 pr-2 lg:border-r border-gray-100 dark:border-gray-800">
                {/* Section 1: Thông tin cá nhân */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-50 dark:border-gray-800">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg">
                      <UserIcon size={18} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                      Thông tin cá nhân
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <Controller
                      name="ql_nguoi_dung_ho_ten"
                      control={control}
                      rules={{ required: 'Họ tên là bắt buộc' }}
                      render={({ field }) => (
                        <InputFloatingLabel
                          {...field}
                          label="Họ và tên"
                          placeholder="Nhập họ tên đầy đủ"
                          isRequired
                          isInvalid={!!errors.ql_nguoi_dung_ho_ten}
                        />
                      )}
                    />

                    <Controller
                      name="ql_nguoi_dung_email"
                      control={control}
                      rules={{
                        required: 'Email là bắt buộc',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email không hợp lệ'
                        }
                      }}
                      render={({ field }) => (
                        <InputFloatingLabel
                          {...field}
                          label="Email"
                          placeholder="example@email.com"
                          isRequired
                          isInvalid={!!errors.ql_nguoi_dung_email}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Section 2: Tổ chức */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-50 dark:border-gray-800">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg">
                      <Shield size={18} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                      Tổ chức công tác
                    </span>
                  </div>
                  <Controller
                    name="id_don_vi"
                    control={control}
                    rules={{ required: 'Vui lòng chọn đơn vị' }}
                    render={({ field }) => (
                      <SelectDropdown
                        label="Đơn vị trực thuộc"
                        placeholder="Chọn đơn vị"
                        options={donviOptions}
                        value={field.value}
                        onChange={field.onChange}
                        isRequired
                        isInvalid={!!errors.id_don_vi}
                      />
                    )}
                  />
                </div>

                {/* Section 3: Cấu hình tài khoản */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-50 dark:border-gray-800">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg">
                      <Settings2 size={18} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                      Cấu hình tài khoản
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      name="active_flag"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-100">Hoạt động</span>
                            <span className="text-[11px] text-gray-500">Cho phép đăng nhập</span>
                          </div>
                          <Switch 
                            isSelected={value} 
                            onValueChange={onChange} 
                            size="sm"
                            classNames={{
                              wrapper: "group-data-[selected=true]:bg-blue-600",
                            }}
                          />
                        </div>
                      )}
                    />
                    <Controller
                      name="ql_nguoi_dung_is_admin"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-100">Quản trị viên</span>
                            <span className="text-[11px] text-gray-500">Toàn quyền hệ thống</span>
                          </div>
                          <Switch 
                            isSelected={value} 
                            onValueChange={onChange} 
                            size="sm" 
                            color="primary"
                            classNames={{
                              wrapper: "group-data-[selected=true]:bg-blue-600",
                            }}
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* CỘT 2: VAI TRÒ HỆ THỐNG (Col-5) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg">
                      <CheckCircle2 size={18} className="text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                        Vai trò hệ thống
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    size="sm"
                    placeholder="Tìm nhanh vai trò..."
                    startContent={<Search size={14} className="text-gray-400" />}
                    value={roleSearch}
                    onValueChange={setRoleSearch}
                    className="w-full"
                    variant="flat"
                    radius="lg"
                    isClearable
                  />
                </div>

                <div className="flex-1 min-h-[400px] overflow-y-auto custom-scrollbar pr-2 pt-2">
                  <Controller
                    name="role_ids"
                    control={control}
                    render={({ field }) => {
                      const selectedIds = field.value || []
                      const filteredRoles = roleOptions.filter((opt: any) => 
                        opt.label.toLowerCase().includes(roleSearch.toLowerCase())
                      )

                      return (
                        <ul className="flex flex-col">
                          {filteredRoles.map((role: any) => {
                            const isSelected = selectedIds.includes(String(role.value))
                            return (
                              <li 
                                key={role.value}
                                className={cn(
                                  "flex items-center justify-between py-2.5 px-3 border-b border-gray-100 dark:border-gray-800 transition-all cursor-pointer select-none first:pt-0 last:border-0",
                                  isSelected 
                                    ? "bg-blue-50/30 dark:bg-blue-900/10" 
                                    : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                                )}
                                onClick={() => {
                                  const val = String(role.value)
                                  const newVal = isSelected 
                                    ? selectedIds.filter(v => v !== val)
                                    : [...selectedIds, val]
                                  field.onChange(newVal)
                                }}
                              >
                                <span className={cn(
                                  "text-[13px] font-medium transition-colors",
                                  isSelected ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                                )}>
                                  {role.label}
                                </span>
                                <Switch 
                                  size="sm"
                                  isSelected={isSelected}
                                  onValueChange={(val) => {
                                    const roleId = String(role.value)
                                    const newVal = val 
                                      ? [...selectedIds, roleId]
                                      : selectedIds.filter(v => v !== roleId)
                                    field.onChange(newVal)
                                  }}
                                  classNames={{
                                    wrapper: "group-data-[selected=true]:bg-blue-600",
                                  }}
                                />
                              </li>
                            )
                          })}
                          
                          {roleOptions.length === 0 && (
                            <div className="text-center py-12 text-gray-400 text-xs italic">
                              Đang tải danh sách vai trò...
                            </div>
                          )}
                          
                          {roleOptions.length > 0 && filteredRoles.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                              <Search size={24} className="mx-auto mb-2 opacity-20" />
                              <span className="text-xs italic">Không tìm thấy vai trò phù hợp</span>
                            </div>
                          )}
                        </ul>
                      )
                    }}
                  />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="py-4">
            <Button 
              variant="light" 
              onPress={onClose} 
              radius="sm" 
              className="font-medium text-gray-600 dark:text-gray-400"
            >
              Hủy bỏ
            </Button>
            <Button 
              color="primary" 
              type="submit" 
              isLoading={isLoading} 
              radius="sm" 
              className="font-bold px-8 shadow-lg shadow-blue-500/20"
            >
              {isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
