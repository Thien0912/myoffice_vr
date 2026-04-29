export interface LeaveType {
  id_loai_phep: number
  ma_loai_phep: string
  ten_loai_phep: string
  ghi_chu: string | null
  so_ngay_mac_dinh: number | null
  co_tinh_luong: number // 1: có, 0: không
}

export interface LeaveRequest {
  id_nghi_phep: number
  uuid_nghi_phep?: string
  id_nhan_vien: number
  id_loai_phep: number
  loai_nghi: 'Binh_thuong' | 'Dot_xuat'
  trang_thai_cap_mot: 'Cho_duyet' | 'Da_duyet' | 'Tu_choi'
  nguoi_duyet_cap_mot_id: number | null
  trang_thai_cap_hai: 'Cho_duyet' | 'Da_duyet' | 'Tu_choi'
  nguoi_duyet_cap_hai_id: number | null
  ly_do_nghi: string
  minh_chung: string | null
  minh_chung_ext?: string
  nguoi_duyet_cap_mot_ho_ten?: string
  nguoi_duyet_cap_hai_ho_ten?: string
  nguoi_duyet_ho_cap_mot_ho_ten?: string
  nguoi_duyet_ho_cap_hai_ho_ten?: string
  minh_chung_duyet_ho_cap_mot?: string
  minh_chung_duyet_ho_cap_hai?: string
  created_at: string
}

export interface LeaveDetail {
  id_so_ngay: number
  id_nghi_phep: number
  ngay_nghi: string // YYYY-MM-DD
  buoi_nghi: 'Sang' | 'Chieu'
  so_ngay_nghi: number
}

export interface LeaveApprover {
  id_nghi_phep_nguoi_duyet: number
  id_nghi_phep: number
  cap_duyet: number // 1 | 2
  id_nguoi_duyet: number
  da_duyet: number // 0: chưa, 1: đã
  thoi_gian_duyet: string | null
}

export const LEAVE_STATUS_CONFIG = {
  Cho_duyet: {
    label: 'Chờ duyệt',
    color: 'yellow',
    bg: 'bg-yellow-50/50 dark:bg-yellow-900/20',
    text: 'text-yellow-600 dark:text-yellow-500',
    border: 'border-yellow-200 dark:border-yellow-800/50',
    dot: 'bg-yellow-500'
  },
  Da_duyet: {
    label: 'Đã duyệt',
    color: 'green',
    bg: 'bg-emerald-50/50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    icon: 'check'
  },
  Tu_choi: {
    label: 'Từ chối',
    color: 'red',
    bg: 'bg-rose-50/50 dark:bg-rose-900/20',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800/50',
    icon: 'x'
  }
} as const

