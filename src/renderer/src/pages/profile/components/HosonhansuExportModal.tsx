import React, { useState, useEffect } from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Checkbox,
    CheckboxGroup,
    RadioGroup,
    Radio,
    ModalContent
} from '@heroui/react'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import { SelectDropdown } from '@renderer/components/SelectDropdown'

export interface ExportOptions {
    don_vi?: string[]
    trang_thai?: string[]
    chuc_vu?: string[]
    ngay_vao_lam_from?: string
    ngay_vao_lam_to?: string
    has_email?: boolean
    selected_columns: string[]
}

interface HosonhansuExportModalProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onExport: (options: ExportOptions) => void
    isLoading?: boolean
    donviOptions: any[]
    vitriOptions: any[]
    trangThaiOptions: any[]
    initialFilters?: Record<string, any>
}

const COLUMN_OPTIONS = [
    { label: 'STT', value: 'stt' },
    { label: 'Mã nhân viên', value: 'ma_nhan_vien' },
    { label: 'Mã chấm công', value: 'ma_cham_cong' },
    { label: 'Họ và tên', value: 'ho_va_ten' },
    { label: 'Email', value: 'email' },
    { label: 'Giới tính', value: 'gioi_tinh' },
    { label: 'Ngày sinh', value: 'ngay_sinh' },
    { label: 'Phòng ban/Đơn vị', value: 'ten_don_vi' },
    { label: 'Vị trí công việc', value: 'ten_cong_viec' },
    { label: 'Trạng thái', value: 'trang_thai' },
    { label: 'Ngày bắt đầu', value: 'ngay_lam_chinh_thuc' },
    { label: 'Ngày kết thúc', value: 'ngay_lam_chinh_thuc_ket_thuc' },
    { label: 'Ca làm việc', value: 'ca_lam_viec' },
    { label: 'Số CCCD', value: 'cccd_so' },
    { label: 'Nơi cấp CCCD', value: 'cccd_noi_cap' },
    { label: 'Ngày cấp CCCD', value: 'cccd_ngay_cap' },
    { label: 'Quốc tịch', value: 'ten_quoc_gia' },
    { label: 'Dân tộc', value: 'ten_dan_toc' },
    { label: 'Tôn giáo', value: 'ten_ton_giao' },
]

const EMAIL_OPTIONS = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Có Email', value: 'yes' },
    { label: 'Không có Email', value: 'no' }
]

