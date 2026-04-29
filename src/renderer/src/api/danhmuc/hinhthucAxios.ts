import { callApi } from '../callApi'

export const hinhthucAxios = {
  fetch: (params: object = {}, id: string | number | null = null) => {
    return callApi(id ? `admin/danhmuc/hinhthuc?id=${id}` : 'admin/danhmuc/hinhthuc', {
      method: 'GET',
      data: params
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/hinhthuc/create', {
      method: 'POST',
      data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/hinhthuc/update/${id}`, {
      method: 'POST',
      data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/hinhthuc/delete/${id}`, {
      method: 'POST'
    })
  }
}

export const mapOptionsHinhThuc = async () => {
  const res = await hinhthucAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.id_hinh_thuc,
      label: item.ten_hinh_thuc || ''
    })) || []
  )
}
