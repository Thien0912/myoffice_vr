import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { InputFloatingEndLabel } from '@renderer/components/InputFloatingEndLabel'
import { SelectFloatingLabel } from '@renderer/components/SelectFloatingLabel'
import { TruongAxios } from '@renderer/api/danhmuc/donviDemoAxios'

type FormKhoaProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  isEdit?: boolean
}

export default function FormKhoa({ formData, setFormData, isEdit }: FormKhoaProps) {
  const [truongOptions, setTruongOptions] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    // Load danh sách trường
    TruongAxios.fetch({ length: 9999 }).then((res) => {
      if (res?.success && res.data) {
        setTruongOptions([
          { value: '', label: '-- Không thuộc trường nào --' },
          ...res.data.map((item: any) => ({
            value: String(item.id_truong),
            label: item.ten_truong
          }))
        ])
      }
    })
  }, [])

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="ps-3 pe-0 py-2">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <InputFloatingEndLabel
            label="Tên khoa"
            name="ten_khoa"
            isRequired
            value={String(formData.ten_khoa ?? '')}
            onChange={(val) => handleChange('ten_khoa', val)}
          />
        </div>

        <div>
          <SelectFloatingLabel
            label="Thuộc trường"
            name="id_truong"
            value={formData.id_truong || ''}
            options={truongOptions}
            onChange={(val) => handleChange('id_truong', val)}
          />
        </div>
      </div>
    </div>
  )
}
