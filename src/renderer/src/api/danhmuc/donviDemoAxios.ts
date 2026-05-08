import { callApi } from '../callApi'

export const PhongBanAxios = {
  fetch: (payload: object = {}) => {
    return callApi('admin/danhmuc/phongban', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: number | string) => {
    return callApi(`admin/danhmuc/phongban/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/phongban/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/phongban/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/phongban/delete/${id}`, {
      method: 'DELETE'
    })
  }
}

export const TrungTamAxios = {
  fetch: (payload: object = {}) => {
    return callApi('admin/danhmuc/trungtam', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: number | string) => {
    return callApi(`admin/danhmuc/trungtam/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/trungtam/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/trungtam/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/trungtam/delete/${id}`, {
      method: 'DELETE'
    })
  }
}

export const TruongAxios = {
  fetch: (payload: object = {}) => {
    return callApi('admin/danhmuc/truong', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: number | string) => {
    return callApi(`admin/danhmuc/truong/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/truong/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/truong/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/truong/delete/${id}`, {
      method: 'DELETE'
    })
  }
}

export const KhoaAxios = {
  fetch: (payload: object = {}) => {
    return callApi('admin/danhmuc/khoa', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: number | string) => {
    return callApi(`admin/danhmuc/khoa/show/${id}`, {
      method: 'GET'
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/khoa/create', {
      method: 'POST',
      data: data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/khoa/update/${id}`, {
      method: 'POST',
      data: data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/khoa/delete/${id}`, {
      method: 'DELETE'
    })
  },
  getByTruong: (idTruong: number | string) => {
    return callApi(`admin/danhmuc/khoa/theotruong/${idTruong}`, {
      method: 'GET'
    })
  }
}
