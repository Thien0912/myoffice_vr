import { callApi } from '@renderer/api/callApi'

export interface LoginLog {
  id: number
  ql_nguoi_dung_id: number
  ip_address: string
  user_agent: string
  created_at: string
  ql_nguoi_dung_ho_ten: string
  ql_nguoi_dung_email: string
  ql_nguoi_dung_avatar: string
}

export interface DepartmentStat {
  don_vi: string
  login_count: number
  user_count: number
}

export interface TopUser {
  ql_nguoi_dung_id: number
  ql_nguoi_dung_ho_ten: string
  ql_nguoi_dung_email: string
  ql_nguoi_dung_avatar: string
  don_vi: string
  login_count: number
}

export interface DailyStat {
  date: string
  login_count: number
  user_count: number
}

export interface LoginStatistics {
  summary: {
    total_logins: number
    total_users: number
  }
  by_department: DepartmentStat[]
  top_users: TopUser[]
  daily_stats: DailyStat[]
}

export const loginLogsAxios = {
  getLogs: (params: {
    page?: number
    per_page?: number
    user_id?: number
    search?: string
    start_date?: string
    end_date?: string
  }) => {
    return callApi('admin/system/loginlogs', {
      method: 'GET',
      data: params
    })
  },

  getStatistics: (params?: {
    start_date?: string
    end_date?: string
  }) => {
    return callApi('admin/system/loginlogs/statistics', {
      method: 'GET',
      data: params
    })
  }
}
