import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { socket } from '../lib/socket'
import { useAuthStore } from '../store/useAuthStore'

export const useSocketActivity = () => {
    const location = useLocation()
    const { user } = useAuthStore()
    const currentActivityRef = useRef<any>(null)

    // Hàm tính toán activity hiện tại dựa trên URL
    const getActivityFromUrl = (path: string) => {
        let description = 'Đang trực tuyến'

        if (path === '/') description = 'Đang ở Trang chủ'
        else if (path.includes('/thong-bao')) description = 'Đang xem Thông báo'
        else if (path.includes('/vanbanden')) description = 'Đang xem Văn bản đến'
        else if (path.includes('/vanbandidonvi')) description = 'Đang xem Văn bản đi đơn vị'
        else if (path.includes('/vanbandendonvi')) description = 'Đang xem Văn bản đến đơn vị'
        else if (path.includes('/vanbandi')) description = 'Đang xem Văn bản đi'
        else if (path.includes('/vanbannoibo')) description = 'Đang xem Văn bản nội bộ'
        else if (path.includes('/vanbandaxoa')) description = 'Đang xem Thùng rác'

        // HRM
        else if (path.includes('/hrm/nhan-vien')) description = 'Đang xem Hồ sơ nhân sự'
        else if (path.includes('/hrm/hop-dong')) description = 'Đang xem Hợp đồng'
        else if (path.includes('/hrm/thoi-viec')) description = 'Đang xem Hồ sơ thôi việc'
        else if (path.includes('/hrm/nghi-phep/dang-ky')) description = 'Đang đăng ký nghỉ phép'
        else if (path.includes('/hrm/nghi-phep/duyet')) description = 'Đang duyệt nghỉ phép'
        else if (path.includes('/hrm/nghi-phep')) description = 'Đang xem Danh sách nghỉ phép'
        else if (path.includes('/hrm/cham-cong')) description = 'Đang xem Chấm công'

        // Danh mục & Hệ thống
        else if (path.includes('/donvi')) description = 'Đang xem Danh mục đơn vị'
        else if (path.includes('/system')) description = 'Đang cấu hình Hệ thống'

        return {
            type: 'viewing_page',
            path: path,
            description: description
        }
    }

    // Effect gửi activity khi URL thay đổi hoặc User thay đổi
    useEffect(() => {
        if (!user) return

        const activity = getActivityFromUrl(location.pathname)
        currentActivityRef.current = activity

        // Delay 1s để đảm bảo sự kiện 'join' đã được xử lý xong ở server
        // trước khi gửi update_activity
        const timer = setTimeout(() => {
            sendActivity(activity)
        }, 1000)

        return () => clearTimeout(timer)

    }, [location, user])

    // Effect lắng nghe sự kiện connect để gửi lại trạng thái (quan trọng khi F5 hoặc mất mạng)
    useEffect(() => {
        const onConnect = () => {
            console.log('[Activity] Socket re-connected, resending activity...')
            if (currentActivityRef.current) {
                sendActivity(currentActivityRef.current)
            }
        }

        socket.on('connect', onConnect)

        // Nếu socket đã connect sẵn rồi mà hook mới mount (ít khi xảy ra nhưng đề phòng)
        if (socket.connected && currentActivityRef.current) {
            // Đã gửi ở effect trên, không cần gửi lại để tránh spam
        }

        return () => {
            socket.off('connect', onConnect)
        }
    }, [])

    const trackAction = (actionName: string, details?: string) => {
        const activity = {
            type: 'action',
            action: actionName,
            description: details || actionName
        }
        currentActivityRef.current = activity
        sendActivity(activity)
    }

    return { trackAction }
}

const sendActivity = (data: any) => {
    // console.log('[Activity] Sending:', data)
    socket.emit('update_activity', data)
}
