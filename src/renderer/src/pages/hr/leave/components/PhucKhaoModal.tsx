/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Disclosure, Modal, TextArea, toast } from '@heroui-v3/react'
import FileUploadBox from '@renderer/pages/document/components/form/FileUploadBox'
import { Plus, Send, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { LeaveRequest } from '../mockData'
import { LeaveDaysForm } from './LeaveDaysForm'
import { TotalDaysDisplay } from './TotalDaysDisplay'

export interface DayRow {
    id: string | number
    date: string
    sang: boolean
    chieu: boolean
}

interface PhucKhaoFormValues {
    lyDoMoi: string
    days: DayRow[]
    minhChung: File | null
}

interface PhucKhaoModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (formData: FormData) => void
    row: LeaveRequest | null
    isLoading?: boolean
}

export const PhucKhaoModal: React.FC<PhucKhaoModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    row,
    isLoading = false
}) => {
    const form = useForm<PhucKhaoFormValues>({
        defaultValues: { lyDoMoi: '', days: [], minhChung: null }
    })

    const [isMobile, setIsMobile] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const { control, handleSubmit, setValue, watch, reset } = form

    const {
        fields: days,
        append,
        remove
    } = useFieldArray({
        control,
        name: 'days'
    })

    // Khởi tạo data khi mở modal
    useEffect(() => {
        if (isOpen && row) {
            reset({
                lyDoMoi: (row as any).ly_do_nghi || '',
                days: ((row as any).chi_tiet_ngay_nghi || []).map((d: any, index: number) => ({
                    id: index,
                    date: d.ngay_nghi,
                    sang: d.buoi_nghi === 'Sang' || d.buoi_nghi === 'Ca_ngay',
                    chieu: d.buoi_nghi === 'Chieu' || d.buoi_nghi === 'Ca_ngay'
                })),
                minhChung: null
            })
        }
    }, [isOpen, row, reset])

    if (!row) return null

    const soLanPhucKhao = Number((row as any).so_lan_phuc_khao || 0)
    const canSubmitPhucKhao = soLanPhucKhao < 1
    const minhChungFile = watch('minhChung')

    // Đơn đã được duyệt cả 2 cấp
    const daDuyetCa2Cap =
        row.trang_thai_cap_mot === 'Da_duyet' && row.trang_thai_cap_hai === 'Da_duyet'

    const hoVaTen = (row as any).ho_va_ten || ''
    const nguoiDuyetCap1 = (row as any).nguoi_duyet_cap_mot_ho_ten || '---'
    const nguoiDuyetCap2 = (row as any).nguoi_duyet_cap_hai_ho_ten || '---'

    const handleAddDay = () => {
        append({ id: Date.now(), date: '', sang: true, chieu: true })
    }

    const handleRemoveDay = (index: number) => {
        if (days.length === 1) {
            toast('Phải có ít nhất một ngày nghỉ', { variant: 'warning' })
            return
        }
        remove(index)
    }

    const onSubmit = (values: PhucKhaoFormValues) => {
        const formData = new FormData()
        formData.append('uuid_nghi_phep', (row as any).uuid_nghi_phep)

        if (values.lyDoMoi !== (row as any).ly_do_nghi) {
            formData.append('ly_do_nghi', values.lyDoMoi)
        }

        formData.append(
            'danh_sach_ngay_nghi',
            JSON.stringify(
                values.days.map((d) => ({
                    ngay_nghi: d.date,
                    sang: d.sang,
                    chieu: d.chieu
                }))
            )
        )

        if (values.minhChung) {
            formData.append('minh_chung', values.minhChung)
        }

        onConfirm(formData)
    }

    return (
        <Modal>
            <Modal.Backdrop
                isOpen={isOpen}
                onOpenChange={(open) => {
                    if (!open) onClose()
                }}
            >
                <Modal.Container size={isMobile ? 'full' : 'lg'} scroll="inside">
                    <Modal.Dialog
                        className={`border p-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-2xl ${isMobile ? 'rounded-none' : 'rounded-lg'}`}
                    >
                        {(renderProps) => (
                            <FormProvider {...form}>
                                <>
                                    {/* ── HEADER ─────────────────────────────────────── */}
                                    <Modal.Header className="p-4 flex flex-row justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col gap-0.5">
                                                <Modal.Heading className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-100">
                                                    Gửi Yêu Cầu Phúc Khảo
                                                </Modal.Heading>
                                                <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 break-all pr-2">
                                                    Đơn #{(row as any).uuid_nghi_phep} · {hoVaTen}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="ghost"
                                            className="border-0 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onPress={() => renderProps.close()}
                                            isDisabled={isLoading}
                                        >
                                            <X size={18} />
                                        </Button>
                                    </Modal.Header>

                                    {/* ── BODY ───────────────────────────────────────── */}
                                    <Modal.Body className="p-4 flex flex-col gap-4">
                                        <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
                                            <Disclosure.Heading>
                                                <Button slot="trigger" variant="secondary" className="w-full justify-between bg-surface-secondary text-foreground font-semibold">
                                                    Xem điều kiện & hướng dẫn phúc khảo
                                                    <Disclosure.Indicator />
                                                </Button>
                                            </Disclosure.Heading>
                                            <Disclosure.Content>
                                                <Disclosure.Body className="shadow-panel flex flex-col rounded-xl border border-default-200 bg-surface p-4 mt-2">
                                                    <b>*Điều kiện được phúc khảo đơn</b>
                                                    <p className="text-sm text-muted mb-2">
                                                        Sau khi đơn đã được lãnh đạo đơn vị và lãnh đạo tổ chức duyệt sẽ được gửi yêu cầu phúc khảo đơn
                                                    </p>
                                                    {daDuyetCa2Cap && (
                                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex flex-col gap-2 shrink-0 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">
                                                                    Đơn đã được duyệt đủ 2 cấp
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col gap-1 text-xs">
                                                                <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                                                                    <span className="font-semibold">Cấp đơn vị:</span>
                                                                    <span>{nguoiDuyetCap1}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                                                                    <span className="font-semibold">Cấp tổ chức:</span>
                                                                    <span>{nguoiDuyetCap2}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Trạng thái điều kiện phúc khảo theo dữ liệu đơn */}
                                                    <div
                                                        className={`flex items-center gap-2 px-3 py-2 shrink-0 rounded-lg border text-xs font-medium ${canSubmitPhucKhao
                                                            ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                                                            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`w-2 h-2 rounded-full flex-none ${canSubmitPhucKhao ? 'bg-amber-400' : 'bg-red-400'}`}
                                                        />
                                                        {canSubmitPhucKhao ? `Đủ điều kiện gửi phúc khảo` : `Đã hết lượt phúc khảo`}
                                                    </div>
                                                </Disclosure.Body>
                                            </Disclosure.Content>
                                        </Disclosure>

                                        {/* Thời gian nghỉ */}
                                        <div className="flex flex-col gap-3">
                                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                Cập nhật thời gian nghỉ
                                            </h3>
                                            <LeaveDaysForm days={days} onRemoveDay={handleRemoveDay} />
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mt-1">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onPress={handleAddDay}
                                                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 font-bold h-9 w-full sm:w-auto flex items-center gap-2"
                                                >
                                                    <Plus size={16} />
                                                    Thêm ngày nghỉ
                                                </Button>
                                                <TotalDaysDisplay
                                                    control={control}
                                                    className="bg-blue-50/50 dark:bg-blue-900/10 px-3 py-1.5 rounded border border-blue-100 dark:border-blue-800 flex items-center justify-between gap-3 w-full sm:w-auto"
                                                    labelClassName="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                                                    valueClassName="text-sm font-bold text-blue-700 dark:text-blue-300"
                                                    showLabel={true}
                                                />
                                            </div>
                                        </div>

                                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 shrink-0" />

                                        {/* Lý do & Minh chứng */}
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Lý do / Giải trình (tuỳ chọn)</label>
                                                <TextArea
                                                    placeholder="Nhập lý do hoặc thông tin bổ sung để lãnh đạo xem xét lại..."
                                                    value={watch('lyDoMoi')}
                                                    onChange={(e) => setValue('lyDoMoi', e.target.value)}
                                                    rows={3}
                                                    className="w-full text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-sm"
                                                />
                                            </div>

                                            <FileUploadBox
                                                name="minhChung"
                                                label="Minh chứng đính kèm (JPG, PNG...)"
                                                maxFiles={1}
                                                accept="image/*"
                                                currentFiles={minhChungFile ? [minhChungFile] : []}
                                                onFilesChange={(_, files) => setValue('minhChung', files[0] || null)}
                                            />
                                        </div>

                                        {/* Cảnh báo */}
                                        <p className="text-[11px] text-gray-400 leading-relaxed shrink-0">
                                            ⚠️ Khi gửi phúc khảo, đơn sẽ được đưa về trạng thái <strong>Chờ duyệt</strong> và
                                            lãnh đạo sẽ xem xét lại từ đầu. Bạn chỉ có <strong>tối đa 1 lần phúc khảo</strong>{' '}
                                            cho mỗi đơn và <strong>5 lần/năm</strong>.
                                        </p>
                                    </Modal.Body>

                                    {/* ── FOOTER ─────────────────────────────────────── */}
                                    <Modal.Footer className="py-3 px-4 sm:py-4 sm:px-6 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
                                        <Button
                                            variant="ghost"
                                            className="border-0 text-gray-600 dark:text-gray-400 h-11 px-5 w-full sm:w-auto"
                                            onPress={() => renderProps.close()}
                                            isDisabled={isLoading}
                                        >
                                            Huỷ
                                        </Button>
                                        <Button
                                            variant="primary"
                                            isDisabled={!canSubmitPhucKhao || isLoading}
                                            onPress={() => {
                                                void handleSubmit(onSubmit)()
                                            }}
                                            className="font-bold text-white bg-blue-600 shadow-blue-500/10 h-11 px-10 shadow-lg w-full sm:w-auto rounded-sm flex items-center gap-2"
                                        >
                                            {isLoading ? 'ĐANG GỬI...' : (
                                                <>
                                                    <Send size={14} />
                                                    GỬI YÊU CẦU
                                                </>
                                            )}
                                        </Button>
                                    </Modal.Footer>
                                </>
                            </FormProvider>
                        )}
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}

export default PhucKhaoModal
