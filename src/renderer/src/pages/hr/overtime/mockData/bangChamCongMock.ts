import { ChamCongRecord } from '../types/BangChamCongTypes'

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const diffHours = (from: string, to: string): number => {
  const [fh, fm] = from.split(':').map(Number)
  const [th, tm] = to.split(':').map(Number)
  return Math.round(((th * 60 + tm) - (fh * 60 + fm)) / 60 * 10) / 10
}

/** minutes → hours, 1 decimal — same rounding as diffHours */
const minsToHours = (mins: number): number =>
  Math.round(mins / 60 * 10) / 10

// no_ot = tổng phút trễ/sớm → giờ nợ OT
const noOT = (diTre: number, veSom: number): number =>
  minsToHours(diTre + veSom)


// ---------------------------------------------------------------------------
// Mock: realistic multi-shift attendance data (April 2026)
// 1 row = 1 employee × 1 day, with 0..3 OT frames
// ---------------------------------------------------------------------------
export const BANG_CHAM_CONG_MOCK: ChamCongRecord[] = [
  // ─── 2026-04-07 (Monday) ─────────────────────────────────────────────────

  // NV001: Normal day + 1 OT frame after work
  {
    id: 1,
    ma_nhan_vien: 'NV001',
    ho_va_ten: 'Nguyễn Văn An',
    ten_chuc_vu: 'Quản lý dự án',
    ten_don_vi: 'Phòng Công nghệ thông tin',
    id_don_vi: 'cntt',
    ngay_cham_cong: '2026-04-07',
    gio_vao: '07:52',
    gio_ra: '17:10',
    tong_gio_lam: 8.5,
    gio_di_tre: 0,
    gio_ve_som: 0,
    no_ot: noOT(0, 0),
    ot_frames: [
      { gio_tu: '17:30', gio_den: '20:30', tong_gio: diffHours('17:30', '20:30') }
    ],
    tong_gio_ot: diffHours('17:30', '20:30')
  },

  // NV002: Late + 2 OT frames (morning + evening)
  {
    id: 2,
    ma_nhan_vien: 'NV002',
    ho_va_ten: 'Trần Thị Bình',
    ten_don_vi: 'Phòng Công nghệ thông tin',
    id_don_vi: 'cntt',
    ngay_cham_cong: '2026-04-07',
    gio_vao: '08:22',
    gio_ra: '21:00',
    tong_gio_lam: 11.0,
    gio_di_tre: 22,
    gio_ve_som: 0,
    no_ot: noOT(22, 0),
    ot_frames: [
      { gio_tu: '12:00', gio_den: '13:00', tong_gio: 1.0 },   // Lunch OT
      { gio_tu: '17:30', gio_den: '21:00', tong_gio: diffHours('17:30', '21:00') }   // Evening OT
    ],
    tong_gio_ot: 1.0 + diffHours('17:30', '21:00')
  },

  // NV003: Left early, no OT
  {
    id: 3,
    ma_nhan_vien: 'NV003',
    ho_va_ten: 'Lê Minh Cường',
    ten_don_vi: 'Phòng Tổ chức - Hành chính',
    id_don_vi: 'tchc',
    ngay_cham_cong: '2026-04-07',
    gio_vao: '08:00',
    gio_ra: '16:35',
    tong_gio_lam: 7.5,
    gio_di_tre: 0,
    gio_ve_som: 25,
    no_ot: noOT(0, 25),
    ot_frames: [],
    tong_gio_ot: 0
  },

  // ─── 2026-04-08 (Tuesday) ────────────────────────────────────────────────

  // NV004: Late 32 min + 3 OT frames (morning, break, evening) → nợ OT
  {
    id: 4,
    ma_nhan_vien: 'NV004',
    ho_va_ten: 'Phạm Thị Dung',
    ten_don_vi: 'Phòng Kế hoạch - Tài chính',
    id_don_vi: 'khtc',
    ngay_cham_cong: '2026-04-08',
    gio_vao: '08:32',
    gio_ra: '21:30',
    tong_gio_lam: 11.0,
    gio_di_tre: 32,
    gio_ve_som: 0,
    no_ot: noOT(32, 0),
    ot_frames: [
      { gio_tu: '11:30', gio_den: '13:00', tong_gio: diffHours('11:30', '13:00') }, // Lunch OT
      { gio_tu: '17:00', gio_den: '19:00', tong_gio: 2.0 },                          // Evening OT 1
      { gio_tu: '20:00', gio_den: '21:30', tong_gio: 1.5 }                           // Evening OT 2
    ],
    tong_gio_ot: diffHours('11:30', '13:00') + 2.0 + 1.5
  },

  // NV005: Perfect attendance + 1 big OT  
  {
    id: 5,
    ma_nhan_vien: 'NV005',
    ho_va_ten: 'Hoàng Văn Em',
    ten_don_vi: 'Khoa Kinh tế',
    id_don_vi: 'kkt',
    ngay_cham_cong: '2026-04-08',
    gio_vao: '07:58',
    gio_ra: '17:05',
    tong_gio_lam: 8.2,
    gio_di_tre: 0,
    gio_ve_som: 0,
    no_ot: noOT(0, 0),
    ot_frames: [
      { gio_tu: '17:30', gio_den: '21:30', tong_gio: diffHours('17:30', '21:30') }
    ],
    tong_gio_ot: diffHours('17:30', '21:30')
  },

  // NV006: Very late + no OT + nợ OT
  {
    id: 6,
    ma_nhan_vien: 'NV006',
    ho_va_ten: 'Vũ Thị Hương',
    ten_don_vi: 'Phòng Khoa học Công nghệ',
    id_don_vi: 'khcn',
    ngay_cham_cong: '2026-04-08',
    gio_vao: '09:05',
    gio_ra: '17:00',
    tong_gio_lam: 7.0,
    gio_di_tre: 65,
    gio_ve_som: 0,
    no_ot: noOT(65, 0),
    ot_frames: [],
    tong_gio_ot: 0
  },

  // ─── 2026-04-09 (Wednesday) ──────────────────────────────────────────────

  // NV007: Normal, no OT, no issues
  {
    id: 7,
    ma_nhan_vien: 'NV007',
    ho_va_ten: 'Đỗ Quốc Bảo',
    ten_don_vi: 'Phòng Kế hoạch - Tài chính',
    id_don_vi: 'khtc',
    ngay_cham_cong: '2026-04-09',
    gio_vao: '08:00',
    gio_ra: '17:00',
    tong_gio_lam: 8.0,
    gio_di_tre: 0,
    gio_ve_som: 0,
    no_ot: noOT(0, 0),
    ot_frames: [],
    tong_gio_ot: 0
  },

  // NV008: Late 15 + Early 15 + 2 OT frames + nợ OT
  {
    id: 8,
    ma_nhan_vien: 'NV008',
    ho_va_ten: 'Nguyễn Thanh Sơn',
    ten_don_vi: 'Phòng Công nghệ thông tin',
    id_don_vi: 'cntt',
    ngay_cham_cong: '2026-04-09',
    gio_vao: '08:15',
    gio_ra: '20:00',
    tong_gio_lam: 10.0,
    gio_di_tre: 15,
    gio_ve_som: 15,
    no_ot: noOT(15, 15),
    ot_frames: [
      { gio_tu: '12:30', gio_den: '13:30', tong_gio: 1.0 }, // Lunch
      { gio_tu: '17:30', gio_den: '20:00', tong_gio: diffHours('17:30', '20:00') }
    ],
    tong_gio_ot: 1.0 + diffHours('17:30', '20:00')
  },

  // NV009: Normal + 1 OT
  {
    id: 9,
    ma_nhan_vien: 'NV009',
    ho_va_ten: 'Lưu Thị Kim Ngân',
    ten_don_vi: 'Phòng Tổ chức - Hành chính',
    id_don_vi: 'tchc',
    ngay_cham_cong: '2026-04-09',
    gio_vao: '08:00',
    gio_ra: '17:00',
    tong_gio_lam: 8.0,
    gio_di_tre: 0,
    gio_ve_som: 0,
    no_ot: noOT(0, 0),
    ot_frames: [
      { gio_tu: '17:30', gio_den: '19:30', tong_gio: 2.0 }
    ],
    tong_gio_ot: 2.0
  },

  // ─── 2026-04-10 (Thursday) ───────────────────────────────────────────────

  // NV010: Late 45 + Early 30 + no OT + heavy nợ OT
  {
    id: 10,
    ma_nhan_vien: 'NV010',
    ho_va_ten: 'Trần Minh Khoa',
    ten_don_vi: 'Khoa Kinh tế',
    id_don_vi: 'kkt',
    ngay_cham_cong: '2026-04-10',
    gio_vao: '08:45',
    gio_ra: '16:30',
    tong_gio_lam: 6.75,
    gio_di_tre: 45,
    gio_ve_som: 30,
    no_ot: noOT(45, 30),
    ot_frames: [],
    tong_gio_ot: 0
  },

  // NV011: Perfect + no OT
  {
    id: 11,
    ma_nhan_vien: 'NV011',
    ho_va_ten: 'Phan Thị Lan',
    ten_don_vi: 'Phòng Khoa học Công nghệ',
    id_don_vi: 'khcn',
    ngay_cham_cong: '2026-04-10',
    gio_vao: '07:55',
    gio_ra: '17:10',
    tong_gio_lam: 8.25,
    gio_di_tre: 0,
    gio_ve_som: 0,
    no_ot: noOT(0, 0),
    ot_frames: [],
    tong_gio_ot: 0
  },

  // NV012: Perfect + 2 OT frames (ca sáng + ca tối)
  {
    id: 12,
    ma_nhan_vien: 'NV012',
    ho_va_ten: 'Bùi Đức Hải',
    ten_don_vi: 'Phòng Công nghệ thông tin',
    id_don_vi: 'cntt',
    ngay_cham_cong: '2026-04-10',
    gio_vao: '08:00',
    gio_ra: '22:00',
    tong_gio_lam: 13.0,
    gio_di_tre: 0,
    gio_ve_som: 0,
    no_ot: noOT(0, 0),
    ot_frames: [
      { gio_tu: '12:00', gio_den: '13:00', tong_gio: 1.0 },                          // Ca trưa
      { gio_tu: '17:30', gio_den: '22:00', tong_gio: diffHours('17:30', '22:00') }   // Ca tối
    ],
    tong_gio_ot: 1.0 + diffHours('17:30', '22:00')
  }
]
