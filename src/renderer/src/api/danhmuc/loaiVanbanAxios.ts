import { useAuthStore } from '../../store/useAuthStore'
import { callApi } from '../callApi'

export const loaivanbanAxios = {
  fetch: (pau: object = {}) => {
    return callApi('admin/danhmuc/loai', {
      method: 'GET',
      data: pau
    })
  },
  fetchByUnitId: (pau: object = {}) => {
    return callApi('admin/danhmuc/loai', {
      method: 'GET',
      data: pau
    })
  },
  show: (id: number) => {
    return callApi(`admin/danhmuc/loai/show/${id}`, {
      method: 'GET',
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/loai/create', {
      method: 'POST',
      data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/loai/update/${id}`, {
      method: 'POST',
      data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/loai/${id}`, {
      method: 'DELETE'
    })
  }
}

const mappingLoaiVanBan = {
  DONVI: 'Đơn vị',
  BGH: 'Ban Giám Hiệu',
  HDT: 'Hội Đồng Trường',
  CTHDT: 'Chủ Tịch Hội Đồng Trường'
}

export const mapOptionsLoaiVanban = async (idDonViNguoiDung?: number | string) => {
  const idUnit = idDonViNguoiDung || useAuthStore.getState().user?.id_don_vi
  const res = await loaivanbanAxios.fetchByUnitId({
    theo_phong_ban: true,
    id_don_vi_nguoi_dung: idUnit
  })
  if (!res?.success) return []

  const newArray = {}
  res.data.forEach((item: any) => {
    if (!newArray[item.thuoc_nhom]) {
      newArray[item.thuoc_nhom] = [
        {
          value: item.id_loai,
          label: item.ten_loai
        }
      ]
    } else {
      newArray[item.thuoc_nhom].push({
        value: item.id_loai,
        label: item.ten_loai
      })
    }
  })

  return Object.keys(newArray).map((key: string) => ({
    label: mappingLoaiVanBan[key] || key,
    options: newArray[key]
  }))
}
