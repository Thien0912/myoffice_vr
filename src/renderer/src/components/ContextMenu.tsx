import { useState, useLayoutEffect, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@heroui/react'
import type { ContextMenuProps as MenuItem } from '@renderer/shared/types'

interface ContextMenuProps {
    x: number
    y: number
    isOpen: boolean
    onClose: () => void
    items: MenuItem[]
}

export default function ContextMenu({ x, y, isOpen, onClose, items }: ContextMenuProps) {
    useEffect(() => {
        if (!isOpen) return

        const handleClick = (e: MouseEvent) => {
            if (e.button === 0) onClose()
        }
        const handleScroll = (e: Event) => {
            if (menuRef.current && menuRef.current.contains(e.target as Node)) {
                return
            }
            onClose()
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        window.addEventListener('mousedown', handleClick)
        window.addEventListener('scroll', handleScroll, { capture: true })
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('mousedown', handleClick)
            window.removeEventListener('scroll', handleScroll, { capture: true })
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    const [adjustedPos, setAdjustedPos] = useState({ left: x, top: y, arrowY: 0, isLeftPosition: false })
    const [isPositioned, setIsPositioned] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (isOpen) {
            setIsPositioned(false)
            if (menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect()
                
                // Trục ngang: Mặc định menu nổi CẠNH BÊN PHẢI trỏ chuột
                let newLeft = x + 12 
                let isLeftPosition = false // menu nằm bên phải -> mũi tên chỉ sang trái

                // Nếu tràn mép phải màn hình -> lật menu sang BÊN TRÁI trỏ chuột
                if (newLeft + rect.width > window.innerWidth - 8) {
                    newLeft = x - rect.width - 12
                    isLeftPosition = true
                    // Nếu lật trái mà tràn trái màn hình, ôm mép trái
                    if (newLeft < 8) newLeft = 8
                } else if (newLeft < 8) {
                    newLeft = 8
                }

                // Trục dọc: Căn giữa (center) menu THEO CHIỀU DỌC với trỏ chuột
                let newTop = y - rect.height / 2

                // Kiểm tra và chống tràn cao/đáy màn hình
                if (newTop + rect.height > window.innerHeight - 8) {
                    newTop = window.innerHeight - rect.height - 8
                }
                if (newTop < 8) {
                    newTop = 8
                }
                
                // Tính toán vị trí mũi tên dọc để nó LUÔN TRỎ VÀO ĐÚNG ĐIỂM y 
                let arrowY = y - newTop
                // Giới hạn không cho mũi tên chạy đâm ra góc cong của box
                arrowY = Math.max(16, Math.min(rect.height - 16, arrowY))

                setAdjustedPos({ left: newLeft, top: newTop, arrowY: arrowY, isLeftPosition })
                setIsPositioned(true)
            }
        } else {
            setIsPositioned(false)
        }
    }, [isOpen, x, y, items])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    key="context-menu-singleton"
                    initial={{ opacity: 0, scale: 0.96, x: adjustedPos.isLeftPosition ? 6 : -6, y: 0 }}
                    animate={{ opacity: isPositioned ? 1 : 0, scale: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, x: adjustedPos.isLeftPosition ? 6 : -6, y: 0 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    className="fixed bg-white dark:bg-[#282828] border border-gray-100 dark:border-gray-700/80 rounded-lg shadow-[0_6px_24px_rgba(0,0,0,0.15)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.6)] z-[9999] py-1.5 min-w-[210px] w-max select-none drop-shadow-sm"
                    style={{
                        top: adjustedPos.top,
                        left: adjustedPos.left,
                        visibility: isPositioned ? 'visible' : 'hidden'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {/* Phần Mũi Tên (Arrow) che viền bằng occluding technique */}
                    <div
                        className="absolute w-3.5 h-3.5 bg-white dark:bg-[#282828] border-gray-100 dark:border-gray-700/80 transform rotate-45 z-20"
                        style={{
                            top: adjustedPos.arrowY - 7, // Center mũi tên theo y
                            [adjustedPos.isLeftPosition ? 'right' : 'left']: '-7.5px', // Trồi ra biên phải hoặc thụt ra biên trái
                            borderWidth: adjustedPos.isLeftPosition ? '1px 1px 0 0' : '0 0 1px 1px' 
                            // Nếu menu nằm bên TRÁI chuột -> mũi chỉ SANG PHẢI -> vẽ viền Top-Right (1 1 0 0)
                            // Nếu menu nằm bên PHẢI chuột -> mũi chỉ SANG TRÁI -> vẽ viền Bottom-Left (0 0 1 1)
                        }}
                    />

                    {/* Danh sách items chứa z-30 để không bị đè bởi block arrow */}
                    <div className="relative z-30 flex flex-col">
                        {items.map((item, idx) =>
                            item.label === 'separator' ? (
                                <div key={idx} className="my-1.5 border-t border-gray-100 dark:border-gray-700/80 mx-1" />
                            ) : (
                                <div key={idx} className="px-1.5">
                                    <Button
                                        radius="sm"
                                        fullWidth
                                        size="sm"
                                        variant="light"
                                        className="justify-start text-[13px] dark:text-gray-200 dark:hover:bg-[#383838] hover:bg-gray-100/80 data-[hover=true]:bg-gray-100/80 h-8 px-2.5 font-normal"
                                        startContent={item.icon}
                                        onPress={async () => {
                                            if (item.onClick) await item.onClick()
                                            onClose()
                                        }}
                                        disableRipple
                                    >
                                        {item.label}
                                    </Button>
                                </div>
                            )
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
