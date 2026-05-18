import { Role } from '@renderer/api/admin/rolesAxios'
import { getRoleColorById } from './constants/roleColors'

export interface FakeRole extends Role {
  dotColor: string
  textColor: string
  bgColor: string
  borderColor: string
  colorId?: string
  is_default?: number
}

// ===================== DATA STATE =====================
let fakeRolesData: FakeRole[] = [
  {
    ql_vai_tro_id: '1',
    ql_vai_tro_ten: 'SUPER ADMIN',
    ql_vai_tro_mo_ta: 'Quản trị viên cấp cao, toàn quyền hệ thống',
    ql_vai_tro_ngay_tao: '2024-01-15T08:30:00Z',
    created_at: '15/01/2024 08:30',
    total_members: 2,
    active_flag: 1,
    colorId: 'rose',
    dotColor: 'bg-rose-500',
    textColor: 'text-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'bg-rose-500',
    is_default: 1
  },
  {
    ql_vai_tro_id: '2',
    ql_vai_tro_ten: 'VĂN THƯ TỔ CHỨC - HÀNH CHÍNH',
    ql_vai_tro_mo_ta: 'Văn thư phòng Tổ chức - Hành chính',
    ql_vai_tro_ngay_tao: '2024-02-10T09:00:00Z',
    created_at: '10/02/2024 09:00',
    total_members: 3,
    active_flag: 1,
    colorId: 'blue',
    dotColor: 'bg-blue-500',
    textColor: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'bg-blue-500',
    is_default: 1
  },
  {
    ql_vai_tro_id: '3',
    ql_vai_tro_ten: 'VĂN THƯ ĐƠN VỊ',
    ql_vai_tro_mo_ta: 'Văn thư các đơn vị trong trường',
    ql_vai_tro_ngay_tao: '2024-03-05T10:15:00Z',
    created_at: '05/03/2024 10:15',
    total_members: 2,
    active_flag: 1,
    colorId: 'emerald',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'bg-emerald-500',
    is_default: 1
  },
  {
    ql_vai_tro_id: '4',
    ql_vai_tro_ten: 'LÃNH ĐẠO ĐƠN VỊ',
    ql_vai_tro_mo_ta: 'Lãnh đạo các đơn vị, khoa, phòng ban',
    ql_vai_tro_ngay_tao: '2024-04-20T11:00:00Z',
    created_at: '20/04/2024 11:00',
    total_members: 2,
    active_flag: 1,
    colorId: 'amber',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'bg-amber-500',
    is_default: 1
  },
  {
    ql_vai_tro_id: '5',
    ql_vai_tro_ten: 'LÃNH ĐẠO TỔ CHỨC - HÀNH CHÍNH',
    ql_vai_tro_mo_ta: 'Lãnh đạo phòng Tổ chức - Hành chính',
    ql_vai_tro_ngay_tao: '2024-05-12T13:45:00Z',
    created_at: '12/05/2024 13:45',
    total_members: 1,
    active_flag: 1,
    colorId: 'violet',
    dotColor: 'bg-violet-500',
    textColor: 'text-violet-500',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'bg-violet-500',
    is_default: 1
  },
  {
    ql_vai_tro_id: '6',
    ql_vai_tro_ten: 'PHÒNG CÔNG TÁC CHÍNH TRỊ & QUẢN LÝ SINH VIÊN',
    ql_vai_tro_mo_ta: 'Phòng Công tác chính trị & Quản lý sinh viên',
    ql_vai_tro_ngay_tao: '2024-06-01T08:00:00Z',
    created_at: '01/06/2024 08:00',
    total_members: 1,
    active_flag: 1,
    colorId: 'pink',
    dotColor: 'bg-pink-500',
    textColor: 'text-pink-500',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    borderColor: 'bg-pink-500',
    is_default: 1
  },
  {
    ql_vai_tro_id: '7',
    ql_vai_tro_ten: 'VĂN THƯ TỔ CHỨC HÀNH CHÍNH - NHÂN SỰ',
    ql_vai_tro_mo_ta: 'Văn thư TCHC - Nhân sự',
    ql_vai_tro_ngay_tao: '2024-07-10T14:20:00Z',
    created_at: '10/07/2024 14:20',
    total_members: 0,
    active_flag: 1,
    colorId: 'cyan',
    dotColor: 'bg-cyan-500',
    textColor: 'text-cyan-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'bg-cyan-500',
    is_default: 1
  },
  {
    ql_vai_tro_id: '8',
    ql_vai_tro_ten: 'TEST ROLE 1',
    ql_vai_tro_mo_ta: 'Vai trò test 1',
    ql_vai_tro_ngay_tao: '2024-08-15T08:30:00Z',
    created_at: '15/08/2024 08:30',
    total_members: 0,
    active_flag: 1,
    colorId: 'green',
    dotColor: 'bg-green-500',
    textColor: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'bg-green-500',
    is_default: 0
  },
  {
    ql_vai_tro_id: '9',
    ql_vai_tro_ten: 'TEST ROLE 2',
    ql_vai_tro_mo_ta: 'Vai trò test 2',
    ql_vai_tro_ngay_tao: '2024-09-20T10:00:00Z',
    created_at: '20/09/2024 10:00',
    total_members: 0,
    active_flag: 1,
    colorId: 'purple',
    dotColor: 'bg-purple-500',
    textColor: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'bg-purple-500',
    is_default: 0
  },
]

