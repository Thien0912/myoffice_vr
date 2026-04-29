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
  { uid: 'nguoi_tao_ho_ten', name: 'Người soạn', className: '' },
  { uid: 'so_van_ban', name: 'Số đến', className: '' },
  { uid: 'so_hieu_van_ban', name: 'Số hiệu', className: '' },
  { uid: 'trich_yeu', name: 'Trích yếu', className: '' },
  { uid: 'trang_thai', name: 'Trạng thái', className: '' },
  { uid: 'ten_tinh_chat', name: 'Tính chất', className: 'w-20_' },
  { uid: 'ten_bao_mat', name: 'Bảo mật', className: 'w-20_' },
  { uid: 'ngay_ban_hanh', name: 'Ngày ban hành', className: 'w-26_' }
]

export const vanbannoiboAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/vanban/vanbannoibo', {
      method: 'GET',
      data: payload
    })
  },
  create: (data: object) => {
    return callApi('admin/vanban/vanbannoibo/create', {
      method: 'POST',
      data: data
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/vanban/vanbannoibo/show/${id}`, {
      method: 'GET'
    })
  },
  moveToTrash: (data: object) => {
    return callApi('admin/vanban/vanbannoibo/move_to_trash', {
      method: 'POST',
      data: data
    })
  },
  restore: (data: object) => {
    return callApi('admin/vanban/vanbannoibo/restore', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/vanban/vanbannoibo/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  files: (payload?: object) => {
    // Lấy danh sách file đính kèm
    return callApi(`admin/vanban/vanbannoibo/files_v2`, {
      method: 'POST',
      data: payload
    })
  },
  cloneVanban: (id: string | number) => {
    return callApi(`admin/vanban/vanbannoibo/cloneDocument/${id}`, {
      method: 'GET'
    })
  }
}

// export const vanbannoiboAxios2 = {
//   fetch: (payload?: object) => {
//     return callApi('admin/vanban/vanbandi', {
//       method: 'GET',
//       data: payload
//     })
//   },
//   create: (data: object) => {
//     return callApi('admin/vanban/vanbandi/create', {
//       method: 'POST',
//       data: data
//     })
//   },
//   update: (id: string | number, data: object) => {
//     return callApi(`admin/vanban/vanbandi/update/${id}`, {
//       method: 'POST',
//       data: data
//     })
//   },
//   delete: (id: string | number, data: object) => {
//     return callApi(`admin/vanban/vanbandi/delete/${id}`, {
//       method: 'POST',
//       data: data
//     })
//   },
//   createButphe: (id: string | number, data: object) => {
//     return callApi(`admin/vanban/vanbandi/create-butphe/${id}`, {
//       method: 'POST',
//       data: data
//     })
//   },
//   createXuly: (id: string | number, data: object) => {
//     return callApi(`admin/vanban/vanbandi/xuly_vanban/${id}`, {
//       method: 'POST',
//       data: data
//     })
//   }
// }
