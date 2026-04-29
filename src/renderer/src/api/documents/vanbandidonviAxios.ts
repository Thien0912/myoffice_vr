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

export const vanbandidonviAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/vanban/vanbandidonvi', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/vanban/vanbandidonvi/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/vanban/vanbandidonvi/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/vanban/vanbandidonvi/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  moveToTrash: (data: object) => {
    return callApi('admin/vanban/vanbandidonvi/move_to_trash', {
      method: 'POST',
      data: data
    })
  },
  delete: (data: object) => {
    return callApi('admin/vanban/vanbandidonvi/delete', {
      method: 'POST',
      data: data
    })
  },
  cloneVanban: (id: string | number) => {
    return callApi(`admin/vanban/vanbandidonvi/cloneDocument/${id}`, {
      method: 'GET'
    })
  }
}
