import { Skeleton, cn } from '@heroui/react'
import { NhansuAxios, TRANG_THAI_CONG_VIEC } from '@renderer/api/danhmuc/nhansuAxios'
import { HrDrawer, HrDrawerBody } from '@renderer/components/hero-custom/HrDrawer'
import UserAvatar from '@renderer/components/UserAvatar'
import MinhChungPreview, { PreviewFile } from '@renderer/pages/profile/components/MinhChungPreview'
import { date as formatDate } from '@renderer/utils/formatDate'
import { getFileUrl } from '@renderer/utils/urlUtils'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  FileText,
  GraduationCap,
  History,
  IdCard,
  Mail,
  Medal,
  ShieldCheck,
  Star,
  Trophy,
  UserCircle,
  Users,
  X
} from 'lucide-react'
import React, { useState } from 'react'

const XEP_LOAI_MAP: Record<string, string> = {
  Khong_dat: 'Không đạt',
  Trung_binh: 'Trung bình',
  Kha: 'Khá',
  Gioi: 'Giỏi',
  Xuat_sac: 'Xuất sắc'
}

interface EmployeeDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  employeeId: number | string | null
}

export const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({
  isOpen,
  onClose,
  employeeId
}) => {
  const [activeTab, setActiveTab] = useState<string>('general')
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[] | null>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const { data: employeeData, isLoading } = useQuery({
    queryKey: ['employeeDetail', employeeId],
    queryFn: async () => {
      if (!employeeId) return null
      const res = await NhansuAxios.getNhanSuByID(employeeId)
      return res?.data || res
    },
    enabled: isOpen && !!employeeId,
    staleTime: 5 * 60 * 1000 // Cache 5 minutes
  })

  if (!isOpen) return null

  const emp = employeeData || {}

  console.log(`emp`, emp)

  const statusConfig = emp.trang_thai
    ? TRANG_THAI_CONG_VIEC[emp.trang_thai as keyof typeof TRANG_THAI_CONG_VIEC]
    : null

  const tabs = [
    {
      key: 'general',
      label: 'Thông tin chung',
      icon: UserCircle,
      desc: 'Chi tiết liên hệ và định danh cá nhân.'
    },
    {
      key: 'employment',
      label: 'Thông tin nhân sự',
      icon: BadgeCheck,
      desc: 'Trạng thái nhân sự và thông tin ngân hàng.'
    },


    {
      key: 'history',
      label: 'Quá trình công tác',
      icon: History,
      desc: 'Lịch sử công tác và điều chuyển nội bộ.'
    },
    {
      key: 'evaluations',
      label: 'Đánh giá nhân sự',
      icon: BarChart3,
      desc: 'Lịch sử đánh giá năng lực và hiệu suất.'
    },

    {
      key: 'certificates',
      label: 'Chứng chỉ',
      icon: Medal,
      desc: 'Danh sách các chứng chỉ chuyên môn.'
    },
    { key: 'degrees', label: 'Bằng cấp', icon: GraduationCap, desc: 'Danh sách bằng cấp học vấn.' },

    {
      key: 'awards',
      label: 'Khen thưởng',
      icon: Trophy,
      desc: 'Danh sách thành tích và khen thưởng kỷ luật.'
    }
  ]

  const activeTabInfo = tabs.find((t) => t.key === activeTab)

  return (
    <HrDrawer
      isOpen={isOpen}
      onClose={onClose}
      defaultWidth={1000}
      minWidth={600}
      resizable={false}
      classNames={{ base: '!rounded-tl-2xl !rounded-bl-2xl !rounded-tr-none !rounded-br-none' }}
    >
      <HrDrawerBody className="p-0! flex flex-col md:flex-row h-full overflow-hidden! bg-[#faf9fe]! relative">
        {/* Left Sidebar: Profile Summary & Vertical Navigation */}
        <aside className="w-full md:w-80 bg-[#f3f3fa] z-30 flex flex-col py-8 overflow-y-auto shrink-0 relative md:h-full rounded-tr-4xl rounded-br-4xl">
          {/* Close Button for Mobile */}
          <div className="absolute top-4 right-4 z-40 md:hidden">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#e7e8f1] text-[#2f323a] hover:bg-[#e0e2ed] transition-colors flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile Summary Section */}
          <div className="px-8 pb-8 flex flex-col items-center mt-4 md:mt-0 shrink-0">
            {isLoading ? (
              <Skeleton className="w-24 h-24 rounded-full mb-4 shrink-0" />
            ) : (
              <div className="relative mb-4 shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-[0px_4px_16px_rgba(13,14,18,0.05)] ring-4 ring-[#faf9fe] bg-white object-cover hidden md:block">
                  <UserAvatar
                    name={emp.ho_va_ten || ''}
                    src={emp.avatar || undefined}
                    className="w-full h-full rounded-none"
                  />
                </div>
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#faf9fe] bg-white object-cover md:hidden">
                  <UserAvatar
                    name={emp.ho_va_ten || ''}
                    src={emp.avatar || undefined}
                    className="w-full h-full rounded-none"
                  />
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center w-full">
                <Skeleton className="h-6 w-3/4 rounded mb-2" />
                <Skeleton className="h-4 w-1/2 rounded mb-4" />
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <h2 className="text-lg font-bold text-[#2f323a] font-headline tracking-tight text-center mb-1">
                  {emp.ho_va_ten || '---'}
                </h2>
              </div>
            )}
          </div>

          {/* Vertical Navigation */}
          <nav className="flex-1 overflow-y-auto w-full pb-8">
            <ul className="flex flex-col gap-1 w-full m-0 p-0 list-none">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key
                const Icon = tab.icon
                return (
                  <li key={tab.key} className="block list-none p-0 m-0">
                    <button
                      disabled={isLoading}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "mx-4 px-6 cursor-pointer py-3 flex items-center gap-4 rounded-full font-['Plus_Jakarta_Sans'] font-medium text-sm transition-all duration-200 w-[calc(100%-2rem)] text-left",
                        isActive
                          ? 'bg-blue-100 text-blue-700 translate-x-1 shadow-sm'
                          : 'text-slate-500 hover:bg-slate-100 hover:scale-[1.02]',
                        isLoading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Icon size={18} className={isActive ? 'text-blue-700' : 'text-slate-500'} />
                      <span className="truncate flex-1">{tab.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-[#faf9fe] p-5 md:p-8 scrollbar-hide">
          {/* Close Button for Web */}
          <div className="absolute top-4 right-4 z-40 hidden md:block shrink-0">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#f3f3fa] text-[#2f323a] hover:bg-[#e0e2ed] transition-colors flex items-center justify-center cursor-pointer border border-[#e0e2ed]/50 shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-8 max-w-4xl mx-auto flex-1">
              <header className="mb-8">
                <Skeleton className="h-10 w-64 rounded mb-2" />
                <Skeleton className="h-5 w-48 rounded" />
              </header>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="bg-[#ededf6] rounded-xl p-8 shadow-[0px_4px_16px_rgba(13,14,18,0.04)] h-48 lg:col-span-2" />
                <Skeleton className="bg-[#ededf6] rounded-xl p-8 shadow-[0px_4px_16px_rgba(13,14,18,0.04)] h-48" />
                <Skeleton className="bg-[#ededf6] rounded-xl p-8 shadow-[0px_4px_16px_rgba(13,14,18,0.04)] h-48" />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto pb-12 flex-1 relative flex flex-col">
              <header className="mb-8 pr-12 shrink-0">
                <h1 className="text-lg md:text-xl font-bold font-headline text-[#2f323a] tracking-tight mb-2">
                  {activeTabInfo?.label}
                </h1>
                <p className="text-[#5c5f68] text-sm md:text-base">{activeTabInfo?.desc}</p>
              </header>

              {/* View Content */}
              {activeTab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Info Card */}
                  <div className="bg-[#f3f3fa] rounded-2xl p-6 border border-[#e0e2ed]/50 lg:col-span-2">
                    <h3 className="font-headline text-[16px] font-bold text-[#2f323a] mb-6 flex items-center gap-2.5">
                      <IdCard className="text-[#005bc1]" size={18} />
                      Định danh cá nhân
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                      <DetailItem label="Họ và tên" value={emp.ho_va_ten || '---'} />
                      <DetailItem label="Mã nhân viên" value={emp.ma_nhan_vien || '---'} />
                      <DetailItem
                        label="Ngày sinh"
                        value={emp.ngay_sinh ? formatDate('d/m/Y', emp.ngay_sinh) : '---'}
                      />
                      <DetailItem
                        label="Giới tính"
                        value={
                          emp.gioi_tinh === 'Nam' || emp.gioi_tinh === '1'
                            ? 'Nam'
                            : emp.gioi_tinh === 'Nữ' || emp.gioi_tinh === '0'
                              ? 'Nữ'
                              : emp.gioi_tinh || '---'
                        }
                      />
                      <DetailItem label="Dân tộc" value={emp.ten_dan_toc || '---'} />
                      <DetailItem label="Tôn giáo" value={emp.ten_ton_giao || '---'} />
                      <DetailItem label="Số CCCD" value={emp.cccd_so || '---'} />
                      <DetailItem
                        label="Ngày cấp CCCD"
                        value={emp.cccd_ngay_cap ? formatDate('d/m/Y', emp.cccd_ngay_cap) : '---'}
                      />
                      <DetailItem label="Nơi cấp CCCD" value={emp.cccd_noi_cap || '---'} />
                      <DetailItem label="Mã số thuế cá nhân" value={emp.mst_ca_nhan || '---'} />
                    </div>
                  </div>

                  {/* Contact Information Card */}
                  <div className="bg-[#f3f3fa] rounded-2xl p-6 lg:col-span-2 border border-[#e0e2ed]/50">
                    <h3 className="font-headline text-[16px] font-bold text-[#2f323a] mb-6 flex items-center gap-2.5">
                      <Mail className="text-[#005bc1] fill-current" size={18} />
                      Liên hệ & Địa chỉ
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                      <DetailItem
                        label="Email công việc"
                        value={emp.email || emp.email_truong || '---'}
                      />
                      <DetailItem label="Email cá nhân" value={emp.email_ca_nhan || '---'} />
                      <DetailItem
                        label="Điện thoại di động"
                        value={emp.so_dien_thoai || emp.di_dong || '---'}
                      />
                      <DetailItem label="Quê quán" value={emp.que_quan || '---'} />
                      <DetailItem label="Hộ khẩu thường trú" value={emp.hktt_dia_chi || '---'} />
                      <DetailItem label="Chỗ ở hiện nay" value={emp.cohn_dia_chi || '---'} />
                      <DetailItem
                        label="Liên hệ khẩn cấp"
                        value={
                          emp.lhkc_ho_ten
                            ? `${emp.lhkc_ho_ten} (${emp.lhkc_quan_he}) - ${emp.lhkc_sdt_di_dong}`
                            : '---'
                        }
                      />
                    </div>
                  </div>

                  {/* Family Information Section */}
                  <div className="bg-[#f3f3fa] rounded-2xl p-6 lg:col-span-2 border border-[#e0e2ed]/50">
                    <h3 className="font-headline text-[16px] font-bold text-[#2f323a] mb-6 flex items-center gap-2.5">
                      <Users className="text-[#005bc1] fill-current" size={18} />
                      Thông tin gia đình
                    </h3>
                    <GenericList
                      data={emp.thong_tin_gia_dinh}
                      emptyText="Chưa có dữ liệu thông tin gia đình."
                      listClassName="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6"
                      renderItem={(item, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-xl p-5 flex flex-col gap-4 border border-[#e0e2ed]/50 hover:shadow-[0px_8px_24px_rgba(13,14,18,0.04)] transition-all duration-300 group"
                        >
                          <div className="flex items-center justify-between border-b border-[#faf9fe] pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#f3f3fa] flex items-center justify-center text-[#4a5264] shrink-0">
                                <Users size={18} className="stroke-[1.5]" />
                              </div>
                              <div>
                                <h4 className="font-headline font-bold text-sm text-[#2f323a] group-hover:text-[#005bc1] transition-colors">
                                  {item.ho_ten || '---'}
                                </h4>
                                <span className="text-[10px] font-semibold px-2 py-0.5 mt-1 inline-block rounded-full bg-[#005bc1]/10 text-[#005bc1]">
                                  {item.moi_quan_he || '---'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-y-2.5 mt-1">
                            <DetailItem
                              label="Năm sinh"
                              value={
                                item.nam_sinh || item.ngay_sinh
                                  ? new Date(item.ngay_sinh).getFullYear().toString()
                                  : '---'
                              }
                            />
                            <DetailItem label="Nghề nghiệp" value={item.nghe_nghiep || '---'} />
                            <DetailItem label="Điện thoại" value={item.so_dien_thoai || '---'} />
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'employment' && (
                <div className="grid grid-cols-1 gap-6">
                  {/* Basic Info Card */}
                  <div className="bg-[#f3f3fa] rounded-2xl p-6 border border-[#e0e2ed]/50">
                    <h3 className="font-headline text-[16px] font-bold text-[#2f323a] mb-6 flex items-center gap-2.5">
                      <BadgeCheck className="text-[#005bc1] fill-current" size={18} />
                      Thông tin việc làm
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                      <DetailItem
                        label="Đơn vị công tác"
                        value={emp.ten_don_vi_cong_tac || emp.ten_don_vi || '---'}
                      />
                      <DetailItem
                        label="Vị trí công việc"
                        value={
                          emp.ten_vi_tri_cong_viec || emp.chuc_danh || emp.ten_cong_viec || '---'
                        }
                      />
                      <DetailItem
                        label="Trạng thái"
                        value={statusConfig?.label || emp.trang_thai || '---'}
                      />
                      <DetailItem label="Mã chấm công" value={emp.ma_cham_cong || '---'} />
                      <DetailItem
                        label="Ngày thử việc"
                        value={emp.ngay_thu_viec ? formatDate('d/m/Y', emp.ngay_thu_viec) : '---'}
                      />
                      <DetailItem
                        label="Ngày vào làm chính thức"
                        value={
                          emp.ngay_lam_chinh_thuc
                            ? formatDate('d/m/Y', emp.ngay_lam_chinh_thuc)
                            : emp.ngay_vao_lam
                              ? formatDate('d/m/Y', emp.ngay_vao_lam)
                              : '---'
                        }
                      />
                      <DetailItem
                        label="Cán bộ quản lý trực tiếp"
                        value={emp.ten_nhan_vien_ql_truc_tiep || '---'}
                      />
                      <DetailItem
                        label="Vị trí kiêm nhiệm"
                        value={
                          emp.don_vi_kiem_nhiem && emp.don_vi_kiem_nhiem.length > 0
                            ? emp.don_vi_kiem_nhiem
                              .map((dv: any) => dv.ten_don_vi_cong_tac || dv.id_don_vi_cong_tac)
                              .join(', ')
                            : '---'
                        }
                      />
                    </div>
                  </div>

                  {/* Insurance Card */}
                  <div className="bg-[#f3f3fa] rounded-2xl p-6 border border-[#e0e2ed]/50">
                    <h3 className="font-headline text-[16px] font-bold text-[#2f323a] mb-6 flex items-center gap-2.5">
                      <ShieldCheck className="text-[#005bc1]" size={18} />
                      Thông tin bảo hiểm
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                      <DetailItem
                        label="Số sổ BHXH"
                        value={emp.thong_tin_bao_hiem?.so_so_bhxh || '---'}
                      />
                      <DetailItem
                        label="Mã BHXH"
                        value={emp.thong_tin_bao_hiem?.ma_bhxh || '---'}
                      />
                      <DetailItem
                        label="Nơi đăng ký KCB"
                        value={emp.thong_tin_bao_hiem?.noi_dk_kcb || '---'}
                      />
                      <DetailItem
                        label="Tỷ lệ đóng bảo hiểm"
                        value={
                          emp.thong_tin_bao_hiem?.ti_le_dong
                            ? `${emp.thong_tin_bao_hiem.ti_le_dong}%`
                            : '---'
                        }
                      />
                      <DetailItem
                        label="Ngày tham gia"
                        value={
                          emp.thong_tin_bao_hiem?.ngay_tham_gia
                            ? formatDate('d/m/Y', emp.thong_tin_bao_hiem.ngay_tham_gia)
                            : '---'
                        }
                      />
                    </div>
                  </div>
                </div>
              )}





              {activeTab === 'certificates' && (
                <GenericList
                  data={emp.chung_chi}
                  emptyText="Chưa có dữ liệu chứng chỉ."
                  listClassName="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6"
                  renderItem={(item, i) => (
                    <div
                      key={i}
                      className="bg-[#f3f3fa] rounded-xl p-6 md:p-8 flex flex-col justify-between h-full group hover:-translate-y-1 transition-transform duration-300 border border-[#e0e2ed]/50 hover:shadow-[0px_12px_32px_rgba(13,14,18,0.06)]"
                    >
                      <div>
                        <div className="w-12 h-12 rounded-full bg-[#3d89ff]/10 flex items-center justify-center text-[#005bc1] mb-5 shrink-0">
                          <Medal size={24} className="stroke-[1.5]" />
                        </div>
                        <h3
                          className="font-headline font-semibold text-lg md:text-xl text-[#2f323a] mb-2 leading-tight line-clamp-2"
                          title={item.ten_chung_chi || '---'}
                        >
                          {item.ten_chung_chi || '---'}
                        </h3>
                        <p
                          className="text-sm text-[#5c5f68] mb-4 truncate"
                          title={item.noi_cap || '---'}
                        >
                          {item.noi_cap || '---'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs text-[#5c5f68] border-t border-[#afb1bc]/15 pt-4 mt-4">
                          <div>
                            <span className="flex items-center gap-1">
                              <CalendarDays size={14} className="text-[#5c5f68]" />
                              Cấp:{' '}
                              {item.ngay_cap_chung_chi
                                ? formatDate('d/m/Y', item.ngay_cap_chung_chi)
                                : '---'}
                            </span>
                            {item.ngay_het_han && (
                              <p className="text-[11px] text-[#5c5f68] mt-1.5 opacity-80 pl-5">
                                Hết hạn: {formatDate('d/m/Y', item.ngay_het_han)}
                              </p>
                            )}
                          </div>
                          {item.files?.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                const allMappedFiles: PreviewFile[] = []
                                let clickedIndex = 0
                                let foundClicked = false

                                emp.chung_chi?.forEach((cert: any) => {
                                  if (cert.files && cert.files.length > 0) {
                                    cert.files.forEach((f: any, i: number) => {
                                      const mappedId = `${cert.id_chung_chi}-${i}`
                                      allMappedFiles.push({
                                        id: mappedId,
                                        file_name: f.file_name,
                                        url: getFileUrl(f.file_path) || '',
                                        file_extension: f.file_extension,
                                        categoryName: cert.ten_chung_chi || 'Chứng chỉ',
                                        categoryId: cert.id_chung_chi || 0
                                      })
                                      if (
                                        !foundClicked &&
                                        cert.id_chung_chi === item.id_chung_chi
                                      ) {
                                        foundClicked = true
                                        clickedIndex = allMappedFiles.length - 1
                                      }
                                    })
                                  }
                                })

                                setPreviewFiles(allMappedFiles)
                                setPreviewIndex(clickedIndex)
                              }}
                              className="relative p-2 rounded-full hover:bg-blue-50 text-[#5c5f68] hover:text-[#005bc1] transition-colors outline-none cursor-pointer"
                              title="Xem tệp đính kèm"
                            >
                              <FileText size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              )}

              {activeTab === 'degrees' && (
                <GenericList
                  data={emp.bang_cap}
                  emptyText="Chưa có dữ liệu bằng cấp."
                  renderItem={(item, i) => (
                    <div
                      key={i}
                      className="bg-[#ededf6] rounded-xl p-6 sm:p-8 shadow-[0px_4px_16px_rgba(13,14,18,0.04)] relative overflow-hidden group border border-[#e0e2ed]/50"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#3d89ff]/20 to-transparent rounded-bl-full -z-10"></div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 sm:gap-6 min-w-0">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#3d89ff]/20 flex items-center justify-center text-[#005bc1] shrink-0">
                            <GraduationCap size={24} className="sm:w-8 sm:h-8 stroke-[1.5]" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-headline text-base sm:text-lg font-bold text-[#2f323a] mb-1 truncate">
                              {item.chuyen_nganh || '---'}
                            </h3>
                            <p className="text-[#5c5f68] text-sm sm:text-base mb-3 sm:mb-4 truncate">
                              {item.noi_dao_tao || '---'}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#5c5f68] font-medium">
                              <div className="flex items-center gap-1.5 bg-[#e0e2ed] px-3 py-1.5 rounded-full whitespace-nowrap">
                                <CalendarDays size={14} className="text-[#4b5366]" />
                                <span>
                                  {item.tu_thang ? formatDate('m/Y', item.tu_thang) : '???'} -{' '}
                                  {item.den_thang ? formatDate('m/Y', item.den_thang) : 'Nay'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-[#e0e2ed] px-3 py-1.5 rounded-full whitespace-nowrap truncate max-w-[200px] sm:max-w-xs">
                                <Award size={14} className="text-[#4b5366] shrink-0" />
                                <span className="truncate">
                                  {item.trinh_do_dt || '---'}
                                  {item.xep_loai_dt
                                    ? ` - ${XEP_LOAI_MAP[item.xep_loai_dt] || item.xep_loai_dt}`
                                    : ''}
                                </span>
                              </div>
                              {(item.file_path || item.file_name) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const allMappedFiles: PreviewFile[] = []
                                    let clickedIndex = 0

                                    emp.bang_cap?.forEach((bc: any) => {
                                      if (bc.file_path || bc.file_name) {
                                        allMappedFiles.push({
                                          id: `${bc.id_bang_cap}-0`,
                                          file_name: bc.file_name || 'Bằng cấp',
                                          url: getFileUrl(bc.file_path) || '',
                                          file_extension: bc.file_extension || '',
                                          categoryName: bc.chuyen_nganh || 'Bằng cấp',
                                          categoryId: bc.id_bang_cap || 0
                                        })
                                        if (bc.id_bang_cap === item.id_bang_cap) {
                                          clickedIndex = allMappedFiles.length - 1
                                        }
                                      }
                                    })

                                    setPreviewFiles(allMappedFiles)
                                    setPreviewIndex(clickedIndex)
                                  }}
                                  className="relative p-2 rounded-full hover:bg-blue-50 text-[#5c5f68] hover:text-[#005bc1] transition-colors outline-none cursor-pointer"
                                  title="Xem tệp đính kèm"
                                >
                                  <FileText size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                />
              )}



              {activeTab === 'awards' && (
                <GenericList
                  data={emp.thuong_danh_sach}
                  emptyText="Chưa có dữ liệu khen thưởng - kỷ luật."
                  renderItem={(item, i) => (
                    <div
                      key={i}
                      className="bg-[#f3f3fa] rounded-xl p-5 border border-[#e0e2ed] flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between border-b border-[#e0e2ed] pb-3">
                        <h4 className="font-bold text-[#2f323a]">{item.ten_thuong || '---'}</h4>
                        <span className="text-sm font-semibold text-[#005bc1]">
                          {item.created_at ? formatDate('d/m/Y', item.created_at) : '---'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <DetailItem label="Loại thưởng" value={item.loai_thuong || '---'} />
                        {item.so_tien && (
                          <DetailItem
                            label="Mức thưởng"
                            value={new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(Number(item.so_tien))}
                          />
                        )}
                      </div>
                    </div>
                  )}
                />
              )}

              {activeTab === 'history' && (
                <div className="flex flex-col gap-8">
                  {/* Internal History Section */}
                  <div className="bg-[#f3f3fa] rounded-2xl p-6 pt-8 border border-[#e0e2ed]/50">
                    <h3 className="font-headline text-[16px] font-bold text-[#2f323a] mb-8 flex items-center gap-2.5">
                      <History className="text-[#005bc1]" size={18} />
                      Quá trình công tác tại đơn vị
                    </h3>
                    {!emp.qua_trinh_cong_tac || emp.qua_trinh_cong_tac.length === 0 ? (
                      <p className="text-sm text-[#5c5f68] italic text-center py-8">
                        Chưa có dữ liệu quá trình công tác.
                      </p>
                    ) : (
                      <div className="relative flex flex-col gap-10">
                        {/* Ambient Track */}
                        <div className="absolute left-[15px] top-4 bottom-8 w-[4px] bg-linear-to-b from-[#005bc1]/20 via-[#005bc1]/5 to-transparent rounded-full"></div>

                        {/* Timeline items sorted newest to oldest */}
                        {[...emp.qua_trinh_cong_tac]
                          .sort((a: any, b: any) => {
                            const dateA = a.ngay_bat_dau ? new Date(a.ngay_bat_dau).getTime() : 0
                            const dateB = b.ngay_bat_dau ? new Date(b.ngay_bat_dau).getTime() : 0
                            return dateB - dateA
                          })
                          .map((item: any, index: number) => (
                            <div
                              key={item.id_qua_trinh_cong_tac || index}
                              className="relative flex gap-6 group"
                            >
                              {/* Icon Node */}
                              <div className="relative z-10 w-8 h-8 rounded-full bg-[#f3f3fa] border-2 border-white flex items-center justify-center shrink-0 mt-1 shadow-sm transition-transform group-hover:scale-110">
                                {index === 0 ? (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#005bc1] shadow-[0_0_12px_rgba(0,91,193,0.4)]"></div>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-[#afb1bc]"></div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex flex-col gap-1.5 w-full min-w-0">
                                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start w-full gap-2">
                                  <h4 className="text-lg font-bold text-[#2f323a] leading-tight mt-0.5">
                                    {item.ten_cong_viec || '---'}
                                  </h4>
                                  <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shrink-0 w-fit ${index === 0 ? 'text-[#005bc1] bg-[#3d89ff]/10' : 'text-[#5c5f68] bg-[#f3f3fa] border border-[#e0e2ed]/50'}`}
                                  >
                                    {item.ngay_bat_dau
                                      ? formatDate('d/m/Y', item.ngay_bat_dau)
                                      : '???'}
                                    {' - '}
                                    {item.ngay_ket_thuc ? formatDate('d/m/Y', item.ngay_ket_thuc) : 'Nay'}
                                  </span>
                                </div>

                                <p className="text-sm font-medium text-[#4a5264] flex items-center gap-1.5">
                                  <Building2 size={16} className="text-[#787a84]" />
                                  {item.ten_don_vi || '---'}
                                </p>

                                {item.ghi_chu && (
                                  <div className="bg-[#faf9fe] rounded-xl p-4 mt-2.5 border border-[#e0e2ed]/50">
                                    <p className="text-[13px] text-[#5c5f68] leading-relaxed">
                                      {item.ghi_chu}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Previous Experience Section */}
                  <div className="bg-[#f3f3fa] rounded-2xl p-6 border border-[#e0e2ed]/50">
                    <h3 className="font-headline text-[16px] font-bold text-[#2f323a] mb-6 flex items-center gap-2.5">
                      <ArrowRight className="text-[#005bc1]" size={18} />
                      Kinh nghiệm làm việc trước đây
                    </h3>
                    <GenericList
                      data={emp.kinh_nghiem_lam_viec}
                      emptyText="Nhân viên chưa có dữ liệu kinh nghiệm làm việc."
                      renderItem={(item, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-xl p-5 border border-[#e0e2ed]/50 flex flex-col gap-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-slate-50 border border-[#e0e2ed] flex items-center justify-center shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#005bc1]"></div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <h4 className="font-bold text-[#2f323a] text-base">
                                  {item.chuc_danh || item.chuc_vu || item.vi_tri || '---'}
                                </h4>
                                <p className="text-sm text-[#5c5f68] flex items-center gap-1.5">
                                  <Building2 size={15} />
                                  {item.ten_cong_ty || '---'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center sm:self-start mt-1 sm:mt-0 ml-12 sm:ml-0">
                              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#e8f0fe] text-[#005bc1] whitespace-nowrap border border-[#005bc1]/10">
                                {item.ngay_bat_dau ? formatDate('d/m/Y', item.ngay_bat_dau) : '???'} -{' '}
                                {item.ngay_ket_thuc ? formatDate('d/m/Y', item.ngay_ket_thuc) : 'Nay'}
                              </span>
                            </div>
                          </div>
                          {(item.mo_ta || item.ly_do_nghi_viec) && (
                            <div className="ml-12 flex flex-col gap-3 pt-3 border-t border-[#e0e2ed]/30">
                              {item.mo_ta && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-semibold text-[#5c5f68] uppercase tracking-wider">
                                    Mô tả công việc
                                  </span>
                                  <p className="text-[12px] text-[#2f323a] leading-relaxed whitespace-pre-line">
                                    {item.mo_ta}
                                  </p>
                                </div>
                              )}
                              {item.ly_do_nghi_viec && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-semibold text-[#5c5f68] uppercase tracking-wider">
                                    Lý do nghỉ việc
                                  </span>
                                  <p className="text-[12px] text-[#2f323a] leading-relaxed whitespace-pre-line italic">
                                    {item.ly_do_nghi_viec}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Training Section */}
                  <div className="bg-[#f3f3fa] rounded-2xl p-6 border border-[#e0e2ed]/50">
                    <h3 className="font-headline text-[16px] font-bold text-[#2f323a] mb-6 flex items-center gap-2.5">
                      <BookOpen className="text-[#005bc1] fill-current" size={18} />
                      Quá trình đào tạo
                    </h3>
                    <GenericList
                      data={emp.qua_trinh_dao_tao}
                      emptyText="Chưa có dữ liệu quá trình đào tạo."
                      renderItem={(item, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-xl p-5 border border-[#e0e2ed]/50 flex flex-col gap-4"
                        >
                          <div className="flex items-center justify-between border-b border-[#faf9fe] pb-3">
                            <h4 className="font-bold text-[#2f323a] text-sm">
                              {item.ten_khoa_hoc || '---'}
                            </h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-[#5c5f68] bg-[#f3f3fa] border border-[#e0e2ed]/50">
                              {item.ngay_bat_dau ? formatDate('d/m/Y', item.ngay_bat_dau) : '???'} -{' '}
                              {item.ngay_ket_thuc ? formatDate('d/m/Y', item.ngay_ket_thuc) : '???'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailItem label="Nội dung" value={item.noi_dung || '---'} />
                            <div className="flex gap-4">
                              <DetailItem
                                label="Trạng thái"
                                value={
                                  item.trang_thai === 'Hoan_thanh'
                                    ? 'Hoàn thành'
                                    : item.trang_thai === 'Dang_dien_ra'
                                      ? 'Đang diễn ra'
                                      : item.trang_thai || '---'
                                }
                              />
                              <DetailItem
                                label="Kết quả"
                                value={
                                  item.ket_qua === 'Hoan_thanh'
                                    ? 'Hoàn thành'
                                    : item.ket_qua === 'Dang_dien_ra'
                                      ? 'Đang diễn ra'
                                      : item.ket_qua || '---'
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}
              {activeTab === 'evaluations' && (
                <GenericList
                  data={emp.danh_gia}
                  emptyText="Nhân viên này chưa có đánh giá nào được ghi nhận trên hệ thống."
                  renderItem={(item, i) => (
                    <div
                      key={i}
                      className="bg-[#f3f3fa] rounded-xl p-5 border border-[#e0e2ed] flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between border-b border-[#e0e2ed] pb-3">
                        <div className="flex items-center gap-2">
                          <Star size={18} className="text-[#eab308] fill-[#eab308]" />
                          <h4 className="font-bold text-[#2f323a] uppercase tracking-wide">
                            Điểm: {item.diem_so || '---'}
                          </h4>
                        </div>
                        <span className="text-sm font-semibold px-3 py-1 rounded-full text-[#5c5f68] bg-white border border-[#e0e2ed]">
                          {item.thang ? formatDate('m/Y', item.thang) : '---'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-[13px] text-[#5c5f68] font-medium">Nhận xét</p>
                        <div className="bg-white rounded-lg p-3 border border-[#e0e2ed]/50 text-sm text-[#2f323a] min-h-[60px]">
                          {item.nhan_xet || (
                            <span className="text-[#a0a2ac] italic">
                              Không có nhận xét chi tiết.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              )}
            </div>
          )}
        </main>
      </HrDrawerBody>

      {previewFiles && previewIndex !== null && (
        <MinhChungPreview
          files={previewFiles}
          initialIndex={previewIndex}
          onClose={() => {
            setPreviewFiles(null)
            setPreviewIndex(null)
          }}
          readOnly
        />
      )}
    </HrDrawer>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <p className="text-[13px] text-[#5c5f68] mb-0.5">{label}</p>
      <p className="text-[14px] font-semibold text-[#2f323a] wrap-break-word">{value}</p>
    </div>
  )
}

function GenericList({
  data,
  emptyText,
  renderItem,
  listClassName = 'flex flex-col gap-5'
}: {
  data: any[]
  emptyText: string
  renderItem: (item: any, i: number) => React.ReactNode
  listClassName?: string
}) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#f3f3fa] rounded-2xl p-6">
        <p className="text-sm text-[#5c5f68] italic text-center py-6">{emptyText}</p>
      </div>
    )
  }
  return <div className={listClassName}>{data.map((item, i) => renderItem(item, i))}</div>
}
