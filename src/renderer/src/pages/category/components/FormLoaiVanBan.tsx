import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { DonviAxios, mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import { SelectDropdown, SelectGroup, SelectOption } from '@renderer/components/SelectDropdown'

type FormLoaiVanBanProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  isEdit?: boolean
}

export default function FormLoaiVanBan({ formData, setFormData, isEdit }: FormLoaiVanBanProps) {
  const [donviOptions, setDonviOptions] = useState<(SelectOption | SelectGroup)[]>([])

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const fetchDonvi = async () => {
      const [groupedUnits] = await Promise.all([mapDonviGroupedOptions()])
      setDonviOptions(groupedUnits || [])

    }
    fetchDonvi()
  }, [])

  return (
    <div className="ps-3 pe-0 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <InputFloatingLabel
            label="Tên loại"
            name="ten_loai"
            value={formData.ten_loai || ''}
            onChange={(val) => handleChange('ten_loai', val)}
          />
        </div>

        <div>
          <InputFloatingLabel
            label="Tiền tố"
            name="tien_to"
            value={formData.tien_to || ''}
            onChange={(val) => handleChange('tien_to', val)}
          />
        </div>

        <div>
          <InputFloatingLabel
            label="Hậu tố"
            name="hau_to"
            isRequired
            value={formData.hau_to || ''}
            onChange={(val) => handleChange('hau_to', val)}
          />
        </div>

        <div>
          <SelectDropdown
            label="Thuộc đơn vị"
            name="id_don_vi"
            value={String(formData.id_don_vi ?? '')}
            onChange={(val) => handleChange('id_don_vi', val)}
            options={donviOptions}
          />
        </div>

        <div>
          <SelectDropdown
            label="Thuộc nhóm"
            name="thuoc_nhom"
            isRequired
            value={String(formData.thuoc_nhom ?? '')}
            onChange={(val) => handleChange('thuoc_nhom', val)}
            options={[
              { value: 'CTHDT', label: 'Chủ tịch HĐT' },
              { value: 'BGH', label: 'Ban Giám Hiệu' },
              { value: 'HDT', label: 'Hội Đồng Trường' },
              { value: 'DONVI', label: 'Đơn vị' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
