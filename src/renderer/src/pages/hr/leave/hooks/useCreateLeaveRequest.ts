import { useMemo, useEffect } from 'react'
import moment from 'moment'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { nghiphepAxios } from '@renderer/api/hr/nghiphepAxios'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { mapLoaiNghiPhepOptions } from '@renderer/api/danhmuc/loaiNghiPhepAxios'
import { useForm, useFieldArray } from 'react-hook-form'
import { canAccess } from '@renderer/utils/permissions/permissions'
import { toast } from "@heroui-v3/react";

export interface DayRow {
  id: string | number
  date: string
  sang: boolean
  chieu: boolean
}

export interface LeaveRequestFormValues {
  selectedEmployeeId: string
  idLoaiPhep: string
  loaiNghi: string
  lyDo: string
  minhChung: File | null
  days: DayRow[]
}

interface UseCreateLeaveRequestProps {
  onSuccess: () => void
  onOpenChange: (open: boolean) => void
  editingData?: any
}

export const useCreateLeaveRequest = ({
  onSuccess,
  onOpenChange,
  editingData
}: UseCreateLeaveRequestProps) => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const form = useForm<LeaveRequestFormValues>({
    defaultValues: {
      selectedEmployeeId: '',
      loaiNghi: 'Binh_thuong',
      idLoaiPhep: '',
      lyDo: '',
      minhChung: null,
      days: [{ id: Date.now(), date: moment().format('YYYY-MM-DD'), sang: true, chieu: true }]
    }
  })

  const { control, handleSubmit, setValue, watch, reset } = form

  // Sync editingData to form
  useEffect(() => {
    if (editingData) {
      reset({
        selectedEmployeeId: String(editingData.id_nhan_vien),
        idLoaiPhep: String(editingData.id_loai_phep),
        loaiNghi: editingData.loai_nghi,
        lyDo: editingData.ly_do_nghi,
        minhChung: null, // Files cannot be pre-filled usually
        days: (editingData.chi_tiet_ngay_nghi || []).map((d: any, index: number) => ({
          id: index,
          date: d.ngay_nghi,
          sang: d.buoi_nghi === 'Sang' || d.buoi_nghi === 'Ca_ngay',
          chieu: d.buoi_nghi === 'Chieu' || d.buoi_nghi === 'Ca_ngay'
        }))
      })
    } else {
      // Khi mở form mới, reset về mặc định và giữ lại nhân viên/loại phép nếu đã có
      reset({
        selectedEmployeeId: '',
        idLoaiPhep: '',
        loaiNghi: 'Binh_thuong',
        lyDo: '',
        minhChung: null,
        days: [{ id: Date.now(), date: moment().format('YYYY-MM-DD'), sang: true, chieu: true }]
      })
    }
  }, [editingData, reset])

  const {
    fields: days,
    append,
    remove,
    update
  } = useFieldArray({
    control,
    name: 'days'
  })

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

  const isAdminOrLeader = useMemo(() => {
    if (!user) return false
    return canAccess('nghiphep.approve') || canAccess('nghiphep.create_for')
  }, [user])

  const isEmployeeSelectDisabled = !isAdminOrLeader

  // Tự động chọn nhân viên đầu tiên (hoặc chính mình nếu tìm thấy)
  useEffect(() => {
    if (employeeOptions.length > 0 && !editingData) {
      const currentEmployeeId = form.getValues('selectedEmployeeId')
      const me = employeeOptions.find((opt) => String(opt.ql_nguoi_dung_id) === String(user?.ql_nguoi_dung_id))

      if (isEmployeeSelectDisabled) {
        if (me && currentEmployeeId !== String(me.value)) {
          setValue('selectedEmployeeId', String(me.value))
        }
      } else {
        if (!currentEmployeeId || currentEmployeeId === '') {
          if (me) {
            setValue('selectedEmployeeId', String(me.value))
          } else {
            setValue('selectedEmployeeId', String(employeeOptions[0].value))
          }
        }
      }
    }
  }, [employeeOptions, user, isEmployeeSelectDisabled, setValue, editingData])

  const { data: leaveTypeOptions = [], isLoading: isLoadingLeaveTypes } = useQuery({
    queryKey: ['hrmLoaiNghiPhep'],
    queryFn: mapLoaiNghiPhepOptions
  })

  // Tự động chọn loại phép đầu tiên
  useEffect(() => {
    const currentLeaveType = form.getValues('idLoaiPhep')
    if (
      leaveTypeOptions.length > 0 &&
      (!currentLeaveType || currentLeaveType === '') &&
      !editingData
    ) {
      setValue('idLoaiPhep', String(leaveTypeOptions[0].value))
    }
  }, [leaveTypeOptions, setValue, editingData])

  const handleAddDay = () => {
    append({ id: Date.now(), date: '', sang: true, chieu: true })
  }

  const handleRemoveDay = (index: number) => {
    if (days.length === 1) {
      toast('Phải có ít nhất một ngày nghỉ', { variant: 'warning' })
      return
    }
    remove(index)
  }

  const handleUpdateDay = (index: number, field: keyof DayRow, value: any) => {
    const currentDay = days[index]
    if (field === 'date' && value) {
      const formattedDate = typeof value === 'string' ? value.slice(0, 10) : value
      const isDuplicate = days.some((d, idx) => idx !== index && d.date === formattedDate)

      if (isDuplicate) {
        toast(`Ngày ${moment(formattedDate).format('DD/MM/YYYY')} đã có trong danh sách`, { description: 'Dòng này sẽ bị xóa, vui lòng thao tác trên dòng đã có.', variant: 'warning' })
        remove(index)
        return
      }
      update(index, { ...currentDay, date: formattedDate })
      return
    }
    update(index, { ...currentDay, [field]: value })
  }

  const watchedDays = watch('days')
  const totalDays = useMemo(() => {
    return watchedDays.reduce((acc, day) => {
      let count = 0
      if (day.sang) count += 0.5
      if (day.chieu) count += 0.5
      return acc + count
    }, 0)
  }, [watchedDays])

  const leaveMutation = useMutation({
    mutationFn: (payload: any) =>
      editingData ? nghiphepAxios.update(payload) : nghiphepAxios.create(payload),
    onSuccess: (res) => {
      if (res.success) {
        if (!editingData && res.data?.uuid_nghi_phep) {
          nghiphepAxios.sendEmail(res.data.uuid_nghi_phep)
        }

        toast('Thành công', { description: editingData
                      ? 'Đã cập nhật đơn nghỉ phép'
                      : 'Đã tạo đơn nghỉ phép thành công', variant: 'success' })

        // Reset form nhưng giữ lại các mặc định quan trọng
        const currentEmp = form.getValues('selectedEmployeeId')
        const currentType = form.getValues('idLoaiPhep')

        reset({
          selectedEmployeeId: currentEmp,
          idLoaiPhep: currentType,
          loaiNghi: 'Binh_thuong',
          lyDo: '',
          minhChung: null,
          days: [{ id: Date.now(), date: moment().format('YYYY-MM-DD'), sang: true, chieu: true }]
        })

        queryClient.invalidateQueries({ queryKey: ['hrmNghiPhep'] })
        onSuccess()
        onOpenChange(false)
      } else {
        toast('Lỗi', { description: res.message || (editingData ? 'Cập nhật thất bại' : 'Tạo đơn thất bại'), variant: 'danger' })
      }
    },
    onError: () => {
      toast('Lỗi hệ thống', { description: 'Không thể kết nối đến máy chủ', variant: 'danger' })
    }
  })

  const onSubmit = (values: LeaveRequestFormValues) => {
    // 1. Tự động xác định hình thức nghỉ:
    // Nếu có bất kỳ ngày nghỉ nào là TODAY hoặc PAST -> Đột xuất
    // Nếu tất cả ngày nghỉ đều là FUTURE -> Bình thường
    const today = moment().startOf('day')
    const hasTodayOrPast = values.days.some((d) => moment(d.date).isSameOrBefore(today, 'day'))
    const calculatedLoaiNghi = hasTodayOrPast ? 'Dot_xuat' : 'Binh_thuong'

    const formData = new FormData()
    if (editingData?.uuid_nghi_phep) {
      formData.append('uuid_nghi_phep', editingData.uuid_nghi_phep)
    }
    formData.append('id_nhan_vien', values.selectedEmployeeId)
    formData.append('id_loai_phep', values.idLoaiPhep)
    formData.append('loai_nghi', calculatedLoaiNghi)
    formData.append('ly_do_nghi', values.lyDo)
    formData.append(
      'danh_sach_ngay_nghi',
      JSON.stringify(
        values.days.map((d) => ({
          ngay_nghi: d.date,
          sang: d.sang,
          chieu: d.chieu
        }))
      )
    )

    if (values.minhChung) {
      formData.append('minh_chung', values.minhChung)
    }

    leaveMutation.mutate(formData)
  }

  return {
    form,
    days,
    totalDays,
    employeeOptions,
    leaveTypeOptions,
    handleAddDay,
    handleRemoveDay,
    handleUpdateDay,
    handleCreate: handleSubmit(onSubmit),
    isLoading: leaveMutation.isPending,
    isLoadingEmployees,
    isLoadingLeaveTypes,
    isEmployeeSelectDisabled
  }
}
