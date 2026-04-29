import React, { useEffect, useRef } from 'react'

interface TableStickyScrollbarProps {
    tableRef: React.RefObject<HTMLDivElement | null>
}

export default function TableStickyScrollbar({ tableRef }: TableStickyScrollbarProps) {
    const scrollbarRef = useRef<HTMLDivElement>(null)
    const thumbRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef<number | null>(null)

    // Ref cờ để chặn vòng lặp scroll sync — dùng ref để không bị stale closure
    const syncingFromTable = useRef(false)
    const syncingFromBar = useRef(false)

    useEffect(() => {
        const el = tableRef.current
        const bar = scrollbarRef.current
        const thumb = thumbRef.current
        if (!el || !bar || !thumb) return

        const updateLayout = () => {
            const { scrollLeft, scrollWidth, clientWidth } = el
            const isVisible = scrollWidth > clientWidth

            if (!isVisible) {
                bar.style.display = 'none'
                return
            }

            // Get pagination height
            const paginationHeightStr = getComputedStyle(document.documentElement).getPropertyValue('--sticky-pagination-height') || '0px'
            const paginationHeight = parseFloat(paginationHeightStr) || 0

            // Cập nhật vị trí và kích thước thanh scrollbar (fixed position)
            const rect = el.getBoundingClientRect()
            const viewportBottom = window.innerHeight - paginationHeight
            // Nếu có sticky pagination thì luôn ghim scrollbar ngay phía trên pagination.
            // Tránh trường hợp bảng thấp làm scrollbar bám theo đáy table.
            const targetBottom =
                paginationHeight > 0 ? viewportBottom : Math.min(viewportBottom, rect.bottom)

            bar.style.display = 'block'
            bar.style.left = `${rect.left}px`
            bar.style.width = `${clientWidth}px`
            bar.style.top = `${targetBottom - 12}px`
            bar.style.bottom = 'auto'

            // Cập nhật chiều rộng thumb (mirror content width)
            thumb.style.width = `${scrollWidth}px`

            // Sync scroll position table → bar
            if (!syncingFromBar.current) {
                syncingFromTable.current = true
                bar.scrollLeft = scrollLeft
            }
            syncingFromBar.current = false
        }

        const handleTableScroll = () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = requestAnimationFrame(updateLayout)
        }

        const handleBarScroll = () => {
            // Nếu đang sync từ table thì bỏ qua để tránh vòng lặp
            if (syncingFromTable.current) {
                syncingFromTable.current = false
                return
            }
            syncingFromBar.current = true
            el.scrollLeft = bar.scrollLeft
        }

        const handleResize = () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = requestAnimationFrame(updateLayout)
        }

        el.addEventListener('scroll', handleTableScroll, { passive: true })
        bar.addEventListener('scroll', handleBarScroll, { passive: true })
        window.addEventListener('resize', handleResize, { passive: true })
        window.addEventListener('scroll', handleResize, { passive: true })

        const observer = new ResizeObserver(handleResize)
        observer.observe(el)

        // Khởi tạo lần đầu
        updateLayout()

        return () => {
            el.removeEventListener('scroll', handleTableScroll)
            bar.removeEventListener('scroll', handleBarScroll)
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('scroll', handleResize)
            observer.disconnect()
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [tableRef])

    return (
        <div
            ref={scrollbarRef}
            className="fixed z-40 overflow-x-auto overflow-y-hidden custom-sticky-scrollbar bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
            style={{
                display: 'none',
                height: '12px',
                left: 0,
                width: 0,
                top: 0
            }}
        >
            <style>
                {`
                .custom-sticky-scrollbar::-webkit-scrollbar {
                    height: 10px;
                }
                .custom-sticky-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-sticky-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(59, 130, 246, 0.45);
                    border-radius: 6px;
                    border: 1px solid transparent;
                    background-clip: padding-box;
                }
                .custom-sticky-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(37, 99, 235, 0.75);
                }
                .dark .custom-sticky-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
            `}
            </style>
            <div ref={thumbRef} style={{ height: '100%' }} />
        </div>
    )
}
