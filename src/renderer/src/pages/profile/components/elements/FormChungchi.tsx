import { Dispatch, SetStateAction } from 'react'
import { HrFormField, HrFormFieldDate } from '@renderer/components/hero-custom'
import FileUploadBox from '@renderer/pages/hr/contract/FileUploadBox'
import { ExistingFile } from '@renderer/shared/CommonInterface'

type FormChungchiProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  onFilesChange?: (name: string, files: File[]) => void
  existingFiles?: ExistingFile[]
}

export default function FormChungchi({
  formData,
  setFormData,
  onFilesChange,
  existingFiles = []
}: FormChungchiProps) {
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <HrFormField
            fieldLabel="Tên chứng chỉ"
            name="ten_chung_chi"
            value={formData.ten_chung_chi || ''}
            onChange={(val) => handleChange('ten_chung_chi', val)}
          />
        </div>

        <div>
          <HrFormFieldDate
            fieldLabel="Ngày cấp chứng chỉ"
            value={formData.ngay_cap_chung_chi}
            onChangeValue={(val) => handleChange('ngay_cap_chung_chi', val)}
          />
        </div>

        <div>
          <HrFormField
            fieldLabel="Nơi cấp"
            name="noi_cap"
            value={formData.noi_cap || ''}
            onChange={(val) => handleChange('noi_cap', val)}
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
