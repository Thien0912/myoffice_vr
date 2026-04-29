import { useAfterRedirect } from '@renderer/hooks/useAfterRedirect'
import loadRoutes from '@renderer/routes'
import { useEffect, useMemo, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { userAxios } from './api/auth/userAxios'
import LoadingOverlay from './components/LoadingOverlay'
import { useThemeEffect } from './hooks/useThemeEffect'
import { useAuthStore } from './store/useAuthStore'
import { CookieService } from './utils/cookieService'
import { initAppTasks } from './utils/layout/registerTasks'

declare global {
    interface Window {
        sidebars: any[]
    }
}

export default function App(): React.JSX.Element {
    const { user, logout } = useAuthStore()
    const [isRestoring, setIsRestoring] = useState(false)
    const { routes: router, sidebars } = useMemo(() => loadRoutes(), [user])
    window.sidebars = sidebars

    useEffect(() => {
        // Khôi phục auth từ cookie khi app khởi động
        const token = CookieService.get('access_token')
        if (!user && token) {
            setIsRestoring(true)
            userAxios
                .me()
                .then((response) => {
                    const userData = response.data ?? null
                    if (userData?.user) {
                        const { user, permission_keys } = userData
                        useAuthStore.getState().setUser({ ...user, permissions: permission_keys || [] })
                    } else {
                        logout()
                    }
                })
                .catch(() => {
                    logout()
                })
                .finally(() => {
                    setIsRestoring(false)
                })
        }
        // Monitor token status (Sync logout across tabs/apps)
        if (user) {
            const checkToken = () => {
                const currentToken = CookieService.get('access_token')
                if (!currentToken) logout()
            }
            const interval = setInterval(checkToken, 1000)
            return () => clearInterval(interval)
        }
        return undefined
    }, [user, logout])

    // Khởi tạo các background tasks (Heartbeat,...)
    useEffect(() => {
        const cleanup = initAppTasks(router)
        return cleanup
    }, [router])

    useThemeEffect()

    useEffect(() => { }, [user]) // theo dõi user thay đổi để render lại sidebar

    // Xử lý redirect sau khi đăng nhập
    useEffect(() => {
        if (user) {
            useAfterRedirect.execute()
        }
    }, [user])

    if (isRestoring) {
        return <LoadingOverlay visible={true} />
    }

    return <RouterProvider router={router} />
}
