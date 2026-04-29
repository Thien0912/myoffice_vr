import { callApi } from '../callApi'

export const nguoidungAxios = {
  fetch: (payload: any = {}) => {
    return callApi('admin/danhmuc/nguoidung', {
      method: 'GET',
      data: payload
    })
  }
}

export const lanhdaoAxios = () => {
  const response = callApi('admin/danhmuc/nguoidung?user_type=lanh_dao', {
    method: 'GET'
  })
  return response
}

export async function mapLanhDao() {
  const res = await lanhdaoAxios()
  if (!res?.success) return []

  const { data, hoc_ham_hoc_vi } = res

  // Tạo map cho tên viết tắt học hàm/học vị
  const hocViMap = new Map(
    hoc_ham_hoc_vi.map((item: any) => [item.ten_day_du.trim(), item.ten_viet_tat])
  )

  // Map dữ liệu người dùng
  return data.map((user: any) => {
    const vietTat = hocViMap.get(user.trinh_do_dt?.trim() || '') || ''
    const name = vietTat ? `${vietTat} ${user.ql_nguoi_dung_ho_ten}` : user.ql_nguoi_dung_ho_ten

    return {
      id: user.ql_nguoi_dung_id,
      name
    }
  })
}
