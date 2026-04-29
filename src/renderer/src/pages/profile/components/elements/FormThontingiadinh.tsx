import { Dispatch, SetStateAction, useState, useEffect } from 'react'
import { HrFormField, HrFormFieldSelect } from '@renderer/components/hero-custom'

type FormThongtingiadinhProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
}

export default function FormThongtingiadinh({ formData: initialData, setFormData }: FormThongtingiadinhProps) {
  const [localData, setLocalData] = useState<Record<string, any>>(initialData)

  useEffect(() => {
    setLocalData(initialData)
  }, [initialData])
  const handleChange = (name: string, value: any) => {
    setLocalData((prev) => {
      const next = { ...prev, [name]: value }
      setFormData(next)
      return next
    })
  }

  const genderOptions = [
    { value: '1', label: 'Nam' },
    { value: '0', label: 'Nữ' }
  ]

  return (
    <div className="py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <HrFormField
            fieldLabel="Họ tên"
            name="ho_ten"
            value={localData.ho_ten || ''}
            onChange={(val) => handleChange('ho_ten', val)}
          />
        </div>

        <div>
          <HrFormField
            fieldLabel="Mối quan hệ"
            name="moi_quan_he"
            value={localData.moi_quan_he || ''}
            onChange={(val) => handleChange('moi_quan_he', val)}
          />
        </div>

        <div>
          <HrFormField
            fieldLabel="Năm sinh"
            name="nam_sinh"
            type="number"
            value={localData.nam_sinh || ''}
            onChange={(val) => handleChange('nam_sinh', val)}
          />
        </div>

        <div>
          <HrFormFieldSelect
            fieldLabel="Giới tính"
            name="gioi_tinh"
            value={localData.gioi_tinh ? String(localData.gioi_tinh) : ''}
            options={genderOptions}
            onChange={(val) => handleChange('gioi_tinh', val as string)}
          />
        </div>

        <div>
          <HrFormField
            fieldLabel="Nghề nghiệp"
            name="nghe_nghiep"
            value={localData.nghe_nghiep || ''}
            onChange={(val) => handleChange('nghe_nghiep', val)}
          />
        </div>

        <div>
          <HrFormField
            fieldLabel="Số điện thoại"
            name="so_dien_thoai"
            value={localData.so_dien_thoai || ''}
            onChange={(val) => handleChange('so_dien_thoai', val)}
          />
        </div>
      </div>
    </div>
  )
}
