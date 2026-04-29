import { Dispatch, SetStateAction, useMemo } from 'react'
import { HrFormField, HrFormFieldSelect, HrFormFieldTextarea } from '@renderer/components/hero-custom'

type FormDanhgiaProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
}

export default function FormDanhgia({ formData, setFormData }: FormDanhgiaProps) {
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const { month, year } = useMemo(() => {
    const val = formData.thang
    if (!val) return { month: '', year: '' }
    const parts = String(val).split('-')

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return { year: parts[0], month: parts[1] }
      }
      if (parts[2].length === 4) {
        return { year: parts[2], month: parts[1] }
      }
    }
    return { month: '', year: '' }
  }, [formData.thang])

  const handleDateChange = (field: 'month' | 'year', value: string) => {
    const currentMonth = month || String(new Date().getMonth() + 1).padStart(2, '0')
    const currentYear = year || String(new Date().getFullYear())

    const newMonth = field === 'month' ? value : currentMonth
    const newYear = field === 'year' ? value : currentYear

    if (!newMonth || !newYear) return

    const formattedDate = `${newYear}-${newMonth.padStart(2, '0')}-01`
    handleChange('thang', formattedDate)
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
    const start = current - 10
    const end = current + 10
    const opts: { value: string; label: string }[] = []

    for (let i = start; i <= end; i++) {
      opts.push({ value: String(i), label: String(i) })
    }
    return opts.reverse()
  }, [])

  return (
    <div className="py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-2">
          <HrFormFieldSelect
            fieldLabel="Tháng"
            name="select_thang"
            value={month}
            options={monthOptions}
            onChange={(val) => handleDateChange('month', val as string)}
          />
          <HrFormFieldSelect
            fieldLabel="Năm"
            name="select_nam"
            value={year}
            options={yearOptions}
            onChange={(val) => handleDateChange('year', val as string)}
          />
        </div>

        <div>
          <HrFormField
            fieldLabel="Điểm số"
            name="diem_so"
            type="number"
            value={formData.diem_so || ''}
            onChange={(val) => handleChange('diem_so', val)}
          />
        </div>

        <div className="md:col-span-2">
          <HrFormFieldTextarea
            fieldLabel="Nhận xét"
            name="nhan_xet"
            value={formData.nhan_xet || ''}
            onChange={(val) => handleChange('nhan_xet', val)}
          />
        </div>
      </div>
    </div>
  )
}
