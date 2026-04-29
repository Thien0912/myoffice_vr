
import { Tabs, toast } from '@heroui-v3/react'
import { Button, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/react'
import { callApi } from '@renderer/api/callApi'
import { DonviAxios } from '@renderer/api/danhmuc/DonviAxios'
import { dantocAxios, mapTinhThanhAxios, quocgiaAxios, tongiaoAxios } from '@renderer/api/danhmuc/dtqgtg'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import BackToTop from '@renderer/components/BackToTop'
import { SidePanelLayout, SidePanelProvider, useSidePanel } from '@renderer/components/side-panel'
import { useQueryClient } from '@tanstack/react-query'
import {
  Award,
  Briefcase,
  ClipboardList,
  GraduationCap,
  LogOut,
  MapPin,
  Star,
  User,
  Users
} from 'lucide-react'
import type { ReactNode } from 'react'
import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { VitriAxios } from './../../api/danhmuc/VitriAxios'
import { AvatarCropper } from './components/AvatarCropper'
import { FormCollapse } from './components/FormCollapse'
import Step1Basic from './components/Step1Basic'
import Step3Work from './components/Step3Work'
import TabAddress from './components/TabAddress'
import TabCareer from './components/TabCareer'
import TabInsurance from './components/TabInsurance'
import FormSkeletonLoader from './components/elements/FormSkeletonLoader'
import { HrPrimaryButton } from '@renderer/components/hero-custom/HrPrimaryButton'
import { SECTION_EVENTS } from './constants/sectionEvents'

/** When skip=true the parent already provides SidePanelProvider (drawer mode). */
function ConditionalSidePanelProvider({ skip, children }: { skip?: boolean; children: ReactNode }) {
  return skip ? <>{children}</> : <SidePanelProvider>{children}</SidePanelProvider>
}

/** When skip=true skip SidePanelLayout — drawer mode uses HosonhansuPage’s secondary panel instead. */
function ConditionalSidePanelLayout({ skip, children }: { skip?: boolean; children: ReactNode }) {
  return skip ? <>{children}</> : <SidePanelLayout>{children}</SidePanelLayout>
}

// Lazy load components
const Step4 = lazy(() => import('./components/elements/Hopdong'))
const Step5 = lazy(() => import('./components/elements/Quatrinhcongtac'))
const Danhgia = lazy(() => import('./components/elements/Danhgia'))
const Kinhnghiemlamviec = lazy(() => import('./components/elements/Kinhnghiemlamviec'))
const Chungchi = lazy(() => import('./components/elements/Chungchi'))
const Thongtingiadinh = lazy(
  () => import('@renderer/pages/profile/components/elements/Thongtingiadinh')
)
const Bangcap = lazy(() => import('./components/elements/Bangcap'))
const Quatrinhdaotao = lazy(() => import('./components/elements/Quatrinhdaotao'))
const Khenthuong = lazy(() => import('./components/elements/Khenthuong'))
const ThoiViec = lazy(() => import('./components/elements/ThoiViec'))

// Re-using interfaces from AddNhansuButton (or ideally move to a shared types file)

export interface DonVi {
  id_don_vi: string
  ten_don_vi: string
}

export interface Dantoc {
  id_dan_toc: string
  ten: string
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

export interface Phuong {
  id: string
  name: string
}

export interface NhansuFormData {
  // Thông tin cơ bản
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

  // CitizenCard (CCCD)
  cccd_so: string
  cccd_ngay_cap: string
  cccd_ngay_het_han: string
  cccd_noi_cap: string

  // Passport
  ho_chieu_so: string
  ho_chieu_ngay_cap: string
  ho_chieu_ngay_het_han: string
  ho_chieu_noi_cap: string

  // Trình độ/Bằng cấp
  trinh_do_vh: string
  hoc_ham: string
  trinh_do_dt: string
  noi_dt: string
  nganh_dt: string
  khoa_dt: string
  nam_tn: string
  xep_loai_tn: string

  // Hộ khẩu thường trú
  hktt_id_quoc_gia: string
  hktt_id_tinh_tp: string
  hktt_id_quan_huyen: string
  hktt_id_xa_phuong: string
  hktt_so_nha: string
  hktt_dia_chi: string
  hktt_so_ho_khau: string
  hktt_ma_so_ho_gd: string
  hktt_la_chu_ho: boolean

  // Step 2: Thông tin liên hệ
  so_dien_thoai: string
  email: string
  email_ca_nhan: string
  que_quan: string

  // Thông tin liên hệ khẩn cấp
  lhkc_ho_ten: string
  lhkc_quan_he: string
  lhkc_sdt_di_dong: string
  lhkc_sdt_nha_rieng: string
  lhkc_email: string
  lhkc_dia_chi: string

  // Chỗ ở hiện nay
  cohn_giong_hktt: boolean
  cohn_id_quoc_gia: string
  cohn_id_tinh_tp: string
  cohn_id_quan_huyen: string
  cohn_id_xa_phuong: string
  cohn_so_nha: string
  cohn_dia_chi: string

  // Step 3: Thông tin công việc và bảo hiểm
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

  // Thời gian làm việc
  ngay_tap_su: string
  ngay_tap_su_ket_thuc: string
  ngay_thu_viec: string
  ngay_thu_viec_ket_thuc: string
  ngay_lam_chinh_thuc: string
  ngay_lam_chinh_thuc_ket_thuc: string

  // Thông tin bảo hiểm
  so_so_bhxh: string
  ma_bhxh: string
  ti_le_dong: string
  ti_le_dong_dn: string
  ten_tinh_cap: string
  ngay_tham_gia: string
  ngay_het_han: string
  noi_dk_kcb: string

  // Vị trí công việc từ step cũ
  ghi_chu?: string
  don_vi_kiem_nhiem?: {
    id_don_vi_cong_tac: string
    id_vi_tri_cong_viec: string
    la_lanh_dao: boolean
  }[]
}

const PROFILE_TABS = [
  { id: 'personal', title: 'Cá nhân', icon: User },
  { id: 'address', title: 'Địa chỉ', icon: MapPin },
  { id: 'work', title: 'Công việc', icon: Briefcase },
  { id: 'career', title: 'Chuyên môn', icon: ClipboardList },
  { id: 'certificates', title: 'Bằng cấp & Chứng chỉ', icon: GraduationCap },
  { id: 'rewards', title: 'Khen thưởng', icon: Award },
  { id: 'resignation', title: 'Thôi việc', icon: LogOut },
]

// Bridge component to relay side panel state to parent drawer
const SIDE_PANEL_MAIN_MIN_WIDTH = 400
function SidePanelBridge({ onMinWidthChange }: { onMinWidthChange?: (w: number) => void }) {
  const { isOpen, isOverlay, panelWidth } = useSidePanel()
  useEffect(() => {
    if (onMinWidthChange) {
      // In overlay mode, panel doesn't take real width — no extra minWidth needed
      onMinWidthChange(isOpen && !isOverlay ? SIDE_PANEL_MAIN_MIN_WIDTH + panelWidth : 0)
    }
  }, [isOpen, isOverlay, panelWidth, onMinWidthChange])
  return null
}

const buildPayload = (data: any) => ({
  hrm_nhan_vien: {
    ma_nhan_vien: data.ma_nhan_vien || '',
    ho_va_ten: data.ho_va_ten || '',
    gioi_tinh: data.gioi_tinh || '',
    ngay_sinh: data.ngay_sinh || '',
    mst_ca_nhan: data.mst_ca_nhan || '',
    id_don_vi_cong_tac: data.id_don_vi || '',
    id_vi_tri_cong_viec: data.id_vi_tri_cong_viec || '',
    id_dan_toc: data.id_dan_toc || '',
    id_ton_giao: data.id_ton_giao || '',
    id_quoc_tich: data.id_quoc_tich || '',
    cccd_so: data.cccd_so || '',
    cccd_ngay_cap: data.cccd_ngay_cap || '',
    cccd_ngay_het_han: data.cccd_ngay_het_han || '',
    cccd_noi_cap: data.cccd_noi_cap || '',
    ho_chieu_so: data.ho_chieu_so || '',
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
    bac: '',
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
    noi_dk_kcb: data.noi_dk_kcb || 'Bệnh Viện Đại Học Nam Cần Thơ'
  },
  hrm_hop_dong: {},
  don_vi_kiem_nhiem: (data.don_vi_kiem_nhiem || []).map((item: any) => ({
    id_don_vi_cong_tac: item.id_don_vi_cong_tac || '',
    id_vi_tri_cong_viec: item.id_vi_tri_cong_viec || '',
    la_lanh_dao: item.la_lanh_dao ? '1' : '0'
  }))
})

interface EditNhansuPageProps {
  idNhanVien?: string
  isDrawer?: boolean
  readOnly?: boolean
  onClose?: () => void
  onMinWidthChange?: (minWidth: number) => void
  onOpenSecondary?: (sectionId: string) => void
}

export default function EditNhansuPage({ idNhanVien, isDrawer, readOnly, onClose, onMinWidthChange, onOpenSecondary }: EditNhansuPageProps = {}) {
  const params = useParams<{ id: string }>()
  const id = idNhanVien || params.id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [donVi, setDonVi] = useState<DonVi[]>([])
  const [dantoc, setDantoc] = useState<Dantoc[]>([])
  const [quocgia, setQuocgia] = useState<Quocgia[]>([])
  const [tongiao, setTongiao] = useState<TonGiao[]>([])
  const [viTriCongViec, setViTriCongViec] = useState<ViTriCongViec[]>([])
  const [tinh, setTinh] = useState<Tinh[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [tempImageSrc, setTempImageSrc] = useState<string | undefined>(undefined)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [originalAvatar, setOriginalAvatar] = useState<string>('')
  const [initialPayloadStr, setInitialPayloadStr] = useState<string>('')

  const [activeTab, setActiveTab] = useState<string>('personal')
  const [giaDinhList, setGiaDinhList] = useState<any[]>([])
  const [hopDongList, setHopDongList] = useState<any[]>([])
  const [quatrinhcongtacList, setQuatrinhcongtacList] = useState<any[]>([])
  const [danhGiaList, setDanhGiaList] = useState<any[]>([])
  const [kinhNghiemList, setKinhNghiemList] = useState<any[]>([])

  const [chungChiList, setChungChiList] = useState<any[]>([])
  const [bangCapList, setBangCapList] = useState<any[]>([])
  const [quatrinhdaotaoList, setQuatrinhdaotaoList] = useState<any[]>([])
  const [khenThuongList, setKhenThuongList] = useState<any[]>([])
  const [thoiViecList, setThoiViecList] = useState<any[]>([])
  const [thuTucList, setThuTucList] = useState<any[]>([])
  const [trangThaiThoiViec, setTrangThaiThoiViec] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const drawerScrollRef = React.useRef<HTMLDivElement>(null)


  const {
    isOpen: isAvatarOpen,
    onOpen: onAvatarOpen,
    onOpenChange: onAvatarOpenChange
  } = useDisclosure()

  const methods = useForm<NhansuFormData>({
    mode: 'onBlur',
    defaultValues: {} // Will be populated after fetch
  })

  const { control, handleSubmit: handleFormSubmit, reset, setValue, setError, formState: { isDirty } } = methods

  // Watchers for validation (similar to Add page)
  const [w_ma_nhan_vien, w_ho_va_ten, w_id_don_vi] = useWatch({
    control,
    name: ['ma_nhan_vien', 'ho_va_ten', 'id_don_vi']
  }) as [string, string, string]

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => setTempImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

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

  const mapEmployeeFormData = useCallback((data: any) => {
    const formData: any = { ...data }
    setOriginalAvatar(data.avatar || '')

    if (data.thong_tin_bao_hiem) {
      Object.assign(formData, data.thong_tin_bao_hiem)
    }

    const dateFields = [
      'ngay_sinh', 'cccd_ngay_cap', 'cccd_ngay_het_han',
      'ho_chieu_ngay_cap', 'ho_chieu_ngay_het_han',
      'ngay_tap_su', 'ngay_tap_su_ket_thuc',
      'ngay_thu_viec', 'ngay_thu_viec_ket_thuc',
      'ngay_lam_chinh_thuc', 'ngay_lam_chinh_thuc_ket_thuc',
      'ngay_tham_gia', 'ngay_het_han'
    ]
    dateFields.forEach((field) => {
      if (formData[field]) {
        formData[field] = String(formData[field]).split('T')[0]
      }
    })

    const toBool = (v: any) => v === 1 || v === '1' || v === true
    formData.hktt_la_chu_ho = toBool(formData.hktt_la_chu_ho)
    formData.cohn_giong_hktt = toBool(formData.cohn_giong_hktt)
    formData.tu_dong_tang_phep = toBool(formData.tu_dong_tang_phep)

    if (data.don_vi_kiem_nhiem && Array.isArray(data.don_vi_kiem_nhiem)) {
      formData.don_vi_kiem_nhiem = data.don_vi_kiem_nhiem.map((item: any) => ({
        id_don_vi_cong_tac: item.id_don_vi_cong_tac || '',
        id_vi_tri_cong_viec: item.id_vi_tri_cong_viec || '',
        la_lanh_dao: toBool(item.la_lanh_dao)
      }))
    }

    const normalizeProvince = (v: any) =>
      v === null || v === undefined ? '' : String(v).padStart(2, '0')
    formData.hktt_id_tinh_tp = normalizeProvince(formData.hktt_id_tinh_tp)
    formData.cohn_id_tinh_tp = normalizeProvince(formData.cohn_id_tinh_tp)

    // Normalize null/undefined → "" so isDirty comparison works when Select is cleared back
    for (const key of Object.keys(formData)) {
      const v = formData[key]
      if (v === null || v === undefined) {
        formData[key] = ''
      }
    }

    return formData
  }, [])

  const XEP_LOAI_MAP: Record<string, string> = {
    'Khong_dat': 'Không đạt',
    'Trung_binh': 'Trung bình',
    'Kha': 'Khá',
    'Gioi': 'Giỏi',
    'Xuat_sac': 'Xuất sắc'
  }

  const populateSectionData = useCallback((data: any) => {
    if (data.thong_tin_gia_dinh) setGiaDinhList(data.thong_tin_gia_dinh)
    if (data.hop_dong) setHopDongList(data.hop_dong)
    if (data.qua_trinh_cong_tac) setQuatrinhcongtacList(data.qua_trinh_cong_tac)
    if (data.danh_gia) setDanhGiaList(data.danh_gia)
    if (data.kinh_nghiem_lam_viec) setKinhNghiemList(data.kinh_nghiem_lam_viec)
    if (data.chung_chi) setChungChiList(data.chung_chi)
    if (data.bang_cap) {
      const bangCap = data.bang_cap
      bangCap.forEach((el: any) => {
        if (XEP_LOAI_MAP[el.xep_loai_dt]) el.xep_loai_dt = XEP_LOAI_MAP[el.xep_loai_dt]
      })
      setBangCapList(bangCap)
    }
    if (data.qua_trinh_dao_tao) setQuatrinhdaotaoList(data.qua_trinh_dao_tao)
    if (data.thuong_danh_sach) setKhenThuongList(data.thuong_danh_sach)
    if (data.thoi_viec) setThoiViecList(data.thoi_viec)
    if (data.thu_tuc_thoi_viec) setThuTucList(data.thu_tuc_thoi_viec)
    setTrangThaiThoiViec(data?.trang_thai)
  }, [])

  const fetchData = async () => {
    setIsFetching(true)
    try {
      // Parallel fetch — all 7 calls run concurrently instead of sequentially
      const [donViRes, danTocRes, quocgiaRes, tongiaoRes, viTriRes, tinhRes, employeeRes] =
        await Promise.all([
          DonviAxios.fetch({ length: 9999 }),
          dantocAxios.fetch({ length: 9999 }),
          quocgiaAxios.fetch({ length: 9999 }),
          tongiaoAxios.fetch({ length: 9999 }),
          VitriAxios.fetch({ length: 9999 }),
          mapTinhThanhAxios(),
          id ? callApi(`admin/hrm/nhanvien/show/${id}`, { method: 'GET' }) : Promise.resolve(null),
        ])

      setDonVi(donViRes.data ?? [])
      setDantoc(danTocRes.data ?? [])
      setQuocgia(quocgiaRes.data ?? [])
      setTongiao(tongiaoRes.data ?? [])
      setViTriCongViec(viTriRes.data ?? [])
      setTinh(
        (tinhRes || []).map((t: any) => ({
          id: String(t.value ?? ''),
          name: t.label ?? ''
        }))
      )

      if (employeeRes?.success && employeeRes.data) {
        const data = employeeRes.data

        setCurrentUser({
          id_nhan_vien: data.id_nhan_vien,
          id_vi_tri_cong_viec: data.id_vi_tri_cong_viec,
          id_don_vi_cong_tac: data.id_don_vi,
          ma_nhan_vien: data.ma_nhan_vien,
          ho_va_ten: data.ho_va_ten,
          avatar: data.avatar,
          email: data.email,
          gioi_tinh: data.gioi_tinh,
          ly_do_thoi_viec: data.ly_do_thoi_viec,
          ngay_lam_chinh_thuc: data.ngay_lam_chinh_thuc,
          ngay_lam_chinh_thuc_ket_thuc: data.ngay_lam_chinh_thuc_ket_thuc,
          ngay_sinh: data.ngay_sinh,
          so_dien_thoai: data.so_dien_thoai,
          ten_cong_viec: data.ten_cong_viec,
          ten_don_vi: data.ten_don_vi,
          trang_thai: data.trang_thai
        })

        const formData = mapEmployeeFormData(data)
        setInitialPayloadStr(JSON.stringify(buildPayload(formData)))
        populateSectionData(data)
        reset(formData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsFetching(false)
    }
  }

  // Fetch Data
  useEffect(() => {
    fetchData()
  }, [id, reset])

  // Per-section refetch — only updates the changed section's state, no full reload
  const refetchSection = useCallback(async (eventName: string) => {
    if (!id) return
    try {
      const response = await callApi(`admin/hrm/nhanvien/show/${id}`, { method: 'GET' })
      if (!response.success || !response.data) return
      const data = response.data

      const handlers: Record<string, () => void> = {
        [SECTION_EVENTS.THONGTINGIADINH]: () => data.thong_tin_gia_dinh && setGiaDinhList(data.thong_tin_gia_dinh),
        [SECTION_EVENTS.HOPDONG]: () => data.hop_dong && setHopDongList(data.hop_dong),
        [SECTION_EVENTS.QUATRINHCONGTAC]: () => data.qua_trinh_cong_tac && setQuatrinhcongtacList(data.qua_trinh_cong_tac),
        [SECTION_EVENTS.DANHGIA]: () => data.danh_gia && setDanhGiaList(data.danh_gia),
        [SECTION_EVENTS.KINHNGHIEM]: () => data.kinh_nghiem_lam_viec && setKinhNghiemList(data.kinh_nghiem_lam_viec),
        [SECTION_EVENTS.CHUNGCHI]: () => data.chung_chi && setChungChiList(data.chung_chi),
        [SECTION_EVENTS.BANGCAP]: () => {
          if (!data.bang_cap) return
          const bangCap = data.bang_cap
          bangCap.forEach((el: any) => {
            if (XEP_LOAI_MAP[el.xep_loai_dt]) el.xep_loai_dt = XEP_LOAI_MAP[el.xep_loai_dt]
          })
          setBangCapList(bangCap)
        },
        [SECTION_EVENTS.QUATRINHDAOTAO]: () => data.qua_trinh_dao_tao && setQuatrinhdaotaoList(data.qua_trinh_dao_tao),
        [SECTION_EVENTS.KHENTHUONG]: () => data.thuong_danh_sach && setKhenThuongList(data.thuong_danh_sach),
        [SECTION_EVENTS.THOIVIEC]: () => {
          if (data.thoi_viec) setThoiViecList(data.thoi_viec)
          if (data.thu_tuc_thoi_viec) setThuTucList(data.thu_tuc_thoi_viec)
          if (data.trang_thai !== undefined) setTrangThaiThoiViec(data.trang_thai)
        }
      }

      handlers[eventName]?.()
    } catch (error) {
      console.error('Error refetching section:', error)
    }
  }, [id])

  // Listen for section CRUD events → refetch only the changed section
  useEffect(() => {
    const events = Object.values(SECTION_EVENTS)
    const listeners = events.map(eventName => {
      const handler = () => refetchSection(eventName)
      window.addEventListener(eventName, handler)
      return { eventName, handler }
    })
    return () => listeners.forEach(({ eventName, handler }) => window.removeEventListener(eventName, handler))
  }, [refetchSection])

  const handleSubmit = useCallback(
    async (data: NhansuFormData) => {
      console.log('🚀 Dữ liệu chuẩn bị gửi:', data)
      if (!id) return

      // Build payload giống như AddNhansuButton
      const payload = buildPayload(data)
      // const currentPayloadStr = JSON.stringify(payload)

      // if (currentPayloadStr === initialPayloadStr && !avatarFile) {
      //   toast('Không có thay đổi', { description: 'Không có dữ liệu nào được thay đổi.', variant: 'warning' })
      //   return
      // }

      console.log('📤 Update Payload:', payload)
      console.log('📷 Avatar:', data.avatar)

      setIsLoading(true)
      try {
        const formData = new FormData()
        formData.append('payload', JSON.stringify(payload))

        // Xử lý avatar: ưu tiên avatarFile, fallback sang data.avatar base64
        let fileToUpload = avatarFile

        if (!fileToUpload && data.avatar && data.avatar.startsWith('data:')) {
          // Nếu không có avatarFile nhưng có base64, convert sang File
          console.log('🔄 Converting base64 to File...')
          const blob = base64ToBlob(data.avatar)
          fileToUpload = new File([blob], `avatar_${data.ma_nhan_vien || id || Date.now()}.png`, {
            type: blob.type
          })
        }

        if (fileToUpload) {
          console.log('✅ Avatar file found:', fileToUpload.name, fileToUpload.size, 'bytes')
          formData.append('avatar', fileToUpload)
        } else if (!data.avatar && originalAvatar) {
          // Avatar bị xóa (trống) mà trước đó có ảnh → báo backend xóa
          console.log('🗑️ Avatar deleted, sending delete_avatar flag')
          formData.append('delete_avatar', '1')
        } else {
          console.warn('⚠️ No avatar file to update')
        }

        const response = await NhansuAxios.update(id, formData)
        if (response.success) {
          toast('Cập nhật hồ sơ thành công', { variant: 'success' })
          fetchData()
          // Refresh the employee list on parent page
          queryClient.invalidateQueries({ queryKey: ['nhansuData'] })
          queryClient.invalidateQueries({ queryKey: ['nhansuStats'] })
        } else {
          // Handle specific validation errors from backend
          if (response.error) {
            const hrmErrors = response.error.hrm_nhan_vien

            // Xử lý lỗi trùng đơn vị kiêm nhiệm (array nhiều lỗi)
            if (response.error.don_vi_kiem_nhiem_errors?.length) {
              const errors = response.error.don_vi_kiem_nhiem_errors as { index: number; message: string }[]
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
              toast('Trùng đơn vị kiêm nhiệm', { description: `Có ${errors.length} đơn vị bị trùng. Vui lòng kiểm tra lại.`, variant: 'danger' })
              return
            }

            if (hrmErrors) {
              if (hrmErrors.ma_nhan_vien) {
                setError('ma_nhan_vien', {
                  type: 'manual',
                  message: hrmErrors.ma_nhan_vien
                })
              }
              // You can add more field mappings here if needed
            }

            // Show toast for general error or the first found detailed error
            let detailError = response.message || 'Có lỗi xảy ra khi cập nhật.'
            if (hrmErrors && typeof hrmErrors === 'object') {
              const firstKey = Object.keys(hrmErrors)[0]
              if (firstKey && hrmErrors[firstKey]) {
                detailError = hrmErrors[firstKey]
              }
            }

            toast('Thất bại', { description: detailError, variant: 'danger' })
          } else {
            toast('Thất bại', { description: response.message || 'Có lỗi xảy ra khi cập nhật.', variant: 'danger' })
          }

          console.error('Error updating employee:', response.message)
        }
      } catch (error: any) {
        toast('Lỗi hệ thống', { description: error.message || 'Không thể kết nối đến máy chủ.', variant: 'danger' })
        console.error('Error submitting form:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [id, navigate]
  )

  const renderSkeleton = (showAvatar = false) => (
    <div className={isDrawer ? "p-4 flex flex-col gap-4" : "p-6 flex flex-col gap-4 bg-white rounded-xl border border-gray-100"}>
      {showAvatar && (
        <div className="animate-pulse flex items-center gap-3 mb-2">
          <div className="h-14 w-14 rounded-full bg-gray-200 shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-40" />
            <div className="h-3 bg-gray-100 rounded w-24" />
          </div>
        </div>
      )}
      <FormSkeletonLoader rows={showAvatar ? 4 : 6} />
    </div>
  )

  /** Reusable renderer for collapsible list sections (used across tabs) */
  const renderCollapsibleSection = (
    id: string,
    title: string,
    sectionData: any[] | undefined,
    component: React.ReactNode,
    sectionIcon?: React.ReactNode
  ) => {
    const isEmpty = !sectionData || sectionData.length === 0
    const count = sectionData?.length || 0
    return (
      <FormCollapse
        key={id}
        title={title}
        count={count}
        defaultExpanded={!isEmpty}
        icon={sectionIcon}
        onAdd={() => {
          if (onOpenSecondary) {
            onOpenSecondary(id)
          } else {
            window.dispatchEvent(new CustomEvent(`trigger-add-${id}`))
          }
        }}
      >
        <div id={id}>
          <Suspense fallback={<div className="p-4 text-center text-gray-500">Đang tải...</div>}>
            {component}
          </Suspense>
        </div>
      </FormCollapse>
    )
  }

  return (
    <div className={isDrawer ? "flex flex-col h-full" : "p-1 max-w-[1800px] mx-auto flex gap-4"}>
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
        ` }} />
      )}
      <ConditionalSidePanelProvider skip={isDrawer}>
        {!isDrawer && <SidePanelBridge onMinWidthChange={onMinWidthChange} />}
        <ConditionalSidePanelLayout skip={isDrawer}>
          <div ref={isDrawer ? drawerScrollRef : undefined} className={isDrawer ? "flex-1 overflow-auto p-0 min-h-0" : "contents"} data-drawer-form={isDrawer ? '' : undefined}>
            {/* Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col">
              {!isDrawer && (
                <div className="mb-4">
                  {isFetching ? (
                    <div className="h-5 bg-gray-200 rounded w-64 animate-pulse" />
                  ) : (
                    <p className="text-gray-500">Cập nhật thông tin cho nhân viên: <span className="font-medium text-gray-900">{w_ho_va_ten}</span></p>
                  )}
                </div>
              )}

              <div
                className={isDrawer ? 'flex flex-col gap-2 p-0' : 'flex-1 bg-transparent flex flex-col gap-4 pr-2 pb-4'}
              >
                <FormProvider {...methods}>
                  <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as string)}
                    variant="secondary"
                    className="flex flex-col flex-1 h-full gap-0!"
                  >
                    <div className="shrink-0 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-40">
                      <Tabs.ListContainer className="bg-transparent">
                        <Tabs.List aria-label="Profile tabs" className="gap-0 h-12 pl-0 pr-0 w-fit border-0 overflow-x-auto">
                          {PROFILE_TABS.map((tab) => {
                            const Icon = tab.icon
                            return (
                              <Tabs.Tab key={tab.id} id={tab.id} className="h-12 px-0 text-sm font-semibold max-w-fit relative">
                                <div className={`flex items-center gap-1.5 px-3 h-full whitespace-nowrap transition-colors duration-200 ease-in-out ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                  <Icon size={16} />
                                  <span>{tab.title}</span>
                                </div>
                                {activeTab === tab.id && (
                                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full" />
                                )}
                              </Tabs.Tab>
                            )
                          })}
                        </Tabs.List>
                      </Tabs.ListContainer>
                    </div>

                    {/* ═══ Tab 1: Thông tin cá nhân ═══ */}
                    <Tabs.Panel id="personal" className="p-0 flex-1 overflow-y-auto w-full">
                      {isFetching ? renderSkeleton(true) : (
                        <div className="flex flex-col gap-2 p-0">
                          <div className={isDrawer ? 'p-0' : 'bg-white rounded-xl border border-gray-100 p-6'}>
                            <Step1Basic
                              hideNfc
                              hideTitle={isDrawer}
                              hideHKTT
                              donVi={donVi}
                              danToc={dantoc}
                              quocGia={quocgia}
                              tinh={tinh}
                              tonGiao={tongiao}
                              viTriCongViec={viTriCongViec}
                              onAvatarOpen={onAvatarOpen}
                              onFileSelect={handleFileSelect}
                            />
                          </div>
                          {/* Thông tin bảo hiểm */}
                          <TabInsurance tinh={tinh} />
                          {/* Thông tin gia đình */}
                          {renderCollapsibleSection('section-4', 'Thông tin gia đình', giaDinhList, <Thongtingiadinh list={giaDinhList} user={currentUser} />, <Users size={18} />)}
                        </div>
                      )}
                    </Tabs.Panel>

                    {/* ═══ Tab 2: Địa chỉ ═══ */}
                    <Tabs.Panel id="address" className="p-0 flex-1 overflow-y-auto w-full">
                      {isFetching ? renderSkeleton() : (
                        <div className={isDrawer ? 'p-0' : 'bg-white rounded-xl border border-gray-100 p-6'}>
                          <TabAddress quocGia={quocgia} tinh={tinh} />
                        </div>
                      )}
                    </Tabs.Panel>

                    {/* ═══ Tab 3: Công việc ═══ */}
                    <Tabs.Panel id="work" className="p-0 flex-1 overflow-y-auto w-full">
                      {isFetching ? renderSkeleton() : (
                        <div className="flex flex-col gap-2 p-0">
                          <div className={isDrawer ? 'p-0' : 'bg-white rounded-xl border border-gray-100 p-6'}>
                            <Step3Work donVi={donVi} tinh={tinh} hideTitle hideInsurance />
                          </div>
                        </div>
                      )}
                    </Tabs.Panel>

                    {/* ═══ Tab 4: Hồ sơ chuyên môn ═══ */}
                    <Tabs.Panel id="career" className="p-0 flex-1 overflow-y-auto w-full">
                      {isFetching ? renderSkeleton() : (
                        <TabCareer
                          quatrinhcongtacList={quatrinhcongtacList}
                          quatrinhdaotaoList={quatrinhdaotaoList}
                          kinhNghiemList={kinhNghiemList}
                          user={currentUser}
                          onOpenSecondary={onOpenSecondary}
                        />
                      )}
                    </Tabs.Panel>

                    {/* ═══ Tab 4: Bằng cấp & Chứng chỉ ═══ */}
                    <Tabs.Panel id="certificates" className="p-0 flex-1 overflow-y-auto w-full">
                      {isFetching ? renderSkeleton() : (
                        <div className="flex flex-col gap-2 p-0">
                          {renderCollapsibleSection('section-10', 'Bằng cấp', bangCapList, <Bangcap bangCapList={bangCapList} user={currentUser} />, <GraduationCap size={18} />)}
                          {renderCollapsibleSection('section-9', 'Chứng chỉ', chungChiList, <Chungchi chungchiList={chungChiList} user={currentUser} />, <Award size={18} />)}
                        </div>
                      )}
                    </Tabs.Panel>

                    {/* ═══ Tab 5: Khen thưởng ═══ */}
                    <Tabs.Panel id="rewards" className="p-0 flex-1 overflow-y-auto w-full">
                      {isFetching ? renderSkeleton() : (
                        <div className="flex flex-col gap-2 p-0">
                          {renderCollapsibleSection('section-12', 'Danh sách khen thưởng', khenThuongList, <Khenthuong khenthuongList={khenThuongList} user={currentUser} />, <Star size={18} />)}
                          {renderCollapsibleSection('section-7', 'Đánh giá nhân sự', danhGiaList, <Danhgia danhgiaList={danhGiaList} user={currentUser} />, <ClipboardList size={18} />)}
                        </div>
                      )}
                    </Tabs.Panel>

                    {/* ═══ Tab 6: Thôi việc ═══ */}
                    <Tabs.Panel id="resignation" className="p-0 flex-1 overflow-y-auto w-full">
                      {isFetching ? renderSkeleton() : (
                        <div className="flex flex-col gap-2 p-0">
                          {renderCollapsibleSection('section-13', 'Thủ tục thôi việc', thoiViecList, (
                            <ThoiViec
                              thoiviecList={thoiViecList}
                              user={currentUser}
                              procedureList={thuTucList}
                              trangThai={trangThaiThoiViec}
                              onDataChange={setThoiViecList}
                              capNhatTrangThai={(trang_thai) => {
                                if (trang_thai) {
                                  setTrangThaiThoiViec(trang_thai)
                                  setValue('trang_thai', trang_thai)
                                }
                              }}
                            />
                          ), <LogOut size={18} />)}
                        </div>
                      )}
                    </Tabs.Panel>
                  </Tabs>
                </FormProvider>
              </div>
            </div>
            {isDrawer && <BackToTop containerRef={drawerScrollRef} zIndex={999} threshold={200} right={280} bottom={25} />}

            {/* Use HeroUI Modal for nested overlay so React Aria can manage stacking & inert */}
            <Modal isOpen={isAvatarOpen} onOpenChange={onAvatarOpenChange} size="lg" classNames={{ wrapper: "z-99999" }}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex justify-between items-center p-4 border-b border-default-200">
                      <h2 className="text-lg font-semibold text-foreground">Cập nhật ảnh đại diện</h2>
                    </ModalHeader>
                    <ModalBody className="p-4 bg-background pb-6">
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
                              onClose()
                            }}
                          />
                        )}
                      />
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>{/* end scrollable wrapper */}
        </ConditionalSidePanelLayout>
      </ConditionalSidePanelProvider>

      {/* Fixed Bottom Action Bar */}
      {!readOnly && (
        <div className={isDrawer ? "shrink-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-end gap-3" : "sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-6 py-3 flex items-center justify-end gap-3"}>
          <Button
            onPress={() => isDrawer ? onClose?.() : navigate(-1)}
            isDisabled={isLoading}
            className="h-11 px-6 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all duration-250 border-none"
          >
            Hủy bỏ
          </Button>

          <HrPrimaryButton
            onPress={() =>
              handleFormSubmit(handleSubmit, (errors) => {
                console.error('Validation errors:', errors)
                toast('Vui lòng kiểm tra lại thông tin nhập liệu', { description: 'Một số trường bắt buộc chưa được điền chính xác', variant: 'danger' })
                const firstError = Object.values(errors)[0]
                if (firstError && typeof firstError === 'object' && 'message' in firstError) {
                  toast('Chi tiết lỗi', { description: firstError.message as string, variant: 'danger' })
                }
              })()
            }
            isLoading={isLoading}
            isDisabled={isLoading}
          >
            Lưu thay đổi
          </HrPrimaryButton>
        </div>
      )}
    </div>
  )
}

