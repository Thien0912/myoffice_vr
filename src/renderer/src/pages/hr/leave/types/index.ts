export interface NghiPhepChiTiet {
  ngay_nghi: string
  buoi_nghi: 'Ca_ngay' | 'Sang' | 'Chieu'
  so_ngay_nghi: number
}

export interface NghiPhep {
  uuid_nghi_phep: string
  id_nhan_vien: string | number
  ma_nhan_vien: string
  ho_va_ten: string
  ten_don_vi: string
  ten_loai_phep: string
  loai_nghi: 'Binh_thuong' | 'Dot_xuat'
  so_ngay_nghi: number
  ly_do_nghi: string
  trang_thai_cap_mot: string
  trang_thai_cap_hai: string
  nguoi_duyet_cap_mot_ho_ten?: string
  thoi_gian_duyet_cap_mot?: string
  ly_do_duyet_cap_mot?: string
  nguoi_duyet_cap_hai_ho_ten?: string
  thoi_gian_duyet_cap_hai?: string
  ly_do_duyet_cap_hai?: string
  nguoi_duyet_ho_cap_mot_ho_ten?: string
  nguoi_duyet_ho_cap_hai_ho_ten?: string
  minh_chung_duyet_ho_cap_mot?: string
  minh_chung_duyet_ho_cap_hai?: string
  chi_tiet_ngay_nghi?: NghiPhepChiTiet[]
  minh_chung?: string
  minh_chung_ext?: string
  id_nguoi_duyet?: string | number
  logs?: Array<{
    cap_duyet: number
    hanh_dong: string
    trang_thai_cu?: string
    trang_thai_moi: string
    ly_do?: string
    thoi_gian_thay_doi: string
    nguoi_thuc_hien_ho_ten: string
    nguoi_thuc_hien_avatar?: string
  }>
}
