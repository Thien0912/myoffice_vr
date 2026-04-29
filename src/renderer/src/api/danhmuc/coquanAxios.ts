import { callApi } from '../callApi'

export const coquanAxios = {
  fetch: (params: object = {}, id: string | number | null = null) => {
    return callApi(id ? `admin/danhmuc/coquan?id=${id}` : 'admin/danhmuc/coquan', {
      method: 'GET',
      data: params
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/coquan/create', {
      method: 'POST',
      data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/coquan/update/${id}`, {
      method: 'POST',
      data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/coquan/delete/${id}`, {
      method: 'POST'
    })
  }
}

export const mapOptionsCoquan = async () => {
  const res = await coquanAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.id_co_quan,
      label: item.ten_co_quan
    })) || []
  )
}
