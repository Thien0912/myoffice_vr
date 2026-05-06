// api.ts
import axios, { AxiosRequestConfig, Method } from 'axios'

import { CookieService } from '@renderer/utils/cookieService'
import { refreshTokenSSO } from './auth/SSOCallback'

interface CallApiOptions {
  method?: Method
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
  throwException?: boolean
  debug?: boolean
  withCredentials?: boolean
}

// Lấy baseURL từ file .env giống PHP
const apiUrl = import.meta.env.VITE_API_URL

export const callApi = async (
  endpoint: string,
  {
    method = 'GET',
    data = {},
    params = {},
    headers = {},
    timeout = 30000,
    throwException = false,
    debug = false,
    withCredentials = true
  }: CallApiOptions = {}
): Promise<any> => {
  const token = CookieService.get('token') || ''

  // Chuẩn hóa endpoint
  if (endpoint.startsWith('/')) endpoint = endpoint.slice(1)

  const url = `${apiUrl}${endpoint}`

  // 🧠 Header mặc định (giống bên PHP)
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'DHNCT-API-KEY': '@cntt@dhnct@'
  }

  // Nếu có token => thêm vào header
  if (token) {
    // defaultHeaders['DHNCT-Authorization'] = token
    // defaultHeaders['sso-authorization'] = token
  }

  // Gộp header mặc định và header truyền vào
  const finalHeaders = { ...defaultHeaders, ...headers }

  // ❗ Nếu là FormData => để axios tự set Content-Type
  if (data instanceof FormData) {
    delete finalHeaders['Content-Type']
  }

  // Cấu hình axios
  const config: AxiosRequestConfig = {
    url,
    method,
    headers: finalHeaders,
    timeout,
    data,
    params,
    withCredentials: withCredentials // 🍪 Cho phép nhận và gửi cookie
  }

  if (method.toUpperCase() === 'GET') {
    config.params = data // 👈 GET => đưa vào query string
  } else {
    // 👈 POST, PUT => đưa vào payload, tránh gửi {} rỗng gây lỗi 500 ở một số PHP API
    const isEmptyPlainObject =
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      !(data instanceof FormData) &&
      Object.keys(data).length === 0
    config.data = isEmptyPlainObject ? undefined : data
  }

  // Nếu debug => in log
  if (debug) {
    console.log('🛰️ [API CALL]', config)
  }

  try {
    const response = await axios(config)
    if (debug) console.log('✅ [API RESPONSE]', response.data)
    return response.data
  } catch (error: any) {
    if (debug) console.error('❌ [API ERROR]', error)

    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        const refreshTokenCookie = CookieService.get('refresh_token')
        if (refreshTokenCookie && !(config as any)._retry) {
          ; (config as any)._retry = true
          try {
            await refreshTokenSSO(refreshTokenCookie)
            return await axios(config).then((res) => res.data)
          } catch (refreshError) {
            console.error('Refresh token failed:', refreshError)
          }
        }
        return {
          status: 401,
          message: 'Unauthorized_',
          success: false,
          data: null,
          redirect_url: '/login'
        }
      }
      if (status === 403) {
        return {
          status: 403,
          message: 'Không có quyền thực hiện',
          success: false,
          data: null,
          redirect_url: '/errors/error_403'
        }
      }
      return data
    }

    if (throwException) throw error
    return { error: error.message }
  }
}

export const customDataApi = (filters: any) => {
  return {
    searchValue: filters.searchValue,
    searchKey: JSON.stringify({
      searchValue: filters.searchValue,
      selectedClassify: filters.selectedClassify || 'all',
      so_van_ban: filters.so_van_ban || '',
      so_hieu_van_ban: filters.so_hieu_van_ban || '',
      trich_yeu: filters.trich_yeu || '',
      id_don_vi_xu_ly: filters.id_don_vi_xu_ly || '',
      id_don_vi_soan: filters.id_don_vi_soan || '',
      id_loai: filters.id_loai || '', // Văn bản đi
      loai_van_ban: filters.id_loai || '', // Văn bản đến
      year: filters.year || '',
      ngay_nhan_tu: filters.dateRange.fromReceive || '',
      ngay_nhan_den: filters.dateRange.toReceive || '',
      ngay_ky_tu: filters.dateRange.fromReceive || '',
      ngay_ky_den: filters.dateRange.toReceive || '',
      thoi_gian_xu_ly_tu: filters.dateRange.fromProcess || '',
      thoi_gian_xu_ly_den: filters.dateRange.toProcess || '',
      ngay_nhan: filters.ngay_nhan || '',
      thoi_gian_xu_ly: filters.thoi_gian_xu_ly || '',
      sortOrder: filters.sortOrder || ''
    }),
    fromDate: filters.dateRange.fromDate,
    toDate: filters.dateRange.toDate,
    order: customOrder(filters.orders || ''),
    start: (filters.page - 1) * (filters.length || 10),
    length: filters.length || 10
  }
}

function customOrder(order: any) {
  return order.map((item: any) => {
    return {
      column: item.column,
      dir: item.direction == 'ascending' ? 'asc' : 'desc'
    }
  })
}
