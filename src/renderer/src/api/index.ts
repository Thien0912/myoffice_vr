import axios from 'axios'
import { useAuthStore } from '@renderer/store/useAuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'DHNCT-API-KEY': '@cntt@dhnct@'
  }
})

// 🧠 Thêm interceptor để luôn lấy token mới nhất
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().user?.ql_nguoi_dung_token
    if (token) {
      config.headers['DHNCT-Authorization'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api
