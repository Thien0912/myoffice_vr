import { Checkbox, CheckboxGroup, Label, Radio, RadioGroup, Separator } from '@heroui-v3/react'
import { DonviAxios } from '@renderer/api/danhmuc/DonviAxios'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import TabContentPhanCong from './TabContentPhanCong'

type FormChuyendonvixulyProps = {
    formData: Record<string, any>
    setFormData: (data: Record<string, any>) => void
}

export default function FormChuyendonvixuly({ formData, setFormData }: FormChuyendonvixulyProps) {
    // Tải danh sách đơn vị
    const { data: allUnit } = useQuery({
        queryKey: ['donvi-theophongban-flat'],
        queryFn: async () => {
            const res = await DonviAxios.fetchTheoPhongBan()
            if (!res?.success || !Array.isArray(res.data)) return []
            let flattened: { uuid: string; label: string; group: string }[] = []
            res.data.forEach((group: any) => {
                const groupType = group.label || 'DEFAULT'
                if (group.options) {
                    group.options.forEach((opt: any) => {
                        flattened.push({
                            uuid: String(opt.value),
                            label: opt.text || opt.label || '',
                            group: groupType
                        })
                    })
                }
            })
            return flattened
        }
    })

    const [ngayDuyet, setNgayDuyet] = useState<string>(() => {
        if (formData?.ngay_duyet) {
            return String(formData.ngay_duyet).split(' ')[0]
        }
        return ''
    })

    const [selectedKenh, setSelectedKenh] = useState<string[]>(['HE_THONG', 'EMAIL', 'ZALO'])

    useEffect(() => {
        setNgayDuyet(formData?.ngay_duyet ? String(formData.ngay_duyet).split(' ')[0] : '')
    }, [formData?.ngay_duyet])

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* SECTION: Thông tin phê duyệt */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-7">
                            <InputFloatingLabel
                                label="Người duyệt"
                                name="nguoi_duyet"
                                type="text"
                                value={String(formData?.nguoi_duyet ?? '')}
                                onChange={(val) => handleChange('nguoi_duyet', val)}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-5">
                            <DateInputFloatingLabel
                                label="Ngày duyệt"
                                name="ngay_duyet"
                                value={ngayDuyet ?? ''}
                                onChange={(val) => {
                                    setNgayDuyet(val)
                                    handleChange('ngay_duyet', val)
                                }}
                            />
                        </div>
                        <div className="col-span-12">
                            <TextareaFloatingLabel
                                label="Ý kiến chỉ đạo / Ghi chú"
                                name="ghi_chu_duyet"
                                rows={2}
                                value={String(formData?.ghi_chu_duyet ?? '')}
                                onChange={(val) => handleChange('ghi_chu_duyet', val)}
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION: Thông báo */}
                <div className="lg:col-span-5 flex flex-col justify-start">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border">
                        <div>
                            <span>
                                Gửi thông báo qua:
                            </span>
                        </div>
                        <CheckboxGroup
                            value={selectedKenh}
                            onChange={setSelectedKenh}
                            className="gap-3 pl-1"
                        >
                            <div className="flex flex-col">
                                {/* Hàng 1: Hệ thống & Zalo */}
                                <div className="flex gap-8 items-center">
                                    <Checkbox
                                        isReadOnly
                                        value="HE_THONG"
                                        name="loai_thong_bao[]"
                                    >
                                        <Checkbox.Control className="pointer-events-none opacity-60">
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content className="pointer-events-none opacity-60">
                                            <Label className="m-0 text-[13px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Hệ thống</Label>
                                        </Checkbox.Content>
                                    </Checkbox>

                                    <Checkbox
                                        value="ZALO"
                                        name="loai_thong_bao[]"
                                    >
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content>
                                            <Label className="m-0 text-[13px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Zalo</Label>
                                        </Checkbox.Content>
                                    </Checkbox>
                                </div>

                                {/* Hàng 2: Email & Cấu hình thời gian gửi */}
                                <div className="flex flex-col gap-3 items-start">
                                    <Checkbox
                                        value="EMAIL"
                                        name="loai_thong_bao[]"
                                    >
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content>
                                            <Label className="m-0 text-[13px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Email</Label>
                                        </Checkbox.Content>
                                    </Checkbox>

                                    {/* Collapse: Cấu hình thời gian gửi Email */}
                                    {selectedKenh.includes('EMAIL') && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                                            <RadioGroup
                                                orientation="horizontal"
                                                name="time_send_mail"
                                                value={String(formData?.time_send_mail ?? 'CUOI_BUOI')}
                                                onChange={(val) => handleChange('time_send_mail', val)}
                                                className="flex flex-row gap-5"
                                            >
                                                <Radio value="NGAY">
                                                    <Radio.Control>
                                                        <Radio.Indicator />
                                                    </Radio.Control>
                                                    <Radio.Content>
                                                        <Label className="text-[13px] text-slate-600 dark:text-slate-400 whitespace-nowrap">Ngay lập tức</Label>
                                                    </Radio.Content>
                                                </Radio>
                                                <Radio value="CUOI_BUOI">
                                                    <Radio.Control>
                                                        <Radio.Indicator />
                                                    </Radio.Control>
                                                    <Radio.Content>
                                                        <Label className="text-[13px] text-slate-600 dark:text-slate-400 whitespace-nowrap">Cuối buổi (11h30 & 17h00)</Label>
                                                    </Radio.Content>
                                                </Radio>
                                            </RadioGroup>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CheckboxGroup>
                    </div>
                </div>
            </div>

            <Separator className="my-4" />

            {/* SECTION: Đơn vị xử lý */}
            <TabContentPhanCong
                formData={formData}
                onChange={handleChange}
                allUnit={allUnit}
            />

            {/* Hidden Fields */}
            <InputFloatingLabel name="trang_thai" type="hidden" value="CHO_XU_LY" />
        </div>
    )
}
