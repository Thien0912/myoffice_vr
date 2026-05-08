import { Dispatch, SetStateAction } from 'react'
import { InputFloatingEndLabel } from '@renderer/components/InputFloatingEndLabel'

type FormTrungTamProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  isEdit?: boolean
}

export default function FormTrungTam({ formData, setFormData, isEdit }: FormTrungTamProps) {
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="ps-3 pe-0 py-2">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <InputFloatingEndLabel
            label="Tên trung tâm"
            name="ten_trung_tam"
            isRequired
            value={String(formData.ten_trung_tam ?? '')}
            onChange={(val) => handleChange('ten_trung_tam', val)}
          />
        </div>

        <div>
          <InputFloatingEndLabel
            label="Tên viết tắt"
            name="ten_viet_tat"
            value={String(formData.ten_viet_tat ?? '')}
            onChange={(val) => handleChange('ten_viet_tat', val)}
          />
        </div>

        <div>
          <InputFloatingEndLabel
            label="Tên tiếng Anh"
            name="ten_tieng_anh"
            value={String(formData.ten_tieng_anh ?? '')}
            onChange={(val) => handleChange('ten_tieng_anh', val)}
          />
        </div>

        <div>
          <InputFloatingEndLabel
            label="Email"
            name="email"
            value={String(formData.email ?? '')}
            onChange={(val) => handleChange('email', val)}
          />
        </div>
      </div>
    </div>
  )
}
