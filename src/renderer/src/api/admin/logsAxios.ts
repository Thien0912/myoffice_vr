import { callApi } from '@renderer/api/callApi'

export interface LogEntry {
  ql_nhat_ky_id: number | string
  ql_nhat_ky_hanh_dong: string
  ql_nhat_ky_noi_dung: string
  ql_nhat_ky_gia_tri_cu?: string | null
  ql_nhat_ky_gia_tri_moi?: string | null
  ql_nhat_ky_bang_du_lieu?: string | null
  ql_nhat_ky_controller?: string | null
  ql_nhat_ky_ngay_tao: string
  ql_nguoi_dung_id?: number | string
  ql_nguoi_dung_ho_ten?: string
  ql_nguoi_dung_email?: string
}

export const logsAxios = {
  getLogs: async (params: any = {}) => {
    try {
      const response = await callApi('admin/ql/diaries', {
        method: 'GET',
        data: params
      })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  getLogDetails: async (id: string | number) => {
    try {
      const response = await callApi(`admin/ql/diaries/show/${id}`, {
        method: 'GET'
      })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
