import { useMemo, useEffect } from 'react'
import moment from 'moment'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { nghiphepAxios } from '@renderer/api/hr/nghiphepAxios'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useForm, useFieldArray } from 'react-hook-form'
import { useNgoaiGioPermissions } from './useNgoaiGioPermissions'
import { toast } from "@heroui-v3/react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimeSlot {
  id: number
  startTime: string
  endTime: string
}

export interface OvertimeRow {
  id: string | number
  date: string
  reason: string      // = Tiêu đề
  chi_tiet?: string   // = Chi tiết (optional)
  is_dot_xuat?: number // = 1 nếu đăng ký đột xuất
  slots: TimeSlot[]   // multiple time slots per day
}

export interface OvertimeFormValues {
  selectedEmployeeId: string | string[]
  entries: OvertimeRow[]
}

interface UseCreateOvertimeRequestProps {
  onSuccess: () => void
}

/** Calculate hours between two HH:mm time strings */
export const calcHours = (start: string, end: string): number => {
  if (!start || !end) return 0
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const diff = (eh * 60 + em - (sh * 60 + sm)) / 60
  return diff > 0 ? Math.round(diff * 100) / 100 : 0
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCreateOvertimeRequest = ({
  onSuccess
}: UseCreateOvertimeRequestProps) => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const form = useForm<OvertimeFormValues>({
    defaultValues: {
      selectedEmployeeId: [],
      entries: []
    }
  })

  const { control, handleSubmit, setValue, watch, reset } = form

  const {
    fields: entries,
    append,
    remove
  } = useFieldArray({
    control,
    name: 'entries'
  })

  // Fetch employees
  const { data: employeeOptions = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['hrmNhanSuCungDonVi'],
    queryFn: async () => {
      const res = await nghiphepAxios.get_employee_by_unit()
      if (res.success && Array.isArray(res.data)) {
        return res.data.map((item: any) => ({
          ...item,
          label: item.ho_va_ten ? `${item.ho_va_ten} (${item.ma_nhan_vien})` : item.label
        }))
      }
      return []
    }
  })

  const { canSelectEmployee, canCreateFor } = useNgoaiGioPermissions()
  const isEmployeeSelectDisabled = !canSelectEmployee
  const isMultipleSelect = canCreateFor

  // Auto-select employee
  useEffect(() => {
    if (employeeOptions.length > 0) {
      const currentId = form.getValues('selectedEmployeeId')
      const me = employeeOptions.find(
        (opt: any) => String(opt.ql_nguoi_dung_id) === String(user?.ql_nguoi_dung_id)
      )

      const defaultVal = isMultipleSelect
        ? (me ? [String(me.value)] : [String(employeeOptions[0].value)])
        : (me ? String(me.value) : String(employeeOptions[0].value))

      if (isEmployeeSelectDisabled) {
        setValue('selectedEmployeeId', defaultVal)
      } else {
        if (!currentId || (Array.isArray(currentId) && currentId.length === 0) || currentId === '') {
          setValue('selectedEmployeeId', defaultVal)
        }
      }
    }
  }, [employeeOptions, user, isEmployeeSelectDisabled, isMultipleSelect, setValue])

  // Fetch existing overtime for selected employee
  const selectedEmployeeId = watch('selectedEmployeeId')
  const { data: existingOvertime = [], isLoading: isLoadingExisting } = useQuery({
    queryKey: ['hrmNgoaiGioExisting', selectedEmployeeId],
    queryFn: async () => {
      const empIds = Array.isArray(selectedEmployeeId) ? selectedEmployeeId : [selectedEmployeeId]
      if (!selectedEmployeeId || empIds.length === 0) return []

      const promises = empIds.map(empId =>
        ngoaiGioAxios.fetch({
          start: 0,
          length: 500,
          searchKey: { id_nhan_vien: empId }
        })
      )
      const results = await Promise.all(promises)
      const combined: any[] = []
      results.forEach(res => {
        if (res?.data?.data) combined.push(...res.data.data)
      })
      return combined
    },
    enabled: !!selectedEmployeeId && (Array.isArray(selectedEmployeeId) ? selectedEmployeeId.length > 0 : true)
  })

  // Total hours across all entries and slots
  const watchedEntries = watch('entries')
  const totalHours = useMemo(() => {
    const draftHours = watchedEntries.reduce((acc, entry) => {
      const slotHours = (entry.slots || []).reduce(
        (s, slot) => s + calcHours(slot.startTime || '', slot.endTime || ''), 0
      )
      return acc + slotHours
    }, 0)
    const existingHours = existingOvertime.reduce((acc: number, item: any) => {
      return acc + (Number(item.so_gio) || 0)
    }, 0)
    return Math.round((draftHours + existingHours) * 100) / 100
  }, [watchedEntries, existingOvertime])

  // ── Entry handlers ─────────────────────────────────────────────

  const handleAddEntry = () => {
    const currentEntries = form.getValues('entries')
    const defaultDate = currentEntries.length === 0 ? moment().format('YYYY-MM-DD') : ''
    append({
      id: Date.now(),
      date: defaultDate,
      reason: '',
      chi_tiet: '',
      slots: [{ id: Date.now(), startTime: '17:30', endTime: '19:00' }]
    })
  }

  const handleRemoveEntry = (index: number) => {
    if (entries.length === 1) {
      toast('Phải có ít nhất một ngày đăng ký', { variant: 'warning' })
      return
    }
    remove(index)
  }

  const handleDuplicateEntry = (index: number) => {
    const currentEntries = form.getValues('entries')
    const source = currentEntries[index]
    const nextDate = source?.date
      ? moment(source.date).add(1, 'day').format('YYYY-MM-DD')
      : moment().add(1, 'day').format('YYYY-MM-DD')
    append({
      id: Date.now(),
      date: nextDate,
      reason: source?.reason || '',
      chi_tiet: source?.chi_tiet || '',
      slots: (source?.slots || []).map(s => ({
        id: Date.now() + Math.random(),
        startTime: s.startTime,
        endTime: s.endTime
      }))
    })
  }

  // ── Submit ─────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (values: OvertimeFormValues) => {
      const empIds = Array.isArray(values.selectedEmployeeId)
        ? values.selectedEmployeeId
        : [values.selectedEmployeeId]
      if (empIds.length === 0) throw new Error('Chưa chọn nhân viên')

      // Flatten: each entry × each slot = one API record
      const payloadData = values.entries.flatMap((entry) =>
        (entry.slots || []).map((slot) => ({
          ngay_dang_ky: entry.date,
          gio_bat_dau: slot.startTime + ':00',
          gio_ket_thuc: slot.endTime + ':00',
          noi_dung: entry.reason,
          chi_tiet: entry.chi_tiet || '',
          so_gio: calcHours(slot.startTime, slot.endTime)
        }))
      )

      const isDotXuat = values.entries[0]?.is_dot_xuat || 0

      if (empIds.length > 1) {
        const res = await ngoaiGioAxios.create({
          id_nhan_vien: empIds.map(Number),
          is_dot_xuat: isDotXuat,
          data: payloadData
        })
        if (!res.success) throw new Error(res.message || 'Tạo đơn ngoài giờ thất bại')
        return res
      } else {
        const res = await ngoaiGioAxios.create({
          id_nhan_vien: Number(empIds[0]),
          is_dot_xuat: isDotXuat,
          data: payloadData
        })
        if (!res.success) throw new Error(res.message || 'Tạo đơn ngoài giờ thất bại')
        return res
      }
    },
    onSuccess: () => {
      toast('Thành công', { description: 'Đã tạo đơn ngoài giờ thành công', variant: 'success' })

      const currentEmp = form.getValues('selectedEmployeeId')
      reset({ selectedEmployeeId: currentEmp, entries: [] })

      queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioExisting', currentEmp] })
      queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGio'] })
      queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioStats'] })
      queryClient.invalidateQueries({ queryKey: ['hrmNgoaiGioDisplay'] })
      queryClient.invalidateQueries({ queryKey: ['ngoaigio-statistics'] })
      onSuccess()
    },
    onError: (error: any) => {
      toast('Lỗi', { description: error.message || 'Không thể tạo đơn ngoài giờ', variant: 'danger' })
    }
  })

  const onSubmit = (values: OvertimeFormValues) => {
    for (const entry of values.entries) {
      if (!entry.date) {
        toast('Vui lòng chọn ngày cho tất cả mục', { variant: 'warning' })
        return
      }
      if (!entry.reason?.trim()) {
        toast('Vui lòng nhập tiêu đề', { variant: 'warning' })
        return
      }
      if (!entry.slots?.length) {
        toast('Vui lòng thêm ít nhất một khung giờ', { variant: 'warning' })
        return
      }
      for (const slot of entry.slots) {
        if (!slot.startTime || !slot.endTime) {
          toast('Vui lòng nhập đầy đủ giờ bắt đầu và kết thúc', { variant: 'warning' })
          return
        }
        if (calcHours(slot.startTime, slot.endTime) <= 0) {
          toast('Giờ kết thúc phải sau giờ bắt đầu', { variant: 'warning' })
          return
        }
      }
    }
    createMutation.mutate(values)
  }

  // Used by calendar view (desktop) for direct submit
  const submitImmediately = async (
    entriesToSubmit: OvertimeRow[],
    overrideEmployeeIds?: string[]
  ) => {
    const currentEmp = form.getValues('selectedEmployeeId')
    const empToUse: string | string[] =
      overrideEmployeeIds && overrideEmployeeIds.length > 0 ? overrideEmployeeIds : currentEmp
    try {
      await createMutation.mutateAsync({
        selectedEmployeeId: empToUse,
        entries: entriesToSubmit
      })
      return true
    } catch {
      return false
    }
  }

  return {
    form,
    entries,
    totalHours,
    employeeOptions,
    existingOvertime,
    handleAddEntry,
    handleRemoveEntry,
    handleDuplicateEntry,
    handleCreate: handleSubmit(onSubmit),
    submitImmediately,
    isLoading: createMutation.isPending,
    isLoadingEmployees,
    isLoadingExisting,
    isEmployeeSelectDisabled,
    isMultipleSelect,
    append,
    remove
  }
}
