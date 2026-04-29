import { callApi } from '@renderer/api/callApi'

export const bangChamCongAxios = {
  fetch: (params?: {
    start?: number
    length?: number
    search?: { value?: string }
    order?: Array<{ column: number; dir: 'asc' | 'desc' }>
    columns?: Array<{ data: string }>
    tab?: string
    from_date?: string
    to_date?: string
    date?: string
    id_don_vi?: string
    draw?: number
  }) => {
    return callApi('admin/hrm/bangchamcong', {
      method: 'GET',
      data: params
    })
  },

  exportExcel: (params: {
    from_date?: string
    to_date?: string
    date?: string
    id_don_vi?: string
    id_nhan_vien?: string
    tab?: string
  }) => {
    return callApi('admin/hrm/bangchamcong/export_excel', {
      method: 'POST',
      data: {
        searchKey: params
      }
    })
  }
}
