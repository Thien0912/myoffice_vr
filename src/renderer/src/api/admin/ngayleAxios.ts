import { callApi } from '../callApi'

export interface NgayLe {
  id?: number | string
  id_ngay_le?: number | string
  ten_ngay_le: string
  ngay_le?: string
  ngay?: string
  batdau: string
  ketthuc: string
  mota?: string | null
  ngay_am?: string | null
  la_ngay_le_am?: number
  duoc_nghi?: number
  la_nghi_buoi?: number
  is_active?: number
  [key: string]: any
}

export interface NgayLeParams {
  page?: number
  length?: number
  search?: string
  [key: string]: any
}

export const ngayleAxios = {
  getAll: (params: NgayLeParams = {}) => {
    const { page = 1, length = -1, search, ...rest } = params
    const start = page > 0 && length > 0 ? (page - 1) * length : 0

    return callApi('admin/hrm/ngayle/index', {
      method: 'GET',
      data: {
        ...rest,
        searchValue: search,
        start,
        length
      }
    })
  },
  create: (data: Partial<NgayLe>) => {
    return callApi('admin/hrm/ngayle/create', {
      method: 'POST',
      data
    })
  },
  update: (id: string | number, data: Partial<NgayLe>) => {
    return callApi(`admin/hrm/ngayle/update/${id}`, {
      method: 'POST',
      data
    })
  },
  delete: (id: string | number) => {
    return callApi(`admin/hrm/ngayle/delete/${id}`, {
      method: 'POST'
    })
  }
}
