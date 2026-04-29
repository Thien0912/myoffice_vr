// =============================================
// Types khớp với bảng hrm_ngoai_gio
// =============================================
export interface OvertimeApprover {
  id_ngoai_gio_nguoi_duyet: number
  id_ngoai_gio: number
  cap_duyet: number
  id_nguoi_duyet: number
  trang_thai: 'Cho_duyet' | 'Da_duyet' | 'Tu_choi' | 'Huy'
  thoi_gian_duyet?: string | null
  ly_do_duyet?: string | null
  duyet_ho: 0 | 1
  id_duyet_ho?: number | null
  created_at?: string
  updated_at?: string
  // Joined fields
  ho_ten_nguoi_duyet?: string
}

export interface DanhSachNguoiDuyet {
  cap_duyet: string
  ql_nguoi_dung_id: string
  ql_nguoi_dung_ho_ten: string
  ql_nguoi_dung_avatar?: string | null
  trang_thai: string
  thoi_gian_duyet?: string | null
}

export interface OvertimeRequest {
  // Core fields - hrm_ngoai_gio
  id_ngoai_gio: number
  id_nhan_vien: number
  ngay_dang_ky: string
  gio_bat_dau: string
  gio_ket_thuc: string
  noi_dung: string | null
  chi_tiet: string | null
  so_gio: number | null
  thoi_gian_bat_dau_cham_cong?: string | null
  thoi_gian_ket_thuc_cham_cong?: string | null
  trang_thai_tong: 'Cho_duyet' | 'Da_duyet' | 'Tu_choi' | 'Huy'
  cap_duyet_hien_tai: number
  tong_so_cap_duyet: number
  so_lan_huy?: number
  created_user_id?: number | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  deleted_user_id?: number | null

  // Joined fields from API (nhân viên)
  ma_nhan_vien?: string
  ho_va_ten?: string
  avatar?: string | null
  ten_chuc_vu?: string
  ten_don_vi?: string

  // Joined approvers
  nguoi_duyet?: OvertimeApprover[]
  danh_sach_nguoi_duyet?: DanhSachNguoiDuyet[]

  tao_ho?: '0' | '1' | 0 | 1
  nguoi_tao_ho_ten?: string
  is_dotxuat?: '0' | '1' | 0 | 1
  ly_do_huy?: string | null
}

export const OVERTIME_STATUS_CONFIG = {
  Cho_duyet: {
    label: 'Chờ duyệt',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500'
  },
  Da_duyet: {
    label: 'Đã duyệt',
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500'
  },
  Tu_choi: {
    label: 'Từ chối',
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500'
  },
  Huy: {
    label: 'Đã hủy',
    text: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-500'
  }
} as const