export interface FakeUser {
  ql_nguoi_dung_id: string
  ql_nguoi_dung_ho_ten: string
  ql_nguoi_dung_email: string
  ql_nguoi_dung_avatar?: string
  active_flag: number
  ten_don_vi: string
  ql_vai_tro_id: string | null
}

let fakeUsersData: FakeUser[] = [
  // 1. SUPER_ADMIN - Phòng Quản trị hệ thống
  { ql_nguoi_dung_id: '101', ql_nguoi_dung_ho_ten: 'Nguyễn Văn Minh', ql_nguoi_dung_email: 'minh.nv@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Quản trị hệ thống', ql_vai_tro_id: '1' },
  { ql_nguoi_dung_id: '102', ql_nguoi_dung_ho_ten: 'Trần Thị Hồng', ql_nguoi_dung_email: 'hong.tt@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Quản trị hệ thống', ql_vai_tro_id: '1' },

  // 2. VAN_THU_TO_CHUC_HANH_CHINH - Phòng Tổ chức - Hành chính (Văn thư)
  { ql_nguoi_dung_id: '103', ql_nguoi_dung_ho_ten: 'Lê Văn An', ql_nguoi_dung_email: 'an.lv@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '104', ql_nguoi_dung_ho_ten: 'Phạm Thị Bích', ql_nguoi_dung_email: 'bich.pt@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '105', ql_nguoi_dung_ho_ten: 'Hoàng Văn Cường', ql_nguoi_dung_email: 'cuong.hv@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '118', ql_nguoi_dung_ho_ten: 'Nguyễn Thị Lan Anh', ql_nguoi_dung_email: 'lananh.nt@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '119', ql_nguoi_dung_ho_ten: 'Trần Văn Bảo', ql_nguoi_dung_email: 'bao.tv@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '120', ql_nguoi_dung_ho_ten: 'Lê Thị Cẩm Tú', ql_nguoi_dung_email: 'camtu.lt@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '121', ql_nguoi_dung_ho_ten: 'Phạm Văn Dũng', ql_nguoi_dung_email: 'dung.pv@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '122', ql_nguoi_dung_ho_ten: 'Hoàng Thị Eun', ql_nguoi_dung_email: 'eun.ht@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '123', ql_nguoi_dung_ho_ten: 'Vũ Văn Phúc', ql_nguoi_dung_email: 'phuc.vv@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '124', ql_nguoi_dung_ho_ten: 'Đặng Thị Giang', ql_nguoi_dung_email: 'giang.dt@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '125', ql_nguoi_dung_ho_ten: 'Bùi Văn Huy', ql_nguoi_dung_email: 'huy.bv@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '126', ql_nguoi_dung_ho_ten: 'Ngô Thị Kim', ql_nguoi_dung_email: 'kim.nt@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },
  { ql_nguoi_dung_id: '127', ql_nguoi_dung_ho_ten: 'Dương Văn Long', ql_nguoi_dung_email: 'long.dv@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '2' },

  // 3. VAN_THU_DON_VI - Văn thư các Khoa/Phòng ban
  { ql_nguoi_dung_id: '106', ql_nguoi_dung_ho_ten: 'Vũ Thị Dung', ql_nguoi_dung_email: 'dung.vt@university.edu.vn', active_flag: 1, ten_don_vi: 'Khoa Công nghệ thông tin', ql_vai_tro_id: '3' },
  { ql_nguoi_dung_id: '107', ql_nguoi_dung_ho_ten: 'Đặng Văn Em', ql_nguoi_dung_email: 'em.dv@university.edu.vn', active_flag: 1, ten_don_vi: 'Khoa Kinh tế', ql_vai_tro_id: '3' },

  // 4. LANH_DAO_DON_VI - Lãnh đạo các Khoa/Phòng ban
  { ql_nguoi_dung_id: '108', ql_nguoi_dung_ho_ten: 'Bùi Thị Phương', ql_nguoi_dung_email: 'phuong.bt@university.edu.vn', active_flag: 1, ten_don_vi: 'Khoa Công nghệ thông tin', ql_vai_tro_id: '4' },
  { ql_nguoi_dung_id: '109', ql_nguoi_dung_ho_ten: 'Ngô Văn Quang', ql_nguoi_dung_email: 'quang.nv@university.edu.vn', active_flag: 1, ten_don_vi: 'Khoa Kinh tế', ql_vai_tro_id: '4' },
  { ql_nguoi_dung_id: '110', ql_nguoi_dung_ho_ten: 'Dương Thị Lan', ql_nguoi_dung_email: 'lan.dt@university.edu.vn', active_flag: 1, ten_don_vi: 'Khoa Ngoại ngữ', ql_vai_tro_id: '4' },

  // 5. LANH_DAO_TCHC - Lãnh đạo Phòng Tổ chức - Hành chính
  { ql_nguoi_dung_id: '111', ql_nguoi_dung_ho_ten: 'Lý Văn Sơn', ql_nguoi_dung_email: 'son.lv@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '5' },
  { ql_nguoi_dung_id: '112', ql_nguoi_dung_ho_ten: 'Mai Thị Tâm', ql_nguoi_dung_email: 'tam.mt@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '5' },

  // 6. PHONG_CTCT_QLSV - Phòng CTCT & QLSV
  { ql_nguoi_dung_id: '113', ql_nguoi_dung_ho_ten: 'Phan Văn Hùng', ql_nguoi_dung_email: 'hung.pv@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng CTCT & QLSV', ql_vai_tro_id: '6' },

  // 7. VAN_THU_TCHC_HR - Văn thư TCHC - Nhân sự
  { ql_nguoi_dung_id: '114', ql_nguoi_dung_ho_ten: 'Trịnh Thị Vân', ql_nguoi_dung_email: 'van.tt@university.edu.vn', active_flag: 1, ten_don_vi: 'Phòng Tổ chức - Hành chính', ql_vai_tro_id: '7' },

  // Người dùng chưa có vai trò
  { ql_nguoi_dung_id: '115', ql_nguoi_dung_ho_ten: 'Đỗ Văn Khánh', ql_nguoi_dung_email: 'khanh.dv@university.edu.vn', active_flag: 1, ten_don_vi: 'Khoa Xây dựng', ql_vai_tro_id: null },
  { ql_nguoi_dung_id: '116', ql_nguoi_dung_ho_ten: 'Nguyễn Thị Hà', ql_nguoi_dung_email: 'ha.nt@university.edu.vn', active_flag: 1, ten_don_vi: 'Khoa Y học', ql_vai_tro_id: null },
  { ql_nguoi_dung_id: '117', ql_nguoi_dung_ho_ten: 'Lê Văn Tùng', ql_nguoi_dung_email: 'tung.lv@university.edu.vn', active_flag: 0, ten_don_vi: 'Phòng Tài chính - Kế toán', ql_vai_tro_id: null }
]

// Sync total_members with actual users on init
recalcTotalMembers()

export interface FakePermission {
  ql_quyen_id: string | number
  ql_quyen_ten: string
  ql_quyen_mo_ta?: string
  ql_quyen_khoa: string
  ql_quyen_loai_module?: number | string
  ql_quyen_parent_id: number | string | null
  ql_quyen_action_type?: number | string
}

const fakePermissionsData: FakePermission[] = [
  // Module 8: Quản trị hệ thống
  { ql_quyen_id: 'p81', ql_quyen_ten: 'Quản lý người dùng', ql_quyen_mo_ta: 'Quản lý tài khoản người dùng', ql_quyen_khoa: 'user_manage', ql_quyen_loai_module: 8, ql_quyen_parent_id: null },
  { ql_quyen_id: 'p811', ql_quyen_ten: 'Xem người dùng', ql_quyen_khoa: 'user_view', ql_quyen_loai_module: 8, ql_quyen_parent_id: 'p81', ql_quyen_action_type: 1 },
  { ql_quyen_id: 'p812', ql_quyen_ten: 'Thêm người dùng', ql_quyen_khoa: 'user_add', ql_quyen_loai_module: 8, ql_quyen_parent_id: 'p81', ql_quyen_action_type: 2 },
  { ql_quyen_id: 'p813', ql_quyen_ten: 'Sửa người dùng', ql_quyen_khoa: 'user_edit', ql_quyen_loai_module: 8, ql_quyen_parent_id: 'p81', ql_quyen_action_type: 3 },
  { ql_quyen_id: 'p814', ql_quyen_ten: 'Xóa người dùng', ql_quyen_khoa: 'user_del', ql_quyen_loai_module: 8, ql_quyen_parent_id: 'p81', ql_quyen_action_type: 4 },
  { ql_quyen_id: 'p815', ql_quyen_ten: 'Reset mật khẩu', ql_quyen_khoa: 'user_reset_pass', ql_quyen_loai_module: 8, ql_quyen_parent_id: 'p81' },

  { ql_quyen_id: 'p82', ql_quyen_ten: 'Quản lý vai trò', ql_quyen_mo_ta: 'Phân quyền vai trò', ql_quyen_khoa: 'role_manage', ql_quyen_loai_module: 8, ql_quyen_parent_id: null },
  { ql_quyen_id: 'p821', ql_quyen_ten: 'Xem vai trò', ql_quyen_khoa: 'role_view', ql_quyen_loai_module: 8, ql_quyen_parent_id: 'p82', ql_quyen_action_type: 1 },
  { ql_quyen_id: 'p822', ql_quyen_ten: 'Thêm vai trò', ql_quyen_khoa: 'role_add', ql_quyen_loai_module: 8, ql_quyen_parent_id: 'p82', ql_quyen_action_type: 2 },
  { ql_quyen_id: 'p823', ql_quyen_ten: 'Sửa vai trò', ql_quyen_khoa: 'role_edit', ql_quyen_loai_module: 8, ql_quyen_parent_id: 'p82', ql_quyen_action_type: 3 },
  { ql_quyen_id: 'p824', ql_quyen_ten: 'Xóa vai trò', ql_quyen_khoa: 'role_del', ql_quyen_loai_module: 8, ql_quyen_parent_id: 'p82', ql_quyen_action_type: 4 },

  // Module 12: Quản lý danh mục hệ thống
  { ql_quyen_id: 'p121', ql_quyen_ten: 'Quản lý đơn vị', ql_quyen_mo_ta: 'Danh mục đơn vị', ql_quyen_khoa: 'donvi_manage', ql_quyen_loai_module: 12, ql_quyen_parent_id: null },
  { ql_quyen_id: 'p1211', ql_quyen_ten: 'Xem đơn vị', ql_quyen_khoa: 'donvi_view', ql_quyen_loai_module: 12, ql_quyen_parent_id: 'p121', ql_quyen_action_type: 1 },
  { ql_quyen_id: 'p1212', ql_quyen_ten: 'Thêm đơn vị', ql_quyen_khoa: 'donvi_add', ql_quyen_loai_module: 12, ql_quyen_parent_id: 'p121', ql_quyen_action_type: 2 },
  { ql_quyen_id: 'p1213', ql_quyen_ten: 'Sửa đơn vị', ql_quyen_khoa: 'donvi_edit', ql_quyen_loai_module: 12, ql_quyen_parent_id: 'p121', ql_quyen_action_type: 3 },
  { ql_quyen_id: 'p1214', ql_quyen_ten: 'Xóa đơn vị', ql_quyen_khoa: 'donvi_del', ql_quyen_loai_module: 12, ql_quyen_parent_id: 'p121', ql_quyen_action_type: 4 },

  { ql_quyen_id: 'p122', ql_quyen_ten: 'Quản lý chức danh', ql_quyen_mo_ta: 'Danh mục chức danh', ql_quyen_khoa: 'chucdanh_manage', ql_quyen_loai_module: 12, ql_quyen_parent_id: null },
  { ql_quyen_id: 'p1221', ql_quyen_ten: 'Xem chức danh', ql_quyen_khoa: 'chucdanh_view', ql_quyen_loai_module: 12, ql_quyen_parent_id: 'p122', ql_quyen_action_type: 1 },
  { ql_quyen_id: 'p1222', ql_quyen_ten: 'Thêm chức danh', ql_quyen_khoa: 'chucdanh_add', ql_quyen_loai_module: 12, ql_quyen_parent_id: 'p122', ql_quyen_action_type: 2 },
  { ql_quyen_id: 'p1223', ql_quyen_ten: 'Sửa chức danh', ql_quyen_khoa: 'chucdanh_edit', ql_quyen_loai_module: 12, ql_quyen_parent_id: 'p122', ql_quyen_action_type: 3 },
  { ql_quyen_id: 'p1224', ql_quyen_ten: 'Xóa chức danh', ql_quyen_khoa: 'chucdanh_del', ql_quyen_loai_module: 12, ql_quyen_parent_id: 'p122', ql_quyen_action_type: 4 },

  // Module 13: Quản lý nghỉ phép
  { ql_quyen_id: 'p131', ql_quyen_ten: 'Quản lý nghỉ phép', ql_quyen_mo_ta: 'Đăng ký và duyệt nghỉ phép', ql_quyen_khoa: 'nghiphep_manage', ql_quyen_loai_module: 13, ql_quyen_parent_id: null },
  { ql_quyen_id: 'p1311', ql_quyen_ten: 'Xem nghỉ phép', ql_quyen_khoa: 'nghiphep_view', ql_quyen_loai_module: 13, ql_quyen_parent_id: 'p131', ql_quyen_action_type: 1 },
  { ql_quyen_id: 'p1312', ql_quyen_ten: 'Thêm đơn nghỉ', ql_quyen_khoa: 'nghiphep_add', ql_quyen_loai_module: 13, ql_quyen_parent_id: 'p131', ql_quyen_action_type: 2 },
  { ql_quyen_id: 'p1313', ql_quyen_ten: 'Sửa đơn nghỉ', ql_quyen_khoa: 'nghiphep_edit', ql_quyen_loai_module: 13, ql_quyen_parent_id: 'p131', ql_quyen_action_type: 3 },
  { ql_quyen_id: 'p1314', ql_quyen_ten: 'Duyệt nghỉ phép', ql_quyen_khoa: 'nghiphep_approve', ql_quyen_loai_module: 13, ql_quyen_parent_id: 'p131' },

  // Module 1: Quản lý văn bản
  { ql_quyen_id: 'p11', ql_quyen_ten: 'Văn bản đến', ql_quyen_mo_ta: 'Tiếp nhận văn bản đến', ql_quyen_khoa: 'vbden_manage', ql_quyen_loai_module: 1, ql_quyen_parent_id: null },
  { ql_quyen_id: 'p111', ql_quyen_ten: 'Xem văn bản đến', ql_quyen_khoa: 'vbden_view', ql_quyen_loai_module: 1, ql_quyen_parent_id: 'p11', ql_quyen_action_type: 1 },
  { ql_quyen_id: 'p112', ql_quyen_ten: 'Thêm văn bản đến', ql_quyen_khoa: 'vbden_add', ql_quyen_loai_module: 1, ql_quyen_parent_id: 'p11', ql_quyen_action_type: 2 },
  { ql_quyen_id: 'p113', ql_quyen_ten: 'Sửa văn bản đến', ql_quyen_khoa: 'vbden_edit', ql_quyen_loai_module: 1, ql_quyen_parent_id: 'p11', ql_quyen_action_type: 3 },
  { ql_quyen_id: 'p114', ql_quyen_ten: 'Xóa văn bản đến', ql_quyen_khoa: 'vbden_del', ql_quyen_loai_module: 1, ql_quyen_parent_id: 'p11', ql_quyen_action_type: 4 },

  { ql_quyen_id: 'p12', ql_quyen_ten: 'Văn bản đi', ql_quyen_mo_ta: 'Gửi văn bản đi', ql_quyen_khoa: 'vbdi_manage', ql_quyen_loai_module: 1, ql_quyen_parent_id: null },
  { ql_quyen_id: 'p121a', ql_quyen_ten: 'Xem văn bản đi', ql_quyen_khoa: 'vbdi_view', ql_quyen_loai_module: 1, ql_quyen_parent_id: 'p12', ql_quyen_action_type: 1 },
  { ql_quyen_id: 'p122a', ql_quyen_ten: 'Thêm văn bản đi', ql_quyen_khoa: 'vbdi_add', ql_quyen_loai_module: 1, ql_quyen_parent_id: 'p12', ql_quyen_action_type: 2 },
  { ql_quyen_id: 'p123a', ql_quyen_ten: 'Sửa văn bản đi', ql_quyen_khoa: 'vbdi_edit', ql_quyen_loai_module: 1, ql_quyen_parent_id: 'p12', ql_quyen_action_type: 3 },
  { ql_quyen_id: 'p124a', ql_quyen_ten: 'Xóa văn bản đi', ql_quyen_khoa: 'vbdi_del', ql_quyen_loai_module: 1, ql_quyen_parent_id: 'p12', ql_quyen_action_type: 4 },

  // Module 2: Quản lý ngoài giờ
  { ql_quyen_id: 'p21', ql_quyen_ten: 'Đăng ký OT', ql_quyen_mo_ta: 'Đăng ký làm ngoài giờ', ql_quyen_khoa: 'ot_manage', ql_quyen_loai_module: 2, ql_quyen_parent_id: null },
  { ql_quyen_id: 'p211', ql_quyen_ten: 'Xem đăng ký OT', ql_quyen_khoa: 'ot_view', ql_quyen_loai_module: 2, ql_quyen_parent_id: 'p21', ql_quyen_action_type: 1 },
  { ql_quyen_id: 'p212', ql_quyen_ten: 'Thêm đăng ký OT', ql_quyen_khoa: 'ot_add', ql_quyen_loai_module: 2, ql_quyen_parent_id: 'p21', ql_quyen_action_type: 2 },
  { ql_quyen_id: 'p213', ql_quyen_ten: 'Sửa đăng ký OT', ql_quyen_khoa: 'ot_edit', ql_quyen_loai_module: 2, ql_quyen_parent_id: 'p21', ql_quyen_action_type: 3 },
  { ql_quyen_id: 'p214', ql_quyen_ten: 'Xóa đăng ký OT', ql_quyen_khoa: 'ot_del', ql_quyen_loai_module: 2, ql_quyen_parent_id: 'p21', ql_quyen_action_type: 4 },

  // Module 9: Quản lý hồ sơ
  { ql_quyen_id: 'p91', ql_quyen_ten: 'Hồ sơ nhân sự', ql_quyen_mo_ta: 'Quản lý hồ sơ nhân viên', ql_quyen_khoa: 'hoso_manage', ql_quyen_loai_module: 9, ql_quyen_parent_id: null },
  { ql_quyen_id: 'p911', ql_quyen_ten: 'Xem hồ sơ', ql_quyen_khoa: 'hoso_view', ql_quyen_loai_module: 9, ql_quyen_parent_id: 'p91', ql_quyen_action_type: 1 },
  { ql_quyen_id: 'p912', ql_quyen_ten: 'Thêm hồ sơ', ql_quyen_khoa: 'hoso_add', ql_quyen_loai_module: 9, ql_quyen_parent_id: 'p91', ql_quyen_action_type: 2 },
  { ql_quyen_id: 'p913', ql_quyen_ten: 'Sửa hồ sơ', ql_quyen_khoa: 'hoso_edit', ql_quyen_loai_module: 9, ql_quyen_parent_id: 'p91', ql_quyen_action_type: 3 },
  { ql_quyen_id: 'p914', ql_quyen_ten: 'Xóa hồ sơ', ql_quyen_khoa: 'hoso_del', ql_quyen_loai_module: 9, ql_quyen_parent_id: 'p91', ql_quyen_action_type: 4 },

  // Parent không thuộc module (>0) -> sẽ được đẩy xuống cuối
  { ql_quyen_id: 'p99', ql_quyen_ten: 'Báo cáo tổng hợp', ql_quyen_mo_ta: 'Xem báo cáo chung', ql_quyen_khoa: 'report_view', ql_quyen_loai_module: 0, ql_quyen_parent_id: null },
  { ql_quyen_id: 'p991', ql_quyen_ten: 'Xem báo cáo', ql_quyen_khoa: 'report_read', ql_quyen_loai_module: 0, ql_quyen_parent_id: 'p99', ql_quyen_action_type: 1 },
  { ql_quyen_id: 'p992', ql_quyen_ten: 'Xuất Excel', ql_quyen_khoa: 'report_export', ql_quyen_loai_module: 0, ql_quyen_parent_id: 'p99' }
]

// Map roleId -> permissionIds
const rolePermissionMap: Record<string, (string | number)[]> = {
  '1': ['p811', 'p812', 'p813', 'p814', 'p815', 'p821', 'p822', 'p823', 'p824', 'p1211', 'p1212', 'p1213', 'p1214', 'p1221', 'p1222', 'p1223', 'p1224', 'p1311', 'p1312', 'p1313', 'p1314', 'p111', 'p112', 'p113', 'p114', 'p121a', 'p122a', 'p123a', 'p124a', 'p211', 'p212', 'p213', 'p214', 'p911', 'p912', 'p913', 'p914', 'p991', 'p992'],
  '2': ['p811', 'p821', 'p111', 'p112', 'p121a', 'p122a', 'p1311', 'p1312', 'p991'],
  '3': ['p811', 'p821', 'p111', 'p112', 'p121a', 'p122a', 'p991'],
  '4': ['p811', 'p821', 'p111', 'p112', 'p113', 'p121a', 'p122a', 'p123a', 'p1311', 'p1314', 'p911', 'p991'],
  '5': ['p811', 'p821', 'p111', 'p112', 'p113', 'p121a', 'p122a', 'p123a', 'p1311', 'p1312', 'p1313', 'p1314', 'p911', 'p991'],
  '6': ['p811', 'p821', 'p111', 'p121a', 'p1311', 'p991'],
  '7': ['p811', 'p821', 'p1211', 'p1212', 'p1213', 'p1221', 'p1222', 'p1223', 'p991']
}

// ===================== HELPERS =====================
function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function paginate<T>(items: T[], page: number, perPage: number) {
  const start = (page - 1) * perPage
  return items.slice(start, start + perPage)
}

function applySearch(items: any[], search: string, fields: string[]) {
  if (!search) return items
  const s = search.toLowerCase()
  return items.filter((item) =>
    fields.some((f) => {
      const val = item[f]
      return val !== undefined && String(val).toLowerCase().includes(s)
    })
  )
}

function recalcTotalMembers() {
  fakeRolesData.forEach((role) => {
    role.total_members = fakeUsersData.filter((u) => u.ql_vai_tro_id === role.ql_vai_tro_id && u.active_flag === 1).length
  })
}

// ===================== MOCK APIs =====================
export const mockRolesAxios = {
  async getAll(params: any) {
    await delay()
    const { page = 1, per_page = 10, search = '', id, order } = params || {}

    let items = [...fakeRolesData]

    if (id) {
      items = items.filter((r) => String(r.ql_vai_tro_id) === String(id))
    }

    const fields = ['ql_vai_tro_ten', 'ql_vai_tro_mo_ta']
    const filtered = applySearch(items, search, fields)

    if (order) {
      try {
        const o = typeof order === 'string' ? JSON.parse(order) : order
        if (Array.isArray(o) && o.length > 0) {
          const { column, dir } = o[0]
          filtered.sort((a: any, b: any) => {
            const av = a[column] ?? ''
            const bv = b[column] ?? ''
            if (av < bv) return dir === 'asc' ? -1 : 1
            if (av > bv) return dir === 'asc' ? 1 : -1
            return 0
          })
        }
      } catch {
        // ignore sort parse error
      }
    }

    const data = paginate(filtered, Number(page), Number(per_page))

    return {
      data: {
        data,
        recordsTotal: fakeRolesData.length,
        recordsFiltered: filtered.length
      }
    }
  },

  async getOptions() {
    await delay(200)
    return {
      success: true,
      data: fakeRolesData.map((r) => ({
        value: r.ql_vai_tro_id,
        label: r.ql_vai_tro_ten,
        ql_vai_tro_id: r.ql_vai_tro_id,
        ql_vai_tro_ten: r.ql_vai_tro_ten,
        dotColor: r.dotColor,
        textColor: r.textColor,
        bgColor: r.bgColor,
        borderColor: r.borderColor,
        colorId: r.colorId,
        customColorHex: r.customColorHex,
        is_default: r.is_default
      }))
    }
  },

  async delete(id: string | number) {
    await delay(300)
    const idx = fakeRolesData.findIndex((r) => String(r.ql_vai_tro_id) === String(id))
    if (idx >= 0) {
      fakeRolesData.splice(idx, 1)
      // Xóa role khỏi users
      fakeUsersData.forEach((u) => {
        if (String(u.ql_vai_tro_id) === String(id)) u.ql_vai_tro_id = null
      })
      return { success: true, message: 'Đã xóa vai trò' }
    }
    return { success: false, message: 'Không tìm thấy vai trò' }
  },

  async update(id: string | number, data: any) {
    await delay(300)
    const idx = fakeRolesData.findIndex((r) => String(r.ql_vai_tro_id) === String(id))
    if (idx >= 0) {
      // If colorId is provided, update color classes
      if (data.colorId) {
        // Check if it's a predefined color
        const color = getRoleColorById(data.colorId)
        if (color) {
          data.dotColor = color.bgClass
          data.textColor = color.textClass
          data.bgColor = color.bgLightClass
          data.borderColor = color.borderClass
          data.customColorHex = null // clear old custom color
        } else if (data.colorId.startsWith('#')) {
          // Custom hex color - use inline styles
          data.dotColor = '' // Will use inline style
          data.textColor = '' // Will use inline style  
          data.bgColor = '' // Will use inline style
          data.borderColor = '' // Will use inline style
          data.customColorHex = data.colorId
        }
      }
      fakeRolesData[idx] = { ...fakeRolesData[idx], ...data }
      return { success: true, message: 'Cập nhật thành công' }
    }
    return { success: false, message: 'Không tìm thấy vai trò' }
  },

  async create(data: any) {
    await delay(300)
    
    // Generate new ID
    const newId = String(Math.max(...fakeRolesData.map(r => Number(r.ql_vai_tro_id)), 0) + 1)
    
    // Get color from colorId
    let colorClasses = {
      dotColor: 'bg-gray-400',
      textColor: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-700',
      borderColor: 'bg-gray-400'
    }
    
    if (data.colorId) {
      const color = getRoleColorById(data.colorId)
      if (color) {
        colorClasses = {
          dotColor: color.bgClass,
          textColor: color.textClass,
          bgColor: color.bgLightClass,
          borderColor: color.borderClass
        }
      } else if (data.colorId.startsWith('#')) {
        colorClasses = {
          dotColor: '',
          textColor: '',
          bgColor: '',
          borderColor: ''
        }
      }
    }
    
    const newRole: FakeRole = {
      ql_vai_tro_id: newId,
      ql_vai_tro_ten: data.ql_vai_tro_ten,
      ql_vai_tro_mo_ta: data.ql_vai_tro_mo_ta || '',
      ql_vai_tro_ngay_tao: new Date().toISOString(),
      created_at: new Date().toLocaleString('vi-VN'),
      total_members: 0,
      active_flag: 1,
      is_default: 0,
      colorId: data.colorId,
      ...colorClasses,
      ...(data.colorId?.startsWith('#') ? { customColorHex: data.colorId } : {})
    }
    
    fakeRolesData.push(newRole)
    return { success: true, message: 'Tạo vai trò thành công', data: newRole }
  },

  async getRolePermissions(roleId: string | number) {
    await delay(300)
    const currentIds = rolePermissionMap[String(roleId)] || []
    const current = fakePermissionsData.filter((p) => currentIds.includes(String(p.ql_quyen_id)))
    return {
      success: true,
      permissions: fakePermissionsData,
      data: { ql_quyen: current }
    }
  },

  async saveRolePermissions(roleId: string | number, permissionIds: (string | number)[]) {
    await delay(400)
    rolePermissionMap[String(roleId)] = permissionIds.map(String)
    return { success: true, message: 'Cập nhật quyền thành công' }
  },

  async addMember(roleId: string | number, userIds: string[]) {
    await delay(300)
    fakeUsersData.forEach((u) => {
      if (userIds.includes(String(u.ql_nguoi_dung_id))) {
        u.ql_vai_tro_id = String(roleId)
      }
    })
    recalcTotalMembers()
    return { success: true, message: 'Đã thêm thành viên' }
  },

  async removeMember(roleId: string | number, userIds: string[]) {
    await delay(300)
    fakeUsersData.forEach((u) => {
      if (userIds.includes(String(u.ql_nguoi_dung_id)) && u.ql_vai_tro_id === String(roleId)) {
        u.ql_vai_tro_id = null
      }
    })
    recalcTotalMembers()
    return { success: true, message: 'Đã xóa thành viên' }
  }
}

export const mockUsersAxios = {
  async getAll(params: any) {
    await delay(300)
    const { page = 1, per_page = 10, search = '', ql_vai_tro_id, exclude_ql_vai_tro_id, active_flag } = params || {}

    let items = [...fakeUsersData]

    if (active_flag !== undefined) {
      items = items.filter((u) => u.active_flag === Number(active_flag))
    }

    if (ql_vai_tro_id !== undefined) {
      items = items.filter((u) => String(u.ql_vai_tro_id) === String(ql_vai_tro_id))
    }

    if (exclude_ql_vai_tro_id !== undefined) {
      items = items.filter((u) => String(u.ql_vai_tro_id) !== String(exclude_ql_vai_tro_id) && u.ql_vai_tro_id !== null)
    }

    const fields = ['ql_nguoi_dung_ho_ten', 'ql_nguoi_dung_email', 'ten_don_vi']
    const filtered = applySearch(items, search, fields)

    const data = paginate(filtered, Number(page), Number(per_page))

    return {
      data: {
        data,
        recordsTotal: fakeUsersData.length,
        recordsFiltered: filtered.length
      }
    }
  }
}
