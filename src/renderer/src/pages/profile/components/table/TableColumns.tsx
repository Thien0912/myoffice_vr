export const columnNhansu = [
  { uid: 'id', name: 'ID', sort: true },
  { uid: 'ma_nhan_vien', name: 'Mã nhân viên', sort: true },
  { uid: 'ho_va_ten', name: 'Họ và tên', sort: true },
  { uid: 'ngay_sinh', name: 'Ngày sinh', sort: true },
  { uid: 'ten_don_vi', name: 'Đơn vị', sort: true },
  { uid: 'so_dien_thoai', name: 'Số điện thoại', sort: false },
  { uid: 'nganh_dt', name: 'Ngành đào tạo', sort: false },
  { uid: 'ngay_lam_chinh_thuc', name: 'Ngày vào làm', sort: true },
  { uid: 'mst_ca_nhan', name: 'MST cá nhân', sort: false },
  { uid: 'trang_thai', name: 'Trạng thái', sort: true }
]

// Định nghĩa cấu hình cột cho Backend (DataTables)
export const BACKEND_COLUMNS_DEF = [
  { data: 'stt', name: '', searchable: false, orderable: false },
  { data: 'ma_nhan_vien', name: 'ma_nhan_vien', searchable: true, orderable: true },
  { data: 'avatar', name: '', searchable: false, orderable: false },
  { data: 'ho_va_ten', name: 'ho_va_ten', searchable: true, orderable: true },
  { data: 'id_don_vi_cong_tac', name: 'id_don_vi_cong_tac', searchable: true, orderable: true },
  { data: 'id_vi_tri_cong_viec', name: 'id_vi_tri_cong_viec', searchable: true, orderable: true },
  { data: 'trang_thai', name: 'trang_thai', searchable: true, orderable: true },
  { data: 'hoc_ham', name: 'hoc_ham', searchable: true, orderable: true },
  { data: 'hoc_vi', name: 'hoc_vi', searchable: true, orderable: true },
  { data: 'chuyen_nganh', name: 'chuyen_nganh', searchable: true, orderable: true },
  { data: 'ngay_lam_chinh_thuc', name: 'ngay_lam_chinh_thuc', searchable: true, orderable: true },
  { data: 'mst_ca_nhan', name: 'mst_ca_nhan', searchable: true, orderable: true },
  { data: 'email', name: 'email', searchable: true, orderable: true },
  { data: 'gioi_tinh', name: 'gioi_tinh', searchable: true, orderable: true },
  { data: 'ngay_sinh', name: 'ngay_sinh', searchable: true, orderable: true },
  { data: 'noi_dt', name: 'noi_dt', searchable: true, orderable: true }
]
