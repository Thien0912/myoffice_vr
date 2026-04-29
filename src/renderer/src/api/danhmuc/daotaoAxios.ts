import { callApi } from '../callApi'

export const daotaoAxios = {
    fetch: (params: object = {}) => {
        return callApi('admin/hrm/daotao', {
            method: 'GET',
            data: params
        })
    },
    show: (id: string | number) => {
        return callApi(`admin/hrm/daotao/show/${id}`, {
            method: 'GET'
        })
    },
    create: (data: object) => {
        return callApi('admin/hrm/daotao/create', {
            method: 'POST',
            data
        })
    },
    update: (id: number | string, data: object) => {
        return callApi(`admin/hrm/daotao/update/${id}`, {
            method: 'POST',
            data
        })
    },
    delete: (id: number | string) => {
        return callApi(`admin/hrm/daotao/delete`, {
            method: 'POST',
            data: { ids: [id] }
        })
    }
}

export const mapOptionsDaoTao = async () => {
    const res = await daotaoAxios.fetch({ length: 9999 })
    if (!res?.success) return []
    return (
        res?.data?.map((item: any) => ({
            value: item.id_dao_tao,
            label: item.ten_khoa_hoc || ''
        })) || []
    )
}
