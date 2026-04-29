import { callApi } from '@renderer/api/callApi'

export const dexuatAxios = {
  fetch: (params?: any) => {
    return callApi('admin/hrm/dexuat', {
      method: 'GET',
      data: params
    })
  },
  create: (params: any) => {
    return callApi('admin/hrm/dexuat/create', {
      method: 'POST',
      data: params
    })
  },
  submitBinhLuan: (params: any) => {
    return callApi('admin/hrm/dexuat/store_comment', {
      method: 'POST',
      data: params
    })
  },
  updateBinhLuan: (idBinhLuan: string, params: any) => {
    return callApi(`admin/hrm/dexuat/update_comment/${idBinhLuan}`, {
      method: 'POST',
      data: params
    })
  },
  deleteBinhLuan: (ids: string[]) => {
    return callApi('admin/hrm/dexuat/delete_comment', {
      method: 'POST',
      data: { ids }
    })
  },
  getDetail: (id: string) => {
    return callApi(`admin/hrm/dexuat/detail/${id}`, {
      method: 'GET'
    })
  },
  getLoaiDeXuat: () => {
    return callApi('admin/hrm/danhmucdexuat', {
      method: 'GET'
    })
  },
  approve: (id: string, params: any) => {
    return callApi(`admin/hrm/dexuat/duyet/${id}`, {
      method: 'POST',
      data: params
    })
  },
  update: (id: string, params: any) => {
    return callApi(`admin/hrm/dexuat/update/${id}`, {
      method: 'POST',
      data: params
    })
  },
  getCreators: () => {
    return callApi('admin/hrm/dexuat/get_created_by', {
      method: 'GET'
    })
  },
  sendOtpApproval: (id: string | number) => {
    return callApi(`admin/hrm/dexuat/send_otp_approval/${id}`, {
      method: 'GET'
    })
  },
  verifyOtpApproval: (id: string | number, otp: string) => {
    return callApi('admin/hrm/dexuat/verify_otp_approval', {
      method: 'POST',
      data: { id_de_xuat: id, otp_code: otp }
    })
  },
  getBinhLuan: () => {
    return callApi('admin/hrm/dexuat/get_binh_luan', {
      method: 'GET'
    })
  },
  sendEmail: (id: string | number, cap_gui?: number) => {
    return callApi('admin/hrm/dexuat/send_email', {
      method: 'POST',
      data: { id_de_xuat: id, ...(cap_gui !== undefined ? { cap_gui } : {}) }
    })
  },
  lichSu: (payload?: object) => {
    return callApi('admin/hrm/dexuat/view_log', {
      method: 'GET',
      data: payload
    })
  }
}
