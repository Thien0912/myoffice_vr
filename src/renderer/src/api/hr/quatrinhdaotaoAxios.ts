import { callApi } from '../callApi'

export const quatrinhdaotaoAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/hrm/daotao', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/hrm/daotao/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/hrm/daotao/create_nhanvien_daotao', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/hrm/daotao/edit_nhanvien_daotao/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (data: object) => {
    return callApi('admin/hrm/daotao/delete_nhanvien_daotao', {
      method: 'POST',
      data: data
    })
  }
}
