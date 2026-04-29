import { callApi } from '@renderer/api/callApi'

export const vitricongviecAxios = {
    fetch: (payload: object) => {
        return callApi('admin/danhmuc/vitricongviec', {
            method: 'GET',
            data: payload
        })
    },
    show: (id: number | string) => {
        return callApi('admin/danhmuc/vitricongviec', {
            method: 'GET',
            data: {
                id_vi_tri_cong_viec: id,
                show: true
            }
        })
    },
    create: (data: object) => {
        return callApi('admin/danhmuc/vitricongviec/create', {
            method: 'POST',
            data
        })
    },
    update: (id: number | string, data: object) => {
        return callApi(`admin/danhmuc/vitricongviec/update/${id}`, {
            method: 'POST',
            data
        })
    },
    delete: (id: number | string) => {
        return callApi(`admin/danhmuc/vitricongviec/delete/${id}`, {
            method: 'DELETE'
        })
    }
}
