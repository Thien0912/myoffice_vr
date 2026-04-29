import {
    Accordion,
    Badge,
    Button,
    Chip,
    Dropdown,
    ScrollShadow
} from '@heroui-v3/react'
import logoClose from '@renderer/assets/images/logo/logo_truong_mimi.png'
import logoOpen from '@renderer/assets/images/logo/sv_logo_truong.webp'
import { sidebarData } from '@renderer/shared/CommonInterface'
import { useNotificationStore } from '@renderer/store/useNotificationStore'
import { Columns2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, matchPath, useLocation } from 'react-router-dom'

// ===============================
// ⚙️ Configs
// ===============================
const SIDEBAR_COLORS = {
    activeBg: 'bg-blue-100 dark:bg-blue-900/40',
    activeText: 'text-blue-900 dark:text-blue-100',
    activeBorder: 'border-l-blue-700 dark:border-l-blue-500',
    hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-700',
    iconActive: 'text-blue-600 dark:text-blue-400',
    iconHover: 'hover:text-blue-900 dark:hover:text-blue-200'
}
const defaultWSide = 185
const minWSideOpen = 120
const widthSidebarClose = 60

type SidebarProps = {
    isOpen: boolean
}

// ===============================
// 🛠 Helpers
// ===============================

// ===============================
// 🛠 Navigation Logic
// ===============================

// 1. Kiểm tra xem link này có nên chạy bằng React Router không?
const isReactPath = (path: string): boolean => {
    if (import.meta.env.VITE_IS_FULL_SPA === 'true') return true
    const allowList = (import.meta.env.VITE_SPA_MODULES || 'vanban,notifications,thongbao').split(',')

    // Coi root "/" là "dashboard" để check trong list
    const checkPath = path === '/' || path === '' ? 'dashboard' : path.toLowerCase()
    return allowList.some((key) => checkPath.includes(key.trim().toLowerCase()))
}

// 2. Tạo URL cho Legacy (PHP) nếu không chạy bằng React
const getLegacyUrl = (path: string): string => {
    const prefix = import.meta.env.VITE_LEGACY_URL_PREFIX || ''
    // Map root '/' sang '/dashboard' mặc định của Legacy
    if (path === '/' || path === '') return `${prefix}/dashboard`
    return `${prefix}${path}`
}

function SidebarLink({
    to,
    children,
    onClick,
    className,
    ...props
}: {
    to: string
    children: React.ReactNode
    onClick?: () => void
    className?: string
} & React.AnchorHTMLAttributes<HTMLAnchorElement>): React.JSX.Element {
    if (isReactPath(to)) {
        return (
            <Link to={to} onClick={onClick} className={className} {...(props as any)}>
                {children}
            </Link>
        )
    }

    return (
        <a href={getLegacyUrl(to)} onClick={onClick} className={className} {...props}>
            {children}
        </a>
    )
}

