/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Button as ButtonV3, toast } from '@heroui-v3/react'
import { Input, Tooltip } from '@heroui/react'
import { ngoaiGioAxios } from '@renderer/api/hr/ngoaiGioAxios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Calendar, CircleHelp, Save, Plus, ExternalLink } from 'lucide-react'
import LockedRangeCalendar from '@renderer/components/LockedRangeCalendar'

interface BangChamCongThang {
    id: number
    thang: string
    ngay_bat_dau: string
    ngay_ket_thuc: string
    ten_bang: string
    ghi_chu?: string
    locked_dates?: string
}

interface BangChamCongDetailModalProps {
    isOpen: boolean
    onClose: () => void
    bangChamCong: BangChamCongThang | null
}

const initialFormState = {
    thang: '',
    ngay_bat_dau: '',
    ngay_ket_thuc: '',
    ten_bang: '',
    ghi_chu: ''
}

export default function BangChamCongDetailModal({
    isOpen,
    onClose,
    bangChamCong
}: BangChamCongDetailModalProps) {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [formData, setFormData] = useState(initialFormState)

    // Parse locked dates from string DB field
    const [lockedDates, setLockedDates] = useState<any[]>([])

    useEffect(() => {
        if (!bangChamCong?.locked_dates) {
            setLockedDates([])
            return
        }
        try {
            setLockedDates(JSON.parse(bangChamCong.locked_dates))
        } catch {
            setLockedDates([])
        }
    }, [bangChamCong])

    // Pre-fill form data when bangChamCong Changes (for Edit mode), otherwise reset
    useEffect(() => {
        if (isOpen) {
            if (bangChamCong) {
                setFormData({
                    thang: bangChamCong.thang || '',
                    ngay_bat_dau: bangChamCong.ngay_bat_dau ? bangChamCong.ngay_bat_dau.split('T')[0] : '',
                    ngay_ket_thuc: bangChamCong.ngay_ket_thuc ? bangChamCong.ngay_ket_thuc.split('T')[0] : '',
                    ten_bang: bangChamCong.ten_bang || '',
                    ghi_chu: bangChamCong.ghi_chu || ''
                })
            } else {
                setFormData(initialFormState)
            }
        }
    }, [bangChamCong, isOpen])

    // Mutation to update info
    const updateMutation = useMutation({
        mutationFn: (data: any) => ngoaiGioAxios.updateBangChamCong(data),
        onSuccess: () => {
            toast('Cập nhật thông tin thành công', { variant: 'success' })
            queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
            onClose()
        },
        onError: (error: any) => {
            toast(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật', { variant: 'danger' })
        }
    })

    // Mutation to create new
    const createMutation = useMutation({
        mutationFn: (data: any) => ngoaiGioAxios.createBangChamCong(data),
        onSuccess: () => {
            toast('Tạo bảng chấm công mới thành công', { variant: 'success' })
            queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
            onClose()
        },
        onError: (error: any) => {
            toast(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo mới', { variant: 'danger' })
        }
    })

    // Lock date mutation
    const lockDatesMutation = useMutation({
        mutationFn: (data: any) => ngoaiGioAxios.lockDatesBangChamCong(data),
        onSuccess: (_, variables) => {
            toast('Đã khóa khoảng thời gian thành công', { variant: 'success' })
            setLockedDates(prev => [...prev, { start: variables.start_date, end: variables.end_date }])
            queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
        },
        onError: (error: any) => {
            toast(error?.response?.data?.message || 'Lỗi khi khóa ngày', { variant: 'danger' })
        }
    })

    // Unlock date mutation
    const unlockDatesMutation = useMutation({
        mutationFn: (data: { id: number, index: number }) => ngoaiGioAxios.unlockDatesBangChamCong(data),
        onSuccess: (_, variables) => {
            toast('Đã mở khóa ngày thành công', { variant: 'success' })
            setLockedDates(prev => prev.filter((_, i) => i !== variables.index))
            queryClient.invalidateQueries({ queryKey: ['bangChamCongThang'] })
        },
        onError: (error: any) => {
            toast(error?.response?.data?.message || 'Lỗi khi mở khóa', { variant: 'danger' })
        }
    })

    const handleSubmit = () => {
        if (bangChamCong?.id) {
            updateMutation.mutate({
                id: bangChamCong.id,
                ...formData
            })
        } else {
            createMutation.mutate(formData)
        }
    }

    const handleViewDetail = () => {
        if (formData.ngay_bat_dau && formData.ngay_ket_thuc) {
            navigate(`/hrm/ngoai-gio?start=${formData.ngay_bat_dau}&end=${formData.ngay_ket_thuc}`)
            onClose()
        }
    }

    return (
        <Modal.Backdrop isDismissable={false} variant="opaque" isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <Modal.Container
                size={bangChamCong ? "cover" : "md" as any}
                placement="center"
                scroll="inside"
                className={`w-full ${bangChamCong ? 'max-w-[860px]' : 'max-w-md'} lg:h-auto!`}
            >
                <Modal.Dialog className='p-0 overflow-hidden rounded-3xl bg-[#f8fafd] dark:bg-gray-900'>
                    <Modal.Header className="px-6 py-5 bg-[#f8fafd] dark:bg-gray-900">
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Modal.Heading className="text-base font-medium text-[#202124] dark:text-gray-100">
                                        {bangChamCong ? "Thông tin bảng chấm công" : "Tạo bảng chấm công mới"}
                                    </Modal.Heading>
                                    <Tooltip content="Xem chi tiết và quản lý khóa lịch ngoài giờ" placement="right" color="foreground">
                                        <CircleHelp className="w-[14px] h-[14px] text-[#9aa0a6] cursor-help" />
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {bangChamCong && (
                                    <Tooltip content="Xem chi tiết ngoài giờ" placement="bottom" color="foreground">
                                        <ButtonV3
                                            isIconOnly
                                            size="sm"
                                            variant="ghost"
                                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full shrink-0"
                                            onPress={handleViewDetail}
                                            aria-label="Chi tiết"
                                        >
                                            <ExternalLink size={18} />
                                        </ButtonV3>
                                    </Tooltip>
                                )}
                                <ButtonV3
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    className="text-[#5f6368] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full shrink-0"
                                    onPress={onClose}
                                    aria-label="Đóng"
                                >
                                    <X size={20} />
                                </ButtonV3>
                            </div>
                        </div>
                    </Modal.Header>

                    <Modal.Body className="p-0 mt-0">
                        <div className={`grid grid-cols-1 ${bangChamCong ? 'lg:grid-cols-[340px_1fr] min-h-[460px]' : ''}`}>
                            {/* Left Panel */}
                            <div className="p-6 border-b lg:border-b-0 border-gray-200/60 dark:border-gray-800 flex flex-col overflow-y-auto max-h-[80vh]">
                                <div className="flex flex-col gap-4 flex-1">
                                    <Input
                                        label="Tháng"
                                        labelPlacement="inside"
                                        variant="flat"
                                        placeholder="MM/YYYY (VD: 04/2026)"
                                        value={formData.thang}
                                        onValueChange={(val) => setFormData({ ...formData, thang: val })}
                                        classNames={{ inputWrapper: "bg-white dark:bg-gray-800" }}
                                    />
                                    <Input
                                        label="Tên bảng chấm công"
                                        labelPlacement="inside"
                                        variant="flat"
                                        placeholder="VD: Bảng chấm công tháng 4/2026"
                                        value={formData.ten_bang}
                                        onValueChange={(val) => setFormData({ ...formData, ten_bang: val })}
                                        classNames={{ inputWrapper: "bg-white dark:bg-gray-800" }}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Ngày bắt đầu"
                                            labelPlacement="inside"
                                            variant="flat"
                                            type="date"
                                            placeholder="dd/mm/yyyy"
                                            value={formData.ngay_bat_dau}
                                            onValueChange={(val) => setFormData({ ...formData, ngay_bat_dau: val })}
                                            classNames={{ inputWrapper: "bg-white dark:bg-gray-800" }}
                                        />
                                        <Input
                                            label="Ngày kết thúc"
                                            labelPlacement="inside"
                                            variant="flat"
                                            type="date"
                                            placeholder="dd/mm/yyyy"
                                            value={formData.ngay_ket_thuc}
                                            onValueChange={(val) => setFormData({ ...formData, ngay_ket_thuc: val })}
                                            classNames={{ inputWrapper: "bg-white dark:bg-gray-800" }}
                                        />
                                    </div>
                                    <Input
                                        label="Ghi chú"
                                        labelPlacement="inside"
                                        variant="flat"
                                        placeholder="Ghi chú về kỳ chấm công..."
                                        value={formData.ghi_chu}
                                        onValueChange={(val) => setFormData({ ...formData, ghi_chu: val })}
                                        classNames={{ inputWrapper: "bg-white dark:bg-gray-800" }}
                                    />

                                    {/* Footer Actions inside left panel */}
                                    <div className="mt-auto pt-4 border-t border-gray-200/60 dark:border-gray-800">
                                        <div className="flex gap-2 w-full">
                                            <ButtonV3
                                                variant="outline"
                                                onPress={onClose}
                                                size="sm"
                                                className="flex-1 font-medium rounded-lg bg-white dark:bg-gray-800 text-[#5f6368] dark:text-gray-300 border-gray-200/60 dark:border-gray-700"
                                            >
                                                Đóng
                                            </ButtonV3>

                                            <ButtonV3
                                                variant="primary"
                                                size="sm"
                                                className="flex-1 px-0 font-medium rounded-lg"
                                                onPress={handleSubmit}
                                                isPending={bangChamCong ? updateMutation.isPending : createMutation.isPending}
                                            >
                                                {bangChamCong ? (
                                                    <>
                                                        <Save size={15} className="mr-1.5" />
                                                        Lưu
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus size={15} className="mr-1.5" />
                                                        Tạo mới
                                                    </>
                                                )}
                                            </ButtonV3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel - Calendar (Only if editing mode) */}
                            {bangChamCong && (
                                <div className="p-5 bg-white dark:bg-gray-900 rounded-none lg:rounded-tl-4xl">
                                    <LockedRangeCalendar
                                        lockedDates={lockedDates}
                                        onLock={(start, end) => {
                                            lockDatesMutation.mutate({
                                                id: bangChamCong.id,
                                                start_date: start,
                                                end_date: end
                                            })
                                        }}
                                        onUnlock={(index) => {
                                            unlockDatesMutation.mutate({
                                                id: bangChamCong.id,
                                                index
                                            })
                                        }}
                                        isLocking={lockDatesMutation.isPending}
                                        compact
                                        timesheetRange={
                                            formData.ngay_bat_dau && formData.ngay_ket_thuc
                                                ? { start: formData.ngay_bat_dau, end: formData.ngay_ket_thuc }
                                                : undefined
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    )
}
