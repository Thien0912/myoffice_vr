import { callApi } from '../callApi'

export const khoaDaoTaoAxios = {
  fetch: (payload: object = {}) => {
    return callApi('admin/hrm/daotao/khoadaotao', {
      method: 'GET',
      data: payload
    })
  },
  create: (data: object) => {
    return callApi('admin/hrm/daotao/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/hrm/daotao/edit_nhanvien_daotao/${id}`, {
      method: 'PUT',
      data: data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/hrm/daotao/${id}`, {
      method: 'DELETE'
    })
  }
}

export const mapOptions = async () => {
  const res = await khoaDaoTaoAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.id_vi_tri_cong_viec,
      label: item.ten_khoa || ''
    })) || []
  )
}
