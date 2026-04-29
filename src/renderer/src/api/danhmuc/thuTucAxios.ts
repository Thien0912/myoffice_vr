import { callApi } from '../callApi'

export const thuTucAxios = {
  fetch: (params: object = {}) => {
    return callApi('admin/hrm/Thutucthoiviec', {
      method: 'GET',
      data: params
    })
  },
  fetchAll: () => {
    return callApi('admin/hrm/Thutucthoiviec', {
      method: 'GET',
      data: { start: 0, length: 9999 }
    })
  },
  create: (data: object) => {
    return callApi('admin/hrm/Thutucthoiviec/create', {
      method: 'POST',
      data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/hrm/Thutucthoiviec/update/${id}`, {
      method: 'POST',
      data
    })
  },
  delete: (id: string | number) => {
    return callApi(`admin/hrm/Thutucthoiviec/delete/${id}`, {
      method: 'POST'
    })
  },
  deleteMultiple: (ids: (string | number)[]) => {
    return callApi('admin/hrm/Thutucthoiviec/deletes', {
      method: 'POST',
      data: { ids }
    })
  }
}
