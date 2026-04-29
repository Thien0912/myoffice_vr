import { callApi } from '@renderer/api/callApi'

export const thoiviecAxios = {
  fetch: (params?: any) => {
    return callApi('admin/hrm/thoiviec', {
      method: 'POST',
      data: params
    })
  },
  fetchNhanvien: (params?: any) => {
    return callApi('admin/hrm/nhanvien', {
      method: 'POST',
      data: params
    })
  },
  fetchThoi_viec_byIdNhanVien: (params?: any) => {
    return callApi('admin/hrm/thoiviec/thoi_viec_byIdNhanVien', {
      method: 'POST',
      data: params
    })
  },
  createProcedure: (params?: any) => {
    return callApi('admin/hrm/thutucthoiviec/create', {
      method: 'POST',
      data: params
    })
  },
  add: (params: any) => {
    return callApi('admin/hrm/thoiviec/create', {
      method: 'POST',
      data: params
    })
  },
  delete: (id: string | number) => {
    return callApi(`admin/hrm/thoiviec/delete/${id}`, {
      method: 'POST'
    })
  },
  update: (id: string | number, params: any) => {
    return callApi(`admin/hrm/thoiviec/update/${id}`, {
      method: 'POST',
      data: params
    })
  },
  updateEmployeeInfo: (params: any) => {
    return callApi('admin/hrm/thoiviec/update_employee_info', {
      method: 'POST',
      data: params
    })
  },
  updates: (params: any) => {
    return callApi('admin/hrm/thoiviec/updates', {
      method: 'POST',
      data: params
    })
  },
  history: (payload?: any) => {
    return callApi('admin/hrm/thoiviec/view_log', {
      method: 'GET',
      data: payload
    })
  }
}
