import { toast } from "@heroui-v3/react"
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Tooltip,
    useDisclosure
} from '@heroui/react'
import { mapDonviOptions } from '@renderer/api/danhmuc/DonviAxios'
import {
    mapDantocOptions,
    mapQuocgiaOptions,
    mapTinhThanhAxios,
    mapTongiaoOptions
} from '@renderer/api/danhmuc/dtqgtg'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import { mapVitriOptions } from '@renderer/api/danhmuc/VitriAxios'
import { minhchungAxios } from '@renderer/api/hr/minhchungAxios'
import BackToTop from '@renderer/components/BackToTop'
import { HrDrawer, HrDrawerBody, HrDrawerFooter, HrDrawerHeader, HrPrimaryButton } from '@renderer/components/hero-custom'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronsRight, Images, Plus, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { AvatarCropper } from './AvatarCropper'
import MinhChungCollector, { type CachedMinhChung } from './MinhChungCollector'
import Step1Basic from './Step1Basic'
import Step2Contact from './Step2Contact'
import FormSkeletonLoader from './elements/FormSkeletonLoader'

export interface Option {
    value: string | number
    label: string
}

export interface DonVi {
    id_don_vi: string
    ten_don_vi: string
}

export interface ViTriCongViec {
    id_vi_tri_cong_viec: string
    ten_cong_viec: string
}

export interface DanToc {
    id_dan_toc: string
    ten: string
}

export interface TonGiao {
    id_ton_giao: string
    ten: string
}

export interface QuocGia {
    id_quoc_gia: string
    ten: string
}

export interface Tinh {
    id: string
    name: string
}

export interface Phuong {
    id: string
    name: string
    district_code?: string
}

export interface NhansuFormData {
    ma_nhan_vien: string
    ho_va_ten: string
    avatar?: string
    gioi_tinh: string
    ngay_sinh: string
    mst_ca_nhan: string
    id_don_vi: string
    id_don_vi_cong_tac: string
    id_dan_toc: string
    id_ton_giao: string
    id_quoc_tich: string
    cccd_so: string
    cccd_ngay_cap: string
    cccd_ngay_het_han: string
    cccd_noi_cap: string
    ho_chieu_id: string
    ho_chieu_so: string
    ho_chieu_ngay_cap: string
    ho_chieu_ngay_het_han: string
    ho_chieu_noi_cap: string
    trinh_do_vh: string
    hoc_ham: string
    trinh_do_dt: string
    noi_dt: string
    nganh_dt: string
    khoa_dt: string
    nam_tn: string
    xep_loai_tn: string
    hktt_id_quoc_gia: string
    hktt_id_tinh_tp: string
    hktt_id_quan_huyen: string
    hktt_id_xa_phuong: string
    hktt_so_nha: string
    hktt_dia_chi: string
    hktt_so_ho_khau: string
    hktt_ma_so_ho_gd: string
    hktt_la_chu_ho: boolean
    so_dien_thoai: string
    email: string
    email_ca_nhan: string
    que_quan: string
    lhkc_ho_ten: string
    lhkc_quan_he: string
    lhkc_sdt_di_dong: string
    lhkc_sdt_nha_rieng: string
    lhkc_email: string
    lhkc_dia_chi: string
    cohn_giong_hktt: boolean
    cohn_id_quoc_gia: string
    cohn_id_tinh_tp: string
    cohn_id_quan_huyen: string
    cohn_id_xa_phuong: string
    cohn_so_nha: string
    cohn_dia_chi: string
    ma_cham_cong: string
    chuc_danh: string
    trang_thai: string
    id_ca_lam_viec: string
    id_nhan_vien_ql_truc_tiep: string
    id_nhan_vien_ql_gian_tiep: string
    so_so_qlld: string
    loai_hop_dong: string
    bac: string
    so_ngay_phep: string
    tu_dong_tang_phep: boolean
    ngay_tap_su: string
    ngay_tap_su_ket_thuc: string
    ngay_thu_viec: string
    ngay_thu_viec_ket_thuc: string
    ngay_lam_chinh_thuc: string
    ngay_lam_chinh_thuc_ket_thuc: string
    so_so_bhxh: string
    ma_bhxh: string
    ti_le_dong: string
    ti_le_dong_dn: string
    ten_tinh_cap: string
    ngay_tham_gia: string
    ngay_het_han: string
    noi_dk_kcb: string
    bac_hop_dong: string
    id_vi_tri_cong_viec?: string
    ghi_chu?: string
    don_vi_kiem_nhiem?: DonViKiemNhiem[]
}

