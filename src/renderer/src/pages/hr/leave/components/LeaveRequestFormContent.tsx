import { Button, cn, Avatar } from '@heroui-v3/react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import { LeaveDaysForm } from './LeaveDaysForm'
import { Plus, Paperclip, X, Upload, ChevronDown } from 'lucide-react'


interface LeaveRequestFormContentProps {
  form: UseFormReturn<any>
  days: any[]
  employeeOptions: any[]
  leaveTypeOptions: any[]
  handleAddDay: () => void
  handleRemoveDay: (index: number) => void
  isLoadingEmployees?: boolean
  isLoadingLeaveTypes?: boolean
  isEmployeeSelectDisabled?: boolean
  onAddNewType?: () => void
  layout?: 'page' | 'modal'
  isReadOnly?: boolean
}

export const LeaveRequestFormContent = ({
  form,
  days,
  employeeOptions,
  leaveTypeOptions,
  handleAddDay,
  handleRemoveDay,
  isLoadingEmployees,
  isLoadingLeaveTypes,
  isEmployeeSelectDisabled,
  onAddNewType,
  layout = 'page',
  isReadOnly = false
}: LeaveRequestFormContentProps) => {
  const { control, setValue, watch } = form

  const isModal = layout === 'modal'

  // Stitch MD3 label style
  const sectionLabelClass =
    'text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest'

  return (
    <div className={cn(isModal ? 'flex flex-col gap-5 px-0.5' : 'flex flex-col gap-1')}>
      {/* ─── Section 1: Employee & Leave Type ─── */}
      <div className={cn(
        isModal
          ? 'flex flex-col gap-3.5'
          : 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4'
      )}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Employee Selection */}
          <div className="flex flex-col gap-1.5">
            <span className={sectionLabelClass}>
              Nhân viên <span className="text-red-500">*</span>
            </span>
            <Controller
              name="selectedEmployeeId"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => {
                const selectedEmp = employeeOptions.find(opt => String(opt.value) === String(field.value))

                if (selectedEmp && isEmployeeSelectDisabled) {
                  return (
                    <div className="flex items-center gap-3 px-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl h-[42px]">
                      <Avatar size="sm" className="w-6 h-6 text-[10px] font-bold">
                        <Avatar.Image src={selectedEmp.hinh_anh} alt={selectedEmp.ho_va_ten} />
                        <Avatar.Fallback>{(selectedEmp.ho_va_ten || selectedEmp.label)?.[0]?.toUpperCase()}</Avatar.Fallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">
                          {selectedEmp.ho_va_ten || selectedEmp.label}
                        </span>
                      </div>
                    </div>
                  )
                }

                return (
                  <SelectDropdown
                    label="Nhân viên"
                    options={employeeOptions}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    isRequired
                    placeholder={isLoadingEmployees ? 'Đang tải...' : 'Chọn nhân viên'}
                    isDisabled={isEmployeeSelectDisabled || isReadOnly}
                    isInvalid={fieldState.invalid}
                    hideLabel
                    variant="flat"
                    radius="xl"
                    className="h-[42px]"
                  />
                )
              }}
            />
          </div>

          {/* Leave Type Selection */}
          <div className="flex flex-col gap-1.5">
            <span className={sectionLabelClass}>
              Loại nghỉ phép <span className="text-red-500">*</span>
            </span>
            <Controller
              name="idLoaiPhep"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <SelectDropdown
                  label="Loại nghỉ phép"
                  options={leaveTypeOptions}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  isRequired
                  placeholder={isLoadingLeaveTypes ? 'Đang tải...' : 'Chọn loại nghỉ'}
                  onAddNew={isReadOnly ? undefined : onAddNewType}
                  isDisabled={isReadOnly}
                  isInvalid={fieldState.invalid}
                  hideLabel
                  variant="flat"
                  radius="xl"
                  className="h-[42px]"
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* ─── Section 2: Duration / Thời gian nghỉ ─── */}
      <div className={cn(
        isModal
          ? 'flex flex-col gap-1.5'
          : 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4'
      )}>
        <div className="flex items-center justify-between">
          <span className={sectionLabelClass}>Thời gian nghỉ</span>
          {!isReadOnly && (
            <Button
              size="sm"
              variant="tertiary"
              onPress={handleAddDay}
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium h-8 flex items-center gap-1.5 rounded-lg transition-colors px-3"
            >
              <Plus size={16} />
            </Button>
          )}
        </div>
        <LeaveDaysForm days={days} onRemoveDay={handleRemoveDay} isReadOnly={isReadOnly} />
      </div>

      {/* ─── Section 3: Reason ─── */}
      <div className={cn(
        isModal
          ? 'flex flex-col gap-1.5'
          : 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4'
      )}>
        <span className={sectionLabelClass}>Lý do nghỉ</span>
        <Controller
          name="lyDo"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <TextareaFloatingLabel
              label="Lý do nghỉ"
              value={field.value}
              onChange={field.onChange}
              rows={3}
              isRequired
              disabled={isReadOnly}
              className="bg-gray-50/50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 rounded-xl p-4 pt-4"
              isInvalid={fieldState.invalid}
              hideLabel // We need to add this prop to TextareaFloatingLabel or handle it here
            />
          )}
        />
      </div>

      {/* ─── Section 4: Attachments ─── */}
      <div className={cn(
        isModal
          ? 'flex flex-col gap-1.5 pb-2'
          : 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4'
      )}>
        <span className={sectionLabelClass}>Minh chứng đính kèm (Không bắt buộc)</span>

        {isReadOnly && !watch('minhChung') && (
          <span className="text-sm text-gray-400 dark:text-gray-500 italic">Không có minh chứng</span>
        )}

        {!isReadOnly && (
          <div className="flex flex-col gap-2">
            {!watch('minhChung') ? (
              /* Stitch MD3: dashed upload area */
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setValue('minhChung', file)
                  }}
                />
                <div className="border-2 border-dashed border-gray-300/60 dark:border-gray-600/60 rounded-xl p-5 flex flex-col items-center justify-center gap-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                    <Upload size={20} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Bấm để tải lên</span> hoặc kéo thả
                    <br />
                    <span className="text-xs">PNG, JPG hoặc PDF (tối đa 5MB)</span>
                  </p>
                </div>
              </div>
            ) : (
              /* Selected file preview */
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl max-w-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-gray-800 dark:bg-gray-600 text-white p-1.5 rounded-lg text-[10px] font-bold uppercase shrink-0 min-w-8 text-center">
                    {watch('minhChung')?.name?.split('.').pop() || 'IMG'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {watch('minhChung')?.name}
                  </span>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="danger-soft"
                  className="shrink-0 ml-2 rounded-full"
                  onPress={() => setValue('minhChung', null)}
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>
        )}

        {isReadOnly && watch('minhChung') && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl max-w-sm">
            <div className="bg-gray-800 dark:bg-gray-600 text-white p-1.5 rounded-lg text-[10px] font-bold uppercase shrink-0 min-w-8 text-center">
              {typeof watch('minhChung') === 'string' ? watch('minhChung').split('.').pop() : watch('minhChung')?.name?.split('.').pop()}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              {typeof watch('minhChung') === 'string' ? 'Hình ảnh minh chứng' : watch('minhChung')?.name}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