export const HosonhansuExportModal: React.FC<HosonhansuExportModalProps> = ({
    isOpen,
    onOpenChange,
    onExport,
    isLoading = false,
    donviOptions,
    vitriOptions,
    trangThaiOptions,
    initialFilters
}) => {
    const [selectedCols, setSelectedCols] = useState<string[]>(COLUMN_OPTIONS.map(c => c.value))
    const [donVi, setDonVi] = useState<string[]>([])
    const [trangThai, setTrangThai] = useState<string[]>([])
    const [chucVu, setChucVu] = useState<string[]>([])
    const [hasEmail, setHasEmail] = useState<string>('all')
    const [dateFrom, setDateFrom] = useState<string>('')
    const [dateTo, setDateTo] = useState<string>('')

    // Sync initial filters when modal opens
    useEffect(() => {
        if (isOpen && initialFilters) {
            if (initialFilters.id_don_vi) {
                const val = Array.isArray(initialFilters.id_don_vi) ? initialFilters.id_don_vi : [String(initialFilters.id_don_vi)]
                setDonVi(val)
            } else {
                setDonVi([])
            }
            
            if (initialFilters.trang_thai) {
                const val = Array.isArray(initialFilters.trang_thai) ? initialFilters.trang_thai : [String(initialFilters.trang_thai)]
                setTrangThai(val)
            } else {
                setTrangThai([])
            }

            if (initialFilters.id_vi_tri_cong_viec) {
                const val = Array.isArray(initialFilters.id_vi_tri_cong_viec) ? initialFilters.id_vi_tri_cong_viec : [String(initialFilters.id_vi_tri_cong_viec)]
                setChucVu(val)
            } else {
                setChucVu([])
            }

            if (initialFilters.dateRange) {
                setDateFrom(initialFilters.dateRange.fromDate || '')
                setDateTo(initialFilters.dateRange.toDate || '')
            }
        }
    }, [isOpen, initialFilters])

    const handleExport = () => {
        onExport({
            don_vi: donVi.length > 0 ? donVi : undefined,
            trang_thai: trangThai.length > 0 ? trangThai : undefined,
            chuc_vu: chucVu.length > 0 ? chucVu : undefined,
            ngay_vao_lam_from: dateFrom || undefined,
            ngay_vao_lam_to: dateTo || undefined,
            has_email: hasEmail === 'yes' ? true : hasEmail === 'no' ? false : undefined,
            selected_columns: selectedCols
        })
    }

    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange} 
            size="3xl" 
            scrollBehavior="inside"
            classNames={{
                backdrop: 'bg-[#292f46]/50 backdrop-blur-sm',
                base: 'border-[#292f46] bg-[#f8fafc] dark:bg-[#1e293b] text-[#1e293b] dark:text-[#f8fafc]',
                header: 'border-b-[1px] border-[#292f46]/10',
                footer: 'border-t-[1px] border-[#292f46]/10',
                closeButton: 'hover:bg-[#292f46]/5 active:bg-[#292f46]/10',
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Cấu hình xuất dữ liệu Excel</ModalHeader>
                        <ModalBody className="overflow-visible">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
                                {/* Left side: Filters */}
                                <div className="space-y-6 overflow-visible">
                                    <h3 className="font-semibold text-sm border-b pb-2 text-primary">Điều kiện lọc</h3>
                                    
                                    <SelectDropdown 
                                        label="Đơn vị"
                                        placeholder="Tất cả đơn vị" 
                                        multiple
                                        options={donviOptions}
                                        value={donVi}
                                        onChange={(val) => setDonVi(val as string[])}
                                        className="w-full"
                                    />

                                    <SelectDropdown 
                                        label="Trạng thái làm việc"
                                        placeholder="Tất cả trạng thái" 
                                        multiple
                                        options={trangThaiOptions}
                                        value={trangThai}
                                        onChange={(val) => setTrangThai(val as string[])}
                                        className="w-full"
                                    />

                                    <SelectDropdown 
                                        label="Chức vụ"
                                        placeholder="Tất cả chức vụ" 
                                        multiple
                                        options={vitriOptions}
                                        value={chucVu}
                                        onChange={(val) => setChucVu(val as string[])}
                                        className="w-full"
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <DateInputFloatingLabel 
                                            label="Ngày vào làm từ"
                                            value={dateFrom}
                                            onChange={(val) => setDateFrom(val)}
                                        />
                                        <DateInputFloatingLabel 
                                            label="Ngày vào làm đến"
                                            value={dateTo}
                                            onChange={(val) => setDateTo(val)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-default-600">Có Email?</p>
                                        <RadioGroup
                                            orientation="horizontal"
                                            value={hasEmail}
                                            onValueChange={setHasEmail}
                                            color="primary"
                                            classNames={{ wrapper: 'gap-4' }}
                                        >
                                            <Radio value="all">Tất cả</Radio>
                                            <Radio value="yes">Có Email</Radio>
                                            <Radio value="no">Không có</Radio>
                                        </RadioGroup>
                                    </div>
                                </div>

                                {/* Right side: Column Selection */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm border-b pb-2 text-primary">Chọn cột dữ liệu ({selectedCols.length})</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Button size="sm" variant="flat" onPress={() => setSelectedCols(COLUMN_OPTIONS.map(c => c.value))}>Chọn tất cả</Button>
                                        <Button size="sm" variant="flat" onPress={() => setSelectedCols([])}>Bỏ chọn hết</Button>
                                    </div>
                                    <CheckboxGroup
                                        className="h-[300px] overflow-y-auto pr-2 custom-scrollbar"
                                        value={selectedCols}
                                        onValueChange={setSelectedCols}
                                        color="primary"
                                    >
                                        <div className="grid grid-cols-1 gap-2">
                                            {COLUMN_OPTIONS.map((col) => (
                                                <Checkbox key={col.value} value={col.value} className="text-sm">
                                                    {col.label}
                                                </Checkbox>
                                            ))}
                                        </div>
                                    </CheckboxGroup>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" color="danger" onPress={onClose}>Hủy</Button>
                            <Button color="primary" isLoading={isLoading} onPress={handleExport} className="font-bold shadow-lg shadow-primary/30">
                                Bắt đầu xuất Excel
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