export interface DonViKiemNhiem {
    id_don_vi_cong_tac: string
    id_vi_tri_cong_viec: string
    la_lanh_dao: boolean
}

export function AddNhansuButton(): React.JSX.Element {
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false)
    const {
        isOpen: isAvatarOpen,
        onOpen: onAvatarOpen,
        onOpenChange: onAvatarOpenChange
    } = useDisclosure()
    const scrollRef = useRef<HTMLDivElement>(null)
    const [donVi, setDonVi] = useState<Option[]>([])
    const [chucVu, setChucVu] = useState<Option[]>([])
    const [danToc, setDanToc] = useState<Option[]>([])
    const [quocGia, setQuocGia] = useState<Option[]>([])
    const [tonGiao, setTonGiao] = useState<Option[]>([])
    const [tinhThanh, setTinhThanh] = useState<Option[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [tempImageSrc, setTempImageSrc] = useState<string | undefined>(undefined)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [cachedMinhChung, setCachedMinhChung] = useState<CachedMinhChung[]>([])
    const [isSecondaryOpen, setIsSecondaryOpen] = useState(true)
    // Lazy-mount: only render heavy form after drawer opens to avoid blocking animation
    const [hasMounted, setHasMounted] = useState(false)

    const handleFileSelect = useCallback((file: File) => {
        const reader = new FileReader()
        reader.onload = () => setTempImageSrc(reader.result as string)
        reader.readAsDataURL(file)
    }, [])

    const methods = useForm<NhansuFormData>({
        mode: 'onBlur',
        defaultValues: {
            ma_nhan_vien: '',
            ho_va_ten: '',
            avatar: '',
            gioi_tinh: '',
            ngay_sinh: '',
            mst_ca_nhan: '',
            id_don_vi: '',
            id_don_vi_cong_tac: '',
            id_dan_toc: '',
            id_ton_giao: '',
            id_quoc_tich: '',
            cccd_so: '',
            cccd_ngay_cap: '',
            cccd_ngay_het_han: '',
            cccd_noi_cap: 'Cục Cảnh sát QLHC về Trật tự xã hội',
            ho_chieu_id: '',
            ho_chieu_so: '',
            ho_chieu_ngay_cap: '',
            ho_chieu_ngay_het_han: '',
            ho_chieu_noi_cap: '',
            trinh_do_vh: '',
            hoc_ham: '',
            trinh_do_dt: '',
            noi_dt: '',
            nganh_dt: '',
            khoa_dt: '',
            nam_tn: '',
            xep_loai_tn: '',
            hktt_id_quoc_gia: '',
            hktt_id_tinh_tp: '',
            hktt_id_quan_huyen: '',
            hktt_id_xa_phuong: '',
            hktt_so_nha: '',
            hktt_dia_chi: '',
            hktt_so_ho_khau: '',
            hktt_ma_so_ho_gd: '',
            hktt_la_chu_ho: false,
            so_dien_thoai: '',
            email: '',
            email_ca_nhan: '',
            que_quan: '',
            lhkc_ho_ten: '',
            lhkc_quan_he: '',
            lhkc_sdt_di_dong: '',
            lhkc_sdt_nha_rieng: '',
            lhkc_email: '',
            lhkc_dia_chi: '',
            cohn_giong_hktt: false,
            cohn_id_quoc_gia: '',
            cohn_id_tinh_tp: '',
            cohn_id_quan_huyen: '',
            cohn_id_xa_phuong: '',
            cohn_so_nha: '',
            cohn_dia_chi: '',
            ma_cham_cong: '',
            chuc_danh: '',
            trang_thai: 'DANG_LAM_VIEC',
            id_ca_lam_viec: '',
            id_nhan_vien_ql_truc_tiep: '',
            id_nhan_vien_ql_gian_tiep: '',
            so_so_qlld: '',
            loai_hop_dong: '',
            bac: '',
            so_ngay_phep: '12',
            tu_dong_tang_phep: true,
            ngay_tap_su: '',
            ngay_tap_su_ket_thuc: '',
            ngay_thu_viec: '',
            ngay_thu_viec_ket_thuc: '',
            ngay_lam_chinh_thuc: '',
            ngay_lam_chinh_thuc_ket_thuc: '',
            so_so_bhxh: '',
            ma_bhxh: '',
            ti_le_dong: '8',
            ti_le_dong_dn: '10.5',
            ten_tinh_cap: '',
            ngay_tham_gia: '',
            ngay_het_han: '',
            noi_dk_kcb: 'Bệnh viện Đại học Nam Cần Thơ',
            id_vi_tri_cong_viec: '',
            ghi_chu: ''
        }
    })
    const { control, handleSubmit: handleFormSubmit, reset, setError } = methods

    // Fetch data when drawer opens
    useEffect(() => {
        if (!isOpen) {
            setHasMounted(false)
            return
        }

        // Delay form mount until AFTER drawer slide animation finishes (~300ms)
        // requestAnimationFrame only waits 1 frame (16ms) — not enough for the animation
        const timer = setTimeout(() => setHasMounted(true), 350)

            ; (async () => {
                try {
                    const [donViRes, chucVuRes, danTocRes, quocGiaRes, tonGiaoRes, tinhThanhRes] =
                        await Promise.all([
                            mapDonviOptions(),
                            mapVitriOptions(),
                            mapDantocOptions(),
                            mapQuocgiaOptions(),
                            mapTongiaoOptions(),
                            mapTinhThanhAxios()
                        ])
                    setDonVi(donViRes)
                    setChucVu(chucVuRes)
                    setDanToc(danTocRes)
                    setQuocGia(quocGiaRes)
                    setTonGiao(tonGiaoRes)
                    setTinhThanh(tinhThanhRes)
                } catch (error) {
                    console.error('Error fetching data:', error)
                }
            })()

        return () => clearTimeout(timer)
    }, [isOpen])

    // Memoized mapped arrays — avoid recomputing on every render
    const donViRaw = useMemo(
        () => (donVi || []).map((o) => ({ id_don_vi: String(o.value ?? ''), ten_don_vi: o.label })),
        [donVi]
    )
    const viTriRaw = useMemo(
        () => (chucVu || []).map((o) => ({ id_vi_tri_cong_viec: String(o.value ?? ''), ten_cong_viec: o.label })),
        [chucVu]
    )
    const danTocRaw = useMemo(
        () => (danToc || []).map((o) => ({ id_dan_toc: String(o.value ?? ''), ten: o.label })),
        [danToc]
    )
    const quocGiaRaw = useMemo(
        () => (quocGia || []).map((o) => ({ id_quoc_gia: String(o.value ?? ''), ten: o.label })),
        [quocGia]
    )
    const tonGiaoRaw = useMemo(
        () => (tonGiao || []).map((o) => ({ id_ton_giao: String(o.value ?? ''), ten: o.label })),
        [tonGiao]
    )
    const tinhRaw = useMemo(
        () => (tinhThanh || []).map((o) => ({ id: String(o.value ?? ''), name: o.label })),
        [tinhThanh]
    )

    const base64ToBlob = (base64String: string): Blob => {
        const arr = base64String.split(',')
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], { type: mime })
    }

    const handleSubmit = useCallback(
        async (data: NhansuFormData) => {
            const payload = {
                hrm_nhan_vien: {
                    ma_nhan_vien: data.ma_nhan_vien || '',
                    ho_va_ten: data.ho_va_ten || '',
                    gioi_tinh: data.gioi_tinh || '',
                    ngay_sinh: data.ngay_sinh || '',
                    mst_ca_nhan: data.mst_ca_nhan || '',
                    id_don_vi_cong_tac: data.id_don_vi || data.id_don_vi_cong_tac || '',
                    id_vi_tri_cong_viec: data.id_vi_tri_cong_viec || '',
                    id_dan_toc: data.id_dan_toc || '',
                    id_ton_giao: data.id_ton_giao || '',
                    id_quoc_tich: data.id_quoc_tich || '',
                    cccd_so: data.cccd_so || '',
                    cccd_ngay_cap: data.cccd_ngay_cap || '',
                    cccd_ngay_het_han: data.cccd_ngay_het_han || '',
                    cccd_noi_cap: data.cccd_noi_cap || 'Cục Cảnh sát QLHC về Trật tự xã hội',
                    ho_chieu_so: data.ho_chieu_so || data.ho_chieu_id || '',
                    ho_chieu_ngay_cap: data.ho_chieu_ngay_cap || '',
                    ho_chieu_ngay_het_han: data.ho_chieu_ngay_het_han || '',
                    ho_chieu_noi_cap: data.ho_chieu_noi_cap || '',
                    trinh_do_vh: data.trinh_do_vh || '',
                    hoc_ham: data.hoc_ham || '',
                    trinh_do_dt: data.trinh_do_dt || '',
                    noi_dt: data.noi_dt || '',
                    nganh_dt: data.nganh_dt || '',
                    khoa_dt: data.khoa_dt || '',
                    nam_tn: data.nam_tn || '',
                    xep_loai_tn: data.xep_loai_tn || '',
                    hktt_id_quoc_gia: data.hktt_id_quoc_gia || '',
                    hktt_id_tinh_tp: data.hktt_id_tinh_tp || '',
                    hktt_id_quan_huyen: data.hktt_id_quan_huyen || '',
                    hktt_id_xa_phuong: data.hktt_id_xa_phuong || '',
                    hktt_so_nha: data.hktt_so_nha || '',
                    hktt_dia_chi: data.hktt_dia_chi || '',
                    hktt_so_ho_khau: data.hktt_so_ho_khau || '',
                    hktt_ma_so_ho_gd: data.hktt_ma_so_ho_gd || '',
                    hktt_la_chu_ho: data.hktt_la_chu_ho ? '1' : '0',
                    so_dien_thoai: data.so_dien_thoai || '',
                    email: data.email || '',
                    email_ca_nhan: data.email_ca_nhan || '',
                    que_quan: data.que_quan || '',
                    lhkc_ho_ten: data.lhkc_ho_ten || '',
                    lhkc_quan_he: data.lhkc_quan_he || '',
                    lhkc_sdt_di_dong: data.lhkc_sdt_di_dong || '',
                    lhkc_sdt_nha_rieng: data.lhkc_sdt_nha_rieng || '',
                    lhkc_email: data.lhkc_email || '',
                    lhkc_dia_chi: data.lhkc_dia_chi || '',
                    cohn_id_quoc_gia: data.cohn_id_quoc_gia || '',
                    cohn_id_tinh_tp: data.cohn_id_tinh_tp || '',
                    cohn_id_quan_huyen: data.cohn_id_quan_huyen || '',
                    cohn_id_xa_phuong: data.cohn_id_xa_phuong || '',
                    cohn_so_nha: data.cohn_so_nha || '',
                    cohn_dia_chi: data.cohn_dia_chi || '',
                    cohn_giong_hktt: data.cohn_giong_hktt ? '1' : '0'
                },
                hrm_nhan_vien_cong_viec: {
                    ma_cham_cong: data.ma_cham_cong || '',
                    chuc_danh: data.chuc_danh || '',
                    cap: '',
                    bac: data.bac || '',
                    trang_thai: data.trang_thai || '',
                    id_ca_lam_viec: data.id_ca_lam_viec || '',
                    id_nhan_vien_ql_truc_tiep: data.id_nhan_vien_ql_truc_tiep || '',
                    id_nhan_vien_ql_gian_tiep: data.id_nhan_vien_ql_gian_tiep || '',
                    so_so_qlld: data.so_so_qlld || '',
                    loai_hop_dong: data.loai_hop_dong || '',
                    bac_hop_dong: data.bac_hop_dong || '',
                    so_ngay_phep: data.so_ngay_phep || '12',
                    ngay_tap_su: data.ngay_tap_su || '',
                    ngay_tap_su_ket_thuc: data.ngay_tap_su_ket_thuc || '',
                    ngay_thu_viec: data.ngay_thu_viec || '',
                    ngay_thu_viec_ket_thuc: data.ngay_thu_viec_ket_thuc || '',
                    ngay_lam_chinh_thuc: data.ngay_lam_chinh_thuc || '',
                    ngay_lam_chinh_thuc_ket_thuc: data.ngay_lam_chinh_thuc_ket_thuc || '',
                    tu_dong_tang_phep: data.tu_dong_tang_phep ? '1' : '0'
                },
                hrm_nhan_vien_bao_hiem: {
                    so_so_bhxh: data.so_so_bhxh || '',
                    ma_bhxh: data.ma_bhxh || '',
                    ti_le_dong: data.ti_le_dong || '10.5',
                    ti_le_dong_dn: data.ti_le_dong_dn || '21.5',
                    ten_tinh_cap: data.ten_tinh_cap || '',
                    ngay_tham_gia: data.ngay_tham_gia || '',
                    ngay_het_han: data.ngay_het_han || '',
                    noi_dk_kcb: data.noi_dk_kcb || 'Bệnh Viện Đại học Nam Cần Thơ'
                },
                hrm_hop_dong: {},
                don_vi_kiem_nhiem: (data.don_vi_kiem_nhiem || []).map((item) => ({
                    id_don_vi_cong_tac: item.id_don_vi_cong_tac || '',
                    id_vi_tri_cong_viec: item.id_vi_tri_cong_viec || '',
                    la_lanh_dao: item.la_lanh_dao ? '1' : '0'
                }))
            }

            setIsLoading(true)
            try {
                const formData = new FormData()
                formData.append('payload', JSON.stringify(payload))

                let fileToUpload = avatarFile
                if (!fileToUpload && data.avatar && data.avatar.startsWith('data:')) {
                    const blob = base64ToBlob(data.avatar)
                    fileToUpload = new File([blob], `avatar_${data.ma_nhan_vien || Date.now()}.png`, {
                        type: blob.type
                    })
                }
                if (fileToUpload) formData.append('avatar', fileToUpload)

                const response = await NhansuAxios.create(formData)
                if (response.success) {
                    queryClient.invalidateQueries({ queryKey: ['nhansuData'] })
                    queryClient.invalidateQueries({ queryKey: ['nhansuStats'] })

                    // Auto-upload cached minh chứng files
                    const createdId = response.data?.id_nhan_vien || response.data?.hrm_nhan_vien?.id_nhan_vien
                    if (createdId && cachedMinhChung.length > 0) {
                        let uploadCount = 0
                        for (const group of cachedMinhChung) {
                            try {
                                await minhchungAxios.upload({
                                    id_nhan_vien: createdId,
                                    id_loai_minh_chung: group.id_loai_minh_chung,
                                    files: group.files
                                })
                                uploadCount += group.files.length
                            } catch (err) {
                                console.error('Upload minh chứng error:', err)
                            }
                        }
                        if (uploadCount > 0) {
                            toast(`Đã tải lên ${uploadCount} tệp minh chứng`, { variant: 'success' })
                        }
                    }

                    setCachedMinhChung([])
                    reset()
                    setIsOpen(false)
                } else {
                    // Xử lý lỗi trùng đơn vị kiêm nhiệm (array nhiều lỗi)
                    if (response.error?.don_vi_kiem_nhiem_errors?.length) {
                        const errors = response.error.don_vi_kiem_nhiem_errors as {
                            index: number
                            message: string
                        }[]
                        errors.forEach(({ index: dupIndex, message: dupMsg }) => {
                            setError(`don_vi_kiem_nhiem.${dupIndex}.id_don_vi_cong_tac` as any, {
                                type: 'manual',
                                message: dupMsg
                            })
                        })
                        // Scroll đến item đầu tiên bị lỗi
                        setTimeout(() => {
                            const firstIndex = errors[0].index
                            const el = document.getElementById(`dvkn-item-${firstIndex}`)
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }
                        }, 100)
                        console.error('Duplicate don_vi_kiem_nhiem:', errors)
                    } else {
                        console.error('Error creating employee:', response.message)
                    }
                }
            } catch (error) {
                console.error('Error submitting form:', error)
            } finally {
                setIsLoading(false)
            }
        },
        [reset, queryClient, avatarFile, cachedMinhChung]
    )

    const handleClose = useCallback(() => {
        reset()
        setCachedMinhChung([])
        setIsOpen(false)
    }, [reset])

    return (
        <>
            <HrPrimaryButton
                onPress={() => {
                    // Open drawer immediately — no waiting for API
                    setIsOpen(true)
                    // Fetch last ID in background after drawer opens
                    NhansuAxios.getLastID()
                        .then((response) => {
                            if (response?.success) {
                                methods.setValue('ma_nhan_vien', response?.data || '')
                            }
                        })
                        .catch((error) => {
                            console.error('Failed to fetch last ID:', error)
                        })
                }}
            >
                <span className="hidden sm:inline">Thêm hồ sơ</span>
            </HrPrimaryButton>

            {/* Drawer using HrDrawer with dual-panel (same as edit form) */}
            <HrDrawer
                isOpen={isOpen}
                onClose={handleClose}
                placement="right"
                defaultWidth={900}
                maxWidth={2400}
                isSecondaryOpen={isSecondaryOpen}
                onSecondaryClose={() => setIsSecondaryOpen(false)}
                secondaryTitle="Hình ảnh minh chứng"
                secondaryWidth={420}
                secondaryContent={
                    <MinhChungCollector value={cachedMinhChung} onChange={setCachedMinhChung} isFormAdd={true} />
                }
            >
                <HrDrawerHeader>
                    <div className="flex items-center gap-1">
                        <Tooltip
                            content="Đóng"
                            className="capitalize bg-slate-100"
                            radius="none"
                            placement="left"
                        >
                            <Button
                                isIconOnly
                                startContent={<ChevronsRight size={18} />}
                                size="sm"
                                variant="light"
                                onPress={handleClose}
                            />
                        </Tooltip>
                        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Thêm nhân sự mới</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {!isSecondaryOpen && (
                            <Tooltip content="Minh chứng" className="bg-slate-100" radius="none" placement="bottom">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="flat"
                                    radius="full"
                                    className="bg-green-100 text-green-600 hover:bg-green-200"
                                    onPress={() => setIsSecondaryOpen(true)}
                                >
                                    <Images size={16} />
                                </Button>
                            </Tooltip>
                        )}
                        <Button
                            isIconOnly
                            variant="light"
                            radius="full"
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                            onPress={handleClose}
                        >
                            <X size={20} />
                        </Button>
                    </div>
                </HrDrawerHeader>

                {/* Responsive container query styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          [data-drawer-form] {
            container-type: inline-size;
            overflow-x: hidden;
          }
          [data-drawer-form] .grid > * { min-width: 0; }
          @container (max-width: 899px) {
            [data-drawer-form] .grid.xl\\:grid-cols-4 { grid-template-columns: 1fr !important; }
            [data-drawer-form] .xl\\:col-span-3,
            [data-drawer-form] .xl\\:col-span-1 { grid-column: span 1 / span 1 !important; }
          }
          @container (max-width: 767px) {
            [data-drawer-form] .grid.lg\\:grid-cols-2 { grid-template-columns: 1fr !important; }
          }
          @container (max-width: 399px) {
            [data-drawer-form] .grid.md\\:grid-cols-2 { grid-template-columns: minmax(0, 1fr) !important; }
            [data-drawer-form] .grid.md\\:grid-cols-3 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            [data-drawer-form] .grid.form-col-4 { grid-template-columns: minmax(0, 1fr) !important; }
            [data-drawer-form] .xl\\:col-span-4,
            [data-drawer-form] .xl\\:col-span-3,
            [data-drawer-form] .md\\:col-span-2 { grid-column: span 1 / span 1 !important; }
            [data-drawer-form] .md\\:col-span-3 { grid-column: span 2 / span 2 !important; }
          }
          @container (min-width: 400px) {
            [data-drawer-form] .grid.md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            [data-drawer-form] .grid.md\\:grid-cols-3 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            [data-drawer-form] .grid.form-col-4 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            [data-drawer-form] .xl\\:col-span-4,
            [data-drawer-form] .xl\\:col-span-3,
            [data-drawer-form] .md\\:col-span-3,
            [data-drawer-form] .md\\:col-span-2 { grid-column: span 2 / span 2 !important; }
          }
          @container (min-width: 768px) {
            [data-drawer-form] .grid.form-col-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
            [data-drawer-form] .xl\\:col-span-4 { grid-column: span 4 / span 4 !important; }
            [data-drawer-form] .xl\\:col-span-3 { grid-column: span 3 / span 3 !important; }
          }
          @container (min-width: 900px) {
            [data-drawer-form] .grid.md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          }
          ` }} />

                <HrDrawerBody className="p-0! bg-gray-100">
                    <div ref={scrollRef} data-drawer-form="">
                        {hasMounted ? (
                            <FormProvider {...methods}>
                                <div className="flex flex-col gap-2">
                                    <Step1Basic
                                        hideTitle
                                        donVi={donViRaw as any}
                                        viTriCongViec={viTriRaw as any}
                                        danToc={danTocRaw as any}
                                        quocGia={quocGiaRaw as any}
                                        tonGiao={tonGiaoRaw as any}
                                        tinh={tinhRaw as any}
                                        onAvatarOpen={onAvatarOpen}
                                        onFileSelect={handleFileSelect}
                                        isAddForm={true}
                                    />
                                    <Step2Contact quocGia={quocGiaRaw as QuocGia[]} tinh={tinhRaw as Tinh[]} hideTitle />
                                </div>
                            </FormProvider>
                        ) : (
                            <div className="flex flex-col h-full overflow-auto bg-gray-50">
                                {/* Avatar + name skeleton — matches EditNhansuPage drawer mode */}
                                <div className="bg-white border-b border-gray-100 px-4 py-4 animate-pulse flex items-center gap-3">
                                    <div className="h-14 w-14 rounded-full bg-gray-200 shrink-0" />
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-40" />
                                        <div className="h-3 bg-gray-100 rounded w-24" />
                                    </div>
                                </div>
                                <FormSkeletonLoader rows={5} />
                            </div>
                        )}
                        <BackToTop containerRef={scrollRef} zIndex={999} threshold={200} />
                    </div>
                </HrDrawerBody>

                <HrDrawerFooter>
                    <Button
                        onPress={handleClose}
                        isDisabled={isLoading}
                        className="h-11 px-6 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all duration-250 border-none"
                    >
                        Hủy bỏ
                    </Button>
                    <HrPrimaryButton
                        isLoading={isLoading}
                        onPress={() => {
                            handleFormSubmit(handleSubmit, (errors) => {
                                console.error('Form Validation Errors:', errors)
                                const fieldNames = Object.keys(errors)
                                toast('Vui lòng điền đầy đủ thông tin', { description: `Còn ${fieldNames.length} trường bắt buộc chưa được nhập`, variant: 'warning' })
                            })()
                        }}
                    >
                        {isLoading ? 'Đang tạo...' : 'Thêm mới'}
                    </HrPrimaryButton>
                </HrDrawerFooter>
            </HrDrawer>

            {/* Avatar Modal */}
            <Modal
                isOpen={isAvatarOpen}
                onOpenChange={onAvatarOpenChange}
                size="lg"
                backdrop="blur"
                closeButton
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Cập nhật ảnh đại diện</ModalHeader>
                            <ModalBody>
                                <Controller
                                    name="avatar"
                                    control={control}
                                    render={({ field }) => (
                                        <AvatarCropper
                                            src={tempImageSrc}
                                            aspect={3 / 4}
                                            onChange={(dataUrl) => {
                                                field.onChange(dataUrl)
                                                const blob = base64ToBlob(dataUrl)
                                                const file = new File([blob], `avatar_${Date.now()}.png`, {
                                                    type: blob.type
                                                })
                                                setAvatarFile(file)
                                                setTempImageSrc(undefined)
                                                onAvatarOpenChange()
                                            }}
                                        />
                                    )}
                                />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
