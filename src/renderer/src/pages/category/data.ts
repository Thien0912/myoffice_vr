export interface MockRow {
  [key: string]: any
}

export const baoMatData: MockRow[] = [
  { id_bao_mat: 1, ten_bao_mat: 'Bình thường', class_color: 'base-green' },
  { id_bao_mat: 2, ten_bao_mat: 'Khẩn', class_color: 'base-yellow' },
  { id_bao_mat: 3, ten_bao_mat: 'Mật', class_color: 'base-red' },
  { id_bao_mat: 4, ten_bao_mat: 'Tối mật', class_color: 'base-red' },
  { id_bao_mat: 5, ten_bao_mat: 'Tuyệt mật', class_color: 'base-red' },
]

export const caLamViecData: MockRow[] = [
  { id: 1, ca_lam_viec: 'Hành chính', check_in: '07:30', check_out: '16:30', no_leave_day: 0 },
  { id: 2, ca_lam_viec: 'Sáng', check_in: '06:00', check_out: '14:00', no_leave_day: 0 },
  { id: 3, ca_lam_viec: 'Chiều', check_in: '14:00', check_out: '22:00', no_leave_day: 0 },
  { id: 4, ca_lam_viec: 'Tối', check_in: '22:00', check_out: '06:00', no_leave_day: 1 },
  { id: 5, ca_lam_viec: 'Linh hoạt', check_in: '08:00', check_out: '17:00', no_leave_day: 0 },
]

export const coQuanData: MockRow[] = [
  { id_co_quan: 1, ten_co_quan: 'Bộ Giáo dục và Đào tạo' },
  { id_co_quan: 2, ten_co_quan: 'Bộ Khoa học và Công nghệ' },
  { id_co_quan: 3, ten_co_quan: 'Bộ Tài chính' },
  { id_co_quan: 4, ten_co_quan: 'Bộ Nội vụ' },
  { id_co_quan: 5, ten_co_quan: 'Ủy ban Nhân dân Thành phố Hồ Chí Minh' },
  { id_co_quan: 6, ten_co_quan: 'Sở Giáo dục và Đào tạo TP.HCM' },
]

export const daoTAoData: MockRow[] = [
  {
    id_dao_tao: 1,
    ten_khoa_hoc: 'Kỹ năng lãnh đạo cấp phòng',
    noi_dung: 'Đào tạo kỹ năng lãnh đạo cho cán bộ quản lý cấp phòng ban',
    ngay_bat_dau: '2026-01-15',
    ngay_ket_thuc: '2026-01-30',
    trang_thai: 'Hoan_thanh'
  },
  {
    id_dao_tao: 2,
    ten_khoa_hoc: 'An toàn lao động',
    noi_dung: 'Đào tạo về an toàn lao động trong môi trường làm việc',
    ngay_bat_dau: '2026-03-01',
    ngay_ket_thuc: '2026-03-05',
    trang_thai: 'Hoan_thanh'
  },
  {
    id_dao_tao: 3,
    ten_khoa_hoc: 'Kỹ năng soạn thảo văn bản hành chính',
    noi_dung: 'Hướng dẫn cách soạn thảo văn bản hành chính đúng chuẩn',
    ngay_bat_dau: '2026-05-10',
    ngay_ket_thuc: '2026-05-20',
    trang_thai: 'Dang_dien_ra'
  },
  {
    id_dao_tao: 4,
    ten_khoa_hoc: 'Tin học văn phòng nâng cao',
    noi_dung: 'Đào tạo các kỹ năng Excel, Word, PowerPoint nâng cao cho nhân viên',
    ngay_bat_dau: '2026-06-01',
    ngay_ket_thuc: '2026-06-15',
    trang_thai: 'Dang_dien_ra'
  },
  {
    id_dao_tao: 5,
    ten_khoa_hoc: 'Ngoại ngữ chuyên ngành',
    noi_dung: 'Đào tạo tiếng Anh chuyên ngành cho cán bộ giảng viên',
    ngay_bat_dau: '2026-07-01',
    ngay_ket_thuc: '2026-09-30',
    trang_thai: 'Dang_dien_ra'
  },
]

