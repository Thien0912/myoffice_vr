import { callApi } from '../callApi'

export const kinhnghiemlamviecAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/hrm/kinhnghiemlamviec', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/hrm/kinhnghiemlamviec/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/hrm/kinhnghiemlamviec/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/hrm/kinhnghiemlamviec/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (data: object) => {
    return callApi('admin/hrm/kinhnghiemlamviec/delete', {
      method: 'POST',
      data: data
    })
  }
}
