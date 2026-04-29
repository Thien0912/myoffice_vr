import { callApi } from '../callApi'

export const LoaiNghiPhepAxios = {
  fetch: (params: object = {}, id: string | number | null = null) => {
    return callApi(id ? `admin/danhmuc/hrm/danhmucloainghiphep?id=${id}` : 'admin/danhmuc/hrm/danhmucloainghiphep', {
      method: 'GET',
      data: params
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/hrm/danhmucloainghiphep/create', {
      method: 'POST',
      data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/hrm/danhmucloainghiphep/update/${id}`, {
      method: 'POST',
      data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/hrm/danhmucloainghiphep/delete/${id}`, {
      method: 'POST'
    })
  }
}

export const mapLoaiNghiPhepOptions = async () => {
  const res = await LoaiNghiPhepAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: String(item.id_loai_phep),
      label: item.ten_loai_phep || ''
    })) || []
  )
}
