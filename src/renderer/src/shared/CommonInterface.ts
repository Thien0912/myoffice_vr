import { ReactNode } from 'react'

export interface FileDinhKem {
  id_file_dinh_kem: string
  id_van_ban: string
  ten_file_goc: string
  dung_luong: string
  duong_dan: string
  loai_file: string
  ngay_tao: string
  ngay_sua: string
  la_file_ban_hanh: string | null
  is_public: string
  noi_dung_trich_xuat: string
}

interface ButPhe {
  id_but_phe: string
  id_van_ban: string
  id_nguoi_but_phe: string
  ngay_but_phe: string
  noi_dung_but_phe: string
  file_but_phe: string | null
  ngay_tao: string
  ngay_sua: string
  id_nguoi_tao: string
  id_nguoi_sua: string
  nguoi_but_phe_ho_ten: string
}

export interface NguoiXem {
  id_don_vi_xu_ly_da_xem: string
  id_don_vi_xu_ly: string
  ql_nguoi_dung_id: string
  ngay_xem: string
  ql_nguoi_dung_ho_ten: string
  ql_nguoi_dung_email: string
}

export interface DonViXuLy {
  id_don_vi_xu_ly: string
  id_don_vi: string
  id_xu_ly: string
  id_nguoi_xu_ly: string | null
  ngay_tao: string
  ngay_sua: string
  nguoi_tao: string
  nguoi_sua: string
  don_vi_xu_ly_chinh: string
  da_xem: string
  ten_don_vi: string
  ten_viet_tat: string
  ten_don_vi_en: string
  ma_don_vi: string | null
  loai: string
  email: string
  nguoi_xem: NguoiXem[]
  so_nguoi_xem: number
}

// 🧩 Interface cho xử lý văn bản
export interface XuLy {
  id_xu_ly: string
  id_van_ban: string

  nguoi_phu_trach: string | null
  nguoi_chu_tri: string | null
  nguoi_phoi_hop: string | null
  nguoi_xem: string | null

  trang_thai_xu_ly: string
  nguoi_duyet: string
  ngay_duyet: string
  ghi_chu_duyet: string

  ngay_tao: string
  ngay_sua: string
  nguoi_tao: string
  nguoi_sua: string | null

  don_vi_xu_ly_chinh: DonViXuLy[]
  don_vi_xu_ly_phoi_hop: DonViXuLy[]
}

// 🧩 Interface cho phản hồi của đơn vị
export interface PhanHoi {
  id_bao_cao: string
  noi_dung: string
  ngay_bao_cao: string
  id_van_ban: string
  id_don_vi_phan_hoi: string
  dinh_kem: string | null
  files_dinh_kem: any[]
  ngay_tao: string
  ngay_sua: string
  nguoi_tao: string
  trang_thai: string
  ten_don_vi: string
  send: boolean
}

// 🧩 Interface cho dữ liệu trong timeline
// interface TimelineDataDonVi {
//   id_don_vi: string
//   ten_don_vi: string
//   ngay_tao: string
//   da_phan_hoi?: boolean
//   ngay_bao_bao?: string
// }

// 🧩 Interface cho timeline
interface Timeline {
  code: string
  label: string
  description: string
  icon: string
  class_name: string
  date_time: string
  data: any
}

export interface CoQuan {
  // Nếu có dữ liệu thì bổ sung thêm field sau này
  [key: string]: any
}

export interface NguoiXuLy {
  id_don_vi_xu_ly: string
  id_don_vi: string
  id_xu_ly: string
  id_nguoi_xu_ly: string
  ngay_tao: string
  ngay_sua: string
  nguoi_tao: string
  nguoi_sua: string | null
  don_vi_xu_ly_chinh: string | null
  da_xem: string // "0" | "1"
  ql_nguoi_dung_ho_ten: string
  ten_don_vi: string
}

export interface ThongTinBanHanh {
  e_vb_co_quan: CoQuan[]
  e_don_vi_xu_ly: DonViXuLy[]
  e_nguoi_xu_ly: NguoiXuLy[]
}

