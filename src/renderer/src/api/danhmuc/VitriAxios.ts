import { callApi } from '../callApi'

export const VitriAxios = {
  fetch: (payload: object = {}) => {
    return callApi('admin/danhmuc/vitricongviec', {
      method: 'GET',
      data: payload
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/vitricongviec', {
      method: 'POST',
      data: data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/vitricongviec/${id}`, {
      method: 'PUT',
      data: data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/vitricongviec/${id}`, {
      method: 'DELETE'
    })
  }
}

export const mapVitriOptions = async () => {
  const res = await VitriAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.id_vi_tri_cong_viec,
      label: item.ten_cong_viec || ''
    })) || []
  )
}
