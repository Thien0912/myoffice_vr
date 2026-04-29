import { Tabs } from '@heroui-v3/react'
import DateInputFloatingLabel from '@renderer/components/DateInputFloatingLabel'
import InputFloatingEndLabel from '@renderer/components/InputFloatingEndLabel'
import { InputFloatingLabel } from '@renderer/components/InputFloatingLabel'
import { SelectDropdown, SelectGroup, SelectOption } from '@renderer/components/SelectDropdown'

import { callApi } from '@renderer/api/callApi'
import { vanbannoiboAxios } from '@renderer/api/documents/vanbannoiboAxios'
import { TextareaFloatingLabel } from '@renderer/components/TextareaFloatingLabel'
import { BaoMat, ExistingFile, HinhThuc, LoaiVanBan, NguoiDung, TinhChat } from '@renderer/shared/CommonInterface'
import { useVanbandiStore } from '@renderer/store/useVanbanStore'
import { ChevronDown, TextWrap } from 'lucide-react'
import { useEffect, useState } from 'react'
import FileUploadBox from './FileUploadBox'
import TabContentGioiHanDoc from './TabContentGioiHanDoc'

type FormVanbannoiboProps = {
    formData: Record<string, any>
    setFormData: (data: Record<string, any>) => void
    onFilesChange?: (name: string, files: File[]) => void
    existingFiles?: ExistingFile[]
    fileGroups?: Record<string, File[]>
}

