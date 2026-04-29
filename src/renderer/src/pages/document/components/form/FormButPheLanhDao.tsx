'use client'
import { useEffect, useState, useMemo } from 'react'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import FileUploadBox from './FileUploadBox'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import { mapLanhDao } from '@renderer/api/documents/nguoidungAxios'
import { Separator } from '@heroui-v3/react'

type FormButPheLanhDaoProps = {
  formData: Record<string, any>
  setFormData: (data: Record<string, any>) => void
  onFilesChange?: (name: string, files: File[]) => void
  fileGroups?: Record<string, File[]>
  documentData?: any
}

export default function FormButPheLanhDao({
  formData,
  setFormData,
  onFilesChange,
  fileGroups = {},
  documentData
}: Partial<FormButPheLanhDaoProps>) {
  const [lanhDaoList, setLanhDaoList] = useState<{ label: string; value: string }[]>([])
  const [ngayButPhe, setNgayButPhe] = useState<string>(() => {
    if (formData?.ngay_but_phe) {
      const val = String(formData.ngay_but_phe).split(' ')[0]
      // Prevent 0000-00-00 or invalid dates
      if (!val || val === '0000-00-00' || !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return ''
      }
      return val
    }
    return ''
  })

  useEffect(() => {
    const fetchData = async () => {
      const list = await mapLanhDao()
      const mapped = list.map((item) => ({
        label: item.name,
        value: String(item.id)
      }))
      setLanhDaoList(mapped)
    }
    fetchData()
  }, [])

  // Xử lý files cũ
  const existingFiles = useMemo(() => {
    if (formData?.file_but_phe) {
      const files =
        typeof formData.file_but_phe === 'string'
          ? JSON.parse(formData.file_but_phe)
          : formData.file_but_phe

      if (Array.isArray(files)) {
        return files.map((f, index) => ({
          id: index,
          name: f.file_name || f.ten_file_goc,
          size: f.file_size || 0,
          url: f.file_path || f.duong_dan,
          type: f.file_extension || ''
        }))
      }
    }
    return []
  }, [formData?.file_but_phe])

  const handleChange = (key: string, value: any) => {
    setFormData?.({
      ...(formData || {}),
      [key]: value
    })
  }

  // Local state để gõ mượt hơn, debounce update ngược lại cha
  const [noiDung, setNoiDung] = useState(formData?.noi_dung_but_phe || '')

  // Reset khi mở văn bản khác
  useEffect(() => {
    setNoiDung(formData?.noi_dung_but_phe || '')
  }, [documentData])

  // Debounce update formData
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData && noiDung !== formData.noi_dung_but_phe) {
        handleChange('noi_dung_but_phe', noiDung)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [noiDung])

  return (
    <div className="space-y-4 min-h-[30dvh]">
      {documentData && (
        <div className="space-y-2 text-sm bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-gray-500">Số hiệu:</span>
            <h5 className="text-slate-600 dark:text-slate-300 text-lg font-bold">
              {documentData.so_hieu_van_ban}
            </h5>
          </div>
          <div className="flex items-center gap-5 h-5">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Số đến:</span>
              <span className="text-slate-600 dark:text-slate-300 text-sm font-bold">
                {documentData.so_van_ban ?? '-'}
              </span>
            </div>
            <Separator orientation="vertical" />
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Loại văn bản:</span>
              <h5 className="text-slate-600 dark:text-slate-300 text-sm font-bold">
                {documentData.ten_loai || documentData.loai_van_ban}
              </h5>
            </div>
          </div>
          <div>
            <span className="text-gray-500 mr-2">Trích yếu:</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {documentData.trich_yeu ?? '-'}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <SelectDropdown
          isRequired
          label="Lãnh đạo"
          name="id_nguoi_but_phe"
          options={lanhDaoList}
          value={String(formData?.id_nguoi_but_phe ?? '')}
          onChange={(val) => handleChange('id_nguoi_but_phe', val)}
        />
      </div>

      <div>
        <DateInputFloatingLabel
          isRequired
          label={'Ngày bút phê'}
          name="ngay_but_phe"
          value={ngayButPhe ?? ''}
          onChange={(val) => {
            setNgayButPhe(val)
            handleChange('ngay_but_phe', val)
          }}
        />
      </div>

      <div>
        <TextareaFloatingLabel
          label="Nội dung"
          name="noi_dung_but_phe"
          rows={2}
          value={noiDung}
          isRequired
          onChange={(val) => setNoiDung(val)}
        />
      </div>

      <input type="hidden" name="trang_thai" value="DA_BUT_PHE" />

      {/* Gửi danh sách file cũ để backend biết cái nào giữ lại */}
      <input type="hidden" name="file_but_phe_old" value={JSON.stringify(existingFiles)} />

      <FileUploadBox
        label="File bút phê"
        name="file_but_phe[]"
        onFilesChange={onFilesChange}
        existingFiles={existingFiles}
        currentFiles={fileGroups['file_but_phe[]']}
      />
    </div>
  )
}
