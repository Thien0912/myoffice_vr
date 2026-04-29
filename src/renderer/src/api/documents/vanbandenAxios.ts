import { callApi } from '../callApi'

export const INITIAL_VISIBLE_COLUMNS = [
  // 'id_van_ban',
  'actions',
  'ten_nguoi_tao',
  'so_van_ban',
  'so_hieu_van_ban',
  'trich_yeu'
  // 'trang_thai'
]

export interface TableColumn {
  uid: string
  name: string
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row?: any) => React.ReactNode
}

export const columns: TableColumn[] = [
  // { uid: 'id_van_ban', name: '', className: 'w-5_' },
  { uid: 'ten_nguoi_tao', name: 'Người soạn', className: '' },
  { uid: 'so_van_ban', name: 'Số đến', className: '' },
  { uid: 'so_hieu_van_ban', name: 'Số hiệu', className: '' },
  { uid: 'trich_yeu', name: 'Trích yếu', className: '' },
  { uid: 'trang_thai', name: 'Trạng thái', className: '' },
  { uid: 'ten_tinh_chat', name: 'Tính chất', className: 'w-20_' },
  { uid: 'ten_bao_mat', name: 'Bảo mật', className: 'w-20_' },
  { uid: 'ngay_ban_hanh', name: 'Ngày ban hành', className: 'w-26_' }
]

export const vanbandenAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/vanban/vanbanden', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/vanban/vanbanden/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    const form = data as FormData
    const trang_thai = form.get('trang_thai')
    if (!trang_thai) form.set('trang_thai', 'CHO_LANH_DAO_BUT_PHE')

    return callApi('admin/vanban/vanbanden/create', {
      method: 'POST',
      data: form
    })
  },
  update: (id: string | number, data: object) => {
    return callApi(`admin/vanban/vanbanden/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  changeStatus: (id: string | number, status: string) => {
    return callApi(`admin/vanban/vanbanden/change_status/${id}`, {
      method: 'PUT',
      data: { trang_thai: status }
    })
  },
  revoke: (data: object) => {
    return callApi(`admin/vanban/vanbanden/revoke`, {
      method: 'POST',
      data: data
    })
  },
  restore: (data: object) => {
    return callApi(`admin/vanban/vanbanden/restore`, {
      method: 'POST',
      data: data
    })
  },
  moveToTrash: (data: object) => {
    return callApi(`admin/vanban/vanbanden/move_to_trash`, {
      method: 'POST',
      data: data
    })
  },
  createButphe: (id: string | number, data: object) => {
    return callApi(`admin/vanban/vanbanden/tao_butphe/${id}`, {
      method: 'POST',
      data: data
    })
  },
  createXuly: (id: string | number, data: object) => {
    return callApi(`admin/vanban/vanbanden/xuly_vanban/${id}`, {
      method: 'POST',
      data: data
    })
  },
  createPhanhoi: (id: string | number, data?: object) => {
    if (!id) {
      console.error('Không có id hoặc dữ liệu gửi lên')
      return Promise.reject('Không có id hoặc dữ liệu gửi lên')
    }
    return callApi(`admin/vanban/vanbanden/bao_cao_phan_hoi_create`, {
      method: 'POST',
      data: data
    })
  },
  cloneVanban: (id: string | number) => {
    return callApi(`admin/vanban/vanbanden/cloneDocument/${id}`, {
      method: 'GET'
    })
  },
  files: (payload?: object) => {
    // Lấy danh sách file đính kèm
    return callApi(`admin/vanban/vanbanden/files_v2`, {
      method: 'POST',
      data: payload
    })
  },
  view_log: (id: string | number) => {
    return callApi(`admin/vanban/vanbanden/view_log?id_van_ban=${id}`, {
      method: 'GET'
    })
  },
  export: (payload?: object) => {
    return callApi('admin/vanban/vanbanden/export', {
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
    return callApi('admin/vanban/vanbanden/import', {
      method: 'POST',
      data: formData
    })
  }
}
