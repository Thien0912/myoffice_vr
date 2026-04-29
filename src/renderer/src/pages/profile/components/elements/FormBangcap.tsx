import { Dispatch, SetStateAction, useRef } from 'react'
import { HrFormField, HrFormFieldSelect } from '@renderer/components/hero-custom'
import { Paperclip, X, FileText, ImageIcon } from 'lucide-react'
import MonthYearPicker from './MonthYearPicker'

type FormBangcapProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  onFileChange?: (file: File | null) => void
}

export default function FormBangcap({ formData, setFormData, onFileChange }: FormBangcapProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFormData((prev) => ({
      ...prev,
      file,
      file_path: null,
      file_name: null,
      file_extension: null,
      file_size: null,
    }))
    onFileChange?.(file)
    e.target.value = ''
  }

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
      file_path: null,
      file_name: null,
      file_extension: null,
      file_size: null,
    }))
    onFileChange?.(null)
  }

  const selectedFile: File | null = formData.file ?? null
  const existingFilePath: string | null = formData.file_path ?? null
  const hasFile = selectedFile || existingFilePath

  const isImage = selectedFile
    ? selectedFile.type.startsWith('image/')
    : existingFilePath
      ? /\.(jpg|jpeg|png|gif|webp)$/i.test(existingFilePath)
      : false

  return (
    <div className="py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <MonthYearPicker
            label="Từ tháng"
            value={formData.tu_thang}
            onChange={(val) => handleChange('tu_thang', val)}
          />
        </div>

        <div>
          <MonthYearPicker
            label="Đến tháng"
            value={formData.den_thang}
            onChange={(val) => handleChange('den_thang', val)}
          />
        </div>

        <div>
          <HrFormField
            fieldLabel="Nơi đào tạo"
            name="noi_dao_tao"
            value={formData.noi_dao_tao || ''}
            onChange={(val) => handleChange('noi_dao_tao', val)}
          />
        </div>

        <div>
          <HrFormField
            fieldLabel="Chuyên ngành"
            name="chuyen_nganh"
            value={formData.chuyen_nganh || ''}
            onChange={(val) => handleChange('chuyen_nganh', val)}
          />
        </div>

        <div>
          <HrFormField
            fieldLabel="Trình độ đào tạo"
            name="trinh_do_dt"
            value={formData.trinh_do_dt || ''}
            onChange={(val) => handleChange('trinh_do_dt', val)}
          />
        </div>

        <div>
          <HrFormFieldSelect
            fieldLabel="Xếp loại"
            name="xep_loai_dt"
            value={formData.xep_loai_dt || ''}
            options={[
              { value: 'Khong_dat', label: 'Không đạt' },
              { value: 'Trung_binh', label: 'Trung bình' },
              { value: 'Kha', label: 'Khá' },
              { value: 'Gioi', label: 'Giỏi' },
              { value: 'Xuat_sac', label: 'Xuất sắc' }
            ]}
            onChange={(val) => handleChange('xep_loai_dt', val as string)}
          />
        </div>

        <div className="md:col-span-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          {hasFile ? (
            <div className="flex items-center gap-2 p-2.5 border border-default-200 rounded-lg bg-default-50">
              <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-white border border-default-100">
                {isImage
                  ? <ImageIcon size={16} className="text-blue-500" />
                  : <FileText size={16} className="text-red-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-default-700 truncate">
                  {selectedFile ? selectedFile.name : (existingFilePath?.split('/').pop() ?? 'File đính kèm')}
                </p>
                <p className="text-xs text-default-400">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'File hiện tại'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-500 hover:underline shrink-0"
              >
                Đổi file
              </button>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 text-default-400 hover:text-danger rounded-full hover:bg-danger-50 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 px-3 py-2.5 border border-dashed border-default-300 rounded-lg text-default-500 hover:border-primary hover:text-primary hover:bg-primary-50 transition-colors text-sm"
            >
              <Paperclip size={15} />
              <span>Đính kèm file bằng cấp (ảnh/PDF) — Không bắt buộc</span>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