export const donviData: MockRow[] = [
  {
    id_don_vi: 1,
    ten_don_vi: 'Phòng Tổ chức - Hành chính',
    ten_viet_tat: 'P.TCHC',
    loai: 'PHONG',
    email: 'tchc@university.edu.vn',
    nguoi_co_quyen_van_thu: []
  },
  {
    id_don_vi: 2,
    ten_don_vi: 'Phòng Đào tạo',
    ten_viet_tat: 'P.ĐT',
    loai: 'PHONG',
    email: 'daotao@university.edu.vn',
    nguoi_co_quyen_van_thu: []
  },
  {
    id_don_vi: 3,
    ten_don_vi: 'Khoa Công nghệ Thông tin',
    ten_viet_tat: 'K.CNTT',
    loai: 'KHOA_BOMON',
    email: 'cntt@university.edu.vn',
    nguoi_co_quyen_van_thu: []
  },
  {
    id_don_vi: 4,
    ten_don_vi: 'Ban Kế hoạch - Tài chính',
    ten_viet_tat: 'B.KHTC',
    loai: 'BAN',
    email: 'khtc@university.edu.vn',
    nguoi_co_quyen_van_thu: []
  },
  {
    id_don_vi: 5,
    ten_don_vi: 'Trung tâm Ngoại ngữ',
    ten_viet_tat: 'TTNN',
    loai: 'TRUNG_TAM',
    email: 'ngoaingu@university.edu.vn',
    nguoi_co_quyen_van_thu: []
  },
  {
    id_don_vi: 6,
    ten_don_vi: 'Trung tâm Tin học',
    ten_viet_tat: 'TTH',
    loai: 'TRUNG_TAM',
    email: 'tinhoc@university.edu.vn',
    nguoi_co_quyen_van_thu: []
  },
  {
    id_don_vi: 7,
    ten_don_vi: 'Viện Nghiên cứu Khoa học',
    ten_viet_tat: 'V.NCKH',
    loai: 'VIEN',
    email: 'nckh@university.edu.vn',
    nguoi_co_quyen_van_thu: []
  },
  {
    id_don_vi: 8,
    ten_don_vi: 'Khoa Điện - Điện tử',
    ten_viet_tat: 'K.ĐĐT',
    loai: 'KHOA_BOMON',
    email: 'ddt@university.edu.vn',
    nguoi_co_quyen_van_thu: []
  },
]

export const phongBanData: MockRow[] = [
  { id: 1, ten_phong_ban: 'Phòng Tổ chức - Hành chính', ten_viet_tat: 'P.TCHC', ten_tieng_anh: 'Department of Organization and Administration', ma_don_vi: 'TCHC', email: 'tchc@university.edu.vn' },
  { id: 2, ten_phong_ban: 'Phòng Đào tạo', ten_viet_tat: 'P.ĐT', ten_tieng_anh: 'Department of Training', ma_don_vi: 'DT', email: 'daotao@university.edu.vn' },
  { id: 3, ten_phong_ban: 'Phòng Công tác Sinh viên', ten_viet_tat: 'P.CTSV', ten_tieng_anh: 'Department of Student Affairs', ma_don_vi: 'CTSV', email: 'ctsv@university.edu.vn' },
  { id: 4, ten_phong_ban: 'Phòng Quản trị - Thiết bị', ten_viet_tat: 'P.QTTB', ten_tieng_anh: 'Department of Administration and Facilities', ma_don_vi: 'QTTB', email: 'qttb@university.edu.vn' },
  { id: 5, ten_phong_ban: 'Phòng Kế hoạch - Tài chính', ten_viet_tat: 'P.KHTC', ten_tieng_anh: 'Department of Planning and Finance', ma_don_vi: 'KHTC', email: 'khtc@university.edu.vn' },
]

export const trungTamData: MockRow[] = [
  { id: 1, ten_trung_tam: 'Trung tâm Ngoại ngữ', ten_viet_tat: 'TTNN', ten_tieng_anh: 'Foreign Language Center', email: 'ngoaingu@university.edu.vn' },
  { id: 2, ten_trung_tam: 'Trung tâm Tin học', ten_viet_tat: 'TTH', ten_tieng_anh: 'Computer Center', email: 'tinhoc@university.edu.vn' },
  { id: 3, ten_trung_tam: 'Trung tâm Hỗ trợ Khởi nghiệp', ten_viet_tat: 'TTHTKN', ten_tieng_anh: 'Startup Support Center', email: 'khoinghiep@university.edu.vn' },
  { id: 4, ten_trung_tam: 'Trung tâm Đào tạo Từ xa', ten_viet_tat: 'TTĐTTX', ten_tieng_anh: 'Distance Learning Center', email: 'daotaotuxa@university.edu.vn' },
]

