import { callApi } from './callApi'

export const profileAxios = {
    getProfile: () => {
        return callApi('profile', {
            method: 'GET'
        })
    },
    yeucaucapnhat: (data: any) => {
        return callApi('profile/yeucaucapnhat', {
            method: 'POST',
            data: { payload: data }
        })
    },
    uploadAvatar: (avatar: File | string, id_yeu_cau?: string | number) => {
        const formData = new FormData()
        formData.append('avatar', avatar)
        if (id_yeu_cau) {
            formData.append('id_yeu_cau_cap_nhat', String(id_yeu_cau))
        }
        return callApi('profile/uploadavatar/upload_avatar', {
            method: 'POST',
            data: formData
        })
    },
    uploadMinhChungYeuCau: (file: File, id_loai_minh_chung: string | number, id_yeu_cau_cap_nhat: string | number, details?: any) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('id_loai_minh_chung', String(id_loai_minh_chung))
        formData.append('id_yeu_cau_cap_nhat', String(id_yeu_cau_cap_nhat))
        if(details) {
            formData.append('details', JSON.stringify(details))
        }
        
        return callApi('profile/uploadMinhChungYeuCau', {
            method: 'POST',
            data: formData
        })
    },
    uploadBangCapFile: (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        return callApi('profile/uploadBangCapFile', {
            method: 'POST',
            data: formData
        })
    },
    registerMinhChungFile: (
        filePath: string,
        fileName: string,
        fileSize: number,
        fileExtension: string,
        idLoaiMinhChung: string | number,
        idYeuCauCapNhat: string | number,
        details?: any
    ) => {
        return callApi('profile/registerMinhChungFile', {
            method: 'POST',
            data: {
                file_path: filePath,
                file_name: fileName,
                file_size: fileSize,
                file_extension: fileExtension,
                id_loai_minh_chung: String(idLoaiMinhChung),
                id_yeu_cau_cap_nhat: String(idYeuCauCapNhat),
                details: details ? JSON.stringify(details) : undefined,
            }
        })
    },
    fetch: (payload?: object) => {
        return callApi('profile', {
            method: 'GET',
            data: payload
        })
    },
    /** Request HR approval to delete one or more minh_chung files (batch) */
    requestDeleteMinhChung: (params: {
        items: { id_minh_chung: number; file_name?: string; loai_label?: string }[]
    }) => {
        return callApi('profile/requestDeleteMinhChung', {
            method: 'POST',
            data: params
        })
    },
}
