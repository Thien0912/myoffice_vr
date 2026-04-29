import { useFieldArray, useFormContext, Controller, useWatch } from 'react-hook-form'
import { Button } from '@heroui/react'
import { Plus, Trash2, UserPlus } from 'lucide-react'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { useQuery } from '@tanstack/react-query'
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import { mapNhanSuCungDonviOptions } from '@renderer/api/danhmuc/nhansuAxios'

export default function ApproverSection({ isDisabled }: { isDisabled?: boolean }) {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'approvers'
  })

  // Fetch Unit Options (Grouped)
  const { data: unitOptions = [] } = useQuery({
    queryKey: ['donvi-grouped-options'],
    queryFn: () => mapDonviGroupedOptions(),
    staleTime: 5 * 60 * 1000
  })

  return (
    <div className="flex flex-col gap-2 p-4 border-t border-gray-100 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <UserPlus size={16} className="text-blue-500" />
          <span>Người duyệt</span>
        </div>
        {!isDisabled && (
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<Plus size={14} />}
            onPress={() => append({ id_don_vi: '', id_nguoi_duyet: '' })}
            className="h-7 text-xs px-3"
          >
            Thêm
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <ApproverRow
            key={field.id}
            index={index}
            onRemove={() => remove(index)}
            isDisabled={isDisabled}
            unitOptions={unitOptions}
          />
        ))}
        
        {fields.length === 0 && (
          <div className="text-center py-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-md text-xs text-gray-400">
            Chưa có người duyệt nào được chọn.
          </div>
        )}
      </div>
    </div>
  )
}

function ApproverRow({
  index,
  onRemove,
  isDisabled,
  unitOptions
}: {
  index: number
  onRemove: () => void
  isDisabled?: boolean
  unitOptions: any[]
}) {
  const { control, setValue } = useFormContext()
  const idDonVi = useWatch({
    control,
    name: `approvers.${index}.id_don_vi`
  })

  // Fetch Users based on Unit
  const { data: userOptions = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-by-unit', idDonVi],
    queryFn: () => mapNhanSuCungDonviOptions(idDonVi),
    enabled: !!idDonVi,
    staleTime: 10 * 1000
  })

  return (
    <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700/50 group">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
        <Controller
          control={control}
          name={`approvers.${index}.id_don_vi`}
          render={({ field }) => (
            <SelectDropdown
              name={field.name}
              label=""
              placeholder="Chọn đơn vị (Bắt buộc)..."
              options={unitOptions}
              value={field.value}
              onChange={(val) => {
                field.onChange(val)
                // Reset user when unit changes
                setValue(`approvers.${index}.id_nguoi_duyet`, '')
              }}
              isDisabled={isDisabled}
              className="bg-white dark:bg-gray-800"
            />
          )}
        />
        
        <Controller
          control={control}
          name={`approvers.${index}.id_nguoi_duyet`}
          render={({ field }) => (
            <SelectDropdown
              name={field.name}
              label=""
              placeholder={!!idDonVi ? (isLoadingUsers ? "Đang tải..." : "Chọn người duyệt (Tùy chọn)...") : "Vui lòng chọn đơn vị trước"}
              options={userOptions}
              value={field.value}
              onChange={field.onChange}
              isDisabled={isDisabled || !idDonVi}
              className="bg-white dark:bg-gray-800"
            />
          )}
        />
      </div>

      {!isDisabled && (
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          onPress={onRemove}
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mt-1"
          title="Xóa dòng này"
        >
          <Trash2 size={16} />
        </Button>
      )}
    </div>
  )
}
