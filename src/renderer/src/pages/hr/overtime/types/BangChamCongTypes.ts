// OT frame for 1 check-in/check-out pair
export interface OTFrame {
  gio_tu: string   // HH:mm  e.g. "07:30"
  gio_den: string  // HH:mm  e.g. "11:30"
  tong_gio: number // hours  e.g. 4.0
}

// 1 row = 1 employee × 1 day (aggregated from multiple check-in records)
export interface ChamCongRecord {
  id: number
  id_nhan_vien?: number
  ma_nhan_vien: string
  ho_va_ten: string
  ten_chuc_vu?: string
  ten_don_vi: string
  id_don_vi?: string
  ngay_cham_cong: string   // YYYY-MM-DD
  gio_vao: string          // earliest check-in HH:mm
  gio_ra: string           // latest check-out HH:mm
  punch_1?: string | null  // Vào sáng (HH:mm)
  punch_2?: string | null  // Ra trưa (HH:mm)
  punch_3?: string | null  // Vào chiều (HH:mm)
  punch_4?: string | null  // Ra chiều (HH:mm)
  gio_vao_sang_hieu_luc?: string | null  // Thời gian vào sáng hiệu lực (HH:mm)
  gio_ra_sang_hieu_luc?: string | null   // Thời gian ra sáng hiệu lực (HH:mm)
  gio_vao_chieu_hieu_luc?: string | null // Thời gian vào chiều hiệu lực (HH:mm)
  gio_ra_chieu_hieu_luc?: string | null  // Thời gian ra chiều hiệu lực (HH:mm)
  gio_lam_sang: number     // work hours morning shift
  gio_lam_chieu: number    // work hours afternoon shift
  tong_gio_lam: number     // total work hours (all frames summed)
  gio_di_tre: number       // minutes late (based on first check-in)
  gio_ve_som: number       // minutes early (based on last check-out)
  gio_di_tre_sang?: number // minutes late morning shift
  gio_di_tre_chieu?: number // minutes late afternoon shift
  gio_ve_som_sang?: number // minutes early morning shift
  gio_ve_som_chieu?: number // minutes early afternoon shift
  no_ot: number            // OT debt hours
  is_sunday?: boolean      // true nếu là ngày Chủ nhật (tính giờ đơn giản, không chia ca)
  nghi_phep_sang?: boolean // có nghỉ phép sáng không
  nghi_phep_chieu?: boolean // có nghỉ phép chiều không
  trang_thai_cham_cong?: 'day_du' | 'thieu_cham_cong_sang' | 'thieu_cham_cong_chieu' | 'nghi_phep' | 'vang_mat' // Trạng thái chấm công
  // Multiple OT frames per day
  ot_frames: OTFrame[]     // empty array = no OT
  tong_gio_ot: number      // sum of all OT frames
  // Shift info
  ca_lam_viec?: string | null  // Tên ca làm việc (e.g., "Ca hành chính")
  ca_bat_dau_check_in?: string | null  // Khung giờ bắt đầu check-in hợp lệ (e.g., "04:00:00")
  ca_check_in?: string | null  // Giờ check-in chuẩn ca sáng (e.g., "07:30:00")
  ca_ket_thuc_check_in?: string | null  // Giờ kết thúc check-in ca sáng (e.g., "11:30:00")
  ca_bat_dau_check_out?: string | null  // Giờ bắt đầu check-out ca chiều (e.g., "13:00:00")
  ca_check_out?: string | null  // Giờ check-out chuẩn ca chiều (e.g., "17:00:00")
  ca_ket_thuc_check_out?: string | null  // Khung giờ kết thúc check-out hợp lệ (e.g., "23:00:00")
  [key: string]: unknown   // index signature — required by TableHr<T extends Record<string, unknown>>
}

export interface ChamCongFilter {
  dateRange?: { from?: string; to?: string }
  id_don_vi?: string
  don_vi_ids?: string[]
  nhan_vien_ids?: string[]
}

export interface ChamCongStats {
  tong_gio_lam: number
  tong_gio_lam_sang?: number
  tong_gio_lam_chieu?: number
  tong_di_tre: number
  tong_ve_som: number
  tong_no_ot: number
  tong_gio_ot: number
}
