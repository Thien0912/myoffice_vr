import { cn } from '@heroui-v3/react'
import { ListBoxCompose } from '../../document/components/ListBox/ListBoxCompose'
import { ListBoxNavigation } from '../../document/components/ListBox/ListBoxNavigation'
import { SideLeftToggle } from '../../document/components/sideLeft/SideLeftToggle'

interface SideLeftProposeProps {
    activeTab: string
    onTabChange: (id: string) => void
    isCollapsed: boolean
    onToggle: () => void
    onOpenCreate?: () => void
    className?: string
}

export const SideLeftPropose = ({
    activeTab,
    onTabChange,
    isCollapsed,
    onToggle,
    onOpenCreate,
    className
}: SideLeftProposeProps) => {
    return (
        <div
            className={cn(
                'h-full w-full shrink-0 flex flex-col py-2',
                className
            )}
        >
            {/* 1. Toggle Button */}
            <SideLeftToggle isCollapsed={isCollapsed} onToggle={onToggle} />

            {/* 2. Compose Button */}
            <ListBoxCompose isCollapsed={isCollapsed} onOpenCompose={onOpenCreate || (() => { })} />

            {/* 3. Navigation Tabs */}
            <ListBoxNavigation
                isCollapsed={isCollapsed}
                activeTab={activeTab}
                onTabChange={onTabChange}
            />
        </div>
    )
}

export default SideLeftPropose
