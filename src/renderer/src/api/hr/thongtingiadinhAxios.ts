import { callApi } from '../callApi'

export const thongtingiadinhAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/hrm/thongtingiadinh', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/hrm/thongtingiadinh/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/hrm/thongtingiadinh/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/hrm/thongtingiadinh/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (data: object) => {
    return callApi('admin/hrm/thongtingiadinh/delete', {
      method: 'POST',
      data: data
    })
  }
}
