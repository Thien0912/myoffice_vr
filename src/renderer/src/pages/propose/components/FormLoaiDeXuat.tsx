import { Divider } from '@heroui/react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import { Dispatch, SetStateAction } from 'react'
import QuyTrinhKy from './QuyTrinhKy'

const CHON_DON_VI_OPTIONS = [
    { value: '0', label: 'Không cần chọn' },
    { value: '1', label: 'Bắt buộc chọn' },
    { value: '2', label: 'Có hoặc không' }
]

type FormLoaiDeXuatProps = {
    formData: Record<string, any>
    setFormData: Dispatch<SetStateAction<Record<string, any>>>
    isEdit?: boolean
}

export default function FormLoaiDeXuat({ formData, setFormData, isEdit }: FormLoaiDeXuatProps) {
    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="ps-3 pe-0 py-2 flex flex-col gap-5">
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <InputFloatingLabel
                        label="Mã loại"
                        name="ma_loai"
                        isRequired
                        value={formData.ma_loai || ''}
                        onChange={(val) => handleChange('ma_loai', val)}
                        disabled={isEdit}
                    />
                </div>

                <div>
                    <SelectDropdown
                        label="Chọn đơn vị"
                        name="chon_don_vi"
                        isRequired
                        value={String(formData.chon_don_vi ?? '0')}
                        onChange={(val) => handleChange('chon_don_vi', val)}
                        options={CHON_DON_VI_OPTIONS}
                    />
                </div>

                <div className="md:col-span-2">
                    <InputFloatingLabel
                        label="Tên loại đề xuất"
                        name="ten_loai"
                        isRequired
                        value={formData.ten_loai || ''}
                        onChange={(val) => handleChange('ten_loai', val)}
                    />
                </div>

                <div className="md:col-span-2">
                    <TextareaFloatingLabel
                        label="Mô tả"
                        name="mo_ta"
                        value={formData.mo_ta || ''}
                        onChange={(val) => handleChange('mo_ta', val)}
                        rows={3}
                    />
                </div>
            </div>

            <Divider />

            {/* Quy trình trình ký */}
            <div className="flex flex-col gap-3">
                <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Quy trình trình ký
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Thiết lập thứ tự các đơn vị phê duyệt đề xuất này
                    </p>
                </div>
                <QuyTrinhKy formData={formData} setFormData={setFormData} />
            </div>
        </div>
    )
}
