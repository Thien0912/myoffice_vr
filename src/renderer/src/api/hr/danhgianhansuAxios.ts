import { callApi } from '../callApi'

export const danhgianhansuAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/hrm/danhgia', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/hrm/danhgia/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/hrm/danhgia/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/hrm/danhgia/edit/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (data: object) => {
    return callApi('admin/hrm/danhgia/delete', {
      method: 'POST',
      data: data
    })
  }
}
