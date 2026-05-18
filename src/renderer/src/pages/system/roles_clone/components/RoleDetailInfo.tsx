import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button, Skeleton, Tooltip, cn, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import { Check, RotateCcw, Plus } from 'lucide-react'
import { Role } from '@renderer/api/admin/rolesAxios'
import { mockRolesAxios } from '../fakeData'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoleStore } from '../hooks/useRoleStore'
import { toast } from "@heroui-v3/react"
import { HrInput } from '@renderer/components/hero-custom/HrInput'
import { ROLE_COLORS } from '../constants/roleColors'
import { ColorPickerModal } from './ColorPickerModal'

interface RoleDetailInfoProps {
  activeRole: Role | undefined
  isLoading?: boolean
}

export const RoleDetailInfo = ({ activeRole, isLoading }: RoleDetailInfoProps) => {
  const queryClient = useQueryClient()
  const { setHasUnsavedChanges } = useRoleStore()
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isCustomColorModalOpen, setIsCustomColorModalOpen] = useState(false)

  // Fetch all roles to check used colors
  const { data: existingRoles = [] } = useQuery({
    queryKey: ['admin-roles-for-colors-info'],
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
    staleTime: 5 * 60 * 1000
  })

  // Get used color ids (exclude current role's color)
  const usedColorIds = existingRoles
    .filter((r: any) => activeRole ? r.ql_vai_tro_id !== activeRole.ql_vai_tro_id : true)
    .map((r: any) => r.colorId)
    .filter(Boolean) as string[]

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm({
    defaultValues: {
      ql_vai_tro_ten: '',
      ql_vai_tro_mo_ta: ''
    }
  })

  // sync dirty state
  useEffect(() => {
    setHasUnsavedChanges(isDirty)
    return () => setHasUnsavedChanges(false)
  }, [isDirty, setHasUnsavedChanges])

  // load data
  useEffect(() => {
    if (activeRole) {
      reset({
        ql_vai_tro_ten: activeRole.ql_vai_tro_ten,
        ql_vai_tro_mo_ta: activeRole.ql_vai_tro_mo_ta || ''
      })
    }
  }, [activeRole, reset])

  const onUpdateDetail = async (data: any) => {
    if (!activeRole) return

    try {
      const res: any = await mockRolesAxios.update(activeRole.ql_vai_tro_id, data)

      if (res.success) {
        toast('Thành công', {
          description: 'Cập nhật vai trò thành công',
          variant: 'success'
        })

        queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
        queryClient.invalidateQueries({ queryKey: ['roleOptionsSidebar'] })
        queryClient.invalidateQueries({ queryKey: ['admin-roles-for-colors'] })

        reset(data)
      } else {
        toast('Lỗi', {
          description: res.message || 'Cập nhật thất bại',
          variant: 'danger'
        })
      }
    } catch (error: any) {
      toast('Lỗi', {
        description: error.message || 'Có lỗi xảy ra',
        variant: 'danger'
      })
    }
  }

  const handleReset = () => {
    if (!activeRole) return

    reset({
      ql_vai_tro_ten: activeRole.ql_vai_tro_ten,
      ql_vai_tro_mo_ta: activeRole.ql_vai_tro_mo_ta || ''
    })
  }

  // Handle color change
  const handleColorChange = async (colorId: string) => {
    if (!activeRole) return

    try {
      const res: any = await mockRolesAxios.update(activeRole.ql_vai_tro_id, {
        ql_vai_tro_ten: activeRole.ql_vai_tro_ten,
        ql_vai_tro_mo_ta: activeRole.ql_vai_tro_mo_ta || '',
        colorId: colorId
      })

      if (res.success) {
        toast('Thành công', {
          description: 'Cập nhật màu sắc thành công',
          variant: 'success'
        })
        await queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
        await queryClient.invalidateQueries({ queryKey: ['roleOptionsSidebar'] })
        setIsColorPickerOpen(false)
      } else {
        toast('Lỗi', {
          description: res.message || 'Cập nhật thất bại',
          variant: 'danger'
        })
      }
    } catch (error: any) {
      toast('Lỗi', {
        description: error.message || 'Có lỗi xảy ra',
        variant: 'danger'
      })
    }
  }

  // Handle custom color selection
  const handleCustomColorSelect = async (colorHex: string) => {
    if (!activeRole) return

    try {
      const res: any = await mockRolesAxios.update(activeRole.ql_vai_tro_id, {
        ql_vai_tro_ten: activeRole.ql_vai_tro_ten,
        ql_vai_tro_mo_ta: activeRole.ql_vai_tro_mo_ta || '',
        colorId: colorHex,
        isCustomColor: true
      })

      if (res.success) {
        toast('Thành công', {
          description: 'Cập nhật màu sắc thành công',
          variant: 'success'
        })
        await queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
        await queryClient.invalidateQueries({ queryKey: ['roleOptionsSidebar'] })
        setIsCustomColorModalOpen(false)
        setIsColorPickerOpen(false)
      } else {
        toast('Lỗi', {
          description: res.message || 'Cập nhật thất bại',
          variant: 'danger'
        })
      }
    } catch (error: any) {
      toast('Lỗi', {
        description: error.message || 'Có lỗi xảy ra',
        variant: 'danger'
      })
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full py-5 pl-2 pr-4">
        <form onSubmit={handleSubmit(onUpdateDetail)} className="space-y-6">

        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0">

          {/* ROLE NAME */}
          <Skeleton isLoaded={!isLoading} className="rounded-lg">
            <Controller
              name="ql_vai_tro_ten"
              control={control}
              rules={{ required: 'Vui lòng nhập tên vai trò' }}
              render={({ field }) => (
                <HrInput
                  label="Tên vai trò"
                  value={field.value}
                  onValueChange={field.onChange}
                  isInvalid={!!errors.ql_vai_tro_ten}
                  errorMessage={errors.ql_vai_tro_ten?.message as string}
                />
              )}
            />
          </Skeleton>

          {/* CREATED DATE */}
          <Skeleton isLoaded={!isLoading} className="rounded-lg">
            <HrInput
              label="Ngày tạo"
              value={activeRole?.created_at || ''}
              isDisabled
            />
          </Skeleton>

        </div>

        

        {/* DESCRIPTION */}
        <Skeleton isLoaded={!isLoading} className="rounded-lg">
          <Controller
            name="ql_vai_tro_mo_ta"
            control={control}
            render={({ field }) => (
              <HrInput
                label="Mô tả"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </Skeleton>

        {/* COLOR PICKER */}
        <Skeleton isLoaded={!isLoading} className="rounded-lg">
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Màu sắc
            </label>
            
            <Popover 
              isOpen={isColorPickerOpen} 
              onOpenChange={setIsColorPickerOpen}
              placement="bottom-start" 
              offset={10}
            >
              <PopoverTrigger>
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700',
                    'hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                >
                  {(activeRole as any)?.colorId ? (
                    <>
                      <div 
                        className={cn("w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm", (activeRole as any)?.dotColor || 'bg-blue-500')}
                        style={(activeRole as any)?.customColorHex ? {
                          backgroundColor: (activeRole as any).customColorHex
                        } : undefined}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {(activeRole as any)?.customColorHex ? 'Màu tùy chỉnh' : 'Màu đã chọn'}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600" />
                      <span className="text-sm text-gray-400">Chọn màu</span>
                    </>
                  )}
                </button>
              </PopoverTrigger>
              
              <PopoverContent className="p-4 w-[340px]">
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chọn màu sắc cho vai trò
                  </div>
                  
                  {/* Grid màu */}
                  <div className="grid grid-cols-8 gap-2">
                    {ROLE_COLORS.map((color) => {
                      const isSelected = (activeRole as any)?.colorId === color.id
                      const isUsed = usedColorIds.includes(color.id)
                      
                      return (
                        <Tooltip
                          key={color.id}
                          content={isUsed ? `${color.name} (Màu đã được dùng)` : color.name}
                          placement="top"
                          delay={200}
                          closeDelay={0}
                        >
                          <button
                            type="button"
                            onClick={() => handleColorChange(color.id)}
                            className={cn(
                              'relative w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center',
                              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800',
                              isSelected
                                ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110'
                                : 'hover:scale-110 hover:shadow-lg',
                              'cursor-pointer',
                              color.bgClass
                            )}
                          >
                            {isSelected && (
                              <Check size={14} className="text-white drop-shadow-md" strokeWidth={3} />
                            )}
                            {isUsed && !isSelected && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                                <span className="text-[6px] text-white font-bold">!</span>
                              </div>
                            )}
                          </button>
                        </Tooltip>
                      )
                    })}
                    
                    {/* Custom color button */}
                    <Tooltip
                      content="Chọn màu tùy chỉnh"
                      placement="top"
                      delay={200}
                      closeDelay={0}
                    >
                      <button
                        type="button"
                        onClick={() => setIsCustomColorModalOpen(true)}
                        className={cn(
                          'relative w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center',
                          'border-2 border-dashed border-gray-400 hover:border-gray-600',
                          'hover:bg-gray-50 dark:hover:bg-gray-800',
                          'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800',
                          'cursor-pointer'
                        )}
                      >
                        <Plus size={16} className="text-gray-500" />
                      </button>
                    </Tooltip>
                  </div>
                  
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                        <span className="text-[6px] text-white font-bold">!</span>
                      </div>
                      <span>Màu đã được dùng</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </Skeleton>

        {/* FLOATING ACTION BAR */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-lg p-3 flex items-center gap-6 min-w-[450px] justify-between">

                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  Hãy cẩn thận – bạn chưa lưu các thay đổi!
                </p>

                <div className="flex items-center gap-2">

                  <Button
                    onPress={handleReset}
                    className="h-9 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-250 border-none flex items-center gap-1.5"
                  >
                    <RotateCcw size={16} />
                    Đặt lại
                  </Button>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="h-9 px-4 bg-[#C2E7FF] hover:bg-[#b5dffa] active:bg-[#99c8e8] text-[#001D35] font-semibold rounded-xl transition-all duration-250 shadow-sm hover:shadow-md border-none flex items-center gap-1.5"
                  >
                    <Check size={16} />
                    Lưu thay đổi
                  </Button>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        </form>
      </div>

      {/* Custom Color Picker Modal */}
      <ColorPickerModal
        isOpen={isCustomColorModalOpen}
        onClose={() => setIsCustomColorModalOpen(false)}
        onSelectColor={handleCustomColorSelect}
      />
    </div>
  )
}

export default RoleDetailInfo
