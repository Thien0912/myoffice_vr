import { callApi } from '../callApi'

/*
Danh mục Quốc gia, Danh mục Dân tộc, Danh mục Tôn giáo
*/

export const dantocAxios = {
  fetch: (payload: object = {}) => {
    return callApi('admin/danhmuc/dantoc', {
      method: 'GET',
      data: payload
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/dantoc', {
      method: 'POST',
      data: data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/dantoc/${id}`, {
      method: 'PUT',
      data: data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/dantoc/${id}`, {
      method: 'DELETE'
    })
  }
}

export const mapDantocOptions = async () => {
  const res = await dantocAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.id_dan_toc,
      label: item.ten || ''
    })) || []
  )
}

export const quocgiaAxios = {
  fetch: (payload: object = {}) => {
    return callApi('admin/danhmuc/quocgia', {
      method: 'GET',
      data: payload
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/quocgia', {
      method: 'POST',
      data: data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/quocgia/${id}`, {
      method: 'PUT',
      data: data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/quocgia/${id}`, {
      method: 'DELETE'
    })
  }
}

export const mapQuocgiaOptions = async () => {
  const res = await quocgiaAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.id_quoc_gia,
      label: item.ten || ''
    })) || []
  )
}

export const tongiaoAxios = {
  fetch: (payload: object = {}) => {
    return callApi('admin/danhmuc/tongiao', {
      method: 'GET',
      data: payload
    })
  },
  create: (data: object) => {
    return callApi('admin/danhmuc/tongiao', {
      method: 'POST',
      data: data
    })
  },
  update: (id: number | string, data: object) => {
    return callApi(`admin/danhmuc/tongiao/${id}`, {
      method: 'PUT',
      data: data
    })
  },
  delete: (id: number | string) => {
    return callApi(`admin/danhmuc/tongiao/${id}`, {
      method: 'DELETE'
    })
  }
}

export const mapTongiaoOptions = async () => {
  const res = await tongiaoAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.id_ton_giao,
      label: item.ten || ''
    })) || []
  )
}

export const tinhThanhAxios = {
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

export const mapTinhThanhAxios = async () => {
  const res = await tinhThanhAxios.fetch({ length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.province_code,
      label: item.short_name || ''
    })) || []
  )
}

export const QuanhuyenxaAxios = {
  getByPro: (province_code: string, payload: object = {}) => {
    return callApi(`administrative/ward?province_code=${province_code}`, {
      method: 'GET',
      data: payload
    })
  }
}

export const mapQuanhuyenxaAxios = async (province_code: string) => {
  const res = await QuanhuyenxaAxios.getByPro(province_code, { length: 9999 })
  if (!res?.success) return []
  return (
    res?.data?.map((item: any) => ({
      value: item.ward_code,
      label: item.name || '',
      district_code: item.district_code || ''
    })) || []
  )
}
