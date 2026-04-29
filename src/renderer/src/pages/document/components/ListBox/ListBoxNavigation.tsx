import { Button, Chip, cn, Separator, Tooltip } from '@heroui-v3/react'
import { useCurrentStore } from '@renderer/utils/useCurrentStore'
import { useLocation } from 'react-router-dom'
import {
    ButtonListBoxHopDong,
    ButtonListBoxPropose,
    ButtonListBoxTrashVanBan,
    ButtonListBoxVanBanDen,
    ButtonListBoxVanBanDenDonVi,
    ButtonListBoxVanBanDi,
    ButtonListBoxVanBanDiDonVi,
    ButtonListBoxVanBanNoiBo
} from './ListBoxOptions'

interface ListBoxTabItem {
    title?: string
    icon?: React.ReactNode
    classify?: string
    action?: () => void
    selectedDefault?: boolean
    type?: string
    alwaysShowBadge?: boolean
}

interface ListBoxNavigationProps {
    isCollapsed: boolean
    activeTab?: string
    onTabChange?: (id: string) => void
}

export const ListBoxNavigation = ({
    isCollapsed,
    activeTab,
    onTabChange
}: ListBoxNavigationProps) => {
    const currentStore = useCurrentStore()
    const { filters, setFilters, statisticals } = currentStore

    const location = useLocation()
    const pathname = location.pathname

    let ButtonListBox: ListBoxTabItem[] = []
    if (pathname.includes('vanbandi') && !pathname.includes('vanbandidonvi'))
        ButtonListBox = ButtonListBoxVanBanDi
    if (pathname.includes('vanbanden')) ButtonListBox = ButtonListBoxVanBanDen
    if (pathname.includes('vanbandendonvi')) ButtonListBox = ButtonListBoxVanBanDenDonVi
    if (pathname.includes('vanbannoibo')) ButtonListBox = ButtonListBoxVanBanNoiBo
    if (pathname.includes('vanbandidonvi')) ButtonListBox = ButtonListBoxVanBanDiDonVi
    if (pathname.includes('hopdong')) ButtonListBox = ButtonListBoxHopDong
    if (pathname.includes('vanbandaxoa')) ButtonListBox = ButtonListBoxTrashVanBan
    if (pathname.includes('de-xuat')) ButtonListBox = ButtonListBoxPropose

    return (
        <div
            className={`flex-1 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar ${isCollapsed ? 'items-center' : ''}`}
        >
            {ButtonListBox.map((button: ListBoxTabItem, index: number) => {
                if (button.type === 'separator') {
                    if (isCollapsed)
                        return (
                            <Separator
                                key={index}
                                className="w-8 my-1 mx-auto bg-gray-100 dark:bg-gray-700"
                            />
                        )
                    return (
                        <Separator
                            key={index}
                            className="w-[85%] my-1 mx-auto bg-gray-100 dark:bg-gray-700"
                        />
                    )
                }

                const isActive = activeTab ? activeTab === button.classify : button.classify === filters.selectedClassify
                const count = statisticals?.find((s) => s.classify === button.classify)?.count

                const content = (
                    <Tooltip key={index} isDisabled={!isCollapsed || !button.title}>
                        <Button
                            variant="ghost"
                            className={`
                  relative overflow-hidden transition-all duration-200 group border-none
                  ${isCollapsed
                                    ? 'w-8 h-8 min-w-10 p-0 justify-center rounded-full'
                                    : 'w-[96%] h-8 justify-start pl-6 rounded-l-none rounded-r-full'
                                }
                  ${isActive
                                    ? 'bg-[#d3e3fd] text-[#001d35] font-bold'
                                    : 'text-[#444746] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }
                  rounded-none
                `}
                            onPress={() => {
                                if (onTabChange && button.classify) {
                                    onTabChange(button.classify)
                                } else {
                                    setFilters({
                                        selectedClassify: button.classify
                                    })
                                }
                            }}
                        >
                            <div
                                className={`shrink-0 flex items-center justify-center ${isActive ? 'scale-110' : 'scale-100'} transition-transform`}
                            >
                                {button.icon}
                            </div>
                            <div
                                className={`text-small transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed
                                    ? 'w-0 opacity-0 hidden'
                                    : 'w-auto opacity-100 ml-4 flex-1 text-left block'
                                    }`}
                            >
                                {button.title}
                            </div>
                            {!isCollapsed && count !== undefined ? (
                                <Chip
                                    size="sm"
                                    className={cn(
                                        'min-w-[20px] h-5 px-1 -mr-1.5 transition-opacity border-none font-semibold text-tiny',
                                        isActive
                                            ? 'bg-white/50 text-[#001d35]'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500',
                                        isActive || button.alwaysShowBadge
                                            ? 'opacity-100'
                                            : 'opacity-0 group-hover:opacity-100'
                                    )}
                                >
                                    {count}
                                </Chip>
                            ) : null}
                        </Button>
                        <Tooltip.Content placement="right" className="capitalize">
                            {button.title}
                        </Tooltip.Content>
                    </Tooltip>
                )

                return content
            })}
        </div>
    )
}
