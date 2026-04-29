import { Spinner, Button, Tooltip } from '@heroui/react'
import {
  Save,
  ArrowLeft,
  User,
  Briefcase,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react'
import { useCallback, useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FormProvider, useForm, useWatch, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import type { NhansuFormData, DonVi, QuocGia, Tinh } from './components/AddNhansuButton'
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@heroui/react'
import { AvatarCropper } from './components/AvatarCropper'
import { NhansuAxios } from '@renderer/api/danhmuc/nhansuAxios'
import { mapDonviOptions } from '@renderer/api/danhmuc/DonviAxios'
import { mapVitriOptions } from '@renderer/api/danhmuc/VitriAxios'
import {
  mapDantocOptions,
  mapQuocgiaOptions,
  mapTongiaoOptions,
  mapTinhThanhAxios
} from '@renderer/api/danhmuc/dtqgtg'
import Step1Basic from './components/Step1Basic'
import Step2Contact from './components/Step2Contact'
import Step3Work from './components/Step3Work'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from "@heroui-v3/react";

interface Option {
  value: string | number
  label: string
}

const STEPS = [
  { id: 1, title: 'Thông tin chung', description: 'Cơ bản, CCCD, Bằng cấp, Hộ khẩu', icon: User },
  { id: 2, title: 'Thông tin liên hệ', description: 'Cá nhân, Khẩn cấp, Chỗ ở', icon: Briefcase },
  { id: 3, title: 'Công việc & Bảo hiểm', description: 'Công việc, Thời gian, BHXH', icon: FileText }
]

export default function AddNhansuPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Step state (wizard)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  // Data states
  const [donVi, setDonVi] = useState<Option[]>([])
  const [chucVu, setChucVu] = useState<Option[]>([])
  const [danToc, setDanToc] = useState<Option[]>([])
  const [quocGia, setQuocGia] = useState<Option[]>([])
  const [tonGiao, setTonGiao] = useState<Option[]>([])
  const [tinhThanh, setTinhThanh] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Avatar states
  const {
    isOpen: isAvatarOpen,
    onOpen: onAvatarOpen,
    onOpenChange: onAvatarOpenChange
  } = useDisclosure()
  const [tempImageSrc, setTempImageSrc] = useState<string | undefined>(undefined)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Form
  const methods = useForm<NhansuFormData>({
    mode: 'onChange',
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
      hktt_id_xa_phuong: '',
      hktt_so_nha: '',
      hktt_dia_chi: '',
      hktt_so_ho_khau: '',
      hktt_ma_so_ho_gd: '',
      hktt_la_chu_ho: false,
      so_dien_thoai: '',
      email: '',
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

  const { control, handleSubmit: handleFormSubmit } = methods
  const [w_ho_va_ten] = useWatch({ control, name: ['ho_va_ten'] }) as [string]

  // File select for avatar
  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => setTempImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  // base64 to Blob
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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true)
      try {
        const [donViRes, chucVuRes, danTocRes, quocGiaRes, tonGiaoRes, tinhThanhRes, lastIdRes] =
          await Promise.all([
            mapDonviOptions(),
            mapVitriOptions(),
            mapDantocOptions(),
            mapQuocgiaOptions(),
            mapTongiaoOptions(),
            mapTinhThanhAxios(),
            NhansuAxios.getLastID()
          ])
        setDonVi(donViRes)
        setChucVu(chucVuRes)
        setDanToc(danTocRes)
        setQuocGia(quocGiaRes)
        setTonGiao(tonGiaoRes)
        setTinhThanh(tinhThanhRes)
        if (lastIdRes?.success) {
          methods.setValue('ma_nhan_vien', lastIdRes.data || '')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsDataLoading(false)
      }
    }
    fetchData()
  }, [])

  // Map to raw shapes for Step components
  const donViRaw = (donVi || []).map((o) => ({
    id_don_vi: String(o.value ?? ''),
    ten_don_vi: o.label
  }))
  const viTriRaw = (chucVu || []).map((o) => ({
    id_vi_tri_cong_viec: String(o.value ?? ''),
    ten_cong_viec: o.label
  }))
  const danTocRaw = (danToc || []).map((o) => ({
    id_dan_toc: String(o.value ?? ''),
    ten: o.label
  }))
  const quocGiaRaw = (quocGia || []).map((o) => ({
    id_quoc_gia: String(o.value ?? ''),
    ten: o.label
  }))
  const tonGiaoRaw = (tonGiao || []).map((o) => ({
    id_ton_giao: String(o.value ?? ''),
    ten: o.label
  }))
  const tinhRaw = (tinhThanh || []).map((o) => ({ id: String(o.value ?? ''), name: o.label }))

  // Step navigation — required fields per step (matching Controller rules)
  const STEP_FIELDS: Record<number, (keyof NhansuFormData)[]> = {
    1: ['ma_nhan_vien', 'ho_va_ten', 'ngay_sinh', 'id_don_vi', 'id_vi_tri_cong_viec', 'cccd_so'],
    2: [],
    3: ['id_ca_lam_viec']
  }

  const nextStep = useCallback(async () => {
    const fields = STEP_FIELDS[currentStep] || []
    if (fields.length > 0) {
      const isValid = await methods.trigger(fields)
      if (!isValid) {
        toast('Vui lòng điền đầy đủ thông tin bắt buộc', { variant: 'warning' })
        return
      }
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, methods])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  // Submit
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
          hktt_so_nha: data.hktt_so_nha || '',
          hktt_dia_chi: data.hktt_dia_chi || '',
          hktt_so_ho_khau: data.hktt_so_ho_khau || '',
          hktt_ma_so_ho_gd: data.hktt_ma_so_ho_gd || '',
          hktt_la_chu_ho: data.hktt_la_chu_ho ? '1' : '0',
          so_dien_thoai: data.so_dien_thoai || '',
          email: data.email || '',
          que_quan: data.que_quan || '',
          lhkc_ho_ten: data.lhkc_ho_ten || '',
          lhkc_quan_he: data.lhkc_quan_he || '',
          lhkc_sdt_di_dong: data.lhkc_sdt_di_dong || '',
          lhkc_sdt_nha_rieng: data.lhkc_sdt_nha_rieng || '',
          lhkc_email: data.lhkc_email || '',
          lhkc_dia_chi: data.lhkc_dia_chi || '',
          cohn_id_quoc_gia: data.cohn_id_quoc_gia || '',
          cohn_id_tinh_tp: data.cohn_id_tinh_tp || '',
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
          bac_hop_dong: (data as any).bac_hop_dong || '',
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
        hrm_hop_dong: {}
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
        if (fileToUpload) {
          formData.append('avatar', fileToUpload)
        }

        const response = await NhansuAxios.create(formData)
        if (response.success) {
          toast('Thành công', { description: 'Đã thêm nhân sự mới thành công', variant: 'success' })
          queryClient.invalidateQueries({ queryKey: ['nhansuData'] })
          queryClient.invalidateQueries({ queryKey: ['nhansuStats'] })
          navigate(-1)
        } else {
          toast('Lỗi', { description: response.message || 'Không thể tạo nhân sự', variant: 'danger' })
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        toast('Lỗi', { description: 'Đã xảy ra lỗi khi tạo nhân sự', variant: 'danger' })
      } finally {
        setIsLoading(false)
      }
    },
    [avatarFile, queryClient, navigate]
  )

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Basic
            donVi={donViRaw as any}
            viTriCongViec={viTriRaw as any}
            danToc={danTocRaw as any}
            quocGia={quocGiaRaw as any}
            tonGiao={tonGiaoRaw as any}
            tinh={tinhRaw as any}
            onAvatarOpen={onAvatarOpen}
            onFileSelect={handleFileSelect}
            hideTitle
          />
        )
      case 2:
        return <Step2Contact quocGia={quocGiaRaw as QuocGia[]} tinh={tinhRaw as Tinh[]} hideTitle />
      case 3:
        return <Step3Work donVi={donViRaw as DonVi[]} tinh={tinhRaw as Tinh[]} hideTitle />
      default:
        return null
    }
  }

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-1 max-w-[1800px] mx-auto flex gap-4">
      {/* Collapsible Sidebar */}
      <motion.div
        animate={{ width: isSidebarExpanded ? 280 : 80 }}
        className="shrink-0 sticky top-0 h-[calc(100dvh-140px)] flex flex-col gap-4 overflow-hidden self-start"
      >
        <div className="p-0 rounded-lg flex flex-col gap-1">
          <Button variant="light" isIconOnly={!isSidebarExpanded} onPress={() => navigate(-1)}>
            <ArrowLeft size={20} />
            {isSidebarExpanded && <span className="whitespace-nowrap">Quay lại</span>}
          </Button>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col">
          <div className="flex items-center justify-center mb-6">
            <Button
              isIconOnly={!isSidebarExpanded}
              variant="light"
              size="md"
              onPress={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className={`text-gray-400 hover:text-primary transition-all duration-300 ${isSidebarExpanded ? 'w-full justify-start gap-3 px-4 h-12 rounded-xl' : 'w-12 h-12 rounded-xl justify-center'}`}
              startContent={isSidebarExpanded ? <ChevronLeft size={22} /> : undefined}
            >
              {!isSidebarExpanded ? (
                <ChevronRight size={22} />
              ) : (
                <span className="font-medium text-[13.4px] whitespace-nowrap">Thu nhỏ menu</span>
              )}
            </Button>
          </div>

          <div className={`flex flex-col gap-2 ${isSidebarExpanded ? '' : 'items-center'}`}>
            {STEPS.map((step) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep
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
                    className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-all duration-300 ${isSidebarExpanded ? 'w-full gap-3 px-4' : 'w-12 h-12 justify-center'} ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : isCompleted ? 'text-success-500 hover:bg-success-50' : 'text-gray-400 hover:bg-gray-50 hover:text-primary'}`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    {isCompleted ? (
                      <Check size={22} className="shrink-0" />
                    ) : (
                      <Icon size={22} className="shrink-0" />
                    )}
                    {isSidebarExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                      >
                        <span className="font-medium text-[13.4px] whitespace-nowrap">
                          {step.title}
                        </span>
                        {step.description && (
                          <span className={`text-[11px] whitespace-nowrap ${isActive ? 'text-white/70' : isCompleted ? 'text-success-400' : 'text-gray-400'}`}>
                            {step.description}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </div>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 pb-3">
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center">
                  {currentStep}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {STEPS[currentStep - 1]?.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    Bước {currentStep}/{STEPS.length}
                    {w_ho_va_ten ? ` · ${w_ho_va_ten}` : ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <Button
                  size="sm"
                  variant="flat"
                  onPress={prevStep}
                  isDisabled={isLoading}
                  startContent={<ChevronLeft size={14} />}
                >
                  Quay lại
                </Button>
              )}
              <Button size="sm" variant="flat" color="danger" onPress={() => navigate(-1)}>
                Hủy bỏ
              </Button>
              {currentStep < STEPS.length ? (
                <Button
                  size="sm"
                  color="primary"
                  onPress={nextStep}
                  isDisabled={isLoading}
                  endContent={<ChevronRight size={14} />}
                >
                  Tiếp theo
                </Button>
              ) : (
                <Button
                  size="sm"
                  color="success"
                  onPress={() => {
                    handleFormSubmit(handleSubmit, (errors) => {
                      console.error('Form Validation Errors:', errors)
                    })()
                  }}
                  isLoading={isLoading}
                  startContent={!isLoading ? <Check size={14} /> : undefined}
                >
                  {isLoading ? 'Đang tạo...' : 'Hoàn thành'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 pb-4">
          <FormProvider {...methods}>
            {renderStepContent()}
          </FormProvider>
        </div>
      </div>

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
    </div>
  )
}
