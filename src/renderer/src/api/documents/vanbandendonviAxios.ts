import { callApi } from '../callApi'

export const INITIAL_VISIBLE_COLUMNS = [
  'ten_nguoi_tao',
  'so_van_ban',
  'so_hieu_van_ban',
  'trich_yeu'
]

export const vanbandendonviAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/vanban/vanbandendonvi', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/vanban/vanbandendonvi/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    if (!data) {
      console.error('Không có dữ liệu gửi lên')
      return Promise.reject('Không có dữ liệu gửi lên')
    }
    return callApi('admin/vanban/vanbandendonvi/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: string | number, data: object) => {
    if (!id || !data) {
      console.error('Không có id hoặc dữ liệu gửi lên')
      return Promise.reject('Không có id hoặc dữ liệu gửi lên')
    }
    return callApi(`admin/vanban/vanbandendonvi/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  moveToTrash: (data: object) => {
    return callApi(`admin/vanban/vanbandendonvi/move_to_trash`, {
      method: 'POST',
      data: data
    })
  },
  createXemvanban: (data?: object) => {
    if (!data) {
      console.error('Không có dữ liệu gửi lên')
      return Promise.reject('Không có dữ liệu gửi lên')
    }
    return callApi(`admin/vanban/vanbandendonvi/xem_van_ban`, {
      method: 'POST',
      data: data
    })
  },
  createPhanhoi: (id: string | number, data?: object) => {
    if (!id) {
      console.error('Không có id hoặc dữ liệu gửi lên')
      return Promise.reject('Không có id hoặc dữ liệu gửi lên')
    }
    if (data instanceof FormData) {
      data.append('id_van_ban', String(id))
    }
    return callApi(`admin/vanban/vanbandendonvi/bao_cao_phan_hoi_create`, {
      method: 'POST',
      data: data
    })
  },
  createPhanhoinhanh: (data?: object) => {
    if (!data) {
      console.error('Không có dữ liệu gửi lên')
      return Promise.reject('Không có dữ liệu gửi lên')
    }
    return callApi(`admin/vanban/vanbandendonvi/phan_hoi_nhanh_vanban`, {
      method: 'POST',
      data: data
    })
  },
  createXuly: (id: string | number, data: object) => {
    if (!id || !data) {
      console.error('Không có id hoặc dữ liệu gửi lên')
      return Promise.reject('Không có id hoặc dữ liệu gửi lên')
    }
    return callApi(`admin/vanban/vanbandendonvi/xuly_vanban/${id}`, {
      method: 'POST',
      data: data
    })
  },
  files: (payload?: object) => {
    // Lấy danh sách file đính kèm
    return callApi(`admin/vanban/vanbandendonvi/files_v2`, {
      method: 'POST',
      data: payload
    })
  },
  creators: () => {
    return callApi(`admin/vanban/vanbandendonvi/creators`, {
      method: 'GET'
    })
  },
  submitFeedback: (id: string | number, data: any) => {
    if (!id || !data) {
      console.error('Không có id hoặc dữ liệu gửi lên')
      return Promise.reject('Không có id hoặc dữ liệu gửi lên')
    }

    const formData = new FormData()
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key])
    })

    return callApi(`admin/vanban/vanbandendonvi/bao_cao_phan_hoi_create/${id}`, {
      method: 'POST',
      data: formData
    })
  },
  saveToInternal: (id: string | number) => {
    return callApi(`admin/vanban/vanbandendonvi/save_internal/${id}`, {
      method: 'POST'
    })
  }
}
