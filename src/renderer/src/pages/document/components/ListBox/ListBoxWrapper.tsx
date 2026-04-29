import React, { useState } from 'react'
import { SideLeftToggle } from '../sideLeft/SideLeftToggle'
import { ListBoxCompose } from './ListBoxCompose'
import { ListBoxNavigation } from './ListBoxNavigation'

interface ListBoxWrapperProps {
    open: boolean
    onOpenCompose: () => void
}

export default function ListBoxWrapper({
    open,
    onOpenCompose
}: ListBoxWrapperProps): React.JSX.Element {
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Force expanded mode on mobile/tablet (below lg)
    const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
    const effectiveIsCollapsed = isCollapsed && isDesktop

    return (
        <div
            className={`
                fixed lg:sticky z-40 lg:z-10 top-0 lg:top-0 bottom-0 left-0
                pt-16 lg:pt-4 pb-4 transition-all duration-300 flex flex-col
                ${open ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0'}
                ${effectiveIsCollapsed ? 'w-full lg:w-[72px]' : 'w-2/3 lg:w-56'}
                h-full lg:h-[calc(100vh-100px)] overflow-hidden
            `}
        >
            <div className="mb-2 hidden xl:block">
                <SideLeftToggle
                    isCollapsed={effectiveIsCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                />
            </div>

            <div className="flex flex-col w-full h-full">
                <ListBoxCompose isCollapsed={effectiveIsCollapsed} onOpenCompose={onOpenCompose} />
                <ListBoxNavigation isCollapsed={effectiveIsCollapsed} />
            </div>
        </div>
    )
}
