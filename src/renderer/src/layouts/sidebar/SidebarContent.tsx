import { Accordion, Dropdown, ScrollShadow } from '@heroui-v3/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { sidebarData } from '@renderer/shared/CommonInterface'
import { useQuery } from '@tanstack/react-query'
import { nhanvientucapnhatAxios } from '@renderer/api/hr/nhanvientucapnhatAxios'
import { useNotificationStore } from '@renderer/store/useNotificationStore'

const resolvedLink = (path: string) => path?.startsWith('/') ? path : `/${path || ''}`;

/** Format large numbers: 1000 → +1k, 1500 → +1.5k, 1000000 → +1m */
function formatCount(n: number): string {
    if (n >= 1_000_000_000) return `+${+(n / 1_000_000_000).toFixed(1)}b`
    if (n >= 1_000_000) return `+${+(n / 1_000_000).toFixed(1)}m`
    if (n >= 1_000) return `+${+(n / 1_000).toFixed(1)}k`
    return n.toString()
}

export function SidebarContent({ Menu, isOpen }: { Menu: sidebarData[], isOpen: boolean }) {
    // Determine if the user has access to HR update requests
    const hasHRUpdateAccess = Menu.some(group =>
        group.children?.some((link: any) => link.path === 'hrm/nhan-vien-tu-cap-nhat')
    );

    const { data: hrUpdateRequestsData } = useQuery({
        queryKey: ['hr-update-requests-pending-count'],
        queryFn: () => nhanvientucapnhatAxios.fetch({ start: 0, length: 1000 }),
        enabled: hasHRUpdateAccess,
        staleTime: 60000,
    });

    const pendingHRUpdatesCount = hrUpdateRequestsData?.data?.filter((item: any) => Number(item.trang_thai) === 0).length || 0;
    const notificationCount = useNotificationStore((state) => state.unreadCount);

    return (
        <ScrollShadow className="flex-1 flex-col px-2 gap-1 overflow-x-hidden">
            {Menu.map((item, index) => {
                const isChildren = item?.children?.length === 0;
                if (isChildren) {
                    return <NavItem
                        key={index}
                        href={item.path}
                        icon={<item.icon className="size-6" />}
                        title={item.title}
                        abbre={item.abbre}
                        isOpen={isOpen}
                        pendingCount={pendingHRUpdatesCount}
                        notificationCount={notificationCount}
                    />
                } else {
                    return <NavGroup
                        key={index}
                        id={index}
                        title={item.title}
                        abbre={item.abbre}
                        icon={<item.icon className="size-6" />}
                        isOpen={isOpen}
                        childrenLinks={item.children}
                        pendingCount={pendingHRUpdatesCount}
                        notificationCount={notificationCount}
                    />
                }
            })}
        </ScrollShadow>
    )
}

function NavItem({ href, icon, title, abbre, isOpen, className = '', pendingCount = 0, notificationCount = 0 }: any) {
    const location = useLocation();
    const path = resolvedLink(href);
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`));

    return (
        <Link
            to={path}
            className={`w-full no-underline mb-1 flex rounded-lg transition-all duration-200 relative
                ${isOpen ? 'h-10 pl-4 pr-2 items-center gap-3 text-[length:var(--font-size)]' : 'h-[72px] px-1 flex-col justify-center items-center gap-1'} 
                ${isActive ? 'bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium' : 'bg-transparent text-default-700 font-medium hover:bg-default-100 dark:hover:bg-gray-800'} 
                ${className}`}
        >
            <div className={`shrink-0 flex items-center justify-center w-6 relative ${isOpen ? 'h-full' : 'h-6 mt-1'} ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-default-500'}`}>
                {icon}
                {href === 'hrm/nhan-vien-tu-cap-nhat' && pendingCount > 0 && !isOpen && (
                    <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white dark:border-gray-900" />
                )}
                {href === 'thong-bao' && notificationCount > 0 && !isOpen && (
                    <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white dark:border-gray-900" />
                )}
            </div>
            {isOpen ? (
                <>
                    <span className="flex-1 truncate">{title}</span>
                    {href === 'hrm/nhan-vien-tu-cap-nhat' && pendingCount > 0 && (
                        <span className="ml-auto shrink-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold text-white min-w-5 h-5 shadow-sm">
                            {formatCount(pendingCount)}
                        </span>
                    )}
                    {href === 'thong-bao' && notificationCount > 0 && (
                        <span className="ml-auto shrink-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold text-white min-w-5 h-5 shadow-sm">
                            {formatCount(notificationCount)}
                        </span>
                    )}
                </>
            ) : (
                <span className={`text-[11px] leading-tight text-center whitespace-normal line-clamp-2 px-1 ${isActive ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-default-500 font-medium'}`}>
                    {abbre || title}
                </span>
            )}
        </Link>
    )
}

