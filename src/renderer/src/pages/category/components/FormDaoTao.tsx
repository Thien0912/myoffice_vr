import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import { SelectDropdown, SelectOption } from '@renderer/components/SelectDropdown'

interface FormDaoTaoProps {
    formData: any
    setFormData: (data: any) => void
}

export default function FormDaoTao({ formData, setFormData }: FormDaoTaoProps) {
    const trangThaiOptions: SelectOption[] = [
        { value: 'Dang_dien_ra', label: 'Đang diễn ra' },
        { value: 'Hoan_thanh', label: 'Hoàn thành' }
    ]

    return (
        <div className="flex flex-col gap-4 p-1">
            <InputFloatingLabel
                label="Tên khóa học"
                value={formData.ten_khoa_hoc || ''}
                onChange={(val) => setFormData({ ...formData, ten_khoa_hoc: val })}
                isRequired
            />

            <TextareaFloatingLabel
                label="Nội dung"
                value={formData.noi_dung || ''}
                onChange={(val) => setFormData({ ...formData, noi_dung: val })}
                isRequired
            />

            <div className="grid grid-cols-2 gap-4">
                <DateInputFloatingLabel
                    label="Ngày bắt đầu"
                    value={formData.ngay_bat_dau || ''}
                    onChange={(val) => setFormData({ ...formData, ngay_bat_dau: val })}
                    isRequired
                />
                <DateInputFloatingLabel
                    label="Ngày kết thúc"
                    value={formData.ngay_ket_thuc || ''}
                    onChange={(val) => setFormData({ ...formData, ngay_ket_thuc: val })}
                    isRequired
                />
            </div>

            <SelectDropdown
                label="Trạng thái"
                options={trangThaiOptions}
                value={formData.trang_thai || 'Dang_dien_ra'}
                onChange={(val) => setFormData({ ...formData, trang_thai: val as string })}
                isRequired
            />
        </div>
    )
}
