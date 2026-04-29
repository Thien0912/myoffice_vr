import { callApi } from '../callApi'

export const tinhAxios = {
  fetch: (payload: object = {}) => {
    return callApi('administrative/province', {
      method: 'GET',
      data: payload
    })
  }
  // create: (data: object) => {
  //   return callApi('administrative/province', {
  //     method: 'POST',
  //     data: data
  //   })
  // },
  // update: (id: number | string, data: object) => {
  //   return callApi(`administrative/province/${id}`, {
  //     method: 'PUT',
  //     data: data
  //   })
  // },
  // delete: (id: number | string) => {
  //   return callApi(`administrative/province/${id}`, {
  //     method: 'DELETE'
  //   })
  // }
}

export const phuongAxios = {
  fetch: (payload: object = {}) => {
    return callApi('administrative/wards', {
      method: 'GET',
      data: payload
    })
  },
  show: (id: number) => {
    return callApi('administrative/ward', {
      method: 'GET',
      data: {
        province_code: id
      }
    })
  }
  // create: (data: object) => {
  //   return callApi('administrative/wards', {
  //     method: 'POST',
  //     data: data
  //   })
  // },
  // update: (id: number | string, data: object) => {
  //   return callApi(`administrative/wards/${id}`, {
  //     method: 'PUT',
  //     data: data
  //   })
  // },
  // delete: (id: number | string) => {
  //   return callApi(`administrative/wards/${id}`, {
  //     method: 'DELETE'
  //   })
  // }
}
