import { useEffect } from 'react'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { socket } from '@renderer/lib/socket'
import { useQueryClient } from '@tanstack/react-query'
import { useOnlineUserStore } from '@renderer/store/useOnlineUserStore'
import { thongbaoAxios } from '@renderer/api/thongbaoAxios'
import { useNotificationStore } from '@renderer/store/useNotificationStore'
import { getRandomColor } from '@renderer/utils/colorUtils'
import { useSocketActivity } from '@renderer/hooks/useSocketActivity'
import { toast } from "@heroui-v3/react";

const SocketManager = () => {
  const { user } = useAuthStore()
  useSocketActivity() // Enable auto-tracking
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) return

    // Dữ liệu join dùng chung cho lần đầu và khi reconnect
    const joinData = {
      user_id: user.ql_nguoi_dung_id,
      ql_nguoi_dung_id: user.ql_nguoi_dung_id,
      ql_nguoi_dung_ho_ten: user.ql_nguoi_dung_ho_ten,
      ql_nguoi_dung_email: user.ql_nguoi_dung_email,
      ql_nguoi_dung_avatar: user.ql_nguoi_dung_avatar,
      ten_don_vi: user.ten_don_vi || '',
      ten_cong_viec: user.ten_cong_viec || '',
      color: getRandomColor(user.ql_nguoi_dung_id || '0')
    }

    // 1. Gửi thông tin join khi user đã login
    socket.emit('join', joinData)

    // 2. Khi server restart → socket tự reconnect → gửi lại join để vào lại danh sách online
    const handleReconnect = () => {
      console.log('[Socket] Reconnected to server, re-joining...')
      socket.emit('join', joinData)
    }
    socket.on('connect', handleReconnect)

    // 2. Fetch số lượng thông báo chưa đọc ban đầu
    thongbaoAxios.countUnread().then((response: any) => {
      const newCount = response.new_noti || 0
      useNotificationStore.getState().setUnreadCount(newCount)
    }).catch(err => console.error('Failed to fetch initial unread count', err))


    const handleUsersOnline = (data: any) => {
      console.log('DEBUG Users online Data:', data) // Debugging
      useOnlineUserStore.getState().setUsers(data)
    }

    const handleWelcome = (data: any) => {
      console.log(data)
    }

    const handleNotification = (msg: any) => {
      console.log('🔔 [Socket] Received notification:', msg)

      // 1. Hiển thị Toast thông báo
      const notiData = msg.data || msg
      toast(notiData.title || 'Thông báo hệ thống', { description: notiData.message || notiData.content || 'Bạn có thông báo mới', variant: 'default', timeout: 5000 })

      // 2. Invalidate query danh sách thông báo để cập nhật UI danh sách
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      // 3. Cập nhật Badge số lượng chưa đọc sau 500ms
      setTimeout(() => {
        thongbaoAxios.countUnread().then((response: any) => {
          const newCount = response.new_noti || 0
          console.log('📊 [Socket] Updated unread count:', newCount)
          useNotificationStore.getState().setUnreadCount(newCount)
        }).catch(err => console.error('Failed to update unread count via socket', err))
      }, 500)
    }



    const syncAuthToOtherTabs = (updatedUser: any) => {
      // 1. Gửi tin nhắn cho các tab khác qua BroadcastChannel
      const bc = new BroadcastChannel('auth_sync')
      bc.postMessage({ type: 'UPDATE_USER', user: updatedUser })
      bc.close()
    }

    const handlePinVerified = () => {
      console.log('🔑 [Socket] PIN code verified successfully event received')
      const currentState = useAuthStore.getState()
      const currentUser = currentState.user

      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          has_pin: 1,
          pin_is_valid: 1
        }
        
        currentState.setUser(updatedUser)
        syncAuthToOtherTabs(updatedUser) // Đồng bộ sang tab khác
        
        toast('Xác thực PIN', { description: 'Mã PIN của bạn đã được xác thực thành công', variant: 'success' })
      }
    }

    const handlePinRegistered = () => {
      console.log('🔑 [Socket] PIN code registered successfully event received')
      const currentState = useAuthStore.getState()
      const currentUser = currentState.user

      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          has_pin: 2,
          pin_is_valid: 0
        }
        
        currentState.setUser(updatedUser)
        syncAuthToOtherTabs(updatedUser) // Đồng bộ sang tab khác

        toast('Đăng ký PIN', { description: 'Hệ thống đã ghi nhận đăng ký mã PIN của bạn. Vui lòng kiểm tra email.', variant: 'success' })
      }
    }

    // 2. Lắng nghe thông báo từ các tab khác
    const bc = new BroadcastChannel('auth_sync')
    bc.onmessage = (event) => {
      if (event.data.type === 'UPDATE_USER') {
        console.log('🔄 [Sync] Received user update from another tab:', event.data.user)
        useAuthStore.getState().setUser(event.data.user)
      }
    }

    // 3. Fallback: Lắng nghe sự kiện storage (LocalStorage thay đổi)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth') {
        console.log('📦 [Sync] LocalStorage "auth" changed, rehydrating store...')
        // Ép buộc Zustand hydrate lại từ LocalStorage
        useAuthStore.persist.rehydrate()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    const handleUnreadCountUpdate = (data: any) => {
      console.log('📊 [Socket] Received unread count update:', data.count)
      useNotificationStore.getState().setUnreadCount(data.count)
    }

    const handlePinDisabled = () => {
      console.log('🚨 [Socket] PIN code has been disabled (locked)')
      const currentState = useAuthStore.getState()
      const currentUser = currentState.user

      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          has_pin: 3,
          pin_is_valid: 0
        }
        
        currentState.setUser(updatedUser)
        syncAuthToOtherTabs(updatedUser)

        toast('Mã PIN bị khóa', { description: 'Mã PIN của bạn đã bị vô hiệu hóa do nhập sai quá nhiều lần.', variant: 'danger' })
      }
    }

    // Đăng ký listeners Socket
    socket.on('get_users_online', handleUsersOnline)
    socket.on('welcome', handleWelcome)
    socket.on('notification', handleNotification)
    socket.on('pin_verified', handlePinVerified)
    socket.on('pin_registered', handlePinRegistered)
    socket.on('pin_disabled', handlePinDisabled)
    socket.on('unread_count_update', handleUnreadCountUpdate)
    socket.on('connect', handleReconnect)

    // Cleanup
    return () => {
      bc.close()
      window.removeEventListener('storage', handleStorageChange)
      socket.off('get_users_online', handleUsersOnline)
      socket.off('welcome', handleWelcome)
      socket.off('notification', handleNotification)
      socket.off('pin_verified', handlePinVerified)
      socket.off('pin_registered', handlePinRegistered)
      socket.off('pin_disabled', handlePinDisabled)
      socket.off('unread_count_update', handleUnreadCountUpdate)
      socket.off('connect', handleReconnect)
    }
  }, [user, queryClient])

  return null // Component này không render UI
}

export default SocketManager