export const mockLeaveTypes: LeaveType[] = [
  {
    id_loai_phep: 1,
    ma_loai_phep: 'PHEP_NAM',
    ten_loai_phep: 'Nghỉ phép năm',
    ghi_chu: 'Nghỉ phép thường niên theo quy định',
    so_ngay_mac_dinh: 12,
    co_tinh_luong: 1
  },
  {
    id_loai_phep: 2,
    ma_loai_phep: 'NGHI_OM',
    ten_loai_phep: 'Nghỉ ốm',
    ghi_chu: 'Nghỉ do ốm đau, có giấy bác sĩ',
    so_ngay_mac_dinh: null,
    co_tinh_luong: 1
  },
  {
    id_loai_phep: 3,
    ma_loai_phep: 'VIEC_RIENG',
    ten_loai_phep: 'Nghỉ việc riêng',
    ghi_chu: 'Nghỉ đám cưới, đám tang...',
    so_ngay_mac_dinh: 3,
    co_tinh_luong: 1
  },
  {
    id_loai_phep: 4,
    ma_loai_phep: 'KHONG_LUONG',
    ten_loai_phep: 'Nghỉ không lương',
    ghi_chu: 'Nghỉ việc riêng không hưởng lương',
    so_ngay_mac_dinh: null,
    co_tinh_luong: 0
  }
]

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id_nghi_phep: 101,
    id_nhan_vien: 1,
    id_loai_phep: 1,
    loai_nghi: 'Binh_thuong',
    trang_thai_cap_mot: 'Da_duyet',
    nguoi_duyet_cap_mot_id: 10,
    trang_thai_cap_hai: 'Da_duyet',
    nguoi_duyet_cap_hai_id: 11,
    ly_do_nghi: 'Đi du lịch cùng gia đình',
    minh_chung: null,
    created_at: '2023-10-01 08:00:00'
  },
  {
    id_nghi_phep: 102,
    id_nhan_vien: 2,
    id_loai_phep: 2,
    loai_nghi: 'Dot_xuat',
    trang_thai_cap_mot: 'Cho_duyet',
    nguoi_duyet_cap_mot_id: 10,
    trang_thai_cap_hai: 'Cho_duyet',
    nguoi_duyet_cap_hai_id: 11,
    ly_do_nghi: 'Sốt cao, đau đầu',
    minh_chung: 'giay_kham_benh.jpg',
    created_at: '2023-10-05 09:30:00'
  },
  {
    id_nghi_phep: 103,
    id_nhan_vien: 1,
    id_loai_phep: 3,
    loai_nghi: 'Binh_thuong',
    trang_thai_cap_mot: 'Da_duyet',
    nguoi_duyet_cap_mot_id: 10,
    trang_thai_cap_hai: 'Cho_duyet',
    nguoi_duyet_cap_hai_id: 11,
    ly_do_nghi: 'Đám cưới em gái',
    minh_chung: null,
    created_at: '2023-10-10 14:00:00'
  },
  {
    id_nghi_phep: 104,
    id_nhan_vien: 3,
    id_loai_phep: 1,
    loai_nghi: 'Binh_thuong',
    trang_thai_cap_mot: 'Tu_choi',
    nguoi_duyet_cap_mot_id: 10,
    trang_thai_cap_hai: 'Cho_duyet',
    nguoi_duyet_cap_hai_id: null,
    ly_do_nghi: 'Nghỉ xả hơi',
    minh_chung: null,
    created_at: '2023-10-12 10:00:00'
  },
  {
    id_nghi_phep: 105,
    id_nhan_vien: 4,
    id_loai_phep: 1,
    loai_nghi: 'Binh_thuong',
    trang_thai_cap_mot: 'Cho_duyet',
    nguoi_duyet_cap_mot_id: 10,
    trang_thai_cap_hai: 'Cho_duyet',
    nguoi_duyet_cap_hai_id: 11,
    ly_do_nghi: 'Về quê có việc',
    minh_chung: null,
    created_at: '2023-10-15 08:30:00'
  },
  ...Array.from({ length: 15 }, (_, i) => ({
    id_nghi_phep: 106 + i,
    id_nhan_vien: Math.floor(Math.random() * 10) + 1,
    id_loai_phep: Math.floor(Math.random() * 4) + 1,
    loai_nghi: (Math.random() > 0.3 ? 'Binh_thuong' : 'Dot_xuat') as 'Binh_thuong' | 'Dot_xuat',
    trang_thai_cap_mot: ['Cho_duyet', 'Da_duyet', 'Tu_choi'][Math.floor(Math.random() * 3)] as any,
    nguoi_duyet_cap_mot_id: 10,
    trang_thai_cap_hai: ['Cho_duyet', 'Da_duyet', 'Tu_choi'][Math.floor(Math.random() * 3)] as any,
    nguoi_duyet_cap_hai_id: 11,
    ly_do_nghi: `Lý do nghỉ phép số ${i + 1}`,
    minh_chung: Math.random() > 0.8 ? 'minh_chung.jpg' : null,
    created_at: `2023-10-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} 08:00:00`
  }))
]

export const mockLeaveDetails: LeaveDetail[] = [
  {
    id_so_ngay: 1,
    id_nghi_phep: 101,
    ngay_nghi: '2023-10-20',
    buoi_nghi: 'Sang',
    so_ngay_nghi: 0.5
  },
  {
    id_so_ngay: 2,
    id_nghi_phep: 101,
    ngay_nghi: '2023-10-20',
    buoi_nghi: 'Chieu',
    so_ngay_nghi: 0.5
  },
  {
    id_so_ngay: 3,
    id_nghi_phep: 102,
    ngay_nghi: '2023-10-06',
    buoi_nghi: 'Sang',
    so_ngay_nghi: 0.5
  },
  {
    id_so_ngay: 4,
    id_nghi_phep: 103,
    ngay_nghi: '2023-10-25',
    buoi_nghi: 'Sang',
    so_ngay_nghi: 0.5
  },
  {
    id_so_ngay: 5,
    id_nghi_phep: 103,
    ngay_nghi: '2023-10-25',
    buoi_nghi: 'Chieu',
    so_ngay_nghi: 0.5
  }
]

export const mockApprovers: LeaveApprover[] = [
  {
    id_nghi_phep_nguoi_duyet: 1,
    id_nghi_phep: 101,
    cap_duyet: 1,
    id_nguoi_duyet: 10,
    da_duyet: 1,
    thoi_gian_duyet: '2023-10-02 09:00:00'
  },
  {
    id_nghi_phep_nguoi_duyet: 2,
    id_nghi_phep: 101,
    cap_duyet: 2,
    id_nguoi_duyet: 11,
    da_duyet: 1,
    thoi_gian_duyet: '2023-10-02 10:00:00'
  },
  {
    id_nghi_phep_nguoi_duyet: 3,
    id_nghi_phep: 102,
    cap_duyet: 1,
    id_nguoi_duyet: 10,
    da_duyet: 0,
    thoi_gian_duyet: null
  },
  {
    id_nghi_phep_nguoi_duyet: 4,
    id_nghi_phep: 103,
    cap_duyet: 1,
    id_nguoi_duyet: 10,
    da_duyet: 1,
    thoi_gian_duyet: '2023-10-11 08:00:00'
  },
  {
    id_nghi_phep_nguoi_duyet: 5,
    id_nghi_phep: 103,
    cap_duyet: 2,
    id_nguoi_duyet: 11,
    da_duyet: 0,
    thoi_gian_duyet: null
  }
]
