import { Dispatch, SetStateAction } from 'react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'

type FormTinhChatProps = {
    formData: Record<string, any>
    setFormData: Dispatch<SetStateAction<Record<string, any>>>
    isEdit?: boolean
}

export default function FormTinhChat({ formData, setFormData }: FormTinhChatProps) {
    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="ps-3 pe-0 py-2">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <InputFloatingLabel
                        label="Tên tính chất"
                        name="ten_tinh_chat"
                        isRequired
                        value={formData.ten_tinh_chat || ''}
                        onChange={(val) => handleChange('ten_tinh_chat', val)}
                    />
                </div>

                <div>
                    <InputFloatingLabel
                        label="Màu sắc (Class Color)"
                        name="class_color"
                        value={formData.class_color || ''}
                        onChange={(val) => handleChange('class_color', val)}
                        placeholder="VD: text-red-500, bg-blue-100..."
                    />
                </div>
            </div>
        </div>
    )
}
