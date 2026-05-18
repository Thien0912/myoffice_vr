import { Skeleton } from '@heroui/react'
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

    const outletScrollRef = useRef<HTMLDivElement>(null)

    const { setScrollValue } = useLayoutStore()
    const { isAuthenticated, setUser, setPermissions } = useAuthStore()

    const access_token = CookieService.get('access_token')

    const breadcrumb = useBreadcrumbMap()

    const { pathname } = useLocation()

    const pageActions = usePageActionsStore((s) => s.actions)

    const lastLabel =
        breadcrumb[breadcrumb.length - 1]?.label || 'MyOffice VR'

    const unreadCount = useNotificationStore(
        (state) => state.unreadCount
    )

    // =========================================
    // Scroll Listener
    // =========================================
    useEffect(() => {
        const el = outletScrollRef.current

        if (!el) return

        const handleScroll = (): void => {
            setScrollValue(el.scrollTop)
        }

        el.addEventListener('scroll', handleScroll)

        return () => {
            el.removeEventListener('scroll', handleScroll)
        }
    }, [setScrollValue])

    // =========================================
    // Auth Me
    // =========================================
    useEffect(() => {
        if (!access_token) return

        userAxios
            .me()
            .then((response) => {
                if (response.data?.user) {
                    const {
                        user,
                        permission_keys,
                        public_key
                    } = response.data

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
    }, [access_token, pathname])

    // =========================================
    // Document Title
    // =========================================
    useEffect(() => {
        const baseTitle =
            lastLabel && lastLabel !== 'MyOffice VR'
                ? `${lastLabel} | MyOffice`
                : 'MyOffice'

        document.title =
            unreadCount > 0
                ? `(${unreadCount}) ${baseTitle}`
                : baseTitle
    }, [lastLabel, unreadCount])

    // =========================================
    // Auth Guard
    // =========================================
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // =========================================
    // Route Config
    // =========================================
    const currentRoute = findRouteByPath(pathname)

    const isFullscreen = currentRoute?.layout === 'fullscreen'

    const isDanhMucPage = pathname.includes('danh-muc')

    const isRolesClone = pathname.includes('roles-clone')

    // =========================================
    // Fullscreen Layout
    // =========================================
    if (isFullscreen) {
        return (
            <div className="h-screen overflow-hidden bg-white dark:bg-gray-900">
                <div className="h-full overflow-auto">
                    <SocketManager />
                    <Outlet />
                    <GlobalCompose />
                </div>
            </div>
        )
    }

    // =========================================
    // Main Layout
    // =========================================
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fafb]">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 xl:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Main Area */}
            <div className="flex flex-1 min-w-0 min-h-0 flex-col">
                {/* Header */}
                <Header toggleSidebar={toggleSidebar} />

                {/* Content Shell */}
                <div
                    ref={outletScrollRef}
                    className="
                        flex-1
                        min-h-0
                        min-w-0
                        overflow-hidden
                        bg-white
                        lg:rounded-tl-3xl
                        flex
                        flex-col
                    "
                >
                    {/* Page Header */}
                    {!isRolesClone && (
                        <div className="flex items-center justify-between pr-6 shrink-0">
                            {!currentRoute?.hideTitle && <PageTitle />}

                            {pageActions && (
                                <div className="shrink-0">
                                    {pageActions}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Outlet */}
                    <Suspense fallback={<Skeleton />}>
                        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                            <Outlet />
                        </div>
                    </Suspense>
                </div>

                {/* Globals */}
                <GlobalCompose />
                <SocketManager />
                <BackToTop />
                <ProfileModal />
            </div>
        </div>
    )
}