import { Dispatch, SetStateAction } from 'react'
import { InputFloatingEndLabel } from '@renderer/components/InputFloatingEndLabel'

type FormTruongProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  isEdit?: boolean
}

export default function FormTruong({ formData, setFormData, isEdit }: FormTruongProps) {
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="ps-3 pe-0 py-2">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <InputFloatingEndLabel
            label="Tên trường"
            name="ten_truong"
            isRequired
            value={String(formData.ten_truong ?? '')}
            onChange={(val) => handleChange('ten_truong', val)}
          />
        </div>

        <div>
          <InputFloatingEndLabel
            label="Mã trường"
            name="ma_truong"
            value={String(formData.ma_truong ?? '')}
            onChange={(val) => handleChange('ma_truong', val)}
          />
        </div>
      </div>
    </div>
  )
}
