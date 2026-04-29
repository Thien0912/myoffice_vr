import axios from 'axios'

interface AccessUrl {
  ql_quyen_icon: string | null
  ql_quyen_url: string
  ql_quyen_loai_module: string
  ql_quyen_thu_tu_hien_thi_chuc_nang: string | null
  ql_quyen_ten: string
  ql_quyen_ten_tieng_anh: string | null
}

interface ZaloResponse {
  status: number
  message: string
  success: boolean
  data?: {
    access_urls: AccessUrl[]
    permission_keys: string[]
    public_key: string
    tag: any
    token: string
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

const loginZaloCallback = async (): Promise<ZaloResponse> => {
  const queryString = new URLSearchParams(window.location.search)

  const code = queryString.get('code') ?? ''
  // ZaloCallback.tsx
  const verifier = sessionStorage.getItem('zalo_code_verifier') ?? ''

  const res = await axios.post(
    'https://myoffice.sandboxnctu.qzz.io/api/api/v1/authentication/loginZaloCallbackReact',
    {
      code: code,
      code_verifier: verifier
      // email: '5tannguyenhuu@gmail.com' // lấy từ localStorage
    }
  )

  // Lưu token hoặc thông tin user
  localStorage.setItem('zalo_token', JSON.stringify(res.data))

  return res.data
}

export default loginZaloCallback
