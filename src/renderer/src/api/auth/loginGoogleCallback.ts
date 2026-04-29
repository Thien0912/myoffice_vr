import { callApi } from '../callApi'

interface AccessUrl {
  ql_quyen_icon: string | null
  ql_quyen_loai_module: string
  ql_quyen_ten: string
  ql_quyen_ten_tieng_anh: string | null
  ql_quyen_thu_tu_hien_thi_chuc_nang: string | null
  ql_quyen_url: string
}

interface GoogleResponse {
  status: number
  message: string
  success: boolean
  data?: {
    access_urls: AccessUrl[]
    permission_keys: string[]
    public_key: string
    tags: any[]
    token: string
    role_code: string[]
    user: {
      ql_nguoi_dung_id: string
      ql_nguoi_dung_ho_ten: string
      ql_nguoi_dung_email: string
      ql_nguoi_dung_avatar: string | null
      ql_nguoi_dung_loai: string
      id_don_vi: string
      ten_don_vi: string
      ten_viet_tat: string
      ten_don_vi_en: string
      email: string
      ten_cong_viec: string
      [key: string]: any // phòng khi server có thêm field khác
    }
  }
}

const loginGoogleCallback = async (queryString?: string): Promise<GoogleResponse | any> => {
  const json = await callApi(`authentication/login_google${queryString}`)
  return json
}

export default loginGoogleCallback
