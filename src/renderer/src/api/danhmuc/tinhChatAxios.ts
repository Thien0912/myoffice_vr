import { callApi } from '../callApi'

export const tinhchatAxios = {
  fetch: (params: object = {}, id: string | number | null = null) => {
    return callApi(id ? `admin/danhmuc/tinhchat?id=${id}` : 'admin/danhmuc/tinhchat', {
      method: 'GET',
      data: params
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/tinhchat/create', {
      method: 'POST',
      data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/tinhchat/update/${id}`, {
      method: 'POST',
      data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/tinhchat/delete/${id}`, {
      method: 'POST'
    })
  }
}

export const mapOptionsTinhChat = async () => {
  const res = await tinhchatAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.id_tinh_chat,
      label: item.ten_tinh_chat || ''
    })) || []
  )
}
