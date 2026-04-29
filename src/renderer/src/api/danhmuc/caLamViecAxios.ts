import { callApi } from '../callApi'

export const caLamViecAxios = {
  fetch: (payload: object = {}, id?: string | number) => {
    return callApi(`admin/hrm/calamviec${id ? '?id=' + id : ''}`, {
      method: 'GET',
      data: payload
    })
  },
  create: (payload: object) => {
    return callApi('admin/hrm/calamviec/them_ca', {
      method: 'POST',
      data: payload
    })
  },
  update: (id: string | number, payload: object) => {
    return callApi(`admin/hrm/calamviec/sua_ca?id=${id}`, {
      method: 'POST',
      data: payload
    })
  },
  // delete: (id: string | number) => {
  //   return callApi(`admin/hrm/calamviec/${id}`, {
  //     method: 'DELETE'
  //   })
  // }
}

export const mapCaLamViecOptions = async () => {
  const res = await caLamViecAxios.fetch()
  if (res?.status === 200 || res?.success) {
    const data = res.data || []
    return data.map((item: any) => ({
      value: String(item.id),
      label: item.ca_lam_viec
    }))
  }
  return []
}
