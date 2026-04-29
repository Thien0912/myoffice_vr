import { Link } from 'react-router-dom'
import logoClose from '@renderer/assets/images/logo/logo_truong_mimi.png'
import logoOpen from '@renderer/assets/images/logo/sv_logo_truong.webp'

export function SidebarHeader({ isOpen }: { isOpen: boolean }) {
    return (
        <div className={`py-4 transition-all flex items-center justify-center min-h-[76px] ${isOpen ? 'px-4' : 'px-2'}`}>
            <Link to="/" className="mx-auto block transition-all">
                {isOpen ? (
                    <img src={logoOpen} width={160} className="mx-auto block transition-all" alt="Logo" />
                ) : (
                    <img src={logoClose} className="h-8 w-auto mx-auto block transition-all" alt="Logo Mini" />
                )}
            </Link>
        </div>
    )
}
