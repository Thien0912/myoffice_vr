import { Dispatch, SetStateAction } from 'react'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { Switch } from '@heroui/react'

type FormCaLamViecProps = {
    formData: Record<string, any>
    setFormData: Dispatch<SetStateAction<Record<string, any>>>
    isEdit?: boolean
}

export default function FormCaLamViec({ formData, setFormData }: FormCaLamViecProps) {
    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="ps-3 pe-0 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <InputFloatingLabel
                        label="Tên ca làm việc"
                        name="ca_lam_viec"
                        isRequired
                        value={formData.ca_lam_viec || ''}
                        onChange={(val) => handleChange('ca_lam_viec', val)}
                    />
                </div>

                <div className="border p-3 rounded-lg flex flex-col gap-3">
                    <h3 className="font-semibold text-sm text-blue-600">Check-in</h3>
                    <InputFloatingLabel
                        label="Giờ vào chính thức"
                        name="check_in"
                        type="time"
                        isRequired
                        value={formData.check_in || ''}
                        onChange={(val) => handleChange('check_in', val)}
                    />
                    <InputFloatingLabel
                        label="Bắt đầu check-in"
                        name="bat_dau_check_in"
                        type="time"
                        value={formData.bat_dau_check_in || ''}
                        onChange={(val) => handleChange('bat_dau_check_in', val)}
                    />
                    <InputFloatingLabel
                        label="Kết thúc check-in"
                        name="ket_thuc_check_in"
                        type="time"
                        value={formData.ket_thuc_check_in || ''}
                        onChange={(val) => handleChange('ket_thuc_check_in', val)}
                    />
                </div>

                <div className="border p-3 rounded-lg flex flex-col gap-3">
                    <h3 className="font-semibold text-sm text-blue-600">Check-out</h3>
                    <InputFloatingLabel
                        label="Giờ ra chính thức"
                        name="check_out"
                        type="time"
                        isRequired
                        value={formData.check_out || ''}
                        onChange={(val) => handleChange('check_out', val)}
                    />
                    <InputFloatingLabel
                        label="Bắt đầu check-out"
                        name="bat_dau_check_out"
                        type="time"
                        value={formData.bat_dau_check_out || ''}
                        onChange={(val) => handleChange('bat_dau_check_out', val)}
                    />
                    <InputFloatingLabel
                        label="Kết thúc check-out"
                        name="ket_thuc_check_out"
                        type="time"
                        value={formData.ket_thuc_check_out || ''}
                        onChange={(val) => handleChange('ket_thuc_check_out', val)}
                    />
                </div>

                {/* <div className="md:col-span-2 flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Không tính ngày nghỉ</span>
                    <Switch
                        isSelected={!!formData.no_leave_day}
                        onValueChange={(val) => handleChange('no_leave_day', val ? 1 : 0)}
                        size="sm"
                    />
                </div> */}
            </div>
        </div>
    )
}
