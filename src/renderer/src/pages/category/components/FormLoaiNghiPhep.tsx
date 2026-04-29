import { Dispatch, SetStateAction } from 'react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import { Switch } from '@heroui/react'

type FormLoaiNghiPhepProps = {
    formData: Record<string, any>
    setFormData: Dispatch<SetStateAction<Record<string, any>>>
    isEdit?: boolean
}

export default function FormLoaiNghiPhep({ formData, setFormData }: FormLoaiNghiPhepProps) {
    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="ps-3 pe-0 py-2">
            <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputFloatingLabel
                        label="Mã loại nghỉ phép"
                        name="ma_loai_phep"
                        isRequired
                        value={formData.ma_loai_phep || ''}
                        onChange={(val) => handleChange('ma_loai_phep', val)}
                    />
                    <InputFloatingLabel
                        label="Tên loại nghỉ phép"
                        name="ten_loai_phep"
                        isRequired
                        value={formData.ten_loai_phep || ''}
                        onChange={(val) => handleChange('ten_loai_phep', val)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <InputFloatingLabel
                        label="Số ngày mặc định"
                        name="so_ngay_mac_dinh"
                        type="number"
                        value={formData.so_ngay_mac_dinh || ''}
                        onChange={(val) => handleChange('so_ngay_mac_dinh', val)}
                    />
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">Có tính lương?</span>
                        <Switch
                            isSelected={formData.co_tinh_luong === 1 || formData.co_tinh_luong === true}
                            onValueChange={(val) => handleChange('co_tinh_luong', val ? 1 : 0)}
                            color="primary"
                            size="sm"
                        />
                    </div>
                </div>

                <TextareaFloatingLabel
                    label="Ghi chú"
                    name="ghi_chu"
                    value={formData.ghi_chu || ''}
                    onChange={(val) => handleChange('ghi_chu', val)}
                />
            </div>
        </div>
    )
}
