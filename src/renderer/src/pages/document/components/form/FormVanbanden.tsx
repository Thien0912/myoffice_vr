import { Checkbox } from '@heroui-v3/react'
import { mapOptionsBaoMat } from '@renderer/api/danhmuc/baomatAxios'
import { mapOptionsCoquan } from '@renderer/api/danhmuc/coquanAxios'
import { mapDonviGroupedOptions } from '@renderer/api/danhmuc/DonviAxios'
import { mapOptionsHinhThuc } from '@renderer/api/danhmuc/hinhthucAxios'
import { mapOptionsKhoiCoquan } from '@renderer/api/danhmuc/khoiCoquanAxios'
import { mapOptionsLoaiVanban } from '@renderer/api/danhmuc/loaiVanbanAxios'
import { mapOptionsTinhChat } from '@renderer/api/danhmuc/tinhChatAxios'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { SelectDropdown, SelectGroup, SelectOption } from '@renderer/components/SelectDropdown'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import { ExistingFile } from '@renderer/shared/CommonInterface'
import { ALargeSmall, CircleUser } from 'lucide-react'
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import FileUploadBox from './FileUploadBox'

type FormVanbandenProps = {
    onFilesChange?: (name: string, files: File[]) => void
    formData?: Record<string, any>
    setFormData?: Dispatch<SetStateAction<Record<string, any>>>
    existingFiles?: ExistingFile[]
    fileGroups?: Record<string, File[]>
}

// Caching master data ở biến toàn cục để tránh load lại 7 APIs mỗi lần mở form
let cachedMasterData: any = null
let masterDataPromise: Promise<any> | null = null

async function getMasterData() {
    if (cachedMasterData) return cachedMasterData
    if (!masterDataPromise) {
        masterDataPromise = Promise.all([
            mapOptionsLoaiVanban(),
            mapOptionsTinhChat(),
            mapOptionsBaoMat(),
            mapDonviGroupedOptions(),
            mapOptionsHinhThuc(),
            mapOptionsKhoiCoquan(),
            mapOptionsCoquan()
        ]).then((res) => {
            cachedMasterData = res
            return res
        })
    }
    return masterDataPromise
}

