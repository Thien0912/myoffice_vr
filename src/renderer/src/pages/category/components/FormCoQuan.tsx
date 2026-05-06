import { Dispatch, SetStateAction } from 'react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'

type FormCoQuanProps = {
    formData: Record<string, any>
    setFormData: Dispatch<SetStateAction<Record<string, any>>>
    isEdit?: boolean
}

export default function FormCoQuan({ formData, setFormData }: FormCoQuanProps) {
    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="ps-3 pe-0 py-2">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <InputFloatingLabel
                        label="Tên cơ quan"
                        name="ten_co_quan"
                        isRequired
                        value={formData.ten_co_quan || ''}
                        onChange={(val) => handleChange('ten_co_quan', val)}
                    />
                </div>
            </div>
        </div>
    )
}