export default function FormVanbannoibo({
    formData,
    setFormData,
    onFilesChange,
    existingFiles = [],
    fileGroups
}: FormVanbannoiboProps) {
    const [allUnit, setAllUnit] = useState<any[]>([])
    const [donviOptions, setDonviOptions] = useState<(SelectOption | SelectGroup)[]>([])
    const [loaiVanBan, setLoaiVanBan] = useState<LoaiVanBan[]>([])
    const { filters } = useVanbandiStore()
    const [baoMat, setBaoMat] = useState<BaoMat[]>([])
    const [tinhChat, setTinhChat] = useState<TinhChat[]>([])
    const [hinhThuc, setHinhThuc] = useState<HinhThuc[]>([])
    const [nguoiDung, setNguoiDung] = useState<NguoiDung[]>([])
    const [lanhDao, setLanhDao] = useState<NguoiDung[]>([])
    const idDonViNguoiDung = JSON.parse(String(localStorage.getItem('auth'))).state.user.id_don_vi

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

    const getDonVi = async () => {
        vanbannoiboAxios
            .fetch({
                action: 'get_category_data',
                table: 'e_don_vi',
                // fieldName: '',
                // fieldValue: '',
                length: 9999,
                // orderBy: ''
            })
            .then((response) => {
                // console.log("response DV: ", response)
                const data = response?.data?.data || response?.data || []
                setAllUnit(data)

                // data đã custom để dùng cho Select
                const groupedOptions = mapDonViGroupedOptions(data)
                setDonviOptions(groupedOptions)
            })
    }

    const getCoQuan = async () => {
        // const res = await callApi('admin/danhmuc/coquan', { ... })
        // setCoQuan(res.data)
    }

    const getLoaiVanBan = async () => {
        vanbannoiboAxios
            .fetch({
                action: 'get_category_data',
                table: 'e_loai',
                theo_phong_ban: true,
                id_don_vi_nguoi_dung: idDonViNguoiDung
            })
            .then((response) => {
                setLoaiVanBan(response?.data || [])
            })
    }

    const getBaoMat = async () => {
        vanbannoiboAxios
            .fetch({
                action: 'get_category_data',
                table: 'e_bao_mat',
                // fieldName: '',
                // fieldValue: '',
                length: 9999,
                // orderBy: ''
            })
            .then((response) => {
                setBaoMat(response?.data || [])
            })
    }

    const getTinhChat = async () => {
        vanbannoiboAxios
            .fetch({
                action: 'get_category_data',
                table: 'e_tinh_chat',
                // fieldName: '',
                // fieldValue: '',
                length: 9999,
                // orderBy: ''
            })
            .then((response) => {
                setTinhChat(response?.data || [])
            })
    }

    const getHinhThuc = async () => {
        vanbannoiboAxios
            .fetch({
                action: 'get_category_data',
                table: 'e_hinh_thuc',
                // fieldName: '',
                // fieldValue: '',
                length: 9999,
                // orderBy: ''
            })
            .then((response) => {
                setHinhThuc(response?.data || [])
            })
    }

    const getNguoiDung = async () => {
        vanbannoiboAxios
            .fetch({
                action: 'get_category_data',
                table: 'ql_nguoi_dung',
                // fieldName: '',
                // fieldValue: '',
                length: 9999,
                // orderBy: ''
            })
            .then((res) => {
                const data = res?.data || []

                let nguoiDung = data;
                nguoiDung = nguoiDung.filter(
                    (value) => value.id_don_vi == idDonViNguoiDung
                )
                setNguoiDung(nguoiDung)

                const canbo = data
                const lanhdao = canbo.filter(
                    (value) => value.ql_nguoi_dung_la_lanh_dao == 1 && value.id_don_vi == idDonViNguoiDung
                )

                lanhdao.forEach((ld) => {
                    res.hoc_ham_hoc_vi.some((hhhv) => {
                        if (
                            (ld.trinh_do_dt || '').trim().toLowerCase() ==
                            (hhhv.ten_day_du || '').trim().toLowerCase()
                        ) {
                            ld.hoc_ham_vi = hhhv.ten_viet_tat
                            return true // Add return value
                        } else {
                            ld.hoc_ham_vi = ''
                        }
                        return false
                    })
                })

                lanhdao.sort((a, b) => (a.do_uu_tien_lanh_dao ?? 0) - (b.do_uu_tien_lanh_dao ?? 0))

                setLanhDao(lanhdao)
            })
    }

    useEffect(() => {
        getDonVi()
        getLoaiVanBan()
        getBaoMat()
        getTinhChat()
        getNguoiDung()
        getHinhThuc()
        getCoQuan()

        setFormData({
            ...formData,
            ngay_ky: formData.ngay_ky || new Date().toLocaleDateString('en-CA'),
            noi_luu_tru: formData.noi_luu_tru || '',
            id_hinh_thuc: formData.id_hinh_thuc || '6'
        })
    }, [])

    useEffect(() => {
        if (allUnit.length > 0 && !formData.id_don_vi) {
            handleChange('id_don_vi', formData.id_don_vi || String(idDonViNguoiDung))
            handleChange('id_don_vi_soan', formData.id_don_vi_soan || String(idDonViNguoiDung))
        }
    }, [allUnit])

    useEffect(() => {
        if (baoMat.length > 0 && !formData.id_bao_mat) {
            handleChange('id_bao_mat', formData.id_bao_mat || String(baoMat[0].id_bao_mat))
        }

        if (tinhChat.length > 0 && !formData.id_tinh_chat) {
            handleChange('id_tinh_chat', formData.id_tinh_chat || String(tinhChat[0].id_tinh_chat))
        }
    }, [baoMat, tinhChat])

    const tabContentBanhanhArr = [
        'ids_don_vi_xu_ly',
        'ids_ql_nguoi_dung',
        'ids_co_quan',
        'nguoi_don_vi',
        'nguoi_dong_so_huu'
    ]

    const handleChange = (name: string, value: any) => {
        if (tabContentBanhanhArr.includes(name)) {
            value = value.map((item) => item.uuid).join(',')
        }

        setFormData((prev) => {
            const newFormData = { ...prev, [name]: value }
            console.log('new formData: ', newFormData) // log giá trị sau khi set
            return newFormData
        })

        // Nếu là id_loai thì lấy số hiệu văn bản
        if (name === 'id_loai') {
            const getSoHieuVanBan = async () => {
                const res = await callApi('admin/vanban/vanbannoibo', {
                    method: 'GET',
                    data: {
                        id_loai_selected: value,
                        current_year_vbnb: String(filters.dateRange?.fromDate).split('-')[0] || '',
                        dataFilter: false
                    },
                    headers: {},
                    timeout: 30000,
                    throwException: false,
                    debug: false
                })
                setFormData((prev) => ({ ...prev, so_hieu_van_ban: res.data || '' }))
            }
            getSoHieuVanBan()
        }
    }

    return (
        <div>
            <Tabs aria-label="Options" className="p-0">
                <Tabs.ListContainer className="w-fit">
                    <Tabs.List>
                        <Tabs.Tab id="thongtin" className='whitespace-nowrap'>
                            <span>Thông tin chính</span>
                            <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id="gioihandoc" className='whitespace-nowrap'>
                            <div className="flex items-center gap-1">
                                <span>Giới hạn đọc</span> <span className="text-red-500">*</span>
                            </div>
                            <Tabs.Indicator />
                        </Tabs.Tab>
                    </Tabs.List>
                </Tabs.ListContainer>
                <Tabs.Panel id="thongtin">
                    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-x-4 gap-y-5 text-sm mt-2">
                        <div className="md:col-span-6 lg:col-span-6">
                            <SelectDropdown
                                label="Loại văn bản"
                                name="id_loai"
                                isRequired
                                value={String(formData.id_loai || '')}
                                onChange={(val) => handleChange('id_loai', val)}
                                options={loaiVanBan.map((m) => ({ value: String(m.id_loai), label: m.ten_loai }))}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-6">
                            <InputFloatingEndLabel
                                label="Số hiệu văn bản"
                                name="so_hieu_van_ban"
                                isRequired
                                value={String(formData.so_hieu_van_ban || '')}
                                onChange={(val) => handleChange('so_hieu_van_ban', val)}
                                endIcon={<TextWrap size={16} />}
                                endAriaLabel="Sao chép xuống trích yếu"
                                endTooltip="Sao chép số hiệu xuống trích yếu"
                                onEndIconClick={() => {
                                    const current = formData.trich_yeu || ''
                                    const soHieu = formData.so_hieu_van_ban || ''
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
                                value={String(formData.trich_yeu || '')}
                                onChange={(val) => handleChange('trich_yeu', val)}
                            />
                        </div>
                        {/* Row 3 */}
                        <div className="md:col-span-6 lg:col-span-4">
                            <InputFloatingEndLabel
                                label="Người ký"
                                name="nguoi_ky"
                                isRequired
                                value={String(formData.nguoi_ky || '')}
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
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-4">
                            <DateInputFloatingLabel
                                label="Ngày ký"
                                name="ngay_ky"
                                isRequired
                                value={formData.ngay_ky || ''}
                                onChange={(val) => handleChange('ngay_ky', val)}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-4">
                            <InputFloatingLabel
                                label="Trả lời CV số"
                                name="tra_loi_cv_den"
                                value={formData.tra_loi_cv_den || ''}
                                onChange={(val) => handleChange('tra_loi_cv_den', val)}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-4">
                            <SelectDropdown
                                label="Đơn vị soạn"
                                name="id_don_vi_soan"
                                isRequired
                                value={String(formData.id_don_vi_soan || '')}
                                onChange={(val) => handleChange('id_don_vi_soan', val)}
                                options={donviOptions}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-4">
                            <DateInputFloatingLabel
                                label="Ngày trả lời"
                                name="ngay_tra_loi"
                                value={String(formData.ngay_tra_loi || '')}
                                onChange={(val) => handleChange('ngay_tra_loi', val)}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-4">
                            <InputFloatingLabel
                                label="Cán bộ soạn"
                                name="can_bo_soan"
                                value={String(formData.can_bo_soan || '')}
                                onChange={(val) => handleChange('can_bo_soan', val)}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-4">
                            <SelectDropdown
                                label="Hồ sơ đơn vị"
                                name="id_don_vi"
                                isRequired
                                value={String(formData.id_don_vi || '')}
                                onChange={(val) => handleChange('id_don_vi', val)}
                                options={donviOptions}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-4">
                            <InputFloatingLabel
                                label="Nơi lưu trữ"
                                name="noi_luu_tru"
                                value={String(formData.noi_luu_tru || '')}
                                onChange={(val) => handleChange('noi_luu_tru', val)}
                            />
                        </div>
                        <div className="md:col-span-3 lg:col-span-4">
                            <InputFloatingLabel
                                label="Lĩnh vực"
                                name="linh_vuc"
                                value={String(formData.linh_vuc || '')}
                                onChange={(val) => handleChange('linh_vuc', val)}
                            />
                        </div>
                        <div className="md:col-span-4">
                            <SelectDropdown
                                label="Mức độ tính chất"
                                name="id_tinh_chat"
                                isRequired
                                value={String(formData.id_tinh_chat || '')}
                                onChange={(val) => handleChange('id_tinh_chat', val)}
                                options={tinhChat.map((item) => ({
                                    value: String(item.id_tinh_chat),
                                    label: item.ten_tinh_chat
                                }))}
                            />
                        </div>
                        <div className="md:col-span-4">
                            <SelectDropdown
                                label="Mức độ bảo mật"
                                name="id_bao_mat"
                                isRequired
                                value={String(formData.id_bao_mat || '')}
                                onChange={(val) => handleChange('id_bao_mat', val)}
                                options={baoMat.map((item) => ({
                                    value: String(item.id_bao_mat),
                                    label: item.ten_bao_mat
                                }))}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-4">
                            <SelectDropdown
                                label="Hình thức gửi"
                                name="ids_hinh_thuc"
                                isRequired
                                value={String(formData.id_hinh_thuc || '')}
                                onChange={(val) => {
                                    handleChange('id_hinh_thuc', val)
                                }}
                                options={hinhThuc.map((item) => ({
                                    value: String(item.id_hinh_thuc),
                                    label: item.ten_hinh_thuc
                                }))}
                            />
                        </div>

                        <div className="md:col-span-12 lg:col-span-12">
                            <FileUploadBox
                                name="file_dinh_kem_vbnoibo[]"
                                label="Đính kèm file"
                                onFilesChange={onFilesChange}
                                existingFiles={existingFiles}
                                currentFiles={fileGroups?.['file_dinh_kem_vbnoibo[]']}
                            />
                        </div>
                    </div>
                </Tabs.Panel>
                <Tabs.Panel id="gioihandoc">
                    <TabContentGioiHanDoc
                        formData={formData}
                        onUsersChange={(users) => handleChange('nguoi_don_vi', users)}
                        onCoOwnerChange={(users) => handleChange('nguoi_dong_so_huu', users)}
                        allUsers={nguoiDung}
                    />
                </Tabs.Panel>
            </Tabs>
        </div>
    )
}
