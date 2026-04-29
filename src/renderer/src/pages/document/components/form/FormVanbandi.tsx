import {
    // Button,
    // Dropdown,
    // DropdownTrigger,
    // DropdownMenu,
    // DropdownItem
    Tabs
} from '@heroui-v3/react'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import InputFloatingEndLabel from '@renderer/components/InputFloatingEndLabel'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { SelectDropdown, SelectGroup, SelectOption } from '@renderer/components/SelectDropdown'

import RecipientInput from '@renderer/components/RecipientInput'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import { ChevronDown, TextWrap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import TabContentBanhanh from './TabContentBanhanh'

import { vanbandiAxios } from '@renderer/api/documents/vanbandiAxios'
import {
    BaoMat,
    ExistingFile,
    HinhThuc,
    NguoiDung,
    TinhChat
} from '@renderer/shared/CommonInterface'
import { useVanbandiStore } from '@renderer/store/useVanbanStore'
import FileUploadBox from './FileUploadBox'

type FormVanbandiProps = {
    formData: Record<string, any>
    setFormData: (data: Record<string, any>) => void
    onFilesChange?: (name: string, files: File[]) => void
    existingFiles?: ExistingFile[]
    existingFilesInternal?: ExistingFile[]
    fileGroups?: Record<string, File[]>
}

type CoQuan = {
    id_co_quan: string
    ten_co_quan: string
}

export default function FormVanbandi({
    formData,
    setFormData,
    onFilesChange,
    existingFiles = [],
    existingFilesInternal = [],
    fileGroups
}: FormVanbandiProps) {
    const [allUnit, setAllUnit] = useState<any[]>([])
    const [donviOptions, setDonviOptions] = useState<(SelectOption | SelectGroup)[]>([])
    const [coQuan, setCoQuan] = useState<CoQuan[]>([])
    const [loaiVanBan, setLoaiVanBan] = useState<(SelectOption | SelectGroup)[]>([])
    const { filters } = useVanbandiStore()
    const [baoMat, setBaoMat] = useState<BaoMat[]>([])
    const [tinhChat, setTinhChat] = useState<TinhChat[]>([])
    const [hinhThuc, setHinhThuc] = useState<HinhThuc[]>([])
    const [nguoiDung, setNguoiDung] = useState<NguoiDung[]>([])
    const [lanhDao, setLanhDao] = useState<NguoiDung[]>([])
    const idDonViNguoiDung = JSON.parse(String(localStorage.getItem('auth'))).state.user.id_don_vi

    const [localFormData, setLocalFormData] = useState(formData || {})
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    // Sync prop -> local state when prop changes (e.g. data loaded)
    useEffect(() => {
        setLocalFormData(formData || {})
    }, [formData])

    const LOAI_LABEL_MAP = {
        LANH_DAO: 'Lãnh đạo',
        PHONG: 'Phòng',
        KHOA_BOMON: 'Khoa/Bộ môn',
        BAN: 'Ban',
        VIEN: 'Viện',
        TRUNG_TAM: 'Trung tâm',
        DON_VI_KHAC: 'Đơn vị khác'
    }

    const mapDonViGroupedOptions = (data: any[] = []) => {
        const grouped: Record<string, { label: string; options: { value: string; label: string }[] }> =
            {}

        data.forEach((item) => {
            const loai = item.loai as keyof typeof LOAI_LABEL_MAP
            const groupLabel = LOAI_LABEL_MAP[loai] || loai

            if (!grouped[loai]) {
                grouped[loai] = {
                    label: groupLabel,
                    options: []
                }
            }

            grouped[loai].options.push({
                value: item.id_don_vi,
                label: item.ten_don_vi
            })
        })

        // sort tên đơn vị cho đẹp
        Object.values(grouped).forEach((group) => {
            group.options.sort((a, b) => a.label.localeCompare(b.label, 'vi'))
        })

        return Object.values(grouped)
    }

    const mappingLoaiVanBan = {
        DONVI: 'Đơn vị',
        BGH: 'Ban Giám Hiệu',
        HDT: 'Hội Đồng Trường',
        CTHDT: 'Chủ Tịch Hội Đồng Trường'
    }

    const mapOptionsLoaiVanban = async (data: any) => {
        const newArray = {}
        data.data.forEach((item: any) => {
            if (!newArray[item.thuoc_nhom]) {
                newArray[item.thuoc_nhom] = [
                    {
                        value: item.id_loai,
                        label: item.ten_loai
                    }
                ]
            } else {
                newArray[item.thuoc_nhom].push({
                    value: item.id_loai,
                    label: item.ten_loai
                })
            }
        })

        return Object.keys(newArray).map((key: string) => ({
            label: mappingLoaiVanBan[key] || key,
            options: newArray[key]
        }))
    }

    const getDonVi = async () => {
        return vanbandiAxios.fetch({
            action: 'get_category_data',
            table: 'e_don_vi',
            length: 9999
        })
    }

    const getLoaiVanban = async () => {
        return vanbandiAxios.fetch({
            action: 'get_category_data',
            table: 'e_loai',
            theo_phong_ban: true,
            id_don_vi_nguoi_dung: idDonViNguoiDung
        })
    }

    const mapOptionsBaoMat = async () => {
        const res = await vanbandiAxios.fetch({
            action: 'get_category_data',
            table: 'e_bao_mat',
            // fieldName: '',
            // fieldValue: '',
            length: 9999
            // orderBy: ''
        })
        if (!res?.success) return []
        return res?.data?.map((item: any) => ({
            value: item.id_bao_mat, // dùng id_bao_mat từ API
            label: item.ten_bao_mat // dùng ten_bao_mat từ API
        }))
    }

    const mapOptionsTinhChat = async () => {
        const res = await vanbandiAxios.fetch({
            action: 'get_category_data',
            table: 'e_tinh_chat',
            // fieldName: '',
            // fieldValue: '',
            length: 9999
            // orderBy: ''
        })
        if (!res?.success) return []
        return res?.data?.map((item: any) => ({
            value: item.id_tinh_chat, // dùng id_tinh_chat từ API
            label: item.ten_tinh_chat // dùng ten_tinh_chat từ API
        }))
    }

    const mapOptionsHinhThuc = async () => {
        const res = await vanbandiAxios.fetch({
            action: 'get_category_data',
            table: 'e_hinh_thuc',
            // fieldName: '',
            // fieldValue: '',
            length: 9999
            // orderBy: ''
        })
        if (!res?.success) return []
        return (
            res?.data?.map((item: any) => ({
                value: item.id_hinh_thuc, // dùng id_hinh_thuc từ API
                label: item.ten_hinh_thuc || '' // dùng ten_hinh_thuc từ API
            })) || []
        )
    }

    const mapOptionsCoquan = async () => {
        const res = await vanbandiAxios.fetch({
            action: 'get_category_data',
            table: 'e_co_quan',
            length: 9999
        })
        if (!res?.success) return []
        return (
            res?.data?.map((item: any) => ({
                value: item.id_co_quan,
                label: item.ten_co_quan
            })) || []
        )
    }

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Chỉ fetch các dữ mục cần thiết ngay lập tức cho Tab 1
                const [unitsRes, loais, baomats, tinhchats, hinhthucs] =
                    await Promise.all([
                        getDonVi(),
                        getLoaiVanban(),
                        mapOptionsBaoMat(),
                        mapOptionsTinhChat(),
                        mapOptionsHinhThuc()
                    ])

                setAllUnit(unitsRes.data || [])
                const data = unitsRes?.data?.data || unitsRes?.data || []
                const groupedOptions = mapDonViGroupedOptions(data)
                setDonviOptions(groupedOptions)

                const loaiVanban = await mapOptionsLoaiVanban(loais)
                setLoaiVanBan(loaiVanban)

                const bms = baomats.map((b) => ({ id_bao_mat: b.value, ten_bao_mat: b.label }))
                const tcs = tinhchats.map((t) => ({ id_tinh_chat: t.value, ten_tinh_chat: t.label }))
                const hts = hinhthucs.map((h) => ({ id_hinh_thuc: h.value, ten_hinh_thuc: h.label }))

                setBaoMat(bms)
                setTinhChat(tcs)
                setHinhThuc(hts)
                // CoQuan được tải lazy khi vào tab Ban hành

                const defaultBaoMat = bms.find(b => String(b.ten_bao_mat).toLowerCase().includes('bình thường'))?.id_bao_mat || bms[0]?.id_bao_mat || ''
                const defaultTinhChat = tcs.find(t => String(t.ten_tinh_chat).toLowerCase().includes('bình thường'))?.id_tinh_chat || tcs[0]?.id_tinh_chat || ''
                const defaultHinhThuc = hts.find(h => String(h.ten_hinh_thuc).toLowerCase().includes('myoffice') || String(h.ten_hinh_thuc).toLowerCase().includes('email'))?.id_hinh_thuc || hts[0]?.id_hinh_thuc || ''

                setFormData({
                    ...formData,
                    is_public: formData.is_public !== undefined ? formData.is_public : '1',
                    ngay_ky: formData.ngay_ky || new Date().toLocaleDateString('en-CA'),
                    noi_luu_tru: formData.noi_luu_tru || 'Phòng Tổ chức - Hành chính',
                    time_send_mail: formData.time_send_mail || 'CUOI_BUOI',
                    id_bao_mat: formData.id_bao_mat || String(defaultBaoMat),
                    id_tinh_chat: formData.id_tinh_chat || String(defaultTinhChat),
                    ids_hinh_thuc: formData.ids_hinh_thuc || (defaultHinhThuc ? [String(defaultHinhThuc)] : [])
                })
            } catch (err) {
                console.error('Failed to fetch initial data:', err)
            }
        }
        fetchAllData()
    }, [])

    const [isNguoiDungLoading, setIsNguoiDungLoading] = useState(false)
    const [isLoadedNguoiDung, setIsLoadedNguoiDung] = useState(false)

    // Hàm fetch dữ liệu nhân sự khi cần
    const loadNguoiDungData = async () => {
        if (isLoadedNguoiDung || isNguoiDungLoading) return
        setIsNguoiDungLoading(true)
        try {
            const resNguoiDung = await vanbandiAxios.fetch({
                action: 'get_category_data',
                table: 'ql_nguoi_dung',
                length: 9999
            })

            const users = resNguoiDung.data || []
            setNguoiDung(users)

            // Process Leaders
            const hhhvMap = new Map()
            if (resNguoiDung.hoc_ham_hoc_vi) {
                resNguoiDung.hoc_ham_hoc_vi.forEach((h: any) => {
                    hhhvMap.set((h.ten_day_du || '').trim().toLowerCase(), h.ten_viet_tat)
                })
            }

            const lanhdao = users
                .filter((ld: any) => ld.ql_nguoi_dung_la_lanh_dao == 1 && ld.do_uu_tien_lanh_dao)
                .map((ld: any) => ({
                    ...ld,
                    hoc_ham_vi: hhhvMap.get((ld.trinh_do_dt || '').trim().toLowerCase()) || ''
                }))
                .sort((a: any, b: any) => (a.do_uu_tien_lanh_dao ?? 0) - (b.do_uu_tien_lanh_dao ?? 0))

            setLanhDao(lanhdao)
            setIsLoadedNguoiDung(true)
        } catch (err) {
            console.error('Failed to fetch user data:', err)
        } finally {
            setIsNguoiDungLoading(false)
        }
    }

    useEffect(() => {
        if (allUnit.length > 0) {
            handleChange('id_don_vi', formData.id_don_vi || String(idDonViNguoiDung))
            handleChange('id_don_vi_soan', formData.id_don_vi_soan || String(idDonViNguoiDung))
        }
    }, [baoMat, tinhChat])

    const [isTabBanhanhLoaded, setIsTabBanhanhLoaded] = useState(false)
    const [isBanhanhDataLoading, setIsBanhanhDataLoading] = useState(false)

    // Hàm fetch dữ liệu cho Tab 2
    const loadBanhanhData = async () => {
        if (isTabBanhanhLoaded || isBanhanhDataLoading) return
        setIsBanhanhDataLoading(true)
        try {
            await Promise.all([
                mapOptionsCoquan().then(coquans => 
                    setCoQuan(coquans.map((c) => ({ id_co_quan: c.value, ten_co_quan: c.label })))
                ),
                loadNguoiDungData()
            ])

            setIsTabBanhanhLoaded(true)
        } catch (err) {
            console.error('Failed to fetch banhanh data:', err)
        } finally {
            setIsBanhanhDataLoading(false)
        }
    }

    const handleTabChange = (key: string | number) => {
        setSelectedTab(key)
        if (key === 'banhanh') {
            loadBanhanhData()
        }
    }

    const tabContentBanhanhArr = ['ids_don_vi_xu_ly', 'ids_ql_nguoi_dung', 'ids_co_quan']

    const pendingUpdates = useRef<Record<string, any>>({})

    const handleChange = (name: string, value: any, immediate = false) => {
        if (tabContentBanhanhArr.includes(name) && Array.isArray(value)) {
            value = value.map((item) => item.uuid).join(',')
        }

        setLocalFormData((prev) => ({ ...prev, [name]: value }))

        // Store in pending updates
        pendingUpdates.current[name] = value

        if (immediate) {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            const updates = { ...pendingUpdates.current }
            pendingUpdates.current = {}
            setFormData((prevParent) => ({ ...prevParent, ...updates }))
        } else {
            // Debounce update to parent
            if (debounceRef.current) clearTimeout(debounceRef.current)

            debounceRef.current = setTimeout(() => {
                const updates = { ...pendingUpdates.current }
                pendingUpdates.current = {} // Clear pending
                setFormData((prevParent) => ({ ...prevParent, ...updates }))
            }, 300)
        }

        // Nếu là id_loai thì lấy số hiệu văn bản
        if (name === 'id_loai') {
            if (!value) {
                // Khi người dùng xoá chọn loại văn bản (bấm X) thì xoá trống số hiệu luôn
                setFormData((prev) => ({
                    ...prev,
                    id_loai: value,
                    so_hieu_van_ban: ''
                }))
                return
            }

            const getSoHieuVanBan = async () => {
                const res = await vanbandiAxios.fetch({
                    id_loai_selected: value,
                    current_year_vbdi: String(filters.dateRange?.fromDate).split('-')[0] || '',
                    dataFilter: false
                })

                // Khi nhận được số hiệu, cập nhật ngay lập tức và đảm bảo id_loai là giá trị mới nhất
                setFormData((prev) => ({
                    ...prev,
                    id_loai: value,
                    so_hieu_van_ban: typeof res.data === 'string' || typeof res.data === 'number' ? String(res.data) : '',
                    nguoi_ky: res.nguoi_ky ? res.nguoi_ky : ''
                }))
            }
            getSoHieuVanBan()
        }
    }

    const [selectedTab, setSelectedTab] = useState<string | number>('thongtin')

    return (
        <div>
            <Tabs selectedKey={selectedTab} onSelectionChange={handleTabChange} className="w-full">
                <Tabs.ListContainer className="w-fit">
                    <Tabs.List aria-label="Form tabs">
                        <Tabs.Tab id="thongtin" className="whitespace-nowrap">
                            <Tabs.Separator />
                            <Tabs.Indicator />
                            Thông tin chính
                        </Tabs.Tab>
                        <Tabs.Tab id="banhanh" className="whitespace-nowrap">
                            <Tabs.Separator />
                            <Tabs.Indicator />
                            Ban hành <span className="text-red-500 ml-1">*</span>
                        </Tabs.Tab>
                    </Tabs.List>
                </Tabs.ListContainer>

                <Tabs.Panel id="thongtin">
                    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-x-4 gap-y-5 text-sm mt-2">
                        <div className="md:col-span-6 lg:col-span-12">
                            <RecipientInput
                                label="Đến"
                                formData={localFormData}
                                allUsers={nguoiDung}
                                value={String(localFormData.ids_ql_nguoi_dung ?? '')}
                                onChange={(field, val) => {
                                    handleChange(field, val, true)
                                }}
                                onFocus={loadNguoiDungData}
                                isLoading={isNguoiDungLoading}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-6">
                            <SelectDropdown
                                label="Loại văn bản"
                                name="id_loai"
                                isRequired
                                value={String(localFormData.id_loai ?? '')}
                                onChange={(val) => handleChange('id_loai', val, true)}
                                options={loaiVanBan}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-6">
                            <InputFloatingEndLabel
                                label="Số hiệu văn bản"
                                name="so_hieu_van_ban"
                                isRequired
                                value={String(localFormData.so_hieu_van_ban ?? '')}
                                onChange={(val) => handleChange('so_hieu_van_ban', val)}
                                endIcon={<TextWrap size={16} />}
                                endAriaLabel="Sao chép xuống trích yếu"
                                endTooltip="Sao chép số hiệu xuống trích yếu"
                                onEndIconClick={() => {
                                    const current = localFormData.trich_yeu || ''
                                    const soHieu = localFormData.so_hieu_van_ban || ''
                                    if (soHieu && !String(current).includes(soHieu)) {
                                        handleChange('trich_yeu', `${soHieu} | ${current}`)
                                    }
                                }}
                            />
                        </div>
                        {/* Row 2 */}
                        <div className="md:col-span-6 lg:col-span-12">
                            <TextareaFloatingLabel
                                label="Trích yếu"
                                name="trich_yeu"
                                rows={3}
                                isRequired
                                value={String(localFormData.trich_yeu ?? '')}
                                onChange={(val) => handleChange('trich_yeu', val)}
                            />
                        </div>
                        {/* Row 3 */}
                        <div className="md:col-span-6 lg:col-span-3">
                            <InputFloatingEndLabel
                                label="Người ký"
                                name="nguoi_ky"
                                isRequired
                                value={String(localFormData.nguoi_ky ?? '')}
                                onChange={(val) => handleChange('nguoi_ky', val)}
                                endIcon={<ChevronDown size={16} />}
                                endAriaLabel="Chọn lãnh đạo ký"
                                endTooltip="Chọn lãnh đạo ký"
                                dropdownItems={lanhDao.map((ld, index) => ({
                                    key: String(
                                        (ld as any).ql_nguoi_dung_id ??
                                        (ld as any).user_id ??
                                        (ld as any).id ??
                                        (ld as any).uuid ??
                                        `nguoi_ld_${index}`
                                    ),
                                    label:
                                        `${(ld as any).hoc_ham_vi || ''} ${(ld as any).ql_nguoi_dung_ho_ten || (ld as any).name || ''}`.trim(),
                                    value:
                                        `${(ld as any).hoc_ham_vi || ''} ${(ld as any).ql_nguoi_dung_ho_ten || (ld as any).name || ''}`.trim()
                                }))}
                                onDropdownSelect={(item) => handleChange('nguoi_ky', item.value || item.label)}
                                onFocus={loadNguoiDungData}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-3">
                            <DateInputFloatingLabel
                                label="Ngày ký"
                                name="ngay_ky"
                                isRequired
                                value={String(localFormData.ngay_ky ?? '')}
                                onChange={(val) => handleChange('ngay_ky', val)}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-3">
                            <InputFloatingLabel
                                label="Trả lời CV số"
                                name="tra_loi_cv_den"
                                value={String(localFormData.tra_loi_cv_den ?? '')}
                                onChange={(val) => handleChange('tra_loi_cv_den', val)}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-3">
                            <DateInputFloatingLabel
                                label="Ngày trả lời"
                                name="ngay_tra_loi_cv_den"
                                value={String(localFormData.ngay_tra_loi_cv_den ?? '')}
                                onChange={(val) => handleChange('ngay_tra_loi_cv_den', val)}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-3">
                            <SelectDropdown
                                label="Đơn vị soạn"
                                name="id_don_vi_soan"
                                isRequired
                                value={String(localFormData.id_don_vi_soan ?? '')}
                                onChange={(val) => handleChange('id_don_vi_soan', val, true)}
                                options={donviOptions}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-3">
                            <InputFloatingLabel
                                label="Cán bộ soạn"
                                name="nguoi_soan_vb_di"
                                value={String(localFormData.nguoi_soan_vb_di ?? '')}
                                onChange={(val) => handleChange('nguoi_soan_vb_di', val)}
                            />
                        </div>
                        {/* <div className="md:col-span-6 lg:col-span-4"></div> */}
                        <div className="md:col-span-6 lg:col-span-3">
                            <SelectDropdown
                                label="Hồ sơ đơn vị"
                                name="id_don_vi"
                                isRequired
                                value={String(localFormData.id_don_vi ?? '')}
                                onChange={(val) => handleChange('id_don_vi', val, true)}
                                options={donviOptions}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-3">
                            <InputFloatingLabel
                                label="Nơi lưu trữ"
                                name="noi_luu_tru"
                                value={String(localFormData.noi_luu_tru ?? '')}
                                onChange={(val) => handleChange('noi_luu_tru', val)}
                            />
                        </div>
                        {/* <div className="md:col-span-6 lg:col-span-4"></div> */}
                        <div className="md:col-span-3 lg:col-span-3">
                            <SelectDropdown
                                label="Mức độ tính chất"
                                name="id_tinh_chat"
                                isRequired
                                value={String(localFormData.id_tinh_chat ?? '')}
                                onChange={(val) => handleChange('id_tinh_chat', val, true)}
                                options={tinhChat.map((item) => ({
                                    value: String(item.id_tinh_chat),
                                    label: item.ten_tinh_chat
                                }))}
                            />
                        </div>
                        <div className="md:col-span-3 lg:col-span-3">
                            <SelectDropdown
                                label="Mức độ bảo mật"
                                name="id_bao_mat"
                                isRequired
                                value={String(localFormData.id_bao_mat ?? '')}
                                onChange={(val) => handleChange('id_bao_mat', val, true)}
                                options={baoMat.map((item) => ({
                                    value: String(item.id_bao_mat),
                                    label: item.ten_bao_mat
                                }))}
                            />
                        </div>
                        <div className="md:col-span-3 lg:col-span-3">
                            <InputFloatingLabel
                                label="Lĩnh vực"
                                name="linh_vuc"
                                value={String(localFormData.linh_vuc ?? '')}
                                onChange={(val) => handleChange('linh_vuc', val)}
                            />
                        </div>
                        <div className="md:col-span-3 lg:col-span-3">
                            <SelectDropdown
                                label="Hình thức gửi"
                                name="ids_hinh_thuc"
                                isRequired
                                multiple={true}
                                value={
                                    localFormData.ids_hinh_thuc ? String(localFormData.ids_hinh_thuc).split(',') : []
                                }
                                onChange={(vals: any) => {
                                    console.log('➡️ Giá trị trả về từ SelectDropdown:', vals)
                                    const valuesArray =
                                        vals instanceof Set
                                            ? Array.from(vals)
                                            : Array.isArray(vals)
                                                ? vals
                                                : typeof vals === 'string'
                                                    ? [vals]
                                                    : []

                                    handleChange('ids_hinh_thuc', valuesArray.join(','), true)
                                }}
                                options={hinhThuc.map((item) => ({
                                    value: String(item.id_hinh_thuc),
                                    label: item.ten_hinh_thuc
                                }))}
                            />
                        </div>
                        <div className="md:col-span-3 lg:col-span-3">
                            <SelectDropdown
                                label="Công khai tệp đính kèm"
                                name="is_public"
                                isRequired
                                value={
                                    localFormData.is_public !== undefined ? String(localFormData.is_public) : '1'
                                }
                                onChange={(val) => handleChange('is_public', val)}
                                options={[
                                    { value: '0', label: 'Riêng tư' },
                                    { value: '1', label: 'Nội bộ' },
                                    { value: '2', label: 'Công khai' }
                                ]}
                            />
                        </div>
                        <div className="md:col-span-3 lg:col-span-3">
                            <SelectDropdown
                                label="Thời gian gửi thông báo mail"
                                name="time_send_mail"
                                isRequired
                                value={String(localFormData.time_send_mail ?? 'CUOI_BUOI')}
                                onChange={(val) => handleChange('time_send_mail', val)}
                                options={[
                                    { value: 'CUOI_BUOI', label: 'Gửi cuối buổi' },
                                    { value: 'NGAY', label: 'Gửi ngay' }
                                ]}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6 lg:col-span-6">
                            <FileUploadBox
                                name="file_ban_hanh[]"
                                label="File ban hành"
                                onFilesChange={onFilesChange}
                                existingFiles={existingFiles}
                                currentFiles={fileGroups ? fileGroups['file_ban_hanh[]'] : undefined}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-6">
                            <FileUploadBox
                                name="file_noi_bo[]"
                                label="File nội bộ"
                                onFilesChange={onFilesChange}
                                existingFiles={existingFilesInternal}
                                currentFiles={fileGroups ? fileGroups['file_noi_bo[]'] : undefined}
                            />
                        </div>
                    </div>
                </Tabs.Panel>

                <Tabs.Panel id="banhanh">
                    {selectedTab === 'banhanh' && (
                        <TabContentBanhanh
                            formData={localFormData}
                            onUnitChange={(units) => handleChange('ids_don_vi_xu_ly', units)}
                            onUsersChange={(users) => handleChange('ids_ql_nguoi_dung', users)}
                            onAgencyChange={(agencies) => handleChange('ids_co_quan', agencies)}
                            allUnit={allUnit}
                            allUsers={nguoiDung}
                            allAgency={coQuan}
                            isLoading={isBanhanhDataLoading}
                        />
                    )}
                </Tabs.Panel>
            </Tabs>
        </div>
    )
}
