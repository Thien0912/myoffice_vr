import { Dispatch, SetStateAction } from 'react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'

type FormViTriCongViecProps = {
    formData: Record<string, any>
    setFormData: Dispatch<SetStateAction<Record<string, any>>>
}

export default function FormViTriCongViec({ formData, setFormData }: FormViTriCongViecProps) {

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="ps-3 pe-0 py-2">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <InputFloatingLabel
                        label="Tên vị trí công việc"
                        name="ten_cong_viec"
                        isRequired
                        value={formData.ten_cong_viec || ''}
                        onChange={(val) => handleChange('ten_cong_viec', val)}
                    />
                </div>

                <div>
                    <InputFloatingLabel
                        label="Tên tiếng anh"
                        name="ten_cong_viec_en"
                        value={formData.ten_cong_viec_en || ''}
                        onChange={(val) => handleChange('ten_cong_viec_en', val)}
                    />
                </div>
            </div>
        </div>
    )
}
