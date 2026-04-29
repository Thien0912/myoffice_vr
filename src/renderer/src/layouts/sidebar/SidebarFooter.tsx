import { Button } from '@heroui-v3/react'
import { LogOut } from 'lucide-react'

interface SidebarFooterProps {
    isOpen: boolean
}

export function SidebarFooter({ isOpen }: SidebarFooterProps) {
    return (
        <div className={`p-4 flex justify-center ${!isOpen ? 'px-2' : ''}`}>
            {isOpen ? (
                <Button className="w-full">Logout</Button>
            ) : (
                <Button isIconOnly className="w-full h-12 rounded-xl" variant="danger-soft">
                    <LogOut size={24} className="text-default-500" />
                </Button>
            )}
        </div>
    )
}
