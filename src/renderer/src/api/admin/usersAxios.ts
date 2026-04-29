import { callApi } from '../callApi'

export interface User {
  ql_nguoi_dung_id: string
  ql_nguoi_dung_ho_ten: string
  ql_nguoi_dung_email: string
  ql_nguoi_dung_loai: string
  ql_nguoi_dung_la_lanh_dao: string
  id_don_vi: string
  active_flag: string
  ql_nguoi_dung_is_admin: string
  lan_dang_nhap_cuoi?: string
  ql_nguoi_dung_zalo_oa_uid?: string
  ql_nguoi_dung_zalo_uid?: string
  [key: string]: any
}

export interface UserParams {
  page?: number
  per_page?: number
  search?: string
  ql_nguoi_dung_ho_ten?: string
  ql_nguoi_dung_email?: string
  active_flag?: number
  id_don_vi?: string
  [key: string]: any
}

export const usersAxios = {
  getAll: (params: UserParams) => {
    // Backend requires start (offset) and length (limit)
    const { page = 1, per_page = 10, search, ...rest } = params
    const start = (page - 1) * per_page

    return callApi('admin/ql/users', {
      method: 'GET',
      data: {
        ...rest,
        searchValue: search,
        start,
        length: per_page
      }
    })
  },
  getOne: (id: string) => {
    return callApi(`admin/ql/users/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: Partial<User>) => {
    return callApi('admin/ql/users/create', {
      method: 'POST',
      data
    })
  },
  update: (id: string, data: Partial<User>) => {
    return callApi(`admin/ql/users/update/${id}`, {
      method: 'PUT',
      data
    })
  },
  delete: (id: string) => {
    return callApi(`admin/ql/users/delete/${id}`, {
      method: 'DELETE'
    })
  },
  getByUnit: (unitId: string, excludePositions?: string[]) => {
    return callApi('admin/hrm/nhanvien/get_by_unit', {
      method: 'GET',
      data: {
        id_don_vi: unitId,
        exclude_positions: excludePositions ? JSON.stringify(excludePositions) : undefined
      }
    })
  }
}
