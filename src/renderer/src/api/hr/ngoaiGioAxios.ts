import { callApi } from '@renderer/api/callApi'

export const ngoaiGioAxios = {
  fetch: (params?: any) => {
    return callApi('admin/hrm/ngoaigio', {
      method: 'GET',
      data: params
    })
  },
  getDetail: (id: number | string) => {
    return callApi(`admin/hrm/ngoaigio/detail/${id}`, {
      method: 'GET'
    })
  },
  approve: (params: {
    id_ngoai_gio: number | number[]
    hanh_dong: 'duyet' | 'tu_choi'
    ly_do_duyet?: string
    cap_duyet?: number
  }) => {
    return callApi('admin/hrm/ngoaigio/approve', {
      method: 'POST',
      data: params
    })
  },
  create: (params: {
    id_nhan_vien: number | number[]
    is_dot_xuat?: number
    data: {
      ngay_dang_ky: string
      gio_bat_dau: string
      gio_ket_thuc: string
      noi_dung?: string
      chi_tiet?: string
      so_gio?: number
    }[]
  }) => {
    return callApi(
      'admin/hrm/ngoaigio/create',
      { method: 'POST', data: params }
    )
  },
  update: (params: {
    id_ngoai_gio: number
    ngay_dang_ky?: string
    gio_bat_dau?: string
    gio_ket_thuc?: string
    noi_dung?: string
    chi_tiet?: string
    so_gio?: number
  }) => {
    return callApi('admin/hrm/ngoaigio/update', {
      method: 'POST',
      data: params
    })
  },
  delete: (id: number) => {
    return callApi(`admin/hrm/ngoaigio/delete/${id}`, {
      method: 'POST'
    })
  },
  changeStatus: (params: { id: number; trang_thai_moi: 'Huy' | 'Cho_duyet'; ly_do_huy?: string; data?: any }) => {
    return callApi('admin/hrm/ngoaigio/change_status', {
      method: 'POST',
      data: params
    })
  },
  deletes: (ids: number[]) => {
    return callApi('admin/hrm/ngoaigio/deletes', {
      method: 'POST',
      data: { ids_ngoai_gio: ids }
    })
  },
  thongKeDonVi: (params: { start_date?: string; end_date?: string }) => {
    return callApi('admin/hrm/ngoaigio/thong_ke_don_vi', {
      method: 'POST',
      data: params
    })
  },

  // === API QUẢN LÝ BẢNG CHẤM CÔNG THÁNG ===
  getBangChamCongThang: (params?: {
    start?: number
    length?: number
    searchValue?: string
    trang_thai?: 'DANG_CHO_DUYET' | 'DA_DUYET' | 'BI_TU_CHOI' | 'KHOA' | 'MO'
    thang?: string
  }) => {
    return callApi('admin/hrm/ngoaigio/bang_cham_cong', {
      method: 'GET',
      data: params
    })
  },
  createBangChamCong: (params: {
    thang: string
    ngay_bat_dau: string
    ngay_ket_thuc: string
    ten_bang?: string
    ghi_chu?: string
  }) => {
    return callApi('admin/hrm/ngoaigio/bang_cham_cong_create', {
      method: 'POST',
      data: params
    })
  },
  updateBangChamCong: (params: {
    id: number
    thang?: string
    ngay_bat_dau?: string
    ngay_ket_thuc?: string
    ten_bang?: string
    ghi_chu?: string
  }) => {
    return callApi('admin/hrm/ngoaigio/bang_cham_cong_update', {
      method: 'POST',
      data: params
    })
  },
  khoaBangChamCong: (params: { id: number; trang_thai: 'KHOA' | 'MO' }) => {
    return callApi('admin/hrm/ngoaigio/bang_cham_cong_khoa', {
      method: 'POST',
      data: params
    })
  },
  duyetBangChamCong: (params: {
    id: number
    hanh_dong: 'duyet' | 'tu_choi'
    ly_do?: string
  }) => {
    return callApi('admin/hrm/ngoaigio/bang_cham_cong_duyet', {
      method: 'POST',
      data: params
    })
  },
  deleteBangChamCong: (id: number) => {
    return callApi('admin/hrm/ngoaigio/bang_cham_cong_delete', {
      method: 'POST',
      data: { id }
    })
  },
  lockDatesBangChamCong: (params: {
    id: number
    start_date: string
    end_date: string
  }) => {
    return callApi('admin/hrm/ngoaigio/bang_cham_cong_lock_dates', {
      method: 'POST',
      data: params
    })
  },
  unlockDatesBangChamCong: (params: { id: number; index: number }) => {
    return callApi('admin/hrm/ngoaigio/bang_cham_cong_unlock_dates', {
      method: 'POST',
      data: params
    })
  },

  // === API NGÀY LỄ ===
  getNgayLe: (params?: { year?: number; is_active?: 0 | 1 }) => {
    return callApi('admin/hrm/ngoaigio/ngay_le', {
      method: 'GET',
      data: params
    })
  },

  // === API TỔNG GIỜ THEO LOẠI NGÀY ===
  getTongGioTheoLoaiNgay: (params: {
    start_date: string
    end_date: string
    id_nhan_vien?: number
    id_don_vi?: number
  }) => {
    return callApi('admin/hrm/ngoaigio/tong_gio_theo_loai_ngay', {
      method: 'GET',
      data: params
    })
  },

  // === API THỐNG KÊ ===
  getStatistics: (params?: {
    searchValue?: string
    searchKey?: any
  }) => {
    return callApi('admin/hrm/ngoaigio/statistics', {
      method: 'GET',
      data: params
    })
  },

  // === TRASH BIN ===
  getTrash: (params?: { start?: number; length?: number; searchValue?: string }) => {
    return callApi('admin/hrm/ngoaigio/trash', {
      method: 'GET',
      data: params
    })
  },
  restore: (ids: number | number[]) => {
    return callApi('admin/hrm/ngoaigio/restore', {
      method: 'POST',
      data: { ids_ngoai_gio: ids }
    })
  },
  destroy: (ids: number | number[]) => {
    return callApi('admin/hrm/ngoaigio/destroy', {
      method: 'POST',
      data: { ids_ngoai_gio: ids }
    })
  },

  // === EXPORT EXCEL ===
  exportExcel: (params) => {
    return callApi('admin/hrm/ngoaigio/export_excel', {
      method: 'POST',
      data: {
        searchKey: {
          id_bang_cham_cong: Array.isArray(params.id_bang_cham_cong)
            ? params.id_bang_cham_cong
            : [params.id_bang_cham_cong],
          ...(params.id_don_vi !== undefined ? { id_don_vi: params.id_don_vi } : {})
        }
      }
    })
  },

  // === API LOGS (NHẬT KÝ HOẠT ĐỘNG) ===
  getLogs: (params?: {
    page?: number
    limit?: number
    search?: string
    actionOptions?: string[]
    dateFilter?: string
  }) => {
    return callApi('admin/hrm/ngoaigio/logs', {
      method: 'GET',
      data: params
    })
  }
}