export const truongData: MockRow[] = [
  { id_truong: 1, ma_truong: 'DHSPKT', ten_truong: 'Trường Đại học Sư phạm Kỹ thuật' },
  { id_truong: 2, ma_truong: 'DHBK', ten_truong: 'Trường Đại học Bách Khoa' },
  { id_truong: 3, ma_truong: 'DHKHXHNV', ten_truong: 'Trường Đại học Khoa học Xã hội và Nhân văn' },
]

export const khoaData: MockRow[] = [
  { id_khoa: 1, id_truong: 1, ten_khoa: 'Khoa Công nghệ Thông tin' },
  { id_khoa: 2, id_truong: 1, ten_khoa: 'Khoa Điện - Điện tử' },
  { id_khoa: 3, id_truong: 1, ten_khoa: 'Khoa Cơ khí Chế tạo máy' },
  { id_khoa: 4, id_truong: 1, ten_khoa: 'Khoa Xây dựng' },
  { id_khoa: 5, id_truong: 2, ten_khoa: 'Khoa Khoa học và Kỹ thuật Máy tính' },
  { id_khoa: 6, id_truong: 2, ten_khoa: 'Khoa Kỹ thuật Hóa học' },
  { id_khoa: 7, id_truong: 3, ten_khoa: 'Khoa Văn học và Ngôn ngữ' },
  { id_khoa: 8, id_truong: 3, ten_khoa: 'Khoa Báo chí và Truyền thông' },
  { id_khoa: 9, id_truong: null, ten_khoa: 'Khoa Giáo dục Thể chất' },
  { id_khoa: 10, id_truong: null, ten_khoa: 'Khoa Lý luận Chính trị' },
]

export const hinhThucData: MockRow[] = [
  { id_hinh_thuc: 1, ten_hinh_thuc: 'Công văn' },
  { id_hinh_thuc: 2, ten_hinh_thuc: 'Thông báo' },
  { id_hinh_thuc: 3, ten_hinh_thuc: 'Quyết định' },
  { id_hinh_thuc: 4, ten_hinh_thuc: 'Báo cáo' },
  { id_hinh_thuc: 5, ten_hinh_thuc: 'Tờ trình' },
  { id_hinh_thuc: 6, ten_hinh_thuc: 'Kế hoạch' },
]

export const loaiNghiPhepData: MockRow[] = [
  { id_loai_phep: 1, ten_loai_phep: 'Nghỉ phép năm' },
  { id_loai_phep: 2, ten_loai_phep: 'Nghỉ ốm' },
  { id_loai_phep: 3, ten_loai_phep: 'Nghỉ thai sản' },
  { id_loai_phep: 4, ten_loai_phep: 'Nghỉ không lương' },
  { id_loai_phep: 5, ten_loai_phep: 'Nghỉ việc riêng' },
  { id_loai_phep: 6, ten_loai_phep: 'Nghỉ kết hôn' },
  { id_loai_phep: 7, ten_loai_phep: 'Nghỉ tang' },
]

