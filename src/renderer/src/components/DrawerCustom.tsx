import { Button, cn } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronsLeftRight, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { createPortal } from 'react-dom'

type DrawerPosition = 'left' | 'right' | 'bottom'

type DrawerCustomProps = {
    open?: boolean
    onClose?: () => void
    position?: DrawerPosition
    title?: string
    children?: React.ReactNode
    width?: number
    backdrop?: boolean
    zIndex?: number
    onWidthChange?: (width: number) => void
    usePortal?: boolean
    portalContainer?: HTMLElement
}

const MIN_WIDTH = 600
const MAX_WIDTH_RATIO = 0.828

export function DrawerCustom({
    open = true,
    onClose,
    position = 'right',
    children,
    width: customWidth,
    backdrop = false,
    zIndex,
    onWidthChange,
    usePortal = true,
    portalContainer
}: DrawerCustomProps) {
    const [width, setWidth] = useState(getDefaultWidth())
    const [mounted, setMounted] = useState(false)
    const resizing = useRef(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    function getDefaultWidth() {
        if (window.innerWidth < 768) return window.innerWidth
        const maxW = window.innerWidth * MAX_WIDTH_RATIO
        if (customWidth) return Math.min(customWidth, maxW)
        return Math.min(window.innerWidth >= 1280 ? MIN_WIDTH : 600, maxW)
    }

    useEffect(() => {
        if (customWidth && window.innerWidth >= 768) {
            const maxW = window.innerWidth * MAX_WIDTH_RATIO
            setWidth(Math.min(customWidth, maxW))
        }
    }, [customWidth])

    useEffect(() => {
        onWidthChange?.(width)
    }, [width])

    const config = useMemo(() => {
        switch (position) {
            case 'left':
                return {
                    placement: 'left-0 top-0 bottom-0',
                    border: 'border-r border-gray-200 dark:border-gray-700',
                    initial: { x: 'calc(-100% - 32px)' },
                    animate: { x: 0 },
                    exit: { x: 'calc(-100% - 32px)' }
                }
            case 'bottom':
                return {
                    placement: 'left-0 right-0 bottom-0 w-full',
                    border: 'border-t border-gray-200 dark:border-gray-700',
                    initial: { y: '100%' },
                    animate: { y: 0 },
                    exit: { y: '100%' }
                }
            default:
                return {
                    placement: 'right-0 top-0 bottom-0',
                    border: 'border-l border-gray-200 dark:border-gray-700',
                    initial: { x: 'calc(100% + 32px)' },
                    animate: { x: 0 },
                    exit: { x: 'calc(100% + 32px)' }
                }
        }
    }, [position])

    const drawerRef = useRef<HTMLDivElement>(null)
    const tempWidth = useRef(width)

    useEffect(() => {
        tempWidth.current = width
    }, [width])

    const updateWidth = useCallback((clientX: number) => {
        if (window.innerWidth < 768 || position === 'bottom') return
        const newWidth = position === 'left' ? clientX : window.innerWidth - clientX
        if (newWidth > MIN_WIDTH && newWidth < window.innerWidth * MAX_WIDTH_RATIO) {
            tempWidth.current = newWidth
            // Update DOM directly to bypass React re-renders and fix lag
            if (drawerRef.current) {
                drawerRef.current.style.width = `${newWidth}px`
            }
        }
    }, [position])

    const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!resizing.current) return
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        updateWidth(clientX)
    }, [updateWidth])

    const stopResize = useCallback(() => {
        if (resizing.current) {
            setWidth(tempWidth.current)
        }
        resizing.current = false
        document.body.style.cursor = 'default'
        document.body.style.userSelect = ''
        if (drawerRef.current) {
            drawerRef.current.style.transition = ''
        }

        // Cleanup listeners when drag stops
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', stopResize)
        window.removeEventListener('touchmove', handleMove)
        window.removeEventListener('touchend', stopResize)
    }, [handleMove])

    const startResize = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (window.innerWidth < 768 || position === 'bottom') return
        e.preventDefault()
        resizing.current = true
        document.body.style.cursor = 'ew-resize'
        // Disable text selection and transition during drag for smoothness
        document.body.style.userSelect = 'none'
        if (drawerRef.current) {
            drawerRef.current.style.transition = 'none'
        }

        // Add listeners ONLY when dragging starts to avoid global UI lag
        window.addEventListener('mousemove', handleMove)
        window.addEventListener('mouseup', stopResize)
        window.addEventListener('touchmove', handleMove, { passive: false })
        window.addEventListener('touchend', stopResize)
    }, [position, handleMove, stopResize])

    useEffect(() => {
        const resetWidth = () => setWidth(getDefaultWidth())
        window.addEventListener('resize', resetWidth)

        return () => {
            window.removeEventListener('resize', resetWidth)
            window.removeEventListener('mousemove', handleMove)
            window.removeEventListener('mouseup', stopResize)
            window.removeEventListener('touchmove', handleMove)
            window.removeEventListener('touchend', stopResize)
        }
    }, [position, handleMove, stopResize])

    if (!mounted) return null

    const content = (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    {backdrop && (
                        <motion.div
                            className="fixed inset-0 z-40 bg-black/40"
                            style={{ pointerEvents: 'auto', ...(zIndex ? { zIndex: zIndex - 5 } : {}) }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => {
                                e.stopPropagation()
                                onClose?.()
                            }}
                        />
                    )}
                    <motion.div
                        ref={drawerRef}
                        className={`fixed z-50 bg-white dark:bg-gray-800 shadow-2xl flex flex-col ${config.border} ${config.placement}`}
                        style={{
                            width: position === 'bottom' ? '100%' : window.innerWidth < 768 ? '100%' : width,
                            pointerEvents: 'auto',
                            ...(zIndex ? { zIndex } : {})
                        }}
                        initial={config.initial}
                        animate={config.animate}
                        exit={config.exit}
                        transition={{ type: 'spring', damping: 22, stiffness: 210 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* resize handle */}
                        {window.innerWidth >= 768 && position !== 'bottom' && (
                            <>
                                <div
                                    onMouseDown={startResize}
                                    onTouchStart={startResize}
                                    className={`absolute z-50 top-1/2 p-2 rounded-full bg-blue-400 hover:bg-white cursor-ew-resize active:scale-90 transition-transform text-white hover:text-blue-400 ${position === 'right' ? '-left-4' : '-right-4'
                                        }`}
                                >
                                    <ChevronsLeftRight size={16} />
                                </div>
                            </>
                        )}

                        {/* Content */}
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )

    return usePortal ? createPortal(content, portalContainer || document.body) : content
}

