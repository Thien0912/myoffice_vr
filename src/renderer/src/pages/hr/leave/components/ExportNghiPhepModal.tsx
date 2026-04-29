import {
    Button,
    Modal,
    Spinner
} from '@heroui-v3/react'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import { LoaiNghiPhepAxios } from '@renderer/api/danhmuc/loaiNghiPhepAxios'
import { DateRangePickerFloatingLabel } from '@renderer/components/DateRangePickerFloatingLabel'
import { SelectDropdown } from '@renderer/components/SelectDropdown'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useEffect, useMemo, useState } from 'react'

interface ExportNghiPhepModalProps {
    isOpen: boolean
    onClose: () => void
    onExport: (params: any) => void
    isLoading?: boolean
    initialValues?: {
        year?: number
        month?: number
        id_loai_phep?: string
        trang_thai?: string
        id_don_vi?: string
    }
}

export default function ExportNghiPhepModal({
    isOpen,
    onClose,
    onExport,
    isLoading,
    initialValues
}: ExportNghiPhepModalProps) {
    const user = useAuthStore((s) => s.user)
    const tz = getLocalTimeZone()
    const currentDate = today(tz)
    const userUnitId = user?.id_don_vi ? String(user.id_don_vi) : ''
    const isVanThuDonVi = useMemo(
        () =>
            user?.vai_tro?.some(
                (v) =>
                    (v.is_active === 1 || v.is_active === '1') &&
                    v.ql_ma_vai_tro === 'VAN_THU_DON_VI'
            ) ?? false,
        [user?.vai_tro]
    )

    const [idLoaiPhep, setIdLoaiPhep] = useState<string>('all')
    const [trangThai, setTrangThai] = useState<string>('all')
    const [idDonVi, setIdDonVi] = useState<string | string[]>(['all'])
    const [dateRange, setDateRange] = useState<any>({
        start: parseDate(`${currentDate.year}-${String(currentDate.month).padStart(2, '0')}-01`),
        end: currentDate
    })

    const [leaveTypes, setLeaveTypes] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])

    useEffect(() => {
        if (isOpen) {
            const current = today(tz)
            setDateRange({
                start: parseDate(`${current.year}-${String(current.month).padStart(2, '0')}-01`),
                end: current
            }) // Reset date range when opened
            setIdLoaiPhep('all')
            setTrangThai('all')
            setIdDonVi(['all'])

            if (initialValues?.id_loai_phep) setIdLoaiPhep(initialValues.id_loai_phep)
            if (initialValues?.trang_thai) setTrangThai(initialValues.trang_thai)
            if (isVanThuDonVi && userUnitId) {
                setIdDonVi([userUnitId])
            } else if (initialValues?.id_don_vi) {
                setIdDonVi(
                    initialValues.id_don_vi.includes(',')
                        ? initialValues.id_don_vi.split(',')
                        : [initialValues.id_don_vi]
                )
            }

            fetchData()
        }
    }, [isOpen, initialValues])

    const fetchData = async () => {
        const [leaveTypesRes, groupedDepts] = await Promise.all([
            LoaiNghiPhepAxios.fetch(),
            mapDonviGroupedOptions()
        ])

        if (leaveTypesRes.success) {
            setLeaveTypes(Array.isArray(leaveTypesRes.data) ? leaveTypesRes.data : [])
        }
        setDepartments(groupedDepts)
    }

    const handleExport = () => {
        const startDate = dateRange?.start
            ? `${dateRange.start.year}-${String(dateRange.start.month).padStart(2, '0')}-${String(dateRange.start.day).padStart(2, '0')}`
            : null
        const endDate = dateRange?.end
            ? `${dateRange.end.year}-${String(dateRange.end.month).padStart(2, '0')}-${String(dateRange.end.day).padStart(2, '0')}`
            : null

        onExport({
            year: initialValues?.year || new Date().getFullYear(),
            month: initialValues?.month || null,
            start_date: startDate,
            end_date: endDate,
            id_loai_phep: idLoaiPhep === 'all' || !idLoaiPhep ? null : idLoaiPhep,
            trang_thai: trangThai === 'all' || !trangThai ? null : trangThai,
            ids_don_vi:
                isVanThuDonVi && userUnitId
                    ? userUnitId
                    : Array.isArray(idDonVi)
                        ? idDonVi.includes('all') || idDonVi.length === 0
                            ? null
                            : idDonVi.join(',')
                        : idDonVi === 'all' || !idDonVi
                            ? null
                            : idDonVi,
            co_tinh_luong: null
        })
    }

    const deptOptions = useMemo(
        () => {
            if (isVanThuDonVi && userUnitId) {
                const filteredGroups = departments
                    .map((group: any) => ({
                        ...group,
                        options: Array.isArray(group?.options)
                            ? group.options.filter((opt: any) => String(opt.value) === userUnitId)
                            : []
                    }))
                    .filter((group: any) => group.options.length > 0)

                if (filteredGroups.length > 0) return filteredGroups

                return [
                    {
                        label: 'Đơn vị',
                        options: [{ value: userUnitId, label: user?.ten_don_vi || 'Đơn vị hiện tại' }]
                    }
                ]
            }

            return [
                {
                    label: 'Tùy chọn',
                    options: [{ value: 'all', label: 'Tất cả đơn vị' }]
                },
                ...departments
            ]
        },
        [departments, isVanThuDonVi, user?.ten_don_vi, userUnitId]
    )

    const leaveTypeOptions = useMemo(
        () => [
            { value: 'all', label: 'Tất cả loại phép' },
            ...leaveTypes.map((type) => ({
                value: type.id_loai_phep.toString(),
                label: type.ten_loai_phep
            }))
        ],
        [leaveTypes]
    )

    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái' },
        { value: 'cho_duyet_cap_mot', label: 'Chờ duyệt (Cấp 1)' },
        { value: 'da_duyet_cap_mot', label: 'Đã duyệt (Cấp 1)' },
        { value: 'tu_choi_cap_mot', label: 'Từ chối (Cấp 1)' },
        { value: 'cho_duyet_cap_hai', label: 'Chờ duyệt (Cấp 2)' },
        { value: 'da_duyet_cap_hai', label: 'Đã duyệt (Cấp 2)' },
        { value: 'tu_choi_cap_hai', label: 'Từ chối (Cấp 2)' }
    ]

    return (
        <Modal>
            <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
                <Modal.Container>
                    <Modal.Dialog className="max-w-md w-full dark:bg-gray-800 transition-all duration-300">
                        <Modal.CloseTrigger />
                        <Modal.Header className="flex flex-col gap-1 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700">
                            <Modal.Heading>Tùy chọn xuất báo cáo</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="flex flex-col gap-5 py-4">
                            <div className="z-20 relative">
                                <DateRangePickerFloatingLabel
                                    label="Khoảng thời gian xuất"
                                    value={dateRange}
                                    onChange={setDateRange}
                                />
                            </div>

                            <SelectDropdown
                                label="Đơn vị"
                                options={deptOptions}
                                value={idDonVi}
                                multiple={true}
                                isDisabled={isVanThuDonVi}
                                onChange={(val) => {
                                    if (Array.isArray(val)) {
                                        const lastSelected = val[val.length - 1]
                                        if (lastSelected === 'all') {
                                            setIdDonVi(['all'])
                                        } else {
                                            setIdDonVi(val.filter((v) => v !== 'all'))
                                        }
                                    } else {
                                        setIdDonVi(val)
                                    }
                                }}
                            />

                            <SelectDropdown
                                label="Loại phép"
                                options={leaveTypeOptions}
                                value={idLoaiPhep}
                                onChange={(val) => setIdLoaiPhep(val as string)}
                            />

                            <SelectDropdown
                                label="Trạng thái"
                                options={statusOptions}
                                value={trangThai}
                                onChange={(val) => setTrangThai(val as string)}
                            />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="ghost" onPress={onClose} className="dark:text-gray-300 w-24">
                                Hủy
                            </Button>
                            <Button variant="primary" onPress={handleExport} isPending={isLoading} className="flex items-center gap-2">
                                {isLoading && <Spinner size="sm" className="text-white" />}
                                {isLoading ? 'Đang xuất...' : 'Xuất báo cáo Excel'}
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}
