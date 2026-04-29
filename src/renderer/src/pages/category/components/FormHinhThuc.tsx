import { Dispatch, SetStateAction } from 'react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'

type FormHinhThucProps = {
    formData: Record<string, any>
    setFormData: Dispatch<SetStateAction<Record<string, any>>>
    isEdit?: boolean
}

export default function FormHinhThuc({ formData, setFormData }: FormHinhThucProps) {
    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="ps-3 pe-0 py-2">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <InputFloatingLabel
                        label="Tên hình thức"
                        name="ten_hinh_thuc"
                        isRequired
                        value={formData.ten_hinh_thuc || ''}
                        onChange={(val) => handleChange('ten_hinh_thuc', val)}
                    />
                </div>

                <div>
                    <InputFloatingLabel
                        label="Mã hình thức"
                        name="ma_hinh_thuc"
                        value={formData.ma_hinh_thuc || ''}
                        onChange={(val) => handleChange('ma_hinh_thuc', val)}
                    />
                </div>
            </div>
        </div>
    )
}
