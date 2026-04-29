import { callApi } from '@renderer/api/callApi'

export interface MinhChungFile {
  id_minh_chung: number
  file_path: string
  file_name: string
  file_extension: string | null
  file_size: number | null
  created_at: string
}

export interface MinhChungCategory {
  id_loai_minh_chung: number
  ma_loai: string
  ten_loai: string
  thu_tu: number
  files: MinhChungFile[]
}

export interface LoaiMinhChung {
  id_loai_minh_chung: number
  ma_loai: string
  ten_loai: string
  thu_tu: number
}

export const minhchungAxios = {
  getLoai: (): Promise<any> => {
    return callApi('admin/hrm/minhchung/loai', {
      method: 'GET'
    })
  },

  getByNhanVien: (idNhanVien: number | string): Promise<any> => {
    return callApi(`admin/hrm/minhchung/show/${idNhanVien}`, {
      method: 'GET'
    })
  },

  upload: (params: {
    id_nhan_vien?: number | string
    id_yeu_cau_cap_nhat?: number | string
    id_loai_minh_chung: number | string
    files: any[]
  }): Promise<any> => {
    const formData = new FormData()
    if (params.id_nhan_vien) formData.append('id_nhan_vien', String(params.id_nhan_vien))
    if (params.id_yeu_cau_cap_nhat) formData.append('id_yeu_cau_cap_nhat', String(params.id_yeu_cau_cap_nhat))
    formData.append('id_loai_minh_chung', String(params.id_loai_minh_chung))
    params.files.forEach((fileItem, i) => {
      const actualFile = fileItem.file || fileItem
      formData.append(`files_minh_chung[${i}]`, actualFile, actualFile.name)
      if (fileItem.details) {
        formData.append(`files_minh_chung_details[${i}]`, JSON.stringify(fileItem.details))
      }
    })
    return callApi('admin/hrm/minhchung/create', {
      method: 'POST',
      data: formData
    })
  },

  delete: (idMinhChung: number | string): Promise<any> => {
    return callApi(`admin/hrm/minhchung/delete/${idMinhChung}`, {
      method: 'POST'
    })
  }
}
