import { Dispatch, SetStateAction } from 'react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'

type FormBaoMatProps = {
    formData: Record<string, any>
    setFormData: Dispatch<SetStateAction<Record<string, any>>>
    isEdit?: boolean
}

export default function FormBaoMat({ formData, setFormData }: FormBaoMatProps) {
    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="ps-3 pe-0 py-2">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <InputFloatingLabel
                        label="Tên bảo mật"
                        name="ten_bao_mat"
                        isRequired
                        value={formData.ten_bao_mat || ''}
                        onChange={(val) => handleChange('ten_bao_mat', val)}
                    />
                </div>

                <div>
                    <InputFloatingLabel
                        label="Màu sắc (Class)"
                        name="class_color"
                        value={formData.class_color || ''}
                        onChange={(val) => handleChange('class_color', val)}
                    />
                </div>
            </div>
        </div>
    )
}
