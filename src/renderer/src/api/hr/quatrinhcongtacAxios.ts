import { callApi } from '../callApi'

export const quatrinhcongtacAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/hrm/quatrinhcongtac', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/hrm/quatrinhcongtac/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/hrm/quatrinhcongtac/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/hrm/quatrinhcongtac/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (data: object) => {
    return callApi('admin/hrm/quatrinhcongtac/delete', {
      method: 'POST',
      data: data
    })
  }
}
