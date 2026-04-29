import { callApi } from '../callApi'

export const DonviAxios = {
  fetch: (payload: object = {}) => {
    return callApi('admin/danhmuc/donvi', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: number | string) => {
    return callApi(`admin/danhmuc/donvi/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/donvi/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/donvi/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/donvi/${id}`, {
      method: 'DELETE'
    })
  },
  fetchTheoPhongBan: () => {
    return callApi('admin/danhmuc/donvi/theophongban', {
      method: 'GET'
    })
  },
  fetchTheoPhongBanV2: () => {
    return callApi('admin/danhmuc/donvi/theophongbanv2', {
      method: 'GET'
    })
  }
}

export const mapDonviOptions = async () => {
  const res = await DonviAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: String(item.id_don_vi),
      label: item.ten_don_vi || ''
    })) || []
  )
}

export const mapDonviGroupedOptions = async () => {
  const res = await DonviAxios.fetchTheoPhongBan()
  if (!res?.success || !Array.isArray(res.data)) return []

  // Backend trả về 'text' thay vì 'label', cần map lại cho đồng bộ
  return res.data.map((group: any) => ({
    label: group.label,
    options:
      group.options?.map((opt: any) => ({
        value: String(opt.value),
        label: opt.text || opt.label || ''
      })) || []
  }))
}

export const mapDonviGroupedOptionsV2 = async () => {
  const res = await DonviAxios.fetchTheoPhongBanV2()
  console.log(`res:::`, res)
  if (!res?.success || !Array.isArray(res.data)) return []

  return res.data.map((group: any) => ({
    label: group.label,
    options:
      group.options?.map((opt: any) => ({
        value: String(opt.value),
        label: opt.text || opt.label || ''
      })) || []
  }))
}

export const LOAI_DON_VI = {
  LANH_DAO: {
    label: 'Lãnh đạo',
    value: 'LANH_DAO',
    color: 'red'
  },
  PHONG: {
    label: 'Phòng',
    value: 'PHONG',
    color: 'green'
  },
  KHOA_BOMON: {
    label: 'Khoa/Bộ môn',
    value: 'KHOA_BOMON',
    color: 'yellow'
  },
  BAN: {
    label: 'Ban',
    value: 'BAN',
    color: 'red'
  },
  VIEN: {
    label: 'Viện',
    value: 'VIEN',
    color: 'red'
  },
  TRUNG_TAM: {
    label: 'Trung tâm',
    value: 'TRUNG_TAM',
    color: 'red'
  },
  DON_VI_KHAC: {
    label: 'Đơn vị khác',
    value: 'DON_VI_KHAC',
    color: 'red'
  }
} as const