export default function Sidebar1({ isOpen }: SidebarProps): React.JSX.Element {
    const [sidebarWidth, setSidebarWidth] = useState(defaultWSide)
    const [openModule, setOpenModule] = useState<string | null>(null)
    const isResizing = useRef(false)
    const location = useLocation()
    const sidebar = (window.sidebars || []) as sidebarData[]

    const unreadCount = useNotificationStore((state) => state.unreadCount)

    useEffect(() => {
        if (isOpen) setSidebarWidth(defaultWSide)
        else setSidebarWidth(widthSidebarClose)
    }, [isOpen])

    // 🌟 Auto mở module theo route
    useEffect(() => {
        const found = sidebar.find(
            (m) =>
                !!m.children &&
                m.children.some((item) => !!item.path && location.pathname.startsWith('/' + item.path))
        )
        setOpenModule(found ? found.title : null)
    }, [location.pathname])

    // Resize handler
    const handleMouseMove = (e: MouseEvent): void => {
        if (!isResizing.current) return
        const newWidth = Math.min(Math.max(e.clientX, widthSidebarClose), defaultWSide * 3)
        setSidebarWidth(newWidth)
    }

    const handleMouseUp = (): void => {
        isResizing.current = false
        document.body.style.cursor = 'default'
        document.body.style.userSelect = ''

        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
    }

    const handleMouseDown = (): void => {
        isResizing.current = true
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    return (
        <aside className="relative">
            <div
                className={`h-screen fixed xl:static z-49 select-none transform transition-all duration-300 bg-white sm:bg-transparent backdrop-blur-2xl
              ${isOpen ? 'translate-x-0 w-3/5! sm:w-auto!' : '-translate-x-full'} 
              md:translate-x-0`}
                style={{
                    width: isOpen ? sidebarWidth : widthSidebarClose,
                    minWidth: isOpen ? 198 : 'unset'
                }}
            >
                <div
                    className="absolute top-0 right-0 z-11 h-full w-2 bg-transparent hover:bg-gray-300 transition-all duration-300 cursor-col-resize hidden"
                    onMouseDown={handleMouseDown}
                ></div>

                {/* Logo */}
                <div className="py-4">
                    <img
                        src={!isOpen || sidebarWidth < minWSideOpen ? logoClose : logoOpen}
                        alt="Logo"
                        className={`mx-auto transition-all duration-300 ${!isOpen || sidebarWidth < minWSideOpen ? 'h-8 w-auto' : 'h-11 w-auto'}`}
                    />
                </div>

                {/* Sidebar Content */}
                <ScrollShadow className="h-[calc(100vh-80px)] overflow-x-hidden">
                    {sidebar.map((module, index) => (
                        <div key={index} className="mb-0">
                            {isOpen && sidebarWidth >= minWSideOpen ? (
                                <SidebarAccordion
                                    module={module}
                                    openModule={openModule}
                                    setOpenModule={setOpenModule}
                                    unreadCount={module.path === 'notifications' ? unreadCount : 0}
                                />
                            ) : (
                                <SidebarDropdown
                                    module={module}
                                    unreadCount={module.path === 'notifications' ? unreadCount : 0}
                                />
                            )}
                        </div>
                    ))}
                </ScrollShadow>
            </div>
        </aside>
    )
}

// ===============================
// 📁 Sidebar Accordion
// ===============================
function SidebarAccordion({
    module,
    openModule,
    setOpenModule,
    unreadCount
}: {
    module: sidebarData
    openModule: string | null
    setOpenModule: (title: string | null) => void
    unreadCount: number
}): React.JSX.Element | null {
    const location = useLocation()
    const isModuleActive =
        !!module.children &&
        module.children.some((item) => {
            const p = '/' + (item.path || '')
            return !!item.path && matchPath({ path: p, end: false }, location.pathname)
        })

    const isExpanded = openModule === module.title || isModuleActive

    // 🔹 MODULE TRANG ĐƠN
    if (!module.children || module.children.length === 0) {
        const moduleLink = module.path ? '/' + module.path : '/'
        const isActive =
            location.pathname === moduleLink ||
            (moduleLink !== '/' && location.pathname.startsWith(moduleLink + '/'))
        return (
            <>
                <SidebarLink
                    to={moduleLink}
                    onClick={() => setOpenModule(null)}
                    className={`flex items-center gap-3 justify-start px-3 py-2 border-l-3 h-auto transition-colors text-[length:var(--font-size)] font-normal! dark:text-gray-200 border-none w-full
            ${isActive
                            ? `${SIDEBAR_COLORS.activeBorder} ${SIDEBAR_COLORS.activeBg} ${SIDEBAR_COLORS.activeText}`
                            : `border-l-transparent ${SIDEBAR_COLORS.hoverBg}`
                        }`}
                >
                    <div className="w-6 flex justify-center items-center shrink-0">
                        {module.icon || <Columns2 size={20} />}
                    </div>
                    <div className="flex-1 flex justify-between items-center w-full min-w-0 pr-1">
                        <span className="truncate">{module.title}</span>
                        {unreadCount > 0 && (
                            <Chip size="sm" color="danger" className="h-5 min-w-5 px-1 ml-auto shadow-sm rounded-full font-bold text-[10px]">
                                {String(unreadCount > 99 ? '99+' : unreadCount)}
                            </Chip>
                        )}
                    </div>
                </SidebarLink>
            </>
        )
    }

    // 🔹 MODULE CÓ ITEM
    return (
        <Accordion
            defaultExpandedKeys={isExpanded ? [module.title] : []}
            onExpandedChange={(keys: any) => {
                let has = false
                if (Array.isArray(keys)) has = keys.includes(module.title)
                else if (keys instanceof Set) has = keys.has(module.title)
                else if (typeof keys === 'string') has = keys === module.title
                setOpenModule(has ? module.title : null)
            }}
            className="[&>hr]:hidden p-0"
        >
            <Accordion.Item
                id={module.title}
                aria-label={module.title}
                className={`[&_button]:py-2 [&_button]:px-3 [&_button]:gap-3 border-l-transparent border-l-3 [&_span]:whitespace-nowrap [&_[data-slot=title]]:text-[length:var(--font-size)]! [&_button]:dark:text-gray-200
          data-[open="true"]:border-l-blue-700/70 dark:data-[open="true"]:border-l-blue-500/70 data-[open="true"]:bg-gray-100/70 dark:data-[open="true"]:bg-gray-700/50 [&>section>[data-open="true"]]:p-0`}
            >
                <Accordion.Heading>
                    <Accordion.Trigger className="w-full relative flex items-center justify-between">
                        <div className="w-6 flex justify-center items-center shrink-0">
                            {module.icon || <Columns2 size={20} />}
                        </div>
                        <div className="flex justify-between items-center w-full pr-2">
                            <span className="font-normal dark:text-gray-200">{module.title}</span>
                            {unreadCount > 0 && (
                                <Chip size="sm" color="danger" className="h-5 min-w-5 px-1 ml-auto shadow-sm rounded-full font-bold text-[10px]">
                                    {String(unreadCount > 99 ? '99+' : unreadCount)}
                                </Chip>
                            )}
                        </div>
                    </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                    <Accordion.Body className="p-0">
                        {(() => {
                            // 🎯 Tìm item "khớp nhất" trong module này
                            // Sắp xếp theo số lượng segment path giảm dần để ưu tiên path chi tiết hơn
                            const activeItem = [...(module.children || [])]
                                .filter((item) => !!item.path)
                                .map((item) => ({ item, itemLink: '/' + item.path }))
                                .filter(({ itemLink }) => matchPath({ path: itemLink, end: false }, location.pathname))
                                .sort((a, b) => b.itemLink.split('/').length - a.itemLink.split('/').length)[0]?.item

                            return module.children.map((item, index) => {
                                const itemLink = item.path ? '/' + item.path : ''
                                const isActive = item === activeItem

                                return (
                                    <SidebarLink
                                        to={itemLink}
                                        key={index}
                                        onClick={() => setOpenModule(module.title)}
                                        className={`flex justify-start w-full h-auto px-3 py-2 text-[length:var(--font-size)] font-normal! border-none dark:text-gray-300
                  ${isActive
                                                ? `${SIDEBAR_COLORS.activeBg} ${SIDEBAR_COLORS.activeText}`
                                                : `${SIDEBAR_COLORS.hoverBg}`
                                            }`}
                                    >
                                        <span className="pl-10 whitespace-normal text-left">{item.title}</span>
                                    </SidebarLink>
                                )
                            })
                        })()}
                    </Accordion.Body>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    )
}

// ===============================
// 📁 Sidebar Dropdown (thu gọn)
// ===============================
function SidebarDropdown({
    module,
    unreadCount
}: {
    module: sidebarData
    unreadCount: number
}): React.JSX.Element {
    const location = useLocation()
    const moduleLink = module.path ? '/' + module.path : '/'
    const hasChildren = !!module.children && module.children.length > 0
    const childrenMatch =
        hasChildren &&
        module.children!.some((item) => {
            const p = '/' + (item.path || '')
            return !!item.path && matchPath({ path: p, end: false }, location.pathname)
        })

    const selfMatch =
        location.pathname === moduleLink ||
        (moduleLink !== '/' && location.pathname.startsWith(moduleLink + '/'))

    const isActiveModule = hasChildren ? childrenMatch : selfMatch

    /* 🛡 Unified Navigation Logic Component */
    /* Replaces manual handleNavigation in previous code */
    if (!module.children || module.children.length === 0) {
        return (
            <SidebarLink
                to={moduleLink}
                className={`flex flex-col items-center justify-center w-full h-[72px] dark:text-gray-400 overflow-visible
          ${isActiveModule
                        ? `${SIDEBAR_COLORS.iconActive} ${SIDEBAR_COLORS.activeBg} font-normal!`
                        : `${SIDEBAR_COLORS.hoverBg}`
                    }`}
            >
                <div className="relative pt-1">
                    {unreadCount > 0 ? (
                        <Badge
                            content={String(unreadCount > 99 ? '99+' : unreadCount)}
                            color="danger"
                            size="sm"
                            className="border-white dark:border-gray-800"
                        >
                            {module.icon || <Columns2 size={24} />}
                        </Badge>
                    ) : (
                        module.icon || <Columns2 size={24} />
                    )}
                </div>
                <small className="text-[11px] mt-1">{module.abbre}</small>
            </SidebarLink>
        )
    }

    return (
        <Dropdown>
            <Button
                isIconOnly
                variant="ghost"
                className={`w-full transition-colors flex flex-col h-[72px] dark:text-gray-400 overflow-visible border-none rounded-none
            ${isActiveModule
                        ? `${SIDEBAR_COLORS.iconActive} ${SIDEBAR_COLORS.activeBg} font-normal!`
                        : `${SIDEBAR_COLORS.hoverBg}`
                    }`}
            >
                <div className="relative pt-1">
                    {unreadCount > 0 ? (
                        <Badge
                            content={String(unreadCount > 99 ? '99+' : unreadCount)}
                            color="danger"
                            size="sm"
                            className="border-white dark:border-gray-800"
                        >
                            {module.icon || <Columns2 size={24} />}
                        </Badge>
                    ) : (
                        module.icon || <Columns2 size={24} />
                    )}
                </div>
                <small className="text-[11px] mt-1">{module.abbre}</small>
            </Button>
            <Dropdown.Popover placement="right top" className="rounded-xs px-0 min-w-[200px]">
                <SidebarDropdownContent module={module} />
            </Dropdown.Popover>
        </Dropdown>
    )
}

// ===============================
// 📁 Dropdown Content
// ===============================
function SidebarDropdownContent({ module }: { module: sidebarData }): React.JSX.Element {
    const location = useLocation()
    const items =
        module.children && module.children.length > 0
            ? module.children.map((itemDropdown, indexDropdown) => ({
                key: indexDropdown.toString(),
                title: itemDropdown.title,
                path: '/' + (itemDropdown.path ?? '')
            }))
            : [{ key: '0', title: module.title, path: '/' + (module.path ?? '') }]

    const activeItem = items
        .filter((i) => !!i.path)
        .filter((i) => matchPath({ path: i.path, end: false }, location.pathname))
        .sort((a, b) => (b.path || '').split('/').length - (a.path || '').split('/').length)[0]

    return (
        <Dropdown.Menu
            aria-label="Menu"
            className="px-0 space-y-0 bg-white dark:bg-gray-800"
            items={items}
        >
            {(item) => {
                const isActive = activeItem && item.key === activeItem.key
                return (
                    <Dropdown.Item
                        key={item.key}
                        textValue={item.title}
                        className={`rounded-none p-0 items-center data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-gray-700 ${isActive ? `${SIDEBAR_COLORS.activeBg} ${SIDEBAR_COLORS.iconActive}` : `text-gray-700 dark:text-gray-300 ${SIDEBAR_COLORS.iconHover}`
                            }`}
                    >
                        <SidebarLink
                            to={item.path || ''}
                            className={`block w-full h-full px-4 py-2 transition-colors`}
                        >
                            {item.title}
                        </SidebarLink>
                    </Dropdown.Item>
                )
            }}
        </Dropdown.Menu>
    )
}
