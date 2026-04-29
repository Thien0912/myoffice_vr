import { callApi } from '../callApi'

export const chungchiAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/hrm/chungchi', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/hrm/chungchi/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/hrm/chungchi/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/hrm/chungchi/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (data: object) => {
    return callApi('admin/hrm/chungchi/delete', {
      method: 'POST',
      data: data
    })
  }
}
