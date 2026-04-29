import { callApi } from '../callApi'

export const bangcapAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/hrm/bangcap', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/hrm/bangcap/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/hrm/bangcap/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/hrm/bangcap/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (data: object) => {
    return callApi('admin/hrm/bangcap/delete', {
      method: 'POST',
      data: data
    })
  }
}
