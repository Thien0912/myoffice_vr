import { Dispatch, SetStateAction, useEffect, useMemo } from 'react'
import { HrFormField, HrFormFieldSelect, HrFormFieldTextarea } from '@renderer/components/hero-custom'
import { Checkbox } from '@heroui/react'

type FormKinhnghiemProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
}

export default function FormKinhnghiemlamviec({ formData, setFormData }: FormKinhnghiemProps) {
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const { startMonth, startYear } = useMemo(() => {
    const val = formData.ngay_bat_dau
    if (!val) return { startMonth: '', startYear: '' }
    const parts = String(val).split('-')
    if (parts.length === 3) {
      if (parts[0].length === 4) return { startYear: parts[0], startMonth: parts[1] }
      if (parts[2].length === 4) return { startYear: parts[2], startMonth: parts[1] }
    }
    return { startMonth: '', startYear: '' }
  }, [formData.ngay_bat_dau])

  const handleStartDateChange = (field: 'month' | 'year', value: string) => {
    const currentMonth = startMonth || String(new Date().getMonth() + 1).padStart(2, '0')
    const currentYear = startYear || String(new Date().getFullYear())

    const newMonth = field === 'month' ? value : currentMonth
    const newYear = field === 'year' ? value : currentYear

    if (!newMonth || !newYear) return

    const formattedDate = `${newYear}-${newMonth.padStart(2, '0')}-01`
    handleChange('ngay_bat_dau', formattedDate)
  }

  const { endMonth, endYear } = useMemo(() => {
    const val = formData.ngay_ket_thuc
    if (!val) return { endMonth: '', endYear: '' }
    const parts = String(val).split('-')
    if (parts.length === 3) {
      if (parts[0].length === 4) return { endYear: parts[0], endMonth: parts[1] }
      if (parts[2].length === 4) return { endYear: parts[2], endMonth: parts[1] }
    }
    return { endMonth: '', endYear: '' }
  }, [formData.ngay_ket_thuc])

  const handleEndDateChange = (field: 'month' | 'year', value: string) => {
    const currentMonth = endMonth || String(new Date().getMonth() + 1).padStart(2, '0')
    const currentYear = endYear || String(new Date().getFullYear())

    const newMonth = field === 'month' ? value : currentMonth
    const newYear = field === 'year' ? value : currentYear

    if (!newMonth || !newYear) return

    const formattedDate = `${newYear}-${newMonth.padStart(2, '0')}-01`
    handleChange('ngay_ket_thuc', formattedDate)
  }

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1
      return {
        value: String(m).padStart(2, '0'),
        label: `Tháng ${m}`
      }
    })
  }, [])

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear()
    const start = current - 50
    const end = current + 1
    const opts: { value: string; label: string }[] = []

    for (let i = start; i <= end; i++) {
      opts.push({ value: String(i), label: String(i) })
    }
    return opts.reverse()
  }, [])

  useEffect(() => {
    if (!formData.la_kinh_nghiem_noi_bo) {
      handleChange('la_kinh_nghiem_noi_bo', 0)
    }
  }, [])

  return (
    <div className="py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <HrFormField
            fieldLabel="Tên công ty"
            name="ten_cong_ty"
            value={formData.ten_cong_ty || ''}
            onChange={(val) => handleChange('ten_cong_ty', val)}
          />
        </div>

        <div>
          <HrFormField
            fieldLabel="Chức danh"
            name="chuc_danh"
            value={formData.chuc_danh || ''}
            onChange={(val) => handleChange('chuc_danh', val)}
          />
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-2">
          <HrFormFieldSelect
            fieldLabel="Tháng bắt đầu"
            name="start_month"
            value={startMonth}
            options={monthOptions}
            onChange={(val) => handleStartDateChange('month', val as string)}
          />
          <HrFormFieldSelect
            fieldLabel="Năm bắt đầu"
            name="start_year"
            value={startYear}
            options={yearOptions}
            onChange={(val) => handleStartDateChange('year', val as string)}
          />
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-2">
          <HrFormFieldSelect
            fieldLabel="Tháng kết thúc"
            name="end_month"
            value={endMonth}
            options={monthOptions}
            onChange={(val) => handleEndDateChange('month', val as string)}
          />
          <HrFormFieldSelect
            fieldLabel="Năm kết thúc"
            name="end_year"
            value={endYear}
            options={yearOptions}
            onChange={(val) => handleEndDateChange('year', val as string)}
          />
        </div>

        <div className="md:col-span-2">
          <Checkbox
            isSelected={!!formData.la_kinh_nghiem_noi_bo}
            onValueChange={(val) => handleChange('la_kinh_nghiem_noi_bo', val ? 1 : 0)}
          >
            Là kinh nghiệm làm việc nội bộ
          </Checkbox>
        </div>

        <div className="md:col-span-2">
          <HrFormFieldTextarea
            fieldLabel="Mô tả công việc"
            name="mo_ta"
            value={formData.mo_ta || ''}
            onChange={(val) => handleChange('mo_ta', val as string)}
          />
        </div>
      </div>
    </div>
  )
}
