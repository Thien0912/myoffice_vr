import { callApi } from '../callApi'

export const INITIAL_VISIBLE_COLUMNS = ['ten_nguoi_tao', 'so_hieu_van_ban', 'trich_yeu']

export interface TableColumn {
  uid: string
  name: string
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row?: any) => React.ReactNode
}

export const columns: TableColumn[] = [
  { uid: 'ten_nguoi_tao', name: 'Người soạn', className: '' },
  { uid: 'so_van_ban', name: 'Số đến', className: '' },
  { uid: 'so_hieu_van_ban', name: 'Số hiệu', className: '' },
  { uid: 'trich_yeu', name: 'Trích yếu', className: '' },
  { uid: 'trang_thai', name: 'Trạng thái', className: '' },
  { uid: 'ten_tinh_chat', name: 'Tính chất', className: 'w-20_' },
  { uid: 'ten_bao_mat', name: 'Bảo mật', className: 'w-20_' },
  { uid: 'ngay_ban_hanh', name: 'Ngày ban hành', className: 'w-26_' }
]

export const vanbandiAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/vanban/vanbandi', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/vanban/vanbandi/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/vanban/vanbandi/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/vanban/vanbandi/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  moveToTrash: (data: object) => {
    return callApi('admin/vanban/vanbandi/move_to_trash', {
      method: 'POST',
      data: data
    })
  },
  delete: (data: object) => {
    return callApi('admin/vanban/vanbandi/delete', {
      method: 'POST',
      data: data
    })
  },
  revoke: (data: object) => {
    return callApi('admin/vanban/vanbandi/revoke', {
      method: 'POST',
      data: data
    })
  },
  restore: (data: object) => {
    return callApi('admin/vanban/vanbandi/restore', {
      method: 'POST',
      data: data
    })
  },
  cloneVanban: (id: string | number) => {
    return callApi(`admin/vanban/vanbandi/cloneDocument/${id}`, {
      method: 'GET'
    })
  },
  files: (payload?: object) => {
    // Lấy danh sách file đính kèm
    return callApi(`admin/vanban/vanbandi/files_v2`, {
      method: 'POST',
      data: payload
    })
  },
  view_log: (id: string | number) => {
    return callApi(`admin/vanban/vanbandi/view_log?id_van_ban=${id}`, {
      method: 'GET'
    })
  },
  update_by_key: (id: string | number, data: object) => {
    return callApi(`admin/vanban/vanbandi/update_by_key/${id}`, {
      method: 'POST',
      data: data
    })
  },
  export: (payload?: object) => {
    return callApi('admin/vanban/vanbandi/export', {
      method: 'GET',
      data: payload
    })
  },
  import: (data: any) => {
    const formData = new FormData()
    Object.keys(data).forEach((key) => {
      if (data[key]) {
        formData.append(key, data[key])
      }
    })
    return callApi('admin/vanban/vanbandi/import', {
      method: 'POST',
      data: formData
    })
  }
}
