import { Button } from '@heroui-v3/react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { Minus, X } from 'lucide-react'
import { ReactNode, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface DraggableModalProps {
    isOpen: boolean
    onClose: () => void
    title: ReactNode | string
    children: ReactNode
    footer?: ReactNode
    onMinimize?: () => void
    width?: string
    className?: string
    size?: 'md' | 'lg' | 'full' | 'cover' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
    variant?: 'default' | 'white'
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
    encType?: string
    autoComplete?: string
}

export default function DraggableModal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    onMinimize,
    width = 'max-w-3xl',
    className = '',
    size,
    variant = 'default',
    onSubmit,
    encType,
    autoComplete
}: DraggableModalProps) {
    const dragControls = useDragControls()
    const modalRef = useRef<HTMLDivElement>(null)
    const [dragLimits, setDragLimits] = useState<{ top: number, left: number, right: number, bottom: number }>()

    const sizeMap: Record<string, string> = {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl'
    }

    const activeWidth = width !== 'max-w-3xl' ? width : size ? (sizeMap[size] || 'max-w-3xl') : 'max-w-3xl'

    const calculateConstraints = () => {
        if (modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect()
            const w = window.innerWidth
            const h = window.innerHeight

            // Allow sliding out until only 100px of handle is visible horizontally.
            // Allow sliding down until only top 56px of handle is visible.
            // Restrict sliding up past top = 0.
            setDragLimits({
                top: -rect.top,
                left: 100 - rect.width - rect.left,
                right: w - 100 - rect.left,
                bottom: h - 56 - rect.top,
            })
        }
    }

    // Prevent drag propagation on text areas/inputs/buttons inside header
    const stopPropagation = (e: React.PointerEvent) => {
        e.stopPropagation()
    }

    if (!isOpen) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[50] pointer-events-none flex items-center justify-center">
                    {/* Draggable Box */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        onAnimationComplete={calculateConstraints}
                        drag={size !== 'full' && size !== 'cover'}
                        dragMomentum={false}
                        dragConstraints={dragLimits}
                        dragElastic={0}
                        dragListener={false} // Only drag via handle
                        dragControls={dragControls}
                        className={`w-full ${size === 'full' ? 'h-screen max-w-none' : size === 'cover' ? 'w-screen h-screen max-w-none m-0' : `${activeWidth} max-h-[90vh] rounded-lg`} bg-white dark:bg-gray-800 shadow-2xl ${variant === 'white' ? 'border border-gray-100 dark:border-gray-800 rounded-2xl' : 'border border-gray-200 dark:border-gray-700'} pointer-events-auto flex flex-col overflow-hidden ${className}`}
                        style={size === 'full' || size === 'cover' ? { position: 'fixed', top: 0, left: 0 } : { position: 'absolute' }}
                    >
                        <form
                            onSubmit={onSubmit || ((e) => e.preventDefault())}
                            encType={encType}
                            autoComplete={autoComplete}
                            className="flex flex-col flex-1 min-h-0 w-full m-0 p-0 overflow-hidden"
                        >
                            {/* Header */}
                            <div
                                onPointerDown={(e) => dragControls.start(e)}
                                className={`flex flex-row justify-between items-center px-4 py-2 cursor-move select-none ${variant === 'white'
                                    ? 'bg-white dark:bg-[#18181b] border-b border-gray-100 dark:border-gray-800 min-h-[56px] px-6 py-4'
                                    : 'bg-blue-500 dark:bg-blue-600 text-white rounded-t-lg border-b border-blue-400/20'
                                    }`}
                            >
                                <span className={`${variant === 'white' ? 'text-xl font-bold text-gray-800 dark:text-gray-100' : 'text-sm font-semibold tracking-wide capitalize'}`}>
                                    {title}
                                </span>
                                <div className="flex items-center gap-1" onPointerDown={stopPropagation}>
                                    {onMinimize && (
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="ghost"
                                            onPress={onMinimize}
                                            className={`rounded-full ${variant === 'white' ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white/80 hover:bg-white/20 hover:text-white'}`}
                                            aria-label="Thu nhỏ"
                                        >
                                            <Minus size={18} />
                                        </Button>
                                    )}
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="ghost"
                                        onPress={onClose}
                                        className={`rounded-full ${variant === 'white' ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white/80 hover:bg-white/20 hover:text-white'}`}
                                        aria-label="Đóng"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className={`flex-1 overflow-y-auto ${variant === 'white' ? 'bg-white dark:bg-[#18181b] px-6 py-2' : 'bg-white dark:bg-gray-800'} scrollbar-hide`}>
                                {children}
                            </div>

                            {/* Footer */}
                            {footer && (
                                <div className={`py-3 px-4 ${variant === 'white' ? 'border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#18181b] flex-shrink-0 flex items-center justify-end gap-2' : 'border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg'}`}>
                                    {footer}
                                </div>
                            )}
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
