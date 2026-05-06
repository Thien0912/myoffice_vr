import { ScrollShadow } from '@heroui-v3/react'
import { Skeleton, cn } from '@heroui/react'
import { userAxios } from '@renderer/api/auth/userAxios'
import BackToTop from '@renderer/components/BackToTop'
import GlobalCompose from '@renderer/components/GlobalCompose'
import SocketManager from '@renderer/components/SocketManager'
import Header from '@renderer/layouts/header/Header'
import ProfileModal from '@renderer/layouts/header/ProfileModal'
import Sidebar from '@renderer/layouts/sidebar/Sidebar'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useBreadcrumbMap } from '@renderer/store/useBreadcrumbMap'
import { useLayoutStore } from '@renderer/store/useLayoutStore'
import { useNotificationStore } from '@renderer/store/useNotificationStore'
import { usePageActionsStore } from '@renderer/store/usePageActionsStore'
import { CookieService } from '@renderer/utils/cookieService'
import { findRouteByPath } from '@renderer/utils/routeUtils'
import { Suspense, useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PageTitle from './PageTitle'

export default function MainLayout(): React.JSX.Element {
    const { isSidebarOpen, toggleSidebar } = useLayoutStore()
    const OutletScroll = useRef<HTMLDivElement>(null)
    const { setScrollValue } = useLayoutStore()
    const { isAuthenticated, setUser, setPermissions } = useAuthStore()
    const access_token = CookieService.get('access_token')
    const breadcrumb = useBreadcrumbMap()
    const { pathname } = useLocation()
    const pageActions = usePageActionsStore((s) => s.actions)
    // Lấy phần tử label cuối cùng làm tiêu đề trang
    const lastLabel = breadcrumb[breadcrumb.length - 1]?.label || 'MyOffice VR'
    const descriptionLabel = breadcrumb[breadcrumb.length - 1]?.description || ''

    // Sự kiện ngườii dùng đang scroll trang
    useEffect(() => {
        const el = OutletScroll.current
        if (!el) return

        const handleScroll = (): void => {
            setScrollValue(el.scrollTop)
        }

        el.addEventListener('scroll', handleScroll)
        return () => el.removeEventListener('scroll', handleScroll)
    }, [setScrollValue])

    useEffect(() => {
        if (access_token) {
            userAxios
                .me()
                .then((response) => {
                    // console.log(response.data)
                    if (response.data?.user) {
                        const { user, permission_keys, public_key } = response.data
                        // console.log('public_key', public_key)
                        setUser({
                            ...user,
                            public_key
                        })
                        setPermissions(permission_keys || [])
                    }
                })
                .catch((err) => {
                    console.log('error authentication/me: ', err)
                })
        }
    }, [access_token, pathname])

    const unreadCount = useNotificationStore((state) => state.unreadCount)

    // Cập nhật tiêu đề tab trình duyệt
    useEffect(() => {
        const baseTitle =
            lastLabel && lastLabel !== 'MyOffice VR' ? `${lastLabel} | MyOffice` : 'MyOffice'
        document.title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle
    }, [lastLabel, unreadCount])

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Check current route config for layout mode
    const currentRoute = findRouteByPath(pathname)
    const isFullscreen = currentRoute?.layout === 'fullscreen'
    const isDanhMucPage = pathname.includes('danh-muc')

    if (isFullscreen) {
        return (
            <div className="h-full bg-white dark:bg-gray-900 overflow-auto">
                <SocketManager />
                <Outlet />
                <GlobalCompose />
            </div>
        )
    }

    return (
        <div className='flex bg-[#f8fafb] h-dvh w-full relative overflow-hidden'>
            <Sidebar isOpen={isSidebarOpen} />
            {isSidebarOpen && (
                <div
                    className="bg-gray-900/50 fixed xl:hidden inset-0 z-40 transition-opacity"
                    onClick={toggleSidebar}
                ></div>
            )}
            <div className="flex-1 flex flex-col gap-0 min-w-0 h-full w-full transition-all duration-300">
                <Header toggleSidebar={toggleSidebar} />
                <ScrollShadow
                    ref={OutletScroll}
                    className={cn(
                        'flex-1 lg:rounded-tl-3xl bg-white',
                        isDanhMucPage && 'flex flex-col overflow-hidden'
                    )}
                >
                    <div className={cn('space-y-0', isDanhMucPage && 'flex flex-col h-full')}>
                        <div className={cn('flex items-center justify-between pr-6', isDanhMucPage && 'shrink-0')}>
                            {!currentRoute?.hideTitle && <PageTitle />}
                            {pageActions && <div className="shrink-0">{pageActions}</div>}
                        </div>
                        <Suspense fallback={<Skeleton />}>
                            <div className={cn(isDanhMucPage && 'flex-1 min-h-0 overflow-hidden')}>
                                <Outlet />
                            </div>
                        </Suspense>
                    </div>
                </ScrollShadow>
                <GlobalCompose />
                <SocketManager />
                <BackToTop />
                <ProfileModal />
            </div>
        </div>
    )
}
