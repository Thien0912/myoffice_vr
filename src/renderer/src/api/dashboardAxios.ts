import { callApi } from './callApi'

export const dashboardAxios = {
  fetchStats: (params?: Record<string, any>) => {
    return callApi('admin/trangchu/dashboard/thongkevanban_v2', {
      method: 'GET',
      data: params
    })
  }
}