// 🧩 Interface chính cho văn bản
export interface VanBanData {
  id_van_ban: string
  so_van_ban: string
  so_van_ban_hau_to: string | null
  so_hieu_van_ban: string
  loai_van_ban: string
  id_loai: string
  ten_loai: string
  trich_yeu: string
  ngay_nhan: string
  ngay_ban_hanh: string
  thoi_gian_xu_ly: string | null
  trang_thai: string
  id_khoi_co_quan: string | null
  ten_khoi_co_quan: string | null
  id_co_quan: string
  ten_co_quan: string
  id_hinh_thuc: string | null
  ten_hinh_thuc: string | null
  linh_vuc: string | null
  id_tinh_chat: string
  ten_tinh_chat: string
  color_tinh_chat: string
  id_bao_mat: string
  ten_bao_mat: string
  color_bao_mat: string
  id_don_vi: string | null
  ho_so_don_vi: string | null
  noi_luu_tru: string
  trang_thai_huy_vb: string
  luu_tru_noi_bo: string | null
  nguoi_ky: string | null
  ngay_ky: string
  van_ban_chi_doc: string
  ngay_tao: string
  ngay_sua: string
  deleted_at: string | null
  ql_nguoi_dung_id: string
  nguoi_but_phe: string
  ngay_but_phe: string
  noi_dung_but_phe: string
  files: FileDinhKem[]
  files_tchc: FileDinhKem[]
  but_phe: ButPhe
  xu_ly: XuLy
  phan_hoi: PhanHoi[]
  timeline: Timeline[]
  thong_tin_ban_hanh: ThongTinBanHanh
  ngay_giao_xu_ly: string
}

export interface LoaiVanBan {
  id_loai: string | number
  ten_loai: string
  tien_to?: string | null
  hau_to?: string | null
  id_don_vi?: string | number | null
}

export interface DonVi {
  id_don_vi: string | number
  ten_don_vi: string
  ten_viet_tat: string
  ten_don_vi_en: string
  ma_don_vi: string | null
  loai: string
  email: string
}

export interface BaoMat {
  id_bao_mat: string | number
  ten_bao_mat: string
  class_color: string
}

export interface TinhChat {
  id_tinh_chat: string | number
  ten_tinh_chat: string
  class_color: string
}

export interface NguoiDung {
  ql_nguoi_dung_id: number
  ql_nguoi_dung_ho_ten?: string | null
  ql_nguoi_dung_email?: string | null
  ql_nguoi_dung_mat_khau: string
  ql_nguoi_dung_avatar?: string | null
  ql_nguoi_dung_token?: string | null
  ql_nguoi_dung_loai: number // 1: sinh viên, 2: cán bộ
  ql_nguoi_dung_ngay_tao: string // datetime ISO (vd: "2025-11-10T12:00:00")
  ql_nguoi_dung_ngay_cap_nhat: string
  active_flag?: number | null // 1 = active
  created_at: string
  updated_at: string
  ql_nguoi_dung_is_admin?: number | null // 1 = admin
  ql_nguoi_dung_la_lanh_dao?: number | null // 1 = lãnh đạo
  do_uu_tien_lanh_dao?: number | null
  id_don_vi?: number | null
  ql_nguoi_dung_theadid?: number | null
  lan_dang_nhap_cuoi?: string | null
  ql_nguoi_dung_zalo_oa_uid?: string | null
  ql_nguoi_dung_zalo_uid?: string | null
}

export interface HocHamHocVi {
  hrm_hoc_ham_hoc_vi_id: string
  ten_day_du: string
  ten_viet_tat: string
  ghi_chu?: string | null
}

export interface HinhThuc {
  id_hinh_thuc: string | number
  ten_hinh_thuc: string
  ma_hinh_thuc: string
}

export interface ExistingFile {
  id: number
  name: string
  size: number
  url: string
  type?: string
}
export interface sidebarData {
  title: string
  abbre: string
  icon: React.ElementType | any
  path: string | undefined
  children: sidebarData[]
}
