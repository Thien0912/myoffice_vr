import { callApi } from '../callApi'

export const loaiDeXuatAxios = {
  fetch: (params?: any) => {
    return callApi('admin/hrm/danhmucdexuat', {
      method: 'GET',
      data: params
    })
  },
  show: (id: number | string) => {
    return callApi(`admin/hrm/danhmucdexuat/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: any) => {
    return callApi('admin/hrm/danhmucdexuat/create', {
      method: 'POST',
      data
    })
  },
  update: (id: number | string, data: any) => {
    return callApi(`admin/hrm/danhmucdexuat/update/${id}`, {
      method: 'POST',
      data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/hrm/danhmucdexuat/${id}`, {
      method: 'DELETE'
    })
  },
  history: (payload?: any) => {
    return callApi('admin/hrm/danhmucdexuat/view_log', {
      method: 'GET',
      data: payload
    })
  }
}
