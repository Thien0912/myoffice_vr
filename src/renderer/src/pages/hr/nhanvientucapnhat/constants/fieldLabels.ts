/**
 * Shared FIELD_LABELS mapping for the HR employee self-update module.
 * Used by NhanVienTuCapNhatPage (table chips) and LichSuChinhSuaDrawer (history rows).
 */
export const FIELD_LABELS: Record<string, string> = {
    // Identity
    id_nhan_vien: 'ID Nhân viên',
    ma_nhan_vien: 'Mã nhân viên',
    ma_cham_cong: 'Mã chấm công',
    ho_va_ten: 'Họ và tên',
    email: 'Email',
    email_ca_nhan: 'Email cá nhân',
    gioi_tinh: 'Giới tính',
    ngay_sinh: 'Ngày sinh',
    so_dien_thoai: 'Số điện thoại',
    que_quan: 'Quê quán',
    avatar: 'Ảnh đại diện',
    // Work
    id_don_vi_cong_tac: 'Đơn vị công tác',
    id_vi_tri_cong_viec: 'Chức vụ',
    id_ca_lam_viec: 'Ca làm việc',
    ql_nguoi_dung_id: 'Quản lý',
    don_vi_kiem_nhiem: 'Đơn vị kiêm nhiệm',
    // Tax & finance
    mst_ca_nhan: 'Mã số thuế cá nhân',
    // Identity docs — CCCD
    cccd_so: 'Số CCCD',
    cccd_ngay_cap: 'Ngày cấp CCCD',
    cccd_noi_cap: 'Nơi cấp CCCD',
    cccd_ngay_het_han: 'Ngày hết hạn CCCD',
    // Identity docs — Passport
    ho_chieu_so: 'Số hộ chiếu',
    ho_chieu_ngay_cap: 'Ngày cấp hộ chiếu',
    ho_chieu_noi_cap: 'Nơi cấp hộ chiếu',
    ho_chieu_ngay_het_han: 'Ngày hết hạn hộ chiếu',
    // Personal background
    id_dan_toc: 'Dân tộc',
    id_ton_giao: 'Tôn giáo',
    id_quoc_tich: 'Quốc tịch',
    // Education
    trinh_do_vh: 'Trình độ văn hóa',
    trinh_do_dt: 'Học vị',
    hoc_ham: 'Học hàm',
    noi_dt: 'Nơi đào tạo',
    khoa_dt: 'Khoa đào tạo',
    nganh_dt: 'Chuyên ngành',
    nam_tn: 'Năm tốt nghiệp',
    xep_loai_tn: 'Xếp loại tốt nghiệp',
    // Permanent address (HKTT)
    hktt_id_quoc_gia: 'HKTT - Quốc gia',
    hktt_id_tinh_tp: 'HKTT - Tỉnh/TP',
    hktt_id_quan_huyen: 'HKTT - Quận/Huyện',
    hktt_id_xa_phuong: 'HKTT - Xã/Phường',
    hktt_so_nha: 'Số nhà HKTT',
    hktt_dia_chi: 'Địa chỉ HKTT',
    hktt_so_ho_khau: 'Số hộ khẩu',
    hktt_ma_so_ho_gd: 'Mã số HGĐ',
    hktt_la_chu_ho: 'Là chủ hộ',
    // Current address (COHN)
    cohn_giong_hktt: 'Địa chỉ giống HKTT',
    cohn_id_quoc_gia: 'Hiện tại - Quốc gia',
    cohn_id_tinh_tp: 'Hiện tại - Tỉnh/TP',
    cohn_id_quan_huyen: 'Hiện tại - Quận/Huyện',
    cohn_id_xa_phuong: 'Hiện tại - Xã/Phường',
    cohn_so_nha: 'Số nhà hiện tại',
    cohn_dia_chi: 'Địa chỉ hiện tại',
    // Emergency contact (LHKC)
    lhkc_ho_ten: 'Liên hệ KC - Họ tên',
    lhkc_quan_he: 'Liên hệ KC - Quan hệ',
    lhkc_sdt_di_dong: 'Liên hệ KC - SĐT',
    lhkc_sdt_nha_rieng: 'Liên hệ KC - SĐT nhà riêng',
    lhkc_email: 'Liên hệ KC - Email',
    lhkc_dia_chi: 'Liên hệ KC - Địa chỉ',
    // Evidence / attachments
    bang_cap: 'Bằng cấp',
    chung_chi: 'Chứng chỉ',
    minh_chung: 'Minh chứng',
    // System flags
    availability: 'Trạng thái',
    dang_yeu_cau_cap_nhat: 'Đang yêu cầu cập nhật',
    tu_dong_tang_phep: 'Tự động tăng phép',
    // Audit timestamps (legacy compat)
    created_at: 'Ngày tạo',
    created_user_id: 'Người tạo',
    updated_at: 'Ngày cập nhật',
    updated_user_id: 'Người cập nhật',
    deleted_at: 'Ngày xóa',
    deleted_user_id: 'Người xóa',
    // Legacy keys
    dia_chi: 'Địa chỉ',
    dan_toc: 'Dân tộc',
    ton_giao: 'Tôn giáo',
    so_cmnd: 'Số CMND/CCCD',
    ngay_cap_cmnd: 'Ngày cấp CMND',
    noi_cap_cmnd: 'Nơi cấp CMND',
    so_bao_hiem: 'Số bảo hiểm',
    chuc_vu: 'Chức vụ',
    phong_ban: 'Phòng ban',
    nguoi_than_ten: 'Tên người thân',
    nguoi_than_sdt: 'SĐT người thân',
}
