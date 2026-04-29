import { Spinner, addToast, Button, useDisclosure, Tooltip, Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react'
import { Save, User, Briefcase, X, Clock, ChevronLeft, ChevronRight, Upload, Award, GraduationCap, Plus, Edit, AlertTriangle, SendHorizonal } from 'lucide-react'
import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { callApi } from '@renderer/api/callApi'
import { profileAxios } from '@renderer/api/profileAxios'
import { mapTinhThanhAxios } from '@renderer/api/danhmuc/dtqgtg'
import { AvatarCropper } from './components/AvatarCropper'
import Step1Basic from './components/Step1Basic'
import Step2Contact from './components/Step2Contact'
import MinhChungCollector, { type CachedMinhChung, type MinhChungCollectorRef } from './components/MinhChungCollector'
import { FormCollapse } from './components/FormCollapse'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { toast, Modal as ModalV3 } from "@heroui-v3/react";
import { useQueryClient } from '@tanstack/react-query';
import { SidePanelProvider, SidePanelLayout, useSidePanel } from '@renderer/components/side-panel'

const Chungchi = React.lazy(() => import('./components/elements/Chungchi'))
const Bangcap = React.lazy(() => import('./components/elements/Bangcap'))

/** When skip=true the parent already provides SidePanelProvider (drawer mode). */
function ConditionalSidePanelProvider({ skip, children }: { skip?: boolean; children: ReactNode }) {
    return skip ? <>{children}</> : <SidePanelProvider>{children}</SidePanelProvider>
}

const SIDE_PANEL_MAIN_MIN_WIDTH = 400
function SidePanelBridge({ onMinWidthChange }: { onMinWidthChange?: (w: number) => void }) {
    const { isOpen, isOverlay, panelWidth } = useSidePanel()
    useEffect(() => {
        if (onMinWidthChange) {
            onMinWidthChange(isOpen && !isOverlay ? SIDE_PANEL_MAIN_MIN_WIDTH + panelWidth : 0)
        }
    }, [isOpen, isOverlay, panelWidth, onMinWidthChange])
    return null
}


export interface DonVi {
    id_don_vi: string
    ten_don_vi: string
}

export interface Dantoc {
    id_dan_toc: string
    ten: string
}

export interface Quocgia {
    id_quoc_gia: string
    ten: string
}

export interface TonGiao {
    id_ton_giao: string
    ten: string
}

export interface ViTriCongViec {
    id_vi_tri_cong_viec: string
    ten_cong_viec: string
}

export interface Tinh {
    id: string
    name: string
}

export interface NhansuFormData {
    ma_nhan_vien: string
    ho_va_ten: string
    avatar?: string
    gioi_tinh: string
    ngay_sinh: string
    mst_ca_nhan: string
    id_don_vi: string
    id_vi_tri_cong_viec: string
    id_dan_toc: string
    id_ton_giao: string
    id_quoc_tich: string
    cccd_so: string
    cccd_ngay_cap: string
    cccd_ngay_het_han: string
    cccd_noi_cap: string
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
    bac_hop_dong: string
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
    ghi_chu?: string
    don_vi_kiem_nhiem?: DonViKiemNhiem[]
}

export interface DonViKiemNhiem {
    id_don_vi_cong_tac: string
    id_vi_tri_cong_viec: string
    la_lanh_dao: boolean
}

const STEPS = [
    { id: 1, title: 'Thông tin chung', description: 'Cơ bản, CCCD, Bằng cấp', icon: User },
    { id: 2, title: 'Thông tin liên hệ', description: 'Cá nhân, Khẩn cấp', icon: Briefcase },
    { id: 3, title: 'Chứng chỉ', description: 'Quản lý chứng chỉ', icon: Award },
    { id: 4, title: 'Bằng cấp', description: 'Quản lý bằng cấp', icon: GraduationCap },
]

interface UpdateProfilePageProps {
    id?: string
    isDrawer?: boolean
    onClose?: () => void
    cachedMinhChung?: CachedMinhChung[]
    setCachedMinhChung?: React.Dispatch<React.SetStateAction<CachedMinhChung[]>>
    minhChungRef?: React.RefObject<MinhChungCollectorRef | null>
    onPendingStateChange?: (isPending: boolean) => void
    onMinWidthChange?: (minWidth: number) => void
    onOpenSecondary?: (sectionId: string) => void
}

export default function UpdateProfilePage({ id: propsId, isDrawer, onClose, cachedMinhChung: propsCachedMinhChung, setCachedMinhChung: propsSetCachedMinhChung, minhChungRef: externalMinhChungRef, onPendingStateChange, onMinWidthChange, onOpenSecondary }: UpdateProfilePageProps = {}) {
    const { user } = useAuthStore()
    const id = propsId ?? user?.id_nhan_vien
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const drawerScrollRef = React.useRef<HTMLDivElement>(null)

    const [donVi, setDonVi] = useState<DonVi[]>([])
    const [dantoc, setDantoc] = useState<Dantoc[]>([])
    const [quocgia, setQuocgia] = useState<Quocgia[]>([])
    const [tongiao, setTongiao] = useState<TonGiao[]>([])
    const [viTriCongViec, setViTriCongViec] = useState<ViTriCongViec[]>([])
    const [tinh, setTinh] = useState<Tinh[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [isPendingApproval, setIsPendingApproval] = useState(false)
    const [tempImageSrc, setTempImageSrc] = useState<string | undefined>(undefined)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [originalAvatar, setOriginalAvatar] = useState<string>('')
    const [activeSection, setActiveSection] = useState<number>(1)
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
    const [internalCachedMinhChung, setInternalCachedMinhChung] = useState<CachedMinhChung[]>([])

    const [chungChiList, setChungChiList] = useState<any[]>([])
    const [bangCapList, setBangCapList] = useState<any[]>([])

    const [pendingChungChi, setPendingChungChi] = useState<any[]>([])
    const [pendingBangCap, setPendingBangCap] = useState<any[]>([])

    const cachedMinhChung = propsCachedMinhChung ?? internalCachedMinhChung
    const setCachedMinhChung = propsSetCachedMinhChung ?? setInternalCachedMinhChung

    const scrollRef = React.useRef<HTMLDivElement>(null)
    const isScrollingRef = React.useRef(false)
    const internalMinhChungRef = useRef<MinhChungCollectorRef>(null)
    // Use external ref (from ProfileModal drawer) if provided, otherwise use internal
    const minhChungRef = externalMinhChungRef ?? internalMinhChungRef

    const { isOpen: isAvatarOpen, onOpen: onAvatarOpen, onClose: onAvatarClose, onOpenChange: onAvatarOpenChange } = useDisclosure()
    const methods = useForm<NhansuFormData>({ mode: 'onBlur', defaultValues: {} })
    const { control, handleSubmit: handleFormSubmit, reset, formState: { dirtyFields } } = methods
    const [w_ho_va_ten] = useWatch({ control, name: ['ho_va_ten'] }) as [string]

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (isScrollingRef.current) return
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const stepId = parseInt(entry.target.id.replace('section-', ''))
                        if (!isNaN(stepId)) setActiveSection(stepId)
                    }
                })
            },
            { root: null, threshold: [0.25, 0.5, 0.75], rootMargin: '-35% 0px -35% 0px' }
        )
        const sections = document.querySelectorAll('[id^="section-"]')
        sections.forEach((section) => observer.observe(section))
        return () => {
            sections.forEach((section) => observer.unobserve(section))
            observer.disconnect()
        }
    }, [isFetching])

    const scrollToSection = (id: string, stepId: number) => {
        setActiveSection(stepId)
        isScrollingRef.current = true
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setTimeout(() => { isScrollingRef.current = false }, 700)
        }
    }

    const handleFileSelect = useCallback((file: File) => {
        const reader = new FileReader()
        reader.onload = () => setTempImageSrc(reader.result as string)
        reader.readAsDataURL(file)
    }, [])

    const getDonVi = async () => {
        return profileAxios
            .fetch({
                action: 'get_category_data',
                table: 'e_don_vi',
                length: 9999,
            })
    }

    const getVitricongviec = async () => {
        return profileAxios
            .fetch({
                action: 'get_category_data',
                table: 'hrm_vi_tri_cong_viec',
                length: 9999,
            })
    }

    const getDantoc = async () => {
        return profileAxios
            .fetch({
                action: 'get_category_data',
                table: 'dm_dan_toc',
                length: 9999,
            })
    }

    const getQuocgia = async () => {
        return profileAxios
            .fetch({
                action: 'get_category_data',
                table: 'dm_quoc_gia',
                length: 9999,
            })
    }

    const getTongiao = async () => {
        return profileAxios
            .fetch({
                action: 'get_category_data',
                table: 'dm_ton_giao',
                length: 9999,
            })
    }

    const fetchData = async () => {
        if (!id) return
        setIsFetching(true)
        try {
            const [donViRes, danTocRes, quocgiaRes, tongiaoRes, viTriCongViecRes, tinhRes] = await Promise.all([
                getDonVi(),
                getDantoc(),
                getQuocgia(),
                getTongiao(),
                getVitricongviec(),
                mapTinhThanhAxios()
            ])

            setDonVi(donViRes.data ?? [])
            setDantoc(danTocRes.data ?? [])
            setQuocgia(quocgiaRes.data ?? [])
            setTongiao(tongiaoRes.data ?? [])
            setViTriCongViec(viTriCongViecRes.data ?? [])
            setTinh((tinhRes || []).map((t: any) => ({ id: String(t.value ?? ''), name: t.label ?? '' })))

            const response = await callApi(`profile`, { method: 'GET' })
            if (response.success && response.data) {
                const data = response.data
                setIsPendingApproval(data.dang_yeu_cau_cap_nhat === 1)
                onPendingStateChange?.(data.dang_yeu_cau_cap_nhat === 1)
                const formData: any = { ...data }
                setOriginalAvatar(data.avatar || '')

                // Map fields that have different names in database vs form
                if (data.id_don_vi_cong_tac) formData.id_don_vi = String(data.id_don_vi_cong_tac)
                if (data.id_vi_tri_cong_viec) formData.id_vi_tri_cong_viec = String(data.id_vi_tri_cong_viec)

                if (data.thong_tin_bao_hiem) Object.assign(formData, data.thong_tin_bao_hiem)

                const dateFields = [
                    'ngay_sinh', 'cccd_ngay_cap', 'cccd_ngay_het_han', 'ho_chieu_ngay_cap', 'ho_chieu_ngay_het_han',
                    'ngay_tap_su', 'ngay_tap_su_ket_thuc', 'ngay_thu_viec', 'ngay_thu_viec_ket_thuc',
                    'ngay_lam_chinh_thuc', 'ngay_lam_chinh_thuc_ket_thuc', 'ngay_tham_gia', 'ngay_het_han'
                ]
                dateFields.forEach((field) => { if (formData[field]) formData[field] = String(formData[field]).split('T')[0] })

                formData.hktt_la_chu_ho = formData.hktt_la_chu_ho === 1 || formData.hktt_la_chu_ho === '1' || formData.hktt_la_chu_ho === true
                formData.cohn_giong_hktt = formData.cohn_giong_hktt === 1 || formData.cohn_giong_hktt === '1' || formData.cohn_giong_hktt === true
                formData.tu_dong_tang_phep = formData.tu_dong_tang_phep === 1 || formData.tu_dong_tang_phep === '1' || formData.tu_dong_tang_phep === true

                const normalizeProv = (v: any) => v === null || v === undefined ? '' : String(v).padStart(2, '0')
                formData.hktt_id_tinh_tp = normalizeProv(formData.hktt_id_tinh_tp)
                formData.cohn_id_tinh_tp = normalizeProv(formData.cohn_id_tinh_tp)

                // Map don_vi_kiem_nhiem
                if (Array.isArray(data.don_vi_kiem_nhiem)) {
                    formData.don_vi_kiem_nhiem = data.don_vi_kiem_nhiem.map((item: any) => ({
                        id_don_vi_cong_tac: String(item.id_don_vi_cong_tac || ''),
                        id_vi_tri_cong_viec: String(item.id_vi_tri_cong_viec || ''),
                        la_lanh_dao: item.la_lanh_dao === true || item.la_lanh_dao === 1 || item.la_lanh_dao === '1',
                    }))
                } else {
                    formData.don_vi_kiem_nhiem = []
                }

                reset(formData)

                // Populate chung_chi and bang_cap
                if (Array.isArray(data.chung_chi)) setChungChiList(data.chung_chi)
                if (Array.isArray(data.bang_cap)) setBangCapList(data.bang_cap)

            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => { fetchData() }, [id])

    const handleSubmit = useCallback(
        async (data: NhansuFormData) => {
            if (!id) return

            const changedFields = Object.keys(dirtyFields)
            const avatarDeleted = !data.avatar && !!originalAvatar && !avatarFile
            const hasMinhChung = cachedMinhChung.length > 0;
            const hasPendingCC = pendingChungChi.length > 0;
            const hasPendingBC = pendingBangCap.length > 0;

            if (changedFields.length === 0 && !avatarFile && !avatarDeleted && !hasMinhChung && !hasPendingCC && !hasPendingBC) {
                toast('Không có dữ liệu thay đổi', { variant: 'warning' })
                return
            }

            // Validate minh chứng details — inline errors on form fields
            if (hasMinhChung && minhChungRef.current) {
                const isValid = await minhChungRef.current.validate()
                if (!isValid) {
                    toast('Vui lòng điền đầy đủ thông tin bắt buộc', { variant: 'warning' })
                    return
                }
            }

            setIsLoading(true)
            try {
                const payload: any = {}
                // Lọc bỏ avatar và don_vi_kiem_nhiem (xử lý riêng)
                const infoFields = changedFields.filter((key) => key !== 'avatar' && key !== 'don_vi_kiem_nhiem')

                infoFields.forEach((key) => {
                    let dbKey = key
                    if (key === 'id_don_vi') dbKey = 'id_don_vi_cong_tac'

                    let value = (data as any)[key]
                    if (typeof value === 'boolean') {
                        value = value ? '1' : '0'
                    }
                    payload[dbKey] = value
                })

                // Chỉ gửi don_vi_kiem_nhiem nếu người dùng có thay đổi
                if (dirtyFields.don_vi_kiem_nhiem) {
                    payload.don_vi_kiem_nhiem = (data.don_vi_kiem_nhiem || []).map((item: any) => ({
                        id_don_vi_cong_tac: item.id_don_vi_cong_tac || '',
                        id_vi_tri_cong_viec: item.id_vi_tri_cong_viec || '',
                        la_lanh_dao: item.la_lanh_dao === true ? 1 : 0,
                    })).filter((item: any) => item.id_don_vi_cong_tac)
                }

                // Gộp chứng chỉ / bằng cấp pending vào payload (chờ duyệt)
                const chungChiPayload: any[] = pendingChungChi.map((item: any) => {
                    const { tempId, newFiles, keptFilePaths, ...rest } = item  // strip non-serializable
                    return rest
                })
                const bangCapPayload: any[] = pendingBangCap.map((item: any) => {
                    const { tempId, file, ...rest } = item   // strip File object – not JSON serializable
                    return rest
                })

                // Upload file đính kèm của từng chứng chỉ (nếu có) trước khi gửi JSON
                for (let i = 0; i < chungChiPayload.length; i++) {
                    const pending = pendingChungChi[i]
                    const newFiles: File[] = pending?.newFiles ?? []
                    const keptFilePaths: string[] = pending?.keptFilePaths ?? []

                    const uploadedPaths: { file_path: string; file_name: string; file_size: number; file_extension: string }[] = []
                    for (const f of newFiles) {
                        try {
                            const uploadRes = await profileAxios.uploadBangCapFile(f)
                            if (uploadRes?.success && uploadRes?.data?.file_path) {
                                uploadedPaths.push({
                                    file_path: uploadRes.data.file_path,
                                    file_name: f.name,
                                    file_size: f.size,
                                    file_extension: f.name.split('.').pop() ?? '',
                                })
                            }
                        } catch (e) {
                            console.error('Upload chung chi file failed', e)
                        }
                    }

                    // Build files array: kept existing paths + newly uploaded
                    const keptFileObjs = keptFilePaths.map((p) => ({
                        file_path: p,
                        file_name: p.split('/').pop() ?? '',
                        file_size: 0,
                        file_extension: p.split('.').pop() ?? '',
                    }))
                    const allFiles = [...keptFileObjs, ...uploadedPaths]
                    if (allFiles.length > 0) {
                        chungChiPayload[i].files = JSON.stringify(allFiles)
                    }
                }

                // Upload file đính kèm của từng bằng cấp (nếu có) trước khi gửi JSON
                // Duck-typing: instanceof File may fail in Electron cross-context
                const isFileLike = (v: any) => v != null && typeof v === 'object' && typeof v.name === 'string' && typeof v.arrayBuffer === 'function'
                console.log('[UpdateProfile] pendingBangCap:', pendingBangCap.map(p => ({ action: p.action, id: p.id_bang_cap, file: p.file, file_path: p.file_path })))
                for (let i = 0; i < bangCapPayload.length; i++) {
                    const originalFile = pendingBangCap[i]?.file
                    if (isFileLike(originalFile)) {
                        try {
                            const uploadRes = await profileAxios.uploadBangCapFile(originalFile)
                            if (uploadRes?.success && uploadRes?.data?.file_path) {
                                bangCapPayload[i].file_path = uploadRes.data.file_path
                                bangCapPayload[i].file_name = uploadRes.data.file_name ?? (originalFile as File).name ?? null
                                bangCapPayload[i].file_extension = uploadRes.data.file_extension ?? ((originalFile as File).name?.split('.').pop() ?? null)
                                bangCapPayload[i].file_size = uploadRes.data.file_size ?? (originalFile as File).size ?? null
                            }
                        } catch (e) {
                            console.error('Upload bang cap file failed', e)
                        }
                    }
                }

                // Trích xuất chứng chỉ/bằng cấp từ minh chứng (details trong file upload)
                // Upload file trước để lấy file_path, sau đó gắn vào payload bang_cap
                // Use getLatestData() to get fresh form values (cachedMinhChung state may be stale)
                const freshMinhChung = minhChungRef.current?.getLatestData?.() || cachedMinhChung

                // Step 1: Pre-upload tất cả file minh chứng → lấy file_path
                type UploadedMC = {
                    group: any
                    fObj: any
                    filePath: string
                    fileName: string
                    fileSize: number
                    fileExtension: string
                }
                const uploadedMinhChung: UploadedMC[] = []
                if (freshMinhChung.length > 0) {
                    for (const group of freshMinhChung) {
                        for (const fObj of group.files) {
                            if (!(fObj.file instanceof File)) continue
                            try {
                                const uploadRes = await profileAxios.uploadBangCapFile(fObj.file)
                                if (uploadRes?.success && uploadRes?.data?.file_path) {
                                    uploadedMinhChung.push({
                                        group,
                                        fObj,
                                        filePath: uploadRes.data.file_path,
                                        fileName: fObj.file.name,
                                        fileSize: fObj.file.size,
                                        fileExtension: fObj.file.name.split('.').pop() ?? '',
                                    })
                                }
                            } catch (e) {
                                console.error('Pre-upload minh chung file failed', e)
                            }
                        }
                    }
                }

                // Step 2: Trích xuất chứng chỉ/bằng cấp từ details, gắn file_path vào bang_cap
                for (const uploaded of uploadedMinhChung) {
                    const d = uploaded.fObj.details
                    if (!d || typeof d !== 'object') continue

                    // Detect chứng chỉ
                    if (d.ten_chung_chi) {
                        const isDuplicate = chungChiPayload.some(
                            (cc) => cc.action === 'add' && cc.ten_chung_chi === d.ten_chung_chi
                        )
                        if (!isDuplicate) {
                            chungChiPayload.push({
                                action: 'add',
                                ten_chung_chi: d.ten_chung_chi,
                                ngay_cap_chung_chi: d.ngay_cap_chung_chi || null,
                                noi_cap: d.noi_cap || null,
                            })
                        }
                    }

                    // Detect bằng cấp
                    if (d.noi_dao_tao || d.chuyen_nganh || d.trinh_do_dao_tao) {
                        const tuThang = d.nam_tu && d.tu_thang
                            ? `${d.nam_tu}-${String(d.tu_thang).padStart(2, '0')}-01`
                            : null
                        const denThang = d.nam_den && d.den_thang
                            ? `${d.nam_den}-${String(d.den_thang).padStart(2, '0')}-01`
                            : null

                        const normTrinh = (v: string | null | undefined) =>
                            (v ?? '').toLowerCase().replace(/[\s_]/g, '')
                        const isDuplicate = bangCapPayload.some(
                            (bc) => bc.action === 'add'
                                && bc.noi_dao_tao === (d.noi_dao_tao || null)
                                && bc.chuyen_nganh === (d.chuyen_nganh || null)
                                && normTrinh(bc.trinh_do_dt) === normTrinh(d.trinh_do_dao_tao)
                                && bc.tu_thang === tuThang
                        )
                        if (!isDuplicate) {
                            bangCapPayload.push({
                                action: 'add',
                                tu_thang: tuThang,
                                den_thang: denThang,
                                noi_dao_tao: d.noi_dao_tao || null,
                                chuyen_nganh: d.chuyen_nganh || null,
                                trinh_do_dt: d.trinh_do_dao_tao || null,
                                xep_loai_dt: d.xep_loai || null,
                                file_path: uploaded.filePath,  // ← file_path đã có từ pre-upload
                            })
                        }
                    }
                }

                if (chungChiPayload.length > 0) payload.chung_chi = chungChiPayload
                if (bangCapPayload.length > 0) payload.bang_cap = bangCapPayload

                // Step 3: Gọi API tạo yêu cầu cập nhật với các thông tin đã thay đổi
                const response = await profileAxios.yeucaucapnhat(payload)
                if (response.success) {
                    const id_yeu_cau_cap_nhat = response.data.id_yeu_cau_cap_nhat

                    // Nếu có thay đổi ảnh đại diện thì gọi tiếp API upload avatar gắn với ID yêu cầu vừa tạo
                    if (avatarFile) {
                        await profileAxios.uploadAvatar(avatarFile, id_yeu_cau_cap_nhat)
                    } else if (avatarDeleted) {
                        // Avatar bị xóa → gọi API cập nhật với delete_avatar
                        await profileAxios.yeucaucapnhat({ delete_avatar: '1' })
                    }

                    // Step 4: Đăng ký tất cả file đã pre-upload vào minh_chung của yêu cầu
                    for (const uploaded of uploadedMinhChung) {
                        try {
                            await profileAxios.registerMinhChungFile(
                                uploaded.filePath,
                                uploaded.fileName,
                                uploaded.fileSize,
                                uploaded.fileExtension,
                                uploaded.group.id_loai_minh_chung,
                                id_yeu_cau_cap_nhat,
                                uploaded.fObj.details
                            )
                        } catch (e) {
                            console.error('Register minh chung failed', e)
                        }
                    }


                    toast('Yêu cầu cập nhật đã được gửi và đang chờ duyệt', { variant: 'success' })
                    // Cleanup cached data
                    setCachedMinhChung([])
                    setPendingChungChi([])
                    setPendingBangCap([])
                    queryClient.invalidateQueries({ queryKey: ['hr-update-requests-pending-count'] })
                    queryClient.invalidateQueries({ queryKey: ['my-update-requests'] })
                    queryClient.invalidateQueries({ queryKey: ['nhanVienTuCapNhatData'] })
                    isDrawer ? onClose?.() : navigate('/')
                } else {
                    toast('Thất bại', { description: response.message || 'Có lỗi xảy ra.', variant: 'danger' })
                }
            } catch (error: any) {
                toast('Lỗi hệ thống', { description: error.message || 'Không thể kết nối.', variant: 'danger' })
            } finally {
                setIsLoading(false)
            }
        },
        [id, navigate, avatarFile, dirtyFields, cachedMinhChung, pendingChungChi, pendingBangCap]
    )

    if (isFetching) return <div className="flex h-full w-full items-center justify-center min-h-[500px]"><Spinner label="Đang tải dữ liệu..." /></div>

    if (isPendingApproval) return (
        <div className="p-4 max-w-[500px] mx-auto mt-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900/30 flex flex-col items-center text-center gap-4"
            >
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                    <Clock size={24} className="animate-pulse" />
                </div>

                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Yêu cầu đang chờ phê duyệt</h2>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                        Bạn đã gửi một hồ sơ yêu cầu cập nhật thông tin thành công và đang đợi ban quản trị phê duyệt.
                    </p>
                </div>

                <div className="w-full bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100/50 dark:border-blue-900/20 italic text-[12px] text-blue-700 dark:text-blue-300">
                    Lưu ý: Bạn chỉ có thể tiếp tục cập nhật sau khi yêu cầu hiện tại được xử lý xong.
                </div>

                <div className="flex gap-4 w-full pt-2">
                    <Button
                        fullWidth
                        variant="flat"
                        color="primary"
                        size="md"
                        onPress={() => isDrawer ? onClose?.() : navigate(-1)}
                        startContent={<X size={16} />}
                        className="font-medium"
                    >
                        Quay lại
                    </Button>
                </div>
            </motion.div>
        </div>
    )

    return (
        <div className={isDrawer ? 'flex flex-col h-full' : 'p-1 max-w-[1800px] mx-auto flex flex-col gap-4'}>
            <ConditionalSidePanelProvider skip={isDrawer}>
                {isDrawer && (
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
                    `
                    }} />
                )}

                {/* SidePanelBridge stays inside Provider but outside Layout */}
                <SidePanelBridge onMinWidthChange={onMinWidthChange} />

                {/* Row: nav sidebar (desktop only) + main SidePanelLayout area */}
                <div className={isDrawer ? 'flex-1 flex flex-col min-h-0 h-full' : 'flex gap-4 flex-1'}>
                    {!isDrawer && (
                        <motion.div
                            animate={{ width: isSidebarExpanded ? 280 : 80 }}
                            className="shrink-0 sticky top-0 h-[calc(100dvh-140px)] flex flex-col gap-4 overflow-hidden self-start"
                        >
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col">
                                <div className="flex items-center justify-center mb-6">
                                    <Button
                                        isIconOnly={!isSidebarExpanded}
                                        variant="light"
                                        size="md"
                                        onPress={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                        className={`text-gray-400 hover:text-primary transition-all duration-300 ${isSidebarExpanded ? 'w-full justify-start gap-3 px-4 h-12 rounded-xl' : 'w-12 h-12 rounded-xl justify-center'}`}
                                        startContent={isSidebarExpanded ? (isSidebarExpanded ? <ChevronLeft size={22} /> : <ChevronRight size={22} />) : undefined}
                                    >
                                        {!isSidebarExpanded ? (isSidebarExpanded ? <ChevronLeft size={22} /> : <ChevronRight size={22} />) : (
                                            <span className="font-medium text-[13.4px] whitespace-nowrap">Thu nhỏ menu</span>
                                        )}
                                    </Button>
                                </div>

                                <div className={`flex flex-col gap-4 ${isSidebarExpanded ? '' : 'items-center'}`}>
                                    {STEPS.map((step) => {
                                        const Icon = step.icon
                                        const isActive = step.id === activeSection
                                        return (
                                            <Tooltip
                                                key={step.id}
                                                content={step.title}
                                                placement="right"
                                                color="primary"
                                                closeDelay={0}
                                                isDisabled={isSidebarExpanded}
                                            >
                                                <div
                                                    className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-all duration-300 ${isSidebarExpanded ? 'w-full gap-3 px-4' : 'w-12 h-12 justify-center'} ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-gray-50 hover:text-primary'}`}
                                                    onClick={() => scrollToSection(`section-${step.id}`, step.id)}
                                                >
                                                    <Icon size={22} className="shrink-0" />
                                                    {isSidebarExpanded && (
                                                        <motion.span
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="font-medium text-[13.4px] whitespace-nowrap"
                                                        >
                                                            {step.title}
                                                        </motion.span>
                                                    )}
                                                </div>
                                            </Tooltip>
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* SidePanelLayout wraps ONLY the main form area so the side panel opens correctly */}
                    <SidePanelLayout>
                        <div ref={isDrawer ? drawerScrollRef : undefined} className={isDrawer ? 'p-0' : 'flex-1 min-w-0 flex flex-col h-full overflow-hidden'} data-drawer-form={isDrawer ? '' : undefined}>
                            {!isDrawer && (
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500">Cập nhật thông tin cho nhân viên: {w_ho_va_ten}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button color="danger" variant="light" onPress={() => navigate(-1)} isDisabled={isLoading}>Hủy bỏ</Button>
                                        <Button
                                            color="primary"
                                            onPress={() => handleFormSubmit(handleSubmit, (err) => {
                                                console.error(err)
                                                toast('Vui lòng kiểm tra lại thông tin', { variant: 'danger' })
                                            })()}
                                            isLoading={isLoading}
                                            startContent={!isLoading ? <Save size={18} /> : undefined}
                                        >
                                            Gửi yêu cầu lưu
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div ref={isDrawer ? undefined : scrollRef} className={isDrawer ? 'flex flex-col gap-2 p-0' : 'flex-1 bg-transparent flex flex-col gap-4 pr-2 pb-4'}>
                                <FormProvider {...methods}>
                                    <div id="section-1" className="p-0">
                                        <Step1Basic hideNfc hideTitle donVi={donVi} danToc={dantoc} quocGia={quocgia} tinh={tinh} tonGiao={tongiao} viTriCongViec={viTriCongViec} onAvatarOpen={onAvatarOpen} onFileSelect={handleFileSelect} />
                                    </div>
                                    <div id="section-2" className="p-0">
                                        <Step2Contact quocGia={quocgia} tinh={tinh} hideTitle />
                                    </div>
                                    {/* Minh chứng — chỉ thêm mới, existing đã có panel so sánh riêng */}
                                    {/* <FormCollapse
                                        key="section-evidence"
                                        title="Hình ảnh minh chứng"
                                        defaultExpanded={cachedMinhChung.length > 0}
                                    >
                                        <MinhChungCollector ref={minhChungRef} value={cachedMinhChung} onChange={setCachedMinhChung} />
                                    </FormCollapse> */}

                                    {/* Chứng chỉ Section */}
                                    <FormCollapse
                                        key="section-9"
                                        title="Chứng chỉ"
                                        count={chungChiList.length}
                                        defaultExpanded={chungChiList.length > 0}
                                        onAdd={() => {
                                            if (onOpenSecondary) {
                                                onOpenSecondary('section-9')
                                            } else {
                                                window.dispatchEvent(new CustomEvent('trigger-add-section-9'))
                                            }
                                        }}
                                        headerRight={
                                            pendingChungChi.length > 0 ? (
                                                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-700 h-5 flex items-center justify-center gap-1 min-w-[20px] animate-pulse">
                                                    <AlertTriangle size={10} />
                                                    {pendingChungChi.length} chờ gửi
                                                </span>
                                            ) : undefined
                                        }
                                    >
                                        <div id="section-9">
                                            {pendingChungChi.length > 0 && (
                                                <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[12.5px] text-amber-800">
                                                    <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
                                                    <div className="flex-1">
                                                        <span className="font-semibold">Có {pendingChungChi.length} thay đổi chưa được gửi.</span>{' '}
                                                        Nhấn <span className="inline-flex items-center gap-1 font-semibold">"Gửi yêu cầu lưu" <SendHorizonal size={11} /></span> bên dưới để hoàn tất yêu cầu cập nhật.
                                                    </div>
                                                </div>
                                            )}
                                            <React.Suspense fallback={<div className="p-4 text-center text-gray-500">Đang tải...</div>}>
                                                <Chungchi chungchiList={chungChiList} user={{ id_nhan_vien: String(id ?? user?.id_nhan_vien ?? '') }} mode="request" onPendingChange={setPendingChungChi} />
                                            </React.Suspense>
                                        </div>
                                    </FormCollapse>

                                    {/* Bằng cấp Section */}
                                    <FormCollapse
                                        key="section-10"
                                        title="Bằng cấp"
                                        count={bangCapList.length}
                                        defaultExpanded={bangCapList.length > 0}
                                        onAdd={() => {
                                            if (onOpenSecondary) {
                                                onOpenSecondary('section-10')
                                            } else {
                                                window.dispatchEvent(new CustomEvent('trigger-add-section-10'))
                                            }
                                        }}
                                        headerRight={
                                            pendingBangCap.length > 0 ? (
                                                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-700 h-5 flex items-center justify-center gap-1 min-w-[20px] animate-pulse">
                                                    <AlertTriangle size={10} />
                                                    {pendingBangCap.length} chờ gửi
                                                </span>
                                            ) : undefined
                                        }
                                    >
                                        <div id="section-10">
                                            {pendingBangCap.length > 0 && (
                                                <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[12.5px] text-amber-800">
                                                    <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
                                                    <div className="flex-1">
                                                        <span className="font-semibold">Có {pendingBangCap.length} thay đổi chưa được gửi.</span>{' '}
                                                        Nhấn <span className="inline-flex items-center gap-1 font-semibold">"Gửi yêu cầu lưu" <SendHorizonal size={11} /></span> bên dưới để hoàn tất yêu cầu cập nhật.
                                                    </div>
                                                </div>
                                            )}
                                            <React.Suspense fallback={<div className="p-4 text-center text-gray-500">Đang tải...</div>}>
                                                <Bangcap bangCapList={bangCapList} user={{ id_nhan_vien: String(id ?? user?.id_nhan_vien ?? ''), id_don_vi_cong_tac: '', id_vi_tri_cong_viec: '', ma_nhan_vien: String(user?.ma_nhan_vien ?? '') }} mode="request" onPendingChange={setPendingBangCap} />
                                            </React.Suspense>
                                        </div>
                                    </FormCollapse>
                                </FormProvider>
                            </div>
                        </div>
                    </SidePanelLayout>
                </div>

                {/* Drawer bottom bar - outside SidePanelLayout to stay fixed at bottom */}
                {isDrawer && (
                    <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-end gap-3">
                        <Button color="danger" variant="light" onPress={() => onClose?.()} isDisabled={isLoading}>Hủy bỏ</Button>
                        <Button
                            color="primary"
                            onPress={() => handleFormSubmit(handleSubmit, (err) => {
                                console.error(err)
                                toast('Vui lòng kiểm tra lại thông tin', { variant: 'danger' })
                            })()}
                            isLoading={isLoading}
                            startContent={!isLoading ? <Save size={18} /> : undefined}
                        >
                            Gửi yêu cầu lưu
                        </Button>
                    </div>
                )}

                {/* Use HeroUI Modal for nested overlay so React Aria can manage stacking & inert */}
                <ModalV3>
                    <ModalV3.Backdrop isOpen={isAvatarOpen} onOpenChange={onAvatarOpenChange} className="z-999999" isDismissable={true}>
                        <ModalV3.Container size="lg" className="z-999999">
                            <ModalV3.Dialog className="p-0 overflow-hidden">
                                <ModalV3.Header className="flex justify-between items-center p-4 border-b border-default-200">
                                    <ModalV3.Heading className="text-lg font-semibold text-foreground">Cập nhật ảnh đại diện</ModalV3.Heading>
                                </ModalV3.Header>
                                <ModalV3.Body className="p-4 bg-background pb-6 mt-0">
                                    <Controller name="avatar" control={control} render={({ field }) => (
                                        <AvatarCropper src={tempImageSrc} aspect={1} onChange={(dataUrl) => {
                                            field.onChange(dataUrl)
                                            const u8 = atob(dataUrl.split(',')[1]);
                                            let n = u8.length;
                                            const arr = new Uint8Array(n);
                                            while (n--) arr[n] = u8.charCodeAt(n);
                                            const file = new File([new Blob([arr], { type: 'image/png' })], `avatar_${Date.now()}.png`, { type: 'image/png' });
                                            setAvatarFile(file);
                                            setTempImageSrc(undefined);
                                            onAvatarClose();
                                        }} />
                                    )} />
                                </ModalV3.Body>
                            </ModalV3.Dialog>
                        </ModalV3.Container>
                    </ModalV3.Backdrop>
                </ModalV3>
            </ConditionalSidePanelProvider>
        </div>
    )
}