type DrawerHeaderCustomProps = {
    title?: React.ReactNode
    onClose?: () => void
    className?: string
    titleClassName?: string
    children?: React.ReactNode
}

export function DrawerHeaderCustom({
    title = 'Tiêu đề',
    onClose,
    className,
    titleClassName,
    children
}: DrawerHeaderCustomProps): React.JSX.Element {
    return (
        <div
            className={cn(
                'flex items-center justify-between px-4 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
                className
            )}
        >
            {children ?? (
                <>
                    <div
                        className={cn('text-lg font-semibold text-gray-800 dark:text-gray-100', titleClassName)}
                    >
                        {title}
                    </div>
                    {onClose && (
                        <Button
                            isIconOnly
                            variant="light"
                            radius="full"
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                            onPress={onClose}
                        >
                            <X size={20} />
                        </Button>
                    )}
                </>
            )}
        </div>
    )
}

type DrawerFooterCustomProps = {
    children?: React.ReactNode
    className?: string
}
export function DrawerFooterCustom({ children, className }: DrawerFooterCustomProps) {
    return (
        <div
            className={cn(
                'p-3 flex items-center justify-end gap-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700',
                className
            )}
        >
            {children}
        </div>
    )
}

type DrawerContentCustomProps = {
    children?: React.ReactNode
    className?: string
}
export function DrawerContentCustom({ children, className }: DrawerContentCustomProps) {
    return (
        <div
            className={cn(
                'flex-1 overflow-y-auto px-0 md:px-4 py-2 md:py-3 bg-white dark:bg-gray-900',
                className
            )}
        >
            {children}
        </div>
    )
}
