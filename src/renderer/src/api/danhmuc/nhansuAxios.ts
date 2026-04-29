import { callApi } from '../callApi'

export const NhansuAxios = {
  fetch: (payload: object = {}) => {
    return callApi('admin/hrm/nhanvien', {
      method: 'POST',
      data: payload
    })
  },
  create: (data: object = {}) => {
    return callApi('admin/hrm/nhanvien/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/hrm/nhanvien/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (data: object = {}) => {
    return callApi(`admin/hrm/nhanvien/delete`, {
      method: 'POST',
      data: data
    })
  },
  // delete: (id: number | string) => {
  //   return callApi(`admin/hrm/nhanvien/${id}`, {
  //     method: 'DELETE'
  //   })
  // },
  getLastID: () => {
    return callApi('admin/hrm/nhanvien/last_code', {
      method: 'GET'
    })
  },
  getThongKe: () => {
    return callApi('admin/hrm/nhanvien/statistical', {
      method: 'GET'
    })
  },
  getNhanSuByID: (id: number | string) => {
    return callApi(`admin/hrm/nhanvien/show/${id}`, {
      method: 'GET'
    })
  },
  getDetailRequest: (id: string | number, id_yeu_cau_cap_nhat: string | number) => {
    return callApi(`admin/hrm/nhanvien/show/${id}?id_yeu_cau_cap_nhat=${id_yeu_cau_cap_nhat}`, {
      method: 'GET'
    })
  },
  resignation: (data: object = {}) => {
    return callApi(`admin/hrm/nhanvien/resignation`, {
      method: 'POST',
      data: data
    })
  },
  syncGoogleSheet: () => {
    return callApi('admin/hrm/SyncGoogleSheet/sync_all', {
      method: 'GET'
    })
  },
  importGoogleSheet: () => {
    return callApi('admin/hrm/SyncGoogleSheet/import_all', {
      method: 'GET'
    })
  },
  getByUnit: (id_don_vi: string | number) => {
    return callApi('admin/hrm/nhanvien/get_by_unit', {
      method: 'GET',
      data: { id_don_vi }
    })
  },
  deleteAvatar(id: number | string) {
    return callApi(`admin/hrm/nhanvien/delete_avatar`, {
      method: "post",
      data: { id_nhan_vien: id }
    });
  },
  exportExcel(data: any) {
    return callApi(`admin/hrm/nhanvien/export`, {
      method: "post",
      data
    });
  },
  lichsu(payload?: object) {
    return callApi('admin/hrm/nhanvien/view_log', {
      method: 'GET',
      data: payload
    })
  }
}

export const mapDonviOptions = async () => {
  const res = await NhansuAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: String(item.id_nhan_vien),
      label: item.ho_va_ten || ''
    })) || []
  )
}

export const mapNhanSuCungDonviOptions = async (id_don_vi?: string | number | string[]) => {
  try {
    let finalItems: any[] = []

    const extractItems = (res: any) => {
      if (!res) return []
      return Array.isArray(res.data)
        ? res.data
        : res.data?.data && Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res)
            ? res
            : []
    }

    const ids = Array.isArray(id_don_vi) 
      ? id_don_vi 
      : (typeof id_don_vi === 'string' && id_don_vi.includes(',') ? id_don_vi.split(',') : [id_don_vi])
      
    const validIds = ids.filter(id => id !== undefined && id !== null && id !== '')

    if (validIds.length === 0) {
      // Không có ID đơn vị cụ thể, fetch tất cả (hoặc tuỳ backend)
      const payload: any = { length: 9999 }
      // Nếu có id_don_vi truyền vào mà trống, thì có truyền filter id_don_vi: '' (theo code cũ)
      if (id_don_vi !== undefined) {
        payload.filter = { id_don_vi: id_don_vi }
      }
      const res = await NhansuAxios.fetch(payload)
      finalItems = extractItems(res)
    } else {
      // Có 1 hoặc nhiều ID đơn vị, fetch concurrent để tránh lỗi Array của backend
      const promises = validIds.map(async (id) => {
        const res = await NhansuAxios.fetch({
          length: 9999,
          filter: { id_don_vi: id }
        })
        return extractItems(res)
      })
      const results = await Promise.all(promises)
      finalItems = results.flat()
    }

    return finalItems.map((item: any) => ({
      // Vẫn sử dụng ql_nguoi_dung_id làm giá trị định danh chính
      value: String(item.ql_nguoi_dung_id || item.id_nhan_vien),
      label: `${item.ho_va_ten} (${item.ma_nhan_vien})`,
      avatar: item.avatar || item.ql_nguoi_dung_avatar,
      ma_nhan_vien: item.ma_nhan_vien,
      ho_va_ten: item.ho_va_ten,
      id_nhan_vien: item.id_nhan_vien ? String(item.id_nhan_vien) : undefined,
      id_don_vi: String(item.id_don_vi_cong_tac || item.id_don_vi || ''),
      ten_don_vi: item.ten_don_vi_cong_tac || item.ten_don_vi || 'Khác',
      email: item.email_truong || item.email || item.email_ca_nhan || ''
    }))
  } catch (err) {
    console.error('Error fetching users by unit:', err)
    return []
  }
}

// Trang thai cong viec tạm để ở đây cho dễ dùng chung

export interface TrangThaiCongViecItem {
  label: string
  value: string
  color: string
}

export const TRANG_THAI_CONG_VIEC: Record<string, TrangThaiCongViecItem> = {
  DANG_HOC_VIEC: {
    label: 'Đang học việc',
    value: 'DANG_HOC_VIEC',
    color: '#3577f1'
  },
  DANG_THU_VIEC: {
    label: 'Đang thử việc',
    value: 'DANG_THU_VIEC',
    color: '#3577f1'
  },
  DANG_LAM_VIEC: {
    label: 'Đang làm việc',
    value: 'DANG_LAM_VIEC',
    color: '#45cb85'
  },
  TAM_NGHI: {
    label: 'Tạm nghỉ',
    value: 'TAM_NGHI',
    color: '#ffbe0b'
  },
  DANG_LAM_THU_TUC_THOI_VIEC: {
    label: 'Đang làm thủ tục thôi việc',
    value: 'DANG_LAM_THU_TUC_THOI_VIEC',
    color: '#f4a261'
  },
  NGHI_VIEC: {
    label: 'Nghỉ việc',
    value: 'NGHI_VIEC',
    color: '#f06548'
  },
  NGHI_PHEP: {
    label: 'Nghỉ phép',
    value: 'NGHI_PHEP',
    color: '#ffbe0b'
  },
  CHUYEN_CONG_TAC: {
    label: 'Chuyển công tác',
    value: 'CHUYEN_CONG_TAC',
    color: '#4b38b3'
  }
}
