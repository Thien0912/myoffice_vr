import React, { useEffect, useState } from 'react'
import { Button, cn, Modal, Tooltip } from '@heroui-v3/react'
import { HelpCircle, X } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { Role } from '@renderer/api/admin/rolesAxios'
import { mockRolesAxios } from '../fakeData'
import { HrInput } from '@renderer/components/hero-custom/HrInput'
import { ROLE_COLORS, getRoleColorById } from '../constants/roleColors'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from "@heroui-v3/react"
import { Check } from 'lucide-react'

interface RoleModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onSuccess?: () => void
}

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onOpenChange, role, onSuccess }) => {
  const queryClient = useQueryClient()
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)

  // Fetch all roles to check used colors
  const { data: existingRoles = [] } = useQuery({
    queryKey: ['admin-roles-for-colors'],
    queryFn: async () => {
      try {
        const res: any = await mockRolesAxios.getAll({})
        if (res.data && Array.isArray(res.data.data)) {
          return res.data.data
        }
        return []
      } catch (e) {
        return []
      }
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000
  })

  // Get used color ids (exclude current role's color when editing)
  const usedColorIds = existingRoles
    .filter((r: any) => role ? r.ql_vai_tro_id !== role.ql_vai_tro_id : true)
    .map((r: any) => r.colorId)
    .filter(Boolean) as string[]

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      ql_vai_tro_ten: '',
      ql_vai_tro_mo_ta: '',
      colorId: ''
    }
  })

  const selectedColorId = watch('colorId')
  const selectedColor = selectedColorId ? getRoleColorById(selectedColorId) : null

  useEffect(() => {
    if (role) {
      reset({
        ql_vai_tro_ten: role.ql_vai_tro_ten,
        ql_vai_tro_mo_ta: role.ql_vai_tro_mo_ta || '',
        colorId: (role as any).colorId || ''
      })
    } else {
      reset({
        ql_vai_tro_ten: '',
        ql_vai_tro_mo_ta: '',
        colorId: ''
      })
    }
  }, [role, reset, isOpen])

  const onSubmit = async (data: any) => {
    try {
      let res: any
      if (role) {
        res = await mockRolesAxios.update(role.ql_vai_tro_id, data)
      } else {
        res = await mockRolesAxios.create(data)
      }

      if (res.success) {
        toast('Thành công', { 
          description: role ? 'Cập nhật vai trò thành công' : 'Tạo mới vai trò thành công', 
          variant: 'success' 
        })
        queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
        queryClient.invalidateQueries({ queryKey: ['roleOptionsSidebar'] })
        queryClient.invalidateQueries({ queryKey: ['admin-roles-for-colors'] })
        onSuccess?.()
        onOpenChange(false)
      } else {
        toast('Lỗi', { description: res.message || 'Xử lý yêu cầu thất bại', variant: 'danger' })
      }
    } catch (error: any) {
      toast('Lỗi', { description: error.message || 'Có lỗi xảy ra', variant: 'danger' })
    }
  }

  const title = role ? 'Cập nhật vai trò' : 'Tạo vai trò mới'
  const subtitle = role 
    ? 'Chỉnh sửa thông tin và màu sắc của vai trò.' 
    : 'Tạo vai trò mới với tên, mô tả và màu sắc riêng biệt.'

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container
        size="lg"
        placement="auto"
        scroll="inside"
        className="max-w-xl! w-full"
      >
        <Modal.Dialog className="rounded-3xl! overflow-hidden shadow-[0_24px_48px_-12px_rgba(25,28,29,0.15)] p-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ─── Header: Stitch style ─── */}
            <Modal.Header className="px-7 py-5! border-b-0">
              <div className="flex w-full items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5 w-full">
                  <div className="flex items-center gap-1.5">
                    <Modal.Heading className="text-xl! font-bold tracking-tight">
                      {title}
                    </Modal.Heading>
                    <Tooltip delay={0}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700 rounded-full h-7 w-7 min-w-7"
                      >
                        <HelpCircle size={16} />
                      </Button>
                      <Tooltip.Content>
                        {subtitle}
                      </Tooltip.Content>
                    </Tooltip>
                  </div>
                </div>
                <Tooltip>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full h-9 w-9 min-w-9"
                    onPress={() => onOpenChange(false)}
                  >
                    <X size={18} />
                  </Button>
                  <Tooltip.Content>Đóng</Tooltip.Content>
                </Tooltip>
              </div>
            </Modal.Header>

            {/* ─── Body ─── */}
            <Modal.Body className="py-4 px-7!">
              <div className="flex flex-col gap-5">
                {/* Role Name */}
                <HrInput
                  label="Tên vai trò"
                  {...register('ql_vai_tro_ten', { required: 'Vui lòng nhập tên vai trò' })}
                  errorMessage={errors.ql_vai_tro_ten?.message as string}
                  isInvalid={!!errors.ql_vai_tro_ten}
                />
                
                {/* Color Picker */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Màu sắc <span className="text-red-500">*</span>
                    </label>
                    {selectedColor && (
                      <>
                        <div 
                          className={cn("w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600", selectedColor.bgClass)}
                          title={selectedColor.name}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedColor.name}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <Controller
                    name="colorId"
                    control={control}
                    rules={{ required: 'Vui lòng chọn màu sắc' }}
                    render={({ field }) => (
                      <div className="grid grid-cols-10 gap-2">
                        {ROLE_COLORS.map((color) => {
                          const isSelected = field.value === color.id
                          const isUsed = usedColorIds.includes(color.id)
                          const isDisabled = isUsed && !isSelected

                          return (
                            <Tooltip
                              key={color.id}
                              content={isDisabled ? `${color.name} (đã sử dụng)` : color.name}
                              placement="top"
                              delay={200}
                              closeDelay={0}
                            >
                              <button
                                type="button"
                                disabled={isDisabled}
                                onClick={() => field.onChange(color.id)}
                                onMouseEnter={() => setHoveredColor(color.id)}
                                onMouseLeave={() => setHoveredColor(null)}
                                className={cn(
                                  'relative w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center',
                                  'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800',
                                  isSelected
                                    ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-800 ring-gray-900 dark:ring-white scale-110'
                                    : 'hover:scale-105',
                                  isDisabled
                                    ? 'opacity-40 cursor-not-allowed grayscale'
                                    : 'cursor-pointer hover:shadow-md',
                                  color.bgClass
                                )}
                              >
                                {isSelected && (
                                  <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />
                                )}
                                {isDisabled && !isSelected && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-0.5 bg-gray-700 rotate-45 absolute" />
                                  </div>
                                )}
                              </button>
                            </Tooltip>
                          )
                        })}
                      </div>
                    )}
                  />
                  {errors.colorId && (
                    <p className="text-xs text-red-500 mt-1">{errors.colorId.message}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Những màu đã được sử dụng sẽ bị vô hiệu hóa. Mỗi vai trò cần có một màu riêng biệt.
                  </p>
                </div>

                {/* Description */}
                <HrInput
                  label="Mô tả"
                  {...register('ql_vai_tro_mo_ta')}
                />
              </div>
            </Modal.Body>

            {/* ─── Footer: Stitch MD3 style ─── */}
            <Modal.Footer className="px-6 py-4! border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                {/* Info Card */}
                <div className="flex items-center gap-3 bg-blue-50/60 dark:bg-blue-900/15 px-4 py-2.5 rounded-xl w-full sm:w-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                      {role ? 'Cập nhật thông tin vai trò' : 'Tạo vai trò mới'}
                    </span>
                  </div>
                </div>

                {/* Action buttons - Đồng bộ style với Nghỉ phép */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto sm:ml-auto">
                  <Button
                    className="flex-1 sm:flex-none h-11 px-6 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all duration-250 border-none"
                    onPress={() => onOpenChange(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 sm:flex-none h-11 px-6 bg-[#C2E7FF] hover:bg-[#b5dffa] active:bg-[#99c8e8] text-[#001D35] font-semibold rounded-2xl transition-all duration-250 shadow-sm hover:shadow-md border-none flex items-center gap-2"
                    isPending={isSubmitting}
                  >
                    {role ? 'Cập nhật' : 'Tạo mới'}
                    {!isSubmitting && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

export default RoleModal
