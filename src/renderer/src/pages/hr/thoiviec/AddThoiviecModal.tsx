import { Button, Skeleton, Spinner, toast } from '@heroui-v3/react'
import { thoiviecAxios } from '@renderer/api/hr/thoiviecAxios'
import DraggableModal from '@renderer/components/DraggableModal'
import { HrTextarea } from '@renderer/components/hero-custom'
import { HrDateInput } from '@renderer/components/hero-custom/HrDateInput'
import SearchInput from "@renderer/components/SearchInput"
import { UserAvatar, UserAvatarVertical } from '@renderer/components/UserAvatar'
import { ChevronLeft, UserX } from 'lucide-react'
import { useEffect, useState } from 'react'

const REASONS = [
    'Nghỉ việc theo đơn',
    'Theo hợp đồng',
    'Hết hạn hợp đồng',
    'Lý do cá nhân / gia đình',
    'Không phù hợp với môi trường',
    'Đi học nâng cao trình độ'
]

export default function AddThoiviecModal({
    isOpen,
    onOpenChange,
    employee,
    onSuccess
}: {
    isOpen: boolean
    onOpenChange: (o: boolean) => void
    employee?: any
    onSuccess?: (data?: any) => void
}) {
    const [employees, setEmployees] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<any | null>(null)
    const [form, setForm] = useState({
        ngay_nghi_chinh_thuc: new Date().toISOString().split('T')[0],
        ly_do_thoi_viec: 'Nghỉ việc theo đơn'
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (employee) {
                setSelected(employee)
                setForm({
                    ngay_nghi_chinh_thuc: employee.ngay_lam_chinh_thuc_ket_thuc
                        ? typeof employee.ngay_lam_chinh_thuc_ket_thuc === 'object'
                            ? `${employee.ngay_lam_chinh_thuc_ket_thuc.year}-${String(employee.ngay_lam_chinh_thuc_ket_thuc.month).padStart(2, '0')}-${String(employee.ngay_lam_chinh_thuc_ket_thuc.day).padStart(2, '0')}`
                            : employee.ngay_lam_chinh_thuc_ket_thuc
                        : new Date().toISOString().split('T')[0],
                    ly_do_thoi_viec: employee.ly_do_thoi_viec || 'Nghỉ việc theo đơn'
                })
            } else {
                setSelected(null)
                setForm({
                    ngay_nghi_chinh_thuc: new Date().toISOString().split('T')[0],
                    ly_do_thoi_viec: 'Nghỉ việc theo đơn'
                })
            }
        }
    }, [isOpen, employee])

    useEffect(() => {
        if (!isOpen) return
        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const res = await thoiviecAxios.fetchNhanvien({
                    start: 0,
                    length: 20,
                    search: { value: search }
                })
                if (res?.data?.data) setEmployees(res.data.data)
            } finally {
                setLoading(false)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [search, isOpen])

    const handleSave = async () => {
        if (!selected) return

        setIsSaving(true)
        try {
            const payload: any = {
                id_nhan_vien: selected.id_nhan_vien,
                ly_do_thoi_viec: form.ly_do_thoi_viec,
                ngay_lam_chinh_thuc_ket_thuc: form.ngay_nghi_chinh_thuc
            }

            // Nếu là thêm mới (không có employee prop), set trạng thái
            if (!employee || employee.trang_thai == 'DANG_LAM_VIEC') {
                payload.trang_thai = 'DANG_LAM_THU_TUC_THOI_VIEC'
            }

            const res = await thoiviecAxios.updateEmployeeInfo(payload)

            if (res.success) {
                toast('Thành công', {
                    description: employee
                        ? 'Cập nhật thông tin thành công'
                        : 'Thêm hồ sơ thôi việc thành công', variant: 'success'
                })
                onSuccess?.(res)
                onOpenChange(false)
            } else {
                toast('Lỗi', { description: res.message || 'Có lỗi xảy ra', variant: 'danger' })
            }
        } catch (error: any) {
            toast('Lỗi', { description: error.response?.data?.message || 'Có lỗi xảy ra', variant: 'danger' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <DraggableModal
            isOpen={isOpen}
            onClose={() => onOpenChange(false)}
            size="xl"
            variant="white"
            title={
                !selected ? (
                    <div className="flex flex-col gap-0 py-2">
                        <span className="text-lg font-bold text-gray-800">Thêm nhân sự thôi việc</span>
                        <small className="text-xs font-normal text-gray-500">
                            Tìm kiếm và chọn nhân viên để làm thủ tục
                        </small>
                    </div>
                ) : (
                    <div className="flex items-start gap-2 w-full">
                        {!employee && (
                            <Button isIconOnly variant="ghost" size="sm" onPress={() => setSelected(null)} className="-ml-2 mt-0.5">
                                <ChevronLeft size={20} />
                            </Button>
                        )}
                        <div className="flex flex-col gap-0.5 mt-0.5">
                            <span className="text-lg font-bold text-gray-800">
                                {employee && employee.trang_thai !== 'DANG_LAM_VIEC'
                                    ? 'Chỉnh sửa hồ sơ thôi việc'
                                    : 'Thiết lập hồ sơ thôi việc'}
                            </span>
                        </div>
                    </div>
                )
            }
            footer={
                !selected ? (
                    <Button variant="secondary" onPress={() => onOpenChange(false)} className="w-full sm:w-auto">
                        Đóng
                    </Button>
                ) : (
                    <div className="flex items-center justify-end gap-3 w-full">
                        {!employee && (
                            <Button variant="secondary" onPress={() => setSelected(null)}>
                                Quay lại
                            </Button>
                        )}
                        <Button variant="primary" onPress={handleSave} isDisabled={isSaving}>
                            {isSaving && <Spinner size="sm" />}
                            Lưu hồ sơ
                        </Button>
                    </div>
                )
            }
        >
            <div className={`flex flex-col min-h-[350px] ${!selected ? 'bg-slate-50 -mx-6 -my-2' : ''}`}>
                {!selected ? (
                    <div className="flex flex-col gap-4 h-full">
                        <div className="sticky top-0 z-10 px-4">
                            <SearchInput
                                placeholder="Tìm kiếm..."
                                value={search}
                                onChange={setSearch}
                                className='w-full'
                            />
                        </div>
                        <div className="flex flex-col gap-2 px-4 pb-6">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl"
                                    >
                                        <Skeleton className="rounded-full w-10 h-10 shrink-0" />
                                        <div className="w-full gap-2 flex flex-col">
                                            <Skeleton className="h-3 w-3/5 rounded-lg" />
                                            <Skeleton className="h-2 w-4/5 rounded-lg" />
                                        </div>
                                    </div>
                                ))
                            ) : employees.length === 0 ? (
                                <div className="flex flex-col items-center py-12 text-gray-400 gap-3">
                                    <div className="p-4 bg-gray-100 rounded-full">
                                        <UserX size={32} />
                                    </div>
                                    <p className="text-sm font-medium">Không tìm thấy nhân viên nào</p>
                                </div>
                            ) : (
                                employees.map((emp) => (
                                    <div
                                        key={emp.id_nhan_vien || emp.id}
                                        className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-xs transition hover:border-blue-300 cursor-pointer"
                                        onClick={() => setSelected(emp)}
                                    >
                                        <div className="flex-1 w-full max-w-[calc(100%-80px)]">
                                            <UserAvatarVertical 
                                                name={emp.ho_va_ten}
                                                gender={emp.gioi_tinh}
                                                size="md"
                                                src={emp.avatar || emp.anh_dai_dien}
                                                className="bg-transparent hover:bg-transparent px-0 py-0"
                                                description={
                                                    <div className="flex flex-col gap-0.5 mt-0.5">
                                                        <div className="text-sm font-semibold text-gray-600">
                                                            {emp.ma_nhan_vien}
                                                        </div>
                                                        {emp.email && (
                                                            <div className="text-xs text-gray-500 font-medium">{emp.email}</div>
                                                        )}
                                                        {emp.ten_don_vi && (
                                                            <div className="text-[11px] text-gray-400 font-medium truncate">{emp.ten_don_vi}</div>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 text-blue-600 font-semibold"
                                            onPress={() => setSelected(emp)}
                                        >
                                            Chọn
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 py-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Thông tin nhân viên
                            </span>
                            <div className="flex p-5 border border-gray-200 rounded-xl bg-white shadow-xs">
                                <UserAvatarVertical 
                                    name={selected.ho_va_ten}
                                    gender={selected.gioi_tinh}
                                    size="lg"
                                    src={selected.avatar || selected.anh_dai_dien}
                                    className="bg-transparent hover:bg-transparent px-0 py-0"
                                    description={
                                        <div className="flex flex-col gap-1.5 mt-1">
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 font-medium">
                                                <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                                                    {selected.ma_nhan_vien}
                                                </span>
                                                <span className="truncate">{selected.email}</span>
                                            </div>
                                            {(selected.ten_don_vi || selected.ten_vi_tri || selected.ten_cong_viec) && (
                                                <div className="text-xs text-gray-500 font-medium truncate">
                                                    {selected.ten_vi_tri || selected.ten_cong_viec}
                                                    {(selected.ten_vi_tri || selected.ten_cong_viec) && selected.ten_don_vi ? ' - ' : ''}
                                                    {selected.ten_don_vi}
                                                </div>
                                            )}
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Chi tiết hồ sơ
                            </span>
                            <div className="flex flex-col gap-5 p-4 border border-gray-200 rounded-xl bg-white shadow-xs">
                                <HrDateInput
                                    label="Ngày nghỉ chính thức"
                                    value={form.ngay_nghi_chinh_thuc}
                                    onChangeValue={(val) => setForm((p) => ({ ...p, ngay_nghi_chinh_thuc: val }))}
                                />
                                <div className="flex flex-col gap-3">
                                    <HrTextarea
                                        label="Lý do thôi việc"
                                        placeholder=" "
                                        minRows={3}
                                        value={form.ly_do_thoi_viec}
                                        onChange={(val) => setForm((p) => ({ ...p, ly_do_thoi_viec: val }))}
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {REASONS.map((r) => (
                                            <button
                                                key={r}
                                                className="text-[11px] font-medium px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-600 rounded-full border border-gray-200 transition-colors"
                                                onClick={() => setForm((p) => ({ ...p, ly_do_thoi_viec: r }))}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DraggableModal>
    )
}
