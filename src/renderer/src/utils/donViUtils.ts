/**
 * Map loại đơn vị (mã) sang tên hiển thị tiếng Việt
 */
const LOAI_DON_VI_MAP: Record<string, string> = {
    TRUONG_CN_KT: "Trường Công Nghệ - Kỹ Thuật",
    TRUONG_SUC_KHOE: "Trường Khoa học Sức Khỏe",
    TRUONG_CNS_TTNT: "Trường Công nghệ số và Trí tuệ nhân tạo",
    TRUONG_LUAT_KT: "Trường Luật - Kinh tế",
    LANH_DAO: 'Lãnh Đạo',
    PHONG: 'Phòng',
    KHOA_BOMON: 'Khoa/Bộ môn',
    TRUNG_TAM: 'Trung tâm',
    BAN: 'Ban',
    VIEN: 'Viện',
    DOAN_THE: 'Đoàn thể',
    DON_VI_KHAC: 'Đơn vị khác',
    KHAC: 'Khác',
    DOANH_NGHIEP: 'Doanh nghiệp',
}

export const getTenLoaiDonVi = (loai: string): string => {
    return LOAI_DON_VI_MAP[loai] || loai
}
