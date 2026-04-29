import { callApi } from '@renderer/api/callApi'

export interface YeuCauCapNhat {
    id_nhan_vien: string
    ma_nhan_vien: string
    ho_va_ten: string
    gioi_tinh: string
    ngay_sinh: string | null
    trinh_do_dt: string | null
    noi_dt: string | null
    email: string
    id_yeu_cau_cap_nhat: string
    du_lieu: string
    trang_thai: string
    nguoi_duyet: string | null
    ngay_tao: string
    ngay_cap_nhat: string | null
    ql_nguoi_dung_ho_ten: string | null
}

export interface YeuCauCapNhatResponse {
    status: number
    message: string
    success: boolean
    data: YeuCauCapNhat[]
    recordsTotal: number
    recordsFiltered: number
}

export interface LichSuChinhSua {
    id_yeu_cau_cap_nhat: string
    id_nhan_vien: string
    ma_nhan_vien: string
    ho_va_ten: string
    email: string
    gioi_tinh: string
    du_lieu: string
    trang_thai: string
    nguoi_duyet: string | null
    ql_nguoi_dung_ho_ten: string | null
    ngay_tao: string
    ngay_cap_nhat: string | null
}

export interface LichSuChinhSuaResponse {
    status: number
    message: string
    success: boolean
    data: LichSuChinhSua[]
    recordsTotal: number
    recordsFiltered: number
}

export const nhanvientucapnhatAxios = {
    fetch: (params?: any): Promise<YeuCauCapNhatResponse> => {
        return callApi('admin/hrm/nhanvientucapnhat', {
            method: 'GET',
            data: params
        })
    },
    duyet: (params: { id_yeu_cau_cap_nhat: string; trang_thai: number }) => {
        return callApi('admin/hrm/nhanvientucapnhat/duyet', {
            method: 'POST',
            data: params
        })
    },
    duyetNhieu: (params: { ids_yeu_cau_cap_nhat: string[]; trang_thai: number }) => {
        return callApi('admin/hrm/nhanvientucapnhat/duyet_nhieu', {
            method: 'POST',
            data: params
        })
    },
    duyetCapNhat: (id_yeu_cau_cap_nhat: string | number) => {
        return callApi('admin/hrm/nhanvientucapnhat/duyet', {
            method: 'POST',
            data: {
                id_yeu_cau_cap_nhat,
                trang_thai: 1
            }
        })
    },
    tuchoi: (id_yeu_cau_cap_nhat: string | number) => {
        return callApi('admin/hrm/nhanvientucapnhat/tuchoi', {
            method: 'POST',
            data: {
                id_yeu_cau_cap_nhat,
                trang_thai: 2
            }
        })
    },
    fetchLichSuDaDuyet: (params: { start: number; length: number }): Promise<LichSuChinhSuaResponse> => {
        return callApi('admin/hrm/nhanvientucapnhat', {
            method: 'GET',
            data: {
                ...params,
                trang_thai: 1 // Only approved
            }
        })
    }
}