export const loaiVanBanData: MockRow[] = [
  { id_loai: 1, ten_loai: 'Công văn đến', tien_to: 'CV', hau_to: '/ĐH', id_don_vi: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', thuoc_nhom: 'BGH' },
  { id_loai: 2, ten_loai: 'Công văn đi', tien_to: 'CVĐ', hau_to: '/ĐH', id_don_vi: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', thuoc_nhom: 'BGH' },
  { id_loai: 3, ten_loai: 'Thông báo nội bộ', tien_to: 'TB', hau_to: '', id_don_vi: 2, ten_don_vi: 'Phòng Đào tạo', thuoc_nhom: 'DONVI' },
  { id_loai: 4, ten_loai: 'Quyết định khen thưởng', tien_to: 'QĐKT', hau_to: '', id_don_vi: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', thuoc_nhom: 'HDT' },
  { id_loai: 5, ten_loai: 'Quyết định kỷ luật', tien_to: 'QĐKL', hau_to: '', id_don_vi: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', thuoc_nhom: 'HDT' },
  { id_loai: 6, ten_loai: 'Tờ trình', tien_to: 'TTr', hau_to: '', id_don_vi: 3, ten_don_vi: 'Khoa Công nghệ Thông tin', thuoc_nhom: 'CTHDT' },
  { id_loai: 7, ten_loai: 'Báo cáo tổng kết', tien_to: 'BC', hau_to: '/ĐH', id_don_vi: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', thuoc_nhom: 'BGH' },
]

export const tinhChatData: MockRow[] = [
  { id_tinh_chat: 1, ten_tinh_chat: 'Khẩn', class_color: 'base-green' },
  { id_tinh_chat: 2, ten_tinh_chat: 'Thường', class_color: 'base-yellow' },
  { id_tinh_chat: 3, ten_tinh_chat: 'Hỏa tốc', class_color: 'base-yellow' },
  { id_tinh_chat: 4, ten_tinh_chat: 'Mật', class_color: 'base-red' },
  { id_tinh_chat: 5, ten_tinh_chat: 'Tham khảo', class_color: 'base-red' },
]

export const viTriCongViecData: MockRow[] = [
  { id_vi_tri_cong_viec: 1, ten_cong_viec: 'Giảng viên', ten_cong_viec_en: 'Lecturer' },
  { id_vi_tri_cong_viec: 2, ten_cong_viec: 'Trưởng phòng', ten_cong_viec_en: 'Head of Department' },
  { id_vi_tri_cong_viec: 3, ten_cong_viec: 'Phó phòng', ten_cong_viec_en: 'Deputy Head' },
  { id_vi_tri_cong_viec: 4, ten_cong_viec: 'Chuyên viên', ten_cong_viec_en: 'Specialist' },
  { id_vi_tri_cong_viec: 5, ten_cong_viec: 'Kỹ thuật viên', ten_cong_viec_en: 'Technician' },
  { id_vi_tri_cong_viec: 6, ten_cong_viec: 'Nhân viên văn thư', ten_cong_viec_en: 'Clerk' },
  { id_vi_tri_cong_viec: 7, ten_cong_viec: 'Hiệu trưởng', ten_cong_viec_en: 'Rector' },
  { id_vi_tri_cong_viec: 8, ten_cong_viec: 'Phó hiệu trưởng', ten_cong_viec_en: 'Vice Rector' },
]

export const ngayLeData: MockRow[] = [
  { id_ngay_le: 1, ten_ngay_le: 'Tết Dương lịch', batdau: '2026-01-01', ketthuc: '2026-01-01', mota: 'Nghỉ Tết Dương lịch 1 ngày', ngay_am: null, la_ngay_le_am: 0, duoc_nghi: 1, la_nghi_buoi: 0 },
  { id_ngay_le: 2, ten_ngay_le: 'Tết Nguyên đán', batdau: '2026-02-15', ketthuc: '2026-02-21', mota: 'Nghỉ Tết Nguyên đán 7 ngày', ngay_am: '29/12 - 5/1 ÂL', la_ngay_le_am: 1, duoc_nghi: 1, la_nghi_buoi: 0 },
  { id_ngay_le: 3, ten_ngay_le: 'Giỗ tổ Hùng Vương', batdau: '2026-04-07', ketthuc: '2026-04-07', mota: 'Nghỉ Giỗ tổ Hùng Vương 1 ngày', ngay_am: '10/3 ÂL', la_ngay_le_am: 1, duoc_nghi: 1, la_nghi_buoi: 0 },
  { id_ngay_le: 4, ten_ngay_le: 'Ngày Giải phóng miền Nam', batdau: '2026-04-30', ketthuc: '2026-04-30', mota: 'Nghỉ lễ 30/4', ngay_am: null, la_ngay_le_am: 0, duoc_nghi: 1, la_nghi_buoi: 0 },
  { id_ngay_le: 5, ten_ngay_le: 'Ngày Quốc tế Lao động', batdau: '2026-05-01', ketthuc: '2026-05-01', mota: 'Nghỉ lễ 1/5', ngay_am: null, la_ngay_le_am: 0, duoc_nghi: 1, la_nghi_buoi: 0 },
  { id_ngay_le: 6, ten_ngay_le: 'Quốc khánh', batdau: '2026-09-02', ketthuc: '2026-09-03', mota: 'Nghỉ Quốc khánh 2 ngày', ngay_am: null, la_ngay_le_am: 0, duoc_nghi: 1, la_nghi_buoi: 0 },
]
