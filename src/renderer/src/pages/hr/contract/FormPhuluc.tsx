import { useState, useEffect, Dispatch, SetStateAction, useMemo } from 'react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import CustomDatePicker from '@renderer/components/CustomDatePicker'
import FileUploadBox from './FileUploadBox'
import { Checkbox, Chip, Input, Button, Skeleton } from '@heroui/react'
import { Search, X } from 'lucide-react'
import { hopdongAxios } from '@renderer/api/hr/hopdongAxios'

type FormPhulucProps = {
  formData: Record<string, any>
  setFormData: Dispatch<SetStateAction<Record<string, any>>>
  onFilesChange?: (name: string, files: File[]) => void
  contractData?: any
}

export default function FormPhuluc({
  formData,
  setFormData,
  onFilesChange,
  contractData
}: FormPhulucProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAllowances, setSelectedAllowances] = useState<any[]>([])
  const [allowances, setAllowances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const filteredAllowances = useMemo(() => {
    return allowances.filter((item) =>
      item.ten_phu_cap.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, allowances])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectAllowance = (id: number, checked: boolean) => {
    let newSelected = [...selectedAllowances]
    if (checked) {
      newSelected.push(id)
    } else {
      newSelected = newSelected.filter((item) => item != id)
    }
    setSelectedAllowances(newSelected)
    // Update formData with selected IDs if needed, e.g., ids_phu_cap
    handleChange('ids_phu_cap', JSON.stringify(newSelected))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAllowances(filteredAllowances.map((item) => item.id_phu_cap))
      handleChange(
        'ids_phu_cap',
        filteredAllowances.map((item) => item.id_phu_cap)
      )
    } else {
      setSelectedAllowances([])
      handleChange('ids_phu_cap', [])
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await hopdongAxios.fetch({
          getDSNhanVien: 'true',
          dataFilter: 'false'
        })
        if (response.success && response.data) {
          const phuCapMapped = response.data.phu_cap.map((item: any) => ({
            id_phu_cap: item.id_phu_cap,
            ten_phu_cap: item.ten_phu_cap,
            so_tien: Number(item.so_tien)
          }))
          setAllowances(phuCapMapped)
        }
      } catch (error) {
        console.error('Failed to fetch allowances:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const employeeName = contractData?.ho_va_ten || contractData?.ten_nhan_vien || ''
  const contractNumber = contractData?.so_hop_dong || ''

  return (
    <div className="flex flex-col gap-4 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Họ và tên NLĐ */}
        <div>
          <InputFloatingLabel
            label="Họ và tên NLĐ"
            name="ho_va_ten"
            value={employeeName}
            required={true}
            // Use a dummy onChange to satisfy TS if needed, or component handles readonly
            onChange={() => { }}
          />
        </div>

        {/* Số hợp đồng */}
        <div>
          <InputFloatingLabel
            label="Số hợp đồng"
            name="so_hop_dong"
            value={contractNumber}
            onChange={() => { }}
          />
        </div>

        {/* Tên phụ lục */}
        <div className="md:col-span-2">
          <InputFloatingLabel
            label="Tên phụ lục"
            name="ten_phu_luc"
            value={formData.ten_phu_luc || ''}
            required={true}
            onChange={(val) => handleChange('ten_phu_luc', val)}
          />
        </div>

        {/* Ngày ký */}
        <div>
          <CustomDatePicker
            label="Ngày ký"
            radius="sm"
            isRequired={true}
            value={formData.ngay_ky_phu_luc}
            onChange={(val) => handleChange('ngay_ky_phu_luc', val)}
          />
        </div>

        {/* Ngày có hiệu lực */}
        <div>
          <CustomDatePicker
            label="Ngày có hiệu lực"
            radius="sm"
            isRequired={true}
            value={formData.ngay_hieu_luc}
            onChange={(val) => handleChange('ngay_hieu_luc', val)}
          />
        </div>
      </div>

      {/* Danh sách phụ cấp */}
      <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col h-[300px]">
        <div className="p-2 border-b border-gray-200 flex items-center justify-between gap-2 bg-gray-50">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              color="success"
              className="text-white font-medium"
              onPress={() => handleSelectAll(true)}
            >
              Chọn tất cả
            </Button>
            {selectedAllowances.length > 0 && (
              <span className="text-small text-gray-500">
                Số mục đã chọn: {selectedAllowances.length}
              </span>
            )}
          </div>
          <div className="relative w-full max-w-[200px]">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-2 pr-8 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-col gap-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded border border-gray-100"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Skeleton className="w-5 h-5 rounded-md" />
                    <Skeleton className="w-1/2 h-4 rounded-md" />
                  </div>
                  <Skeleton className="w-20 h-4 rounded-md" />
                </div>
              ))
            ) : (
              <>
                {filteredAllowances.map((item) => (
                  <div
                    key={item.id_phu_cap}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 transition-colors"
                  >
                    <Checkbox
                      isSelected={selectedAllowances.some(
                        (selected) => selected == item.id_phu_cap
                      )}
                      onValueChange={(checked) => handleSelectAllowance(item.id_phu_cap, checked)}
                    >
                      <span className="text-sm text-gray-700">{item.ten_phu_cap}</span>
                    </Checkbox>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.so_tien)}
                    </span>
                  </div>
                ))}
                {filteredAllowances.length === 0 && (
                  <div className="text-center text-gray-400 py-4 italic text-sm">
                    Không tìm thấy phụ cấp nào
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* File phụ lục - Using simple button style or reusing FileUploadBox if appropriate */}
      {/* The image shows a simple 'File phụ lục' button-like element. I'll use FileUploadBox but visually minimal maybe? */}
      {/* Or just a button that triggers file input. But FileUploadBox handles logic well. */}
      <div>
        <FileUploadBox name="file_phu_luc[]" label="File phụ lục" onFilesChange={onFilesChange} />
      </div>
    </div>
  )
}
