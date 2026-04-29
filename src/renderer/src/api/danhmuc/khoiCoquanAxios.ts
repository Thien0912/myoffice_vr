import { callApi } from '../callApi'

export const khoiCoquanAxios = {
  fetch: () => {
    return callApi('admin/danhmuc/khoicoquan', {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/khoicoquan', {
      method: 'POST',
      data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/khoicoquan/${id}`, {
      method: 'PUT',
      data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/khoicoquan/${id}`, {
      method: 'DELETE'
    })
  }
}
export const mapOptionsKhoiCoquan = async () => {
  const res = await khoiCoquanAxios.fetch()
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.id_khoi_co_quan,
      label: item.ten_khoi_co_quan
    })) || []
  )
}
