import { callApi } from '../callApi'

export const vanbandaxoaAxios = {
  fetch: (payload?: object) => {
    return callApi('admin/vanban/vanbandaxoa', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: string | number) => {
    return callApi(`admin/vanban/vanbandaxoa/show/${id}`, {
      method: 'GET'
    })
  },
  files: (payload?: object) => {
    return callApi(`admin/vanban/vanbandaxoa/files_v2`, {
      method: 'POST',
      data: payload
    })
  },
  restore: (id: string | number) => {
    return callApi('admin/vanban/vanbandaxoa/restore', {
      method: 'POST',
      data: { id_van_ban: id }
    })
  },
  deletePermanently: (id: string | number) => {
    return callApi('admin/vanban/vanbandaxoa/delete', {
      method: 'POST',
      data: { id_van_ban: id }
    })
  }
}
