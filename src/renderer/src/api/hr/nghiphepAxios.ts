import { callApi } from '@renderer/api/callApi'

export const nghiphepAxios = {
  fetch: (params?: any) => {
    return callApi('admin/hrm/nghiphep', {
      method: 'GET',
      data: params
    })
  },
  getDetail: (uuid: string) => {
    return callApi(`admin/hrm/nghiphep/detail/${uuid}`, {
      method: 'GET'
    })
  },
  sync: (params: { path: string, uuid: string }) => {
    return callApi(`admin/hrm/nghiphep/sync`, {
      method: 'GET',
      data: params
    })
  },
  approve: (params: {
    uuids_nghi_phep: string | string[]
    hanh_dong: 'duyet' | 'tu_choi'
    ly_do?: string
  }) => {
    return callApi('admin/hrm/nghiphep/approve', {
      method: 'POST',
      data: params
    })
  },
  approve_on_behalf: (params: any) => {
    return callApi('admin/hrm/nghiphep/approve_on_behalf', {
      method: 'POST',
      data: params
    })
  },
  delete: (id: string | number) => {
    return callApi(`admin/hrm/nghiphep/delete/${id}`, {
      method: 'POST'
    })
  },
  recalls: (uuids: string[]) => {
    return callApi('admin/hrm/nghiphep/deletes', {
      method: 'POST',
      data: { uuids_nghi_phep: uuids }
    })
  },
  create: (params: any) => {
    return callApi('admin/hrm/nghiphep/create', {
      method: 'POST',
      data: params
    })
  },
  update: (params: any) => {
    return callApi('admin/hrm/nghiphep/update', {
      method: 'POST',
      data: params
    })
  },
  get_employee_by_unit: () => {
    return callApi('admin/hrm/nghiphep/get_employee_by_unit', {
      method: 'GET'
    })
  },
  getStatistics: (startDate: string, endDate: string, id_don_vi?: string, search?: string) => {
    const params: any = { start_date: startDate, end_date: endDate }
    if (id_don_vi && id_don_vi !== 'all') params.id_don_vi = id_don_vi
    if (search && search.trim()) params.search = search.trim()
    return callApi('admin/hrm/nghiphep/statistics', {
      method: 'GET',
      data: params
    })
  },
  thongKeDonVi: (params: { start_date?: string, end_date?: string, loai?: string, id_don_vi?: string | number, chi_tinh_da_duyet?: number }) => {
    return callApi('admin/hrm/nghiphep/thong_ke_don_vi', {
      method: 'POST',
      data: params
    })
  },
  donByNhanVien: (id_nhan_vien: string | number, params?: { start_date?: string, end_date?: string }) => {
    return callApi(`admin/hrm/nghiphep/don_by_nhan_vien/${id_nhan_vien}`, {
      method: 'GET',
      data: params
    })
  },
  getLeaveTypes: () => {
    return callApi('admin/hrm/nghiphep/get_leave_types', {
      method: 'GET'
    })
  },
  getApprovers: (uuid_nghi_phep: string | string[]) => {
    return callApi('admin/hrm/nghiphep/get_approvers', {
      method: 'GET',
      data: { uuid_nghi_phep }
    })
  },
  sendEmail: (uuid: string) => {
    return callApi('admin/hrm/nghiphep/send_approval_email', {
      method: 'POST',
      data: { uuid_nghi_phep: uuid }
    })
  },
  sendEmailAfterApproved: (params: {
    uuid_nghi_phep: string | string[]
    hanh_dong: 'duyet' | 'tu_choi'
    cap_duyet: number
  }) => {
    return callApi('admin/hrm/nghiphep/send_email_after_approved', {
      method: 'POST',
      data: params
    })
  },
  exportByUnit: (params: {
    year?: number
    month?: number | null
    start_date?: string
    end_date?: string
    id_loai_phep?: string | null
    ids_don_vi?: string | null
    co_tinh_luong?: number | null
  }) => {
    return callApi('admin/hrm/nghiphep/export_by_unit', {
      method: 'GET',
      data: params
    })
  },
  exportByEmployee: (params: {
    year: number
  }) => {
    return callApi('admin/hrm/nghiphep/export_by_employee', {
      method: 'GET',
      data: params
    })
  },
  exportByEmployeeIds: (params: {
    year: number
    employee_ids: string
  }) => {
    return callApi('admin/hrm/nghiphep/export_by_employee_ids', {
      method: 'GET',
      data: params
    })
  },
  minhChung: (params: { uuid_nghi_phep: string; minh_chung: File }) => {
    const formData = new FormData()
    formData.append('uuid_nghi_phep', params.uuid_nghi_phep)
    formData.append('minh_chung', params.minh_chung)
    return callApi('admin/hrm/nghiphep/minh_chung', {
      method: 'POST',
      data: formData
    })
  },
  downloadTemplate: () => {
    return callApi('admin/hrm/nghiphep/download_template', {
      method: 'GET'
    })
  },
  importExcel: (file: File) => {
    const formData = new FormData()
    formData.append('file_excel', file)
    return callApi('admin/hrm/nghiphep/import', {
      method: 'POST',
      data: formData
    })
  },
  submitPhucKhao: (params: FormData | any) => {
    return callApi('admin/hrm/nghiphep/submit_phuc_khao', {
      method: 'POST',
      data: params
    })
  }
}