export default function FormVanbanden({
    onFilesChange,
    formData,
    setFormData,
    existingFiles = [],
    fileGroups = {}
}: FormVanbandenProps) {
    // const [ngayBanHanh, setNgayBanHanh] = useState('')
    // const [ngayNhan, setNgayNhan] = useState('')

    const [loaivanbanOptions, setLoaivanbanOptions] = useState<(SelectOption | SelectGroup)[]>([])
    const [tinhchatOptions, setTinhchatOptions] = useState<{ value: string; label: string }[]>([])
    const [baomatOptions, setBaomatOptions] = useState<{ value: string; label: string }[]>([])
    const [donviOptions, setDonviOptions] = useState<(SelectOption | SelectGroup)[]>([])
    const [hinhthucOptions, setHinhthucOptions] = useState<{ value: string; label: string }[]>([])
    const [khoicoquanOptions, setKhoicoquanOptions] = useState<{ value: string; label: string }[]>([])
    const [coquanOptions, setCoquanOptions] = useState<{ value: string; label: string }[]>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const [
                    loaiCheck,
                    tinhchatCheck,
                    baomatCheck,
                    donviCheck,
                    hinhthucCheck,
                    khoicoquanCheck,
                    coquanCheck
                ] = await getMasterData()

                setLoaivanbanOptions(loaiCheck || [])
                setTinhchatOptions(tinhchatCheck || [])
                setBaomatOptions(baomatCheck || [])
                setDonviOptions(donviCheck || [])
                setHinhthucOptions(hinhthucCheck || [])
                setKhoicoquanOptions(khoicoquanCheck || [])
                setCoquanOptions(coquanCheck || [])
            } catch (error) {
                console.error('Error fetching master data:', error)
            }
        }
        fetchData()
    }, [])

    const [localFormData, setLocalFormData] = useState(formData || {})
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    // Sync prop -> local state when prop changes (e.g. data loaded)
    useEffect(() => {
        setLocalFormData(formData || {})
    }, [formData])

    const handleChange = (name: string, value: any) => {
        // 1. Update local state immediately for UI responsiveness
        setLocalFormData((prev) => {
            const newData = { ...prev, [name]: value }

            // 2. Debounce update to parent
            if (debounceRef.current) clearTimeout(debounceRef.current)

            debounceRef.current = setTimeout(() => {
                setFormData?.(newData)
            }, 300)

            return newData
        })
    }

    const [selectedYear, setSelectedYear] = useState(() => {
        return localStorage.getItem('selected_year_vanbanden') || new Date().getFullYear().toString()
    })





    const yearOptions = Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - 10 + i).toString()).reverse()

    return (
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3 text-sm">
            {/* Row 1 */}
            <div className="col-span-12">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-2">
                        <InputFloatingLabel
                            label="Số đến"
                            name="so_van_ban"
                            isRequired
                            endContent={<ALargeSmall size={18} className="text-gray-400" />}
                            // defaultValue={formData.so_van_ban || ''}
                            value={localFormData?.so_van_ban ?? ''}
                            onChange={(val) => handleChange('so_van_ban', val)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                        <InputFloatingLabel
                            label="Hậu tố"
                            name="so_van_ban_hau_to"
                            endContent={<ALargeSmall size={18} className="text-gray-400" />}
                            // defaultValue={formData.so_van_ban_hau_to || ''}
                            value={localFormData?.so_van_ban_hau_to ?? ''}
                            onChange={(val) => handleChange('so_van_ban_hau_to', val)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-3">
                        <InputFloatingLabel
                            label="Số hiệu văn bản"
                            name="so_hieu_van_ban"
                            isRequired
                            endContent={<ALargeSmall size={18} className="text-gray-400" />}
                            // defaultValue={formData.so_hieu_van_ban || ''}
                            value={localFormData?.so_hieu_van_ban ?? ''}
                            onChange={(val) => handleChange('so_hieu_van_ban', val)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-5">
                        <SelectDropdown
                            label="Loại văn bản"
                            name="id_loai"
                            isRequired
                            options={loaivanbanOptions}
                            // defaultValue={formData.id_loai || ''}
                            value={localFormData?.id_loai ?? ''}
                            onChange={(val) => handleChange('id_loai', val)}
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="col-span-12 md:col-span-6 lg:col-span-12">
                        <TextareaFloatingLabel
                            label="Trích yếu"
                            name="trich_yeu"
                            rows={2}
                            isRequired
                            // defaultValue={formData.trich_yeu || ''}
                            value={localFormData?.trich_yeu ?? ''}
                            onChange={(val) => handleChange('trich_yeu', val)}
                        />
                    </div>
                </div>
            </div>

            {/* Row 3 */}
            <div className="col-span-12 md:col-span-6">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                        <div className="col-span-12 md:col-span-8">
                            <InputFloatingLabel
                                label="Người ký"
                                name="nguoi_ky"
                                endContent={<CircleUser size={18} className="text-gray-400" />}
                                // defaultValue={formData.nguoi_ky || ''}
                                value={localFormData?.nguoi_ky ?? ''}
                                onChange={(val) => handleChange('nguoi_ky', val)}
                            />
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <DateInputFloatingLabel
                            label="Ngày ký"
                            name="ngay_ky"
                            value={localFormData?.ngay_ky ?? ''}
                            onChange={(val) => handleChange('ngay_ky', val)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <DateInputFloatingLabel
                            label="Thời gian xử lý"
                            name="thoi_gian_xu_ly"
                            value={localFormData?.thoi_gian_xu_ly ?? ''}
                            onChange={(val) => handleChange('thoi_gian_xu_ly', val)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <DateInputFloatingLabel
                            label="Ngày ban hành"
                            name="ngay_ban_hanh"
                            value={localFormData?.ngay_ban_hanh ?? ''}
                            onChange={(val) => handleChange('ngay_ban_hanh', val)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <DateInputFloatingLabel
                            label="Ngày nhận"
                            name="ngay_nhan"
                            isRequired
                            value={localFormData?.ngay_nhan ?? localFormData?.ngay_ban_hanh ?? ''}
                            onChange={(val) => handleChange('ngay_nhan', val)}
                        />
                    </div>
                    <div className="col-span-12">
                        <SelectDropdown
                            label="Khối cơ quan ban hành"
                            name="id_khoi_co_quan"
                            options={khoicoquanOptions}
                            // defaultValue={formData?.id_khoi_co_quan || ''}
                            value={localFormData?.id_khoi_co_quan ?? ''}
                            onChange={(val) => handleChange('id_khoi_co_quan', val)}
                        />
                    </div>
                    <div className="col-span-12">
                        <SelectDropdown
                            label="Cơ quan ban hành"
                            name="id_co_quan"
                            options={coquanOptions}
                            // defaultValue={formData?.id_co_quan || ''}
                            value={localFormData?.id_co_quan ?? ''}
                            onChange={(val) => handleChange('id_co_quan', val)}
                        />
                    </div>
                </div>
            </div>

            <div className="col-span-12 md:col-span-6">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                        <SelectDropdown
                            label="Hình thức nhận"
                            name="id_hinh_thuc"
                            options={hinhthucOptions}
                            // defaultValue={formData.id_hinh_thuc || ''}
                            value={localFormData?.id_hinh_thuc ?? ''}
                            onChange={(val) => handleChange('id_hinh_thuc', val)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <SelectDropdown
                            label="Hồ sơ đơn vị"
                            name="id_don_vi"
                            options={donviOptions}
                            // defaultValue={formData.id_don_vi || ''}
                            value={localFormData?.id_don_vi ?? ''}
                            onChange={(val) => handleChange('id_don_vi', val)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <InputFloatingLabel
                            label="Lĩnh vực"
                            name="linh_vuc"
                            // defaultValue={formData.linh_vuc || ''}
                            value={localFormData?.linh_vuc ?? ''}
                            onChange={(val) => handleChange('linh_vuc', val)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <SelectDropdown
                            label="Mức độ tính chất"
                            name="id_tinh_chat"
                            isRequired
                            options={tinhchatOptions}
                            // defaultValue={formData.id_tinh_chat || '1'}
                            value={localFormData?.id_tinh_chat ?? '1'}
                            onChange={(val) => handleChange('id_tinh_chat', val)}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <SelectDropdown
                            label="Mức độ bảo mật"
                            name="id_bao_mat"
                            isRequired
                            options={baomatOptions}
                            // defaultValue={formData.id_bao_mat || '1'}
                            value={localFormData?.id_bao_mat ?? '1'}
                            onChange={(val) => handleChange('id_bao_mat', val)}
                        />
                    </div>
                    <div className="col-span-12 flex gap-2">
                        <div className="w-1/3">
                            <SelectDropdown
                                label="Năm"
                                name="nam"
                                options={yearOptions.map(y => ({ value: y, label: y }))}
                                value={selectedYear}
                                onChange={(val) => {
                                    if (val) {
                                        const y = Array.isArray(val) ? val[0] : val;
                                        setSelectedYear(y)
                                        localStorage.setItem('selected_year_vanbanden', y)
                                        handleChange('noi_luu_tru', `Công văn đến ${y} Quyển số`)
                                    }
                                }}
                            />
                        </div>
                        <InputFloatingLabel
                            label="Nơi lưu trữ"
                            name="noi_luu_tru"
                            // defaultValue={formData.noi_luu_tru || `Công văn đến ${new Date().getFullYear()} Quyển `}
                            value={localFormData?.noi_luu_tru ?? `Công văn đến ${selectedYear} Quyển `}
                            onChange={(val) => handleChange('noi_luu_tru', val)}
                        />
                    </div>
                    <div className="col-span-12 flex gap-4 items-center mt-2">
                        <Checkbox
                            isSelected={!!localFormData?.van_ban_chi_doc}
                            onChange={(checked) => handleChange('van_ban_chi_doc', checked ? 1 : 0)}
                        >
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">Văn bản chỉ đọc</span>
                        </Checkbox>
                        <Checkbox
                            isSelected={localFormData?.trang_thai === 'TIEP_NHAN'}
                            onChange={(checked) => handleChange('trang_thai', checked ? 'TIEP_NHAN' : '')}
                        >
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">Lưu trữ lại</span>
                        </Checkbox>
                    </div>
                </div>
            </div>
            <div className="hidden md:block md:col-span-6"></div>

            {/* Row 7 - File upload */}
            <div className="col-span-12 md:col-span-6 lg:col-span-12">
                <FileUploadBox
                    name="file_dinh_kem[]"
                    label="File đính kèm"
                    onFilesChange={onFilesChange}
                    existingFiles={existingFiles}
                    currentFiles={fileGroups['file_dinh_kem[]']}
                />
            </div>

        </div>
    )
}