function NavGroup({ id, title, abbre, icon, isOpen, childrenLinks, pendingCount = 0, notificationCount = 0 }: any) {
    const location = useLocation();
    const navigate = useNavigate();

    const isChildActive = (linkPath: string) => {
        const resolvedPath = linkPath?.startsWith('/') ? linkPath : `/${linkPath || ''}`;
        return location.pathname === resolvedPath || (resolvedPath !== '/' && location.pathname.startsWith(`${resolvedPath}/`));
    };
    const isActive = childrenLinks?.some((link: any) => isChildActive(link.path));
    const activeIconClass = isActive ? "text-blue-700 dark:text-blue-400" : "text-default-500";
    const expandedKeys = isActive ? [id.toString()] : [];

    const hasHRUpdateMenu = childrenLinks?.some((link: any) => link.path === 'hrm/nhan-vien-tu-cap-nhat')
    const hasNotificationMenu = childrenLinks?.some((link: any) => link.path === 'thong-bao')
    const showPendingDot = (hasHRUpdateMenu && pendingCount > 0) || (hasNotificationMenu && notificationCount > 0)

    if (!isOpen) {
        return (
            <Dropdown>
                <Dropdown.Trigger className={`w-full`}>
                    <div
                        className={`w-full flex flex-col items-center justify-center rounded-xl h-[62px] px-1 gap-1 mb-1 cursor-pointer transition-colors ${isActive ? 'bg-blue-100/70 dark:bg-blue-900/40' : 'bg-transparent hover:bg-default-100'}`}
                        role="button"
                        tabIndex={0}
                    >
                        <div className={`shrink-0 flex items-center justify-center w-6 h-6 mt-1 relative ${activeIconClass}`}>
                            {icon}
                            {showPendingDot && (
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 translate-x-1 -translate-y-1 rounded-full bg-blue-600 border-2 border-white dark:border-gray-900" />
                            )}
                        </div>
                        <span className={`text-[11px] leading-tight text-center whitespace-normal line-clamp-2 px-1 ${isActive ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-default-500 font-medium'}`}>
                            {abbre || title}
                        </span>
                    </div>
                </Dropdown.Trigger>
                <Dropdown.Popover placement="right">
                    <Dropdown.Menu aria-label={title}>
                        {childrenLinks.map((link: any, i: number) => {
                            const isItemActive = isChildActive(link.path);
                            return (
                                <Dropdown.Item
                                    key={link.path || i.toString()}
                                    className={`p-0 ${isItemActive ? "bg-blue-100/70 dark:bg-blue-900/40" : ""}`}
                                >
                                    <Link
                                        to={resolvedLink(link.path)}
                                        className={`w-full h-full block px-4 py-2 no-underline ${isItemActive ? "text-blue-700 dark:text-blue-400 font-medium!" : "text-default-700"}`}
                                    >
                                        {link.title}
                                    </Link>
                                </Dropdown.Item>
                            )
                        })}
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
        )
    }

    return (
        <Accordion className="w-full px-0" defaultExpandedKeys={expandedKeys}>
            <Accordion.Item key={id.toString()}>
                <Accordion.Heading>
                    <Accordion.Trigger className={`w-full flex items-center justify-between px-4 h-10 rounded-lg transition-colors text-[length:var(--font-size)] ${isActive ? 'bg-blue-100/50 dark:bg-gray-800/50' : 'hover:bg-default-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`shrink-0 flex items-center justify-center w-6 h-full ${activeIconClass}`}>
                                {icon}
                            </div>
                            <span className={isActive ? "text-blue-800 dark:text-blue-300 font-medium" : "text-default-700 font-medium"}>
                                {title}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {showPendingDot && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
                            )}
                            <Accordion.Indicator />
                        </div>
                    </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                    <Accordion.Body className="flex flex-col gap-1 px-0 py-1">
                        {childrenLinks.map((link: any, i: number) => {
                            const isItemActive = isChildActive(link.path);
                            const isUpdateLink = link.path === 'hrm/nhan-vien-tu-cap-nhat';
                            return (
                                <Link
                                    key={link.path || i.toString()}
                                    to={resolvedLink(link.path)}
                                    className={`w-full flex items-center justify-between pl-13 pr-2 h-9 rounded-md transition-colors text-[length:var(--font-size)] no-underline
                                        ${isItemActive ? 'bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium' : 'hover:bg-default-100 text-default-700 font-medium'}`}
                                >
                                    <span className="whitespace-nowrap">{link.title}</span>
                                    {isUpdateLink && pendingCount > 0 && (
                                        <span className="ml-auto inline-flex shrink-0 items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold text-white min-w-5 h-5 shadow-sm">
                                            {formatCount(pendingCount)}
                                        </span>
                                    )}
                                    {link.path === 'thong-bao' && notificationCount > 0 && (
                                        <span className="ml-auto inline-flex shrink-0 items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold text-white min-w-5 h-5 shadow-sm">
                                            {formatCount(notificationCount)}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </Accordion.Body>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    )
}
