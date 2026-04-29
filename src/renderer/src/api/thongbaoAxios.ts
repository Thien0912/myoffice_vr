import { callApi } from './callApi'

export const thongbaoAxios = {
  fetch: (payload?: object) => {
    return callApi('notifications', {
      method: 'GET',
      data: payload
    })
  },
  updateStatus: (id: string, status: number) => {
    return callApi('admin/trangchu/Dashboard/cap_nhat_trang_thai', {
      method: 'POST',
      data: {
        id: id,
        trangthai: status
      }
    })
  },
  updateStar: (id: string, sao: number) => {
    return callApi('notifications/update_star', {
      method: 'POST',
      data: {
        id: id,
        sao: sao
      }
    })
  },
  deleteNotifications: (ids: string[]) => {
    return callApi('notifications/delete', {
      method: 'POST',
      data: {
        ids: ids
      }
    })
  },
  markAsRead: (ids: string[]) => {
    return callApi('notifications/mark_as_read', {
      method: 'POST',
      data: {
        ids: ids
      }
    })
  },
  markAsUnread: (ids: string[]) => {
    return callApi('notifications/mark_as_unread', {
      method: 'POST',
      data: {
        ids: ids
      }
    })
  },
  markAllAsRead: () => {
    return callApi('notifications/mark_all_as_read', {
      method: 'POST',
      data: {}
    })
  },
  countUnread: () => {
    return callApi('notifications/new_notifications', {
      method: 'GET'
    })
  },
  testSend: () => {
    return callApi('notifications/test_send', {
      method: 'POST'
    })
  }
}
