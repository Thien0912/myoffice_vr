import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button, Skeleton } from '@heroui/react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import { rolesAxios, Role } from '@renderer/api/admin/rolesAxios'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoleStore } from '@renderer/store/useRoleStore'
import { toast } from "@heroui-v3/react";

interface RoleDetailInfoProps {
  activeRole: Role | undefined
  isLoading?: boolean
}

export const RoleDetailInfo = ({ activeRole, isLoading }: RoleDetailInfoProps) => {
  const queryClient = useQueryClient()
  const { setHasUnsavedChanges } = useRoleStore()
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

  // Sync isDirty with global store
  useEffect(() => {
    setHasUnsavedChanges(isDirty)
    return () => setHasUnsavedChanges(false)
  }, [isDirty, setHasUnsavedChanges])

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
      const res: any = await rolesAxios.update(activeRole.ql_vai_tro_id, data)
      if (res.success) {
        toast('Thành công', { description: 'Cập nhật vai trò thành công', variant: 'success' })
        queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
        queryClient.invalidateQueries({ queryKey: ['roleOptionsSidebar'] })
        reset(data) // Reset dirty state with new values
      } else {
        toast('Lỗi', { description: res.message || 'Cập nhật thất bại', variant: 'danger' })
      }
    } catch (error: any) {
      toast('Lỗi', { description: error.message || 'Có lỗi xảy ra', variant: 'danger' })
    }
  }

  const handleReset = () => {
    if (activeRole) {
      reset({
        ql_vai_tro_ten: activeRole.ql_vai_tro_ten,
        ql_vai_tro_mo_ta: activeRole.ql_vai_tro_mo_ta || ''
      })
    }
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar py-6 relative">
      <form onSubmit={handleSubmit(onUpdateDetail)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton isLoaded={!isLoading} className="rounded-lg">
            <Controller
              name="ql_vai_tro_ten"
              control={control}
              rules={{ required: 'Vui lòng nhập tên vai trò' }}
              render={({ field }) => (
                <InputFloatingLabel
                  label="Tên vai trò"
                  {...field}
                  value={field.value}
                  errorMessage={errors.ql_vai_tro_ten?.message as string}
                  isInvalid={!!errors.ql_vai_tro_ten}
                />
              )}
            />
          </Skeleton>
          <div className="flex items-center gap-2 h-10 pt-4">
            <span className="text-[11px] text-gray-400 uppercase tracking-wider">Ngày tạo:</span>
            <Skeleton isLoaded={!isLoading} className="rounded-lg h-5 w-32">
              <span className="text-sm text-gray-700 dark:text-gray-200">{activeRole?.created_at || 'N/A'}</span>
            </Skeleton>
          </div>
        </div>
        <Skeleton isLoaded={!isLoading} className="rounded-lg">
          <Controller
            name="ql_vai_tro_mo_ta"
            control={control}
            render={({ field }) => (
              <TextareaFloatingLabel
                label="Mô tả"
                {...field}
                value={field.value}
                rows={3}
              />
            )}
          />
        </Skeleton>
        
        {/* Floating Save Action Bar */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-lg p-4 flex items-center gap-8 min-w-[500px] justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Hãy cẩn thận – bạn chưa lưu các thay đổi!
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="flat"
                    onPress={handleReset}
                    className="font-bold px-6"
                  >
                    Đặt lại
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    isLoading={isSubmitting}
                    className="font-bold px-6 shadow-md"
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
