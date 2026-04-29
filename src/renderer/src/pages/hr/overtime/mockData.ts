import { OvertimeRequest } from './types'

export const MOCK_OVERTIME_DATA: OvertimeRequest[] = [
  {
    id_ngoai_gio: 1,
    id_nhan_vien: 1,
    ngay_dang_ky: '2026-03-24',
    gio_bat_dau: '17:30:00',
    gio_ket_thuc: '21:30:00',
    noi_dung: 'Hỗ trợ sự kiện',
    chi_tiet: '',
    so_gio: 4.0,
    trang_thai_tong: 'Cho_duyet',
    cap_duyet_hien_tai: 1,
    tong_so_cap_duyet: 2,
    created_user_id: 1,
    created_at: '2026-03-24T08:00:00Z',
    // Joined
    ma_nhan_vien: 'NV001',
    ho_va_ten: 'Nguyễn Văn An',
    ten_don_vi: 'Phòng Công nghệ thông tin',
    nguoi_duyet: [
      {
        id_ngoai_gio_nguoi_duyet: 1,
        id_ngoai_gio: 1,
        cap_duyet: 1,
        id_nguoi_duyet: 10,
        trang_thai: 'Cho_duyet',
        thoi_gian_duyet: null,
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Trần Văn Đức'
      },
      {
        id_ngoai_gio_nguoi_duyet: 2,
        id_ngoai_gio: 1,
        cap_duyet: 2,
        id_nguoi_duyet: 20,
        trang_thai: 'Cho_duyet',
        thoi_gian_duyet: null,
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Lê Thị Phương'
      }
    ]
  },
  {
    id_ngoai_gio: 2,
    id_nhan_vien: 2,
    ngay_dang_ky: '2026-03-25',
    gio_bat_dau: '18:00:00',
    gio_ket_thuc: '20:00:00',
    noi_dung: 'Bảo trì hệ thống server',
    chi_tiet: '',
    so_gio: 2.0,
    trang_thai_tong: 'Cho_duyet',
    cap_duyet_hien_tai: 2,
    tong_so_cap_duyet: 2,
    created_user_id: 2,
    created_at: '2026-03-25T08:00:00Z',
    ma_nhan_vien: 'NV002',
    ho_va_ten: 'Trần Thị Bình',
    ten_don_vi: 'Phòng Công nghệ thông tin',
    nguoi_duyet: [
      {
        id_ngoai_gio_nguoi_duyet: 3,
        id_ngoai_gio: 2,
        cap_duyet: 1,
        id_nguoi_duyet: 10,
        trang_thai: 'Da_duyet',
        thoi_gian_duyet: '2026-03-25T14:00:00Z',
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Trần Văn Đức'
      },
      {
        id_ngoai_gio_nguoi_duyet: 4,
        id_ngoai_gio: 2,
        cap_duyet: 2,
        id_nguoi_duyet: 20,
        trang_thai: 'Cho_duyet',
        thoi_gian_duyet: null,
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Lê Thị Phương'
      }
    ]
  },
  {
    id_ngoai_gio: 3,
    id_nhan_vien: 3,
    ngay_dang_ky: '2026-03-26',
    gio_bat_dau: '17:00:00',
    gio_ket_thuc: '19:00:00',
    noi_dung: 'Phỏng vấn ứng viên',
    chi_tiet: '',
    so_gio: 2.0,
    trang_thai_tong: 'Da_duyet',
    cap_duyet_hien_tai: 3,
    tong_so_cap_duyet: 2,
    created_user_id: 3,
    created_at: '2026-03-26T08:00:00Z',
    ma_nhan_vien: 'NV003',
    ho_va_ten: 'Lê Minh Cường',
    ten_don_vi: 'Phòng Tổ chức - Hành chính',
    nguoi_duyet: [
      {
        id_ngoai_gio_nguoi_duyet: 5,
        id_ngoai_gio: 3,
        cap_duyet: 1,
        id_nguoi_duyet: 10,
        trang_thai: 'Da_duyet',
        thoi_gian_duyet: '2026-03-26T10:00:00Z',
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Trần Văn Đức'
      },
      {
        id_ngoai_gio_nguoi_duyet: 6,
        id_ngoai_gio: 3,
        cap_duyet: 2,
        id_nguoi_duyet: 20,
        trang_thai: 'Da_duyet',
        thoi_gian_duyet: '2026-03-26T14:00:00Z',
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Lê Thị Phương'
      }
    ]
  },
  {
    id_ngoai_gio: 4,
    id_nhan_vien: 4,
    ngay_dang_ky: '2026-03-27',
    gio_bat_dau: '18:00:00',
    gio_ket_thuc: '21:00:00',
    noi_dung: 'Làm thêm không rõ lý do',
    chi_tiet: '',
    so_gio: 3.0,
    trang_thai_tong: 'Tu_choi',
    cap_duyet_hien_tai: 1,
    tong_so_cap_duyet: 2,
    created_user_id: 4,
    created_at: '2026-03-27T08:00:00Z',
    ma_nhan_vien: 'NV004',
    ho_va_ten: 'Phạm Thị Dung',
    ten_don_vi: 'Phòng Kế hoạch - Tài chính',
    nguoi_duyet: [
      {
        id_ngoai_gio_nguoi_duyet: 7,
        id_ngoai_gio: 4,
        cap_duyet: 1,
        id_nguoi_duyet: 10,
        trang_thai: 'Tu_choi',
        thoi_gian_duyet: '2026-03-27T09:00:00Z',
        ly_do_duyet: 'Không đủ lý do làm ngoài giờ',
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Trần Văn Đức'
      },
      {
        id_ngoai_gio_nguoi_duyet: 8,
        id_ngoai_gio: 4,
        cap_duyet: 2,
        id_nguoi_duyet: 20,
        trang_thai: 'Cho_duyet',
        thoi_gian_duyet: null,
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Lê Thị Phương'
      }
    ]
  },
  {
    id_ngoai_gio: 5,
    id_nhan_vien: 5,
    ngay_dang_ky: '2026-03-20',
    gio_bat_dau: '19:00:00',
    gio_ket_thuc: '22:00:00',
    noi_dung: 'Chuẩn bị báo cáo quý I',
    chi_tiet: '',
    so_gio: 3.0,
    trang_thai_tong: 'Da_duyet',
    cap_duyet_hien_tai: 3,
    tong_so_cap_duyet: 2,
    created_user_id: 5,
    created_at: '2026-03-20T08:00:00Z',
    ma_nhan_vien: 'NV005',
    ho_va_ten: 'Hoàng Văn Em',
    ten_don_vi: 'Khoa Kinh tế',
    nguoi_duyet: [
      {
        id_ngoai_gio_nguoi_duyet: 9,
        id_ngoai_gio: 5,
        cap_duyet: 1,
        id_nguoi_duyet: 10,
        trang_thai: 'Da_duyet',
        thoi_gian_duyet: '2026-03-20T14:00:00Z',
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Trần Văn Đức'
      },
      {
        id_ngoai_gio_nguoi_duyet: 10,
        id_ngoai_gio: 5,
        cap_duyet: 2,
        id_nguoi_duyet: 20,
        trang_thai: 'Da_duyet',
        thoi_gian_duyet: '2026-03-21T09:00:00Z',
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Lê Thị Phương'
      }
    ]
  },
  {
    id_ngoai_gio: 6,
    id_nhan_vien: 6,
    ngay_dang_ky: '2026-03-22',
    gio_bat_dau: '17:30:00',
    gio_ket_thuc: '20:00:00',
    noi_dung: 'Xử lý sự cố mạng nội bộ',
    chi_tiet: '',
    so_gio: 2.5,
    trang_thai_tong: 'Cho_duyet',
    cap_duyet_hien_tai: 1,
    tong_so_cap_duyet: 2,
    created_user_id: 6,
    created_at: '2026-03-22T08:00:00Z',
    ma_nhan_vien: 'NV006',
    ho_va_ten: 'Vũ Thị Hương',
    ten_don_vi: 'Phòng Khoa học Công nghệ',
    nguoi_duyet: [
      {
        id_ngoai_gio_nguoi_duyet: 11,
        id_ngoai_gio: 6,
        cap_duyet: 1,
        id_nguoi_duyet: 10,
        trang_thai: 'Cho_duyet',
        thoi_gian_duyet: null,
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Trần Văn Đức'
      }
    ]
  },
  {
    id_ngoai_gio: 7,
    id_nhan_vien: 7,
    ngay_dang_ky: '2026-03-18',
    gio_bat_dau: '18:00:00',
    gio_ket_thuc: '21:00:00',
    noi_dung: 'Kiểm kê tài sản cuối quý',
    chi_tiet: '',
    so_gio: 3.0,
    trang_thai_tong: 'Da_duyet',
    cap_duyet_hien_tai: 3,
    tong_so_cap_duyet: 2,
    created_user_id: 7,
    created_at: '2026-03-18T08:00:00Z',
    ma_nhan_vien: 'NV007',
    ho_va_ten: 'Đỗ Quốc Bảo',
    ten_don_vi: 'Phòng Kế hoạch - Tài chính',
    nguoi_duyet: [
      {
        id_ngoai_gio_nguoi_duyet: 12,
        id_ngoai_gio: 7,
        cap_duyet: 1,
        id_nguoi_duyet: 10,
        trang_thai: 'Da_duyet',
        thoi_gian_duyet: '2026-03-18T14:00:00Z',
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Trần Văn Đức'
      },
      {
        id_ngoai_gio_nguoi_duyet: 13,
        id_ngoai_gio: 7,
        cap_duyet: 2,
        id_nguoi_duyet: 20,
        trang_thai: 'Da_duyet',
        thoi_gian_duyet: '2026-03-19T09:00:00Z',
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Lê Thị Phương'
      }
    ]
  },
  {
    id_ngoai_gio: 8,
    id_nhan_vien: 8,
    ngay_dang_ky: '2026-03-15',
    gio_bat_dau: '19:00:00',
    gio_ket_thuc: '22:30:00',
    noi_dung: 'Triển khai module mới lên production',
    chi_tiet: '',
    so_gio: 3.5,
    trang_thai_tong: 'Da_duyet',
    cap_duyet_hien_tai: 3,
    tong_so_cap_duyet: 2,
    created_user_id: 8,
    created_at: '2026-03-15T08:00:00Z',
    ma_nhan_vien: 'NV008',
    ho_va_ten: 'Nguyễn Thanh Sơn',
    ten_don_vi: 'Phòng Công nghệ thông tin',
    nguoi_duyet: [
      {
        id_ngoai_gio_nguoi_duyet: 14,
        id_ngoai_gio: 8,
        cap_duyet: 1,
        id_nguoi_duyet: 10,
        trang_thai: 'Da_duyet',
        thoi_gian_duyet: '2026-03-15T14:00:00Z',
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Trần Văn Đức'
      },
      {
        id_ngoai_gio_nguoi_duyet: 15,
        id_ngoai_gio: 8,
        cap_duyet: 2,
        id_nguoi_duyet: 20,
        trang_thai: 'Da_duyet',
        thoi_gian_duyet: '2026-03-16T08:30:00Z',
        ly_do_duyet: null,
        duyet_ho: 0,
        ho_ten_nguoi_duyet: 'Lê Thị Phương'
      }
    ]
  }
]
