import { callApi } from '../callApi'

export const baomatAxios = {
  fetch: (params: object = {}, id: string | number | null = null) => {
    return callApi(id ? `admin/danhmuc/baomat?id=${id}` : 'admin/danhmuc/baomat', {
      method: 'GET',
      data: params
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/baomat/create', {
      method: 'POST',
      data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/baomat/update/${id}`, {
      method: 'POST',
      data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/baomat/delete/${id}`, {
      method: 'POST'
    })
  }
}

export const mapOptionsBaoMat = async () => {
  const res = await baomatAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.id_bao_mat,
      label: item.ten_bao_mat || ''
    })) || []
  )
}
