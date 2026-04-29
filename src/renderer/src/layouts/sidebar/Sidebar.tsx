import { sidebarData } from '@renderer/shared/CommonInterface'
import { SidebarContent } from './SidebarContent'
import { SidebarFooter } from './SidebarFooter'
import { SidebarHeader } from './SidebarHeader'

// ===============================
// Cấu hình kích thước Sidebar
// ===============================
export const SIDEBAR_WIDTH_OPEN = 240    // Độ rộng khi mở
export const SIDEBAR_WIDTH_CLOSE = 70    // Độ rộng khi đóng (nhỏ gọn)
export const ICON_SIZE = 20    // Kích thước icon

export default function Sidebar({ isOpen = true, showFooter = false }: { isOpen?: boolean, showFooter?: boolean }) {

    const Menu = (window.sidebars || []) as sidebarData[];
    if (!Menu || Menu.length === 0) {
        return null
    }

    const cssVars = {
        '--sidebar-w-mobile': `${SIDEBAR_WIDTH_OPEN}px`,
        '--sidebar-w-desktop': `${isOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSE}px`,
    } as React.CSSProperties

    return (
        <aside
            style={cssVars}
            className={`flex flex-col h-full bg-white xl:bg-transparent dark:bg-gray-900 transition-all duration-300 overflow-visible shrink-0 fixed xl:static z-50 shadow-xl xl:shadow-none
            w-[var(--sidebar-w-mobile)] xl:w-[var(--sidebar-w-desktop)] ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}`}
        >
            <SidebarHeader isOpen={isOpen} />
            <SidebarContent Menu={Menu} isOpen={isOpen} />
            {showFooter && <SidebarFooter isOpen={isOpen} />}
        </aside>
    )
}
