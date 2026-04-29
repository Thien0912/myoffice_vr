import { callApi } from '../callApi'

export const khenthuongAxios = {
  create: (data: object) => {
    return callApi('admin/hrm/thuong/create_thuong_danh_sach', {
      method: 'POST',
      data: data
    })
  },
  delete: (data: object) => {
    return callApi(`admin/hrm/thuong/delete_thuong_danh_sach`, {
      method: 'POST',
      data: data
    })
  }
}

export const thuongAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/hrm/thuong', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/hrm/thuong/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/hrm/thuong/create_thuong', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/hrm/thuong/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (id: string | number) => {
    return callApi(`admin/hrm/thuong/delete/${id}`, {
      method: 'POST'
    })
  }
}
