import { Dispatch, SetStateAction } from 'react'
import { HrFormFieldSelect, HrFormFieldDate, HrFormFieldTextarea } from '@renderer/components/hero-custom'
import FileUploadBox from '@renderer/pages/hr/contract/FileUploadBox'
import { ExistingFile } from '@renderer/shared/CommonInterface'
import { DonviAxios } from '@renderer/api/danhmuc/DonviAxios'
import { VitriAxios } from '@renderer/api/danhmuc/VitriAxios'
import { useQuery } from '@tanstack/react-query'

type FormQuatrinhcongtacProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  onFilesChange?: (name: string, files: File[]) => void
  existingFiles?: ExistingFile[]
}

export default function FormQuatrinhcongtac({
  formData,
  setFormData,
  onFilesChange,
  existingFiles = []
}: FormQuatrinhcongtacProps) {
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const { data: donViList = [] } = useQuery({
    queryKey: ['donvi-list'],
    queryFn: async () => {
      const res = await DonviAxios.fetch({ length: 9999 })
      return res.data || []
    }
  })

  const { data: vitriList = [] } = useQuery({
    queryKey: ['vitri-list'],
    queryFn: async () => {
      const res = await VitriAxios.fetch({ length: 9999 })
      return res.data || []
    }
  })

  return (
    <div className="py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <HrFormFieldSelect
            fieldLabel="Đơn vị"
            name="id_don_vi"
            value={formData.id_don_vi || ''}
            onChange={(val) => handleChange('id_don_vi', val as string)}
            options={donViList.map((item: any) => ({
              value: String(item.id_don_vi),
              label: item.ten_don_vi
            }))}
          />
        </div>

        <div>
          <HrFormFieldSelect
            fieldLabel="Vị trí công việc"
            name="id_vi_tri_cong_viec"
            value={formData.id_vi_tri_cong_viec || ''}
            onChange={(val) => handleChange('id_vi_tri_cong_viec', val as string)}
            options={vitriList.map((item: any) => ({
              value: String(item.id_vi_tri_cong_viec),
              label: item.ten_cong_viec
            }))}
          />
        </div>

        <div>
          <HrFormFieldDate
            fieldLabel="Ngày bắt đầu"
            value={formData.ngay_bat_dau}
            onChangeValue={(val) => handleChange('ngay_bat_dau', val)}
          />
        </div>

        <div>
          <HrFormFieldDate
            fieldLabel="Ngày kết thúc"
            value={formData.ngay_ket_thuc}
            onChangeValue={(val) => handleChange('ngay_ket_thuc', val)}
          />
        </div>

        <div className="md:col-span-2">
          <HrFormFieldTextarea
            fieldLabel="Ghi chú"
            name="ghi_chu"
            value={formData.ghi_chu || ''}
            onChange={(val) => handleChange('ghi_chu', val as string)}
          />
        </div>

        <div className="md:col-span-2">
          <FileUploadBox
            name="files_dinh_kem[]"
            label="File đính kèm"
            onFilesChange={onFilesChange}
            existingFiles={existingFiles}
          />
        </div>
      </div>
    </div>
  )
}
